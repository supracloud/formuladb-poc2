/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Input, Type, ViewContainerRef, ComponentFactoryResolver, HostBinding } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import * as fromForm from './form.state';

import { NodeElement, NodeType } from "@core/domain/uimetadata/form";
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';

export class BaseNodeComponent {

    @HostBinding('class.form-item-highlight') highlighted: boolean;

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

    constructor(protected frmdbStreams: FrmdbStreamsService) {
        this.subscriptions.push(
            this.store.select(fromForm.getHighlightedId)
                .subscribe(h => {
                    this.highlighted = this.nodeElement && this.nodeElement._id === h;
                }));
    }

}
