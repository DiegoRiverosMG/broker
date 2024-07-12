import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpReporteAsesoresVentasVigentesComponent } from './vdp-reporte-asesores-ventas-vigentes.component';

describe('VdpReporteAsesoresVentasVigentesComponent', () => {
  let component: VdpReporteAsesoresVentasVigentesComponent;
  let fixture: ComponentFixture<VdpReporteAsesoresVentasVigentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpReporteAsesoresVentasVigentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpReporteAsesoresVentasVigentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

