import { Component, OnChanges } from '@angular/core';
import { BaseNodeComponent } from "./../base_node";

import { FormControl, FormGroup, FormArray, AbstractControl } from '@angular/forms';

@Component({
  selector: '[form-tabs]',
  host: { class: "col" },
  templateUrl:'form-tabs.component.html',
  styleUrls:['form-tabs.component.scss']
})
export class FormTabsComponent extends BaseNodeComponent implements OnChanges {
  private tabNames: string[] = [];

  constructor() {
    super();
  }

  ngOnChanges() {
    let formArray = this.topLevelFormGroup.get(this.parentFormPath) as FormArray;
    if (!formArray) return;
    this.tabNames = formArray.controls.map(child => {
      return (child.get(this.nodeElement.attributes.tabNameFormPath) || {} as any).value;
    });
  }

}
