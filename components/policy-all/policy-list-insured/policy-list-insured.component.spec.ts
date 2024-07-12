import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyListInsuredComponent } from './policy-list-insured.component';

describe('PolicyListInsuredComponent', () => {
  let component: PolicyListInsuredComponent;
  let fixture: ComponentFixture<PolicyListInsuredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyListInsuredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyListInsuredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
