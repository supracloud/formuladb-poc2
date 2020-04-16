import * as _ from 'lodash';
import { CircularJSON } from "@domain/json-stringify";

import { KeyValueStoreArrayKeys, KeyValueStoreFactoryI, RangeQueryOptsArrayKeysI, KVSArrayKeyType, kvsKey2Str, kvsReduceValues, kvsStr2Key } from "@storage/key_value_store_i";
import { MapFunctionT } from "@domain/metadata/execution_plan";
import { evalExpression } from "@functions/map_reduce_utils";
import { KeyValueObj } from '@domain/key_value_obj';
import { ReduceFun, SumReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, TextjoinReduceFun, CountReduceFun, ReduceFunDefaultValue } from "@domain/metadata/reduce_functions";
import { MINCHAR, MAXCHAR } from '@storage/collator';
import { ValueTextInput } from '@fe/component-editor/inputs';

export type MapReduceViewUpdateOldNew =
    | { oldObj: KeyValueObj | null, newObj: KeyValueObj }
    | { oldObj: KeyValueObj, newObj: KeyValueObj | null }
    | { oldObj: KeyValueObj, newObj: KeyValueObj }
    ;

export interface MapViewUpdateForObjAdd<VALUET> {
    objId: string;
    keyToSet: KVSArrayKeyType;
    newMapKey: KVSArrayKeyType;
    newMapValue: VALUET;
}
export interface MapViewUpdateForObjDelete<VALUET> {
    objId: string;
    keyToDelete: KVSArrayKeyType;
    oldMapKey: KVSArrayKeyType;
    oldMapValue: VALUET;
}
export interface MapViewUpdateForObjModify<VALUET> {
    objId: string;
    keyToDelete: KVSArrayKeyType;
    oldMapKey: KVSArrayKeyType;
    oldMapValue: VALUET;
    keyToSet: KVSArrayKeyType;
    newMapKey: KVSArrayKeyType;
    newMapValue: VALUET;
}

export type MapViewUpdateObjChange<VALUET> =
    | MapViewUpdateForObjAdd<VALUET>
    | MapViewUpdateForObjDelete<VALUET>
    | MapViewUpdateForObjModify<VALUET>
;

export interface MapViewUpdates<VALUET> {
    viewHashCode: string;
    objChanges: MapViewUpdateObjChange<VALUET>[];
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
    constructor(reduceFun: SumReduceFun, public kvs: KeyValueStoreArrayKeys<number>) {

    }
}

class CountReduceFunction implements CountReduceFun {
    readonly name = "CountReduceFunN";
    constructor(reduceFun: CountReduceFun, public kvs: KeyValueStoreArrayKeys<number>) {

    }
}

