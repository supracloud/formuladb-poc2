/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnChanges, OnInit, OnDestroy, Component, HostBinding } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { CardContainer } from '@core/domain/uimetadata/form';

import { DomSanitizer } from '@angular/platform-browser';
import { FormEditingService } from '../form-editing.service';
import { elvis } from '@core/elvis';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-card_container',
  templateUrl: './card_container.component.html',
  styleUrls: ['./card_container.component.scss']
})
export class CardContainerComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {

  cardContainer: CardContainer;
  @HostBinding('class.card-deck') s1: boolean = elvis(this.cardContainer).style == null || elvis(this.cardContainer).style == "deck";
  @HostBinding('class.card-group') s2: boolean = elvis(this.cardContainer).style == "group";
  @HostBinding('class.card-columns') s3: boolean = elvis(this.cardContainer).style == "masonry";
  
  data: any;
  frameworkComponents: any;
  defaultColDef: any;

  constructor(public formEditingService: FormEditingService, private sanitizer: DomSanitizer) {
    super(formEditingService);
  }

  ngOnInit() {
    this.cardContainer = this.nodel as CardContainer;
    console.log(this.fullpath, this.formgrp, this.nodel);
  }

  ngOnChanges() {
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
