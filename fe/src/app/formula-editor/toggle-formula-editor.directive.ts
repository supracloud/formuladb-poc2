import { Directive, HostListener, ElementRef, Component } from '@angular/core';
import { FormulaEditorService } from './formula-editor.service';
import { Subscription } from 'rxjs';
import { NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Hi there!</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>Hello, {{name}}!</p>
      <frmdb-formula-editor-info></frmdb-formula-editor-info>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class FormulaEditorInfoModalComponent {

  constructor(public activeModal: NgbActiveModal) {}
}

@Directive({
  selector: '[frmdbToggleFormulaEditor]'
})
export class ToggleFormulaEditorDirective {
  protected subscriptions: Subscription[] = [];
  private modalRef: undefined | NgbModalRef;

  constructor(private el: ElementRef, private formulaEditorService: FormulaEditorService, private modalService: NgbModal) {
  }

  @HostListener('click') onClick() {
    this.formulaEditorService.toggleFormulaEditor();
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = undefined;
    } else {
      this.modalRef = this.modalService.open(FormulaEditorInfoModalComponent, {
        backdrop: false
      });
    }
  }
}
