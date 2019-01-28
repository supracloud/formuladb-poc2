import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { NodeElementWithChildren, NodeElement, getChildPath } from "@core/domain/uimetadata/form";
import { BaseNodeComponent } from '../base_node';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as fromForm from '../form.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'h-layout',
  templateUrl: './form-horizontal-layout.component.html',
  styleUrls: ['./form-horizontal-layout.component.scss']
})
export class FormHorizontalLayoutComponent implements OnInit {

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

  constructor(protected store: Store<fromForm.FormState>) {
    this.store.select(fromForm.isEditMode).subscribe(e => this.editMode = e);
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
