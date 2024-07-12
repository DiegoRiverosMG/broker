import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoverComponent } from './add-cover.component';

describe('AddCoverComponent', () => {
  let component: AddCoverComponent;
  let fixture: ComponentFixture<AddCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
