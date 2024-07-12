import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditPoliticaComponent } from './credit-politica.component';

describe('CreditPoliticaComponent', () => {
  let component: CreditPoliticaComponent;
  let fixture: ComponentFixture<CreditPoliticaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditPoliticaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditPoliticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
