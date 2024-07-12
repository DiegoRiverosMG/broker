import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoContactosComponent } from './panel-info-contactos.component';

describe('PanelInfoContactosComponent', () => {
  let component: PanelInfoContactosComponent;
  let fixture: ComponentFixture<PanelInfoContactosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoContactosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoContactosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
