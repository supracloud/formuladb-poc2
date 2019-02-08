/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from "@core/domain/metadata/data_obj";
import { Entity, EntityProperty } from "@core/domain/metadata/entity";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";


export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as events from "@core/domain/event";
import { unflatten, NavigationItem } from './navigation.item';

export interface EntityState {
    entities: Entity[];
    selectedEntity: Entity | undefined;
    selectedProperty: EntityProperty | undefined;
    expanded: string[];
}

export const entityInitialState: EntityState = {
    entities: [] as Entity[],
    selectedEntity: undefined,
    selectedProperty: undefined,
    expanded: [] as string[]
};

export const EntitiesFromBackendFullLoadActionN = "[entity] EntitiesFromBackendFullLoadAction";
export const SelectedEntityActionN = "[entity] SelectedEntityAction";
export const CollapsedEntityActionN = "[entity] CollapsedEntityAction";
export const ServerEventModifiedEntityN = events.ServerEventModifiedEntityN;
export const ServerEventNewEntityN = events.ServerEventNewEntityN;
export const ServerEventDeleteEntityN = events.ServerEventDeleteEntityN;

export class EntitiesFromBackendFullLoadAction implements Action {
    readonly type = EntitiesFromBackendFullLoadActionN;

    constructor(public entities: Entity[]) { }
}

export class SelectedEntityAction implements Action {
    readonly type = SelectedEntityActionN;

    constructor(public entity: Entity) { }
}

export class CollapsedEntityAction implements Action {
    readonly type = CollapsedEntityActionN;

    constructor(public id: string, public collapsed: boolean) { }
}

export class ServerEventModifiedEntity implements Action {
    readonly type = ServerEventModifiedEntityN;
    public event: events.ServerEventModifiedEntity;

    constructor(public entity: Entity) {
        this.event = new events.ServerEventModifiedEntity(entity);
    }
}

export class ServerEventNewEntity implements Action {
    readonly type = ServerEventNewEntityN;
    public event: events.ServerEventNewEntity;

    constructor(path: string) {
        this.event = new events.ServerEventNewEntity(path);
    }
}

export class ServerEventDeleteEntity implements Action {
    readonly type = ServerEventDeleteEntityN;
    public event: events.ServerEventDeleteEntity;

    constructor(entityId: string) {
        this.event = new events.ServerEventDeleteEntity(entityId);
    }
}

export type EntityActions =
    | EntitiesFromBackendFullLoadAction
    | SelectedEntityAction
    | CollapsedEntityAction
    | ServerEventNewEntity
    | ServerEventModifiedEntity
    | ServerEventDeleteEntity;

/**
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
        case SelectedEntityActionN:
            ret = {
                ...state,
                selectedEntity: action.entity
            };
            break;
        case CollapsedEntityActionN:
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
                    linkName: entity._id.split(/__/).slice(-1)[0],
                    path: entity._id.replace(/^__/, ''),
                    indent: entity._id.split(/__/).length - 1,
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
    (state: EntityState) => state ? state.selectedEntity : entityInitialState.selectedEntity
);
export const getSelectedPropertyState = createSelector(
    getEntityState,
    (state: EntityState) => state ? state.selectedProperty : entityInitialState.selectedProperty
);
