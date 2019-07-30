import { CrosscuttingModule } from './crosscutting.module';

describe('CrosscuttingModule', () => {
  let crosscuttingModule: CrosscuttingModule;

  beforeEach(() => {
    crosscuttingModule = new CrosscuttingModule();
  });

  it('should create an instance', () => {
    expect(crosscuttingModule).toBeTruthy();
  });
});
