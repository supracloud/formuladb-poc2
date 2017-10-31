import { Component, OnInit } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

import { NodeType } from "../domain/uimetadata/form";

@Component({
  selector: '[form-table]',
  template: `
  <table class="table table-bordered">
    <thead>
      <tr>
        <ng-container *ngFor="let child of nodeElement.childNodes">
          <ng-container [ngSwitch]="child.nodeType">
            <ng-container *ngSwitchCase="${NodeType.FormAutocomplete}">
              <th *ngFor="let propName of child.attributes?.copiedProperties">{{propName}}</th>
            </ng-container>
            <th *ngSwitchCase="${NodeType.FormInput}">{{child.propertyName}}</th>
          </ng-container>
        </ng-container>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let childControl of topLevelFormGroup.get(parentFormPath).controls; let idx = index">
        <ng-container *ngFor="let child of nodeElement.childNodes">
          <ng-container [ngSwitch]="child.nodeType">
            <ng-container *ngSwitchCase="${NodeType.FormAutocomplete}">
              <td *ngFor="let propName of child.attributes?.copiedProperties">
                <input type="text" [id]="parentFormPath + '.' + idx + '.' + child.entityName + '.' + propName" 
                  [formControl]="topLevelFormGroup.get(parentFormPath + '.' + idx + '.' + child.entityName + '.' + propName)" />
              </td>
            </ng-container>
            <td *ngSwitchCase="${NodeType.FormInput}">
            <input type="text" [id]="parentFormPath + '.' + idx + '.' + child.propertyName" 
                [formControl]="topLevelFormGroup.get(parentFormPath + '.' + idx + '.' + child.propertyName)" />
            </td>
          </ng-container>
        </ng-container>
      </tr>
    </tbody>
  </table>
  `,
  styles: []
})
export class FormTableComponent extends BaseNodeComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
    console.log(this.nodeElement);
  }

}
