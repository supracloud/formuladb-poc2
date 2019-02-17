import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { ToggleFormulaEditorDirective } from './toggle-formula-editor.directive';
import { CurrentFormulaDirective } from './current-formula.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FrmdbPopupDirective } from './frmdb-popup.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
  ],
  declarations: [
    FormulaCodeEditorComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective,
    FrmdbPopupDirective,
  ],
  exports: [
    FormulaCodeEditorComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective,
    FrmdbPopupDirective,
  ]
})
export class FormulaEditorModule { }
