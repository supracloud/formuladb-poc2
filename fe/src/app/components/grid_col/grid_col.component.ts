import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, NodeElement, getChildPath, CssForNodeElement } from "@core/domain/uimetadata/node-elements";
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-grid_col',
  templateUrl: './grid_col.component.html',
  styleUrls: ['./grid_col.component.scss'],
})
export class GridColComponent extends BaseNodeComponent implements OnInit {

  dragIcon = faArrowsAlt;

  @Input()
  nodel: NodeElementWithChildren;

  @Input()
  formgrp: FormGroup;

  @Input()
  fullpath: string;

  @Input()
  rdonly: boolean;

  @HostBinding("class.outline")
  editMode: boolean;

  getCssClasses(nodeEl: CssForNodeElement): string {
    return super.getCssClasses(nodeEl) + ' col';
  }

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
    formEditingService.frmdbStreams.devMode$.subscribe(e => this.editMode = e);
  }

  ngOnInit() {
    console.debug(this.fullpath, this.nodel);
  }

  dragHandleId: string;
  setDragHandleId(id: string): void {
    this.dragHandleId = id;
  }

  dragStart($event: any, pos: number): boolean {
    if (this.dragHandleId.indexOf('frmdb-drag-handle-') === 0) {
      // this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: this.nodel });
      $event.dataTransfer.setData("movedNodeId", this.dragHandleId.replace(/^frmdb-drag-handle-/, ''));
      $event.dataTransfer.setData("removedFromNodeId", this.nodel._id);
      $event.dataTransfer.setData("removedFromPos", pos);
      // $event.stopPropagation();
      return true;
    } else {
      // $event.stopPropagation();
      return false;
    }
  }

  dragEnd(e: any): void {
    // this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: null });
  }
}
