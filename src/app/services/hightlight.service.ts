import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HighlightService {

    constructor() { }

    private highlighted: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    get highlighted$():Observable<string>{
        return this.highlighted.asObservable();
    }

    public highlight(id:string):void{
        this.highlighted.next(id);
    }
}