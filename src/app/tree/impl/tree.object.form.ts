import { TreeObject } from "../tree.object";
import { NodeElement, NodeType2Str, NodeType } from "../../domain/uimetadata/form";
import { TreeChange } from "../tree.change";

export class FormTreeObject implements TreeObject<NodeElement>{

    item: NodeElement;
    name: string;
    children?: TreeObject<any>[] = [];
    canMoveUp: boolean = false;
    canMoveDown: boolean = false;
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
                    child.siblingId = i;
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
                var i = this.getIndexById(event.node.siblingId);
                if (i + event.indexChange >= 0 && i + event.indexChange < this.children.length - 1) {
                    this.item.childNodes.splice(i, 1);
                    this.item.childNodes.splice(i + event.indexChange, 0, event.node.item);
                    this.children.splice(i, 1);
                    this.children.splice(i + event.indexChange, 0, event.node as FormTreeObject);
                }
            }
            if (true === event.remove) {
                var i = this.getIndexById(event.node.siblingId);
                this.item.childNodes.splice(i, 1);
                this.children.splice(i, 1);
            }
            this.resetMoveOptions();
        }
    }

    private getIndexById(id: number): number {
        for (var i: number = 0; i < this.children.length; i++) {
            if (this.children[i].siblingId === id) return i;
        }
    }

    public addChild(childType: string) {

    }
}