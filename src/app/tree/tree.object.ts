import { TreeChange } from "./tree.change";
import { UUID } from "angular2-uuid";
import { FormGroup } from "@angular/forms";
import { MetaItemDescriptor } from "./meta.item.descriptor";

export interface TreeObject<T> {
    item: T;
    id:string;
    name: string;
    children?: TreeObject<any>[];
    canDrag:boolean;
    canEdit: boolean;
    canDelete: boolean;
    childTypes: string[];
    descriptor:MetaItemDescriptor[];

    childChange(change: TreeChange): void;

    patch(val:any):T;
}