/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { OnChanges, OnInit, OnDestroy, Component, HostBinding, Input } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { CardContainer, NodeElement, BaseNodeElement, CssForNodeElement } from '@core/domain/uimetadata/node-elements';

import { DomSanitizer } from '@angular/platform-browser';
import { FormEditingService } from '../form-editing.service';
import { elvis } from '@core/elvis';
import { FormArray, AbstractControl } from '@angular/forms';
import { TableService } from '@fe/app/effects/table.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { FrmdbFormControl, FrmdbFormGroup } from '../frmdb-page.component';
import { BaseTableComponent } from '../base-table.component';
import { FrmdbLy } from '@core/domain/uimetadata/page';
import { PickOmit } from '@core/ts-utils';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-card_container',
    templateUrl: './card_container.component.html',
    styleUrls: ['./card_container.component.scss'],
})
export class CardContainerComponent extends BaseTableComponent implements OnInit, OnChanges, OnDestroy {
    
    cardContainer: CardContainer;

    getCssClasses(nodeEl: CssForNodeElement): string {
        let ret = super.getCssClasses(nodeEl);
        if (this.cardContainer.layout == FrmdbLy.ly_grid) {
            return ret + ' card-group';
        } else if (this.cardContainer.layout == FrmdbLy.ly_cards) {
            return ret + ' card-deck';
        } else if (this.cardContainer.layout == FrmdbLy.ly_mosaic) {
            return ret + ' card-columns';
        } else return ret;
    }

    get cardCssClasses() {
        return super.getCssClasses(this.cardContainer.card);
    }

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
