import { FrmdbStreamsModule } from './frmdb-streams.module';

describe('FrmdbStreamsModule', () => {
  let frmdbStreamsModule: FrmdbStreamsModule;

  beforeEach(() => {
    frmdbStreamsModule = new FrmdbStreamsModule();
  });

  it('should create an instance', () => {
    expect(frmdbStreamsModule).toBeTruthy();
  });
});
