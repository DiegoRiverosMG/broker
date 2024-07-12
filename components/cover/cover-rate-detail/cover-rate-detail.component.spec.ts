import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverRateDetailComponent } from './cover-rate-detail.component';

describe('CoverRateDetailComponent', () => {
  let component: CoverRateDetailComponent;
  let fixture: ComponentFixture<CoverRateDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverRateDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverRateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
