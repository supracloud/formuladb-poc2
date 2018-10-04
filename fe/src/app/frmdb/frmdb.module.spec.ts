/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { FrmdbModule } from './frmdb.module';

describe('FrmdbModule', () => {
  let frmdbModule: FrmdbModule;

  beforeEach(() => {
    frmdbModule = new FrmdbModule();
  });

  it('should create an instance', () => {
    expect(frmdbModule).toBeTruthy();
  });
});
