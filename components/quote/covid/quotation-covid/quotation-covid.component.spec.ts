import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationCovidComponent } from './quotation-covid.component';

describe('QuotationCovidComponent', () => {
  let component: QuotationCovidComponent;
  let fixture: ComponentFixture<QuotationCovidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationCovidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationCovidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
