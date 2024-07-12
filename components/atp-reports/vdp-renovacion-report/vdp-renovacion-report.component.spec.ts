import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpRenovationReportComponent } from './vdp-renovacion-report.component';

describe('VdpRenovationReportComponent', () => {
    let component: VdpRenovationReportComponent;
    let fixture: ComponentFixture<VdpRenovationReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VdpRenovationReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VdpRenovationReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy()
    });
});
