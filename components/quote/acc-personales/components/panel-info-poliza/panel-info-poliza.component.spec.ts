import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoPolizaComponent } from './panel-info-poliza.component';

describe('PanelInfoPolizaComponent', () => {
  let component: PanelInfoPolizaComponent;
  let fixture: ComponentFixture<PanelInfoPolizaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoPolizaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoPolizaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
