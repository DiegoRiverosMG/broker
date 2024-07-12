import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorLocationFormComponent } from './contractor-location-form.component';

describe('ContractorLocationFormComponent', () => {
  let component: ContractorLocationFormComponent;
  let fixture: ComponentFixture<ContractorLocationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorLocationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorLocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
