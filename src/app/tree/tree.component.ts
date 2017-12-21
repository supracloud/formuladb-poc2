import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreeChange } from './tree.change';
import { TreeObject } from './tree.object';

@Component({
    selector: 'mwz-tree',
    templateUrl: 'tree.component.html',
    styleUrls: ["tree.component.scss"]
})

export class TreeComponent implements OnInit {
    constructor() { }

    expanded: boolean = false;
    edited: boolean = false;

    @Input()
    node: TreeObject<any>;

    @Input()
    index?: number;

    @Output()
    change = new EventEmitter();

    @Output()
    selected = new EventEmitter();

    ngOnInit() { }

    private childChange(event: TreeChange) {
        this.node.childChange(event);
        this.change.emit(new TreeChange(this.node));
    }

    private moveUp(): void {
        let tc: TreeChange = new TreeChange(this.node);
        tc.indexChange=-1;
        this.change.emit(tc);
    }

    private moveDown(): void {
        let tc: TreeChange = new TreeChange(this.node);
        tc.indexChange=1;
        this.change.emit(tc);
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

    private isHover: boolean = false;

    set hover(is: boolean) {
        this.isHover = is;
        if (is) {
            this.selected.emit(this.node);
        } else {
            this.selected.emit(null);
        }
    }

    get hover(): boolean {
        return this.isHover;
    }

    private childSelected(event: TreeObject<any>) {
        this.selected.emit(event);
    }

}