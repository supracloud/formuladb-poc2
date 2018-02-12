import { AppPage } from './app.po';

describe('febe App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display brand message', () => {
    page.rootPage();
    expect(page.getBrand()).toEqual('FormulaDB');
  });
});
