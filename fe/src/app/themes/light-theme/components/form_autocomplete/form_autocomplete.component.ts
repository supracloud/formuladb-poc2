/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormAutocompleteComponent as FormAutocompleteComponentBase } from '@fe/app/form/form_autocomplete/form_autocomplete.component';

@Component({
    selector: 'form-autocomplete',
    templateUrl: '../../../../form/form_autocomplete/form_autocomplete.component.html',
    styleUrls: [
        '../../../../form/form_input/form_input.component.scss',
        '../../../../form/form_autocomplete/form_autocomplete.component.scss',
    ]
})
export class FormAutocompleteComponent extends FormAutocompleteComponentBase implements OnInit, OnDestroy {
}
