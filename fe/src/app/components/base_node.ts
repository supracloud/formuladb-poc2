/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Input, Type, ViewContainerRef, ComponentFactoryResolver, HostBinding } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import * as fromForm from './form.state';

import { NodeElement, NodeType } from "@core/domain/uimetadata/form";
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';

export class BaseNodeComponent {

    @HostBinding('class.form-item-highlight') highlightId: boolean;

    @Input()
    nodeElement: NodeElement;

    @Input()
    topLevelFormGroup: FormGroup;

    @Input()
    parentFormPath: string;

    @Input()
    formReadOnly: boolean;

    protected subscriptions: Subscription[] = [];

    hasControl(path: string): boolean {
        return this.topLevelFormGroup.get(path) != null;
    }

    constructor(public frmdbStreams: FrmdbStreamsService) {
    }

    protected addChildDataObj() {
        if (this.nodeElement.nodeType === NodeType.form_table || this.nodeElement.nodeType === NodeType.form_tabs) {
            let formArray = this.topLevelFormGroup.get(this.parentFormPath);
            if (formArray instanceof FormArray) {

            } else console.warn("Expected form array but found", formArray, this.nodeElement, this.topLevelFormGroup, this.parentFormPath);
        } else console.warn("Cannot add children to a scalar node element", this.nodeElement, this.topLevelFormGroup, this.parentFormPath);
    }

}
