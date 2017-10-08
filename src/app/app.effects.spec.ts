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

import * as appState from './app.state';
import * as fromTable from './table/table.state';
import { AppEffects } from "./app.effects";
import { ChangeObj } from "./domain/change_obj";

import { MockMetadata } from "./test/mocks/mock-metadata";
import { MockData } from "./test/mocks/mock-data";
import { BackendReadService } from "./backend-read.service";

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
    let googleBooksService: any;
    let actions$: TestActions;
    let mockData = new MockData();

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
    });

    it('a router effect test', () => {
            actions$.stream = hot('--a', {
                a: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {path: 'General__Actor'}} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>
            });
            const expected = cold('--bc', { 
                b: new fromTable.TableChangesAction(BackendReadService.getDefaultTable(MockMetadata.General__Actor)),
                c: new fromTable.TableDataChangesAction(
                    mockData.getAll(MockMetadata.General__Actor.path).map(o => new ChangeObj(o)))
            });

            let i = 0;
            expect(effects.navigation$).toBeObservable(expected);//FIXME: assertion does not work!
        }
    );
});
