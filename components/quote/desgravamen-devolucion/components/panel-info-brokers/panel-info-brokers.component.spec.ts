import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInfoBrokersComponent } from './panel-info-brokers.component';

describe('PanelInfoBrokersComponent', () => {
  let component: PanelInfoBrokersComponent;
  let fixture: ComponentFixture<PanelInfoBrokersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInfoBrokersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInfoBrokersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
