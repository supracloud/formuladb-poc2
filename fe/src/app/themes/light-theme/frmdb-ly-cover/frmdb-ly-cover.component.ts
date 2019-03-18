import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'frmdb-ly-cover',
  templateUrl: './frmdb-ly-cover.component.html',
  styleUrls: ['./frmdb-ly-cover.component.scss'],
  host: {
    '[class.frmdb-layout]': 'true',
  }
})
export class FrmdbLyCoverComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
