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
    @HostBinding('class.form-item-highlight') highlightId: boolean;

    @Input()
    nodel: NodeElement;

    @Input()
    formgrp: FormGroup;

    @Input()
    fullpath: string;

    @Input()
    rdonly: boolean;

    @HostBinding('class.row') class_row = (elvis(this.nodel).misc||[]).includes("row");
    @HostBinding('class.col-4') class_col_4 = elvis(this.nodel).wcol == "col-4";

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
