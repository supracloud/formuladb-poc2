import { Component, OnChanges } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

import { NodeElement } from "../domain/uimetadata/form";

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
      <tr *ngFor="let rowControl of topLevelFormGroup.get(parentFormPath)?.controls; let idx = index">
        <ng-container *ngFor="let child of nodeElement.childNodes">
          <ng-container [ngSwitch]="child.nodeName">
            <ng-container *ngSwitchCase="'form-autocomplete'">
              <td *ngFor="let columnControl of topLevelFormGroup.get(parentFormPath + '.' + child.entityName)?.controls; let colIdx = index">
                <input type="text" [id]="parentFormPath + '.' + idx + '.' + child.entityName + '.' + getCopiedPropertyName(child, colIdx)" 
                  [formControl]="columnControl" />
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
    console.log(this.nodeElement, this.topLevelFormGroup);
  }

  getCopiedPropertyName(child: NodeElement, idx: number) {
    let ret = ((child.attributes || {} as any).copiedProperties || {} as any)[idx];
    if (! ret) {
      console.error("copiedProperties does not have enough elements: ", child, idx);
      ret = 'NOT-FOUND-' + idx;
    }
    return ret;
  }

}
