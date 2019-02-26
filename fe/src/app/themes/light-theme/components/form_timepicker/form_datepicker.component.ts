/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormTimepickerComponent as FormTimepickerComponentBase } from '@fe/app/form/form_timepicker/form_timepicker.component';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

@Component({
  selector: 'form-timepicker',
  templateUrl: '../../../../form/form_timepicker/form_timepicker.component.html',
})
export class FormTimepickerComponent extends FormTimepickerComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}
