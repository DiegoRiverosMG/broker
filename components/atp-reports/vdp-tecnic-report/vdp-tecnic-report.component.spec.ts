import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpTecnicReportComponent } from './vdp-tecnic-report.component';

describe('VdpTecnicReportComponent', () => {
  let component: VdpTecnicReportComponent;
  let fixture: ComponentFixture<VdpTecnicReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpTecnicReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpTecnicReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
