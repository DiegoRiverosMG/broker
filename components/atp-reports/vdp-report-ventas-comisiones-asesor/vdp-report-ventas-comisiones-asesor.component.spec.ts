import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpReportVentasComisionesAsesorComponent } from './vdp-report-ventas-comisiones-asesor.component';

describe('VdpComponent', () => {
  let component: VdpReportVentasComisionesAsesorComponent;
  let fixture: ComponentFixture<VdpReportVentasComisionesAsesorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpReportVentasComisionesAsesorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpReportVentasComisionesAsesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

