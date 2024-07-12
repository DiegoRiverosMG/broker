import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewDocumentModalComponent } from './new-document-modal.component';


describe('ComentarioModalComponent', () => {
  let component: NewDocumentModalComponent;
  let fixture: ComponentFixture<NewDocumentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDocumentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
