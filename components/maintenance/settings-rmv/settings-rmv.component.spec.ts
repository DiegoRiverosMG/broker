import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsRmvComponent } from './settings-rmv.component';

describe('SettingsRmvComponent', () => {
  let component: SettingsRmvComponent;
  let fixture: ComponentFixture<SettingsRmvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsRmvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsRmvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
