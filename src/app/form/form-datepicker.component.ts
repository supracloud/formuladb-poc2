import { Component, OnInit, forwardRef } from '@angular/core';

import { BaseNodeComponent } from "./base_node";

@Component({
  selector: '[form-datepicker]',
  host: { class: "col form-group" },
  template: `
  <label [for]="nodeElement.propertyName">{{nodeElement.propertyName}}</label>
  <input class="form-control" placeholder="yyyy-mm-dd"
           [name]="parentFormPath" [formControl]="topLevelFormGroup.get(parentFormPath)" ngbDatepicker #d="ngbDatepicker">
    <button class="input-group-addon" (click)="d.toggle()" type="button">
      <img src="/assets/calendar-icon.svg" style="width: 1.2rem; height: 1rem; cursor: pointer;"/>
  `
})
export class FormDatepickerComponent extends BaseNodeComponent {
}
