import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPersonalesPoliciesComponent } from './acc-personales-policies.component';

describe('AccPersonalesPoliciesComponent', () => {
  let component: AccPersonalesPoliciesComponent;
  let fixture: ComponentFixture<AccPersonalesPoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPersonalesPoliciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPersonalesPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
