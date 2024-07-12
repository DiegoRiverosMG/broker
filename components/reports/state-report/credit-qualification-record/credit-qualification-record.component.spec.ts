import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditQualificationRecordComponent } from './credit-qualification-record.component';

describe('CreditQualificationRecordComponent', () => {
  let component: CreditQualificationRecordComponent;
  let fixture: ComponentFixture<CreditQualificationRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditQualificationRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditQualificationRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
