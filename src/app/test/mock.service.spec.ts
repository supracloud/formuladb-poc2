import { TestBed, inject } from '@angular/core/testing';

import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as appState from "../app.state";

import { MockService } from './mock.service';

describe('MockService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(appState.reducers)
      ],      
      providers: [
        MockService
      ]
    });
  });

  it('should be created', inject([MockService], (service: MockService) => {
    expect(service).toBeTruthy();
  }));
});
