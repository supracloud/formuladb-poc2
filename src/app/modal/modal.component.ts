import { Component, OnInit, HostBinding } from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { Subscription } from 'rxjs/Subscription';
import { HighlightService } from '../services/hightlight.service';

@Component({
    selector: 'mwz-modal',
    templateUrl: "modal.component.html",
    styleUrls: ["modal.component.scss"]
})
export class ModalComponent {
    subscription: Subscription = new Subscription();

    @HostBinding('class.mwzFormHide')
    mwzFormHide = true;

    private highlighted:string;

    constructor(private formModalService: FormModalService,private highlightSvc:HighlightService) {
        this.subscription.add(formModalService.gridsterFormFinishedRendering$.subscribe(() => {
            this.mwzFormHide = false;
        }));
        this.subscription.add(formModalService.destroyForm$.subscribe(() => {
            this.mwzFormHide = true;
        }));
        this.subscription.add(highlightSvc.highlighted$.subscribe((h)=>this.highlighted=h));
    }

    ngOnDestroy() {
        // prevent memory leak when component destroyed
        this.subscription.unsubscribe();
    }

}
