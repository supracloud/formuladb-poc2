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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BaseNodeComponent } from "../base_node";
import { AbstractControl } from '@angular/forms';
import * as _ from "lodash";

import * as fromForm from '../form.state';
import { Pn } from "@core/domain/metadata/entity";

export class FormInputComponent extends BaseNodeComponent implements OnInit, OnDestroy {
    ctrl: AbstractControl | null;

    inputElement: FormInput;

    constructor(protected formStore: Store<fromForm.FormState>) {
        super(formStore);
    }

    ngOnInit(): void {
        this.inputElement=this.nodeElement as FormInput;
        this.ctrl = this.topLevelFormGroup.get(this.parentFormPath);
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$", this.ctrl);
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
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
