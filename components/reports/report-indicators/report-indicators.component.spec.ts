import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportIndicatorsComponent } from './report-indicators.component';

describe('ReportIndicatorsComponent', () => {
  let component: ReportIndicatorsComponent;
  let fixture: ComponentFixture<ReportIndicatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportIndicatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
