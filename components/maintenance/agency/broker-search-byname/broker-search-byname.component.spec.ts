import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerSearchBynameComponent } from './broker-search-byname.component';

describe('BrokerSearchBynameComponent', () => {
  let component: BrokerSearchBynameComponent;
  let fixture: ComponentFixture<BrokerSearchBynameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokerSearchBynameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokerSearchBynameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
