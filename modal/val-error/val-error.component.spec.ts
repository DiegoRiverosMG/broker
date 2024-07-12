import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValErrorComponent } from './val-error.component';

describe('ValErrorComponent', () => {
  let component: ValErrorComponent;
  let fixture: ComponentFixture<ValErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
