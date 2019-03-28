/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnChanges, OnInit, OnDestroy, Component } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { NodeElement, NodeType, TableNodeElement, FormDataGrid } from "@core/domain/uimetadata/form";

import { CircularJSON } from "@core/json-stringify";

import { Pn, Entity } from "@core/domain/metadata/entity";
import { FormEditingService } from '../form-editing.service';
import { DataObj } from '@core/domain/metadata/data_obj';
import { Subject, ReplaySubject } from 'rxjs';
import { Table } from '@core/domain/uimetadata/table';
import { BackendService } from '@fe/app/effects/backend.service';
import { autoLayoutTable } from '../auto-layout-table';
import { FrmdbLy } from '@core/domain/uimetadata/page';

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-form_data_grid]',
    templateUrl: './form_data_grid.component.html',
    styleUrls: ['./form_data_grid.component.scss']
})
export class FormDataGridComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {

    data: any;
    frameworkComponents: any;
    defaultColDef: any;
    table$: Subject<Table> = new ReplaySubject();

    constructor(formEditingService: FormEditingService, private backendSevice: BackendService) {
        super(formEditingService);
    }

    dataGridElement: FormDataGrid;

    // [tableObservable]="table$"
    onRowClicked(dataObj: DataObj) {
        if (!this.dataGridElement) return;
        for (let prop of this.dataGridElement.properties) {
            let ctrl = this.formgrp.get(this.getPropPath(prop));
            if (ctrl) {
                ctrl.setValue(dataObj[prop.refPropertyName]);
                ctrl.markAsDirty();
            }
        }
    }

    navigateToFormPage(dataObj: DataObj) {
    }

    getPropPath(prop: { propertyName: string }) {
        return (this.fullpath ? this.fullpath + '.' : '') + prop.propertyName;
    }

    async ngOnInit() {
        console.debug(this.fullpath, this.nodel, this.formgrp);
        this.dataGridElement = this.nodel as FormDataGrid;
        let entity = await this.backendSevice.getEntity(this.dataGridElement.refEntityName);
        this.table$.next(autoLayoutTable(null, entity, this.dataGridElement.layout));
    }

    ngOnChanges() {
        console.log(this.nodel, this.formgrp);
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    getType(child: NodeElement): string {
        if (child.nodeType !== NodeType.form_input) {
            throw new Error('form-input node element is wrong: ' + CircularJSON.stringify(this.nodel));
        }
        if (child.propertyType === Pn.NUMBER) { return 'number'; } else { return 'text'; }
    }

}
