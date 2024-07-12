import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PdSctrQuotationEvaluationComponent } from './pd-sctr-quotation-evaluation.component';

describe('PdSctrQuotationEvaluationComponent', () => {
  let component: PdSctrQuotationEvaluationComponent;
  let fixture: ComponentFixture<PdSctrQuotationEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdSctrQuotationEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdSctrQuotationEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
