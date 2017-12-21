import { TreeObject } from "./tree.object";

export class TreeChange {
    constructor(public node: TreeObject<any>) { }
    indexChange: number;
    remove: boolean=false;
}