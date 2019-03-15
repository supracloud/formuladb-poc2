import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/form";
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

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
}
