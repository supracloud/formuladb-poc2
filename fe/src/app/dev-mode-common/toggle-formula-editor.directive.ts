import { Directive, HostListener, ElementRef, Component } from '@angular/core';
import { FormulaEditorService } from '../effects/formula-editor.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[frmdbToggleFormulaEditor]'
})
export class ToggleFormulaEditorDirective {
  protected subscriptions: Subscription[] = [];

  constructor(private el: ElementRef, private formulaEditorService: FormulaEditorService) {
  }

  @HostListener('click') onClick() {
    this.formulaEditorService.toggleFormulaEditor();
  }
}
