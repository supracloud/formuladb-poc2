import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, CssForNodeElement } from "@domain/uimetadata/node-elements";
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-flex_layout',
    templateUrl: './flex_layout.component.html',
    styleUrls: ['./flex_layout.component.scss'],
})
export class FlexLayoutComponent extends BaseNodeComponent implements OnInit {
    
    dragIcon = faArrowsAlt;
    
    @Input()
    nodel: NodeElementWithChildren;
    
    @Input()
    formgrp: FormGroup;
    
    @Input()
    fullpath: string;
    
    @Input()
    rdonly: boolean;
    
    getCssClasses(nodeEl: CssForNodeElement): string[] {
        return super.getCssClasses(nodeEl).concat(['col', 'd-flex', 'flex-column', 'overflow-auto']);
    }
    
    devMode$: Observable<boolean>;

    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
        this.devMode$ = this.formEditingService.frmdbStreams.devMode$;
    }
    
    ngOnInit() {
        console.debug(this.fullpath, this.nodel);
    }
    
    dragHandleId: string;
    setDragHandleId(id: string): void {
        this.dragHandleId = id;
    }
    
    dragStart($event: any, pos: number): boolean {
        if (this.dragHandleId.indexOf('frmdb-drag-handle-') === 0) {
            // this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: this.nodel });
            $event.dataTransfer.setData("movedNodeId", this.dragHandleId.replace(/^frmdb-drag-handle-/, ''));
            $event.dataTransfer.setData("removedFromNodeId", this.nodel._id);
            $event.dataTransfer.setData("removedFromPos", pos);
            // $event.stopPropagation();
            return true;
        } else {
            // $event.stopPropagation();
            return false;
        }
    }
    
    dragEnd(e: any): void {
        // this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: null });
    }
}
