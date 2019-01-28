/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormComponent } from './form.component';

xdescribe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
