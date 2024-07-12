import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { InterfaceBankPaymentService } from '../../../backoffice/services/interface-bankpayment/interface-bankpayment.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../global-validators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';

export interface filtroInterfaz {
    mvt_nnumori?: number;
}

export interface TipoBusquedaSI {
    P_FLG_TIP?: number;
}

export interface EstadosTesoreria {
    P_TIPO?: number;
}

export interface Observacion {
    P_NIDPAYBNKD?: number;
}

export interface AgregarObservacion {
    P_NIDPAYBNKD?: number;
    P_NIDPAYBNK?: number;
    P_NIDPROCESS?: number;
    P_SDES_OBSERV?: string;
    P_NSTATUS?: number;
    P_CID_RE_OPEN?: string;
    P_DFEC_APROBR?: string;
    P_CIDOPERBNKR?: string;
    P_CUSERCODE?: string;
}

export interface AprobadosArray {
    APROBADOS?: any;
}

export interface ObservadosArray {
    OBSERVACIONES?: any;
}

export interface Detalle {
    // LLENA LA CABECERA
    PROCESO?: number;
    ORIGEN?: string;
    BANCO?: string;
    MONEDA?: string;
    ESTADO?: number;
    PROC_BANCO?: string;
    // INVOCA EL HORARIO DE INTERFAZ
    P_NNUMORI?: Number;
    P_NCODGRU?: Number;
    P_NBRANCH?: Number;
    // SE ENVÍAN A LA CONSULTA
    P_NIDPAYBNK?: number;
    P_NSTATUS?: number;
    // CONSULTA POR DOC
    P_NTIPO?: number;
    P_SVALOR?: string;
}

export interface FiltroRptBancoDETXLSX {
    P_NIDPAYBNK?: number;
    P_NSTATUS?: number;
    P_NTIPO?: number;
    P_SVALOR?: string;
}

export interface FiltroBuscarPorCAB {    
    P_NTIPO?: number;
    P_SVALOR?: string;    
}

@Component({
    selector: 'app-interface-bankpayment-obs',
    templateUrl: './interface-bankpayment-obs.component.html',
    styleUrls: ['./interface-bankpayment-obs.component.css']
})

export class InterfaceBankpaymentObsComponent implements OnInit {

    diaActual = moment(new Date()).toDate();
    checked: boolean = false;
    checkedAll: boolean = true;
    saveObsBool: boolean = false;
    checkedProc: any = {};
    checkedProcSend: any[] = [];
    checkedObs: any = {};
    checkedObsSend: any[] = [];
    bsConfig: Partial<BsDatepickerConfig>;
    filtroInterfaz: filtroInterfaz;
    tipoBusquedaSI: TipoBusquedaSI;
    estadosTesoreria: EstadosTesoreria;
    estadosTesoreriaDet: EstadosTesoreria;
    agregarObservacion: AgregarObservacion;
    aprobadosArray: AprobadosArray;
    observadosArray: ObservadosArray;
    observacion: Observacion;
    detalle: Detalle;
    filterForm: FormGroup;
    docForm: FormGroup;
    submitted: boolean = false;
    submittedDoc: boolean = false;
    FiltroBuscarPorCAB: FiltroBuscarPorCAB;

    originGlb: number = 0;
    flagDoc: boolean = false;
    cuentaProcBnk = 0;

    aprobaciones: any = [];
    detalles: any = [];
    observaciones: any = [];
    origen: any = [];
    interfaces: any = [];
    bancos: any = [];
    estados: any = [];
    estadosDet: any = [];
    buscarPor: any = [];
    tipoBusquedas: any = [];

    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 15;
    totalItems = 0;
    maxSize = 10;

    listToShowDet: any = [];
    currentPageDet = 1;
    itemsPerPageDet = 15;
    totalItemsDet = 0;
    maxSizeDet = 10;

    inputsQuotation: any = {};

    filtroRptBancoDETXLSX: FiltroRptBancoDETXLSX;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private InterfaceBankPaymentService: InterfaceBankPaymentService
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
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.createForm();        
        this.inicializarFiltros();
        this.getParams();
        this.getCheckedProcList();
        this.getCheckedObsList(0, 0);

