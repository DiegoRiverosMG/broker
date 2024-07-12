import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyRequestComponent } from './policy-request.component';

describe('PolicyRequestComponent', () => {
  let component: PolicyRequestComponent;
  let fixture: ComponentFixture<PolicyRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
