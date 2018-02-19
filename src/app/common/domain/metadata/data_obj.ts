import { BaseObj } from "../base_obj";
export interface DataObj extends BaseObj {
    type_: string;
    [key: string]: any;
}
export type DataObjDeepPath = string;
