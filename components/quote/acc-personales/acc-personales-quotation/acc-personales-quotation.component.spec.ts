import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPersonalesQuotationComponent } from './acc-personales-quotation.component';

describe('AccPersonalesQuotationComponent', () => {
  let component: AccPersonalesQuotationComponent;
  let fixture: ComponentFixture<AccPersonalesQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPersonalesQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPersonalesQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
