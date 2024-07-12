import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMovementDetailsAllComponent } from './policy-movement-details-all.component';

describe('PolicyMovementDetailsAllComponent', () => {
  let component: PolicyMovementDetailsAllComponent;
  let fixture: ComponentFixture<PolicyMovementDetailsAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyMovementDetailsAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMovementDetailsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
