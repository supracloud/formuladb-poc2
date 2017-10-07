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

    constructor(
        private actions$: Actions,
        private backendReadService: BackendReadService
    ) { }

    // Change state on router navigation: get metadata and data from server and replace change current state
    @Effect() navigation$: Observable<Action> = 
        this.actions$.ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION)
        .flatMap(routerNav => {
            console.log("AppEffects", routerNav.payload.routerState);
            return this.backendReadService.syncTable(routerNav.payload.routerState.path)
            .map(t => new fromTable.TableChangesAction(t));
        });
    ;
}
