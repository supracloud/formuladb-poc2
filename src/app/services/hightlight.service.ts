import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HighlightService {

    constructor() { }

    private highlighted: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private sticky: string = null;

    get highlighted$(): Observable<string> {
        return this.highlighted.asObservable();
    }

    public highlight(id: string, toggleSticky?: boolean): boolean {
        if (toggleSticky) {
            if (id === this.sticky) {
                this.sticky = null;
                this.highlighted.next(null);
                return false;
            } else {
                this.sticky = id;
                this.highlighted.next(id);
                return true;
            }
        } else {
            if (!this.sticky) {
                this.highlighted.next(id);
                return true;
            }
        }
        return false;
    }
}