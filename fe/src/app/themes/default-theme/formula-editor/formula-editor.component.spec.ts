import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaEditorComponent } from './formula-editor.component';

describe('FormulaEditorComponent', () => {
  let component: FormulaEditorComponent;
  let fixture: ComponentFixture<FormulaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
