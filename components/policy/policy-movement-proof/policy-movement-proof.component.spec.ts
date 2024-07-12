import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMovementProofComponent } from './policy-movement-proof.component';

describe('PolicyMovementProofComponent', () => {
  let component: PolicyMovementProofComponent;
  let fixture: ComponentFixture<PolicyMovementProofComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyMovementProofComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMovementProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
