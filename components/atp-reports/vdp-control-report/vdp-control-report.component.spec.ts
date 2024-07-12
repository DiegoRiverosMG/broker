import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpControlReportComponent } from './vdp-control-report.component';

describe('VdpControlReportComponent', () => {
  let component: VdpControlReportComponent;
  let fixture: ComponentFixture<VdpControlReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpControlReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpControlReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
