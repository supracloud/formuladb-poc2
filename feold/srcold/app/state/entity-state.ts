/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from "@domain/metadata/data_obj";
import { Entity, EntityProperty } from "@domain/metadata/entity";
import { ChangeObj, applyChanges } from "@domain/change_obj";


export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as events from "@domain/event";

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

export class ServerEventNewEntity implements Action {
    readonly type = events.ServerEventNewEntityN;
    public event: events.ServerEventNewEntity;

    constructor(path: string) {
        this.event = new events.ServerEventNewEntity(path);
    }
}

export class ServerEventDeleteEntity implements Action {
    readonly type = events.ServerEventDeleteEntityN;
    public event: events.ServerEventDeleteEntity;

    constructor(entityId: string) {
        this.event = new events.ServerEventDeleteEntity(entityId);
    }
}

export class ServerEventSetProperty implements Action {
    readonly type = events.ServerEventSetPropertyN;
    public event: events.ServerEventSetProperty;

    constructor(entity: Entity, public property: EntityProperty) {
        this.event = new events.ServerEventSetProperty(entity, property);
    }
}

export class ServerEventDeleteProperty implements Action {
    readonly type = events.ServerEventDeletePropertyN;
    public event: events.ServerEventDeleteProperty;

    constructor(entity: Entity, public propertyName: string) {
        this.event = new events.ServerEventDeleteProperty(entity, propertyName);
    }
}

export class ServerEventPreviewFormula implements Action {
    readonly type = events.ServerEventPreviewFormulaN;
    public event: events.ServerEventPreviewFormula;

    constructor(public targetEntity: Entity, public targetPropertyName: string, public currentDataObj: DataObj, public formula: string) {
        this.event = new events.ServerEventPreviewFormula(targetEntity, targetPropertyName, currentDataObj, formula);
    }
}

export type EntityActions =
    | EntitiesFromBackendFullLoadAction
    | SelectedEntityAction
    | CollapsedEntityAction
    | ServerEventNewEntity
    | ServerEventDeleteEntity
    | ServerEventSetProperty
    | ServerEventDeleteEntity
    | ServerEventPreviewFormula
;

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
export const getSelectedEntityState = createSelector(
    getEntityState,
    (state: EntityState) => state ? state.selectedEntity : entityInitialState.selectedEntity
);
export const getSelectedPropertyState = createSelector(
    getEntityState,
    (state: EntityState) => state ? state.selectedProperty : entityInitialState.selectedProperty
);