import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';

import { CommonMethods } from '../../../../common-methods';
import { OthersService } from '../../../../../services/shared/others.service';

import { UtilService } from '../../core/services/util.service';
import { StorageService } from '../../core/services/storage.service';
import { FileService } from '../../core/services/file.service';
import { DesgravamenDevolucionService } from '../../desgravamen-devolucion.service';
import { DesgravamenDevolucionConstants } from '../../core/constants/desgravamen-devolucion.constants';
import swal from 'sweetalert2';

@Component({
  selector: 'panel-info-cotizador',
  templateUrl: './panel-info-cotizador.component.html',
  styleUrls: ['./panel-info-cotizador.component.css'],
})
export class PanelInfoCotizadorComponent implements OnInit, OnChanges {
  @Input() detail: boolean;

  @Input() cotizador: any;
  @Output() cotizadorChange: EventEmitter<any> = new EventEmitter();

  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();

  @Input() trama: any;
  @Output() tramaChange: EventEmitter<any> = new EventEmitter();

  @Input() recargar: any;
  @Output() recargarChange: EventEmitter<any> = new EventEmitter();

  @Input() cotizacion: any;
  @Input() poliza: any;
  @Input() contratante: any;
  @Input() esPolizaMatriz: any;
  @Input() esMina: any;

  CONSTANTS: any = DesgravamenDevolucionConstants;

  fechaActual: any = UtilService.dates.getCurrentDate();

  show: any = {};

  proponerPrima: boolean;
  proponerSumaAsegurada: boolean;
  seleCobertura: boolean;
  primaNeta: any;
  tabCoberturas: boolean;
  tabAsistencias: boolean;
  tabBeneficios: boolean;
  tabRecargos: boolean;
  coberturas: any = [];
  asistencias: any = [];
  beneficios: any = [];
  recargos: any = [];
  simularPrima: string;

