/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";
import { FormTabsComponent  as FormTabsComponentBase} from '@fe/app/form/form_tabs/form_tabs.component';



import { Store } from '@ngrx/store';
import * as fromForm from '../../../../form/form.state';
@Component({
    selector: '[form_tabs]',
    templateUrl: '../../../../form/form_tabs/form_tabs.component.html',
    styleUrls: ['../../../../form/form_tabs/form_tabs.component.scss']
})
export class FormTabsComponent extends FormTabsComponentBase implements OnInit {
    constructor(protected formStore: Store<fromForm.FormState>) {
        super(formStore);
    }
}
