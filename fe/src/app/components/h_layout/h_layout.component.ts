import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/form";
import { BaseNodeComponent } from '../base_node';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';


export class HLayoutComponent implements OnInit {

  @Input()
  nodeElement: NodeElementWithChildren;

  @Input()
  topLevelFormGroup: FormGroup;

  @Input()
  parentFormPath: string;

  @Input()
  formReadOnly: boolean;

  @HostBinding("class.outline")
  editMode: boolean;

  constructor(formEditingService: FormEditingService) {
    formEditingService.frmdbStreams.devMode$.subscribe(devMode => this.editMode = devMode);
  }

  ngOnInit() {

  }

  getChildPath(childEl: NodeElement) {
    let formPath = _.isEmpty(this.parentFormPath) ? [] : [this.parentFormPath]
    let childPath: string | null = null;
    childPath = getChildPath(childEl);
    if (childPath) formPath.push(childPath);
    return formPath.join('.');
  }

}
