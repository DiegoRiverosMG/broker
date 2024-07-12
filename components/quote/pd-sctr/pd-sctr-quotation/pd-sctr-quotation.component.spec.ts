import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PdSctrQuotationComponent } from './pd-sctr-quotation.component';

describe('PdSctrQuotationComponent', () => {
  let component: PdSctrQuotationComponent;
  let fixture: ComponentFixture<PdSctrQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdSctrQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdSctrQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
