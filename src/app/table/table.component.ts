import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import * as tableState from './table.state';

@Component({
    moduleId: module.id,
    selector: 'mwz-table',
    template: `
<table class="table table-bordered table-sm table-striped table-hover mwz-data-table">
    <thead>
        <tr>
            <th>#</th>
            <th *ngFor="let prop of (table$ | async)?.columns">{{prop.name}}</th>
        </tr>
    </thead>
    <tbody>
        <tr *ngFor="let row of (data$ | async); let rowIdx = index" (dblclick)="onEditClicked(row)" [class.table-primary]='rowIdx == selectedRowIdx'>
            <td><button (click)="onEditClicked(row)" *ngIf="rowIdx == selectedRowIdx"><i class="fa fa-pencil"></i></button> {{rowIdx + 1}}</td>
            <td *ngFor="let prop of (table$ | async)?.columns" (click)="onRowClicked(rowIdx, row)" data-toggle="tooltip" data-placement="top" title="{{row[prop.name]}}">{{row[prop.name]}}</td>
        </tr>
    </tbody>
</table>
<mwz-modal><router-outlet></router-outlet></mwz-modal>
    `
})

export class TableComponent {
    private table$: Observable<tableState.Table>;
    private data$: Observable<tableState.DataObj[]>;
    private selectedRowIdx: number;

    constructor(private store: Store<tableState.TableState>, private router: Router, private route: ActivatedRoute) {
        try {
            this.table$ = store.select(tableState.getTableState);
            this.data$ = store.select(tableState.getTableDataState);
            this.table$.subscribe(x => console.log("TABLE:", x, (x||new tableState.Table()).columns));
        } catch (ex) {
            console.error(ex);
        }
    }

    onRowClicked(rowIdx: number, row: tableState.DataObj) {
        this.selectedRowIdx = rowIdx;
        console.log('MwzTableComponent: onRowClicked: ', row);
    }

    onEditClicked(row: tableState.DataObj) {
        this.router.navigate(['./' + row._id], { relativeTo: this.route });
    }

}
