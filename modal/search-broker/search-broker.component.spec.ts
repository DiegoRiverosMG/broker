import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBrokerComponent } from './search-broker.component';

describe('SearchBrokerComponent', () => {
  let component: SearchBrokerComponent;
  let fixture: ComponentFixture<SearchBrokerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBrokerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBrokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
