import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoTramaComponent } from './panel-info-trama.component';

describe('PanelInfoTramaComponent', () => {
  let component: PanelInfoTramaComponent;
  let fixture: ComponentFixture<PanelInfoTramaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoTramaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoTramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
