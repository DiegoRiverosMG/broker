import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CovidEvaluationComponent } from './covid-evaluation.component';

describe('CovidEvaluationComponent', () => {
  let component: CovidEvaluationComponent;
  let fixture: ComponentFixture<CovidEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CovidEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
