import { Component, OnInit, Input } from '@angular/core';
import { IconDefinition, faCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'frmdb-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {
  @Input()
  icon1: IconDefinition;

  @Input()
  icon2: IconDefinition;

  @Input()
  appName: string;

  selectIcon = faCheckCircle;

  constructor() { }

  ngOnInit() {
    console.log("ICONSSS", this.appName, this.icon1, this.icon2);
  }

}
