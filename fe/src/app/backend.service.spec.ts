/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { TestBed, inject } from '@angular/core/testing';

import { BackendService } from './backend.service';

xdescribe('PouchdbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendService]
    });
  });

  it('should be created', inject([BackendService], (service: BackendService) => {
    expect(service).toBeTruthy();
  }));
});
