/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from './common/domain/metadata/data_obj';
import { Entity, EntityProperty } from './common/domain/metadata/entity';
import { ChangeObj, applyChanges } from './common/domain/change_obj';


export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as events from './common/domain/event';
import { unflatten, NavigationItem } from './navigation.item';

export interface EntityState {
    entities: Entity[];
    selectedEntity: Entity | null;
    selectedProperty: EntityProperty | null;
    expanded: string[];
}

export const entityInitialState: EntityState = {
    entities: [] as Entity[],
    selectedEntity: null,
    selectedProperty: null,
    expanded: [] as string[]
};

export const EntitiesFromBackendFullLoadActionN = "[entity] EntitiesFromBackendFullLoadAction";
export const UserActionSelectedEntityN = "[entity] UserActionSelectedEntity";
export const UserActionCollapsedEntityN = "[entity] UserActionCollapsedEntity";
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

export class UserActionCollapsedEntity implements Action {
    readonly type = UserActionCollapsedEntityN;

    constructor(public id: string, public collapsed: boolean) { }
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
    | UserActionCollapsedEntity
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
        case UserActionCollapsedEntityN:
            ret = {
                ...state,
                expanded: action.collapsed ? state.expanded.filter(e => e !== action.id) : [...state.expanded, action.id]
            }
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
export const getEntityState = createFeatureSelector<EntityState>('entity');
export const getEntitiesState = createSelector(
    getEntityState,
    (state: EntityState) => {
        return state.entities;
    }
);
export const getEntitiesTree = createSelector(
    getEntityState,
    (state: EntityState) => {
        try {
            let u: any = unflatten<NavigationItem>(state.entities.sort((e1, e2) => e1._id < e2._id ? -1 : (e1._id > e2._id ? 1 : 0))
                .map(entity => ({
                    id: entity._id,
                    linkName: entity._id.split(/___/).slice(-1)[0],
                    path: entity._id.replace(/^___/, ''),
                    indent: entity._id.split(/___/).length - 1,
                    active: state.selectedEntity ? entity._id === state.selectedEntity._id : false,
                    children: [],
                    collapsed: !state.expanded.some(ex => ex === entity._id)
                })), (n1, n2) => n1.id !== n2.id && n2.id.startsWith(n1.id));
            return u;
        } catch (ex) {
            return [];
        }
    });
export const getSelectedEntityState = createSelector(
    getEntityState,
    (state: EntityState) => state.selectedEntity
);
export const getSelectedPropertyState = createSelector(
    getEntityState,
    (state: EntityState) => state.selectedProperty
);
