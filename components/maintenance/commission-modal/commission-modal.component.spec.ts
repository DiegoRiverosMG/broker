import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionModalComponent } from './commission-modal.component';

describe('CommissionModalComponent', () => {
  let component: CommissionModalComponent;
  let fixture: ComponentFixture<CommissionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
