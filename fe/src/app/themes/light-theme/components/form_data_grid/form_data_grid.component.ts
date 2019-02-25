/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { Store } from '@ngrx/store';
import { NodeElement, NodeType, TableNodeElement } from "@core/domain/uimetadata/form";
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';

import * as fromForm from '../form.state';
import { Pn } from "@core/domain/metadata/entity";
@Component({
  selector: '[form_data_grid]',
  host: { class: 'col' },
  templateUrl: 'form_data_grid.component.html',
  styleUrls: ['form_data_grid.component.scss']
})
export class FormDataGridComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {

  data: any;
  frameworkComponents: any;
  defaultColDef: any;
  
  constructor(protected store: Store<fromForm.FormState>) {
    super(store);
  }

  tableElement: TableNodeElement;

  ngOnInit() {
    this.tableElement = this.nodeElement as TableNodeElement;
  }

  ngOnChanges() {
    console.log(this.nodeElement, this.topLevelFormGroup);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  getType(child: NodeElement): string {
    if (child.nodeType !== NodeType.form_input) {
      throw new Error('form-input node element is wrong: ' + JSON.stringify(this.nodeElement));
    }
    if (child.propertyType === Pn.NUMBER) { return 'number'; } else { return 'text'; }
  }

  // getCopiedPropertyName(child: NodeElement, idx: number) {
  //   let ret;
  //   if (isEntityNodeElement(child)) ret = child.snapshotCurrentValueOfProperties![idx];
  //   if (!ret) {
  //     console.error('copiedProperties does not have enough elements: ', child, idx);
  //     ret = 'NOT-FOUND-' + idx;
  //   }
  //   return ret;
  // }
}
