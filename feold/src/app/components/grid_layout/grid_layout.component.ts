import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeElementWithChildren, CssForNodeElement, NodeElement } from "@domain/uimetadata/node-elements";
import * as _ from 'lodash';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-grid_layout',
    templateUrl: './grid_layout.component.html',
    styleUrls: ['./grid_layout.component.scss'],
})
export class GridLayoutComponent extends BaseNodeComponent implements OnInit {
    
    dragIcon = faArrowsAlt;
    
    @Input()
    nodel: NodeElementWithChildren;
    
    @Input()
    formgrp: FormGroup;
    
    @Input()
    fullpath: string;
    
    @Input()
    rdonly: boolean;
    
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
    
    colspan(childEl: NodeElement): string {
        let ret: string = childEl.colspan ? "wcol-" + childEl.colspan : "wcol-12";
        return "frmdb-wrapper " + ret;
    }

    dragEnd(e: any): void {
        // this.frmdbStreams.userEvents$.next({ type: "UserDraggedFormElement", nodel: null });
    }
}
