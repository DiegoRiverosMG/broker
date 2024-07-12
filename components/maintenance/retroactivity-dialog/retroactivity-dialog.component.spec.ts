import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetroactivityDialogComponent } from './retroactivity-dialog.component';

describe('RetroactivityDialogComponent', () => {
  let component: RetroactivityDialogComponent;
  let fixture: ComponentFixture<RetroactivityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetroactivityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetroactivityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
