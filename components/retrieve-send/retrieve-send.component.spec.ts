import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveSendComponent } from './retrieve-send.component';

xdescribe('RetrieveSendComponent', () => {
  let component: RetrieveSendComponent;
  let fixture: ComponentFixture<RetrieveSendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RetrieveSendComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrieveSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
