import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EjecutivoModalComponent } from './ejecutivo-modal.component';

describe('EjecutivoModalComponent', () => {
  let component: EjecutivoModalComponent;
  let fixture: ComponentFixture<EjecutivoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EjecutivoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EjecutivoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
