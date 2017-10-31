import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { BaseNodeComponent } from "./base_node";
import { NodeChildrenService } from "./node-children.service";

@Component({
    selector: '[form-grid]',
    host: { class: "container" },
    template: '<ng-container #childrenContainer></ng-container>'
})
export class FormGridComponent extends BaseNodeComponent implements OnInit {
    @ViewChild('childrenContainer', { read: ViewContainerRef }) childrenContainer: ViewContainerRef;
    
    constructor(private nodeChildrenService: NodeChildrenService) { 
        super();
    }

    ngOnInit(): void {
        this.nodeChildrenService.addChildren(this.childrenContainer, this);
    }
}