import { Pipe, PipeTransform } from '@angular/core';

import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromI18n from './i18n.state';

@Pipe({ name: 'i18n' })
export class I18nPipe implements PipeTransform {
    dictionary: { [literal: string]: string }

    constructor(private store: Store<fromI18n.I18nState>) {
        this.store.select(fromI18n.getDictionary).subscribe(d => this.dictionary = d);
    }
    transform(value: string): string {
        let transalation = this.dictionary ? this.dictionary[value] : null;
        // console.error("I18N " + transalation, value, this.dictionary);
        return transalation || value;
    }
}
