import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactEvaluationDesgravamenComponent } from './transact-evaluation-desgravamen.component';

describe('TransactEvaluationDesgravamenComponent', () => {
  let component: TransactEvaluationDesgravamenComponent;
  let fixture: ComponentFixture<TransactEvaluationDesgravamenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactEvaluationDesgravamenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactEvaluationDesgravamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
