/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import {
    RouterNavigationAction, ROUTER_NAVIGATION
} from '@ngrx/router-store';
import { Router } from "@angular/router";

import { Entity } from "@core/domain/metadata/entity";
import * as events from "@core/domain/event";

import { Table, TableColumn, getDefaultTable } from "@core/domain/uimetadata/table";
import { Form, NodeElement, NodeType, getDefaultForm } from "@core/domain/uimetadata/form";

import * as appState from './app.state';
import { generateUUID } from "@core/domain/uuid";
import { BackendService } from "./backend.service";
import { TableFormBackendAction, FormulaPreviewFromBackend } from './app.state';
import { FormDataFromBackendAction } from './components/form.state';
import { EntitiesFromBackendFullLoadAction } from './entity-state';
import { waitUntilNotNull } from "@core/ts-utils";
import { ExampleApps } from "@core/test/mocks/mock-metadata";
import { isNewDataObjId, isNewTopLevelDataObjId } from '@core/domain/metadata/data_obj';


export type ActionsToBeSentToServer =
    | appState.ServerEventModifiedFormData
    | appState.ServerEventDeleteFormData
    | appState.ServerEventModifiedForm
    | appState.ServerEventModifiedTable
    | appState.ServerEventNewEntity
    | appState.ServerEventDeleteEntity
    | appState.ServerEventSetProperty
    | appState.ServerEventDeleteProperty
    | appState.ServerEventPreviewFormula
    ;
export const ActionsToBeSentToServerNames = [
    events.ServerEventModifiedFormDataN,
    events.ServerEventDeletedFormDataN,
    events.ServerEventModifiedFormN,
    events.ServerEventModifiedTableN,
    events.ServerEventNewEntityN,
    events.ServerEventDeleteEntityN,
    events.ServerEventSetPropertyN,
    events.ServerEventDeletePropertyN,
    events.ServerEventPreviewFormulaN
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
            case events.ServerEventModifiedFormN:
                this.store.dispatch(new appState.FormNotifFromBackendAction(eventFromBe));
                break;
            case events.ServerEventModifiedTableN: {
                // this.store.dispatch(new appState.FormNotifFromBackendAction(event));
                //TODO: display loading indicator, not currently used
                break;
            }
            case events.ServerEventModifiedFormDataN: {
                let { appName, path, id } = appState.parseUrl(this.router.url);
                if (!id) {
                    console.error("Modify object for non-object url: " + this.router.url);
                    break;
                }
                if (isNewTopLevelDataObjId(id)) {
                    this.router.navigate([this.router.url.replace(/\w+~~$/, eventFromBe.obj._id)]);
                } else {
                    this.store.dispatch(new appState.FormNotifFromBackendAction(eventFromBe));
                    this.store.dispatch(new FormDataFromBackendAction(eventFromBe.obj));
                    console.error("FIXME, replicate cheanges from the server");
                }
                break;
            }
            case events.ServerEventDeletedFormDataN: {
                //TODO
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
            case events.ServerEventSetPropertyN: {
                if (this.router.url.indexOf(eventFromBe.targetEntity._id) >= 0) {
                    this.changeEntity(eventFromBe.targetEntity._id);
                } else {
                    this.router.navigate([this.router.url.replace(/\w+$/, eventFromBe.targetEntity._id)]);
                }
                break;
            }
            case events.ServerEventDeletePropertyN: {
                this.changeEntity(eventFromBe.targetEntity._id);
                break;
            }
            case events.ServerEventPreviewFormulaN: {
                this.store.dispatch(new FormulaPreviewFromBackend(eventFromBe));
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

        let entities = await waitUntilNotNull(async () => {return await this.backendService.getEntities()});

        //load entities and remove readOnly flag
        this.cachedEntitiesMap = {};
        entities.forEach(entity => this.cachedEntitiesMap[entity._id] = entity);
        this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
        this.store.dispatch(new appState.CoreAppReadonlyAction(appState.NotReadonly));
        this.processRouterUrlChange(this.router.url);

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

        if (id && path && id != this.currentUrl.id) {
            this.currentUrl.id = id;
            if (id === path + '~~') {
                this.store.dispatch(new appState.ResetFormDataFromBackendAction({_id: id}));
            } else {
                this.backendService.getDataObj(id)
                    .then(obj => this.store.dispatch(new appState.ResetFormDataFromBackendAction(obj)))
                    .catch(err => console.error(err))
                    ;
            }
        }

        if (!id && this.currentUrl.id) {
            this.currentUrl.id = null;
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
