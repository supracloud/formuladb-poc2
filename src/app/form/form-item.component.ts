import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { BaseNodeComponent } from "./base_node";
import { NodeElement, Str2NodeType } from "../domain/uimetadata/form";

@Component({
  selector: '[form-item]',
  templateUrl: './form-item.component.html',
  host: {'[class]': 'getHostClassForElement()'}
})
export class FormItemComponent extends BaseNodeComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
    // console.log(this.nodeElement);
  }

  getChildPath(childEl: NodeElement) {
    let formPath = _.isEmpty(this.parentFormPath) ? [] : [this.parentFormPath]
    let childPath = childEl.propertyName || childEl.entityName || childEl.tableName;
    if (childPath) formPath.push(childPath);
    return formPath.join('.');
  }

  isUnknownElement(nodeElement: NodeElement): boolean {
    return ! _.includes(Array.from(Str2NodeType.keys()), nodeElement.nodeName);
  }

  getHostClassForElement(): string {
    if (null == this.nodeElement) return '';
    if (null == this.nodeElement.nodeName) return '';
    return this.nodeElement.nodeName == 'form-grid' ? 'container' : this.nodeElement.nodeName.replace(/^form-grid-/, '');
  }
}
