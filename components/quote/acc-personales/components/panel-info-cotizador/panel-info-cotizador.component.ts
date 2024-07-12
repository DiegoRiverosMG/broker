import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges
} from '@angular/core';

import { CommonMethods } from '../../../../common-methods';
import { OthersService } from '../../../../../services/shared/others.service';

import { UtilService } from '../../core/services/util.service';
import { StorageService } from '../../core/services/storage.service';
import { FileService } from '../../core/services/file.service';
import { AccPersonalesService } from '../../acc-personales.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
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
    @Output() cotizacionChange: EventEmitter<any> = new EventEmitter();
    @Input() poliza: any;
    @Input() contratante: any;
    @Input() esPolizaMatriz: any;
    @Input() esMina: any;

    CONSTANTS: any = AccPersonalesConstants;

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
    tabServAdicionales: boolean;
    coberturas: any = [];
    asistencias: any = [];
    beneficios: any = [];
    recargos: any = [];
    servAdicionales: any = [];
    simularPrima: string;
    inputValor: number | null = null; //AVS - RENTAS
    inputValorOri: number | null = null; //AVS - RENTAS
    benExec: string = this.coberturas.length > 0 ? this.coberturas.find(cobertura => cobertura.codCobertura == '1001').capital_prop : 0; //AVS - RENTAS
    ramoProductoVG = JSON.parse(localStorage.getItem('vidaGrupoID'))['nbranch'];
    disabledExec: number = 0; //AVS - RENTAS
    beneficiosEjec: any;
    benefitsRespaldo: any[] = [];

    constructor(
        public storageService: StorageService,
        private fileService: FileService,
        private othersService: OthersService,
        public accPersonalesService: AccPersonalesService
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
            JSON.parse(localStorage.getItem('codProducto'))['productId']
        );
        (this.tabCoberturas = true), (this.tabAsistencias = false);
        (this.tabBeneficios = false), (this.tabRecargos = false), (this.tabServAdicionales = false);
    }

    ngOnInit() {
        this.cotizador = this.cotizador || {};
        this.cotizadorChange.emit(this.cotizador);
        console.log(this.cotizacion.esEstudiantil)
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

        console.log(changes)
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

        this.accPersonalesService.calcularCotizador(params).subscribe(
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
                flagCalcular: this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar ? 1 : 0, //AVS - RENTAS
                //this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId ? 1 : 0,
                codUsuario: this.storageService.userId,
                desUsuario: this.storageService.user.username,
                codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
                contratante: this.cotizacion.contratante.id,
                codRamo: this.CONSTANTS.RAMO,
                codProducto: this.poliza.producto.COD_PRODUCT,
                codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
                codProceso: '',
                mina: this.poliza.checkbox2.TRA_MIN,
                PolizaMatriz: this.validarAforo()
                    ? this.poliza.checkbox1.POL_MAT
                    : 0,
                type_mov: this.cotizacion.tipoTransaccion,
                nroCotizacion: this.cotizacion.numeroCotizacion || 0,
                // MontoPlanilla: this.trama.MONT_PLANILLA,
                CantidadTrabajadores: this.cotizacion.tipoTransaccion == 4 && this.cotizacion.poliza.listReglas.flagTasa && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO ||
                    this.cotizacion.tipoTransaccion == 4 && !this.cotizacion.poliza.listReglas.flagTrama && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES
                    ? this.cotizador.cotizadorDetalleList[0].TOT_ASEGURADOS : this.trama.TOT_ASEGURADOS,
                montoPlanilla: this.cotizacion.tipoTransaccion == 4 && this.cotizacion.poliza.listReglas.flagTasa && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO ||
                    this.cotizacion.tipoTransaccion == 4 && !this.cotizacion.poliza.listReglas.flagTrama && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES
                    ? this.cotizador.cotizadorDetalleList[0].MONT_PLANILLA : this.trama.MONT_PLANILLA,
                tipoCotizacion: this.poliza.tipoTarifario.tipoCotizacion || this.poliza.tipoTarifario2.tipoCotizacion,
                flagTrama: this.poliza.listReglas.flagTrama ? 1 : 0,
                premium: (this.trama.PRIMA =
                    this.trama.PRIMA === 0 ? this.trama.PRIMA_DEFAULT : this.trama.PRIMA),
                flagCot: this.detail
                    ? this.cotizacion.modoVista ==
                        this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
                        this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
                        this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
                        this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ? 2 : 1 : 0,
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
                    codTipoNegocio: this.poliza.tipoPoliza.id,
                    codTipoProducto: this.poliza.producto.COD_PRODUCT,
                    codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
                    codTipoModalidad: this.poliza.modalidad.ID,
                    codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
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
                    CodActividadRealizar: this.poliza.tipoActividad.Id,
                    CodCiiu: this.poliza.CodCiiu.Id,
                    codTipoFacturacion: this.poliza.tipoFacturacion.id,
                    codMon: this.poliza.moneda.NCODIGINT,
                    desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
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
                    codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 2,
                    tipoUbigeo: !!this.poliza.codTipoViaje
                        ? this.poliza.codTipoViaje.id
                        : 0,
                    // codOrigen:
                    //   !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1
                    //     ? this.poliza.codOrigen.Id
                    //     : !!this.poliza.codOrigen
                    //     ? this.poliza.codOrigen.NCOUNTRY
                    //     : 0,
                    codUbigeo:
                        !!this.poliza.codDestino.Id
                            ? this.poliza.codDestino.Id
                            : 14,
                    idTariff: this.poliza.id_tarifario,
                    versionTariff: this.poliza.version_tarifario,
                    name_tarifario: this.poliza.name_tarifario,
                    id_cotizacion: this.poliza.ncot_tarifario,
                    proceso_anterior: this.poliza.proceso_anterior,
                    modoEditar: this.cotizacion.modoRenovacionEditar
                },
            };

            this.isLoadingChange.emit(true);

            this.accPersonalesService.calcularCotizadorSinTrama(params).subscribe(
                (res) => {
                    if (res.P_COD_ERR == 0) {
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
                        this.trama = Object.assign(this.trama, res); //AVS - RENTAS
                        this.trama.PRIMA =
                            this.trama.PRIMA < this.trama.PRIMA_DEFAULT
                                ? this.trama.PRIMA_DEFAULT
                                : this.trama.PRIMA;
                        this.trama.PRIMA_TOTAL = this.validarMontoPrima(2) ? res.amountPremiumListAnu[3].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList);
                        this.trama.MONT_PLANILLA = res.cotizadorDetalleList[0].MONT_PLANILLA;
                        this.trama.IGV = this.validarMontoPrima(2) ? res.amountPremiumListAnu[2].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList, false);
                        this.primaNeta = this.validarMontoPrima(2) ? res.amountPremiumListAnu[0].NPREMIUMN_ANU : this.trama.PRIMA;
                        this.cotizador.cotizadorDetalleList = res.cotizadorDetalleList;
                        this.cotizador.amountPremiumListAnu = this.validarMontoPrima(2) ? res.amountPremiumListAnu : this.cotizador.amountPremiumListAnu;
                        this.tramaChange.emit(this.trama);

                        this.cotizador.calculado = true;

                        this.cotizacion.trama.validado = true;
                        this.cotizacionChange.emit(this.cotizacion);
                    } else {
                        if (this.cotizacion.tipoTransaccion == 0) {
                            this.cotizacion.brokers[0].P_COM_SALUD = 0;
                        }
                        this.cotizacion.trama.validado = false;
                        this.cotizacionChange.emit(this.cotizacion);
                        this.initCotizadorDetalle();
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
                    this.initCotizadorDetalle();
                    this.cotizacion.trama.validado = false;
                    this.cotizacionChange.emit(this.cotizacion);
                    this.isLoadingChange.emit(false);
                }
            );
        } else {
            if (validar) {
                this.cotizacion.trama.validado = false;
                this.cotizacionChange.emit(this.cotizacion);
                this.cotizadorChange.emit(this.cotizador);
                swal.fire('Información', msgValidate, 'error');
            }
        }
    }




    validarMontoPrima(flagValidacion: any) {
        let flag = false;

        if (flagValidacion == 1) {
            if (this.cotizacion.tipoTransaccion == 4) {
                if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                    if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR === this.cotizacion.modoVista && this.cotizacion.poliza.listReglas.flagTasa && !this.cotizacion.poliza.listReglas.flagTrama
                        && !this.cotizador.calculado) {
                        flag = true;
                    }
                } else if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                    if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR === this.cotizacion.modoVista && !this.cotizacion.poliza.listReglas.flagTrama && !this.cotizador.calculado) {
                        flag = true;
                    }
                }
            }
        } else if (flagValidacion == 2) {
            if (this.cotizacion.tipoTransaccion == 4) {
                if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                    if (!this.cotizacion.poliza.listReglas.flagTrama) {
                        flag = true;
                    }

                    if (this.cotizacion.poliza.listReglas.flagTrama && this.cotizacion.modoRenovacionEditar) {
                        flag = true;
                    }
                } else if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                    if (this.cotizacion.poliza.listReglas.flagTasa) {
                        flag = true;
                    }

                    if (!this.cotizacion.poliza.listReglas.flagTasa && this.cotizacion.modoRenovacionEditar) {
                        flag = true;
                    }
                }

            }
        } else if (flagValidacion == 3) {
            flag = true;
        }
        
        return flag;
    }

    visualizarData() {
        let flag = true;

        if (this.cotizacion.modoRenovacionEditar) {
            flag = false;
        }

        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR) {
            flag = false;
        }

        return flag;
    }

    cargaTabs() {
        const params = {
            codBranch: this.CONSTANTS.RAMO,
            codProduct: this.cotizacion.poliza.producto.codigo,
            IdProc: this.trama.NIDPROC,
            planId: this.poliza.tipoPlan?.ID_PLAN,
            channel: this.cotizacion.brokers.length > 0 ? this.cotizacion.brokers[0].COD_CANAL : 0,
            currency: this.poliza.moneda?.NCODIGINT,
            profile: this.poliza.tipoPerfil?.NIDPLAN,
            codPerfil: this.poliza.tipoPerfil?.NIDPLAN,
            policyType: this.poliza.tipoPoliza?.id,
            collocationType: this.poliza.modalidad?.ID,
            billingType: this.poliza.tipoFacturacion?.id,
            codproducto: this.poliza.producto?.COD_PRODUCT,
            idTariff: this.poliza.id_tarifario,
            versionTariff: this.poliza.version_tarifario,
            varExec: this.coberturas, //AVS - RENTAS
            visualizar: this.visualizarData()
        };

        this.accPersonalesService.getAssits(params).subscribe(
            (res) => {
                this.asistencias = res.ListAssists;
            },
            (error) => { }
        );

        this.accPersonalesService.getBenefits(params).subscribe(
            (res) => {
                this.beneficios = res.ListBenefits;
            },
            (error) => { }
        );

        this.accPersonalesService.getSurcharges(params).subscribe(
            (res) => {
                this.recargos = res.ListSurcharges;
            },
            (error) => { }
        );

        this.accPersonalesService.getAdditionalServices(params).subscribe(
            (res) => {
                this.servAdicionales = res.ListAdditionalService
            },
            (error) => { }
        );

        //SERVICIO TARIFARIO - SERVICIOS ADICIONALES

    }

    // esto abre el modal
    clickProponer() {
        if (!!this.cotizacion.poliza.producto.codigo) {
            this.cargaTabs();
            this.tabCoberturas = true;
            this.tabAsistencias = false;
            this.tabBeneficios = false;
            this.tabRecargos = false;
            this.tabServAdicionales = false;
            this.show.coberturas = true;
            this.primaNeta = this.trama.PRIMA;
        } else {
            swal.fire(
                'Información',
                'Debe los elegir los datos de la póliza',
                'error'
            );
        }
    }

    clickCalcularPrima(event: any, action?: string, codigo?: any) {
        let aditionalbool = false;
        const params = {
            flagCalcular: this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar ? 1 : 0, //AVS - RENTAS
            //this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId ? 1 : 0,
            codUsuario: this.storageService.userId,
            desUsuario: this.storageService.user.username,
            codCanal: this.cotizacion.brokers[0].COD_CANAL, // this.storageService.user.brokerId,
            contratante: this.cotizacion.contratante.id,
            codRamo: this.CONSTANTS.RAMO,
            codProducto: this.poliza.producto.COD_PRODUCT,
            codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
            CantidadTrabajadores: this.trama.TOT_ASEGURADOS,
            codProceso: this.trama.NIDPROC,
            mina: this.poliza.checkbox2.TRA_MIN,
            PolizaMatriz: this.validarAforo()
                ? this.poliza.checkbox1.POL_MAT
                : 0,
            type_mov: this.cotizacion.tipoTransaccion,
            nroCotizacion: this.cotizacion.numeroCotizacion || 0,
            montoPlanilla: this.trama.MONT_PLANILLA,
            tipoCotizacion: this.poliza.tipoTarifario.tipoCotizacion || this.poliza.tipoTarifario2.tipoCotizacion,
            flagTrama: this.poliza.listReglas.flagTrama ? 1 : 0,
            flagCot: this.detail
                ? this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
                    this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ? 2 : 1 : 0,
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
                codTipoNegocio: this.poliza.tipoPoliza.id,
                codTipoProducto: this.poliza.producto.COD_PRODUCT,
                codTipoPerfil: this.poliza.tipoPerfil.NIDPLAN,
                codTipoModalidad: this.poliza.modalidad.ID,
                codTipoPlan: this.poliza.tipoPlan.ID_PLAN,
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
                CodActividadRealizar: this.poliza.tipoActividad.Id,
                CodCiiu: this.poliza.CodCiiu.Id,
                codTipoFacturacion: this.poliza.tipoFacturacion.id,
                codMon: this.poliza.moneda.NCODIGINT,
                desTipoPlan: this.poliza.tipoPlan.TIPO_PLAN,
                nproduct: this.poliza.producto.COD_PRODUCT,
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
                codAlcance: !!this.poliza.codAlcance ? this.poliza.codAlcance.id : 2,
                tipoUbigeo: !!this.poliza.codTipoViaje
                    ? this.poliza.codTipoViaje.id
                    : 0,
                // codOrigen:
                //   !!this.poliza.codTipoViaje && this.poliza.codTipoViaje.id == 1
                //     ? this.poliza.codOrigen.Id
                //     : !!this.poliza.codOrigen
                // ? this.poliza.codOrigen.NCOUNTRY
                // : 0,
                codUbigeo:
                    !!this.poliza.codDestino.Id
                        ? this.poliza.codDestino.Id
                        : 14,
                idTariff: this.poliza.id_tarifario,
                versionTariff: this.poliza.version_tarifario,
                name_tarifario: this.poliza.name_tarifario,
                id_cotizacion: 0,
                proceso_anterior: this.poliza.proceso_anterior,
                modoEditar: this.cotizacion.modoRenovacionEditar
            },
            lcoberturas: [],
            lasistencias: [],
            lbeneficios: [],
            lrecargos: [],
            lservAdicionales: []
        };

        (this.coberturas || []).forEach((item) => {
            if (["1001", "1002", "1003"].includes(item.codCobertura)) { //AVS - RENTAS
                item.capital_prop = this.inputValorOri == null ? item.capital_prop : this.inputValorOri;
                if (item.pension_prop !== 0) {
                    item.pension_prop = this.inputValorOri == null ? item.pension_prop : this.inputValorOri;
                } else if (item.porcen_prop !== 0) {
                    item.porcen_prop = this.inputValorOri == null ? item.porcen_prop : this.inputValorOri;
                }
            }

            if (action == 'coberturas') {
                if (item.codCobertura == codigo) {
                    item.cobertura_adi = event.checked ? 1 : 0;
                }
            }

            if (action == 'recoberturas') {
                if (item.codCobertura == codigo) {
                    item.capital_prop = event.target?.value || item.capital_prop;
                }
            }

            if (item.cobertura_adi != '0') {
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
                    entryAge: item.entryAge,
                    hours: item.hours,
                    ncover: item.ncover,
                    stayAge: item.stayAge,
                    limit: item.limit,
                    suma_asegurada: item.suma_asegurada,
                    items: item.items,
                    nfactor: item.nfactor,
                    //AVS - RENTAS
                    id_cover: item.id_cover,
                    sdes_cover: item.sdes_cover,
                    pension_base: item.pension_base,
                    pension_max: item.pension_max,
                    pension_min: item.pension_min,
                    pension_prop: item.pension_prop,
                    porcen_base: item.porcen_base,
                    porcen_max: item.porcen_max,
                    porcen_min: item.porcen_min,
                    porcen_prop: item.porcen_prop,
                    lackPeriod: item.lackPeriod,
                    deductible: item.deductible,
                    copayment: item.copayment,
                    maxAccumulation: item.maxAccumulation,
                    comment: item.comment
                    ////////////////////////////////////////////
                });
            }
        });

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
                    value: item.value,
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
                    sMark: item.sMark,
                    exc_beneficio: item.exc_beneficio == null ? 0 : item.exc_beneficio == undefined ? 0 : item.exc_beneficio == true ? 1 : 0, //AVS - RENTAS
                    studentRentBenefit: item.studentRentBenefit
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

        (this.servAdicionales || []).forEach((item) => {
            if (action == 'servAdicionales') {
                if (item.codServAdicionales == codigo) {
                    item.sMark = event.checked ? 1 : 0;
                }
            }
            if (item.sMark != '0') {

                if (item.amount == 0 || item.amount == null) {
                    swal.fire('Información', 'Debe ingresar un número válido mayor a 0', 'error');
                    //item.sMark = '0';
                    item.amount = 1;
                    aditionalbool = true;
                    return;
                }

                params.lservAdicionales.push({
                    codServAdicionales: item.codServAdicionales,
                    desServAdicionales: item.desServAdicionales,
                    amount: item.amount == null ? 0 : item.amount,
                    sMark: item.sMark
                });
            }
        })

        if (aditionalbool == false) {
            const myFormData: FormData = new FormData();
            myFormData.append('dataCalcular', JSON.stringify(params));

            this.isLoadingChange.emit(true);
            this.accPersonalesService
                .calcularCotizadorConCoberturas(myFormData)
                .subscribe(
                    (res) => {
                        this.cotizacion.calcularCober = true;
                        this.trama = Object.assign(this.trama || {}, res || {});

                        if (res.P_COD_ERR == "1" || res.P_COD_ERR == "3" || res.P_COD_ERR == "2") {
                            this.isLoadingChange.emit(false);
                            this.trama.PRIMA_TOTAL = 0;
                            this.initCotizadorDetalle();
                            if (this.cotizacion.tipoTransaccion == 4 && this.cotizacion.modoRenovacionEditar) { //AVS - RENTAS
                                this.cotizador.cotizadorDetalleList[0]['MONT_PLANILLA'] = '0';
                                this.trama.MONT_PLANILLA = 0;
                                this.trama.IGV = 0;
                                this.cotizacion.calcularCober = this.validarMontoPrima(2) ? false : true;
                            }
                            this.primaNeta = 0;
                            this.trama.amountPremiumList = [];
                            this.cotizador.amountPremiumListAut = [];
                            this.cotizacion.trama.validado = (res.P_COD_ERR == "3" || res.P_COD_ERR == "2") ? true : false; //AVS - RENTAS
                            this.cotizacionChange.emit(this.cotizacion);
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                        else {
                            this.trama = Object.assign(this.trama, res); //AVS - RENTAS                            
                            this.trama.PRIMA_TOTAL = this.validarMontoPrima(2) ? res.amountPremiumListAnu[3].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList);
                            this.trama.MONT_PLANILLA = res.cotizadorDetalleList[0].MONT_PLANILLA;
                            this.trama.IGV = this.validarMontoPrima(2) ? res.amountPremiumListAnu[2].NPREMIUMN_ANU : this.getPrima(res.amountPremiumList, false);
                            this.trama.validado = true;
                            this.primaNeta = this.trama.PRIMA;
                            this.trama.amountPremiumList = res.amountPremiumList;
                            this.cotizador.cotizadorDetalleList = res.cotizadorDetalleList;
                            this.cotizador.amountPremiumListAut = res.amountPremiumListAut;
                            this.cotizador.amountPremiumListAnu = this.validarMontoPrima(2) ? res.amountPremiumListAnu : this.cotizador.amountPremiumListAnu;
                            this.tramaChange.emit(this.trama);

                            this.cotizacion.calcularCober = this.validarMontoPrima(2) && this.cotizacion.modoRenovacionEditar ? false : true; //AVS - RENTAS
                            this.cotizacion.trama.validado = true;
                            this.cotizacionChange.emit(this.cotizacion);

                            if (this.trama.PRIMA_TOTAL == 0) {
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            }
                            this.isLoadingChange.emit(false);
                        }
                    },
                    (error) => {
                        this.initCotizadorDetalle();
                        this.cotizacion.calcularCober = false;
                        this.cotizacion.trama.validado = false;
                        this.cotizacionChange.emit(this.cotizacion);
                        this.isLoadingChange.emit(false);
                    }
                );

        }
    }

    initCotizadorDetalle() {
        this.cotizador.cotizadorDetalleList = [{
            TASA: '0',
            PRIMA_UNIT: '0',
            PRIMA: '0'
        }];
    }

    validarAforo() {
        let flag = true;
        if (!!this.cotizacion.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.cotizacion.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.ACC_PERSONALES) {
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

    trabajadoresChange(event: any, number: any, i: any) {
        console.log('event', event)
        console.log('number', number)
        console.log('i', i)
        this.coberturas = [];
        this.trama.amountPremiumList = [];
        this.trama.SUM_ASEGURADA = 0;
        // this.trama.MONTO_PLANILLA = 0;
        this.trama.PRIMA = 0;
        this.trama.validado = false;
        this.cotizador.calculado = false;
        // this.limpiarCotizador();
        console.log(this.validarMontoPrima(2))
        if (this.validarMontoPrima(3)) {
            if (number == 1) { //AVS - RENTAS
                this.cotizador.cotizadorDetalleList[i].TOT_ASEGURADOS = Number(event.target.value);
            } else {
                this.cotizador.cotizadorDetalleList[i].MONT_PLANILLA = Number(event.target.value);
                console.log(this.cotizador.cotizadorDetalleList);
            }
        }
    }

    limpiarCotizador() {
        this.trama.validado = false;
        this.trama.TOT_ASEGURADOS = '';
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

        if (
            !this.cotizacion.contratante.tipoDocumento ||
            !this.cotizacion.contratante.numDocumento
        ) {
            msg += 'Debe ingresar un contratante <br>';
        }
        if (!this.poliza.tipoPoliza || !this.poliza.tipoPoliza.id) {
            msg += 'Debe elegir el tipo de producto  <br>';
        }

        if (
            !this.cotizacion.poliza.tipoPerfil ||
            !this.cotizacion.poliza.tipoPerfil.NIDPLAN
        ) {
            msg += 'Debe elegir el tipo de perfil  <br>';
        }

        if (
            !this.cotizacion.poliza.modalidad ||
            !this.cotizacion.poliza.modalidad.ID
        ) {
            msg += 'Debe elegir el tipo de modalidad  <br>';
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

        if (!this.cotizacion.poliza.tipoPlan ||
            !this.cotizacion.poliza.tipoPlan.ID_PLAN
        ) {
            msg += 'Debe elegir el tipo de plan  <br>';
        }


        if (this.trama.TOT_ASEGURADOS == 0 && !this.cotizacion.esEstudiantil) {
            msg += 'Debe ingresar al menos un asegurado  <br>';
        }

        let desAseg = this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO ? 'alumno' : 'asegurado';

        if (this.cotizacion.esEstudiantil && (this.cotizacion.poliza.listReglas.flagTasa && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) || (!this.cotizacion.poliza.listReglas.flagTrama && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES)) {
            if (this.cotizacion.tipoTransaccion == 4) {
                if (Number(this.cotizador.cotizadorDetalleList[0].TOT_ASEGURADOS) == 0) {
                    msg += 'Debe ingresar al menos un ' + desAseg + '  <br>';
                }
            } else {
                if (this.trama.TOT_ASEGURADOS == 0 && this.cotizacion.esEstudiantil) {
                    msg += 'Debe ingresar al menos un asegurado  <br>';
                }
            }
        }

        if (this.cotizacion.esEstudiantil && (this.cotizacion.poliza.listReglas.flagTasa && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) || (!this.cotizacion.poliza.listReglas.flagTrama && this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES)) {
            if (this.cotizacion.tipoTransaccion == 4) {
                if (Number(this.cotizador.cotizadorDetalleList[0].MONT_PLANILLA) == 0) {
                    msg += 'Debe ingresar el monto máximo de pensión  <br>';
                }
            } else {
                if (this.trama.MONT_PLANILLA == 0 && this.cotizacion.esEstudiantil) {
                    msg += 'Debe ingresar el monto máximo de pensión  <br>';
                }
            }
        }

        if (!!this.cotizacion.poliza.codTipoViaje && this.cotizacion.poliza.codTipoViaje.id == 1) {
            if (!this.cotizacion.poliza.codDestino || !this.cotizacion.poliza.codDestino.Id) {
                msg += 'Debe elegir un departamento  <br>';
            }
        }

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

        if (!this.poliza.tipoActividad ||
            !this.poliza.tipoActividad.codigo) {
            msg += 'Debe elegir la actividad económica  <br>';
        }

        if (!this.poliza.CodCiiu ||
            !this.poliza.CodCiiu.codigo) {
            msg += 'Debe elegir el CIIU  <br>';
        }

        return msg;
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

    showTabs(tab) {
        switch (tab) {
            case '1':
                this.tabCoberturas = true;
                this.tabAsistencias = false;
                this.tabBeneficios = false;
                this.tabRecargos = false;
                this.tabServAdicionales = false;
                break;
            case '2':
                this.tabCoberturas = false;
                this.tabAsistencias = true;
                this.tabBeneficios = false;
                this.tabRecargos = false;
                this.tabServAdicionales = false;
                break;
            case '3':
                this.tabCoberturas = false;
                this.tabAsistencias = false;
                this.tabBeneficios = true;
                this.tabRecargos = false;
                this.tabServAdicionales = false;
                break;
            case '4':
                this.tabCoberturas = false;
                this.tabAsistencias = false;
                this.tabBeneficios = false;
                this.tabRecargos = true;
                this.tabServAdicionales = false;
                break;
            case '5':
                this.tabCoberturas = false;
                this.tabAsistencias = false;
                this.tabBeneficios = false;
                this.tabRecargos = false;
                this.tabServAdicionales = true;
                break;
            default:
                this.tabCoberturas = true;
                this.tabAsistencias = false;
                this.tabBeneficios = false;
                this.tabRecargos = false;
                this.tabServAdicionales = false;
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
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
            if (item.cobertura_adi == 1 && item.id_cover != 'FIXED_INSURED_SUM_PERCENTAGE') { //AVS - RENTAS
                disabled = false;
            }
        }

        return disabled;
    }

    verificarInputFactor(item: any) {
        let disabled = true;

        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
            if (item.cobertura_adi == 1 && item.id_cover != 'FIXED_INSURED_SUM_PERCENTAGE') { //AVS - RENTAS
                disabled = false;
            }
        }

        // if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR && item.id_cover != 'FIXED_INSURED_SUM_PERCENTAGE') { //AVS - RENTAS
        //     if (item.cobertura_adi == 1) { //AVS - RENTAS
        //         disabled = false;
        //     }
        // }

        return disabled;
    }


    verificarInputServiciosAdicionales(item: any) {
        let disabled = true;

        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) { //AVS - RENTAS
            if (item.sMark == 1) { //AVS - RENTAS
                disabled = false;
            }
        }

        return disabled;
    }

    verificarTextSA() {
        let label = 'S.A. autorizada';

        if (this.verificarEstudiantilVG()) {
            //label = 'Factor';
            label = 'Proponer Valor'; //AVS - RENTAS
        } else {
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar)) {
                //label = 'Proponer S.A.';
                label = 'Proponer Valor'; //AVS - RENTAS
            }
        }

        return label;
    }

    verificarColumnPropuesto() {
        let columnVisible = false;

        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE' && this.cotizacion.modoRenovacionEditar)) {
            columnVisible = true;
        }

        return columnVisible;
    }

    verificarEstudiantilVG() {
        let columnVisible = false;

        if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO &&
            this.poliza.producto?.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.RENTA_ESTUDIANTIL) {
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
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
                if (item.cobertura_pri == 1 || !this.cotizacion.poliza.listReglas.flagCobertura) {
                    disabled = true;
                }
            }
            else {
                disabled = true;
            }
        }

        if (atr == 2) { // asistencias
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
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
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
                if (!this.cotizacion.poliza.listReglas.flagBeneficio) {
                    disabled = true;
                }
                else {
                    if (this.cotizacion.esEstudiantil && item.exc_beneficio) {
                        disabled = this.modExcludeRE(item);
                    }
                }
            }
            else {
                disabled = true;
            }
        }

        if (atr == 4) {
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR) {
                disabled = true;
            }
        }

        if (atr == 5) { // recargos falta modificar flag
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
                if (!this.cotizacion.poliza.listReglas.flagBeneficio) {
                    disabled = true;
                }
            }
            else {
                disabled = true;
            }
        }

        if (atr == 6) { // servicios adicionales
            if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
                (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE')) {
                disabled = false;
            }
            else {
                disabled = true;
            }
        }

        return disabled;
    }


    modExcludeRE(item) {

        let disabled = false;
        let beneficiosExclusivos = null;


        for (const beneficio of this.beneficios) {
            if (beneficio.exc_beneficio && Number(beneficio.sMark) == 1) {
                beneficiosExclusivos = Number(beneficio.sMark);
                break;
            }
        }

        if (beneficiosExclusivos === 1) {
            if (item.exc_beneficio == true && Number(item.sMark) == 0) {
                this.disabledExec = 1;
                disabled = true;
            }
        }

        return disabled;
    }

    mensajeAlertaExclusivo(item) {
        if (this.CONSTANTS.RAMO === this.ramoProductoVG && this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR) {
            if (item.exc_beneficio == true && Number(item.sMark) == 0 && this.disabledExec == 1) {
                swal.fire('Información', 'Considerar que los beneficios A y B son excluyentes, solo debe seleccionar uno de ellos.', 'error');
            }

        }
    }

    preventCheckboxChange(event: MouseEvent, item: any) {
        event.preventDefault();
        this.mensajeAlertaExclusivo(item);
    }

    valAlertaBeneficio(item: any) {
        let alerta = false;
        if (this.verificarFlag(item, 3) == true) {
            alerta = true;
        } else {
            alerta = false;
        }
        return alerta;
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

    validateDisabled() {

        let value = false;

        if (this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.POLIZARENOVAR) {
            if (this.detail && !this.cotizacion.modoRenovacionEditar) {
                value = true;
            }
        }

        return value;
    }

    verificarPerfilAforo() {
        let flag = false;
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (Number(this.poliza.tipoPerfil.codigo) == this.CONSTANTS.PERFIL_AFORO.ACC_PERSONALES) {
                    flag = true;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (Number(this.poliza.tipoPerfil.codigo) == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
                    flag = true;
                }
            }
        }

        return flag;
    }

}


