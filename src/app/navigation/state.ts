import { Action, ActionReducerMap } from '@ngrx/store';

import { Entity } from '../domain/metadata/entity';
import { ChangeObj, applyChanges } from '../domain/change_obj';

export class State {
    entities: Entity[];
    selectedEntity: Entity;
}

export const initialState: State = {
    entities: [] as Entity[],
    selectedEntity: {} as Entity,
};

export class EntitiesChangesAction implements Action {
    readonly type = SelectEntityAction.name;

    constructor(public changes: ChangeObj<Entity>[]) { }
}

export class SelectEntityAction implements Action {
    readonly type = SelectEntityAction.name;

    constructor(public entity: Entity) { }
}

export class NewEntityAction implements Action {
    readonly type = SelectEntityAction.name;

    constructor() { }
}

export class DeleteEntityAction implements Action {
    readonly type = SelectEntityAction.name;

    constructor() { }
}

export type Actions = 
    | EntitiesChangesAction
    | SelectEntityAction
    | NewEntityAction
    | DeleteEntityAction;

/**
 * TODO: check if immutable.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function reducer(state = initialState, action: Actions) {
    switch (action.type) {
        //changes from the server are commning: added/removed entities
        case EntitiesChangesAction.name:
            if (!(action instanceof EntitiesChangesAction)) return state;//compiler hint
            return {
                ...state,
                entities: applyChanges<Entity>(state.entities, action.changes)
            };
        //user navigates to different tables
        case SelectEntityAction.name:
            if (!(action instanceof SelectEntityAction)) return state;//compiler hint
            return {
                ...state, 
                selectedEntity: action.entity
            };
        default:
            return state;
    }
}
