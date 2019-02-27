import { Component, OnInit } from '@angular/core';
import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  selector: 'frmdb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent extends BaseNodeComponent implements OnInit {

  constructor(public frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }

  ngOnInit() {
  }

}
