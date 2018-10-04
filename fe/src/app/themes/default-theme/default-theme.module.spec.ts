/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { DefaultThemeModule } from './default-theme.module';

describe('DefaultThemeModule', () => {
  let defaultThemeModule: DefaultThemeModule;

  beforeEach(() => {
    defaultThemeModule = new DefaultThemeModule();
  });

  it('should create an instance', () => {
    expect(defaultThemeModule).toBeTruthy();
  });
});
