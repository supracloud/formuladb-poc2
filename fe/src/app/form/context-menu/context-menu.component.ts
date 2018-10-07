import { Component, OnInit, Input } from '@angular/core';
import { NodeElement } from '../../common/domain/uimetadata/form';

@Component({
  selector: 'form-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  @Input()
  item: NodeElement;

  expanded:boolean=false;

  constructor() { }

  ngOnInit() {
  }

  showContext(){
    this.expanded=true;
  }

  hideContext(){
    this.expanded=false;
  }

}
