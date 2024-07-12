import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCovidComponent } from './policy-covid.component';

describe('PolicyCovidComponent', () => {
  let component: PolicyCovidComponent;
  let fixture: ComponentFixture<PolicyCovidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyCovidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyCovidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
