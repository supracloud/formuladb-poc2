/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { Store } from '@ngrx/store';
import { NodeElement, NodeType, TableNodeElement, FormTabs, FormTable } from "@core/domain/uimetadata/form";
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';

import * as fromForm from '../form.state';
import { Pn } from "@core/domain/metadata/entity";


export class FormTableComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {

  constructor(protected store: Store<fromForm.FormState>) {
    super(store);
  }

  tableElement: FormTable | FormTabs;

  ngOnInit() {
    this.tableElement = this.nodeElement as FormTable | FormTabs;
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
