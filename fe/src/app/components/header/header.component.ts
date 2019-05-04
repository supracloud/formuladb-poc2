import { Component, OnInit } from '@angular/core';
import { Header } from '@core/domain/uimetadata/node-elements';
import { BaseNodeComponent } from '../base_node';
import { FormEditingService } from '../form-editing.service';

@Component({
  selector: 'frmdb-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends BaseNodeComponent implements OnInit {
  header: Header;

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }
  
  ngOnInit() {
    console.debug(this.fullpath, this.nodel);
    this.header = this.nodel as Header;    
  }

}
