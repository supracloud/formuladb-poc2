import { TestBed, inject } from '@angular/core/testing';

import { BackendReadService } from './backend-read.service';

describe('BackendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendReadService ]
    });
  });

  it('should be created', inject([BackendReadService], (service: BackendReadService) => {
    expect(service).toBeTruthy();
  }));
});
