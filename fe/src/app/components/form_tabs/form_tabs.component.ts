/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BaseNodeComponent } from "../base_node";
import { FormControl, FormGroup, FormArray, AbstractControl } from '@angular/forms';

import { NodeType, FormTabs } from "@core/domain/uimetadata/form";
import { FormEditingService } from '../form-editing.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: '[frmdb-form_tabs]',
  templateUrl: './form_tabs.component.html',
  styleUrls: ['./form_tabs.component.scss']
})
export class FormTabsComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {
  private tabNames: string[] = [];

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }


  ngOnInit() { }

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
