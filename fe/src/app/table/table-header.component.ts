import {Component, ViewChild, ElementRef} from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as appState from '../app.state';

@Component({
    selector: 'app-loading-overlay',
    templateUrl: 'table-header.component.html',
    styleUrls: ['table-header.component.scss']
})
export class TableHeaderComponent {
    public params: any;

    private ascSort: string;
    private descSort: string;
    private noSort: string;
    public devMode$: Observable<boolean>;

    constructor(protected store: Store<appState.EntityState>) {
        this.devMode$ = store.select(appState.getDeveloperMode);
    }

    @ViewChild('menuButton', {read: ElementRef}) public menuButton;

    agInit(params): void {
        this.params = params;

        params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    onMenuClicked() {
        this.params.showColumnMenu(this.menuButton.nativeElement);
    };

    selectColumn(colName: string) {
        this.store.dispatch(new appState.UserSelectCell(colName));
    }

    onSortChanged() {
        this.ascSort = this.descSort = this.noSort = 'inactive';
        if (this.params.column.isSortAscending()) {
            this.ascSort = 'active';
        } else if (this.params.column.isSortDescending()) {
            this.descSort = 'active';
        } else {
            this.noSort = 'active';
        }
    }

    onSortRequested(order, event) {
        this.params.setSort(order, event.shiftKey);
    }
}