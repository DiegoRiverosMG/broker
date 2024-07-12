import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginEpsComponent } from './login-eps.component';

describe('LoginEpsComponent', () => {
  let component: LoginEpsComponent;
  let fixture: ComponentFixture<LoginEpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginEpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginEpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
