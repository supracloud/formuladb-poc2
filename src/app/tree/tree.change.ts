import { TreeObject } from "./tree.object";
import { DropTarget } from "../services/drop.target";

export class TreeChange {
    constructor(public originalNode: TreeObject<any>) { }
    reportingNode: TreeObject<any> = null;
    remove: boolean = false;
    drop: DropTarget = null;
}