import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescdConveniosReportComponent } from './descd-convenios-report.component';

describe('DescdConveniosReportComponent', () => {
    let component: DescdConveniosReportComponent;
    let fixture: ComponentFixture<DescdConveniosReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DescdConveniosReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescdConveniosReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
