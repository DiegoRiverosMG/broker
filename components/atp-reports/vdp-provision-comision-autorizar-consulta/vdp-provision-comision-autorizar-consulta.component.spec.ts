import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpProvisionComisionAutorizarConsultaComponent } from './vdp-provision-comision-autorizar-consulta.component';

describe('VdpComponent', () => {
  let component: VdpProvisionComisionAutorizarConsultaComponent;
  let fixture: ComponentFixture<VdpProvisionComisionAutorizarConsultaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpProvisionComisionAutorizarConsultaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpProvisionComisionAutorizarConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


//VdpProvisionComisionEvaluacionConsulta