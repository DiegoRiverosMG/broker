import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificadoElectronicoComponent } from './certificado-electronico.component';

describe('CertificadoElectronicoComponent', () => {
  let component: CertificadoElectronicoComponent;
  let fixture: ComponentFixture<CertificadoElectronicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertificadoElectronicoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificadoElectronicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
