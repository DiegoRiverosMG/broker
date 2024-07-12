import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { CommonMethods } from '../../../../common-methods';
import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { QuotationService } from '../../../../../services/quotation/quotation.service';
import { ValErrorComponent } from '../../../../../modal/val-error/val-error.component';
import { DesgravamenDevolucionConstants } from '../../core/constants/desgravamen-devolucion.constants';
import { DesgravamenDevolucionService } from '../../desgravamen-devolucion.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'panel-info-trama',
  templateUrl: './panel-info-trama.component.html',
  styleUrls: ['./panel-info-trama.component.css'],
})
export class PanelInfoTramaComponent implements OnInit, OnChanges {
  @Input() detail: boolean;
  @Input() trama: any;
  @Output() tramaChange: EventEmitter<any> = new EventEmitter();
  @Input() isLoading: any;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
  @Input() recargar: any;
  @Output() recargarChange: EventEmitter<any> = new EventEmitter();
  @Input() poliza: any;
  @Input() cotizacion: any;
  @Input() esMina: any;
  @Input() zeroBroker: any;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  variable: any = {};
  CONSTANTS: any = DesgravamenDevolucionConstants;

  constructor(
    public clientInformationService: ClientInformationService,
    private DesgravamenDevolucionService: DesgravamenDevolucionService,
    public quotationService: QuotationService,
    private storageService: StorageService,
    private modal: NgbModal
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
  }

  ngOnInit() {
    this.trama = this.trama || {};
    this.tramaChange.emit(this.trama);

    if (!this.cotizacion.modoTrama) {
      this.trama.PRIMA = "0";
      this.trama.PRIMA_DEFAULT = "0";
    }

    // Configuracion de las variables
    this.variable = CommonMethods.configuracionVariables(
      this.codProducto,
      this.epsItem.NCODE
    );

  }

  ngOnChanges(changes) {
    if (changes.recargar && changes.recargar.currentValue === true) {
      setTimeout(() => {
        this.recargarChange.emit(false);
      });
      this.cambiaDatosPoliza();
    }

    if (changes.esMina &&
      changes.esMina.previousValue !== undefined
    ) {
      this.validarExcel(false);
    }

    if (changes.zeroBroker && changes.zeroBroker.previousValue !== undefined) {
      this.validarExcel(false)
    }
  }

  // obtenerPrimaMinima() {
  //   this.DesgravamenDevolucionService.obtenerPrimaMinima().subscribe((res) => {
  //     this.trama.PRIMA = "0" //res.premium;
  //     this.trama.PRIMA_DEFAULT = "0" //res.premium;
  //   });
  // }

  cambiaDatosPoliza() {
    if (this.cotizacion.trama.validado &&
      this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
      this.validarTrama();
    } else {
      this.validarExcel();
    }

  }

