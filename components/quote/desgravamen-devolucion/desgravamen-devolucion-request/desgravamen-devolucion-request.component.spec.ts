import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesgravamenDevolucionRequestComponent } from './desgravamen-devolucion-request.component';

describe('DesgravamenDevolucionRequestComponent', () => {
  let component: DesgravamenDevolucionRequestComponent;
  let fixture: ComponentFixture<DesgravamenDevolucionRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesgravamenDevolucionRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesgravamenDevolucionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
