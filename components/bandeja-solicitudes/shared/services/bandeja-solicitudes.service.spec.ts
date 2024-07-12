import { TestBed } from '@angular/core/testing';

import { BandejaSolicitudesService } from 'app/layout/broker/components/bandeja-solicitudes/shared/services/bandeja-solicitudes.service';

describe('BandejaSolicitudesService', () => {
  let service: BandejaSolicitudesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BandejaSolicitudesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
