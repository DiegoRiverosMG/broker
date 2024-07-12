import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchContractingComponent } from './search-contracting.component';

describe('SearchContractingComponent', () => {
  let component: SearchContractingComponent;
  let fixture: ComponentFixture<SearchContractingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchContractingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchContractingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
