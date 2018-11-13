import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {WizEditorModule} from 'src/app/wiz-editor/wiz-editor.module';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { ToggleFormulaEditorDirective } from './toggle-formula-editor.directive';
import { CurrentFormulaDirective } from './current-formula.directive';
import { FormulaEditorInfoComponent } from './formula-editor-info/formula-editor-info.component';

@NgModule({
  imports: [
    CommonModule,
    WizEditorModule,
  ],
  declarations: [FormulaCodeEditorComponent, FormulaEditorInfoComponent, ToggleFormulaEditorDirective, CurrentFormulaDirective, FormulaEditorInfoComponent],
  exports: [FormulaCodeEditorComponent, FormulaEditorInfoComponent, ToggleFormulaEditorDirective, CurrentFormulaDirective]
})
export class FormulaEditorModule { }
