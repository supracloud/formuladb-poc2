import { DevModeCommonModule } from './dev-mode-common.module';

describe('DevModeCommonModule', () => {
  let devModeCommonModule: DevModeCommonModule;

  beforeEach(() => {
    devModeCommonModule = new DevModeCommonModule();
  });

  it('should create an instance', () => {
    expect(devModeCommonModule).toBeTruthy();
  });
});
