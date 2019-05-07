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
import { FormArray, AbstractControl } from '@angular/forms';
import { TableService } from '@fe/app/effects/table.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { FrmdbFormControl, FrmdbFormGroup } from '../frmdb-page.component';
import { BaseTableComponent } from '../base-table.component';
import { FrmdbLy } from '@core/domain/uimetadata/page';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-card_container',
    templateUrl: './card_container.component.html',
    styleUrls: ['./card_container.component.scss'],
    host: {
        '[class.card-group]': 'card_group',
        '[class.card-deck]': 'card_deck',
        '[class.card-columns]': 'card_columns',
    }
})
export class CardContainerComponent extends BaseTableComponent implements OnInit, OnChanges, OnDestroy {
    
    cardContainer: CardContainer;

    get card_group() { 
        return elvis(this.cardContainer).layout == FrmdbLy.ly_grid;
    }
    get card_deck() { return elvis(this.cardContainer).layout == FrmdbLy.ly_cards; }
    get card_columns() { return elvis(this.cardContainer).layout == FrmdbLy.ly_mosaic; }
    
    data: any;
    frameworkComponents: any;
    defaultColDef: any;
    childControls: AbstractControl[];
    
    constructor(formEditingService: FormEditingService, tableService: TableService
    ){
        super(formEditingService, tableService);
    }
    
    ngOnInit() {
        this.cardContainer = this.nodel as CardContainer;
        super.ngOnInit();
    }

    ngOnChanges() {
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
}
