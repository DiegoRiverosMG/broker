import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelHeadeProductoComponent } from './panel-header-producto.component';

describe('PanelHeadeProductoComponent', () => {
  let component: PanelHeadeProductoComponent;
  let fixture: ComponentFixture<PanelHeadeProductoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelHeadeProductoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelHeadeProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
