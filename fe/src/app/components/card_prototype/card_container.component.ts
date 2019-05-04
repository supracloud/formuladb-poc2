/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnChanges, OnInit, OnDestroy, Component, HostBinding, Input } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { CardContainer } from '@core/domain/uimetadata/node-elements';

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
  @HostBinding('class') tmp: string = elvis(this.cardContainer).layout || "";
  
  @Input()
  horizontal: boolean = false;
  
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
