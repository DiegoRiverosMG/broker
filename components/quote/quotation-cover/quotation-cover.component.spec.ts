import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationCoverComponent } from './quotation-cover.component';

describe('QuotationCoverComponent', () => {
  let component: QuotationCoverComponent;
  let fixture: ComponentFixture<QuotationCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
