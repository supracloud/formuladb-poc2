import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/form";
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
  host: {
    '[class.col]': 'true',
  }
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

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
    formEditingService.frmdbStreams.devMode$.subscribe(e => this.editMode = e);
  }

  ngOnInit() {
    console.debug(this.fullpath, this.nodel);
  }

  dragHandle: any;

  checkHandle(e: any): void {
    this.dragHandle = e.currentTarget;
  }

  dragStart(e: any): boolean {
    if (this.dragHandle && this.dragHandle.id === 'drag_' + this.nodel._id) {
      this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: this.nodel });
      e.stopPropagation();
      return true;
    } else {
      e.stopPropagation();
      return false;
    }
  }

  dragEnd(e: any): void {
    this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: null });
  }
}
