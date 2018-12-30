import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { ToggleFormulaEditorDirective } from './toggle-formula-editor.directive';
import { CurrentFormulaDirective } from './current-formula.directive';
import { FormulaEditorInfoComponent } from './formula-editor-info/formula-editor-info.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormulaCodeEditorComponent, 
    FormulaEditorInfoComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective, 
    FormulaEditorInfoComponent],
  exports: [
    FormulaCodeEditorComponent, 
    FormulaEditorInfoComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective]
})
export class FormulaEditorModule { }
