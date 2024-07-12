import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyTransactionsComponent } from './policy-transactions.component';

describe('PolicyTransactionsComponent', () => {
  let component: PolicyTransactionsComponent;
  let fixture: ComponentFixture<PolicyTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
