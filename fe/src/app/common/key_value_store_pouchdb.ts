/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj, KeyValueError, isKeyValueError, IdRevObj } from "./domain/key_value_obj";
import { KeyValueStoreI, MapReduceQueryOptions, MapReduceResponseI } from "./key_value_store_i";
import * as acorn from "acorn";

import * as ZaPouchDB from 'pouchdb';
import pouchdbDebug from 'pouchdb-debug';

export var PouchDB;
if (typeof (window as any) != 'undefined') {
    PouchDB = ZaPouchDB['default'];
    PouchDB.plugin(pouchdbDebug);
    PouchDB.debug.enable('*');
} else {
    PouchDB = ZaPouchDB;
}

import { PickOmit } from "./ts-utils";
import * as _ from 'lodash';

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePouchDB implements KeyValueStoreI {
    public db
        : PouchDB.Database
    ;
    constructor(db: any) {
        this.db = db;
        db.on('error', function (err) { debugger });
    }

    public simpleJSONQuery(query: any) {

    }

    mapReduceQuery(viewId: string, opts?: MapReduceQueryOptions): Promise<MapReduceResponseI> {
        let queryOpts = opts;
        if (opts && opts.inclusive_start === false && opts.startkey instanceof Array) {
            queryOpts = _.cloneDeep(opts);
            queryOpts.startkey = opts.startkey.concat(null);
        }
        return this.db.query(viewId, queryOpts)
            .catch(err =>
                console.error(err, viewId, opts))
            .then(response => {
                return response || { rows: [] }
            })
            ;
    }
    getMapReduceQueryMetadata(viewId: string): Promise<any> {
        return this.db.get("_design/" + viewId);
    }

    putMapReduceQuery(viewId: string, map: ((doc: KeyValueObj) => any) | string, reduce?: ((keys, values, rereduce) => any) | string): Promise<any> {
        return this.putMapReduceQueryWithMetadata(viewId, {}, map, reduce);
    }
    putMapReduceQueryWithMetadata(viewId: string, metadata, map: ((doc: KeyValueObj) => any) | string, reduce?: ((keys, values, rereduce) => any) | string): Promise<any> {
        if (typeof map === 'string') {
            try {
                acorn.parse(map, { ecmaVersion: 5 });
            } catch (ex) {
                console.warn("map function not ES5 syntax", ex, map);
                // throw new Error("map function not ES5: " + ex);
            }
        }

        let designDoc: KeyValueObj & any = {
            _id: "_design/" + viewId,
            metadata: metadata,
            views: {
                [viewId]: {
                    map: map.toString(),
                }
            },
            language: "javascript",
        };
        if (reduce) designDoc.views[viewId].reduce = reduce.toString();
        return this.put(designDoc);
    }

    public findByPrefix<T extends KeyValueObj>(type_: string): Promise<T[]> {
        return this.range<T>(type_, type_ + "\ufff0", false);
    }

    public get<T extends KeyValueObj>(_id: string): Promise<T> {
        let newErr = new Error();
        return this.db.get(_id)
            .catch(err => {
                err._id = _id;
                Object.assign(newErr, err);
                newErr.message = JSON.stringify(err);
                throw newErr; 
            }) as Promise<T>;
    }

    public async listRevs<T extends KeyValueObj>(ids: string[]): Promise<IdRevObj[]> {
        let ret: IdRevObj[] = [];

        let allDocsResp = await this.db.allDocs<T>({
            keys: ids,
            include_docs: false,
            attachments: false
        });

        (allDocsResp.rows || []).forEach(row => {
            ret.push({_id: row.id, _rev: (row.value || {rev: undefined}).rev});
        })

        return ret;
    }

    public async range<T extends KeyValueObj>(startkey: string, endkey: string, inclusive_end: boolean): Promise<T[]> {
        let ret: T[] = [];

        let allDocsResp = await this.db.allDocs<T>({
            startkey: startkey,
            endkey: endkey,
            inclusive_end: inclusive_end,
            include_docs: true,
            attachments: false
        });

        (allDocsResp.rows || []).forEach(row => {
            if (null == row || null == row.doc) return;
            ret.push(row.doc);
        })

        return ret;
    }


    public put<T extends KeyValueObj>(obj: T): Promise<T> {
        let stack = () => new Error().stack;
        return this.db.put(obj).then(x => {
            obj._rev = x.rev;
            return obj;
        })
        .catch(err => { console.error(err, stack()); return Promise.reject(err) });
    }

    public post<T extends KeyValueObj>(obj: PickOmit<T, '_id'>): Promise<T> {
        let stack = () => new Error().stack;
        return this.db.post(obj).then(x => {
            return Object.assign({}, obj, {
                _id: x.id,
                _rev: x.rev,
            }) as any;
        })
        .catch(err => { console.error(err, stack()); return Promise.reject(err) });
    }

    public putAll<T extends KeyValueObj>(objs: T[]): Promise<(T | KeyValueError)[]> {
        let stack = () => new Error().stack;
        return this.db.bulkDocs(objs)
        .then(response => {
            let ret: (T| KeyValueError)[] = [];
            response.forEach((res, idx) => {
                if (isKeyValueError(res)) {
                    ret.push(res);
                } else {
                    let o = objs[idx];
                    if (o._id !== res.id) throw new Error("Expected " + o._id + " but found " + res.id + "; " + JSON.stringify(objs) + ";" + JSON.stringify(response));
                    o._rev = res.rev;
                    ret.push(o);
                }
            });
            return ret;
        })
        .catch(err => { 
            console.error(err, stack()); 
            return Promise.reject(err) 
        });
    }

    public async removeAll() {
        var result = await this.db.allDocs({
            include_docs: false,
            attachments: false
        });
        if (!result || !result.rows) return;

        await Promise.all(result.rows.map(row => this.db.remove(row.id, row.value.rev)));
        await this.db.compact();
    }

    public forcePut<T extends KeyValueObj>(document: T): Promise<T> {
        let id = document._id;
        return this.get<T>(id).then(result => {
            document._rev = result._rev;
            return this.put(document);
        }, error => {
            if (error.status == "404") {
                return this.put<T>(document);
            } else {
                return new Promise<T>((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    public info(): Promise<string> {
        return this.db.info().then(function (info) {
            console.log(info);
            return JSON.stringify(info);
        });
    }
}
