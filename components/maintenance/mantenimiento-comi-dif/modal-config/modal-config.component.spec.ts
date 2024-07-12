import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoComiDifModalConfigComponent } from './modal-config.component';

import { ComisionesDiferenciadasService } from '../../../../services/maintenance/comisiones-diferenciadas/comisiones-diferenciadas.service';


describe('MantenimientoComiDifModalConfigComponent', () => {
    let component: MantenimientoComiDifModalConfigComponent;
    let fixture: ComponentFixture<MantenimientoComiDifModalConfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MantenimientoComiDifModalConfigComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MantenimientoComiDifModalConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


  
