import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPersonalesBandejaComponent } from './acc-personales-bandeja.component';

describe('AccPersonalesBandejaComponent', () => {
  let component: AccPersonalesBandejaComponent;
  let fixture: ComponentFixture<AccPersonalesBandejaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPersonalesBandejaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPersonalesBandejaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