  validarExcel(validar?) {
    let msg = '';
    let edadmin = 0;
    let edadmax = 0;
    let edadperm = 0;

    if (!this.cotizacion.contratante.tipoDocumento || !this.cotizacion.contratante.numDocumento) {
      msg += 'Debe ingresar un contratante <br>';
    }

    if (this.cotizacion.brokers.length <= 1) {
      msg += 'Debe ingresar dos brokers  <br>';
    }
    else {
      if (this.cotizacion.brokers[0].P_COM_SALUD_PRO == '0' || this.cotizacion.brokers[0].P_COM_SALUD_PRO == '') {
        msg += 'Debe ingresar una comisión para el broker I <br>'
      }
      if (this.cotizacion.brokers[1].P_COM_SALUD_PRO == '0' || this.cotizacion.brokers[1].P_COM_SALUD_PRO == '') {
        msg += 'Debe ingresar una comisión para el broker II <br>'
      }
      if (Number(this.cotizacion.brokers[0].P_COM_SALUD_PRO) + Number(this.cotizacion.brokers[1].P_COM_SALUD_PRO) > 100) {
        msg += 'La suma de comisiones de los brokers es mayor a 100 <br>'
      }
    }

    if (!this.poliza.tipoRenovacion ||
      !this.poliza.tipoRenovacion.COD_TIPO_RENOVACION) {
      msg += 'Debe elegir el tipo de renovación  <br>';
    }

    if (!this.poliza.frecuenciaPago ||
      !this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA) {
      msg += 'Debe elegir la frecuencia de pago  <br>';
    }

    if (!this.poliza.fechaInicioPoliza) {
      msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
    }

    if (!this.cotizacion.poliza.moneda || !this.cotizacion.poliza.moneda.NCODIGINT) {
      msg += 'Debe elegir la moneda  <br>';
    }

    if ((this.trama.excelSubir || []).length == 0) {
      msg += 'Adjunte una trama para validar  <br>';
    }
    // validaciones nuevas tarifario //
    if (this.cotizacion.poliza.listReglas.flagAlcance) {
      if (!this.cotizacion.poliza.codAlcance || !this.cotizacion.poliza.codAlcance.id) {
        msg += 'Debe elegir el alcance  <br>';
      }
    }

    // estudiantil
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
    else {
      edadmin = this.cotizacion.poliza.edminingreso;
    }

    if (!this.cotizacion.poliza.edmaxingreso ||
      this.cotizacion.poliza.edmaxingreso == '0') {
      msg += 'Debe ingresar una edad máxima de ingreso  <br>';
    }
    else {
      edadmax = this.cotizacion.poliza.edmaxingreso;
    }


    if (!this.cotizacion.poliza.edmaxperman ||
      this.cotizacion.poliza.edmaxperman == '0') {
      msg += 'Debe ingresar una edad máxima de permanencia  <br>';
    }
    else {
      edadperm = this.cotizacion.poliza.edmaxperman;
    }

    if (edadmin != 0 && edadmax != 0 && edadperm != 0) {
      if (parseInt(edadmin.toString()) >= parseInt(edadmax.toString()) || parseInt(edadmax.toString()) >= parseInt(edadperm.toString())) {
        msg += 'Verificar que el rango de edades sea el correcto (Mínima de Ingreso < Máxima de Ingreso < Máxima de permanencia)  <br>';
      }
    }
    // viajes
    // if(!this.cotizacion.poliza.codTipoViaje || !this.cotizacion.poliza.codTipoViaje.id ){
    //   msg += 'Debe elegir el tipo de viaje  <br>';
    // }

    if (!this.cotizacion.poliza.tasasegurodesdev ||
      this.cotizacion.poliza.tasasegurodesdev == '0' ||
      Number(this.cotizacion.poliza.tasasegurodesdev) > 100) {
        msg += 'Debe ingresar una tasa de seguro  <br>';
      }

    if (!this.cotizacion.poliza.tasaahorrodesdev ||
        this.cotizacion.poliza.tasaahorrodesdev == '0'  ||
        Number(this.cotizacion.poliza.tasaahorrodesdev) > 100) {
          msg += 'Debe ingresar una tasa de ahorro  <br>';
      }
      if ((Number(this.cotizacion.poliza.tasasegurodesdev) + Number(this.cotizacion.poliza.tasaahorrodesdev)) > 100) {
        msg += 'La suma de tasa de seguro + tasa de ahorro no debe superar el 100%  <br>';
     }

    if (!this.cotizacion.poliza.cumulomaxdesdev ||
        this.cotizacion.poliza.cumulomaxdesdev == '0') {
          msg += 'Debe ingresar un cúmulo máximo por asegurado  <br>';
      }


    if (!!this.cotizacion.poliza.codTipoViaje && this.cotizacion.poliza.codTipoViaje.id == 1) {

      /*   if(!this.cotizacion.poliza.codOrigen || !this.cotizacion.poliza.codOrigen.Id ){
          msg += 'Debe elegir un origen  <br>';
        } */
      if (!this.cotizacion.poliza.codDestino || !this.cotizacion.poliza.codDestino.Id) {
        msg += 'Debe elegir un departamento  <br>';
      }
    } /* else if (!!this.cotizacion.poliza.codTipoViaje && this.cotizacion.poliza.codTipoViaje.id == 2){
      if(!this.cotizacion.poliza.codOrigen || !this.cotizacion.poliza.codOrigen.NCOUNTRY){
        msg += 'Debe elegir un origen  <br>';
      }
      if(!this.cotizacion.poliza.codDestino || !this.cotizacion.poliza.codDestino.NCOUNTRY){
        msg += 'Debe elegir un destino  <br>';
      }
    } */

    // validaciones personalizadas para endoso
    /*if (this.cotizacion.tipoTransaccion == 8) {
      if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA < this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA) {
        msg += 'La frecuencia de pago no aplica para la facturación restante<br>';
      }
      else {
        if (this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA == 4 && Number(this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA) == 3) {
          msg += 'La frecuencia de pago no aplica para la facturación restante<br>';
        }
      }
    }*/

    if (msg === '') {
      this.validarTrama();
    } else {
      this.trama.infoPrimaList = [];
      this.trama.infoPlanList = [];
      this.clearTrama();
      this.isLoadingChange.emit(false);

      if (validar) {
        swal.fire('Información', msg, 'error');
      }
    }
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

  validarTrama(codComission?: any) {
    this.isLoadingChange.emit(true);
    this.trama.infoPrimaList = [];
    this.trama.infoPlanList = [];
    const myFormData: FormData = new FormData();
    const data: any = {
      codUsuario: JSON.parse(localStorage.getItem('currentUser'))['id'],
      desUsuario: this.storageService.user.username,
      codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
      contratante: this.cotizacion.contratante.id,
      nroPoliza: this.cotizacion.poliza.nroPoliza,
      fechaEfecto: this.cotizacion.tipoTransaccion != 3 ?
        this.cotizacion.tipoTransaccion == 0 && this.cotizacion.tipoTransaccion == 1 ?
        CommonMethods.formatDate(this.poliza.fechaInicioPoliza) :
        CommonMethods.formatDate(this.poliza.fechaInicioAsegurado) :
        CommonMethods.formatDate(this.poliza.fechaExclusion),
      fechaExclusion: CommonMethods.formatDate(this.poliza.fechaExclusion),
      tipoExclusion: this.cotizacion.contratante.codTipoCuenta == '1' ? 3 : CommonMethods.formatDate(this.poliza.fechaInicioPoliza) == CommonMethods.formatDate(this.poliza.fechaExclusion) ? 1 : 2,
      devolucionPrima: !!this.cotizacion.devolucionPrima && this.cotizacion.devolucionPrima.DEV_PRI ? 1 : 0,
      fechaFin: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
      comision: 0,
      tipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
      freqPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
      type_mov: this.cotizacion.tipoTransaccion,
      codProducto: this.poliza.tipoProducto,//'10', //Cod Producto Desgravamen
      codTipoPerfil: '0',
      flagCot: this.detail
        ? this.cotizacion.modoVista ==
          this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
          this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
          this.cotizacion.modoVista ==
          this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR || this.cotizacion.modoVista ==
          this.CONSTANTS.MODO_VISTA.ENDOSO ? 2 : 1 : 0,
      planillaMax: 0,
      topeLey: 0,
      fechaActual: null,
      codProceso: this.trama.NIDPROC,
      planTariffList: [
        {
          planId: '',
          planDes: '',
          prima: '',
        },
      ],
      codActividad: '',
      flagComisionPro: 0,
      comisionPro: 0,
      tasaObreroPro: 0,
      tasaEmpleadoPro: 0,
      flagPolizaEmision: 0,
      nroCotizacion: this.cotizacion.numeroCotizacion || 0,
      premiumPlan: null,
      premiumPlanPro: '',
      desPlan: '',
      codTipoProducto: '0',
      codTipoModalidad: '0',
      codTipoPlan: '',
      destipoplan: '',
      premiun: this.poliza.primaPropuesta,
      flagCalcular: this.poliza.checkbox1.POL_MAT ? 0 : 0,
      idproc: this.trama.NIDPROC,
      p_ntasa_calculada: 0,
      p_ntasa_prop: 0,
      p_npremium_min: 0,
      p_npremium_min_pr: 0,
      p_npremium_end: 0,
      p_nrate: 0,
      p_ndiscount: 0,
      p_nactivityvariaction: 0,
      p_flag: 0,
      codRamo: this.CONSTANTS.RAMO,
      mina: this.poliza.checkbox2.TRA_MIN,
      PolizaMatriz: this.poliza.checkbox1.POL_MAT,
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
        codTipoNegocio: '0',
        codTipoProducto: this.poliza.tipoProducto,//'10',
        codTipoPerfil: '0',
        codTipoModalidad: '0',
        codTipoPlan: '',
        codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
        codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
        InicioVigPoliza: CommonMethods.formatDate(this.poliza.fechaInicioPoliza),
        FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
        InicioVigAsegurado: CommonMethods.formatDate(this.poliza.fechaInicioAsegurado),
        FinVigAsegurado: CommonMethods.formatDate(this.poliza.fechaFinAsegurado),
        CodActividadRealizar: '0',
        CodCiiu: '0',
        codTipoFacturacion: this.poliza.tipoFacturacion.id,
        codMon: this.poliza.moneda.NCODIGINT,
        desTipoPlan: '',
        nproduct: '',
        typeTransac: this.poliza.checkbox1.POL_MAT
          ? this.CONSTANTS.TRANSACTION_CODE.EMISION
          : this.CONSTANTS.TRANSACTION_CODE.COTIZACION,
        type_employee: 1,
        branch: this.CONSTANTS.RAMO,
        nid_cotizacion: this.cotizacion.numeroCotizacion || 0,
        trxCode: this.cotizacion.transac,
        commissionBroker: this.cotizacion.brokers[0].P_COM_SALUD_PRO || 0,
        //nuevos valores tarifario
        temporalidad: !!this.poliza.temporalidad ? this.poliza.temporalidad.id : 24,
                codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 2,
        tipoUbigeo: !!this.poliza.codTipoViaje ? this.poliza.codTipoViaje.id : 0,
        //  codOrigen: !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1 ? this.poliza.codOrigen.Id : !!this.poliza.codOrigen ? this.poliza.codOrigen.NCOUNTRY : 0,
        codUbigeo: 14,
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
        sobrevivencia: this.poliza.sobrevivencia,
        tasa_seguro: this.poliza.tasasegurodesdev,
        tasa_ahorro: this.poliza.tasaahorrodesdev,
        cumulo_asegurado: this.poliza.cumulomaxdesdev
      },
    };

    myFormData.append('dataFile', this.trama.excelSubir);
    myFormData.append('objValida', JSON.stringify(data));


    this.quotationService.valTrama(myFormData).subscribe(
      (res) => {
        this.cotizacion.calcularCober = false;
        this.isLoadingChange.emit(false);

        const erroresList = res.baseError.errorList;

        if (res.P_COD_ERR === '1') {
          this.clearTrama();

          if (erroresList.length > 0) {
            // this.trama = {}
            // this.tramaChange.emit(this.trama);
            this.verficaTramaErrores(erroresList);
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
              // this.trama.validado = false;
              this.trama.excelSubir = null
              this.tramaChange.emit(this.trama);
              this.cotizacion.estadoDeuda = 'Deuda';
              this.cotizacion.montoDeuda = 0;
            }
          } else {
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
              this.trama.validado = false;
              this.trama.excelSubir = null
              this.cotizacion.estadoDeuda = 'Deuda';
              this.cotizacion.montoDeuda = 0;
            }
            swal.fire('Información', res.P_MESSAGE, 'error');
          }
        } else {
          if (erroresList != null) {
            if (erroresList.length > 0) {
              // this.trama = {}
              if (this.cotizacion.tipoTransaccion == 0) {
                this.cotizacion.brokers[0].P_COM_SALUD = 0;
              }
              this.trama.validado = false;
              this.tramaChange.emit(this.trama);
              this.verficaTramaErrores(erroresList);
              if (this.cotizacion.modoTrama == false) {
                // this.obtenerPrimaMinima();
                this.trama.TOT_ASEGURADOS = 1;
                this.trama.SUM_ASEGURADA = 0;
              }
            } else {
              if (this.cotizacion.tipoTransaccion == 0) {
                this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
              }
              // if (this.cotizacion.transac != 'EN') {
                this.trama = Object.assign(this.trama || {}, res || {});
                this.trama.PRIMA_TOTAL = this.detail
                  ? res.amountPremiumListAut[3].NPREMIUMN_ANU
                  : this.getPrima(res.amountPremiumList);
                this.trama.IGV = this.detail
                  ? res.amountPremiumListAut[2].NPREMIUMN_ANU
                  : this.getPrima(res.amountPremiumList, false);
                this.poliza.tasadesdev = res.p_ntasa_calculada_desdev
                this.tramaChange.emit(this.trama);
              // } else {
              //   this.trama = Object.assign(this.trama || {}, res || {});
              //   this.tramaChange.emit(this.trama);
              // }

              if (this.detail && this.cotizacion.transac != 'EN') {
                this.cotizacion.cotizador.amountPremiumListAnu =
                  res.amountPremiumListAnu;
                this.cotizacion.cotizador.amountPremiumListAut =
                  res.amountPremiumListAut;
                this.cotizacion.cotizador.amountPremiumListProp =
                  res.amountPremiumListProp;
                this.cotizacion.estadoDeuda = 'Anulación';
                this.cotizacion.montoDeuda = this.cotizacion.trama.PRIMA_TOTAL;
              }

              this.trama.validado = true;

              if (res.P_COD_ERR === '2') {
                swal.fire({
                  title: 'Información',
                  text: res.P_QUESTION,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Continuar',
                  allowOutsideClick: false,
                  cancelButtonText: 'Cancelar'
                })
                  .then(async (result) => {
                    if (!result.value) {
                      this.clearTrama();
                    } else {
                      return;
                    }
                  });
              } else {
                swal.fire('Información', res.P_MESSAGE, 'success');
              }
            }
          } else {
            swal.fire(
              'Información',
              'El archivo enviado contiene errores',
              'error'
            );
          }
        }
      },
      (error) => {
        this.isLoadingChange.emit(false);
      }
    );
  }

  clearTrama() {
    this.trama.validado = false;

    if (this.cotizacion.tipoTransaccion == 0 && this.cotizacion.brokers.length > 0) {
      this.cotizacion.brokers[0].P_COM_SALUD = 0;
    }

    if (!this.cotizacion.modoTrama) {
      this.trama.TOT_ASEGURADOS = 0;
      this.trama.SUM_ASEGURADA = 0;
      this.trama.PRIMA = 0;
    }
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

  verficaTramaErrores(erroresList) {
    this.trama.codProceso = null;
    const modalRef = this.modal.open(ValErrorComponent, {
      size: 'lg',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.erroresList = erroresList;
  }
}
