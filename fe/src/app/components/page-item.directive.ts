import { Directive, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[frmdb-page_item]'
})
export class PageItemDirective {

  constructor(public viewContainerRef: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver) { }

}
