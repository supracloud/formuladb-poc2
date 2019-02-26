/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";
import { FormHorizontalLayoutComponent as FormHorizontalLayoutComponentBase } from '@fe/app/form/form-horizontal-layout/form-horizontal-layout.component';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

@Component({
    selector: 'h-layout',
    templateUrl: '../../../../form/form-horizontal-layout/form-horizontal-layout.component.html',
    styleUrls: ['../../../../form/form-horizontal-layout/form-horizontal-layout.component.scss']
})
export class FormHorizontalLayoutComponent extends FormHorizontalLayoutComponentBase implements OnInit {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}
