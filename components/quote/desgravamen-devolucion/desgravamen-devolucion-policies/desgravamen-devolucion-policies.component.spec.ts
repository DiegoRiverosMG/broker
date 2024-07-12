import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesgravamenDevolucionPoliciesComponent } from './desgravamen-devolucion-policies.component';

describe('DesgravamenDevolucionPoliciesComponent', () => {
  let component: DesgravamenDevolucionPoliciesComponent;
  let fixture: ComponentFixture<DesgravamenDevolucionPoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesgravamenDevolucionPoliciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesgravamenDevolucionPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
