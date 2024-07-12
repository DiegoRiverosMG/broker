import { DesgravamenDevolucionConstants } from '../core/constants/desgravamen-devolucion.constants';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonMethods } from '../../../common-methods';
import { MethodsPaymentComponent } from '../../../../modal/methods-payment/methods-payment.component';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { DesgravamenDevolucionService } from '../desgravamen-devolucion.service';
import { StorageService } from '../core/services/storage.service';
import { AppConfig } from '../../../../../../app.config';
import { ParameterSettingsService } from '../../../../services/maintenance/parameter-settings.service';
import swal from 'sweetalert2';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'desgravamen-devolucion-quotation',
    templateUrl: './desgravamen-devolucion-quotation.component.html',
})
export class DesgravamenDevolucionQuotationComponent implements OnInit {
    @Output() modifyDatos: EventEmitter<any> = new EventEmitter();
    cotizacion: any = {};
    recargar: any = {};
    modal: any = {};
    isLoading: boolean = false;
    esEvaluacion: boolean;
    numeroCotizacion: string;
    modoVista: string;
    modoTrama: boolean;
    trxPendiente: string;
    ActivarModalEdit: boolean;
    CONSTANTS: any = DesgravamenDevolucionConstants;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    perfil: any;
    link: string;
    dattasa: string;
    datsobrevivencia: string;
    datmining: string;
    datmaxing: string;
    datmaxper: string;
    dattasaseguro: string;
    dattasaahorro: string;
    datcumulomax: string;

    constructor(
        private quotationService: QuotationService,
        private policyemit: PolicyemitService,
        private storageService: StorageService,
        private DesgravamenDevolucionService: DesgravamenDevolucionService,
        private clientInformationService: ClientInformationService,
        private router: Router,
        private route: ActivatedRoute,
        private ngbModal: NgbModal,
        private readonly appConfig: AppConfig,
        private parameterSettingsService: ParameterSettingsService
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
        this.link = this.CONSTANTS.BASE_URL.DES;
        if (this.route.snapshot.data.esEvaluacion === true) {
            this.esEvaluacion = true;
            // this.isLoading = true; // revisar
            this.numeroCotizacion = this.route.snapshot.params.numeroCotizacion;
            this.modoVista = this.route.snapshot.params.mode;
            this.trxPendiente = CommonMethods.textFormat(this.route.snapshot.queryParams.trx);
            this.modoTrama = this.route.snapshot.queryParams.trama == '1';

            this.cotizacion = {
                brokers: [],
                trama: {
                    excelSubir: [],
                },
                files: [],
                file_siniestralidad: [],
                modoRenovacionEditar: false
            };
        } else {
            this.esEvaluacion = false;
            this.modoVista = '';

            this.cotizacion = {
                contratante: {
                    codTipoBusqueda: 'POR_DOC',
                    lockMark: 0,
                    debtMark: 0,
                },
                brokers: [],
                endosatario: [],
                poliza: {
                    checkbox1: { POL_MAT: false },
                    checkbox2: { TRA_MIN: false }
                },
                trama: {
                    excelSubir: [],
                },
                cotizador: {
                    changeContratante: false,
                    comentario: '',
                    files: [],
                    file_siniestralidad: []
                },
                files: [],
                file_siniestralidad: [],
                modoTrama: false,
                checkPago: '',
                tipoTransaccion: this.tipoTransaccion(),
                activarFormaPago: this.activarFormaPago(),
                fechaEfectoPoliza: new Date(),
                transac: 'EM',
            };
        }
    }

