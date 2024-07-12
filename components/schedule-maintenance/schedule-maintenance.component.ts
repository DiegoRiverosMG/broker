/*************************************************************************************************/
/*  NOMBRE              :   SCHEDULE-MAINTENCE.COMPONENT.TS                                      */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   06-10-2022                                                           */
/*  VERSIÓN             :   1.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { ScheduleMaintenanceService } from '../../../backoffice/services/schedule-maintenance/schedule-maintenance.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from "rxjs";
import Swal from 'sweetalert2';

export interface FiltroRamos {
    NNUMORI?: number;
    FLAG?: number;
}

export interface FiltroInterfaz {
    mvt_nnumori?: number;
}

export interface Servicio {
    SSERVICIO?: string;
}

@Component({
    selector: 'app-schedule-maintenance',
    templateUrl: './schedule-maintenance.component.html',
    styleUrls: ['./schedule-maintenance.component.css']
})

export class ScheduleMaintenanceComponent implements OnInit {

    origen: any = [];
    ramos: any = [];
    interfaces: any = [];
    horarios: any = [];
    servicios: any = [];
    servicio: Servicio;
    editCache: { [key: string]: any } = {};
    filtroRamos: FiltroRamos;
    filtroInterfaz: FiltroInterfaz;
    filterForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private scheduleMaintenanceService: ScheduleMaintenanceService
    ) { }


    inicializarFiltros = () => {
        this.filtroRamos = {};
        this.filtroRamos.NNUMORI = 1;
        this.filtroRamos.FLAG = 0;

        this.filtroInterfaz = {};
        this.filtroInterfaz.mvt_nnumori = 1;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
    }

    getParams = () => {
        let $origen    = this.scheduleMaintenanceService.listarOrigen();
        //let $ramos     = this.scheduleMaintenanceService.listarRamos(this.filtroRamos);
        return forkJoin([$origen]).subscribe(
        // return forkJoin([$origen, $ramos]).subscribe(
            res => {
                this.origen    = res[0].Result.combos;
                //this.ramos     = res[1].Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los Parámetros.', 'error'); }
        )
    }

    seleccionarOrigen = (e) => {
        this.filtroInterfaz.mvt_nnumori = e;
        this.filtroRamos.NNUMORI = e;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
    }

    listarInterfaces = (item) => {
        this.scheduleMaintenanceService.listarInterfaces(item).subscribe(
            res => {
                this.interfaces = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las Interfaces.', 'error'); }
        )
    }
    listarRamos = (filtro) => {
        this.scheduleMaintenanceService.listarRamos(filtro).subscribe(
            res => {
                this.ramos = res.Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos.', 'error'); }
        )
    } 

    ngOnInit(): void {
        this.servicio = {};
        this.servicio.SSERVICIO = null;
        this.createForm();
        this.inicializarFiltros();
        this.getParams();
        this.listarHorarios();
        this.listarServicios();
        this.updateEditCache();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            NNUMORI: [1],
            NTIPEJE: [''],
            NBRANCH: [77],
            NCODGRU: [12]
        });
    }

    listarHorarios = () => {
        this.scheduleMaintenanceService.listarHorarios().subscribe(
            res => {
                this.horarios = res.Result.lista;
                this.updateEditCache();
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los Horarios.', 'error'); }
        )
    }

    listarServicios = () => {
        this.scheduleMaintenanceService.listarServicios().subscribe(
            res => {
                this.servicios = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los Servicios.', 'error'); }
        )
    }
    
    modificarConfiguracion = (item) => {
        this.scheduleMaintenanceService.modificarHorarios(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.listarHorarios();
                    Swal.fire('Información', 'Se Realizó con Éxito la Modificación del Horario.', 'success');
                } else {
                    this.listarHorarios();
                    Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                }
            }
        )
    }

    iniciarServicio = (item) => {
        if (item.SSERVICIO) {
            this.scheduleMaintenanceService.iniciarServicio(item).subscribe(
                res => { 
                    Swal.fire('Información', res, 'success');
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al iniciar el servicio.', 'error'); }
            )
        } else {
            Swal.fire('Información', 'Seleccione un servicio.', 'warning');
        }
    }

    detenerServicio = (item) => {
        if (item.SSERVICIO) {
            this.scheduleMaintenanceService.detenerServicio(item).subscribe(
                res => { 
                    Swal.fire('Información', res, 'success');
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al detener el servicio.', 'error'); }
            )
        } else {
            Swal.fire('Información', 'Seleccione un servicio.', 'warning');
        }
    }

    estadoServicio = (item) => {
        if (item.SSERVICIO) {
            this.scheduleMaintenanceService.estadoServicio(item).subscribe(
                res => { 
                    Swal.fire('Información', res, 'success');
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el estado del servicio.', 'error'); }
            )
        } else {
            Swal.fire('Información', 'Seleccione un servicio.', 'warning');
        }
    }

    startEdit(NNUNTAREA: string): void {
        this.editCache[NNUNTAREA].edit = true;
    }

    cancelEdit(NNUNTAREA: string): void {
        const index = this.horarios.findIndex(item => item.NNUNTAREA === NNUNTAREA);
        this.editCache[NNUNTAREA] = {
            data: { ...this.horarios[index] },
            edit: false
        };
    }

    saveEdit(NNUNTAREA: string): void {
        const index = this.horarios.findIndex(item => item.NNUNTAREA === NNUNTAREA);
        Object.assign(this.horarios[index], this.editCache[NNUNTAREA].data);
        this.editCache[NNUNTAREA].edit = false;
        this.modificarConfiguracion(this.editCache[NNUNTAREA].data);
    }

    updateEditCache(): void {
        this.horarios.forEach(
            item => {
                this.editCache[item.NNUNTAREA] = {
                edit: false,
                data: { ...item }
                };
            }
        );
    }

    addRow() {
        this.editCache[0].edit = true;
        let indexForId = this.horarios.length + 1
        this.horarios.push({
            id: indexForId,
            NNUNTAREA: ''
        })
    }
}