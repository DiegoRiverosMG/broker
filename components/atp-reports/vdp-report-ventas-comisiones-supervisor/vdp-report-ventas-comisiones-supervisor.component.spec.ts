import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpReportVentasComisionesSupervisorComponent } from './vdp-report-ventas-comisiones-supervisor.component';

describe('VdpComponent', () => {
  let component: VdpReportVentasComisionesSupervisorComponent;
  let fixture: ComponentFixture<VdpReportVentasComisionesSupervisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpReportVentasComisionesSupervisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpReportVentasComisionesSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

