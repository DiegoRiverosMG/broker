/*************************************************************************************************/
/*  NOMBRE              :   INMOBILIARY-CLOSING-DATE-CONFIG.COMPONENT.TS                         */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - MARCOS ROLANDO MATEO QUIROZ                           */
/*  FECHA               :   04-04-2024                                                           */
/*  VERSIÓN             :   1.0 - INTERFAZ INMOBILIARIA                                          */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { InmobiliaryClosingDateConfigService } from '../../../../backoffice/services/inmobiliary-closing-date-config/inmobiliary-closing-date-config.service';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from "rxjs";
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../../global-validators';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import Swal from 'sweetalert2';

export interface FiltroRamos {
    FLAG?: number;
}
export interface FiltroInterfaz {
    mvt_nnumori?: number;
}
export interface FiltroConfig {
    NNUMORI?: number;
    NMES?:    number;
    NANIO?:   number;
    NESTADO?: number;
    NCODGRU?: number;
    NBRANCH?: number;
}
export interface CodigoConfig {
    NIDCCIERRE?: number;
}
export interface GrillaConfig {
    NIDCCIERRE?: number;
    NNUMORI?: number;
    NCODGRU?: number;
    NMES?:    number;
    NBRANCH?: number;
    NESTADO?: number;
    NANIO?:   number;
    DFECINI?:    Date;
    DFECFIN?:    Date;
    DFECCIERRE?: Date;
    SCUSUMOD?:   string;
}

@Component({
  selector: 'app-inmobiliary-closing-date-config',
  templateUrl: './inmobiliary-closing-date-config.component.html',
  styleUrls: ['./inmobiliary-closing-date-config.component.scss']
})
export class InmobiliaryClosingDateConfigComponent implements OnInit {

    public bsConfig: Partial<BsDatepickerConfig>;
    registerForm: FormGroup;
    editForm: FormGroup;
    submitted: boolean = false;
    booleanRamo: boolean = false;
    mesActual = Number(moment().format('MM').toString());
    anioActual = Number(moment().format('YYYY').toString());

    origen: [];
    estados: [];
    meses: [];
    ramos: [];
    allRamos: [];
    interfaces: [];
    configuraciones: [];

    listVisualizarResults: [];
    filtroRamos: FiltroRamos;
    filtroInterfaz: FiltroInterfaz;
    filtroConfig: FiltroConfig;
    codigoConfig: CodigoConfig;
    grillaConfig: GrillaConfig;

    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 5;
    totalItems = 0;
    maxSize = 10;
    
    valueInicioCreate: Date = new Date();
    valueFinCreate: Date = new Date();
    valueInicioEdit: Date = new Date();
    valueFinEdit: Date = new Date();
    
    valueInicioCreateRange: Date = new Date();
    valueFinCreateRange: Date = new Date();
    valueInicioEditRange: Date = new Date();
    valueFinEditRange: Date = new Date();

