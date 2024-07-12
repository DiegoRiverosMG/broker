import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdSctrRequestStatusComponent } from './pd-sctr-request-status.component';

describe('PdSctrRequestStatusComponent', () => {
  let component: PdSctrRequestStatusComponent;
  let fixture: ComponentFixture<PdSctrRequestStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdSctrRequestStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdSctrRequestStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
