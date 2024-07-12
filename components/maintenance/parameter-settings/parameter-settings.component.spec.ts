import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterSettingsComponent } from './parameter-settings.component';

fdescribe('ParameterSettingsComponent', () => {
  let component: ParameterSettingsComponent;
  let fixture: ComponentFixture<ParameterSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });
  
  fit ('should list products by branch', async () => {
        component.filters.NBRANCH = 1
        await component.getProductListByBranch()
        expect(component.productList.length).not.toEqual(0)
    })
   
});
