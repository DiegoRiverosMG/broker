import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactAccessDesgravamenComponent } from './transact-access-desgravamen.component';

describe('TransactAccessDesgravamenComponent', () => {
  let component: TransactAccessDesgravamenComponent;
  let fixture: ComponentFixture<TransactAccessDesgravamenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactAccessDesgravamenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactAccessDesgravamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
