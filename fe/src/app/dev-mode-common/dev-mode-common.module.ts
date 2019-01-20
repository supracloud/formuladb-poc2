import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DevModeOptsComponent } from './dev-mode-opts/dev-mode-opts.component';
import { CrosscuttingModule } from '../crosscutting/crosscutting.module';

@NgModule({
  imports: [
    CommonModule,
    CrosscuttingModule,
    FontAwesomeModule,
  ],
  declarations: [DevModeOptsComponent],
  exports: [DevModeOptsComponent],
})
export class DevModeCommonModule { }
