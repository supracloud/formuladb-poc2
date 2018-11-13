import { Directive, HostListener, ElementRef } from '@angular/core';
import { FormulaEditorService } from './formula-editor.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[frmdbToggleFormulaEditor]'
})
export class ToggleFormulaEditorDirective {
  protected subscriptions: Subscription[] = [];

  constructor(private el: ElementRef, private formulaEditorService: FormulaEditorService) {
  }

  @HostListener('click') onClick() {
    this.formulaEditorService.startFormulaEditor();
  }
}
