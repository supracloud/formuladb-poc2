/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { cold, hot, getTestScheduler } from 'jasmine-marbles';
import { Observable, empty, merge } from 'rxjs';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import {
    RouterNavigationAction, RouterNavigationPayload, ROUTER_NAVIGATION
} from '@ngrx/router-store';

import { Entity } from "./common/domain/metadata/entity";
import * as appState from './app.state';
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';
import { AppEffects } from "./app.effects";
import { ChangeObj } from "./common/domain/change_obj";

import { MockMetadata, General___Actor, General___Currency } from "./common/test/mocks/mock-metadata";
import * as mainDemoFlow from "./common/test/main_demo.flow";
import { getDefaultTable } from './common/domain/uimetadata/table';
import { getDefaultForm } from './common/domain/uimetadata/form';

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


xdescribe('AppEffects', () => {

    let effects: AppEffects;
    // let backendReadService: BackendReadService;
    let actions$: TestActions;
    let actorTestId: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appState.reducers),
                RouterTestingModule
            ],
            providers: [
                // BackendReadService,
                AppEffects,
                { provide: Actions, useFactory: getActions }
            ]
        });

        effects = TestBed.get(AppEffects);
        actions$ = TestBed.get(Actions);
        // backendReadService = TestBed.get(BackendReadService);
        actorTestId = mainDemoFlow.mockData.getAllForPath(General___Actor._id)[0]._id;
    });

    it('a router effect test', () => {
            let values = {
                a: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {url: '/General___Actor'}} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>,
                b: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {
                        url: '/General___Actor/' + actorTestId
                    }} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>,
                c: {
                    type: ROUTER_NAVIGATION,
                    payload: {routerState: {url: '/General___Currency'}} as RouterNavigationPayload<appState.RouterState>
                } as RouterNavigationAction<appState.RouterState>,
                m: new fromTable.TableFormBackendAction(getDefaultTable(General___Actor as Entity)),
                n: new fromTable.TableDataFromBackendAction(
                    mainDemoFlow.mockData.getAllForPath(General___Actor._id).map(o => new ChangeObj(o))),
                o: new fromForm.FormFromBackendAction(getDefaultForm(General___Actor as Entity, mainDemoFlow.mockMetadata.schema.entities)),
                p: new fromForm.FormDataFromBackendAction(mainDemoFlow.mockData.get(General___Actor._id, actorTestId)),
                q: new fromTable.TableFormBackendAction(getDefaultTable(General___Currency as Entity)),
                r: new fromTable.TableDataFromBackendAction(
                    mainDemoFlow.mockData.getAllForPath(General___Currency._id).map(o => new ChangeObj(o))),
                s: new fromForm.FormFromBackendAction(getDefaultForm(General___Currency as Entity, mainDemoFlow.mockMetadata.schema.entities)),
            }

            actions$.stream = hot('--a----bc',values);
            const expected = cold('--(mno)p(qrs)', values);

            let i = 0;
            effects.listenForRouterChanges();
            // expect(effects.tableFormActions$).toBeObservable(expected);
        }
    );
});
