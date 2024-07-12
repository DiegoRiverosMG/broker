import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationEvaluationComponent } from './quotation-evaluation.component';

describe('QuotationEvaluationComponent', () => {
  let component: QuotationEvaluationComponent;
  let fixture: ComponentFixture<QuotationEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
