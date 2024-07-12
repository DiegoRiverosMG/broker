import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpMonthResumeReportComponent } from './vdp-month-resume-report.component';

describe('VdpControlReportComponent', () => {
  let component: VdpMonthResumeReportComponent;
  let fixture: ComponentFixture<VdpMonthResumeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpMonthResumeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpMonthResumeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
