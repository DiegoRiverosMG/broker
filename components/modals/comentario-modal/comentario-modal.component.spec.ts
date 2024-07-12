import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComentarioModalComponent } from './comentario-modal.component';


describe('ComentarioModalComponent', () => {
  let component: ComentarioModalComponent;
  let fixture: ComponentFixture<ComentarioModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComentarioModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComentarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
