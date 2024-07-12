import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMovementDetailsComponent } from './policy-movement-details.component';

describe('PolicyMovementDetailsComponent', () => {
  let component: PolicyMovementDetailsComponent;
  let fixture: ComponentFixture<PolicyMovementDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyMovementDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMovementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
