import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCommissionComponentRecord } from './config-commission-record.component';



describe('DescdComisionesReportComponent', () => {
    let component: ConfigCommissionComponentRecord;
    let fixture: ComponentFixture<ConfigCommissionComponentRecord>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfigCommissionComponentRecord]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigCommissionComponentRecord);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


