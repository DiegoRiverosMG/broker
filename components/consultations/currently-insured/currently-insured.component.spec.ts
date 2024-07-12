import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentlyInsuredComponent } from './currently-insured.component';

describe('CurrentlyInsuredComponent', () => {
  let component: CurrentlyInsuredComponent;
  let fixture: ComponentFixture<CurrentlyInsuredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentlyInsuredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentlyInsuredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
