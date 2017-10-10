import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as tableState from './table.state';

@Injectable()
export class TableService {

  constructor(private router: Router, private route: ActivatedRoute) { }

  public selectTableRow(row: tableState.DataObj) {
    this.router.navigate([row._id], { relativeTo: this.route });
  }
}
