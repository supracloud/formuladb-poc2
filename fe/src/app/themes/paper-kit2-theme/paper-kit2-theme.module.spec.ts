/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { PaperKit2ThemeModule } from './paper-kit2-theme.module';

describe('PaperKit2ThemeModule', () => {
  let paperKit2ThemeModule: PaperKit2ThemeModule;

  beforeEach(() => {
    paperKit2ThemeModule = new PaperKit2ThemeModule();
  });

  it('should create an instance', () => {
    expect(paperKit2ThemeModule).toBeTruthy();
  });
});
