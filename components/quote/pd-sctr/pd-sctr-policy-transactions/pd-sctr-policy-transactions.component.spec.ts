import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PdSctrPolicyTransactionsComponent } from './pd-sctr-policy-transactions.component';

describe('PdSctrPolicyTransactionsComponent', () => {
  let component: PdSctrPolicyTransactionsComponent;
  let fixture: ComponentFixture<PdSctrPolicyTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdSctrPolicyTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdSctrPolicyTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
