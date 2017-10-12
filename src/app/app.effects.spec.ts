import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { cold, hot, getTestScheduler } from 'jasmine-marbles';
import { empty } from 'rxjs/observable/empty';
import { Observable } from 'rxjs/Observable';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import {
    RouterNavigationAction, RouterNavigationPayload, ROUTER_NAVIGATION
} from '@ngrx/router-store';
import 'rxjs/add/observable/merge';

import * as appState from './app.state';
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';
import { AppEffects } from "./app.effects";
import { ChangeObj } from "./domain/change_obj";

import { MockMetadata } from "./test/mocks/mock-metadata";
import { BackendReadService, getDefaultTable, getDefaultForm } from "./backend-read.service";

export class TestActions extends Actions {
    constructor() {
        super(empty());
    }

    set stream(source: Observable<any>) {
        this.source = source;
    }
}

export function getActions() {
    return new TestActions();
}


describe('AppEffects', () => {

    let effects: AppEffects;
    let backendReadService: BackendReadService;
    let actions$: TestActions;
    let actorTestId: string = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appState.reducers),
                RouterTestingModule
            ],
            providers: [
                BackendReadService,
                AppEffects,
                { provide: Actions, useFactory: getActions }
            ]
        });

        effects = TestBed.get(AppEffects);
        actions$ = TestBed.get(Actions);
        backendReadService = TestBed.get(BackendReadService);
        actorTestId = backendReadService.mockData.getAll(MockMetadata.General__Actor.path)[0]._id;
    });

    it('a router effect test', () => {
            let values = {
                a: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {url: '/General__Actor'}} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>,
                b: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {
                        url: '/General__Actor/' + actorTestId
                    }} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>,
                c: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {url: '/General__Currency'}} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>,
                m: new fromTable.TableChangesAction(getDefaultTable(MockMetadata.General__Actor)),
                n: new fromTable.TableDataChangesAction(
                    backendReadService.mockData.getAll(MockMetadata.General__Actor.path).map(o => new ChangeObj(o))),
                o: new fromForm.FormChangesAction(getDefaultForm(MockMetadata.General__Actor)),
                p: new fromForm.FormDataChangesAction(backendReadService.mockData.get(MockMetadata.General__Actor.path, actorTestId)),
                q: new fromTable.TableChangesAction(getDefaultTable(MockMetadata.General__Currency)),
                r: new fromTable.TableDataChangesAction(
                    backendReadService.mockData.getAll(MockMetadata.General__Currency.path).map(o => new ChangeObj(o))),
                s: new fromForm.FormChangesAction(getDefaultForm(MockMetadata.General__Currency)),
            }

            actions$.stream = hot('--a----bc',values);
            const expected = cold('--(mno)p(qrs)', values);

            let i = 0;
            effects.listenForRouterChanges();
            expect(effects.tableFormActions$).toBeObservable(expected);
        }
    );
});
