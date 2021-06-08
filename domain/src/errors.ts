import { DataObj } from "./metadata/data_obj";

export type FrmdbError = string | FailedValidation[];

export interface FailedValidation {
    tableName: string;
    invalidColName?: string;
    otherColumns?: string[];
    obj: DataObj;
    errorMessage?: string;
    params?: string[];
}

export function getValidationFullName(v: FailedValidation) {
    return `${v.tableName}!${v.invalidColName||''}`;
}

export function getUserError(errMsg: string) {
    let m = errMsg.match(/FRMDB_ERROR: (.*):FRMDB_ERROR/);
    if (m) {
        return m[1];
    } else return null
}