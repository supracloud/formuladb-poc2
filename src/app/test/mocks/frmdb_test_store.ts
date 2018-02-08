import { FrmdbStoreI } from "../../frmdb_store_i";
import { BaseObj } from "../../domain/base_obj";
import { Entity } from "../../domain/metadata/entity";
import { DataObj } from "../../domain/metadata/data_obj";
import { Table } from "../../domain/uimetadata/table";
import { Form } from "../../domain/uimetadata/form";

export class FrmdbTestStore implements FrmdbStoreI {
    private db: Map<String, BaseObj> = new Map();

    getEntity(path: string): Promise<Entity> {
        return Promise.resolve(this.db.get(path) as Entity);
    }
    getTable(path: string): Promise<Table> {
        return Promise.resolve(this.db.get(path) as Table);
    }
    getForm(path: string): Promise<Form> {
        return Promise.resolve(this.db.get(path) as Form);
    }
    getDataObj(id: string): Promise<DataObj> {
        return Promise.resolve(this.db.get(id) as DataObj);
    }
    getObj<T extends BaseObj>(id: string): Promise<T> {
        return Promise.resolve(this.db.get(id) as T);
    }
    setObj<T extends BaseObj>(obj: T): Promise<T> {
        this.db.set(obj._id, obj);
        return Promise.resolve(obj);
    }
    forPutForTestingPurposes<T extends BaseObj>(obj: any): Promise<T> {
        return this.setObj(obj);
    }
}
