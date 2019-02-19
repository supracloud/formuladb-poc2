import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { GridsterModule } from 'angular-gridster2';

import { DevModeOptsComponent } from './dev-mode-opts/dev-mode-opts.component';
import { CrosscuttingModule } from '../crosscutting/crosscutting.module';
import { FormulaCodeEditorComponent } from './formula-code-editor/formula-code-editor.component';
import { ToggleFormulaEditorDirective } from './toggle-formula-editor.directive';
import { CurrentFormulaDirective } from './current-formula.directive';
import { FrmdbPopupDirective } from './frmdb-popup.directive';
import { FormsModule } from '@angular/forms';
import { NumberPropEditorComponent } from './number-prop-editor/number-prop-editor.component';
import { StringPropEditorComponent } from './string-prop-editor/string-prop-editor.component';
import { ReferenceToPropEditorComponent } from './reference-to-prop-editor/reference-to-prop-editor.component';
import { DatetimePropEditorComponent } from './datetime-prop-editor/datetime-prop-editor.component';
import { DurationPropEditorComponent } from './duration-prop-editor/duration-prop-editor.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CrosscuttingModule,
    FontAwesomeModule,
    NgbModule,
    GridsterModule,
  ],
  declarations: [
    DevModeOptsComponent,
    FormulaCodeEditorComponent, 
    ToggleFormulaEditorDirective, 
    CurrentFormulaDirective,
    FrmdbPopupDirective,
    NumberPropEditorComponent,
    StringPropEditorComponent,
    ReferenceToPropEditorComponent,
    DatetimePropEditorComponent,
    DurationPropEditorComponent,
  ],
  exports: [
    DevModeOptsComponent,
    FormulaCodeEditorComponent,
  ],
})
export class DevModeCommonModule { }
