/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnInit, HostBinding } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from "../base_node";
import { NodeElement, NodeType, isKnownNodeElement, isPropertyNodeElement, isNodeElementWithChildren, isTableNodeElement, isEntityNodeElement, getChildPath } from "../../common/domain/uimetadata/form";
import * as fromForm from '../form.state';


@Component({
  selector: '[form_item]',
  templateUrl: 'form_item.component.html',
  host: { '[class]': 'getHostClassForElement()' },
  styleUrls: ['form_item.component.scss']
})
export class FormItemComponent extends BaseNodeComponent implements OnInit {

  ngOnInit() {
    // console.log(this.nodeElement);
  }

  constructor(protected formStore: Store<fromForm.FormState>) {
    super(formStore);
  }

  getChildPath(childEl: NodeElement) {
    // let formPath = _.isEmpty(this.parentFormPath) ? [] : [this.parentFormPath]
    // let childPath: string | null = null;
    // childPath = getChildPath(childEl);
    // if (childPath) formPath.push(childPath);
    // return formPath.join('.');
    return getChildPath(childEl);
  }

  isUnknownElement(nodeElement: NodeElement): boolean {
    return !isKnownNodeElement(nodeElement.nodeType);
  }

  getHostClassForElement(): string {
    if (null == this.nodeElement) return '';
    if (null == this.nodeElement.nodeType) return '';
    return this.nodeElement.nodeType == NodeType.form_grid ? 'container' : this.nodeElement.nodeType.replace(/^form_grid_/, '');
  }


  checkHandle(e: any): void {
    this.dragTarget = e.target;
  }

  dragStart(e: any): void {
    if (this.dragTarget.className === 'drag-handle') {
      this.formStore.dispatch(new fromForm.FormDragAction(this.nodeElement));
    } else {
      e.preventDefault();
    }
  }

  dragEnd(e: any): void {
    this.formStore.dispatch(new fromForm.FormDragAction(null));
  }
}
