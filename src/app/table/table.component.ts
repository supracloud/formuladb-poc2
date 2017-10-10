import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import * as tableState from './table.state';
import { TableService } from "./table.service";

@Component({
    moduleId: module.id,
    selector: 'mwz-table',
    template: `
<table class="table table-bordered table-sm mwz-data-table">
    <thead>
        <tr>
            <th>#</th>
            <th *ngFor="let prop of (table$ | async)?.columns">{{prop.name}}</th>
        </tr>
    </thead>
    <tbody>
        <tr *ngFor="let row of (data$ | async)">
            <td>{{idx}}</td>
            <td *ngFor="let prop of (table$ | async)?.columns" (dblclick)="onRowDoubleClicked(row)" data-toggle="tooltip" data-placement="top" title="{{row[prop.name]}}">{{row[prop.name]}}</td>
        </tr>
    </tbody>
</table>
<mwz-modal><router-outlet></router-outlet></mwz-modal>
    `
})

export class TableComponent {
    private table$: Observable<tableState.Table>;
    private data$: Observable<tableState.DataObj[]>;

    constructor(private store: Store<tableState.State>, private tableService: TableService) {
        this.table$ = store.select(tableState.getTableState);
        this.data$ = store.select(tableState.getTableDataState);
        this.table$.subscribe(x => console.log("TABLE:", x, x.columns));
    }

    onRowDoubleClicked(row: tableState.DataObj) {
        console.log('MwzTableComponent: onRowDoubleClicked: ', row);
        // this.store.dispatch(new tableState.TableRowChosenAction(row));
        this.tableService.selectTableRow(row);
    }

}
