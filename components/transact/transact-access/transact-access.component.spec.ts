import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactAccessComponent } from './transact-access.component';

describe('TransactAccessComponent', () => {
  let component: TransactAccessComponent;
  let fixture: ComponentFixture<TransactAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
