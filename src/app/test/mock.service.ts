import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

import { Store } from '@ngrx/store';

import * as appState from '../app.state';

import { PouchdbService } from "../pouchdb.service";

import * as mainDemoFlow from "./main_demo.flow";

@Injectable()
export class MockService {

    constructor(private store: Store<appState.AppState>, private pouchdb: PouchdbService) { }

    public loadInitialEntities() {
        if (!environment.production) {
            this.pouchdb.destroy().then(() => mainDemoFlow.SETUP.initialEntities.forEach(entity => {
                this.pouchdb.put(entity._id, entity);
            }));
        } else {
            throw new Error("Internal Error mock called in production");
        }
    }

}
