import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCiiuComponent } from './add-ciiu.component';

describe('AddCiiuComponent', () => {
  let component: AddCiiuComponent;
  let fixture: ComponentFixture<AddCiiuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCiiuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCiiuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