class TextjoinReduceFunction implements TextjoinReduceFun {
    readonly name = "TextjoinReduceFunN";
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
        private viewHashCode: string,
        public map: MapFunctionT,
        private use$ROW$?: boolean,
        public reduceFun?: ReduceFun
    ) {
        if (!reduceFun) {
            this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<any>(viewHashCode + '-map', null));
            this.reduceFunction = null;
        } else {
            switch (reduceFun.name) {
                case SumReduceFunN:
                    this.reduceFunction = new SumReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewHashCode + '-reduce', 0)));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewHashCode + '-map', ReduceFunDefaultValue[this.reduceFunction.name]));
                    break;
                case CountReduceFunN:
                    this.reduceFunction = new CountReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewHashCode + '-reduce', 0)));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<number>(viewHashCode + '-map', ReduceFunDefaultValue[this.reduceFunction.name]));
                    break;
                case TextjoinReduceFunN:
                    this.reduceFunction = new TextjoinReduceFunction(reduceFun, new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<string>(viewHashCode + '-reduce', '')));
                    this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKeyValS<string>(viewHashCode + '-map', ReduceFunDefaultValue[this.reduceFunction.name]));
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
        if (!this.reduceFunction) throw new Error("Reduce called on a map view " + this.viewHashCode + "; " + CircularJSON.stringify(this.map) + ";" + this.reduceFunction);
        let reduceFunction = this.reduceFunction;
        let viewHashCode = this.viewHashCode;

        return this._rangeQuery<string | number>(reduceFunction.kvs, queryOpts)
            .then(rows => kvsReduceValues(rows, reduceFunction, this.viewHashCode, true));
    }

    /** We need to allow multiple map values for the same key */
    public static makeUniqueMapKeyByAddingId(key: KVSArrayKeyType, objId: string) {
        return key.concat(objId);
    }
    /** we need to pop the objectId to get the original map key */
    public static extractOriginalMapKey(key: KVSArrayKeyType) {
        return key.slice(0, -1);
    }
    public static extractObjIdFromMapKey(key: KVSArrayKeyType): string {
        return key.pop() + '';
    }

    private async preComputeMap<T extends (string | number)>(objs: { oldObj: KeyValueObj | null, newObj: KeyValueObj | null }[], valueExample: T | null): Promise<MapViewUpdates<T>> {
        let ret: MapViewUpdates<T> = { viewHashCode: this.viewHashCode, objChanges: [] };

        for (let { oldObj, newObj } of objs) {

            let viewHashCode = this.viewHashCode;
            let objId: string;
            if (oldObj) objId = oldObj._id
            else if (newObj) objId = newObj._id;
            else throw new Error("view update with old=new=null");
            if (oldObj && newObj && oldObj._id !== newObj._id) throw new Error("Unexpected view update for different objects " + oldObj._id + " !==  " + newObj._id);

            let newMapKey: KVSArrayKeyType | null = null;
            let newMapValue: T | null = null;
            let keyToSet: KVSArrayKeyType | null = null;
            let objChange: MapViewUpdateObjChange<T>;

            if (newObj) {
                newMapKey = this.use$ROW$ ? evalExpression({ $ROW$: newObj }, this.map.keyExpr) : evalExpression(newObj, this.map.keyExpr);
                if (!(newMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewHashCode, newMapKey }));

                newMapValue = this.use$ROW$ ? evalExpression({ $ROW$: newObj }, this.map.valueExpr) : evalExpression(newObj, this.map.valueExpr);
                if (valueExample != null && typeof newMapValue !== typeof valueExample) throw new Error("newMapValue with incorrect type found " + JSON.stringify({ viewHashCode, newMapKey, newMapValue }));

                keyToSet = MapReduceView.makeUniqueMapKeyByAddingId(newMapKey, newObj._id);
            }


            let oldMapKey: KVSArrayKeyType | null = null;
            let keyToDelete: KVSArrayKeyType | null = null;
            let oldMapValue: T | null = null;
            // let otherMapValueWithOldKeyExist = true;

            if (oldObj) {

                oldMapKey = this.use$ROW$ ? evalExpression({ $ROW$: oldObj }, this.map.keyExpr) : evalExpression(oldObj, this.map.keyExpr);
                if (!(oldMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewHashCode, oldMapKey }));

                oldMapValue = this.use$ROW$ ? evalExpression({ $ROW$: oldObj }, this.map.valueExpr) : evalExpression(oldObj, this.map.valueExpr);
                if (valueExample != null && typeof oldMapValue !== typeof valueExample) throw new Error("oldMapValue with incorrect type found " + JSON.stringify({ viewHashCode, newMapKey, newMapValue, oldMapKey, oldMapValue }));

                // let otherMapValuesWithOldKey = await this.mapKVS.rangeQueryWithKeys({
                //     startkey: oldMapKey,
                //     endkey: oldMapKey.concat('\ufff0')
                // });
                // otherMapValueWithOldKeyExist = otherMapValuesWithOldKey.length > 1;

                if (!_.isEqual(oldMapKey, newMapKey)) {
                    keyToDelete = MapReduceView.makeUniqueMapKeyByAddingId(oldMapKey, oldObj._id);
                }
            }
            ret.objChanges.push({
                objId,
                keyToDelete,
                oldMapKey,
                oldMapValue,
                keyToSet,
                newMapKey,
                newMapValue
            });
        }

        return ret;
    }

    groupMapViewUpdatesForReduce<T>(updates: MapViewUpdates<T>): {[key: string]: MapViewUpdateObjChange<T>[]} {
        let ret: {[key: string]: MapViewUpdateObjChange<T>[]} = {};
        for (let objChg of updates.objChanges) {
            let oldMapKeyStr: string | null = objChg.oldMapKey ? kvsKey2Str(objChg.oldMapKey) : null;
            let newMapKeyStr: string | null = objChg.newMapKey ? kvsKey2Str(objChg.newMapKey) : null;
            if (oldMapKeyStr) ret[oldMapKeyStr] = ret[oldMapKeyStr] || [];
            if (newMapKeyStr) ret[newMapKeyStr] = ret[newMapKeyStr] || [];

            if (oldMapKeyStr) {
                ret[oldMapKeyStr].push(objChg);
            } 
            if (newMapKeyStr) {
                if (oldMapKeyStr != null && newMapKeyStr === oldMapKeyStr) {
                    //do nothing, already added
                } else ret[newMapKeyStr].push(objChg)
            }
        }

        return ret;
    }

    /**
     * @returns List of keys updated
     */
    public async preComputeViewUpdateForObjs(objs: { oldObj: KeyValueObj | null, newObj: KeyValueObj | null }[]): Promise<MapReduceViewUpdates<string | number>> {
        for (let { oldObj, newObj } of objs) {
            if (!oldObj && !newObj) throw new Error("view update with old=new=null");
        }

        let rFun = this.reduceFunction;
        if (!rFun) {
            let ret = await this.preComputeMap(objs, null);
            return {
                ...ret,
                reduce: [],
                reduceDelete: [],
            };
        } else {

            if (SumReduceFunN === rFun.name) {
                let mapUpdates = await this.preComputeMap<number>(objs, ReduceFunDefaultValue[rFun.name]);
                let ret: MapReduceViewUpdates<number> = {
                    ...mapUpdates,
                    reduce: [],
                    reduceDelete: [],
                }
                let groupedMapUpdates = this.groupMapViewUpdatesForReduce(mapUpdates);
                for (let [keyStr, updates] of Object.entries(groupedMapUpdates)) {
                    
                    let currentKey = kvsStr2Key(keyStr);
                    let storedReduceValue = await rFun.kvs.get(currentKey);

                    for (let objChange of updates) {
                        if (null != objChange.oldMapKey && null != objChange.oldMapValue) {
                            let currentReduceValueForOldKey = await rFun.kvs.get(objChange.oldMapKey) || ReduceFunDefaultValue[rFun.name];
                            if (_.isEqual(objChange.oldMapKey, objChange.newMapKey) && null != objChange.newMapKey && null != objChange.newMapValue) {
                                TBD.reduce.push({ key: objChange.newMapKey, value: currentReduceValueForOldKey - objChange.oldMapValue + objChange.newMapValue });
                            } else {
                                // if (otherMapValueWithOldKeyExist) {
                                // } else {
                                // TBD.reduceDelete.push(objChange.oldMapKey);
                                TBD.reduce.push({ key: objChange.oldMapKey, value: currentReduceValueForOldKey - objChange.oldMapValue });
                        
                                if (null != objChange.newMapKey && null != objChange.newMapValue && null != currentReduceValueForNewKey) {
                                    TBD.reduce.push({ key: objChange.newMapKey, value: currentReduceValueForNewKey + objChange.newMapValue });
                                }
                            }
                        } else {
                            if (null != objChange.newMapKey && null != objChange.newMapValue && null != currentReduceValueForNewKey) {
                                TBD.reduce.push({ key: objChange.newMapKey, value: currentReduceValueForNewKey + objChange.newMapValue });
                            }
                        }
                    }
                }

                return ret;
            } else if (CountReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue, otherMapValueWithOldKeyExist } =
                    await this.preComputeMap<number>(oldObj, newObj, ReduceFunDefaultValue[rFun.name]);
                let newReduceValue = null != newMapKey ? (await rFun.kvs.get(newMapKey) || ReduceFunDefaultValue[rFun.name]) : null;
                if (null != oldMapKey && null != oldMapValue) {
                    let oldReduceValue = await rFun.kvs.get(oldMapKey) || ReduceFunDefaultValue[rFun.name];
                    if (_.isEqual(oldMapKey, newMapKey) && null != newMapKey && null != newMapValue) {
                        ret.reduce.push({ key: newMapKey, value: oldReduceValue - 1 + 1 });
                    } else {
                        if (otherMapValueWithOldKeyExist) {
                            ret.reduce.push({ key: oldMapKey, value: oldReduceValue - 1 });
                        } else {
                            ret.reduceDelete.push(oldMapKey);
                        }
                        if (null != newMapKey && null != newMapValue && null != newReduceValue) {
                            ret.reduce.push({ key: newMapKey, value: newReduceValue + 1 });
                        }
                    }
                } else {
                    if (null != newMapKey && null != newMapValue && null != newReduceValue) {
                        ret.reduce.push({ key: newMapKey, value: newReduceValue + 1 });
                    }
                }
                return ret;
            } else if (TextjoinReduceFunN === rFun.name) {
                let { ret, newMapKey, newMapValue, oldMapKey, oldMapValue, otherMapValueWithOldKeyExist } =
                    await this.preComputeMap(oldObj, newObj, ReduceFunDefaultValue[rFun.name]);

                //WARNING: this reduce pre-computation works only for unique keys
                if (null != oldMapKey && null != oldMapValue && !_.isEqual(oldMapKey, newMapKey) && !otherMapValueWithOldKeyExist) {
                    ret.reduceDelete.push(oldMapKey);
                }
                if (null != newMapKey && null != newMapValue) {
                    ret.reduce.push({ key: newMapKey, value: newMapValue });
                }

                return ret;
            } else {
                throw new Error('Unknown reduce function ' + this.reduceFunction);
            }
        }
    }

    public static strigifyViewUpdatesKeys(updates: MapReduceViewUpdates<string | number> | MapViewUpdates<string | number>): string[] {
        return updates.objChanges.filter(upd => upd.keyToSet != null)
            .map(upd => 'MAP:' + kvsKey2Str(upd.keyToSet!))
            .concat(updates.objChanges.filter(upd => upd.keyToDelete != null)
                .map(upd => 'MAPDELETE:' + kvsKey2Str(upd.keyToDelete!)))
            .concat(isReduce(updates) ? updates.reduce.map(upd => 'REDUCE:' + kvsKey2Str(upd.key)) : [])
            ;
    }
    public async updateViewForObj(updates: MapReduceViewUpdates<string | number>) {
        for (let upd of updates.objChanges) {
            if (upd.keyToSet) {
                await this.mapKVS.set(upd.keyToSet, upd.newMapValue);
            }
            if (upd.keyToDelete) {
                await this.mapKVS.del(upd.keyToDelete);
            }
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
