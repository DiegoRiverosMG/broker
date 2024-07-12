import { TestBed } from '@angular/core/testing';

import { CurrentlyInsuredService } from './currently-insured.service';

describe('CurrentlyInsuredService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurrentlyInsuredService = TestBed.get(CurrentlyInsuredService);
    expect(service).toBeTruthy();
  });
});
