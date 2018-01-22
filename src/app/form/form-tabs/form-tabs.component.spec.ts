import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTabsComponent } from './form-tabs.component';

describe('FormTabsComponent', () => {
  let component: FormTabsComponent;
  let fixture: ComponentFixture<FormTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
