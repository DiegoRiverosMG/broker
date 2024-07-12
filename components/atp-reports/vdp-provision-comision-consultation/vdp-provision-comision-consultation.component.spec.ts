import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpProvisionComisionConsultationComponent } from './vdp-provision-comision-consultation.component';

describe('VdpComponent', () => {
  let component: VdpProvisionComisionConsultationComponent;
  let fixture: ComponentFixture<VdpProvisionComisionConsultationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpProvisionComisionConsultationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpProvisionComisionConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


//VdpProvisionComisionConsultation