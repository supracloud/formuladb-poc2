/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Input, HostBinding } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';

import { NodeElement, NodeType } from "@core/domain/uimetadata/form";
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';
import { getChildrenPrefix, childTableFieldNameToEntityName, parseDataObjId } from '@core/domain/metadata/data_obj';
import { FormEditingService } from './form-editing.service';

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
    public frmdbStreams: FrmdbStreamsService;

    hasControl(path: string): boolean {
        return this.topLevelFormGroup.get(path) != null;
    }

    constructor(public formEditingService: FormEditingService) {
        this.frmdbStreams = formEditingService.frmdbStreams;
    }

    protected addChildDataObj() {
        if (this.nodeElement.nodeType === NodeType.form_table || this.nodeElement.nodeType === NodeType.form_tabs) {
            let formArray = this.topLevelFormGroup.get(this.parentFormPath);

            if (formArray instanceof FormArray && this.nodeElement.childNodes) {
                let newChildFormGroup = new FormGroup({});
                let parentDataObj = this.formEditingService.getParentObj(formArray);
                if (!parentDataObj) {
                    console.warn("Cannot find parent of ", formArray.getRawValue(), this.nodeElement, this.topLevelFormGroup, this.parentFormPath);
                    return;
                }
                let parentUUID = parseDataObjId(parentDataObj._id).uid;
                let childTableEntityName = childTableFieldNameToEntityName(this.nodeElement.tableName);
                newChildFormGroup.setControl('_id',
                    this.formEditingService.makeFormControl(this.topLevelFormGroup, '_id',
                        getChildrenPrefix(childTableEntityName, parentUUID)));
                this.formEditingService.updateFormGroup(this.topLevelFormGroup, newChildFormGroup, this.nodeElement.childNodes, false);
                formArray.push(newChildFormGroup);
                this.formEditingService.formChangeDetectorRef.detectChanges();
            } else console.warn("Expected form array but found", formArray, this.nodeElement, this.topLevelFormGroup, this.parentFormPath);
        } else console.warn("Cannot add children to a scalar node element", this.nodeElement, this.topLevelFormGroup, this.parentFormPath);
    }

}
