import { TreeObject } from "../tree.object";
import { NodeElement, NodeType2Str, NodeType } from "../../domain/uimetadata/form";
import { TreeChange } from "../tree.change";
import { BaseObj } from "../../domain/base_obj";
import { Table, TableColumn } from "../../domain/uimetadata/table";
import { UUID } from "angular2-uuid";

export class TableColumnTreeObject implements TreeObject<TableColumn>{

    item: TableColumn;
    id:string=UUID.UUID();
    name: string;
    children?: TreeObject<any>[] = [];
    canMoveUp: boolean = false;
    canMoveDown: boolean = false;
    canDrag:boolean=true;
    canEdit: boolean = true;
    canDelete: boolean = true;
    siblingId: number = 0;
    childTypes: string[] = [];

    constructor(node: TableColumn) {
        this.item = node;
        if (node) {
            this.name = node.name;
        }
    }

    childChange() { }

    addChild() { }
}