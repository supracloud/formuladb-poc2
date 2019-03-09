/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from '../base_node';
import { NodeElement, NodeType, isKnownNodeElement, getChildPath, FormGridCol, FormGridRow, VLayout } from "@core/domain/uimetadata/form";
import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';
import { FormEditingService } from '../form-editing.service';


export class FormItemComponent extends BaseNodeComponent implements OnInit, OnDestroy {

  dragHandle: any;
  icon = faArrowsAltH;

  ngOnInit() {
    // console.log(this.nodeElement);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
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

  getAvailableTypes(): NodeType[] | null {
    switch (this.nodeElement.nodeType) {
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
    switch (this.nodeElement.nodeType) {
      case NodeType.form_grid:
        return [new FormGridRow()];
      case NodeType.h_layout:
        return [new VLayout()];
      default:
        return null;
    }
  }

  checkHandle(e: any): void {
    this.dragHandle = e.currentTarget;
  }

  dragStart(e: any): boolean {
    if (this.dragHandle && this.dragHandle.id === 'drag_' + this.nodeElement._id) {
      this.frmdbStreams.userEvents$.next({type: "UserDraggedFormElement", nodeElement: this.nodeElement});
      e.stopPropagation();
      return true;
    } else {
      e.stopPropagation();
      return false;
    }
  }

  dragEnd(e: any): void {
    this.frmdbStreams.userEvents$.next({type: "UserDraggedFormElement", nodeElement: null});
  }
}
