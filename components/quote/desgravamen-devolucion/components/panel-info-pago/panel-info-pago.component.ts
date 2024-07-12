import { Component, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';

import { QuotationService } from '../../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../../services/policy/policyemit.service';

import { CommonMethods } from './../../../../common-methods';

import { StorageService } from '../../core/services/storage.service';
import { DesgravamenDevolucionConstants } from '../../core/constants/desgravamen-devolucion.constants';
import { DesgravamenDevolucionService } from '../../desgravamen-devolucion.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AppConfig } from './../../../../../../../app.config';
import swal from 'sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'panel-info-pago',
  templateUrl: './panel-info-pago.component.html',
  styleUrls: ['./panel-info-pago.component.css']
})
export class PanelInfoPagoComponent implements OnChanges {

  @Input() abrir: boolean;
  @Output() abrirChange: EventEmitter<boolean> = new EventEmitter();

  @Output() confirmar: EventEmitter<boolean> = new EventEmitter();

  @Input() cotizacion: any;

  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();

  tipoPago: any = null;
  cerrarModal: boolean;

  CONSTANTS: any = DesgravamenDevolucionConstants;
  modalRef: BsModalRef;
  @ViewChild('modalEfectivo', { static: false }) contentEfectivo;
  @ViewChild('modalDirecto', { static: false }) contentDirecto;

  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  // epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  nbranch: any = '';

  constructor(
    private storageService: StorageService,
    private DesgravamenDevolucionService: DesgravamenDevolucionService,
    private route: ActivatedRoute,
    private router: Router,
    private policyemit: PolicyemitService,
    private quotationService: QuotationService,
    private readonly appConfig: AppConfig,
    private readonly modalService: BsModalService
  ) { }

  async ngOnChanges(changes) {
    if (changes.abrir && changes.abrir.currentValue) {
      if (this.isLoading) {
        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        this.obtenerFormasPago();
      }
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
        producto: this.cotizacion.poliza.tipoProducto,
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

  omitirClick() {
    this.cotizacion.cerrarModal = true;
    this.cotizacion.poliza.pagoElegido = this.CONSTANTS.PAGO_ELEGIDO.OMITIR;
    this.confirmar.emit();
  }

  async generarVL(pagoEfectivo) {
    pagoEfectivo = {
      tipoSolicitud: 1, // this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
      monto: this.cotizacion.trama.PRIMA_TOTAL,
      correo: this.cotizacion.contratante.email,
      conceptoPago: CommonMethods.conceptProduct(this.codProducto),
      nombre: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
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
      producto: this.cotizacion.poliza.tipoProducto,
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
      correo: this.cotizacion.contratante.email,
      conceptoPago: CommonMethods.conceptProduct(this.codProducto),
      nombre: this.cotizacion.contratante.tipoPersona.codigo === 'PN' ?
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
      producto: this.cotizacion.poliza.tipoProducto,
      ExternalId: this.cotizacion.trama.NIDPROC,
      quotationNumber: this.cotizacion.tipoTransaccion == 0 || this.cotizacion.tipoTransaccion == 1 ?
        this.cotizacion.prepago.P_NID_COTIZACION : this.cotizacion.numeroCotizacion,
      codigoCanal: this.cotizacion.brokers[0].COD_CANAL,
      codUser: this.storageService.userId,
    };
  }

  obtenerFormasPago() {
    const params = {
      Amount: CommonMethods.formatValor(this.cotizacion.trama.PRIMA_TOTAL, 2),
      Canal: this.storageService.user.canal,
      Email: this.cotizacion.contratante.email,
      ExternalId: this.cotizacion.trama.NIDPROC,
      Flujo: '0',
      Nombre: this.cotizacion.contratante.NOMBRE_RAZON,
      Producto: this.cotizacion.poliza.tipoProducto,
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
      emisionDirecta: this.cotizacion.contratante.emisionDirecta,
      nroCotizacion: this.cotizacion.numeroCotizacion,
      codMoneda: !!this.cotizacion.poliza.moneda ? this.cotizacion.poliza.moneda.NCODIGINT : 1
    };

    this.isLoadingChange.emit(this.isLoading);

    this.DesgravamenDevolucionService.obtenerFormasPago(params).subscribe(
      async res => {
        this.isLoadingChange.emit(false);
        if (res.cod_error === 0) {
          this.tipoPago = res;
          this.cotizacion.tipoPago = res;
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
    if (this.codProducto == 3) {
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
      P_NPRODUCT: this.cotizacion.poliza.tipoProducto,
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
    if (this.codProducto == 3) {
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
      P_NPRODUCTO: this.cotizacion.poliza.tipoProducto,
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

}
