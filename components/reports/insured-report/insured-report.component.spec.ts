import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredReportComponent } from './insured-report.component';

describe('InsuredReportComponent', () => {
  let component: InsuredReportComponent;
  let fixture: ComponentFixture<InsuredReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuredReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuredReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
