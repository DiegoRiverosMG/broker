import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringErrorComponent } from './monitoring-error.component';

describe('MonitoringErrorComponent', () => {
  let component: MonitoringErrorComponent;
  let fixture: ComponentFixture<MonitoringErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
