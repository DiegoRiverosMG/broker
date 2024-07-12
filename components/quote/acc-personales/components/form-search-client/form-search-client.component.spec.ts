import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSearchClientComponent } from './form-search-client.component';

describe('FormSearchClientComponent', () => {
  let component: FormSearchClientComponent;
  let fixture: ComponentFixture<FormSearchClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormSearchClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSearchClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
