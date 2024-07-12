import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyResultComponent } from './policy-result.component';

describe('PolicyResultComponent', () => {
  let component: PolicyResultComponent;
  let fixture: ComponentFixture<PolicyResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
