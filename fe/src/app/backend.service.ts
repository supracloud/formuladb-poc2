/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Injectable, InjectionToken, Inject } from '@angular/core';

import { catchError, map, tap } from 'rxjs/operators';

import { BaseObj } from "./common/domain/base_obj";
import { ChangeObj } from "./common/domain/change_obj";
import { DataObj, parseDataObjId } from "./common/domain/metadata/data_obj";
import { Entity, Pn } from "./common/domain/metadata/entity";
import { MwzEvents, MwzEvent } from "./common/domain/event";
import { Table, addIdsToTable } from "./common/domain/uimetadata/table";
import { Form, NodeElement, addIdsToForm } from "./common/domain/uimetadata/form";
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { KeyValueStorePouchDB, PouchDB } from './common/key_value_store_pouchdb';
import { FrmdbStore } from './common/frmdb_store';
import { loadData } from './common/test/load_test_data';
import { FrmdbEngine } from './common/frmdb_engine';
import { FrmdbEngineStore } from './common/frmdb_engine_store';
import { FrmdbEngineTools } from './common/frmdb_engine_tools';

export enum EnvType {
    Test = "Test",
    Live = "Live",
}

const remoteDataDBUrl: string = '/frmdbdata';
const remoteTransactionsDBUrl: string = '/frmdbtransactions';

let TransactionsDB: KeyValueStorePouchDB = new KeyValueStorePouchDB(new PouchDB("frmdbtransactionslocal"));
let DataDB: KeyValueStorePouchDB = new KeyValueStorePouchDB(new PouchDB("frmdbdatalocal"));

@Injectable()
export class BackendService extends FrmdbStore {

    private initCallback: () => void;
    private notifCallback: (event: MwzEvents) => void;
    private dataChangeCallback: (docs: Array<BaseObj>) => void;
    private testRemoteDataDb: string | PouchDB.Database;
    private testRemoteTransactionsDb: string | PouchDB.Database;
    private testLocksDb: PouchDB.Database;
    private testFrmdbEngine: FrmdbEngine;
    private envType: EnvType;

    constructor(private http: HttpClient) {
        super(TransactionsDB, DataDB);
    }

    public async init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (docs: Array<BaseObj>) => void) {

        this.envType = window.location.href.indexOf("http://localhost:4200/") == 0 ? EnvType.Test : EnvType.Live;

        this.initCallback = initCallback;
        this.notifCallback = notifCallback;
        this.dataChangeCallback = dataChangeCallback;

        if (this.envType == EnvType.Test) {
            this.testRemoteDataDb = new PouchDB("frmdbdatatest", {revs_limit: 5});
            this.testRemoteTransactionsDb = new PouchDB("frmdbtransactionstest", {revs_limit: 5});
            this.testLocksDb = new PouchDB("frmdblockstest", {revs_limit: 5});
            let dataKVS = new KeyValueStorePouchDB(this.testRemoteDataDb);
            let trKVS = new KeyValueStorePouchDB(this.testRemoteTransactionsDb);
            let locksKVS = new KeyValueStorePouchDB(this.testLocksDb);
            let {mockMetadata, mockData} = await loadData(dataKVS, trKVS, locksKVS);
            let allData = await (this.testRemoteDataDb as PouchDB.Database).allDocs({include_docs: true});
            this.testFrmdbEngine = new FrmdbEngine(new FrmdbEngineStore(trKVS, dataKVS, locksKVS), mockMetadata.schema);
            await this.testFrmdbEngine.init();
        } else {
            this.testRemoteDataDb = remoteDataDBUrl;
            this.testRemoteTransactionsDb = remoteTransactionsDBUrl;
        }

        this.setupPouchDBReplication();
    }

    public getFrmdbEngineTools(): FrmdbEngineTools {
        if (this.envType == EnvType.Test) {
            return this.testFrmdbEngine.frmdbEngineTools;
        } else {
            throw new Error("getFrmdbEngineTools not implemented yet");
        }
    }
    
    private setupPouchDBReplication() {
        let self = this;

        console.log("%c ** INITIAL REPLICATION STARTED **##$$",
            "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");

        //first catchup local PouchDB with what happened on the server while the application was stopped
        this.dataDB.db.replicate.from(this.testRemoteDataDb)
            .on('complete', info => {
                console.log("%c ** INITIAL REPLICATION FINISHED **##$$",
                    "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");

                //application specific initialization
                self.initCallback();

                //after initial replication from the server is finished, continue with live replication
                this.dataDB.db.replicate.from(this.testRemoteDataDb, {
                    live: true,
                    retry: true,
                })
                    .on('change', function (change) {
                        self.dataChangeCallback(change.docs);
                    })
                    .on('error', err => console.error(err));

                this.transactionsDB.db.replicate.from(this.testRemoteTransactionsDb, {
                    live: true,
                    retry: true,
                })
                    .on('change', function (change) {
                    })
                    .on('error', err => console.error(err));
            })
            .on('error', err => console.error(err));
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
            if (prop.propType_ == Pn.SUB_TABLE) {
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