        this.inputsQuotation.P_SVALOR = ""; // Razon social
    }

    createForm(): void {
        this.filterForm = this.formBuilder.group({
            P_NNUMORI: [1, Validators.required],
            P_NCODGRU: [16, Validators.required],
            P_NBANK_CODE: [null],
            P_NSTATUS: [null],
            P_DFECINI: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            P_DFECFIN: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            P_NTIPO: [null],
            P_SVALOR: [null]
        });
        this.docForm = this.formBuilder.group({
            P_NTIPO: [null, Validators.required],
            P_SVALOR: [null]
        });
    }    

    inicializarFiltros = () => {
        this.filterForm.controls.P_NCODGRU.disable();
        this.docForm.controls.P_SVALOR.disable();
        this.tipoBusquedaSI = {};
        this.tipoBusquedaSI.P_FLG_TIP = 3;
        this.estadosTesoreria = {};
        this.estadosTesoreria.P_TIPO = 0;
        this.estadosTesoreriaDet = {};
        this.estadosTesoreriaDet.P_TIPO = 1;
        this.filtroInterfaz = {};
        this.filtroInterfaz.mvt_nnumori = 1;
        this.detalle = {};
        this.agregarObservacion = {};
        this.observacion = {};
        this.FiltroBuscarPorCAB={};
        this.listarInterfaces(this.filtroInterfaz);
        this.filterForm.setValidators([GlobalValidators.dateSortI]);
        this.filtroRptBancoDETXLSX = {};
    }

    seleccionarOrigen = (e) => {
        this.filtroInterfaz.mvt_nnumori = e;
        this.listarInterfaces(this.filtroInterfaz);
        switch (Number(e)) {
            case 1:
                this.filterForm.controls.P_NCODGRU.setValue(16);
                this.filterForm.controls.P_NCODGRU.disable();
                break;
            default:
                this.filterForm.controls.P_NCODGRU.setValue(0);
                this.filterForm.controls.P_NCODGRU.enable();
                break;
        }
    }

    listarInterfaces = (item) => {
        this.InterfaceBankPaymentService.ListarInterfaz(item).subscribe(
            res => {
                this.interfaces = res.Result.lista;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error'); }
        )
    }

    seleccionarTipo = (e) => {
        this.docForm.controls.P_SVALOR.enable();
        this.docForm.controls.P_SVALOR.clearValidators();
        if (Number(e) == 1) { // PROCESO
            this.docForm.controls.P_SVALOR.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(8)]);
        } else if (Number(e) == 2) { // SINIESTRO - MEMO
            this.docForm.controls.P_SVALOR.setValidators([Validators.required, Validators.pattern("^[a-zA-Z0-9/]*$"), Validators.maxLength(12)]);
        } else if (Number(e) == 3) { // DNI - RUC
            this.docForm.controls.P_SVALOR.setValidators([Validators.required, Validators.pattern("^[a-zA-Z0-9]*$"), Validators.minLength(8), Validators.maxLength(11)]);
        } else if (Number(e) == 4) { // NOMBRE - RAZÓN SOCIAL
            this.docForm.controls.P_SVALOR.setValidators([Validators.required, Validators.pattern("^[a-zA-Z0-9 ]*$"), Validators.maxLength(100)]);
        } else {
            this.docForm.controls.P_SVALOR.setValidators([Validators.required]);
        }
        this.docForm.controls.P_SVALOR.updateValueAndValidity();
        this.docForm.controls.P_SVALOR.setValue(null);
    }

    buscarNombreRazonSocial = () => {
        if (this.docForm.get('P_SVALOR').value !== null || this.docForm.get('P_SVALOR').value !== "") {
            this.docForm.controls.P_SVALOR.setValue(this.docForm.get('P_SVALOR').value.toUpperCase());
        }
    }
    buscarNombreRazonSocialD = () => {        
        if (this.detalle.P_SVALOR !== null || this.detalle.P_SVALOR !== "") {
            this.detalle.P_SVALOR = this.detalle.P_SVALOR.toUpperCase();            
        }
    }

    seleccionarTipoDet = () => {
        this.detalle.P_SVALOR = null;
    }

    getParams = () => {
        let $origen = this.InterfaceBankPaymentService.ListarOrigen();
        let $bancos = this.InterfaceBankPaymentService.ListarBancosTesoreria();
        let $estados = this.InterfaceBankPaymentService.ListarEstadosTesoreria(this.estadosTesoreria);
        let $estadosDet = this.InterfaceBankPaymentService.ListarEstadosTesoreria(this.estadosTesoreriaDet);
        let $tipoBusquedas = this.InterfaceBankPaymentService.ListarTipoBusquedaSI(this.tipoBusquedaSI);
        let $buscarPor = this.InterfaceBankPaymentService.ListarBuscarPor();
        return forkJoin([$origen, $bancos, $estados, $estadosDet, $tipoBusquedas, $buscarPor]).subscribe(
            res => {
                this.origen = res[0].Result.combos;
                this.bancos = res[1].Result.combos;
                this.estados = res[2].Result.combos;
                this.estadosDet = res[3].Result.combos;
                this.tipoBusquedas = res[4].Result.combos;
                this.buscarPor = res[5].Result.combos;
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error'); }
        )
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.aprobaciones.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    pageChangedDet = (currentPageDet) => {        
        this.currentPageDet = currentPageDet;
        this.listToShowDet = this.detalles.slice(
            (this.currentPageDet - 1) * this.itemsPerPageDet,
            this.currentPageDet * this.itemsPerPageDet
        );
    }

    ListarAprobaciones(): void {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.flagDoc = false;
            this.submittedDoc = false;
            this.docForm.controls.P_NTIPO.setValue(null);
            this.docForm.controls.P_SVALOR.setValue(null);
            this.filterForm.controls.P_NTIPO.setValue(null);
            this.filterForm.controls.P_SVALOR.setValue(null);
            this.docForm.controls.P_SVALOR.disable();
            this.InterfaceBankPaymentService.ListarAprobaciones(this.filterForm.getRawValue()).subscribe(
                res => {
                    this.currentPage = 1;
                    this.aprobaciones = res.Result.lista;
                    this.totalItems = this.aprobaciones.length;
                    this.listToShow = this.aprobaciones.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.aprobaciones.length == 0) {
                        Swal.fire('Información', 'No se encontraron registros en la búsqueda.', 'warning');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
                }
            )
        }
    }

    // REPORTES
    getReportAproCAB_XLS = () => {        
        if(this.listToShow.length>0){
            this.filterForm.controls.P_NTIPO.setValue(this.docForm.get('P_NTIPO').value);
            this.filterForm.controls.P_SVALOR.setValue(this.docForm.get('P_SVALOR').value);        
            this.InterfaceBankPaymentService.ListarBankTesoreriaCAB_XLS(this.filterForm.getRawValue()).subscribe(
                res => {         
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                        const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                        'RptePagoBancoCAB.xlsx', { type: 'text/xls' });
                        FileSaver.saveAs(file);  
                        }                                    
                    }                
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte excel de aprobación.', 'error'); }   
            )
        }
        else{
            Swal.fire('Información', 'No existe información en la grilla para descargar reporte Excel.', 'error');
        }
    }

    getReportAproDET_XLS = () => {
        if(this.detalles.length > 0){
            this.filtroRptBancoDETXLSX.P_NIDPAYBNK = this.detalle.P_NIDPAYBNK;
            this.filtroRptBancoDETXLSX.P_NSTATUS   = this.detalle.P_NSTATUS;
            this.filtroRptBancoDETXLSX.P_NTIPO     = this.detalle.P_NTIPO;
            this.filtroRptBancoDETXLSX.P_SVALOR    = this.detalle.P_SVALOR;
            this.InterfaceBankPaymentService.ListarBankTesoreriaDET_XLS(this.filtroRptBancoDETXLSX).subscribe(
                res => {         
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                        const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                        'RptePagoBancoDET.xlsx', { type: 'text/xls' });
                        FileSaver.saveAs(file);  
                        }                                    
                    }                
                },
                err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte excel de aprobación.', 'error'); }   
            )
        }
        else{
            Swal.fire('Información', 'No existe información en la grilla para descargar reporte Excel.', 'error');
        }
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
    
    ListarAprobacionesDoc(): void {
        this.submittedDoc = true;
        if (this.docForm.valid) {
            this.flagDoc = true;
            this.FiltroBuscarPorCAB.P_NTIPO = this.docForm.get('P_NTIPO').value;
            this.FiltroBuscarPorCAB.P_SVALOR = this.docForm.get('P_SVALOR').value;
            this.InterfaceBankPaymentService.ListarAprobacionesDoc(this.docForm.getRawValue()).subscribe(
                res => {
                    this.currentPage = 1;
                    this.aprobaciones = res.Result.lista;
                    this.totalItems = this.aprobaciones.length;
                    this.listToShow = this.aprobaciones.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.aprobaciones.length == 0) {
                        Swal.fire('Información', 'No se encontraron registros en la búsqueda.', 'warning');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
                }
            )
        }
    }

    ListarAprobacionesDetalle(item): void {
        this.InterfaceBankPaymentService.ListarAprobacionesDetalle(item).subscribe(
            res => {
                this.currentPageDet = 1;
                this.detalles = res.Result.lista;

                let listTemp = 0;
                for (var i = 0; i < this.detalles.length; i++) {
                    if (this.detalles[i].NSTATUS == 0) {
                        //this.detalles[i].DFEC_OPER = this.diaActual;
                        listTemp = 1;
                    }
                }

                if (listTemp == 1) {
                    this.checkedAll = false;
                } else {
                    this.checkedAll = true;
                }

                this.totalItemsDet = this.detalles.length;
                this.listToShowDet = this.detalles.slice(
                    (this.currentPageDet - 1) * this.itemsPerPageDet,
                    this.currentPageDet * this.itemsPerPageDet
                );
                if (this.detalles.length == 0) {
                    Swal.fire('Información', 'No se encontraron registros en la búsqueda.', 'warning');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
            }
        )
    }

    ListarAprobacionesDetalleDoc(item): void {    
        this.InterfaceBankPaymentService.ListarAprobacionesDetalleDoc(item).subscribe(
            res => {
                this.currentPageDet = 1;
                this.detalles = res.Result.lista;
                
                for (var i = 0; i < this.detalles.length; i++) {
                    if (this.detalles[i].NSTATUS == 0) {
                        //this.detalles[i].DFEC_OPER = this.diaActual;
                    }
                }

                this.totalItemsDet = this.detalles.length;
                this.listToShowDet = this.detalles.slice(
                    (this.currentPageDet - 1) * this.itemsPerPageDet,
                    this.currentPageDet * this.itemsPerPageDet
                );
                if (this.detalles.length == 0) {
                    Swal.fire('Información', 'No se encontraron registros en la búsqueda.', 'warning');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
            }
        )
    }

    getFormattedDate(dateString: string): string {
        const parts = dateString.split(/[\s/:\-]+/);
        const year = parts[2];
        const month = parts[1];
        const day = parts[0];
        return `${year}-${month}-${day}`;
    }

    addHours(dateTime: Date, hours: number): Date {
        return new Date(dateTime.getTime() + hours * 60 * 60 * 1000);
    }

    ListarDetalleObservacion(item): void {
        this.InterfaceBankPaymentService.ListarDetalleObservacion(item).subscribe(
            res => {
                this.observaciones = res.Result.lista;
                for (var i = 0; i < this.observaciones.length; i++) {
                    let formattedDate = this.getFormattedDate(this.observaciones[i].DFEC_OBSERV);
                    let newDateTime = this.addHours(new Date(formattedDate), 5);
                    this.observaciones[i].MIN_DATE = newDateTime;
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
            }
        )
    }

    AgregarDetalleObservacion(item): void {
        this.InterfaceBankPaymentService.AgregarDetalleObservacion(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    if (this.agregarObservacion.P_NSTATUS == 2) {
                        this.saveObsBool = true;
                        Swal.fire('Información', 'Se registró la reapertura correctamente.', 'success');
                    } else {
                        this.saveObsBool = false;                        
                        Swal.fire('Información', 'Se registró la observación correctamente.', 'success');
                    }
                    this.agregarObservacion.P_SDES_OBSERV = "";
                    this.ListarDetalleObservacion(this.observacion);
                    this.ListarAprobacionesDetalle(this.detalle);
                    this.ListarAprobaciones();
                } else {
                    if (this.agregarObservacion.P_NSTATUS == 2) {
                        Swal.fire('Información', 'Ha ocurrido un error al registrar la reapertura.', 'error');
                    } else {
                        Swal.fire('Información', 'Ha ocurrido un error al registrar la observación.', 'error');
                    }
                }
            },
            err => {
                if (this.agregarObservacion.P_NSTATUS == 2) {
                    Swal.fire('Información', 'Ha ocurrido un error al registrar la reapertura.', 'error');
                } else {
                    Swal.fire('Información', 'Ha ocurrido un error al registrar la observación.', 'error');
                }
            }
        )
    }

    seleccionarAprob = (content: any, item) => {
        if (item.NSTATUS == 1 || item.NSTATUS == 3) {
            this.originGlb = item.NNUMORI;
            this.checked = false;
            this.checkedProcSend[0] = 0;
            // LLENA LA CABECERA
            this.detalle.PROCESO = item.NIDPROCESS;
            this.detalle.ORIGEN = item.SORIGEN_DES;
            this.detalle.BANCO = item.SBANK_ORI_DES;
            this.detalle.MONEDA = item.SCURRENCY_DES;
            this.detalle.PROC_BANCO = null;
            // INVOCA EL HORARIO DE INTERFAZ
            this.detalle.P_NNUMORI = item.NNUMORI;
            this.detalle.P_NCODGRU = item.NCODGRU;
            this.detalle.P_NBRANCH = item.NBRANCH;
            // LISTA EL DETALLE
            this.detalle.P_NIDPAYBNK = item.NIDPAYBNK;
            this.detalle.P_NSTATUS = null;
            if (this.flagDoc == false || this.FiltroBuscarPorCAB.P_NTIPO == 1) {
                this.detalle.P_NTIPO = null;
                this.detalle.P_SVALOR = null;
                this.ListarAprobacionesDetalle(this.detalle);
            } else {
                this.detalle.P_NTIPO = this.FiltroBuscarPorCAB.P_NTIPO;
                this.detalle.P_SVALOR = this.FiltroBuscarPorCAB.P_SVALOR;
                this.ListarAprobacionesDetalleDoc(this.detalle);
            }
            // ABRE EL MODAL
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
        }
    }

    seleccionarDet = (content: any, item) => {
        this.checkedObsSend[0] = 0;
        this.saveObsBool = false;
        this.observacion.P_NIDPAYBNKD = item.NIDPAYBNKD;
        this.ListarDetalleObservacion(this.observacion);
        this.agregarObservacion.P_NIDPAYBNKD = item.NIDPAYBNKD;
        this.agregarObservacion.P_NIDPAYBNK = this.detalle.P_NIDPAYBNK;
        this.agregarObservacion.P_NIDPROCESS = this.detalle.PROCESO;
        this.agregarObservacion.P_SDES_OBSERV = null;
        this.agregarObservacion.P_NSTATUS = item.NSTATUS;
        this.agregarObservacion.P_CID_RE_OPEN = item.NSTATUS == 2 ? 'R' : '';
        this.agregarObservacion.P_DFEC_APROBR = item.NSTATUS == 2 ? item.DFEC_APROB : '';
        this.agregarObservacion.P_CIDOPERBNKR = item.NSTATUS == 2 ? item.CIDOPERBNK : '';
        this.agregarObservacion.P_CUSERCODE = JSON.parse(localStorage.getItem('currentUser')).username;
        // ABRE EL MODAL
        this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
    }

    seleccionarCons = (content: any, item) => {
        if (item.OBSERVACION) {
            this.observacion.P_NIDPAYBNKD = item.NIDPAYBNKD;
            this.ListarDetalleObservacion(this.observacion);
            // ABRE EL MODAL
            this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
        }
    }

    selectEstado = () => {
        this.detalle.P_NTIPO = null;
        this.detalle.P_SVALOR = null;
        this.ListarAprobacionesDetalle(this.detalle);
    }

    setNumProc = () => {
        if (this.detalle.PROC_BANCO == null || this.detalle.PROC_BANCO == "") {
            Swal.fire('Información', 'Debe ingresar el N° de operación del banco.', 'warning');
        } else {            
                for (var i = 0; i < this.detalles.length; i++) {
                    if (this.detalles[i].NSTATUS == 0) {
                        this.detalles[i].CIDOPERBNK = this.detalle.PROC_BANCO;
                        this.cuentaProcBnk = this.cuentaProcBnk + 1;
                    }            
                }
                if (this.cuentaProcBnk == 0){
                    Swal.fire('Información', 'Debe existir al menos un registro con estado AP. SIN OPERACIÓN.', 'warning');
                    this.detalle.PROC_BANCO = null;
                }
        }
    }

    newObs = () => {
        let action = null;
        let origin = null;

        if (this.agregarObservacion.P_NSTATUS == 2) {
            action = "reapertura";
        } else {
            action = "observación";
        }

        if (this.originGlb == 1) {
            origin = "siniestros";
        } else {
            origin = "rentas";
        }

        if (this.agregarObservacion.P_SDES_OBSERV == null || this.agregarObservacion.P_SDES_OBSERV == "") {
            Swal.fire('Información', 'Debe ingresar el detalle de la ' + action + '.', 'warning');
        } else {
            Swal.fire(
                {
                    title: 'Se realizará el guardado y envío de la ' + action + ' al área de ' + origin + '. Se procederá a eliminar el asiento de la Orden de Pago.',
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
                        this.AgregarDetalleObservacion(this.agregarObservacion);                        
                    }
                }
            )           
        }
    }
    

    searchDetalleDoc = () => { 
        //if (this.detalle.P_NTIPO == null && this.detalle.P_SVALOR == null) {
        //    Swal.fire('Información', 'Seleccione un tipo de búsqueda.', 'warning');
        //    return;
        //}
        if (this.detalle.P_NTIPO != null && (this.detalle.P_SVALOR == null || this.detalle.P_SVALOR == "")) {
            if (this.detalle.P_NTIPO == 3) {
                Swal.fire('Información', 'Ingrese el documento de identidad.', 'warning');
                return;
            }
            if (this.detalle.P_NTIPO == 4) {
                Swal.fire('Información', 'Ingrese el Nombre ó Razon Social.', 'warning');
                return;
            }
        }
        this.detalle.P_NSTATUS = null;
        this.ListarAprobacionesDetalleDoc(this.detalle);
    }

    checkAllProc = () => {
        for (var i = 0; i < this.detalles.length; i++) {
            if (this.detalles[i].NSTATUS == 0) {
                this.detalles[i].IS_SELECTED = this.checked;
            }
        }
        this.getCheckedProcList();
    }

    checkProc = () => {
        // this.detalles = this.detalles.filter(item => item.NSTATUS == 0);
        let detallesTemp = this.detalles.filter(item => item.NSTATUS == 0);
        this.checked = detallesTemp.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedProcList();
    }

    getCheckedProcList = () => {
        this.checkedProc = [];
        this.checkedProcSend = [];
        for (var i = 0; i < this.detalles.length; i++) {
            if (this.detalles[i].IS_SELECTED) {
                this.checkedProc.push(this.detalles[i]);
            }
        }
        this.checkedProcSend.push(this.checkedProc);
    }

    getCheckedObsList = (flag, item) => {        
        if (flag == 1) {
            for (var i = 0; i < this.observaciones.length; i++) {
                if (this.observaciones[i].NIDPAYBNKO == item.NIDPAYBNKO) {
                    if (item.IS_SELECTED == true) {
                        this.observaciones[i].DFEC_APROB = this.diaActual;
                    } else {
                        this.observaciones[i].DFEC_APROB = null;
                    }
                }
            }
        }
        this.checkedObs = [];
        this.checkedObsSend = [];
        for (var i = 0; i < this.observaciones.length; i++) {
            if (this.observaciones[i].IS_SELECTED == true && this.observaciones[i].NSTA_RESULT == 0) {
                this.checkedObs.push(this.observaciones[i]);
            }
        }
        this.checkedObsSend.push(this.checkedObs);
    }

    AprobarProcesoList = (item) => {
        this.InterfaceBankPaymentService.AprobarProcesoList(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'success');
                    this.ListarAprobacionesDetalle(this.detalle);
                    this.ListarAprobaciones();
                } else {
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al aprobar los procesos.', 'error');
            }
        )
    }

    aprobar = () => {        
        if (this.checked) {
            //if (this.detalle.PROC_BANCO == null || this.detalle.PROC_BANCO == "") {
            //    Swal.fire('Información', 'Debe ingresar el N° de operación del banco.', 'warning');
            //} else {
                for (var i = 0; i < this.detalles.length; i++) {
                    if ((this.detalles[i].CIDOPERBNK == null || this.detalles[i].CIDOPERBNK == "") && this.detalles[i].NSTATUS !== 3) {
                        Swal.fire('Información', 'Todos los registros deben tener N° de operación del banco.', 'warning');
                        return;
                    }
                    if ((this.detalles[i].DFEC_OPER == null || this.detalles[i].DFEC_OPER == "") && this.detalles[i].NSTATUS !== 3) {
                        Swal.fire('Información', 'Todos los registros deben tener fecha de operación.', 'warning');
                        return;
                    }
                }
                Swal.fire(
                    {
                        title: '¿Está seguro de aprobar los registros seleccionados?',
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
                            this.aprobadosArray = {};
                            this.aprobadosArray.APROBADOS = [];
                            for (var i = 0; i < this.checkedProcSend[0].length; i++) {
                                var item: any = {};
                                item.P_NIDPAYBNK = this.detalle.P_NIDPAYBNK;
                                item.P_NIDPAYBNKD = this.checkedProcSend[0][i].NIDPAYBNKD;
                                item.P_CIDOPERBNK = this.checkedProcSend[0][i].CIDOPERBNK.trim();
                                item.P_DFEC_OPER = this.checkedProcSend[0][i].DFEC_OPER;
                                item.P_CUSERCODE = JSON.parse(localStorage.getItem('currentUser')).username;
                                item.P_NCOMMIT = 1;
                                this.aprobadosArray.APROBADOS.push(item);
                            }
                            this.AprobarProcesoList(this.aprobadosArray);
                            this.checkedProcSend[0] = 0;
                            this.checked = false;
                        }
                        // else if (result.dismiss === Swal.DismissReason.cancel) {
                        //     this.modalService.dismissAll();
                        // }
                    }
                )
           // }
        } else {
            Swal.fire('Información', 'Debe seleccionar todos los registros.', 'warning');
        }
    }

    ResolverObservacionList = (item) => {
        this.InterfaceBankPaymentService.ResolverObservacionList(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'success');
                    this.ListarDetalleObservacion(this.observacion);
                    this.ListarAprobacionesDetalle(this.detalle);
                    this.ListarAprobaciones();
                    this.checkedObsSend[0] = 0;
                } else {
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al resolver las observaciones.', 'error');
            }
        )
    }

    getCurrentHour(): string {
        const date = new Date();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        const hourString = hour < 10 ? '0' + hour : hour.toString();
        const minuteString = minutes < 10 ? '0' + minutes : minutes.toString();
        return hourString + ':' + minuteString;
    }

    compareTimes(time1: string, time2: string): number {
        const [hour1, minute1] = time1.split(':').map(Number);
        const [hour2, minute2] = time2.split(':').map(Number);
        if (hour1 < hour2) {
            return -1;
        } else if (hour1 > hour2) {
            return 1;
        } else {
            if (minute1 < minute2) {
                return -1;
            } else if (minute1 > minute2) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    resolver = () => {
        if (this.checkedObsSend[0].length > 0) {
            for (var i = 0; i < this.checkedObsSend[0].length; i++) {
                if (this.checkedObsSend[0][i].DFEC_APROB == null || this.checkedObsSend[0][i].DFEC_APROB == "") {
                    Swal.fire('Información', 'Todos los registros deben tener fecha de aprobación.', 'warning');
                    return;
                }
            }
            this.InterfaceBankPaymentService.GetHorarioInterfaz(this.detalle).subscribe(
                res => {
                    if (res.Result.P_NCODE == 0) {
                        let intHour = res.Result.P_NHORARIO;
                        let curHour = this.getCurrentHour();
                        let dif = this.compareTimes(curHour, intHour);
                        Swal.fire(
                            {
                                title: dif >= 0 ? 'Está fuera del horario programado de la interfaz de Órdenes de Pago ¿Está seguro que desea continuar?' : '¿Está seguro de resolver los registros seleccionados?',
                                text: 'Esta acción es irreversible.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Aceptar',
                                allowOutsideClick: false,
                                cancelButtonText: 'Cancelar'
                            }
                        ).then(
                            (result) => {
                                if (result.value) {                        
                                    this.observadosArray = {};
                                    this.observadosArray.OBSERVACIONES = [];
                                    for (var i = 0; i < this.checkedObsSend[0].length; i++) {
                                        var item: any = {};
                                        item.P_NIDPAYBNKO = this.checkedObsSend[0][i].NIDPAYBNKO;
                                        item.P_CUSERCODE = JSON.parse(localStorage.getItem('currentUser')).username;
                                        this.observadosArray.OBSERVACIONES.push(item);
                                    }
                                    this.ResolverObservacionList(this.observadosArray);
                                };
                            }
                        )
                    } else {
                        Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                    }
                },
                err => {
                    Swal.fire('Información', 'Ha ocurrido un error al obtener el horario de interfaz.', 'error');
                }
            )
        } else {
            Swal.fire('Información', 'Debe seleccionar al menos un registro.', 'warning');
        }
    }
}