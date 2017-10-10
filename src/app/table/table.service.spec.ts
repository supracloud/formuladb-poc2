import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TableService } from './table.service';

describe('TableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [ RouterTestingModule ],
        providers: [TableService]
    });
  });

  it('should be created', inject([TableService], (service: TableService) => {
    expect(service).toBeTruthy();
  }));
});
