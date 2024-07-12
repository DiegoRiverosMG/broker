import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesgravamenDevolucionQuotationComponent } from './desgravamen-devolucion-quotation.component';

describe('DesgravamenDevolucionQuotationComponent', () => {
  let component: DesgravamenDevolucionQuotationComponent;
  let fixture: ComponentFixture<DesgravamenDevolucionQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesgravamenDevolucionQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesgravamenDevolucionQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
