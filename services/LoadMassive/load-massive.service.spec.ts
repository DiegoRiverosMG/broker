import { TestBed } from '@angular/core/testing';

import { LoadMassiveService } from './load-massive.service';

describe('LoadMassiveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadMassiveService = TestBed.get(LoadMassiveService);
    expect(service).toBeTruthy();
  });
});
