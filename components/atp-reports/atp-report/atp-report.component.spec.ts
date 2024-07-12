import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtpReportComponent } from './atp-report.component';

describe('AtpReportComponent', () => {
  let component: AtpReportComponent;
  let fixture: ComponentFixture<AtpReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtpReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtpReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
