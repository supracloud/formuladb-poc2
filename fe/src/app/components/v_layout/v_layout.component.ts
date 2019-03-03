import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/form";
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as fromForm from '../form.state';
import { Observable } from 'rxjs';
import { FormEditingService } from '../form-editing.service';

export class VLayoutComponent implements OnInit {

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
    formEditingService.frmdbStreams.devMode$.subscribe(e => this.editMode = e);
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
