/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NowUIDashboardThemeModule } from './now-uidashboard-theme.module';

describe('NowUIDashboardThemeModule', () => {
  let nowUIDashboardThemeModule: NowUIDashboardThemeModule;

  beforeEach(() => {
    nowUIDashboardThemeModule = new NowUIDashboardThemeModule();
  });

  it('should create an instance', () => {
    expect(nowUIDashboardThemeModule).toBeTruthy();
  });
});
