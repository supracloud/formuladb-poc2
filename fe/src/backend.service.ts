/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";

import { CircularJSON } from "@domain/json-stringify";

import { DataObj, parseDataObjId, isDataObj, getChildrenPrefix } from "@domain/metadata/data_obj";
import { Entity, Pn, Schema, isEntityProperty, isEntity, isSchema } from "@domain/metadata/entity";
import { MwzEvents, MwzEvent } from "@domain/event";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { TablePage, isTablePage } from "@domain/uimetadata/table-page";
import { FrmdbEngineTools } from "@core/frmdb_engine_tools";
import { FormPage, isFormPage } from "@domain/uimetadata/form-page";

import { App } from "@domain/app";
import { SchemaCompiler } from '@core/schema_compiler';
import { Schema_inventory, App_inventory } from "@test/mocks/mock-metadata";
import { _textjoin_preComputeAggForObserverAndObservable } from "@core/frmdb_engine_functions/_textjoin";
import { FrmdbLogger } from "@domain/frmdb-logger";
import { APP_AND_TENANT_ROOT } from "./app.service";
const LOG = new FrmdbLogger('backend-service');

export function postData<IN, OUT>(url: string, data: IN): Promise<OUT> {
    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
        .then(response => response.json());
}

export function getData<OUT>(url: string): Promise<OUT> {
    return fetch(url)
        .then(response => {
            LOG.debug("getData", "%o", response);
            return response.json();
        });
}

export class BackendService {

    public applications: Map<string, App> = new Map();
    private frmdbEngineTools: FrmdbEngineTools;
    public currentSchema: Schema;

    constructor(public tenantName: string, public appName: string) {
        this.getSchema().then(schema => {
            if (!schema) throw new Error("Schema " + appName + " not found");
            this.currentSchema = schema;
            this.frmdbEngineTools = new FrmdbEngineTools(new SchemaCompiler(schema).compileSchema())
        });
    }

    public getFrmdbEngineTools() {
        return this.frmdbEngineTools;
    }

    async getApp(): Promise<App | null> {
        return getData<App | null>(`/formuladb-api/${this.tenantName}/${this.appName}`);
    }

    // // tslint:disable-next-line:member-ordering
    // private syncId = '0';
    // private syncWithOrbico() {
    //     this.http.get<Array<any>>(`/model_api/ProductReservation?query=grid_columns&sync_id=${this.syncId}`, { observe: 'response' })
    //         .pipe(
    //             catchError(this.handleError('sync ProductReservation'))
    //         ).subscribe((data: HttpResponse<any[]>) => {
    //             this.syncId = data.headers.get('last_sync_id') || '0';
    //             const dataObjs: any[] = [];
    //             for (const obj of (data.body || [])) {

    //                 const dataObj: any = { _id: 'REP__DeliveryRate~~' + obj.id };

    //                 dataObj.orderNb = obj.order_id;
    //                 dataObj.externalOrderNb =
    //                     dataObj.orderCreationDate =
    //                     dataObj.clientCode = obj.client_code;
    //                 dataObj.client = 'tbd';
    //                 dataObj.addressCode = 'tbd';
    //                 dataObj.addressName = 'tbd';
    //                 dataObj.location = obj.inventory_code;
    //                 dataObj.productCode = obj.product_code;
    //                 dataObj.barcode = obj.barcode;
    //                 dataObj.quantity = obj.quantity;
    //                 dataObj.quantityError = obj.quantity_error;
    //                 dataObj.price = 'tbd';

    //                 dataObj.actor_code = obj.actor_code;
    //                 dataObj.product_list_id = obj.product_list_id;
    //                 dataObj.stock = obj.stock;
    //                 dataObj.reserved_stock = obj.reserved_stock;
    //                 dataObj.imported_stock = obj.imported_stock;
    //                 dataObj.updated_at = obj.updated_at;
    //                 dataObj.created_at = obj.created_at;

    //                 dataObjs.push(dataObj);
    //             }
    //             // this.frm.putAll(dataObjs);
    //         });
    // }

