import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoColegioComponent } from './panel-info-colegio.component';

describe('PanelInfoColegioComponent', () => {
  let component: PanelInfoColegioComponent;
  let fixture: ComponentFixture<PanelInfoColegioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoColegioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoColegioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
