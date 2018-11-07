import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaPreviewComponent } from './formula-preview.component';

describe('FormulaPreviewComponent', () => {
  let component: FormulaPreviewComponent;
  let fixture: ComponentFixture<FormulaPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
