import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescdTecnicReportComponent } from './descd-tecnic-report.component';

describe('VdpTecnicReportComponent', () => {
    let component: DescdTecnicReportComponent;
    let fixture: ComponentFixture<DescdTecnicReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DescdTecnicReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescdTecnicReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
