import { TestBed } from '@angular/core/testing';

import { ParameterSettingsService } from './parameter-settings.service';

describe('ParameterSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParameterSettingsService = TestBed.get(ParameterSettingsService);
    expect(service).toBeTruthy();
  });
});
