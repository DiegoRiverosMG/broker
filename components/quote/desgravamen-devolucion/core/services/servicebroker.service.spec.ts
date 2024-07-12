import { TestBed } from '@angular/core/testing';

import { ServicebrokerService } from './servicebroker.service';

describe('ServicebrokerService', () => {
  let service: ServicebrokerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicebrokerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
