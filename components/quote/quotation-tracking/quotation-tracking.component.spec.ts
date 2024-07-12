import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationTrackingComponent } from './quotation-tracking.component';

describe('QuotationTrackingComponent', () => {
  let component: QuotationTrackingComponent;
  let fixture: ComponentFixture<QuotationTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
