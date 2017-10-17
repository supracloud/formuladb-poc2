import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'form-tabs',
  template: `
  <div class="row" *ngFor="let propName of element.property.copiedProperties">
    <label [for]="element.property.name + '/' + propName">{{element.property.name}}/{{propName}}</label>
    <input class="form-control" type="text" [id]="element.property.name + '/' + propName" />
  </div>
  `,
  styles: []
})
export class FormTabsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
