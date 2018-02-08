import { BaseObj } from "../../src/app/domain/base_obj";
import { Entity, EntityProperty } from "../../src/app/domain/metadata/entity";
import { DataObj } from "../../src/app/domain/metadata/data_obj";
import { Form } from "../../src/app/domain/uimetadata/form";
import { Table } from "../../src/app/domain/uimetadata/table";

export interface FrmdbStoreI {
    getEntity(path: string): Promise<Entity>;

    getTable(path: string): Promise<Table>;

    getForm(path: string): Promise<Form>;

    getDataObj(id: string): Promise<DataObj>;

    getObj<T extends BaseObj>(id: string): Promise<T>;

    setObj<T extends BaseObj>(obj: T): Promise<T>;

    forPutForTestingPurposes<T extends BaseObj>(obj): Promise<T>;
}
