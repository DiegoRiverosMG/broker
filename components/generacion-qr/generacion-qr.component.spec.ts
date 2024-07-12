import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneracionQrComponent } from './generacion-qr.component';

describe('GeneracionQrComponent', () => {
  let component: GeneracionQrComponent;
  let fixture: ComponentFixture<GeneracionQrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneracionQrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneracionQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
