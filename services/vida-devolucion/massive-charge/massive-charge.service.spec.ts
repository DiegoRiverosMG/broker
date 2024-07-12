import { TestBed } from '@angular/core/testing';

import { MassiveChargeService } from './massive-charge.service';

describe('MassiveChargeService', () => {
  let service: MassiveChargeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MassiveChargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
