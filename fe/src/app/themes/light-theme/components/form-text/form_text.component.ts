/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { FormTextComponent as BaseFormTextComponent } from "@fe/app/form/form-text/form_text.component";

@Component({
    selector: 'form-text-theme',
    host: { class: "col form-group" },
    templateUrl: 'form_text.component.html',
    styleUrls: ['form_text.component.scss']
})
export class FormTextComponent extends BaseFormTextComponent implements OnInit, OnDestroy {
    
}
