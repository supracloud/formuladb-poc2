/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormInputComponent as BaseFormInputComponent } from "@fe/app/form/form_input/form_input.component";

import { Store } from '@ngrx/store';
import * as fromForm from '../../../../form/form.state';
@Component({
    selector: 'form-input',
    host: { class: "col form-group" },
    templateUrl: '../../../../form/form_input/form_input.component.html',
    styleUrls: ['../../../../form/form_input/form_input.component.scss']
})
export class FormInputComponent extends BaseFormInputComponent implements OnInit, OnDestroy {
    constructor(protected formStore: Store<fromForm.FormState>) {
        super(formStore);
    }
}
