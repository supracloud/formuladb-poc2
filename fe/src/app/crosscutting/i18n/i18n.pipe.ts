import { Pipe, PipeTransform } from '@angular/core';

import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromI18n from '../../state/i18n.state';
import { I18nService } from '@fe/i18n.service';

@Pipe({ name: 'i18n' })
export class I18nPipe implements PipeTransform {
    private i18n: I18nService;

    constructor(private store: Store<fromI18n.I18nState>) {
        this.store.select(fromI18n.getDictionary).subscribe(d => this.i18n = new I18nService(d));
    }
    transform(value: string, param?: string, param2?: string): string {
        return this.i18n.tt(value, param, param2);
    }
}
