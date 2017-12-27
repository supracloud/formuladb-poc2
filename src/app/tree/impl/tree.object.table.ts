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
                c.canMoveDown = true;
                c.canMoveUp = true;
            });
            this.children[0].canMoveUp = false;
            this.children[this.children.length - 1].canMoveDown = false;
        }
    }

    public childChange(event: TreeChange) {
        if (event) {
            if (null !== event.indexChange) {
                var i = this.getIndexById(event.node.id);
                if (i + event.indexChange >= 0 && i + event.indexChange < this.children.length - 1) {
                    this.item.columns.splice(i, 1);
                    this.item.columns.splice(i + event.indexChange, 0, event.node.item);
                    this.children.splice(i, 1);
                    this.children.splice(i + event.indexChange, 0, event.node as TableColumnTreeObject);
                }
            }
            if (true === event.remove) {
                var i = this.getIndexById(event.node.id);
                this.item.columns.splice(i, 1);
                this.children.splice(i, 1);
            }
            this.resetMoveOptions();
        }
    }

    private getIndexById(id: string): number {
        for (var i: number = 0; i < this.children.length; i++) {
            if (this.children[i].id === id) return i;
        }
    }

    public addChild(childType: string) {

    }
}