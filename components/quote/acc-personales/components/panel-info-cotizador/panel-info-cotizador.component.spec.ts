import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoCotizadorComponent } from './panel-info-cotizador.component';

describe('PanelInfoCotizadorComponent', () => {
  let component: PanelInfoCotizadorComponent;
  let fixture: ComponentFixture<PanelInfoCotizadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoCotizadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoCotizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
