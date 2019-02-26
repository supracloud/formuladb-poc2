/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { Location } from '@angular/common';

import * as _ from "lodash";

import { FormComponent as BaseFormComponent } from '@fe/app/form/form.component';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';
import { FormEditingService } from '@fe/app/form/form-editing.service';

@Component({
    selector: 'mwz-form',
    templateUrl: '../../../../form/form.component.html',
    styleUrls: ['../../../../form/form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent extends BaseFormComponent implements OnInit, OnDestroy {
    constructor(
        frmdbStreams: FrmdbStreamsService,
        formEditingService: FormEditingService,
        _location: Location
    ) {
        super(frmdbStreams, formEditingService, _location);
        this.frmdbStreams.form$.subscribe(form => {
            console.warn(form, this.form, this.formData);
        });
        this.frmdbStreams.formData$.subscribe(formData => {
            console.warn(formData, this.form, this.formData);
        });
    }
}
