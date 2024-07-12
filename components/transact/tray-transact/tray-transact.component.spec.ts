import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrayTransactComponent } from './tray-transact.component';

describe('TrayTransactComponent', () => {
  let component: TrayTransactComponent;
  let fixture: ComponentFixture<TrayTransactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrayTransactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrayTransactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
