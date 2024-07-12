import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpPersistReportComponent } from './vdp-persist-report.component';

describe('VdpPersistReportComponent', () => {
  let component: VdpPersistReportComponent;
  let fixture: ComponentFixture<VdpPersistReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdpPersistReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdpPersistReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
