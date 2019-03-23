/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NodeElement, NodeType, FormInput } from "@core/domain/uimetadata/form";
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { CircularJSON } from "@core/json-stringify";

import { BaseNodeComponent } from "../base_node";
import { AbstractControl } from '@angular/forms';
import * as _ from "lodash";

import { Pn } from "@core/domain/metadata/entity";
import { FormEditingService } from "../form-editing.service";

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_input',
    host: { class: 'col form-group' },
    templateUrl: './form_input.component.html',
    styleUrls: ['./form_input.component.scss']
})
export class FormInputComponent extends BaseNodeComponent implements OnInit, OnDestroy {
    ctrl: AbstractControl | null;

    inputElement: FormInput;

    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }


    ngOnInit(): void {
        this.inputElement=this.nodel as FormInput;
        this.ctrl = this.formgrp.get(this.fullpath);
        console.debug(this.fullpath, this.nodel);
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }
    getType(): string {
        if (this.nodel.nodeType != NodeType.form_input) throw new Error("form-input node element is wrong: " + CircularJSON.stringify(this.nodel));
        if (this.nodel.propertyType === Pn.NUMBER) return "number";
        else return "text";
    }

    getErrors(): string[] {
        if (this.ctrl == null) return [];
        return _.keys(this.ctrl.errors || {});
    }
}
