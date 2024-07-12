import { TestBed } from '@angular/core/testing';

import { PremiumReportService } from './premium-report.service';

describe('PremiumReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PremiumReportService = TestBed.get(PremiumReportService);
    expect(service).toBeTruthy();
  });
});
