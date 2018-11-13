/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { MaterialDashboardThemeRoutingModule } from './material-dashboard-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { FrmdbModule } from '../../frmdb/frmdb.module';
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationSegment } from './navigation/navigation.segment';
import { ThemeEditorComponent } from './theme-editor/theme-editor.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { FormulaEditorModule } from 'src/app/formula-editor/formula-editor.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialDashboardThemeRoutingModule,
    NgbModule,
    FrmdbModule,
    CrosscuttingModule,
    FormulaEditorModule
  ],
  declarations: [
    LayoutComponent,
    NavigationComponent,
    NavigationSegment,
    ThemeEditorComponent,
    TopNavComponent,
  ]
})
export class MaterialDashboardThemeModule { 
  constructor() {
    console.log("MaterialDashboardThemeModule");
  }
}
