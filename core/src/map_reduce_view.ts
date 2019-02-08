import * as _ from 'lodash';

import { KeyValueStoreArrayKeys, KeyValueStoreFactoryI, RangeQueryOptsArrayKeysI, KVSArrayKeyType, kvsKey2Str } from "./key_value_store_i";
import { MapFunctionT } from "@core/domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { KeyValueObj } from '@core/domain/key_value_obj';
import { ReduceFun, SumReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, TextjoinReduceFun, CountReduceFun } from "@core/domain/metadata/reduce_functions";
import { MINCHAR, MAXCHAR } from './utils/collator';


export interface MapViewUpdates<VALUET> {
    viewName: string;
    map: { key: KVSArrayKeyType, value: VALUET }[];
    mapDelete: KVSArrayKeyType[];
}
export interface MapReduceViewUpdates<VALUET> extends MapViewUpdates<VALUET> {
    reduce: { key: KVSArrayKeyType, value: VALUET }[];
    reduceDelete: KVSArrayKeyType[];
}

export function isReduce<VALUET>(v: MapViewUpdates<VALUET> | MapReduceViewUpdates<VALUET>): v is MapReduceViewUpdates<VALUET> {
    return 'reduce' in v;
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
            this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<any>(viewName + '-map', null));
            this.reduceFunction = null;
        } else {
            switch (reduceFun.name) {
                case SumReduceFunN:
                    this.reduceFunction = new SumReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewName + '-reduce', 0)));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewName + '-map', this.reduceFunction.defaultValue));
                    break;
                case CountReduceFunN:
                    this.reduceFunction = new CountReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewName + '-reduce', 0)));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewName + '-map', this.reduceFunction.defaultValue));
                    break;
                case TextjoinReduceFunN:
                    this.reduceFunction = new TextjoinReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<string>(viewName + '-reduce', '')));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<string>(viewName + '-map', this.reduceFunction.defaultValue));
                    break;
            }

        }
    }

    private _rangeQuery<T>(kvs: KeyValueStoreArrayKeys<T>, queryOpts: Partial<RangeQueryOptsArrayKeysI>) {
        return kvs.rangeQuery({
            ...queryOpts,
            startkey: queryOpts.startkey || [],
            endkey: queryOpts.endkey || [MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR],
        });
    }

    public mapQueryWithKeys<T>(queryOpts: Partial<RangeQueryOptsArrayKeysI>) {
        return this.mapKVS.rangeQueryWithKeys({
            ...queryOpts,
            startkey: queryOpts.startkey || [],
            endkey: queryOpts.endkey ? queryOpts.endkey.concat(queryOpts.inclusive_end ? MAXCHAR : MINCHAR) 
                : [MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR, MAXCHAR],
        }).then(res => {
            if (queryOpts.inclusive_start && queryOpts.inclusive_end) {
                return res;
            } else {
                //When we store the map values in the KVS we append the objectId to the key 
                //  so we can have multiple values for the same key
                //  when inclusive_start=false or inclusive_end=false we need to pop this objectId and make the comparison with the input keys
                return res.filter(x => {
                    let isStart = _.isEqual(MapReduceView.extractOriginalMapKey(x._id), queryOpts.startkey);
                    let isEnd = _.isEqual(MapReduceView.extractOriginalMapKey(x._id), queryOpts.endkey);
                    return (!isStart && !isEnd) || (isStart && queryOpts.inclusive_start) || (isEnd && queryOpts.inclusive_end);
                });
            }
        });
    }

    public mapRangeQuery<T>(queryOpts: Partial<RangeQueryOptsArrayKeysI>): Promise<T[]> {
        return this._rangeQuery<T>(this.mapKVS, queryOpts);
    }

    public mapQuery<T>(queryOpts: Partial<RangeQueryOptsArrayKeysI>): Promise<T[]> {
        return this.mapQueryWithKeys<T>(queryOpts)
        .then(res => res.map(x => x.val));
    }

    public reduceQuery(queryOpts: Partial<RangeQueryOptsArrayKeysI>): Promise<string | number> {
        if (!this.reduceFunction) throw new Error("Reduce called on a map view " + this.viewName + "; " + JSON.stringify(this.map) + ";" + this.reduceFunction);
        let reduceFunction = this.reduceFunction;
        let viewName = this.viewName;

        return this._rangeQuery<string | number>(reduceFunction.kvs, queryOpts)
            .then(rows => {
                return rows.reduce((acc, current, idx) => {
                    if (SumReduceFunN === reduceFunction.name) {
                        if (typeof acc !== 'number' || typeof current !== 'number') throw new Error('View ' + viewName + ' _sum accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + current;
                    } else if (CountReduceFunN === reduceFunction.name) {
                        if (typeof acc !== 'number' || typeof current !== 'number') throw new Error('View ' + viewName + ' _count accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + current;//this is "re-reduce" we must sum the counts from the reduce values per each key
                    } else if (TextjoinReduceFunN === reduceFunction.name) {
                        if (0 == idx && acc == '') return current;
                        return acc + reduceFunction.delimiter + current;
                    } else {
                        throw new Error('Unknown reduce function ' + reduceFunction);
                    }

                }, reduceFunction.defaultValue);
            });
    }

    /** We need to allow multiple map values for the same key */
    public static makeUniqueMapKey(key: KVSArrayKeyType, obj: KeyValueObj) {
        return key.concat(obj._id);
    }
    /** we need to pop the objectId to get the original map key */
    public static extractOriginalMapKey(key: KVSArrayKeyType) {
        return key.slice(0, -1);
    }
    public static extractObjIdFromMapKey(key: KVSArrayKeyType): string {
        return key.pop() + '';
    }

    private async preComputeMap<T extends (string | number)>(oldObj: KeyValueObj | null, newObj: KeyValueObj, valueExample: T | null): Promise<{ ret: MapReduceViewUpdates<T>, newMapKey: KVSArrayKeyType, newMapValue: T, oldMapKey: KVSArrayKeyType | null, oldMapValue: T | null, otherMapValueWithOldKeyExist: boolean | null }> {
        let viewName = this.viewName;
        if (oldObj && oldObj._id !== newObj._id) throw new Error("Unexpected view update for different objects " + oldObj._id + " !==  " + newObj._id);

        let ret: MapReduceViewUpdates<T> = { viewName: viewName, map: [], mapDelete: [], reduce: [], reduceDelete: [] };
        let newMapKey = this.use$ROW$ ? evalExprES5({ $ROW$: newObj }, this.map.keyExpr) : evalExprES5(newObj, this.map.keyExpr);
        if (!(newMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewName, newMapKey }));

        let newMapValue: T = this.use$ROW$ ? evalExprES5({ $ROW$: newObj }, this.map.valueExpr) : evalExprES5(newObj, this.map.valueExpr);
        if (valueExample != null && typeof newMapValue !== typeof valueExample) throw new Error("newMapValue with incorrect type found " + JSON.stringify({ viewName, newMapKey, newMapValue }));

        //In order to allow multiple map values for the same key we need to append the objectId to the key
        ret.map.push({ key: MapReduceView.makeUniqueMapKey(newMapKey, newObj), value: newMapValue });

        let oldMapKey: KVSArrayKeyType | null = null;
        let oldMapValue: T | null = null;
        let otherMapValueWithOldKeyExist = true;

        if (oldObj) {

            oldMapKey = this.use$ROW$ ? evalExprES5({ $ROW$: oldObj }, this.map.keyExpr) : evalExprES5(oldObj, this.map.keyExpr);
            if (!(oldMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewName, oldMapKey }));

            oldMapValue = this.use$ROW$ ? evalExprES5({ $ROW$: oldObj }, this.map.valueExpr) : evalExprES5(oldObj, this.map.valueExpr);
            if (valueExample != null && typeof oldMapValue !== typeof valueExample) throw new Error("oldMapValue with incorrect type found " + JSON.stringify({ viewName, newMapKey, newMapValue, oldMapKey, oldMapValue }));

            let otherMapValuesWithOldKey = await this.mapKVS.rangeQueryWithKeys({
                startkey: oldMapKey,
                endkey: oldMapKey.concat('\ufff0')
            });
            otherMapValueWithOldKeyExist = otherMapValuesWithOldKey.length > 1;

            if (!_.isEqual(oldMapKey, newMapKey)) {
                ret.mapDelete.push(MapReduceView.makeUniqueMapKey(oldMapKey, oldObj));
            }
        }

        return { ret, newMapKey, newMapValue, oldMapKey, oldMapValue, otherMapValueWithOldKeyExist };
    }

    /**
     * @returns List of keys updated
     */
    public async preComputeViewUpdateForObj(oldObj: KeyValueObj | null, newObj: KeyValueObj): Promise<MapReduceViewUpdates<string | number>> {
        let rFun = this.reduceFunction;
        if (!rFun) {
            let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue } = await this.preComputeMap(oldObj, newObj, null);
            return ret;
        } else {

            if (SumReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue, otherMapValueWithOldKeyExist } = 
                    await this.preComputeMap<number>(oldObj, newObj, rFun.defaultValue);
                let newReduceValue = await rFun.kvs.get(newMapKey) || rFun.defaultValue;
                if (null != oldMapKey && null != oldMapValue) {
                    let oldReduceValue = await rFun.kvs.get(oldMapKey) || rFun.defaultValue;
                    if (_.isEqual(oldMapKey, newMapKey)) {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - oldMapValue + newMapValue });
                    } else {
                        if (otherMapValueWithOldKeyExist) {
                            ret.reduce.push({ key: oldMapKey, value: oldReduceValue - oldMapValue });
                        } else {
                            ret.reduceDelete.push(oldMapKey);
                        }
                        ret.reduce.push({ key: newMapKey, value: newReduceValue + newMapValue });
                    }
                } else {
                    ret.reduce.push({ key: newMapKey, value: newReduceValue + newMapValue });
                }
                return ret;
            } else if (CountReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue, otherMapValueWithOldKeyExist } = 
                    await this.preComputeMap<number>(oldObj, newObj, rFun.defaultValue);
                let newReduceValue = await rFun.kvs.get(newMapKey) || rFun.defaultValue;
                if (null != oldMapKey && null != oldMapValue) {
                    let oldReduceValue = await rFun.kvs.get(oldMapKey) || rFun.defaultValue;
                    if (_.isEqual(oldMapKey, newMapKey)) {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - 1 + 1 });
                    } else {
                        if (otherMapValueWithOldKeyExist) {
                            ret.reduce.push({ key: oldMapKey, value: oldReduceValue - 1 });
                        } else {
                            ret.reduceDelete.push(oldMapKey);
                        }
                        ret.reduce.push({ key: newMapKey, value: newReduceValue + 1 });
                    }
                } else {
                    ret.reduce.push({ key: newMapKey, value: newReduceValue + 1 });
                }
                return ret;
            } else if (TextjoinReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue, otherMapValueWithOldKeyExist } = 
                    await this.preComputeMap(oldObj, newObj, rFun.defaultValue);

                //WARNING: this reduce precomputation works only for unique keys
                if (null != oldMapKey && null != oldMapValue && !_.isEqual(oldMapKey, newMapKey) && !otherMapValueWithOldKeyExist) {
                    ret.reduceDelete.push(oldMapKey);
                }
                ret.reduce.push({ key: newMapKey, value: newMapValue });
                
                return ret;
            } else {
                throw new Error('Unknown reduce function ' + this.reduceFunction);
            }
        }
    }

    public static strigifyViewUpdatesKeys(updates: MapReduceViewUpdates<string | number> | MapViewUpdates<string | number>): string[] {
        return updates.map.map(upd => 'MAP:' + kvsKey2Str(upd.key))
            .concat(updates.mapDelete.map(k => 'MAPDELETE:' + kvsKey2Str(k)))
            .concat(isReduce(updates) ? updates.reduce.map(upd => 'REDUCE:' + kvsKey2Str(upd.key)) : [])
        ;
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
            for (let key of updates.reduceDelete) {
                await this.reduceFunction.kvs.del(key);
            }
        }
    }

    public getStringKeysForUpdates(updates: { key: any[], value: any }[]): string[] {
        return updates.map(u => this.mapKVS.id2str(u.key));
    }
}
