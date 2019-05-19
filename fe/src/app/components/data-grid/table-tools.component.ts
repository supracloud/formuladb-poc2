import { Component, ViewChild, ViewContainerRef, NgZone, OnInit, OnDestroy } from "@angular/core";

import { IToolPanel, IToolPanelParams, GridApi } from "ag-grid-community";
import { FrmdbStreamsService } from "@fe/app/state/frmdb-streams.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Entity } from "@domain/metadata/entity";
import { elvis_a } from "@core/elvis";
import { untilDestroyed } from "ngx-take-until-destroy";
import { DataGrid, NodeType } from "@domain/uimetadata/node-elements";
import { calcBindingFlags } from "@angular/core/src/view/util";

@Component({
    selector: 'custom-stats',
    templateUrl: 'table-tools.component.html', 
    styleUrls: ['table-tools.component.scss'],
})
export class TableToolsComponent implements IToolPanel, OnInit, OnDestroy {

    private params: IToolPanelParams;
    private gridApi: GridApi;
    private currentEntity: Entity | undefined;
    private currentTable: DataGrid | undefined;

    constructor(public frmdbStreams: FrmdbStreamsService,
        private router: Router,
        private route: ActivatedRoute,
        private _ngZone: NgZone) {
        // tslint:disable-next-line:max-line-length
    }

    ngOnInit(): void {
        console.debug("ngOnInit");
        this.frmdbStreams.entity$.pipe(untilDestroyed(this)).subscribe(e => this.currentEntity = e);
        this.frmdbStreams.page$.pipe(untilDestroyed(this)).subscribe(t => 
            this.currentTable = (t.childNodes||[]).find(cn => cn.nodeType == NodeType.data_grid) as DataGrid
        );
    }

    ngOnDestroy(): void {
    }
    
    agInit(params: IToolPanelParams): void {
        this.params = params;
        this.gridApi = this.params.api;
        // calculate stats when new rows loaded, i.e. onModelUpdated
        // this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
    }

    refresh(): void {
        console.error("Method not implemented.");
    }


    excel() {
        if (!this.gridApi || !this.currentTable) return;

        this.gridApi.exportDataAsExcel({
            headerRowHeight: 100,
            columnKeys: (this.currentTable.columns||[]).filter(c => !c.skipExportExcel).map(c => c.name)
        });
    }


    addRow() {
        this._ngZone.run(() => {
            if (this.currentEntity) {
                this.router.navigate(['./' + this.currentEntity._id + '~~'], { relativeTo: this.route });
            }
        })
    }

    deleteRow() {
        let nodes = this.gridApi.getSelectedNodes();
        if (nodes && nodes[0] && nodes[0].data && nodes[0].data._id && this.currentEntity) {
            if (confirm("Are you sure you want to delete row " + nodes[0].data._id + " ?")) {
                this.frmdbStreams.userEvents$.next({ type: "UserDeletedFormData", obj: nodes[0].data });
            }
        }
    }
}
