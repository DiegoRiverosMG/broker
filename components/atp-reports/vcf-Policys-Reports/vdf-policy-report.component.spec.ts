import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VcfPolicyReportComponent } from './vdf-policy-report.component';

describe('VcfPolicyReportComponent', () => {
  let component: VcfPolicyReportComponent;
  let fixture: ComponentFixture<VcfPolicyReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VcfPolicyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VcfPolicyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
