import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NodeElement, NodeType } from '@storage/domain/uimetadata/form';
import { Store } from '@ngrx/store';
import * as fromForm from '../form.state';
import * as fromEntity from '../../entity-state';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FormItemEditorComponent } from '../form-item-editor/form-item-editor.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'form-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  icon = faEllipsisH;

  @ViewChild(FormItemEditorComponent) editor: FormItemEditorComponent;

  @Input()
  item: NodeElement;

  @Input()
  canDelete?: boolean;

  @Input()
  availableTypes?: NodeType[];

  @Input()
  availableChildren?: NodeElement[];

  entity: fromEntity.Entity | undefined;

  expanded = false;
  x = 0;
  y = 0;

  constructor(private formStore: Store<fromForm.FormState>,
    private entityStore: Store<fromEntity.EntityState>) {
    this.entityStore.select(fromEntity.getSelectedEntityState).subscribe(s => this.entity = s);
  }

  get entityProperties(): string[] {
    if (this.entity) {
      return Object.keys(this.entity.props);
    }
    return [];
  }

  ngOnInit() {
  }

  toggleContext(e: any) {
    this.expanded = !this.expanded;
    if (this.expanded) {
      if (window.innerWidth - e.clientX < 200) {
        this.x = e.clientX - 180;
      } else {
        this.x = e.clientX + 10;
      }
      this.y = e.clientY;
    }
  }

  delete() {
    this.formStore.dispatch(new fromForm.FormDeleteAction(this.item));
  }

  switchTo(p: NodeType) {
    this.formStore.dispatch(new fromForm.FormSwitchTypeAction({ node: this.item, toType: p }));
  }

  // addChild(p: NodeElement) {
  //   this.formStore.dispatch(new fromForm.FormAddAction({ what: p, to: this.item }));
  // }

  edit() {
    this.expanded = false;
    this.editor.open();
  }

  addChild() {
    this.expanded = false;
    this.editor.open();
  }
}
