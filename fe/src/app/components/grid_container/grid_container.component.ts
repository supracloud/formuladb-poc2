/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { OnChanges, OnInit, OnDestroy, Component, HostBinding, Input } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { GridContainer, NodeElement, BaseNodeElement, CssForNodeElement, Card, NodeType, GridLayout } from '@domain/uimetadata/node-elements';

import { DomSanitizer } from '@angular/platform-browser';
import { FormEditingService } from '../form-editing.service';
import { elvis } from '@core/elvis';
import { FormArray, AbstractControl } from '@angular/forms';
import { TableService } from '@fe/app/effects/table.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { FrmdbFormControl, FrmdbFormGroup } from '../frmdb-page.component';
import { BaseTableComponent } from '../base-table.component';
import { PickOmit } from '@core/ts-utils';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-grid_container',
    templateUrl: './grid_container.component.html',
    styleUrls: ['./grid_container.component.scss'],
})
export class GridContainerComponent extends BaseTableComponent implements OnInit, OnChanges, OnDestroy {
    
    gridContainer: GridContainer;

    data: any;
    frameworkComponents: any;
    defaultColDef: any;
    childControls: AbstractControl[];
    
    constructor(formEditingService: FormEditingService, tableService: TableService
    ){
        super(formEditingService, tableService);
    }
    
    ngOnInit() {
        this.gridContainer = this.nodel as GridContainer;
        super.ngOnInit();
    }

    ngOnChanges() {
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
}
