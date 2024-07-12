import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverSpecificInformationComponent } from './cover-specific-information.component';

describe('CoverSpecificInformationComponent', () => {
  let component: CoverSpecificInformationComponent;
  let fixture: ComponentFixture<CoverSpecificInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverSpecificInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverSpecificInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
