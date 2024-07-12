import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisaResultComponent } from './visa-result.component';

xdescribe('VisaResultComponent', () => {
  let component: VisaResultComponent;
  let fixture: ComponentFixture<VisaResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VisaResultComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisaResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
