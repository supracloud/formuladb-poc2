/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnChanges, OnInit, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { NodeElement, NodeType, TableNodeElement, FormTabs, FormTable } from "@core/domain/uimetadata/form";
import { CircularJSON } from "@core/json-stringify";

import { Pn } from "@core/domain/metadata/entity";
import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { FrmdbFormControl, FrmdbFormGroup } from '../form.component';


export class FormTableComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {

  addIcon = faPlusCircle;
  delIcon = faMinusCircle;

  constructor(public frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }

  tableElement: FormTable | FormTabs;

  ngOnInit() {
    this.tableElement = this.nodeElement as FormTable | FormTabs;
    console.log(this.nodeElement, this.topLevelFormGroup);
  }

  ngOnChanges() {
    console.log(this.nodeElement, this.topLevelFormGroup);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  getType(child: NodeElement): string {
    if (child.nodeType !== NodeType.form_input) {
      throw new Error('form-input node element is wrong: ' + CircularJSON.stringify(this.nodeElement));
    }
    if (child.propertyType === Pn.NUMBER) { return 'number'; } else { return 'text'; }
  }

  addRow() {
    
  }

  deleteRow(control: FrmdbFormGroup) {
    let obj = control.getRawValue();
    if (obj._id && confirm("Are you sure you want to delete row " + obj._id + " ?")) {
      this.frmdbStreams.userEvents$.next({ type: "UserDeletedFormData", obj });
    }
  }
}
