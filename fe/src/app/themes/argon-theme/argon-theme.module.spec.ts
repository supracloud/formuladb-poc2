import { ArgonThemeModule } from './argon-theme.module';

describe('ArgonThemeModule', () => {
  let argonThemeModule: ArgonThemeModule;

  beforeEach(() => {
    argonThemeModule = new ArgonThemeModule();
  });

  it('should create an instance', () => {
    expect(argonThemeModule).toBeTruthy();
  });
});
