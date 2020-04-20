import * as _ from 'lodash';
import { CircularJSON } from "@domain/json-stringify";

import { KeyValueStoreArrayKeys, KeyValueStoreFactoryI, RangeQueryOptsArrayKeysI, KVSArrayKeyType, kvsKey2Str, kvsReduceValues, kvsStr2Key } from "@storage/key_value_store_i";
import { MapFunctionT } from "@domain/metadata/execution_plan";
import { evalExpression } from "@functions/map_reduce_utils";
import { KeyValueObj } from '@domain/key_value_obj';
import { ReduceFun, SumReduceFun, SumReduceFunN, CountReduceFunN, 
    TextjoinReduceFunN, TextjoinReduceFun, CountReduceFun, ReduceFunDefaultValue, 
    getReduceFunApply, TextjoinReduceFunApply } from "@domain/metadata/reduce_functions";
import { MINCHAR, MAXCHAR } from '@storage/collator';

export type MapReduceViewUpdateOldNew =
    | { oldObj: KeyValueObj | null, newObj: KeyValueObj }
    | { oldObj: KeyValueObj, newObj: KeyValueObj | null }
    | { oldObj: KeyValueObj, newObj: KeyValueObj }
    ;

export interface MapViewUpdateForObjAdd<VALUET> {
    readonly type: "add";
    objId: string;
    keyToSet: KVSArrayKeyType;
    newMapKey: KVSArrayKeyType;
    newMapValue: VALUET;
}
export interface MapViewUpdateForObjDelete<VALUET> {
    readonly type: "delete";
    objId: string;
    keyToDelete: KVSArrayKeyType;
    oldMapKey: KVSArrayKeyType;
    oldMapValue: VALUET;
}
export interface MapViewUpdateForObjModify<VALUET> {
    readonly type: "modify";
    objId: string;
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
    reduceChanges: { [keyStr: string]: VALUET };
}
export function initMapReduceViewUpdates<VALUET>(mapViewUpdates: MapViewUpdates<VALUET>): MapReduceViewUpdates<VALUET> {
    return {
        ...mapViewUpdates,
        reduceChanges: {},
    };
}
export function isReduce<VALUET>(v: MapViewUpdates<VALUET> | MapReduceViewUpdates<VALUET>): v is MapReduceViewUpdates<VALUET> {
    return 'reduceChanges' in v;
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

            if (newObj) {
                newMapKey = this.use$ROW$ ? evalExpression({ $ROW$: newObj }, this.map.keyExpr) : evalExpression(newObj, this.map.keyExpr);
                if (!(newMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewHashCode, newMapKey }));

                newMapValue = this.use$ROW$ ? evalExpression({ $ROW$: newObj }, this.map.valueExpr) : evalExpression(newObj, this.map.valueExpr);
                if (valueExample != null && typeof newMapValue !== typeof valueExample) {
                    throw new Error("newMapValue with incorrect type found " + JSON.stringify({ newObj, viewHashCode, newMapKey, newMapValue }));
                }

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
                if (valueExample != null && typeof oldMapValue !== typeof valueExample) {
                    throw new Error("oldMapValue with incorrect type found " + JSON.stringify({ viewHashCode, oldObj, newMapKey, newMapValue, oldMapKey, oldMapValue }));
                }

                // let otherMapValuesWithOldKey = await this.mapKVS.rangeQueryWithKeys({
                //     startkey: oldMapKey,
                //     endkey: oldMapKey.concat('\ufff0')
                // });
                // otherMapValueWithOldKeyExist = otherMapValuesWithOldKey.length > 1;

                keyToDelete = MapReduceView.makeUniqueMapKeyByAddingId(oldMapKey, oldObj._id);
            }


            if (oldMapKey && oldMapValue) {
                if (keyToSet && newMapKey && newMapValue) {
                    if (_.isEqual(oldMapKey, newMapKey)) {
                        ret.objChanges.push({ type: "modify", objId, oldMapKey, oldMapValue, keyToSet, newMapKey, newMapValue });
                    } else {
                        if (!keyToDelete) throw new Error(`cannot pre-compute view update, delete key not set ${JSON.stringify(oldObj)}////${JSON.stringify(newObj)}////${JSON.stringify({objId, oldMapKey, oldMapValue, keyToSet, newMapKey, newMapValue})}`);
                        ret.objChanges.push({ type: "delete", objId, keyToDelete, oldMapKey, oldMapValue });
                        ret.objChanges.push({ type: "add", objId, keyToSet, newMapKey, newMapValue });
                    }
                } else {
                    if (!keyToDelete) throw new Error(`cannot pre-compute view update, delete key not set ${JSON.stringify(oldObj)}////${JSON.stringify(newObj)}////${JSON.stringify({objId, oldMapKey, oldMapValue, keyToSet, newMapKey, newMapValue})}`);
                    ret.objChanges.push({ type: "delete", objId, keyToDelete, oldMapKey, oldMapValue });
                }
            } else if (keyToSet && newMapKey && newMapValue) {
                ret.objChanges.push({ type: "add", objId, keyToSet, newMapKey, newMapValue });                
            } else throw new Error(`Cannot update view for both new and old objs null ${JSON.stringify(oldObj)}///${JSON.stringify(newObj)}////${JSON.stringify({objId, oldMapKey, oldMapValue, keyToSet, newMapKey, newMapValue})}`);
        }

        return ret;
    }

    groupMapViewUpdatesForReduce<T>(updates: MapViewUpdates<T>): {[key: string]: MapViewUpdateObjChange<T>[]} {
        let ret: {[key: string]: MapViewUpdateObjChange<T>[]} = {};
        for (let objChg of updates.objChanges) {
            let keyStr = kvsKey2Str(objChg.type === "add" ? objChg.newMapKey : objChg.oldMapKey);
            ret[keyStr] = ret[keyStr] || [];
            ret[keyStr].push(objChg);
        }

        return ret;
    }

    public async preComputeViewUpdateForObj(oldObj: KeyValueObj | null, newObj: KeyValueObj | null): Promise<MapReduceViewUpdates<string | number>> {
        return this.preComputeViewUpdateForObjs([{oldObj, newObj}]);
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
            return initMapReduceViewUpdates(ret);
        } else {
            let mapUpdates = await this.preComputeMap(objs, ReduceFunDefaultValue[rFun.name]);
            let ret = initMapReduceViewUpdates(mapUpdates);
            let groupedMapUpdates = this.groupMapViewUpdatesForReduce(mapUpdates);

            for (let [currentKeyStr, updates] of Object.entries(groupedMapUpdates)) {
                    
                let currentKey = kvsStr2Key(currentKeyStr);
                let currentReduceValue = ret.reduceChanges[currentKeyStr];
                if (!currentReduceValue) {
                    currentReduceValue = await rFun.kvs.get(currentKey) || ReduceFunDefaultValue[rFun.name];
                }

                for (let objChange of updates) {
                    if (rFun.name === "SumReduceFunN") {
                        let currentVal: number = currentReduceValue as number; 
                        if (objChange.type === "add") {
                            let newVal = objChange.newMapValue as number;
                            currentVal = currentVal + newVal;
                        } else if (objChange.type === "delete") {
                            let oldVal = objChange.oldMapValue as number;
                            currentVal = currentVal - oldVal;
                        } else {
                            let newVal = objChange.newMapValue as number;
                            let oldVal = objChange.oldMapValue as number;
                            currentVal = currentVal - oldVal + newVal;
                        }
                        currentReduceValue = currentVal;
                    } else if (rFun.name === "CountReduceFunN") {
                        let currentVal: number = currentReduceValue as number; 
                        if (objChange.type === "add") {
                            currentVal = currentVal + 1;
                        } else if (objChange.type === "delete") {
                            currentVal = currentVal - 1;
                        } else {
                            currentVal = currentVal;
                        }
                        currentReduceValue = currentVal;
                    } else if (rFun.name === "TextjoinReduceFunN") {
                        let apply = new TextjoinReduceFunApply(rFun);
                        let currentVal: string = currentReduceValue as string; 
                        if (objChange.type === "add") {
                            let newVal = objChange.newMapValue as string;
                            currentVal = apply.add(currentVal, newVal);
                        } else if (objChange.type === "delete") {
                            let oldVal = objChange.oldMapValue as string;
                            currentVal = apply.delete(currentVal, oldVal);
                        } else {
                            let newVal = objChange.newMapValue as string;
                            let oldVal = objChange.oldMapValue as string;
                            currentVal = apply.modify(currentVal, oldVal, newVal);
                        }
                        currentReduceValue = currentVal;
                    }
                }
                ret.reduceChanges[currentKeyStr] = currentReduceValue;
            }

            return ret;
        }
    }

    public static strigifyViewUpdatesKeys(updates: MapReduceViewUpdates<string | number> | MapViewUpdates<string | number>): string[] {
        return updates.objChanges
            .map(upd => {
                if (upd.type === "add") {
                    return 'MAP:' + kvsKey2Str(upd.keyToSet);
                } else if (upd.type === "delete") {
                    return 'MAPDELETE:' + kvsKey2Str(upd.keyToDelete);
                } else {
                    return 'MAP:' + kvsKey2Str(upd.keyToSet);
                }
            })
            .concat(isReduce(updates) ? Object.keys(updates.reduceChanges).map(k => 'REDUCE:' + k) : [])
        ;
    }
    public async updateViewForObj(updates: MapReduceViewUpdates<string | number>) {
        for (let upd of updates.objChanges) {
            if (upd.type === "add") {
                await this.mapKVS.set(upd.keyToSet, upd.newMapValue);
            } else if (upd.type === "delete") {
                await this.mapKVS.del(upd.keyToDelete);
            } else {
                await this.mapKVS.set(upd.keyToSet, upd.newMapValue);
            }
        }

        if (this.reduceFunction) {
            for (let [reduceKeyStr, reduceValue] of Object.entries(updates.reduceChanges)) {
                let reduceKey = kvsStr2Key(reduceKeyStr);
                let otherMapValuesWithOldKey = await this.mapKVS.rangeQueryWithKeys({
                    startkey: reduceKey,
                    endkey: reduceKey.concat('\ufff0')
                });
                if (otherMapValuesWithOldKey.length === 0 
                    && reduceValue === ReduceFunDefaultValue[this.reduceFunction.name]) 
                {
                    await this.reduceFunction.kvs.del(reduceKey);
                } else {
                    if ((SumReduceFunN === this.reduceFunction.name && typeof reduceValue === 'number')
                        || (CountReduceFunN === this.reduceFunction.name && typeof reduceValue === 'number')
                    ) {
                        await (this.reduceFunction.kvs as any).set(reduceKey, reduceValue);
                    } else if (TextjoinReduceFunN === this.reduceFunction.name && typeof reduceValue === 'string') {
                        await (this.reduceFunction.kvs as any /*wtf*/).set(reduceKey, reduceValue);
                    }
                }
            }
        }
    }

    public getStringKeysForUpdates(updates: { key: any[], value: any }[]): string[] {
        return updates.map(u => this.mapKVS.id2str(u.key));
    }
}
