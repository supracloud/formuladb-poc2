// ./effects/auth.ts
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/empty';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';

import {
    RouterNavigationAction, RouterNavigationPayload, ROUTER_NAVIGATION
} from '@ngrx/router-store';

import { BackendReadService } from './backend-read.service';
import * as appState from './app.state';
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';

@Injectable()
export class AppEffects {

    constructor(
        private actions$: Actions,
        private backendReadService: BackendReadService
    ) { }

    // Change state on router navigation: get metadata and data from server and replace change current state
    @Effect() navigation$: Observable<fromTable.TableChangesAction | fromTable.TableDataChangesAction | fromForm.FormChangesAction | fromForm.FormDataChangesAction> =
    this.actions$.ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION)
        .flatMap(routerNav => {
            //FIXME: why is queryParams empty ?!?!
            console.log("AppEffects", routerNav.payload.routerState);
            let match = routerNav.payload.routerState.url.match(/^\/(\w+)\/?(\w+)?/)
            let path: string = null;
            let id: string = null;
            if (null != match) {
                path = match[1];
                if (match.length >= 2) id = match[2];
            } else {
                throw Error('Unknown url: ' + routerNav.payload.routerState.url);
            }

            let formObservable: Observable<fromForm.FormChangesAction | fromForm.FormDataChangesAction> = Observable.empty();
            if (null != id) {
                formObservable = this.backendReadService.syncForm(path, id)
                    .map(f => (f.mwzType == 'Form_') ? new fromForm.FormChangesAction(f as fromForm.Form)
                        : new fromForm.FormDataChangesAction(f as fromForm.DataObj));
            }

            return this.backendReadService.syncTable(path)
                .map(t => (t instanceof Array) ? new fromTable.TableDataChangesAction(t) : new fromTable.TableChangesAction(t))
                .merge(formObservable);
        });
    ;

}
