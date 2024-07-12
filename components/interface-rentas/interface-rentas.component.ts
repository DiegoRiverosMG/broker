import { Component, OnInit } from '@angular/core';
import { InterfaceMonitoringCBCOService } from '../../../backoffice/services/interface-monitoring/interface-monitoring-cbco.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { forkJoin } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-interface-rentas',
    templateUrl: './interface-rentas.component.html',
    styleUrls: ['./interface-rentas.component.scss']
})

export class InterfaceRentasComponent implements OnInit {

    seacsaDirecto: boolean = true;
    seacsaAFP: boolean = false;
    ahorroDirecto: boolean = false;

    pagos: any = [];
    detalles: any = [];
    origen: any = [];
    pagoSiniestro: any = [];

    checked: boolean = false;
    checkedProc: any = {};
    checkedProcSend: any[] = [];

    pago = {
        P_NNUMORI: 0,
        P_NTYPEOP: 0,
        //P_SPOLIZA: '',
        P_DFECINI: new Date(),
        P_DFECFIN: new Date()
    }

    listToShow: any = [];
    currentPage = 1;
    maxSize = 10;
    itemsPerPage = 15;
    totalItems = 0;

    listToShowDet: any = [];
    currentPageDet = 1;
    maxSizeDet = 10;
    itemsPerPageDet = 15;
    totalItemsDet = 0;

    diaActual = moment(new Date()).toDate();
    isLoading: boolean = false;

    bsConfig: Partial<BsDatepickerConfig>;
    
