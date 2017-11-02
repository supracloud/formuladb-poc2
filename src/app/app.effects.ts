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

import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';

import { BaseObj } from "./domain/base_obj";
import { Entity, Property } from "./domain/metadata/entity";
import { ChangeObj } from "./domain/change_obj";

import { Table, TableColumn } from "./domain/uimetadata/table";
import { Form, NodeElement, NodeType, NodeType2Str } from "./domain/uimetadata/form";

import * as appState from './app.state';

export type ActionsToBeSentToServer =
    | appState.UserActionEditedFormData
    ;
export const ActionsToBeSentToServerNames = [
    appState.UserActionEditedFormDataN,
];

@Injectable()
export class AppEffects {
    private currentUrl: { path: string, id: string } = { path: null, id: null };

    private localDB: any;
    private remoteEventsDB: any;
    private remoteDataDBUrl = 'http://localhost:5984/mwzdata';
    private remoteEventsDBUrl = 'http://localhost:5984/mwzevents';

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>
    ) {

        PouchDB.plugin(PouchFind);
        let me = this;

        this.localDB = new PouchDB("mwz");

        try {
            this.init();
        } catch (err) {
            console.error("Error creating AppEffects: ", err);
        }

    }

    private init() {
        this.remoteEventsDB = new PouchDB(this.remoteEventsDBUrl);

        this.localDB.createIndex({
            index: { fields: ['mwzType'] }
        }).then(() => {
            let appStateS = this;

            //FIXME: remove callback-hell
            //first catchup local PouchDB with what happened on the server while the application was stopped
            this.localDB.replicate.from(this.remoteDataDBUrl)
                .on('complete', info => {
                    //after initial replication from the server is finished, continue with live replication
                    this.localDB.replicate.from(this.remoteDataDBUrl, {
                        live: true,
                        retry: true,
                    })
                        .on('error', err => console.error(err));

                    //get initial list of entities and remove readonly flag
                    this.localDB.find({
                        selector: {
                            mwzType: 'Entity_'
                        }
                    }).then((res: { docs: Entity[] }) => {
                        this.store.dispatch(new appState.EntitiesFromBackendFullLoadAction(res.docs));
                        this.store.dispatch(new appState.CoreAppReadonlyAction(appState.NotReadonly));
                    }).catch(err => console.error(err));
                })
                .on('error', err => console.error(err));
        });

        //change app state based on router actions
        this.listenForRouterChanges();

        //send actions to server so that the engine can process them, compute all formulas and update the data
        this.actions$.ofType<ActionsToBeSentToServer>(...ActionsToBeSentToServerNames).subscribe(action => {
            this.remoteEventsDB.post(action)
                .catch(err => {
                    console.log(err);
                });
        });
    }

    public listenForRouterChanges() {
        this.actions$.ofType<RouterNavigationAction<appState.RouterState>>(ROUTER_NAVIGATION)
            .subscribe(routerNav => {
                //FIXME: why is queryParams empty ?!?!
                console.log("AppEffects:", routerNav.payload.routerState);
                let match = routerNav.payload.routerState.url.match(/^\/(\w+)\/?(\w+)?/)
                let { path, id } = appState.parseUrl(routerNav.payload.routerState.url);

                if (path === this.currentUrl.path && id === this.currentUrl.id) return;

                if (path !== this.currentUrl.path) {
                    this.currentUrl.path = path;
                    // this.store.dispatch(new appState.TableFormBackendAction(getDefaultTable()))
                    // this.table$.next(getDefaultTable(this.mockMetadata.entitiesMap.get(path)));
                    // this.table$.next(this.mockData.getAll(path).map(o => new ChangeObj(o)));
                    // this.form$.next(this.getForm(path));
                }

                if (id != this.currentUrl.id) {
                    // this.form$.next(this.mockData.get(path, id));
                }
            });
    }

    // Change state on router navigation: get metadata and data from server and replace change current state
    // @Effect() navigation$: TableFormActionsObservable = 

    private fetch() {
        return this.localDB.allDocs({ include_docs: true });
    }

    private get(id: string) {
        return this.localDB.get(id);
    }

    private put(id: string, document: BaseObj): Promise<any> {
        document._id = id;
        return this.get(id).then(result => {
            document._rev = result._rev;
            return this.localDB.put(document);
        }, error => {
            if (error.status == "404") {
                return this.localDB.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    private sync() {
        // let appStateS = this;
        // let remoteDatabase = new PouchDB(remote);
        // this.db.sync(remoteDatabase, {
        //     live: true
        // }).on('change', sync => {
        //     console.log(sync);
        //     if (sync.direction == 'push') {
        //         //data going to the server
        //     } else {
        //         //data coming from the server
        //         sync.change.docs.forEach(doc => {
        //             // if (doc._deleted) {
        //             //     //TODO
        //             // } else if (appStateS.currentlyEditedObjBeforeSave && doc._id == appStateS.currentlyEditedObjBeforeSave._id) {
        //             //     appStateS.formDataUpdatesFromServer$.next(doc);
        //             // }
        //         });
        //     }
        // }).on('error', error => {
        //     console.error(error);
        // });
    }

    private deleteAll(): Promise<any> {
        let db = this.localDB;

        let ret = null;
        ret = db.allDocs().then(function (result) {
            // Promise isn't supported by all browsers; you may want to use bluebird
            return Promise.all(result.rows.map(function (row) {
                return db.remove(row.id, row.value.rev);
            }));
        }).catch(function (err) {
            console.error(err);
        });
        return ret;
    }
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
            setFormElementChildren(child, entitiesMap.get(Entity.getPropertyPath(prop)), entitiesMap);
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
