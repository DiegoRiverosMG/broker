import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentClientStatusComponent } from './payment-client-status.component';

describe('PaymentClientStatusComponent', () => {
  let component: PaymentClientStatusComponent;
  let fixture: ComponentFixture<PaymentClientStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentClientStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentClientStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
