import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputDateREComponent } from './form-input-date-re.component';

describe('FormInputDateComponent', () => {
  let component: FormInputDateREComponent;
  let fixture: ComponentFixture<FormInputDateREComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputDateREComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputDateREComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
