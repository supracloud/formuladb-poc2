import { Component, OnInit, HostBinding } from '@angular/core';

import * as _ from 'lodash';

import { BaseNodeComponent } from "./base_node";
import { NodeElement, Str2NodeType } from "../domain/uimetadata/form";
import { HighlightService } from '../services/hightlight.service';
import { Observable } from 'rxjs/Observable';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: '[form-item]',
  templateUrl: './form-item.component.html',
  // host: { '[class]': 'getHostClassForElement()' },
  styleUrls: ['form-item.component.scss']
})
export class FormItemComponent extends BaseNodeComponent implements OnInit {

  private highlighted: string;

  constructor(private highlightSvc: HighlightService) {
    super();
    this.highlightSvc.highlighted$.subscribe(h => this.highlighted = h);
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
    return !_.includes(Array.from(Str2NodeType.keys()), nodeElement.nodeName);
  }

  getHostClassForElement(): string {
    if (null == this.nodeElement) return '';
    if (null == this.nodeElement.nodeName) return '';
    return this.nodeElement.nodeName == 'form-grid' ? 'container' : this.nodeElement.nodeName.replace(/^form-grid-/, '');
  }
}
