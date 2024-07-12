import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpProcesoGeneracionPlanillaPagosComponent } from './vdp-proceso-generacion-planilla-pagos.component';

describe('VdpComponent', () => {
  let component: VdpProcesoGeneracionPlanillaPagosComponent;
  let fixture: ComponentFixture<VdpProcesoGeneracionPlanillaPagosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpProcesoGeneracionPlanillaPagosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpProcesoGeneracionPlanillaPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

