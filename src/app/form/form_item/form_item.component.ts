import { Component, OnInit, HostBinding } from '@angular/core';

import * as _ from 'lodash';

import { BaseNodeComponent } from "./../base_node";
import { NodeElement, NodeType, isKnownNodeElement, isPropertyNodeElement, isNodeElementWithChildren, isTableNodeElement, isEntityNodeElement, getChildPath } from "./../../domain/uimetadata/form";
import { HighlightService } from './../../services/hightlight.service';
import { Observable } from 'rxjs/Observable';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: '[form_item]',
  templateUrl: 'form_item.component.html',
  host: { '[class]': 'getHostClassForElement()' },
  styleUrls: ['form_item.component.scss']
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
    let childPath: string = null;
    childPath = getChildPath(childEl);
    if (childPath) formPath.push(childPath);
    return formPath.join('.');
  }

  isUnknownElement(nodeElement: NodeElement): boolean {
    return !isKnownNodeElement(nodeElement.nodeType);
  }

  getHostClassForElement(): string {
    if (null == this.nodeElement) return '';
    if (null == this.nodeElement.nodeType) return '';
    return this.nodeElement.nodeType == NodeType.form_grid ? 'container' : this.nodeElement.nodeType.replace(/^form_grid_/, '');
  }
}
