import { TestBed } from '@angular/core/testing';

import { TransactService } from './transact.service';

describe('TransactService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransactService = TestBed.get(TransactService);
    expect(service).toBeTruthy();
  });
});
