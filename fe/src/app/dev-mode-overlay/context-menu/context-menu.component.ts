import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NodeElement, NodeType } from "@core/domain/uimetadata/node-elements";
import { Store } from '@ngrx/store';
import * as fromForm from '../../state/form.state';
import * as fromEntity from '../../state/entity-state';
import { faEllipsisH, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FormItemEditorComponent } from '../form-item-editor/form-item-editor.component';
import { NodeElementDeleteAction, NodeElementSwitchTypeAction } from '@fe/app/actions/page.user.actions';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'form-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  icon = faEllipsisV;

  @ViewChild(FormItemEditorComponent) editor: FormItemEditorComponent;

  @Input()
  parentEl: NodeElement;

  @Input()
  item: NodeElement;

  @Input()
  position: number = 0;

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
    this.formStore.dispatch(new NodeElementDeleteAction(this.parentEl._id, this.item._id));
  }

  switchTo(p: NodeType) {
    this.formStore.dispatch(new NodeElementSwitchTypeAction({ node: this.item, toType: p }));
  }

  edit() {
    this.expanded = false;
    this.editor.open();
  }

  addChild() {
    this.expanded = false;
    this.editor.open();
  }
}
