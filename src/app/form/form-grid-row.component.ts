import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { BaseNodeComponent } from "./base_node";
import { NodeChildrenService } from "./node-children.service";

@Component({
    selector: '[form-grid-row]',
    host: { class: "row" },
    template: '<ng-container #childrenContainer></ng-container>'
})
export class FormGridRowComponent extends BaseNodeComponent implements OnInit {
    @ViewChild('childrenContainer', { read: ViewContainerRef }) childrenContainer: ViewContainerRef;

    constructor(private nodeChildrenService: NodeChildrenService) { 
        super();
    }

    ngOnInit(): void {
        this.nodeChildrenService.addChildren(this.childrenContainer, this);
    }
}