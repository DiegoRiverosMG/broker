import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoModalComponent } from './listado-modal.component';

describe('ListadoModalComponent', () => {
  let component: ListadoModalComponent;
  let fixture: ComponentFixture<ListadoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListadoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
