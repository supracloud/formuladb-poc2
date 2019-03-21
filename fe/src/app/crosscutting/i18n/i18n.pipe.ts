import { Pipe, PipeTransform } from '@angular/core';

import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromI18n from '../../state/i18n.state';

@Pipe({ name: 'i18n' })
export class I18nPipe implements PipeTransform {
    dictionary: { [literal: string]: string }

    constructor(private store: Store<fromI18n.I18nState>) {
        this.store.select(fromI18n.getDictionary).subscribe(d => this.dictionary = d);
    }
    transform(value: string, param?: string, param2?: string): string {
        let p = param || '';
        let p2 = param2 || '';
        let transalation = this.dictionary ? this.dictionary[value] : null;
        if (transalation) {
            transalation = transalation.replace('$PARAM$', this.dictionary[p] || p)
                .replace('$PARAM2$', this.dictionary[p2] || p2)
            ;
        }
        // console.error("I18N " + transalation, value, this.dictionary);
        return transalation || value;
    }
}
