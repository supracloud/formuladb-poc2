import { BaseObj } from "../base_obj";
export interface DataObj extends BaseObj {
    type_: string;
    [key: string]: any;
}
export type DataObjDeepPath = string;
export type DataObjDeepPathTemplate = string;
export type DataObjRelativePath = string;
export type QueryDeepPath = string;
export type QueryDeepPathTemplate = string;
