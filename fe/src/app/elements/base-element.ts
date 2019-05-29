import { EventEmitter, ElementRef } from '@angular/core';
import * as _ from "lodash";

export class BaseElement {
    constructor(protected el: ElementRef) {

    }
    
    protected emit(outputName: string, output: EventEmitter<any>, val) {
        const domEvent = new CustomEvent(_.kebabCase(outputName));
        output.emit(val);
        this.el.nativeElement.dispatchEvent(domEvent);
    }
}