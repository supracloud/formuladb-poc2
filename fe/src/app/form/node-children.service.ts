/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Injectable, ViewContainerRef, ComponentFactoryResolver, Type } from '@angular/core';
import { FormControl, FormGroup, ControlValueAccessor } from '@angular/forms';

import { Form, NodeElement, NodeType, isNodeElementWithChildren, getChildPath } from "@core/domain/uimetadata/form";
import { BaseNodeComponent } from "./base_node";

import * as _ from 'lodash';

@Injectable()
export class NodeChildrenService {


  constructor(private cfr: ComponentFactoryResolver) { }
  
  private nodeType2ComponentClass: Map<NodeType, Type<BaseNodeComponent>>;
  
  public setNodeType2ComponentClass(nodeType2ComponentClass: Map<NodeType, Type<BaseNodeComponent>>) {
    this.nodeType2ComponentClass = nodeType2ComponentClass;
  }

  addChildren(viewContainerRef: ViewContainerRef, parentComponent: BaseNodeComponent) {
    if (!isNodeElementWithChildren(parentComponent.nodeElement)) return;

    (parentComponent.nodeElement.childNodes || []).forEach(childEl => {
      let factory = this.cfr.resolveComponentFactory(this.nodeType2ComponentClass.get(childEl.nodeType)!);
      let componentRef = viewContainerRef.createComponent(factory);
      let instance = <BaseNodeComponent>componentRef.instance;
      instance.nodeElement = childEl;
      instance.topLevelFormGroup = parentComponent.topLevelFormGroup;
      let formPath = _.isEmpty(parentComponent.parentFormPath) ? [] : [parentComponent.parentFormPath]
      let childPath = getChildPath(childEl);
      if (childPath) formPath.push(childPath);
      instance.parentFormPath = formPath.join('.');
    });
  }
}
