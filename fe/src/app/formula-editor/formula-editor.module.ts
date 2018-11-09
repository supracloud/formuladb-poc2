import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {WizEditorModule} from 'src/app/wiz-editor/wiz-editor.module';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { FormulaPreviewComponent } from './formula-preview/formula-preview.component';
import { FormulaPreviewItemComponent } from './formula-preview/formula-preview-item.component';

@NgModule({
  imports: [
    CommonModule,
    WizEditorModule,
  ],
  declarations: [FormulaCodeEditorComponent, FormulaPreviewComponent, FormulaPreviewItemComponent],
  exports: [FormulaCodeEditorComponent, FormulaPreviewComponent, FormulaPreviewItemComponent]
})
export class FormulaEditorModule { }
