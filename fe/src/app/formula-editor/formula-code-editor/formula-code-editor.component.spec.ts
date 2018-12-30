import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaCodeEditorComponent } from './formula-code-editor.component';

describe('FormulaCodeEditorComponent', () => {
  let component: FormulaCodeEditorComponent;
  let fixture: ComponentFixture<FormulaCodeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaCodeEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaCodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
