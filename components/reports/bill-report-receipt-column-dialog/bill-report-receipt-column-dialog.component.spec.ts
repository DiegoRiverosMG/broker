import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillReportReceiptColumnDialogComponent } from './bill-report-receipt-column-dialog.component';

describe('BillReportReceiptColumnDialogComponent', () => {
  let component: BillReportReceiptColumnDialogComponent;
  let fixture: ComponentFixture<BillReportReceiptColumnDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillReportReceiptColumnDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillReportReceiptColumnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
