import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormVerticalLayoutComponent } from './form-vertical-layout.component';

describe('FormVerticalLayoutComponent', () => {
  let component: FormVerticalLayoutComponent;
  let fixture: ComponentFixture<FormVerticalLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormVerticalLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormVerticalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
