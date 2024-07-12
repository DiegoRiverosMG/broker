import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractingComponent } from './add-contracting.component';

describe('AddContractingComponent', () => {
  let component: AddContractingComponent;
  let fixture: ComponentFixture<AddContractingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddContractingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContractingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
