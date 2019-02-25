/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormComponent as BaseFormComponent } from '@fe/app/form/form.component';

@Component({
    selector: 'mwz-form',
    host: { class: "col form-group" },
    templateUrl: '../../../../form/form.component.html',
    styleUrls: ['../../../../form/form.component.scss']
})
export class FormComponent extends BaseFormComponent implements OnInit, OnDestroy {
    
}
