import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpContaComisionReportComponent } from './vdp-ContaComision-report.component';

describe('VdpRenovationReportComponent', () => {
    let component: VdpContaComisionReportComponent;
    let fixture: ComponentFixture<VdpContaComisionReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VdpContaComisionReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VdpContaComisionReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy()
    });
});
