/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";
import { FormHorizontalLayoutComponent as FormHorizontalLayoutComponentBase } from '@fe/app/form/form-horizontal-layout/form-horizontal-layout.component';



import { Store } from '@ngrx/store';
import * as fromForm from '../../../../form/form.state';
@Component({
    selector: 'h-layout',
    templateUrl: '../../../../form/form-horizontal-layout/form-horizontal-layout.component.html',
    styleUrls: ['../../../../form/form-horizontal-layout/form-horizontal-layout.component.scss']
})
export class FormHorizontalLayoutComponent extends FormHorizontalLayoutComponentBase implements OnInit {
    constructor(protected formStore: Store<fromForm.FormState>) {
        super(formStore);
    }
}
