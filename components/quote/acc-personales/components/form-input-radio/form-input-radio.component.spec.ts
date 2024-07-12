import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputRadioComponent } from './form-input-radio.component';

describe('FormInputRadioComponent', () => {
  let component: FormInputRadioComponent;
  let fixture: ComponentFixture<FormInputRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
