import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlataformaPanelComponent } from './plataforma-panel.component';

describe('PlataformaPanelComponent', () => {
  let component: PlataformaPanelComponent;
  let fixture: ComponentFixture<PlataformaPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlataformaPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlataformaPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
