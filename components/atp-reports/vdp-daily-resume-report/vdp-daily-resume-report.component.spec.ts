import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpDailyResumeReportComponent } from './vdp-daily-resume-report.component';

describe('VdpControlReportComponent', () => {
  let component: VdpDailyResumeReportComponent;
  let fixture: ComponentFixture<VdpDailyResumeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpDailyResumeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpDailyResumeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
