import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/form";
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-grid_col',
  templateUrl: './grid_col.component.html',
  styleUrls: ['./grid_col.component.scss']
})
export class GridColComponent implements OnInit {

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
