/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormTableComponent as FormTableComponentBase } from '@fe/app/form/form_table/form_table.component';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

@Component({
  selector: '[form_table]',
  host: { class: "col form-group" },
  templateUrl: '../../../../form/form_table/form_table.component.html',
  styleUrls: ['../../../../form/form_table/form_table.component.scss']
})
export class FormTableComponent extends FormTableComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}
