import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCreateInsuredComponent } from './policy-create-insured.component';

describe('PolicyCreateInsuredComponent', () => {
  let component: PolicyCreateInsuredComponent;
  let fixture: ComponentFixture<PolicyCreateInsuredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyCreateInsuredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyCreateInsuredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
