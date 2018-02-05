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
import { Entity, EntityProperty, PropertyTypeN } from "./domain/metadata/entity";
import { ChangeObj } from "./domain/change_obj";
import { MwzEvents } from "./domain/event";

import { Table, TableColumn } from "./domain/uimetadata/table";
import { Form, NodeElement, NodeType, NodeType2Str } from "./domain/uimetadata/form";

import * as appState from './app.state';
import { generateUUID } from "./domain/uuid";
import { getDefaultTable, getDefaultForm } from "./domain.utils";
import { BackendService } from "./backend.service";


export type ActionsToBeSentToServer =
    | appState.UserActionEditedFormData
    | appState.UserActionEditedForm
    | appState.UserActionEditedTable
    | appState.UserActionEditedEntity
    | appState.UserActionNewEntity
    | appState.UserActionDeleteEntity
    ;
export const ActionsToBeSentToServerNames = [
    appState.UserActionEditedFormDataN,
    appState.UserActionEditedFormN,
    appState.UserActionEditedTableN,
    appState.UserActionEditedEntityN,
    appState.UserActionNewEntityN,
    appState.UserActionDeleteEntityN
];

@Injectable()
export class AppEffects {
    private currentUrl: { path: string, id: string, entity: Entity } = { path: null, id: null, entity: null };
    private cachedEntitiesMap: Map<string, Entity> = new Map();

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>,
        private backendService: BackendService,
        private router: Router
    ) {

        let me = this;

        try {
            //we first initialize the DB (sync with remote DB)
            backendService.init(() => this.init(),
                change => this.listenForNotifsFromServer(change),
                change => this.listenFormDataChangesFromServer(change));
        } catch (err) {
            console.error("Error creating AppEffects: ", err);
        }

    }

    private listenForNotifsFromServer(event: MwzEvents) {
        console.log("%c <----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<----<",
            "color: green; font-size: 115%; font-weight: bold; text-decoration: underline;", new Date(), event);
        if (!event) return;

        switch (event.type_) {
            case appState.UserActionEditedFormDataN:
            case appState.UserActionEditedFormN:
                this.store.dispatch(new appState.FormNotifFromBackendAction(event));
                break;
            case appState.UserActionEditedTableN:
                // this.store.dispatch(new appState.FormNotifFromBackendAction(event));
                //TODO: display loading indicator, not currently used
                break;

        }
    }

    private listenFormDataChangesFromServer(docs: Array<BaseObj>) {
        console.log("%c <====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<====<",
            "color: green; font-size: 115%; font-weight: bold; text-decoration: underline;", new Date(), docs);

        docs.forEach(obj => {
            if (obj.mwzType == 'Entity_') {
                console.log("Loading all entities from local DB");
                this.backendService.findByMwzType<Entity>('Entity_').then(entities => {
                    console.log("displaying all entities from local DB", entities);
                    this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
                }).catch(err => console.error(err));
            } else if (obj.mwzType == 'Table_') {
                this.store.dispatch(new appState.TableFormBackendAction(obj as Table));
            } else if (obj.mwzType == 'Form_') {
                this.store.dispatch(new appState.FormFromBackendAction(obj as Form));
            } else {
                this.store.dispatch(new appState.FormDataFromBackendAction(obj));
                this.store.dispatch(new appState.TableDataFromBackendAction([new ChangeObj(obj as DataObj)]));
            }
        });
    }

    private init() {
        //load entities and remove readOnly flag
        this.backendService.findByMwzType<Entity>('Entity_').then(entities => {
            this.cachedEntitiesMap.clear();
            entities.map(entity => this.cachedEntitiesMap.set(entity._id, entity));
            this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
            this.store.dispatch(new appState.CoreAppReadonlyAction(appState.NotReadonly));
            this.processRouterUrlChange(this.router.url);
        }).catch(err => console.error(err));

        //change app state based on router actions
        this.listenForRouterChanges();

        //send actions to server so that the engine can process them, compute all formulas and update the data
        this.listenForUserActions();

        //listen for new object creations
        this.listenForNewDataObjActions();
    }

    private listenForUserActions() {
        this.actions$.ofType<ActionsToBeSentToServer>(...ActionsToBeSentToServerNames).subscribe(action => {
            console.log("%c >---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->---->",
            "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", action.event);

            this.backendService.putEvent(action.event);
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

        if (id && id != this.currentUrl.id) {
            this.currentUrl.id = id;
            this.backendService.getDataObj(id)
                .then(obj => this.store.dispatch(new appState.FormDataFromBackendAction(obj)))
                .catch(err => console.error(err))
                ;
        }

    }

    private listenForNewDataObjActions() {
        this.actions$.ofType<appState.UserActionNewRow>(appState.UserActionNewRowN).subscribe(action => {
            this.currentUrl.id = generateUUID();
            this.router.navigate([this.currentUrl.entity._id + '/' + this.currentUrl.id]);
            this.store.dispatch(new appState.FormDataFromBackendAction({ _id: this.currentUrl.id, mwzType: this.currentUrl.entity._id }))
        });
    }

    private async changeEntity(path: string) {
        try {
            let entity = await this.backendService.getEntity(path);
            this.currentUrl.entity = entity;
            this.store.dispatch(new appState.UserActionSelectedEntity(entity));

            let table: Table = null;
            try {
                table = await this.backendService.getTable(path);
            } catch (err) {
                if (err.status == 404) {
                    table = getDefaultTable(entity);
                } else throw err;
            }
            this.store.dispatch(new appState.ResetTableDataFromBackendAction([]));
            this.store.dispatch(new appState.TableFormBackendAction(table));

            let tableData = await this.backendService.findByMwzType<DataObj>(path);
            this.store.dispatch(new appState.TableDataFromBackendAction(tableData.map(obj => new ChangeObj<DataObj>(obj))))

            let form: Form = null;
            try {
                form = await this.backendService.getForm(path);
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

    // @Effect() newDataObj$: Observable<appState.UserActionNewRow> = null;//TODO

}
