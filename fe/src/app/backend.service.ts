/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Injectable, InjectionToken, Inject, NgZone } from '@angular/core';

import { catchError, map, tap } from 'rxjs/operators';

import { KeyValueObj } from "@storage/domain/key_value_obj";
import { DataObj, parseDataObjId } from "./common/domain/metadata/data_obj";
import { Entity, Pn } from "./common/domain/metadata/entity";
import { MwzEvents, MwzEvent } from "./common/domain/event";
import { Table, addIdsToTable } from "./common/domain/uimetadata/table";
import { Form, NodeElement, addIdsToForm } from "./common/domain/uimetadata/form";
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { FrmdbStore } from './common/frmdb_store';
import { loadData } from './common/test/load_test_data';
import { FrmdbEngine } from './common/frmdb_engine';
import { FrmdbEngineStore } from './common/frmdb_engine_store';
import { FrmdbEngineTools } from './common/frmdb_engine_tools';
import KeyValueStoreFactory from '@kv_selector_base/key_value_store_impl_selector';
import { MockMetadata, ExampleApps } from './common/test/mocks/mock-metadata';
import { waitUntilNotNull } from './common/ts-utils';

export enum EnvType {
    Test = "Test",
    Live = "Live",
}


@Injectable()
export class BackendService {

    private initCallback: () => void;
    private notifCallback: (event: MwzEvents) => void;
    private dataChangeCallback: (docs: Array<KeyValueObj>) => void;
    private testFrmdbEngine: FrmdbEngine;
    private frmdbStore: FrmdbStore;
    private envType: EnvType;

    constructor(private http: HttpClient,private _ngZone: NgZone) {
    }

    public async init(
        app: ExampleApps,
        initCallback: () => void,
        notifCallback: (event: MwzEvents) => void)
    {

        this.envType = window.location.href.indexOf("http://localhost:4200/") == 0 || window.location.href.indexOf("http://localhost:4300/") == 0 ? 
            EnvType.Test : EnvType.Live;

        this.initCallback = initCallback;
        this.notifCallback = notifCallback;

        if (this.envType == EnvType.Test) {
            await this._ngZone.runOutsideAngular(async () => {

                if (this.testFrmdbEngine) {
                    //TODO: cleanup
                }
                let mockMetadata = new MockMetadata(app);
                this.testFrmdbEngine = new FrmdbEngine(new FrmdbEngineStore(KeyValueStoreFactory), mockMetadata.schema);
                this.frmdbStore = this.testFrmdbEngine.frmdbEngineStore;
                await this.testFrmdbEngine.init(true);
                await loadData(this.testFrmdbEngine, mockMetadata);
            });
        }

        this.initCallback();

        //TODO: replicate transactions via lon gpolling from all users that modify objects with ids from current table
    }

    public getFrmdbEngineTools(): FrmdbEngineTools {
        if (this.envType == EnvType.Test) {
            return this.testFrmdbEngine.frmdbEngineTools;
        } else {
            throw new Error("getFrmdbEngineTools not implemented yet");
        }
    }

    private syncId = '0';
    private syncWithOrbico() {
        this.http.get<Array<any>>(`/model_api/ProductReservation?query=grid_columns&sync_id=${this.syncId}`, {observe: 'response'})
        .pipe(
            catchError(this.handleError('sync ProductReservation'))
        ).subscribe((data: HttpResponse<any[]>) => {
            this.syncId = data.headers.get('last_sync_id') || '0';
            let dataObjs: any[] = [];
            for (let obj of (data.body || [])) {

                let dataObj: any = {_id: 'REP__DeliveryRate~~' + obj.id};

                dataObj.orderNb = obj.order_id;
                dataObj.externalOrderNb = 
                dataObj.orderCreationDate = 
                dataObj.clientCode = obj.client_code;
                dataObj.client = 'tbd';
                dataObj.addressCode = 'tbd';
                dataObj.addressName = 'tbd';
                dataObj.location = obj.inventory_code;
                dataObj.productCode = obj.product_code;
                dataObj.barcode = obj.barcode;
                dataObj.quantity = obj.quantity;
                dataObj.quantityError = obj.quantity_error;
                dataObj.price = 'tbd';

                dataObj.actor_code = obj.actor_code;
                dataObj.product_list_id = obj.product_list_id;
                dataObj.stock = obj.stock;
                dataObj.reserved_stock = obj.reserved_stock;
                dataObj.imported_stock = obj.imported_stock;
                dataObj.updated_at = obj.updated_at;
                dataObj.created_at = obj.created_at;

                dataObjs.push(dataObj);
            }
            // this.frm.putAll(dataObjs);
        });
    }

