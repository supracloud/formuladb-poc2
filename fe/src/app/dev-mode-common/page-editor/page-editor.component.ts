import { Component, OnInit, Input } from '@angular/core';
import { Page } from '@core/domain/uimetadata/page';
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'frmdb-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit {

  addIcon = faPlusCircle;
  delIcon = faMinusCircle;

  @Input()
  page: Page;

  constructor() { }

  ngOnInit() {
  }

}
