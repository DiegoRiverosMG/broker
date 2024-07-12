import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavmenusctrComponent } from './navmenusctr.component';

describe('NavmenusctrComponent', () => {
  let component: NavmenusctrComponent;
  let fixture: ComponentFixture<NavmenusctrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavmenusctrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavmenusctrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
