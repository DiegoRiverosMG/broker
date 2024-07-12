import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescdcuentasxcobrarReportComponent } from './descd-cuentasxcobrar-report.component';



describe('DescdcuentasxcobrarReportComponent', () => {
    let component: DescdcuentasxcobrarReportComponent;
    let fixture: ComponentFixture<DescdcuentasxcobrarReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DescdcuentasxcobrarReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescdcuentasxcobrarReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
