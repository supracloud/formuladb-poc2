import { TreeChange } from "./tree.change";

export interface TreeObject<T> {
    item: T;
    name: string;
    children?: TreeObject<any>[];
    canMoveUp: boolean;
    canMoveDown: boolean;
    canEdit: boolean;
    canDelete: boolean;
    childTypes: string[];
    siblingId: number;

    childChange(change: TreeChange): void;

    addChild(childType: string): void;
}