import * as _ from 'lodash';

import { KeyValueStoreArrayKeys, KeyValueStoreFactoryI, RangeQueryOptsArrayKeysI, KVSArrayKeyType, KeyValueStoreI } from "./key_value_store_i";
import { MapFunctionT } from "./domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { KeyValueObj } from './domain/key_value_obj';
import { ReduceFun, SumReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, TextjoinReduceFun, CountReduceFun } from './domain/metadata/reduce_functions';


export interface MapReduceViewUpdates<VALUET> {
    map: { key: KVSArrayKeyType, value: VALUET }[],
    mapDelete: KVSArrayKeyType[],
    reduce: { key: KVSArrayKeyType, value: VALUET }[];
}

type ReduceFunction =
    | SumReduceFunction
    | CountReduceFunction
    | TextjoinReduceFunction
    ;

class SumReduceFunction implements SumReduceFun {
    readonly name = "SumReduceFunN";
    readonly defaultValue = 0;
    constructor(reduceFun: SumReduceFun, public kvs: KeyValueStoreArrayKeys<number>) {

    }
}

class CountReduceFunction implements CountReduceFun {
    readonly name = "CountReduceFunN";
    readonly defaultValue = 0;
    constructor(reduceFun: CountReduceFun, public kvs: KeyValueStoreArrayKeys<number>) {

    }
}

class TextjoinReduceFunction implements TextjoinReduceFun {
    readonly name = "TextjoinReduceFunN";
    readonly defaultValue = '';
    delimiter: string;
    constructor(reduceFun: TextjoinReduceFun, public kvs: KeyValueStoreArrayKeys<string>) {
        this.delimiter = reduceFun.delimiter;
    }
}


