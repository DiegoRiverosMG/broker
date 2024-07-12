import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCommissionComponent } from './config-commission.component';



describe('DescdComisionesReportComponent', () => {
    let component: ConfigCommissionComponent;
    let fixture: ComponentFixture<ConfigCommissionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfigCommissionComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigCommissionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


