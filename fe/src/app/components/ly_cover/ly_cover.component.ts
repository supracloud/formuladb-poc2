import { Component, OnInit, Input } from '@angular/core';
import { BaseLayoutComponent } from '../base-layout.component';

@Component({
  selector: 'frmdb-ly_cover',
  templateUrl: './ly_cover.component.html',
  styleUrls: ['./ly_cover.component.scss']
})
export class LyCoverComponent extends BaseLayoutComponent implements OnInit {

  @Input()
  brandName: string = 'Cover';

  @Input()
  hNav: boolean = true;

  @Input()
  vNav: boolean = true;

  ngOnInit() {
  }

}
