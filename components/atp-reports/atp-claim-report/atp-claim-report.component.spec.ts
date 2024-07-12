import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtpClaimReportComponent } from './atp-claim-report.component';

describe('AtpClaimReportComponent', () => {
  let component: AtpClaimReportComponent;
  let fixture: ComponentFixture<AtpClaimReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtpClaimReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtpClaimReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
