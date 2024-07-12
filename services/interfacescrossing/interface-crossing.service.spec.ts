import { TestBed } from '@angular/core/testing';

import { InterfaceCrossingService } from './interface-crossing.service';

describe('InterfaceCrossingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InterfaceCrossingService = TestBed.get(InterfaceCrossingService);
    expect(service).toBeTruthy();
  });
});
