import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescdFacturacionReportComponent } from './descd-facturacion-report.component';



describe('DescdFacturacionReportComponent', () => {
    let component: DescdFacturacionReportComponent;
    let fixture: ComponentFixture<DescdFacturacionReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DescdFacturacionReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescdFacturacionReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
