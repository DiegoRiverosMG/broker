import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoComiDifComponent } from './mantenimiento-comi-dif.component';

import { ComisionesDiferenciadasService } from '../../../services/maintenance/comisiones-diferenciadas/comisiones-diferenciadas.service';


describe('MantenimientoComiDifComponent', () => {
    let component: MantenimientoComiDifComponent;
    let fixture: ComponentFixture<MantenimientoComiDifComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MantenimientoComiDifComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MantenimientoComiDifComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


  
