import { TestBed } from '@angular/core/testing';

import { BillReportService } from './bill-report.service';

describe('BillReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BillReportService = TestBed.get(BillReportService);
    expect(service).toBeTruthy();
  });
});
