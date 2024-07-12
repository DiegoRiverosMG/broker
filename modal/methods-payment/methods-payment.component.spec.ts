import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodsPaymentComponent } from './methods-payment.component';

describe('MethodsPaymentComponent', () => {
  let component: MethodsPaymentComponent;
  let fixture: ComponentFixture<MethodsPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MethodsPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MethodsPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
