import { TestBed } from '@angular/core/testing';

import { AtpReportService } from './atp-report.service';

describe('AtpReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AtpReportService = TestBed.get(AtpReportService);
    expect(service).toBeTruthy();
  });
});
