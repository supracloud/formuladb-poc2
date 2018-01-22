import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDatepickerComponent } from './form-datepicker.component';

describe('FormDatepickerComponent', () => {
  let component: FormDatepickerComponent;
  let fixture: ComponentFixture<FormDatepickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDatepickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
