// ./effects/auth.ts
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
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

@Injectable()
export class AppEffects {

    private currentPath: string;

    constructor(
        private actions$: Actions,
        private backendReadService: BackendReadService
    ) { }

    // Change state on router navigation: get metadata and data from server and replace change current state
    @Effect() navigation$: Observable<fromTable.TableChangesAction|fromTable.TableDataChangesAction> = 
        this.actions$.ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION)
        .flatMap(routerNav => {
            //FIXME: why is queryParams empty ?!?!
            console.log("AppEffects", routerNav.payload.routerState);
            let match = routerNav.payload.routerState.url.match(/^\/(\w+)/)
            let path: string = null;
            if (null != match) {
                path = match[1];
            } else {
                throw Error('Unknown url: ' + routerNav.payload.routerState.url);
            }

            if (path != this.currentPath) {
                this.currentPath = path;
            }

            return this.backendReadService.syncTable(path)
            .map(t =>(t instanceof fromTable.Table) ? new fromTable.TableChangesAction(t) 
                : new fromTable.TableDataChangesAction(t));
        });
    ;
}
