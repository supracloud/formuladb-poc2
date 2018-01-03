import { Component, OnInit, forwardRef } from '@angular/core';

import { BaseNodeComponent } from "./base_node";

@Component({
  selector: '[form-datepicker]',
  host: { class: "col form-group" },
  template: `
  <label [for]="nodeElement.propertyName">{{nodeElement.propertyName}}</label>
  <ng-container *ngIf="hasControl(parentFormPath)">
  <div class="input-group">
  <input class="form-control" placeholder="yyyy-mm-dd" [name]="parentFormPath" [formControl]="topLevelFormGroup.get(parentFormPath)" ngbDatepicker #d="ngbDatepicker" />
    <button class="input-group-addon" (click)="d.toggle()" type="button"><i class="fa fa-calendar"></i>
  </button>
  </div>
  `
})
export class FormDatepickerComponent extends BaseNodeComponent {
}
