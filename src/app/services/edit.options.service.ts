import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as appState from '../app.state';
import * as fromEntity from '../entity-state';
import { getEntityPropertiesWithNames, EntityPropertiesWithNames } from "../common/domain.utils";

@Injectable()
export class EditOptionsService {

    public properties: EntityPropertiesWithNames;

    constructor(private store: Store<appState.AppState>) {
        this.store.select(fromEntity.getSelectedEntityState).subscribe(selectedEntity => {
            this.properties = getEntityPropertiesWithNames(selectedEntity.properties);
        });
    }
}