    constructor(
        private modalService: NgbModal,
        private InterfaceMonitoringCBCOService: InterfaceMonitoringCBCOService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false,
            }
        );
    }

    ngOnInit(): void {
        this.initDates();
        this.getParams();
    }

    initDates = () => {
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.pago.P_DFECINI = this.diaActual;
        this.pago.P_DFECFIN = this.diaActual;
    }

    getParams = () => {
        let $origen = this.InterfaceMonitoringCBCOService.ListarOrigenRentas();
        let $pagoSiniestro = this.InterfaceMonitoringCBCOService.ListarPagoSiniestro({ P_NNUMORI: 0 });
         return forkJoin([$origen, $pagoSiniestro]).subscribe(
            res => {
                this.origen = res[0].Result.P_LIST;
                this.pagoSiniestro = res[1].Result.P_LIST;
            },
            err => { 
                swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
            }
        )
    }

    changeOrigin = (e) => {
        this.ListarPagoSiniestro(e);
        this.pago.P_NTYPEOP = 0;
    }

    ListarPagoSiniestro = (e) => {
        this.InterfaceMonitoringCBCOService.ListarPagoSiniestro({ P_NNUMORI: e }).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.pagoSiniestro = res.Result.P_LIST;
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                swal.fire('Información', 'Ha ocurrido un error al obtener los pagos de siniestro.', 'error');
            }
        )
    }

    search = (i) => {
        this.checked = false;
        if (new Date(this.pago.P_DFECINI) > new Date(this.pago.P_DFECFIN)) {
            swal.fire('Información', 'La fecha de inicio no puede ser mayor a la fecha de fin.', 'warning');
            return;
        }
        if (this.pago.P_NNUMORI == 0) {
            swal.fire('Información', 'Debe seleccionar el origen.', 'warning');
            return;
        } else {
            if (this.pago.P_NTYPEOP == 0) {
                swal.fire('Información', 'Debe seleccionar el pago siniestro.', 'warning');
                return;
            }
        }
        if (this.pago.P_NNUMORI == 2) {
            if (this.pago.P_NTYPEOP == 7) {
                this.seacsaDirecto = false;
                this.seacsaAFP = true;
                this.ahorroDirecto = false;
            } else {
                this.seacsaDirecto = true;
                this.seacsaAFP = false;
                this.ahorroDirecto = false;
            }
        } else {
            this.seacsaDirecto = false;
            this.seacsaAFP = false;
            this.ahorroDirecto = true;
        }
        this.listarPagos(i);
    }

    open = (content, item) => {
        let temp = {
            P_NNUMORI: item.NNUMORI,
            P_NTYPEOP: item.NTYPEPAGO,
            P_SCOD_AFP: item.SCOD_AFP,
            P_SCOD_BANCO: item.SCOD_BANCO,
            P_SCOD_VIAPAGO: item.SCOD_VIAPAGO,
            P_SCOD_MONEDA: item.SCOD_MONEDA,
            P_DFECINI: this.pago.P_DFECINI,
            P_DFECFIN: this.pago.P_DFECFIN,
            P_SUSR_APROB: JSON.parse(localStorage.getItem('currentUser')).username,
            P_NOPTION: 0
        }
        this.listarDetalle(temp);
        this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
    }

    listarPagos = (i) => {
        this.InterfaceMonitoringCBCOService.ListarAprobacionesRentasRes(this.pago).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.currentPage = 1;
                    this.pagos = res.Result.P_LIST;
                    this.totalItems = this.pagos.length;
                    this.listToShow = this.pagos.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.pagos.length == 0 && i == 1) {
                        swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al obtener los pagos de pensión.', 'error'); }
        )
    }

    listarDetalle = (item) => {
        this.InterfaceMonitoringCBCOService.ListarAprobacionesRentasDet(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.currentPageDet = 1;
                    this.detalles = res.Result.P_LIST;
                    this.totalItemsDet = this.detalles.length;
                    this.listToShowDet = this.detalles.slice(
                        (this.currentPageDet - 1) * this.itemsPerPageDet,
                        this.currentPageDet * this.itemsPerPageDet
                    );
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al obtener el detalle de pago de pensión.', 'error'); }
        )
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.pagos.slice(
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

    checkAllProc = () => {
        for (var i = 0; i < this.pagos.length; i++) {
            this.pagos[i].IS_SELECTED = this.checked;
        }
        this.getCheckedProcList();
    }

    checkProc = () => {
        this.checked = this.pagos.every(
            function (item: any) {
                return item.IS_SELECTED == true;
            }
        )
        this.getCheckedProcList();
    }

    getCheckedProcList = () => {
        this.checkedProc = [];
        this.checkedProcSend = [];
        for (var i = 0; i < this.pagos.length; i++) {
            if (this.pagos[i].IS_SELECTED) {
                this.checkedProc.push(this.pagos[i]);
            }
        }
        this.checkedProcSend.push(this.checkedProc);
    }

    AprobarPagos = (item) => {
        this.InterfaceMonitoringCBCOService.AprobarPagos(item).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    swal.fire('Información', 'Se aprobaron los pagos exitosamente.', 'success');
                    this.checkedProcSend[0] = 0;
                    this.checked = false;
                    this.search(2);
                } else {
                    swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                swal.fire('Información', 'Ha ocurrido un error al aprobar los pagos de pensión.', 'error');
            }
        )
    }

    limpiar = () => {
        this.checked = false;
        this.pago.P_NNUMORI = 0;
        this.pago.P_NTYPEOP = 0;
        //this.pago.P_SPOLIZA = '';
        this.pago.P_DFECINI = this.diaActual;
        this.pago.P_DFECFIN = this.diaActual;
        this.pagos = [];
    }

    aprobar = () => {
        let temp = this.pagos.filter(item => item.IS_SELECTED == true);
        if (temp.length > 0) {
            swal.fire(
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
                        let aprobadosArray = { P_LIST: [] };
                        for (var i = 0; i < this.checkedProcSend[0].length; i++) {
                            // var item: any = {};
                            // item.P_NIDCHEQUE = this.checkedProcSend[0][i].NIDCHEQUE;
                            // item.P_SUSR_APROB = JSON.parse(localStorage.getItem('currentUser')).username;
                            let temp = {
                                P_NNUMORI: this.checkedProcSend[0][i].NNUMORI,
                                P_NTYPEOP: this.checkedProcSend[0][i].NTYPEPAGO,
                                P_SCOD_AFP: this.checkedProcSend[0][i].SCOD_AFP,
                                P_SCOD_BANCO: this.checkedProcSend[0][i].SCOD_BANCO,
                                P_SCOD_VIAPAGO: this.checkedProcSend[0][i].SCOD_VIAPAGO,
                                P_SCOD_MONEDA: this.checkedProcSend[0][i].SCOD_MONEDA,
                                P_DFECINI: this.pago.P_DFECINI,
                                P_DFECFIN: this.pago.P_DFECFIN,
                                P_SUSR_APROB: JSON.parse(localStorage.getItem('currentUser')).username,
                                P_NOPTION: 1
                            }
                            aprobadosArray.P_LIST.push(temp);
                        }
                        this.AprobarPagos(aprobadosArray);
                        // this.checkedProcSend[0] = 0;
                        // this.checked = false;
                    }
                }
            )
        } else {
            swal.fire('Información', 'Debe seleccionar al menos un registro.', 'warning');
        }
    }

    downloadRes = () => {
        if (this.pagos.length == 0) {
            swal.fire('Información', 'Debe realizar una búsqueda para exportar.', 'warning');
            return;
        }
        this.GetDataReportRentasRes();
    }

    downloadDet = (item) => {
        let temp = {
            P_NNUMORI: item.NNUMORI,
            P_NTYPEOP: item.NTYPEPAGO,
            P_SCOD_AFP: item.SCOD_AFP,
            P_SCOD_BANCO: item.SCOD_BANCO,
            P_SCOD_VIAPAGO: item.SCOD_VIAPAGO,
            P_SCOD_MONEDA: item.SCOD_MONEDA,
            P_DFECINI: this.pago.P_DFECINI,
            P_DFECFIN: this.pago.P_DFECFIN,
            P_SUSR_APROB: JSON.parse(localStorage.getItem('currentUser')).username
        }
        this.GetDataReportRentasDet(temp);
    }

    GetDataReportRentasRes = () => {
        this.InterfaceMonitoringCBCOService.GetDataReportRentasRes(this.pago).subscribe(                  
            res => {
                this.isLoading = false;
                if (res.response == 0) {
                    if (res.Data != null) {
                        const file = new File(
                            [this.obtenerBlobFromBase64(res.Data, '')],
                            'Reporte_Rentas_Resumen.xlsx',
                            { type: 'text/xls' }
                        );
                        FileSaver.saveAs(file);
                    }                                    
                }                
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
            }            
        )
    }

    GetDataReportRentasDet = (item) => {
        this.InterfaceMonitoringCBCOService.GetDataReportRentasDet(item).subscribe(                  
            res => {
                this.isLoading = false;
                if (res.response == 0) {
                    if (res.Data != null) {
                        const file = new File(
                            [this.obtenerBlobFromBase64(res.Data, '')],
                            'Reporte_Rentas_Detalle.xlsx',
                            { type: 'text/xls' }
                        );
                        FileSaver.saveAs(file);
                    }                                    
                }                
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
            }            
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
}