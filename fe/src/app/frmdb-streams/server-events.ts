import { DataObj } from "@core/domain/metadata/data_obj";
import { NodeElement } from "@core/domain/uimetadata/form";
import { Table } from "@core/domain/uimetadata/table";

export interface ServerModifiedFormData {
    type: 'ServerModifiedFormData';
    obj: DataObj;
}
export interface ServerDeletedFormData {
    type: 'ServerDeletedFormData';
    obj: DataObj;
}


export type ServerEvent = 
    | ServerModifiedFormData
    | ServerDeletedFormData
;
