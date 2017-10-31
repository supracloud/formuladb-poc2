import { Component, OnInit, forwardRef } from '@angular/core';

import { BaseNodeComponent } from "./base_node";

@Component({
  selector: '[form-timepicker]',
  template: `
  <label [for]="nodeElement.propertyName">{{nodeElement.propertyName}}</label>
  <ngb-timepicker [id]="parentFormPath" [formControl]="topLevelFormGroup.get(parentFormPath)"></ngb-timepicker>
  `
})
export class FormTimepickerComponent extends BaseNodeComponent{
  
}
