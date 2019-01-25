import { Component, OnInit, Input } from '@angular/core';
import { faCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'frmdb-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {
  @Input()
  imgSrc: string;

  @Input()
  appName: string;

  selectIcon = faCheckCircle;

  constructor() { }

  ngOnInit() {
  }

}
