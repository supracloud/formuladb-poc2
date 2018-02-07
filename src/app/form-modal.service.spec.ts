import { TestBed, inject } from '@angular/core/testing';

import { FormModalService } from './form_modal.service';

describe('FormModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormModalService]
    });
  });

  it('should be created', inject([FormModalService], (service: FormModalService) => {
    expect(service).toBeTruthy();
  }));
});
