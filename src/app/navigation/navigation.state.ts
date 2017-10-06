import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../domain/metadata/data_obj';
import { Entity } from '../domain/metadata/entity';
import { ChangeObj, applyChanges } from '../domain/change_obj';


export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };


export interface State {
  entities: Entity[];
  selectedEntity: Entity;
}

export const initialState: State = {
  entities: [] as Entity[],
  selectedEntity: {} as Entity,
};

export const ENTITIES_CHANGES = "[nav] EntitiesChangesAction";
export const SELECT_ENTITY = "[nav] SelectEntityAction";
export const NEW_ENTITY = "[nav] NewEntityAction";
export const DELETE_ENTITY = "[nav] DeleteEntityAction";


export class EntitiesChangesAction implements Action {
  readonly type = ENTITIES_CHANGES;

  constructor(public changes: ChangeObj<Entity>[]) { }
}

export class SelectEntityAction implements Action {
  readonly type = SELECT_ENTITY;

  constructor(public entity: Entity) { }
}

export class NewEntityAction implements Action {
  readonly type = NEW_ENTITY;

  constructor() { }
}

export class DeleteEntityAction implements Action {
  readonly type = DELETE_ENTITY;

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
export function reducer(state = initialState, action: Actions): State {
  console.log('[nav] reducer:', state, action);
  let ret: State = state;
  switch (action.type) {
    //changes from the server are commning: added/removed entities
    case ENTITIES_CHANGES:
      ret = {
        ...state,
        entities: applyChanges<Entity>(state.entities, action.changes),
      };
      break;
    //user navigates to different tables
    case SELECT_ENTITY:
      ret = {
        ...state,
        selectedEntity: action.entity
      };
      break
  }

  console.log('[nav] reducer returns:', ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'nav': reducer
};
export const getNavState = createFeatureSelector<State>('nav');
export const getNavEntitiesState = createSelector(
  getNavState,
  (state: State) => state.entities
);
