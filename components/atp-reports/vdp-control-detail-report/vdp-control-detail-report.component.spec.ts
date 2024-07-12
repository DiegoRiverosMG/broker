import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpControlDetailReportComponent } from './vdp-control-detail-report.component';

describe('VdpControlReportComponent', () => {
  let component: VdpControlDetailReportComponent;
  let fixture: ComponentFixture<VdpControlDetailReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpControlDetailReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpControlDetailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
