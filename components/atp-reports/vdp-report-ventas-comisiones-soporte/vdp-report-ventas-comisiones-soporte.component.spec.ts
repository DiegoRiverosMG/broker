import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpReportVentasComisionesSoporteComponent } from './vdp-report-ventas-comisiones-soporte.component';

describe('VdpComponent', () => {
  let component: VdpReportVentasComisionesSoporteComponent;
  let fixture: ComponentFixture<VdpReportVentasComisionesSoporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpReportVentasComisionesSoporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpReportVentasComisionesSoporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

