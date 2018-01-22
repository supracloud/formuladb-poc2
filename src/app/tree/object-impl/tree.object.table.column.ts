import { TreeObject } from "../tree.object";
import { NodeElement, NodeType2Str, NodeType } from "../../domain/uimetadata/form";
import { TreeChange } from "../tree.change";
import { BaseObj } from "../../domain/base_obj";
import { Table, TableColumn } from "../../domain/uimetadata/table";
import { UUID } from "angular2-uuid";
import { MetaItemDescriptor } from "../meta.item.descriptor";
import * as _ from "lodash";

export class TableColumnTreeObject implements TreeObject<TableColumn>{

    item: TableColumn;
    id: string = UUID.UUID();
    name: string;
    children?: TreeObject<any>[] = [];
    canMoveUp: boolean = false;
    canMoveDown: boolean = false;
    canDrag: boolean = true;
    canEdit: boolean = true;
    canDelete: boolean = true;
    siblingId: number = 0;
    childTypes: string[] = [];
    descriptor: MetaItemDescriptor[];

    constructor(node: TableColumn) {
        this.item = node;
        if (node) {
            this.name = node.name;
            this.descriptor = [{
                type: "text",
                property: name
            }]
        }
    }

    childChange() { }

    public patch(val: any): TableColumn {
        const ret: TableColumn = _.cloneDeep(this.item);
        ret.name = val.name;
        return ret;
    }

}