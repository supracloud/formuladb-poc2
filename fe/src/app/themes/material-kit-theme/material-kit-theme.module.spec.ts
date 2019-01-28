/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MaterialKitThemeModule } from './material-kit-theme.module';

describe('MaterialKitThemeModule', () => {
  let materialKitThemeModule: MaterialKitThemeModule;

  beforeEach(() => {
    materialKitThemeModule = new MaterialKitThemeModule();
  });

  it('should create an instance', () => {
    expect(materialKitThemeModule).toBeTruthy();
  });
});
