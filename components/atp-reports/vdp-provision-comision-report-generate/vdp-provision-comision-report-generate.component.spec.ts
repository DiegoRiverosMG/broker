import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpProvisionComisionReportGenerateComponent } from './vdp-provision-comision-report-generate.component';

describe('VdpComponent', () => {
  let component: VdpProvisionComisionReportGenerateComponent;
  let fixture: ComponentFixture<VdpProvisionComisionReportGenerateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpProvisionComisionReportGenerateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpProvisionComisionReportGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


//VdpProvisionComisionReportGenerateComponent