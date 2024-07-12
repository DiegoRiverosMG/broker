import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentClentViewComponent } from './payment-clent-view.component';

describe('PaymentClentViewComponent', () => {
  let component: PaymentClentViewComponent;
  let fixture: ComponentFixture<PaymentClentViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentClentViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentClentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