    public putEvent(event: MwzEvents): Promise<MwzEvents> {
        return postData<MwzEvents, MwzEvents>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/event', event);
    }

    public async getApplications(): Promise<Map<string, App> | null> {
        if (this.applications.size == 0) {
            let apps = await getData<App[] | null>('/formuladb-api/applications');
            if (apps) {
                for (let app of apps) {
                    this.applications.set(app._id.replace(/^App~~/, ''), app);
                }
            }
        }

        return this.applications.size > 0 ? this.applications : null;
    }

    public async getTableData(prefix: string): Promise<DataObj[]> {
        let ret = await getData<DataObj[]>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/byprefix/' + encodeURIComponent(prefix));
        return ret || [];
    }

    public async getDictionary(locale: Exclude<App['defaultLocale'], undefined>) {
        let i18nList = await this.getTableData("$I18n~~");
        let dictionary = {};
        for (let i18n of i18nList) {
            dictionary[i18n._id.replace('$I18n~~', '')] = i18n[locale];
        }
        return dictionary;
    }

    public simpleAdHocQuery(entityName: string, query: SimpleAddHocQuery): Promise<any[]> {
        LOG.debug("simpleAdHocQuery", entityName + " %o", query);
        return postData<SimpleAddHocQuery, DataObj[]>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/' + entityName + '/SimpleAddHocQuery',
            query);
    }

    public async getDataObj(id: string): Promise<DataObj> {
        let http = await getData<DataObj | null>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/obj/' + encodeURIComponent(id));
        if (!http) throw new Error('Asked for non-existent object ' + id + '.');
        let dataObj = http;
        if (!isDataObj(dataObj)) throw new Error("response is not DataObj " + CircularJSON.stringify(dataObj));

        let { entityName, id: objId, uid: parentUUID } = parseDataObjId(id);
        let entity = await this.getEntity(entityName);
        if (!entity) throw new Error("cannot find entity: " + entityName + ", for getting children");
        for (const prop of Object.values(entity.props)) {
            if (prop.propType_ === Pn.CHILD_TABLE) {
                const subtableData = await this.getTableData(getChildrenPrefix(prop.referencedEntityName, parentUUID));
                dataObj[prop.name] = subtableData;
            }
        }
        return dataObj;
    }

    public async getTable(path: string): Promise<TablePage | null> {
        let http = await getData<TablePage | null>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/table/' + encodeURIComponent('ALL^^' + path));
        if (!http) return null;
        let ti = http;
        if (!isTablePage(ti)) throw new Error("response is not TablePage " + CircularJSON.stringify(ti));
        return ti;
    }

    public async getForm(path: string): Promise<FormPage | null> {
        let http = await getData<FormPage | null>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/form/' + encodeURIComponent('ALL^^' + path));
        if (!http) return null;
        let fi = http;
        if (!isFormPage(fi)) throw new Error("response is not FormPage " + CircularJSON.stringify(fi));
        return fi;
    }

    public async getEntities(): Promise<Entity[]> {
        let schema = await this.getSchema();
        return Object.values(schema.entities);
    }

    public async getSchema(): Promise<Schema> {
        let http = await getData<Schema | null>('/formuladb-api/' + this.tenantName + '/' + this.appName + '/schema');
        if (!http) throw new Error("no schema for " + this.tenantName + "/" + this.appName);
        if (!isSchema(http)) throw new Error("response is not Schema " + CircularJSON.stringify(http));
        this.currentSchema = http;
        return http;
    }

    public async getEntity(path: string): Promise<Entity> {
        let schema = await this.getSchema();
        return schema.entities[path];
    }
}

let _backendService: BackendService | null = null;
export function BACKEND_SERVICE(): BackendService {
    if (_backendService == null) {
        let [tenantName, appName] = APP_AND_TENANT_ROOT();
        _backendService = new BackendService(tenantName, appName);
    }
    return _backendService;
}

(window as any).FrmdbBackendService = BackendService;

export function _testResetBackendService() {
    _backendService = null;
}
