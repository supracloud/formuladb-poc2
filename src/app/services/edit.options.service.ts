import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as appState from '../app.state';
import * as fromEntity from '../entity-state';
import { EntityProperty } from '../domain/metadata/entity';

@Injectable()
export class EditOptionsService {

    public properties: {name: string, property: EntityProperty}[];

    constructor(private store: Store<appState.AppState>) {
        this.store.select(fromEntity.getSelectedEntityState).subscribe(selectedEntity => {
            this.properties = _.toPairs(selectedEntity.properties).map(([propName, p]) => {return {name: propName, property: p}});
        });
    }
}
