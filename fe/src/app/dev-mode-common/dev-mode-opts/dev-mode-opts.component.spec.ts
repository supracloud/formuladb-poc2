import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevModeOptsComponent } from './dev-mode-opts.component';

describe('DevModeOptsComponent', () => {
  let component: DevModeOptsComponent;
  let fixture: ComponentFixture<DevModeOptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevModeOptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevModeOptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
