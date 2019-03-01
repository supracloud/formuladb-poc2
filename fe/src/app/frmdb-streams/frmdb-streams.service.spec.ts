import { TestBed } from '@angular/core/testing';

import { FrmdbStreamsService } from './frmdb-streams.service';

describe('FrmdbStreamsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FrmdbStreamsService = TestBed.get(FrmdbStreamsService);
    expect(service).toBeTruthy();
  });
});
