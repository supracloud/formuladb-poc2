import { TreeObject } from "../tree.object";
import * as form from "../../common/domain/uimetadata/form";
import { TreeChange } from "../tree.change";
import { UUID } from "angular2-uuid";
import { MetaItemDescriptor } from "../meta.item.descriptor";
import * as _ from "lodash";

export class FormTreeObject implements TreeObject<form.NodeElement>{

    item: form.NodeElement;
    id: string = UUID.UUID();
    name: string;
    children?: TreeObject<any>[] = [];
    canDrag: boolean = false;
    canEdit: boolean = true;
    canDelete: boolean = true;
    siblingId: number = 0;
    childTypes: string[] = [];
    descriptor: MetaItemDescriptor[];

    constructor(node: form.NodeElement) {
        this.item = node;
        if (node) {
            let s: string[] = [node.nodeType];

            let availableTypes: form.NodeType[] = [];
            switch (node.nodeType) {
                case form.NodeType.form_input:
                case form.NodeType.form_datepicker:
                case form.NodeType.form_timepicker:
                    s.push('=', node.propertyName);
                    break;
                case form.NodeType.form_autocomplete:
                    s.push('.', node.entityName);
                    s.push(": ");
                    s.push(JSON.stringify(node.snapshotCurrentValueOfProperties||'').replace(/^\{/, '').replace(/\}$/, ''));
                    break;
                case form.NodeType.form_grid:
                case form.NodeType.form_grid_row:
                case form.NodeType.form_grid_col:
                case form.NodeType.form_tab:
                    availableTypes = [form.NodeType.form_grid_row, form.NodeType.form_grid_col, form.NodeType.form_tabs, form.NodeType.form_tab, form.NodeType.form_table, form.NodeType.form_autocomplete, form.NodeType.form_datepicker, form.NodeType.form_timepicker, form.NodeType.form_input]
                    break;
                case form.NodeType.form_table:
                    availableTypes = [form.NodeType.form_grid_row];
                    s.push('#', node.tableName);
                    break;
                case form.NodeType.form_tabs:
                    availableTypes = [form.NodeType.form_tab];
                    s.push('#', node.tableName);
                    s.push(": ");
                    s.push(JSON.stringify(node.tabNameFormPath||'').replace(/^\{/, '').replace(/\}$/, ''));
                    break;
            }
            this.name = s.join('');

            this.childTypes = availableTypes;
            if (form.isNodeElementWithChildren(node)) {
                for (var i: number = 0; i < node.childNodes.length; i++) {
                    let child: FormTreeObject = new FormTreeObject(node.childNodes[i]);
                    this.children.push(child);
                }
                this.resetMoveOptions();
            }
            this.descriptor = [{
                type: "select",
                property: "propertyName",
                attributes: {
                    selectValues: ["a", "b", "c"]
                }
            },
            {
                type: "text",
                property: "nodeType"
            }
            ]
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
            this.item = this.updateInternal(this.item, event.originalNode.item);
            if (!form.isNodeElementWithChildren(this.item)) return;

            if (null !== event.drop) {
                var cpos = this.getIndexById(event.originalNode.id);
                if (cpos !== null) {
                    this.children.splice(cpos, 1);
                    this.item.childNodes.splice(cpos, 1);
                }
                if (event.drop.target) {
                    var npos = this.getIndexById(event.drop.target);
                    if (npos !== null) {
                        npos += (event.drop.after ? 1 : 0);
                        this.item.childNodes.splice(npos, 0, event.originalNode.item);
                        this.children.splice(npos, 0, event.originalNode as FormTreeObject);
                    }
                } else {
                    if (event.drop.parent && event.drop.parent === this.id) {
                        this.item.childNodes.push(event.originalNode.item);
                        this.children.push(event.originalNode as FormTreeObject);
                    }
                }

            }
            if (true === event.remove) {
                var i = this.getIndexById(event.originalNode.id);
                if (i !== null) {
                    this.item.childNodes.splice(i, 1);
                    this.children.splice(i, 1);
                }
            }
            this.resetMoveOptions();
            this.children.forEach(c => c.childChange(event));
        }
    }

    private getIndexById(id: string): number {
        for (var i: number = 0; i < this.children.length; i++) {
            if (this.children[i].id === id) return i;
        }
        return null;
    }

    public patch(val: any): form.NodeElement {
        const ret: form.NodeElement = _.cloneDeep(this.item);
        if (form.isPropertyNodeElement(ret)) {
            ret.propertyName = val.propertyName;
        }
        return ret;
    }


    private updateInternal(node: form.NodeElement, updated: form.NodeElement): form.NodeElement {
        if (node._id === updated._id) {
            return updated;
        }
        if (form.isNodeElementWithChildren(node)) {
            node.childNodes = node.childNodes.map(c => this.updateInternal(c, updated));
        }
        return node;
    }

}