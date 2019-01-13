/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "../../frmdb_engine_store";
import { KeyValueStoreBase } from "../../key_value_store_i";

import { compileFormula } from "../../formula_compiler";
import { evalExprES5 } from "../../map_reduce_utils";
import { INV___PRD___Location, INV___Receipt___Item, INV___Order___Item } from "./mock-metadata";
import { KeyValueObj } from "../../domain/key_value_obj";
import { UserActionEditedFormDataEvent } from "../../domain/event";
import { FrmdbEngine } from "../../frmdb_engine";
import { Schema } from "../../domain/metadata/entity";
import { KeyValueStoreMem } from "../../key_value_store_mem";




describe('Inventory Metadata', () => {
    let dataKVS: KeyValueStoreBase;
    let locksKVS: KeyValueStoreBase;
    let mapReduceKVS: KeyValueStoreBase;
    let transactionsKVS: KeyValueStoreBase;
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;
    let originalTimeout;

    const InventorySchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            INV___PRD___Location: INV___PRD___Location,
            INV___Receipt___Item: INV___Receipt___Item,
            INV___Order___Item: INV___Order___Item,
        }
    };

    beforeEach(async (done) => {
        transactionsKVS = new KeyValueStoreMem();
        dataKVS = new KeyValueStoreMem();
        mapReduceKVS = new KeyValueStoreMem();
        locksKVS = new KeyValueStoreMem();
        await dataKVS.clearDB();
        await locksKVS.clearDB();
        frmdbTStore = new FrmdbEngineStore(transactionsKVS, dataKVS, mapReduceKVS, locksKVS);
        frmdbEngine = new FrmdbEngine(frmdbTStore, InventorySchema);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        done();
    });

    async function putObj(obj: KeyValueObj): Promise<UserActionEditedFormDataEvent> {
        return await frmdbEngine.processEvent(new UserActionEditedFormDataEvent(obj)) as UserActionEditedFormDataEvent;
    }

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("Basic stock operations", async (done) => {

        let cf1 = compileFormula(INV___PRD___Location._id, 'received_stock__', INV___PRD___Location.props.received_stock__.formula);
        let cf2 = compileFormula(INV___PRD___Location._id, 'ordered_stock__', INV___PRD___Location.props.ordered_stock__.formula);
        let cf3 = compileFormula(INV___PRD___Location._id, 'available_stock__', INV___PRD___Location.props.available_stock__.formula);

        let pl1 = { _id: "INV___PRD___Location~~1", received_stock__: -1, ordered_stock__: -1, available_stock__: -1};
        await frmdbTStore.kvs().put(pl1);
        let ri1_1 = { _id: "INV___Receipt___Item~~11", productLocationId: "INV___PRD___Location~~1", quantity: 10}; 
        await frmdbTStore.kvs().put(ri1_1);
        let ri1_2 = { _id: "INV___Receipt___Item~~12", productLocationId: "INV___PRD___Location~~1", quantity: 5}; 
        await frmdbTStore.kvs().put(ri1_2);
        let oi1_1 = { _id: "INV___Order___Item~~11", productLocationId: "INV___PRD___Location~~1", quantity: 10};
        await frmdbTStore.kvs().put(oi1_1);
        let oi1_2 = { _id: "INV___Order___Item~~12", productLocationId: "INV___PRD___Location~~1", quantity: 4};

        let obs = await frmdbTStore.getObserversOfObservable(ri1_1, cf1.triggers![0]);
        expect(obs[0]).toEqual(pl1);
        obs = await frmdbTStore.getObserversOfObservable(ri1_2, cf1.triggers![0]);
        expect(obs[0]).toEqual(pl1);
        obs = await frmdbTStore.getObserversOfObservable(oi1_1, cf2.triggers![0]);
        expect(obs[0]).toEqual(pl1);
        
        let ri1_1new = _.cloneDeep(ri1_1);
        ri1_1new.quantity = 11;

        obs = await frmdbTStore.getObserversOfObservableOldAndNew(ri1_1, ri1_1new, cf1.triggers![0]);
        expect(obs[0]).toEqual(pl1);
        expect(obs.length).toEqual(1);

        let aggsViewName = cf2.triggers![0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName;
        let tmp = await frmdbTStore.reduceQuery(aggsViewName, {
            startkey: [null],
            endkey: ["\ufff0"],
            inclusive_start: false,
            inclusive_end: false,
            reduce: false,
        });

        let sum = await frmdbTStore.getAggValueForObserver(pl1, cf1.triggers![0]);
        expect(sum).toEqual(15);
    
        sum = await frmdbTStore.preComputeAggForObserverAndObservable(pl1, ri1_1, ri1_1new, cf1.triggers![0]);
        expect(sum).toEqual(16);
    
        await frmdbTStore.kvs().put(ri1_1new);
        pl1.received_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf1.triggers![0])) as number;
        expect(pl1.received_stock__).toEqual(16);

        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(10);
        
        let availStock = evalExprES5(pl1, cf3.finalExpression);
        expect(availStock).toEqual(6);

        await frmdbTStore.kvs().put(oi1_2);
        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(14);
        
        availStock = evalExprES5(pl1, cf3.finalExpression);
        expect(availStock).toEqual(2);

        // check auto-correction
        let oi1_2new = _.cloneDeep(oi1_2);
        oi1_2new.quantity = 10;
        await putObj(ri1_1new);
        await putObj(oi1_2new);
        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(16);
        availStock = evalExprES5(pl1, cf3.finalExpression);
        expect(availStock).toEqual(0);
        let o: any = await frmdbTStore.kvs().get(oi1_2new._id);
        expect(o.quantity).toEqual(6);
        expect(o.error_quantity).toEqual(4);
        
        done();

    });
    
});
