import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelModalComponent } from './panel-modal.component';

describe('PanelModalComponent', () => {
  let component: PanelModalComponent;
  let fixture: ComponentFixture<PanelModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
