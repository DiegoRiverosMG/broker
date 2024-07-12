import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputTextREComponent } from './form-input-text-re.component';

describe('FormInputTextComponent', () => {
  let component: FormInputTextREComponent;
  let fixture: ComponentFixture<FormInputTextREComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputTextREComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputTextREComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
