import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaSolicitudesComponent } from './bandeja-solicitudes.component';

describe('BandejaSolicitudesComponent', () => {
  let component: BandejaSolicitudesComponent;
  let fixture: ComponentFixture<BandejaSolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BandejaSolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandejaSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
