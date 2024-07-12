import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputMultiSelectREComponent } from './form-input-multi-select-re.component';

describe('FormInputTextareaComponent', () => {
  let component: FormInputMultiSelectREComponent;
  let fixture: ComponentFixture<FormInputMultiSelectREComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputMultiSelectREComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputMultiSelectREComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
