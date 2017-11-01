// ./effects/auth.ts
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/empty';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';

import {
    RouterNavigationAction, RouterNavigationPayload, ROUTER_NAVIGATION
} from '@ngrx/router-store';

import { BackendReadService } from './backend-read.service';
import * as appState from './app.state';
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';

type TableFormActionsObservable = Observable<
    | fromTable.TableChangesAction 
    | fromTable.TableDataChangesAction 
    | fromForm.FormChangesAction 
    | fromForm.FormDataChangesAction>;

@Injectable()
export class AppEffects {

    public tableFormActions$: TableFormActionsObservable;

    constructor(
        private actions$: Actions,
        private backendReadService: BackendReadService,
        private store: Store<appState.AppState>
    ) {


        this.tableFormActions$ = this.backendReadService.tableForm$.map(x => {
            if (x instanceof Array) return new fromTable.TableDataChangesAction(x);
            if (x.mwzType == 'Form_') return new fromForm.FormChangesAction(x as fromForm.Form);
            if (x.mwzType == 'Table_') return new fromTable.TableChangesAction(x as fromTable.Table);
            return new fromForm.FormDataChangesAction(x as fromForm.DataObj);
        });
        this.tableFormActions$.subscribe(x => this.store.dispatch(x));

        this.listenForRouterChanges();
    }

    public listenForRouterChanges() {
        this.actions$.ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION)
        .subscribe(routerNav => {
            //FIXME: why is queryParams empty ?!?!
            console.log("AppEffects:", routerNav.payload.routerState);
            let match = routerNav.payload.routerState.url.match(/^\/(\w+)\/?(\w+)?/)
            let { path, id } = appState.parseUrl(routerNav.payload.routerState.url);
    
            this.backendReadService.setCurrentPathAndId(path, id);
    
        });
    }

    // Change state on router navigation: get metadata and data from server and replace change current state
    // @Effect() navigation$: TableFormActionsObservable =
}
