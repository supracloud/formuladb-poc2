import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreeChange } from './tree.change';
import { TreeObject } from './tree.object';
import { HighlightService } from '../services/hightlight.service';

@Component({
    selector: 'mwz-tree',
    templateUrl: 'tree.component.html',
    styleUrls: ["tree.component.scss"]
})

export class TreeComponent implements OnInit {
    constructor(private highlightSvc: HighlightService) { }

    expanded: boolean = true;
    edited: boolean = false;

    @Input()
    node: TreeObject<any>;

    @Input()
    index?: number;

    @Output()
    change = new EventEmitter();

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
        if (is && this.node && this.node.item) {
            this.highlightSvc.highlight(this.node.item._id);
            console.log("Tag" + this.node.item._id);
        } else {
            this.highlightSvc.highlight(null);
        }
    }

    get hover(): boolean {
        return this.isHover;
    }
}