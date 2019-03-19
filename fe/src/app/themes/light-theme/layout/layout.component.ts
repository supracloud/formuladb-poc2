/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, DoCheck } from '@angular/core';
import { LayoutComponent as LayoutComponentBase } from '@fe/app/layouts/layout.component';

import { FormEditingService } from '@fe/app/components/form-editing.service';

@Component({
  selector: 'frmdb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent extends LayoutComponentBase implements OnInit, AfterViewInit, OnChanges, DoCheck {

  constructor(formEditingService: FormEditingService, changeDetectorRef: ChangeDetectorRef) {
    super(formEditingService, changeDetectorRef);
  }

  ngOnInit() {
    super.ngOnInit();
    console.debug("ngOnInit", this.layout);
  }
  
  ngAfterViewInit(): void {
    console.debug("ngAfterViewInit", this.layout);
  }

  ngDoCheck(): void {
    console.debug("ngDoCheck", this.layout);
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    console.debug("ngOnChanges", changes);
  }

}
