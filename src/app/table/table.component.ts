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

    constructor(private store: Store<tableState.State>, private router: Router, private route: ActivatedRoute) {
        try {
            this.table$ = store.select(tableState.getTableState);
            this.data$ = store.select(tableState.getTableDataState);
            this.table$.subscribe(x => console.log("TABLE:", x, x.columns));
        } catch (ex) {
            console.error(ex);
        }
    }

    onRowDoubleClicked(row: tableState.DataObj) {
        console.log('MwzTableComponent: onRowDoubleClicked: ', row);
        this.router.navigate(['./' + row._id], { relativeTo: this.route });
    }

}
