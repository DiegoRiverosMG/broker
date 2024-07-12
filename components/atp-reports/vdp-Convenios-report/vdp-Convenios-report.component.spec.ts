import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpConveniosReportComponent } from './vdp-Convenios-report.component';

describe('VdpConveniosReportComponent', () => {
    let component: VdpConveniosReportComponent;
    let fixture: ComponentFixture<VdpConveniosReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VdpConveniosReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VdpConveniosReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
