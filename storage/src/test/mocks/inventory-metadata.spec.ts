/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "../../frmdb_engine_store";

import { compileFormula } from '../../formula_compiler';
import { evalExprES5 } from "../../map_reduce_utils";
import { INV__PRD__Location, INV__Receipt__Item, INV__Order__Item } from "./mock-metadata";
import { KeyValueObj } from "../../domain/key_value_obj";
import { ServerEventModifiedFormDataEvent } from "../../domain/event";
import { FrmdbEngine } from "../../frmdb_engine";
import { Schema } from "../../domain/metadata/entity";
import KeyValueStoreFactory from '../../key_value_store_impl_selector';




describe('Inventory Metadata', () => {
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;
    let originalTimeout;

    const InventorySchema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            INV__PRD__Location: INV__PRD__Location,
            INV__Receipt__Item: INV__Receipt__Item,
            INV__Order__Item: INV__Order__Item,
        }
    };

    beforeEach(async (done) => {
        await KeyValueStoreFactory.clearAll();
        frmdbTStore = new FrmdbEngineStore(KeyValueStoreFactory);
        frmdbEngine = new FrmdbEngine(frmdbTStore, InventorySchema);
        await frmdbEngine.init();
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        done();
    });

    async function putObj(obj: KeyValueObj): Promise<ServerEventModifiedFormDataEvent> {
        return await frmdbEngine.processEvent(new ServerEventModifiedFormDataEvent(obj)) as ServerEventModifiedFormDataEvent;
    }

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("Basic stock operations", async (done) => {

        let cf1 = compileFormula(INV__PRD__Location._id, 'received_stock__', INV__PRD__Location.props.received_stock__.formula);
        let cf2 = compileFormula(INV__PRD__Location._id, 'ordered_stock__', INV__PRD__Location.props.ordered_stock__.formula);
        let cf3 = compileFormula(INV__PRD__Location._id, 'available_stock__', INV__PRD__Location.props.available_stock__.formula);

        let pl1 = { _id: "INV__PRD__Location~~1", received_stock__: -1, ordered_stock__: -1, available_stock__: -1};
        await frmdbEngine.putDataObjAndUpdateViews(null, pl1);
        let ri1_1 = { _id: "INV__Receipt__Item~~1__1", productLocationId: "INV__PRD__Location~~1", quantity: 10}; 
        await frmdbEngine.putDataObjAndUpdateViews(null, ri1_1);
        let ri1_2 = { _id: "INV__Receipt__Item~~1__2", productLocationId: "INV__PRD__Location~~1", quantity: 5}; 
        await frmdbEngine.putDataObjAndUpdateViews(null, ri1_2);
        let oi1_1 = { _id: "INV__Order__Item~~1__1", productLocationId: "INV__PRD__Location~~1", quantity: 10};
        await frmdbEngine.putDataObjAndUpdateViews(null, oi1_1);
        let oi1_2 = { _id: "INV__Order__Item~~1__2", productLocationId: "INV__PRD__Location~~1", quantity: 4};

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

        let sum = await frmdbTStore.getAggValueForObserver(pl1, cf1.triggers![0]);
        expect(sum).toEqual(15);
    
        sum = await frmdbTStore.preComputeAggForObserverAndObservable(pl1, ri1_1, ri1_1new, cf1.triggers![0]);
        expect(sum).toEqual(16);
    
        await frmdbEngine.putDataObjAndUpdateViews(ri1_1, ri1_1new);
        pl1.received_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf1.triggers![0])) as number;
        expect(pl1.received_stock__).toEqual(16);

        pl1.ordered_stock__ = (await frmdbTStore.getAggValueForObserver(pl1, cf2.triggers![0])) as number;
        expect(pl1.ordered_stock__).toEqual(10);
        
        let availStock = evalExprES5(pl1, cf3.finalExpression);
        expect(availStock).toEqual(6);

        await frmdbEngine.putDataObjAndUpdateViews(null, oi1_2);
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
        let o: any = await frmdbTStore.getDataObj(oi1_2new._id);
        expect(o.quantity).toEqual(6);
        expect(o.error_quantity).toEqual(4);
        
        done();
    });
});
