import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropHandleComponent } from './drop-handle.component';

describe('DropHandleComponent', () => {
  let component: DropHandleComponent;
  let fixture: ComponentFixture<DropHandleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropHandleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
