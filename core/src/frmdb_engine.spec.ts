/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "./frmdb_engine_store";

import { ServerEventModifiedFormData, ServerEventPreviewFormula, ServerEventDeletedFormData } from "@domain/event";
import { FrmdbEngine } from "./frmdb_engine";
import { Pn, Entity, ScalarFormulaProperty, Schema, EntityProperty, ChildTableProperty, AggregateFormulaProperty } from "@domain/metadata/entity";
import { DataObj } from "@domain/metadata/data_obj";
import { KeyValueObj, KeyValueObjIdType } from "@domain/key_value_obj";
import { getFrmdbEngine, getFrmdbEngineStore, getTestFrmdbEngine } from '@storage/key_value_store_impl_selector';
import { $s2e } from "@functions/s2e";

describe('FrmdbEngine', () => {
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;
    let originalTimeout;

    const _stockReservationSchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            A: {
                _id: 'A', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    b: { name: "b", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    val: { name: "val", propType_: Pn.INPUT, actualType: {name: "NumberType"} },
                    err: { name: "err", propType_: Pn.INPUT, actualType: {name: "NumberType"} },
                    correct_val: { name: "correct_val", propType_: Pn.AUTO_CORRECT, 
                        validationTableName: 'B', validationColName: 'positive_x',
                        targetPropertyName: 'val', scalarFormula: 'MAX(0, val + $ROW$.x__)',
                    },
                    correct_err: { name: "correct_err", propType_: Pn.AUTO_CORRECT, 
                        validationTableName: 'B', validationColName: 'positive_x',
                        targetPropertyName: 'err', scalarFormula: 'ABS($OLD$.val - val)',
                    },
                },
            } as Entity,
            B: {
                _id: 'B', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    sum__: { name: "sum__", propType_: Pn.AGGREGATE_FORMULA, formula: 'SUMIF(A.val, b = @[_id])' } as AggregateFormulaProperty,
                    x__: { name: "x__", propType_: Pn.SCALAR_FORMULA, formula: '100 - sum__' } as ScalarFormulaProperty,
                    positive_x: { name: "positive_x", propType_: Pn.VALIDATE_RECORD, scalarFormula: 'x__ >= 0' }
                },
            } as Entity,
            C: {
                _id: 'C', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    aaaa: {
                        name: 'aaaa',
                        propType_: Pn.CHILD_TABLE,
                        referencedEntityName: 'A',
                    } as ChildTableProperty,
                }
            } as Entity,
        }
    };
    let stockReservationSchema: Schema = _stockReservationSchema;
    const _accountTransferSchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            Tr: {
                _id: 'Tr', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    ac1: { name: "ac1", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    ac2: { name: "ac2", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    val: { name: "val", propType_: Pn.INPUT, actualType: {name: "NumberType"} },
                    correct_val: { name: "correct_val", propType_: Pn.AUTO_CORRECT, 
                        validationTableName: 'Ac', validationColName: 'positive_balance',
                        targetPropertyName: 'val', scalarFormula: '0',
                    },
                    correct_val_max: { name: "correct_val_max", propType_: Pn.AUTO_CORRECT, 
                        validationTableName: 'Ac', validationColName: 'max_balance',
                        targetPropertyName: 'val', scalarFormula: '0',
                    },
                },
            } as Entity,
            Ac: {
                _id: 'Ac', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                    balance__: { name: "balance__", propType_: Pn.SCALAR_FORMULA, formula: '50 + credits - debits' } as ScalarFormulaProperty,
                    credits: { name: "credits", propType_: Pn.AGGREGATE_FORMULA, formula: 'SUMIF(Tr.val, ac2 = @[_id])' } as AggregateFormulaProperty,
                    debits: { name: "debits", propType_: Pn.AGGREGATE_FORMULA, formula: 'SUMIF(Tr.val, ac1 = @[_id])' } as AggregateFormulaProperty,
                    positive_balance: { name: "positive_balance", propType_: Pn.VALIDATE_RECORD, scalarFormula: 'balance__ >= 0' },
                    max_balance: { name: "max_balance", propType_: Pn.VALIDATE_RECORD, scalarFormula: 'balance__ <= 250' },
                },
            } as Entity,
        }
    };
    let accountTransferSchema: Schema = _accountTransferSchema;

    let b1 = { _id: "B~~1", sum__: 1, x__: 7};
    let a1 = { _id: "A~~1", b: 'B~~1', val: 1};
    let a2 = { _id: "A~~2", b: 'B~~1', val: 2};
    async function testDataStockReservationSchema() {
        await frmdbEngine.putDataObjAndUpdateViews(null, b1);
        await frmdbEngine.putDataObjAndUpdateViews(null, a1);
        await frmdbEngine.putDataObjAndUpdateViews(null, a2);
    }

    beforeEach(async () => {
        stockReservationSchema = _.cloneDeep(_stockReservationSchema);
        accountTransferSchema = _.cloneDeep(_accountTransferSchema);

        b1 = { _id: "B~~1", sum__: 1, x__: 7};
        a1 = { _id: "A~~1", b: 'B~~1', val: 1};
        a2 = { _id: "A~~2", b: 'B~~1', val: 2};
    
        frmdbEngine = await getTestFrmdbEngine(stockReservationSchema);
        frmdbTStore = frmdbEngine.frmdbEngineStore;
        await frmdbTStore.kvsFactory.clearAllForTestingPurposes();
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        console.log("frmdbEngine.frmdbEngineStore.mapReduceViews.size=", (frmdbEngine.frmdbEngineStore as any).mapReduceViews.size);
        console.log("stockReservationSchema.entities.B.props.sum__.formula=", (stockReservationSchema as any).entities.B.props.sum__.formula);
        console.log("stockReservationSchema.entities.B.props.x__.formula=", (stockReservationSchema as any).entities.B.props.x__.formula);
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

    it("Should allow basic formulas computation when saving an object with auto-correct", async (done) => {
        await frmdbEngine.init();

        await testDataStockReservationSchema();
        let c = { _id: "C~~c"};
        await frmdbEngine.putDataObjAndUpdateViews(null, c);

        let a3 = { _id: 'A~~c__' as KeyValueObjIdType, b: 'B~~1', val: 2 };
        let ev = await putObj(a3);
        a3._id = ev.obj._id;
        let b1After: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 5, x__: 95}));

        let a4 = { _id: 'A~~c__' as KeyValueObjIdType, b: 'B~~1', val: 3 };
        ev = await putObj(a4);
        a4._id = ev.obj._id;
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 8, x__: 92}));
        
        a2.val = 4;
        await putObj(a2);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 10, x__: 90}));

        ev = await putObj({ _id: 'A~~', b: 'B~~1', val: 95 } as DataObj);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 100, x__: 0}));
        expect(ev.obj['val']).toEqual(90);
        expect(ev.obj['err']).toEqual(5);

        await delObj(ev.obj);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 10, x__: 90}));

        ev = await putObj({ _id: 'A~~', b: 'B~~1', val: 295 } as DataObj);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 100, x__: 0}));
        expect(ev.obj['val']).toEqual(90);
        expect(ev.obj['err']).toEqual(205);

        await delObj(ev.obj);
        await delObj(a2);
        b1After = await frmdbTStore.getDataObj('B~~1');
        let sum = a1.val + a3.val + a4.val;
        expect(b1After).toEqual(jasmine.objectContaining({sum__: sum, x__: 100 - sum}));
        
        await delObj(a1);
        b1After = await frmdbTStore.getDataObj('B~~1');
        sum = a3.val + a4.val;
        expect(b1After).toEqual(jasmine.objectContaining({sum__: sum, x__: 100 - sum}));
        
        await delObj(c);
        b1After = await frmdbTStore.getDataObj('B~~1');
        let mapViewObjs = await (frmdbTStore as any).mapReduceViews.get("asum___A_SUMIF_A_val__b______id__").mapKVS.kvs.all();
        let reduceViewObjs = await (frmdbTStore as any).mapReduceViews.get("asum___A_SUMIF_A_val__b______id__").reduceFunction.kvs.kvs.all();
        expect(mapViewObjs.length).toEqual(0);
        expect(reduceViewObjs.length).toEqual(0);
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 0, x__: 100}));

        done();
    });

    it("Should allow change of _id when using KEY", async () => {
        let schema = _.cloneDeep(_stockReservationSchema);
        schema.entities.A.props.idx = { name: "idx", propType_: Pn.INPUT, actualType: {name: "NumberType"} };
        schema.entities.A.props._id = { name: "_id", propType_: Pn.KEY, 
            scalarFormula: `CONCATENATE(ID(b), "--", idx)`};
        frmdbTStore = await getFrmdbEngineStore(schema);
        frmdbEngine = new FrmdbEngine(frmdbTStore);
        await frmdbEngine.init();

        let b1 = { _id: "B~~1", sum__: 1, x__: 7};
        let a1 = { _id: "A~~1--1", b: 'B~~1', idx: 1, val: 1};
        let a2 = { _id: "A~~1--2", b: 'B~~1', idx: 2, val: 2};
        await frmdbEngine.putDataObjAndUpdateViews(null, b1);
        await frmdbEngine.putDataObjAndUpdateViews(null, a1);
        await frmdbEngine.putDataObjAndUpdateViews(null, a2);
    
        let a3 = { _id: 'A~~', b: 'B~~1', idx: 3, val: 3 };
        await putObj(a3 as DataObj);
        let b1After: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 6, x__: 94}));
        let a3After: any = await frmdbTStore.getDataObj('A~~1--3');
        expect(a3After).toEqual(jasmine.objectContaining({_id: 'A~~1--3', b: 'B~~1', idx: 3, val: 3}));

        //TODO
        // a2.idx = 4;
        // await putObj(a2 as DataObj);
        // b1After = await frmdbTStore.getDataObj('B~~1');
        // expect(b1After).toEqual(jasmine.objectContaining({sum__: 6, x__: 94}));
        // let asAfter: any = await frmdbTStore.getDataObj('A~~1--4');
        // expect(a3After).toEqual(jasmine.objectContaining({_id: 'A~~1--4', b: 'B~~1', idx: 4, val: 2}));
    });

    it("Should allow preview formulas", async (done) => {
        await frmdbEngine.init();
        await testDataStockReservationSchema();

        let a3 = { _id: 'A~~', b: 'B~~1', val: 2 };
        await putObj(a3 as DataObj);
        let b1After: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 5, x__: 95}));

        let ev: ServerEventPreviewFormula = await frmdbEngine.processEventAnonymous({
            _id: 'ABC123',
            type_: "ServerEventPreviewFormula",
            targetEntity: stockReservationSchema.entities['B'],
            targetPropertyName: 'x__',
            formula: '200 - sum__',
            currentDataObj: b1After,
            state_: "BEGIN",
            clientId_: 'ABC'
        }) as ServerEventPreviewFormula;
        expect((ev.currentDataObj as any).x__).toEqual(195);

        let b1Get: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1Get).toEqual(jasmine.objectContaining({sum__: 5, x__: 95}));

        let ev2: ServerEventPreviewFormula = await frmdbEngine.processEventAnonymous({
            _id: 'ABC123',
            type_: "ServerEventPreviewFormula",
            targetEntity: stockReservationSchema.entities['B'],
            targetPropertyName: 'sum__',
            formula: 'SUMIF(A.val, b = @[_id]) + COUNTIF(A.val, b = @[_id])',
            currentDataObj: b1Get,
            state_: "BEGIN",
            clientId_: 'ABC'
        }) as ServerEventPreviewFormula;
        expect((ev2.currentDataObj as any).sum__).toEqual(a1.val + a2.val + a3.val + 3);
        expect((ev2.currentDataObj as any).x__).toEqual(100 - (a1.val + a2.val + a3.val + 3));

        done();
    });

    it("Should allow adding/modifying formulas", async (done) => {
        await frmdbEngine.init();

        await testDataStockReservationSchema();

        let a3 = { _id: 'A~~', b: 'B~~1', val: 2 };
        await putObj(a3 as DataObj);
        let b1After: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 5, x__: 95}));

        let ev: ServerEventPreviewFormula = await frmdbEngine.processEventAnonymous({
            _id: 'ABC123',
            type_: "ServerEventSetProperty",
            targetEntity: frmdbEngine.frmdbEngineStore.schema.entities['B'],
            property: {
                name: 'x__',
                propType_: Pn.SCALAR_FORMULA,
                formula: '200 - sum__',
                returnType_: {name: "NumberType"},
            },
            state_: "BEGIN",
            clientId_: 'ABC'
        }) as ServerEventPreviewFormula;
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 5, x__: 195}));

        let ev2: ServerEventPreviewFormula = await frmdbEngine.processEventAnonymous({
            _id: 'ABC123',
            type_: "ServerEventSetProperty",
            targetEntity: frmdbEngine.frmdbEngineStore.schema.entities['B'],
            property: {
                name: 'sum__',
                propType_: Pn.AGGREGATE_FORMULA,
                formula: 'COUNTIF(A.val, b = @[_id])',
                returnType_: {name: "NumberAggType"},
            },
            state_: "BEGIN",
            clientId_: 'ABC'
        }) as ServerEventPreviewFormula;
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({
            sum__: /*a1.val + a2.val + a3.val + */ 3, 
            x__: 200 - (/*a1.val + a2.val + a3.val +*/ 3)
        }));

        let a4 = { _id: 'A~~', b: 'B~~1', val: 10 };
        await putObj(a4 as DataObj);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({
            sum__: /*a1.val + a2.val + a3.val +*/ 3 + /*a4.val + */ 1, 
            x__: 200 - (/*a1.val + a2.val + a3.val + */ 3 + /*a4.val + */ 1)
        }));

        done();
    });
    
    it("Should update views and compute new values of Observer when Observer field change", async () => {
        let schema = _.cloneDeep(stockReservationSchema);
        schema.entities.B.props.sum = { name: "sum", propType_: Pn.AGGREGATE_FORMULA, formula: 'SUMIF(A.val, b = @[_id])' } as AggregateFormulaProperty,
        schema.entities.B.props.cnt = { name: "cnt", propType_: Pn.AGGREGATE_FORMULA, formula: 'COUNTIF(A.val, b = @[_id])' } as AggregateFormulaProperty,
        (schema.entities.B.props.sum__ as ScalarFormulaProperty).formula = 'sum + cnt';
        (schema.entities.B.props.sum__ as ScalarFormulaProperty).propType_ = Pn.SCALAR_FORMULA;
        frmdbTStore = await getFrmdbEngineStore(schema);
        frmdbEngine = new FrmdbEngine(frmdbTStore);
        await frmdbEngine.init();

        await putObj(b1);
        await putObj(a1);
        await putObj(a2);

        let b1After: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 5, x__: 95}));

    });

    it("Should compute account balance correctly for transfer transactions", async () => {
        frmdbTStore = await getFrmdbEngineStore(accountTransferSchema);
        frmdbEngine = new FrmdbEngine(frmdbTStore);
        await frmdbEngine.init();

        let ac1: any = { _id: "Ac~~1", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac1);
        let ac2: any = { _id: "Ac~~2", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac2);
        let ac3: any = { _id: "Ac~~3", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac3);
        let ac4: any = { _id: "Ac~~4", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac4);

        let workers: Promise<any>[] = [];
        workers.push(putObj({_id: 'Tr~~', ac1: 'Ac~~2', ac2: 'Ac~~3', val: 25} as DataObj));
        workers.push(putObj({_id: 'Tr~~', ac1: 'Ac~~1', ac2: 'Ac~~2', val: 25} as DataObj));
        workers.push(putObj({_id: 'Tr~~', ac1: 'Ac~~3', ac2: 'Ac~~4', val: 25} as DataObj));
        await Promise.all(workers);

        // await putObj({_id: 'Tr~~', ac1: 'Ac~~2', ac2: 'Ac~~3', val: 25} as DataObj)
        // await putObj({_id: 'Tr~~', ac1: 'Ac~~1', ac2: 'Ac~~2', val: 25} as DataObj)
        // await putObj({_id: 'Tr~~', ac1: 'Ac~~3', ac2: 'Ac~~4', val: 25} as DataObj)

        ac1 = await frmdbTStore.getDataObj('Ac~~1');
        ac2 = await frmdbTStore.getDataObj('Ac~~2');
        ac3 = await frmdbTStore.getDataObj('Ac~~3');
        ac4 = await frmdbTStore.getDataObj('Ac~~4');
        expect(ac1).toEqual(jasmine.objectContaining({balance__: 25}));
        expect(ac2).toEqual(jasmine.objectContaining({balance__: 50}));
        expect(ac3).toEqual(jasmine.objectContaining({balance__: 50}));
        expect(ac4).toEqual(jasmine.objectContaining({balance__: 75}));
    });
});

process.on('unhandledRejection', (reason: any, p: any) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason, (reason||{stack: 'no-stack'}).stack);
    // application specific logging, throwing an error, or other logic here
});
