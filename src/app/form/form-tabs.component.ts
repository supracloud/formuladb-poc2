import { Component, OnInit } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: '[form-tabs]',
  template: `
  <ngb-tabset>
    <ngb-tab *ngFor="let childControl of topLevelFormGroup.get(parentFormPath).controls; let idx = index" 
    [title]="tabNames[idx]">
      <ng-template ngbTabContent>
        <div form-tab [nodeElement]="nodeElement" [topLevelFormGroup]="topLevelFormGroup" [parentFormPath]="parentFormPath + '.' + idx"></div>
      </ng-template>
    </ngb-tab>  
  </ngb-tabset>
  `,
  styles: [`
    div[form-tab] {
      border-left: 1px solid rgb(221, 221, 221);
      border-right: 1px solid rgb(221, 221, 221);
      border-bottom: 1px solid rgb(221, 221, 221);
    }
  `]
})
export class FormTabsComponent extends BaseNodeComponent implements OnInit {
  private tabNames: string[] = [];

  constructor() {
    super();
  }

  ngOnInit() {
    this.tabNames = (this.topLevelFormGroup.get(this.parentFormPath) as FormArray).controls.map(child => {
      return child.get(this.nodeElement.attributes.tabNameFormPath).value;
    });
  }

}