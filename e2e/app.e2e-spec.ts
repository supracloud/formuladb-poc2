import { AppPage } from './app.po';

fdescribe('febe App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getBrand()).toEqual('FormulaDB');
  });
});
