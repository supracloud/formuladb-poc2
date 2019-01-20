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

import { KeyValueObj } from "./common/domain/key_value_obj";
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
import { FormDataFromBackendAction } from './form/form.state';
import { EntitiesFromBackendFullLoadAction } from './entity-state';


export type ActionsToBeSentToServer =
    | appState.ServerEventModifiedFormData
    | appState.ServerEventModifiedForm
    | appState.ServerEventModifiedTable
    | appState.ServerEventModifiedEntity
    | appState.ServerEventNewEntity
    | appState.ServerEventDeleteEntity
    ;
export const ActionsToBeSentToServerNames = [
    appState.ServerEventModifiedFormDataN,
    appState.ServerEventModifiedFormN,
    appState.ServerEventModifiedTableN,
    appState.ServerEventModifiedEntityN,
    appState.ServerEventNewEntityN,
    appState.ServerEventDeleteEntityN
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

    private async listenForNotifsFromServer(eventFromBe: events.MwzEvents) {
        console.log("%c <---- " + eventFromBe.type_ + " " + eventFromBe._id,
            "color: green; font-size: 115%; font-weight: bold; text-decoration: underline;", new Date(), eventFromBe);
        if (!eventFromBe) return;

        switch (eventFromBe.type_) {
            case appState.ServerEventModifiedFormDataN:
            case appState.ServerEventModifiedFormN:
                this.store.dispatch(new appState.FormNotifFromBackendAction(eventFromBe));
                break;
            case appState.ServerEventModifiedTableN: {
                // this.store.dispatch(new appState.FormNotifFromBackendAction(event));
                //TODO: display loading indicator, not currently used
                break;
            }
            case events.ServerEventModifiedFormDataN: {
                this.store.dispatch(new FormDataFromBackendAction(eventFromBe.obj));
                break;
            }
            case events.ServerEventModifiedFormN: {
                break;
            }
            case events.ServerEventModifiedTableN: {
                this.store.dispatch(new TableFormBackendAction(eventFromBe.table));
                break;
            }
            case events.ServerEventNewEntityN: {
                let entities = await this.backendService.getEntities();
                this.store.dispatch(new EntitiesFromBackendFullLoadAction(entities));
                this.router.navigate([this.router.url.replace(/\w+$/, eventFromBe.path)]);
                break;
            }
            case events.ServerEventDeleteEntityN: {
                let entities = await this.backendService.getEntities();
                this.store.dispatch(new EntitiesFromBackendFullLoadAction(entities));
                this.router.navigate([this.router.url.replace(/\w+$/, eventFromBe.entityId.replace(/___\w+$/, ''))]);
                break;
            }
            case events.ServerEventModifiedEntityN: {
                this.changeEntity(eventFromBe.entity._id);
                break;
            }
            default:
                return Promise.reject("n/a event");
        }
    }

    private listenFormDataChangesFromServer(docs: Array<KeyValueObj>) {
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
        this.listenForServerEvents();

        //listen for new object creations
        this.listenForNewDataObjActions();
    }

    private listenForServerEvents() {
        this.actions$.ofType<ActionsToBeSentToServer>(...ActionsToBeSentToServerNames).subscribe(action => {
            console.log("%c ----> " + action.event.type_ + " " + action.event._id,
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
        this.actions$.ofType<appState.ServerEventNewRow>(appState.ServerEventNewRowN).subscribe(action => {
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
            this.store.dispatch(new appState.SelectedEntityAction(entity));

            let table: Table = (await this.backendService.getTable(path)) || getDefaultTable(entity);;
            this.store.dispatch(new appState.ResetTableDataFromBackendAction(entity, []));
            this.store.dispatch(new appState.TableFormBackendAction(table));

            let tableData = await this.backendService.getTableData(path);
            this.store.dispatch(new appState.TableDataFromBackendAction(tableData.map(obj => new ChangeObj<DataObj>(obj))))

            let form: Form = (await this.backendService.getForm(path)) || getDefaultForm(entity, this.cachedEntitiesMap);
            this.store.dispatch(new appState.FormFromBackendAction(form));

        } catch (err) {
            console.error(err, err.stack);
        }
    }

    // @Effect() newDataObj$: Observable<appState.ServerEventNewRow> = null;//TODO

}
