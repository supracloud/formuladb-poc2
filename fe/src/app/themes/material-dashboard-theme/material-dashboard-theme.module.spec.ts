/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { MaterialDashboardThemeModule } from './material-dashboard-theme.module';

describe('MaterialDashboardThemeModule', () => {
  let materialDashboardThemeModule: MaterialDashboardThemeModule;

  beforeEach(() => {
    materialDashboardThemeModule = new MaterialDashboardThemeModule();
  });

  it('should create an instance', () => {
    expect(materialDashboardThemeModule).toBeTruthy();
  });
});
