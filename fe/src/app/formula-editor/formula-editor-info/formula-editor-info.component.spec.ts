import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaEditorInfoComponent } from './formula-editor-info.component';

describe('FormulaEditorInfoComponent', () => {
  let component: FormulaEditorInfoComponent;
  let fixture: ComponentFixture<FormulaEditorInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaEditorInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaEditorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
