/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";
import { FormTabsComponent  as FormTabsComponentBase} from '@fe/app/form/form_tabs/form_tabs.component';



import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

@Component({
    selector: '[form_tabs]',
    templateUrl: '../../../../form/form_tabs/form_tabs.component.html',
    styleUrls: ['../../../../form/form_tabs/form_tabs.component.scss']
})
export class FormTabsComponent extends FormTabsComponentBase implements OnInit {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}
