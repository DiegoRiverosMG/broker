import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoEvaluacionComponent } from './panel-info-evaluacion.component';

describe('PanelInfoEvaluacionComponent', () => {
  let component: PanelInfoEvaluacionComponent;
  let fixture: ComponentFixture<PanelInfoEvaluacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoEvaluacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
