import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoPlanAsistComponent } from './mantenimiento-planes-asistencias.component';

import { PlanesAsistenciasService } from '../../../services/maintenance/planes-asistencias/planes-asistencias.service';


describe('MantenimientoPlanAsistComponent', () => {
    let component: MantenimientoPlanAsistComponent;
    let fixture: ComponentFixture<MantenimientoPlanAsistComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MantenimientoPlanAsistComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MantenimientoPlanAsistComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


  
