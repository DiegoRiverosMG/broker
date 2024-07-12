import { TestBed } from '@angular/core/testing';

import { MonitoreoProviCommisionService } from './monitoreo-provi-commision.service';

describe('MonitoreoProviCommisionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MonitoreoProviCommisionService = TestBed.get(MonitoreoProviCommisionService);
    expect(service).toBeTruthy();
  });
});
