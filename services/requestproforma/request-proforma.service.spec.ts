import { TestBed } from '@angular/core/testing';

import { RequestProformaService } from './request-proforma.service';

describe('RequestProformaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RequestProformaService = TestBed.get(RequestProformaService);
    expect(service).toBeTruthy();
  });
});
