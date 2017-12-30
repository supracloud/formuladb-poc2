import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from './domain/metadata/data_obj';
import { Entity } from './domain/metadata/entity';
import { ChangeObj, applyChanges } from './domain/change_obj';


export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as events from './domain/event';

export interface EntityState {
    entities: Entity[];
    selectedEntity: Entity;
}

export const entityInitialState: EntityState = {
    entities: [] as Entity[],
    selectedEntity: {} as Entity,
};

export const EntitiesFromBackendFullLoadActionN = "[entity] EntitiesFromBackendFullLoadAction";
export const UserActionSelectedEntityN = "[entity] UserActionSelectedEntity";
export const UserActionEditedEntityN = events.UserActionEditedEntityN;
export const UserActionNewEntityN = events.UserActionNewEntityN;
export const UserActionDeleteEntityN = events.UserActionDeleteEntityN;

export class EntitiesFromBackendFullLoadAction implements Action {
    readonly type = EntitiesFromBackendFullLoadActionN;

    constructor(public entities: Entity[]) { }
}

export class UserActionSelectedEntity implements Action {
    readonly type = UserActionSelectedEntityN;

    constructor(public entity: Entity) { }
}

export class UserActionEditedEntity implements Action {
    readonly type = UserActionEditedEntityN;
    public event: events.UserActionEditedEntity;
    
    constructor(public entity: Entity) {
        this.event = new events.UserActionEditedEntity(entity);
    }
}

export class UserActionNewEntity implements Action {
    readonly type = UserActionNewEntityN;
    public event: events.UserActionNewEntity;
    
    constructor(path: string) {
        this.event = new events.UserActionNewEntity(path);
    }
}

export class UserActionDeleteEntity implements Action {
    readonly type = UserActionDeleteEntityN;
    public event: events.UserActionDeleteEntity;
    
    constructor(entity: Entity) {
        this.event = new events.UserActionDeleteEntity(entity);
    }
}

export type EntityActions =
    | EntitiesFromBackendFullLoadAction
    | UserActionSelectedEntity
    | UserActionNewEntity
    | UserActionEditedEntity
    | UserActionDeleteEntity;

/**
 * TODO: check if immutable.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function entityReducer(state = entityInitialState, action: EntityActions): EntityState {
    let ret: EntityState = state;
    switch (action.type) {
        case EntitiesFromBackendFullLoadActionN:
            ret = {
                ...state,
                entities: action.entities,
            };
            break;
        //user navigates to different tables
        case UserActionSelectedEntityN:
            ret = {
                ...state,
                selectedEntity: action.entity
            };
            break;
    }

    // if (action.type.match(/^\[entity\]/)) console.log('[entity] reducer returns:', state, action, ret);
    return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
    'entity': entityReducer
};
let getEntityState = createFeatureSelector<EntityState>('entity');
export const getEntitiesState = createSelector(
    getEntityState,
    (state: EntityState) => state.entities
);
export const getSelectedEntityState = createSelector(
    getEntityState,
    (state: EntityState) => state.selectedEntity
);
