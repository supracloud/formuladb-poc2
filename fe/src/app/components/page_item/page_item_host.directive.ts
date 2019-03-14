import { Directive, ComponentFactoryResolver, ViewContainerRef, Input, ComponentFactory } from '@angular/core';

@Directive({
    selector: '[frmdb-page_item_host]'
})
export class PageItemHostDirective {

    constructor(public viewContainerRef: ViewContainerRef) { }
}
