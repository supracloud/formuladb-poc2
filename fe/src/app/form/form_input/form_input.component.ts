/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { NodeElement, NodeType } from '../../common/domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BaseNodeComponent } from "../base_node";
import { AbstractControl } from '@angular/forms';
import * as _ from "lodash";

import * as fromForm from '../form.state';
import { Pn } from '../../common/domain/metadata/entity';

@Component({
    selector: '[form_input]',
    host: { class: "col form-group" },
    templateUrl: 'form_input.component.html',
    styleUrls: ['form_input.component.scss']
})
export class FormInputComponent extends BaseNodeComponent implements OnInit {
    private ctrl: AbstractControl | null;

    constructor(protected store: Store<fromForm.FormState>) {
        super(store);
    }

    ngOnInit(): void {
        this.ctrl = this.topLevelFormGroup.get(this.parentFormPath);
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$", this.ctrl);
    }

    getType(): string {
        if (this.nodeElement.nodeType != NodeType.form_input) throw new Error("form-input node element is wrong: " + JSON.stringify(this.nodeElement));
        if (this.nodeElement.propertyType === Pn.NUMBER) return "number";
        else return "text";
    }

    getErrors(): string[] {
        if (this.ctrl == null) return [];
        return _.keys(this.ctrl.errors || {});
    }
}
