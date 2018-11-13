import { TestBed } from '@angular/core/testing';

import { FormulaEditorService } from './formula-editor.service';

describe('FormulaEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormulaEditorService = TestBed.get(FormulaEditorService);
    expect(service).toBeTruthy();
  });
});
