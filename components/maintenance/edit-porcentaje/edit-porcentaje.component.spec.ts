import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPorcentajeComponent } from './edit-porcentaje.component';

describe('EditPorcentajeComponent', () => {
  let component: EditPorcentajeComponent;
  let fixture: ComponentFixture<EditPorcentajeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPorcentajeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPorcentajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
