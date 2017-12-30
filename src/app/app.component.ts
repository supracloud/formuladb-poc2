import { Component, OnInit, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NodeType, NodeElement } from "./domain/uimetadata/form";

import { BaseObj } from "./domain/base_obj";

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
    newEntityName: string;

    public constructor(private store: Store<appState.AppState>, private router: Router) {
        store.select(appState.getSelectedEntityState).subscribe(e => this.selectedEntity = e);
    }

    ngOnInit(): void {
        console.log(this);
    }

    newDataObj() {
        this.store.dispatch(new appState.UserActionNewRow(this.selectedEntity._id));
    }

    newEntity() {
        this.store.dispatch(new appState.UserActionNewEntity(this.newEntityName));
    }

    deleteEntity() {
        if (confirm("Please confirm! Do you really want to delete " + this.selectedEntity._id + " ?")) {
            this.store.dispatch(new appState.UserActionDeleteEntity(this.selectedEntity));
            this.router.navigate(['/']);
        }
    }

    stopPropagation(event: MouseEvent) {
        event.stopPropagation();
    }

}
