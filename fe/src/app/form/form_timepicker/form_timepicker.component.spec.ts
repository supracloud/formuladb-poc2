/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTimepickerComponent } from './form_timepicker.component';

xdescribe('FormTimepickerComponent', () => {
  let component: FormTimepickerComponent;
  let fixture: ComponentFixture<FormTimepickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTimepickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTimepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
