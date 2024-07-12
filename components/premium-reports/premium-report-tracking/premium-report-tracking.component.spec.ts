import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumReportTrackingComponent } from './premium-report-tracking.component';

describe('PremiumReportTrackingComponent', () => {
  let component: PremiumReportTrackingComponent;
  let fixture: ComponentFixture<PremiumReportTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PremiumReportTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumReportTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
