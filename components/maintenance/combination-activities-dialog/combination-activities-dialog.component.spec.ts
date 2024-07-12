import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinationActivitiesDialogComponent } from './combination-activities-dialog.component';

describe('CombinationActivitiesDialogComponent', () => {
  let component: CombinationActivitiesDialogComponent;
  let fixture: ComponentFixture<CombinationActivitiesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinationActivitiesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinationActivitiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
