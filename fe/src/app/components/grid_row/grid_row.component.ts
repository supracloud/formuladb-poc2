import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/node-elements";
import { BaseNodeComponent } from '../base_node';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-grid_row',
  templateUrl: './grid_row.component.html',
  styleUrls: ['./grid_row.component.scss'],
  host: {
    '[class.row]': 'true',
  }
})
export class GridRowComponent extends BaseNodeComponent implements OnInit {

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
    formEditingService.frmdbStreams.devMode$.subscribe(devMode => this.editMode = devMode);
  }

  ngOnInit() {
    console.debug(this.fullpath, this.nodel);
  }

}
