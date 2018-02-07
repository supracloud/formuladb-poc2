import { Component, OnChanges } from '@angular/core';
import { BaseNodeComponent } from "./../base_node";

import { FormControl, FormGroup, FormArray, AbstractControl } from '@angular/forms';

import { NodeType, FormTabs } from "../../domain/uimetadata/form";
@Component({
  selector: '[form-tabs]',
  host: { class: "col" },
  templateUrl:'form_tabs.component.html',
  styleUrls:['form_tabs.component.scss']
})
export class FormTabsComponent extends BaseNodeComponent implements OnChanges {
  private tabNames: string[] = [];

  constructor() {
    super();
  }

  ngOnChanges() {
    if (this.nodeElement.nodeType === NodeType.form_tabs) throw new Error("form_tabs component does not work with nodeElement " + this.nodeElement);

    let formArray = this.topLevelFormGroup.get(this.parentFormPath) as FormArray;
    if (!formArray) return;
    this.tabNames = formArray.controls.map(child => {
      return (child.get((this.nodeElement as FormTabs).tabNameFormPath) || {} as any).value;
    });
  }

}
