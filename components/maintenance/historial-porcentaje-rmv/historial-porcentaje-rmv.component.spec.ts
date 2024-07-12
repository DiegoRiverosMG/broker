import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPorcentajeRmvComponent } from './historial-porcentaje-rmv.component';

describe('HistorialPorcentajeRmvComponent', () => {
  let component: HistorialPorcentajeRmvComponent;
  let fixture: ComponentFixture<HistorialPorcentajeRmvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialPorcentajeRmvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialPorcentajeRmvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
