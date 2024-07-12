import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestProformaPolicyComponent } from './request-proforma-policy.component';

describe('RequestProformaPolicyComponent', () => {
  let component: RequestProformaPolicyComponent;
  let fixture: ComponentFixture<RequestProformaPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestProformaPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestProformaPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
