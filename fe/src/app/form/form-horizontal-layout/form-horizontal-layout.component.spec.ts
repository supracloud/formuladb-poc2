import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHorizontalLayoutComponent } from './form-horizontal-layout.component';

describe('FormHorizontalLayoutComponent', () => {
  let component: FormHorizontalLayoutComponent;
  let fixture: ComponentFixture<FormHorizontalLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormHorizontalLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormHorizontalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
