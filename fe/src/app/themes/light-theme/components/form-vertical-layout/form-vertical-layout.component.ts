/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";
import { FormVerticalLayoutComponent as FormVerticalLayoutComponentBase } from '@fe/app/form/form-vertical-layout/form-vertical-layout.component';



import { Store } from '@ngrx/store';
import * as fromForm from '../../../../form/form.state';
@Component({
    selector: 'v-layout',
    templateUrl: '../../../../form/form-vertical-layout/form-vertical-layout.component.html',
    styleUrls: ['../../../../form/form-vertical-layout/form-vertical-layout.component.scss']
})
export class FormVerticalLayoutComponent extends FormVerticalLayoutComponentBase implements OnInit {
    constructor(protected formStore: Store<fromForm.FormState>) {
        super(formStore);
    }
}
