import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactEvaluationComponent } from './transact-evaluation.component';

describe('TransactEvaluationComponent', () => {
  let component: TransactEvaluationComponent;
  let fixture: ComponentFixture<TransactEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
