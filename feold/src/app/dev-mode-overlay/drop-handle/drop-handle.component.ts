import { Component, OnInit, Input, HostBinding, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NodeElement, isNodeElementWithChildren } from "@domain/uimetadata/node-elements";
import { Store } from '@ngrx/store';
import * as fromForm from '../../state/form.state';
import { PageDropAction } from '@fe/app/actions/page.user.actions';
import { FormEditingService } from '@fe/app/components/form-editing.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'drop-handle',
  templateUrl: './drop-handle.component.html',
  styleUrls: ['./drop-handle.component.scss']
})
export class DropHandleComponent implements OnInit, OnDestroy {

  dragover$: Subject<boolean> = new BehaviorSubject(false);

  constructor(protected store: Store<fromForm.FormState>, 
    public formEditingService: FormEditingService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    this.formEditingService.frmdbStreams.devMode$.pipe(untilDestroyed(this)).subscribe(x => this.visible = x);
  }

  
  ngOnInit() {
    this.dragover$.pipe(untilDestroyed(this)).subscribe(x => {
      this.dragOver = x;
      this.changeDetectorRef.detectChanges();
    });
  }

  @Input()
  addedToEl: NodeElement;

  @Input()
  position: number = 0;

  @Input()
  orientation: "vertical" | "horizontal" | "add-new-row";

  @HostBinding("class.vertical")
  get vertical(): boolean { return this.orientation === 'vertical' }

  @HostBinding("class.horizontal")
  get horizontal(): boolean { return this.orientation === 'horizontal' }

  @HostBinding("class.add-new-row")
  get child_order(): boolean { return this.orientation === 'add-new-row' }

  @HostBinding("class.visible")
  visible: boolean = false;

  dragOver: boolean = false;

  @HostBinding("attr.droppable")
  allowDrop: boolean = true;

  @HostListener('dragover', ['$event'])
  onDragOver(e) {
    this.dragover$.next(true);
    e.preventDefault();
  }

  @HostListener('dragleave')
  onDragOut() {
    this.dragover$.next(false);
  }

  @HostListener('drop', ['$event'])
  onDrop($event) {
    this.dragover$.next(false);
    
    let removedFromNodeId = $event.dataTransfer.getData("removedFromNodeId");
    let removedFromPos = $event.dataTransfer.getData("removedFromPos");
    let movedNodeId = $event.dataTransfer.getData("movedNodeId");
    let addedToNodeId = this.addedToEl._id;
    let addedToPos = this.position;

    this.store.dispatch(new PageDropAction(
      removedFromNodeId,
      removedFromPos,
      movedNodeId,
      addedToNodeId,
      addedToPos, 
    ));

    $event.preventDefault();
  }

  ngOnDestroy(): void {
  }

}
