import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyEvaluationComponent } from './policy-evaluation.component';

describe('PolicyEvaluationComponent', () => {
  let component: PolicyEvaluationComponent;
  let fixture: ComponentFixture<PolicyEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
