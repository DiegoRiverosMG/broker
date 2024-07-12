import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverRateComponent } from './cover-rate.component';

describe('CoverRateComponent', () => {
  let component: CoverRateComponent;
  let fixture: ComponentFixture<CoverRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
