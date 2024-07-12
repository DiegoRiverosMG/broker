import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoPagoComponent } from './panel-info-pago.component';

describe('PanelInfoPagoComponent', () => {
  let component: PanelInfoPagoComponent;
  let fixture: ComponentFixture<PanelInfoPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
