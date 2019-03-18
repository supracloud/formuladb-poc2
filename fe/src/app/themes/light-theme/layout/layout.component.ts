/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, DoCheck } from '@angular/core';
import { LayoutComponent as LayoutComponentBase } from '@fe/app/layouts/layout/layout.component';

@Component({
  selector: 'frmdb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent extends LayoutComponentBase implements OnInit, AfterViewInit, OnChanges, DoCheck {


  ngOnInit() {
    console.debug("init");
  }

  
  ngAfterViewInit(): void {
  }

  ngDoCheck(): void {
    console.debug("ngDoCheck");
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    console.debug("ngOnChanges", changes);
  }

}
