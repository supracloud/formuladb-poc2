import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromForm from '../form.state';
import { BaseNodeComponent } from '../base_node';

@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss']
})
export class EditPanelComponent implements OnInit {

  @Input("node")
  node:BaseNodeComponent;

  constructor(private store: Store<fromForm.FormState>) { }

  ngOnInit() {
  }


  highlight(id: any) {
    this.store.dispatch(new fromForm.FormItemHighlightAction(id));
  }

}
