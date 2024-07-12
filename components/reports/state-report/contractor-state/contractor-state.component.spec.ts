import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorStateComponent } from './contractor-state.component';

describe('ContractorStateComponent', () => {
  let component: ContractorStateComponent;
  let fixture: ComponentFixture<ContractorStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
