import { AccPersonalesConstants } from './../../core/constants/acc-personales.constants';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { PolicyemitService } from '../../../../../services/policy/policyemit.service';
import { QuotationService } from '../../../../../services/quotation/quotation.service';

import { UtilService } from '../../core/services/util.service';
import { StorageService } from '../../core/services/storage.service';
import { PanelInfoPolizaService } from './panel-info-poliza.service';
import { AccPersonalesService } from '../../acc-personales.service';
import { CommonMethods } from '../../../../common-methods';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'panel-info-poliza',
    templateUrl: './panel-info-poliza.component.html',
    styleUrls: ['./panel-info-poliza.component.css'],
})

export class PanelInfoPolizaComponent implements OnInit, OnChanges {
    @Input() detail: boolean;
    @Input() cotizacion: any;
    @Input() poliza: any;
    @Output() polizaChange: EventEmitter<any> = new EventEmitter();
    @Input() zeroBroker: any;
    @Input() renovEdit: any;
    @Input() isLoading: boolean;
    @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
    @Output() cambiaDatosPoliza: EventEmitter<any> = new EventEmitter();

    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    userId = JSON.parse(localStorage.getItem('currentUser'))['id'];

    CONSTANTS: any = AccPersonalesConstants;

    fechaActual: any = UtilService.dates.getCurrentDate();
    flagViajes: boolean = true;
    flagAforo: boolean = false;
    flagRenta: boolean = true;
    countFecha: number = 0;
    disabledSinFact = false;
    flagReglas: boolean = false; //AVS - RENTAS

