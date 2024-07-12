import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessDemandIndexComponent } from './process-demand-index.component';

describe('ProcessDemandIndexComponent', () => {
  let component: ProcessDemandIndexComponent;
  let fixture: ComponentFixture<ProcessDemandIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessDemandIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessDemandIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
