import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputTextareaREComponent } from './form-input-textarea-re.component';

describe('FormInputTextareaComponent', () => {
  let component: FormInputTextareaREComponent;
  let fixture: ComponentFixture<FormInputTextareaREComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputTextareaREComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputTextareaREComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
