import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDocumentsAllComponent } from './policy-documents-all.component';

describe('PolicyDocumentsAllComponent', () => {
  let component: PolicyDocumentsAllComponent;
  let fixture: ComponentFixture<PolicyDocumentsAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyDocumentsAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDocumentsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
