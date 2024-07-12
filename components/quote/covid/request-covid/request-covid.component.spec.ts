import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCovidComponent } from './request-covid.component';

describe('RequestCovidComponent', () => {
  let component: RequestCovidComponent;
  let fixture: ComponentFixture<RequestCovidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestCovidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestCovidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
