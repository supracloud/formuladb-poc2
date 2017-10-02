import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  routerReducer,
  RouterReducerState,
  RouterStateSerializer
} from '@ngrx/router-store';

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

export const ENTITIES_CHANGES = "[Metadata] EntitiesChangesAction";
export const SELECT_ENTITY = "[Metadata] SelectEntityAction";
export const NEW_ENTITY = "[Metadata] NewEntityAction";
export const DELETE_ENTITY = "[Metadata] DeleteEntityAction";


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
  console.log(state);
  switch (action.type) {
    //changes from the server are commning: added/removed entities
    case ENTITIES_CHANGES:
      return {
        ...state,
        entities: applyChanges<Entity>(state.entities, action.changes)
      };
    //user navigates to different tables
    case SELECT_ENTITY:
      return {
        ...state,
        selectedEntity: action.entity
      };
    default:
      return state;
  }
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
