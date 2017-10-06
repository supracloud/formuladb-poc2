import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import { TableService, DataObj } from "./table.service";

@Component({
    moduleId: module.id,
    selector: 'mwz-table',
    template: `
<table class="table table-bordered table-sm mwz-data-table">
    <thead>
        <tr>
            <th>#</th>
            <th *ngFor="let prop of (this.tableService.table$ | async)?.columns">{{prop.name}}</th>
        </tr>
    </thead>
    <tbody>
        <tr *ngFor="let row of (this.tableService.data$ | async)">
            <td>{{idx}}</td>
            <td *ngFor="let prop of (this.tableService.table$ | async)?.columns" (dblclick)="onRowDoubleClicked(row)" data-toggle="tooltip" data-placement="top" title="{{row[prop.name]}}">{{row[prop.name]}}</td>
        </tr>
    </tbody>
</table>
<mwz-modal><router-outlet></router-outlet></mwz-modal>
    `
})

export class TableComponent {
    private path: string;

    constructor(private tableService: TableService, private router: Router) {
    }

    onRowDoubleClicked(row: DataObj) {
        console.log('MwzTableComponent: onRowDoubleClicked: ', row);
        this.router.navigate([this.path, row._id]);
    }
}
