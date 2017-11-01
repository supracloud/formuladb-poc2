import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

import { Store } from '@ngrx/store';

import * as appState from '../app.state';

import { AppStateService } from "../app-state.service";

import * as mainDemoFlow from "./main_demo.flow";

@Injectable()
export class MockService {

    constructor(private store: Store<appState.AppState>, private appStates: AppStateService) { }

    public loadInitialEntities() {
        if (!environment.production) {
            this.appStates.destroy().then(() => mainDemoFlow.SETUP.initialEntities.forEach(entity => {
                this.appStates.put(entity._id, entity);
            }));
        } else {
            throw new Error("Internal Error mock called in production");
        }
    }

}
