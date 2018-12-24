/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import {
    RouterNavigationAction, RouterNavigationPayload, ROUTER_NAVIGATION
} from '@ngrx/router-store';
import { Router } from "@angular/router";

import { BaseObj } from "./common/domain/base_obj";
import { DataObj } from "./common/domain/metadata/data_obj";
import { Entity } from "./common/domain/metadata/entity";
import { ChangeObj } from "./common/domain/change_obj";
import * as events from "./common/domain/event";

import { Table, TableColumn, getDefaultTable } from "./common/domain/uimetadata/table";
import { Form, NodeElement, NodeType, getDefaultForm } from "./common/domain/uimetadata/form";

import * as appState from './app.state';
import { generateUUID } from "./common/domain/uuid";
import { BackendService, EnvType } from "./backend.service";
import { TableFormBackendAction } from './app.state';


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

let LOADED = false;

@Injectable()
export class AppEffects {
    private currentUrl: { path: string | null, id: string | null, entity: Entity | null } = { path: null, id: null, entity: null };
    private cachedEntitiesMap: _.Dictionary<Entity> = {};

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>,
        private backendService: BackendService,
        private router: Router
    ) {
        this.load();
    }

    public load() {
        if (LOADED) return;

        try {
            //we first initialize the DB (sync with remote DB)
            this.backendService.init(
                () => this.init(),
                change => this.listenForNotifsFromServer(change),
                change => this.listenFormDataChangesFromServer(change));
        } catch (err) {
            console.error("Error creating AppEffects: ", err);
        }
        LOADED = true;
    }

    private listenForNotifsFromServer(event: events.MwzEvents) {
        console.log("%c <---- " + event.type_ + " " + event._id,
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
        console.log("%c <==== " + docs.map(x => x._id).join(','),
            "color: green; font-size: 115%; font-weight: bold; text-decoration: underline;", new Date(), docs);

        docs.forEach(obj => {
            if (obj._id.indexOf('Entity_') == 0) {
                console.log("Loading all entities from local DB");
                this.backendService.getEntities().then(entities => {
                    console.log("displaying all entities from local DB", entities);
                    this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
                }).catch(err => console.error(err));
            } else if (obj._id.indexOf('Table_') == 0) {
                this.store.dispatch(new appState.TableFormBackendAction(obj as Table));
            } else if (obj._id.indexOf('Form_') == 0) {
                this.store.dispatch(new appState.FormFromBackendAction(obj as Form));
            } else {
                this.store.dispatch(new appState.FormDataFromBackendAction(obj));
                this.store.dispatch(new appState.TableDataFromBackendAction([new ChangeObj(obj as DataObj)]));
            }
        });
    }

    private init() {
        //load entities and remove readOnly flag
        this.backendService.getEntities().then(entities => {
            this.cachedEntitiesMap = {};
            entities.forEach(entity => this.cachedEntitiesMap[entity._id] = entity);
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
            console.log("%c ----> " + action.event.type_ + " " + action.event._id,
                "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", action.event);

            switch (action.event.type_) {
                case events.UserActionEditedFormDataN:
                    this.backendService.putEvent(action.event);
                    break;
                case events.UserActionEditedFormN:
                    break;
                case events.UserActionEditedTableN:
                    this.store.dispatch(new TableFormBackendAction(action.event.table));
                    break;
                case events.UserActionNewEntityN:
                    break;
                case events.UserActionDeleteEntityN:
                    break;
                case events.UserActionEditedEntityN:
                    break;
                default:
                    return Promise.reject("n/a event");
            }
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
            this.changeEntity(path!);
        }

        if (id && id != this.currentUrl.id) {
            this.currentUrl.id = id;
            this.backendService.getDataObj(id)
                .then(obj => this.store.dispatch(new appState.ResetFormDataFromBackendAction(obj)))
                .catch(err => console.error(err))
                ;
        }

    }

    private listenForNewDataObjActions() {
        this.actions$.ofType<appState.UserActionNewRow>(appState.UserActionNewRowN).subscribe(action => {
            this.currentUrl.id = generateUUID();
            this.router.navigate([this.currentUrl.entity!._id + '/' + this.currentUrl.id]);
            this.store.dispatch(new appState.FormDataFromBackendAction({ _id: this.currentUrl.id }))
        });
    }

    private async changeEntity(path: string) {
        try {
            let entity;
            try {
                entity = await this.backendService.getEntity(path);
            } catch (err) {
                if (err.status == 404) {
                    return;//no entity yet
                } else throw err;
            }
            if (null == entity) throw new Error("Cannot find entity " + path);
            
            this.currentUrl.entity = entity;
            this.store.dispatch(new appState.UserActionSelectedEntity(entity));

            let table: Table;
            try {
                table = await this.backendService.getTable(path);
            } catch (err) {
                if (err.status == 404) {
                    table = getDefaultTable(entity);
                } else throw err;
            }
            this.store.dispatch(new appState.ResetTableDataFromBackendAction(entity, []));
            this.store.dispatch(new appState.TableFormBackendAction(table));

            let tableData = await this.backendService.getTableData(path);
            this.store.dispatch(new appState.TableDataFromBackendAction(tableData.map(obj => new ChangeObj<DataObj>(obj))))

            let form: Form;
            try {
                form = await this.backendService.getForm(path);
            } catch (err) {
                if (err.status == 404) {
                    form = getDefaultForm(entity, this.cachedEntitiesMap);
                } else throw err;
            }
            this.store.dispatch(new appState.FormFromBackendAction(form));

        } catch (err) {
            console.error(err, err.stack);
        }
    }

    // @Effect() newDataObj$: Observable<appState.UserActionNewRow> = null;//TODO

}
