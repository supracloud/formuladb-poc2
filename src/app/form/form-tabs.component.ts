import { Component, OnInit } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

@Component({
  selector: '[form-tabs]',
  template: `
  <div class="row" *ngFor="let propName of element.copiedProperties">
    <label [for]="element.propertyName + '/' + propName">{{element.propertyName}}/{{propName}}</label>
    <input class="form-control" type="text" [id]="element.propertyName + '/' + propName" />
  </div>
  `,
  styles: []
})
export class FormTabsComponent extends BaseNodeComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
