import { FormulaEditorModule } from './formula-editor.module';

describe('FormulaEditorModule', () => {
  let formulaEditorModule: FormulaEditorModule;

  beforeEach(() => {
    formulaEditorModule = new FormulaEditorModule();
  });

  it('should create an instance', () => {
    expect(formulaEditorModule).toBeTruthy();
  });
});
