import { OnInit, OnDestroy } from '@angular/core';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

export class HNavComponent implements OnInit, OnDestroy {

  constructor(public frmdbStreams: FrmdbStreamsService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
