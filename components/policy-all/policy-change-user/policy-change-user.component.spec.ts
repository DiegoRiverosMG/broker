import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyChangeUserComponent } from './policy-change-user.component';

describe('PolicyChangeUserComponent', () => {
  let component: PolicyChangeUserComponent;
  let fixture: ComponentFixture<PolicyChangeUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyChangeUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyChangeUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
