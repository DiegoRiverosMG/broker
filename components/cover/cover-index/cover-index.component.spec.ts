import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverIndexComponent } from './cover-index.component';

describe('CoverIndexComponent', () => {
  let component: CoverIndexComponent;
  let fixture: ComponentFixture<CoverIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
