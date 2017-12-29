import { TreeObject } from "../tree.object";
import { NodeElement, NodeType2Str, NodeType } from "../../domain/uimetadata/form";
import { TreeChange } from "../tree.change";
import { UUID } from "angular2-uuid";

export class FormTreeObject implements TreeObject<NodeElement>{

    item: NodeElement;
    id: string = UUID.UUID();
    name: string;
    children?: TreeObject<any>[] = [];
    canDrag: boolean = false;
    canEdit: boolean = true;
    canDelete: boolean = true;
    siblingId: number = 0;
    childTypes: string[] = [];

    constructor(node: NodeElement) {
        this.item = node;
        if (node) {
            let s = [NodeType2Str.get(node.nodeType)];
            if (null != node.propertyName) s.push('=', node.propertyName);
            if (null != node.tableName) s.push('#', node.tableName);
            if (null != node.entityName) s.push('.', node.entityName);
            if (node.attributes) {
                s.push(": ");
                s.push(JSON.stringify(node.attributes).replace(/^\{/, '').replace(/\}$/, ''));
            }
            this.name = s.join('');

            let availableTypes: NodeType[] = [];
            switch (node.nodeType) {
                case NodeType.FormGrid:
                case NodeType.FormGridRow:
                case NodeType.FormGridCol:
                case NodeType.FormTab:
                    availableTypes = [NodeType.FormGridRow, NodeType.FormGridCol, NodeType.FormTabs, NodeType.FormTab, NodeType.FormTable, NodeType.FormAutocomplete, NodeType.FormDatepicker, NodeType.FormTimepicker, NodeType.FormInput]
                    break;
                case NodeType.FormTable:
                    availableTypes = [NodeType.FormGridRow];
                    break;
                case NodeType.FormTabs:
                    availableTypes = [NodeType.FormTab];
                    break;
            }
            this.childTypes = availableTypes.map(t => NodeType2Str.get(t));
            if (node.childNodes) {
                for (var i: number = 0; i < node.childNodes.length; i++) {
                    let child: FormTreeObject = new FormTreeObject(node.childNodes[i]);
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

    public addChild(childType: string) {

    }
}