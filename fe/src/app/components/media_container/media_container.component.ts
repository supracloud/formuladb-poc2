/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { OnChanges, OnInit, OnDestroy, Component, HostBinding, Input } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { MediaContainer, NodeElement, BaseNodeElement, CssForNodeElement, Card, NodeType, Media } from '@core/domain/uimetadata/node-elements';

import { DomSanitizer } from '@angular/platform-browser';
import { FormEditingService } from '../form-editing.service';
import { elvis } from '@core/elvis';
import { FormArray, AbstractControl } from '@angular/forms';
import { TableService } from '@fe/app/effects/table.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { FrmdbFormControl, FrmdbFormGroup } from '../frmdb-page.component';
import { BaseTableComponent } from '../base-table.component';
import { PickOmit } from '@core/ts-utils';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-media_container',
    templateUrl: './media_container.component.html',
    styleUrls: ['./media_container.component.scss'],
})
export class MediaContainerComponent extends BaseTableComponent implements OnInit, OnChanges, OnDestroy {
    
    mediaContainer: MediaContainer;

    data: any;
    frameworkComponents: any;
    defaultColDef: any;
    childControls: AbstractControl[];

    get media() {
        return {
            ...this.mediaContainer,
            nodeType: NodeType.media,
        } as Media;
    }
    
    constructor(formEditingService: FormEditingService, tableService: TableService
    ){
        super(formEditingService, tableService);
    }
    
    ngOnInit() {
        this.mediaContainer = this.nodel as MediaContainer;
        super.ngOnInit();
    }

    ngOnChanges() {
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
}
