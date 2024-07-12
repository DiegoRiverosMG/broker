import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescdComisionesReportComponent } from './descd-comisiones-report.component';



describe('DescdComisionesReportComponent', () => {
    let component: DescdComisionesReportComponent;
    let fixture: ComponentFixture<DescdComisionesReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DescdComisionesReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescdComisionesReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
