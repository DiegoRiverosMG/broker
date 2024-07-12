import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpReserveRegistryReportComponent } from './vdp-Reserve-Registry-Report.component';

describe('VdpReserveRegistryReportComponent', () => {
  let component: VdpReserveRegistryReportComponent;
  let fixture: ComponentFixture<VdpReserveRegistryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpReserveRegistryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpReserveRegistryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
