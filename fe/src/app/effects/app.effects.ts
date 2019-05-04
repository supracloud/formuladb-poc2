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

import { FeUser } from "@core/domain/user";
import { TablePage } from "@core/domain/uimetadata/table-page";
import { FormPage } from "@core/domain/uimetadata/form-page";

import * as appState from '../state/app.state';
import { generateUUID } from "@core/domain/uuid";
import { BackendService } from "./backend.service";
import { TableFormBackendAction, FormulaPreviewFromBackend, I18nLoadDictionary, pageInitialState } from '../state/app.state';
import { FormDataFromBackendAction, FormNotifFromBackendAction, ResetFormDataFromBackendAction, FormFromBackendAction } from '../actions/form.backend.actions';
import { EntitiesFromBackendFullLoadAction } from '../state/entity-state';
import { waitUntilNotNull } from "@core/ts-utils";
import { isNewTopLevelDataObjId } from '@core/domain/metadata/data_obj';
import { FrmdbStreamsService } from '../state/frmdb-streams.service';
import { AppServerEventAction, AppServerEventActionN } from '../actions/app.actions';
import { App } from '@core/domain/app';
import { autoLayoutForm } from '../components/auto-layout-form';
import { autoLayoutTable } from '../components/auto-layout-table';
import { Page } from '@core/domain/uimetadata/page';
import { elvis } from '@core/elvis';
import { PageChangedAction } from '../actions/page.user.actions';

export type ActionsToBeSentToServer =
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
    private currentUrl: { appName: string | null, entityName: string | null, id: string | null, entity: Entity | null } = { appName: null, entityName: null, id: null, entity: null };
    private cachedEntitiesMap: _.Dictionary<Entity> = {};
    private page: Page;
    private app: App;
    private user: FeUser;

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>,
        private backendService: BackendService,
        private router: Router,
        private frmdbStreams: FrmdbStreamsService
    ) {
        //change app state based on router actions
        this.listenForRouterChanges();
    
        //send actions to server so that the engine can process them, compute all formulas and update the data
        this.listenForServerEvents();

        //listen for new object creations
        this.listenForNewDataObjActions();

        this.store.select(appState.getPageState).subscribe(p => this.page = p);

        waitUntilNotNull(async () => {
            let ret = await this.backendService.getApplications();
            return ret;
        });

        //FIXME: read user from be
    }

    public async changeApplication(appName: string) {
        try {
            let apps: Map<string, App> = await waitUntilNotNull(async () => {
                let ret = await this.backendService.getApplications();
                return ret;
            });
            
            let app = apps.get(appName);
            if (!app) {console.warn("App not found", app); return;}
            this.app = app;

            this.store.dispatch(new PageChangedAction({
                ...pageInitialState,
                ...app.page
            }));

            //we first initialize the DB (sync with remote DB)
            await this.backendService.initApplication(
                app,
                change => this.listenForNotifsFromServer(change)
            );
    
            let dict = await this.backendService.getDictionary(app.locale || 'en');
            this.store.dispatch(new I18nLoadDictionary(dict));

            let entities = await waitUntilNotNull(async () => {return await this.backendService.getEntities()});

            //load entities and remove readOnly flag
            this.cachedEntitiesMap = {};
            entities.forEach(entity => this.cachedEntitiesMap[entity._id] = entity);
            this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(entities));
            this.store.dispatch(new appState.CoreAppReadonlyAction(appState.NotReadonly));
        
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
                this.store.dispatch(new FormNotifFromBackendAction(eventFromBe));
                break;
            case events.ServerEventModifiedTableN: {
                // this.store.dispatch(new appState.FormNotifFromBackendAction(event));
                //TODO: display loading indicator, not currently used
                break;
            }
            case events.ServerEventModifiedFormDataN: {
                let { appName, entityName: path, id } = appState.parseUrl(this.router.url);
                if (!id) {
                    console.error("Modify object for non-object url: " + this.router.url);
                    break;
                }
                if (isNewTopLevelDataObjId(id)) {
                    this.router.navigate([this.router.url.replace(/\w+~~$/, eventFromBe.obj._id)]);
                } else {
                    this.store.dispatch(new FormNotifFromBackendAction(eventFromBe));
                    if (eventFromBe.state_ !== "ABORT") {
                        this.store.dispatch(new FormDataFromBackendAction(eventFromBe.obj));
                    }
                    console.warn("FIXME, replicate changes from the server");
                }
                break;
            }
            case events.ServerEventDeletedFormDataN: {
                let { appName, entityName: path, id } = appState.parseUrl(this.router.url);
                if (null == id) {
                    this.frmdbStreams.serverEvents$.next({type: "ServerDeletedFormData", obj: eventFromBe.obj});
                } else {
                    let obj = await this.backendService.getDataObj(id);
                    this.store.dispatch(new ResetFormDataFromBackendAction(obj));
                }
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

    private listenForServerEvents() {
        this.actions$.pipe(ofType<AppServerEventAction>(AppServerEventActionN)).subscribe(action => {
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
        let { appName, entityName, id } = appState.parseUrl(url);

        if (appName === this.currentUrl.appName && entityName === this.currentUrl.entityName && id === this.currentUrl.id) return;

        let appNameChanged = false;
        if (appName !== this.currentUrl.appName) {
            this.currentUrl.appName = appName;
            if (appName) {
                await this.changeApplication(appName);
                appNameChanged = true;
            }
        }

        if (entityName !== this.currentUrl.entityName) {
            this.currentUrl.entityName = entityName;
            if (entityName) {
                await this.changeEntity(entityName);
            }
        }

        if (id && entityName && id != this.currentUrl.id) {
            this.currentUrl.id = id;
            if (id === entityName + '~~') {
                this.store.dispatch(new ResetFormDataFromBackendAction({_id: id}));
            } else {
                this.backendService.getDataObj(id)
                    .then(obj => this.store.dispatch(new ResetFormDataFromBackendAction(obj)))
                    .catch(err => console.error(err))
                    ;
            }
        }

        if (!id && this.currentUrl.id) {
            this.currentUrl.id = null;
        }

        if (appNameChanged && !entityName) {
            this.router.navigate([appName! + '/' + (elvis(this.app).homePage || 'Home/Home~~Home')]);
        }
    }

    private listenForNewDataObjActions() {
        this.actions$.pipe(ofType<appState.ServerEventNewRow>(appState.ServerEventNewRowN)).subscribe(action => {
            this.currentUrl.id = generateUUID();
            this.router.navigate([this.currentUrl.entity!._id + '/' + this.currentUrl.id]);
            this.store.dispatch(new FormDataFromBackendAction({ _id: this.currentUrl.id }))
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

            let table: TablePage = (await this.backendService.getTable(path)) || autoLayoutTable(null, entity);
            if (!table.childNodes || table.childNodes.length == 0) {
                table = autoLayoutTable(table, entity);
            }
            this.store.dispatch(new appState.TableFormBackendAction(table));

            let form: FormPage = (await this.backendService.getForm(path)) || autoLayoutForm(null, entity, this.cachedEntitiesMap);
            if (!form.childNodes || form.childNodes.length == 0) {
                autoLayoutForm(form, entity, this.cachedEntitiesMap);
            }
            this.store.dispatch(new FormFromBackendAction(form));

        } catch (err) {
            console.error(err, err.stack);
        }
    }

    // @Effect() newDataObj$: Observable<appState.ServerEventNewRow> = null;//TODO

}
