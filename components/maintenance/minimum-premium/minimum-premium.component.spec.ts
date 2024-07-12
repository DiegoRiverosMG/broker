import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimumPremiumComponent } from './minimum-premium.component';

describe('MinimumPremiumComponent', () => {
  let component: MinimumPremiumComponent;
  let fixture: ComponentFixture<MinimumPremiumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimumPremiumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinimumPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
