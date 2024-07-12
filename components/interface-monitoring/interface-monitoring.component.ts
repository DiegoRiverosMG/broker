/*************************************************************************************************/
/*  NOMBRE              :   INTERFACE-MONITORING.COMPONENT.TS                                    */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   23-08-2022                                                           */
/*  VERSIÓN             :   1.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { InterfaceMonitoringService } from '../../../backoffice/services/interface-monitoring/interface-monitoring.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../global-validators';
import { forkJoin } from "rxjs";
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';

// CABECERA
export interface FiltroRamos {
    NNUMORI?: number;
    FLAG?: number;
}
export interface FiltroInterfaz {
    mvt_nnumori?: number;
}
export interface FiltroInterfaceCabeceraRecibo {
    NRECEIPT?: string;
}
export interface FiltroInterfaceCabeceraSiniestros {
    CLAIM_MEMO?: string;
}
export interface FiltroInterfaceCabeceraPoliza {
    P_NNUMORI?: number;
    P_SPOLICY?: string;
}

// DETALLE PRELIMINAR
export interface FiltroInterfaceDetalle {
    NIDPROCESS?: number;
    NSTATUS?: string;
    NRECEIPT?: string;
    NTIPO?: number;
    SCODGRU_DES?: string;
    SBRANCH_DES?: string;
    NCODGRU?: number;
    NBRANCH?: number;
    NSTATUS_PROCESS?: number;
    JOB?: number;
}
export interface FiltroInterfaceDetalleXLSX {
    NNUMORI?: number; //ini mmq 22-03-2024 rentas - fin
    NIDPROCESS?: number;
    NSTATUS?: string;
    NRECEIPT?: string;
    NTIPO?: number;
    NCODGRU?: number;
}
export interface FiltroDetalleError {
    NIDPROCESS?: number;
    NIDPROCDET?: number;
    NRECEIPT?: string;
    NPOLICY?: string;
    PRODUCTO_DES?: string;
    NTYPE_DES?: string;
}

// DETALLE OPERACIONES
export interface FiltroDetalleOperacion {
    NCODGRU?: number;
    NIDPROCDET?: number;
    NMOVCONT?: Number;
    NRECEIPT?: string;
    PRODUCTO_DES?: string;
    NTYPE_DES?: string;
}

// DETALLE ASIENTOS
export interface FiltroInterfaceDetalleAsientosContables {
    NIDPROCESS?: number;
    NSTATUS?: string;
    SCODGRU_DES?: string;
    SBRANCH_DES?: string;
    NCODGRU?: number;
    NBRANCH?: number;
    NSTATUS_PROCESS?: number;
    JOB?: number;
}
export interface FiltroInterfaceDetalleAsientosContablesAsiento {    
    NIDPROCESS?: number; //INI MMQ 23/01/2023 AHO.TOT -- FIN
    NNUMASI?: number;
    NIDCBTMOVBCO?: number;
    AST_CDESCRI?: string;
    MCT_CDESCRI?: string;
}
export interface FiltroInterfaceDetalleAsientosContablesError {
    NIDPROCESS?: number; //INI MMQ 23/01/2023 AHO.TOT -- FIN
    NNUMASI?: number;
    NIDCBTMOVBCO?: number;
    AST_CDESCRI?: string;
    MCT_CDESCRI?: string;
}

// DETALLE EXACTUS
export interface FiltroInterfaceDetalleExactus {
    NIDPROCESS?: number;
    NSTATUS?: string;
    SCODGRU_DES?: string;
    SBRANCH_DES?: string;
    NCODGRU?: number;
    NBRANCH?: number;
    NSTATUS_PROCESS?: number;
    JOB?: number;
}
export interface FiltroInterfaceDetalleExactusAsiento {
    NIDPROCESS?: number; //INI MMQ 23/01/2023 AHO.TOT -- FIN
    NNUMASI?: number;
    NIDCBTMOVBCO?: number;
    AST_CDESCRI?: string;
    MCT_CDESCRI?: string;
}
export interface FiltroInterfaceDetalleExactusError {
    NIDPROCESS?: number; //INI MMQ 23/01/2023 AHO.TOT -- FIN
    NNUMASI?: number;
    NIDCBTMOVBCO?: number;
    AST_CDESCRI?: string;
    MCT_CDESCRI?: string;
}

// DETALLE PLANILLA
export interface FiltroInterfacePlanilla {
    JOB?: number;
    NIDPROCESS?: number;
    SCODGRU_DES?: string;
    SBRANCH_DES?: string;
    NCODGRU?: number;
    NBRANCH?: number;
    NSTATUS_PROCESS?: number;
}

// REPROCESOS
export interface InsertarReproceso {
    P_NIDPROCESS_ORI?: number;
    P_NIDPROCESS?: number;
    P_NNUMORI?: number;
    P_NCODGRU?: number;
    P_NBRANCH?: number;
    P_NSTATUS?: number;
    P_SPROCESS_TYPE?: string;
    P_LIST?: number[];
    P_JOB?: number;
    P_SIDUSUREG?: string;
}

// TIPO BÚSQUEDA
export interface TipoBusquedaSI {
    P_FLG_TIP?: number;
}

@Component({
    selector: 'app-interface-monitoring',
    templateUrl: './interface-monitoring.component.html',
    styleUrls: ['./interface-monitoring.component.css']
})

export class InterfaceMonitoringComponent implements OnInit {

    loading: boolean = true;
    loadingAsiento: boolean = true;
    loadingExactus: boolean = true;

    erroresMarcados: any = {};
    erroresMarcadosSend: any[] = [];
    masterSelected: boolean = false;
    masterSelectedBoolean: boolean = true;
    masterSelectedNumber: number = 1;

    erroresMarcadosAsientosContables: any = {};
    erroresMarcadosAsientosContablesSend: any[] = [];
    masterSelectedAsientosContables: boolean = false;
    masterSelectedAsientosContablesBoolean: boolean = true;
    masterSelectedAsientosContablesNumber: number = 1;

    erroresMarcadosExactus: any = {};
    erroresMarcadosExactusSend: any[] = [];
    masterSelectedExactus: boolean = false;
    masterSelectedExactusBoolean: boolean = true;
    masterSelectedExactusNumber: number = 1;

    processId: number = 0;
    reprocessId: number = 0;
    diaActual = moment(new Date()).toDate();
    origenNumber: number = 0;
    //origenText: string = '';
    bsConfig: Partial<BsDatepickerConfig>;
    submitted: boolean = false;
    filterForm: FormGroup;
    tipoBusqueda: string = "PÓLIZA";
    reciboGlobal: string;
    tipo: number = 0;
    booleanRecibo: boolean = false;
    booleanMemo: boolean = false;
    booleanPoliza: boolean = false;
    Flg_IsCobra: boolean = false;
    Flg_IsVISA: boolean = false;
    booleanInterfazRecibo: boolean = true;
    booleanInterfazMemo: boolean = false;
    booleanInterfazPoliza: boolean = false;
    booleanInterfazReciboPrel: boolean = false;
    booleanInterfazMemoPrel: boolean = false;
    booleanInterfazSinAsi: boolean = false;
    booleanInterfazSinExa: boolean = false;

    // CABECERA
    filtroRamos: FiltroRamos;
    filtroInterfaz: FiltroInterfaz;
    filtroInterfaceCabeceraRecibo: FiltroInterfaceCabeceraRecibo;
    filtroInterfaceCabeceraSiniestros: FiltroInterfaceCabeceraSiniestros;
    FiltroInterfaceCabeceraPoliza: FiltroInterfaceCabeceraPoliza;

    // DETALLE PRELIMINAR
    filtroInterfaceDetalle: FiltroInterfaceDetalle;
    filtroInterfaceDetalleXLSX: FiltroInterfaceDetalleXLSX;
    filtroDetalleError: FiltroDetalleError;

    // DETALLE ASIENTOS
    filtroInterfaceDetalleAsientosContables: FiltroInterfaceDetalleAsientosContables;
    filtroInterfaceDetalleAsientosContablesAsiento: FiltroInterfaceDetalleAsientosContablesAsiento;
    filtroInterfaceDetalleAsientosContablesError: FiltroInterfaceDetalleAsientosContablesError;

    // DETALLE EXACTUS
    filtroInterfaceDetalleExactus: FiltroInterfaceDetalleExactus;
    filtroInterfaceDetalleExactusAsiento: FiltroInterfaceDetalleExactusAsiento;
    filtroInterfaceDetalleExactusError: FiltroInterfaceDetalleExactusError;

    // DETALLE PLANILLA
    filtroInterfacePlanilla: FiltroInterfacePlanilla;

    // REPROCESOS
    insertarReproceso: InsertarReproceso;

    // TIPO BÚSQUEDA
    tipoBusquedaSI: TipoBusquedaSI;

    // DETALLE OPERACION 
    filtroDetalleOperacion: FiltroDetalleOperacion;

    // PARÁMETROS
    origen: any = [];
    ramos: any = [];
    estados: any = [];
    tipoBusquedas: any = [];
    tipoBusquedasSI: any = [];

    // CABECERA
    interfaces: any = [];
    cabeceraInterfaces: any = [];

    // DETALLE PRELIMINAR
    detalleInterfaces: any = [];
    detalleInterfacesXLSX: any = [];
    detalleErrores: any = [];
    detalleRecibos: any [];
    detalleOperAbono: any [];
    
    // DETALLE ASIENTOS
    detalleInterfacesAsientosContables: any = [];
    detalleInterfacesAsientosContablesAsiento: any = [];
    detalleInterfacesAsientosContablesErrores: any = [];

    // DETALLE EXACTUS
    detalleInterfacesExactus: any = [];
    detalleInterfacesExactusAsiento: any = [];
    detalleInterfacesExactusErrores: any = [];

    // DETALLE PLANILLA
    detalleInterfacesPlanilla: any = [];

    // CABECERA
    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 15;
    totalItems = 0;
    maxSize = 10;

    // DETALLE PRELIMINAR
    listToShowDetail: any = [];
    currentPageDetail = 1;
    itemsPerPageDetail = 15;
    totalItemsDetail = 0;
    maxSizeDetail = 10;

    listToShowDetailError: any = [];
    currentPageDetailError = 1;
    itemsPerPageDetailError = 15;
    totalItemsDetailError = 0;
    maxSizeDetailError = 10;

    // DETALLE ASIENTOS
    listToShowDetailAsientosContables: any = [];
    currentPageDetailAsientosContables = 1;
    itemsPerPageDetailAsientosContables = 15;
    totalItemsDetailAsientosContables = 0;
    maxSizeDetailAsientosContables = 10;

    listToShowDetailAsientosContablesError: any = [];
    currentPageDetailAsientosContablesError = 1;
    itemsPerPageDetailAsientosContablesError = 15;
    totalItemsDetailAsientosContablesError = 0;
    maxSizeDetailAsientosContablesError = 10;

    listToShowDetailAsientosContablesAsiento: any = [];
    currentPageDetailAsientosContablesAsiento = 1;
    itemsPerPageDetailAsientosContablesAsiento = 15;
    totalItemsDetailAsientosContablesAsiento = 0;
    maxSizeDetailAsientosContablesAsiento = 10;

    // DETALLE EXACTUS
    listToShowDetailExactus: any = [];
    currentPageDetailExactus = 1;
    itemsPerPageDetailExactus = 15;
    totalItemsDetailExactus = 0;
    maxSizeDetailExactus = 10;

    listToShowDetailExactusError: any = [];
    currentPageDetailExactusError = 1;
    itemsPerPageDetailExactusError = 15;
    totalItemsDetailExactusError = 0;
    maxSizeDetailExactusError = 10;

    listToShowDetailExactusAsiento: any = [];
    currentPageDetailExactusAsiento = 1;
    itemsPerPageDetailExactusAsiento = 15;
    totalItemsDetailExactusAsiento = 0;
    maxSizeDetailExactusAsiento = 10;

    // DETALLE PLANILLA
    listToShowDetailPlanilla: any = [];
    currentPageDetailPlanilla = 1;
    itemsPerPageDetailPlanilla = 15;
    totalItemsDetailPlanilla = 0;
    maxSizeDetailPlanilla = 10;

    // DETALLE OPERACIONES
    detalleOperacion: any = [];
    detalleOperacionXLSX: any = [];
    listToShowDetailOperacion: any = [];
    currentPageDetailOperacion = 1;
    itemsPerPageDetailOperacion = 15;
    totalItemsDetailOperacion = 0;
    maxSizeDetailOperacion = 10;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private interfaceMonitoringService: InterfaceMonitoringService,
        private activatedRoute: ActivatedRoute
    ) {
        this.activatedRoute.params.subscribe(
            params => {
                let id: any = params['id'] || null;
                this.processId = id;
            }
        );
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
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.createForm();
        this.inicializarFiltros();
        this.getParams();
        this.listarCabeceraInterfacesProceso();
        this.getCheckedItemList();
        this.getCheckedItemListExactus();
        this.getCheckedItemListAsientosContables();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            NNUMORI: [1],
            NCODGRU: [0],
            NBRANCH: [0],
            NSTATUS_SEND: [null],
            DPROCESS_INI: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            DPROCESS_FIN: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            NIDPROCESS: ['', [Validators.pattern(/^[0-9]*$/)]],
            NRECEIPT: [''],
            CLAIM_MEMO: [''],
            NPOLICY: ['']
        });
    }

    inicializarFiltros = () => {
        this.filtroRamos = {};
        this.filtroRamos.NNUMORI = 1;
        this.filtroRamos.FLAG = 0;

        this.tipoBusquedaSI = {};
        this.insertarReproceso = {};
        this.filtroInterfaz = {};
        this.filtroInterfaceCabeceraRecibo = {};
        this.filtroInterfaceCabeceraSiniestros = {};
        this.FiltroInterfaceCabeceraPoliza = {};

        this.filtroInterfaceDetalle = {};
        this.filtroInterfaceDetalleXLSX = {};
        this.filtroDetalleError = {};

        this.filtroInterfaceDetalleAsientosContables = {};
        this.filtroInterfaceDetalleAsientosContablesAsiento = {};
        this.filtroInterfaceDetalleAsientosContablesError = {};

        this.filtroInterfaceDetalleExactus = {};
        this.filtroInterfaceDetalleExactusAsiento = {};
        this.filtroInterfaceDetalleExactusError = {};

        this.filtroInterfacePlanilla = {};
        this.filtroDetalleOperacion = {};

        this.filtroInterfaz.mvt_nnumori = 1;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
        this.filterForm.setValidators([GlobalValidators.dateSortM]);
    }
    
    soloNumeros = (e) => {
        return e.charCode >= 48 && e.charCode <= 57;
    }

    // ERRORES MARCADOS PRELIMINAR
    checkUncheckAll() {
        for (var i = 0; i < this.detalleInterfaces.length; i++) {
            if (this.detalleInterfaces[i].NSTATUS == 3)
                this.detalleInterfaces[i].IS_SELECTED = this.masterSelected;
        }
        this.getCheckedItemList();
    }
    isAllSelected() {
        this.masterSelected = this.detalleInterfaces.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedItemList();
    }
    getCheckedItemList() {
        this.erroresMarcados = [];
        this.erroresMarcadosSend = [];
        for (var i = 0; i < this.detalleInterfaces.length; i++) {
            if (this.detalleInterfaces[i].IS_SELECTED)
                this.erroresMarcados.push(this.detalleInterfaces[i].NIDPROCDET);
        }
        this.erroresMarcadosSend.push(this.erroresMarcados);
    }

    // ERRORES MARCADOS ASIENTOS
    checkUncheckAllAsientosContables() {
        for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
            if (this.detalleInterfacesAsientosContables[i].NSTATUS == 3)
                this.detalleInterfacesAsientosContables[i].IS_SELECTED = this.masterSelectedAsientosContables;
        }
        this.getCheckedItemListAsientosContables();
    }
    isAllSelectedAsientosContables() {
        this.masterSelectedAsientosContables = this.detalleInterfacesAsientosContables.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedItemListAsientosContables();
    }
    getCheckedItemListAsientosContables() {
        this.erroresMarcadosAsientosContables = [];
        this.erroresMarcadosAsientosContablesSend = [];
        for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
            if (this.detalleInterfacesAsientosContables[i].IS_SELECTED)
                this.erroresMarcadosAsientosContables.push(this.detalleInterfacesAsientosContables[i].NNUMASI);
        }
        this.erroresMarcadosAsientosContablesSend.push(this.erroresMarcadosAsientosContables);
    }

    // ERRORES MARCADOS EXACTUS
    checkUncheckAllExactus() {
        for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
            if (this.detalleInterfacesExactus[i].NSTATUS_SEND == 3)
                this.detalleInterfacesExactus[i].IS_SELECTED = this.masterSelectedExactus;
        }
        this.getCheckedItemListExactus();
    }
    isAllSelectedExactus() {        
        this.masterSelectedExactus = this.detalleInterfacesExactus.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedItemListExactus();
    }
    getCheckedItemListExactus() {
        this.erroresMarcadosExactus = [];
        this.erroresMarcadosExactusSend = [];
        for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
            if (this.detalleInterfacesExactus[i].IS_SELECTED)
                this.erroresMarcadosExactus.push(this.detalleInterfacesExactus[i].NNUMASI);
        }
        this.erroresMarcadosExactusSend.push(this.erroresMarcadosExactus);
    }
// ORDERNES DE PAGO
    isAllSelectedExactusOP() {
        this.masterSelectedExactus = this.detalleInterfacesExactus.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedItemListExactusOP();
    }

    getCheckedItemListExactusOP() {
        this.erroresMarcadosExactus = [];
        this.erroresMarcadosExactusSend = [];
        for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
            if (this.detalleInterfacesExactus[i].IS_SELECTED)
                this.erroresMarcadosExactus.push(this.detalleInterfacesExactus[i].NIDCBTMOVBCO);
        }
        this.erroresMarcadosExactusSend.push(this.erroresMarcadosExactus);
    }
// ORDERNES DE PAGO

    // PAGINADO CABECERA 
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.cabeceraInterfaces.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    // PAGINADO DETALLE PRELIMINAR
    pageChangedDetail(currentPageDetail) {
        this.currentPageDetail = currentPageDetail;
        this.listToShowDetail = this.detalleInterfaces.slice(
            (this.currentPageDetail - 1) * this.itemsPerPageDetail,
            this.currentPageDetail * this.itemsPerPageDetail
        );
    }
    pageChangedDetailError(currentPageDetailError) {
        this.currentPageDetailError = currentPageDetailError;
        this.listToShowDetailError = this.detalleErrores.slice(
            (this.currentPageDetailError - 1) * this.itemsPerPageDetailError,
            this.currentPageDetailError * this.itemsPerPageDetailError
        );
    }

    //PAGINADO DETALLE ASIENTOS
    pageChangedDetailAsientosContables(currentPageDetailAsientosContables) {
        this.currentPageDetailAsientosContables = currentPageDetailAsientosContables;
        this.listToShowDetailAsientosContables = this.detalleInterfacesAsientosContables.slice(
            (this.currentPageDetailAsientosContables - 1) * this.itemsPerPageDetailAsientosContables,
            this.currentPageDetailAsientosContables * this.itemsPerPageDetailAsientosContables
        );
    }
    pageChangedDetailAsientosContablesError(currentPageDetailAsientosContablesError) {
        this.currentPageDetailAsientosContablesError = currentPageDetailAsientosContablesError;
        this.listToShowDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.slice(
            (this.currentPageDetailAsientosContablesError - 1) * this.itemsPerPageDetailAsientosContablesError,
            this.currentPageDetailAsientosContablesError * this.itemsPerPageDetailAsientosContablesError
        );
    }
    pageChangedDetailAsientosContablesAsiento(currentPageDetailAsientosContablesAsiento) {
        this.currentPageDetailAsientosContablesAsiento = currentPageDetailAsientosContablesAsiento;
        this.listToShowDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.slice(
            (this.currentPageDetailAsientosContablesAsiento - 1) * this.itemsPerPageDetailAsientosContablesAsiento,
            this.currentPageDetailAsientosContablesAsiento * this.itemsPerPageDetailAsientosContablesAsiento
        );
    }

    // PAGINADO DETALLE EXACTUS
    pageChangedDetailExactus(currentPageDetailExactus) {
        this.currentPageDetailExactus = currentPageDetailExactus;
        this.listToShowDetailExactus = this.detalleInterfacesExactus.slice(
            (this.currentPageDetailExactus - 1) * this.itemsPerPageDetailExactus,
            this.currentPageDetailExactus * this.itemsPerPageDetailExactus
        );
    }
    pageChangedDetailExactusError(currentPageDetailExactusError) {
        this.currentPageDetailExactusError = currentPageDetailExactusError;
        this.listToShowDetailExactusError = this.detalleInterfacesExactusErrores.slice(
            (this.currentPageDetailExactusError - 1) * this.itemsPerPageDetailExactusError,
            this.currentPageDetailExactusError * this.itemsPerPageDetailExactusError
        );
    }
    pageChangedDetailExactusAsiento(currentPageDetailExactusAsiento) {
        this.currentPageDetailExactusAsiento = currentPageDetailExactusAsiento;
        this.listToShowDetailExactusAsiento = this.detalleInterfacesExactusAsiento.slice(
            (this.currentPageDetailExactusAsiento - 1) * this.itemsPerPageDetailExactusAsiento,
            this.currentPageDetailExactusAsiento * this.itemsPerPageDetailExactusAsiento
        );
    }

    // PAGINADO PLANILLA
    pageChangedDetailPlanilla(currentPageDetailPlanilla) {
        this.currentPageDetailPlanilla = currentPageDetailPlanilla;
        this.listToShowDetailPlanilla = this.detalleInterfacesPlanilla.slice(
            (this.currentPageDetailPlanilla - 1) * this.itemsPerPageDetailPlanilla,
            this.currentPageDetailPlanilla * this.itemsPerPageDetailPlanilla
        );
    }

    // PARÁMETROS
    getParams = () => {
        let $origen = this.interfaceMonitoringService.listarOrigen();
        //let $ramos = this.interfaceMonitoringService.listarRamos(this.filtroRamos);
        let $estados = this.interfaceMonitoringService.listarEstados();
        let $tipoBusquedas = this.interfaceMonitoringService.listarTipoBusqueda();
        return forkJoin([$origen, $estados, $tipoBusquedas]).subscribe(
        //return forkJoin([$origen, $ramos, $estados, $tipoBusquedas]).subscribe(
            res => {
                this.origen = res[0].Result.combos;
                //this.ramos = res[1].Result.combos;
                this.estados = res[1].Result.combos;
                this.tipoBusquedas = res[2].Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error'); }
        )
    }
    seleccionarOrigen = (e) => {
        this.filtroInterfaz.mvt_nnumori = e;
        this.filtroRamos.NNUMORI = e;
        this.listarInterfaces(this.filtroInterfaz);
        this.listarRamos(this.filtroRamos);
        this.filterForm.controls.NCODGRU.setValue(0);
        this.filterForm.controls.NBRANCH.setValue(0);
        this.filterForm.controls.CLAIM_MEMO.setValue('');
        switch (Number(e)) {
            case 1:
                //this.filterForm.controls.NBRANCH.enable();
                this.filterForm.controls.NPOLICY.setValue('');
                this.booleanInterfazRecibo = true;
                this.booleanInterfazMemo = false;
                this.booleanInterfazPoliza = false;
            break;
            default:
                //this.filterForm.controls.NBRANCH.disable();
                this.filterForm.controls.NRECEIPT.setValue('');
                this.booleanInterfazRecibo = false;
                this.booleanInterfazMemo = false;
                this.booleanInterfazPoliza = true;
            break;
        }
    }
    listarInterfaces = (item) => {
        this.interfaceMonitoringService.listarInterfaces(item).subscribe(
            res => {
                this.interfaces = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error'); }
        )
    }
    listarRamos = (filtro) => {
        this.interfaceMonitoringService.listarRamos(filtro).subscribe(
            res => {
                this.ramos = res.Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos.', 'error'); }
        )
    }
    
    buscarDetallePreliminarPorRecibo = (item) => {
        this.filtroInterfaceDetalle.NRECEIPT = item;
        if (this.filtroInterfaceDetalle.NCODGRU == 15 || this.filtroInterfaceDetalle.NCODGRU == 16) {
            if (this.filtroInterfaceDetalle.NTIPO == 1) {
                if (Number(this.filtroInterfaceDetalle.NRECEIPT) >= 0 || this.filtroInterfaceDetalle.NRECEIPT == null) {
                    this.listarDetalleInterfaces(this.filtroInterfaceDetalle)
                } else {
                    this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
                    Swal.fire('Información', 'Ingrese un número de ' + this.tipoBusqueda + ' válido.', 'info');
                }
            } else {
                this.listarDetalleInterfaces(this.filtroInterfaceDetalle)
            }
        } else {
            if (Number(this.filtroInterfaceDetalle.NRECEIPT) >= 0 || this.filtroInterfaceDetalle.NRECEIPT == null) {
                this.listarDetalleInterfaces(this.filtroInterfaceDetalle)
            } else {
                this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
                Swal.fire('Información', 'Ingrese un número de ' + this.tipoBusqueda + ' válido.', 'info');
            }
        }
    }

    // FILTRAR DETALLES POR ESTADO
    seleccionarEstadoDetalle = (e) => {
        this.loading = false;
        this.filtroInterfaceDetalle.NSTATUS = e;
        this.filtroInterfaceDetalle.NRECEIPT = null;
        this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
        this.listarDetalleInterfaces(this.filtroInterfaceDetalle);
    }
    seleccionarEstadoDetalleAsientosContables = (e) => {
        this.loadingAsiento = false;
        this.filtroInterfaceDetalleAsientosContables.NSTATUS = e;
        this.listarDetalleInterfacesAsientosContables(this.filtroInterfaceDetalleAsientosContables);
    }
    seleccionarEstadoDetalleAsientosContablesOrdenesPago = (e) => {
        this.loadingAsiento = false;
        this.filtroInterfaceDetalleAsientosContables.NSTATUS = e;
        this.listarDetalleInterfacesAsientosContablesOrdenesPago(this.filtroInterfaceDetalleAsientosContables);
    }
    seleccionarEstadoDetalleExactus = (e) => {
        this.loadingExactus = false;
        this.filtroInterfaceDetalleExactus.NSTATUS = e;
        this.listarDetalleInterfacesExactus(this.filtroInterfaceDetalleExactus);
    }
    seleccionarEstadoDetalleExactusOrdenesPago = (e) => {
        this.loadingAsiento = false;
        this.filtroInterfaceDetalleExactus.NSTATUS = e;
        this.listarDetalleInterfacesExactusOrdenesPago(this.filtroInterfaceDetalleExactus);
    }

    // CABECERA
    listarCabeceraInterfaces(): void {
        this.submitted = true;
        this.reciboGlobal = null;
        if (this.filterForm.valid) {
            this.filterForm.controls.NRECEIPT.setValue('');
            this.filterForm.controls.CLAIM_MEMO.setValue('');
            this.filterForm.controls.NPOLICY.setValue('');
            if (this.processId) {
                this.filterForm.controls.NIDPROCESS.setValue(this.processId);
            }
            this.interfaceMonitoringService.listarCabeceraInterfaces(this.filterForm.getRawValue()).subscribe(
                res => {
                    this.booleanRecibo = false;
                    this.booleanMemo = false;
                    this.currentPage = 1;
                    this.cabeceraInterfaces = res.Result.lista;
                    this.totalItems = this.cabeceraInterfaces.length;
                    this.listToShow = this.cabeceraInterfaces.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    this.origenNumber = Number(this.filterForm.get('NNUMORI').value);
                    //this.origenText = this.origen?.find((x) => Number(x.mvt_nnumori) === Number(this.filterForm.getRawValue().NNUMORI))?.mvt_cdescri;
                    if (this.cabeceraInterfaces.length == 0) {
                        Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener la Cabecera de Interfaz.', 'error'); }
            )
        }
    }
    listarCabeceraInterfacesProceso(): void {
        if (this.processId) {
            this.filterForm.controls.NIDPROCESS.setValue(this.processId);
            this.listarCabeceraInterfaces();
        }
    }
    listarCabeceraInterfacesRecibo(): void {
        this.submitted = true;
        if (this.filterForm.get('NRECEIPT').value > 0) {
            this.filterForm.controls.NIDPROCESS.setValue('');
            this.filtroInterfaceCabeceraRecibo.NRECEIPT = this.filterForm.get('NRECEIPT').value;
            this.reciboGlobal = this.filtroInterfaceCabeceraRecibo.NRECEIPT;
            this.interfaceMonitoringService.listarCabeceraInterfacesRecibo(this.filtroInterfaceCabeceraRecibo).subscribe(
                res => {
                    this.booleanRecibo = true;
                    this.booleanMemo = false;
                    this.currentPage = 1;
                    this.cabeceraInterfaces = res.Result.lista;
                    this.totalItems = this.cabeceraInterfaces.length;
                    this.listToShow = this.cabeceraInterfaces.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    this.origenNumber = Number(this.filterForm.get('NNUMORI').value);
                    //this.origenText = this.origen?.find((x) => Number(x.mvt_nnumori) === Number(this.filterForm.getRawValue().NNUMORI))?.mvt_cdescri;
                    if (this.cabeceraInterfaces.length == 0) {
                        Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener la cabecera de interfaz por recibo.', 'error'); }
            )
        } else {
            this.filterForm.controls.NRECEIPT.setValue(null);
            Swal.fire('Información', 'Ingrese un número de recibo válido.', 'info');
        }
    }
    listarCabeceraInterfacesSiniestro(): void {
        this.submitted = true;
        if (this.filterForm.get('CLAIM_MEMO').value) {
            this.filterForm.controls.NIDPROCESS.setValue('');
            this.filtroInterfaceCabeceraSiniestros.CLAIM_MEMO = this.filterForm.get('CLAIM_MEMO').value;
            this.reciboGlobal = this.filtroInterfaceCabeceraSiniestros.CLAIM_MEMO;
            this.interfaceMonitoringService.listarCabeceraInterfacesSiniestro(this.filtroInterfaceCabeceraSiniestros).subscribe(
                res => {
                    this.booleanRecibo = false;
                    this.booleanMemo = true;
                    this.currentPage = 1;
                    this.cabeceraInterfaces = res.Result.lista;
                    this.totalItems = this.cabeceraInterfaces.length;
                    this.listToShow = this.cabeceraInterfaces.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    this.origenNumber = Number(this.filterForm.get('NNUMORI').value);
                    //this.origenText = this.origen?.find((x) => Number(x.mvt_nnumori) === Number(this.filterForm.getRawValue().NNUMORI))?.mvt_cdescri;
                    if (this.cabeceraInterfaces.length == 0) {
                        Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener la cabecera de interfaz por siniestro/memo.', 'error'); }
            )
        } else {
            this.filterForm.controls.CLAIM_MEMO.setValue(null);
            Swal.fire('Información', 'Ingrese un número de Siniestro / Memo válido.', 'info');
        }
    }
    listarCabeceraInterfacesPoliza(): void {
        this.submitted = true;
        if (this.filterForm.get('NPOLICY').value > 0) {
            this.filterForm.controls.NIDPROCESS.setValue('');
            this.FiltroInterfaceCabeceraPoliza.P_NNUMORI = this.filterForm.get('NNUMORI').value;
            this.FiltroInterfaceCabeceraPoliza.P_SPOLICY = this.filterForm.get('NPOLICY').value;
            this.reciboGlobal = this.FiltroInterfaceCabeceraPoliza.P_SPOLICY;
            this.interfaceMonitoringService.listarCabeceraInterfacesPoliza(this.FiltroInterfaceCabeceraPoliza).subscribe(
                res => {
                    this.booleanRecibo = false;
                    this.booleanMemo = true;
                    this.currentPage = 1;
                    this.cabeceraInterfaces = res.Result.lista;
                    this.totalItems = this.cabeceraInterfaces.length;
                    this.listToShow = this.cabeceraInterfaces.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    this.origenNumber = Number(this.filterForm.get('NNUMORI').value);
                    //this.origenText = this.origen?.find((x) => Number(x.mvt_nnumori) === Number(this.filterForm.getRawValue().NNUMORI))?.mvt_cdescri;
                    if (this.cabeceraInterfaces.length == 0) {
                        Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener la cabecera de interfaz por póliza.', 'error'); }
            )
        } else {
            this.filterForm.controls.NPOLICY.setValue(null);
            Swal.fire('Información', 'Ingrese un número de póliza válido.', 'info');
        }
    }

    // DETALLE PRELIMINAR
    listarDetalleInterfaces(item): void {
        this.loading = false;
        this.interfaceMonitoringService.listarDetalleInterfaces(item).subscribe(
            res => {
                this.currentPageDetail = 1;
                this.detalleInterfaces = res.Result.lista;
                this.totalItemsDetail = this.detalleInterfaces.length;
                this.listToShowDetail = this.detalleInterfaces.slice(
                    (this.currentPageDetail - 1) * this.itemsPerPageDetail,
                    this.currentPageDetail * this.itemsPerPageDetail
                );
                this.loading = true;
                for (var i = 0; i < this.detalleInterfaces.length; i++) {
                    if (this.detalleInterfaces[i].NSTATUS == 3) {
                        this.masterSelectedNumber = 1;
                    }
                }
                if (this.masterSelectedNumber == 1) {
                    this.masterSelectedBoolean = false;
                } else {
                    this.masterSelectedBoolean = true;
                }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz preliminar.', 'error'); }
        )
    }
    listarErroresDetalle(item): void {
        this.interfaceMonitoringService.listarErroresDetalle(item).subscribe(
            res => {
                this.currentPageDetailError = 1;
                this.detalleErrores = res.Result.lista;
                this.totalItemsDetailError = this.detalleErrores.length;
                this.listToShowDetailError = this.detalleErrores.slice(
                    (this.currentPageDetailError - 1) * this.itemsPerPageDetailError,
                    this.currentPageDetailError * this.itemsPerPageDetailError
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz preliminar.', 'error'); }
        )
    }

    // DETALLE ASIENTOS
    listarDetalleInterfacesAsientosContables(item): void {
        this.loadingAsiento = false;
        this.interfaceMonitoringService.listarDetalleInterfacesAsientosContables(item).subscribe(
            res => {
                this.currentPageDetailAsientosContables = 1;
                this.detalleInterfacesAsientosContables = res.Result.lista;
                this.totalItemsDetailAsientosContables = this.detalleInterfacesAsientosContables.length;
                this.listToShowDetailAsientosContables = this.detalleInterfacesAsientosContables.slice(
                    (this.currentPageDetailAsientosContables - 1) * this.itemsPerPageDetailAsientosContables,
                    this.currentPageDetailAsientosContables * this.itemsPerPageDetailAsientosContables
                );
                this.loadingAsiento = true;
                for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
                    if (this.detalleInterfacesAsientosContables[i].NSTATUS == 3) {
                        this.masterSelectedAsientosContablesNumber = 1;
                    }
                }
                if (this.masterSelectedAsientosContablesNumber == 1) {
                    this.masterSelectedAsientosContablesBoolean = false;
                } else {
                    this.masterSelectedAsientosContablesBoolean = true;
                }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz asientos.', 'error'); }
        )
    }
    listarDetalleInterfacesAsientosContablesError(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesAsientosContablesError(item).subscribe(
            res => {
                this.currentPageDetailAsientosContablesError = 1;
                this.detalleInterfacesAsientosContablesErrores = res.Result.lista;
                this.totalItemsDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.length;
                this.listToShowDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.slice(
                    (this.currentPageDetailAsientosContablesError - 1) * this.itemsPerPageDetailAsientosContablesError,
                    this.currentPageDetailAsientosContablesError * this.itemsPerPageDetailAsientosContablesError
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz asientos.', 'error'); }
        )
    }
    listarDetalleInterfacesAsientosContablesAsiento(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesAsientosContablesAsiento(item).subscribe(
            res => {
                this.currentPageDetailAsientosContablesAsiento = 1;
                this.detalleInterfacesAsientosContablesAsiento = res.Result.lista;
                this.totalItemsDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.length;
                this.listToShowDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.slice(
                    (this.currentPageDetailAsientosContablesAsiento - 1) * this.itemsPerPageDetailAsientosContablesAsiento,
                    this.currentPageDetailAsientosContablesAsiento * this.itemsPerPageDetailAsientosContablesAsiento
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los asientos de interfaz asientos.', 'error'); }
        )
    }

    // DETALLE ASIENTOS ÓRDENES DE PAGO
    listarDetalleInterfacesAsientosContablesOrdenesPago(item): void {
        this.loadingAsiento = false;
        this.interfaceMonitoringService.listarDetalleInterfacesAsientosContablesOrdenesPago(item).subscribe(
            res => {
                this.currentPageDetailAsientosContables = 1;
                this.detalleInterfacesAsientosContables = res.Result.lista;
                this.totalItemsDetailAsientosContables = this.detalleInterfacesAsientosContables.length;
                this.listToShowDetailAsientosContables = this.detalleInterfacesAsientosContables.slice(
                    (this.currentPageDetailAsientosContables - 1) * this.itemsPerPageDetailAsientosContables,
                    this.currentPageDetailAsientosContables * this.itemsPerPageDetailAsientosContables
                );
                this.loadingAsiento = true;
                for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
                    if (this.detalleInterfacesAsientosContables[i].NSTATUS == 3) {
                        this.masterSelectedAsientosContablesNumber = 1;
                    }
                }
                if (this.masterSelectedAsientosContablesNumber == 1) {
                    this.masterSelectedAsientosContablesBoolean = false;
                } else {
                    this.masterSelectedAsientosContablesBoolean = true;
                }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz asientos.', 'error'); }
        )
    }
    listarDetalleInterfacesAsientosContablesErrorOrdenesPago(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesAsientosContablesErrorOrdenesPago(item).subscribe(
            res => {
                this.currentPageDetailAsientosContablesError = 1;
                this.detalleInterfacesAsientosContablesErrores = res.Result.lista;
                this.totalItemsDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.length;
                this.listToShowDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.slice(
                    (this.currentPageDetailAsientosContablesError - 1) * this.itemsPerPageDetailAsientosContablesError,
                    this.currentPageDetailAsientosContablesError * this.itemsPerPageDetailAsientosContablesError
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz asientos.', 'error'); }
        )
    }
    listarDetalleInterfacesAsientosContablesAsientoOrdenesPago(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesAsientosContablesAsientoOrdenesPago(item).subscribe(
            res => {
                this.currentPageDetailAsientosContablesAsiento = 1;
                this.detalleInterfacesAsientosContablesAsiento = res.Result.lista;
                this.totalItemsDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.length;
                this.listToShowDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.slice(
                    (this.currentPageDetailAsientosContablesAsiento - 1) * this.itemsPerPageDetailAsientosContablesAsiento,
                    this.currentPageDetailAsientosContablesAsiento * this.itemsPerPageDetailAsientosContablesAsiento
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los asientos de interfaz asientos.', 'error'); }
        )
    }

    // DETALLE EXACTUS
    listarDetalleInterfacesExactus(item): void {
        this.loadingExactus = false;
        this.interfaceMonitoringService.listarDetalleInterfacesExactus(item).subscribe(
            res => {
                this.currentPageDetailExactus = 1;
                this.detalleInterfacesExactus = res.Result.lista;
                this.totalItemsDetailExactus = this.detalleInterfacesExactus.length;
                this.listToShowDetailExactus = this.detalleInterfacesExactus.slice(
                    (this.currentPageDetailExactus - 1) * this.itemsPerPageDetailExactus,
                    this.currentPageDetailExactus * this.itemsPerPageDetailExactus
                );
                this.loadingExactus = true;
                for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
                    if (this.detalleInterfacesExactus[i].NSTATUS_SEND == 3) {
                        this.masterSelectedExactusNumber = 1;
                    }
                }
                if (this.masterSelectedExactusNumber == 1) {
                    this.masterSelectedExactusBoolean = false;
                } else {
                    this.masterSelectedExactusBoolean = true;
                }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz Exactus.', 'error'); }
        )
    }
    listarDetalleInterfacesExactusError(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesExactusError(item).subscribe(
            res => {
                this.currentPageDetailExactusError = 1;
                this.detalleInterfacesExactusErrores = res.Result.lista;
                this.totalItemsDetailExactusError = this.detalleInterfacesExactusErrores.length;
                this.listToShowDetailExactusError = this.detalleInterfacesExactusErrores.slice(
                    (this.currentPageDetailExactusError - 1) * this.itemsPerPageDetailExactusError,
                    this.currentPageDetailExactusError * this.itemsPerPageDetailExactusError
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz Exactus.', 'error'); }
        )
    }
    listarDetalleInterfacesExactusAsiento(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesExactusAsiento(item).subscribe(
            res => {
                this.currentPageDetailExactusAsiento = 1;
                this.detalleInterfacesExactusAsiento = res.Result.lista;
                this.totalItemsDetailExactusAsiento = this.detalleInterfacesExactusAsiento.length;
                this.listToShowDetailExactusAsiento = this.detalleInterfacesExactusAsiento.slice(
                    (this.currentPageDetailExactusAsiento - 1) * this.itemsPerPageDetailExactusAsiento,
                    this.currentPageDetailExactusAsiento * this.itemsPerPageDetailExactusAsiento
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los asientos de interfaz Exactus.', 'error'); }
        )
    }

    // DETALLE EXACTUS ÓRDENES DE PAGO
    listarDetalleInterfacesExactusOrdenesPago(item): void {
        this.loadingExactus = false;
        this.interfaceMonitoringService.listarDetalleInterfacesExactusOrdenesPago(item).subscribe(
            res => {
                this.currentPageDetailExactus = 1;
                this.detalleInterfacesExactus = res.Result.lista;
                this.totalItemsDetailExactus = this.detalleInterfacesExactus.length;
                this.listToShowDetailExactus = this.detalleInterfacesExactus.slice(
                    (this.currentPageDetailExactus - 1) * this.itemsPerPageDetailExactus,
                    this.currentPageDetailExactus * this.itemsPerPageDetailExactus
                );
                this.loadingExactus = true;
                for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
                    if (this.detalleInterfacesExactus[i].NSTATUS_SEND == 3) {
                        this.masterSelectedExactusNumber = 1;
                    }
                }
                if (this.masterSelectedExactusNumber == 1) {
                    this.masterSelectedExactusBoolean = false;
                } else {
                    this.masterSelectedExactusBoolean = true;
                }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz Exactus.', 'error'); }
        )
    }
    listarDetalleInterfacesExactusErrorOrdenesPago(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesExactusErrorOrdenesPago(item).subscribe(
            res => {
                this.currentPageDetailExactusError = 1;
                this.detalleInterfacesExactusErrores = res.Result.lista;
                this.totalItemsDetailExactusError = this.detalleInterfacesExactusErrores.length;
                this.listToShowDetailExactusError = this.detalleInterfacesExactusErrores.slice(
                    (this.currentPageDetailExactusError - 1) * this.itemsPerPageDetailExactusError,
                    this.currentPageDetailExactusError * this.itemsPerPageDetailExactusError
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz Exactus.', 'error'); }
        )
    }
    listarDetalleInterfacesExactusAsientoOrdenesPago(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesExactusAsientoOrdenesPago(item).subscribe(
            res => {
                this.currentPageDetailExactusAsiento = 1;
                this.detalleInterfacesExactusAsiento = res.Result.lista;
                this.totalItemsDetailExactusAsiento = this.detalleInterfacesExactusAsiento.length;
                this.listToShowDetailExactusAsiento = this.detalleInterfacesExactusAsiento.slice(
                    (this.currentPageDetailExactusAsiento - 1) * this.itemsPerPageDetailExactusAsiento,
                    this.currentPageDetailExactusAsiento * this.itemsPerPageDetailExactusAsiento
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los asientos de interfaz Exactus.', 'error'); }
        )
    }

    // DETALLE PLANILLA
    listarDetallePlanilla(item): void {
        this.interfaceMonitoringService.listarDetalleErroresPlanillaMasivos(item).subscribe(
            res => {
                this.currentPageDetailPlanilla = 1;
                this.detalleInterfacesPlanilla = res.Result.lista;
                this.totalItemsDetailPlanilla = this.detalleInterfacesPlanilla.length;
                this.listToShowDetailPlanilla = this.detalleInterfacesPlanilla.slice(
                    (this.currentPageDetailPlanilla - 1) * this.itemsPerPageDetailPlanilla,
                    this.currentPageDetailPlanilla * this.itemsPerPageDetailPlanilla
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el detalle de la planilla.', 'error'); }
        )
    }

    // DETALLE PRELIMINAR
    mostrarModalPreliminar(content: any, item) {
        if (item.NSTATUS !== 0) {
            if (this.origenNumber == 1) {
                if (item.NCODGRU == 15 || item.NCODGRU == 16) {
                    this.tipo = 2;
                    this.booleanInterfazReciboPrel = false;
                    this.booleanInterfazMemoPrel = true;
                    this.Flg_IsCobra = false;
                    this.Flg_IsVISA = true;
                    if (this.booleanMemo == true) {
                        this.filtroInterfaceDetalle.NSTATUS = null;
                        this.filtroInterfaceDetalle.NTIPO = 3;
                        this.tipoBusqueda = "SINIESTRO/MEMO"
                    } else {
                        this.filtroInterfaceDetalle.NSTATUS = "3";
                        this.filtroInterfaceDetalle.NTIPO = 1;
                        this.tipoBusqueda = "PÓLIZA"
                    }
                } else if (item.NCODGRU == 18 || item.NCODGRU == 19) {
                    this.tipo = 1;
                    this.booleanInterfazReciboPrel = true;
                    this.booleanInterfazMemoPrel = false;
                    this.Flg_IsCobra = true;
                    this.Flg_IsVISA = false;
                    if (this.booleanRecibo == true) {
                        this.filtroInterfaceDetalle.NSTATUS = null;
                        this.filtroInterfaceDetalle.NTIPO = 2;
                        this.tipoBusqueda = "RECIBO"
                    } else {
                        this.filtroInterfaceDetalle.NSTATUS = "3";
                        this.filtroInterfaceDetalle.NTIPO = 1;
                        this.tipoBusqueda = "PÓLIZA"
                    }
                } else {
                    this.tipo = 1;
                    this.booleanInterfazReciboPrel = true;
                    this.booleanInterfazMemoPrel = false;
                    this.Flg_IsCobra = false;
                    this.Flg_IsVISA = true;
                    if (this.booleanRecibo == true) {
                        this.filtroInterfaceDetalle.NSTATUS = null;
                        this.filtroInterfaceDetalle.NTIPO = 2;
                        this.tipoBusqueda = "RECIBO"
                    } else {
                        this.filtroInterfaceDetalle.NSTATUS = "3";
                        this.filtroInterfaceDetalle.NTIPO = 1;
                        this.tipoBusqueda = "PÓLIZA"
                    }
                }
            } else {
                this.tipo = 1;
                this.booleanInterfazReciboPrel = false;
                this.booleanInterfazMemoPrel = false;
                this.Flg_IsCobra = false;
                this.Flg_IsVISA = false;
                if (this.booleanRecibo == true) {
                    this.filtroInterfaceDetalle.NSTATUS = null;
                    this.filtroInterfaceDetalle.NTIPO = 2;
                    this.tipoBusqueda = "RECIBO"
                } else {
                    this.filtroInterfaceDetalle.NSTATUS = "3";
                    this.filtroInterfaceDetalle.NTIPO = 1;
                    this.tipoBusqueda = "PÓLIZA"
                }
            }
            this.tipoBusquedaSI.P_FLG_TIP = this.tipo;
            this.listarTipoBusquedaSI(this.tipoBusquedaSI);
            this.masterSelected = false;
            this.erroresMarcadosSend[0] = 0;
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceCabeceraRecibo.NRECEIPT = this.reciboGlobal;
            this.filtroInterfaceDetalle.NIDPROCESS = item.NIDPROCESS;
            // this.filtroInterfaceDetalle.NSTATUS = "3";
            this.filtroInterfaceDetalle.NRECEIPT = this.filtroInterfaceCabeceraRecibo.NRECEIPT;
            this.filtroInterfaceDetalle.SCODGRU_DES = item.SCODGRU_DES;
            this.filtroInterfaceDetalle.SBRANCH_DES = item.SBRANCH_DES;
            // if (this.origenNumber == 1) {
            //     this.filtroInterfaceDetalle.SBRANCH_DES = item.SBRANCH_DES;
            // } else {
            //     this.filtroInterfaceDetalle.SBRANCH_DES = this.origenText;
            //     this.booleanInterfazReciboPrel = false;
            //     this.booleanInterfazMemoPrel = false;
            // }
            this.filtroInterfaceDetalle.NCODGRU = item.NCODGRU;
            this.filtroInterfaceDetalle.NBRANCH = item.NBRANCH;
            this.filtroInterfaceDetalle.NSTATUS_PROCESS = item.NSTATUS;
            this.filtroInterfaceDetalle.JOB = item.ID_JOB;
            this.masterSelectedNumber = 0;
            this.listarDetalleInterfaces(this.filtroInterfaceDetalle);
        } else { return }
    }
    mostrarModalPreliminarError(content: any, item) {
        if (item.ERROR) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroDetalleError.NIDPROCESS = this.filtroInterfaceDetalle.NIDPROCESS;
            this.filtroDetalleError.NIDPROCDET = item.NIDPROCDET;
            this.filtroDetalleError.NRECEIPT = item.NRECEIPT;
            this.filtroDetalleError.NPOLICY = item.NPOLICY;
            this.filtroDetalleError.PRODUCTO_DES = item.PRODUCTO_DES;
            this.filtroDetalleError.NTYPE_DES = item.NTYPE_DES;
            this.listarErroresDetalle(this.filtroDetalleError);
        } else { return }
    }

    // DETALLE ASIENTOS
    mostrarModalAsientosContables(content: any, contentOP: any, item) {
        if (item.NSTATUS_ASI !== 0) {
            if ((this.origenNumber == 1 && item.NCODGRU == 16) || (this.origenNumber !== 1 && item.NCODGRU == 7)) {
                this.masterSelectedAsientosContables = false;
                this.erroresMarcadosAsientosContablesSend[0] = 0;
                this.modalService.open(contentOP, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                this.filtroInterfaceDetalleAsientosContables.NIDPROCESS = item.NIDPROCESS;
                this.filtroInterfaceDetalleAsientosContables.NSTATUS = null;
                this.filtroInterfaceDetalleAsientosContables.SCODGRU_DES = item.SCODGRU_DES;
                this.filtroInterfaceDetalleAsientosContables.SBRANCH_DES = item.SBRANCH_DES;
                this.filtroInterfaceDetalleAsientosContables.NCODGRU = item.NCODGRU;
                this.filtroInterfaceDetalleAsientosContables.NBRANCH = item.NBRANCH;
                this.filtroInterfaceDetalleAsientosContables.NSTATUS_PROCESS = item.NSTATUS_SEND;
                this.filtroInterfaceDetalleAsientosContables.JOB = item.ID_JOB;
                this.masterSelectedAsientosContablesNumber = 0;
                this.listarDetalleInterfacesAsientosContablesOrdenesPago(this.filtroInterfaceDetalleAsientosContables);
            } else {
                if (item.NCODGRU == 15) {
                    this.tipo = 2;
                    this.booleanInterfazSinAsi = true;
                } else {
                    this.tipo = 1;
                    this.booleanInterfazSinAsi = false;
                }
                this.masterSelectedAsientosContables = false;
                this.erroresMarcadosAsientosContablesSend[0] = 0;
                this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                this.filtroInterfaceDetalleAsientosContables.NIDPROCESS = item.NIDPROCESS;
                this.filtroInterfaceDetalleAsientosContables.NSTATUS = null;
                this.filtroInterfaceDetalleAsientosContables.SCODGRU_DES = item.SCODGRU_DES;
                this.filtroInterfaceDetalleAsientosContables.SBRANCH_DES = item.SBRANCH_DES;
                // if (this.origenNumber == 1) {
                //     this.filtroInterfaceDetalleAsientosContables.SBRANCH_DES = item.SBRANCH_DES;
                // } else {
                //     this.filtroInterfaceDetalleAsientosContables.SBRANCH_DES = this.origenText;
                // }
                this.filtroInterfaceDetalleAsientosContables.NCODGRU = item.NCODGRU;
                this.filtroInterfaceDetalleAsientosContables.NBRANCH = item.NBRANCH;
                this.filtroInterfaceDetalleAsientosContables.NSTATUS_PROCESS = item.NSTATUS_SEND;
                this.filtroInterfaceDetalleAsientosContables.JOB = item.ID_JOB;
                this.masterSelectedAsientosContablesNumber = 0;
                this.listarDetalleInterfacesAsientosContables(this.filtroInterfaceDetalleAsientosContables);
            }
        } else { return }
    }
    mostrarModalAsientosContablesError(content: any, item) {
        if (item.DETALLE_ERROR) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleAsientosContablesError.NNUMASI = item.NNUMASI;
            this.filtroInterfaceDetalleAsientosContablesError.AST_CDESCRI = item.AST_CDESCRI;
            this.filtroInterfaceDetalleAsientosContablesError.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleAsientosContablesError.NIDPROCESS = this.filtroInterfaceDetalleAsientosContables.NIDPROCESS; //INI MMQ 22/01/2023 AHO.TOT -- FIN
            this.listarDetalleInterfacesAsientosContablesError(this.filtroInterfaceDetalleAsientosContablesError);
        } else { return }
    }
    mostrarModalAsientosContablesAsiento(content: any, item) {
        if (item.DETALLE_ASIENTO) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleAsientosContablesAsiento.NNUMASI = item.NNUMASI;
            this.filtroInterfaceDetalleAsientosContablesAsiento.AST_CDESCRI = item.AST_CDESCRI;
            this.filtroInterfaceDetalleAsientosContablesAsiento.MCT_CDESCRI = item.MCT_CDESCRI;            
            this.filtroInterfaceDetalleAsientosContablesAsiento.NIDPROCESS = this.filtroInterfaceDetalleAsientosContables.NIDPROCESS; //INI MMQ 22/01/2023 AHO.TOT -- FIN
            this.listarDetalleInterfacesAsientosContablesAsiento(this.filtroInterfaceDetalleAsientosContablesAsiento);
        } else { return }
    }
    mostrarModalAsientosContablesErrorOrdenesPago(content: any, item) {
        if (item.DETALLE_ERROR) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleAsientosContablesError.NIDCBTMOVBCO = item.NIDCBTMOVBCO;
            this.filtroInterfaceDetalleAsientosContablesError.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleAsientosContablesError.NIDPROCESS = this.filtroInterfaceDetalleAsientosContables.NIDPROCESS; // DGC 04/04/2024
            this.listarDetalleInterfacesAsientosContablesErrorOrdenesPago(this.filtroInterfaceDetalleAsientosContablesError);
        } else { return }
    }
    mostrarModalAsientosContablesAsientoOrdenesPago(content: any, item) {
        if (item.DETALLE_ASIENTO) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleAsientosContablesAsiento.NIDCBTMOVBCO = item.NIDCBTMOVBCO;
            this.filtroInterfaceDetalleAsientosContablesAsiento.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleAsientosContablesAsiento.NIDPROCESS = this.filtroInterfaceDetalleAsientosContables.NIDPROCESS; // DGC 04/04/2024
            this.listarDetalleInterfacesAsientosContablesAsientoOrdenesPago(this.filtroInterfaceDetalleAsientosContablesAsiento);
        } else { return }
    }

    // DETALLE EXACTUS
    mostrarModalExactus(content: any, contentOP: any, item) {
        if (item.NSTATUS_SEND !== 0) {
            if ((this.origenNumber == 1 && item.NCODGRU == 16) || (this.origenNumber !== 1 && item.NCODGRU == 7)) {
                this.masterSelectedExactus = false;
                this.erroresMarcadosExactusSend[0] = 0;
                this.modalService.open(contentOP, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                this.filtroInterfaceDetalleExactus.NIDPROCESS = item.NIDPROCESS;
                this.filtroInterfaceDetalleExactus.NSTATUS = null;
                this.filtroInterfaceDetalleExactus.SCODGRU_DES = item.SCODGRU_DES;
                this.filtroInterfaceDetalleExactus.SBRANCH_DES = item.SBRANCH_DES;
                this.filtroInterfaceDetalleExactus.NCODGRU = item.NCODGRU;
                this.filtroInterfaceDetalleExactus.NBRANCH = item.NBRANCH;
                this.filtroInterfaceDetalleExactus.NSTATUS_PROCESS = item.NSTATUS_SEND;
                this.filtroInterfaceDetalleExactus.JOB = item.ID_JOB;
                this.masterSelectedExactusNumber = 0;
                this.listarDetalleInterfacesExactusOrdenesPago(this.filtroInterfaceDetalleExactus);
            } else {
                if (item.NCODGRU == 15) {
                    this.tipo = 2;
                    this.booleanInterfazSinExa = true;
                } else {
                    this.tipo = 1;
                    this.booleanInterfazSinExa = false;
                }
                this.masterSelectedExactus = false;
                this.erroresMarcadosExactusSend[0] = 0;
                this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                this.filtroInterfaceDetalleExactus.NIDPROCESS = item.NIDPROCESS;
                this.filtroInterfaceDetalleExactus.NSTATUS = null;
                this.filtroInterfaceDetalleExactus.SCODGRU_DES = item.SCODGRU_DES;
                this.filtroInterfaceDetalleExactus.SBRANCH_DES = item.SBRANCH_DES;
                // if (this.origenNumber == 1) {
                //     this.filtroInterfaceDetalleExactus.SBRANCH_DES = item.SBRANCH_DES;
                // } else {
                //     this.filtroInterfaceDetalleExactus.SBRANCH_DES = this.origenText;
                // }
                this.filtroInterfaceDetalleExactus.NCODGRU = item.NCODGRU;
                this.filtroInterfaceDetalleExactus.NBRANCH = item.NBRANCH;
                this.filtroInterfaceDetalleExactus.NSTATUS_PROCESS = item.NSTATUS_SEND;
                this.filtroInterfaceDetalleExactus.JOB = item.ID_JOB;
                this.masterSelectedExactusNumber = 0;
                this.listarDetalleInterfacesExactus(this.filtroInterfaceDetalleExactus);
            }
        } else { return }
    }
    mostrarModalExactusError(content: any, item) {
        if (item.DETALLE_ERROR) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleExactusError.NNUMASI = item.NNUMASI;
            this.filtroInterfaceDetalleExactusError.AST_CDESCRI = item.AST_CDESCRI;
            this.filtroInterfaceDetalleExactusError.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleExactusError.NIDPROCESS = this.filtroInterfaceDetalleExactus.NIDPROCESS; //INI MMQ 22/01/2023 AHO.TOT -- FIN
            this.listarDetalleInterfacesExactusError(this.filtroInterfaceDetalleExactusError);
        } else { return }
    }
    mostrarModalExactusAsiento(content: any, item) {
        if (item.DETALLE_ASIENTO) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleExactusAsiento.NNUMASI = item.NNUMASI;
            this.filtroInterfaceDetalleExactusAsiento.AST_CDESCRI = item.AST_CDESCRI;
            this.filtroInterfaceDetalleExactusAsiento.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleExactusAsiento.NIDPROCESS = this.filtroInterfaceDetalleExactus.NIDPROCESS; //INI MMQ 22/01/2023 AHO.TOT -- FIN
            this.listarDetalleInterfacesExactusAsiento(this.filtroInterfaceDetalleExactusAsiento);
        } else { return }
    }
    mostrarModalExactusErrorOrdenesPago(content: any, item) {
        if (item.DETALLE_ERROR) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleExactusError.NIDCBTMOVBCO = item.NIDCBTMOVBCO;
            this.filtroInterfaceDetalleExactusError.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleExactusError.NIDPROCESS = this.filtroInterfaceDetalleExactus.NIDPROCESS; // DGC 04/04/2024
            this.listarDetalleInterfacesExactusErrorOrdenesPago(this.filtroInterfaceDetalleExactusError);
        } else { return }
    }
    mostrarModalExactusAsientoOrdenesPago(content: any, item) {
        if (item.DETALLE_ASIENTO) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfaceDetalleExactusAsiento.NIDCBTMOVBCO = item.NIDCBTMOVBCO;
            this.filtroInterfaceDetalleExactusAsiento.MCT_CDESCRI = item.MCT_CDESCRI;
            this.filtroInterfaceDetalleExactusAsiento.NIDPROCESS = this.filtroInterfaceDetalleExactus.NIDPROCESS; // DGC 04/04/2024
            this.listarDetalleInterfacesExactusAsientoOrdenesPago(this.filtroInterfaceDetalleExactusAsiento);
        } else { return }
    }

    // DETALLE PLANILLA
    mostrarModalPlanilla(content: any, item) {
        if (item.ID_JOB && item.NSTATUS_JOB == 3) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroInterfacePlanilla.JOB = item.ID_JOB;
            this.filtroInterfacePlanilla.NIDPROCESS = item.NIDPROCESS;
            this.filtroInterfacePlanilla.SCODGRU_DES = item.SCODGRU_DES;
            this.filtroInterfacePlanilla.SBRANCH_DES = item.SBRANCH_DES;
            this.filtroInterfacePlanilla.NCODGRU = item.NCODGRU;
            this.filtroInterfacePlanilla.NBRANCH = item.NBRANCH;
            this.filtroInterfacePlanilla.NSTATUS_PROCESS = item.NSTATUS;
            this.listarDetallePlanilla(this.filtroInterfacePlanilla);
        } else { return }
    }

    // REPORTES
    getReportFilters = () => {
        this.filtroInterfaceDetalleXLSX.NIDPROCESS = this.filtroInterfaceDetalle.NIDPROCESS;
        this.filtroInterfaceDetalleXLSX.NSTATUS = this.filtroInterfaceDetalle.NSTATUS;
        this.filtroInterfaceDetalleXLSX.NRECEIPT = this.filtroInterfaceDetalle.NRECEIPT;
        this.filtroInterfaceDetalleXLSX.NTIPO = this.filtroInterfaceDetalle.NTIPO;
        this.filtroInterfaceDetalleXLSX.NCODGRU = this.filtroInterfaceDetalle.NCODGRU;
        this.filtroInterfaceDetalleXLSX.NNUMORI = this.filterForm.get('NNUMORI').value; //ini mmq 22-03-2024 rentas - fin
        if (this.filtroInterfaceDetalle.NCODGRU == 19 || this.filtroInterfaceDetalle.NCODGRU == 18 ) {
            this.reporteDetalleInterfacesXLSX_CB(this.filtroInterfaceDetalleXLSX);
        } else {
            this.reporteDetalleInterfacesXLSX(this.filtroInterfaceDetalleXLSX);
        }
    }
    reporteDetalleInterfacesXLSX(item): void {
        this.interfaceMonitoringService.listarDetalleInterfacesXLSX(item).subscribe(
            res => {         
                let _data = res;
                if (_data.response == 0) {
                    if (_data.Data != null) {
                    const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                    'Reporte_Detalle_Preliminar - ' + this.filtroInterfaceDetalle.NIDPROCESS +'.xlsx', { type: 'text/xls' });
                    FileSaver.saveAs(file);  
                    }                                    
                }                
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte con los detalles de interfaz preliminar.', 'error'); }            
        )       
    }
    reporteDetalleInterfacesXLSX_CB(item): void {        
        this.interfaceMonitoringService.listarDetalleInterfacesXLSX_CB(item).subscribe(                  
            res => {         
                let _data = res;
                if (_data.response == 0) {
                    if (_data.Data != null) {
                    const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                    'Reporte_Detalle_Preliminar - ' + this.filtroInterfaceDetalle.NIDPROCESS +'.xlsx', { type: 'text/xls' });
                    FileSaver.saveAs(file);  
                    }                                    
                }                
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte con los detalles de interfaz preliminar.', 'error'); }            
        )
    }
    obtenerBlobFromBase64 = (b64Data: string, contentType: string) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            
            const byteNumbers = new Array(slice.length);            
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    // REPROCESO PRELIMINAR
    insertarNuevoReproceso = () => {
        if (this.erroresMarcadosSend[0].length >= 1) {
            this.insertarReproceso.P_NNUMORI = this.filterForm.get('NNUMORI').value;
            this.insertarReproceso.P_NIDPROCESS_ORI = this.filtroInterfaceDetalle.NIDPROCESS;
            this.insertarReproceso.P_NIDPROCESS = null;
            this.insertarReproceso.P_NCODGRU = this.filtroInterfaceDetalle.NCODGRU;
            this.insertarReproceso.P_NBRANCH = this.filtroInterfaceDetalle.NBRANCH;
            this.insertarReproceso.P_NSTATUS = 1;
            this.insertarReproceso.P_SPROCESS_TYPE = "R";
            this.insertarReproceso.P_LIST = this.erroresMarcadosSend[0];
            this.insertarReproceso.P_JOB = this.filtroInterfaceDetalle.JOB;
            this.insertarReproceso.P_SIDUSUREG = JSON.parse(localStorage.getItem('currentUser')).username
            this.interfaceMonitoringService.insertarReproceso(this.insertarReproceso).subscribe(
                res => {
                    this.reprocessId = res.Result.P_NIDREPROCESS;
                    Swal.fire('Información', 'Se creó el nuevo proceso ' + this.reprocessId + ', actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                    this.listarCabeceraInterfaces();
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los errores.', 'error'); }
            );
            this.modalService.dismissAll();
        } else {
            Swal.fire('Información', 'Seleccione al menos un error para reprocesar.', 'info');
        }
    }

    // REPROCESO EXACTUS
    insertarNuevoReprocesoExactus = () => {
        //debugger
        if (this.erroresMarcadosExactusSend[0].length >= 1) {
            this.insertarReproceso.P_NNUMORI = this.filterForm.get('NNUMORI').value;
            this.insertarReproceso.P_NIDPROCESS_ORI = this.filtroInterfaceDetalleExactus.NIDPROCESS;
            this.insertarReproceso.P_NIDPROCESS = null;
            this.insertarReproceso.P_NCODGRU = this.filtroInterfaceDetalleExactus.NCODGRU;
            this.insertarReproceso.P_NBRANCH = this.filtroInterfaceDetalleExactus.NBRANCH;
            this.insertarReproceso.P_NSTATUS = 1;
            this.insertarReproceso.P_SPROCESS_TYPE = "E";
            this.insertarReproceso.P_LIST = this.erroresMarcadosExactusSend[0];
            this.insertarReproceso.P_JOB = this.filtroInterfaceDetalleExactus.JOB;
            this.insertarReproceso.P_SIDUSUREG = JSON.parse(localStorage.getItem('currentUser')).username
            //INI MMQ 22/01/2023 RENTAS
            //this.interfaceMonitoringService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
            //this.interfaceMonitoringService.insertarReproceso(this.insertarReproceso).subscribe(
            //     res => {
            //         //Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
            //         this.reprocessId = res.Result.P_NIDREPROCESS;
            //         Swal.fire('Información', 'Se creó el nuevo proceso ' + this.reprocessId + ', actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
            //         this.listarCabeceraInterfaces();
            //     },
            //     err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
            // );
            if(this.insertarReproceso.P_NNUMORI != 1) {
                // primas y ordenes de pago - rentas
                if (this.insertarReproceso.P_NCODGRU == 1 || this.insertarReproceso.P_NCODGRU == 7){
                    this.interfaceMonitoringService.insertarReproceso(this.insertarReproceso).subscribe(
                        res => {
                            this.reprocessId = res.Result.P_NIDREPROCESS;
                            Swal.fire('Información', 'Se creó el nuevo proceso ' + this.reprocessId + ', actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                            this.listarCabeceraInterfaces();
                        },
                        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                    );
                }
                else{
                    this.interfaceMonitoringService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
                        res => {
                            Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                            this.listarCabeceraInterfaces();
                        },
                        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                    );
                }
            }
            else
            {
                if(this.insertarReproceso.P_NCODGRU == 16){ // ordenes de pago
                    this.interfaceMonitoringService.insertarReproceso(this.insertarReproceso).subscribe(
                        res => {
                            this.reprocessId = res.Result.P_NIDREPROCESS;
                            Swal.fire('Información', 'Se creó el nuevo proceso ' + this.reprocessId + ', actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                            this.listarCabeceraInterfaces();
                        },
                        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                    );
                }
                else{
                    this.interfaceMonitoringService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
                        res => {
                            Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                            this.listarCabeceraInterfaces();
                        },
                        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                    );
                }
            }
            //FIN MMQ 22/01/2023 RENTAS
            this.modalService.dismissAll();
        } else {
            Swal.fire('Información', 'Seleccione al menos un error para reprocesar.', 'info');
        }
    }

    // REPROCESO ASIENTOS
    insertarNuevoReprocesoAsientosContables = () => {
        if (this.erroresMarcadosAsientosContablesSend[0].length >= 1) {
            this.insertarReproceso.P_NNUMORI = this.filterForm.get('NNUMORI').value;
            this.insertarReproceso.P_NIDPROCESS_ORI = this.filtroInterfaceDetalleAsientosContables.NIDPROCESS;
            this.insertarReproceso.P_NIDPROCESS = null;
            this.insertarReproceso.P_NCODGRU = this.filtroInterfaceDetalleAsientosContables.NCODGRU;
            this.insertarReproceso.P_NBRANCH = this.filtroInterfaceDetalleAsientosContables.NBRANCH;
            this.insertarReproceso.P_NSTATUS = 1;
            this.insertarReproceso.P_SPROCESS_TYPE = "A";
            this.insertarReproceso.P_LIST = this.erroresMarcadosAsientosContablesSend[0];
            this.insertarReproceso.P_JOB = this.filtroInterfaceDetalleAsientosContables.JOB;
            this.insertarReproceso.P_SIDUSUREG = JSON.parse(localStorage.getItem('currentUser')).username
            //INI MMQ 22/01/2023 SEACSA PRI.UNI

            //this.interfaceMonitoringService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
            //    res => {
            //        Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
            //        this.listarCabeceraInterfaces();
            //    },
            //    err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
            //);

            if (this.insertarReproceso.P_NNUMORI != 1 && this.insertarReproceso.P_NCODGRU == 1) {                
                if(this.insertarReproceso.P_NNUMORI != 1) {
                    // primas y ordenes de pago - rentas
                    if (this.insertarReproceso.P_NCODGRU == 1 || this.insertarReproceso.P_NCODGRU == 7){
                        this.interfaceMonitoringService.insertarReproceso(this.insertarReproceso).subscribe(
                            res => {
                                this.reprocessId = res.Result.P_NIDREPROCESS;
                                Swal.fire('Información', 'Se creó el nuevo proceso ' + this.reprocessId + ', actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                                this.listarCabeceraInterfaces();
                            },
                            err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                        );
                    }
                    else{
                        this.interfaceMonitoringService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
                            res => {
                                Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                                this.listarCabeceraInterfaces();
                            },
                            err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                        );
                    }
                }
            }
            else
            {
                if(this.insertarReproceso.P_NCODGRU == 16){ // ordenes de pago
                    this.interfaceMonitoringService.insertarReproceso(this.insertarReproceso).subscribe(
                        res => {
                            this.reprocessId = res.Result.P_NIDREPROCESS;
                            Swal.fire('Información', 'Se creó el nuevo proceso ' + this.reprocessId + ', actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                            this.listarCabeceraInterfaces();
                        },
                        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                    );
                }
                else{
                    this.interfaceMonitoringService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
                        res => {
                            Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
                            this.listarCabeceraInterfaces();
                        },
                        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
                    );
                }
            }
            //FIN MMQ 22/01/2023 SEACSA PRI.UNI
           
            this.modalService.dismissAll();
        } else {
            Swal.fire('Información', 'Seleccione al menos un error para reprocesar.', 'info');
        }
    }

    // VALIDAR PLANILLA
    validarPlanilla = () => {
        this.insertarReproceso.P_NNUMORI = this.filterForm.get('NNUMORI').value;
        this.insertarReproceso.P_NIDPROCESS_ORI = this.filtroInterfacePlanilla.NIDPROCESS;
        this.insertarReproceso.P_NIDPROCESS = null;
        this.insertarReproceso.P_NCODGRU = this.filtroInterfacePlanilla.NCODGRU;
        this.insertarReproceso.P_NBRANCH = this.filtroInterfacePlanilla.NBRANCH;
        this.insertarReproceso.P_NSTATUS = 1;
        this.insertarReproceso.P_SPROCESS_TYPE = "P";
        this.insertarReproceso.P_LIST = null;
        this.insertarReproceso.P_JOB = this.filtroInterfacePlanilla.JOB;
        this.insertarReproceso.P_SIDUSUREG = JSON.parse(localStorage.getItem('currentUser')).username
        this.interfaceMonitoringService.insertarReprocesoPlanilla(this.insertarReproceso).subscribe(
            res => {
                Swal.fire('Información', 'La validación de la planilla tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el nuevo proceso.', 'success');
                this.listarCabeceraInterfaces();
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al validar la planilla.', 'error'); }
        );
        this.modalService.dismissAll();
    }

    // TIPO DE BÚSQUEDA
    seleccionarTipoBusqueda = (e) => {
        this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
        if (e == 1) {
            this.tipoBusqueda = "PÓLIZA"
        }
        if (e == 2) {
            this.tipoBusqueda = "RECIBO"
        }
        if (e == 3) {
            this.tipoBusqueda = "SINIESTRO/MEMO"
        }
    }
    seleccionarInterfaz = (e) => {
        this.filterForm.controls.NPOLICY.setValue('');
        switch (Number(this.filterForm.get('NNUMORI').value)) {
            case 1:
                if (e == 15 || e == 16) {
                    this.filterForm.controls.NRECEIPT.setValue('');
                    this.booleanInterfazRecibo = false;
                    this.booleanInterfazMemo = true;
                    this.booleanInterfazPoliza = false;
                } else {
                    this.filterForm.controls.CLAIM_MEMO.setValue('');
                    this.booleanInterfazRecibo = true;
                    this.booleanInterfazMemo = false;
                    this.booleanInterfazPoliza = false;
                }
            break;
            default:
            break;
        }
    }
    listarTipoBusquedaSI = (item) => {
        this.interfaceMonitoringService.listarTipoBusquedaSI(item).subscribe(
            res => {
                this.tipoBusquedasSI = res.Result.combos;
                if (this.origenNumber !== 1) {
                    var item = this.tipoBusquedasSI?.find((x) => Number(x.CODIGO) == 2);
                    var list = this.tipoBusquedasSI.splice(item, 1);
                    this.tipoBusquedasSI = list;
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los tipos de búsquedas.', 'error');
            }
        )
    }

    // LISTAR DETALLE DE OPERACIONES
    mostrarModalPreliminarOperaciones(content: any, item) {
        if (item.OPERACION) {
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
            this.filtroDetalleOperacion.NCODGRU = this.filtroInterfaceDetalle.NCODGRU;
            this.filtroDetalleOperacion.NIDPROCDET = item.NIDPROCDET;
            this.filtroDetalleOperacion.NMOVCONT = item.NTYPE;
            this.filtroDetalleOperacion.NRECEIPT = item.NRECEIPT;
            this.filtroDetalleOperacion.PRODUCTO_DES = item.PRODUCTO_DES;
            this.filtroDetalleOperacion.NTYPE_DES = item.NTYPE_DES;
            this.listarDetalleOperacion(this.filtroDetalleOperacion);
        } else { return }
    }
    listarDetalleOperacion(item): void {
        this.interfaceMonitoringService.listarDetalleOperacion(item).subscribe(
            res => {
                this.currentPageDetailOperacion = 1;
                this.detalleOperacion = res.Result.lista;
                this.totalItemsDetailOperacion = this.detalleOperacion.length;
                this.listToShowDetailOperacion = this.detalleOperacion.slice(
                    (this.currentPageDetailOperacion - 1) * this.itemsPerPageDetailOperacion,
                    this.currentPageDetailOperacion * this.itemsPerPageDetailOperacion
                );
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el detalle de las operaciones bancarias.', 'error'); }
        )
    }
}