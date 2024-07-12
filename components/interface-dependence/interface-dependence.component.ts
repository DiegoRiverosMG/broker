/*************************************************************************************************/
/*  NOMBRE              :   INTERFACE-DEPENDENCE.COMPONENT.TS                                    */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   16-09-2022                                                           */
/*  VERSIÓN             :   2.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { InterfaceDependenceService } from '../../../backoffice/services/interface-dependence/interface-dependence.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../global-validators';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

export interface filtroRamos {
    NNUMORI?: number;
    FLAG?: number;
}

export interface filtroInterfaz {
    mvt_nnumori?: number;
}

export interface gridConfig {
    NBRANCH?: number;
    NNUMORI?: number;
    NCODGRU?: number;
    NCODGRUDEP?: number;
    NASINCRONO?: boolean;
    NSTATUS?: number;
    CUSUMOD?: string;
    NREPIT?: number;
    NTESPERA?: number;
    FLAG?: number;
}

@Component({
    selector: 'app-interface-dependence',
    templateUrl: './interface-dependence.component.html',
    styleUrls: ['./interface-dependence.component.css']
})

export class InterfaceDependenceComponent implements OnInit {

    filtroRamos: filtroRamos;
    filtroInterfaz: filtroInterfaz;
    filterForm: FormGroup;
    registerForm: FormGroup;
    editForm: FormGroup;
    submitted: boolean = false;
    gridConfig: gridConfig;

    origen: any = [];
    interfaces: any = [];
    ramos: any = [];
    dependencias: any = [];

    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 15;
    totalItems = 0;
    maxSize = 10;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private interfaceDependenceService: InterfaceDependenceService
    ) { }

    ngOnInit(): void {
        this.createForm();
        this.inicializarFiltros();
        this.getParams();
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.dependencias.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    listarDependenciasInterfaces(): void {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.interfaceDependenceService.listarDependenciasInterfaces(this.filterForm.getRawValue()).subscribe(
                res => {
                    this.currentPage = 1;
                    this.dependencias = res.Result.lista;
                    this.totalItems = this.dependencias.length;
                    this.listToShow = this.dependencias.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.dependencias.length == 0) {
                        Swal.fire('Información', 'No se encontraron dependencias de interfaz en la búsqueda.', 'warning');
                    }
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las dependencias de interfaz.', 'error'); }
            )
        }
    }

    listarDependenciasInterfacesWithoutAlert(): void {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.interfaceDependenceService.listarDependenciasInterfaces(this.filterForm.getRawValue()).subscribe(
                res => {
                    this.currentPage = 1;
                    this.dependencias = res.Result.lista;
                    this.totalItems = this.dependencias.length;
                    this.listToShow = this.dependencias.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las dependencias de interfaz.', 'error'); }
            )
        }
    }

    agregarDependenciasInterfaces(): void {
        this.submitted = true;
        if (this.registerForm.valid) {
            this.registerForm.controls.CUSUMOD.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
            this.interfaceDependenceService.agregarDependenciasInterfaces(this.registerForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        this.listarDependenciasInterfacesWithoutAlert();
                        Swal.fire('Información', 'Se realizó con éxito la creación de la dependencia de interfaz.', 'success');
                    } else {
                        this.listarDependenciasInterfacesWithoutAlert();
                        Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                    }
                    this.modalService.dismissAll();
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las dependencias de interfaz.', 'error'); }
            )
        }
    }

    editarDependenciasInterfaces(): void {
        this.submitted = true;
        if (this.editForm.valid) {
            this.editForm.controls.CUSUMOD.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
            this.interfaceDependenceService.agregarDependenciasInterfaces(this.editForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        this.listarDependenciasInterfacesWithoutAlert();
                        Swal.fire('Información', 'Se realizó con éxito la modificación de la dependencia de interfaz.', 'success');
                    } else {
                        this.listarDependenciasInterfacesWithoutAlert();
                        Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                    }
                    this.modalService.dismissAll();
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las dependencias de interfaz.', 'error'); }
            )
        }
    }

    eliminarDependenciasInterfaces = (item) => {
        Swal.fire(
            {
                title: '¿Estás seguro de eliminar la dependencia?',
                text: 'Si eliminas una dependencia, tendrás que configurar nuevamente las prioridades.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }
        ).then(
            (result) => {
                if (result.value) {
                    this.interfaceDependenceService.eliminarDependenciasInterfaces(item).subscribe(
                        res => {
                            if (res.Result.P_NCODE == 0) {
                                this.listarDependenciasInterfacesWithoutAlert();
                                Swal.fire('Información', 'Se realizó con éxito la eliminación de la dependencia de interfaz.', 'success');
                            } else {
                                this.listarDependenciasInterfacesWithoutAlert();
                                Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                            }
                            this.modalService.dismissAll();
                        }
                    )
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.modalService.dismissAll();
                }
            }
        )
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            NBRANCH: [77, Validators.required],
            NNUMORI: [1, Validators.required]
        });
    }

    private createFormReg(): void {
        this.registerForm = this.formBuilder.group({
            NBRANCH: ['', Validators.required],
            NNUMORI: ['', Validators.required],
            NCODGRU: ['', Validators.required],
            NCODGRUDEP: ['', Validators.required],
            NASINCRONO: [false, Validators.required],
            NSTATUS: [1, Validators.required],
            CUSUMOD: [''],
            NREPIT: ['', Validators.required],
            NTESPERA: ['', Validators.required],
            FLAG: [0]
        });
    }

    private createFormEdit(): void {
        this.editForm = this.formBuilder.group({
            NBRANCH: [this.gridConfig.NBRANCH, Validators.required],
            NNUMORI: [this.gridConfig.NNUMORI, Validators.required],
            NCODGRU: [this.gridConfig.NCODGRU, Validators.required],
            NCODGRUDEP: [this.gridConfig.NCODGRUDEP, Validators.required],
            NASINCRONO: [this.gridConfig.NASINCRONO, Validators.required],
            NSTATUS: [this.gridConfig.NSTATUS],
            CUSUMOD: [this.gridConfig.CUSUMOD],
            NREPIT: [this.gridConfig.NREPIT, Validators.required],
            NTESPERA: [this.gridConfig.NTESPERA, Validators.required],
            FLAG: [1]
        });
    }

    inicializarFiltros = () => {
        this.filtroRamos = {};
        this.filtroRamos.NNUMORI = 1;
        this.filtroRamos.FLAG = 1;
        this.filtroInterfaz = {};
        this.filtroInterfaz.mvt_nnumori = 1;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
    }

    getParams = () => {
        let $origen = this.interfaceDependenceService.listarOrigen();
        //let $ramos  = this.interfaceDependenceService.listarRamos(this.filtroRamos);
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

    listarInterfaces = (item) => {
        this.interfaceDependenceService.listarInterfaces(item).subscribe(
            res => {
                this.interfaces = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error'); }
        )
    }
    listarRamos = (filtro) => {
        this.interfaceDependenceService.listarRamos(filtro).subscribe(
            res => {
                this.ramos = res.Result.combos;
                this.filterForm.controls.NBRANCH.setValue(this.ramos[0].NBRANCH);
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos.', 'error'); }
        )
    }

    mostrarModalAgregar(content: any) {
        this.submitted = false;
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.createFormReg();
        this.registerForm.setValidators([GlobalValidators.equalsValues]);
        this.registerForm.controls.NNUMORI.disable();
        this.registerForm.controls.NBRANCH.disable();
        this.registerForm.controls.NNUMORI.setValue(this.filterForm.get('NNUMORI').value);
        this.registerForm.controls.NBRANCH.setValue(this.filterForm.get('NBRANCH').value);
    }

    mostrarModalEditar(content: any, item) {
        this.submitted = false;
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.gridConfig = item;
        this.createFormEdit();
        this.editForm.setValidators([GlobalValidators.equalsValues]);
        this.editForm.controls.NNUMORI.disable();
        this.editForm.controls.NBRANCH.disable();
        this.editForm.controls.NCODGRU.disable();
        this.editForm.controls.NCODGRUDEP.disable();
    }
}