/*************************************************************************************************/
/*  NOMBRE              :   PRIORITY-CONFIGURATION.COMPONENT.TS                                  */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   20-09-2022                                                           */
/*  VERSIÓN             :   2.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { PriorityConfigurationService } from '../../../backoffice/services/priority-configuration/priority-configuration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

export interface FiltroRamos {
    NNUMORI?: number;
    FLAG?: number;
}

export interface FiltroInterfaz {
    mvt_nnumori?: number;
}

export interface NuevasPrioridades {
    NBRANCH?: number;
    NNUMORI?: number;
    PRIORITIES?: Array<any>;
}

@Component({
    selector: 'app-priority-configuration',
    templateUrl: './priority-configuration.component.html',
    styleUrls: ['./priority-configuration.component.css']
})

export class PriorityConfigurationComponent implements OnInit {

    filtroRamos: FiltroRamos;
    filtroInterfaz: FiltroInterfaz;
    nuevasPrioridades: NuevasPrioridades;
    filterForm: FormGroup;
    submitted: boolean = false;
    origen: any = [];
    interfaces: any = [];
    ramos: any = [];
    dependencias: any = [];
    prioridades: any = [];
    activeItems = [];

    constructor(
        private formBuilder: FormBuilder,
        private priorityConfigurationService: PriorityConfigurationService
    ) { }

    ngOnInit(): void {
        this.inicializarFiltros();
        this.createForm();
        this.getParams();
        // this.listar();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            NNUMORI: [1, Validators.required],
            NBRANCH: [77, Validators.required]
        });
    }

    listar = () => {
        this.listarDependenciasInterfaces();
        this.listarPrioridadesInterfaces();
    }

    listarDependenciasInterfaces(): void {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.priorityConfigurationService.listarDependenciasInterfacesFiltradas(this.filterForm.getRawValue()).subscribe(
                res => {
                    this.dependencias = res.Result.lista;
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las dependencias de interfaz.', 'error'); }
            )
        }
    }

    listarPrioridadesInterfaces(): void {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.priorityConfigurationService.listarPrioridadesInterfaces(this.filterForm.getRawValue()).subscribe(
                res => {
                    this.prioridades = res.Result.lista;
                    if (this.prioridades.length == 0) {
                        Swal.fire('Información', 'No se encontraron prioridades de interfaz en la búsqueda.', 'warning');
                    }
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las prioridades de interfaz.', 'error'); }
            )
        }
    }

    inicializarFiltros = () => {
        this.filtroRamos = {};
        this.filtroRamos.NNUMORI = 1;
        this.filtroRamos.FLAG = 1;
        this.filtroInterfaz = {};
        this.nuevasPrioridades = {};
        this.filtroInterfaz.mvt_nnumori = 1;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
    }

    getParams = () => {
        let $origen = this.priorityConfigurationService.listarOrigen();
        //let $ramos  = this.priorityConfigurationService.listarRamos(this.filtroRamos);
        return forkJoin([$origen]).subscribe(
        //return forkJoin([$origen, $ramos]).subscribe(
            res => {
                this.origen = res[0].Result.combos;
                //this.ramos = res[1].Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error'); }
        )
    }

    seleccionarOrigen = (e) => {
        this.filtroInterfaz.mvt_nnumori = e;
        this.filtroRamos.NNUMORI = e;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
        // switch (Number(e)) {
        //     case 1:
        //         this.filterForm.controls.NBRANCH.enable();
        //         this.filterForm.controls.NBRANCH.setValue(77);
        //     break;
        //     default:
        //         this.filterForm.controls.NBRANCH.disable();
        //         this.filterForm.controls.NBRANCH.setValue(0);
        //     break;
        // }
    }
    listarRamos = (filtro) => {
        this.priorityConfigurationService.listarRamos(filtro).subscribe(
            res => {
                this.ramos = res.Result.combos;
                this.filterForm.controls.NBRANCH.setValue(this.ramos[0].NBRANCH);
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos.', 'error'); }
        )
    }

    listarInterfaces = (item) => {
        this.priorityConfigurationService.listarInterfaces(item).subscribe(
            res => {
                this.interfaces = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error'); }
        )
    }

    moveToTheRight(): void {
        this.move('dependencias', 'prioridades');
    }

    moveToTheLeft(): void {
        this.move('prioridades', 'dependencias');
    }

    move(from: string, to: string): void {
        this[from] = this[from].filter(
            (item: any) => {
                if (this.isInActiveItems(item)) {
                    this[to].push(item);
                    return false;
                } else {
                    return true;
                }
            }
        );
        this.activeItems.length = 0;
    }

    toggleActiveItem(eventItem: any): void {
        if (this.activeItems.find(item => item === eventItem)) {
            this.activeItems = this.activeItems.filter(item => item !== eventItem);
        } else {
            this.activeItems.push(eventItem);
        }
    }

    isInActiveItems(eventItem: any): boolean {
        return !!this.activeItems.find(item => item === eventItem);
    }

    swap(array:any[], x: any, y: any) {
        var b = array[x];
        array[x] = array[y];
        array[y] = b;
    }

    moveUp(index: number) {
        if (index >= 1)
        this.swap(this.prioridades, index, index - 1)
    }
  
    moveDown(index: number) {
        if (index < this.prioridades.length - 1)
        this.swap(this.prioridades, index, index + 1)
    }

    eliminarAgregarPrioridadesInterfaces = () => {
        this.nuevasPrioridades.NBRANCH = this.filterForm.get('NBRANCH').value;
        this.nuevasPrioridades.NNUMORI = this.filterForm.get('NNUMORI').value;
        this.nuevasPrioridades.PRIORITIES = this.prioridades;
        this.priorityConfigurationService.eliminarAgregarPrioridadesInterfaces(this.nuevasPrioridades).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.listar();
                    Swal.fire('Información', 'Las prioridades se registraron exitosamente.', 'success');
                } else {
                    this.listar();
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'warning');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al registrar las prioridades.', 'error');
            }
        )
    }
}