import { Component, OnInit, Input, ViewChild, ViewContainerRef, OnChanges, SimpleChanges } from '@angular/core';
import { BaseNodeComponent } from "./base_node";
import { NodeChildrenService } from "./node-children.service";

@Component({
    selector: '[form-grid-row]',
    host: { class: "row" },
    template: '<ng-container #childrenContainer></ng-container>'
})
export class FormGridRowComponent extends BaseNodeComponent implements OnInit, OnChanges {
    @ViewChild('childrenContainer', { read: ViewContainerRef }) childrenContainer: ViewContainerRef;

    constructor(private nodeChildrenService: NodeChildrenService) { 
        super();
    }

    ngOnInit(): void {
        // this.nodeChildrenService.addChildren(this.childrenContainer, this);
    }
    ngOnChanges(changes: SimpleChanges): void {
        // this.nodeChildrenService.addChildren(this.childrenContainer, this);
    }    
}