/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import * as _ from "lodash";

import { FormComponent as BaseFormComponent } from '@fe/app/form/form.component';

import { Store } from '@ngrx/store';
import * as fromForm from '../../../../form/form.state';
@Component({
    selector: 'mwz-form',
    templateUrl: '../../../../form/form.component.html',
    styleUrls: ['../../../../form/form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent extends BaseFormComponent implements OnInit, OnDestroy {
    
}
