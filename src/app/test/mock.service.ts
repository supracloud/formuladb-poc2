import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import * as appState from '../app.state';

import * as mainDemoFlow from "./main_demo_flow";

@Injectable()
export class MockService {

  constructor(private store: Store<appState.AppState>) { }

  public loadInitialEntities() {
    console.log("Loading entities for initial populating the navigation list", mainDemoFlow.SETUP.initialEntities);
    setTimeout(() => this.store.dispatch(mainDemoFlow.FLOW.Then_navigation_should_show_all_current_tables.initialEntitiesChangesAction), 250);
  }
}
