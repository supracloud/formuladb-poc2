import { Component, OnInit } from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'mwz-modal',
  templateUrl: "modal.component.html",
  styleUrls:["modal.component.scss"]
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
