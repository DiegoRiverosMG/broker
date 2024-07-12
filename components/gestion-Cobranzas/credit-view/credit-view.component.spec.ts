import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditViewComponent } from './credit-view.component';

describe('CreditViewComponent', () => {
  let component: CreditViewComponent;
  let fixture: ComponentFixture<CreditViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
