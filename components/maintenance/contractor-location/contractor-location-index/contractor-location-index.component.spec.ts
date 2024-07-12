import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorLocationIndexComponent } from './contractor-location-index.component';

describe('ContractorLocationIndexComponent', () => {
  let component: ContractorLocationIndexComponent;
  let fixture: ComponentFixture<ContractorLocationIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorLocationIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorLocationIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
