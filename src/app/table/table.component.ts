import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import * as tableState from './table.state';
import { HighlightService } from '../services/hightlight.service';

@Component({
    moduleId: module.id,
    selector: 'mwz-table',
    templateUrl: 'table.component.html',
    styleUrls: ['table.component.scss']
})

export class TableComponent {
    private table$: Observable<tableState.Table>;
    private data$: Observable<tableState.DataObj[]>;
    private selectedRowIdx: number;
    private highlighted: string;

    constructor(private store: Store<tableState.TableState>, private router: Router, private route: ActivatedRoute, private highlightSvc: HighlightService) {
        try {
            this.table$ = store.select(tableState.getTableState);
            this.data$ = store.select(tableState.getTableDataState);
            this.table$.subscribe(x => console.log("TABLE:", x, (x || new tableState.Table()).columns));
            this.highlightSvc.highlighted$.subscribe(h => this.highlighted = h);
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
