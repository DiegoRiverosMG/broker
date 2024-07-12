import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputSelectTextREComponent } from './form-input-select-text-re.component';

describe('FormInputSelectComponent', () => {
  let component: FormInputSelectTextREComponent;
  let fixture: ComponentFixture<FormInputSelectTextREComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputSelectTextREComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputSelectTextREComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
