import { EventEmitter, ElementRef, OnChanges, SimpleChanges, Output } from '@angular/core';
import * as _ from "lodash";
import { SmartChanges } from '../utils';
import { FrmdbUserEvent } from '../state/frmdb-user-events';

export abstract class BaseElement implements OnChanges {

    @Output() frmdbEventEmmitter = new EventEmitter<FrmdbUserEvent>();

    constructor(protected el: ElementRef) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        this.smartChanges(changes as SmartChanges<this>);
    }

    abstract smartChanges(changes: SmartChanges<this>);
    
    protected emit(event: FrmdbUserEvent) {
        const domEvent = new CustomEvent(event.type);
        this.frmdbEventEmmitter.emit(event);
        this.el.nativeElement.dispatchEvent(domEvent);
    }
}
