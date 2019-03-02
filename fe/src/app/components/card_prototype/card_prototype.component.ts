import { BaseNodeComponent } from '../base_node';
import { Themable } from './themable';
import { DomSanitizer } from '@angular/platform-browser';
import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';
import { OnInit } from '@angular/core';

export class CardPrototypeComponent extends BaseNodeComponent implements OnInit, Themable {

    constructor(public frmdbStreams: FrmdbStreamsService, private sanitizer: DomSanitizer) {
        super(frmdbStreams);
      }

    theme: { [key: string]: string };

    get style() {
        return this.sanitizer.bypassSecurityTrustStyle(
            Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
        );
    }


    ngOnInit() {

    }
}
