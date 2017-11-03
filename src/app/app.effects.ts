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
import { Router } from "@angular/router";

import { BaseObj } from "./domain/base_obj";
import { DataObj } from "./domain/metadata/data_obj";
import { Entity, Property } from "./domain/metadata/entity";
import { ChangeObj } from "./domain/change_obj";

import { Table, TableColumn } from "./domain/uimetadata/table";
import { Form, NodeElement, NodeType, NodeType2Str } from "./domain/uimetadata/form";

import * as appState from './app.state';

import { PouchdbService } from "./pouchdb.service";

export type ActionsToBeSentToServer =
    | appState.UserActionEditedFormData
    ;
export const ActionsToBeSentToServerNames = [
    appState.UserActionEditedFormDataN,
];

@Injectable()
export class AppEffects {
    private currentUrl: { path: string, id: string } = { path: null, id: null };
    private cachedEntitiesMap: Map<string, Entity> = new Map();

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>,
        private pouchDbService: PouchdbService,
        private router: Router
    ) {

        let me = this;

        try {
            //we first initialize the DB (sync with remote DB)
            pouchDbService.init(() => this.init());
        } catch (err) {
            console.error("Error creating AppEffects: ", err);
        }

    }

    private init() {
        //load entities and remove readOnly flag
        this.pouchDbService.findByMwzType<Entity>('Entity_').then(entities => {
            this.cachedEntitiesMap.clear();
            entities.map(entity => this.cachedEntitiesMap.set(entity._id, entity));
            this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
            this.store.dispatch(new appState.CoreAppReadonlyAction(appState.NotReadonly));
            this.processRouterUrlChange(this.router.url);
        }).catch(err => console.error(err));

        //change app state based on router actions
        this.listenForRouterChanges();

        //send actions to server so that the engine can process them, compute all formulas and update the data
        this.actions$.ofType<ActionsToBeSentToServer>(...ActionsToBeSentToServerNames).subscribe(action => {
            this.pouchDbService.postAction(action);
        });
    }

    public listenForRouterChanges() {
        this.actions$.ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION)
            .subscribe(routerNav => {
                //FIXME: why is queryParams empty ?!?!
                console.log("AppEffects:", routerNav.payload.routerState);
                this.processRouterUrlChange(routerNav.payload.routerState.url);
            });
    }

    private processRouterUrlChange(url: string) {
        let { path, id } = appState.parseUrl(url);

        if (path === this.currentUrl.path && id === this.currentUrl.id) return;

        if (path !== this.currentUrl.path) {
            this.currentUrl.path = path;
            this.changeEntity(path);
        }

        if (id != this.currentUrl.id) {
            this.currentUrl.id = id;
            this.pouchDbService.getDataObj(id)
                .then(obj => this.store.dispatch(new appState.FormDataFromBackendAction(obj)));
        }

    }

    private async changeEntity(path: string) {
        try {
            let entity = await this.pouchDbService.getEntity(path);
            this.store.dispatch(new appState.UserActionSelectedEntity(entity));

            let table: Table = null;
            try {
                table = await this.pouchDbService.getTable(path);
            } catch (err) {
                if (err.status == 404) {
                    table = getDefaultTable(entity);
                } else throw err;
            }
            this.store.dispatch(new appState.TableFormBackendAction(table));

            let tableData = await this.pouchDbService.findByMwzType<DataObj>(path);
            this.store.dispatch(new appState.TableDataFromBackendAction(tableData.map(obj => new ChangeObj<DataObj>(obj))))

            let form: Form = null;
            try {
                form = await this.pouchDbService.getForm(path);
            } catch (err) {
                if (err.status == 404) {
                    form = getDefaultForm(entity, this.cachedEntitiesMap);
                } else throw err;
            }
            this.store.dispatch(new appState.FormFromBackendAction(form));

        } catch (err) {
            console.error(err);
        }
    }

    // Change state on router navigation: get metadata and data from server and replace change current state
    // @Effect() navigation$: TableFormActionsObservable = 


}


export function getDefaultForm(entity: Entity, entitiesMap: Map<string, Entity>): Form {
    let form = new Form();
    form = { nodeType: NodeType.FormGrid, nodeName: 'form-grid', mwzType: "Form_" };
    setFormElementChildren(form, entity, entitiesMap);
    console.log('form:', JSON.stringify(form));
    return form;
}

function setFormElementChildren(parentFormEl: NodeElement, entity: Entity, entitiesMap: Map<string, Entity>) {
    parentFormEl.childNodes = entity.properties.map((prop, idx) => {
        let child = new NodeElement();
        child.nodeType = NodeType.FormInput;
        child.nodeName = NodeType2Str.get(child.nodeType);
        if (Property.isTable(prop)) {
            child.tableName = prop.name;
            child.nodeType = prop.isLargeTable ? NodeType.FormTable : NodeType.FormTabs;
            setFormElementChildren(child, entitiesMap.get(Property.getPath(prop)), entitiesMap);
        } else if (Property.isEntity(prop)) {
            child.entityName = prop.name;
            child.nodeType = NodeType.FormAutocomplete;
            child.attributes = { copiedProperties: prop.copiedProperties };
        } else {
            child.propertyName = prop.name;
        }

        return {
            nodeType: NodeType.FormGridRow,
            nodeName: 'form-grid-row',
            childNodes: [child]
        };
    });

}

export function getDefaultTable(entity: Entity): Table {
    if (null == entity) return null;

    let table = new Table();
    table.mwzType = 'Table_';
    table.columns = entity.properties.map((prop, idx) => new TableColumn(prop.name, prop.type));
    return table;
}
