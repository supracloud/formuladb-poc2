/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { OnChanges, OnInit, OnDestroy, Component, HostBinding, Input } from '@angular/core';
import { BaseNodeComponent } from './base_node';
import { TableNodeElement } from '@core/domain/uimetadata/node-elements';

import { FormEditingService } from './form-editing.service';
import { elvis } from '@core/elvis';
import { FormArray, AbstractControl, FormGroup } from '@angular/forms';
import { TableService } from '@fe/app/effects/table.service';
import { FrmdbFormControl, FrmdbFormGroup } from './frmdb-page.component';

export class BaseTableComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {
    
    tableElement: TableNodeElement;
    
    data: any;
    frameworkComponents: any;
    defaultColDef: any;
    public referencedTableRowsAsFormGroups: AbstractControl[];
    
    constructor(public formEditingService: FormEditingService, 
        private tableService: TableService
    ){
        super(formEditingService);
    }
    
    ngOnInit() {
        this.tableElement = this.nodel as TableNodeElement;
        console.log(this.fullpath, this.formgrp, this.nodel);
        this.getReferencedTableRows();
    }

    getReferencedTableRows() {
        if (!this.tableService) return [];
        
        if (!this.tableElement.tableName && this.tableElement.refEntityName) {
            this.tableService.getTableRows(this.tableElement.refEntityName, {
                request: {
                    startRow: 0, 
                    endRow: 100,
                    rowGroupCols: [], 
                    valueCols: [], 
                    pivotCols: [], 
                    pivotMode: false, 
                    groupKeys: [], 
                    filterModel: {}, 
                    sortModel: []
                },
                successCallback: (rowsThisPage: any[], lastRow: number) => {
                    try {
                        let controls: AbstractControl[] = [];
                        rowsThisPage.forEach((row, idx) => {
                            let rowCtrl = new FrmdbFormGroup('' + idx);
                            this.formEditingService.updateFormGroupWithData(row, rowCtrl, this.rdonly);
                            controls.push(rowCtrl);
                        })
                        this.referencedTableRowsAsFormGroups = controls;
                        this.formEditingService.formChangeDetectorRef.detectChanges();
                    } catch (err) {
                        console.warn(err); throw err;
                    }
                },
                failCallback: () => {console.error("Failed to get data from server")},
            });

        }
    }
    
    ngOnChanges() {
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
}
