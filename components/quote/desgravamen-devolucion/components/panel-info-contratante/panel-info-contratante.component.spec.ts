import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoContratanteComponent } from './panel-info-contratante.component';

describe('PanelInfoContratanteComponent', () => {
  let component: PanelInfoContratanteComponent;
  let fixture: ComponentFixture<PanelInfoContratanteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoContratanteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoContratanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
