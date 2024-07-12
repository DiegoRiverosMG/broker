import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviComisionesReportComponent } from './provi-comisiones-report.component';

import { ProviComisionesService } from '../../services/report/reporte-proviComisiones.service';


describe('ProviComisionesReportComponent', () => {
    let component: ProviComisionesReportComponent;
    let fixture: ComponentFixture<ProviComisionesReportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProviComisionesReportComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProviComisionesReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


  
