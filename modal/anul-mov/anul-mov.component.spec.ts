import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnulMovComponent } from './anul-mov.component';

describe('AnulMovComponent', () => {
  let component: AnulMovComponent;
  let fixture: ComponentFixture<AnulMovComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnulMovComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnulMovComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
