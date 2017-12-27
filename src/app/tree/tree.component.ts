import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TreeChange } from './tree.change';
import { TreeObject } from './tree.object';
import { HighlightService } from '../services/hightlight.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { DragService } from '../services/drag.service';

@Component({
    selector: 'mwz-tree',
    templateUrl: 'tree.component.html',
    styleUrls: ["tree.component.scss"]
})

export class TreeComponent implements OnInit {
    constructor(private highlightSvc: HighlightService, private dragSvc: DragService) {
        highlightSvc.highlighted$.subscribe(hid => this.selected = this.node && this.node.item && this.node.item._id === hid);
    }

    expanded: boolean = true;
    edited: boolean = false;
    selected: boolean = false;
    isHover: boolean = false;

    @Input()
    node: TreeObject<any>;

    @Input()
    index?: number;

    @Output()
    change = new EventEmitter();

    @ViewChild('popEditor') public popEditor: NgbPopover;
    @ViewChild('popAdd') public popAdd: NgbPopover;

    ngOnInit() { }

    private childChange(event: TreeChange) {
        this.node.childChange(event);
        this.change.emit(new TreeChange(this.node));
    }

    private moveUp(): void {
        let tc: TreeChange = new TreeChange(this.node);
        tc.indexChange = -1;
        this.change.emit(tc);
    }

    private moveDown(): void {
        let tc: TreeChange = new TreeChange(this.node);
        tc.indexChange = 1;
        this.change.emit(tc);
    }

    private drag(): void {
        this.dragSvc.payload = this.node;
    }

    dropAvailable(id: string, parent: string, event?: any): boolean {
        if (event) event.preventDefault();
        this.dragSvc.dropTarget = id;
        this.dragSvc.dropParent = parent;
        return true;
    }

    private drop(): void {
        this.dragSvc.payload = null;
        this.dragSvc.dropTarget = null;
        this.dragSvc.dropParent = null;
    }

    private dragOut(): void {
        this.dragSvc.dropTarget = null;
        this.dragSvc.dropParent = null;
    }

    private delete(): void {
        let tc: TreeChange = new TreeChange(this.node);
        tc.remove = true;
        this.change.emit(tc);
    }

    private edit(): void {
        this.edited = true;
    }

    private save(): void {
        this.edited = false;
    }

    hover(is: boolean) {
        if (!this.edited) {
            this.isHover = is;
            if (is && this.node && this.node.item) {
                this.highlightSvc.highlight(this.node.item._id);
            } else {
                this.highlightSvc.highlight(null);
            }
        }
    }

    finishEditing(event: boolean) {
        this.edited = false;
        this.popEditor.close();
        this.hover(false);
    }

    addItem(option: string) {
        this.edited = false;
        this.popAdd.close();
        this.hover(false);
    }

    select() {
        this.selected = this.highlightSvc.highlight(this.node.item._id, true);
    }
}