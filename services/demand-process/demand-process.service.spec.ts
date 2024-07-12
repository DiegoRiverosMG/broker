import { TestBed } from '@angular/core/testing';

import { DemandProcessService } from './demand-process.service';

describe('DemandProcessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DemandProcessService = TestBed.get(DemandProcessService);
    expect(service).toBeTruthy();
  });
});
