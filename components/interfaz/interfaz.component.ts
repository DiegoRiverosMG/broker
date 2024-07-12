/*************************************************************************************************/
/*  NOMBRE              :   INTERFAZ.COMPONENT.TS                                                */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   12-12-2022                                                           */
/*  VERSIÓN             :   2.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { InterfazService } from '../../../backoffice/services/interfaz/interfaz.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from "rxjs";
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

export interface filtroOrigen {
    mvt_nnumori?: number;
}

export interface filtroInterfaz {
    mvt_nnumori?: number;
    mvt_ncodgru?: number;
}

export interface gridInterfaz {
    mvt_nnumori?: number;
    mvt_ncodgru?: number;
    mvt_cdescri?: string;
    mvt_vestado?: string;
    mvt_cusucre?: string;
}

export interface gridMovimientos {
    mct_nnumori?: number;
    mct_ncodgru?: number;
    mct_ncodcon?: number;
    mct_cdescri?: string;
    mct_ctipreg?: string;
    mct_descbco?: number;
    mct_flagrep?: boolean;
    mct_vestado?: string;
    mct_cusucre?: string;
}

@Component({
    selector: 'app-interfaz',
    templateUrl: './interfaz.component.html',
    styleUrls: ['./interfaz.component.css'],
    providers: [NgbModalConfig, NgbModal]
})

export class InterfazComponent implements OnInit {

    public bsConfig: Partial<BsDatepickerConfig>;
    selectedName: any;
    seleccionInterfaz: string = "";
    submitted: boolean = false;
    booleanMov: boolean = true;

    interfazRegisterForm: FormGroup;
    interfazEditForm: FormGroup;
    movimientoRegisterForm: FormGroup;
    movimientoEditForm: FormGroup;
    
    origen: [];
    estados: [];
    interfaces: [];
    tipoAsientos: [];
    reportesAsociados: [];

    filtroOrigen: filtroOrigen;
    filtroInterfaz: filtroInterfaz;
    gridInterfaz: gridInterfaz;
    gridMovimientos: gridMovimientos;

    listVisualizarResults: [];
    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 5;
    totalItems = 0;
    maxSize = 10;

    listVisualizarResultsMovimientos: [];
    listToShowMovimientos: any = [];
    currentPageMovimientos = 1;
    itemsPerPageMovimientos = 5;
    totalItemsMovimientos = 0;
    maxSizeMovimientos = 10;

    constructor(
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
        private InterfazService: InterfazService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }
    ngOnInit(): void {
        this.inicializarFiltros();
        this.getParams();
    }

    // MÉTODOS
    inicializarFiltros = () => {
        this.filtroOrigen = {};
        this.filtroOrigen.mvt_nnumori = 1;
        this.filtroInterfaz = {};
        this.gridInterfaz = {};
        this.gridMovimientos = {};
    }
    getParams = () => {
        let $estados = this.InterfazService.listarEstados();
        let $origen = this.InterfazService.listarOrigen();
        let $tipoAsientos = this.InterfazService.listarTipoAsiento();
        let $reportesAsociados = this.InterfazService.listarReportesAsociados();
        return forkJoin([$estados, $origen, $tipoAsientos, $reportesAsociados]).subscribe(
            res => {
                this.estados = res[0].Result.combos;
                this.origen = res[1].Result.combos;
                this.tipoAsientos = res[2].Result.combos;
                this.reportesAsociados = res[3].Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error'); }
        )
    }
    seleccionarInterfaz = (item) => {
        this.booleanMov = false;
        this.selectedName = item.mvt_ncodgru;
        this.seleccionInterfaz = item.mvt_cdescri;
        this.filtroInterfaz.mvt_nnumori = Number(item.mvt_nnumori);
        this.filtroInterfaz.mvt_ncodgru = Number(item.mvt_ncodgru);
        this.listarMovimientos();
    }
    clean = () => {
        this.booleanMov = true;
        this.listVisualizarResults = null;
        this.listToShow = null;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.maxSize = 10;
        this.listVisualizarResultsMovimientos = null;
        this.listToShowMovimientos = null;
        this.currentPageMovimientos = 1;
        this.itemsPerPageMovimientos = 5;
        this.totalItemsMovimientos = 0;
        this.maxSizeMovimientos = 10;
    }
    activarReporteAdd = (checked) => {
        if (!checked) {
            this.movimientoRegisterForm.controls.mct_descbco.setValue('');
            this.movimientoRegisterForm.controls.mct_descbco.disable();
        } else {
            this.movimientoRegisterForm.controls.mct_descbco.enable();
        }
    }
    activarReporteEdit = (checked) => {
        if (!checked) {
            this.movimientoEditForm.controls.mct_descbco.setValue('');
            this.movimientoEditForm.controls.mct_descbco.disable();
        } else {
            this.movimientoEditForm.controls.mct_descbco.enable();
        }
    }

    // CONTROLES
    get controlInterfazRegister(): { [key: string]: AbstractControl } {
        return this.interfazRegisterForm.controls;
    }
    get controlInterfazEdit(): { [key: string]: AbstractControl } {
        return this.interfazEditForm.controls;
    }
    get controlMovimientoRegister(): { [key: string]: AbstractControl } {
        return this.movimientoRegisterForm.controls;
    }
    get controlMovimientoEdit(): { [key: string]: AbstractControl } {
        return this.movimientoEditForm.controls;
    }

    // FORMULARIOS
    private createFormInterfazRegister(): void {
        this.interfazRegisterForm = this.formBuilder.group({
            mvt_nnumori: ['', Validators.required],
            mvt_ncodgru: ['', Validators.required],
            mvt_cdescri: ['', Validators.required],
            mvt_vestado: ['', Validators.required],
            mvt_cusucre: ['']
        });
    }
    private createFormInterfazEdit(): void {
        this.interfazEditForm = this.formBuilder.group({
            mvt_nnumori: [this.gridInterfaz.mvt_nnumori, Validators.required],
            mvt_ncodgru: [this.gridInterfaz.mvt_ncodgru, Validators.required],
            mvt_cdescri: [this.gridInterfaz.mvt_cdescri, Validators.required],
            mvt_vestado: [this.gridInterfaz.mvt_vestado, Validators.required],
            mvt_cusucre: [this.gridInterfaz.mvt_cusucre]
        });
    }
    private createFormMovimientoRegister(): void {
        this.movimientoRegisterForm = this.formBuilder.group({
            mct_nnumori: ['', Validators.required],
            mct_ncodgru: ['', Validators.required],
            mct_ncodcon: ['', Validators.required],
            mct_cdescri: ['', Validators.required],
            mct_vestado: ['', Validators.required],
            mct_ctipreg: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
            mct_flagrep: [false],
            mct_descbco: [''],
            mct_cusucre: ['']
        });
    }
    private createFormMovimientoEdit(): void {
        this.movimientoEditForm = this.formBuilder.group({
            mct_nnumori: [this.gridMovimientos.mct_nnumori, Validators.required],
            mct_ncodgru: [this.gridMovimientos.mct_ncodgru, Validators.required],
            mct_ncodcon: [this.gridMovimientos.mct_ncodcon, Validators.required],
            mct_cdescri: [this.gridMovimientos.mct_cdescri, Validators.required],
            mct_vestado: [this.gridMovimientos.mct_vestado, Validators.required],
            mct_ctipreg: [this.gridMovimientos.mct_ctipreg, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
            mct_flagrep: [this.gridMovimientos.mct_flagrep],
            mct_descbco: [this.gridMovimientos.mct_descbco],
            mct_cusucre: [this.gridMovimientos.mct_cusucre]
        });
    }

    // PAGINADOS
    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.listVisualizarResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }
    pageChangedMovimientos = (currentPage) => {
        this.currentPageMovimientos = currentPage;
        this.listToShowMovimientos = this.listVisualizarResultsMovimientos.slice(
            (this.currentPageMovimientos - 1) * this.itemsPerPageMovimientos,
            this.currentPageMovimientos * this.itemsPerPageMovimientos
        );
    }

    // MODALES INTERFAZ
    mostrarModalInterfazAgregar = (content: any) => {
        this.submitted = false;
        this.modalService.open(content, { backdrop: 'static', size: 'md', keyboard: false, centered: true });
        this.createFormInterfazRegister();
        this.interfazRegisterForm.controls.mvt_nnumori.disable();
        this.interfazRegisterForm.controls.mvt_nnumori.setValue(this.filtroOrigen.mvt_nnumori);
    }
    mostrarModalInterfazEditar = (content: any, item) => {
        this.submitted = false;
        this.modalService.open(content, { backdrop: 'static', size: 'md', keyboard: false, centered: true });
        this.gridInterfaz = item;
        this.createFormInterfazEdit();
        this.interfazEditForm.controls.mvt_nnumori.disable();
        this.interfazEditForm.controls.mvt_ncodgru.disable();
    }

    // MODALES MOVIMIENTOS
    mostrarModalMovimientoAgregar = (content: any) => {
        this.submitted = false;
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.createFormMovimientoRegister();
        this.movimientoRegisterForm.controls.mct_descbco.disable();
        this.movimientoRegisterForm.controls.mct_nnumori.disable();
        this.movimientoRegisterForm.controls.mct_ncodgru.disable();
        this.movimientoRegisterForm.controls.mct_nnumori.setValue(this.filtroInterfaz.mvt_nnumori);
        this.movimientoRegisterForm.controls.mct_ncodgru.setValue(this.filtroInterfaz.mvt_ncodgru);
    }
    mostrarModalMovimientoEditar = (content: any, item) => {
        this.submitted = false;
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.gridMovimientos = item;
        this.createFormMovimientoEdit();
        this.movimientoEditForm.controls.mct_nnumori.disable();
        this.movimientoEditForm.controls.mct_ncodgru.disable();
        this.movimientoEditForm.controls.mct_ncodcon.disable();
        if (this.movimientoEditForm.get('mct_descbco').value == 0) {
            this.movimientoEditForm.controls.mct_descbco.setValue('');
            this.movimientoEditForm.controls.mct_descbco.disable();
        }
    }

    // INTERFAZ
    listarInterfaz = () => {
        this.filtroOrigen.mvt_nnumori = Number(this.filtroOrigen.mvt_nnumori);
        this.InterfazService.listarInterfaz(this.filtroOrigen).subscribe(
            res => {
                this.currentPage = 1;
                this.interfaces = res.Result.lista;
                this.listVisualizarResults = res.Result.lista;
                this.totalItems = this.listVisualizarResults.length;
                this.listToShow = this.listVisualizarResults.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error'); }
        )
    }
    agregarInterfaz = () => {
        this.submitted = true;
        if (this.interfazRegisterForm.valid) {
            this.interfazRegisterForm.controls.mvt_cusucre.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
            this.InterfazService.agregarInterfaz(this.interfazRegisterForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.p_ncode == 0) {
                        this.listarInterfaz();
                        Swal.fire('Información', 'Se realizó con éxito la creación de la interfaz.', 'success');
                        this.modalService.dismissAll();
                    } else {
                        this.listarInterfaz();
                        Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                }
            )
        }
    }
    modificarInterfaz = () => {
        this.submitted = true;
        if (this.interfazEditForm.valid) {
            this.interfazEditForm.controls.mvt_cusucre.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
            this.InterfazService.modificarInterfaz(this.interfazEditForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.p_ncode == 0) {
                        this.listarInterfaz();
                        Swal.fire('Información', 'Se realizó con éxito la modificación de la interfaz.', 'success');
                        this.modalService.dismissAll();
                    } else {
                        this.listarInterfaz();
                        Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                }
            )
        }
    }
    eliminarInterfaz = (item) => {
        Swal.fire(
            {
                title: '¿Está seguro de eliminar la interfaz?',
                text: 'Esta acción es irreversible.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }
        ).then(
            (result) => {
                if (result.value) {
                    this.gridInterfaz = item;
                    this.InterfazService.eliminarInterfaz(this.gridInterfaz).subscribe(
                        res => {
                            if (res.Result.p_ncode == 0) {
                                this.listarInterfaz();
                                Swal.fire('Información', 'Se realizó con éxito la eliminación de la interfaz.', 'success');
                            } else {
                                this.listarInterfaz();
                                Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                            }
                        },
                        err => {
                            Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                        }
                    )
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.modalService.dismissAll();
                }
            }
        )
    }

    // MOVIMIENTOS
    listarMovimientos = () => {
        this.InterfazService.listarMovimientos(this.filtroInterfaz).subscribe(
            res => {
                this.currentPageMovimientos = 1;
                this.listVisualizarResultsMovimientos = res.Result.lista;
                this.totalItemsMovimientos = this.listVisualizarResultsMovimientos.length;
                this.listToShowMovimientos = this.listVisualizarResultsMovimientos.slice(
                    (this.currentPageMovimientos - 1) * this.itemsPerPageMovimientos,
                    this.currentPageMovimientos * this.itemsPerPageMovimientos
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los movimientos.', 'error'); }
        )
    }
    agregarMovimientos = () => {
        this.submitted = true;
        if (this.movimientoRegisterForm.valid) {
            this.InterfazService.consultarTipoAsiento(this.movimientoRegisterForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.p_ncode == 0) {
                        this.movimientoRegisterForm.controls.mct_cusucre.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
                        this.InterfazService.agregarMovimientos(this.movimientoRegisterForm.getRawValue()).subscribe(
                            res => {
                                if (res.Result.p_ncode == 0) {
                                    this.listarInterfaz();
                                    this.listarMovimientos();
                                    Swal.fire('Información', 'Se realizó con éxito la creación del movimiento.', 'success');
                                    this.modalService.dismissAll();
                                } else {
                                    this.listarInterfaz();
                                    this.listarMovimientos();
                                    Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                                }
                            },
                            err => {
                                Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                            }
                        )
                    } else {
                        Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                }
            )
        }
    }
    modificarMovimientos = () => {
        this.submitted = true;
        if (this.movimientoEditForm.valid) {
            this.InterfazService.consultarTipoAsiento(this.movimientoEditForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.p_ncode == 0) {
                        this.movimientoEditForm.controls.mct_cusucre.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
                        this.InterfazService.modificarMovimientos(this.movimientoEditForm.getRawValue()).subscribe(
                            res => {
                                if (res.Result.p_ncode == 0) {
                                    this.listarInterfaz();
                                    this.listarMovimientos();
                                    Swal.fire('Información', 'Se realizó con éxito la modificación del movimiento.', 'success');
                                    this.modalService.dismissAll();
                                } else {
                                    this.listarInterfaz();
                                    this.listarMovimientos();
                                    Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                                }
                            },
                            err => {
                                Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                            }
                        )
                    } else {
                        Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                }
            )
        }
    }
    eliminarMovimientos = (item) =>  {
        Swal.fire(
            {
                title: '¿Está seguro de eliminar el movimiento?',
                text: 'Esta acción es irreversible.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }
        ).then(
            (result) => {
                if (result.value) {
                    this.gridMovimientos = item;
                    this.InterfazService.eliminarMovimientos(this.gridMovimientos).subscribe(
                        res => {
                            if (res.Result.p_ncode == 0) {
                                this.listarInterfaz();
                                this.listarMovimientos();
                                Swal.fire('Información', 'Se realizó con éxito la eliminación del movimiento.', 'success');
                            } else {
                                this.listarInterfaz();
                                this.listarMovimientos();
                                Swal.fire('Advertencia', res.Result.p_smessage, 'warning');
                            }
                        },
                        err => {
                            Swal.fire('Información', 'Ha ocurrido un error.', 'error');
                        }
                    )
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.modalService.dismissAll();
                }
            }
        )
    }
}