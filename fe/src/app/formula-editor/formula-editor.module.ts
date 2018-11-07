import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/tern';

import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { FormulaPreviewComponent } from './formula-preview/formula-preview.component';
import { FormulaPreviewItemComponent } from './formula-preview/formula-preview-item.component';

@NgModule({
  imports: [
    CommonModule,
    CodemirrorModule
  ],
  declarations: [FormulaCodeEditorComponent, FormulaPreviewComponent, FormulaPreviewItemComponent]
})
export class FormulaEditorModule { }
