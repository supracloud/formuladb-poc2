import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTableComponent } from './form-table.component';

describe('FormTableComponent', () => {
  let component: FormTableComponent;
  let fixture: ComponentFixture<FormTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
