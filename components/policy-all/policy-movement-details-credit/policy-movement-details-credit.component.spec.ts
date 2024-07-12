import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMovementDetailsCreditComponent } from './policy-movement-details-credit.component';

describe('PolicyMovementDetailsCreditComponent', () => {
  let component: PolicyMovementDetailsCreditComponent;
  let fixture: ComponentFixture<PolicyMovementDetailsCreditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyMovementDetailsCreditComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMovementDetailsCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