    public putEvent(event: MwzEvents) {
        if (this.envType === EnvType.Test) {
            this._ngZone.runOutsideAngular(async () => {
                this.testFrmdbEngine.processEvent(event)
                    .then(ev => 
                        // this._ngZone.run(() => this.handleNotif(ev))
                        this.handleNotif(ev)
                    );
            });
            // this.handleNotif({
            //     "clientId_": "9ymYNtsMnKcBRuz89e7FKH",
            //     "state_": "BEGIN",
            //     "obj": {
            //         "_id": "INV__Order__Item~~1__1",
            //         "productLocationId": "INV__PRD__Location~~1__1",
            //         "quantity": 25,
            //         "error_quantity": 975,
            //         "client_stock": null,
            //         "units": [
            //             {}
            //         ]
            //     } as DataObj,
            //     "type_": "[form] ServerEventModifiedFormData",
            //     "_id": "1548323727283_ePq8DMgwnmKpiyDuR9zsse"
            // });
        } else {
            this.http.post<MwzEvents>('/api/event', event)
                .pipe(
                    catchError(this.handleError<MwzEvents>('putEvent', event))
                ).subscribe(ev => this.handleNotif(ev));
        }
    }

    private handleNotif(event: MwzEvents) {
        this.notifCallback(event);
    }

    public getTableData(path: string): Promise<DataObj[]> {
        return this.frmdbStore.getDataListByPrefix(path + '~~');
    }

    public async getDataObj(id: string): Promise<DataObj> {
        let dataObj = await this.frmdbStore.getDataObj(id);
        if (null == dataObj) throw new Error("Asked for non-existent object " + id + ".");

        let parentUUID = parseDataObjId(id).uid;
        let entity = this.getFrmdbEngineTools().schemaDAO.getEntityForDataObj(id);
        for (let prop of Object.values(entity.props)) {
            if (prop.propType_ == Pn.CHILD_TABLE) {
                let subtableData = await this.frmdbStore.getDataListByPrefix(prop.referencedEntityName + '~~' + parentUUID + '__');
                dataObj[prop.name] = subtableData;
            }
        }
        return dataObj;
    }

    public getTable(path: string): Promise<Table | null> {

        return this.frmdbStore.getTable(path).then(ti => {
            if (ti == null ) return Promise.resolve(ti);
            return new Promise<Table>((resolve, reject) => {
                addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public async setTable(t: Table): Promise<Table> {
        let ret = await this.frmdbStore.putTable(t);
        if (null == ret ) throw new Error("Internal error saving table " + JSON.stringify(t) + ".");
        return ret;
    }

    public getForm(path: string): Promise<Form | null> {
        return this.frmdbStore.getForm(path).then(fi => {
            if (fi == null ) return fi;
            addIdsToForm(fi.grid);
            return fi;
        });
    }

    public async getEntities(): Promise<Entity[]> {
        let frmdbStore = await waitUntilNotNull<FrmdbStore>(() => this.frmdbStore);
        return frmdbStore.getEntities();
    }
    
    public async getEntity(path: string): Promise<Entity> {
        let frmdbStore = await waitUntilNotNull<FrmdbStore>(() => this.frmdbStore);
        let ret = await frmdbStore.getEntity(path);
        if (ret == null ) throw new Error("Asked for non existent table " + path + ".");
        return ret;
    }


    public async newEntity(path: string): Promise<Entity> {
        let newEntity: Entity = {
            _id: path,
            props: {},
        };
        return this.frmdbStore.putEntity(newEntity);
    }
    
    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
