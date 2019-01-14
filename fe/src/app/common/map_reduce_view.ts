import * as _ from 'lodash';

import { KeyValueStoreArrayKeys, KeyValueStoreFactoryI, RangeQueryOptsArrayKeysI } from "./key_value_store_i";
import { MapFunctionT } from "./domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";


export interface MapReduceViewUpdates {
    map: {key: any[], value: any}[],
    reduce: {key: any[], value: any}[];
}

export class MapReduceView {
    private mapKVS: KeyValueStoreArrayKeys;
    private reduceKVS: KeyValueStoreArrayKeys;
    constructor(
        private kvsFactory: KeyValueStoreFactoryI, 
        private viewName: string, 
        private map: MapFunctionT, 
        private use$ROW$?: boolean,
        private reduceFun?: string
        ) 
    {
        this.mapKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKVS());
        this.reduceKVS = new KeyValueStoreArrayKeys(this.kvsFactory.createKVS());
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

    protected preComputeNumberAgg(reduceFun: string, existing: number[], current: number) {
        let defaultValue = this.getAggDefaultValue(reduceFun);
        //TODO: properly pre-compute the aggregation based on oldKey and newKey
    }

    public reduceQuery(queryOpts: Partial<RangeQueryOptsArrayKeysI>): Promise<string | number> {
        if (!this.reduceFun) throw new Error("Reduce called on a map view " + this.viewName + "; " + JSON.stringify(this.map) + ";" + this.reduceFun);
        let defaultValue = this.getAggDefaultValue(reduceFun);
        let reduceFun = this.reduceFun;
        let viewName = this.viewName;

        return this._mapQuery<string | number>(this.reduceKVS, queryOpts)
            .then(rows => {
                return rows.reduce((acc, current) => {
                    if ('_sum' === reduceFun) {
                        if (typeof acc !== 'number' || typeof current !== 'number') throw new Error('View ' + viewName + ' _sum accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + current;
                    } else if ('_count' === reduceFun) {
                        if (typeof acc !== 'number' || typeof current !== 'number') throw new Error('View ' + viewName + ' _count accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + 1;
                    } else if (reduceFun.indexOf('_textjoin') >= 0) {
                        return acc + 'TBDDelimiter' + current;
                    } else {
                        throw new Error('Unknown reduce function ' + reduceFun);
                    }

                }, defaultValue);
            });
    }

    /**
     * @returns List of keys updated
     */
    public async preComputeViewUpdateForObj(obj): Promise<MapReduceViewUpdates> {
        let ret: MapReduceViewUpdates = {map: [], reduce: []};
        let mapKey = this.use$ROW$ ? evalExprES5({$ROW$: obj}, this.map.keyExpr) : evalExprES5(obj, this.map.keyExpr);
        let mapValue = this.use$ROW$ ? evalExprES5({$ROW$: obj}, this.map.valueExpr) : evalExprES5(obj, this.map.valueExpr);
        ret.map.push({key: _.cloneDeep(mapKey), value: mapValue});

        if (! (mapKey instanceof Array)) throw new Error("keyExpr " + JSON.stringify(this.map.keyExpr.map(e => e.origExpr)) + " does not evaluate to an array but to " + JSON.stringify(mapKey));
        while (mapKey.length > 0) {
            let aggValue = await this.reduceQuery({
                startkey: mapKey,
                inclusive_start: true,
                endkey: mapKey,
                inclusive_end: true
            });
            ret.reduce.push({key: _.cloneDeep(mapKey), value: aggValue});
            mapKey.pop();
        }

        return ret;
    }

    public async updateViewForObj(updates: MapReduceViewUpdates) {
        for (let upd of updates.map) {
            await this.mapKVS.set(upd.key, upd.value);
        }
        for (let upd of updates.reduce) {
            await this.reduceKVS.set(upd.key, upd.value);
        }
    }

    public getStringKeysForUpdates(updates: {key: any[], value: any}[]): string[] {
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
