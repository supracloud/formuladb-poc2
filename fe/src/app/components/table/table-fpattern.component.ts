import {Component, OnInit} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular";
import { DataObj } from "@fe/app/state/app.state";

@Component({
    selector: 'frmdb-table-fpattern-renderer',
    templateUrl: 'table-fpattern.component.html',
})
export class TableFpatternRenderer implements ICellRendererAngularComp, OnInit {
    private params: any;
    dataObj: any;
    
    getProps(dataObj) {
        return Object.keys(dataObj).filter(p => p !== "picture");
    }

    ngOnInit(): void {
        console.debug(this.params);
    }

    // called on init
    agInit(params: any): void {
        console.debug(this.params);
        this.params = params;
        this.dataObj = this.params.data;
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        this.params = params;
        this.dataObj = this.params.data;
        return true;
    }
}
