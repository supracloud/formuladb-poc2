import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { DropTarget } from './drop.target';

@Injectable()
export class DragService {

    public payload: any = null;
    public dropTarget: DropTarget = null;

    constructor() { }
}