    constructor(
        public clientInformationService: ClientInformationService,
        public policyemitService: PolicyemitService,
        public panelInfoPolizaService: PanelInfoPolizaService,
        public accPersonalesService: AccPersonalesService,
        public storageService: StorageService,
        public quotationService: QuotationService,
        public toastr: ToastrService
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
            JSON.parse(localStorage.getItem('codProducto'))['productId']
        );
    }

    ngOnInit() {
        this.poliza = this.poliza || {};

        this.polizaChange.emit(this.poliza);

        if (!this.poliza.listReglas) {
            this.rulesDefault();
        }
        if (!this.poliza.listTarifarios) {
            this.poliza.listTarifarios = [{ codigo: '', valor: '- Seleccione -' }];
        }
        if (!this.poliza.listPlanes) {
            this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
        }

        if (this.poliza.esEstudiantil == true && this.poliza.checkbox5.SIN_FACT == true) {
            this.poliza.checkbox1.FAC_ANT = true;
        }

        // if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
        //   this.cotizacion.transac == 'RE') {
        //   this.getSegmento();
        // }

        if (this.CONSTANTS.PERFIL.EXTERNO == this.storageService.user.profileId || this.CONSTANTS.PERFIL.COMERCIAl == this.storageService.user.profileId) {
            this.disabledSinFact = true
        }
    }

    ngOnChanges(changes) {

        if (changes.zeroBroker && changes.zeroBroker.previousValue !== undefined) {
            this.getSegmento();
        }

        if (changes.renovEdit && changes.renovEdit.previousValue !== undefined) {
            this.getSegmento();
        }
    }

    initCotizadorDetalle() {
        this.cotizacion.cotizador.cotizadorDetalleList = [{
            TASA: '0',
            PRIMA_UNIT: '0',
            PRIMA: '0'
        }];
    }

    rulesDefault() {
        if(((this.verificarPerfilAforo()) || (this.verificarPerfilEmpresa()) || (this.verificarPerfilEstudiantil())) && this.cotizacion.modoRenovacionEditar && this.cotizacion.poliza.tipoPoliza.codigo == 2){
            this.flagReglas = true;
        }

        this.poliza.listReglas = {
            flagComision: false,
            flagCobertura: false,
            flagAsistencia: false,
            flagBeneficio: false,
            flagSiniestralidad: false,
            flagAlcance: this.flagReglas ? true : false,
            flagTemporalidad: this.flagReglas ? true : false,
            flagTrama: true,
            flagTasa: false,
            flagPrima: true
        }
        
        this.emitirCambiarDatoPoliza();
    }

    cambiarTipoProducto() {
        this.poliza.tipoPerfil = null;
        this.poliza.modalidad = null;
        this.poliza.tipoTarifario = null;
        this.validarToast();
        this.emitirCambiarDatoPoliza();
    }

    // perfilRentaEst() {

    //     this.poliza.checkbox3.CANT_PEN = false;
    //     this.poliza.checkbox4.ASIG_COL = false;
    //     console.log(this.poliza.tipoPerfil);
    //     // if (["3", "7"].includes(this.poliza.tipoPerfil?.NIDPLAN)) {
    //         this.flagRenta = !this.verificarPerfilEstudiantil();
    //     // } else {
    //     //     this.flagRenta = true;
    //     // }
    // }

    validarToast() {
        if (!!this.poliza.tipoPoliza &&
            !!this.poliza.tipoPerfil &&
            !!this.poliza.tipoFacturacion &&
            this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES &&
            !this.cotizacion.modoVista) {
            if (this.poliza.tipoPoliza.id == 1 &&
                (this.poliza.tipoPerfil.NIDPLAN == 1 || this.poliza.tipoPerfil.NIDPLAN == 2) &&
                this.poliza.tipoFacturacion.id == 1) {
                this.toastr.info("El comprobante estará asociado al contratante de la cotización.",
                    'INFORMACIÓN',
                    { timeOut: 20000, toastClass: 'rmaClass ngx-toastr' }
                );
            } else {
                this.toastr.clear();
            }
        }
    }

    cambiarTipoPerfil() {
        // this.validarTipoRenovacion();
        // this.poliza.modalidad = null;
        // this.poliza.tipoFacturacion = null;
        this.poliza.codTipoViaje = { id: 1, codigo: 1 };
        this.poliza.modalidad = this.poliza.tipoPoliza.codigo == 1 ? { ID: 1, codigo: 1 } : null;
        this.flagAforo = false;
        this.poliza.checkbox1 = { POL_MAT: false, isSelected: false };
        this.poliza.temporalidad = this.verificarPerfilEstudiantil() || this.verificarPerfilAforo() ? this.poliza.temporalidad : null;
        this.poliza.tipoFacturacion = this.verificarPerfilAforo() || this.verificarPerfilIndividual() ? { id: 1, codigo: 1 } : null;
        this.cotizacion.esEstudiantil = this.verificarPerfilEstudiantil() ? true : false;
        this.poliza.checkbox3.CANT_PEN = this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO && this.cotizacion.esEstudiantil == true ? true : false;
        this.poliza.checkbox4.ASIG_COL = false;
        this.getSegmento();
        this.validarToast();
        this.cambiarProducto();
    }

    resetTarifario() {
        this.poliza.tipoTarifario = null;
        this.rulesDefault();
        this.initCotizadorDetalle();
    }

    verificarPerfilEstudiantil() {
        let flag = false;



        // if (!!this.poliza.tipoPerfil) {
        //     if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
        //         if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
        //             flag = true;
        //         }
        //     }

        //     if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
        //         if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
        //             flag = true;
        //         }
        //     }
        // }


        flag = !this.verificarPerfilAforo(); // JDD Fase 2

        return flag;
    }

    verificarSoloEstudiantil() {
        let flag = false;

        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    verificarPerfilViajes() {
        let flag = false;
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.CONSTANTS.GRUPO_VIAJES.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    flag = true;
                }
            }
        }

        return flag;
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

    verificarPerfilIndividual() {
        let flag = false;
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_INDIVIDUAL.ACC_PERSONALES) {
                    flag = true;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_INDIVIDUAL.VIDA_GRUPO) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    verificarPerfilEmpresa() {
        let flag = false;
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (Number(this.poliza.tipoPerfil.codigo) == this.CONSTANTS.PERFIL_EMPRESA.ACC_PERSONALES) {
                    flag = true;
                }
            }

            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                if (Number(this.poliza.tipoPerfil.codigo) == this.CONSTANTS.PERFIL_EMPRESA.VIDA_GRUPO) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    validarTipoRenovacion() {
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                if (this.CONSTANTS.GRUPO_VIAJES.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    this.poliza.tipoRenovacion = {
                        COD_TIPO_RENOVACION: 6,
                        DES_TIPO_RENOVACION: "ESPECIAL",
                        text: "ESPECIAL",
                        codigo: 6,
                        valor: "ESPECIAL"
                    };
                } else {
                    this.poliza.tipoRenovacion = {
                        codigo: '',
                        valor: '- Seleccione -',
                        text: '- Seleccione -'
                    };
                }
            }
        }
        this.emitirCambiarDatoPoliza();
    }

    cambiarTipoRenovacion() {
        this.poliza.frecuenciaPago = {
            codigo: '',
            valor: '- Seleccione -',
            text: '- Seleccione -',
        };
        this.emitirCambiarDatoPoliza();
    }

    cambiarTipoFreq() {
        this.verificarInicioAseg();
        this.emitirCambiarDatoPoliza();
    }

    async cambiarProducto() {
        if (!!this.poliza.tipoPerfil) {
            if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES) {
                this.poliza.producto = {
                    COD_PRODUCT: this.poliza.tipoPerfil.codigo,
                    DES_PRODUCT: this.poliza.tipoPerfil.valor,
                    NBRANCH: this.CONSTANTS.RAMO,
                    id: this.poliza.tipoPerfil.codigo,
                    codigo: this.poliza.tipoPerfil.codigo,
                };

                if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.ACC_PERSONALES) {
                    this.poliza.checkbox1.POL_MAT = true;
                    this.flagAforo = true;
                }

            } else if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
                let productsList = await this.productoVidaGrupo();
                let productVG = null;
                if (this.CONSTANTS.GRUPO_VIDA_GRUPO.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    productVG = (productsList || []).find(product => product.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.VIDA_GRUPO);
                }

                if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    productVG = (productsList || []).find(product => product.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.RENTA_ESTUDIANTIL);
                }

                if (this.CONSTANTS.GRUPO_MI_FAMILIA.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
                    productVG = (productsList || []).find(product => product.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.MI_FAMILIA);
                }

                if (productVG != null) {
                    this.poliza.producto = {
                        COD_PRODUCT: productVG.COD_PRODUCT,
                        DES_PRODUCT: productVG.DES_PRODUCT,
                        NBRANCH: this.CONSTANTS.RAMO,
                        id: productVG.COD_PRODUCT,
                        codigo: productVG.COD_PRODUCT,
                    };
                }

                if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
                    this.poliza.checkbox1.POL_MAT = true;
                    this.flagAforo = true;
                }
            }
        } else {
            this.poliza.producto = null;
        }

    }

    async productoVidaGrupo() {
        let response: any = null;
        let params = {
            branch: this.CONSTANTS.RAMO
        };
        await this.accPersonalesService.getProductsListByBranch(params).toPromise().then(
            (res) => {
                response = res;
            },
            (err) => {
                response = null
            }
        );

        return response;
    }

    checkMovimiento() {
        let flagHabilitar = false;

        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
                this.cotizacion.transac == 'RE' &&
                this.cotizacion.modoRenovacionEditar)) {

            flagHabilitar = true;

        }

        return flagHabilitar;
    }

    async getSegmento() { //PASAR LOGICA A TARIFARIO

        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
                this.cotizacion.transac == 'RE' &&
                this.cotizacion.modoRenovacionEditar)) {

            if (!!this.poliza.tipoPerfil &&
                !!this.poliza.tipoPerfil.codigo &&
                !!this.poliza.modalidad &&
                !!this.poliza.modalidad.codigo &&
                !!this.poliza.tipoFacturacion &&
                !!this.poliza.tipoFacturacion.id &&
                !!this.poliza.tipoTarifario &&
                (!!this.poliza.tipoTarifario.id || !!this.poliza.tipoTarifario.idTariff) && //AVS - RENTAS
                this.cotizacion.brokers.length > 0
            ) {

                this.poliza.id_tarifario = this.poliza.tipoTarifario.idTariff;
                this.poliza.version_tarifario = this.poliza.tipoTarifario.versionTariff;
                this.poliza.name_tarifario = this.poliza.tipoTarifario.desTariff;
                this.poliza.checkbox1.POL_MAT = !this.verificarPerfilAforo() ? this.poliza.tipoTarifario.validarTrama == "1" ? false : true : true;
                this.poliza.valida_trama = !this.verificarPerfilAforo() ? this.poliza.tipoTarifario.validarTrama : "0";
                this.poliza.tipo_cotizacion = this.poliza.tipoTarifario.tipoCotizacion;

                await this.getListPlanes();
            }
            else {
                this.rulesDefault();
                this.poliza.id_tarifario = null;
                this.poliza.version_tarifario = 0;
                this.poliza.name_tarifario = null;
                this.poliza.checkbox1.POL_MAT = false;
                this.poliza.sin_trama = null;
                this.poliza.tipo_cotizacion = null;
                this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
                // this.poliza.listTarifarios = [{ codigo: '', valor: '- Seleccione -' }];
            }

            this.validarToast();
        }

        this.emitirCambiarDatoPoliza();
    }

    async getListPlanes() {
        let params = {
            nbranch: this.CONSTANTS.RAMO,
            channel: this.cotizacion.brokers[0].COD_CANAL,
            currency: this.poliza.moneda.NCODIGINT,
            profile: this.poliza.tipoPerfil.codigo,
            policyType: this.poliza.tipoPoliza.codigo,
            collocationType: this.poliza.modalidad.codigo,
            billingType: this.poliza.tipoFacturacion.id,
            npenCount: this.poliza.checkbox3.CANT_PEN ? 1 : 0,
            idTariff: this.poliza.tipoTarifario?.idTariff,
            versionTariff: this.poliza.tipoTarifario?.versionTariff,
            npensiones: this.poliza.checkbox3?.CANT_PEN ? 1 : 0
        };

        //LLAMAR SERVICIO PARA OBTENER LOS TIPOS DE TARIFARIO
        //VALIDACION
        this.isLoadingChange.emit(true);
        await this.accPersonalesService.getTiposPlan(params).toPromise().then(
            (res) => {
                this.isLoadingChange.emit(false);
                if (res.codError == 0) { //Respuesta 
                    this.poliza.listReglas = res.rulesList;
                    this.poliza.listReglas.flagTrama = this.poliza.tipoTarifario.validarTrama == '1';
                    this.poliza.listReglas.flagTasa = this.poliza.tipoTarifario.tipoCotizacion == 'RATE';
                    this.poliza.listReglas.flagPrima = this.poliza.tipoTarifario.tipoCotizacion == 'PRIME';
                    this.poliza.listPlanes = res.planList.length > 0 ? res.planList : [{ codigo: '', valor: '- Seleccione -' }];

                    if(((this.verificarPerfilAforo()) || (this.verificarPerfilEmpresa()) || (this.verificarPerfilEstudiantil())) && this.cotizacion.modoRenovacionEditar && this.cotizacion.poliza.tipoPoliza.codigo == 2){ //AVS - RENTAS
                        this.flagReglas = true;
                    }
                } else {
                    this.rulesDefault();
                    this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
                    swal.fire('Información', res.sMessage, 'error');
                }

                this.emitirCambiarDatoPoliza();
            },
            (err) => {
                console.log(err);
            }
        );
    }

    changeTipoTarifario() {
        this.initCotizadorDetalle();

        if (this.poliza.tipoTarifario.codigo == "") {
            this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
        }

        this.emitirCambiarDatoPoliza();
    }

    emitirCambiarDatoPoliza() {
        setTimeout(() => {
            this.cambiaDatosPoliza.emit();
        }, 100);
    }

    validarPolizaMatriz() {
        if (this.poliza.checkbox1.POL_MAT === true) {
            this.poliza.checkbox1.FAC_ANT = false;
        }
    }

    async validarSinFactura() {
        if (this.poliza.checkbox5.SIN_FACT === true) {
            this.poliza.checkbox1.FAC_ANT = true;
            await this.toastr.info('Considerar que se generarán los recibos "Sin comprobante"', 'Información', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
        } else {
            this.poliza.checkbox1.FAC_ANT = false;
        }

    }

    validarDeshabilitarFechaVigenciaInicio() {
        if (!this.cotizacion.modoVista) {
            // COTIZAR
            return false;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.POLIZARENOVAR
        ) {
            // RENOVACION
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR
        ) {
            // INCLUSION
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EXCLUIR
        ) {
            // EXCLUSION
            return true;
        } else if (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.ENDOSO) {
            // ENDOSO
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.ANULACION
        ) {
            // ANULACION
            return true;
        } else if (
            this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.VISUALIZAR
        ) {
            // VISUALIZAR
            return true;
        } else {
            // EVALUACION
            if (
                this.cotizacion.tipoTransaccion == 0 ||
                this.cotizacion.tipoTransaccion == 1
            ) {
                return (
                    !this.detail &&
                    (this.CONSTANTS.PERFIL.COMERCIAl ==
                        this.storageService.user.profileId ||
                        this.CONSTANTS.PERFIL.OPERACIONES ==
                        this.storageService.user.profileId) &&
                    this.poliza.tipoRenovacion.codigo !==
                    this.CONSTANTS.TIPO_RENOVACION.ESPECIAL
                );
            } else {
                return true;
            }
        }
    }

    validateMin() {
        if (this.cotizacion.tipoTransaccion == 2) {
            let now = new Date(
                new Date().getMonth() +
                1 +
                '/' +
                new Date().getDate() +
                '/' +
                new Date().getFullYear()
            );
            if (
                new Date(this.poliza.fechaInicioAsegurado).getTime() ==
                new Date(now).getTime()
            ) {
                return this.poliza.fechaInicioPoliza;
            } else {
                return this.poliza.fechaMinInicioAsegurado;
            }
        } else {
            return this.poliza.fechaInicioPoliza;
        }
    }

    verificarInicioAseg() {
        if (this.cotizacion.tipoTransaccion == 8) {
            if (
                this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA !=
                Number(this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA)
            ) {
                let date = new Date(this.poliza.fechaFinAseguradoEn);
                date.setDate(date.getDate() + 1);
                return (this.poliza.fechaInicioAsegurado = date);
            } else {
                return (this.poliza.fechaInicioAsegurado =
                    this.poliza.fechaInicioAseguradoEn);
            }
        } else {
            return this.poliza.fechaInicioAsegurado;
        }
    }

    validarInputMostrar() {
        let mostrar = false;
        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR) {
            mostrar = true;
        }

        return mostrar;
    }

    changeDate(tipo) {
        this.countFecha = this.countFecha + 1;
        if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
            // (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR && this.countFecha > 3) ||
            (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR && this.countFecha > 3)) {
            if (tipo == 1) {
                this.poliza.fechaInicioAsegurado = this.poliza.fechaInicioPoliza;
            } else {
                this.poliza.fechaFinAsegurado = this.poliza.fechaFinPoliza;
            }

        }
    }
}
