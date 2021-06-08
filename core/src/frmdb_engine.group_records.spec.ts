/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "./frmdb_engine_store";

import { ServerEventModifiedFormData, ServerEventDeletedFormData } from "@domain/event";
import { FrmdbEngine } from "./frmdb_engine";
import { Pn, Entity, ScalarFormulaProperty, Schema, EntityProperty, ChildTableProperty, AggregateFormulaProperty, ComputedRecordProperty, ComputedRecordValueProperty } from "@domain/metadata/entity";
import { DataObj } from "@domain/metadata/data_obj";
import { KeyValueObj, KeyValueObjIdType } from "@domain/key_value_obj";
import { getTestFrmdbEngine } from '@storage/key_value_store_impl_selector';

describe('FrmdbEngine', () => {
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;
    let originalTimeout;

    const _testSchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            A: {
                _id: 'A', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    b_name: { name: "b_name", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    b_name2: { name: "b_name2", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    x: { name: "x", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    c_name: { name: "c_name", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    val: { name: "val", propType_: Pn.INPUT, actualType: {name: "NumberType"} },
                },
            } as Entity,
            B: {
                _id: 'B', props: {
                    _id: { name: "_id", propType_: Pn.COMPUTED_RECORD, referencedEntityName: "A", formula: 'CONCATENATE(b_name, "-", b_name2)' } as ComputedRecordProperty,
                    sum: { name: "sum", propType_: Pn.AGGREGATE_FORMULA, formula: 'SUMIF(A.val, CONCATENATE(b_name, "-", b_name2) = ID(@[_id]))' } as AggregateFormulaProperty,
                    sum1: { name: "sum1", propType_: Pn.AGGREGATE_FORMULA, formula: 'SUMIF(A.val, AND(CONCATENATE(b_name, "-", b_name2) = ID(@[_id]), x = "x1"))' } as AggregateFormulaProperty,
                    count2: { name: "count2", propType_: Pn.AGGREGATE_FORMULA, formula: 'COUNTIF(A.val, AND(CONCATENATE(b_name, "-", b_name2) = ID(@[_id]), x = "x2"))' } as AggregateFormulaProperty,
                    b_name: { name: "b_name", propType_: Pn.SCALAR_FORMULA, formula: 'LIST_GET(SPLIT_TEXT(ID(_id), "-"), 1)'} as ScalarFormulaProperty,
                    b_name2: { name: "b_name2", propType_: Pn.SCALAR_FORMULA, formula: 'LIST_GET(SPLIT_TEXT(ID(_id), "-"), 2)'} as ScalarFormulaProperty,
                    x: {name: "x", propType_: Pn.COMPUTED_RECORD_VALUE, formula: "AS_TEXT(x)"} as ComputedRecordValueProperty,
                },
            } as Entity,
            C: {
                _id: 'C', props: {
                    _id: { name: "_id", propType_: Pn.COMPUTED_RECORD, referencedEntityName: "A", formula: "AS_TEXT(c_name)" } as ComputedRecordProperty,
                    cnt: { name: "cnt", propType_: Pn.AGGREGATE_FORMULA, formula: 'COUNTIF(A.val, c_name = ID(@[_id]))' } as AggregateFormulaProperty,
                }
            } as Entity,
        }
    };
    let testSchema: Schema = _testSchema;

    beforeEach(async () => {
        testSchema = _.cloneDeep(_testSchema);
        frmdbEngine = await getTestFrmdbEngine(testSchema);
        frmdbTStore = frmdbEngine.frmdbEngineStore;
        await frmdbTStore.kvsFactory.clearAllForTestingPurposes();
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    });

    async function putObj(obj: KeyValueObj): Promise<ServerEventModifiedFormData> {
        let event = await frmdbEngine.processEventAnonymous(new ServerEventModifiedFormData(obj)) as ServerEventModifiedFormData;
        if (event.error_) throw new Error(`Cound not save ${JSON.stringify(obj)}, ${event.reason_}, ${event.error_}`);
        return event;
    }
    async function delObj(obj: KeyValueObj): Promise<ServerEventDeletedFormData> {
        return await frmdbEngine.processEventAnonymous(new ServerEventDeletedFormData(obj)) as ServerEventDeletedFormData;
    }

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("should group records", async () => {
        await frmdbEngine.init();

        let a1 = { _id: "A~~1", b_name: 'b1', b_name2: 'b1.1', x: "x1", c_name: "c1", val: 1};
        let a2 = { _id: "A~~2", b_name: 'b1', b_name2: 'b1.1', x: "x1", c_name: "c1", val: 2};
        await putObj(a1);
        await putObj(a2);

        let b1: any = await frmdbTStore.getDataObj('B~~b1-b1.1');
        expect(b1).toEqual(jasmine.objectContaining({sum: 3, sum1: 3, count2: 0, b_name: 'b1', b_name2: 'b1.1', x: "x1"}));

        let c1: any = await frmdbTStore.getDataObj('C~~c1');
        expect(c1).toEqual(jasmine.objectContaining({cnt: 2}));

        
        await putObj({ _id: "A~~", b_name: 'b1', b_name2: 'b1.1', x: "x2", c_name: "c1", val: 2} as DataObj);
        b1 = await frmdbTStore.getDataObj('B~~b1-b1.1');
        expect(b1).toEqual(jasmine.objectContaining({sum: 5, sum1: 3, count2: 1, b_name: 'b1', b_name2: 'b1.1', x: "x1"}));

    });

    it("should group records", async () => {
        await frmdbEngine.init();

        let a1 = { _id: "A~~1", b_name: 'b1', b_name2: 'b1.1', x: "x1", c_name: "c1", val: 1};
        let a2 = { _id: "A~~2", b_name: 'b1', b_name2: 'b1.1', x: "x1", c_name: "c1", val: 2};
        await putObj(a1);
        await putObj(a2);

        let b1: any = await frmdbTStore.getDataObj('B~~b1-b1.1');
        expect(b1).toEqual(jasmine.objectContaining({sum: 3, sum1: 3, count2: 0, b_name: 'b1', b_name2: 'b1.1', x: "x1"}));

        let c1: any = await frmdbTStore.getDataObj('C~~c1');
        expect(c1).toEqual(jasmine.objectContaining({cnt: 2}));

        
        await putObj({ _id: "A~~", b_name: 'b1', b_name2: 'b1.1', x: "x2", c_name: "c1", val: 2} as DataObj);
        b1 = await frmdbTStore.getDataObj('B~~b1-b1.1');
        expect(b1).toEqual(jasmine.objectContaining({sum: 5, sum1: 3, count2: 1, b_name: 'b1', b_name2: 'b1.1', x: "x1"}));

    });

    // {"objId":"Report_Order_Item~~6525570","aggsViewsUpdates":[],"obsViewsUpdates":[],"oper":"Modify","OLD":{"_id":"Report_Order_Item~~6525570","order_id":"328847","created_at":"2020-07-17T13:18:26.008Z","updated_at":"2020-07-17T13:18:26.009Z","order_state":"PROCESSED_","order_client_code":"CL00128","order_client":"SEPHORA COSMETICS ROMANIA SA","order_address_code":"SP19","order_address_name":"ARAD ATRIUM / 219","order_city":"ARAD","product_code":"PG6060705","barcode":"737052607054","product_name":"BOSS BOTTLED EDT 100 ML TESTER\n","group1":"COTY","group2":"HUGO BOSS ","inventory_code":"MATPLV","quantity":1,"quantity_error":0,"order_actor_code":"413","order_details":"aviz val zero - pub","order_created_at":"2020-07-17T13:18:06.716Z","order_updated_at":"2020-07-17T14:43:10.980Z","stock":50,"reserved_stock":0,"imported_stock":51,"remotely_reserved_stock":1,"nav_shipment_quantity":1,"nav_shipment_no":"20BTY13154","group3":"BOTTLED","group4":"P-TESTERS","product_list_product_id":"6525570","ordered_value":0,"delivered_value_sfa":0,"price":0,"delivered_value_nav":0,"ordered_quantity":1,"order_month":"2020-07"},"NEW":{"_id":"Report_Order_Item~~6525570","order_id":328847,"order_state":"PROCESSED_","order_client_code":"CL00128","order_address_code":"SP19","product_list_product_id":6525570,"inventory_code":"MATPLV","product_code":"PG6060705","ordered_quantity":1,"ordered_value":0,"quantity":1,"delivered_value_sfa":0,"quantity_error":0,"price":0,"order_client":"SEPHORA COSMETICS ROMANIA SA","order_actor_code":"413","order_address":null,"order_address_name":"ARAD ATRIUM / 219","order_city":"ARAD","order_external_id":null,"order_external_param":null,"order_details":"aviz val zero - pub","order_month":"2020-07","order_created_at":"2020-07-17T13:18:06.716Z","order_updated_at":"2020-07-17T14:43:10.980Z","order_wms_id":"520318","order_wms_aviz":"20BTY13154","order_wms_awb":null,"order_wms_statusorderwms":"Pickuit","order_wms_statusawb":null,"order_wms_deliveryaddress":"AUREL VLAICU NR 10-12, ARAD, arad, 310141","order_wms_insertdate":"2020-07-20T08:22:40.327Z","order_wms_imported":null,"order_wms_importdate":null,"order_cargus_link":null,"order_fancourier_link":null,"stock":50,"reserved_stock":0,"imported_stock":51,"remotely_reserved_stock":1,"nav_shipment_quantity":1,"delivered_value_nav":0,"nav_shipment_no":"20BTY13154","barcode":"737052607054","product_name":"BOSS BOTTLED EDT 100 ML TESTER\n","group1":"COTY","group2":"HUGO BOSS ","group3":"BOTTLED","group4":"P-TESTERS","updated_at":"2020-07-17T13:18:26.009Z","created_at":"2020-07-17T13:18:26.008Z","_role":"$ANONYMOUS"}

});

process.on('unhandledRejection', (reason: any, p: any) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason, (reason||{stack: 'no-stack'}).stack);
    // application specific logging, throwing an error, or other logic here
});
