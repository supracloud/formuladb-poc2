import { TreeObject } from "../tree.object";
import { NodeElement, NodeType2Str, NodeType } from "../../domain/uimetadata/form";
import { TreeChange } from "../tree.change";
import { BaseObj } from "../../domain/base_obj";
import { Table, TableColumn } from "../../domain/uimetadata/table";
import { TableColumnTreeObject } from "./tree.object.table.column";
import { UUID } from "angular2-uuid";

export class TableTreeObject implements TreeObject<Table>{

    item: Table;
    id: string = UUID.UUID();
    name: string;
    children?: TreeObject<TableColumn>[] = [];
    canMoveUp: boolean = false;
    canMoveDown: boolean = false;
    canDrag: boolean = false;
    canEdit: boolean = true;
    canDelete: boolean = true;
    siblingId: number = 0;
    childTypes: string[] = [];

    constructor(node: Table) {
        console.log(node);
        this.item = node;
        if (node) {
            this.name = "Table_" + node.literal;
            this.childTypes = ['table-column'];
            if (node.columns) {
                for (var i: number = 0; i < node.columns.length; i++) {
                    let child: TreeObject<TableColumn> = new TableColumnTreeObject(node.columns[i]);
                    this.children.push(child);
                }
                this.resetMoveOptions();
            }
        }
    }

    private resetMoveOptions() {
        if (this.children.length > 0) {
            this.children.forEach(c => {
                c.canDrag = true;
            });
        }
    }

    public childChange(event: TreeChange) {
        if (event) {
            if (null !== event.drop) {
                var cpos = this.getIndexById(event.originalNode.id);
                if (cpos !== null) {
                    console.log("cpos", cpos);
                    this.children.splice(cpos, 1);
                    this.item.columns.splice(cpos, 1);
                }
                var npos = this.getIndexById(event.drop.target);
                if (npos !== null) {
                    console.log("npos", npos);
                    npos += (event.drop.after ? 1 : 0);
                    this.item.columns.splice(npos, 0, event.originalNode.item);
                    this.children.splice(npos, 0, event.originalNode as TableColumnTreeObject);
                }
            }
            if (true === event.remove) {
                var i = this.getIndexById(event.originalNode.id);
                if (i !== null) {
                    this.item.columns.splice(i, 1);
                    this.children.splice(i, 1);
                }
            }
            this.resetMoveOptions();
        }
        this.children.forEach(c=>c.childChange(event));
    }

    private getIndexById(id: string): number {
        for (var i: number = 0; i < this.children.length; i++) {
            if (this.children[i].id === id) return i;
        }
        return null;
    }

    public addChild(childType: string) {

    }
}