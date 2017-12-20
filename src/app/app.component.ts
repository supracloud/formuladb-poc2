import { Component, OnInit, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NodeType } from "./domain/uimetadata/form";

import { BaseObj } from "./domain/base_obj";

import { MwzEngine } from "./backend/mwz_engine";//TODO: move this to server side
import { Store } from '@ngrx/store';

import * as appState from "./app.state";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    title = 'app';
    selectedEntity: appState.Entity;
    menuCollapsed: boolean = true;
    leftCollapsed: boolean = false;
    rightCollapsed: boolean = false;

    public constructor(private store: Store<appState.AppState>) {
        store.select(appState.getSelectedEntityState).subscribe(e => this.selectedEntity = e);
    }

    ngOnInit(): void {
        new MwzEngine().init();
        console.log(this);
    }

    newDataObj() {
        this.store.dispatch(new appState.UserActionNewRow(this.selectedEntity._id));
    }
}
