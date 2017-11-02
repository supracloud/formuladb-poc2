import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from './domain/metadata/data_obj';
import { Entity } from './domain/metadata/entity';
import { ChangeObj, applyChanges } from './domain/change_obj';


export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };


export interface EntityState {
    entities: Entity[];
    selectedEntity: Entity;
}

export const entityInitialState: EntityState = {
    entities: [] as Entity[],
    selectedEntity: {} as Entity,
};

export const EntitiesFromBackendFullLoadActionN = "[entity] EntitiesFromBackendFullLoadAction";
export const EntitiesFromBackendActionN = "[entity] EntitiesFromBackendAction";
export const UserActionSelectedEntityN = "[entity] UserActionSelectedEntity";
export const UserActionEditedEntityN = "[entity] UserActionEditedEntity";
export const UserActionNewEntityN = "[entity] UserActionNewEntity";
export const UserActionDeleteEntityN = "[entity] UserActionDeleteEntity";

export class EntitiesFromBackendFullLoadAction implements Action {
    readonly type = EntitiesFromBackendFullLoadActionN;

    constructor(public entities: Entity[]) { }
}

export class EntitiesFromBackendAction implements Action {
    readonly type = EntitiesFromBackendActionN;

    constructor(public changes: ChangeObj<Entity>[]) { }
}

export class UserActionSelectedEntity implements Action {
    readonly type = UserActionSelectedEntityN;

    constructor(public entity: Entity) { }
}

export class UserActionEditedEntity implements Action {
    readonly type = UserActionEditedEntityN;

    constructor(public entity: Entity) { }
}

export class UserActionNewEntity implements Action {
    readonly type = UserActionNewEntityN;

    constructor() { }
}

export class UserActionDeleteEntity implements Action {
    readonly type = UserActionDeleteEntityN;

    constructor() { }
}

export type EntityActions =
    | EntitiesFromBackendFullLoadAction
    | EntitiesFromBackendAction
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
        //changes from the server are commning: added/removed entities
        case EntitiesFromBackendActionN:
            ret = {
                ...state,
                entities: applyChanges<Entity>(state.entities, action.changes),
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

    if (action.type.match(/^\[entity\]/)) console.log('[entity] reducer returns:', state, action, ret);
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