    async ngOnInit() {
        this.perfil = await this.getProfileProduct(); // 20230325
        if (this.esEvaluacion == true) {
            this.isLoading = true;
            const params = {
                nidcotizacion: this.numeroCotizacion,
                nbranch: this.CONSTANTS.RAMO,
            };
            this.quotationService.GetSobrevivencia(params).subscribe((res) => {

                this.datsobrevivencia = res.sobrevivencia.toString();
                this.datmining = res.edadmin_ingreso.toString();
                this.datmaxing = res.edadmax_ingreso.toString();
                this.datmaxper = res.edadmax_permanen.toString();
            });
            await this.obtenerBrokers();
            this.obtenerCabeceraCotizacion();
            this.obtenerDetalleCotizacion();
            this.EvaluacionVoucher();



        }

        this.cotizacion.transac = !!this.trxPendiente
            ? this.trxPendiente.substring(0, 2).toUpperCase()
            : this.modoVista == '' ||
                this.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR ||
                this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR ||
                this.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR
                ? 'EM'
                : this.modoVista.substring(0, 2).toUpperCase();
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.codProducto;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                },
                err => {
                    console.log(err)
                }
            );

        return profile;
    }

    ModalModificarDatos(e) {
        this.ActivarModalEdit = e;
        if (this.ActivarModalEdit) {
            if (this.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO) {
                this.verificarTipoEndoso();
            } else {
                this.verificarEditarRenovacion();
            }
        }
    }

    ObtenerFechas() {
        if (
            this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.ANULACION ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO
        ) {
            this.obtenerFechasRenovacion();
        }
    }

    EvaluacionVoucher() {
        const params = {
            QuotationNumber: this.numeroCotizacion,
            LimitPerPage: 5,
            PageNumber: 1,
        };
        this.quotationService.getTrackingList(params).subscribe((res) => {
            let statusChangeList = res.GenericResponse;
            if (!!statusChangeList && statusChangeList.length > 1) {
                const files = statusChangeList[0].FilePathList;
                const estadoAnterior = statusChangeList[1].Status;
                const estadoUltimo = statusChangeList[0].Status;
                if (
                    (estadoAnterior == 'CREADO' && files == null) ||
                    (this.modoVista == 'EmitirR' && estadoUltimo == 'CREADO') ||
                    (this.modoVista == 'EmitirR' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Emitir' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Renovar' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Declarar' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Incluir' && estadoUltimo == 'AP. POR TÉCNICA') ||
                    (this.modoVista == 'Endosar' && estadoUltimo == 'CREADO') ||
                    (this.modoVista == 'EmitirR' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != this.CONSTANTS.PERFIL.ADMIN &&
                        this.perfil != this.CONSTANTS.PERFIL.OPERACIONES) ||
                    (this.modoVista == 'Incluir' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != this.CONSTANTS.PERFIL.ADMIN &&
                        this.perfil != this.CONSTANTS.PERFIL.OPERACIONES) ||
                    (this.modoVista == 'Renovar' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != this.CONSTANTS.PERFIL.ADMIN &&
                        this.perfil != this.CONSTANTS.PERFIL.OPERACIONES) ||
                    (this.modoVista == 'Declarar' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != this.CONSTANTS.PERFIL.ADMIN &&
                        this.perfil != this.CONSTANTS.PERFIL.OPERACIONES) ||
                    (this.modoVista == 'Endosar' &&
                        estadoUltimo == 'APROBADO' &&
                        this.perfil != this.CONSTANTS.PERFIL.ADMIN &&
                        this.perfil != this.CONSTANTS.PERFIL.OPERACIONES) ||
                    this.modoVista == 'Evaluar'
                ) {
                    this.cotizacion.checkPago = true;
                } else {
                    this.cotizacion.checkPago = false;
                }
            } else {
                if (this.modoVista == 'Evaluar') {
                    this.cotizacion.checkPago = true;
                }
            }
        });
    }

    activarFormaPago() {
        let visualizar = false;
        if (!!this.trxPendiente &&
            this.trxPendiente != '' &&
            this.trxPendiente != 'Emision') {
            for (const item of this.CONSTANTS.VISTA_FORMA_PAGO.VISTAS) {
                if (this.modoVista === item[0]) {
                    visualizar = this.cotizacion.checkPago;
                }
            }
        } else {
            if (this.modoVista == '') {
                visualizar = false;
            } else {
                if ((!!this.cotizacion.poliza.checkbox1.POL_MAT && this.validarAforo()) ||
                    this.cotizacion.checkPago != true) {
                    visualizar = false;
                } else {
                    for (const item of this.CONSTANTS.VISTA_FORMA_PAGO.VISTAS) {
                        if (this.modoVista === item[0]) {
                            visualizar = true;
                        }
                    }
                }
            }
        }

        return visualizar;
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

    tipoTransaccion() {
        let transaccion = 0;
        if (!!this.trxPendiente && this.trxPendiente != '') {
            for (const item of this.CONSTANTS.TRX_PENDIENTES.VISTAS) {
                if (this.trxPendiente === item[0]) {
                    transaccion = item[1];
                }
            }
        } else {
            for (const item of this.CONSTANTS.NRO_TRANSACCTION.VISTAS) {
                if (this.modoVista === item[0]) {
                    transaccion = item[1];
                }
            }
        }

        return transaccion;
    }

    obtenerTitulo() {
        if (this.esEvaluacion === true) {
            if (
                this.modoVista != this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.ENDOSO &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.EXCLUIR &&
                this.modoVista != this.CONSTANTS.MODO_VISTA.ANULACION
            ) {
                if (this.modoTrama && this.cotizacion.poliza.nroPoliza !== '') {
                    return (
                        'Detalle de la Póliza matriz N° ' + this.cotizacion.poliza.nroPoliza
                    );
                } else {
                    const msjPendiente = this.trxPendiente
                        ? ' | ' + this.trxPendiente
                        : '';
                    if (this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR) {
                        return (
                            'Evaluar Cotización N° ' + this.numeroCotizacion + msjPendiente
                        );
                    } else {
                        return (
                            'Detalle de Cotización N° ' + this.numeroCotizacion + msjPendiente
                        );
                    }
                }
            } else {
                if (this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR) {
                    if (this.cotizacion.renovacionTitulo) {
                        return this.cotizacion.renovacionTitulo;
                    } else {
                        return 'RENOVAR PÓLIZA';
                    }
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR) {
                    return 'INCLUSIÓN PÓLIZA';
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO) {
                    return 'ENDOSAR PÓLIZA';
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                    return 'EXCLUIR PÓLIZA';
                }

                if (this.modoVista == this.CONSTANTS.MODO_VISTA.ANULACION) {
                    return 'ANULAR PÓLIZA';
                }
            }
        }

        return 'Cotizador';
    }

    obtenerCabeceraCotizacion() {
        const trama = this.modoTrama ? 1 : 0;
        this.policyemit
            .getPolicyEmitCab(
                this.numeroCotizacion,
                this.storageService.variable.var_movimientoEmision,
                this.storageService.userId,
                trama
            )
            .subscribe((res) => {
                const genRes = res.GenericResponse;
                if (genRes.COD_ERR == 0 || genRes.COD_ERR == 2) {
                    if (genRes.COD_ERR == 2) {
                        swal.fire('Información', genRes.MENSAJE, 'info');
                    }

                    this.cotizacion.numeroCotizacion = this.numeroCotizacion;
                    this.cotizacion.modoVista = this.modoVista;
                    this.cotizacion.modoTrama = this.modoTrama;
                    this.cotizacion.nidPolicy = genRes.NID_PROC;
                    this.cotizacion.calcularCober = false;

                    this.cotizacion.contratante = {
                        codTipoBusqueda: 'POR_DOC',
                        tipoDocumento: { Id: genRes.TIPO_DOCUMENTO },
                        numDocumento: (genRes.NUM_DOCUMENTO || '').trim(),
                        tipoPersona: { Id: genRes.COD_TIPO_PERSONA },
                        NOMBRE_RAZON: genRes.NOMBRE_RAZON,
                        direccion: genRes.DIRECCION,
                        email: genRes.CORREO,
                        // tipoCuenta
                        // riesgo
                        // contactoa
                    };

                    this.cotizacion.trama = {
                        validado:
                            this.CONSTANTS.MODO_VISTA.POLIZARENOVAR !==
                            this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR !==
                            this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.EXCLUIR !== this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.ENDOSO !== this.cotizacion.modoVista &&
                            this.CONSTANTS.MODO_VISTA.ANULACION !== this.cotizacion.modoVista,
                        amountPremiumList: res.amountPremiumList,
                        amountPremiumListAut: res.amountPremiumListAut,
                        TOT_ASEGURADOS: res.total_asegurados,
                        PRIMA: res.prima,
                        PRIMA_TOTAL:
                            res.amountPremiumListAut.length > 0
                                ? res.amountPremiumListAut[3].NPREMIUMN_ANU
                                : 0,
                        IGV: res.amountPremiumListAut.length > 0
                            ? res.amountPremiumListAut[2].NPREMIUMN_ANU
                            : 0,
                        NIDPROC: res.idproc,
                    };

                    this.cotizacion.poliza = {
                        nroPoliza: genRes.NPOLICY,
                        producto: { codigo: genRes.NPRODUCT },
                        tipoPoliza: { codigo: genRes.NID_TYPE_PRODUCT },
                        tipoPerfil: { codigo: genRes.NID_TYPE_PROFILE },
                        modalidad: { codigo: genRes.NID_TYPE_MODALITY },
                        tipoRenovacion: { COD_TIPO_RENOVACION: genRes.TIP_RENOV },
                        frecuenciaPago: { COD_TIPO_FRECUENCIA: genRes.FREQ_PAGO },
                        tipoRenovacionEndoso: { COD_TIPO_RENOVACION: genRes.TIP_RENOV },
                        frecuenciaPagoEndoso: { COD_TIPO_FRECUENCIA: genRes.FREQ_PAGO },
                        fechaInicioPoliza: genRes.EFECTO_COTIZACION
                            ? new Date(genRes.EFECTO_COTIZACION)
                            : null,
                        fechaFinPoliza: genRes.EXPIRACION_COTIZACION
                            ? new Date(genRes.EXPIRACION_COTIZACION)
                            : null,
                        tipoActividad: { Id: genRes.ACT_TEC_VL },
                        CodCiiu: { Id: genRes.ACT_ECO_VL },
                        listPlanes: [{
                            ID_PLAN: genRes.NMODULEC_TARIFARIO, TIPO_PLAN: genRes.SDESCRIPT_TARIFARIO
                        }],
                        tipoPlan: {
                            ID_PLAN: genRes.NMODULEC_TARIFARIO, TIPO_PLAN: genRes.SDESCRIPT_TARIFARIO
                        },
                        fechaInicioAsegurado: genRes.EFECTO_ASEGURADOS
                            ? new Date(genRes.EFECTO_ASEGURADOS)
                            : null,
                        fechaMinInicioAsegurado: genRes.EFECTO_ASEGURADOS
                            ? new Date(genRes.EFECTO_ASEGURADOS)
                            : null,
                        fechaFinAsegurado: genRes.EXPIRACION_ASEGURADOS
                            ? new Date(genRes.EXPIRACION_ASEGURADOS)
                            : null,
                        tipoFacturacion: { id: genRes.COD_TIPO_FACTURACION },
                        moneda: { NCODIGINT: genRes.COD_MONEDA },
                        checkbox1: {
                            POL_MAT: genRes.POLIZA_MATRIZ == 1,
                            FAC_ANT: genRes.FACTURA_ANTICIPADA == 1,
                        },
                        checkbox2: {
                            TRA_MIN: genRes.MINA == 1,
                        },
                        fechaExclusion: genRes.EFECTO_ASEGURADOS
                            ? new Date(genRes.EFECTO_ASEGURADOS)
                            : null,
                        //nuevos valores tarifario
                        temporalidad: {
                            id: genRes.NTEMPORALITY,
                        },
                        codAlcance: {
                            id: genRes.NSCOPE,
                        },
                        codTipoViaje: {
                            id: genRes.NTYPE_LOCATION,
                        },
                        codDestino: {
                            Id: genRes.NLOCATION,
                        },
                        id_tarifario: genRes.SID_TARIFARIO,
                        version_tarifario: genRes.NVERSION_TARIFARIO,
                        name_tarifario: genRes.SNAME_TARIFARIO,
                        ncot_tarifario: genRes.NCOT_TARIFARIO,
                        proceso_anterior: genRes.NID_PROC,
                        tasadesdev: this.dattasa,
                        sobrevivencia: this.datsobrevivencia,
                        edminingreso: this.datmining,
                        edmaxingreso: this.datmaxing,
                        edmaxperman: this.datmaxper,
                        tasasegurodesdev: this.dattasaseguro,
                        tasaahorrodesdev: this.dattasaahorro,
                        cumulomaxdesdev: this.datcumulomax
                    };
                    this.cotizacion.fechaEfectoPoliza = new Date(
                        genRes.EFECTO_COTIZACION
                    );

                    // this.cotizacion.poliza.listReglas = {
                    //   flagComision: false,
                    //   flagCobertura: this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ? genRes.NFLAG_COVERS : false,
                    //   flagAsistencia: this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ? true : false,
                    //   flagBeneficio: this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ? true : false,
                    //   flagSiniestralidad: this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ? genRes.NFLAG_SINIEST : false,
                    //   flagAlcance: this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ? genRes.NFLAG_ALCANC : false,
                    //   flagTemporalidad: this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ? genRes.NFLAG_TEMPOR : false
                    // }

                    this.cotizacion.activarFormaPago = this.activarFormaPago();
                    this.cotizacion.tipoTransaccion = this.tipoTransaccion();

                    this.ObtenerFechas();
                    // this.getSegmento();

                    this.cotizacion.cotizador = {
                        comentario: genRes.COMENTARIO,
                        files: genRes.RUTAS,
                        amountPremiumListAnu: res.amountPremiumListAnu,
                        amountPremiumListAut: res.amountPremiumListAut,
                        amountPremiumListProp: res.amountPremiumListProp,
                        checkbox: {
                            PAGO_ADEL:
                                this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR
                                    ? true
                                    : false,
                        },
                    };

                    if (this.modoVista !== this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
                        this.modoVista !== this.CONSTANTS.MODO_VISTA.ENDOSO) {
                        this.ModalModificarDatos(false);
                    }
                } else {
                    this.isLoading = false;

                    if (genRes.COD_ERR == 1) {
                        swal.fire('Información', genRes.MENSAJE, 'error').then((value) => {
                            this.router.navigate([
                                '/extranet/' + this.link + '/consulta-cotizacion',
                            ]);
                        });
                    }
                }
            });
    }

    getSegmento() {
        let params = {
            nbranch: this.CONSTANTS.RAMO,
            channel: (this.cotizacion.brokers || []).length > 0 ? this.cotizacion.brokers[0].COD_CANAL : null,
            currency: this.cotizacion.poliza.moneda.NCODIGINT,
            profile: this.cotizacion.poliza.tipoPerfil.codigo,
            policyType: this.cotizacion.poliza.tipoPoliza.codigo,
            collocationType: this.cotizacion.poliza.modalidad.codigo,
            billingType: this.cotizacion.poliza.tipoFacturacion.id,
        };
        this.DesgravamenDevolucionService.getTiposPlan(params).subscribe(
            (res) => {
                if (res.codError != '1') {
                    this.cotizacion.poliza.codSegmento = res.codSegmento;
                } else {
                    this.cotizacion.poliza.codSegmento = '';
                    swal.fire('Información', res.sMessage, 'error');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    obtenerFechasRenovacion() {
        const params = {
            nroCotizacion: this.cotizacion.numeroCotizacion,
            typetransac: this.cotizacion.tipoTransaccion,
            codproducto: this.cotizacion.poliza.producto.codigo,
        };
        this.DesgravamenDevolucionService
            .obtenerFechasRenovacion(params)
            .subscribe((resp) => {
                this.cotizacion.poliza.fechaInicioPoliza = new Date(resp.fechaini_pol);
                this.cotizacion.poliza.fechaFinPoliza = new Date(resp.fechafin_pol);
                this.cotizacion.poliza.fechaInicioAsegurado = new Date(
                    resp.fechaini_aseg
                );
                this.cotizacion.poliza.fechaFinAsegurado = new Date(resp.fechafin_aseg);
                this.cotizacion.poliza.fechaInicioAseguradoEn = new Date(
                    resp.fechaini_aseg
                );
                this.cotizacion.poliza.fechaFinAseguradoEn = new Date(
                    resp.fechafin_aseg
                );
                this.cotizacion.renovacionTitulo = resp.titulo;
                this.cotizacion.indicador = resp.indicador_mov;
                this.cotizacion.transac = resp.titulo
                    .toString()
                    .substring(0, 2)
                    .toUpperCase();
            });
    }

    verificarEditarRenovacion() {
        if (this.cotizacion.contratante.debtMark !== 1) {
            if (
                this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
                !this.storageService.esBroker &&
                this.cotizacion.renovacionTitulo !== 'DECLARAR PÓLIZA'
            ) {
                swal.queue([
                    {
                        title: 'Información',
                        text: '¿Desea generar renovación con modificación de datos?',
                        showCancelButton: true,
                        confirmButtonText: 'SI',
                        allowOutsideClick: false,
                        cancelButtonText: 'NO',
                        preConfirm: () => {
                            this.cotizacion.modoRenovacionEditar = true;
                        },
                    },
                ]);
            } else if (
                this.cotizacion.renovacionTitulo == 'INCLUIR' &&
                !this.storageService.esBroker
            ) {
                this.cotizacion.modoRenovacionEditar = true;
            }
        }
    }

    verificarTipoEndoso() {
        if (this.cotizacion.contratante.debtMark !== 1) {
            /* if (this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION != this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA) {
              swal
                .fire({
                  title: 'Información',
                  text: '¿Desea modificar datos de la póliza?',
                  showCancelButton: true,
                  confirmButtonText: 'SI',
                  allowOutsideClick: false,
                  cancelButtonText: 'NO',
                })
                .then((result) => {
                  if (result.value) {
                    this.cotizacion.PolizaEditAsegurados = 0;
                    swal.fire('Información', 'Estos cambios se harán efectivos en el próximo período de facturación.', 'info');
                  } else {
                    this.cotizacion.PolizaEditAsegurados = 1;
                    swal.fire('Información', 'Sólo se podrá modificar los datos de los asegurados.', 'info');
                  }
                }); */
            this.cotizacion.PolizaEditAsegurados = 1;
            swal.fire(
                'Información',
                'Sólo se podrá modificar los datos de los asegurados.',
                'info'
            );
        } else {
            this.cotizacion.PolizaEditAsegurados = 1;
            swal.fire(
                'Información',
                'Sólo se podrá modificar los datos de los asegurados.',
                'info'
            );
        }
    }

    async obtenerBrokers() {
        await this.policyemit
            .getPolicyEmitComer(this.numeroCotizacion)
            .toPromise().then((res) => {
                // setTimeout(() => {
                this.cotizacion.brokers = res.map((item) => {
                    return {
                        NTIPDOC: item.TYPE_DOC_COMER,
                        NNUMDOC: item.DOC_COMER,
                        RAZON_SOCIAL: item.COMERCIALIZADOR,
                        P_COM_SALUD: item.COMISION_SALUD,
                        P_COM_SALUD_PRO: item.COMISION_SALUD_PRO,
                        COD_CANAL: item.CANAL,
                        P_NPRINCIPAL: item.PRINCIPAL,
                        SCLIENT: item.SCLIENT,
                        NTYPECHANNEL: item.TIPO_CANAL,
                        P_SEDIT: 'U',
                    };
                });

                // this.cotizacion.brokersOriginales = res.map((item) => {
                //   return {
                //     NTIPDOC: item.TYPE_DOC_COMER,
                //     NNUMDOC: item.DOC_COMER,
                //     RAZON_SOCIAL: item.COMERCIALIZADOR,
                //     P_COM_SALUD: item.COMISION_SALUD,
                //     P_COM_SALUD_PRO: item.COMISION_SALUD_PRO,
                //     COD_CANAL: item.CANAL,
                //     P_NPRINCIPAL: item.PRINCIPAL,
                //     SCLIENT: item.SCLIENT,
                //     NTYPECHANNEL: item.TIPO_CANAL,
                //     P_SEDIT: 'U',
                //   };
                // });
                // this.cotizacion.brokersEndoso = [];
                // }, 100);
            });
    }

    obtenerDetalleCotizacion() {
        this.policyemit
            .getPolicyEmitDet(this.numeroCotizacion, this.storageService.userId)
            .subscribe((res) => {
                this.dattasa = res[0].TASA_RIESGO;
                this.dattasaseguro = res[0].NTASA_SEGURO;
                this.dattasaahorro = res[0].NTASA_AHORRO;
                this.datcumulomax = res[0].NCUMULO_MAX;

                // this.cotizacion.brokers = res.map(item => {
                // return {
                // NTIPDOC: item.TYPE_DOC_COMER,
                // NNUMDOC: item.DOC_COMER,
                // RAZON_SOCIAL: item.COMERCIALIZADOR,
                // P_COM_SALUD: item.COMISION_SALUD,
                // P_COM_SALUD_PRO: item.COMISION_SALUD_PRO,
                // }
                // });
            });
    }
    // click proceso de cotizar
    clickAceptar() {
        this.validarMensajeContratante();
    }

    async validarMensajeContratante() {
        const msgValidate = this.validarCampos();
        if (msgValidate === '') {
            if (!!this.cotizacion.contratante.cliente360) {
                this.validarCliente(false);
            } else {
                swal.fire(
                    'Información',
                    'Los datos del contratante son incorrectos',
                    'error'
                );
            }
        } else {
            swal.fire('Información', msgValidate, 'error');
        }
    }

    async validarCliente(requerid: boolean) {
        if (
            this.cotizacion.contratante.flagEmail ||
            this.cotizacion.contratante.flagContact
        ) {
            this.cotizacion.contratante.cliente360.P_NUSERCODE =
                this.storageService.userId;
            this.cotizacion.contratante.cliente360.P_TipOper = 'INS';
            this.cotizacion.contratante.cliente360.P_NCLIENT_SEG = -1;

            if (
                this.cotizacion.contratante.flagEmail &&
                !!this.cotizacion.contratante.email
            ) {
                this.cotizacion.contratante.cliente360.EListEmailClient = [];
                const contractingEmail: any = {};
                contractingEmail.P_CLASS = '';
                contractingEmail.P_DESTICORREO = 'Correo Personal';
                contractingEmail.P_NROW = 1;
                contractingEmail.P_NUSERCODE = this.storageService.userId;
                contractingEmail.P_SE_MAIL = this.cotizacion.contratante.email;
                contractingEmail.P_SORIGEN = 'SCTR';
                contractingEmail.P_SRECTYPE = '4';
                contractingEmail.P_TipOper = '';
                this.cotizacion.contratante.cliente360.EListEmailClient.push(
                    contractingEmail
                );
            } else {
                this.cotizacion.contratante.cliente360.EListEmailClient = null;
            }

            if (
                this.cotizacion.contratante.flagContact &&
                !!(this.cotizacion.contratante.EListContactClient || []).length
            ) {
                this.cotizacion.contratante.cliente360.EListContactClient = [];
                this.cotizacion.contratante.EListContactClient.forEach((contact) => {
                    if (Number(contact.P_NTIPCONT) === 0) {
                        contact.P_NTIPCONT = 99;
                    }
                    if (Number(contact.P_NIDDOC_TYPE) === 0) {
                        contact.P_NIDDOC_TYPE = null;
                        contact.P_SIDDOC = null;
                    }
                });
                this.cotizacion.contratante.cliente360.EListContactClient =
                    this.cotizacion.contratante.EListContactClient;
            } else {
                this.cotizacion.contratante.cliente360.EListContactClient = null;
            }

            if (
                (!this.cotizacion.contratante.email ||
                    !(this.cotizacion.contratante.EListContactClient || []).length) &&
                !!this.cotizacion.contratante.creditHistory &&
                !requerid
            ) {
                this.isLoading = false;
                swal
                    .fire({
                        title: 'Información',
                        text:
                            Number(this.cotizacion.contratante.creditHistory.nflag) === 0
                                ? this.storageService.variable.var_contactHighScore
                                : this.storageService.variable.var_contactLowScore,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar',
                    })
                    .then(async (result) => {
                        if (result.value) {
                            this.isLoading = true;
                            this.actualizarCliente(requerid);
                        } else {
                            this.isLoading = false;
                            return;
                        }
                    });
            } else {
                this.isLoading = true;
                // if (!requerid) {
                this.actualizarCliente(requerid);
                // }
            }
        } else {
            if (!requerid) {
                // Validar retroactividad
                /*
                const response: any = await this.ValidateRetroactivity();
                if (response.P_NCODE == 4) {
                  this.cotizacion.derivaRetro = true;
                  await swal.fire('Información', response.P_SMESSAGE, 'error');
                  // return;
                } else {
                  this.cotizacion.derivaRetro = false;
                }
                */
                this.cotizacion.derivaRetro = false;
                this.validarMensajePolizaMatriz();
            }
        }
    }

    async actualizarCliente(requerid: boolean) {
        if (
            (this.cotizacion.contratante.flagEmail &&
                !!this.cotizacion.contratante.email) ||
            (this.cotizacion.contratante.flagContact &&
                !!(this.cotizacion.contratante.EListContactClient || []).length)
        ) {
            this.cotizacion.contratante.cliente360.EListAddresClient = null;
            this.cotizacion.contratante.cliente360.EListPhoneClient = null;
            this.cotizacion.contratante.cliente360.EListCIIUClient = null;
            this.clientInformationService
                .getCliente360(this.cotizacion.contratante.cliente360)
                .toPromise()
                .then(async (res) => {
                    if (Number(res.P_NCODE) === 0 || Number(res.P_NCODE) === 2) {
                        this.cotizacion.contratante.flagEmail = !this.cotizacion.contratante
                            .email
                            ? true
                            : false;
                        this.cotizacion.contratante.flagContact = !(
                            this.cotizacion.contratante.EListContactClient || []
                        ).length
                            ? true
                            : false;
                        this.cotizacion.detail = !this.cotizacion.contratante.flagContact
                            ? true
                            : false;
                        this.isLoading = false;
                        if (!requerid) {
                            // Validar retroactividad
                            /*
                            const response: any = await this.ValidateRetroactivity();
                            if (response.P_NCODE == 4) {
                              this.cotizacion.derivaRetro = true;
                              await swal.fire('Información', response.P_SMESSAGE, 'error');
                              // return;
                            } else {
                              this.cotizacion.derivaRetro = false;
                            }
                            */
                            this.cotizacion.derivaRetro = false;
                            this.validarMensajePolizaMatriz();
                        }
                    } else {
                        this.isLoading = false;
                        swal.fire('Información', res.P_SMESSAGE, 'error');
                        return;
                    }
                });
        } else {
            if (!requerid) {
                // Validar retroactividad
                /*
                const response: any = await this.ValidateRetroactivity();
                if (response.P_NCODE == 4) {
                  this.cotizacion.derivaRetro = true;
                  await swal.fire('Información', response.P_SMESSAGE, 'error');
                  // return;
                } else {
                  this.cotizacion.derivaRetro = false;
                }
                */
                this.cotizacion.derivaRetro = false;
                this.validarMensajePolizaMatriz();
            }
        }
    }

    validarMensajePolizaMatriz() {
        this.isLoading = false;
        if (!!this.cotizacion.poliza.checkbox1.POL_MAT && this.validarAforo()) {
            swal
                .fire({
                    title: 'Información',
                    text: this.storageService.variable.var_confirmarPolizaMatriz,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.grabarCotizacion();
                    }
                });
        } else {
            swal
                .fire({
                    title: 'Información',
                    text: '¿Deseas generar la cotización?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Generar',
                    cancelButtonText: 'Cancelar',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.grabarCotizacion();
                    }
                });
        }
    }

    async ValidateRetroactivity(operacion: number = 1) {
        let response: any = {};

        let cambioFecha = 0;
        if (this.cotizacion.transac == 'EM') {
            cambioFecha = this.cotizacion.fechaEfectoPoliza.setHours(0, 0, 0, 0) !=
                this.cotizacion.poliza.fechaInicioPoliza.setHours(0, 0, 0, 0) ? 1 : 0;
        } else {
            cambioFecha = this.cotizacion.fechaEfectoPoliza.setHours(0, 0, 0, 0) !=
                this.cotizacion.poliza.fechaInicioAsegurado.setHours(0, 0, 0, 0) ? 1 : 0;
        }

        const dataQuotation: any = {
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NPRODUCT: '10', //Cod Producto Desgravamen
            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
            NumeroCotizacion: this.cotizacion.numeroCotizacion,
            P_DSTARTDATE: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza),
            P_DSTARTDATE_ASE:
                this.cotizacion.transac != 'EX'
                    ? CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioAsegurado)
                    : CommonMethods.formatDate(this.cotizacion.poliza.fechaExclusion),
            TrxCode: this.cotizacion.transac,
            RetOP: operacion,
            FlagCambioFecha: cambioFecha,
        };

        const myFormData: FormData = new FormData();
        myFormData.append('objeto', JSON.stringify(dataQuotation));
        await this.quotationService
            .ValidateRetroactivity(myFormData)
            .toPromise()
            .then((res) => {
                response = res;
            });

        return response;
    }

    // funcion de crear cotizacion
    grabarCotizacion() {
        const myFormData = this.obtenerFormDataCotizacion();

        this.isLoading = true;

        this.quotationService.insertQuotation(myFormData).subscribe(
            (res) => {
                this.cotizacion.numeroCotizacion = res.P_NID_COTIZACION;
                this.cotizacion.prepago = res;
                this.cotizacion.prepago.msjCotizacion =
                    'Se generó la cotización Nº ' +
                    res.P_NID_COTIZACION +
                    ', puede emitir directamente usando los siguientes métodos';
                this.cotizacion.prepago.msjOmitir =
                    'Se ha generado correctamente la cotización N° ' +
                    res.P_NID_COTIZACION +
                    ', puede consultarla y emitirla en cualquier momento.';
                // this.pagarCotizacion(res.P_NID_COTIZACION);return;
                if (res.P_COD_ERR === 0) {
                    this.isLoading = false;

                    if (
                        (res.P_SAPROBADO === 'S' &&
                            this.cotizacion.contratante.debtMark !== 1) ||
                        (res.P_SAPROBADO === 'N' &&
                            this.cotizacion.contratante.debtMark !== 1)
                    ) {
                        if (
                            !!this.cotizacion.contratante.email &&
                            !!(this.cotizacion.contratante.EListContactClient || []).length
                        ) {
                            if (!!this.cotizacion.poliza.checkbox1.POL_MAT && this.validarAforo()) {
                                this.emitPolicy(res.P_NID_COTIZACION);
                            } else {
                                this.emitirPoliza('', res.P_NID_COTIZACION);
                            }
                        } else {
                            swal
                                .fire(
                                    'Información',
                                    'Se ha generado correctamente la cotización N° ' +
                                    res.P_NID_COTIZACION,
                                    'success'
                                )
                                .then((value) => {
                                    this.router.navigate([
                                        '/extranet/' + this.link + '/consulta-cotizacion',
                                    ]);
                                });
                        }
                    } else {
                        swal
                            .fire(
                                'Información',
                                'Se ha generado correctamente la cotización N° ' +
                                res.P_NID_COTIZACION +
                                ',' +
                                res.P_SMESSAGE,
                                'success'
                            )
                            .then((value) => {
                                this.router.navigate([
                                    '/extranet/' + this.link + '/consulta-cotizacion',
                                ]);
                            });
                    }
                } else {
                    this.isLoading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            (error) => {
                this.isLoading = false;
            }
        );
    }

    obtenerFormDataCotizacion() {
        const params = this.obtenerParametrosCotizacion();

        const myFormData: FormData = new FormData();

        (this.cotizacion.cotizador.files || []).forEach((file) => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(params));

        return myFormData;
    }

    obtenerParametrosCotizacion() {
        const params = {
            NumeroPoliza: !!this.cotizacion.poliza.nroPoliza
                ? parseInt(this.cotizacion.poliza.nroPoliza)
                : 0,
            NumeroCotizacion: this.cotizacion.numeroCotizacion,
            P_NID_PROC: this.cotizacion.trama.NIDPROC,
            P_SCLIENT: this.cotizacion.contratante.id,
            P_NCURRENCY: this.cotizacion.poliza.moneda.NCODIGINT,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_DSTARTDATE: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaInicioPoliza
            ),
            P_DEXPIRDAT: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaFinPoliza
            ),
            P_DSTARTDATE_ASE: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaInicioAsegurado
            ),
            P_DEXPIRDAT_ASE: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaFinAsegurado
            ),
            P_NIDCLIENTLOCATION: 1,
            P_SCOMMENT: this.esEvaluacion
                ? this.cotizacion.comentario
                : this.cotizacion.cotizador.comentario,
            P_SRUTA: '',
            P_NUSERCODE: this.storageService.userId,
            P_NACT_MINA: this.cotizacion.poliza.checkbox2.TRA_MIN ? 1 : 0,
            P_NTIP_RENOV: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            P_SCOD_ACTIVITY_TEC: "",
            P_SCOD_CIUU: "",
            P_NTIP_NCOMISSION: 0,
            P_NPRODUCT: this.cotizacion.poliza.tipoProducto,//this.cotizacion.poliza.producto.codigo,
            P_NEPS: this.storageService.eps.STYPE,
            P_NPENDIENTE: '0', // FALTA,
            P_NCOMISION_SAL_PR: 0, // FALTA,
            CodigoProceso: this.cotizacion.trama.NIDPROC,
            P_DERIVA_RETRO: this.cotizacion.derivaRetro == true ? 1 : 0,
            retOP: 2,
            FlagCambioFecha:
                this.cotizacion.fechaEfectoPoliza.setHours(0, 0, 0, 0) !=
                    this.cotizacion.poliza.fechaInicioPoliza.setHours(0, 0, 0, 0)
                    ? 1
                    : 0,
            TrxCode: this.cotizacion.transac,
            planId: 3, // this.cotizacion.poliza.tipoPlan.ID_PLAN
            P_NMODULEC_TARIFARIO: "1",
            P_SDESCRIPT_TARIFARIO: "1",
            P_NPOLIZA_MATRIZ:
                this.cotizacion.poliza.checkbox1.POL_MAT && this.validarAforo()
                    ? 1
                    : 0,
            P_NTRABAJO_RIESGO: this.cotizacion.poliza.checkbox2.TRA_MIN ? 1 : 0,
            P_NFACTURA_ANTICIPADA: 1,
            // P_NPOLIZA_INDIVIDUAL: this.cotizacion.poliza.checkbox2.POL_IND ? 1 : 0,
            // P_NCOBERTURA_ADICIONAL: this.cotizacion.poliza.checkbox2.COB_ADI ? 1 : 0,
            P_NTYPE_PROFILE: null,
            P_NTYPE_PRODUCT: null,
            P_NTYPE_MODALITY: null,
            P_NTIPO_FACTURACION: this.cotizacion.poliza.tipoFacturacion.id,
            P_ESTADO: 2,
            PolizaEditAsegurados: 0, // 1 si se valido trama
            P_STRAN: this.cotizacion.transac,
            IsDeclare: this.cotizacion.tipoTransaccion == 4 ? true : false,
            // nuevos tarifario
            P_NDERIVA_TECNICA: 0,
            P_NSCOPE: !!this.cotizacion.poliza.codAlcance ? this.cotizacion.poliza.codAlcance.id : 1,
            P_NTEMPORALITY: 24,
            P_NTYPE_LOCATION: 1,
            P_NLOCATION: 14,
            P_POLICY: this.cotizacion.poliza.nroPoliza,
            P_TASA_SEGURO: this.cotizacion.poliza.tasasegurodesdev,
            P_TASA_AHORRO: this.cotizacion.poliza.tasaahorrodesdev,
            P_CUMULO_MAX: this.cotizacion.poliza.cumulomaxdesdev,
            QuotationDet: [
                {
                    P_NBRANCH: this.CONSTANTS.RAMO,
                    P_NPRODUCT: this.cotizacion.poliza.tipoProducto,
                    P_NTOTAL_TRABAJADORES: this.cotizacion.trama.TOT_ASEGURADOS,
                    P_NMONTO_PLANILLA: this.cotizacion.trama.MONT_PLANILLA,
                    P_NTASA_CALCULADA: this.cotizacion.trama.TASA == null ? this.cotizacion.poliza.tasadesdev : this.cotizacion.trama.TASA,
                    P_NTASA_PROP: this.cotizacion.trama.TASA == null ? this.cotizacion.poliza.tasadesdev : this.cotizacion.trama.TASA,//0, // FALTA
                    P_NPREMIUM_MIN: this.cotizacion.trama.PRIMA,
                    P_NPREMIUM_MIN_PR: this.cotizacion.poliza.primaPropuesta,
                    P_NPREMIUM_END: '0',
                    P_NRATE: this.cotizacion.trama.TASA == null ? this.cotizacion.poliza.tasadesdev : this.cotizacion.trama.TASA,//0,
                    P_NDISCOUNT: 0,
                    P_NACTIVITYVARIATION: 0,
                    P_FLAG: '0',
                    P_NAMO_AFEC: this.cotizacion.trama.PRIMA,
                    P_NIVA: this.cotizacion.trama.IGV,
                    P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL,
                    P_NDE: 0,
                    P_SID_TARIFARIO: this.cotizacion.poliza.id_tarifario,
                    P_NVERSION_TARIFARIO: this.cotizacion.poliza.version_tarifario,
                    P_SNAME_TARIFARIO: this.cotizacion.poliza.name_tarifario
                },
            ],
            QuotationCom: [],
        };
        // if (
        //   this.cotizacion.tipoTransaccion == 8 &&
        //   this.cotizacion.brokersEndoso.length !== 0
        // ) {
        //   this.cotizacion.brokers = this.cotizacion.brokersEndoso;
        // }
        (this.cotizacion.brokers || []).forEach((broker) => {
            params.QuotationCom.push({
                P_NIDTYPECHANNEL: parseInt(broker.NTYPECHANNEL),
                P_NINTERMED: parseInt(broker.COD_CANAL),
                P_SCLIENT_COMER: broker.SCLIENT,
                P_NCOMISION_SAL: broker.P_COM_SALUD === '' ? 0 : broker.P_COM_SALUD,
                P_NCOMISION_SAL_PR:
                    broker.P_COM_SALUD_PRO === '' ? 0 : broker.P_COM_SALUD_PRO,
                P_NCOMISION_PEN: 0,
                P_NCOMISION_PEN_PR: 0,
                P_NPRINCIPAL: broker.P_NPRINCIPAL,
                P_SEDIT: broker.P_SEDIT,
            });
        });
        //console.log('params', this.cotizacion);
        return params;
    }

    validarCampos(): any {
        let msg = '';
        let edadmin = 0;
        let edadmax = 0;
        let edadperm = 0;

        if (!this.cotizacion.contratante.creditHistory) {
            msg += 'Debe ingresar un contratante  <br>';
        } else {
            if (this.cotizacion.contratante.email.trim() !== '') {
                if (
                    /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(
                        this.cotizacion.contratante.email
                    ) === false
                ) {
                    msg += 'El correo electrónico es inválido <br />';
                }
            }
        }

        if (this.cotizacion.poliza.checkbox1.POL_MAT) {
            if (!this.cotizacion.contratante.email) {
                msg += 'Debe ingresar un correo  <br>';
            }
            if (!(this.cotizacion.contratante.EListContactClient || []).length) {
                msg += 'Debe ingresar un contacto  <br>';
            }
        }

        if (this.cotizacion.brokers.length === 0) {
            msg += 'Debe ingresar un broker  <br>';
        }

        else {
            if (this.cotizacion.brokers[0].P_COM_SALUD_PRO == '0' || this.cotizacion.brokers[0].P_COM_SALUD_PRO == '') {
                msg += 'Por favor ingresar una comisión para el broker  <br>'
            }
        }
        // validacion personalizada para formato de comisión propuesta
        if (this.cotizacion.brokers) {
            for (let item of this.cotizacion.brokers) {
                if (item.P_COM_SALUD_PRO !== 0) {
                    let propuesta = item.P_COM_SALUD_PRO;
                    let ultimoCaracter = propuesta.charAt(propuesta.length - 1);
                    if (ultimoCaracter.includes('.')) {
                        msg +=
                            'El formato de la comisión propuesta del broker, es incorrecto <br>';
                    }
                }
            }
        }

        if (
            !this.cotizacion.poliza.tipoRenovacion ||
            !this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION
        ) {
            msg += 'Debe elegir el tipo de renovación  <br>';
        }

        if (!this.cotizacion.poliza.frecuenciaPago ||
            !this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA
        ) {
            msg += 'Debe elegir la frecuencia de pago  <br>';
        }

        if (!this.cotizacion.poliza.fechaInicioPoliza) {
            msg += 'Debe ingresar la fecha inicio de vigencia  <br>';
        }

        if (
            !this.cotizacion.poliza.moneda ||
            !this.cotizacion.poliza.moneda.NCODIGINT
        ) {
            msg += 'Debe elegir una moneda  <br>';
        }

        if (this.cotizacion.tipoTransaccion != 7) {
            if (!this.cotizacion.poliza.checkbox1.POL_MAT) {
                if (this.cotizacion.trama.excelSubir === undefined ||
                    this.cotizacion.trama.excelSubir === null ||
                    !this.cotizacion.trama.validado
                ) {
                    msg += 'Debe adjuntar trama <br>';
                }
            }
        }

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
        // Validaciones endoso
        /*  if (this.cotizacion.tipoTransaccion == 8) {
    
          if (this.cotizacion.PolizaEditAsegurados == 0) {
    
            if (
              this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA !=
              parseInt(
                this.cotizacion.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA
              )
            ) {
              if (
                this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA <
                this.cotizacion.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA
              ) {
                msg +=
                  'La frecuencia de pago no aplica para la facturación restante<br>';
              } else {
                if (
                  this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA == 4 &&
                  Number(
                    this.cotizacion.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA
                  ) == 3
                ) {
                  msg +=
                    'La frecuencia de pago no aplica para la facturación restante<br>';
                }
              }
            } else {
              msg += 'No a modificado ningun dato<br>';
            }
          } else if (this.cotizacion.PolizaEditAsegurados == 1) {
            if (
              this.cotizacion.trama.excelSubir === undefined ||
              this.cotizacion.trama.excelSubir === null
            ) {
              msg += 'Adjunte una trama para validar  <br>';
            }
          }
        }
         */

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
      
            if ((Number(this.cotizacion.poliza.tasasegurodesdev)+Number(this.cotizacion.poliza.tasaahorrodesdev)) > 100) {
                msg += 'La suma de tasa de seguro + tasa de ahorro no debe superar el 100%  <br>';
            }

          if (!this.cotizacion.poliza.cumulomaxdesdev ||
              this.cotizacion.poliza.cumulomaxdesdev == '0') {
                msg += 'Debe ingresar un cúmulo máximo por asegurado  <br>';
            }
      


        if (
            !!this.cotizacion.motivoAnulacion &&
            this.cotizacion.motivoAnulacion.COD_ANULACION == undefined &&
            this.modoVista == this.CONSTANTS.MODO_VISTA.ANULACION
        ) {
            msg += 'Debe elegir un motivo de anulación <br>';
        }

        return msg;
    }

    pagarCotizacion(idCotizacion) {
        // TODO
        const configData: any = {
            contactList: this.cotizacion.contratante.EListContactClient,
            creditHistory: this.cotizacion.contratante.creditHistory,
            codProduct: this.storageService.productId,
            // emitQuotation: this.dataEmision(idCotizacion),
            textOmitir: this.getMessageOmitir(idCotizacion),
            textSlogan:
                'Se generó la cotización Nº ' +
                idCotizacion +
                ', puede emitir directamente usando los siguientes métodos:',
        };

        const modalRef = this.ngbModal.open(MethodsPaymentComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.configData = configData;
    }

    getMessageOmitir(idCotizacion): string {
        let txtOmitir = '';
        if (Number(this.cotizacion.contratante.creditHistory.nflag) === 0) {
            txtOmitir =
                'Se ha generado correctamente la cotización N° ' +
                idCotizacion +
                ', puede consultarla y emitirla en cualquier momento.';
        } else {
            txtOmitir =
                'Se ha generado correctamente la cotización N° ' +
                idCotizacion +
                ', puede consultarla y emitirla en cualquier momento.';
        }
        return txtOmitir;
    }

    async clickEnviarNoProcede() {
        let message = '';

        if (!this.cotizacion.estado.codigo) {
            message += 'Debe seleccionar un estado <br />';
        }

        const params = this.obtenerDataEvaluacion();

        const myFormData: FormData = new FormData();

        (this.cotizacion.files || []).forEach(function (file) {
            myFormData.append(file.name, file, file.name);
        });


        myFormData.append('statusChangeData', JSON.stringify(params));

        let mensaje;

        if (this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId) {
            mensaje =
                '¿Desea desaprobar la cotización N° ' +
                this.cotizacion.numeroCotizacion +
                ' ?';
        } else {
            mensaje =
                '¿Desea cambiar al estado ' +
                this.cotizacion.estado.valor +
                ' la cotización N° ' +
                this.cotizacion.numeroCotizacion +
                '?';
        }

        swal
            .fire({
                title: 'Información',
                text: mensaje,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                allowOutsideClick: false,
                cancelButtonText: 'No',
            })
            .then((result) => {
                if (result.value) {
                    this.isLoading = true;
                    this.actualizarEstado(myFormData);
                }
            });
    }

    // funcion de btn Autorizar de tecnica y continuar de vista evaluar
    async clickEnviarEvaluacion() {
        let message = '';

        if (!this.cotizacion.estado.codigo) {
            message += 'Debe seleccionar un estado <br />';
        }

        if (
            (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EVALUAR ||
                this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EMITIR ||
                this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EMITIRR) &&
            this.CONSTANTS.ESTADO.NO_PROCEDE !== this.cotizacion.estado.codigo
        ) {
            if (this.cotizacion.contratante.flagEmail) {
                if (!this.cotizacion.contratante.email) {
                    message +=
                        'Debe ingresar un correo electrónico para la factura. <br />';
                } else {
                    if (
                        /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(
                            this.cotizacion.contratante.email
                        ) === false
                    ) {
                        message += 'El correo electrónico es inválido. <br />';
                    }
                }
            }

            if (
                this.cotizacion.contratante.flagContact &&
                !(this.cotizacion.contratante.EListContactClient || []).length
            ) {
                message += this.storageService.variable.var_contactZero + '<br />';
            }
        }

        if (message !== '') {
            swal.fire('Información', message, 'error');
            return;
        } else {
            this.validarCliente(true);
            this.isLoading = false;
            const params = this.obtenerDataEvaluacion();

            const myFormData: FormData = new FormData();

            (this.cotizacion.files || []).forEach(function (file) {
                myFormData.append(file.name, file, file.name);
            });

            myFormData.append('statusChangeData', JSON.stringify(params));
            let mensaje;

            if (this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId) {
                mensaje =
                    this.storageService.variable.var_aprobarPorTecnica +
                    this.cotizacion.numeroCotizacion +
                    ' ?';
            } else {
                mensaje =
                    '¿Desea cambiar al estado ' +
                    this.cotizacion.estado.valor +
                    ' la cotización N° ' +
                    this.cotizacion.numeroCotizacion +
                    '?';

                // Validar Retroactividad
                /*
                const response: any = await this.ValidateRetroactivity(2);
                if (response.P_NCODE == 4) {
                  // this.cotizacion.derivaRetro = true;
                  this.router.navigate(['/extranet/' + this.link + '/consulta-cotizacion']);
                  await swal.fire('Información', response.P_SMESSAGE, 'error');
                  return;
                }
                */
                // else {
                //   this.cotizacion.derivaRetro = false;
                // }
            }

            swal
                .fire({
                    title: 'Información',
                    text: mensaje,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    allowOutsideClick: false,
                    cancelButtonText: 'No',
                })
                .then((result) => {
                    if (result.value) {
                        this.isLoading = true;

                        if (
                            this.CONSTANTS.PERFIL.TECNICA ==
                            this.storageService.user.profileId
                        ) {
                            this.actualizarEstado(myFormData);
                        } else {
                            if (!!this.cotizacion.poliza.checkbox1.POL_MAT &&
                                this.cotizacion.tipoTransaccion == 1 && this.validarAforo()) {
                                this.emitPolicy(this.cotizacion.numeroCotizacion, 'directo');
                            } else {
                                if (this.cotizacion.contratante.debtMark !== 1) {
                                    this.emitirPoliza('', this.cotizacion);
                                } else {
                                    this.actualizarEstado(myFormData);
                                }
                            }
                        }
                    }
                });
        }
    }

    // funcion btn Emitir
    async clickEmitirEvaluacion() {
        let message = '';
        /*
            if (!this.cotizacion.estado.codigo) {
              message += 'Debe seleccionar un estado1 <br />';
            } */

        if (
            (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EVALUAR ||
                this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EMITIR) &&
            this.CONSTANTS.ESTADO.NO_PROCEDE !== this.cotizacion.estado.codigo
        ) {
            if (this.cotizacion.contratante.flagEmail) {
                if (!this.cotizacion.contratante.email) {
                    message +=
                        'Debe ingresar un correo electrónico para la factura. <br />';
                } else {
                    if (
                        /^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(
                            this.cotizacion.contratante.email
                        ) === false
                    ) {
                        message += 'El correo electrónico es inválido. <br />';
                    }
                }
            }

            if (
                this.cotizacion.contratante.flagContact &&
                !(this.cotizacion.contratante.EListContactClient || []).length
            ) {
                message += this.storageService.variable.var_contactZero + '<br />';
            }
        }

        if (message !== '') {
            swal.fire('Información', message, 'error');
            return;
        } else {
            this.validarCliente(true);
            this.isLoading = false;

            // Validar Retroactividad
            /*
            const response: any = await this.ValidateRetroactivity();
            if (response.P_NCODE == 4) {
              this.cotizacion.derivaRetro = true;
              await swal.fire('Información', response.P_SMESSAGE, 'error');
              // return;
            } else {
              this.cotizacion.derivaRetro = false;
            }
      */
            swal
                .fire({
                    title: 'Información',
                    text:
                        '¿Desea realizar la emisión de la cotización N° ' +
                        this.cotizacion.numeroCotizacion +
                        '?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    allowOutsideClick: false,
                    cancelButtonText: 'No',
                })
                .then(async (result) => {
                    if (result.value) {
                        this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();

                        if ((this.cotizacion.poliza.checkbox1.POL_MAT && this.validarAforo()) ||
                            !!this.cotizacion.checkPago == false
                        ) {
                            // Poliza matriz
                            this.emitPolicy(this.cotizacion.numeroCotizacion, 'directo');
                        } else {
                            // Evaluación
                            // if ((!!this.cotizacion.checkPago == false ||
                            //   !this.cotizacion.cotizador.checkbox.PAGO_ADEL) &&
                            //   this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR) {
                            if (
                                !this.cotizacion.cotizador.checkbox.PAGO_ADEL &&
                                this.cotizacion.modoVista != this.CONSTANTS.MODO_VISTA.EVALUAR
                            ) {
                                this.emitPolicy(this.cotizacion.numeroCotizacion, 'directo');
                            } else {
                                // // Validar Retroactividad
                                // const response: any = await this.ValidateRetroactivity(2);
                                // if (response.P_NCODE == 4) {
                                //   this.cotizacion.derivaRetro = true;
                                //   await swal.fire('Información', response.P_SMESSAGE, 'error');
                                //   return;
                                // }

                                this.isLoading = true;
                                this.modal.pagos = true;
                                if (this.modoVista == 'Evaluar') {
                                    this.cotizacion.contratante.emisionDirecta = 'S';
                                } else {
                                    this.cotizacion.contratante.emisionDirecta = 'S';//this.cotizacion.contratante.emisionDirecta = 'N';
                                }
                            }
                        }
                    }
                });
        }
    }

    clickIncluirPoliza() {
        this.clickRenovarPoliza();
    }

    async clickExcluirAsegurados() {
        const msgValidate = this.validarCampos();

        if (msgValidate === '') {
            // Validar Retroactividad
            /*
            const response: any = await this.ValidateRetroactivity();
            if (response.P_NCODE == 4) {
              await swal.fire('Información', response.P_SMESSAGE, 'error');
              // return;
            }
      */
            swal
                .fire({
                    title: 'Información',
                    text:
                        '¿Esta seguro que desea excluir los asegurados de la póliza ' +
                        this.cotizacion.poliza.nroPoliza +
                        '?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Procesar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then((result) => {
                    if (result.value) {
                        this.crearJob();
                    }
                });
        } else {
            swal.fire('Información', msgValidate, 'error');
        }
    }

    async clickRenovarPoliza() {
        const msgValidate = this.validarCampos();

        const trx =
            this.cotizacion.tipoTransaccion == 4
                ? this.cotizacion.transac == 'DE'
                    ? 'Declaración'
                    : 'Renovación'
                : 'Inclusión';

        if (msgValidate === '') {
            // Validar Retroactividad
            /*
            const response: any = await this.ValidateRetroactivity();
            if (response.P_NCODE == 4) {
              this.cotizacion.derivaRetro = true;
              await swal.fire('Información', response.P_SMESSAGE, 'error');
              // return;
            } else {
              this.cotizacion.derivaRetro = false;
            }
      */
            this.cotizacion.derivaRetro = false;
            swal
                .fire({
                    title: 'Información',
                    text:
                        '¿Está seguro que desea realizar la ' +
                        trx +
                        ' de la póliza ' +
                        this.cotizacion.poliza.nroPoliza +
                        '?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Procesar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then((result) => {
                    if (result.value) {
                        const params = this.obtenerParametrosCotizacion();
                        this.isLoading = true;

                        const myFiles: FormData = new FormData();

                        (this.cotizacion.files || []).forEach((file) => {
                            myFiles.append(file.name, file);
                        });

                        this.policyemit.renewMod(params, myFiles).subscribe(
                            (res) => {
                                if (res.P_COD_ERR == 0) {
                                    this.cotizacion.files = [];
                                    if (res.P_SAPROBADO === 'S' || res.P_SAPROBADO === 'N') {
                                        this.cotizacion.estadoMov = res.P_SAPROBADO;
                                        this.cotizacion.mensajeMov = res.P_SMESSAGE;

                                        if (
                                            this.CONSTANTS.MODO_VISTA.POLIZARENOVAR == this.modoVista
                                        ) {
                                            this.renovarPoliza(res.P_SAPROBADO);
                                        } else {
                                            this.realizarInclusion(res.P_SAPROBADO);
                                        }
                                    } else {
                                        swal.fire('Información', res.P_SMESSAGE, 'success');
                                        this.clickCancelar();
                                    }
                                } else {
                                    swal.fire(
                                        'Información',
                                        res.P_MESSAGE || res.P_SMESSAGE,
                                        'error'
                                    );
                                    this.isLoading = false;
                                }
                            },
                            (err) => {
                                this.isLoading = false;
                                swal.fire(
                                    'Información',
                                    'Hubo un error con el servidor',
                                    'error'
                                );
                            }
                        );
                    }
                });
        } else {
            swal.fire('Información', msgValidate, 'error');
        }
    }

    clickIncluir() {
        this.clickRenovar();
    }

    async clickRenovar() {
        // const msgValidate = '';

        // if (msgValidate === '') {
        // Validar Retroactividad
        /*
        const response: any = await this.ValidateRetroactivity();
        if (response.P_NCODE == 4) {
          this.cotizacion.derivaRetro = true;
          await swal.fire('Información', response.P_SMESSAGE, 'error');
          // return;
        }
    */
        swal
            .fire({
                title: 'Información',
                text:
                    '¿Está seguro que desea realizar la ' +
                    this.trxPendiente +
                    ' de la póliza ' +
                    this.cotizacion.poliza.nroPoliza +
                    '?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Procesar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            })
            .then((result) => {
                if (result.value) {
                    const params = this.obtenerParametrosCotizacion();
                    this.isLoading = true;
                    this.renovarPoliza();
                }
            });
        // } else {
        //   swal.fire('Información', msgValidate, 'error');
        // }
    }

    async clickEndosarPoliza() {
        // Validar retroactividad
        /* const response: any = await this.ValidateRetroactivity();
          if (response.P_NCODE == 4) {
            this.cotizacion.derivaRetro = true;
            await swal.fire('Información', response.P_SMESSAGE, 'error');
            return;
          } else {
            this.cotizacion.derivaRetro = false;
          } */

        const msgValidate = this.validarCampos();

        if (msgValidate === '') {
            swal
                .fire({
                    title: 'Información',
                    text:
                        '¿Esta seguro que desea ' +
                        'realizar el endoso de' +
                        ' la póliza ' +
                        this.cotizacion.poliza.nroPoliza +
                        '?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Procesar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then((result) => {
                    if (result.value) {
                        // console.log(this.cotizacion);
                        const params = this.obtenerParametrosCotizacion();

                        this.isLoading = true;
                        this.policyemit.renewMod(params).subscribe(
                            (res) => {
                                if (res.P_COD_ERR == 0) {
                                    this.crearJob(this.cotizacion.trama.NIDPROC);
                                    //   swal.fire(
                                    //     'Información',
                                    //     'Se ha realizado el movimiento para la póliza ' +
                                    //     this.cotizacion.poliza.nroPoliza +
                                    //     ' de forma satisfactoria.',
                                    //     'success'
                                    //   );
                                    //   this.clickCancelar();
                                    //   return;
                                }
                                // if (
                                //   res.P_COD_ERR == 0 &&
                                //   this.cotizacion.PolizaEditAsegurados == 0
                                // ) {
                                //   this.crearJob(res.P_NIDPROC);
                                // } else {
                                //   swal.fire(
                                //     'Información',
                                //     res.P_MESSAGE || res.P_SMESSAGE,
                                //     'error'
                                //   );
                                //   this.isLoading = false;
                                // }
                            },
                            (err) => {
                                this.isLoading = false;
                                swal.fire(
                                    'Información',
                                    'Hubo un error con el servidor',
                                    'error'
                                );
                            }
                        );
                    }
                });
        } else {
            swal.fire('Información', msgValidate, 'error');
        }
    }

    realizarInclusion(pago?) {
        this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();

        if (this.cotizacion.prepago) {
            this.cotizacion.contratante.emisionDirecta =
                this.cotizacion.prepago.P_SAPROBADO;
        } else {
            this.cotizacion.contratante.emisionDirecta = pago;
        }
        this.isLoading = true;
        this.modal.pagos = true;
    }

    async renovarPoliza(pago?) {
        // if (this.modoVista === 'Evaluar' || this.modoVista === 'RenovarPoliza') {
        this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();
        // }

        if (this.cotizacion.prepago) {
            this.cotizacion.contratante.emisionDirecta =
                this.cotizacion.prepago.P_SAPROBADO;
        } else {
            this.cotizacion.contratante.emisionDirecta = pago;
        }

        if (
            this.modoVista == 'RenovarPoliza' ||
            (this.cotizacion.cotizador.checkbox.PAGO_ADEL &&
                this.cotizacion.checkPago)
        ) {
            // // Validar Retroactividad
            // const response: any = await this.ValidateRetroactivity(2);
            // if (response.P_NCODE == 4) {
            //   this.cotizacion.derivaRetro = true;
            //   this.router.navigate(['/extranet/request-status']);
            //   await swal.fire('Información', response.P_SMESSAGE, 'error');
            //   return; // Quitar luego
            // }

            this.isLoading = true;
            this.modal.pagos = true;
            return;
        }

        if (
            !!this.cotizacion.checkPago == false ||
            this.modoVista !== 'RenovarPoliza'
        ) {
            if (this.modoVista !== 'Evaluar') {
                this.crearJob('', 'directo');
            }
            return;
        }
    }

    clickAnularPoliza() {
        const msgValidate = this.validarCampos();

        if (msgValidate === '') {
            swal
                .fire({
                    title: 'Información',
                    text:
                        '¿Esta seguro que desea anular la póliza ' +
                        this.cotizacion.poliza.nroPoliza +
                        '?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Procesar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar',
                })
                .then((result) => {
                    if (result.value) {
                        this.crearJob();
                    }
                });
        } else {
            swal.fire('Información', msgValidate, 'error');
        }
    }

    // funcion que evalua el tipo de emision
    async emitirPoliza(pago?, cotizacion?) {
        if (
            (this.cotizacion.prepago &&
                this.cotizacion.prepago.P_SAPROBADO === 'N') ||
            this.modoVista == 'Evaluar'
        ) {
            this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();
        }

        if (this.cotizacion.prepago) {
            this.cotizacion.contratante.emisionDirecta =
                this.cotizacion.prepago.P_SAPROBADO;
        } else {
            if (this.modoVista == 'Evaluar') {
                this.cotizacion.contratante.emisionDirecta = 'S';
            } else {
                this.cotizacion.contratante.emisionDirecta = 'N'; // original
            }
        }

        if (this.modoVista == '' || this.modoVista == undefined || this.modoVista == 'Evaluar') {
            // // Validar Retroactividad
            // const response: any = await this.ValidateRetroactivity(2);
            // if (response.P_NCODE == 4) {
            //   this.cotizacion.derivaRetro = true;
            //   await swal.fire('Información', response.P_SMESSAGE, 'error');
            //   return;
            // }

            this.isLoading = true;
            this.modal.pagos = true;
        } else {
            if (this.modoVista !== 'Evaluar') {
                let nid;
                if (
                    this.cotizacion.prepago &&
                    this.cotizacion.prepago.P_NID_COTIZACION
                ) {
                    nid = this.cotizacion.prepago.P_NID_COTIZACION;
                } else {
                    nid = this.cotizacion.numeroCotizacion;
                }

                this.emitPolicy(nid, 'directo');
            }
        }
    }

    // funcion para emitir la poliza
    emitPolicy(quotationNumber, pagoElegido?): any {
        let campoFrecuencia = '';

        switch (String(this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA)) {
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

        let primaNeta, primaBruta, igv;
        if (this.esEvaluacion) {
            primaNeta =
                this.cotizacion.cotizador.amountPremiumListAnu[1].NPREMIUMN_ANU;
            primaBruta =
                this.cotizacion.cotizador.amountPremiumListAnu[3].NPREMIUMN_ANU;
            igv = this.cotizacion.cotizador.amountPremiumListAnu[2].NPREMIUMN_ANU;
        } else {
            primaNeta = this.cotizacion.trama.amountPremiumList[1][campoFrecuencia];
            primaBruta = this.cotizacion.trama.amountPremiumList[3][campoFrecuencia];
            igv = this.cotizacion.trama.amountPremiumList[2][campoFrecuencia];
        }

        const params = [
            {
                P_NID_COTIZACION: quotationNumber,
                P_NID_PROC: this.cotizacion.trama.NIDPROC,
                P_NPRODUCT: this.cotizacion.poliza.tipoProducto,
                P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                P_NBRANCH: this.CONSTANTS.RAMO,
                P_DSTARTDATE: CommonMethods.formatDate(
                    this.cotizacion.poliza.fechaInicioPoliza
                ),
                P_DEXPIRDAT: CommonMethods.formatDate(
                    this.cotizacion.poliza.fechaFinPoliza
                ),
                P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                P_FACT_MES_VENCIDO: 0,
                P_SFLAG_FAC_ANT: 1,
                P_NPREM_NETA: primaNeta,
                SRUTA: '',
                P_IGV: igv,
                P_NPREM_BRU: primaBruta,
                P_NUSERCODE: this.storageService.userId,
                P_SCOMMENT:
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
                        this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR
                        ? this.cotizacion.comentario
                        : '',
                FlagCambioFecha: this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR
                    ? this.cotizacion.fechaEfectoPoliza.setHours(0, 0, 0, 0) !=
                        this.cotizacion.poliza.fechaInicioPoliza.setHours(0, 0, 0, 0) ? 1 : 0 : 0,
                P_NIDPAYMENT: '',
                P_NPOLIZA_MATRIZ: this.cotizacion.poliza.checkbox1.POL_MAT &&
                    this.validarAforo()
                    ? 1
                    : 0,
                P_SPAGO_ELEGIDO: pagoElegido,
                P_POLICY: this.cotizacion.poliza.nroPoliza,
                P_NAMO_AFEC: this.cotizacion.trama.PRIMA,
                P_NIVA: this.cotizacion.trama.IGV,
                P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL,
                P_NDE: 0,
                P_DSTARTDATE_ASE: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioAsegurado),
                P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinAsegurado)
            },
        ];

        const myFormData: FormData = new FormData();
        // if (this.cotizacion.trama.excelSubir) {
        //   this.cotizacion.cotizador.files.push(this.cotizacion.trama.excelSubir)
        // }
        (this.cotizacion.cotizador.files || []).forEach((file) => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(params));

        this.isLoading = true;

        this.policyemit.savePolicyEmit(myFormData).subscribe(
            (res) => {
                if (res.P_COD_ERR == 0) {
                    const policyId = Number(res.P_POL_AP);
                    const constancia = Number(res.P_NCONSTANCIA);

                    let msg = '';

                    if (this.cotizacion.poliza.checkbox1.POL_MAT && this.validarAforo()) {
                        msg =
                            '. Deberá adjuntar la trama de asegurados en un proceso posterior';
                    }
                    if (policyId > 0) {
                        let ramo = this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION ? "desgravamen con devolución" : "vida grupo";
                        swal
                            .fire({
                                title: 'Información',
                                text:
                                    'Se ha generado correctamente la póliza de ' + ramo + ' N° ' +
                                    policyId +
                                    msg,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                            .then((result) => {
                                if (result.value) {
                                    this.router.navigate([
                                        '/extranet/' + this.link + '/consulta-poliza',
                                    ]);
                                }
                            });
                    }
                } else if (res.P_COD_ERR == 4) {
                    this.router.navigate(['/extranet/' + this.link + '/consulta-cotizacion',]);
                    swal.fire('Información', res.P_MESSAGE, 'error');
                } else {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    });
                }

                this.isLoading = false;
            },
            (err) => {
                swal.fire(
                    'Información',
                    'Hubo un problema al comunicarnos con el servidor.',
                    'error'
                );
                this.isLoading = false;
            }
        );
    }

    clickCancelar() {
        if (
            this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.ENDOSO ||
            this.modoVista == this.CONSTANTS.MODO_VISTA.ANULACION
        ) {
            this.router.navigate(['/extranet/' + this.link + '/consulta-poliza']);
        } else {
            this.router.navigate([
                '/extranet/' + this.link + '/consulta-cotizacion',
            ]);
        }
    }

    clickProcesarTrama() {
        swal
            .fire({
                title: 'Información',
                text:
                    '¿Desea procesar la poliza matriz N° ' +
                    this.cotizacion.poliza.nroPoliza +
                    '?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Procesar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            })
            .then((result) => {
                if (result.value) {
                    this.isLoading = true;

                    let params = {
                        idproc: this.cotizacion.trama.NIDPROC,
                        nrocotizacion: this.cotizacion.numeroCotizacion,
                        p_sreceipt_ind: 0,
                        p_sflag_fac_ant: 1,
                        idpayment: 0,
                        ruta: '',
                        coltimre: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
                        mov_anul: 0,
                        fechaini_poliza: CommonMethods.formatDate(
                            this.cotizacion.poliza.fechaInicioPoliza
                        ),
                        fechafin_poliza: CommonMethods.formatDate(
                            this.cotizacion.poliza.fechaFinPoliza
                        ),
                        fechaini_aseg: CommonMethods.formatDate(
                            //new Date()
                            this.cotizacion.poliza.fechaInicioPoliza
                        ),
                        fechafin_aseg: CommonMethods.formatDate(
                            this.cotizacion.poliza.fechaFinAsegurado
                        ),
                        usercode: this.storageService.userId,
                        typeTransact: 14,
                        idfrecuencia_pago:
                            this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
                        nbranch: this.CONSTANTS.RAMO,
                        nproducto: this.cotizacion.poliza.tipoProducto,
                        rate_cal: this.cotizacion.poliza.tasadesdev,
                        rate_prop: this.cotizacion.poliza.tasadesdev,
                        npremium_min: 0,
                        npremium_min_pro: 0,
                        npremium_end: 0,
                        nrate: this.cotizacion.poliza.tasadesdev,
                        ndiscount: 0,
                        nvariaction: 0,
                        nflag: 0,
                        namo_afec: this.cotizacion.trama.PRIMA,
                        niva: this.cotizacion.trama.IGV,
                        namount: this.cotizacion.trama.PRIMA_TOTAL,
                        nde: 0,
                        sid_tarifario: this.cotizacion.poliza.id_tarifario,
                        nversion_tarifario: this.cotizacion.poliza.version_tarifario,
                        sname_tarifario: this.cotizacion.poliza.name_tarifario,
                        policy: this.cotizacion.poliza.nroPoliza,
                        ntasa_ahorro: this.cotizacion.poliza.tasaahorrodesdev,
                        ntasa_seguro: this.cotizacion.poliza.tasasegurodesdev,
                        ncumulo_max : this.cotizacion.poliza.cumulomaxdesdev
                    };
                    this.DesgravamenDevolucionService.procesarTrama(params).subscribe(
                        (res) => {
                            if (res.cod_error == 0) {
                                swal.fire(
                                    'Información',
                                    'Se procesó la trama correctamente.',
                                    'success'
                                );
                                this.router.navigate([
                                    '/extranet/' + this.link + '/consulta-poliza',
                                ]);
                            } else {
                                swal.fire('Información', res.message, 'error');
                            }
                            this.isLoading = false;
                        },
                        (error) => {
                            swal.fire(
                                'Información',
                                'Hubo un problema al comunicarnos con el servidor.',
                                'error'
                            );
                            this.isLoading = false;
                        }
                    );
                }
            });
    }

    actualizarEstado(params) {
        this.quotationService.changeStatusVL(params).subscribe(
            (res) => {
                this.isLoading = false;
                if (Number(res.StatusCode) === 0) {
                    swal.fire(
                        'Información',
                        'La operación se realizó correctamente.',
                        'success'
                    );
                    this.router.navigate([
                        '/extranet/' + this.link + '/consulta-cotizacion',
                    ]);
                } else {
                    swal.fire(
                        'Información',
                        CommonMethods.listToString(res.ErrorMessageList),
                        'error'
                    );
                }
            },
            (err) => {
                swal.fire(
                    'Información',
                    'Hubo un problema al comunicarnos con el servidor.',
                    'error'
                );
                this.isLoading = false;
            }
        );
    }

    obtenerDataEvaluacion() {
        const params = {
            QuotationNumber: !this.esEvaluacion
                ? this.cotizacion.prepago.P_NID_COTIZACION
                : this.cotizacion.numeroCotizacion,
            Status: (this.cotizacion.estado || {}).codigo || 2,
            Reason: (this.cotizacion.motivo || {}).codigo || '',
            Comment:
                this.modoVista == this.CONSTANTS.MODO_VISTA.EVALUAR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.RENOVAR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.INCLUIR ||
                    this.modoVista == this.CONSTANTS.MODO_VISTA.VISUALIZAR
                    ? this.cotizacion.comentario
                    : '',
            User: this.storageService.userId,
            Product: this.cotizacion.poliza.producto.codigo,
            Nbranch: this.cotizacion.poliza.producto.NBRANCH,
            path: '',
            Gloss: '', // this.cotizacion.motivo.codigo,
            GlossComment: '', // this.cotizacion.comentario,
            saludAuthorizedRateList: [],
            pensionAuthorizedRateList: [],
            BrokerList: [],
            P_POLICY: this.cotizacion.poliza.nroPoliza,
            Flag:
                this.modoVista == 'Emitir' ||
                    this.modoVista == 'EmitirR' ||
                    this.modoVista == 'Renovar' ||
                    this.modoVista == 'Incluir'
                    ? 1
                    : 0, // this.cotizacion.estado.codigo === this.CONSTANTS.ESTADO.NO_PROCEDE ? 1 : 0,
            P_SID_TARIFARIO: this.cotizacion.poliza.id_tarifario,
            P_NVERSION_TARIFARIO: this.cotizacion.poliza.version_tarifario,
            P_SNAME_TARIFARIO: this.cotizacion.poliza.name_tarifario,
            P_NCOT_TARIFARIO: this.cotizacion.modoVista == undefined || this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ? null : this.cotizacion.poliza.ncot_tarifario,
            P_NAMO_AFEC: this.cotizacion.trama.PRIMA,
            P_NIVA: this.cotizacion.trama.IGV,
            P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL,
            P_NDE: 0
        };

        if (this.modoVista == this.CONSTANTS.MODO_VISTA.AUTORIZAR) {
            this.cotizacion.brokers.forEach((item) => {
                params.BrokerList.push({
                    Id: item.COD_CANAL,
                    ProductList: [
                        {
                            Product: this.cotizacion.poliza.producto.codigo,
                            AuthorizedCommission:
                                Number(item.P_COM_SALUD_PRO) > 0
                                    ? item.P_COM_SALUD_PRO
                                    : item.P_COM_SALUD,
                        },
                    ],
                });
            });
        }

        return params;
    }

    crearJob(codproceso?: string, pagoElegido?) {
        const myFormData: FormData = new FormData();

        // if (this.cotizacion.trama.excelSubir) {
        //   this.cotizacion.files.push(this.cotizacion.trama.excelSubir)
        // }
        (this.cotizacion.files || []).forEach(function (file) {
            myFormData.append('adjuntos', file, file.name);
        });

        myFormData.append(
            'transaccionProtecta',
            JSON.stringify(this.objetoJob(codproceso, pagoElegido))
        );

        this.isLoading = true;

        this.policyemit.transactionPolicy(myFormData).subscribe(
            (res) => {
                if (res.P_COD_ERR == 0) {
                    swal.fire(
                        'Información',
                        'Se ha realizado el movimiento para la póliza ' +
                        this.cotizacion.poliza.nroPoliza +
                        ' de forma satisfactoria.',
                        'success'
                    );
                    this.clickCancelar();
                } else {
                    swal.fire('Información', res.P_MESSAGE || res.P_MESSAGE, 'error');
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }

    async formaPagoElegido() {
        if (this.modoVista === 'Evaluar' || this.modoVista === 'RenovarPoliza') {
            this.cotizacion.actualizarCotizacion = this.obtenerDataEvaluacion();
        }
        if (this.cotizacion.poliza.pagoElegido === 'efectivo') {
            this.router.navigate(['/extranet/policy/pago-efectivo']);
        }

        if (this.cotizacion.poliza.pagoElegido === 'voucher') {
            if (!!this.cotizacion.file) {
                if (!!this.cotizacion.actualizarCotizacion) {
                    const myFormData: FormData = new FormData();

                    (this.cotizacion.files || []).forEach(function (file) {
                        myFormData.append(file.name, file, file.name);
                    });
                    if (!!this.cotizacion.file) {
                        myFormData.append(
                            this.cotizacion.file.name,
                            this.cotizacion.file,
                            this.cotizacion.file.name
                        );
                    }

                    this.cotizacion.actualizarCotizacion.pagoElegido = 'voucher';
                    myFormData.append('statusChangeData', JSON.stringify(this.cotizacion.actualizarCotizacion));
                    swal
                        .fire({
                            title: 'Información',
                            text: '¿Deseas adjuntar el voucher?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Adjuntar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar',
                        })
                        .then((result) => {
                            if (result.value) {
                                this.actualizarEstado(myFormData);
                            } else {
                                this.isLoading = false;
                                this.modal.pagos = true;
                            }
                        });
                }
            } else {
                this.isLoading = false;
                this.modal.pagos = true;
                swal.fire(
                    'Información',
                    'Debes adjuntar voucher para continuar',
                    'error'
                );
            }
        }

        if (this.cotizacion.poliza.pagoElegido === 'omitir') {
            if (
                this.cotizacion.tipoTransaccion == 0 ||
                this.cotizacion.tipoTransaccion == 1
            ) {
                swal
                    .fire('Información', this.cotizacion.prepago.msjOmitir, 'success')
                    .then((value) => {
                        this.router.navigate([
                            '/extranet/' + this.link + '/consulta-cotizacion',
                        ]);
                    });
            } else {
                if (this.cotizacion.estadoMov == 'V') {
                    swal
                        .fire('Información', this.cotizacion.mensajeMov, 'success')
                        .then((value) => {
                            this.router.navigate([
                                '/extranet/' + this.link + '/consulta-poliza',
                            ]);
                        });
                } else {
                    let msjTrx =
                        this.cotizacion.transac == 'IN'
                            ? 'la inclusión'
                            : this.cotizacion.transac == 'EN'
                                ? 'el endoso'
                                : this.cotizacion.transac == 'DE'
                                    ? 'la declaración'
                                    : 'la renovación';
                    swal
                        .fire(
                            'Información',
                            'Selecciona una de las opciones de pago para ' +
                            msjTrx +
                            ', de la póliza N° ' +
                            this.cotizacion.poliza.nroPoliza,
                            'success'
                        )
                        .then((value) => {
                            this.isLoading = false;
                            this.modal.pagos = true;
                        });
                }
            }
        }

        if (this.cotizacion.poliza.pagoElegido === 'directo') {
            if (
                this.cotizacion.tipoTransaccion == 0 ||
                this.cotizacion.tipoTransaccion == 1
            ) {
                this.emitPolicy(!this.cotizacion.prepago ? this.cotizacion.numeroCotizacion : this.cotizacion.prepago.P_NID_COTIZACION, 'directo');
            } else {
                this.crearJob('', 'directo');
            }
        }
    }

    objetoJob(codproceso?: string, pagoElegido?) {
        const params = {
            P_NPRODUCTO: this.cotizacion.poliza.producto.codigo,
            P_NBRANCH: this.CONSTANTS.RAMO,
            P_NID_COTIZACION: this.cotizacion.numeroCotizacion,
            P_DEFFECDATE:
                this.cotizacion.tipoTransaccion != 3
                    ? CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioAsegurado)
                    : CommonMethods.formatDate(this.cotizacion.poliza.fechaExclusion),
            P_DEXPIRDAT: CommonMethods.formatDate(
                this.cotizacion.poliza.fechaFinAsegurado
            ),
            P_NUSERCODE: this.storageService.userId,
            P_NTYPE_TRANSAC: this.cotizacion.tipoTransaccion,
            P_NID_PROC: !!codproceso ? codproceso : this.cotizacion.trama.NIDPROC,
            P_FACT_MES_VENCIDO: 0,
            P_SFLAG_FAC_ANT: 1,
            P_SCOLTIMRE: this.cotizacion.poliza.tipoRenovacion.COD_TIPO_RENOVACION,
            P_NPAYFREQ: this.cotizacion.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA,
            P_NMOV_ANUL: 0,
            P_NNULLCODE: !!this.cotizacion.motivoAnulacion
                ? this.cotizacion.motivoAnulacion.COD_ANULACION
                : 0,
            P_SCOMMENT:
                this.cotizacion.trxPendiente || !this.esEvaluacion
                    ? this.cotizacion.comentario
                    : '',
            P_SRUTA: '',
            P_NID_PENSION: '',
            P_NIDPAYMENT: '',
            P_SPAGO_ELEGIDO: pagoElegido,
            P_POLICY: this.cotizacion.poliza.nroPoliza,
            P_NAMO_AFEC: this.cotizacion.trama.PRIMA,
            P_NIVA: this.cotizacion.trama.IGV,
            P_NAMOUNT: this.cotizacion.trama.PRIMA_TOTAL,
            P_NDE: 0,
            P_DSTARTDATE_POL: CommonMethods.formatDate(this.cotizacion.poliza.fechaInicioPoliza),
            P_DEXPIRDAT_POL: CommonMethods.formatDate(this.cotizacion.poliza.fechaFinPoliza),
            P_STRAN: this.cotizacion.transac
        };

        return params;
    }
}
