import { BaseNodeComponent } from "../base_node";
import { OnInit, Input, Component, HostBinding } from "@angular/core";
import { Themable } from "./themable";
import { DomSanitizer } from "@angular/platform-browser";
import { FormItemComponent } from "../form_item/form_item.component";
import { FrmdbStreamsService } from "@fe/app/frmdb-streams/frmdb-streams.service";

@Component({
    selector: 'frmdb-card_prototype',
    templateUrl: 'card_prototype.component.html',
    styleUrls: ['card_prototype.component.scss']
})
export class CardPrototypeComponent extends FormItemComponent implements OnInit, Themable {

    constructor(public frmdbStreams: FrmdbStreamsService, private sanitizer: DomSanitizer) {
        super(frmdbStreams);
      }

    @Input()
    theme: { [key: string]: string };

    @HostBinding('style')
    get style() {
        return this.sanitizer.bypassSecurityTrustStyle(
            Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
        );
    }


    ngOnInit() {

    }
}