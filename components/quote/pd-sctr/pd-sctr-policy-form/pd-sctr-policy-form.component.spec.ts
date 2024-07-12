import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PdSctrPolicyFormComponent } from './pd-sctr-policy-form.component';

describe('PdSctrPolicyFormComponent', () => {
  let component: PdSctrPolicyFormComponent;
  let fixture: ComponentFixture<PdSctrPolicyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdSctrPolicyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdSctrPolicyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
