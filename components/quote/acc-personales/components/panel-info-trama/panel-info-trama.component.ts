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
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
import { AccPersonalesService } from '../../acc-personales.service';
import { StorageService } from '../../core/services/storage.service';
import { ViewCouponComponent } from '../../../../../modal/view-coupon/view-coupon.component';

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
    @Output() cotizacionChange: EventEmitter<any> = new EventEmitter();
    @Input() esMina: any;
    @Input() zeroBroker: any;
    @Input() cambiocontratante: any;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    variable: any = {};
    CONSTANTS: any = AccPersonalesConstants;
    p_nid_proc: string;


    constructor(
        public clientInformationService: ClientInformationService,
        private accPersonalesService: AccPersonalesService,
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

        if (this.cotizacion.modoTrama == true && this.cotizacion.esEstudiantil && (this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES == this.CONSTANTS.RAMO || this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO == this.CONSTANTS.RAMO)) {
            this.trama.validado = false;
            this.tramaChange.emit(this.trama);
        }
    }

    ngOnChanges(changes) {
        if (changes.recargar && changes.recargar.currentValue === true) {
            setTimeout(() => {
                this.recargarChange.emit(false);
            });

            if (this.trama.excelSubir != undefined) {
                this.cambiaDatosPoliza();
            }
        }

        if (changes.esMina &&
            changes.esMina.previousValue !== undefined
        ) {
            this.validarExcel(false);
        }

        if (changes.zeroBroker && changes.zeroBroker.previousValue !== undefined) {
            this.validarExcel(false)
        }

        if (changes.cambiocontratante && !changes.cambiocontratante.isFirstChange()) {
            if (changes.cambiocontratante.currentValue != changes.cambiocontratante.previousValue && changes.cambiocontratante.previousValue != 0) {
                this.clearTrama();
            }
        }
    }

    // obtenerPrimaMinima() {
    //   this.accPersonalesService.obtenerPrimaMinima().subscribe((res) => {
    //     this.trama.PRIMA = "0" //res.premium;
    //     this.trama.PRIMA_DEFAULT = "0" //res.premium;
    //   });
    // }

    cambiaDatosPoliza() {
        if (this.trama.excelSubir != undefined) {
            if (this.cotizacion.trama.validado && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                this.validarTrama();
            } else {
                this.validarExcel();
            }
        }
    }

    // GCAA 06022024
    verCupones() {
        if (this.p_nid_proc == '' || this.p_nid_proc == null) {
            swal.fire('Información', 'debe Validar la trama antes de ver los cupones', 'error');
            return;
        }
        this.ListaCupones(this.p_nid_proc);
    }


    validarExcel(validar?) {
        let msg = '';

        if (!this.cotizacion.contratante.tipoDocumento || !this.cotizacion.contratante.numDocumento) {
            msg += 'Debe ingresar un contratante <br>';
        }
        if (!this.poliza.tipoPoliza || !this.poliza.tipoPoliza.id) {
            msg += 'Debe elegir el tipo de producto  <br>';
        }

        if (!this.poliza.tipoPerfil || !this.poliza.tipoPerfil.NIDPLAN) {
            msg += 'Debe elegir el tipo de perfil  <br>';
        }

        if (!this.poliza.modalidad || !this.poliza.modalidad.ID) {
            msg += 'Debe elegir el tipo de modalidad  <br>';
        }
        if (this.cotizacion.brokers.length === 0) {
            msg += 'Debe ingresar un broker  <br>';
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

        if (!this.poliza.tipoPlan || !this.poliza.tipoPlan.ID_PLAN) {
            msg += 'Debe elegir el tipo de plan  <br>';
        }

        if (!this.cotizacion.poliza.moneda || !this.cotizacion.poliza.moneda.NCODIGINT) {
            msg += 'Debe elegir la moneda  <br>';
        }

        if (this.trama.excelSubir == undefined) {
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
        // viajes
        // if(!this.cotizacion.poliza.codTipoViaje || !this.cotizacion.poliza.codTipoViaje.id ){
        //   msg += 'Debe elegir el tipo de viaje  <br>';
        // }
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

        if (!this.poliza.tipoActividad ||
            !this.poliza.tipoActividad.codigo) {
            msg += 'Debe elegir la actividad económica  <br>';
        }

        if (!this.poliza.CodCiiu ||
            !this.poliza.CodCiiu.codigo) {
            msg += 'Debe elegir el CIIU  <br>';
        }

        if (this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES == this.CONSTANTS.RAMO) {
            if (!this.detail) {
                if (this.trama.MONT_PLANILLA == 0 && this.cotizacion.esEstudiantil) {
                    msg += 'Debe ingresar el monto máximo de pensión  <br>';
                }
            }
        }

        if (this.cotizacion.modoRenovacionEditar && this.cotizacion.esEstudiantil && (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES)) { //AVS - RENTAS
            if (this.cotizacion.tipoTransaccion == 4) {
                if (Number(this.cotizacion.cotizador.cotizadorDetalleList[0].MONT_PLANILLA) == 0) {
                    msg += 'Debe ingresar el monto máximo de pensión  <br>';
                }
            }
        }


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
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
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
        console.log(this.detail)
        console.log(this.cotizacion.cotizador.cotizadorDetalleList[0].MONT_PLANILLA)
        console.log(this.trama.MONT_PLANILLA)
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
            comision_porcentaje: null,
            tipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            freqPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            type_mov: this.cotizacion.tipoTransaccion,
            codProducto: this.poliza.producto.COD_PRODUCT,
            codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
            flagCot: this.detail
                ? this.cotizacion.modoVista ==
                    this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ? 2 : 1 : 0,
            planillaMax: 0,
            topeLey: 0,
            fechaActual: null,
            codProceso: this.poliza.proceso_anterior,//this.trama.NIDPROC,
            planTariffList: [
                {
                    planId: this.poliza.tipoPerfil.NIDPLAN,
                    planDes: this.poliza.tipoPerfil.SDESCRIPT,
                    prima: this.poliza.tipoPerfil.NPREMIUM,
                },
            ],
            codActividad: this.poliza.tipoActividad.Id,
            flagComisionPro: 0,
            comisionPro: 0,
            tasaObreroPro: 0,
            tasaEmpleadoPro: 0,
            flagPolizaEmision: 0,
            nroCotizacion: this.cotizacion.numeroCotizacion || 0,
            premiumPlan: null,
            premiumPlanPro: '',
            desPlan: this.poliza.tipoPerfil.SDESCRIPT,
            codTipoProducto: this.poliza.producto.COD_PRODUCT,
            codTipoModalidad: this.poliza.modalidad.ID,
            codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
            destipoplan: this.poliza.tipoPlan.TIPO_PLAN,
            premiun: this.poliza.primaPropuesta,
            flagCalcular: this.poliza.checkbox1.POL_MAT ? 0 : 0,
            idproc: this.poliza.proceso_anterior,//this.trama.NIDPROC,
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
            flagTrama: this.poliza.listReglas.flagTrama ? 1 : 0,
            flagTasa: this.poliza.listReglas.flagTasa ? 1 : 0,
            flagPrima: this.poliza.listReglas.flagPrima ? 1 : 0,
            tipoCotizacion: this.poliza.tipoTarifario.tipoCotizacion,
            montoPlanilla: this.detail ? this.cotizacion.cotizador.cotizadorDetalleList[0].MONT_PLANILLA : this.trama.MONT_PLANILLA,
            flagProcesartrama: this.cotizacion.transac == 'RE' && this.cotizacion.esEstudiantil && Number(this.cotizacion.modoTrama) == 1 && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR  //AVS - RENTAS
                && (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO || this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) ? 1 : 0,
            datosContratante: {
                codContratante: this.cotizacion.contratante.id, // sclient
                desContratante: this.cotizacion.contratante.cliente360.P_SLEGALNAME, // Legal name
                desCodDocumento: this.cotizacion.contratante.tipoDocumento.Name, // Tipo de documento
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
                codTipoNegocio: this.poliza.tipoPoliza.id,
                codTipoProducto: this.poliza.producto.COD_PRODUCT,
                codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
                codTipoModalidad: this.poliza.modalidad.ID,
                codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
                codTipoRenovacion: this.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                codTipoFrecuenciaPago: this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                InicioVigPoliza: CommonMethods.formatDate(this.poliza.fechaInicioPoliza),
                FinVigPoliza: CommonMethods.formatDate(this.poliza.fechaFinPoliza),
                InicioVigAsegurado: CommonMethods.formatDate(this.poliza.fechaInicioAsegurado),
                FinVigAsegurado: CommonMethods.formatDate(this.poliza.fechaFinAsegurado),
                CodActividadRealizar: this.poliza.tipoActividad.Id,
                CodCiiu: this.poliza.CodCiiu.Id,
                codTipoFacturacion: this.poliza.tipoFacturacion.id,
                codMon: this.poliza.moneda.NCODIGINT,
                desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
                nproduct: this.poliza.producto.COD_PRODUCT,
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
                codUbigeo: !!this.poliza.codDestino.Id
                    ? this.poliza.codDestino.Id
                    : 14,
                idTariff: this.poliza.id_tarifario,
                versionTariff: this.poliza.version_tarifario,
                name_tarifario: this.poliza.name_tarifario,
                id_cotizacion: 0,
                proceso_anterior: this.poliza.proceso_anterior,
                modoEditar: this.cotizacion.modoRenovacionEditar
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
                            this.tramaChange.emit(this.trama);
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
                                this.trama.TOT_ASEGURADOS = 0;
                                this.trama.MONT_PLANILLA = 0;
                                this.trama.SUM_ASEGURADA = 0;
                            }
                        } else {

                            if (this.cotizacion.tipoTransaccion == 0) {
                                if (this.cotizacion.brokers[0].NINTERTYP == '1') { // directo => 1
                                    this.cotizacion.brokers[0].P_COM_SALUD = 0;
                                }
                                else if (this.cotizacion.brokers[0].NINTERTYP == '3') { // broker => 3
                                    this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_BROKER;
                                }
                                else { // comercializador => 65 || banca seguro => 67
                                    this.cotizacion.brokers[0].P_COM_SALUD = res.COMISION_INTER;
                                }
                            }
                            // if (this.cotizacion.transac != 'EN') {
                            this.trama = Object.assign(this.trama || {}, res || {});
                            this.trama.PRIMA_TOTAL = this.detail
                                ? res.amountPremiumListAut[3].NPREMIUMN_ANU
                                : this.getPrima(res.amountPremiumList);
                            this.trama.IGV = this.detail
                                ? res.amountPremiumListAut[2].NPREMIUMN_ANU
                                : this.getPrima(res.amountPremiumList, false);
                            this.cotizacion.cotizador.cotizadorDetalleList = res.cotizadorDetalleList;


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
                                this.cotizacion.estadoDeuda = 'Exclusión';
                                this.cotizacion.montoDeuda = this.cotizacion.trama.PRIMA;
                            }
                            this.p_nid_proc = res.NIDPROC; // GCAA 07022024

                            this.trama.validado = true;
                            this.tramaChange.emit(this.trama);

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

    clickClearExcel() {
        this.trama.excelSubir = null;
        this.initCotizadorDetalle();
    }

    initCotizadorDetalle() {
        this.cotizacion.cotizador.cotizadorDetalleList = [{
            TASA: '0',
            PRIMA_UNIT: '0',
            PRIMA: '0'
        }];
    }

    clearTrama() {
        this.trama.validado = false;
        this.tramaChange.emit(this.trama);

        if (this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES == this.CONSTANTS.RAMO) {
            if (!this.detail) {
                this.initCotizadorDetalle();
            }
        } else {
            this.initCotizadorDetalle();
        }

        if (this.cotizacion.tipoTransaccion == 0 && this.cotizacion.brokers.length > 0) {
            this.cotizacion.brokers[0].P_COM_SALUD = 0;
        }

        if (!this.cotizacion.modoTrama) {
            this.trama.TOT_ASEGURADOS = 0;
            this.trama.MONT_PLANILLA = 0;
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

    // GCAA 06022024
    ListaCupones(nid_proc) {
        this.trama.codProceso = null;
        const modalRef = this.modal.open(ViewCouponComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.nid_proc = nid_proc;
    }

}
