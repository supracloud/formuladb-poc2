import { Component, OnInit } from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'mwz-modal',
  template: `
<div class="mwz-modal" [ngClass]="modalClasses">
    <div class="body rounded container">
        <ng-content></ng-content>
    </div>
</div>  
  `,
  styles: [`
        .mwz-modal {
            background-color: rgba(120, 120, 120, 0.5);
            position: fixed;
            left: 0px;
            top: 0px;
            width: 80%;
            height: 100%;
            z-index: 1050;
            padding: 4%;
            overflow: auto;
        }
        .mwz-modal .body {
            background-color: white;
        }

        .mwz-modal.mwzFormHide {
            top: -200%;
        }
        .mwz-modal.mwzFormShow {
            top: 0px;
        }
    `],
})
export class ModalComponent {
    subscription: Subscription = new Subscription();

    // @ViewChild('theModalEl') modalEl: HTMLElement;
    modalClasses = {
      mwzFormHide: true,
      mwzFormShow: false
    };
  
    constructor(private formModalService: FormModalService) {
        this.subscription.add(formModalService.gridsterFormFinishedRendering$.subscribe(() => {
            this.modalClasses.mwzFormHide = false;
            this.modalClasses.mwzFormShow = true;
        }));
        this.subscription.add(formModalService.destroyForm$.subscribe(() => {
            this.modalClasses.mwzFormHide = true;
            this.modalClasses.mwzFormShow = false;
        }));
    }  

    ngOnDestroy() {
        // prevent memory leak when component destroyed
        this.subscription.unsubscribe();
    }
  
}
