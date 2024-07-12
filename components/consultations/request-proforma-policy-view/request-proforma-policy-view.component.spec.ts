import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestProformaPolicyViewComponent } from './request-proforma-policy-view.component';

describe('RequestProformaPolicyViewComponent', () => {
  let component: RequestProformaPolicyViewComponent;
  let fixture: ComponentFixture<RequestProformaPolicyViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestProformaPolicyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestProformaPolicyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
