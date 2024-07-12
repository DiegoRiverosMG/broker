import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCipComponent } from './policy-cip.component';

describe('PolicyCipComponent', () => {
  let component: PolicyCipComponent;
  let fixture: ComponentFixture<PolicyCipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyCipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyCipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
