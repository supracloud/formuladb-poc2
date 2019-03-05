import { DataObj } from "@core/domain/metadata/data_obj";

export interface ServerModifiedFormData {
    type: 'ServerModifiedFormData';
    obj: DataObj;
}
export interface ServerDeletedFormData {
    type: 'ServerDeletedFormData';
    obj: DataObj;
}


export type FrmdbServerEvent = 
    | ServerModifiedFormData
    | ServerDeletedFormData
;
