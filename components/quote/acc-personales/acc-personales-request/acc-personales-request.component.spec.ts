import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPersonalesRequestComponent } from './acc-personales-request.component';

describe('AccPersonalesRequestComponent', () => {
  let component: AccPersonalesRequestComponent;
  let fixture: ComponentFixture<AccPersonalesRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPersonalesRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPersonalesRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
