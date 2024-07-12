import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpAnualResumeReportComponent } from './vdp-anual-resume-report.component';

describe('VdpControlReportComponent', () => {
  let component: VdpAnualResumeReportComponent;
  let fixture: ComponentFixture<VdpAnualResumeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpAnualResumeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpAnualResumeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
