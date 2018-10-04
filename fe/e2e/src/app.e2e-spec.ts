/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to fe!');
  });
});
