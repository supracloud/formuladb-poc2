import { Component, OnInit, Input } from '@angular/core';
import { NodeElement, NodeType } from '../../common/domain/uimetadata/form';
import { Store } from '@ngrx/store';
import * as fromForm from '../form.state';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'form-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  @Input()
  item: NodeElement;

  @Input()
  canDelete?: boolean;

  @Input()
  availableTypes?: NodeType[];

  @Input()
  availableChildren?: NodeElement[];

  expanded = false;

  constructor(private formStore: Store<fromForm.FormState>) {
  }

  ngOnInit() {
  }

  showContext() {
    this.expanded = true;
  }

  hideContext() {
    this.expanded = false;
  }

  delete() {
    this.formStore.dispatch(new fromForm.FormDeleteAction(this.item));
  }

  switchTo(p: NodeType) {
    this.formStore.dispatch(new fromForm.FormSwitchTypeAction({ node: this.item, toType: p }));
  }

  addChild(p: NodeElement) {
    this.formStore.dispatch(new fromForm.FormAddAction({ what: p, to: this.item }));
  }

}
