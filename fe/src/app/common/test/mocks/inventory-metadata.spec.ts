/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "../../frmdb_engine_store";
import { KeyValueStorePouchDB, PouchDB } from "../../key_value_store_pouchdb";

import { compileFormula } from "../../formula_compiler";
import { evalExprES5 } from "../../map_reduce_utils";
import { Inventory___Product___Location, Inventory___Receipt___Item, Inventory___Order___Item } from "./mock-metadata";
import { KeyValueObj } from "../../domain/key_value_obj";
import { UserActionEditedFormDataEvent } from "../../domain/event";
import { FrmdbEngine } from "../../frmdb_engine";
import { Schema } from "../../domain/metadata/entity";




describe('Inventory Metadata', () => {
    let dataKVS: KeyValueStorePouchDB;
    let locksKVS: KeyValueStorePouchDB;
    let transactionsKVS: KeyValueStorePouchDB;
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;
    let originalTimeout;

    const InventorySchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            Inventory___Product___Location: Inventory___Product___Location,
            Inventory___Receipt___Item: Inventory___Receipt___Item,
            Inventory___Order___Item: Inventory___Order___Item,
        }
    };

    beforeEach(async (done) => {
        transactionsKVS = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs_tr'));
        dataKVS = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs'));
        locksKVS = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs_lk'));
        await dataKVS.removeAll();
        await locksKVS.removeAll();
        frmdbTStore = new FrmdbEngineStore(transactionsKVS, dataKVS, locksKVS);
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

        let cf1 = compileFormula(Inventory___Product___Location._id, 'received_stock__', Inventory___Product___Location.props.received_stock__.formula);
        let cf2 = compileFormula(Inventory___Product___Location._id, 'ordered_stock__', Inventory___Product___Location.props.ordered_stock__.formula);
        let cf3 = compileFormula(Inventory___Product___Location._id, 'available_stock__', Inventory___Product___Location.props.available_stock__.formula);
        await frmdbTStore.installFormula(cf1);
        await frmdbTStore.installFormula(cf2);
        await frmdbTStore.installFormula(cf3);

        let pl1 = { _id: "Inventory___Product___Location~~1", received_stock__: -1, ordered_stock__: -1, available_stock__: -1};
        await frmdbTStore.kvs().put(pl1);
        let ri1_1 = { _id: "Inventory___Receipt___Item~~11", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1"}, quantity: 10}; 
        await frmdbTStore.kvs().put(ri1_1);
        let ri1_2 = { _id: "Inventory___Receipt___Item~~12", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1"}, quantity: 5}; 
        await frmdbTStore.kvs().put(ri1_2);
        let oi1_1 = { _id: "Inventory___Order___Item~~11", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1"}, quantity: 10};
        await frmdbTStore.kvs().put(oi1_1);
        let oi1_2 = { _id: "Inventory___Order___Item~~12", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1"}, quantity: 4};

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
        let tmp = await frmdbTStore.mapReduceQuery(aggsViewName, {
            startkey: [null],
            endkey: ["\ufff0"],
            inclusive_start: false,
            inclusive_end: false,
            reduce: false,
        });
        let designDocs = await frmdbTStore.kvs().range('_design/', '_design0', false);

        let sum = await frmdbTStore.getAggValueForObserver(pl1, cf1.triggers![0]);
        expect(sum).toEqual(15);
    
        sum = await frmdbTStore.preComputeAggForObserverAndObservable(pl1, ri1_1, ri1_1new, cf1.triggers![0]);
        expect(sum).toEqual(16);
    
        await frmdbTStore.kvs().put(ri1_1new);
        pl1.received_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf1.triggers![0])) as number;
        expect(pl1.received_stock__).toEqual(16);

        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(10);
        
        let availStock = evalExprES5(pl1, cf3.rawExpr);
        expect(availStock).toEqual(6);

        await frmdbTStore.kvs().put(oi1_2);
        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(14);
        
        availStock = evalExprES5(pl1, cf3.rawExpr);
        expect(availStock).toEqual(2);

        // check auto-correction
        let oi1_2new = _.cloneDeep(oi1_2);
        oi1_2new.quantity = 10;
        await putObj(ri1_1new);
        await putObj(oi1_2new);
        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(16);
        availStock = evalExprES5(pl1, cf3.rawExpr);
        expect(availStock).toEqual(0);
        let o: any = await frmdbTStore.kvs().get(oi1_2new._id);
        expect(o.quantity).toEqual(6);
        expect(o.error_quantity).toEqual(4);
        
        done();

    });
    
});