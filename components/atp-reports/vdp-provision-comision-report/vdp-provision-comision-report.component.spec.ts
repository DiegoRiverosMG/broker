import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpComisionReportComponent } from './vdp-provision-comision-report.component';

describe('VdpComisionReportComponent', () => {
    let component: VdpComisionReportComponent;
    let fixture: ComponentFixture<VdpComisionReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VdpComisionReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VdpComisionReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
