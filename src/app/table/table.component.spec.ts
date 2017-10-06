import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { StoreModule, Store, combineReducers } from '@ngrx/store';

import { TableComponent } from './table.component';
import { ModalComponent } from "../modal/modal.component";
import { TableService } from "./table.service";
import { FormModalService } from "../form-modal.service";
import { BackendService } from "../backend.service";

import * as state from './table.state';
import { MockMetadata } from '../test/mocks/mock-metadata';


interface AppState {
  nav: state.State;
}

const reducers = {
  nav: state.reducer
};

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let store: Store<state.State>;
  let mockMeta = new MockMetadata();
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,        
        StoreModule.forRoot(reducers),
      ],
      declarations: [ TableComponent, ModalComponent ],
      providers: [ TableService, FormModalService, BackendService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('main flow', inject([BackendService], (backendService: BackendService) => {
    expect(component).toBeTruthy();

    store.dispatch(new state.TableChangesAction(backendService.getDefaultTable(MockMetadata.General__Actor)));
    
    let firstEntity = fixture.debugElement.query(By.css('tr'));
        
  }));
});