    constructor(
        private modalService: NgbModal,
        private ClosingDateConfigService: InmobiliaryClosingDateConfigService,
        private formBuilder: FormBuilder,
        private datePipe: DatePipe
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

    private createFormRegister(): void {
        this.registerForm = this.formBuilder.group({
            NIDCCIERRE: [''],
            NNUMORI: ['', Validators.required],
            NCODGRU: ['', Validators.required],
            NMES:    [this.mesActual, [Validators.required, Validators.min(this.mesActual)]],
            NBRANCH: ['', Validators.required],
            NESTADO: [1, Validators.required],
            NANIO:   [this.anioActual, [Validators.required, Validators.min(this.anioActual), Validators.max(this.anioActual + 10)]],
            DFECINI:    ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            DFECFIN:    ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            DFECCIERRE: [''],
            SCUSUMOD:   ['']
        });
    }

    private createFormEdit(): void {
        this.editForm = this.formBuilder.group({
            NIDCCIERRE: [this.grillaConfig.NIDCCIERRE],
            NNUMORI: [this.grillaConfig.NNUMORI, Validators.required],
            NCODGRU: [this.grillaConfig.NCODGRU, Validators.required],
            NMES:    [this.grillaConfig.NMES, [Validators.required, Validators.min(this.mesActual)]],
            NBRANCH: [this.grillaConfig.NBRANCH, Validators.required],
            NESTADO: [this.grillaConfig.NESTADO, Validators.required],
            NANIO:   [this.grillaConfig.NANIO, [Validators.required, Validators.min(this.anioActual), Validators.max(this.anioActual + 10)]],
            DFECINI:    [this.datePipe.transform(this.grillaConfig.DFECINI, "yyyy-MM-dd"), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            DFECFIN:    [this.datePipe.transform(this.grillaConfig.DFECFIN, "yyyy-MM-dd"), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            DFECCIERRE: [this.datePipe.transform(this.grillaConfig.DFECCIERRE, "yyyy-MM-dd")],
            SCUSUMOD:   [this.grillaConfig.SCUSUMOD]
        });
    }

    get controlRegister(): { [key: string]: AbstractControl } {
        return this.registerForm.controls;
    }

    get controlEdit(): { [key: string]: AbstractControl } {
        return this.editForm.controls;
    }

    inicializarFiltros = () => {
        this.filtroRamos = {};
        this.filtroRamos.FLAG = 0;
        this.filtroInterfaz = {};
        this.filtroInterfaz.mvt_nnumori = 1;
        this.listarInterfaces(this.filtroInterfaz);
        this.filtroConfig = {};
        this.filtroConfig.NNUMORI = 1;
        this.filtroConfig.NMES = this.mesActual;
        this.filtroConfig.NANIO = this.anioActual;
        this.filtroConfig.NESTADO = 1;
        this.filtroConfig.NBRANCH = 0;
        this.filtroConfig.NCODGRU = 0;
        this.codigoConfig = {};
    }

    getYear = (e) => {
        let yearFormat = e;
        this.valueInicioCreateRange = new Date(yearFormat, this.valueInicioCreateRange.getMonth(), 1);
        this.valueFinCreateRange = new Date(yearFormat, this.valueFinCreateRange.getMonth() + 1, 0);
        this.valueInicioCreate = new Date(yearFormat, this.valueInicioCreate.getMonth(), 1);
        this.valueFinCreate = new Date(yearFormat, this.valueFinCreate.getMonth() + 1, 0);
        this.registerForm.controls.DFECINI.setValue(moment(this.valueInicioCreate).format('YYYY-MM-DD'));
        this.registerForm.controls.DFECFIN.setValue(moment(this.valueFinCreate).format('YYYY-MM-DD'));
        if (yearFormat > this.anioActual) {
            this.registerForm.get('NMES').clearValidators();
            this.registerForm.get('NMES').setValidators(Validators.required);
            this.registerForm.get('NMES').updateValueAndValidity();
        } else {
            this.registerForm.get('NMES').clearValidators();
            this.registerForm.get('NMES').setValidators([Validators.required, Validators.min(this.mesActual)]);
            this.registerForm.get('NMES').updateValueAndValidity();
        }
    }

    getYearEdit = (e) => {
        let yearFormat = e;
        this.valueInicioEditRange = new Date(yearFormat, this.valueInicioEditRange.getMonth(), 1);
        this.valueFinEditRange = new Date(yearFormat, this.valueFinEditRange.getMonth() + 1, 0);
        this.valueInicioEdit = new Date(yearFormat, this.valueInicioEdit.getMonth(), 1);
        this.valueFinEdit = new Date(yearFormat, this.valueFinEdit.getMonth() + 1, 0);
        this.editForm.controls.DFECINI.setValue(moment(this.valueInicioEdit).format('YYYY-MM-DD'));
        this.editForm.controls.DFECFIN.setValue(moment(this.valueFinEdit).format('YYYY-MM-DD'));
        if (yearFormat > this.anioActual) {
            this.editForm.get('NMES').clearValidators();
            this.editForm.get('NMES').setValidators(Validators.required);
            this.editForm.get('NMES').updateValueAndValidity();
        } else {
            this.editForm.get('NMES').clearValidators();
            this.editForm.get('NMES').setValidators([Validators.required, Validators.min(this.mesActual)]);
            this.editForm.get('NMES').updateValueAndValidity();
        }
    }

    getMonth = (e) => {
        let monthFormat = e - 1;
        this.valueInicioCreateRange = new Date(this.valueInicioCreateRange.getFullYear(), monthFormat, 1);
        this.valueFinCreateRange = new Date(this.valueFinCreateRange.getFullYear(), monthFormat + 1, 0);
        this.valueInicioCreate = new Date(this.valueInicioCreate.getFullYear(), monthFormat, 1);
        this.valueFinCreate = new Date(this.valueFinCreate.getFullYear(), monthFormat + 1, 0);
        this.registerForm.controls.DFECINI.setValue(moment(this.valueInicioCreate).format('YYYY-MM-DD'));
        this.registerForm.controls.DFECFIN.setValue(moment(this.valueFinCreate).format('YYYY-MM-DD'));
    }

    getMonthEdit = (e) => {
        let monthFormat = e - 1;
        this.valueInicioEditRange = new Date(this.valueInicioEditRange.getFullYear(), monthFormat, 1);
        this.valueFinEditRange = new Date(this.valueFinEditRange.getFullYear(), monthFormat + 1, 0);
        this.valueInicioEdit = new Date(this.valueInicioEdit.getFullYear(), monthFormat, 1);
        this.valueFinEdit = new Date(this.valueFinEdit.getFullYear(), monthFormat + 1, 0);
        this.editForm.controls.DFECINI.setValue(moment(this.valueInicioEdit).format('YYYY-MM-DD'));
        this.editForm.controls.DFECFIN.setValue(moment(this.valueFinEdit).format('YYYY-MM-DD'));
    }

    getParams = () => {
        let $estados = this.ClosingDateConfigService.listarEstados();
        let $origen  = this.ClosingDateConfigService.listarOrigen();
        let $meses   = this.ClosingDateConfigService.listarMeses();
        let $ramos   = this.ClosingDateConfigService.listarRamos(this.filtroRamos);
        return forkJoin([$estados, $origen, $meses, $ramos]).subscribe(
            res => {
                this.estados = res[0].Result.combos;
                this.origen  = res[1].Result.combos;
                this.meses   = res[2].Result.combos;
                this.ramos   = res[3].Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error'); }
        )
    }

    getAllRamos() {
        this.filtroRamos = {};
        this.filtroRamos.FLAG = 1;
        this.ClosingDateConfigService.listarRamos(this.filtroRamos).subscribe(
            res => {
                this.allRamos = res.Result.combos;
            }
        )
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.listVisualizarResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    mostrarModalAgregar(content: any) {
        this.submitted = false;
        this.createFormRegister();
        this.registerForm.controls.NNUMORI.disable();
        this.registerForm.controls.NESTADO.disable();
        switch (Number(this.filtroConfig.NNUMORI)) {
            case 1:
                this.registerForm.controls.NBRANCH.enable();
            break;
            default:
                this.registerForm.controls.NBRANCH.disable();
            break;
        }
        this.valueInicioCreateRange = new Date;
        this.valueFinCreateRange = new Date;
        this.valueInicioCreate = new Date;
        this.valueFinCreate = new Date;
        this.valueInicioCreateRange = new Date(this.valueInicioCreateRange.getFullYear(), this.valueInicioCreateRange.getMonth(), 1);
        this.valueFinCreateRange = new Date(this.valueFinCreateRange.getFullYear(), this.valueFinCreateRange.getMonth() + 1, 0);
        this.valueInicioCreate = new Date(this.valueInicioCreate.getFullYear(), this.valueInicioCreate.getMonth(), 1);
        this.valueFinCreate = new Date(this.valueFinCreate.getFullYear(), this.valueFinCreate.getMonth() + 1, 0);
        this.registerForm.controls.DFECINI.setValue(moment(this.valueInicioCreate).format('YYYY-MM-DD'));
        this.registerForm.controls.DFECFIN.setValue(moment(this.valueFinCreate).format('YYYY-MM-DD'));
        this.getAllRamos();
        this.registerForm.controls.NNUMORI.setValue(this.filtroConfig.NNUMORI);
        this.filtroInterfaz.mvt_nnumori = this.filtroConfig.NNUMORI;
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.listarInterfaces(this.filtroInterfaz);
        this.registerForm.setValidators([GlobalValidators.dateSortN]);
    }

    mostrarModalModificar(content: any, item) {
        this.submitted = false;
        this.grillaConfig = item;
        this.createFormEdit();
        this.editForm.controls.NNUMORI.disable();
        this.editForm.controls.NESTADO.disable();
        switch (Number(this.grillaConfig.NNUMORI)) {
            case 1:
                this.editForm.controls.NBRANCH.enable();
            break;
            default:
                this.editForm.controls.NBRANCH.disable();
            break;
        }
        let monthFormat = item.NMES - 1;
        let yearFormat = item.NANIO;
        if (yearFormat > this.anioActual) {
            this.editForm.get('NMES').clearValidators();
            this.editForm.get('NMES').setValidators(Validators.required);
            this.editForm.get('NMES').updateValueAndValidity();
        } else {
            this.editForm.get('NMES').clearValidators();
            this.editForm.get('NMES').setValidators([Validators.required, Validators.min(this.mesActual)]);
            this.editForm.get('NMES').updateValueAndValidity();
        }
        this.valueInicioEditRange = new Date(this.valueInicioEditRange.getFullYear(), monthFormat, 1);
        this.valueFinEditRange = new Date(this.valueFinEditRange.getFullYear(), monthFormat + 1, 0);
        this.getAllRamos();
        this.filtroInterfaz.mvt_nnumori = this.grillaConfig.NNUMORI;
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.listarInterfaces(this.filtroInterfaz);
        this.editForm.setValidators([GlobalValidators.dateSortN]);
    }

    seleccionarOrigen = (e) => {
        this.filtroInterfaz.mvt_nnumori = e;
        this.listarInterfaces(this.filtroInterfaz);
        this.filtroConfig.NCODGRU = 0;
        this.filtroConfig.NBRANCH = 0;
        switch (Number(e)) {
            case 1:
                this.booleanRamo = false;
            break;
            default:
                this.booleanRamo = true;
            break;
        }
    }

    listarInterfaces = (filtro) => {
        this.ClosingDateConfigService.listarInterfaces(filtro).subscribe(
            res => {
                this.interfaces = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error'); }
        )
    }
    
    listarConfiguraciones(): void {
        this.submitted = true;
        this.ClosingDateConfigService.listarConfiguraciones(this.filtroConfig).subscribe(
            res => {
                this.currentPage = 1;
                this.configuraciones = res.Result.lista;
                this.listVisualizarResults = res.Result.lista;
                this.totalItems = this.listVisualizarResults.length;
                this.listToShow = this.listVisualizarResults.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
                if (this.configuraciones.length == 0) {
                    Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los periodos.', 'error'); }
        )
    }
    
    listarConfiguracionesWithoutAlert(): void {
        this.submitted = true;
        this.ClosingDateConfigService.listarConfiguraciones(this.filtroConfig).subscribe(
            res => {
                this.currentPage = 1;
                this.configuraciones = res.Result.lista;
                this.listVisualizarResults = res.Result.lista;
                this.totalItems = this.listVisualizarResults.length;
                this.listToShow = this.listVisualizarResults.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los periodos.', 'error'); }
        )
    }

    agregarConfiguracion() {
        this.submitted = true;
        if (this.registerForm.valid) {
            this.registerForm.controls.SCUSUMOD.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
            this.registerForm.controls.DFECCIERRE.setValue(this.registerForm.get('DFECFIN').value);
            this.ClosingDateConfigService.agregarConfiguracion(this.registerForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        this.listarConfiguracionesWithoutAlert();
                        Swal.fire('Información', 'La creación del periodo se realizó con éxito.', 'success');
                        this.modalService.dismissAll();
                    } else {
                        this.listarConfiguracionesWithoutAlert();
                        Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                    }
                }
            )
        }
    }

    modificarConfiguracion() {
        this.submitted = true;
        if (this.editForm.valid) {
            this.editForm.controls.SCUSUMOD.setValue(JSON.parse(localStorage.getItem('currentUser')).username);
            this.editForm.controls.DFECCIERRE.setValue(this.editForm.get("DFECFIN").value);
            this.ClosingDateConfigService.modificarConfiguracion(this.editForm.getRawValue()).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        this.listarConfiguracionesWithoutAlert();
                        Swal.fire('Información', 'La modificación del periodo se realizó con éxito.', 'success');
                        this.modalService.dismissAll();
                    } else {
                        this.listarConfiguracionesWithoutAlert();
                        Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                    }
                }
            )
        }
    }

    eliminarConfiguracion = (id) => {
        Swal.fire(
            {
                title: '¿Está seguro de eliminar el periodo?',
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
                    this.codigoConfig.NIDCCIERRE = id;
                    this.ClosingDateConfigService.eliminarConfiguracion(this.codigoConfig).subscribe(
                        res => {
                            if (res.Result.P_NCODE == 0) {
                                this.listarConfiguracionesWithoutAlert();
                                Swal.fire('Información', 'La eliminación del periodo se realizó con éxito.', 'success');
                                this.modalService.dismissAll();
                            } else {
                                this.listarConfiguracionesWithoutAlert();
                                Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                            }
                        }
                    )
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.modalService.dismissAll();
                }
            }
        )
    }

    cerrarConfiguracion = () =>  {
        Swal.fire(
            {
                title: '¿Está seguro de cerrar el periodo?',
                text: 'Ya no será posible actualizar el periodo si se encuentra cerrado.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }
        ).then(
            (result) => {
                if (result.value) {
                    this.grillaConfig.NESTADO = 2;
                    this.ClosingDateConfigService.modificarConfiguracion(this.grillaConfig).subscribe(
                        res => {
                            if (res.Result.P_NCODE == 0) {
                                this.listarConfiguracionesWithoutAlert();
                                Swal.fire('Información', 'El cierre del periodo se realizó con éxito.', 'success');
                                this.modalService.dismissAll();
                            } else {
                                this.listarConfiguracionesWithoutAlert();
                                Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
                            }
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