import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';

import { QuotationService } from '../../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../../services/policy/policyemit.service';

import { CommonMethods } from './../../../../common-methods';

import { StorageService } from '../../core/services/storage.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
import { AccPersonalesService } from '../../acc-personales.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AppConfig } from './../../../../../../../app.config';
import swal from 'sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { IVisaConfig } from '@shared/interfaces/visa-config.interface';
import { UtilsService } from '@shared/services/utils/utils.service';
import { DecimalPipe, formatDate } from '@angular/common';
import DecimalFormat from 'decimal-format';
import { PolicyDataType } from '../../../../../types/PolicyDataType';
import { stringify } from '@angular/compiler/src/util';
@Component({
    selector: 'panel-info-pago',
    templateUrl: './panel-info-pago.component.html',
    styleUrls: ['./panel-info-pago.component.css'],
    providers: [NgbModalConfig, NgbModal]
})
export class PanelInfoPagoComponent implements OnChanges {

    @Input() abrir: boolean;
    @Output() abrirChange: EventEmitter<boolean> = new EventEmitter();

    @Output() confirmar: EventEmitter<boolean> = new EventEmitter();

    @Input() cotizacion: any;

    @Input() isLoading: boolean;
    @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();

    formatsDateTest: string[] = [
        'dd/MM/yyyy'
    ];

    dateNow: Date = new Date();

    tipoPago: any = null;
    cerrarModal: boolean;
    creditosList: any = [];

    CONSTANTS: any = AccPersonalesConstants;
    modalRef: BsModalRef;
    lblPagos: string = '';
    lblPagos2: string = '';
    totalPagado: any;
    @ViewChild('modalEfectivo', { static: false }) contentEfectivo;
    @ViewChild('modalDirecto', { static: false }) contentDirecto;
    @ViewChild('visaPay', { static: false, read: ElementRef })
    visaPay: ElementRef;
    @ViewChild('modalInfoCredito', { static: false }) contentCredito;
    policyNumber: number;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    // epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    nbranch: any = '';
    policyData = JSON.parse(localStorage.getItem('policydata'));
    P_SCLIENT = JSON.parse(localStorage.getItem('currentUser'))['sclient'];
    P_ID = JSON.parse(localStorage.getItem('currentUser'))['id'];
    notList: any = [];
    pago: number = 0;
    arrayPrimero: any = [];
    arrayNC: any[] = [];
    files: File[] = [];
    flagDisabledBotonNC: boolean = false;
    flagBotonNC: boolean = false;
    flagPAGADONC: boolean = false;
    files_adjuntos: string[] = [];
    flagKushki: boolean = false;

    constructor(
        private storageService: StorageService,
        private accPersonalesService: AccPersonalesService,
        private route: ActivatedRoute,
        private pagoInformationService: ClientInformationService,
        private router: Router,
        private policyemit: PolicyemitService,
        private quotationService: QuotationService,
        private readonly appConfig: AppConfig,
        private readonly modalService: BsModalService,
        private readonly utilsService: UtilsService,
        config: NgbModalConfig,
        private modalService1: NgbModal,
        private modalService2: NgbModal
    ) { }

