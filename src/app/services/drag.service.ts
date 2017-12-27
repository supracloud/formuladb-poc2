import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DragService {

    public payload$: Subject<any> = new BehaviorSubject<any>(null);
    public dropTarget$: Subject<string> = new BehaviorSubject<string>(null);
    public dropParent$: Subject<string> = new BehaviorSubject<string>(null);

    constructor() { }

    public set payload(p: any) {
        this.payload$.next(p);
    }

    public set dropTarget(dt: string) {
        this.dropTarget$.next(dt);
    }

    public set dropParent(dp: string) {
        this.dropParent$.next(dp);
    }
}