import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {WizEditorModule} from 'src/app/wiz-editor/wiz-editor.module';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { ToggleFormulaEditorDirective } from './toggle-formula-editor.directive';
import { CurrentFormulaDirective } from './current-formula.directive';

@NgModule({
  imports: [
    CommonModule,
    WizEditorModule,
  ],
  declarations: [FormulaCodeEditorComponent, ToggleFormulaEditorDirective, CurrentFormulaDirective],
  exports: [FormulaCodeEditorComponent, ToggleFormulaEditorDirective, CurrentFormulaDirective]
})
export class FormulaEditorModule { }
