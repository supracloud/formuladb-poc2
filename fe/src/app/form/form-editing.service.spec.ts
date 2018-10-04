import { TestBed, inject } from '@angular/core/testing';

import { FormEditingService } from './form-editing.service';
import { BackendService } from '../backend.service';

describe('FormEditingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormEditingService, 
        {
          provide: BackendService, useValue: {} 
        }]
    });
  });

  it('should be created', inject([FormEditingService], (service: FormEditingService) => {
    expect(service).toBeTruthy();
  }));
});
