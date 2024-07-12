import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginProfileComponent } from './login-profile.component';

describe('LoginProfileComponent', () => {
  let component: LoginProfileComponent;
  let fixture: ComponentFixture<LoginProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
