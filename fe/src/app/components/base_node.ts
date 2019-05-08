/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Input, HostBinding, OnDestroy } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { FrmdbStreamsService } from '../state/frmdb-streams.service';
import { getChildrenPrefix, childTableFieldNameToEntityName, parseDataObjId } from '@core/domain/metadata/data_obj';
import { FormEditingService } from './form-editing.service';
import { NodeElement, getChildPath, NodeType } from '@core/domain/uimetadata/node-elements';
import { elvis } from '@core/elvis';

export class BaseNodeComponent implements OnDestroy {
    @Input()
    nodel: NodeElement;

    @Input()
    formgrp: FormGroup;

    @Input()
    fullpath: string;

    @Input()
    rdonly: boolean;

    highlightId: boolean;

    @HostBinding('class')
    get class() {
        return this.getCssClasses();
    }

    protected getCssClasses(): string {
        let ret: any[] = [];
        for (let key of Object.keys(this.nodel)) {
            if (key.match(/^css[A-X]/)) {
                if (typeof this.nodel[key] === "string") {
                    ret.push(this.nodel[key]);
                } else if (this.nodel[key] instanceof Array) {
                    for (let cssClass of this.nodel[key]) {
                        ret.push(cssClass);
                    }
                }
            }
        }
        return ret.join(" ");
    }

    //FIXME: how to se all the classes defined in BaseNode atomatically
    // @HostBinding('class') classes = [
    //     elvis(this.nodel).wcol, 
    //     elvis(this.nodel).wrem, 
    //     ...(elvis(this.nodel).misc||[])
    // ].filter(x => x).join(" ");

    protected subscriptions: Subscription[] = [];
    public frmdbStreams: FrmdbStreamsService;

    getChildPath(childEl: NodeElement) {
        let formPath = _.isEmpty(this.fullpath) ? [] : [this.fullpath]
        let childPath: string | undefined = undefined;
        childPath = getChildPath(childEl);
        if (childPath) formPath.push(childPath);
        return formPath.join('.');
    }

    hasControl(path: string): boolean {
        return this.formgrp.get(path) != null;
    }

    constructor(public formEditingService: FormEditingService) {
        this.frmdbStreams = formEditingService.frmdbStreams;
    }

    protected addChildDataObj() {
        if (this.nodel.nodeType === NodeType.form_table || this.nodel.nodeType === NodeType.form_tabs) {
            let formArray = this.formgrp.get(this.fullpath);

            if (formArray instanceof FormArray && this.nodel.childNodes) {
                let newChildFormGroup = new FormGroup({});
                let parentDataObj = this.formEditingService.getParentObj(formArray);
                if (!parentDataObj) {
                    console.warn("Cannot find parent of ", formArray.getRawValue(), this.nodel, this.formgrp, this.fullpath);
                    return;
                }
                let parentUUID = parseDataObjId(parentDataObj._id).uid;
                let childTableEntityName = childTableFieldNameToEntityName(this.nodel.tableName);
                newChildFormGroup.setControl('_id',
                    this.formEditingService.makeFormControl(this.formgrp, '_id',
                        getChildrenPrefix(childTableEntityName, parentUUID)));
                this.formEditingService.updateFormGroup(this.formgrp, newChildFormGroup, this.nodel.childNodes, false);
                formArray.push(newChildFormGroup);
                if (!this.formEditingService.formChangeDetectorRef['destroyed']) {
                    this.formEditingService.formChangeDetectorRef.detectChanges();
                }
            } else console.warn("Expected form array but found", formArray, this.nodel, this.formgrp, this.fullpath);
        } else console.warn("Cannot add children to a scalar node element", this.nodel, this.formgrp, this.fullpath);
    }

    ngOnDestroy(): void {
    }
}
