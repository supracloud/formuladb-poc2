import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as appState from '../app.state';
import * as fromEntity from '../entity-state';
import { EntityPropertiesWithNames, propertiesWithNamesOf } from '../common/domain/metadata/entity';

@Injectable()
export class EditOptionsService {

    public properties: EntityPropertiesWithNames;

    constructor(private store: Store<appState.AppState>) {
        this.store.select(fromEntity.getSelectedEntityState).subscribe(selectedEntity => {
            this.properties = propertiesWithNamesOf(selectedEntity);
        });
    }
}
