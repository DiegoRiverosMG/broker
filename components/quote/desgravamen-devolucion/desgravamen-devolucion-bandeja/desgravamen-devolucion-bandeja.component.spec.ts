import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesgravamenDevolucionBandejaComponent } from './desgravamen-devolucion-bandeja.component';

describe('DesgravamenDevolucionBandejaComponent', () => {
  let component: DesgravamenDevolucionBandejaComponent;
  let fixture: ComponentFixture<DesgravamenDevolucionBandejaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesgravamenDevolucionBandejaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesgravamenDevolucionBandejaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
