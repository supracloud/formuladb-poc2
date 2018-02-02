import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { StoreModule, Store, combineReducers } from '@ngrx/store';

import { NavigationComponent } from './navigation.component';
import * as state from '../entity-state';

import * as mainDemoFlow from '../test/main_demo.flow';
import { MockMetadata } from '../test/mocks/mock-metadata';

interface AppState {
  entity: state.EntityState;
}

const reducers = {
  nav: state.entityReducer
};

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let store: Store<state.EntityState>;
  let mockMeta = new MockMetadata();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers),
      ],      
      declarations: [ NavigationComponent ],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {

    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('main flow', () => {
    expect(component).toBeTruthy();
    
    store.dispatch(new state.EntitiesFromBackendFullLoadAction(mockMeta.entities));

    let firstEntity = fixture.debugElement.query(By.css('li'));
  });
});
