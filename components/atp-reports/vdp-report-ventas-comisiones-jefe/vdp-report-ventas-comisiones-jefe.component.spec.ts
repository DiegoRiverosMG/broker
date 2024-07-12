import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpReportVentasComisionesJefeComponent } from './vdp-report-ventas-comisiones-jefe.component';

describe('VdpComponent', () => {
  let component: VdpReportVentasComisionesJefeComponent;
  let fixture: ComponentFixture<VdpReportVentasComisionesJefeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpReportVentasComisionesJefeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpReportVentasComisionesJefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

