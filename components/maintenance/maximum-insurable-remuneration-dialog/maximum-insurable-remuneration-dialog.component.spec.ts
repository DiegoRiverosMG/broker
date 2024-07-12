import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaximumInsurableRemunerationDialogComponent } from './maximum-insurable-remuneration-dialog.component';

describe('MaximumInsurableRemunerationDialogComponent', () => {
  let component: MaximumInsurableRemunerationDialogComponent;
  let fixture: ComponentFixture<MaximumInsurableRemunerationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaximumInsurableRemunerationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaximumInsurableRemunerationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
