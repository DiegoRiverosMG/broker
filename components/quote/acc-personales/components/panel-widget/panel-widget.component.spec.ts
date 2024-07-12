import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelWidgetComponent } from './panel-widget.component';

describe('PanelWidgetComponent', () => {
  let component: PanelWidgetComponent;
  let fixture: ComponentFixture<PanelWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
