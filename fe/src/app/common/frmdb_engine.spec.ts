/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "./frmdb_lodash";
import { FrmdbEngineStore } from "./frmdb_engine_store";
import { KeyObjStoreI } from "./key_value_store_i";

import { UserActionEditedFormDataN, UserActionEditedFormDataEvent } from "./domain/event";
import { Fn } from "./domain/metadata/functions";
import { MapFunctionN, CompiledFormula } from "./domain/metadata/execution_plan";
import { compileFormula, $s2e } from "./formula_compiler";
import { FrmdbEngine } from "./frmdb_engine";
import { Pn, Entity, FormulaProperty, Schema } from "./domain/metadata/entity";
import { SchemaDAO } from "./domain/metadata/schema_dao";
import { DataObj } from "./domain/metadata/data_obj";
import { KeyValueObj } from "./domain/key_value_obj";
import { KeyValueStoreMem, KeyValueStoreFactoryMem } from "./key_value_store_mem";

describe('FrmdbEngine', () => {
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;
    let originalTimeout;

    const stockReservationSchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            A: {
                _id: 'A', props: {
                    b: { name: "b", propType_: Pn.STRING },
                    val: { name: "val", propType_: Pn.NUMBER },
                    err: { name: "val", propType_: Pn.NUMBER },
                },
                autoCorrectionsOnValidationFailed: {
                    'B!positiveX': [
                        {targetPropertyName: 'val', autoCorrectExpr: $s2e('MAX(0, val + $ROW$.x__)')},
                        {targetPropertyName: 'err', autoCorrectExpr: $s2e('ABS($OLD$.val - val)')},
                    ],
                },
            } as Entity,
            B: {
                _id: 'B', props: {
                    sum__: { name: "sum__", propType_: Pn.FORMULA, formula: 'SUMIF(A.val, b == @[_id])' } as FormulaProperty,
                    x__: { name: "x__", propType_: Pn.FORMULA, formula: '100 - sum__' } as FormulaProperty,
                },  
                validations: {
                    positiveX: { conditionExpr: $s2e('x__ >= 0') }
                },
            } as Entity,
        }
    };
    const accountTransferSchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            Tr: {
                _id: 'Tr', props: {
                    ac1: { name: "ac1", propType_: Pn.STRING },
                    ac2: { name: "ac2", propType_: Pn.STRING },
                    val: { name: "val", propType_: Pn.NUMBER },
                },
                autoCorrectionsOnValidationFailed: {
                    'Ac!positiveBalance': [{targetPropertyName: 'val', autoCorrectExpr: $s2e('0')}],
                    'Ac!maxBalance': [{targetPropertyName: 'val', autoCorrectExpr: $s2e('0')}],
                }
            } as Entity,
            Ac: {
                _id: 'Ac', props: {
                    balance__: { name: "balance__", propType_: Pn.FORMULA, formula: '50 + SUMIF(Tr.val, ac2 == @[_id]) - SUMIF(Tr.val, ac1 == @[_id])' } as FormulaProperty,
                },
                validations: {
                    positiveBalance: { conditionExpr: $s2e('balance__ >= 0') },
                    maxBalance: { conditionExpr: $s2e('balance__ <= 250') },
                },
            } as Entity,
        }
    };

    beforeEach(async (done) => {
        frmdbTStore = new FrmdbEngineStore(new KeyValueStoreFactoryMem());
        frmdbEngine = new FrmdbEngine(frmdbTStore, stockReservationSchema);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 55000;
        done();
    });

    async function putObj(obj: KeyValueObj): Promise<UserActionEditedFormDataEvent> {
        return await frmdbEngine.processEvent(new UserActionEditedFormDataEvent(obj)) as UserActionEditedFormDataEvent;
    }

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    
    async function parallelWorker(workerId, val) {
        await putObj({ _id: 'A~~', b: 'B~~1', val: val } as DataObj);
    }

    it("Should allow basic formulas computation when saving an object with auto-correct", async (done) => {
        await frmdbEngine.init();

        let b1 = { _id: "B~~1", sum__: 1, x__: 7};
        await frmdbEngine.putDataObjAndUpdateViews(null, b1);
        let a1 = { _id: "A~~1", b: 'B~~1', val: 1};
        await frmdbEngine.putDataObjAndUpdateViews(null, a1);
        let a2 = { _id: "A~~2", b: 'B~~1', val: 2};
        await frmdbEngine.putDataObjAndUpdateViews(null, a2);

        await putObj({ _id: 'A~~', b: 'B~~1', val: 2 } as DataObj);
        let b1After: any = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 5, x__: 95}));

        await putObj({ _id: 'A~~', b: 'B~~1', val: 3 } as DataObj);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 8, x__: 92}));
        
        a2.val = 4;
        await putObj(a2);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 10, x__: 90}));

        let ev = await putObj({ _id: 'A~~', b: 'B~~1', val: 95 } as DataObj);
        b1After = await frmdbTStore.getDataObj('B~~1');
        expect(b1After).toEqual(jasmine.objectContaining({sum__: 100, x__: 0}));
        expect(ev.obj['val']).toEqual(90);

        done();
    });

    for (let TestRun = 1; TestRun <= 1; TestRun++) {

        it("Should allow consistent concurrent transactions " + TestRun, async (done) => {
            await frmdbEngine.init();

            let b1 = { _id: "B~~1", sum__: 1, x__: 7};
            await frmdbEngine.putDataObjAndUpdateViews(null, b1);
            let a1 = { _id: "A~~1", b: 'B~~1', val: 1};
            await frmdbEngine.putDataObjAndUpdateViews(null, a1);
            let a2 = { _id: "A~~2", b: 'B~~1', val: 2};
            await frmdbEngine.putDataObjAndUpdateViews(null, a2);

            let workers: Promise<void>[] = [];
            for (var i = 0; i < 10; i++) {
                workers.push(parallelWorker(i, 2));
            }
            await Promise.all(workers);

            let b1After: any = await frmdbTStore.getDataObj('B~~1');
            expect(b1After).toEqual(jasmine.objectContaining({sum__: 23, x__: 77}));
            
            done();
        });

        it("Should allow consistent concurrent transactions with auto-correct (stock reservation) " + TestRun, async (done) => {
            await frmdbEngine.init();

            let b1 = { _id: "B~~1", sum__: 1, x__: 7};
            await frmdbEngine.putDataObjAndUpdateViews(null, b1);

            let workers: Promise<void>[] = [];
            for (var i = 0; i < 10; i++) {
                workers.push(parallelWorker(i, 40));
            }
            await Promise.all(workers);

            let b1After: any = await frmdbTStore.getDataObj('B~~1');
            expect(b1After).toEqual(jasmine.objectContaining({sum__: 100, x__: 0}));
            
            done();
        });

        it("Should allow consistent concurrent transactions with auto-correct (account balance transfer) " + TestRun, async (done) => {
            frmdbEngine = new FrmdbEngine(frmdbTStore, accountTransferSchema);
            await frmdbEngine.init();

            let ac1: any = { _id: "Ac~~1", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac1);
            let ac2: any = { _id: "Ac~~2", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac2);
            let ac3: any = { _id: "Ac~~3", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac3);
            let ac4: any = { _id: "Ac~~4", balance__: 123}; await frmdbEngine.putDataObjAndUpdateViews(null, ac4);

            let workers: Promise<any>[] = [];
            for (var i = 0; i < 10; i++) {
                workers.push(putObj({_id: 'Tr~~', ac1: 'Ac~~2', ac2: 'Ac~~3', val: 25} as DataObj));
                workers.push(putObj({_id: 'Tr~~', ac1: 'Ac~~1', ac2: 'Ac~~2', val: 25} as DataObj));
                workers.push(putObj({_id: 'Tr~~', ac1: 'Ac~~3', ac2: 'Ac~~4', val: 25} as DataObj));
            }
            await Promise.all(workers);

            ac1 = await frmdbTStore.getDataObj('Ac~~1');
            ac2 = await frmdbTStore.getDataObj('Ac~~2');
            ac3 = await frmdbTStore.getDataObj('Ac~~3');
            ac4 = await frmdbTStore.getDataObj('Ac~~4');
            expect(ac1).toEqual(jasmine.objectContaining({balance__: 0}));
            expect(ac2).toEqual(jasmine.objectContaining({balance__: 0}));
            expect(ac3).toEqual(jasmine.objectContaining({balance__: 0}));
            expect(ac4).toEqual(jasmine.objectContaining({balance__: 200}));
            done();
        });
    } 
});

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason, (reason||{stack: 'no-stack'}).stack);
    // application specific logging, throwing an error, or other logic here
});
