import { Component, OnInit, Input, HostBinding, OnDestroy } from '@angular/core';
import { NodeElementWithChildren, NodeElement, getChildPath, CssForNodeElement } from "@core/domain/uimetadata/node-elements";
import { BaseNodeComponent } from '../base_node';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';
import { untilDestroyed } from 'ngx-take-until-destroy';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-grid_row',
  templateUrl: './grid_row.component.html',
  styleUrls: ['./grid_row.component.scss'],
})
export class GridRowComponent extends BaseNodeComponent implements OnInit, OnDestroy {

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
    return super.getCssClasses(nodeEl) + ' row';
  }

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
    formEditingService.frmdbStreams.devMode$.pipe(untilDestroyed(this)).subscribe(devMode => this.editMode = devMode);
  }

  ngOnInit() {
    console.debug(this.fullpath, this.nodel);
  }

}
