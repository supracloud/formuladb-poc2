/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, OnDestroy, Component } from '@angular/core';
import * as _ from 'lodash';
import { BaseNodeComponent } from '../base_node';
import { NodeElement, NodeType, isKnownNodeElement, getChildPath, GridCol, GridRow } from "@core/domain/uimetadata/form";
import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';
import { FormEditingService } from '../form-editing.service';


// @Component({
//   // tslint:disable-next-line:component-selector
//   selector: '[frmdb-form_item]',
//   templateUrl: './form_item.component.html',
//   styleUrls: ['./form_item.component.scss']
// })
export class FormItemComponent extends BaseNodeComponent implements OnInit, OnDestroy {

  dragHandle: any;
  icon = faArrowsAltH;

  ngOnInit() {
    // console.log(this.nodel);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  isUnknownElement(nodel: NodeElement): boolean {
    return !isKnownNodeElement(nodel.nodeType);
  }

  getHostClassForElement(): string {
    if (null == this.nodel) return '';
    if (null == this.nodel.nodeType) return '';
    return this.nodel.nodeType == NodeType.form ? 'container' : this.nodel.nodeType.replace(/^form_grid_/, '');
  }

  getAvailableTypes(): NodeType[] | null {
    switch (this.nodel.nodeType) {
      case NodeType.form_autocomplete:
      case NodeType.form_datepicker:
      case NodeType.form_input:
      case NodeType.form_timepicker:
        return [NodeType.form_autocomplete, NodeType.form_datepicker, NodeType.form_input, NodeType.form_timepicker];
      default:
        return null;
    }
  }


  getAvailableChildren(): NodeElement[] | null {
    switch (this.nodel.nodeType) {
      case NodeType.form:
        return [new GridRow()];
      case NodeType.grid_row:
        return [new GridCol()];
      default:
        return null;
    }
  }

  checkHandle(e: any): void {
    this.dragHandle = e.currentTarget;
  }

  dragStart(e: any): boolean {
    if (this.dragHandle && this.dragHandle.id === 'drag_' + this.nodel._id) {
      this.frmdbStreams.userEvents$.next({type: "UserDraggedFormElement", nodel: this.nodel});
      e.stopPropagation();
      return true;
    } else {
      e.stopPropagation();
      return false;
    }
  }

  dragEnd(e: any): void {
    this.frmdbStreams.userEvents$.next({type: "UserDraggedFormElement", nodel: null});
  }
}