    async ngOnChanges(changes) {
        if (changes.abrir && changes.abrir.currentValue) {
            if (this.isLoading) {
                this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
                this.obtenerFormasPago();
                this.lblPagos = CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2);
                let moneda = !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1;
                console.log(this.cotizacion.poliza.moneda)
                await this.getNotaCreditoList(this.cotizacion.contratante.cliente360.P_SCLIENT, 0, 0, moneda, this.lblPagos); //AVS - App Nota de Credito 23/01/2023
            }

            console.log('ngOnChanges(changes)');
            console.log('this.cotizacion');
            console.log(this.cotizacion);
            console.log(this.cotizacion.poliza.pagoElegido);
            
        }
    }

    visaClick() {
        this.appConfig.AddEventAnalityc();
    }

    async pagoElegido() {
        let pagoEfectivo: any = {};
        if (this.cotizacion.poliza.pagoElegido === 'efectivo') {
            pagoEfectivo = {
                tipoSolicitud: 1, // this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
                monto: CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2),
                correo: this.cotizacion.contratante.email,
                conceptoPago: CommonMethods.conceptProduct(this.codProducto),
                nombres: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                    this.cotizacion.contratante.nombres : this.cotizacion.contratante.razonSocial  == undefined ? this.cotizacion.contratante.NOMBRE_RAZON : this.cotizacion.contratante.razonSocial,
                Apellidos: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                    this.cotizacion.contratante.apellidoPaterno + ' ' + this.cotizacion.contratante.apellidoMaterno : '',
                ubigeoINEI: this.cotizacion.contratante.cliente360.EListAddresClient != null &&
                    this.cotizacion.contratante.cliente360.EListAddresClient.length > 0 ?
                    await this.ubigeoInei(this.cotizacion.contratante.cliente360.EListAddresClient[0].P_NMUNICIPALITY) :
                    '150132',
                tipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
                numeroDocumento: this.cotizacion.contratante.numDocumento,
                telefono: this.cotizacion.contratante.cliente360.EListPhoneClient != null &&
                    this.cotizacion.contratante.cliente360.EListPhoneClient.length > 0 ?
                    this.cotizacion.contratante.cliente360.EListPhoneClient[0].P_SPHONE : '',
                ramo: this.nbranch,
                producto: this.cotizacion.poliza.producto.COD_PRODUCT,
                ExternalId: this.cotizacion.trama.NIDPROC,
                quotationNumber: this.cotizacion.tipoTransaccion == 0
                    ? this.cotizacion.prepago.P_NID_COTIZACION
                    : this.cotizacion.numeroCotizacion,
                codigoCanal: this.cotizacion.brokers[0].COD_CANAL,
                codUser: this.storageService.userId,
                Moneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT == 1 ? 'PEN' : 'USD' : 'PEN',
            };
        }
        let files: File[] = this.cotizacion.files;

        if (files.length > 0) {
            await this.filesAdjuntos(files);
        }
        const policyData: any = {
            visaData: this.cotizacion.tipoPago.ObjVisa,
            niubizData: this.cotizacion.tipoPago.objNiubiz,
            savedPolicyList: this.cotizacion.tipoTransaccion == 0 || this.cotizacion.tipoTransaccion == 1 || (this.cotizacion.tipoTransaccion == 14 && this.codProducto == 3) || this.codProducto == 2 ?
                await this.objetoEmision() : await this.objetoJob(),
            contractingdata: this.cotizacion.contratante.cliente360,
            actualizarCotizacion: this.cotizacion.actualizarCotizacion,
            emisionMapfre: null,
            adjuntos: this.files_adjuntos || [],
            urlContinuar: this.cotizacion.tipoPago.urlContinuar,
            urlVolver: this.cotizacion.tipoPago.urlVolver,
            transaccion: this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
            dataCIP: pagoEfectivo,
            flagTramite: this.cotizacion.flagTramite,
            monedaId: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1
        };

        localStorage.setItem('policydata', JSON.stringify(policyData));
    }

    async pagoElegidoNC() { //AVS - App Nota de Credito 23/01/2023

        let pagoEfectivo: any = {};
        if (this.cotizacion.poliza.pagoElegido === 'efectivo') {
            pagoEfectivo = {
                tipoSolicitud: 1, // this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
                monto: CommonMethods.formatValor(this.lblPagos2, 2),
                correo: this.cotizacion.contratante.email,
                conceptoPago: CommonMethods.conceptProduct(this.codProducto),
                nombres: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                    this.cotizacion.contratante.nombres : this.cotizacion.contratante.razonSocial,
                Apellidos: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                    this.cotizacion.contratante.apellidoPaterno + ' ' + this.cotizacion.contratante.apellidoMaterno : '',
                ubigeoINEI: this.cotizacion.contratante.cliente360.EListAddresClient != null &&
                    this.cotizacion.contratante.cliente360.EListAddresClient.length > 0 ?
                    await this.ubigeoInei(this.cotizacion.contratante.cliente360.EListAddresClient[0].P_NMUNICIPALITY) :
                    '150132',
                tipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
                numeroDocumento: this.cotizacion.contratante.numDocumento,
                telefono: this.cotizacion.contratante.cliente360.EListPhoneClient != null &&
                    this.cotizacion.contratante.cliente360.EListPhoneClient.length > 0 ?
                    this.cotizacion.contratante.cliente360.EListPhoneClient[0].P_SPHONE : '',
                ramo: this.nbranch,
                producto: this.cotizacion.poliza.producto.COD_PRODUCT,
                ExternalId: this.cotizacion.trama.NIDPROC,
                quotationNumber: this.cotizacion.tipoTransaccion == 0
                    ? this.cotizacion.prepago.P_NID_COTIZACION
                    : this.cotizacion.numeroCotizacion,
                codigoCanal: this.cotizacion.brokers[0].COD_CANAL,
                codUser: this.storageService.userId,
                Moneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT == 1 ? 'PEN' : 'USD' : 'PEN',
            };
        }

        const policyData: any = {
            visaData: this.cotizacion.tipoPago.ObjVisa,
            savedPolicyList: this.cotizacion.tipoTransaccion == 0 || this.cotizacion.tipoTransaccion == 1 ?
                await this.objetoEmision() : await this.objetoJob(),
            contractingdata: this.cotizacion.contratante.cliente360,
            actualizarCotizacion: this.cotizacion.actualizarCotizacion,
            emisionMapfre: null,
            adjuntos: this.cotizacion.files || [],
            urlContinuar: this.cotizacion.tipoPago.urlContinuar,
            urlVolver: this.cotizacion.tipoPago.urlVolver,
            transaccion: this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
            dataCIP: pagoEfectivo,
            flagTramite: this.cotizacion.flagTramite,
        };

        console.log(policyData);

        localStorage.setItem('policydata', JSON.stringify(policyData));

        await this.NCPayList(); //AVS - App Nota de Credito 23/01/2023      
    }

    async pagoEfectivo() {
        this.cotizacion.cerrarModal = true;
        this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.EFECTIVO;
        await this.pagoElegido();

        swal.fire({
            title: 'Información',
            text: '¿Deseas generar el código CIP?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        })
            .then((result) => {
                if (result.value) {
                    this.confirmar.emit();
                } else {
                    this.cotizacion.cerrarModal = false;
                    this.cotizacion.poliza.pagoElegido = 'default';
                    this.abrir = true;
                }
            });
    }

    async pagoEfectivoNC() { //AVS - App Nota de Credito 23/01/2023
        this.cotizacion.cerrarModal = true;
        this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.EFECTIVO;
        await this.pagoElegidoNC();

        swal.fire({
            title: 'Información',
            text: '¿Deseas generar el código CIP?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        })
            .then(async (result) => {
                if (result.value) {
                    this.confirmar.emit();
                } else {
                    this.cotizacion.cerrarModal = false;
                    this.cotizacion.poliza.pagoElegido = 'default';
                    this.abrir = true;
                }
            });
    }

    async pagoVoucher() {
        this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.VOUCHER;
        await this.pagoElegido();
    }

    async pagoDirecto() {
        this.cotizacion.cerrarModal = true;
        this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.DIRECTO;
        await this.pagoElegido();

        swal.fire({
            title: 'Información',
            text: '¿Deseas generar la transacción de forma directa?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        })
            .then((result) => {
                if (result.value) {
                    this.cotizacion.cerrarModal = true;
                    this.confirmar.emit();
                } else {
                    this.cotizacion.cerrarModal = false;
                    this.cotizacion.poliza.pagoElegido = 'default';
                    this.abrir = true;
                }
            });
    }

    async pagoDirectoNC() { //AVS - App Nota de Credito 23/01/2023
        this.cotizacion.cerrarModal = true;
        this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.DIRECTO;
        await this.pagoElegidoNC();

        if (this.notList.length == this.arrayNC.length) {
            swal.fire({
                title: 'Información',
                text: '¿Deseas generar la transacción con la nota de crédito?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Generar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            })
                .then((result) => {
                    if (result.value) {
                        this.cotizacion.cerrarModal = true;
                        this.confirmar.emit();
                    } else {
                        localStorage.removeItem('creditdata'); // AVS PRY NC
                        localStorage.removeItem('botonNC'); // AVS PRY NC
                        for (let i = 0; i < this.notList.length; i++) {
                            this.notList.splice(i, 1);
                            i--;
                        }
                        for (let i = 0; i < this.arrayNC.length; i++) {
                            this.arrayNC.splice(i, 1);
                            i--;
                        }
                        if (this.notList.length == 0) {
                            this.flagDisabledBotonNC = true;
                            this.lblPagos2 = '0.00';
                        } else {
                            this.totalsumaresta(this.notList);
                        }
                        for (let i = 0; i < this.creditosList.length; i++) {
                            this.creditosList[i].MARCADO = 0;
                        }
                        this.cotizacion.cerrarModal = false;
                        this.cotizacion.poliza.pagoElegido = 'default';
                        this.abrir = true;
                    }
                });
        } else {
            const result = this.notList.filter((x) => !this.arrayNC.some((y) => JSON.stringify(y) === JSON.stringify(x)));

            if (result.length > 1) {
                var letra = 's';
                var letra2 = 'n';
            } else {
                var letra = '';
                var letra2 = '';
            }

            let resultLength = result.length;
            let notasDeCredito = '';
            for (let i = 0; i < resultLength; i++) {
                notasDeCredito += '<br><br>DOCUMENTO: ' + result[i].DOCUMENTO_NC + ' - MONTO: ' + result[i].MONTO;
            }

            swal.fire({
                title: 'Información',
                html: 'Se ha detectado que cuenta con ' + result.length + ' nota' + letra + ' de crédito' + letra + ' que será' + letra2 + ' retirado' + letra + ' del uso del pago, debido a que supera' + letra2 + ' la prima a pagar.' +
                    ' La' + letra + ' nota' + letra + ' de crédito a retirar son las siguientes: ' +
                    notasDeCredito +
                    '<br><br>¿Deseas continuar con la transacción?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Generar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            })
                .then((result) => {
                    if (result.value) {
                        this.cotizacion.cerrarModal = true;
                        this.confirmar.emit();
                    } else {
                        localStorage.removeItem('creditdata'); // AVS PRY NC
                        localStorage.removeItem('botonNC'); // AVS PRY NC
                        for (let i = 0; i < this.notList.length; i++) {
                            this.notList.splice(i, 1);
                            i--;
                        }
                        for (let i = 0; i < this.arrayNC.length; i++) {
                            this.arrayNC.splice(i, 1);
                            i--;
                        }
                        if (this.notList.length == 0) {
                            this.flagDisabledBotonNC = true;
                            this.lblPagos2 = '0.00';
                        } else {
                            this.totalsumaresta(this.notList);
                        }
                        for (let i = 0; i < this.creditosList.length; i++) {
                            this.creditosList[i].MARCADO = 0;
                        }
                        this.cotizacion.cerrarModal = false;
                        this.cotizacion.poliza.pagoElegido = 'default';
                        this.abrir = true;
                    }
                });
        }
    }

    guardarList(noteSelected: any, checked) {
        if (checked) {
            noteSelected.MARCADO = 1;
            this.notList.push(noteSelected);
            this.arrayNC = [];
            this.notList.sort((a, b) => b.MONTO - a.MONTO);
            this.pago = 0;

            for (let i = 0; i < this.notList.length; i++) {
                this.pago += Number(this.notList[i].MONTO);
                this.arrayNC.push(this.notList[i]);
                if (this.pago > Number(this.lblPagos)) {
                    break;
                }
            }

            for (let i = 0; i < this.notList.length; i++) {
                if (this.notList[i].MARCADO == 1) {
                    this.flagDisabledBotonNC = false;
                }
            }

            for (let i = 0; i < this.arrayNC.length; i++) {
                if (this.arrayNC[i].MARCADO == 1) {
                    this.flagDisabledBotonNC = false;
                }
            }

            this.totalsumaresta(this.notList);
        } else {
            noteSelected.MARCADO = 0;

            for (let i = 0; i < this.notList.length; i++) {
                if (this.notList[i].MARCADO == 0) {
                    this.notList.splice(i, 1);
                    i--;
                }
            }

            for (let i = 0; i < this.arrayNC.length; i++) {
                if (this.arrayNC[i].MARCADO == 0) {
                    this.arrayNC.splice(i, 1);
                    i--;
                }
            }

            if (this.notList.length == 0) {
                this.flagDisabledBotonNC = true;
                this.lblPagos2 = '0.00';
                this.flagPAGADONC = false;
            } else {
                this.totalsumaresta(this.notList);
                if (this.lblPagos2 != 'PAGADO') {
                    this.flagPAGADONC = false;
                }
            }
        }
    }

    totalsumaresta(notList) { //AVS - App Nota de Credito 23/01/2023
        if (notList == 0) {
            this.flagPAGADONC = false;
            return this.lblPagos2 = '0.00';
        } else {
            var sum = 0;
            notList.forEach(item => {
                sum = sum + item.MONTO;
            });
            var res = 0;
            res = Number(this.cotizacion.trama.PRIMA_TOTAL) - sum;
            let df = new DecimalFormat('0.00');
            this.lblPagos2 = df.format(res);
            this.totalPagado = this.lblPagos2;
            if (Number(this.lblPagos2) <= 0) {
                this.lblPagos2 = 'PAGADO';

                for (let i = 0; i < this.creditosList.length; i++) {
                    if (this.creditosList[i].MARCADO == 0) {
                        this.flagPAGADONC = true;
                    }
                }
            }
        }
    }

    alertaCheck(notList) { //AVS - App Nota de Credito 23/01/2023
        this.isLoading = true;
        if (notList == 0) {
            return swal.fire("Información", 'Debe seleccionar obligatoriamente una Nota de credito', "info");
        } else {
            var sum = 0;
            notList.forEach(item => {
                sum = sum + item.MONTO;
            });

            var res = 0;
            res = Number(this.lblPagos) - sum;
            this.lblPagos2 = CommonMethods.formatValor(res, 2);

            if (Number(this.lblPagos2) > 0) {
                this.obtenerFormasPagoNC();
                this.closeModal();
            }
            else {
                if (this.cotizacion.contratante.debtMark == 1) {
                    return swal.fire('Información', 'El cliente presenta una deuda al día ' + CommonMethods.formatDate(new Date()) + '. No puedes realizar el pago completo hasta que realice el pago de la deuda.', 'error');
                }
                this.lblPagos2 = CommonMethods.formatValor(Math.abs(res), 2);
                this.closeModal();
                return this.pagoDirectoNC();
            }

            // if (Number(this.lblPagos2) <= 0) {
            //     if (this.cotizacion.contratante.debtMark == 1) {
            //         return swal.fire('Información', 'El cliente presenta una deuda al día ' + CommonMethods.formatDate(new Date()) + '. No puedes realizar el pago completo hasta que realice el pago de la deuda.', 'error');
            //     }
            //     this.lblPagos2 = CommonMethods.formatValor(Math.abs(res), 2);
            //     this.closeModal();
            //     return this.pagoDirectoNC();
            // }

            // if (Number(this.lblPagos2) < Number(this.lblPagos)) {
            //     this.closeModal();
            // }else{
            //     this.obtenerFormasPagoNC();

            // }
        }
    }

    alertaCredito(contentAlert) { //AVS - App Nota de Credito 23/01/2023
        this.modalService2.open(contentAlert);
    }

    omitirClick() {
        this.cotizacion.cerrarModal = true;
        this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.OMITIR;
        this.confirmar.emit();
    }

    async generarVL(pagoEfectivo) {
        pagoEfectivo = {
            tipoSolicitud: 1, // this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
            monto: this.cotizacion.trama.PRIMA_TOTAL,
            monto1: this.lblPagos2, //AVS - App Nota de Credito 23/01/2023
            correo: this.cotizacion.contratante.email,
            conceptoPago: CommonMethods.conceptProduct(this.codProducto),
            nombre: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                this.cotizacion.contratante.nombres : this.cotizacion.contratante.razonSocial  == undefined ? this.cotizacion.contratante.NOMBRE_RAZON : this.cotizacion.contratante.razonSocial,
            Apellidos: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                this.cotizacion.contratante.apellidoPaterno + ' ' + this.cotizacion.contratante.apellidoMaterno : '',
            ubigeoINEI: this.cotizacion.contratante.cliente360.EListAddresClient != null &&
                this.cotizacion.contratante.cliente360.EListAddresClient.length > 0 ?
                await this.ubigeoInei(this.cotizacion.contratante.cliente360.EListAddresClient[0].P_NMUNICIPALITY) :
                '150132',
            tipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
            numeroDocumento: this.cotizacion.contratante.numDocumento,
            telefono: this.cotizacion.contratante.cliente360.EListPhoneClient != null &&
                this.cotizacion.contratante.cliente360.EListPhoneClient.length > 0 ?
                this.cotizacion.contratante.cliente360.EListPhoneClient[0].P_SPHONE : '',
            ramo: this.nbranch,
            producto: this.cotizacion.poliza.producto.COD_PRODUCT,
            ExternalId: this.cotizacion.trama.NIDPROC,
            quotationNumber: this.cotizacion.tipoTransaccion == 0 || this.cotizacion.tipoTransaccion == 1 ?
                this.cotizacion.prepago.P_NID_COTIZACION : this.cotizacion.numeroCotizacion,
            codigoCanal: this.cotizacion.brokers[0].COD_CANAL,
            codUser: this.storageService.userId,
        };
    }

    async generarGenerico(pagoEfectivo) {
        pagoEfectivo = {
            tipoSolicitud: 1, // this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
            monto: this.cotizacion.trama.PRIMA_TOTAL,
            monto1: this.lblPagos2, //AVS - App Nota de Credito 23/01/2023
            correo: this.cotizacion.contratante.email,
            conceptoPago: CommonMethods.conceptProduct(this.codProducto),
            nombre: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                this.cotizacion.contratante.nombres : this.cotizacion.contratante.razonSocial  == undefined ? this.cotizacion.contratante.NOMBRE_RAZON : this.cotizacion.contratante.razonSocial,
            Apellidos: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
                this.cotizacion.contratante.apellidoPaterno + ' ' + this.cotizacion.contratante.apellidoMaterno : '',
            ubigeoINEI: this.cotizacion.contratante.cliente360.EListAddresClient != null &&
                this.cotizacion.contratante.cliente360.EListAddresClient.length > 0 ?
                await this.ubigeoInei(this.cotizacion.contratante.cliente360.EListAddresClient[0].P_NMUNICIPALITY) :
                '150132',
            tipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
            numeroDocumento: this.cotizacion.contratante.numDocumento,
            telefono: this.cotizacion.contratante.cliente360.EListPhoneClient != null &&
                this.cotizacion.contratante.cliente360.EListPhoneClient.length > 0 ?
                this.cotizacion.contratante.cliente360.EListPhoneClient[0].P_SPHONE : '',
            ramo: this.nbranch,
            producto: this.cotizacion.poliza.producto.COD_PRODUCT,
            ExternalId: this.cotizacion.trama.NIDPROC,
            quotationNumber: this.cotizacion.tipoTransaccion == 0 || this.cotizacion.tipoTransaccion == 1 ?
                this.cotizacion.prepago.P_NID_COTIZACION : this.cotizacion.numeroCotizacion,
            codigoCanal: this.cotizacion.brokers[0].COD_CANAL,
            codUser: this.storageService.userId,
        };
    }

    obtenerFormasPago() {
        /*
        const params = {
            Amount: CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2),
            Canal: this.storageService.user.canal,
            Email: this.cotizacion.contratante.email,
            ExternalId: this.cotizacion.trama.NIDPROC,
            Flujo: '0',
            Nombre: this.cotizacion.contratante.NOMBRE_RAZON,
            Producto: this.cotizacion.poliza.producto.COD_PRODUCT,
            PuntoVenta: '0',
            Ramo: this.nbranch,
            TipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
            NumeroDocumento: this.cotizacion.contratante.numDocumento,
            tipoSolicitud: '1',
            tipoRiesgo: this.cotizacion.contratante.creditHistory.nflag === 0 ? '1' : '0',
            tipoCuenta: this.cotizacion.contratante.codTipoCuenta,
            token: this.storageService.user.token,
            tipoTransac: this.cotizacion.tipoTransaccion,
            clienteDeuda: this.cotizacion.contratante.debtMark,
            emisionDirecta: this.cotizacion.contratante.emisionDirecta || 'N',
            nroCotizacion: this.cotizacion.numeroCotizacion,
            codMoneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1
        };
        */
        let params: any = {};

        if (this.codProducto != 4) {
            console.log('obtenerFormasPago() en panel ingo pago');
            params = {
                Amount: CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2),
                Canal: this.storageService.user.canal,
                Email: this.cotizacion.contratante.email,
                ExternalId: this.cotizacion.trama.NIDPROC,
                Flujo: '0',
                Nombre: this.cotizacion.contratante.NOMBRE_RAZON,
                Producto: this.cotizacion.poliza.producto.COD_PRODUCT,
                PuntoVenta: '0',
                Ramo: this.nbranch,
                TipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
                NumeroDocumento: this.cotizacion.contratante.numDocumento,
                tipoSolicitud: '1',
                tipoRiesgo: this.cotizacion.contratante.creditHistory.nflag === 0 ? '1' : '0',
                tipoCuenta: this.cotizacion.contratante.codTipoCuenta,
                token: this.storageService.user.token,
                tipoTransac: this.cotizacion.tipoTransaccion,
                clienteDeuda: this.cotizacion.contratante.debtMark,
                emisionDirecta: this.cotizacion.contratante.emisionDirecta || 'N',
                nroCotizacion: this.cotizacion.numeroCotizacion,
                codMoneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1
            };
        } else {
            params = {
                tipoCanal: 'paycard',
                montoCobro: CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2),
                codigoCanal: this.storageService.user.canal,
                idUsuario: this.storageService.user.id,
                idRamo: this.nbranch,
                idProducto: this.cotizacion.poliza.producto.COD_PRODUCT,
                idMoneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1,
                externalId: this.cotizacion.trama.NIDPROC,
                idTipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
                numeroDocumento: this.cotizacion.contratante.numDocumento,
                email: this.cotizacion.contratante.email,
                generar: true,
                idProceso: 0,
                nombres: this.cotizacion.contratante.nombres,
                apellidoPaterno: this.cotizacion.contratante.apellidoPaterno,
                apellidoMaterno: this.cotizacion.contratante.apellidoMaterno,
                razonSocial: null,
                telefono: this.cotizacion.contratante.telefono,
                tipoTransac: this.cotizacion.tipoTransaccion,
                token: this.storageService.user.token
            };
        }


        this.isLoadingChange.emit(this.isLoading);

        this.accPersonalesService.obtenerFormasPago(params).subscribe(
            async res => {
                this.isLoadingChange.emit(false);
                if (res.cod_error === 0) {
                    this.tipoPago = res;
                    this.cotizacion.tipoPago = res;

                    if (this.nbranch == 77) { // SCTR
                        this.flagKushki = true;

                        if (this.cotizacion.tipoTransaccion == '2' && this.cotizacion.contratante.emisionDirecta == 'S') {
                            this.tipoPago.flagpagoefectivo = false;
                            this.flagKushki = false;
                        }
                    }
                    
                    this.tipoPago.flagpagoefectivocredito = false; //AVS - App Nota de Credito 23/01/2023
                    // this.tipoPago.flagcredito = true;
                    if (!!res.objNiubiz && !!res.objNiubiz.data.niubiz) {
                        window['initDFP'](
                            res.objNiubiz.data?.niubiz?.deviceFingerPrintId,
                            res.objNiubiz.data?.niubiz?.numeroCompra,
                            res.objNiubiz.data?.niubiz?.ip,
                            res.objNiubiz.data?.niubiz?.codigoComercio
                        );
                    }

                    await this.pagoElegido();
                } else {
                    this.cerrarModal = true;
                    swal.fire('Información', 'Su sesión ha terminado, vuelva a ingresar', 'question')
                        .then((value) => {
                            this.router.navigate(['/extranet/login']);
                        });
                }

            },
            () => {
                this.isLoadingChange.emit(false);
            }
        );
    }

    obtenerFormasPagoNC() { //AVS - App Nota de Credito 23/01/2023
        const params = {
            Amount: CommonMethods.formatValor(this.lblPagos2, 2),
            Canal: this.storageService.user.canal,
            Email: this.cotizacion.contratante.email,
            ExternalId: this.cotizacion.trama.NIDPROC,
            Flujo: '0',
            Nombre: this.cotizacion.contratante.NOMBRE_RAZON,
            Producto: this.cotizacion.poliza.producto.COD_PRODUCT,
            PuntoVenta: '0',
            Ramo: this.nbranch,
            TipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
            NumeroDocumento: this.cotizacion.contratante.numDocumento,
            tipoSolicitud: '1',
            tipoRiesgo: this.cotizacion.contratante.creditHistory.nflag === 0 ? '1' : '0',
            tipoCuenta: this.cotizacion.contratante.codTipoCuenta,
            token: this.storageService.user.token,
            tipoTransac: this.cotizacion.tipoTransaccion,
            clienteDeuda: this.cotizacion.contratante.debtMark,
            emisionDirecta: this.cotizacion.contratante.emisionDirecta || 'N',
            nroCotizacion: this.cotizacion.numeroCotizacion,
            codMoneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1
        };

        this.isLoadingChange.emit(this.isLoading);

        this.accPersonalesService.obtenerFormasPago(params).subscribe(
            async res => {
                this.isLoadingChange.emit(false);
                if (res.cod_error === 0) {
                    this.tipoPago = res;
                    this.cotizacion.tipoPago = res;
                    this.tipoPago.flagcredito = false; //AVS - App Nota de Credito 23/01/2023
                    this.tipoPago.flagdirecto = false; //AVS - App Nota de Credito 23/01/2023
                    this.tipoPago.flagpagoefectivo = false; //AVS - App Nota de Credito 23/01/2023
                    await this.pagoElegidoNC(); //AVS - App Nota de Credito 23/01/2023
                } else {
                    this.cerrarModal = true;
                    swal.fire('Información', 'Su sesión ha terminado, vuelva a ingresar', 'question')
                        .then((value) => {
                            this.router.navigate(['/extranet/login']);
                        });
                }
            },
            () => {
                this.isLoadingChange.emit(false);
            }
        );
    }

    async ubigeoInei(distrito) {
        let ubigeo = 0;
        await this.quotationService.equivalentMunicipality(distrito).toPromise().then(
            res => {
                ubigeo = res;
            },
            error => {
                ubigeo = 0;
            }
        );
        return ubigeo;
    }

    async objetoEmision() {
        let params: any = {};
        if (this.codProducto == 3 || this.codProducto == 2) {
            params = await this.objetoEmisionVL(params);
        } else {
            params = await this.objetoEmisionGenerico(params);
        }

        console.log(params);
        return params;
    }

    objetoEmisionVL(params) {
        return params = this.cotizacion.paramsTrx;
    }

    objetoEmisionGenerico(params) {
        let campoFrecuencia = '';
        switch (String(this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA)) {
            case '6':
                campoFrecuencia = 'NPREMIUMN_ESP';
                break;
            case '5':
                campoFrecuencia = 'NPREMIUMN_MEN';
                break;
            case '4':
                campoFrecuencia = 'NPREMIUMN_BIM';
                break;
            case '3':
                campoFrecuencia = 'NPREMIUMN_TRI';
                break;
            case '2':
                campoFrecuencia = 'NPREMIUMN_SEM';
                break;
            case '1':
                campoFrecuencia = 'NPREMIUMN_ANU';
                break;
            default:
                campoFrecuencia = 'NPREMIUMN_ANU';
                break;
        }

        return params = [{
            P_NID_COTIZACION: this.cotizacion.tipoTransaccion == 0
                ? this.cotizacion.prepago.P_NID_COTIZACION
                : this.cotizacion.numeroCotizacion,
            P_NPOLICY: 0,
            P_NID_PROC: this.cotizacion.trama.NIDPROC,
            P_NPRODUCT: this.cotizacion.poliza.producto.COD_PRODUCT,
            P_NBRANCH: this.cotizacion.poliza.producto.NBRANCH,
            P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            P_DSTARTDATE: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza),
            P_DEXPIRDAT: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinPoliza),
            P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            P_FACT_MES_VENCIDO: 0,
            P_SFLAG_FAC_ANT: 1, // this.cotizacion.poliza.checkbox1.FAC_ANT ? 1 : 0,
            P_NPREM_NETA: !!this.cotizacion.trama.amountPremiumList ? this.cotizacion.trama.amountPremiumList[1][campoFrecuencia] : this.cotizacion.cotizador.amountPremiumListAut[1].NPREMIUMN_ANU,
            SRUTA: '',
            P_IGV: !!this.cotizacion.trama.amountPremiumList ? this.cotizacion.trama.amountPremiumList[2][campoFrecuencia] : this.cotizacion.cotizador.amountPremiumListAut[2].NPREMIUMN_ANU,
            P_NPREM_BRU: !!this.cotizacion.trama.amountPremiumList ? this.cotizacion.trama.amountPremiumList[3][campoFrecuencia] : this.cotizacion.cotizador.amountPremiumListAut[3].NPREMIUMN_ANU,
            P_NUSERCODE: this.storageService.userId,
            P_SCOMMENT: this.cotizacion.cotizador.comentario || '',
            P_NIDPAYMENT: '',
            P_NPOLIZA_MATRIZ: this.cotizacion.poliza.checkbox1.POL_MAT ? 1 : 0,
            P_POLICY: this.cotizacion.poliza.nroPoliza,
            P_NAMO_AFEC: this.cotizacion.trama.PRIMA,
            P_NIVA: this.cotizacion.trama.IGV,
            P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL,
            P_NDE: 0,
            P_DSTARTDATE_POL: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza),
            P_DEXPIRDAT_POL: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinPoliza),
            P_DSTARTDATE_ASE: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioAsegurado),
            P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinAsegurado),
            P_STRAN: this.cotizacion.transac
        }];
    }

    async objetoJob() {
        let params: any = {};
        if (this.codProducto == 3 || this.codProducto == 2) {
            params = await this.objetoJobVL(params);
        } else {
            params = await this.objetoJobGenerico(params);
        }
        return params;
    }

    objetoJobVL(params) {
        return params = this.cotizacion.paramsTrx;
    }

    objetoJobGenerico(params) {
        return params = {
            P_NPRODUCTO: this.cotizacion.poliza.producto.COD_PRODUCT,
            P_NID_COTIZACION: this.cotizacion.numeroCotizacion,
            P_DEFFECDATE: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioAsegurado),
            P_DEXPIRDAT: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinAsegurado),
            P_NUSERCODE: this.storageService.userId,
            P_NTYPE_TRANSAC: this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
            P_NID_PROC: this.cotizacion.trama.NIDPROC,
            P_FACT_MES_VENCIDO: 0,
            P_SFLAG_FAC_ANT: 1, // this.cotizacion.poliza.checkbox1.FAC_ANT ? 1 : 0,
            P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            P_NMOV_ANUL: 0,
            P_NNULLCODE: 0,
            P_SCOMMENT: this.cotizacion.comentario || this.cotizacion.cotizador.comentario,
            P_NIDPAYMENT: '',
            P_POLICY: this.cotizacion.poliza.nroPoliza,
            P_NAMO_AFEC: this.cotizacion.trama.PRIMA,
            P_NIVA: this.cotizacion.trama.IGV,
            P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL,
            P_NDE: 0,
            P_DSTARTDATE_POL: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza),
            P_DEXPIRDAT_POL: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinPoliza),
            P_STRAN: this.cotizacion.transac
        };
    }

    infoPagoEfectivo() {
        this.modalRef = this.modalService.show(this.contentEfectivo);
    }

    infoDirecto() {
        this.modalRef = this.modalService.show(this.contentDirecto);
    }

    insertVisaScript(): void {
        const visaConfigPayload: IVisaConfig = {
            action: `${AppConfig.ACTION_VISA_PAY}/${btoa(
                AppConfig.DOMAIN_URL + '/extranet/policy/resultado'          //REVISAR
            )}`,
            channel: 'paycard',
            ammount: CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2),
            buttonText: `${(!!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1) == 1 ? 'S/' : '$'
                } ${CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2)}`,
            email: this.cotizacion.contratante.email,
            lastName: `${this.cotizacion.contratante.apellidoPaterno} ${this.cotizacion.contratante.apellidoMaterno}`,
            name: this.cotizacion.contratante.nombres,
            merchantId: this.tipoPago.objNiubiz.data.niubiz.codigoComercio,
            token: this.tipoPago.objNiubiz.data.niubiz.sessionNiubiz,
            purchaseNumber: this.tipoPago.objNiubiz.data.niubiz.numeroCompra,
        };
        /*
            const sessionPayload = {
              ...this.form.getRawValue(),
              processId: this.sessionVisa.idPayment,
              channel: 2015000002,
              paymentType: this.formControl['channel'].value,
            };
        
            sessionStorage.setItem('visa-testing-ps', JSON.stringify(sessionPayload));
        */
        this.utilsService.openVisaCheckout(this.visaPay, visaConfigPayload);
    }

    infoCredito() {
        this.modalRef = this.modalService.show(this.contentCredito);
    }

    openCred(contentCred) {
        this.flagBotonNC = true;
        this.flagPAGADONC = false;
        localStorage.setItem('botonNC', JSON.stringify(this.flagBotonNC));
        for (let i = 0; i < this.notList.length; i++) {
            this.notList.splice(i, 1);
            i--;
        }

        for (let i = 0; i < this.arrayNC.length; i++) {
            this.arrayNC.splice(i, 1);
            i--;
        }

        for (let i = 0; i < this.creditosList.length; i++) {
            this.creditosList[i].MARCADO = 0;
        }

        this.flagDisabledBotonNC = true;
        this.lblPagos2 = '0.00'
        this.modalService1.open(contentCred, { size: 'xl' });
    }

    closeModalPrincipal() {
        this.flagBotonNC = false;
        this.flagPAGADONC = false;
        localStorage.setItem('botonNC', JSON.stringify(this.flagBotonNC));

        for (let i = 0; i < this.notList.length; i++) {
            this.notList.splice(i, 1);
            i--;
        }

        for (let i = 0; i < this.arrayNC.length; i++) {
            this.arrayNC.splice(i, 1);
            i--;
        }

        for (let i = 0; i < this.creditosList.length; i++) {
            this.creditosList[i].MARCADO = 0;
        }

        this.flagDisabledBotonNC = true;
        this.lblPagos2 = '0.00'
        this.modalService1.dismissAll();
    }

    closeModal() {
        this.modalService1.dismissAll();
    }

    async getNotaCreditoList(P_CONTRATANTE?: any, P_REC_NC?: any, P_TIPO?: any, P_TIPO_MONEDA?: any, P_PRIMA?: any) { //AVS - App Nota de Credito 23/01/2023
        this.isLoading = true;
        await this.pagoInformationService.getNotaCreditoList(P_CONTRATANTE, P_REC_NC, P_TIPO, P_TIPO_MONEDA, P_PRIMA).toPromise().then(async (
            res: any) => {
            this.isLoading = false;
            this.creditosList = res;
            this.lblPagos2 = '0.00';
            this.flagDisabledBotonNC = true;

            /*for (let i = 0; i < this.creditosList.length; i++) {
              if(this.creditosList[i].MARCADO == 1){
                this.notList.push(this.creditosList[i]);
              }
            }*/

            /*if(this.notList.length > 0){
              this.flagDisabledBotonNC = false;
              this.totalsumaresta(this.notList);
            }*/
        }
        );
    }

    NCPayList() { //AVS - App Nota de Credito 23/01/2023
        let listNC: any = [];
        if (this.arrayNC.length != 0) {
            for (let i = 0; i < this.arrayNC.length; i++) {
                const creditData: any = {};
                creditData.monto = this.arrayNC[i].MONTO;
                creditData.sclient = this.cotizacion.contratante.cliente360.P_SCLIENT;
                creditData.nreceipt = this.arrayNC[i].DOCUMENTO;
                creditData.documento_nc = this.arrayNC[i].DOCUMENTO_NC;
                creditData.forma_pago = this.arrayNC[i].FORMA_PAGO;
                creditData.contratante = this.arrayNC[i].CONTRATANTE;
                creditData.moneda = this.cotizacion.P_NCURRENCY || this.cotizacion.COD_MONEDA || 1;
                creditData.ncotizacion = this.cotizacion.tipoTransaccion == 0 ? this.cotizacion.prepago.P_NID_COTIZACION : this.cotizacion.numeroCotizacion;
                creditData.canal = this.storageService.user.canal;
                creditData.codTipoPago = creditData.forma_pago == 'NC' ? 4 : creditData.forma_pago || creditData.forma_pago == 'PCP' ? 7 : creditData.forma_pago;
                creditData.codUsuario = this.storageService.user.id;
                creditData.estado = 1;
                creditData.codTransac = this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion;
                creditData.desTransac = this.cotizacion.transac != null ? this.cotizacion.transac : 'NO HAY REGISTRO';
                listNC.push(creditData);
            }
        } else {
            for (let i = 0; i < this.notList.length; i++) {
                const creditData: any = {};
                creditData.monto = this.notList[i].MONTO;
                creditData.sclient = this.cotizacion.contratante.cliente360.P_SCLIENT;
                creditData.nreceipt = this.notList[i].DOCUMENTO;
                creditData.documento_nc = this.notList[i].DOCUMENTO_NC;
                creditData.forma_pago = this.notList[i].FORMA_PAGO;
                creditData.contratante = this.notList[i].CONTRATANTE;
                creditData.moneda = this.cotizacion.P_NCURRENCY || this.cotizacion.COD_MONEDA || 1;
                creditData.ncotizacion = this.cotizacion.tipoTransaccion == 0 ? this.cotizacion.prepago.P_NID_COTIZACION : this.cotizacion.numeroCotizacion;
                creditData.canal = this.storageService.user.canal;
                creditData.codTipoPago = creditData.forma_pago == 'NC' ? 4 : creditData.forma_pago || creditData.forma_pago == 'PCP' ? 7 : creditData.forma_pago;
                creditData.codUsuario = this.storageService.user.id;
                creditData.estado = 1;
                creditData.codTransac = this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion;
                creditData.desTransac = this.cotizacion.transac != null ? this.cotizacion.transac : 'NO HAY REGISTRO';
                listNC.push(creditData);
            }
        }

        localStorage.setItem('creditdata', JSON.stringify(listNC));
    }

    getBase64(file): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString() || '');
            reader.onerror = error => reject(error);
        });
    }

    guardarAdjuntos(filename: string, base64: string): void {
        let file: any = {}
        file.filename = filename;
        file.base64 = base64;
        this.files_adjuntos.push(JSON.stringify(file));
        console.log(filename);
    }

    async filesAdjuntos(files: File[]) {
        this.files_adjuntos = [];

        for (let file of files) {
            await this.getBase64(file).then(
                data => {
                    this.guardarAdjuntos(file.name, data);
                })
        }
    }

    async pagoKushki(tipoPago: string) {
        this.cotizacion.cerrarModal = true;
        console.log('pagoKushki(tipoPago: string)');

        if(tipoPago == '2'){
            this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.CASH;
            console.log(this.cotizacion.poliza.pagoElegido);
        }else{
            this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.TRANSFERENCIA;
            console.log(this.cotizacion.poliza.pagoElegido);
        }
        
        //await this.pagoElegido();

        swal.fire({
            title: 'Información',
            text: '¿Deseas generar la transacción por ' + this.cotizacion.poliza.pagoElegido + ' ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        })
            .then((result) => {
                if (result.value) {
                    this.confirmar.emit();
                } else {
                    this.cotizacion.cerrarModal = false;
                    this.cotizacion.poliza.pagoElegido = 'default';
                    this.abrir = true;
                }
            });
    }
}