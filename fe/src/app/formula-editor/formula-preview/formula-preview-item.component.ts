import { Component, Input } from '@angular/core';
import { FormulaPreviewNode } from './formula-preview.component';

@Component({
  selector: '[frmdb-formula-editor-item]',
  template: `
      <ng-container>
        {{formulaEditorNode.text}}
        <ul *ngIf="formulaEditorNode.children.length > 0">
          <li *ngFor="let child of formulaEditorNode.children" [formulaEditorNode]="child" frmdb-formula-editor-item></li>
        </ul>
      </ng-container>
  `
})
export class FormulaPreviewItemComponent {

  @Input()
  formulaEditorNode: FormulaPreviewNode;  
}
