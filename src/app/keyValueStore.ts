import { KeyValueObj } from "./domain/key_value_obj";

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStore {
    private db;
    constructor(db: any) {
        this.db = db;
    }

    public findByMwzType<T extends KeyValueObj>(mwzType: string): Promise<T[]> {
        return this.db.find({
            selector: {
                mwzType: mwzType
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
        .catch(err => {console.error(err); return Promise.reject(err)});
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
}
