import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { StoreModule, Store, combineReducers } from '@ngrx/store';

import { TableComponent } from './table.component';
import { ModalComponent } from "../modal/modal.component";
import { FormModalService } from "../form-modal.service";
import { TableService } from "./table.service";

import * as state from './table.state';

import * as mainDemoFlow from "../test/main_demo_flow";

interface AppState {
  nav: state.State;
}

const reducers = {
  'table': state.reducer
};

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let store: Store<state.State>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,        
        StoreModule.forRoot(reducers),
      ],
      declarations: [ TableComponent, ModalComponent ],
      providers: [ 
        FormModalService ,
        {
          provide: TableService,
          useValue: jasmine.createSpyObj('TableService', ['selectTableRow']),
        },
        
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('main flow', () => {
    expect(component).toBeTruthy();

    store.dispatch(new state.TableChangesAction(
      mainDemoFlow.FLOW.And_default_table_page_with_service_forms_should_be_displayed.serviceFormTable));
    
    let firstEntity = fixture.debugElement.query(By.css('tr'));
        
  });
});
