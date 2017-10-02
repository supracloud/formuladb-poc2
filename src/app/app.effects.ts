// ./effects/auth.ts
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';

import {
    RouterNavigationAction, RouterNavigationPayload
} from '@ngrx/router-store';

// import { BackendService } from '../backend.service';
import * as appState from './app.state';

@Injectable()
export class AppEffects {

    constructor(
        private actions$: Actions,
        // private mwzBackendService: BackendService
    ) { }

    // // Change state on router navigation: get metadata and data from server and replace change current state
    // @Effect() navigation$: Observable<Action> = this.actions$.ofType<RouterNavigationAction<appState.RouterState>>('ROUTER_NAVIGATION')
    //     .map(x => {
    //         //FIXME: call backend and get the new metadata
            
    //         // return new appState.ChangeCurrentEntity()
    //         return  null;
    //     })
    // ;
}