export class MapReduceView {
    private mapKVS: KeyValueStoreArrayKeys<any>;
    private reduceFunction: ReduceFunction | null;
    constructor(
        private kvsFactory: KeyValueStoreFactoryI,
        private viewName: string,
        private map: MapFunctionT,
        private use$ROW$?: boolean,
        reduceFun?: ReduceFun
    ) {
        if (!reduceFun) {
            this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<any>(null));
            this.reduceFunction = null;
        } else {
            switch (reduceFun.name) {
                case SumReduceFunN:
                    this.reduceFunction = new SumReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(0)));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(this.reduceFunction.defaultValue));
                    break;
                case CountReduceFunN:
                    this.reduceFunction = new CountReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(0)));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(this.reduceFunction.defaultValue));
                    break;
                case TextjoinReduceFunN:
                    this.reduceFunction = new TextjoinReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<string>('')));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<string>(this.reduceFunction.defaultValue));
                    break;
            }

        }
    }

    private _mapQuery<T>(kvs: KeyValueStoreArrayKeys<T>, queryOpts: Partial<RangeQueryOptsArrayKeysI>) {
        return kvs.rangeQuery({
            ...queryOpts,
            startkey: queryOpts.startkey || [],
            endkey: queryOpts.endkey || ["\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0"],
        });
    }

    public mapQueryWithKeys<T>(queryOpts: Partial<RangeQueryOptsArrayKeysI>) {
        return this.mapKVS.rangeQueryWithKeys({
            ...queryOpts,
            startkey: queryOpts.startkey || [],
            endkey: queryOpts.endkey || ["\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0", "\ufff0"],
        });
    }

    public mapQuery<T>(queryOpts: Partial<RangeQueryOptsArrayKeysI>): Promise<T[]> {
        return this._mapQuery<T>(this.mapKVS, queryOpts);
    }

    public reduceQuery(queryOpts: Partial<RangeQueryOptsArrayKeysI>): Promise<string | number> {
        if (!this.reduceFunction) throw new Error("Reduce called on a map view " + this.viewName + "; " + JSON.stringify(this.map) + ";" + this.reduceFunction);
        let reduceFunction = this.reduceFunction;
        let viewName = this.viewName;

        return this._mapQuery<string | number>(reduceFunction.kvs, queryOpts)
            .then(rows => {
                return rows.reduce((acc, current) => {
                    if (SumReduceFunN === reduceFunction.name) {
                        if (typeof acc !== 'number' || typeof current !== 'number') throw new Error('View ' + viewName + ' _sum accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + current;
                    } else if (CountReduceFunN === reduceFunction.name) {
                        if (typeof acc !== 'number' || typeof current !== 'number') throw new Error('View ' + viewName + ' _count accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + 1;
                    } else if (TextjoinReduceFunN === reduceFunction.name) {
                        return acc + reduceFunction.delimiter + current;
                    } else {
                        throw new Error('Unknown reduce function ' + reduceFunction);
                    }

                }, reduceFunction.defaultValue);
            });
    }

    private preComputeMap<T extends (string | number)>(oldObj: KeyValueObj | null, newObj: KeyValueObj, valueExample: T | null): { ret: MapReduceViewUpdates<T>, newMapKey: KVSArrayKeyType, newMapValue: T, oldMapKey: KVSArrayKeyType | null, oldMapValue: T | null } {
        let viewName = this.viewName;
        if (oldObj && oldObj._id !== newObj._id) throw new Error("Unexpected view update for different objects " + oldObj._id + " !==  " + newObj._id);

        let ret: MapReduceViewUpdates<T> = { map: [], mapDelete: [], reduce: [] };
        let newMapKey = this.use$ROW$ ? evalExprES5({ $ROW$: newObj }, this.map.keyExpr) : evalExprES5(newObj, this.map.keyExpr);
        if (!(newMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewName, newMapKey }));

        let newMapValue: T = this.use$ROW$ ? evalExprES5({ $ROW$: newObj }, this.map.valueExpr) : evalExprES5(newObj, this.map.valueExpr);
        if (valueExample != null && typeof newMapValue !== typeof valueExample) throw new Error("newMapValue with incorrect type found " + JSON.stringify({ viewName, newMapKey, newMapValue }));

        ret.map.push({ key: newMapKey.concat([newObj._id]), value: newMapValue });

        let oldMapKey = null;
        let oldMapValue = null;

        if (oldObj) {

            let oldMapKey = this.use$ROW$ ? evalExprES5({ $ROW$: oldObj }, this.map.keyExpr) : evalExprES5(oldObj, this.map.keyExpr);
            if (!(oldMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewName, oldMapKey }));

            let oldMapValue = this.use$ROW$ ? evalExprES5({ $ROW$: oldObj }, this.map.valueExpr) : evalExprES5(oldObj, this.map.valueExpr);
            if (typeof oldMapValue !== typeof valueExample) throw new Error("oldMapValue with incorrect type found " + JSON.stringify({ viewName, newMapKey, newMapValue, oldMapKey, oldMapValue }));
        }

        return { ret, newMapKey, newMapValue, oldMapKey, oldMapValue };
    }

    /**
     * @returns List of keys updated
     */
    public async preComputeViewUpdateForObj(oldObj: KeyValueObj | null, newObj: KeyValueObj): Promise<MapReduceViewUpdates<string | number>> {
        let rFun = this.reduceFunction;
        if (!rFun) {
            let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue } = this.preComputeMap(oldObj, newObj, null);
            return ret;
        } else {

            if (SumReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue } = this.preComputeMap<number>(oldObj, newObj, rFun.defaultValue);
                let newReduceValue = await rFun.kvs.get(newMapKey) || rFun.defaultValue;
                if (null != oldMapKey && null != oldMapValue) {
                    let oldReduceValue = await rFun.kvs.get(oldMapKey) || rFun.defaultValue;
                    if (_.isEqual(oldMapKey, newMapKey)) {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - oldMapValue + newMapValue });
                    } else {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - oldMapValue });
                        ret.reduce.push({ key: newMapKey, value: newReduceValue + newMapValue });
                    }
                } else {
                    ret.reduce.push({ key: newMapKey, value: newReduceValue + newMapValue });
                }
                return ret;
            } else if (CountReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue } = this.preComputeMap<number>(oldObj, newObj, rFun.defaultValue);
                let newReduceValue = await rFun.kvs.get(newMapKey) || rFun.defaultValue;
                if (null != oldMapKey && null != oldMapValue) {
                    let oldReduceValue = await rFun.kvs.get(oldMapKey) || rFun.defaultValue;
                    if (_.isEqual(oldMapKey, newMapKey)) {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - 1 + 1 });
                    } else {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - 1 });
                        ret.reduce.push({ key: newMapKey, value: newReduceValue + 1 });
                    }
                } else {
                    ret.reduce.push({ key: newMapKey, value: newReduceValue + 1 });
                }
                return ret;
            } else if (TextjoinReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue } = this.preComputeMap(oldObj, newObj, rFun.defaultValue);
                let newReduceValue = await rFun.kvs.get(newMapKey) || rFun.defaultValue;
                //WARNING: this reduce precomputation works only for unique keys
                ret.reduce.push({ key: newMapKey, value: newMapValue });
                return ret;
            } else {
                throw new Error('Unknown reduce function ' + this.reduceFunction);
            }
        }
    }

    public async updateViewForObj(updates: MapReduceViewUpdates<string | number>) {
        for (let upd of updates.map) {
            await this.mapKVS.set(upd.key, upd.value);
        }
        for (let key of updates.mapDelete) {
            await this.mapKVS.del(key);
        }
        if (this.reduceFunction) {
            for (let upd of updates.reduce) {
                if ((SumReduceFunN === this.reduceFunction.name && typeof upd.value === 'number')
                    || (CountReduceFunN === this.reduceFunction.name && typeof upd.value === 'number')
                ) {
                    await this.reduceFunction.kvs.set(upd.key, upd.value);
                } else if (TextjoinReduceFunN === this.reduceFunction.name && typeof upd.value === 'string') {
                    await (this.reduceFunction.kvs as any /*wtf*/).set(upd.key, upd.value);
                }
            }
        }
    }

    public getStringKeysForUpdates(updates: { key: any[], value: any }[]): string[] {
        return updates.map(u => this.mapKVS.id2str(u.key));
    }

}
