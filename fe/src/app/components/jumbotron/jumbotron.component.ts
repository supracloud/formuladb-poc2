import { Component, OnInit, HostBinding } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { FormEditingService } from '../form-editing.service';
import { Jumbotron } from '@core/domain/uimetadata/form';
import { elvis } from '@core/elvis';

@Component({
  selector: '[frmdb-jumbotron]',
  templateUrl: './jumbotron.component.html',
  styleUrls: ['./jumbotron.component.scss'],
  host: {
    '[class.jumbotron]': 'true',
  }

})
export class JumbotronComponent extends BaseNodeComponent implements OnInit {
  jumbotron: Jumbotron;
  @HostBinding('class') tmp: string = elvis(this.jumbotron).style || "jumbotron";

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
    console.debug(this.fullpath, this.nodel);
    this.jumbotron = this.nodel as Jumbotron;
  }
}
