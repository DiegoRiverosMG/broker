import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyIndexComponent } from './agency-index.component';

xdescribe('AgencyComponent', () => {
  let component: AgencyIndexComponent;
  let fixture: ComponentFixture<AgencyIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AgencyIndexComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
