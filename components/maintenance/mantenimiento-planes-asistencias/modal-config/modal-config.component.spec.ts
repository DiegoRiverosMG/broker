import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoPlanAsistModalConfigComponent } from './modal-config.component';

import { PlanesAsistenciasService } from '../../../../services/maintenance/planes-asistencias/planes-asistencias.service';


describe('MantenimientoPlanAsistModalConfigComponent', () => {
    let component: MantenimientoPlanAsistModalConfigComponent;
    let fixture: ComponentFixture<MantenimientoPlanAsistModalConfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MantenimientoPlanAsistModalConfigComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MantenimientoPlanAsistModalConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


  
