/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormDataGridComponent as FormDataGridComponentBase } from '@fe/app/form/form_data_grid/form_data_grid.component';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

@Component({
  selector: '[form_data_grid]',
  templateUrl: '../../../../form/form_data_grid/form_data_grid.component.html',
  styleUrls: ['../../../../form/form_data_grid/form_data_grid.component.scss']
})
export class FormDataGridComponent extends FormDataGridComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}
