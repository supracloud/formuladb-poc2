import { Component, OnChanges } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

@Component({
  selector: '[form-table]',
  template: `
  <table class="table table-striped">
    <thead>
      <tr>
        <ng-container *ngFor="let child of nodeElement.childNodes">
          <ng-container [ngSwitch]="child.nodeName">
            <ng-container *ngSwitchCase="'form-autocomplete'">
            <th *ngFor="let propName of child.attributes?.copiedProperties">{{propName}}</th>
            </ng-container>
            <th *ngSwitchCase="'form-input'">{{child.propertyName}}</th>
          </ng-container>
        </ng-container>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let childControl of topLevelFormGroup.get(parentFormPath).controls; let idx = index">
        <ng-container *ngFor="let child of nodeElement.childNodes">
          <ng-container [ngSwitch]="child.nodeName">
            <ng-container *ngSwitchCase="'form-autocomplete'">
              <td *ngFor="let propName of child.attributes?.copiedProperties">
                <input type="text" [id]="parentFormPath + '.' + idx + '.' + child.entityName + '.' + propName" 
                  [formControl]="topLevelFormGroup.get(parentFormPath + '.' + idx + '.' + child.entityName + '.' + propName)" />
              </td>
            </ng-container>
            <td *ngSwitchCase="'form-input'">
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
export class FormTableComponent extends BaseNodeComponent implements OnChanges {

  constructor() {
    super();
  }

  ngOnChanges() {
    console.log(this.nodeElement);
  }

}
