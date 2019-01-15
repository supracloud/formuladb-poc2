/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Injectable, InjectionToken, Inject } from '@angular/core';

import { catchError, map, tap } from 'rxjs/operators';

import { KeyValueObj } from "./common/domain/key_value_obj";
import { DataObj, parseDataObjId } from "./common/domain/metadata/data_obj";
import { Entity, Pn } from "./common/domain/metadata/entity";
import { MwzEvents, MwzEvent } from "./common/domain/event";
import { Table, addIdsToTable } from "./common/domain/uimetadata/table";
import { Form, NodeElement, addIdsToForm } from "./common/domain/uimetadata/form";
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { KeyValueStoreBase } from './common/key_value_store_i';
import { FrmdbStore } from './common/frmdb_store';
import { loadData } from './common/test/load_test_data';
import { FrmdbEngine } from './common/frmdb_engine';
import { FrmdbEngineStore } from './common/frmdb_engine_store';
import { FrmdbEngineTools } from './common/frmdb_engine_tools';
import { KeyValueStoreMem } from './common/key_value_store_mem';

export enum EnvType {
    Test = "Test",
    Live = "Live",
}

let TransactionsDB: KeyValueStoreBase = new KeyValueStoreMem();
let DataDB: KeyValueStoreBase = new KeyValueStoreMem();

@Injectable()
export class BackendService extends FrmdbStore {

    private initCallback: () => void;
    private notifCallback: (event: MwzEvents) => void;
    private dataChangeCallback: (docs: Array<KeyValueObj>) => void;
    private testFrmdbEngine: FrmdbEngine;
    private envType: EnvType;

    constructor(private http: HttpClient) {
        super(TransactionsDB, DataDB);
    }

    public async init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (docs: Array<KeyValueObj>) => void) {

        this.envType = window.location.href.indexOf("http://localhost:4200/") == 0 ? EnvType.Test : EnvType.Live;

        this.initCallback = initCallback;
        this.notifCallback = notifCallback;
        this.dataChangeCallback = dataChangeCallback;

        if (this.envType == EnvType.Test) {
            let locksKVS = new KeyValueStoreMem();
            let {mockMetadata, mockData} = await loadData(DataDB, TransactionsDB, locksKVS);
            let schema = mockMetadata.schema;
            this.testFrmdbEngine = new FrmdbEngine(new FrmdbEngineStore(TransactionsDB, DataDB, locksKVS), schema);
            await this.testFrmdbEngine.init(true);
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

                let dataObj: any = {_id: 'REP___DeliveryRate~~' + obj.id};

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
            this.dataDB.putAll(dataObjs);
        });
    }

    public putEvent(event: MwzEvents) {
        if (this.envType === EnvType.Test) {
            this.testFrmdbEngine.processEvent(event)
                .then(ev => this.handleNotif(ev));
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

    public getTableData<T extends DataObj>(path: string): Promise<T[]> {
        return this.dataDB.findByPrefix(path + '~~');
    }

    public async getDataObj(id: string): Promise<DataObj> {
        let dataObj = await this.getObj(id);
        let parentUUID = parseDataObjId(id).uid;
        let entity = this.getFrmdbEngineTools().schemaDAO.getEntityForDataObj(id);
        for (let prop of Object.values(entity.props)) {
            if (prop.propType_ == Pn.CHILD_TABLE) {
                let subtableData = await this.dataDB.findByPrefix(prop.referencedEntityName + '~~' + parentUUID + '___');
                dataObj[prop.name] = subtableData;
            }
        }
        return dataObj;
    }

    public getTable(path: string): Promise<Table> {

        return super.getTable(path).then(ti => {
            return new Promise<Table>((resolve, reject) => {
                addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public setTable(t: Table): Promise<Table> {
        return this.dataDB.put(t);
    }

    public getForm(path: string): Promise<Form> {
        return super.getForm(path).then(fi => {
            addIdsToForm(fi.grid);
            return fi;
        });
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
