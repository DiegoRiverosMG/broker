import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMovementCancelComponent } from './policy-movement-cancel.component';

describe('PolicyMovementCancelComponent', () => {
  let component: PolicyMovementCancelComponent;
  let fixture: ComponentFixture<PolicyMovementCancelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyMovementCancelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMovementCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
