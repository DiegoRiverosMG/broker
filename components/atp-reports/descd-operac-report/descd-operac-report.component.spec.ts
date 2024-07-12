import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescdOperacReportComponent } from './descd-operac-report.component';



describe('DescdOperacReportComponent', () => {
    let component: DescdOperacReportComponent;
    let fixture: ComponentFixture<DescdOperacReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DescdOperacReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescdOperacReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
