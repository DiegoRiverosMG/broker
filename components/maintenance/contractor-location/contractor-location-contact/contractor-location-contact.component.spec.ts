import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorLocationContactComponent } from './contractor-location-contact.component';

describe('ContractorLocationContactComponent', () => {
  let component: ContractorLocationContactComponent;
  let fixture: ComponentFixture<ContractorLocationContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorLocationContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorLocationContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
