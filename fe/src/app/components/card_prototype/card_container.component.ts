/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnChanges, OnInit, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { CardContainer } from '@core/domain/uimetadata/form';

import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';
import { Themable } from './themable';
import { DomSanitizer } from '@angular/platform-browser';
import { FormEditingService } from '../form-editing.service';

export class CardContainerComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy, Themable {

  data: any;
  frameworkComponents: any;
  defaultColDef: any;

  constructor(public formEditingService: FormEditingService, private sanitizer: DomSanitizer) {
    super(formEditingService);
  }

  theme: { [key: string]: string };

  get style() {
      return this.sanitizer.bypassSecurityTrustStyle(''
          // Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
      );
  }

  cardContainer: CardContainer;

  ngOnInit() {
    this.cardContainer = this.nodeElement as CardContainer;
    console.log(this.topLevelFormGroup, this.nodeElement);
  }

  ngOnChanges() {
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
