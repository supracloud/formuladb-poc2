import * as _ from 'lodash';

import { KeyValueStoreArrayKeys, KeyValueStoreFactoryI, RangeQueryOptsArrayKeysI, KVSArrayKeyType } from "./key_value_store_i";
import { MapFunctionT } from "./domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { KeyValueObj } from './domain/key_value_obj';
import { ReduceFun, SumReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, TextjoinReduceFun, CountReduceFun } from './domain/metadata/reduce_functions';


export interface MapReduceViewUpdates {
    map: { key: any[], value: any }[],
    mapDelete: any[],
    reduce: { key: any[], value: any }[];
}

export type ReduceFunction =
    | SumReduceFunction
    | CountReduceFunction
    | TextjoinReduceFunction
;

export class SumReduceFunction implements SumReduceFun {
    readonly name: "SumReduceFunN";
    defaultValue = 0;
    constructor(reduceFun: SumReduceFun) {

    }
}

export class CountReduceFunction implements CountReduceFun {
    readonly name: "CountReduceFunN";
    defaultValue = 0;
    constructor(reduceFun: CountReduceFun) {
        
    }
}

export class TextjoinReduceFunction implements TextjoinReduceFun {
    readonly name: "TextjoinReduceFunN";
    delimiter: string;
    defaultValue = '';
    constructor(reduceFun: TextjoinReduceFun) {
        this.delimiter = reduceFun.delimiter;
    }
}


export class MapReduceView {
    private mapKVS: KeyValueStoreArrayKeys;
    private reduceKVS: KeyValueStoreArrayKeys;
    private reduceFunction: ReduceFunction | null;
    constructor(
        private kvsFactory: KeyValueStoreFactoryI,
        private viewName: string,
        private map: MapFunctionT,
        private use$ROW$?: boolean,
        reduceFun?: ReduceFun
    ) {
        this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKVS());
        this.reduceKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKVS());
        if (!reduceFun) {
            this.reduceFunction = null;
        } else {
            switch(reduceFun.name) {
                case SumReduceFunN:
                    this.reduceFunction = new SumReduceFunction(reduceFun); break;
                case CountReduceFunN:
                    this.reduceFunction = new CountReduceFunction(reduceFun); break;
                case TextjoinReduceFunN:
                this.reduceFunction = new TextjoinReduceFunction(reduceFun); break;
            }
            
        }
    }

    private _mapQuery<T>(kvs: KeyValueStoreArrayKeys, queryOpts: Partial<RangeQueryOptsArrayKeysI>) {
        return kvs.rangeQuery<T>({
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

        return this._mapQuery<string | number>(this.reduceKVS, queryOpts)
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

    /**
     * @returns List of keys updated
     */
    public async preComputeViewUpdateForObj(oldObj: KeyValueObj | null, newObj: KeyValueObj): Promise<MapReduceViewUpdates> {
        let viewName = this.viewName;
        if (oldObj && oldObj._id !== newObj._id) throw new Error("Unexpected view update for different objects " + oldObj._id + " !==  " + newObj._id);

        let ret: MapReduceViewUpdates = { map: [], mapDelete: [], reduce: [] };
        let newMapKey = this.use$ROW$ ? evalExprES5({ $ROW$: newObj }, this.map.keyExpr) : evalExprES5(newObj, this.map.keyExpr);
        let newMapValue: string | number | null = this.use$ROW$ ? evalExprES5({ $ROW$: newObj }, this.map.valueExpr) : evalExprES5(newObj, this.map.valueExpr);
        if (!(newMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewName, newMapKey }));
        ret.map.push({ key: newMapKey.concat([newObj._id]), value: newMapValue });

        if (oldObj) {

            let oldMapKey = this.use$ROW$ ? evalExprES5({ $ROW$: oldObj }, this.map.keyExpr) : evalExprES5(oldObj, this.map.keyExpr);
            let oldMapValue = this.use$ROW$ ? evalExprES5({ $ROW$: oldObj }, this.map.valueExpr) : evalExprES5(oldObj, this.map.valueExpr);

            if (!(oldMapKey instanceof Array)) throw new Error("Keys are not arrays " + JSON.stringify({ viewName, oldMapKey }));

            if (!this.reduceFunction) return ret;
            let defVal = this.reduceFunction.defaultValue;

            let oldReduceValue = oldMapKey ? await this.reduceKVS.get(oldMapKey) || defVal : defVal;
            if (_.isEqual(oldMapKey, newMapKey)) {
                let newReduceValue: string | number | null = defVal;
                let oldVal = oldMapValue || 0;
                if (SumReduceFunN === this.reduceFunction.name) {
                    if (typeof oldReduceValue !== 'number' || typeof oldVal !== 'number' || typeof newMapValue !== 'number') throw new Error("_sum reduce for non-number " + JSON.stringify({ viewName, oldReduceValue, oldMapKey, newMapKey, oldVal, newMapValue }));
                    newReduceValue = oldReduceValue - oldVal + newMapValue;
                } else if (CountReduceFunN === this.reduceFunction.name) {
                    if (typeof oldReduceValue !== 'number') throw new Error("_count reduce for non-number " + JSON.stringify({ viewName, oldReduceValue, oldMapKey, newMapKey, newMapValue }));
                    let oldVal = oldObj ? 1 : 0;
                    newReduceValue = oldReduceValue - oldVal + 1;
                } else if (TextjoinReduceFunN === this.reduceFunction.name) {
                    newReduceValue = null;
                } else {
                    throw new Error('Unknown reduce function ' + this.reduceFunction);
                }
                if (newReduceValue != null) {
                    ret.reduce.push({ key: newMapKey, value: newReduceValue });
                }
            } else {
                ret.mapDelete.push(oldMapKey.concat([oldObj._id]));
            }
        } else {

        }

        return ret;
    }

    public async updateViewForObj(updates: MapReduceViewUpdates) {
        for (let upd of updates.map) {
            await this.mapKVS.set(upd.key, upd.value);
        }
        for (let key of updates.mapDelete) {
            await this.mapKVS.del(key);
        }
        for (let upd of updates.reduce) {
            await this.reduceKVS.set(upd.key, upd.value);
        }
    }

    public getStringKeysForUpdates(updates: { key: any[], value: any }[]): string[] {
        return updates.map(u => this.mapKVS.id2str(u.key));
    }

    private getAggDefaultValue(reduceFun: string) {
        if ('_sum' === reduceFun) {
            return 0;
        } else if ('_count' === reduceFun) {
            return 0;
        } else if (reduceFun.indexOf('_textjoin') >= 0) {
            return '';
        } else {
            throw new Error('Unknown reduce function ' + reduceFun);
        }
    }

}
