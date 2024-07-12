import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceCrossingComponent } from './interface-crossing.component';

describe('InterfaceCrossingComponent', () => {
  let component: InterfaceCrossingComponent;
  let fixture: ComponentFixture<InterfaceCrossingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterfaceCrossingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfaceCrossingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
