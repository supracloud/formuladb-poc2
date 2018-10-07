/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnChanges, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from "../base_node";
import { Store } from '@ngrx/store';
import { FormControl, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import * as fromForm from '../form.state';

import { NodeType, FormTabs } from "../../common/domain/uimetadata/form";
@Component({
  selector: '[form_tabs]',
  host: { class: "col" },
  templateUrl: 'form_tabs.component.html',
  styleUrls: ['form_tabs.component.scss']
})
export class FormTabsComponent extends BaseNodeComponent implements OnChanges, OnDestroy {
  private tabNames: string[] = [];

  constructor(protected store: Store<fromForm.FormState>) {
    super(store);
  }

  ngOnChanges() {
    if (this.nodeElement.nodeType !== NodeType.form_tabs) throw new Error("form_tabs component does not work with nodeElement " + this.nodeElement);

    let formArray = this.topLevelFormGroup.get(this.parentFormPath) as FormArray;
    if (!formArray) return;
    this.tabNames = formArray.controls.map(child => {
      return (child.get((this.nodeElement as FormTabs).tabNameFormPath) || {} as any).value;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
