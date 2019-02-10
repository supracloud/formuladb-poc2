/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import {
    RouterNavigationAction, RouterNavigationPayload, ROUTER_NAVIGATION
} from '@ngrx/router-store';
import { Router } from "@angular/router";

import { KeyValueObj } from "@core/domain/key_value_obj";
import { DataObj } from "@core/domain/metadata/data_obj";
import { Entity } from "@core/domain/metadata/entity";
import { ChangeObj } from "@core/domain/change_obj";
import * as events from "@core/domain/event";

import { Table, TableColumn, getDefaultTable } from "@core/domain/uimetadata/table";
import { Form, NodeElement, NodeType, getDefaultForm } from "@core/domain/uimetadata/form";

import * as appState from './app.state';
import { generateUUID } from "@core/domain/uuid";
import { BackendService } from "./backend.service";
import { TableFormBackendAction } from './app.state';
import { FormDataFromBackendAction } from './form/form.state';
import { EntitiesFromBackendFullLoadAction } from './entity-state';
import { waitUntilNotNull } from "@core/ts-utils";
import { ExampleApps } from "@core/test/mocks/mock-metadata";


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

@Injectable()
export class AppEffects {
    private currentUrl: { appName: string | null, path: string | null, id: string | null, entity: Entity | null } = { appName: null, path: null, id: null, entity: null };
    private cachedEntitiesMap: _.Dictionary<Entity> = {};

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>,
        private backendService: BackendService,
        private router: Router
    ) {

        //change app state based on router actions
        this.listenForRouterChanges();

    }

    public async load() {
        try {

            await waitUntilNotNull(() => this.getAppName());

            //we first initialize the DB (sync with remote DB)
            return this.backendService.init(
                this.getAppName()!,
                () => this.init(),
                change => this.listenForNotifsFromServer(change));
        } catch (err) {
            console.error("Error creating AppEffects: ", err);
        }
    }

    private async listenForNotifsFromServer(eventFromBe: events.MwzEvents) {
        console.log("%c <---- " + eventFromBe.type_ + " " + eventFromBe._id,
            "color: green; font-size: 115%; font-weight: bold; text-decoration: underline;", new Date(), eventFromBe);
        if (!eventFromBe) return;

        switch (eventFromBe.type_) {
            case appState.ServerEventModifiedFormN:
                this.store.dispatch(new appState.FormNotifFromBackendAction(eventFromBe));
                break;
            case appState.ServerEventModifiedTableN: {
                // this.store.dispatch(new appState.FormNotifFromBackendAction(event));
                //TODO: display loading indicator, not currently used
                break;
            }
            case events.ServerEventModifiedFormDataN: {
                this.store.dispatch(new appState.FormNotifFromBackendAction(eventFromBe));
                this.store.dispatch(new FormDataFromBackendAction(eventFromBe.obj));
                console.error("FIXME, replicate cheanges from the server");
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
                this.router.navigate([this.router.url.replace(/\w+$/, eventFromBe.entityId.replace(/__\w+$/, ''))]);
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


    private getAppName(): ExampleApps | null {
        let { appName, path, id } = appState.parseUrl(this.router.url);
        return appName ? ExampleApps[appName] : null;
    }

    private async init() {

        //load entities and remove readOnly flag
        this.backendService.getEntities().then(entities => {
            this.cachedEntitiesMap = {};
            entities.forEach(entity => this.cachedEntitiesMap[entity._id] = entity);
            this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
            this.store.dispatch(new appState.CoreAppReadonlyAction(appState.NotReadonly));
            this.processRouterUrlChange(this.router.url);
        }).catch(err => console.error(err));

        //send actions to server so that the engine can process them, compute all formulas and update the data
        this.listenForServerEvents();

        //listen for new object creations
        this.listenForNewDataObjActions();
    }

    private listenForServerEvents() {
        this.actions$.pipe(ofType<ActionsToBeSentToServer>(...ActionsToBeSentToServerNames)).subscribe(action => {
            console.log("%c ----> " + action.event.type_ + " " + action.event._id,
                "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", action.event);
            this.backendService.putEvent(action.event);
        });
    }

    public listenForRouterChanges() {
        this.actions$.pipe(ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION))
            .subscribe(routerNav => {
                //FIXME: why is queryParams empty ?!?!
                console.log("AppEffects:", routerNav.payload.routerState);
                this.processRouterUrlChange(routerNav.payload.routerState.url);
            });
    }

    private async processRouterUrlChange(url: string) {
        let { appName, path, id } = appState.parseUrl(url);

        if (appName === this.currentUrl.appName && path === this.currentUrl.path && id === this.currentUrl.id) return;

        if (appName !== this.currentUrl.appName) {
            this.currentUrl.appName = appName;
            await this.load();
        }

        if (path !== this.currentUrl.path) {
            this.currentUrl.path = path;
            await this.changeEntity(path!);
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
        this.actions$.pipe(ofType<appState.ServerEventNewRow>(appState.ServerEventNewRowN)).subscribe(action => {
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
            this.store.dispatch(new appState.TableFormBackendAction(table));

            let form: Form = (await this.backendService.getForm(path)) || getDefaultForm(entity, this.cachedEntitiesMap);
            this.store.dispatch(new appState.FormFromBackendAction(form));

        } catch (err) {
            console.error(err, err.stack);
        }
    }

    // @Effect() newDataObj$: Observable<appState.ServerEventNewRow> = null;//TODO

}
