import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PdSctrPolicyIndexComponent } from './pd-sctr-policy-index.component';


describe('PdSctrPolicyIndexComponent', () => {
  let component: PdSctrPolicyIndexComponent;
  let fixture: ComponentFixture<PdSctrPolicyIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdSctrPolicyIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdSctrPolicyIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
