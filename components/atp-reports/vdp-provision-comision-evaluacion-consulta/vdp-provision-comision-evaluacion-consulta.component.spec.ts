import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpProvisionComisionEvaluacionConsultaComponent } from './vdp-provision-comision-evaluacion-consulta.component';

describe('VdpComponent', () => {
  let component: VdpProvisionComisionEvaluacionConsultaComponent;
  let fixture: ComponentFixture<VdpProvisionComisionEvaluacionConsultaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpProvisionComisionEvaluacionConsultaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpProvisionComisionEvaluacionConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


//VdpProvisionComisionEvaluacionConsulta