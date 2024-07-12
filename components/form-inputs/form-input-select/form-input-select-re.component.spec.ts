import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputSelectREComponent } from './form-input-select-re.component';

describe('FormInputSelectComponent', () => {
  let component: FormInputSelectREComponent;
  let fixture: ComponentFixture<FormInputSelectREComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputSelectREComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputSelectREComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
