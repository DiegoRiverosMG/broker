import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewPasswordComponent } from './renew-password.component';

xdescribe('RenewPasswordComponent', () => {
  let component: RenewPasswordComponent;
  let fixture: ComponentFixture<RenewPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RenewPasswordComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
