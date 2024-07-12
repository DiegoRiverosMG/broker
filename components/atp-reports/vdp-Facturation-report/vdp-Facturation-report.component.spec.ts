import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VdpFacturationReportComponent } from './vdp-Facturation-report.component';

describe('VdpFacturationReportComponent', () => {
    let component: VdpFacturationReportComponent;
    let fixture: ComponentFixture<VdpFacturationReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VdpFacturationReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VdpFacturationReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
