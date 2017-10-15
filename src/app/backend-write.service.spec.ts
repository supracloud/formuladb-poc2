import { TestBed, inject } from '@angular/core/testing';

import { BackendWriteService } from './backend-write.service';

describe('BackendWriteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendWriteService]
    });
  });

  it('should be created', inject([BackendWriteService], (service: BackendWriteService) => {
    expect(service).toBeTruthy();
  }));
});
