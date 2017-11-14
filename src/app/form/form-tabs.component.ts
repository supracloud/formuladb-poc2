import { Component, OnChanges } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

import { FormControl, FormGroup, FormArray, AbstractControl } from '@angular/forms';

@Component({
  selector: '[form-tabs]',
  template: `
  <ngb-tabset>
    <ngb-tab *ngFor="let childControl of topLevelFormGroup.get(parentFormPath)?.controls; let idx = index" 
    [title]="tabNames[idx]">
      <ng-template ngbTabContent>
        <div form-item [nodeElement]="nodeElement.childNodes[0]" [topLevelFormGroup]="topLevelFormGroup" [parentFormPath]="parentFormPath + '.' + idx" [formReadOnly]="formReadOnly"></div>
      </ng-template>
    </ngb-tab>  
  </ngb-tabset>
  `,
  styles: [`
    .row .col .tab-content {
      border-left: 1px solid rgb(221, 221, 221);
      border-right: 1px solid rgb(221, 221, 221);
      border-bottom: 1px solid rgb(221, 221, 221);
    }
  `]
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
