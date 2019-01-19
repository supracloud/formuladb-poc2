import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { ToggleFormulaEditorDirective } from './toggle-formula-editor.directive';
import { CurrentFormulaDirective } from './current-formula.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormulaCodeEditorComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective
    ],
  exports: [
    FormulaCodeEditorComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective]
})
export class FormulaEditorModule { }
