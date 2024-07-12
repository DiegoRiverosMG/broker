import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassingTransactComponent } from './reassing-transact.component';

describe('ReassingTransactComponent', () => {
  let component: ReassingTransactComponent;
  let fixture: ComponentFixture<ReassingTransactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassingTransactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassingTransactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
