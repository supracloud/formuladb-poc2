import { Component, OnInit } from '@angular/core';
import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';
import { BaseNodeComponent } from '../base_node';

export class TimelineComponent extends BaseNodeComponent implements OnInit {

  constructor(public frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }

  ngOnInit() {
  }

}
