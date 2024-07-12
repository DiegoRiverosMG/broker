import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyTransactionsAllComponent } from './policy-transactions-all.component';

describe('PolicyTransactionsAllComponent', () => {
  let component: PolicyTransactionsAllComponent;
  let fixture: ComponentFixture<PolicyTransactionsAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyTransactionsAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyTransactionsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