  constructor(
    public storageService: StorageService,
    private fileService: FileService,
    private othersService: OthersService,
    public DesgravamenDevolucionService: DesgravamenDevolucionService
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
      JSON.parse(localStorage.getItem('codProducto'))['productId']
    );
    (this.tabCoberturas = true), (this.tabAsistencias = false);
    (this.tabBeneficios = false), (this.tabRecargos = false);
  }

  ngOnInit() {
    this.cotizador = this.cotizador || {};
    this.cotizadorChange.emit(this.cotizador);
  }

  ngOnChanges(changes) {
    if (
      changes.esPolizaMatriz &&
      changes.esPolizaMatriz.previousValue !== undefined
    ) {
      this.limpiarCotizador();
    }

    if (
      changes.esMina &&
      changes.esMina.previousValue !== undefined
    ) {
      this.limpiarCotizador();
      // this.clickCalcularSinTrama();
    }

    if (changes.recargar && changes.recargar.currentValue === true) {
      setTimeout(() => {
        this.recargarChange.emit(false);
      });
      this.cambiaDatosPoliza();
    }
  }

  cambiaDatosPoliza() {
    this.proponerSumaAsegurada = false;

    if (this.poliza.checkbox1.POL_MAT && this.cotizador.calculado === true) {
      this.clickCalcularSinTrama(true);
    }
  }

  clickCalcular() {
    const params = {
      ID_PROC: this.trama.NIDPROC,
      TASA: this.cotizador.tasaPropuesta,
      PRIMA: this.poliza.primaPropuesta,
      CODPRODUCTO: this.storageService.productId,
    };

    this.isLoadingChange.emit(true);

    this.DesgravamenDevolucionService.calcularCotizador(params).subscribe(
      (res) => {
        this.trama = Object.assign(this.trama, res);
        this.trama.PRIMA_TOTAL = this.getPrima(res.amountPremiumList);
        this.trama.IGV = this.getPrima(res.amountPremiumList, false);
        this.tramaChange.emit(this.trama);
        this.cotizador.calculado = true;

        this.isLoadingChange.emit(false);
      },
      (error) => {
        this.isLoadingChange.emit(false);
      }
    );
  }

  clickCalcularSinTrama(validar?) {
    const msgValidate = this.validarCampos();

    if (msgValidate == '') {
      const params = {
        flagCalcular:
          this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId
            ? 1
            : 0,
        codUsuario: this.storageService.userId,
        desUsuario: this.storageService.user.username,
        codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
        contratante: this.cotizacion.contratante.id,
        codRamo: this.CONSTANTS.RAMO,
        codProducto: this.poliza.tipoProducto, //JSON.parse(localStorage.getItem('codProducto'))['productId'],//this.poliza.producto.COD_PRODUCT,
        codTipoPerfil: 0,//this.poliza.tipoPerfil.NIDPLAN,
        codProceso: '',
        mina: this.poliza.checkbox2.TRA_MIN,
        PolizaMatriz: this.poliza.checkbox1.POL_MAT,
        type_mov: this.cotizacion.tipoTransaccion,
        nroCotizacion: this.cotizacion.numeroCotizacion || 0,
        MontoPlanilla: this.trama.MONT_PLANILLA,
        CantidadTrabajadores: 1,//this.trama.TOT_ASEGURADOS,
        premium: (this.trama.PRIMA =
          this.trama.PRIMA === 0 ? this.trama.PRIMA_DEFAULT : this.trama.PRIMA),
        datosContratante: {
          codContratante: this.cotizacion.contratante.id, // sclient
          desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
          codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
          documento: this.cotizacion.contratante.numDocumento,
          nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
          apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
          apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
          fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
          nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY, // en caso sea null es Perú
        },
        datosPoliza: {
          tipoDocumento: this.cotizacion.contratante.tipoDocumento.id,
          numDocumento: this.cotizacion.contratante.numDocumento,
          codTipoNegocio: '0',//this.poliza.tipoPoliza.id,
          codTipoProducto: this.poliza.tipoProducto,//JSON.parse(localStorage.getItem('codProducto'))['productId'],//this.poliza.producto.COD_PRODUCT,
          codTipoPerfil: '0',//this.poliza.tipoPerfil.NIDPLAN,
          codTipoModalidad: '0',//this.poliza.modalidad.ID,
          codTipoPlan: '',//this.poliza.tipoPlan.ID_PLAN,
          codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
          codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
          InicioVigPoliza: CommonMethods.formatDate(
            this.poliza.fechaInicioPoliza
          ),
          FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
          InicioVigAsegurado: CommonMethods.formatDate(
            this.poliza.fechaInicioAsegurado
          ),
          FinVigAsegurado: CommonMethods.formatDate(
            this.poliza.fechaFinAsegurado
          ),
          CodActividadRealizar: 1,//this.poliza.tipoActividad.Id,
          CodCiiu: 1,//this.poliza.CodCiiu.Id,
          codTipoFacturacion: this.poliza.tipoFacturacion.id,
          codMon: this.poliza.moneda.NCODIGINT,
          desTipoPlan: "1",//this.poliza.tipoPlan.TIPO_PLAN,
          typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
          type_employee: '',
          branch: this.CONSTANTS.RAMO,
          nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
          trxCode: this.cotizacion.transac,
          commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
          //nuevos valores tarifario
          temporalidad: !!this.poliza.temporalidad
            ? this.poliza.temporalidad.id
            : 24,
          codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 1,
          tipoUbigeo: !!this.poliza.codTipoViaje
            ? this.poliza.codTipoViaje.id
            : 1,
          // codOrigen:
          //   !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1
          //     ? this.poliza.codOrigen.Id
          //     : !!this.poliza.codOrigen
          //     ? this.poliza.codOrigen.NCOUNTRY
          //     : 0,
          codUbigeo: 14,
          id_tarifario: this.poliza.id_tarifario,
          version_tarifario: this.poliza.version_tarifario,
          name_tarifario: this.poliza.name_tarifario,
          id_cotizacion: this.poliza.ncot_tarifario,
          proceso_anterior: this.poliza.proceso_anterior,
          modoEditar: this.cotizacion.modoRenovacionEditar,
          edminingreso: this.poliza.edminingreso,
          edmaxingreso: this.poliza.edmaxingreso,
          edminpermanencia: this.poliza.edminingreso,
          edmaxpermamencia: this.poliza.edmaxperman,
          sobrevivencia: this.poliza.sobrevivencia
        },
      };

      this.isLoadingChange.emit(true);

      this.DesgravamenDevolucionService.calcularCotizadorSinTrama(params).subscribe(
        (res) => {
          if (res.P_COD_ERR == 0) {
            if (this.cotizacion.tipoTransaccion == 0) {
              this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
            }
            this.trama = Object.assign(this.trama, res);
            this.trama.PRIMA =
              this.trama.PRIMA < this.trama.PRIMA_DEFAULT
                ? this.trama.PRIMA_DEFAULT
                : this.trama.PRIMA;
            this.trama.PRIMA_TOTAL = this.getPrima(res.amountPremiumList);
            this.trama.IGV = this.getPrima(res.amountPremiumList, false);
            this.primaNeta = this.trama.PRIMA;
            this.tramaChange.emit(this.trama);

            this.cotizador.calculado = true;
          } else {
            if (this.cotizacion.tipoTransaccion == 0) {
              this.cotizacion.brokers[0].P_COM_SALUD = 0;
            }
            swal.fire('Información', res.P_MESSAGE, 'error');
          }
          this.isLoadingChange.emit(false);
        },
        (error) => {
          swal.fire(
            'Información',
            'Ocurrió un error en el servidor, por favor intente de nuevo',
            'error'
          );
          this.isLoadingChange.emit(false);
        }
      );
    } else {
      if (validar) {
        swal.fire('Información', msgValidate, 'error');
      }
    }
  }
  cargaTabs() {
    const params = {
      codBranch: this.CONSTANTS.RAMO,
      codProduct: this.poliza.tipoProducto, // this.cotizacion.poliza.producto.codigo,
      IdProc: this.trama.NIDPROC,
      planId: this.poliza.tipoPlan?.ID_PLAN,
      channel: this.cotizacion.brokers.length > 0 ? this.cotizacion.brokers[0].COD_CANAL : 0,
      currency: this.poliza.moneda?.NCODIGINT,
      profile: this.poliza.tipoPerfil?.NIDPLAN,
      codPerfil: this.poliza.tipoPerfil?.NIDPLAN,
      policyType: this.poliza.tipoPoliza?.id,
      collocationType: this.poliza.modalidad?.ID,
      billingType: this.poliza.tipoFacturacion?.id,
    };
/*
    this.DesgravamenDevolucionService.getAssits(params).subscribe(
      (res) => {
        this.asistencias = res.ListAssists;
      },
      (error) => { }
    );
*/
/*
    this.DesgravamenDevolucionService.getBenefits(params).subscribe(
      (res) => {
        this.beneficios = res.ListBenefits;
      },
      (error) => { }
    );
/*
    this.DesgravamenDevolucionService.getSurcharges(params).subscribe(
      (res) => {
        this.recargos = res.ListSurcharges;
      },
      (error) => { }
    );
      */
  }


  // esto abre el modal
  clickProponer() {
    //if (!!this.cotizacion.poliza.producto.codigo) {
      this.cargaTabs();
      this.tabCoberturas = true;
      this.tabAsistencias = false;
      this.tabBeneficios = false;
      this.tabRecargos = false;
      this.show.coberturas = true;
      this.primaNeta = this.trama.PRIMA;
      /*
    } else {
      swal.fire(
        'Información',
        'Debe los elegir los datos de la póliza',
        'error'
      );
    }
    */
  }

  clickGuardarCover(event: any, action?: string, codigo?: any) {
    // console.log(this.cotizacion.brokers);
    const params = {
      flagCalcular:
        this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId
          ? 1
          : 0,
      codUsuario: this.storageService.userId,
      desUsuario: this.storageService.user.username,
      codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
      contratante: this.cotizacion.contratante.id,
      codRamo: this.CONSTANTS.RAMO,
      codProducto: this.poliza.tipoProducto, //this.poliza.producto.COD_PRODUCT,
      codTipoPerfil: 0,
      CantidadTrabajadores: 1,// this.trama.TOT_ASEGURADOS,
      codProceso: this.trama.NIDPROC,
      mina: this.poliza.checkbox2.TRA_MIN,
      PolizaMatriz: this.validarAforo()
        ? this.poliza.checkbox1.POL_MAT
        : 0,
      type_mov: this.cotizacion.tipoTransaccion,
      nroCotizacion: this.cotizacion.numeroCotizacion || 0,
      datosContratante: {
        codContratante: this.cotizacion.contratante.id, // sclient
        desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
        codDocumento: this.cotizacion.contratante.tipoDocumento.codigo, // Tipo de documento
        documento: this.cotizacion.contratante.numDocumento,
        nombre: this.cotizacion.contratante.nombres == null ? this.cotizacion.contratante.cliente360.P_SLEGALNAME : this.cotizacion.contratante.nombres, // En caso de ruc es razon social
        apePaterno: this.cotizacion.contratante.apellidoPaterno, // solo si es persona natural
        apeMaterno: this.cotizacion.contratante.apellidoMaterno, // solo si es persona natural
        fechaNacimiento: !!this.cotizacion.contratante.cliente360.P_DBIRTHDAT ? this.cotizacion.contratante.cliente360.P_DBIRTHDAT : new Date, // en caso de ruc es fecha de creacion sino fecha actual
        nacionalidad: this.cotizacion.contratante.cliente360.P_NNATIONALITY, // en caso sea null es Perú
      },
      datosPoliza: {
        codTipoNegocio: '0',
        codTipoProducto: this.poliza.tipoProducto,//this.poliza.producto.COD_PRODUCT,
        codTipoPerfil: '0',
        codTipoModalidad: '0',
        codTipoPlan: '',
        codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
        codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
        InicioVigPoliza: CommonMethods.formatDate(
          this.poliza.fechaInicioPoliza
        ),
        FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
        InicioVigAsegurado: CommonMethods.formatDate(
          this.poliza.fechaInicioAsegurado
        ),
        FinVigAsegurado: CommonMethods.formatDate(
          this.poliza.fechaFinAsegurado
        ),
        CodActividadRealizar: 1,
        CodCiiu: 1,
        codTipoFacturacion: this.poliza.tipoFacturacion.id,
        codMon: this.poliza.moneda.NCODIGINT,
        desTipoPlan: 1,//this.poliza.tipoPlan.TIPO_PLAN,
        nproduct: this.poliza.tipoProducto, //this.poliza.producto.COD_PRODUCT,
        typeTransac: this.CONSTANTS.TRANSACTION_CODE.EMISION,
        type_employee: 1,
        branch: this.CONSTANTS.RAMO,
        poliza_matriz: this.validarAforo()
          ? this.poliza.checkbox1.POL_MAT
          : true,
        nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
        trxCode: this.cotizacion.transac,
        commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
        //nuevos valores tarifario
        temporalidad: !!this.poliza.temporalidad
          ? this.poliza.temporalidad.id
          : 24,
        codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 1,
        tipoUbigeo: !!this.poliza.codTipoViaje
          ? this.poliza.codTipoViaje.id
          : 1,
        // codOrigen:
        //   !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1
        //     ? this.poliza.codOrigen.Id
        //     : !!this.poliza.codOrigen
        // ? this.poliza.codOrigen.NCOUNTRY
        // : 0,
        codUbigeo:14,
        id_tarifario: this.poliza.id_tarifario,
        version_tarifario: this.poliza.version_tarifario,
        name_tarifario: this.poliza.name_tarifario,
        id_cotizacion: 0,
        proceso_anterior: this.poliza.proceso_anterior,
        modoEditar: this.cotizacion.modoRenovacionEditar,
        edminingreso: this.poliza.edminingreso,
        edmaxingreso: this.poliza.edmaxingreso,
        edminpermanencia: this.poliza.edminingreso,
        edmaxpermamencia: this.poliza.edmaxperman,
        sobrevivencia: this.poliza.sobrevivencia
      },
      lcoberturas: [],
      lasistencias: [],
      lbeneficios: [],
      lrecargos: [],
    };

    var edadesEnt = {
      "min": this.poliza.edminingreso,
      "max": this.poliza.edmaxingreso,
      "@base": this.poliza.edmaxperman
    };

    var edadesStay ={
      "min": this.poliza.edminingreso,
      "max": this.poliza.edmaxperman,
      "@base": this.poliza.edmaxperman
    };

    (this.coberturas || []).forEach((item) => {
      if (action == 'coberturas') {
        if (item.codCobertura == codigo) {
          item.cobertura_adi = event.checked ? 1 : 0;
        }
      }
      if (item.cobertura_adi != '0') {
        item.capital_prop = item.capital_prop != "0" && item.capital_prop != "" ? item.capital_prop : item.capital,
          // this.validarPropuesto(item)
          params.lcoberturas.push({
            codCobertura: item.codCobertura,
            sumaPropuesta: item.capital_prop,
            capital: item.capital,
            capitalCovered: item.capitalCovered,
            capital_aut: item.capital_aut,
            capital_max: item.capital_max,
            capital_min: item.capital_min,
            capital_prop: item.capital_prop,
            cobertura_adi: item.cobertura_adi,
            cobertura_pri: item.cobertura_pri,
            descripcion: item.descripcion,
            entryAge: edadesEnt,
            hours: item.hours,
            ncover: item.ncover,
            stayAge: edadesStay,
            limit: item.codCobertura == '1154' ? this.cotizacion.poliza.sobrevivencia : 0,
            suma_asegurada: item.suma_asegurada,
            items: item.items
          });
      }
    });
/*
    (this.asistencias || []).forEach((item) => {
      if (action == 'asistencias') {
        if (item.codAssist == codigo) {
          item.sMark = event.checked ? 1 : 0;
        }
      }
      if (item.sMark != '0') {
        params.lasistencias.push({
          codAsistencia: item.codAssist,
          desAssist: item.desAssist,
          document: item.document,
          provider: item.provider,
          sMark: item.sMark
        });
      }
    });

    (this.beneficios || []).forEach((item) => {
      if (action == 'beneficios') {
        if (item.codBenefit == codigo) {
          item.sMark = event.checked ? 1 : 0;
        }
      }
      if (item.sMark != '0') {
        params.lbeneficios.push({
          codBeneficio: item.codBenefit,
          desBenefit: item.desBenefit,
          sMark: item.sMark
        });
      }
    });

    (this.recargos || []).forEach((item) => {
      if (action == 'recargos') {
        if (item.codSurcharge == codigo) {
          item.sMark = event.checked ? 1 : 0;
        }
      }
      if (item.sMark != '0') {
        params.lrecargos.push({
          codRecargo: item.codSurcharge,
          desRecargo: item.desSurcharge,
          amount: item.value,
          sMark: item.sMark
        });
      }
    });
*/
    const myFormData: FormData = new FormData();
    // myFormData.append('fileASeg', this.trama.excelSubir);
    myFormData.append('dataCalcular', JSON.stringify(params));

    //console.log(params);

    this.isLoadingChange.emit(true);
    this.DesgravamenDevolucionService
      .SaveCoberturas(myFormData)
      .subscribe(
        (res) => {
          this.cotizacion.calcularCober = true;
          
          this.isLoadingChange.emit(false);
        },
        (error) => {
          this.cotizacion.calcularCober = false;
          this.isLoadingChange.emit(false);
        }
      );
  }

  validarAforo() {
    let flag = true;
    if (!!this.cotizacion.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        if (this.cotizacion.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.DESGRAVAMEN_DEVOLUCION) {
          flag = false;
        }
      }

      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
        if (this.cotizacion.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
          flag = false;
        }
      }
    }

    return flag;
  }

  trabajadoresChange(event: any) {
    this.coberturas = [];
    this.trama.amountPremiumList = [];
    this.trama.SUM_ASEGURADA = 0;
    this.trama.PRIMA = 0;
    this.trama.validado = false;
    this.cotizador.calculado = false;
    // this.limpiarCotizador();
  }

  limpiarCotizador() {
    this.trama.validado = false;
    this.trama.TOT_ASEGURADOS = 1;
    this.trama.MONT_PLANILLA = 0;
    this.trama.PRIMA = this.trama.PRIMA_DEFAULT;
    this.trama.SUM_ASEGURADA = 0;
    this.cotizador.calculado = false;
    // this.trama = {};
    this.coberturas = [];
    this.primaNeta = this.trama.PRIMA_DEFAULT;
  }

  downloadFile(filePath) {
    this.othersService.downloadFile(filePath).subscribe((res) => {
      this.fileService.download(filePath, res);
    });
  }

  proponeSA() {
    if (!this.proponerSumaAsegurada && !this.detail) {
      (this.coberturas || []).forEach((item) => {
        item.capital_prop = '';
      });
    }
  }

  clickCancel() {
    (this.coberturas || []).forEach((item) => {
      if (item.capital_prop !== 0) {
        item.capital_prop = 0;
      }
    });
  }

  validarCampos(): any {
    let msg = '';
    let edadmin = 0;
    let edadmax = 0;
    let edadperm = 0;
    if (
      !this.cotizacion.contratante.tipoDocumento ||
      !this.cotizacion.contratante.numDocumento
    ) {
      msg += 'Debe ingresar un contratante <br>';
    }

    if (
      !this.cotizacion.poliza.tipoRenovacion ||
      !this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION
    ) {
      msg += 'Debe elegir el tipo de renovación  <br>';
    }
    if (
      !this.cotizacion.poliza.moneda ||
      !this.cotizacion.poliza.moneda.NCODIGINT
    ) {
      msg += 'Debe elegir una moneda  <br>';
    }

    if (
      !this.cotizacion.poliza.frecuenciaPago ||
      !this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA
    ) {
      msg += 'Debe elegir la frecuencia de pago  <br>';
    }

    if (!this.cotizacion.poliza.fechaInicioPoliza) {
      msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
    }
    if (this.cotizacion.brokers.length === 0) {
      msg += 'Debe ingresar un broker  <br>';
    }
    
    else
    {
      if(this.cotizacion.brokers[0].P_COM_SALUD_PRO == '0' || this.cotizacion.brokers[0].P_COM_SALUD_PRO == ''){
        msg += 'Por favor ingresar una comisión para el broker  <br>'
      }
    }
/*
    if (this.trama.TOT_ASEGURADOS == 0) {
      msg += 'Debe ingresar al menos un trabajador  <br>';
    }

    if (!!this.cotizacion.poliza.codTipoViaje && this.cotizacion.poliza.codTipoViaje.id == 1) {
      if (!this.cotizacion.poliza.codDestino || !this.cotizacion.poliza.codDestino.Id) {
        msg += 'Debe elegir un departamento  <br>';
      }
    }
*/
    if (this.cotizacion.poliza.listReglas.flagAlcance) {
      if (!this.cotizacion.poliza.codAlcance || !this.cotizacion.poliza.codAlcance.id) {
        msg += 'Debe elegir el alcance  <br>';
      }
    }

    // if (this.verificarPerfilEstudiantil()) {
    if (this.cotizacion.poliza.listReglas.flagTemporalidad) {
      if (!this.cotizacion.poliza.temporalidad || !this.cotizacion.poliza.temporalidad.id) {
        msg += 'Debe elegir la temporalidad  <br>';
      }
    }
    if (!this.cotizacion.poliza.sobrevivencia ||
      this.cotizacion.poliza.sobrevivencia == '0') {
      msg += 'Debe ingresar un % de sobrevivencia  <br>';
    }

    if (!this.cotizacion.poliza.edminingreso ||
      this.cotizacion.poliza.edminingreso == '0') {
      msg += 'Debe ingresar una edad mínima de ingreso  <br>';
    }
    else
    {
      edadmin = this.cotizacion.poliza.edminingreso;
    }

    if (!this.cotizacion.poliza.edmaxingreso ||
      this.cotizacion.poliza.edmaxingreso == '0') {
      msg += 'Debe ingresar una edad máxima de ingreso  <br>';
    }
    else
    {
      edadmax = this.cotizacion.poliza.edmaxingreso;
    }


    if (!this.cotizacion.poliza.edmaxperman ||
      this.cotizacion.poliza.edmaxperman == '0') {
      msg += 'Debe ingresar una edad máxima de permanencia  <br>';
    }
    else
    {
      edadperm = this.cotizacion.poliza.edmaxperman;
    }

    if (edadmin != 0 && edadmax != 0 && edadperm != 0){
      if (parseInt(edadmin.toString()) >= parseInt(edadmax.toString()) || parseInt(edadmax.toString()) >= parseInt(edadperm.toString()))
      {
        msg += 'Verificar que el rango de edades sea el correcto (Mínima de Ingreso < Máxima de Ingreso < Máxima de permanencia)  <br>';
      }
    }
    
    if (!this.cotizacion.poliza.tasasegurodesdev ||
      this.cotizacion.poliza.tasasegurodesdev == '0' ||
      Number(this.cotizacion.poliza.tasasegurodesdev) > 100) {
        msg += 'Debe ingresar una tasa de seguro  <br>';
      }

    if (!this.cotizacion.poliza.tasaahorrodesdev ||
        this.cotizacion.poliza.tasaahorrodesdev == '0' ||
        Number(this.cotizacion.poliza.tasaahorrodesdev) > 100) {
          msg += 'Debe ingresar una tasa de ahorro  <br>';
      }
      if ((Number(this.cotizacion.poliza.tasasegurodesdev)+Number(this.cotizacion.poliza.tasaahorrodesdev)) > 100) {
        msg += 'La suma de tasa de seguro + tasa de ahorro no debe superar el 100%  <br>';
      }

    if (!this.cotizacion.poliza.cumulomaxdesdev ||
        this.cotizacion.poliza.cumulomaxdesdev == '0') {
          msg += 'Debe ingresar un cúmulo máximo por asegurado  <br>';
      }


    return msg;
  }

  verificarPerfilEstudiantil() {
    let flag = false;
    if (!!this.cotizacion.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
          flag = true;
        }
      }

      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
        if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.cotizacion.poliza.tipoPerfil.NIDPLAN)) {
          flag = true;
        }
      }
    }

    return flag;
  }

  showTabs(tab) {
    switch (tab) {
      case '1':
        this.tabCoberturas = true;
        this.tabAsistencias = false;
        this.tabBeneficios = false;
        this.tabRecargos = false;
        break;
      case '2':
        this.tabCoberturas = false;
        this.tabAsistencias = true;
        this.tabBeneficios = false;
        this.tabRecargos = false;
        break;
      case '3':
        this.tabCoberturas = false;
        this.tabAsistencias = false;
        this.tabBeneficios = true;
        this.tabRecargos = false;
        break;
      case '4':
        this.tabCoberturas = false;
        this.tabAsistencias = false;
        this.tabBeneficios = false;
        this.tabRecargos = true;
        break;
      default:
        this.tabCoberturas = true;
        this.tabAsistencias = false;
        this.tabBeneficios = false;
        this.tabRecargos = false;
    }
  }

  validarPropuesto(item: any) {
    item.message = "";
    if (item.capital_prop != "") {
      if (Number(item.capital_prop) < item.capital_min) {
        item.capital_prop = item.capital;
        item.message = "La suma asegurada a proponer debe estar entre " + item.capital_min + " y " + item.capital_max;
      }

      if (Number(item.capital_prop) > item.capital_max) {
        item.capital_prop = item.capital_max;
        item.message = "La suma asegurada a proponer debe estar entre " + item.capital_min + " y " + item.capital_max;
      }
    }
  }

  verificarInputSA(item: any) {
    let disabled = true;

    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
      this.cotizacion.modoVista == undefined) {
      if (item.cobertura_adi == 1) {
        disabled = false;
      }
    }

    return disabled;
  }

  verificarTextSA() {
    let label = 'S.A. autorizada';

    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar) ||
      this.cotizacion.modoVista == undefined) {
      label = 'Proponer S.A.';
    }

    return label;
  }

  verificarColumnPropuesto() {
    let columnVisible = false;

    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar) ||
      this.cotizacion.modoVista == undefined) {
      columnVisible = true;
    }

    return columnVisible;
  }

  verificarProponer(flag: any) {
    let mostrar = false;

    if ((this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR) && flag == 1) {
      mostrar = true;
    }

    if ((this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.RENOVAR ||
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.INCLUIR) && flag == 2) {
      mostrar = true;
    }

    return mostrar;
  }

  verificarFlag(item: any, atr: any) {
    let disabled = false;
    if (atr == 1) { // coberturas
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
        this.cotizacion.modoVista == undefined) {
        if (item.cobertura_pri == 1 ) { //|| !this.cotizacion.poliza.listReglas.flagCobertura
          disabled = true;
        }
      }
      else {
        disabled = true;
      }
    }

    if (atr == 2) { // asistencias
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
        this.cotizacion.modoVista == undefined) {
        if (!this.cotizacion.poliza.listReglas.flagAsistencia) {
          disabled = true;
        }
      }
      else {
        disabled = true;
      }
    }

    if (atr == 3) { // beneficios
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
        this.cotizacion.modoVista == undefined) {
        if (!this.cotizacion.poliza.listReglas.flagBeneficio) {
          disabled = true;
        }
      }
      else {
        disabled = true;
      }
    }

    if (atr == 4) {
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        this.cotizacion.modoVista == undefined) {
        disabled = true;
      }
    }

    if (atr == 5) { // recargos falta modificar flag
      if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
        (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
        this.cotizacion.modoVista == undefined) {
        if (!this.cotizacion.poliza.listReglas.flagBeneficio) {
          disabled = true;
        }
      }
      else {
        disabled = true;
      }
    }

    return disabled;
  }

  getPrima(amountPremiumList, flag = true) {
    let amount = 0;
    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 1) {
      amount = flag ? amountPremiumList[3].NPREMIUMN_ANU : amountPremiumList[2].NPREMIUMN_ANU;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 2) {
      amount = flag ? amountPremiumList[3].NPREMIUMN_SEM : amountPremiumList[2].NPREMIUMN_SEM;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 3) {
      amount = flag ? amountPremiumList[3].NPREMIUMN_TRI : amountPremiumList[2].NPREMIUMN_TRI;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 4) {
      amount = flag ? amountPremiumList[3].NPREMIUMN_BIM : amountPremiumList[2].NPREMIUMN_BIM;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 5) {
      amount = flag ? amountPremiumList[3].NPREMIUMN_MEN : amountPremiumList[2].NPREMIUMN_MEN;
    }

    if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA === 6) {
      amount = flag ? amountPremiumList[3].NPREMIUMN_ESP : amountPremiumList[2].NPREMIUMN_ESP;
    }

    return amount;
  }
}
