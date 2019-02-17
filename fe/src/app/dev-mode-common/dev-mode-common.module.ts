import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { DevModeOptsComponent } from './dev-mode-opts/dev-mode-opts.component';
import { CrosscuttingModule } from '../crosscutting/crosscutting.module';
import { FormulaEditorModule } from '../formula-editor/formula-editor.module';

@NgModule({
  imports: [
    CommonModule,
    CrosscuttingModule,
    FontAwesomeModule,
    NgbModule,
    FormulaEditorModule,
  ],
  declarations: [DevModeOptsComponent],
  exports: [DevModeOptsComponent],
})
export class DevModeCommonModule { }
