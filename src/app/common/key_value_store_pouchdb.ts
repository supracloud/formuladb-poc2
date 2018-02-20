import { KeyValueObj } from "./domain/key_value_obj";
import { KeyValueStoreI, MapReduceQueryOptions } from "./key_value_store_i";

import * as PouchDB from 'pouchdb';

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePouchDB implements KeyValueStoreI {
    private db;
    constructor(db: any) {
        this.db = db;
    }

    public simpleJSONQuery(query: any) {

    }

    mapReduceQuery(viewId: string, opts?: MapReduceQueryOptions): any {
        return this.db.query(viewId, opts);
    }
    
    putMapReduceQuery(viewId: string, map: ((doc: KeyValueObj) => any) | string, reduce?: ((keys, values, rereduce) => any) | string) {
        let designDoc: KeyValueObj = {
            _id: "_design/" + viewId,
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

    public findByType<T extends KeyValueObj>(type_: string): Promise<T[]> {
        return this.db.find({
            selector: {
                type_: type_
            }
        }).then((res: { docs: T[] }) => {
            return res.docs;
        }).catch(err => console.error(err));
    }

    public get<T extends KeyValueObj>(_id: string): Promise<T> {
        return this.db.get(_id);
    }

    public put<T extends KeyValueObj>(obj: T): Promise<T> {
        return this.db.put(obj).then(x => {
            obj._rev = x.rev;
            return obj;
        })
        .catch(err => { console.error(err); return Promise.reject(err) });
    }

    public putAll<T extends KeyValueObj>(objs: T[]): Promise<T[]> {
        return this.db.bulkDocs(objs).then(response => {
            response.forEach(res => {
                objs.find(x => x._id === res.id)._rev = res.rev;
            });
            return objs;
        })
            .catch(err => { console.error(err); return Promise.reject(err) });
    }

    public async removeAll() {
        var result = await this.db.allDocs({
            include_docs: true,
            attachments: false
        });

        result.rows.map(async (row) => {
            await this.db.remove(row.id, row.value.rev);
        });
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
        });
    }
}
