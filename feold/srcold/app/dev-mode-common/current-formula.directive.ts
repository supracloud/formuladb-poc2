import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { FormulaEditorService } from '../effects/formula-editor.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[frmdbCurrentFormula]'
})
export class CurrentFormulaDirective implements OnDestroy {
  protected subscriptions: Subscription[] = [];

  constructor(private el: ElementRef, private formulaEditorService: FormulaEditorService) {
    this.subscriptions.push(this.formulaEditorService.selectedFormula$.subscribe(selectedFormula => {
      this.el.nativeElement.value = selectedFormula || 'COLUMN';
    }));
  }

  ngOnDestroy() {
    // this.formModalService.sendDestroyFormEvent();
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
