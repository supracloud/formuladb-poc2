import { TreeChange } from "./tree.change";
import { UUID } from "angular2-uuid";

export interface TreeObject<T> {
    item: T;
    id:string;
    name: string;
    children?: TreeObject<any>[];
    canMoveUp: boolean;
    canMoveDown: boolean;
    canDrag:boolean;
    canEdit: boolean;
    canDelete: boolean;
    childTypes: string[];

    childChange(change: TreeChange): void;

    addChild(childType: string): void;
}