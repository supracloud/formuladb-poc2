/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NodeElement, NodeType, FormInput, FormText } from "@core/domain/uimetadata/form";
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';

import { BaseNodeComponent } from "../base_node";
import { AbstractControl } from '@angular/forms';
import * as _ from "lodash";

import { FrmdbStreamsService } from "@fe/app/frmdb-streams/frmdb-streams.service";

export class FormTextComponent extends BaseNodeComponent implements OnInit, OnDestroy {
    ctrl: AbstractControl | null;

    inputElement: FormText;

    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }

    ngOnInit(): void {
        this.inputElement = this.nodeElement as FormText;
        this.ctrl = this.topLevelFormGroup.get(this.parentFormPath);
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$", this.ctrl);
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }
    get type(): string {
        if (this.nodeElement.nodeType != NodeType.form_text) throw new Error("form-text node element is wrong: " + JSON.stringify(this.nodeElement));
        return this.nodeElement.representation || 'paragraph';
    }

    get value(): string {
        if (this.ctrl) {
            return this.ctrl.value;
        }
        return "No content available";
    }

    getErrors(): string[] {
        if (this.ctrl == null) return [];
        return _.keys(this.ctrl.errors || {});
    }
}
