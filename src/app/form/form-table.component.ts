import { Component, OnChanges, OnInit } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

import { NodeElement, NodeType } from "../domain/uimetadata/form";
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';

@Component({
  selector: '[form-table]',
  host: { class: "col" },
  templateUrl: 'form-table.component.html',
  styles: []
})
export class FormTableComponent extends BaseNodeComponent implements OnChanges {

  constructor() {
    super();
  }

  ngOnChanges() {
    console.log(this.nodeElement, this.topLevelFormGroup);
  }

  getCopiedPropertyName(child: NodeElement, idx: number) {
    let ret = ((child.attributes || {} as any).copiedProperties || {} as any)[idx];
    if (!ret) {
      console.error("copiedProperties does not have enough elements: ", child, idx);
      ret = 'NOT-FOUND-' + idx;
    }
    return ret;
  }

  getChildProperties(child: NodeElement, idx: number): AbstractControl[] {
    let ret: AbstractControl[] = [];
    let subForm: FormGroup = this.topLevelFormGroup.get(this.parentFormPath + '.' + idx + '.' + child.entityName) as FormGroup;
    if (subForm !== null) {
      for (var ck in subForm.controls) {
        ret.push(subForm.controls[ck]);
      }
    }
    return ret;
  }

}
