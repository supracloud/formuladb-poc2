/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

import { TableColumn, Table } from "@core/domain/uimetadata/table";
import { Observable } from 'rxjs';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';
import { Router, ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { DataObj } from '@core/domain/metadata/data_obj';
import { Entity } from '@core/domain/metadata/entity';

@Component({
  selector: 'frmdb-table_container',
  templateUrl: './table_container.component.html',
  styleUrls: ['./table_container.component.scss']
})
export class TableContainerComponent implements OnInit, OnDestroy {
  private table$: Observable<Table>;
  private table: Table;
  private currentEntity: Entity | undefined;

  constructor(public frmdbStreams: FrmdbStreamsService,
    private router: Router,
    private route: ActivatedRoute,
    private _ngZone: NgZone
  ) {
    this.table$ = frmdbStreams.table$.pipe(untilDestroyed(this));
    this.table$.subscribe(t => this.table = _.cloneDeep(t));
    this.frmdbStreams.entity$.pipe(untilDestroyed(this)).subscribe(e => this.currentEntity = e);
  }

  ngOnInit() {
    console.debug("ngOnInit", this.table$);
  }
  ngOnDestroy(): void {
    console.debug("ngOnDestroy");
  }

  onRowClicked(dataObj: DataObj) {
    this.frmdbStreams.userEvents$.next({ type: "UserSelectedRow", dataObj });
  }

  navigateToFormPage(dataObj: DataObj) {
    if (dataObj._id && this.currentEntity) {
      this._ngZone.run(() => {
        this.router.navigate(['./' + dataObj._id], { relativeTo: this.route });
      })
    }
  }
}
