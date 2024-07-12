import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoProviCommisionComponent } from './monitoreo-provi-commision.component';

describe('PremiumReportTrackingComponent', () => {
  let component: MonitoreoProviCommisionComponent;
  let fixture: ComponentFixture<MonitoreoProviCommisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoreoProviCommisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoreoProviCommisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
