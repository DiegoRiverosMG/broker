import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// Importación de servicios
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { OthersService } from '../../../services/shared/others.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

// Importacion de modelos
import { QuotationStatusChange } from '../../../models/quotation/request/quotation-status-change';
import { AuthorizedRate } from '../../../models/quotation/request/authorized-rate';
import { Status } from '../../../models/quotation/response/status';
import { Reason } from '../../../models/quotation/response/reason';
import { QuotationTracking } from '../../../models/quotation/response/quotation-tracking'
import * as FileSaver from 'file-saver';

// SweetAlert
import swal from 'sweetalert2';
// Configuración
import { CommonMethods } from './../../common-methods';
import { AccessFilter } from './../../access-filter'
import { QuotationTrackingSearch } from '../../../models/quotation/request/quotation-tracking-search';
import { FilePickerComponent } from '../../../modal/file-picker/file-picker.component';
import { QuotationBroker } from '../../../models/quotation/request/quotation-modification/quotation-broker';
import { QuotationModification } from '../../../models/quotation/request/quotation-modification/quotation-modification';
import { QuotationRisk } from '../../../models/quotation/request/quotation-modification/quotation-risk';
import { Broker } from '../../../models/quotation/request/broker';
import { BrokerProduct } from '../../../models/quotation/request/broker-product';
import { DatePipe } from '@angular/common';

// JSON Template
import configTemplate from '../../../../../../assets/json/config-template.json'
import configVariables from '../../../../../../assets/json/config-variables.json'
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { ValErrorComponent } from '../../../modal/val-error/val-error.component';
import { ValidateDebtReponse } from '../../../interfaces/validate-debt-response';
import { ValidateLockReponse } from '../../../interfaces/validate-lock-response';
import { ValidateDebtRequest } from '../../../models/collection/validate-debt.request';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import { GenAccountStatusRequest } from '../../../models/collection/gen-account-status-request';
import { GenAccountStatusResponse } from '../../../interfaces/gen-account-status-response';
import { ValidateLockRequest } from '../../../models/collection/validate-lock-request';
import { AddContactComponent } from '../../../modal/add-contact/add-contact.component';
import { QuotationCoverComponent } from '../quotation-cover/quotation-cover.component'; //MSR - Adecuaciones
import { DateArray } from 'ngx-bootstrap/chronos/types';
import { StorageService } from '../acc-personales/core/services/storage.service';
import { TransactService } from '../../../services/transact/transact.service';
import { AccPersonalesService } from '../acc-personales/acc-personales.service';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';

@Component({
    selector: 'app-quotation-evaluation',
    templateUrl: './quotation-evaluation.component.html',
    styleUrls: ['./quotation-evaluation.component.css']
})
export class QuotationEvaluationComponent implements OnInit {

    /**
     * Variables de paginación
     */
    currentPage = 1; // página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; // total de items encontrados
    listToShow: any = [];
    filter = new QuotationTrackingSearch();
    statusChangeList: any = [];
    quotationNumber: string;  // Número de cotización
    productoId: number;
    statusChangeRequest: any = {};  // Objeto principal a enviar en la operación de cambio de estado
    pensionAuthorizedRate: boolean = false;  // habilitar los campos de tasa autorizada de SCTR pensión
    saludAuthorizedRate: boolean = false;  // habilitar los campos de tasa autorizada de SCTR salud
    estimatedWorkerQuantity: string;
    zipCode: string;
    reasonList: Status[] = []; // Lista de razones para el cambio de estado
    statusList: Reason[] = []; // Lista de estados de cotización
    statusEstadoList: Reason[] = [];
    files = []; // Lista de archivos cargados para subirse
    lastFileAt: Date; // Variable de componente FILES para ordenar por fecha
    filesMaxSize = 10485760;  // Limite del total de tamaño de archivos
    mode: string;
    isLoading: Boolean = false; // true:mostrar | false:ocultar pantalla de carga
    mainFormGroup: FormGroup;
    inputsQuotation: any = {}; // Datos de cotización que se carga para Evaluar la cotización
    genericServerErrorMessage: string = 'Ha ocurrido un error inesperado, contáctese con soporte.';
    redirectionMessage: string = 'Usted será redireccionado a la página anterior.';
    canApproveQuotation: boolean;
    canProposeRate: boolean;
    canSeeRiskRate: boolean;
    originalHealthMainPropComission: number;
    originalPensionMainPropComission: number;
    originalPensionMainAuthComission: number;
    originalHealthMainAuthComission: number;
    originalHealthMinPropPremium: number;
    originalPensionMinPropPremium: number;
    originalPensionMinAuthPremium: number;
    originalHealthMinAuthPremium: number;
    enabledPensionProposedRate: boolean;
    enabledHealthProposedRate: boolean;
    enabledPensionAuthorizedRate: boolean;
    enabledHealthAuthorizedRate: boolean;
    enabledHealthMinPropPremium: boolean;
    enabledHealthAuthorizedPremium: boolean;
    enabledPensionMinPropPremium: boolean;
    enabledPensionAuthorizedPremium: boolean;
    enabledHealthMainPropCommission: boolean;
    enabledHealthMainAuthCommission: boolean;
    enabledPensionMainPropCommission: boolean;
    enabledPensionMainAuthCommission: boolean;
    enabledHealthSecondaryPropCommission: boolean;
    enabledPensionSecondaryPropCommission: boolean;
    enabledHealthSecondaryAuthCommission: boolean;
    enabledPensionSecondaryAuthCommission: boolean;
    buttonName: string;
    evaluationLabel: string;
    healthIGV: number;
    pensionIGV: number;
    vidaLeyIGV: number;
    myDate = new Date();
    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    healthProductId = JSON.parse(localStorage.getItem('saludID'));
    pensionProductId = JSON.parse(localStorage.getItem('pensionID'));
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    codProfile: any;
    pensionMessage: string;
    isNetPremiumLessThanMinHealthPremium: boolean;
    isNetPremiumLessThanMinPensionPremium: boolean;
    healthMessage: string;
    statusChange: string;
    status: any;
    sproducto = 'SCTR PENSIÓN';
    sprimaMinima = 'PRIMA MÍNIMA PENSIÓN';
    totalWorkers: any;
    totalAmount: number;
    from: string;// MRC
    template: any = {}
    variable: any = {}
    cotEstado: number;
    comisionAut: boolean = false;
    dayConfig: any = 0;
    dayRetroConfig: any = 0;
    bsConfig: Partial<BsDatepickerConfig>;
    VAL_QUOTATION: any = {}; // MRC
    VAL_QUOTATION_ERROR: any = {};// MRC
    commissionState = true;
    comisionList: any;
    /* INI COT-FII */
    isProposedCommission = false;
    canTasaVL = true;
    isRateProposed;
    codProductoLoad: any;
    flagCotN = 'N';
    flagCotF = 'F';
    arrayRateProposed = [];
    nidProc = '';
    categoryList: any = [];
    rateByPlanList: any = [];
    detailPlanList: any = [];
    amountPremiumList: any = [];
    amountDetailTotalList: any = [];
    CommissionList: any = [];
    CalculateList: any = [];
    CalculateDetailList: any = [];
    ProposalList: any = [];
    ProposalDetailList: any = [];
    AuthorizedList: any = [];
    AuthorizedDetailList: any = [];
    btnCotiza: boolean = true;
    btnNormal: boolean = true;
    commissionValue = '';
    archivoExcel: File;
    excelSubir: File;
    erroresList: any = [];
    processID = '';
    perfil: any;
    policyNumber: any;
    typeTran: any;
    flagContact: boolean = false;
    flagEmail: boolean = false;
    flagDisabledRestric: boolean = false;
    validateField = [];
    brokerProfile = '';
    glossList: any = []; // Mejoras SCTR
    dEmiPension = 0;
    dEmiSalud = 0;
    @ViewChild('desde') desde: any;
    @ViewChild('hasta') hasta: any;
    @ViewChild('desdeAseg') desdeAseg: any;
    lblFecha: string = '';
    lblProducto: string = '';
    clientCode = '';
    validateDebtResponse: ValidateDebtReponse = {};
    creditHistory: any = null;
    contractingdata: any = [];
    validateLockResponse: ValidateLockReponse = {};
    contactList: any = [];
    commentTran: any;
    emsionDirecta = '';
    descPlanBD: '';
    flagEvaluarDirecto = 0;
    retroVal = 0;
    retroMsg: string = '';
    stran: string = '';
    CreditDataNC: any; //AVS PRY NC
    cotizacionNC: any; //AVS PRY NC
    CanalNC: any; //AVS PRY NC
    UserID: any; //AVS NC
    FlagPagoNC: any; //AVS PRY NC
    flagBotonNC: any; //AVS NC

    formatsDateTest: string[] = [
        'dd/MM/yyyy'
    ];
    dateNow: Date = new Date();

    FechaEfectoInicial: Date;
    // variables de prueba para abrir modal de pagos
    modal: any = {};
    cotizacion: any = {};
    nbranch: any = {};

    transactNumber = 0;
    isTransact = false;

    tipoProceso = 3; // GCAA 30112023

    titleTransact = '';
    usersList: any = [];
    userAssigned = 0;
    nTransac: number = 0;
    sAbrTran: string = '';
    isReasignar: boolean = false;
    infoTransact: any = {};
    tipoEndoso: any = [];
    blokerMod: any = [];
    TitleOperacion = '';
    isPolizaMatriz = false;
    hiddenPolizaMatriz = false;
    flagAprobCli: boolean = false;
    quotationDataTra: any;
    flagEnvioEmail = 0;
    flagRechazoPol: boolean = false;
    planList: any = []; //LSR
    resProfileOpe: any[] = [];
    isProfileOpe = 0;

    emitirCertificadoTecnica = false; //KT flag para la generacion de certificados posterior a la aprobación de tecnica
    emitirCertificadoOperaciones = false; //KT
    datasavecertificados: any = {};
    flagGobiernoEstado = false;
    flagGobiernoMatriz = false;
    flagGobiernoIniciado: boolean = false;
    mailEjecCom: string;
    nidprodEmisionEstado: string = '';
    derivaRetroactividad: boolean = false;
    planPropuesto: '';
    brokerList: any = {};
    emitirPolizaOperaciones = false;
    emitirPolizaMatrizTramiteEstado = false;
    enviarPolizaMatrizTramiteEstado = false;
    iniciadoPolizaMatrizTramiteEstado = false;
    statusTransact = "";
    rechazoMotivoList: any = []; //motivos de rechazo tramites.
    rechazoMotivoID: any = null;
    //EAER - Gestion Tramites Estado - 13092022

    countinputEMP_18_36 = 0;
    /*
    countinputEMP_37_55 = 0;
    countinputEMP_56_63 = 0;
    countinputEMP_64_70 = 0;
    countinputEMP_71_80 = 0;
    countinputEMP_81_99 = 0;
    */

    planillainputEMP_18_36 = 0;
    /*
    planillainputEMP_37_55 = 0;
    planillainputEMP_56_63 = 0;
    planillainputEMP_64_70 = 0;
    planillainputEMP_71_80 = 0;
    planillainputEMP_81_99 = 0;
    */

    tasainputEMP_18_36 = 0;
    /*
    tasainputEMP_37_55 = 0;
    tasainputEMP_56_63 = 0;
    tasainputEMP_64_70 = 0;
    tasainputEMP_71_80 = 0;
    tasainputEMP_81_99 = 0;
    */

    MontoSinIGVEMP_18_36 = 0;
    /*
    MontoSinIGVEMP_37_55 = 0;
    MontoSinIGVEMP_56_63 = 0;
    MontoSinIGVEMP_64_70 = 0;
    MontoSinIGVEMP_71_80 = 0;
    MontoSinIGVEMP_81_99 = 0;
    */

    countinputOBR_18_36 = 0; 
    /*
    countinputOBR_37_55 = 0;
    countinputOBR_56_63 = 0;
    countinputOBR_64_70 = 0;
    countinputOBR_71_80 = 0;
    countinputOBR_81_99 = 0;
    */

    planillainputOBR_18_36 = 0;
    /*
    planillainputOBR_37_55 = 0;
    planillainputOBR_56_63 = 0;
    planillainputOBR_64_70 = 0;
    planillainputOBR_71_80 = 0;
    planillainputOBR_81_99 = 0;
    */

    tasainputOBR_18_36 = 0;
    /*
    tasainputOBR_37_55 = 0;
    tasainputOBR_56_63 = 0;
    tasainputOBR_64_70 = 0;
    tasainputOBR_71_80 = 0;
    tasainputOBR_81_99 = 0;
    */

    MontoSinIGVOBR_18_36 = 0;
    /*
    MontoSinIGVOBR_37_55 = 0;
    MontoSinIGVOBR_56_63 = 0;
    MontoSinIGVOBR_64_70 = 0;
    MontoSinIGVOBR_71_80 = 0;
    MontoSinIGVOBR_81_99 = 0;
    */

    countinputOAR_18_36 = 0;
    /*
    countinputOAR_37_55 = 0;
    countinputOAR_56_63 = 0;
    countinputOAR_64_70 = 0;
    countinputOAR_71_80 = 0;
    countinputOAR_81_99 = 0;
    */

    planillainputOAR_18_36 = 0;
    /*
    planillainputOAR_37_55 = 0;
    planillainputOAR_56_63 = 0;
    planillainputOAR_64_70 = 0;
    planillainputOAR_71_80 = 0;
    planillainputOAR_81_99 = 0;
    */

    tasainputOAR_18_36 = 0;
    /*
    tasainputOAR_37_55 = 0;
    tasainputOAR_56_63 = 0;
    tasainputOAR_64_70 = 0;
    tasainputOAR_71_80 = 0;
    tasainputOAR_81_99 = 0;
    */
   
    MontoSinIGVOAR_18_36 = 0;
    /*
    MontoSinIGVOAR_37_55 = 0;
    MontoSinIGVOAR_56_63 = 0;
    MontoSinIGVOAR_64_70 = 0;
    MontoSinIGVOAR_71_80 = 0;
    MontoSinIGVOAR_81_99 = 0;
    */

    countinputEE = 0;
    planillainputEE = 0;
    tasainputEE = 0;
    MontoSinIGVEE = 0;
    countinputOE = 0;
    planillainputOE = 0;
    tasainputOE = 0;
    MontoSinIGVOE = 0;
    countinputOARE = 0;
    planillainputOARE = 0;
    tasainputOARE = 0;
    MontoSinIGVOARE = 0;
    TotalSinIGV = 0;
    TotalConIGV = 0;
    SumaConIGV = 0;

    MontoFPSinIGVEMP_18_36 = 0;
    /*
    MontoFPSinIGVEMP_37_55 = 0;
    MontoFPSinIGVEMP_56_63 = 0;
    MontoFPSinIGVEMP_64_70 = 0;
    MontoFPSinIGVEMP_71_80 = 0;
    MontoFPSinIGVEMP_81_99 = 0;
    */

    MontoFPSinIGVOBR_18_36 = 0;
    /*
    MontoFPSinIGVOBR_37_55 = 0;
    MontoFPSinIGVOBR_56_63 = 0;
    MontoFPSinIGVOBR_64_70 = 0;
    MontoFPSinIGVOBR_71_80 = 0;
    MontoFPSinIGVOBR_81_99 = 0;
    */

    MontoFPSinIGVOAR_18_36 = 0;
    /*
    MontoFPSinIGVOAR_37_55 = 0;
    MontoFPSinIGVOAR_56_63 = 0;
    MontoFPSinIGVOAR_64_70 = 0;
    MontoFPSinIGVOAR_71_80 = 0;
    MontoFPSinIGVOAR_81_99 = 0;
    */

    MontoFPSinIGVEE = 0;
    MontoFPSinIGVOE = 0;
    MontoFPSinIGVOARE = 0;
    TotalFPSinIGV = 0;
    TotalFPConIGV = 0;
    flagActivateExc = 0;
    chkTope = 0;
    //EAER - Gestion Tramites Estado - 13092022
    procesarPolizaOperaciones = false;
    questionTextEstado: string;
    dataPolizaEstado: any = {}; // Datos de cotización para transaccion de estado VL
    visualAprobEstado: boolean = false;
    PolizaMatrizTransac: boolean = false;
    //INI CAMBIO COMISION VL
    descriptionComisionVL: string = "0%";
    scomentarioComercial: string = '';
    //FIN CAMBIO COMISION VL
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private policyService: PolicyemitService,
        private quotationService: QuotationService,
        private mainFormBuilder: FormBuilder,
        private domSanitizer: DomSanitizer,
        private othersService: OthersService,
        private ngbModal: NgbModal,
        private modalService: NgbModal,
        private clientInformationService: ClientInformationService,
        private collectionsService: CobranzasService,
        private storageService: StorageService,
        private accPersonalesService: AccPersonalesService,
        private transactService: TransactService,
        public datepipe: DatePipe,
        private policyemit: PolicyemitService,
        private parameterSettingsService: ParameterSettingsService

    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }


    // Funcion de prueba para abrir modal de pagos
    async OpenModalPagos(paramsTrx) {
        await this.ValidacionPago();
        this.inputsQuotation.trama = {
            PRIMA_TOTAL: (this.inputsQuotation.tipoTransaccion == 1 && this.flagGobiernoIniciado) || this.emitirCertificadoTecnica ? paramsTrx[0].P_NAMOUNT : this.AuthorizedDetailList[2].AmountAuthorized,
            // this.inputsQuotation.tipoTransaccion == 1 ? paramsTrx[0].P_NPREM_BRU : paramsTrx.P_NPREM_BRU,
            NIDPROC: this.inputsQuotation.tipoTransaccion == 1 || this.emitirCertificadoTecnica ? paramsTrx[0].P_NID_PROC : paramsTrx.P_NID_PROC,
        };

        this.inputsQuotation.contratante = {
            email: this.inputsQuotation.P_SE_MAIL,
            NOMBRE_RAZON: this.inputsQuotation.P_SNOMBRES,
            COD_PRODUCT: this.productoId,
            tipoDocumento: {
                Id: this.inputsQuotation.DocumentTypeId
            },
            tipoPersona: {
                codigo: this.inputsQuotation.DocumentTypeId == 1 &&
                    this.inputsQuotation.DocumentNumber.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.inputsQuotation.DocumentNumber,
            // emisionDirecta: (this.mode === 'Evaluar' && this.vidaLeyID.nbranch!='73' )  ? 'V' :
            // (this.mode === 'Evaluar'  && this.vidaLeyID.nbranch=='73'&& Number(this.AuthorizedDetailList[2].AmountAuthorized)>=100 &&  (this.creditHistory.sdescript=='RIESGO BAJO' || (this.creditHistory.sdescript=='RIESGO ALTO' && this.contractingdata.P_SISCLIENT_GBD==1))) ? 'S' :'N',
            emisionDirecta: this.emitirPolizaOperaciones || this.flagGobiernoIniciado ? this.emsionDirecta : this.inputsQuotation.formaPago == true ? 'N' : this.emsionDirecta,
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateDebtResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.inputsQuotation.poliza = {
            producto: {
                COD_PRODUCT: this.productoId,
            }
        };

        this.inputsQuotation.prepago = {
            P_NID_COTIZACION: this.inputsQuotation.tipoTransaccion == 1 || this.emitirCertificadoTecnica ? paramsTrx[0].P_NID_COTIZACION : paramsTrx.P_NID_COTIZACION,
        };
        this.inputsQuotation.brokers = this.inputsQuotation.SecondaryBrokerList;

        for (const item of this.inputsQuotation.brokers) {
            item.COD_CANAL = item.CANAL;
        }

        if (this.inputsQuotation.tipoTransaccion == 1 || this.inputsQuotation.tipoTransaccion == 14) {
            paramsTrx[0].flagEmitCertificado == 1 ? paramsTrx[0].flagEmitCertificado = 0 : 0;
        }
        this.inputsQuotation.files = this.files;
        this.inputsQuotation.paramsTrx = paramsTrx;
        this.inputsQuotation.numeroCotizacion = this.inputsQuotation.tipoTransaccion == 1 ?
            paramsTrx[0].P_NID_COTIZACION : paramsTrx.P_NID_COTIZACION;
        this.inputsQuotation.transac = this.sAbrTran;
        this.cotizacion = this.inputsQuotation;

        if ((this.emsionDirecta == 'S' || this.flagEvaluarDirecto == 1) && this.mode == CommonMethods.TIPO_VISTAS.EVALUAR) {
            swal.fire('Información', 'La cotización ' + this.quotationNumber + ' ha sido aprobada, consultarla  para procesarla.', 'success');
            this.router.navigate(['/extranet/request-status']);
            this.inputsQuotation.formaPago = false;
        } else {
            if (this.inputsQuotation.formaPago) {
                localStorage.removeItem('creditdata'); // AVS PRY NC
                localStorage.removeItem('botonNC'); // AVS PRY NC
                this.modal.pagos = true;
                this.isLoading = true;
            } else {
                if (this.mode !== CommonMethods.TIPO_VISTAS.EVALUAR) {
                    if (this.inputsQuotation.tipoTransaccion == 1) {
                        this.emitirTrx(this.inputsQuotation.paramsTrx);
                    } else {
                        this.renovacionTrx(this.inputsQuotation.paramsTrx);
                    }
                }
            }
        }
    }
    validarFlagEC(obj, key) {
        return obj.hasOwnProperty(key)
    }
    async ValidacionPago() {
        let data: any = {}
        data.ncotizacion = this.quotationNumber;
        data.nusercode = this.inputsQuotation.UserAssigned;
        data.npendiente = 0;
        await this.quotationService.ValidarReglasPagos(data).toPromise().then(res => {

            this.emsionDirecta = res.P_SAPROBADO
        })
    }
    tipoTransaccion() {
        this.typeTran = CommonMethods.textFormat(this.typeTran);
        let transaccion: any = 1;
        const vistas = [[CommonMethods.TIPO_VISTAS.EVALUAR, 1], [CommonMethods.TIPO_VISTAS.EMITIR, 1], [CommonMethods.TIPO_VISTAS.RENOVAR, 4], [CommonMethods.TIPO_VISTAS.DECLARAR, 4], [CommonMethods.TIPO_VISTAS.INCLUIR, 2], [CommonMethods.TIPO_VISTAS.ENDOSAR, 8], [CommonMethods.TIPO_VISTAS.EXCLUIR, 3]];
        const transacciones = [[CommonMethods.TIPO_TRANSACCION.EMITIR, 1], [CommonMethods.TIPO_TRANSACCION.EMISION, 1], [CommonMethods.TIPO_TRANSACCION.RENOVAR, 4], [CommonMethods.TIPO_TRANSACCION.RENOVACION, 4],
                               [CommonMethods.TIPO_TRANSACCION.DECLARACION, 4], [CommonMethods.TIPO_TRANSACCION.INCLUIR, 2], [CommonMethods.TIPO_TRANSACCION.INCLUSION, 2], [CommonMethods.TIPO_TRANSACCION.ENDOSO, 8], 
                               [CommonMethods.TIPO_TRANSACCION.EXCLUIR, 3], [CommonMethods.TIPO_TRANSACCION.EXCLUSION, 3]];
        for (const item of vistas) {
            if (this.mode == item[0]) {
                for (const trans of transacciones) {
                    if (this.typeTran == trans[0]) {
                        transaccion = trans[1];
                        break;
                    }
                }
            }
        }

        return transaccion;
    }

    async EmitCertificadoTecnica() {
        this.isLoading = false;
        let title = '¿Desea realizar la emisión de certificados?';
        swal.fire({
            title: 'Información',
            text: title,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                this.policyService.getPolicyEmitCab(
                    this.quotationNumber, '1',
                    JSON.parse(localStorage.getItem('currentUser'))['id']
                ).toPromise().then(async (res: any) => {
                    if (!!res.GenericResponse &&
                        res.GenericResponse.COD_ERR == 0) {
                        await this.policyService.getPolicyEmitDet(
                            this.quotationNumber,
                            JSON.parse(localStorage.getItem('currentUser'))['id'])
                            .toPromise().then(
                                async resDet => {
                                    const params = [
                                        {
                                            P_NID_COTIZACION: this.quotationNumber,
                                            P_NID_PROC: this.nidProc,
                                            P_NPRODUCT: this.productoId,
                                            P_NBRANCH: this.nbranch,
                                            P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                            P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                                            P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                                            P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                            P_SFLAG_FAC_ANT: 1,
                                            P_FACT_MES_VENCIDO: 0,
                                            P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                            P_IGV: resDet[0].NSUM_IGV,
                                            P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                            P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,                        //Neta - RI
                                            P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,                             //IGV - RI
                                            P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized,                           //Bruta - RI
                                            P_SCOMMENT: '',
                                            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                            P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                            P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
                                            planId: this.planList.find(f => f.SDESCRIPT == this.inputsQuotation.desTipoPlan).NIDPLAN,
                                            FlagCambioFecha: 0,
                                            P_NPOLICY: res.GenericResponse.NPOLICY,
                                            P_NDE: 0,
                                            P_NIDPAYMENT: 0

                                        }
                                    ];

                                    if (params[0].P_NID_PROC == '') {

                                        await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                                            resCod => {
                                                params[0].P_NID_PROC = resCod;
                                            }
                                        );
                                    }
                                    if (!this.flagAprobCli)
                                        this.OpenModalPagos(params);
                                }
                            );
                    }
                });

            }
        });
    }

    validarDecimalPorcentage(int, decimal, input) {
        CommonMethods.validateDecimals(int, decimal, input);
    }

    changeMontoSinIGV(index: number) {
       //24112023
        if (index == 1) { 
        this.MontoSinIGVEMP_18_36 = CommonMethods.formatValor((Number(this.planillainputEMP_18_36) * Number(this.tasainputEMP_18_36)) / 100,6,1);
      /*  } else if (index == 1111) {
        this.MontoSinIGVEMP_37_55 = CommonMethods.formatValor((Number(this.planillainputEMP_37_55) * Number(this.tasainputEMP_37_55)) / 100,6,1);
        } else if (index == 11) {
        this.MontoSinIGVEMP_56_63 = CommonMethods.formatValor((Number(this.planillainputEMP_56_63) * Number(this.tasainputEMP_56_63)) / 100,6,1);
        } else if (index == 11111) {
        this.MontoSinIGVEMP_64_70 = CommonMethods.formatValor((Number(this.planillainputEMP_64_70) * Number(this.tasainputEMP_64_70)) / 100,6,1);
        } else if (index == 111) {
        this.MontoSinIGVEMP_71_80 = CommonMethods.formatValor((Number(this.planillainputEMP_71_80) * Number(this.tasainputEMP_71_80)) / 100,6,1);    
        } else if (index == 111111) {
        this.MontoSinIGVEMP_81_99 = CommonMethods.formatValor((Number(this.planillainputEMP_81_99) * Number(this.tasainputEMP_81_99)) / 100,6,1);   */ 
        } else if (index == 2) {
        this.MontoSinIGVOBR_18_36 = CommonMethods.formatValor((Number(this.planillainputOBR_18_36) * Number(this.tasainputOBR_18_36)) / 100,6,1);
        /*} else if (index == 2222) {
        this.MontoSinIGVOBR_37_55 = CommonMethods.formatValor((Number(this.planillainputOBR_37_55) * Number(this.tasainputOBR_37_55)) / 100,6,1);
        } else if (index == 22) {
        this.MontoSinIGVOBR_56_63 = CommonMethods.formatValor((Number(this.planillainputOBR_56_63) * Number(this.tasainputOBR_56_63)) / 100,6,1);
        } else if (index == 22222) {
        this.MontoSinIGVOBR_64_70 = CommonMethods.formatValor((Number(this.planillainputOBR_64_70) * Number(this.tasainputOBR_64_70)) / 100,6,1);
        } else if (index == 222) {
        this.MontoSinIGVOBR_71_80 = CommonMethods.formatValor((Number(this.planillainputOBR_71_80) * Number(this.tasainputOBR_71_80)) / 100,6,1);
        } else if (index == 222222) {
        this.MontoSinIGVOBR_81_99 = CommonMethods.formatValor((Number(this.planillainputOBR_81_99) * Number(this.tasainputOBR_81_99)) / 100,6,1);*/
        } else if (index == 3) {
        this.MontoSinIGVOAR_18_36 = CommonMethods.formatValor((Number(this.planillainputOAR_18_36) * Number(this.tasainputOAR_18_36)) / 100,6,1);
       /* } else if (index == 3333) {
        this.MontoSinIGVOAR_37_55 = CommonMethods.formatValor((Number(this.planillainputOAR_37_55) * Number(this.tasainputOAR_37_55)) / 100,6,1);
        } else if (index == 33) {
        this.MontoSinIGVOAR_56_63 = CommonMethods.formatValor((Number(this.planillainputOAR_56_63) * Number(this.tasainputOAR_56_63)) / 100,6,1);
        } else if (index == 33333) {
        this.MontoSinIGVOAR_64_70 = CommonMethods.formatValor((Number(this.planillainputOAR_64_70) * Number(this.tasainputOAR_64_70)) / 100,6,1);
        }else if (index == 333) {
        this.MontoSinIGVOAR_71_80 = CommonMethods.formatValor((Number(this.planillainputOAR_71_80) * Number(this.tasainputOAR_71_80)) / 100,6,1);
        } else if (index == 333333) {
        this.MontoSinIGVOAR_81_99 = CommonMethods.formatValor((Number(this.planillainputOAR_81_99) * Number(this.tasainputOAR_81_99)) / 100,6,1);*/
        }

      //  else if (index == 4) {
      //      this.MontoSinIGVEE = CommonMethods.formatValor(Number(this.planillainputEE) * Number(this.tasainputEE) / 100, 6);
      //  }
      //  else if (index == 5) {
       //     this.MontoSinIGVOE = CommonMethods.formatValor(Number(this.planillainputOE) * Number(this.tasainputOE) / 100, 6);
       // }
        //else if (index == 6) {
       //    this.MontoSinIGVOARE = CommonMethods.formatValor(Number(this.planillainputOARE) * Number(this.tasainputOARE) / 100, 6);
        //}
        this.changeFPMontoSinIGV();
    }

    changeFPMontoSinIGV() {
        var frecPago = 0;

        switch (Number(this.inputsQuotation.frecuenciaPago)) {
            case 1:
                frecPago = 12 // Anual
                break;
            case 2:
                frecPago = 6 // Semestral
                break;
            case 3:
                frecPago = 3 // Trimestral
                break;
            case 4:
                frecPago = 2 // Bimestral
                break;
            case 5:
                frecPago = 1; // Mensual
                break;

            default:
                break;
        }

        this.MontoFPSinIGVEMP_18_36 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_18_36) * Number(frecPago),6,1);
        /*
        this.MontoFPSinIGVEMP_37_55 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_37_55) * Number(frecPago),6,1);
        this.MontoFPSinIGVEMP_56_63 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_56_63) * Number(frecPago),6,1);
        this.MontoFPSinIGVEMP_64_70 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_64_70) * Number(frecPago),6,1);
        this.MontoFPSinIGVEMP_71_80 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_71_80) * Number(frecPago),6,1);
        this.MontoFPSinIGVEMP_81_99 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_81_99) * Number(frecPago),6,1);
        */

        this.MontoFPSinIGVOBR_18_36 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_18_36) * Number(frecPago),6,1);
        /*
        this.MontoFPSinIGVOBR_37_55 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_37_55) * Number(frecPago),6,1);
        this.MontoFPSinIGVOBR_56_63 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_56_63) * Number(frecPago),6,1);
        this.MontoFPSinIGVOBR_64_70 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_64_70) * Number(frecPago),6,1);
        this.MontoFPSinIGVOBR_71_80 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_71_80) * Number(frecPago),6,1);
        this.MontoFPSinIGVOBR_81_99 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_81_99) * Number(frecPago),6,1);
        */

        this.MontoFPSinIGVOAR_18_36 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_18_36) * Number(frecPago),6,1);
        /*
        this.MontoFPSinIGVOAR_37_55 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_37_55) * Number(frecPago),6,1);
        this.MontoFPSinIGVOAR_56_63 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_56_63) * Number(frecPago),6,1);
        this.MontoFPSinIGVOAR_64_70 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_64_70) * Number(frecPago),6,1);
        this.MontoFPSinIGVOAR_71_80 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_71_80) * Number(frecPago),6,1);
        this.MontoFPSinIGVOAR_81_99 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_81_99) * Number(frecPago),6,1);
        */

        this.MontoFPSinIGVEE = CommonMethods.formatValor(Number(this.MontoSinIGVEE) * Number(frecPago), 6);
        this.MontoFPSinIGVOE = CommonMethods.formatValor(Number(this.MontoSinIGVOE) * Number(frecPago), 6);
        this.MontoFPSinIGVOARE = CommonMethods.formatValor(Number(this.MontoSinIGVOARE) * Number(frecPago), 6);

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVEMP() { //LS - Poliza Matriz

        this.MontoSinIGVEMP_18_36 = CommonMethods.formatValor((Number(this.planillainputEMP_18_36) * Number(this.tasainputEMP_18_36)) / 100,6,1);
        /*
        this.MontoSinIGVEMP_37_55 = CommonMethods.formatValor((Number(this.planillainputEMP_37_55) * Number(this.tasainputEMP_37_55)) / 100,6,1);
        this.MontoSinIGVEMP_56_63 = CommonMethods.formatValor((Number(this.planillainputEMP_56_63) * Number(this.tasainputEMP_56_63)) / 100,6,1);
        this.MontoSinIGVEMP_64_70 = CommonMethods.formatValor((Number(this.planillainputEMP_64_70) * Number(this.tasainputEMP_64_70)) / 100,6,1);
        this.MontoSinIGVEMP_71_80 = CommonMethods.formatValor((Number(this.planillainputEMP_71_80) * Number(this.tasainputEMP_71_80)) / 100,6,1);
        this.MontoSinIGVEMP_81_99 = CommonMethods.formatValor((Number(this.planillainputEMP_81_99) * Number(this.tasainputEMP_81_99)) / 100,6,1);
        */  

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOBR() { //LS - Poliza Matriz

        this.MontoSinIGVOBR_18_36 = CommonMethods.formatValor((Number(this.planillainputOBR_18_36) * Number(this.tasainputOBR_18_36)) / 100,6,1);
        /*
        this.MontoSinIGVOBR_37_55 = CommonMethods.formatValor((Number(this.planillainputOBR_37_55) * Number(this.tasainputOBR_37_55)) / 100,6,1);
        this.MontoSinIGVOBR_56_63 = CommonMethods.formatValor((Number(this.planillainputOBR_56_63) * Number(this.tasainputOBR_56_63)) / 100,6,1);
        this.MontoSinIGVOBR_64_70 = CommonMethods.formatValor((Number(this.planillainputOBR_64_70) * Number(this.tasainputOBR_64_70)) / 100,6,1);
        this.MontoSinIGVOBR_71_80 = CommonMethods.formatValor((Number(this.planillainputOBR_71_80) * Number(this.tasainputOBR_71_80)) / 100,6,1);
        this.MontoSinIGVOBR_81_99 = CommonMethods.formatValor((Number(this.planillainputOBR_81_99) * Number(this.tasainputOBR_81_99)) / 100,6,1);
        */

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOAR() { //LS - Poliza Matriz
        this.MontoSinIGVOAR_18_36 = CommonMethods.formatValor((Number(this.planillainputOAR_18_36) * Number(this.tasainputOAR_18_36)) / 100,6,1);
        /*
        this.MontoSinIGVOAR_37_55 = CommonMethods.formatValor((Number(this.planillainputOAR_37_55) * Number(this.tasainputOAR_37_55)) / 100,6,1);
        this.MontoSinIGVOAR_56_63 = CommonMethods.formatValor((Number(this.planillainputOAR_56_63) * Number(this.tasainputOAR_56_63)) / 100,6,1);
        this.MontoSinIGVOAR_64_70 = CommonMethods.formatValor((Number(this.planillainputOAR_64_70) * Number(this.tasainputOAR_64_70)) / 100,6,1);
        this.MontoSinIGVOAR_71_80 = CommonMethods.formatValor((Number(this.planillainputOAR_71_80) * Number(this.tasainputOAR_71_80)) / 100,6,1);
        this.MontoSinIGVOAR_81_99 = CommonMethods.formatValor((Number(this.planillainputOAR_81_99) * Number(this.tasainputOAR_81_99)) / 100,6,1);
        */

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVEE() { //LS - Poliza Matriz

        this.MontoSinIGVEE = CommonMethods.formatValor(Number(this.planillainputEE) * Number(this.tasainputEE) / 100, 6);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOE() { //LS - Poliza Matriz

        this.MontoSinIGVOE = CommonMethods.formatValor(Number(this.planillainputOE) * Number(this.tasainputOE) / 100, 6);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOARE() { //LS - Poliza Matriz

        this.MontoSinIGVOARE = CommonMethods.formatValor(Number(this.planillainputOARE) * Number(this.tasainputOARE) / 100, 6);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeTotalSinIGV() { //LS - Poliza Matriz
        this.TotalSinIGV = CommonMethods.formatValor(
            Number(this.MontoSinIGVEMP_18_36) +
            /*
            Number(this.MontoSinIGVEMP_37_55) +
            Number(this.MontoSinIGVEMP_56_63) +
            Number(this.MontoSinIGVEMP_64_70) +
            Number(this.MontoSinIGVEMP_71_80) +
            Number(this.MontoSinIGVEMP_81_99) +
            */
            Number(this.MontoSinIGVOBR_18_36) +
            /*
            Number(this.MontoSinIGVOBR_37_55) +
            Number(this.MontoSinIGVOBR_56_63) +
            Number(this.MontoSinIGVOBR_64_70) +
            Number(this.MontoSinIGVOBR_71_80) +
            Number(this.MontoSinIGVOBR_81_99) +
            */
            Number(this.MontoSinIGVOAR_18_36) +
            /*
            Number(this.MontoSinIGVOAR_37_55) +
            Number(this.MontoSinIGVOAR_56_63) +
            Number(this.MontoSinIGVOAR_64_70) +
            Number(this.MontoSinIGVOAR_71_80) +
            Number(this.MontoSinIGVOAR_81_99) +
            */
            Number(this.MontoSinIGVEE) +
            Number(this.MontoSinIGVOE) +
            Number(this.MontoSinIGVOARE),
             2);
        this.TotalSinIGV = CommonMethods.formatValor(this.TotalSinIGV,2);
        this.TotalFPSinIGV = CommonMethods.formatValor(
            Number(this.MontoFPSinIGVEMP_18_36) +
            /*
            Number(this.MontoFPSinIGVEMP_37_55) +
            Number(this.MontoFPSinIGVEMP_56_63) +
            Number(this.MontoFPSinIGVEMP_64_70) +
            Number(this.MontoFPSinIGVEMP_71_80) +
            Number(this.MontoFPSinIGVEMP_81_99) +
            */
            Number(this.MontoFPSinIGVOBR_18_36) +
            /*
            Number(this.MontoFPSinIGVOBR_37_55) +
            Number(this.MontoFPSinIGVOBR_56_63) +
            Number(this.MontoFPSinIGVOBR_64_70) +
            Number(this.MontoFPSinIGVOBR_71_80) +
            Number(this.MontoFPSinIGVOBR_81_99) +
            */
            Number(this.MontoFPSinIGVOAR_18_36) +
            /*
            Number(this.MontoFPSinIGVOAR_37_55) +
            Number(this.MontoFPSinIGVOAR_56_63) +
            Number(this.MontoFPSinIGVOAR_64_70) +
            Number(this.MontoFPSinIGVOAR_71_80) +
            Number(this.MontoFPSinIGVOAR_81_99) +
            */
            Number(this.MontoFPSinIGVEE) + 
            Number(this.MontoFPSinIGVOE) +
             Number(this.MontoFPSinIGVOARE), 2);
        this.TotalFPSinIGV  = CommonMethods.formatValor(this.TotalFPSinIGV,2);
    }



    changeTotalConIGV() { //LS - Poliza Matriz
        // this.TotalConIGV = CommonMethods.formatValor((Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE)) * 118 / 100, 2,1);
        this.TotalConIGV = CommonMethods.formatValor(this.TotalSinIGV * 118 / 100, 2);
        // this.TotalFPConIGV = CommonMethods.formatValor((Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE)) * 118 / 100, 2);
        this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV * 118 / 100, 2);
        this.SumaConIGV = CommonMethods.formatValor(Number(this.TotalFPSinIGV) * 18 / 100, 2);
        // this.SumaConIGV = CommonMethods.formatValor(this.SumaConIGV, 2);
    }


    async recotizar() {
        // validar recotizacion de inclusion inclusion
        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION) {
            this.router.navigate(['/extranet/quotation'], { queryParams: { nroCotizacion: this.quotationNumber, typeTransac: this.typeTran } });
            /*let RatePropObr = 0, RatePropEmp = 0
            if (this.ProposalList.length == 1) {
              if (this.ProposalList[0].CategoryProposal == 'EMPLEADO') {
                RatePropEmp = this.ProposalList[0].RateProposal;
              } else {
                RatePropObr = this.ProposalList[0].RateProposal;
              }
            } else {
              RatePropEmp = this.ProposalList[0].RateProposal;
              RatePropObr = this.ProposalList[1].RateProposal;
            }   */
            /*let modify = false;
            let retro = false;
            if (this.codProducto == 3) {
              const response:any = await this.ValidateRetroactivity();
              if (response.P_NCODE == 4) {
                await swal.fire('Información', response.P_SMESSAGE, 'error');
                retro = true;
                //return;
              }
            }

            let propEqualAuth: boolean[] = [];
            this.ProposalList.forEach(e1 => {
              this.AuthorizedList.forEach(e2 => {
                if (e1.CategoryProposal == e2.CategoryAuthorized) {
                  propEqualAuth.push(e1.RateProposal == e2.RateAuthorized);
                }
              });
            });
            if (propEqualAuth.filter(x => x == false).length > 0) {
              modify = true;
            }
            const myFormData: FormData = new FormData();
            const data: any = {};
            data.QuotationNumber = this.quotationNumber;
            //rq cotizacion nuevo riesgo
            if (this.ProposalList.length > 0){
              data.RateProposedObr = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'EMPLEADO').map(m => m.RateProposal));
              data.RateProposedEmp = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'OBRERO').map(m => m.RateProposal));
              data.RateProposedOar = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'OBRERO ALTO RIESGO').map(m => m.RateProposal));
            } else {
              data.RateProposedObr = 0;
              data.RateProposedEmp = 0;
              data.RateProposedOar = 0;
            }
            data.ProposalList = this.ProposalList;
            data.UserCode = JSON.parse(localStorage.getItem('currentUser'))['id'];
            data.Message = this.commentTran;
            data.DateEfect = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
            data.Recotizar = modify == true ? 1 : 0;
            data.Retroactividad = retro == true ? 1 : 0;
            data.Recotizar = retro == false && modify == false ? 1 : data.Recotizar;
            data.Recotizar = data.Recotizar == 0 && this.statusChangeList[0].Reason != 'RETROACTIVIDAD' ? 1 : data.Recotizar;
            data.FlagCambioFecha = this.FechaEfectoInicial.setHours(0,0,0,0) != this.inputsQuotation.FDateIniAseg.setHours(0,0,0,0) ? 1 : 0;
            myFormData.append('objeto', JSON.stringify(data));

            swal.fire({
              title: 'Información',
              text: '¿Desea enviar la recotización?',
              type: 'question',
              showCancelButton: true,
              confirmButtonText: 'Recotizar',
              allowOutsideClick: false,
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              // this.isLoading = true;
              if (result.value) {
                this.quotationService.UpdateReQuotation(data).subscribe(
                  res => {
                    this.isLoading = false;
                    if (res.P_COD_ERR == 0) {
                      swal.fire('Información', '' + res.P_MESSAGE + ' ' + this.quotationNumber, 'success');
                      this.router.navigate(['/extranet/request-status']);
                    } else {
                      swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        type: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                      });
                    }
                  }
                );
              }
            });*/
        } else {
            this.router.navigate(['/extranet/quotation'], { queryParams: { nroCotizacion: this.quotationNumber, typeTransac: this.typeTran } });
        }
    }

    async renovarPoliza() {
        const errorList: any = [];
        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (errorList == null || errorList.length == 0) {
            if (((this.buttonName == 'Renovar' || this.buttonName == 'Declarar') && this.mode == CommonMethods.TIPO_VISTAS.RENOVAR) || this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR) {
                if (this.codProducto == 3) {
                    const response: any = await this.ValidateRetroactivity();
                    if (response.P_NCODE == 4) {
                        await swal.fire('Información', response.P_SMESSAGE, 'error');
                        //return;
                    }
                }
                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processRenovation();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processRenovation();
                    }
                } else {
                    this.processRenovation();
                }
            } else {
                this.AddStatusChange();
            }
        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processRenovation() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : (this.sAbrTran == 'DE') ? '¿Desea realizar la declaración de la cotización N° ' + this.quotationNumber + '?' : '¿Desea realizar la renovación de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: (this.sAbrTran == 'DE') ? 'Declarar' : 'Renovar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        })
            .then((result) => {
                if (result.value) {
                    this.objetoTrx();

                    // const typeMovement = '1';
                    // let obj: any;
                    // const renovacion: any = {};
                    // const myFormData: FormData = new FormData();
                    // this.policyService.getPolicyEmitCab(
                    // this.quotationNumber, typeMovement,
                    // JSON.parse(localStorage.getItem('currentUser'))['id']).subscribe(
                    //   res => {
                    //     obj = res;
                    //     // swal.fire({
                    //     //   title: 'Información',
                    //     //   text: '¿Desea realizar la renovación?',
                    //     //   type: 'question',
                    //     //   showCancelButton: true,
                    //     //   confirmButtonText: 'Renovar',
                    //     //   allowOutsideClick: false,
                    //     //   cancelButtonText: 'Cancelar'

                    //     // })
                    //     // .then((result) => {
                    //     // if (result.value) {
                    //     this.quotationService.getProcessCode(this.quotationNumber).subscribe(
                    //       resCod => {
                    //         this.nidProc = resCod;
                    //         renovacion.P_NID_COTIZACION = this.quotationNumber; // nro cotizacion
                    //         const effecDate = new Date(obj.GenericResponse.EFECTO_COTIZACION);
                    //         const expirDate = new Date(obj.GenericResponse.EXPIRACION_COTIZACION);
                    //         renovacion.P_DEFFECDATE =
                    // effecDate.getDate().toString().padStart(2, '0') + '/' +
                    // (effecDate.getMonth() + 1).toString().padStart(2, '0') + '/' + effecDate.getFullYear();
                    //         renovacion.P_DEXPIRDAT =
                    // expirDate.getDate().toString().padStart(2, '0') + '/' +
                    // (expirDate.getMonth() + 1).toString().padStart(2, '0') + '/' + expirDate.getFullYear();
                    //         renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'] // Fecha hasta
                    //         renovacion.P_NTYPE_TRANSAC = '4'; // tipo de movimiento
                    //         renovacion.P_NID_PROC = this.nidProc; // codigo de proceso (Validar trama)
                    //         renovacion.P_FACT_MES_VENCIDO = 0; // Facturacion Vencida
                    //         renovacion.P_SFLAG_FAC_ANT = 1; // Facturacion Anticipada
                    //         renovacion.P_SCOLTIMRE = obj.GenericResponse.TIP_RENOV; // Tipo de renovacion
                    //         renovacion.P_NPAYFREQ = obj.GenericResponse.FREQ_PAGO; // Frecuencia Pago
                    //         renovacion.P_NMOV_ANUL = 0; // Movimiento de anulacion
                    //         renovacion.P_NNULLCODE = 0; // Motivo anulacion
                    //         renovacion.P_SCOMMENT = null; // Frecuencia Pago
                    //         renovacion.P_NPREM_BRU = this.AuthorizedDetailList[2].AmountAuthorized;

                    //         this.OpenModalPagos(renovacion);
                    //       });
                    //     // }
                    // });
                }
            });
    }

    async incluirPoliza() {
        const errorList: any = [];
        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (errorList == null || errorList.length == 0) {
            if ((this.buttonName == 'Incluir' && this.mode == CommonMethods.TIPO_VISTAS.INCLUIR) || this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR) {
                //validar retroactividad
                if (this.codProducto == 3) {
                    const response: any = await this.ValidateRetroactivity();
                    if (response.P_NCODE == 4) {
                        await swal.fire('Información', response.P_SMESSAGE, 'error');
                        //return;
                    }
                }
                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processInclude();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processInclude();
                    }
                } else {
                    this.processInclude();
                }
            } else {
                this.AddStatusChange();
            }

        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processInclude() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : '¿Desea realizar la inclusión de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Incluir',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                this.objetoTrx();
                // const typeMovement = '1';
                // let obj: any;
                // const renovacion: any = {};
                // const myFormData: FormData = new FormData();
                // this.policyService.getPolicyEmitCab(
                //   this.quotationNumber, typeMovement,
                //   JSON.parse(localStorage.getItem('currentUser'))['id']).subscribe(
                //     res => {
                //       obj = res;
                //       // swal.fire({
                //       //   title: 'Información',
                //       //   text: '¿Desea realizar la inclusión?',
                //       //   type: 'question',
                //       //   showCancelButton: true,
                //       //   confirmButtonText: 'Incluir',
                //       //   allowOutsideClick: false,
                //       //   cancelButtonText: 'Cancelar'

                //       // }).then((result) => {
                //       //   if (result.value) {
                //       this.quotationService.getProcessCode(this.quotationNumber).subscribe(
                //         resCod => {
                //           this.nidProc = resCod;
                //           renovacion.P_NID_COTIZACION = this.quotationNumber; // nro cotizacion
                //           const effecDate = new Date(obj.GenericResponse.EFECTO_COTIZACION);
                //           const expirDate = new Date(obj.GenericResponse.EXPIRACION_COTIZACION);
                //           renovacion.P_DEFFECDATE =
                //  effecDate.getDate().toString().padStart(2, '0') + '/' +
                //  (effecDate.getMonth() + 1).toString().padStart(2, '0') + '/' + effecDate.getFullYear();
                //           renovacion.P_DEXPIRDAT =
                // expirDate.getDate().toString().padStart(2, '0') + '/' +
                // (expirDate.getMonth() + 1).toString().padStart(2, '0') + '/' + expirDate.getFullYear();
                //           renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'] // Fecha hasta
                //           renovacion.P_NTYPE_TRANSAC = '2'; // tipo de movimiento
                //           renovacion.P_NID_PROC = this.nidProc; // codigo de proceso (Validar trama)
                //           renovacion.P_FACT_MES_VENCIDO = 0; // Facturacion Vencida
                //           renovacion.P_SFLAG_FAC_ANT = 1; // Facturacion Anticipada
                //           renovacion.P_SCOLTIMRE = obj.GenericResponse.TIP_RENOV; // Tipo de renovacion
                //           renovacion.P_NPAYFREQ = obj.GenericResponse.FREQ_PAGO; // Frecuencia Pago
                //           renovacion.P_NMOV_ANUL = 0; // Movimiento de anulacion
                //           renovacion.P_NNULLCODE = 0; // Motivo anulacion
                //           renovacion.P_SCOMMENT = null; // Frecuencia Pago
                //           renovacion.P_NPREM_BRU = this.AuthorizedDetailList[2].AmountAuthorized;

                //           this.OpenModalPagos(renovacion);
                //           // myFormData.append('transaccionProtecta', JSON.stringify(renovacion));

                //           // this.policyService.transactionPolicy(myFormData).subscribe(
                //           //   resJob => {
                //           //     this.isLoading = false;
                //           //     if (resJob.P_COD_ERR == 0) {
                //           //       swal.fire('Información',
                // 'Se ha generado correctamente la inclusión de la póliza N° ' +
                // this.policyNumber, 'success');
                //           //       this.router.navigate(['/extranet/policy-transactions-all']);
                //           //     } else if (resJob.P_COD_ERR == 2) {
                //           //       swal.fire({
                //           //         title: 'Información',
                //           //         text: resJob.P_MESSAGE,
                //           //         type: 'info',
                //           //         confirmButtonText: 'OK',
                //           //         allowOutsideClick: false,
                //           //       }).then((result) => {
                //           //         if (result.value) {
                //           //           if (this.codProducto == 2) {
                //           //             this.router.navigate(['/extranet/policy-transactions']);
                //           //           } else {
                //           //             this.router.navigate(['/extranet/policy-transactions-all']);

                //           //           }
                //           //         }
                //           //       });
                //           //     } else {
                //           //       swal.fire({
                //           //         title: 'Información',
                //           //         text: resJob.P_MESSAGE,
                //           //         type: 'error',
                //           //         confirmButtonText: 'OK',
                //           //         allowOutsideClick: false,
                //           //       });
                //           //     }
                //           //   },
                //           //   err => {
                //           //   }
                //           // );
                //         },
                //         err => {
                //         }
                //       );
                //       // }
                //       // });

                //     },
                //     err => {
                //     }
                //   );
            }
        });


    }

    async invocaServPoliza() {
        if (this.codProducto == 3) {
            const response: any = await this.ValidateRetroactivity(1);
            if (response.P_NCODE == 4) {
                await swal.fire('Información', response.P_SMESSAGE, 'error');
                //return;
            }
        }
        // let comentario = ''
        // const fechaIni = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
        // const fechaFin = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
        // const savedPolicyList: any = [];
        // let amountDetailTotalList: any = [];
        // const savedPolicyEmit: any = {};
        // const typeMovement = '1';
        const pregunta = '¿Desea realizar la emisión de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                this.objetoTrx();
                // this.policyService.getPolicyEmitCab(
                //   this.quotationNumber, typeMovement,
                //   JSON.parse(localStorage.getItem('currentUser'))['id']
                // ).subscribe((res: any) => {
                //   if (res.GenericResponse !== null) {
                //     if (res.GenericResponse.COD_ERR == 0) {
                //       savedPolicyEmit.P_NID_COTIZACION = this.quotationNumber; //Cotizacion
                //       savedPolicyEmit.P_NID_PROC = res.GenericResponse.NID_PROC;// Proceso
                //       savedPolicyEmit.P_NPRODUCT = this.productoId;
                //       savedPolicyEmit.P_SCOLTIMRE = res.GenericResponse.TIP_RENOV;// Tipo Renovación
                //       savedPolicyEmit.P_DSTARTDATE = fechaIni; // res.GenericResponse.EFECTO_COTIZACION_VL;
                //       savedPolicyEmit.P_DEXPIRDAT = fechaFin;// res.GenericResponse.EXPIRACION_COTIZACION_VL;
                //       savedPolicyEmit.P_NPAYFREQ = res.GenericResponse.FREQ_PAGO; // Frecuencia Pago
                //       savedPolicyEmit.P_SFLAG_FAC_ANT = 1; // Facturacion Anticipada
                //       savedPolicyEmit.P_FACT_MES_VENCIDO = 0; // Facturacion Vencida

                //       const efectoWS = new Date(res.GenericResponse.EFECTO_COTIZACION_VL)
                //       const fechaEfecto = CommonMethods.formatDate(efectoWS);

                //       if (fechaIni != fechaEfecto) {
                //         comentario = 'Se ha modificado el inicio de vigencia: Antes = ' + fechaEfecto + '. Ahora = ' + fechaIni;
                //       }

                //       this.policyService.getPolicyEmitDet(this.quotationNumber, JSON.parse(localStorage.getItem('currentUser'))['id']).subscribe(
                //         res => {
                //           amountDetailTotalList = res;

                //           savedPolicyEmit.P_NPREM_NETA = amountDetailTotalList[0].NSUM_PREMIUMN;
                //           savedPolicyEmit.P_IGV = amountDetailTotalList[0].NSUM_IGV;
                //           savedPolicyEmit.P_NPREM_BRU = amountDetailTotalList[0].NSUM_PREMIUM;
                //           savedPolicyEmit.P_SCOMMENT = comentario; // Comentario
                //           savedPolicyEmit.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario

                //           savedPolicyList.push(savedPolicyEmit);
                //           this.OpenModalPagos(savedPolicyList);

                //         }
                //       );
                //     }
                //   }
                // });
            }
        });
    }

    async emitirPoliza() {
        const errorList: any = [];
        if (this.codProducto == 3) {
            if (this.flagContact && this.template.ins_addContact) {
                if (this.contactList.length === 0) {
                    errorList.push(this.variable.var_contactZero);
                }
            }

            if (this.template.ins_email) {
                if (this.inputsQuotation.P_SE_MAIL === '') {
                    errorList.push('Debe ingresar un correo electrónico para la factura.');
                } else {
                    if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                        errorList.push('El correo electrónico es inválido.');
                    }
                }
            }

            if (errorList == null || errorList.length == 0) {
                if (this.buttonName == 'Emitir') {
                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {

                        this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        this.contractingdata.P_TipOper = 'INS';
                        this.contractingdata.P_NCLIENT_SEG = -1;

                        if (this.flagContact && this.template.ins_addContact) {
                            this.contractingdata.EListContactClient = [];
                            if (this.contactList.length > 0) {
                                this.contactList.forEach(contact => {
                                    if (contact.P_NTIPCONT == 0) {
                                        contact.P_NTIPCONT = 99;
                                    }
                                    if (contact.P_NIDDOC_TYPE == '0') {
                                        contact.P_NIDDOC_TYPE = null;
                                        contact.P_SIDDOC = null;
                                    }
                                });
                                this.contractingdata.EListContactClient = this.contactList;
                            }
                        } else {
                            this.contractingdata.EListContactClient = null;
                        }

                        if (this.flagEmail && this.template.ins_email) {
                            this.contractingdata.EListEmailClient = [];
                            const contractingEmail: any = {};
                            contractingEmail.P_CLASS = '';
                            contractingEmail.P_DESTICORREO = 'Correo Personal';
                            contractingEmail.P_NROW = 1;
                            contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                            contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                            contractingEmail.P_SORIGEN = 'SCTR';
                            contractingEmail.P_SRECTYPE = '4';
                            contractingEmail.P_TipOper = '';
                            this.contractingdata.EListEmailClient.push(contractingEmail);
                        } else {
                            this.contractingdata.EListEmailClient = null;
                        }

                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.invocaServPoliza();
                        } else {
                            swal.fire('Información', response.message, 'error');
                        }

                    } else {
                        this.invocaServPoliza();
                    }
                } else {
                    this.AddStatusChange();
                }
            } else {
                swal.fire('Información', this.listToString(errorList), 'error');
            }

        } else {
            this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: this.quotationNumber } });
        }
    }

    async updateContracting() {
        const response: any = {};
        this.isLoading = true;
        this.contractingdata.EListAddresClient = null;
        this.contractingdata.EListPhoneClient = null;
        this.contractingdata.EListCIIUClient = null;
        await this.clientInformationService.getCliente360(this.contractingdata).toPromise().then(
            res => {
                response.code = res.P_NCODE;
                response.message = res.P_SMESSAGE;
                if (res.P_NCODE == '0' || res.P_NCODE == '2') {
                    this.isLoading = false;
                    this.flagContact = false;
                    this.flagEmail = false;
                } else {
                    if (this.template.ins_addContact && this.contactList.length > 0) {
                        this.contractingdata.EListContactClient = [];
                    }
                    this.isLoading = false;
                    // swal.fire('Información', res.P_SMESSAGE, 'error');
                    // return;
                }
            }, error => {
                response.code = '1';
                response.message = 'La solicitud no pudo ser procesada [Cliente 360]';
            }
        );

        return response;
    }

    getInfoAuth() {
        let data: any = {};
        data.QuotationNumber = this.quotationNumber;
        if (this.AuthorizedList.length > 0) {
            data.RateAuthorizedEmp = parseFloat(this.AuthorizedList.filter(x => x.CategoryAuthorized == 'EMPLEADO').map(m => m.RateAuthorized));
            data.RateAuthorizedObr = parseFloat(this.AuthorizedList.filter(x => x.CategoryAuthorized == 'OBRERO').map(m => m.RateAuthorized));
            data.RateAuthorizedOar = parseFloat(this.AuthorizedList.filter(x => x.CategoryAuthorized == 'OBRERO ALTO RIESGO').map(m => m.RateAuthorized));
        } else {
            data.RateAuthorizedEmp = 0;
            data.RateAuthorizedObr = 0;
            data.RateAuthorizedOar = 0;
        }
        data.AuthorizedList = this.AuthorizedList;
        data.AuthorizedCommission = this.inputsQuotation.CommissionAuthorized;

        this.quotationService.getInfoQuotationAuth(data).subscribe(
            res => {
                this.categoryList = res.CategoryList;
                this.CommissionList = res.CommissionList;
                this.CommissionList.forEach(element => {
                    this.inputsQuotation.PensionMinPremium = element.MinPremium;
                    this.inputsQuotation.desTipoComision = element.Commission;
                    this.inputsQuotation.desTipoPlan = element.Plan;
                    this.inputsQuotation.CommissionProposed = element.CommissionProposed;
                    this.inputsQuotation.CommissionAuthorized = element.CommissionAuthorized;
                });

                this.CalculateList = res.CalculateList;
                this.CalculateDetailList = res.CalculateDetailList;
                this.ProposalList = res.ProposalList;
                this.ProposalDetailList = res.ProposalDetailList;
                this.AuthorizedList = res.AuthorizedList;
                this.AuthorizedDetailList = res.AuthorizedDetailList;

                this.inputsQuotation.desTipoPlan = this.descPlanBD; //msr
                if (this.mode == CommonMethods.TIPO_VISTAS.VISUALIZAR && this.flagGobiernoEstado) {
                    this.visualAprobEstado = true;
                }

                if (this.inputsQuotation.SPolMatriz == 1) {
                    this.flagGobiernoMatriz = true;
                    //this.isPolizaMatriz = this.flagGobiernoMatriz;
                    //EAER -  Gestion de tramites con el Estado Sin trama
                    this.loadDatosCotizadorPolizaMatriz();
                }
            },
            err => {
            }
        );
    }

    changeAuthorizedRate(event, valor, row) {
        /*this.arrayRateProposed = [];

        if (this.AuthorizedList.length == 1) {
          if (this.AuthorizedList[0].CategoryAuthorized == 'EMPLEADO') {
            this.getInfoAuth(this.AuthorizedList[0].RateAuthorized, 0);
          } else {
            this.getInfoAuth(0, this.AuthorizedList[0].RateAuthorized);
          }
        } else {
          this.getInfoAuth(this.AuthorizedList[0].RateAuthorized, this.AuthorizedList[1].RateAuthorized);
        }*/
        this.getInfoAuth();
    }

    changePropossedRate(event, valor, row) {
        /*if (this.ProposalList.length == 1) {
          if (this.ProposalList[0].CategoryProposal == 'EMPLEADO') {
            this.getInfoProp(this.ProposalList[0].RateProposal, 0);
          } else {
            this.getInfoProp(0, this.ProposalList[0].RateProposal);
          }
        } else {
          this.getInfoProp(this.ProposalList[0].RateProposal, this.ProposalList[1].RateProposal);
        }*/
        this.getInfoProp();
    }

    getInfoProp() {
        const data: any = {};
        data.QuotationNumber = this.quotationNumber;
        if (this.ProposalList.length > 0) {
            data.RateProposedEmp = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'EMPLEADO').map(m => m.RateProposal));
            data.RateProposedObr = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'OBRERO').map(m => m.RateProposal));
            data.RateProposedOar = parseFloat(this.ProposalList.filter(x => x.CategoryProposal == 'OBRERO ALTO RIESGO').map(m => m.RateProposal));
        } else {
            data.RateProposedEmp = 0;
            data.RateProposedObr = 0;
            data.RateProposedOar = 0;
        }
        data.ProposalList = this.ProposalList;
        data.ProposedCommission = this.inputsQuotation.CommissionProposed;

        this.quotationService.getInfoQuotationAuth(data).subscribe(
            res => {
                this.categoryList = res.CategoryList;
                this.CommissionList = res.CommissionList;
                this.CommissionList.forEach(element => {
                    this.inputsQuotation.PensionMinPremium = element.MinPremium;
                    this.inputsQuotation.desTipoComision = element.Commission;
                    this.inputsQuotation.desTipoPlan = element.Plan;
                    this.inputsQuotation.CommissionProposed = element.CommissionProposed;
                    this.inputsQuotation.CommissionAuthorized = element.CommissionAuthorized;
                });
                this.ProposalList = [];
                this.ProposalDetailList = [];
                res.ProposalList.forEach(element => {
                    const itemAmountProposed: any = {};
                    itemAmountProposed.CategoryProposal = element.CategoryProposal;
                    itemAmountProposed.RateProposal = CommonMethods.formatValor(element.RateProposal, 2)
                    itemAmountProposed.PremiumProposal = CommonMethods.formatValor(element.PremiumProposal, 2);
                    itemAmountProposed.CategoryCode = element.CategoryCode;
                    this.ProposalList.push(itemAmountProposed);
                });
                res.ProposalDetailList.forEach(element => {
                    const itemProposalDetail: any = {};
                    itemProposalDetail.DescriptionProposal = element.DescriptionProposal;
                    itemProposalDetail.AmountProposal = CommonMethods.formatValor(element.AmountProposal, 2)
                    this.ProposalDetailList.push(itemProposalDetail);
                });
            },
            err => {
            }
        );
    }

    PrintPropose(): void {
        if (!!this.CalculateList) {
            if (this.CalculateList.length > 0) {
                this.ProposalList = []
                this.CalculateList.forEach(element => {
                    if (this.inputsQuotation.frecuenciaPago == 5) {
                        const itemAmountProposed: any = {};
                        itemAmountProposed.CategoryProposal = element.SCATEGORIA;
                        itemAmountProposed.RateProposal = CommonMethods.formatValor(element.NTASA, 2);
                        itemAmountProposed.PremiumProposal = CommonMethods.formatValor(element.NPREMIUMN_MEN, 2);
                        this.ProposalList.push(itemAmountProposed);
                    }
                });
            }
        }
    }

    validarExcel(codComission?: any) {
        this.btnCotiza = codComission == 100 ? false : codComission == 99 ? true : this.btnCotiza;
        this.btnNormal = codComission == 99 ? false : codComission == 100 ? true : this.btnNormal;

        if (codComission === undefined) {
            this.btnNormal = true;
            this.isRateProposed = false;
        }

        let msg = '';
        if (this.inputsQuotation.tipoRenovacion === '') {
            msg += 'Debe elegir el tipo de renovación  <br>';
        }

        if (this.inputsQuotation.P_NPRODUCT === '-1') {
            msg += 'Debe elegir el producto a cotizar  <br>';
        }

        if (this.codProducto == 2) {
            if (this.inputsQuotation.P_COMISION === '') {
                this.validateField[16] = '1';
                msg += 'Debe ingresar el porcentaje de comisión <br>';
            }
        }

        if (this.isProposedCommission) {
            if (this.inputsQuotation.commissionProposed == null) {
                this.validateField[20] = '20';
                msg += 'Ingrese la comisión.<br>';
            }
        }

        if (this.inputsQuotation.P_COMISION === '') {
            msg += 'Debe elegir la comisión  <br>';
        }

        if (this.excelSubir == null && !(this.flagGobiernoEstado && this.flagGobiernoMatriz)) {
            msg += 'Adjunte una trama para validar  <br>'
        }

        if (msg === '') {
            this.validarTrama(codComission);
            this.hiddenPolizaMatriz = false;
        } else {
            if (codComission == undefined) {
                swal.fire('Información', msg, 'error');
            }
        }
    };

    seleccionExcel(archivo: File) {
        this.excelSubir = null;
        this.hiddenPolizaMatriz = false;
        if (!archivo) {
            this.excelSubir = null;
            return;
        }
        this.categoryList = [];
        this.rateByPlanList = [];
        this.excelSubir = archivo;
    }

    GetAmountDetailTotalListValue(tipo, freq): number {   // usado para setear  montos del cotizador en EC
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_MEN)[tipo];
            } else if (freq == 4) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_BIM)[tipo];
            } else if (freq == 3) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_TRI)[tipo];
            } else if (freq == 2) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_SEM)[tipo];
            } else if (freq == 1) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_ANU)[tipo];
            } else if (freq == 9) {
                valorAD = this.amountDetailTotalList.map(m => m.NAMOUNT_TOT)[tipo];
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    onProposed(event) {
        if (event.target.checked) {
            this.commissionState = false;
        } else {
            this.commissionState = true;
            this.inputsQuotation.commissionProposed = null;
            this.inputsQuotation.rateObrProposed = null;
            this.inputsQuotation.rateEmpProposed = null;
            this.validateField[16] = '';
            this.validateField[20] = '';
            this.validateField[21] = '';
            this.validateField[22] = '';
        }

    }


    async ngOnInit() {
        this.getPlanList();
        this.createFormControl();
        this.initializeForm();

        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
        this.codProfile = await this.getProfileProduct(); // 20230325
        this.brokerProfile = this.variable.var_prefilExterno;
        this.inputsQuotation.primaMinimaPension = this.codProducto == 2 ? this.variable.var_primaMinimaPension : '';

        this.quotationDataTra = JSON.parse(sessionStorage.getItem('cs-quotation'));
        const quotationData = this.quotationDataTra;
        console.log(quotationData);
        //#region Flag de reverso para vley
        this.flagReverse();
        //#endregion

        //const quotationData = JSON.parse(sessionStorage.getItem('cs-quotation'));
        if (!!quotationData) {
            this.quotationNumber = quotationData.QuotationNumber;
            this.productoId = quotationData.ProductId;
            this.status = quotationData.Status;
            this.mode = CommonMethods.textFormat(quotationData.Mode);
            this.from = quotationData.From;
            this.policyNumber = quotationData.PolicyNumber;
            this.typeTran = CommonMethods.textFormat(quotationData.TypeTransac);
            this.transactNumber = quotationData.TransactNumber;
            this.userAssigned = quotationData.UserCodeAssigned;
            this.inputsQuotation.tipoTransaccion = this.tipoTransaccion();
            this.flagGobiernoEstado = quotationData.SPOL_ESTADO == 1 ? true : false;
            this.flagGobiernoMatriz = quotationData.SPOL_MATRIZ == 1 ? true : false;
            this.flagAprobCli = quotationData.APROB_CLI == 1 ? true : false;
            this.mailEjecCom = quotationData.SMAIL_EJECCOM;
            if (!!!this.quotationNumber || !!!this.mode) {
                this.router.navigate(['/extranet/home']);
            } else {
                // if (this.codProducto == '3') {
                // this.TitleOperacion = this.mode == 'Emitir' && this.typeTran == 'Emisión de certificados' ? this.typeTran : this.mode;
                this.TitleOperacion = this.mode == CommonMethods.TIPO_VISTAS.EMITIR && this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT ? this.typeTran : this.mode;
                switch (this.mode) {
                    case 'Recotizar':
                        this.enabledPensionProposedRate = false;
                        this.enabledHealthProposedRate = false;
                        this.enabledHealthMinPropPremium = false;
                        this.enabledPensionMinPropPremium = false;
                        this.enabledHealthMainPropCommission = false;
                        this.enabledPensionMainPropCommission = false;
                        this.enabledHealthSecondaryPropCommission = false;
                        this.enabledPensionSecondaryPropCommission = false;
                        this.evaluationLabel = 'Datos adjuntos';
                        this.buttonName = 'RECOTIZAR';
                        break;
                    case 'Evaluar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'CONTINUAR';
                        break;
                    case 'Emitir':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Emitir';
                        // this.typeTran == 'Emisión de certificados' ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                        this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                        // this.emitirPolizaOperaciones = (this.typeTran == 'Emisión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.emitirPolizaOperaciones = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        // this.emitirPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                        this.emitirPolizaMatrizTramiteEstado = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_MATRIZ && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                        this.isTransact = this.emitirPolizaOperaciones;
                        if (this.emitirPolizaMatrizTramiteEstado) { // para poliza matriz
                            this.isTransact = this.emitirPolizaMatrizTramiteEstado;
                        }
                        if (this.isTransact) {
                            this.titleTransact = this.typeTran;
                        }
                        break;
                    case 'EmitirR':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Emitir';
                        break;
                    case 'Autorizar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Autorizar';
                        break;
                    case 'Renovar':
                        this.evaluationLabel = 'Evaluación';
                        // this.buttonName = this.typeTran == 'Declaración' ? 'Declarar' : 'Renovar';
                        this.buttonName = this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION ? 'Declarar' : 'Renovar';
                        // this.procesarPolizaOperaciones = ((this.typeTran == 'Declaración' || this.typeTran == 'Renovación') && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.procesarPolizaOperaciones = ((this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION) && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.isTransact = this.procesarPolizaOperaciones;
                        if (this.isTransact) {
                            this.titleTransact = this.typeTran;
                            // this.questionTextEstado = this.typeTran == 'Declaración' ? '¿Deseas hacer la declaración de la póliza?' : '¿Deseas hacer la renovación de la póliza?';
                            this.questionTextEstado = this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION ? '¿Deseas hacer la declaración de la póliza?' : '¿Deseas hacer la renovación de la póliza?';
                        }
                        break;
                    case 'Incluir':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Incluir';
                        // this.procesarPolizaOperaciones = (this.typeTran == 'Inclusión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.procesarPolizaOperaciones = (this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.isTransact = this.procesarPolizaOperaciones;
                        if (this.isTransact) {
                            this.titleTransact = this.typeTran;
                            this.questionTextEstado = '¿Desea realizar la inclusión de asegurados?';
                        }
                        break;
                    case 'Endosar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Endosar';
                         // this.procesarPolizaOperaciones = (this.typeTran == 'Endoso' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.procesarPolizaOperaciones = (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.isTransact = this.procesarPolizaOperaciones;
                        if (this.isTransact) {
                            this.titleTransact = this.typeTran;
                            this.questionTextEstado = '¿Deseas hacer el endoso de la póliza?';
                        }
                        break;
                    case 'Excluir':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Excluir';
                        // this.procesarPolizaOperaciones = (this.typeTran == 'Exclusión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.procesarPolizaOperaciones = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.isTransact = this.procesarPolizaOperaciones;
                        if (this.isTransact) {
                            this.titleTransact = this.typeTran;
                            this.questionTextEstado = '¿Deseas hacer la exclusión de asegurados?';
                        }
                        break;
                    case 'Asignar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Asignar';
                        this.isTransact = true;
                        this.titleTransact = 'Asignar trámite de ' + (this.typeTran == CommonMethods.TIPO_TRANSACCION.BROKER ? 'Modificación de Broker' : this.typeTran);
                        this.isReasignar = this.userAssigned == 0 ? false : true;
                        break;
                    case 'Evaluar Tramite':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Iniciar Trámite';
                        this.titleTransact = 'Evaluar trámite de ' + this.typeTran
                        this.isTransact = true;
                        break;
                    case 'Visualizar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Emitir';
                        this.isTransact = this.from == 'transact1' || this.from == 'transact2' ? true : false;
                        this.titleTransact = 'Visualizar trámite de ' + this.typeTran;
                        break;
                    case 'Continuar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Continuar';
                        this.titleTransact = 'Continuar trabajando el trámite de ' + this.typeTran
                        this.isTransact = true;
                        break;
                    case 'Enviar':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Enviar';
                        this.titleTransact = 'Enviar trámite de ' + this.typeTran + ' a ejecutivo comercial'
                        this.isTransact = this.from == 'transact1' || this.from == 'transact2' ? true : false;
                        console.log('this.isTransact');
                        console.log(this.isTransact);
                        // this.enviarPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                        break;
                    case 'Iniciado':
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Emitir';
                        this.titleTransact = this.typeTran;
                        this.isPolizaMatriz = (this.from == 'transact1' || this.from == 'transact2') && this.flagGobiernoMatriz ? true : false;
                        this.hiddenPolizaMatriz = this.isPolizaMatriz;
                        // this.flagGobiernoIniciado = this.flagGobiernoEstado && this.typeTran == 'Emisión' ? true : false;
                        // this.iniciadoPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                        // this.emitirCertificadoOperaciones = this.typeTran == 'Emisión de certificados' || (this.typeTran == 'Emisión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        // this.isTransact = this.iniciadoPolizaMatrizTramiteEstado ? true : this.flagGobiernoIniciado;
                        break;
                    case 'EmitirC': // modo emision de certificados cuando viene de tecnica
                        this.evaluationLabel = 'Evaluación';
                        this.buttonName = 'Emitir Certificados';
                        // this.typeTran == 'Emisión de certificados' ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                        this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT ? this.emitirCertificadoTecnica = true : this.emitirCertificadoTecnica = false; //KT
                        // this.emitirPolizaOperaciones = (this.typeTran == 'Emisión de certificados' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.emitirPolizaOperaciones = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                        this.isTransact = this.emitirPolizaOperaciones;
                        if (this.isTransact) {
                            this.titleTransact = this.typeTran;
                        }
                        break;
                    default:
                        this.buttonName = 'Emitir';
                        break;
                }
                // }
                if (this.codProducto == 3) {
                    this.SetTransac();
                    this.getTypeEndoso();
                    await this.motivorechazoTramite(); //MOTIVOS DE RECHAZO TRAMITES
                }
                this.canProposeRate = AccessFilter.hasPermission('13');
                this.canSeeRiskRate = AccessFilter.hasPermission('36');
                this.mainFormGroup.controls.gloss.disable();
                this.perfil = await this.getProfileProduct(); // 20230325
                if (this.perfil == 137 || this.perfil == 5) {
                    this.mainFormGroup.controls.gloss.enable();
                }
                this.isLoading = true;
                await this.getDataConfig();
                await this.getIGVData();
                await this.getPlanList(); //LSR
                this.getStatusList();

                this.getGlossList();

                this.getComisionList(this.quotationNumber);

                this.filter.QuotationNumber = this.quotationNumber;
                this.filter.PageNumber = 1;
                this.filter.LimitPerPage = 5;
                if (this.isTransact) this.getUsersList();
                this.firstSearch();
                await this.getPerfilTramiteOpe();
                //this.isProfileOpe = this.resProfileOpe[0].P_NFLAG_PERFIL;
                this.isLoading = false;
            }

        } else {
            this.router.navigate(['/extranet/request-status']);

        }

        //CommonMethods.clearBack();
        if (this.codProducto == 3 && this.mode != CommonMethods.TIPO_VISTAS.INCLUIR) {
            this.inputsQuotation.inicioVigenciaIni = undefined;
            this.inputsQuotation.inicioVigenciaFin = undefined;
        }
        if (this.codProducto == 3 && this.mode == CommonMethods.TIPO_VISTAS.INCLUIR) {
            this.inputsQuotation.inicioVigenciaIni = undefined;
            this.inputsQuotation.inicioVigenciaFin = undefined;
        }
        // if (this.typeTran == "Emisión" || this.typeTran == "Emisión") {
        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION) {
            this.FechaEfectoInicial = this.inputsQuotation.inicioVigencia;
        } else {
            this.FechaEfectoInicial = this.inputsQuotation.FDateIniAseg;
        }
        this.getStatusEstadoList();
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

    /**
    * Obtener flag de perfil Ope
    */
    async getPerfilTramiteOpe() {
        let dataQuotation: any = {};
        dataQuotation.P_NBRANCH = await CommonMethods.branchXproduct(this.codProducto);
        dataQuotation.P_NPRODUCT = 1;
        dataQuotation.P_NPERFIL = this.codProfile;
        this.transactService.getPerfilTramiteOpe(dataQuotation).subscribe(
            res => {
                // this.resProfileOpe = res;
                this.isProfileOpe = res.P_NFLAG_PERFIL;
            },
            error => {

            }
        );
    }

    flagReverse() {
        if (this.codProducto == 3) {
            if (JSON.parse(localStorage.getItem('currentUser')).productoPerfil) {
                var itemProductList = JSON.parse(localStorage.getItem('currentUser')).productoPerfil.find(o => o.idProducto == this.codProducto);
                this.inputsQuotation.reverseFlag = itemProductList.idPerfil == this.brokerProfile ? true : false;
            } else {
                this.inputsQuotation.reverseFlag = JSON.parse(localStorage.getItem('currentUser')).profileId == this.brokerProfile ? true : false;
            }
        } else {
            this.inputsQuotation.reverseFlag = false;
        }
    }

    getGlossList() {
        this.quotationService.getGlossList().subscribe(
            res => {
                this.glossList = res;
            }
        );
    }

    async getPlanList() {
        const data = {
            P_NBRANCH: this.vidaLeyID.nbranch,
            P_NPRODUCT: this.vidaLeyID.id,
            P_NTIP_RENOV: 0,
            P_NCURRENCY: this.inputsQuotation.COD_MONEDA == null ? 1 : this.inputsQuotation.COD_MONEDA,
            P_NIDPLAN: 0
        }
        await this.quotationService.getPlans(data).toPromise().then(
            res => {
                this.planList = res;
                // if(this.planList[0] != undefined){
                //     this.inputsQuotation.desTipoPlanPM = this.planList[0].SDESCRIPT.toUpperCase();
                // }

            },
            err => {
            }
        );
    }

    validarTrama(codComission?: any) {

        this.isLoading = true;
        const myFormData: FormData = new FormData();

        this.quotationService.getProcessCode(this.quotationNumber).subscribe(
            res => {
                this.nidprodEmisionEstado = this.nidProc;
                this.nidProc = res;
                myFormData.append('dataFile', this.isRateProposed ? null : this.excelSubir);
                const data: any = {};
                data.codUsuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
                data.fechaEfecto = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
                data.comision = this.inputsQuotation.P_COMISION;
                data.tipoRenovacion = this.inputsQuotation.tipoRenovacion;
                data.freqPago = this.inputsQuotation.frecuenciaPago;
                data.codProducto = this.vidaLeyID.id;
                data.flagCot = this.flagCotN;
                data.codActividad = this.inputsQuotation.TechnicalActivityId == null ? '' : this.inputsQuotation.TechnicalActivityId;
                data.flagComisionPro = this.isProposedCommission == true ? '1' : '0';
                data.comisionPro = this.inputsQuotation.commissionProposed == undefined ? '' : this.inputsQuotation.commissionProposed;
                data.tasaObreroPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[0];
                data.tasaEmpleadoPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[1];
                data.codProceso = this.nidProc;
                data.nroCotizacion = this.flagGobiernoIniciado ? null : this.quotationNumber != null ? this.quotationNumber : null;
                data.flagPolizaEmision = null;
                data.codRamo = this.nbranch;
                data.remExc = this.inputsQuotation.NREM_EXC;
                if (this.flagGobiernoIniciado) {
                    data.planesList = null;
                    data.categoryList = this.categoryList;
                    data.type_mov = 1;
                    data.fechaFin = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
                    data.fechaExpiracion = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
                    data.NCURRENCY = '1';
                    data.excludeType = '0';
                    data.flagPolizaEmision = this.isRateProposed ? 1 : null;
                    data.codProceso = this.isRateProposed ? this.nidprodEmisionEstado : '';
                    delete data.tasaObreroPro;
                    delete data.tasaEmpleadoPro;


                }
                myFormData.append('objValida', JSON.stringify(data));
                this.quotationService.valTrama(myFormData).subscribe(
                    res => {
                        this.isLoading = false;
                        if (res.baseError.P_COD_ERR == 1) {
                            swal.fire('Información', res.baseError.P_MESSAGE, 'error');
                        } else {
                            this.erroresList = res.baseError.errorList;

                            if (res.P_COD_ERR == '1') {
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            } else {
                                if (this.erroresList != null) {
                                    if (this.erroresList.length > 0) {

                                        const modalRef = this.modalService.open(ValErrorComponent, {
                                            size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false
                                        });
                                        modalRef.componentInstance.formModalReference = modalRef;
                                        modalRef.componentInstance.erroresList = this.erroresList;
                                    } else {
                                        this.nidProc = res.NIDPROC;
                                        this.processID = res.NIDPROC;
                                        this.categoryList = res.categoryList;
                                        this.rateByPlanList = res.rateByPlanList;
                                        if (this.flagGobiernoIniciado) {
                                            this.detailPlanList = res.detailPlanList;
                                            this.amountPremiumList = res.amountPremiumList;
                                            this.categoryList = res.categoryList; //this.categoryList.length > 0 ? this.categoryList : res.categoryList;
                                            this.amountPremiumList.forEach(element => {
                                                element.sactive = true;

                                            });
                                        }
                                        this.amountDetailTotalList = res.amountDetailTotalList;
                                        if (this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR && this.codProducto == 3) {
                                            this.PrintPropose();
                                        }
                                        this.categoryList.forEach(element => {
                                            element.sactive = true;
                                            const total = this.categoryList.reduce(function (prev, sum) {
                                                return prev + sum.NCOUNT;
                                            }, 0);
                                            if (this.inputsQuotation.frecuenciaPago == 1) {
                                                this.sprimaMinima = 'PRIMA MÍNIMA ANUAL';
                                            } else {
                                                this.sprimaMinima = 'PRIMA MÍNIMA MENSUAL';
                                            }

                                        });

                                        this.rateByPlanList.forEach(element => {
                                            if (codComission === undefined) {
                                                if (element.NTASA != 0) {
                                                    this.btnCotiza = false;
                                                } else {
                                                    this.btnCotiza = true;
                                                }
                                            }
                                            element.sactive = true;
                                        });

                                        this.detailPlanList.forEach(element => {
                                            this.inputsQuotation.P_PRIMA_MIN_PENSION = element.PRIMA_MINIMA;
                                            this.inputsQuotation.desTipoPlan = element.DET_PLAN;
                                            this.inputsQuotation.desTipoPlanPM = element.DET_PLAN;
                                            this.planPropuesto = element.DET_PLAN;
                                        });

                                        this.CalculateList.forEach(element => {
                                            element.sactive = true;
                                        });

                                        //if ( this.categoryList.length == 0 ) {
                                        if ((this.categoryList.length == 0 && this.nTransac != 8) || (this.categoryList.length == 0 && this.inputsQuotation.P_NTYPE_END == '2')) { //ENDOSO TECNICA JTV 02022023
                                            swal.fire('Información', 'No se ha encontrado registros en la trama cargada', 'error');
                                        } else {
                                            if (codComission == undefined) {
                                                swal.fire('Información', 'Se validó correctamente la trama', 'success');
                                            }
                                        }

                                    }
                                } else {
                                    swal.fire('Información', 'El archivo enviado contiene errores', 'error');
                                }
                            }
                        }
                    },
                    err => {
                        this.isLoading = false;
                    }
                );
            },
            err => {

            }
        );

    }

    async getComisionList(nrocotizacion: any) {
        this.quotationService.getComisionList(nrocotizacion).subscribe(
            res => {
                this.comisionList = res;
            }
        );
    }

    async getDataConfig() {
        await this.policyService.getDataConfig('DIASRETRO_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayRetroConfig = Number(res[0].SDATA)
                }
            },
            err => {
            }
        );

        await this.policyService.getDataConfig('DIASADD_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayConfig = Number(res[0].SDATA)
                }
            },
            err => {
            }
        );

        //
    }

    createFormControl() { // Crear 'mainFormGroup'
        this.mainFormGroup = this.mainFormBuilder.group({
            reason: [''], // Razón de cambio de estado
            status: ['', [Validators.required]],  // Nuevo estado de cotización
            comment: [''], // Comentario adicional para el cambio de estado de cotización
            gloss: [''], // Razón de cambio de estado
            glossComent: [''] // Comentario adicional para el cambio de estado de cotización
        });
    }

    initializeForm() {  // Inicializar 'mainFormGroup'
        this.mainFormGroup.controls.reason.setValue('');
        this.mainFormGroup.controls.status.setValue('');
        this.mainFormGroup.controls.comment.setValue('');
        this.mainFormGroup.controls.gloss.setValue('');
        this.mainFormGroup.controls.glossComent.setValue('');
        this.validateField[16] = '';
    }

    // Este método transforma una url 'insegura' en una 'segura' para evitar la alteración del 'sanitizer de html'
    getSafeUrl(unsafeUrl: string) {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    }

    async downloadFile(filePath: string): Promise<any> {  // Descargar archivos de cotización
        this.othersService.downloadFile(filePath).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    const newBlob = new Blob([res], { type: 'application/pdf' });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    const data = window.URL.createObjectURL(newBlob);
                    const link = document.createElement('a');
                    link.href = data;
                    link.download = filePath.substring(filePath.lastIndexOf('\\') + 1);
                    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                    setTimeout(function () {
                        window.URL.revokeObjectURL(data);
                        link.remove();
                    }, 100);
                }

            },
            err => {
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    /**Obtiene el IGV para Salud y el IGV x Derecho de emisión para Pensión */
    async getIGVData() {
        this.isLoading = true;

        const data = ['I', 'D']

        // Pension
        for (let item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.pensionProductId.nbranch;
            itemIGV.P_NPRODUCT = this.pensionProductId.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.pensionIGV = item == 'I' ? res : this.pensionIGV;
                    this.dEmiPension = item == 'D' ? res : this.dEmiPension;
                }
            );
        }

        // Salud
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.healthProductId.nbranch;
            itemIGV.P_NPRODUCT = this.healthProductId.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.healthIGV = item == 'I' ? res : this.healthIGV;
                    this.dEmiSalud = item == 'D' ? res : this.dEmiSalud;
                }
            );
        }

        // Vida  Ley
        let itemIGV: any = {};
        itemIGV.P_NBRANCH = this.vidaLeyID.nbranch;
        itemIGV.P_NPRODUCT = this.vidaLeyID.id;
        itemIGV.P_TIPO_REC = 'A';

        await this.quotationService.getIGV(itemIGV).toPromise().then(
            res => {
                this.vidaLeyIGV = res;
            }
        );

        await this.getQuotationData();
    }

    /**
     * Obtiene una lista de estados de cotización
     */
    getStatusList() {
        this.statusList = [];
        this.quotationService.getStatusList('3', this.codProducto).subscribe(
            res => {
                res.forEach(element => {
                    if (this.codProducto == 2) {
                        if (element.Id == '2' || element.Id == '3') {
                            if (element.Id == '3') { element.Name = 'NO PROCEDE' }
                            this.statusList.push(element);
                        }
                    }
                    else {
                        if (this.mode != CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                            if (element.Id == '2') {
                                this.statusList.push(element);
                            }
                            if (element.Id == '11') {
                                this.statusList.push(element);
                            }
                        } else if (this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                            if (element.Id == '11' || element.Id == '13') {
                                this.statusList.push(element);
                            }
                        } else {
                            if (this.status !== 'NO PROCEDE' && element.Id == '3') {
                                this.statusList.push(element);
                            }
                        }
                    }
                });
            },
            error => {

            }
        );
    }
    /**
     * Obtiene una lista de motivos por estado escogido
     */
    //Ini EAER - GESTION TRAMITES ESTADO  - 03102022
    getStatusEstadoList() {
        this.statusEstadoList = [];
        let data: any = {};
        data.P_NID_TRAMITE = this.transactNumber;
        data.P_NID_COTIZACION = this.quotationNumber;
        this.transactService.GetHistTransact(data).subscribe(
            res => {
                const result = res.filter((obj) => {
                    return obj.NPERFIL === 8 && (obj.NSTATUS_TRA === 5 || obj.NSTATUS_TRA === 2);
                });
                if ((this.emitirPolizaMatrizTramiteEstado && result.length > 0) || (this.flagGobiernoMatriz && this.flagGobiernoEstado && this.isTransact && this.mode == CommonMethods.TIPO_VISTAS.ENVIAR)) {
                    this.statusEstadoList.push({ Id: "25", Name: "Reevaluar Técnica" });

                    //INI CAMBIO COMISION VL
                    let resultTecnica = res.filter(e => e.NSTATUS_TRA == 14)
                    let indexMaximo = resultTecnica.reduce((a, b) => { return (a = a > b.LINEA ? a : b.LINEA) }, 0)
                    resultTecnica.forEach(e => {
                        if (e.LINEA == indexMaximo) {
                            console.log(e.SCOMMENT);
                            let Comentario: string = e.SCOMMENT == null ? '' : e.SCOMMENT;
                            let Comentarios: string[];
                            if (Comentario != null) {
                                let comentarioSinReglas = Comentario.replace(/- LA FECHA DE EFECTO DE LA PÓLIZA SUPERA LA RETROACTIVIDAD PERMITIDA.+/g, "")
                                Comentarios = comentarioSinReglas.split("/");
                            }

                            this.mainFormGroup.controls.comment.setValue(e.SCOMMENT == null ? '' : Comentarios[Comentarios.length - 1]);
                        }
                    });

                    //FIN CAMBIO COMISION VL

                }
                this.statusEstadoList.push({ Id: "2", Name: "Aprobado" });
                this.statusEstadoList.push({ Id: "6", Name: "Rechazar" });


            },
            err => {
                swal.fire('Información', this.genericServerErrorMessage, 'error');
            }
        );
    }
    //Fin EAER - GESTION TRAMITES ESTADO  - 03102022
    getReasonList(event) {
        const selectElementText = event.target['options']
        [event.target['options'].selectedIndex].text;
        this.statusChange = selectElementText;
        if (this.codProducto == 2) {
            if (this.mainFormGroup.controls.status.value == '3') {
                this.quotationService.getReasonList(this.mainFormGroup.controls.status.value).subscribe(
                    res => {
                        this.reasonList = res;
                    }
                );
            } else {
                this.reasonList = null;
            }
        } else if (this.codProducto == 3) {

            if (this.mainFormGroup.controls.status.value == '2') {
                if (this.codProducto == 3 && (this.mode === CommonMethods.TIPO_VISTAS.EMITIR || this.mode === CommonMethods.TIPO_VISTAS.EMITIRR)) {
                    this.buttonName = 'Emitir';
                } else if (this.codProducto == 3 && this.mode === CommonMethods.TIPO_VISTAS.EVALUAR) {
                    this.buttonName = 'Continuar';
                } else if (this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                    this.buttonName = 'Autorizar';
                } else if (this.codProducto == 3 && this.mode === CommonMethods.TIPO_VISTAS.INCLUIR) {
                    this.buttonName = 'Incluir';
                } else if (this.codProducto == 3 && this.mode === CommonMethods.TIPO_VISTAS.EXCLUIR) {
                    this.buttonName = 'Excluir';
                } else if (this.codProducto == 3 && this.mode === CommonMethods.TIPO_VISTAS.ENDOSAR) {
                    this.buttonName = 'Endosar';
                } else if (this.codProducto == 3 && this.mode === CommonMethods.TIPO_VISTAS.RENOVAR) {
                    this.buttonName = (this.sAbrTran = 'DE') ? 'Declarar' : 'Renovar';
                }
            } else if (this.mainFormGroup.controls.status.value == '3' || this.mainFormGroup.controls.status.value == '11') {
                if (this.codProducto == 3 && (
                    ((this.mode === CommonMethods.TIPO_VISTAS.EMITIR || this.mode === CommonMethods.TIPO_VISTAS.EMITIRR) ||
                        this.mode === CommonMethods.TIPO_VISTAS.EVALUAR || this.mode === CommonMethods.TIPO_VISTAS.RENOVAR ||
                        this.mode === CommonMethods.TIPO_VISTAS.INCLUIR || this.mode === CommonMethods.TIPO_VISTAS.EXCLUIR ||
                        this.mode === CommonMethods.TIPO_VISTAS.ENDOSAR) && this.status !== 'NO PROCEDE')) {
                    this.buttonName = 'Rechazar';
                } else if (this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                    this.buttonName = 'Rechazar';
                }
            } else if (this.mainFormGroup.controls.status.value == '13' && this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                this.buttonName = 'Autorizar';
            }
            if (this.mode != CommonMethods.TIPO_VISTAS.EXCLUIR) {
                this.quotationService.getReasonList(this.mainFormGroup.controls.status.value).subscribe(
                    res => {
                        this.reasonList = res.filter(f => !["1", "9", "5", "8"].includes(f.Id));
                    },
                    error => {

                    }
                );
            }
        }
    }


    /**
     * Obtiene el monto de planilla según el tipo de riesgo
     * @param riskTypeId id de tipo de riesgo
     */
    getPayrollAmount(riskTypeId: string) {
        let payRollAmount;
        this.inputsQuotation.SharedDetailsList.forEach(element => {
            if (element.RiskTypeId == riskTypeId) { payRollAmount = element.PayrollAmount; }
        });
        return payRollAmount;
    }

    /**
     * Calcula la prima
     * @param payrollAmount monto de planilla
     * @param rate tasa
     */
    calculatePremium(payrollAmount: number, rate: number) {
        // return Number(payrollAmount.toString()) * Number(rate.toString());
        return Number(payrollAmount.toString()) * Number(rate.toString()) / 100;
    }

    /**
     * Calcula la nueva prima según la tasa autorizada ingresada
     * Calcula la nueva prima total neta, IGV a la prima neta y la prima total bruta.
     * @param authorizedRate valor de ngModel de tasa autorizada
     * @param riskTypeId - Id de tipo de riesgo
     * @param productId Id de producto
     */
    calculateNewPremiums(authorizedRate: any, riskTypeId: string, productId: string) {
        if (!this.template.debug_dummy) {
            let planProp = authorizedRate != '' ? Number(authorizedRate) : 0;
            planProp = isNaN(planProp) ? 0 : planProp;
            authorizedRate = planProp;
            // let self = this;
            if (productId == this.healthProductId.id) {
                if (authorizedRate > 100) {
                    this.inputsQuotation.SaludDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = true;
                        }
                    });
                }
                else {
                    this.inputsQuotation.SaludDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = false;
                        }
                    });
                }
            } else if (productId == this.pensionProductId.id) {
                if (authorizedRate > 100) {
                    this.inputsQuotation.PensionDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = true;
                        }
                    });
                }
                else {
                    this.inputsQuotation.PensionDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = false;
                        }
                    });
                }
            }

            if (isNaN(authorizedRate) || authorizedRate.toString().trim() == '') authorizedRate = 0; //Si el input está limpio, lo convertimos a 0

            let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), authorizedRate), 2); //cálculo de prima nueva con la tasa autorizada
            if (productId == this.pensionProductId.id) { //Si el producto es pensión
                let pensionNewNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
                this.inputsQuotation.PensionDetailsList.forEach((element, key) => {
                    if (element.RiskTypeId == riskTypeId) {
                        this.inputsQuotation.PensionDetailsList[key].NewPremium = newPremium;
                        pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(newPremium.toString());
                    } else pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(element.NewPremium.toString());

                });
                //Cálculo de nueva prima total neta de Pensión
                this.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(pensionNewNetAmount, 2);
                //Cálculo de Prima Comercial de Pensión
                this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
                //Cálculo de IGV de la nueva prima total neta de Pensión
                this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNewNetAmount, 2);
                //Cálculo de nueva prima total bruta de Pensión
                this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);
                this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
            }

            if (productId == this.healthProductId.id) { //Si el producto es Salud
                let saludNewNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
                this.inputsQuotation.SaludDetailsList.forEach((element, key) => {
                    if (element.RiskTypeId == riskTypeId) {
                        this.inputsQuotation.SaludDetailsList[key].NewPremium = newPremium;
                        saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(newPremium.toString());
                    } else saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(element.NewPremium.toString());
                });
                //Cálculo de nueva prima total neta de Salud
                this.inputsQuotation.SaludNewNetAmount = CommonMethods.formatValor(saludNewNetAmount, 2);
                //Cálculo de Prima Comercial de Pensión
                this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
                //Cálculo de IGV de la nueva prima total neta de Salud
                this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * this.healthIGV) - this.inputsQuotation.SaludNewNetAmount, 2);
                //Cálculo de nueva prima total bruta de Salud
                this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

                this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
            }
        }

    }

    changeTasaPropuestaPension(planPro, valor) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;
        let self = this;

        if (planProp > 100) {
            this.inputsQuotation.PensionDetailsList.forEach(item => {
                if (item.RiskTypeId == valor) {
                    item.valItemPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.PensionDetailsList.forEach(item => {
                if (item.RiskTypeId == valor) {
                    item.valItemPr = false;
                }
            });
        }
    }

    changeTasaPropuestaSalud(planPro, valor) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;
        let self = this;

        if (planProp > 100) {
            this.inputsQuotation.SaludDetailsList.forEach(item => {
                if (item.RiskTypeId == valor) {
                    item.valItemPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SaludDetailsList.forEach(item => {
                if (item.RiskTypeId == valor) {
                    item.valItemPr = false;
                }
            });
        }
    }

    /**
     * Calcula la prima según la tasa propuesta ingresada
     * Calcula la prima total neta, IGV a la prima neta y la prima total bruta.
     * @param rate valor de ngModel de tasa propuesta
     * @param riskTypeId - Id de tipo de riesgo
     * @param productId Id de producto
     */
    calculatePremiums(rate: any, riskTypeId: string, productId: string) {
        if (isNaN(rate) || rate.toString().trim() == '') rate = 0; //Si el input está limpio, lo convertimos a 0

        let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), rate), 2); //cálculo de prima nueva con la tasa autorizada
        if (productId == this.pensionProductId.id) { //Si el producto es pensión
            let pensionTotalNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
            this.inputsQuotation.PensionDetailsList.forEach((element, key) => {
                if (element.RiskTypeId == riskTypeId) {
                    this.inputsQuotation.PensionDetailsList[key].Premium = newPremium;
                    pensionTotalNetAmount = Number(pensionTotalNetAmount.toString()) + Number(newPremium.toString());
                } else pensionTotalNetAmount = Number(pensionTotalNetAmount.toString()) + Number(element.NewPremium.toString());

            });
            //Cálculo de nueva prima total neta de Pensión
            this.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(pensionTotalNetAmount, 2);
            //Cálculo de nueva prima comercial de Pension
            this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(pensionTotalNetAmount * this.dEmiPension, 2);
            //Cálculo de IGV de la nueva prima total neta de Pensión
            this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNetAmount, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionCalculatedIGV) + Number(this.inputsQuotation.PensionPrimaComercial), 2);
        }
        if (productId == this.healthProductId.id) { //Si el producto es Salud
            let saludTotalNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
            this.inputsQuotation.SaludDetailsList.forEach((element, key) => {
                if (element.RiskTypeId == riskTypeId) {
                    this.inputsQuotation.SaludDetailsList[key].Premium = newPremium;
                    saludTotalNetAmount = Number(saludTotalNetAmount.toString()) + Number(newPremium.toString());
                } else saludTotalNetAmount = Number(saludTotalNetAmount.toString()) + Number(element.NewPremium.toString());
            });
            //Cálculo de nueva prima total neta de Salud
            this.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(saludTotalNetAmount, 2);
            //Cálculo de nueva prima comercial de Salud
            this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(saludTotalNetAmount * this.dEmiSalud, 2);
            //Cálculo de IGV de la nueva prima total neta de Salud
            this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNetAmount * this.healthIGV) - this.inputsQuotation.SaludNetAmount, 2);
            //Cálculo de nueva prima total bruta de Salud
            this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludCalculatedIGV) + Number(this.inputsQuotation.SaludPrimaComercial), 2);
        }

        if (Number(this.inputsQuotation.SaludNetAmount) < Number(this.inputsQuotation.SaludMinPremium)) {
            this.isNetPremiumLessThanMinHealthPremium = true;
            let premium = (this.inputsQuotation.SaludPropMinPremium != null && this.inputsQuotation.SaludPropMinPremium !== undefined && Number(this.inputsQuotation.SaludPropMinPremium) > 0) ? this.inputsQuotation.SaludPropMinPremium : this.inputsQuotation.SaludMinPremium;
            // this.healthMessage = 'El monto calculado no supera la prima mínima, la cotización se generará con el siguiente monto S /. ' + premium * this.healthIGV;
            this.healthMessage = this.variable.var_msjPrimaMin;
        } else {
            this.isNetPremiumLessThanMinHealthPremium = false;
            this.healthMessage = '';
        }

        if (Number(this.inputsQuotation.PensionNetAmount) < Number(this.inputsQuotation.PensionMinPremium)) {
            this.isNetPremiumLessThanMinPensionPremium = true;
            let premium = (this.inputsQuotation.PensionPropMinPremium != null && this.inputsQuotation.PensionPropMinPremium !== undefined && Number(this.inputsQuotation.PensionPropMinPremium) > 0) ? this.inputsQuotation.PensionPropMinPremium : this.inputsQuotation.PensionMinPremium;
            // this.pensionMessage = 'El monto calculado no supera la prima mínima, la cotización se generará con el siguiente monto S /. ' + premium * this.pensionIGV;
            this.pensionMessage = this.variable.var_msjPrimaMin;
        } else {
            this.isNetPremiumLessThanMinPensionPremium = false;
            this.pensionMessage = '';
        }

    }
    /**
     * Obtener los datos de la cotización, para ello se llama a 3 procedimientos
     * getPolicyEmitCab: Obtiene los datos principales de cotización, cliente, sede.
     * getPolicyEmitComer: Obtiene los brokers incluidos en la cotización
     * getPolicyEmitDet: Obtiene detalles de la cotización como montos de planilla, total de trabajadores, primas, tasas según producto y riesgo
     */
    async getQuotationData() {  //Obtener datos de cotización: cabecera, brokers y detalles.
        this.isLoading = true;
        let self = this;
        let typeMovement = '0';

        if (this.codProducto == 2) {
            forkJoin(this.policyService.getPolicyEmitCab(this.quotationNumber,
                typeMovement,
                JSON.parse(localStorage.getItem('currentUser'))['id']),
                this.policyService.getPolicyEmitComer(this.quotationNumber),
                this.policyService.getPolicyEmitDet(this.quotationNumber,
                    JSON.parse(localStorage.getItem('currentUser'))['id'])).toPromise().then(
                        (res: any) => {
                            if (res[0].GenericResponse.COD_ERR == 1 ||
                                !!res[0].GenericResponse.MENSAJE) {
                                swal.fire('Información', res[0].GenericResponse.MENSAJE, 'error');
                                this.router.navigate(['/extranet/request-status']);
                            } else {
                                if (res[0].StatusCode == 2) {
                                    swal.fire('Información', this.listToString(res[0].ErrorMessageList), 'warning');
                                }
                                // Datos de cotización
                                this.inputsQuotation.Date = res[0].GenericResponse.FECHA_REGISTRO; //
                                this.cotEstado = res[0].GenericResponse.ESTADO_COT;

                                //Datos de contratante
                                this.inputsQuotation.DocumentTypeId = res[0].GenericResponse.TIPO_DOCUMENTO;
                                this.inputsQuotation.DocumentTypeName = res[0].GenericResponse.TIPO_DES_DOCUMENTO;
                                this.inputsQuotation.DocumentNumber = res[0].GenericResponse.NUM_DOCUMENTO;
                                this.inputsQuotation.P_SNOMBRES = res[0].GenericResponse.NOMBRE_RAZON;
                                this.inputsQuotation.P_SDESDIREBUSQ = res[0].GenericResponse.DIRECCION;
                                this.inputsQuotation.P_SE_MAIL = res[0].GenericResponse.CORREO;

                                //Datos de cotización - sede
                                this.inputsQuotation.CurrencyId = res[0].GenericResponse.COD_MONEDA;
                                this.inputsQuotation.CurrencyName = res[0].GenericResponse.DES_MONEDA;
                                this.inputsQuotation.LocationId = res[0].GenericResponse.COD_TIPO_SEDE;
                                this.inputsQuotation.LocationName = res[0].GenericResponse.DES_TIPO_SEDE;

                                this.inputsQuotation.EconomicActivityId = this.codProducto == 3 ? res[0].GenericResponse.ACT_ECO_VL : res[0].GenericResponse.COD_ACT_ECONOMICA;
                                this.inputsQuotation.EconomicActivityName = this.codProducto == 3 ? res[0].GenericResponse.DES_ACT_ECO_VL : res[0].GenericResponse.DES_ACT_ECONOMICA;
                                this.inputsQuotation.TechnicalActivityId = this.codProducto == 3 ? res[0].GenericResponse.ACT_TEC_VL : res[0].GenericResponse.ACT_TECNICA;
                                this.inputsQuotation.TechnicalActivityName = this.codProducto == 3 ? res[0].GenericResponse.DES_ACT_TEC_VL : res[0].GenericResponse.DES_ACT_TECNICA;
                                this.inputsQuotation.HasDelimiter = Number(res[0].GenericResponse.DELIMITACION) == 0 ? false : true;
                                this.inputsQuotation.IsMining = Number(res[0].GenericResponse.MINA) == 0 ? false : true;
                                this.inputsQuotation.DepartmentId = res[0].GenericResponse.COD_DEPARTAMENTO;
                                this.inputsQuotation.DepartmentName = res[0].GenericResponse.DES_DEPARTAMENTO;
                                this.inputsQuotation.ProvinceId = res[0].GenericResponse.COD_PROVINCIA;
                                this.inputsQuotation.ProvinceName = res[0].GenericResponse.DES_PROVINCIA;
                                this.inputsQuotation.DistrictId = res[0].GenericResponse.COD_DISTRITO;
                                this.inputsQuotation.DistrictName = res[0].GenericResponse.DES_DISTRITO;

                                this.inputsQuotation.tipoRenovacion = res[0].GenericResponse.TIP_RENOV;
                                this.inputsQuotation.desTipoRenovacion = res[0].GenericResponse.DES_TIP_RENOV;
                                this.inputsQuotation.frecuenciaPago = res[0].GenericResponse.FREQ_PAGO;
                                this.inputsQuotation.desFrecuenciaPago = res[0].GenericResponse.DES_FREQ_PAGO;
                                this.inputsQuotation.tipoComision = res[0].GenericResponse.TIP_COMISS;
                                this.inputsQuotation.desTipoComision = res[0].GenericResponse.DES_TIP_COMISS;
                                this.inputsQuotation.inicioVigencia = new Date(res[0].GenericResponse.EFECTO_COTIZACION_VL)
                                this.inputsQuotation.finVigencia = new Date(res[0].GenericResponse.EXPIRACION_COTIZACION_VL)

                                this.inputsQuotation.Comment = res[0].GenericResponse.COMENTARIO;
                                this.inputsQuotation.FilePathList = res[0].GenericResponse.RUTAS;

                                this.inputsQuotation.SaludPropMinPremium = res[0].GenericResponse.MIN_SALUD_PR;
                                this.originalHealthMinPropPremium = res[0].GenericResponse.MIN_SALUD_PR;
                                this.inputsQuotation.HealthAuthMinPremium = res[0].GenericResponse.MIN_SALUD_AUT == '0' ? res[0].GenericResponse.MIN_SALUD_PR : res[0].GenericResponse.MIN_SALUD_AUT;
                                this.originalHealthMinAuthPremium = this.inputsQuotation.HealthAuthMinPremium;
                                this.inputsQuotation.SaludMinPremium = res[0].GenericResponse.MIN_SALUD;
                                this.inputsQuotation.PensionPropMinPremium = res[0].GenericResponse.MIN_PENSION_PR;
                                this.originalPensionMinPropPremium = this.codProducto == 3 ? res[0].GenericResponse.MIN_VIDALEY_PR : res[0].GenericResponse.MIN_PENSION_PR;
                                this.inputsQuotation.PensionMinPremium = this.codProducto == 3 ? res[0].GenericResponse.MIN_VIDALEY : res[0].GenericResponse.MIN_PENSION;
                                this.inputsQuotation.PensionAuthMinPremium = this.codProducto == 3 ? res[0].GenericResponse.MIN_VIDALEY_AUT == '0' ? res[0].GenericResponse.MIN_VIDALEY_PR : res[0].GenericResponse.MIN_VIDALEY_AUT : res[0].GenericResponse.MIN_PENSION_AUT == '0' ? res[0].GenericResponse.MIN_PENSION_PR : res[0].GenericResponse.MIN_PENSION_AUT;
                                this.originalPensionMinAuthPremium = this.inputsQuotation.PensionAuthMinPremium;

                                //Datos de brokers
                                this.inputsQuotation.SecondaryBrokerList = [];
                                res[1].forEach(item => {
                                    item.COMISION_PENSION = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION);
                                    item.COMISION_PENSION_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO);
                                    item.COMISION_PENSION_AUT = item.COMISION_PENSION_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_AUT);
                                    item.COMISION_SALUD_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO);
                                    item.COMISION_SALUD = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD);
                                    item.COMISION_SALUD_AUT = item.COMISION_SALUD_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_AUT);
                                    item.valItemSal = false;
                                    item.valItemSalPr = false;
                                    item.valItemPen = false;
                                    item.valItemPenPr = false;
                                    item.OriginalHealthPropCommission = item.COMISION_SALUD_PRO;
                                    item.OriginalPensionPropCommission = item.COMISION_PENSION_PRO;
                                    item.OriginalHealthAuthCommission = item.COMISION_SALUD_AUT;
                                    item.OriginalPensionAuthCommission = item.COMISION_PENSION_AUT;
                                    self.inputsQuotation.SecondaryBrokerList.push(item);
                                });

                                // Detalles de cotización
                                this.inputsQuotation.SharedDetailsList = []; // Lista compartida que contiene Nro de trabajadores y Monto de planilla
                                this.inputsQuotation.PensionDetailsList = []; // Lista de detalles de Pensión, cada registro contiene: riesgo, tasa, prima, tasa propuesta
                                this.inputsQuotation.SaludDetailsList = []; // Lista de detalles de Salud, cada registro contiene: riesgo, tasa, prima, tasa propuesta

                                this.inputsQuotation.SaludNetAmount = 0.00; // Prima total neta de Salud
                                this.inputsQuotation.SaludPrimaComercial = 0.00 // Prima Comercial de Salud
                                this.inputsQuotation.SaludGrossAmount = 0.00; // Prima total bruta de Salud
                                this.inputsQuotation.SaludCalculatedIGV = 0.00; // Igv de prima total neta de Salud

                                this.inputsQuotation.PensionNetAmount = 0.00; // Prima total neta de Pensión
                                this.inputsQuotation.PensionPrimaComercial = 0.00 // Prima Comercial de Pension
                                this.inputsQuotation.PensionGrossAmount = 0.00; // Prima total bruta de Pensión
                                this.inputsQuotation.PensionCalculatedIGV = 0.00; // Igv de prima total neta de Pensión

                                this.inputsQuotation.SaludNewNetAmount = 0.00;  // Nueva Prima total neta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas
                                this.inputsQuotation.SaludNewPrimaComercial = 0.00 // Nueva Prima Comercial, correspondiente a las primas nuevas generadas por tasas autorizadas
                                this.inputsQuotation.SaludNewGrossAmount = 0.00;  // Nueva Prima total bruta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas
                                this.inputsQuotation.SaludNewCalculatedIGV = 0.00;  // Nuevo Igv de prima total neta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas

                                this.inputsQuotation.PensionNewNetAmount = 0.00;  // Nueva Prima total neta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                                this.inputsQuotation.PensionNewPrimaComercial = 0.00 // Nueva Prima Comercal, correspondiente a las primas nuevas generadas por tasas autorizadas
                                this.inputsQuotation.PensionNewGrossAmount = 0.00;  // Nueva Prima total bruta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                                this.inputsQuotation.PensionNewCalculatedIGV = 0.00;  // Nuevo Igv de prima total neta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas

                                res[2].forEach(element => {
                                    if (element.ID_PRODUCTO == this.pensionProductId.id && this.codProducto == '2') { // Si es un elemento de pensión
                                        let item: any = {};
                                        item.RiskRate = CommonMethods.formatValor(element.TASA_RIESGO, 6);
                                        item.RiskTypeId = element.TIP_RIESGO; // Id tipo de riesgo
                                        if (element.DES_RIESGO.search('Alto') != -1) {
                                            element.DES_RIESGO = 'Alto (Obreros)'

                                        }

                                        if (element.DES_RIESGO.search('Bajo') != -1) {
                                            element.DES_RIESGO = 'Bajo (Administrativos)'
                                        }

                                        item.RiskTypeName = element.DES_RIESGO; // Nombre de tipo de riesgo
                                        item.Rate = CommonMethods.formatValor(element.TASA_CALC, 6);  // Tasa
                                        item.Premium = this.cotEstado != 2 ? CommonMethods.formatValor(element.PRIMA, 2) : CommonMethods.formatValor(element.AUT_PRIMA, 2); //Prima
                                        item.Premium2 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                                        item.Premium3 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                                        item.Premium6 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                                        item.Premium12 = CommonMethods.formatValor(element.PRIMA, 2); // Prima
                                        item.ProposedRate = this.cotEstado != 2 ? CommonMethods.formatValor(element.TASA_PRO, 6) : CommonMethods.formatValor(element.TASA, 6); //Tasa propuesta
                                        item.OriginalProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta original
                                        item.OriginalAuthorizedRate = CommonMethods.formatValor(element.TASA, 6); //tasa autorizada original
                                        item.AuthorizedRate = CommonMethods.formatValor(element.TASA, 6);
                                        item.NewPremium = CommonMethods.formatValor(element.AUT_PRIMA, 2);
                                        item.EndorsmentPremium = element.PRIMA_END; //Prima de endoso
                                        item.Discount = CommonMethods.formatValor(element.DESCUENTO, 2); //Descuento
                                        item.Variation = CommonMethods.formatValor(element.VARIACION_TASA, 2); //Variación de la tasa.
                                        item.valItemAu = false;
                                        item.valItemPr = false;
                                        self.inputsQuotation.PensionDetailsList.push(item);
                                        self.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionNewNetAmount) + Number(element.AUT_PRIMA), 2);
                                        self.inputsQuotation.PensionNetAmount = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN, 2) : self.inputsQuotation.PensionNewNetAmount;
                                        self.inputsQuotation.PensionPrimaComercial = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiPension, 2) : CommonMethods.formatValor(self.inputsQuotation.PensionNetAmount * self.dEmiPension, 2);
                                        self.inputsQuotation.PensionCalculatedIGV = this.cotEstado != 2 ? CommonMethods.formatValor((element.NSUM_PREMIUMN * this.pensionIGV) - element.NSUM_PREMIUMN, 2) : CommonMethods.formatValor((self.inputsQuotation.PensionNetAmount * this.pensionIGV) - self.inputsQuotation.PensionNetAmount, 2);
                                        self.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionPrimaComercial) + Number(self.inputsQuotation.PensionCalculatedIGV), 2);

                                        item.WorkersCount = element.NUM_TRABAJADORES;
                                        item.PayrollAmount = element.MONTO_PLANILLA;
                                    }
                                    else if (element.ID_PRODUCTO == this.vidaLeyID.id && this.codProducto == '3') {
                                        let itemAmount: any = {};
                                        itemAmount.CategoryCalculate = element.DES_RIESGO;
                                        itemAmount.RateCalculate = CommonMethods.formatValor(element.TASA_RIESGO, 6)
                                        itemAmount.PremiumCalculate = CommonMethods.formatValor(element.PRIMA, 2);

                                        let itemAmountProposed: any = {};
                                        itemAmountProposed.CategoryProposal = element.DES_RIESGO;
                                        itemAmountProposed.RateProposal = CommonMethods.formatValor(element.TASA_RIESGO, 6)
                                        itemAmountProposed.PremiumProposal = CommonMethods.formatValor(element.PRIMA, 2);

                                        let itemAmountAuthorized: any = {};
                                        itemAmountAuthorized.CategoryAuthorized = element.DES_RIESGO;
                                        itemAmountAuthorized.RateAuthorized = CommonMethods.formatValor(element.TASA_RIESGO, 6)
                                        itemAmountAuthorized.PremiumAuthorized = CommonMethods.formatValor(element.PRIMA, 2);
                                        this.CalculateList.push(itemAmount);
                                        this.ProposalList.push(itemAmountProposed);
                                        this.AuthorizedList.push(itemAmountAuthorized);
                                    }

                                    if (element.ID_PRODUCTO == this.healthProductId.id && this.codProducto == '2') { //Si es un elemento de pensión
                                        let item: any = {};
                                        item.RiskRate = CommonMethods.formatValor(element.TASA_RIESGO, 6);
                                        item.RiskTypeId = element.TIP_RIESGO; //Id tipo de riesgo
                                        if (element.DES_RIESGO.search('Alto') != -1) {
                                            element.DES_RIESGO = 'Alto (Obreros)'
                                        }

                                        if (element.DES_RIESGO.search('Bajo') != -1) {
                                            element.DES_RIESGO = 'Bajo (Administrativos)'
                                        }
                                        item.RiskTypeName = element.DES_RIESGO; //Nombre de tipo de riesgo
                                        item.Rate = CommonMethods.formatValor(element.TASA_CALC, 6);  //Tasa
                                        item.Premium = this.cotEstado != 2 ? CommonMethods.formatValor(element.PRIMA, 2) : CommonMethods.formatValor(element.AUT_PRIMA, 2); //Prima
                                        item.ProposedRate = this.cotEstado != 2 ? CommonMethods.formatValor(element.TASA_PRO, 6) : CommonMethods.formatValor(element.TASA, 6); //Tasa propuesta
                                        item.OriginalProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta original
                                        item.OriginalAuthorizedRate = CommonMethods.formatValor(element.TASA, 6); //tasa autorizada original
                                        item.AuthorizedRate = CommonMethods.formatValor(element.TASA, 6);
                                        item.NewPremium = CommonMethods.formatValor(element.AUT_PRIMA, 2);
                                        item.EndorsmentPremium = element.PRIMA_END; //Prima de endoso
                                        item.Discount = CommonMethods.formatValor(element.DESCUENTO, 2); //Descuento
                                        item.Variation = CommonMethods.formatValor(element.VARIACION_TASA, 2); //Variación de la tasa
                                        item.valItemAu = false;
                                        item.valItemPr = false;
                                        self.inputsQuotation.SaludDetailsList.push(item);
                                        self.inputsQuotation.SaludNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.SaludNewNetAmount) + Number(element.AUT_PRIMA), 2);
                                        self.inputsQuotation.SaludNetAmount = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN, 2) : self.inputsQuotation.SaludNewNetAmount;
                                        self.inputsQuotation.SaludPrimaComercial = this.cotEstado != 2 ? CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiSalud, 2) : CommonMethods.formatValor(self.inputsQuotation.SaludNetAmount * self.dEmiSalud, 2);
                                        self.inputsQuotation.SaludCalculatedIGV = this.cotEstado != 2 ? CommonMethods.formatValor((element.NSUM_PREMIUMN * this.healthIGV) - element.NSUM_PREMIUMN, 2) : CommonMethods.formatValor((self.inputsQuotation.SaludNetAmount * this.healthIGV) - self.inputsQuotation.SaludNetAmount, 2);
                                        self.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(self.inputsQuotation.SaludPrimaComercial) + Number(self.inputsQuotation.SaludCalculatedIGV), 2);

                                        item.WorkersCount = element.NUM_TRABAJADORES;
                                        item.PayrollAmount = element.MONTO_PLANILLA;
                                    }

                                    if (this.template.ins_categoriaList) {
                                        let itemCategory: any = {};
                                        itemCategory.SCATEGORIA = element.DES_RIESGO;
                                        itemCategory.NCOUNT = element.NUM_TRABAJADORES;
                                        itemCategory.NTOTAL_PLANILLA = element.MONTO_PLANILLA;
                                        itemCategory.NTASA = 0;
                                        this.categoryList.push(itemCategory);
                                    }

                                    let add = true;
                                    self.inputsQuotation.SharedDetailsList.forEach(subelement => {
                                        if (subelement.RiskTypeId == element.TIP_RIESGO) add = false;
                                    });
                                    if (add == true) self.inputsQuotation.SharedDetailsList.push({ 'RiskTypeId': element.TIP_RIESGO, 'RiskTypeName': element.DES_RIESGO, 'WorkersCount': element.NUM_TRABAJADORES, 'PayrollAmount': element.MONTO_PLANILLA });
                                });

                                this.dataClient();

                                this.inputsQuotation.PensionNewPrimaComercial =
                                    CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
                                this.inputsQuotation.PensionNewCalculatedIGV =
                                    CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNewNetAmount, 2);
                                this.inputsQuotation.PensionNewGrossAmount =
                                    CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);

                                this.inputsQuotation.SaludNewPrimaComercial =
                                    CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
                                this.inputsQuotation.SaludNewCalculatedIGV =
                                    CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * this.healthIGV) - this.inputsQuotation.SaludNewNetAmount, 2);
                                this.inputsQuotation.SaludNewGrossAmount =
                                    CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

                                if (this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR) {
                                    this.checkMinimunPremiumForOriginals(this.healthProductId.id);
                                    this.checkMinimunPremiumForOriginals(this.pensionProductId.id);

                                } else {
                                    this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
                                    this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
                                }

                            }
                            this.isLoading = false;
                        },
                        (error) => {
                            this.isLoading = false;
                            swal.fire('Información', this.genericServerErrorMessage + ' ' + this.redirectionMessage, 'error');
                            this.router.navigate(['/extranet/request-status']);
                        }
                    );
        } else {

            await forkJoin(
                this.policyService.getPolicyEmitCab(
                    this.quotationNumber, typeMovement, JSON.parse(localStorage.getItem('currentUser'))['id']),
                this.policyService.getPolicyEmitComer(
                    this.quotationNumber)).toPromise().then(
                        async (res: any) => {
                            this.tipoProceso = res[0].GenericResponse.NTYPE_PROCESO;
                            console.log('jojojo');
                            console.log(this.tipoProceso);

                            if (res[0].GenericResponse.COD_ERR == 1 || !!res[0].GenericResponse.MENSAJE) {

                                let mensaje = (res[0].GenericResponse.MENSAJE as string).split(";.");
                                var mensajeHTML = document.createElement("div");
                                if (mensaje[1] == undefined) {
                                    mensaje[1] = ""
                                }

                                mensajeHTML.innerHTML = "<p>" + mensaje[0] + "</p><p style='margin-top: 0px; padding-top: 0px;'>" + mensaje[1] + "</p>";
                                swal.fire({
                                    title: 'Información',
                                    icon: 'error',
                                    html: mensajeHTML
                                })

                                //swal.fire('Información', res[0].GenericResponse.MENSAJE, 'error');
                                if (this.from == 'transact1') {
                                    this.router.navigate(['/extranet/tray-transact/1']);
                                } else if (this.from == 'transact2') {
                                    this.router.navigate(['/extranet/tray-transact/2']);
                                } else {
                                    this.router.navigate(['/extranet/request-status']);
                                }
                            } else {
                                this.dataPolizaEstado = res[0].GenericResponse; // Poliza estado VL

                                if (res[0].GenericResponse.COD_ERR == 2) {
                                    swal.fire('Información', res[0].GenericResponse.MENSAJE, 'info');
                                }
                                if (res[0].StatusCode == 2) {
                                    swal.fire('Información', this.listToString(res[0].ErrorMessageList), 'warning');
                                }
                                this.clientCode = res[0].GenericResponse.SCLIENT;
                                // Datos de cotización
                                this.inputsQuotation.Date = res[0].GenericResponse.FECHA_REGISTRO; //

                                // Datos de contratante
                                this.inputsQuotation.DocumentTypeId = res[0].GenericResponse.TIPO_DOCUMENTO;
                                this.inputsQuotation.DocumentTypeName = res[0].GenericResponse.TIPO_DES_DOCUMENTO;
                                this.inputsQuotation.DocumentNumber = res[0].GenericResponse.NUM_DOCUMENTO;
                                this.inputsQuotation.P_SNOMBRES = res[0].GenericResponse.NOMBRE_RAZON;
                                this.inputsQuotation.P_SDESDIREBUSQ = res[0].GenericResponse.DIRECCION;
                                this.inputsQuotation.P_SE_MAIL = res[0].GenericResponse.CORREO;
                                this.inputsQuotation.P_COMISION = res[0].GenericResponse.TIP_COMISS;
                                this.inputsQuotation.P_NTYPE_END = res[0].GenericResponse.NTYPE_END; // ENDOSO TECNICA JTV 14042023

                                if (this.inputsQuotation.desTipoPlanPM = this.planList.find(f => f.NIDPLAN == res[0].GenericResponse.NIDPLAN)) {
                                    this.inputsQuotation.desTipoPlanPM = this.planList.find(f => f.NIDPLAN == res[0].GenericResponse.NIDPLAN).SDESCRIPT.toUpperCase();
                                }


                                await this.dataClient();
                                if (!this.isTransact || this.emitirPolizaOperaciones || this.flagGobiernoIniciado || this.procesarPolizaOperaciones) await this.getInfoExperia(res);

                                // if (this.mode == 'Evaluar' || this.emitirCertificadoTecnica == true || (this.mode == 'Iniciado' && this.typeTran == 'Emisión de certificados') || this.emitirPolizaOperaciones || this.flagGobiernoIniciado) {
                                if (this.mode == CommonMethods.TIPO_VISTAS.EVALUAR || this.emitirCertificadoTecnica == true || (this.mode == CommonMethods.TIPO_VISTAS.INICIADO && this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT) || this.emitirPolizaOperaciones || this.flagGobiernoIniciado) {
                                    this.inputsQuotation.formaPago = true;
                                } else {
                                    this.inputsQuotation.formaPago = false;
                                }

                                if (this.template.ins_retroactividad) {
                                    if (this.brokerProfile == this.perfil && this.codProducto == '3') {
                                        this.variable.var_isBroker = true;
                                    }

                                    this.inputsQuotation.inicioVigenciaIni = new Date();

                                    if (this.template.ins_firstDay && this.variable.var_isBroker) {
                                        this.inputsQuotation.inicioVigenciaIni.setDate(0);
                                        this.inputsQuotation.inicioVigenciaIni.setDate(this.inputsQuotation.inicioVigenciaIni.getDate() + 1);

                                    }
                                    else {
                                        if (this.mode == CommonMethods.TIPO_VISTAS.INCLUIR) {
                                            this.inputsQuotation.inicioVigenciaIni = new Date(res[0].GenericResponse.EFECTO_COTIZACION_VL)
                                            this.inputsQuotation.inicioVigenciaIni.setDate(this.inputsQuotation.inicioVigenciaIni.getDate() - this.dayRetroConfig);
                                        } else {
                                            this.inputsQuotation.inicioVigenciaIni = undefined;
                                        }
                                    }

                                    this.inputsQuotation.inicioVigenciaFin = new Date(res[0].GenericResponse.EFECTO_COTIZACION_VL)
                                    this.inputsQuotation.inicioVigenciaFin.setDate(this.inputsQuotation.inicioVigenciaFin.getDate() + this.dayConfig);
                                }

                                // Datos de cotización - sede
                                this.inputsQuotation.CurrencyId = res[0].GenericResponse.COD_MONEDA;
                                this.inputsQuotation.CurrencyName = res[0].GenericResponse.DES_MONEDA;
                                this.inputsQuotation.LocationId = res[0].GenericResponse.COD_TIPO_SEDE;
                                this.inputsQuotation.LocationName = res[0].GenericResponse.DES_TIPO_SEDE;

                                this.inputsQuotation.EconomicActivityId = this.codProducto == 3 ? res[0].GenericResponse.ACT_ECO_VL : res[0].GenericResponse.COD_ACT_ECONOMICA;
                                this.inputsQuotation.EconomicActivityName = this.codProducto == 3 ? res[0].GenericResponse.DES_ACT_ECO_VL : res[0].GenericResponse.DES_ACT_ECONOMICA;
                                this.inputsQuotation.TechnicalActivityId = this.codProducto == 3 ? res[0].GenericResponse.ACT_TEC_VL : res[0].GenericResponse.ACT_TECNICA;
                                this.inputsQuotation.TechnicalActivityName = this.codProducto == 3 ? res[0].GenericResponse.DES_ACT_TEC_VL : res[0].GenericResponse.DES_ACT_TECNICA;
                                this.inputsQuotation.HasDelimiter = Number(res[0].GenericResponse.DELIMITACION) == 0 ? false : true;
                                this.inputsQuotation.IsMining = Number(res[0].GenericResponse.MINA) == 0 ? false : true;
                                this.inputsQuotation.DepartmentId = res[0].GenericResponse.COD_DEPARTAMENTO;
                                this.inputsQuotation.DepartmentName = res[0].GenericResponse.DES_DEPARTAMENTO;
                                this.inputsQuotation.ProvinceId = res[0].GenericResponse.COD_PROVINCIA;
                                this.inputsQuotation.ProvinceName = res[0].GenericResponse.DES_PROVINCIA;
                                this.inputsQuotation.DistrictId = res[0].GenericResponse.COD_DISTRITO;
                                this.inputsQuotation.DistrictName = res[0].GenericResponse.DES_DISTRITO;

                                this.inputsQuotation.NREM_EXC = res[0].GenericResponse.NREM_EXC; //RQ EXC EHH
                                this.flagActivateExc = res[0].GenericResponse.NREM_EXC;
                                this.inputsQuotation.TYPE_ENDOSO = res[0].GenericResponse.NTYPE_END; // ENDOSO TECNICA JTV 17042023

                                this.flagGobiernoEstado = res[0].GenericResponse.SPOL_ESTADO == 1 ? true : false;
                                this.flagGobiernoMatriz = res[0].GenericResponse.SPOL_MATRIZ == 1 ? true : false;
                                this.flagAprobCli = res[0].GenericResponse.APROB_CLI == 1 ? true : false;

                                if (this.mode == CommonMethods.TIPO_VISTAS.ENVIAR) {
                                    // this.enviarPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                                    this.enviarPolizaMatrizTramiteEstado = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_MATRIZ && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                                }

                                if (this.mode == CommonMethods.TIPO_VISTAS.INICIADO) {
                                    // this.flagGobiernoIniciado = this.flagGobiernoEstado && this.typeTran == 'Emisión' ? true : false;
                                    this.flagGobiernoIniciado = this.flagGobiernoEstado && this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION ? true : false;
                                    // this.iniciadoPolizaMatrizTramiteEstado = (this.typeTran == 'Emisión Póliza Matriz' && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                                    this.iniciadoPolizaMatrizTramiteEstado = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_MATRIZ && this.flagGobiernoEstado && this.flagGobiernoMatriz) ? true : false;//AER - GESTION TRAMITES ESTADO  - 16092022
                                    // this.emitirCertificadoOperaciones = this.typeTran == 'Emisión de certificados' || (this.typeTran == 'Emisión' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                                    this.emitirCertificadoOperaciones = this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT || (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                                    this.isTransact = this.iniciadoPolizaMatrizTramiteEstado ? true : this.flagGobiernoIniciado;
                                }

                                if (this.mode == CommonMethods.TIPO_VISTAS.EmitirC) {
                                    // this.emitirPolizaOperaciones = (this.typeTran == 'Emisión de certificados' && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                                    this.emitirPolizaOperaciones = (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT && this.flagGobiernoEstado && !this.flagAprobCli) ? true : false;
                                }

                                // VIDA LEY
                                if (this.codProducto == 3) {
                                    this.inputsQuotation.tipoRenovacion = res[0].GenericResponse.TIP_RENOV;
                                    this.inputsQuotation.desTipoRenovacion = res[0].GenericResponse.DES_TIP_RENOV;
                                    this.inputsQuotation.frecuenciaPago = res[0].GenericResponse.FREQ_PAGO;
                                    this.inputsQuotation.desFrecuenciaPago = res[0].GenericResponse.DES_FREQ_PAGO;
                                    this.inputsQuotation.tipoComision = res[0].GenericResponse.TIP_COMISS;
                                    this.inputsQuotation.desTipoComision = res[0].GenericResponse.DES_TIP_COMISS;
                                    this.inputsQuotation.inicioVigencia = new Date(res[0].GenericResponse.EFECTO_COTIZACION_VL);
                                    this.inputsQuotation.finVigencia = new Date(res[0].GenericResponse.EXPIRACION_COTIZACION_VL);
                                    this.descriptionComisionVL = res[1][0].COMISION_SALUD_AUT + '%'; //AVS - Comisiones 31/05/2023
                                    // if (this.mode == 'Excluir' || (this.typeTran == 'Exclusión' && this.mode == 'Visualizar') || (this.typeTran == 'Exclusión' && this.mode == 'Recotizar') || (this.typeTran == 'Exclusión' && this.mode == 'Enviar')) {
                                    if (this.mode == CommonMethods.TIPO_VISTAS.EXCLUIR || (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION && this.mode == CommonMethods.TIPO_VISTAS.VISUALIZAR) || (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUIR && this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR) || (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION && this.mode == CommonMethods.TIPO_VISTAS.ENVIAR)) {
                                        this.inputsQuotation.FechaAnulacion = new Date(res[0].GenericResponse.FECHA_EXCLUSION);
                                    }

                                    this.inputsQuotation.FDateIniAseg = new Date(res[0].GenericResponse.EFECTO_ASEGURADOS);
                                    this.inputsQuotation.FDateFinAseg = new Date(res[0].GenericResponse.EXPIRACION_ASEGURADOS);
                                    await this.ValidarFrecPago(null);
                                    this.inputsQuotation.FDateIniAsegMin = this.getStartAseInclude(new Date(this.inputsQuotation.FDateFinAseg));

                                    /*this.inputsQuotation.inicioVigenciaIni = new Date(res[0].GenericResponse.EFECTO_COTIZACION_VL)
                                    this.inputsQuotation.inicioVigenciaIni.setDate(this.inputsQuotation.inicioVigenciaIni.getDate() - this.dayRetroConfig);*/
                                    this.inputsQuotation.inicioVigenciaFin = new Date(res[0].GenericResponse.EFECTO_COTIZACION_VL)
                                    this.inputsQuotation.inicioVigenciaFin.setDate(this.inputsQuotation.inicioVigenciaFin.getDate() + this.dayConfig);
                                    // GTE - tramite de estado VL
                                    this.inputsQuotation.Aprobcli = res[0].GenericResponse.APROB_CLI;
                                    this.inputsQuotation.SPolEstado = res[0].GenericResponse.SPOL_ESTADO;
                                    this.inputsQuotation.SPolMatriz = res[0].GenericResponse.SPOL_MATRIZ;
                                    this.PolizaMatrizTransac = res[0].GenericResponse.POLIZA_MATRIZ == "1" ? true : false;
                                    if (this.inputsQuotation.SPolEstado == 1) {
                                        this.flagGobiernoEstado = true;
                                        this.brokerList = res[1];
                                        this.inputsQuotation.P_APROB_CLI = res[0].GenericResponse.APROB_CLI;
                                    }


                                }

                                if (this.inputsQuotation.frecuenciaPago == 1)
                                    this.sprimaMinima = 'PRIMA MÍNIMA ANUAL';
                                else
                                    this.sprimaMinima = 'PRIMA MÍNIMA MENSUAL';

                                this.inputsQuotation.Comment = res[0].GenericResponse.COMENTARIO;
                                this.inputsQuotation.FilePathList = res[0].GenericResponse.RUTAS;

                                this.inputsQuotation.SaludPropMinPremium = res[0].GenericResponse.MIN_SALUD_PR;
                                this.originalHealthMinPropPremium = res[0].GenericResponse.MIN_SALUD_PR;
                                this.inputsQuotation.HealthAuthMinPremium = res[0].GenericResponse.MIN_SALUD_AUT == '0' ? res[0].GenericResponse.MIN_SALUD_PR : res[0].GenericResponse.MIN_SALUD_AUT;
                                this.originalHealthMinAuthPremium = this.inputsQuotation.HealthAuthMinPremium;
                                this.inputsQuotation.SaludMinPremium = res[0].GenericResponse.MIN_SALUD;
                                this.inputsQuotation.PensionPropMinPremium = res[0].GenericResponse.MIN_PENSION_PR;
                                this.originalPensionMinPropPremium = this.codProducto == 3 ? res[0].GenericResponse.MIN_VIDALEY_PR : res[0].GenericResponse.MIN_PENSION_PR;
                                this.inputsQuotation.PensionMinPremium = this.codProducto == 3 ? res[0].GenericResponse.MIN_VIDALEY : res[0].GenericResponse.MIN_PENSION;
                                this.inputsQuotation.PensionAuthMinPremium = this.codProducto == 3 ? res[0].GenericResponse.MIN_VIDALEY_AUT == '0' ? res[0].GenericResponse.MIN_VIDALEY_PR : res[0].GenericResponse.MIN_VIDALEY_AUT : res[0].GenericResponse.MIN_PENSION_AUT == '0' ? res[0].GenericResponse.MIN_PENSION_PR : res[0].GenericResponse.MIN_PENSION_AUT;
                                this.originalPensionMinAuthPremium = this.inputsQuotation.PensionAuthMinPremium;

                                // Datos de brokers
                                this.inputsQuotation.SecondaryBrokerList = [];
                                res[1].forEach(item => {
                                    item.COMISION_PENSION = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION);
                                    item.COMISION_PENSION_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO);
                                    item.COMISION_PENSION_AUT = item.COMISION_PENSION_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_AUT);
                                    item.COMISION_SALUD_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO);
                                    item.COMISION_SALUD = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD);
                                    item.COMISION_SALUD_AUT = item.COMISION_SALUD_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_AUT);
                                    item.valItemSal = false;
                                    item.valItemSalPr = false;
                                    item.valItemPen = false;
                                    item.valItemPenPr = false;
                                    item.OriginalHealthPropCommission = item.COMISION_SALUD_PRO;
                                    item.OriginalPensionPropCommission = item.COMISION_PENSION_PRO;
                                    item.OriginalHealthAuthCommission = item.COMISION_SALUD_AUT;
                                    item.OriginalPensionAuthCommission = item.COMISION_PENSION_AUT;
                                    self.inputsQuotation.SecondaryBrokerList.push(item);
                                });
                            }

                            //this.inputsQuotation.desTipoPlan = res[0].GenericResponse.SDES_PLAN;
                            this.descPlanBD = res[0].GenericResponse.SDES_PLAN; //msr

                            this.getInfoAuth();

                            //this.isLoading = false;

                            if (this.perfil == this.variable.var_prefilExterno) {
                                this.inputsQuotation.inicioVigenciaIni = this.inputsQuotation.inicioVigencia;
                                var hoy = new Date();
                                if (this.inputsQuotation.inicioVigencia > hoy) {
                                    this.inputsQuotation.inicioVigenciaIni = new Date(res[0].GenericResponse.FECHA_REGISTRO);
                                }
                            }

                            if (this.mode == CommonMethods.TIPO_VISTAS.ENVIAR && (this.transactNumber == 0 || this.transactNumber == undefined)) {
                                this.transactNumber = res[0].GenericResponse.NID_TRAMITE;
                            }

                        }
                    );
        }
        if ((this.template.ins_validateDebt && !this.isTransact) || this.emitirPolizaOperaciones || this.procesarPolizaOperaciones) {
            const validateLockReq = new ValidateLockRequest();
            //validateLockReq.branchCode = 1;
            validateLockReq.branchCode = this.nbranch;
            validateLockReq.productCode = this.productoId;
            validateLockReq.documentType = this.inputsQuotation.DocumentTypeId;
            validateLockReq.documentNumber = this.inputsQuotation.DocumentNumber;
            this.validateLockResponse = await this.getValidateLock(validateLockReq);

            if (this.validateLockResponse.lockMark == 1) {
                this.flagDisabledRestric = true;
                swal.fire('Información', this.validateLockResponse.observation, 'error');
                self.isLoading = false;
            }
            else { // INI ENDOSO TECNICA JTV 23012023
                let typeTranValidate = this.variable.var_movimientoEmision;

                if (this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION && ([CommonMethods.TIPO_VISTAS.INCLUIR, CommonMethods.TIPO_VISTAS.AUTORIZAR, CommonMethods.TIPO_VISTAS.EVALUAR].includes(this.mode))) {
                    typeTranValidate = 2;
                } else if (this.typeTran == 'Endoso') {
                    typeTranValidate = 8;
                }
                else if ((this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION && this.mode == CommonMethods.TIPO_VISTAS.RENOVAR) || (this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION && ([CommonMethods.TIPO_VISTAS.AUTORIZAR, CommonMethods.TIPO_VISTAS.EVALUAR].includes(this.mode)))) {
                    typeTranValidate = 4;
                    // } else if (this.typeTran == 'Exclusión' && this.mode == 'Exclusión') {
                } else if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION && this.mode == CommonMethods.TIPO_VISTAS.EXCLUSION) {
                    typeTranValidate = 3;
                }

                this.validateDebtResponse = await this.getValidateDebt(this.nbranch, this.productoId, this.clientCode, typeTranValidate);

                if (this.validateDebtResponse.lockMark != 0 && this.mode != CommonMethods.TIPO_VISTAS.VISUALIZAR) {
                    if (Number(this.brokerProfile) == Number(this.perfil)) {
                        await this.generateAccountStatusExterno(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                            this.isLoading = false;
                        });
                    }
                    else {
                        await this.generateAccountStatus(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                            this.isLoading = false;
                        });
                    }
                }

                if (this.typeTran != CommonMethods.TIPO_TRANSACCION.EMISION && this.validateDebtResponse.lockMark == 1 && !([CommonMethods.TIPO_VISTAS.AUTORIZAR, CommonMethods.TIPO_VISTAS.EVALUAR].includes(this.mode))) {
                    this.flagDisabledRestric = true;
                }
                else if (this.validateDebtResponse.lockMark == 1) {
                    this.flagDisabledRestric = true;
                }

                /*if (this.mode == 'Emitir' || this.mode == 'EmitirR' || this.mode == 'Recotizar') {
                    if (this.codProducto == 2) {
                        this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.clientCode, this.variable.var_movimientoEmision);
                    } else {
                        this.validateDebtResponse = await this.getValidateDebt(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_movimientoEmision);
                    }

                    if (this.validateDebtResponse.lockMark != 0) {
                        if (Number(this.brokerProfile) == Number(this.perfil)) {
                            await this.generateAccountStatusExterno(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                                this.isLoading = false;
                            });
                        } else {
                            await this.generateAccountStatus(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                                this.isLoading = false;
                            });
                        }
                    }
                    if (this.validateDebtResponse.lockMark == 1) {
                        this.flagDisabledRestric = true;
                    }
                } else if (this.mode == 'Visualizar') {
                    if (this.codProducto == 2) {
                        this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.clientCode, this.variable.var_movimientoRenovacion);
                    } else {
                        this.validateDebtResponse = await this.getValidateDebt(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_movimientoRenovacion);
                    }
                    if (this.validateDebtResponse.lockMark == 1) {
                        this.flagDisabledRestric = true;
                    }
                } else {
                    let typeTranValidate = this.variable.var_movimientoEmision;
                    if (this.mode == 'Incluir' ||
                        (this.mode == 'Autorizar' &&
                            this.typeTran == 'Inclusión') ||
                        (this.mode == 'Evaluar' &&
                            this.typeTran == 'Inclusión')) {
                        typeTranValidate = 2;
                    } else if (this.typeTran == 'Endoso') {
                        typeTranValidate = 8;
                    }
                    else if (this.mode == 'Renovar' || (this.mode == 'Autorizar' && this.typeTran == 'Declaración') || (this.mode == 'Evaluar' && this.typeTran == 'Declaración')) {
                        typeTranValidate = 4;
                    } else if (this.mode == 'Exclusión') {
                        typeTranValidate = 3;
                    }
                    else {
                        typeTranValidate = this.variable.var_movimientoEmision;
                    }
                    if (this.codProducto == 2) { // AVS Mejoras SCTR
                        this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.clientCode, typeTranValidate);
                    } else {
                        this.validateDebtResponse = await this.getValidateDebt(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, typeTranValidate);
                    }
                    if (this.validateDebtResponse.lockMark != 0) {
                        if (Number(this.brokerProfile) == Number(this.perfil)) {
                            await this.generateAccountStatusExterno(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                                this.isLoading = false;
                            });
                        } else {
                            await this.generateAccountStatus(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                                this.isLoading = false;
                            });
                        }
                    }
                    if (this.validateDebtResponse.lockMark == 1 && this.mode != 'Autorizar' && this.mode != 'Evaluar') {
                        this.flagDisabledRestric = true;
                    }
                }*/
                /*if (this.creditHistory.nflag == this.variable.var_riesgoBajo || this.creditHistory.nflag == this.variable.var_riesgoAlto) {
                    if (this.validateDebtResponse.lockMark == 1) {
                        this.flagDisabledRestric = true;
                        await this.generateAccountStatus(1, this.vidaLeyID, this.clientCode, this.variable.var_accountStatusCode).then(() => {
                            this.isLoading = false;
                        });
                    }
                    else {
                        await this.generateAccountStatus(1, this.vidaLeyID, this.clientCode, this.variable.var_accountStatusCode).then(() => {
            this.isLoading = false;
                        });
                    }
                }*/ // FIN ENDOSO TECNICA JTV 23012023
            }

        }

    }

    async ValidarFrecPago(event: any) {
        if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionAnual) {
            this.inputsQuotation.primaMinimaPension = 'Prima mínima anual';
        } else {
            this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
        }

        if (this.codProducto == 3 && (this.mode == CommonMethods.TIPO_VISTAS.EMITIR || this.mode == CommonMethods.TIPO_VISTAS.EMITIRR || this.flagGobiernoIniciado)) {
            const fechad = new Date(this.inputsQuotation.FDateIniAseg);

            let res: any = await this.GetFechaFin(CommonMethods.formatDate(fechad), this.inputsQuotation.frecuenciaPago);
            if (res.FechaExp != "")
                this.inputsQuotation.FDateFinAseg = new Date(res.FechaExp);

            /*if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionMensual) {
              fechad.setMonth(fechad.getMonth() + 1);
              fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
              this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionBiMensual) {
              fechad.setMonth(fechad.getMonth() + 2);
              fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
              this.inputsQuotation.FDateFinAseg = new Date(fechad);

            }
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionTriMensual) {
              fechad.setMonth(fechad.getMonth() + 3);
              fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
              this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }

            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionSemestral) {
              fechad.setMonth(fechad.getMonth() + 6);
              fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
              this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }

            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionAnual) {
              fechad.setFullYear(fechad.getFullYear() + 1)
              fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
              this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }*/

            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionEspecial) {
                fechad.setDate(fechad.getDate() + 1);
                // this.bsValueFinMin = new Date(fechad);
                fechad.setMonth(fechad.getMonth() + 1);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
        }
    }


    async validarTipoRenovacion(event: any) {
        const fechadesde = this.desde.nativeElement.value.split('/');
        const fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
        const fechad = new Date(fechaDes);

        if (this.codProducto == 3 && (this.mode == CommonMethods.TIPO_VISTAS.EMITIR || this.mode == CommonMethods.TIPO_VISTAS.EMITIRR || this.flagGobiernoIniciado)) {
            this.inputsQuotation.FDateIniAseg = this.inputsQuotation.inicioVigencia;
        }
        let res: any = await this.GetFechaFin(CommonMethods.formatDate(fechad), this.inputsQuotation.tipoRenovacion);
        if (res.FechaExp != "")
            this.inputsQuotation.finVigencia = new Date(res.FechaExp);

        if (this.inputsQuotation.FDateFinAseg)
            await this.ValidarFrecPago(null);

        /*if (this.inputsQuotation.tipoRenovacion === '5') { //Mensual
          fechad.setMonth(fechad.getMonth() + 1);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }
        if (this.inputsQuotation.tipoRenovacion === '4') { //Bimestral
          fechad.setMonth(fechad.getMonth() + 2);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }
        if (this.inputsQuotation.tipoRenovacion === '3') { //Trimestral
          fechad.setMonth(fechad.getMonth() + 3);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }
        if (this.inputsQuotation.tipoRenovacion === '2') { //Semestral
          fechad.setMonth(fechad.getMonth() + 6);
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }

        if (this.inputsQuotation.tipoRenovacion === '1') { //Anual
          fechad.setFullYear(fechad.getFullYear() + 1)
          fechad.setDate(fechad.getDate() - 1);
          this.inputsQuotation.finVigencia = new Date(fechad)
          if (this.inputsQuotation.FDateFinAseg) {
            this.ValidarFrecPago(null);
          }
        }*/
    }

    changeSaludPropuesta(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_AUT = ComProp
                    item.valItemSal = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_AUT = ComProp
                    item.valItemSal = false;
                }
            });
        }
    }

    changeSaludPropuestaPr(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_PRO = ComProp
                    item.valItemSalPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_PRO = ComProp
                    item.valItemSalPr = false;
                }
            });
        }
    }

    changePensionPropuesta(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_AUT = ComProp
                    item.valItemPen = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_AUT = ComProp
                    item.valItemPen = false;
                }
            });
        }
    }

    changePensionPropuestaPr(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_PRO = ComProp
                    item.valItemPenPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_PRO = ComProp
                    item.valItemPenPr = false;
                }
            });
        }
    }

    /**
     * Calcula la primas neta total, IGV de prima neta total y la prima bruta total para las tasas autorizadas y primas mínimas autorizadas por producto
     * @param productId Id de producto
     */
    checkMinimunPremiumForAuthorizedAmounts(productId: string, cantPrima?) {
        if (cantPrima != undefined) {
            let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
            totPrima = isNaN(totPrima) ? 0 : totPrima;
            if (productId == this.healthProductId.id) {
                this.inputsQuotation.HealthAuthMinPremium = totPrima
            }

            if (productId == this.pensionProductId.id) {
                this.inputsQuotation.PensionAuthMinPremium = totPrima
            }
        }


        if (productId == this.healthProductId.id) {
            this.inputsQuotation.HealthAuthMinPremium = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.HealthAuthMinPremium);
            let NetPremium = 0;
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                NetPremium = NetPremium + Number(item.NewPremium);
            });

            if (NetPremium < this.inputsQuotation.HealthAuthMinPremium) {
                this.inputsQuotation.SaludNewNetAmount = this.inputsQuotation.HealthAuthMinPremium;
                this.healthMessage = this.variable.var_msjPrimaMin;
            } else {
                this.inputsQuotation.SaludNewNetAmount = NetPremium;
                this.healthMessage = '';
            }
            this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
            this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * Number(this.healthIGV.toString())) - this.inputsQuotation.SaludNewNetAmount, 2);
            this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

        } else if (productId == this.pensionProductId.id) {
            this.inputsQuotation.PensionAuthMinPremium = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.PensionAuthMinPremium);
            let NetPremium = 0;
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                NetPremium = NetPremium + Number(item.NewPremium);
            });
            if (NetPremium < this.inputsQuotation.PensionAuthMinPremium) {
                this.inputsQuotation.PensionNewNetAmount = this.inputsQuotation.PensionAuthMinPremium;
                this.pensionMessage = this.variable.var_msjPrimaMin;
            } else {
                this.inputsQuotation.PensionNewNetAmount = NetPremium;
                this.pensionMessage = '';
            }
            this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
            this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNewNetAmount, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);
        }
    }
    checkMinimunPremiumForOriginals(productId: string, cantPrima?) {
        if (cantPrima != undefined) {
            let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
            totPrima = isNaN(totPrima) ? 0 : totPrima;
            if (productId == this.healthProductId.id) {
                this.inputsQuotation.SaludPropMinPremium = totPrima
            }

            if (productId == this.pensionProductId.id) {
                this.inputsQuotation.PensionPropMinPremium = totPrima
            }
        }

        if (productId == this.healthProductId.id) {
            let healthPremiumToBeCompared = (this.inputsQuotation.SaludPropMinPremium != null && this.inputsQuotation.SaludPropMinPremium !== undefined && Number(this.inputsQuotation.SaludPropMinPremium) > 0) ? this.inputsQuotation.SaludPropMinPremium : this.inputsQuotation.SaludMinPremium;
            let originalNetPremium = 0;
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                originalNetPremium = originalNetPremium + Number(item.Premium);
            });

            if (originalNetPremium < healthPremiumToBeCompared) { //Si hay tasa propuesta
                this.isNetPremiumLessThanMinHealthPremium = true;
                //Cálculo de nueva prima total neta de Salud
                this.inputsQuotation.SaludNetAmount = healthPremiumToBeCompared;
                this.healthMessage = this.variable.var_msjPrimaMin;
            } else {
                this.isNetPremiumLessThanMinHealthPremium = false;
                //Cálculo de nueva prima total neta de Salud
                this.inputsQuotation.SaludNetAmount = originalNetPremium;
                this.healthMessage = '';
            }
            //Calculo de Prima Comercial de Salud
            this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNetAmount * this.dEmiSalud, 2);
            //Cálculo de IGV de la nueva prima total neta de Salud
            this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNetAmount * Number(this.healthIGV.toString())) - this.inputsQuotation.SaludNetAmount, 2);
            //Cálculo de nueva prima total bruta de Salud
            this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludCalculatedIGV) + Number(this.inputsQuotation.SaludPrimaComercial), 2);

        } else if (productId == this.pensionProductId.id) {
            let pensionPremiumToBeCompared = (this.inputsQuotation.PensionPropMinPremium != null && this.inputsQuotation.PensionPropMinPremium !== undefined && Number(this.inputsQuotation.PensionPropMinPremium) > 0) ? this.inputsQuotation.PensionPropMinPremium : this.inputsQuotation.PensionMinPremium;
            let originalNetPremium = 0;
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                originalNetPremium = originalNetPremium + Number(item.Premium);
            });
            if (originalNetPremium < pensionPremiumToBeCompared) {
                this.isNetPremiumLessThanMinPensionPremium = true;
                //Cálculo de nueva prima total neta de Pensión
                this.inputsQuotation.PensionNetAmount = pensionPremiumToBeCompared;
                this.pensionMessage = this.variable.var_msjPrimaMin;
            } else {
                this.isNetPremiumLessThanMinPensionPremium = false;
                this.inputsQuotation.PensionNetAmount = originalNetPremium;
                this.pensionMessage = '';
            }
            //Calculo de Prima Comercial de Salud
            this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNetAmount * this.dEmiPension, 2);
            //Cálculo de IGV de la nueva prima total neta de Pensión
            this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNetAmount, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionCalculatedIGV) + Number(this.inputsQuotation.PensionPrimaComercial), 2);
        }
    }

    /**
     * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
     * @param list lista ingresada
     * @returns  string en html
     */
    listToString(list: String[]): string {
        let output = '';
        if (list != null) {
            list.forEach(function (item) {
                output = output + item + ' <br>'
            });
        }
        return output;
    }

    glossChanged() {
        this.mainFormGroup.controls.glossComent.setValue('')
    }

    /**
     * Envia la petición de cambio de estado de la cotización e inserción de tasas autorizadas con las primas autorizadas
     */
    async AddStatusChange() {
        let errorList: any = [];

        /*Autorizar - recotizar INCLUSION VL -- EH*/
        let statusValue = ''; // se reemplazara 'this.mainFormGroup.get('status').value' por esta variable
        let AuthInc = false;
        if (this.codProducto == 3 && this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR && (this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION || this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION)) {
            const propEqualAuth: boolean[] = [];
            AuthInc = true;
            this.statusChange = 'AuthInc';
            this.ProposalList.forEach(e1 => {
                this.AuthorizedList.forEach(e2 => {
                    if (e1.CategoryProposal == e2.CategoryAuthorized) {
                        propEqualAuth.push(e1.RateProposal == e2.RateAuthorized);
                    }
                });
            });
            if (propEqualAuth.filter(x => x == false).length > 0) {
                statusValue = '11';
            } else {
                statusValue = '13';
            }
        } else {
            statusValue = this.mainFormGroup.get('status').value;
        }

        if (statusValue == '') {
            errorList.push('Debe seleccionar un estado para continuar.');
        } else {
            errorList = this.areAuthorizedRatesValid();
            errorList = errorList.concat(this.validateAuthorizedCommmissions());
            errorList = errorList.concat(this.validateAuthorizedPremiums());
        }

        if (this.flagContact && this.template.ins_addContact && statusValue != '11' && this.mode === CommonMethods.TIPO_VISTAS.EVALUAR) {
            if (this.contactList.length == 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email && statusValue != '11' && this.mode === CommonMethods.TIPO_VISTAS.EVALUAR) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                // this.inputsValidate[19] = true
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                    // this.inputsValidate[19] = true
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        // if (this.codProducto == 3 && statusValue != '11' && this.mode === 'Evaluar') {
        //   if (this.files.length == 0) {
        //     errorList.push('Debe ingresar un archivo.');
        //   }
        // }

        if (this.codProducto == 2) {
            if (this.mainFormGroup.controls.gloss.value == 99 && this.mainFormGroup.controls.glossComent.value == '') {
                errorList.push('Debe ingresar una glosa de constancia.');
            }
        }

        if ((this.mainFormGroup.valid == true || AuthInc == true) && (errorList == null || errorList.length == 0)) { //  AuthInc == true  agregado en inc EH
            const self = this;
            const formData = new FormData();
            if (this.codProducto == 2) {
                this.files.forEach(function (file) { // anexamos todos los archivos al formData
                    formData.append(file.name, file, file.name);
                });

                this.statusChangeRequest.QuotationNumber = this.quotationNumber;  // Número de cotización
                this.statusChangeRequest.Status = this.mainFormGroup.controls.status.value; // Nuevo estado
                this.statusChangeRequest.Reason = this.mainFormGroup.controls.reason.value; // Motivo
                this.statusChangeRequest.Comment = this.mainFormGroup.controls.comment.value.trim().toUpperCase().replace(/[<>%]/g, ''); // Comentario
                this.statusChangeRequest.User = JSON.parse(localStorage.getItem('currentUser'))['id'];  // Usuario
                this.statusChangeRequest.Product = this.codProducto == 3 ? self.vidaLeyID.id : self.pensionProductId.id; // Comentario
                this.statusChangeRequest.Nbranch = this.codProducto == 3 ? self.vidaLeyID.nbranch : self.pensionProductId.nbranch; // Comentario
                this.statusChangeRequest.Gloss = this.mainFormGroup.controls.gloss.value; // Mejora SCTR
                this.statusChangeRequest.GlossComment = this.mainFormGroup.controls.glossComent.value.trim().toUpperCase().replace(/[<>%]/g, ''); // Mejora SCTR
                this.statusChangeRequest.flag = this.template.ins_mapfre;

                // Preparación de tasas autorizadas y primas recalculadas a enviar
                self.statusChangeRequest.saludAuthorizedRateList = [];
                self.statusChangeRequest.pensionAuthorizedRateList = [];
                this.statusChangeRequest.BrokerList = [];

                this.inputsQuotation.SecondaryBrokerList.forEach(element => {
                    const item = new Broker();
                    item.Id = element.CANAL;
                    item.ProductList = [];
                    if (self.inputsQuotation.PensionDetailsList != null && self.inputsQuotation.PensionDetailsList.length > 0) {
                        const obj = new BrokerProduct();
                        obj.Product = self.pensionProductId.id;
                        obj.AuthorizedCommission = element.COMISION_PENSION_AUT;
                        item.ProductList.push(obj);
                    }
                    if (self.inputsQuotation.SaludDetailsList != null && self.inputsQuotation.SaludDetailsList.length > 0) {
                        const obj = new BrokerProduct();
                        obj.Product = self.healthProductId.id;
                        obj.AuthorizedCommission = element.COMISION_SALUD_AUT;
                        item.ProductList.push(obj);
                    }
                    self.statusChangeRequest.BrokerList.push(item);
                });

                this.inputsQuotation.PensionDetailsList.forEach((element) => {
                    const item = new AuthorizedRate();
                    item.ProductId = JSON.parse(localStorage.getItem('pensionID'))['id'];
                    item.RiskTypeId = element.RiskTypeId;
                    item.AuthorizedRate = element.AuthorizedRate;
                    item.AuthorizedPremium = element.NewPremium;
                    item.AuthorizedMinimunPremium = self.inputsQuotation.PensionAuthMinPremium;

                    self.statusChangeRequest.pensionAuthorizedRateList.push(item);
                });
                this.inputsQuotation.SaludDetailsList.forEach((element) => {
                    const item = new AuthorizedRate();
                    item.ProductId = JSON.parse(localStorage.getItem('saludID'))['id'];
                    item.RiskTypeId = element.RiskTypeId;
                    item.AuthorizedRate = element.AuthorizedRate;
                    item.AuthorizedPremium = element.NewPremium;
                    item.AuthorizedMinimunPremium = self.inputsQuotation.HealthAuthMinPremium;

                    self.statusChangeRequest.saludAuthorizedRateList.push(item);
                });
            } else {

                this.files.forEach(function (file) { // anexamos todos los archivos al formData
                    formData.append(file.name, file, file.name);
                });

                this.statusChangeRequest.QuotationNumber = this.quotationNumber;  // Número de cotización
                this.statusChangeRequest.Status = AuthInc ? statusValue : this.mainFormGroup.controls.status.value; // Nuevo estado
                this.statusChangeRequest.Reason = AuthInc ? '' : this.mainFormGroup.controls.reason.value; // Motivo
                this.statusChangeRequest.Comment = this.mainFormGroup.controls.comment.value; // Comentario
                this.statusChangeRequest.User = JSON.parse(localStorage.getItem('currentUser'))['id'];  // Usuario
                this.statusChangeRequest.Product = this.codProducto == 3 ? self.vidaLeyID.id : self.pensionProductId.id; // Comentario
                this.statusChangeRequest.Nbranch = this.codProducto == 3 ? self.vidaLeyID.nbranch : self.pensionProductId.nbranch; // Comentario
                this.statusChangeRequest.Flag = (this.mode == CommonMethods.TIPO_VISTAS.EMITIR || this.mode == CommonMethods.TIPO_VISTAS.EMITIRR || this.mode == CommonMethods.TIPO_VISTAS.INCLUIR || this.mode == CommonMethods.TIPO_VISTAS.RENOVAR || this.mode == CommonMethods.TIPO_VISTAS.ENDOSAR) ? 1 : 0; // ENDOSO TECNICA JTV 06022023
                // Preparación de tasas autorizadas y primas recalculadas a enviar
                self.statusChangeRequest.saludAuthorizedRateList = [];
                self.statusChangeRequest.pensionAuthorizedRateList = [];
                this.statusChangeRequest.BrokerList = [];

                this.inputsQuotation.SecondaryBrokerList.forEach(element => {
                    const item = new Broker();
                    item.Id = element.CANAL;
                    item.ProductList = [];
                    const obj = new BrokerProduct();
                    obj.Product = this.vidaLeyID.id;
                    obj.AuthorizedCommission = Number(this.inputsQuotation.CommissionAuthorized.toString());
                    item.ProductList.push(obj);
                    self.statusChangeRequest.BrokerList.push(item);
                    this.AuthorizedList.forEach((element) => {
                        let item = new AuthorizedRate();
                        item.ProductId = this.vidaLeyID.id;
                        item.RiskTypeId = element.CategoryCode;
                        item.AuthorizedRate = element.RateAuthorized;
                        item.AuthorizedPremium = 0;
                        item.AuthorizedMinimunPremium = 0;

                        self.statusChangeRequest.saludAuthorizedRateList.push(item);
                    });
                });
            }

            /** */
            if (this.mode === CommonMethods.TIPO_VISTAS.EVALUAR && statusValue != '11') {
                this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.contractingdata.P_TipOper = 'INS';
                this.contractingdata.P_NCLIENT_SEG = -1;

                if (this.flagContact && this.template.ins_addContact) {
                    this.contractingdata.EListContactClient = [];
                    if (this.contactList.length > 0) {
                        this.contactList.forEach(contact => {
                            if (contact.P_NTIPCONT == 0) {
                                contact.P_NTIPCONT = 99;
                            }
                            if (contact.P_NIDDOC_TYPE == '0') {
                                contact.P_NIDDOC_TYPE = null;
                                contact.P_SIDDOC = null;
                            }
                        });
                        this.contractingdata.EListContactClient = this.contactList;
                    }
                } else {
                    this.contractingdata.EListContactClient = null;
                }

                if (this.flagEmail && this.template.ins_email) {
                    this.contractingdata.EListEmailClient = [];
                    const contractingEmail: any = {};
                    contractingEmail.P_CLASS = '';
                    contractingEmail.P_DESTICORREO = 'Correo Personal';
                    contractingEmail.P_NROW = 1;
                    contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                    contractingEmail.P_SORIGEN = 'SCTR';
                    contractingEmail.P_SRECTYPE = '4';
                    contractingEmail.P_TipOper = '';
                    this.contractingdata.EListEmailClient.push(contractingEmail);
                } else {
                    this.contractingdata.EListEmailClient = null;
                }

                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    const response: any = await this.updateContracting();
                    if (response.code == '0') {
                        this.processChanges(formData);
                    } else {
                        swal.fire('Información', response.message, 'error');
                        return;
                    }
                } else {
                    this.processChanges(formData);
                }

            } else {
                this.processChanges(formData);
            }
        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processChanges(formData) {
        let msgStatusChange = '';

        if (this.codProducto == 3) {
            if (this.statusChange == 'AuthInc') {
                msgStatusChange = '¿Desea derivar a comercial la cotizacion N° ' + this.quotationNumber + '?';
            } else {
                if (this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                    msgStatusChange = '¿Desea cambiar a estado ' + this.statusChange + ' la cotización N° ' + this.quotationNumber + '?';
                } else {
                    if (this.mainFormGroup.get('status').value != '11') {
                        msgStatusChange = '¿Desea cambiar a estado ' + this.statusChange + ' la cotización N° ' +
                            this.quotationNumber + ', para poder realizar su ' + this.typeTran + ' pendiente?';
                    } else {
                        msgStatusChange = '¿Desea cambiar a estado ' + this.statusChange + ' la cotización N° ' + this.quotationNumber + '?';
                    }
                }
            }
        } else {
            msgStatusChange = '¿Desea cambiar a estado ' + this.statusChange + ' la cotización N° ' + this.quotationNumber + '?';
        }


        formData.append('statusChangeData', JSON.stringify(this.statusChangeRequest));
        swal.fire({
            title: 'Información',
            text: msgStatusChange,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Procesar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        })
            .then(async (result) => {
                if (result.value) {
                    this.isLoading = true;
                    if (this.codProducto == 2) {
                        this.quotationService.changeStatus(formData).subscribe(
                            res => {
                                if (res.StatusCode == 0) {
                                    swal.fire('Información', 'Se ha realizado correctamente la operación.', 'success');
                                    this.router.navigate(['/extranet/request-status']);
                                } else if (res.StatusCode == 1) { // Error de validación
                                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                                } else {
                                    swal.fire('Información', this.genericServerErrorMessage, 'error');
                                }
                                this.isLoading = false;
                            },
                            err => {
                                swal.fire('Información', this.genericServerErrorMessage, 'error');
                                this.isLoading = false;
                            }
                        );
                    } else {
                        this.inputsQuotation.actualizarCotizacion = this.statusChangeRequest;

                        if (this.mode == CommonMethods.TIPO_VISTAS.AUTORIZAR) {
                            this.quotationService.changeStatusVL(formData).subscribe(
                                res => {
                                    if (res.StatusCode == 0) {
                                        swal.fire('Información', 'Operación exitosa.', 'success');
                                        this.router.navigate(['/extranet/request-status']);
                                    } else if (res.StatusCode == 1) {
                                        swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                                    } else {
                                        if (res.ErrorCode == 1) {
                                            swal.fire('Información', res.MessageError, 'error');
                                        } else {
                                            swal.fire('Información', this.genericServerErrorMessage, 'error');
                                        }
                                    }
                                    this.isLoading = false;
                                });
                        } else {
                            if (this.mainFormGroup.get('status').value != '11') {
                                this.objetoTrx();
                            } else {
                                this.quotationService.changeStatusVL(formData).subscribe(
                                    res => {
                                        if (res.StatusCode == 0) {
                                            swal.fire('Información', 'Operación exitosa.', 'success');
                                            this.router.navigate(['/extranet/request-status']);
                                        } else if (res.StatusCode == 1) {
                                            swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                                        } else {
                                            if (res.ErrorCode == 1) {
                                                swal.fire('Información', res.MessageError, 'error');
                                            } else {
                                                swal.fire('Información', this.genericServerErrorMessage, 'error');
                                            }
                                        }
                                        this.isLoading = false;
                                    });
                            }

                        }
                    }
                }
            });
    }

    async objetoTrx() {
        this.isLoading = true;
        /* Validar Retroactividad antes de pagar */
        if (this.codProducto == 3 && /*this.typeTran != "Endoso" &&*/ this.inputsQuotation.formaPago) { // ENDOSO TECNICA JTV 23052023
            const response: any = await this.ValidateRetroactivity(2);
            if (response.P_NCODE == 4) {
                this.router.navigate(['/extranet/request-status']);
                swal.fire('Información', response.P_SMESSAGE, 'error');
                return;
            }
        }
        /* * Validar Retroactividad antes de pagar * */

        if (this.inputsQuotation.tipoTransaccion == 1 && this.emitirCertificadoTecnica == false) {
            // let comentario = ''
            // const fechaIni = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
            // const fechaFin = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
            // const savedPolicyList: any = [];
            // let amountDetailTotalList: any = [];
            // const savedPolicyEmit: any = {};

            await this.policyService.getPolicyEmitCab(
                this.quotationNumber, '1',
                JSON.parse(localStorage.getItem('currentUser'))['id']
            ).toPromise().then(async (res: any) => {
                if (!!res.GenericResponse &&
                    res.GenericResponse.COD_ERR == 0) {
                    await this.policyService.getPolicyEmitDet(
                        this.quotationNumber,
                        JSON.parse(localStorage.getItem('currentUser'))['id'])
                        .toPromise().then(
                            async resDet => {
                                // const efectoWS = new Date(res.GenericResponse.EFECTO_COTIZACION_VL)
                                // const fechaEfecto = CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL));
                                this.flagEvaluarDirecto = res.GenericResponse.NFLAG_PAY_DIRECTO;
                                const params = [
                                    {
                                        P_NID_COTIZACION: this.quotationNumber,
                                        P_NID_PROC: res.GenericResponse.NID_PROC,
                                        P_NPRODUCT: this.productoId,
                                        P_NBRANCH: this.nbranch,
                                        P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                        P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                                        P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                                        P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                        P_SFLAG_FAC_ANT: 1,
                                        P_FACT_MES_VENCIDO: 0,
                                        P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                        P_IGV: resDet[0].NSUM_IGV,
                                        P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                        P_SCOMMENT: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia) !=
                                            CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                            'Se ha modificado el inicio de vigencia: Antes = ' +
                                            CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) +
                                            '.Ahora = ' + CommonMethods.formatDate(this.inputsQuotation.finVigencia) : '',
                                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                        /* Campos para retroactividad */
                                        P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                        FlagCambioFecha: this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
                                        /* Campos para retroactividad */
                                        // P_DSTARTDATE_POL : CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),   //IniPol - RI
                                        // P_DEXPIRDAT_POL: CommonMethods.formatDate(this.inputsQuotation.finVigencia),        //FinPol - RI
                                        P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),          //RI
                                        P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,                        //Neta - RI
                                        P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,                             //IGV - RI
                                        P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized                           //Bruta - RI
                                    }
                                ];

                                if (params[0].P_NID_PROC == '') {
                                    await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                                        resCod => {
                                            params[0].P_NID_PROC = resCod;
                                        }
                                    );
                                }
                                this.OpenModalPagos(params);

                            }
                        );
                }
            });
        } else if ((this.inputsQuotation.tipoTransaccion == 2 ||
            this.inputsQuotation.tipoTransaccion == 4 ||
            this.inputsQuotation.tipoTransaccion == 8 ||
            this.inputsQuotation.tipoTransaccion == 3 || this.emitirCertificadoTecnica || this.procesarPolizaOperaciones)) {

            await this.policyService.getPolicyEmitCab(
                this.quotationNumber, '1',
                JSON.parse(localStorage.getItem('currentUser'))['id']
            ).toPromise().then(
                async res => {
                    if (this.inputsQuotation.tipoTransaccion == 3) {
                        this.stran = this.typeTran;
                    }
                    this.flagEvaluarDirecto = res.GenericResponse.NFLAG_PAY_DIRECTO;
                    await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                        resCod => {
                            const params = {
                                P_NPRODUCTO: this.productoId,
                                P_NBRANCH: this.nbranch,
                                P_NID_COTIZACION: this.quotationNumber,
                                P_DEFFECDATE: this.codProducto == 3 && this.inputsQuotation.tipoTransaccion == 8 ? CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)) : this.inputsQuotation.tipoTransaccion == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.FECHA_EXCLUSION)) : CommonMethods.formatDate(new Date(this.inputsQuotation.FDateIniAseg)),
                                P_DEXPIRDAT: this.codProducto == 3 && this.inputsQuotation.tipoTransaccion == 8 ? CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)) : this.inputsQuotation.tipoTransaccion == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)) : CommonMethods.formatDate(new Date(this.inputsQuotation.FDateFinAseg)),
                                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                P_NTYPE_TRANSAC: this.procesarPolizaOperaciones && this.sAbrTran == 'DE' ? 11 : this.inputsQuotation.tipoTransaccion,
                                P_NID_PROC: resCod,
                                P_FACT_MES_VENCIDO: 0,
                                P_SFLAG_FAC_ANT: 1,
                                P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                P_NMOV_ANUL: 0,
                                P_NNULLCODE: 0,
                                P_SCOMMENT: null,
                                P_NPREM_BRU: this.AuthorizedDetailList[2].AmountAuthorized,
                                P_POLICY: this.policyNumber,
                                /* Campos para retroactividad */
                                P_STRAN: this.procesarPolizaOperaciones && this.sAbrTran == 'DE' ? this.sAbrTran : this.stran,
                                P_DSTARTDATE_ASE: this.inputsQuotation.tipoTransaccion == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.FECHA_EXCLUSION)) : CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                FlagCambioFecha: this.inputsQuotation.tipoTransaccion == 3 ? 0 : this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
                                /* Campos para retroactividad */
                                P_DSTARTDATE_POL: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),   //IniPol - RI
                                P_DEXPIRDAT_POL: CommonMethods.formatDate(this.inputsQuotation.finVigencia),        //FinPol - RI
                                P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,                        //Neta - RI
                                P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,                             //IGV - RI
                                P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized                           //Bruta - RI
                            };

                            if (this.inputsQuotation.tipoTransaccion != 3) {
                                this.OpenModalPagos(params);
                            }
                            else {
                                this.inputsQuotation.paramsTrx = params;
                                this.renovacionTrx(this.inputsQuotation.paramsTrx);
                            }
                        });
                });
        }
    }

    textValidate(event: any, typeText) {
        CommonMethods.textValidate(event, typeText)
    }

    /**Modificar cotización | Recotizar */
    modifyQuotation() {
        const errorList = this.areProposedRatesValid();
        if (errorList == null || errorList.length == 0) {
            const self = this;
            const quotation = new QuotationModification();
            quotation.Number = this.quotationNumber;
            quotation.Branch = JSON.parse(localStorage.getItem('pensionID'))['nbranch'];
            quotation.User = JSON.parse(localStorage.getItem('currentUser'))['id'];

            this.statusChangeRequest.QuotationNumber = this.quotationNumber;  //Número de cotización
            this.statusChangeRequest.Status = '1'; // Nuevo estado
            this.statusChangeRequest.Reason = null; // Motivo
            this.statusChangeRequest.Comment = this.mainFormGroup.controls.comment.value; //Comentario
            this.statusChangeRequest.User = JSON.parse(localStorage.getItem('currentUser'))['id'];  //Usuario

            quotation.StatusChangeData = this.statusChangeRequest;
            quotation.RiskList = [];
            this.inputsQuotation.PensionDetailsList.forEach((element) => {
                let item = new QuotationRisk();
                item.RiskTypeId = element.RiskTypeId;
                item.ProductTypeId = JSON.parse(localStorage.getItem('pensionID'))['id'];
                item.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
                item.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
                item.PayrollAmount = CommonMethods.ConvertToReadableNumber(element.PayrollAmount);
                item.CalculatedRate = CommonMethods.ConvertToReadableNumber(element.Rate);
                item.PremimunPerRisk = CommonMethods.ConvertToReadableNumber(element.Premium);
                item.MinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionMinPremium);
                item.ProposedMinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionPropMinPremium);
                item.EndorsmentPremium = CommonMethods.ConvertToReadableNumber(element.EndorsmentPremium);

                item.NetPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionNetAmount);
                item.GrossPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionGrossAmount);
                item.PremiumIGV = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.PensionCalculatedIGV);

                item.RiskRate = CommonMethods.ConvertToReadableNumber(element.RiskRate);
                item.Discount = element.Discount;
                item.Variation = element.Variation;
                item.TariffFlag = '3';

                quotation.RiskList.push(item);
            });
            this.inputsQuotation.SaludDetailsList.forEach((element) => {
                let item = new QuotationRisk();
                item.RiskTypeId = element.RiskTypeId;
                item.ProductTypeId = JSON.parse(localStorage.getItem('saludID'))['id'];
                item.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
                item.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
                item.PayrollAmount = CommonMethods.ConvertToReadableNumber(element.PayrollAmount);
                item.CalculatedRate = CommonMethods.ConvertToReadableNumber(element.Rate);
                item.PremimunPerRisk = CommonMethods.ConvertToReadableNumber(element.Premium);
                item.MinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludMinPremium);
                item.ProposedMinimunPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludPropMinPremium);
                item.EndorsmentPremium = CommonMethods.ConvertToReadableNumber(element.EndorsmentPremium);

                item.NetPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludNetAmount);
                item.GrossPremium = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludGrossAmount);
                item.PremiumIGV = CommonMethods.ConvertToReadableNumber(self.inputsQuotation.SaludCalculatedIGV);

                item.RiskRate = CommonMethods.ConvertToReadableNumber(element.RiskRate);
                item.Discount = element.Discount;
                item.Variation = element.Variation;
                item.TariffFlag = '3';

                quotation.RiskList.push(item);
            });

            quotation.BrokerList = [];

            this.inputsQuotation.SecondaryBrokerList.forEach((element) => {
                let item = new QuotationBroker();
                item.ChannelTypeId = element.TIPO_CANAL;
                item.ChannelId = element.CANAL;
                item.ClientId = element.SCLIENT;

                item.HealthProposedCommission = CommonMethods.isNumber(element.COMISION_SALUD_PRO) ? element.COMISION_SALUD_PRO : 0;
                item.HealthCommission = CommonMethods.isNumber(element.COMISION_SALUD) ? element.COMISION_SALUD : 0;
                item.PensionProposedCommission = CommonMethods.isNumber(element.COMISION_PENSION_PRO) ? element.COMISION_PENSION_PRO : 0;
                item.PensionCommission = CommonMethods.isNumber(element.COMISION_PENSION) ? element.COMISION_PENSION : 0;
                item.IsPrincipal = false;
                item.SharedCommission = 0;
                quotation.BrokerList.push(item);
            });

            let formData = new FormData();
            this.files.forEach(function (file) {
                // anexamos todos los archivos al formData
                formData.append(file.name, file, file.name)
            });

            formData.append('quotationModification', JSON.stringify(quotation));

            swal.fire({
                title: 'Información',
                text: '¿Desea Recotizar la cotización N° ' + this.quotationNumber + '?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                allowOutsideClick: false,
                cancelButtonText: 'No'
            })
                .then((result) => {
                    if (result.value) {
                        this.isLoading = true;
                        this.quotationService.modifyQuotation(formData).subscribe(
                            res => {
                                if (res.P_COD_ERR == 0) {
                                    if (res.P_SAPROBADO == 'S') {
                                        self.isLoading = false;
                                        if (res.P_NCODE == 0) {
                                            swal.fire({
                                                title: 'Información',
                                                text: 'Se generó la cotización Nº ' + this.quotationNumber + '¿Desea emitir la póliza?',
                                                icon: 'question',
                                                showCancelButton: true,
                                                confirmButtonText: 'Sí',
                                                allowOutsideClick: false,
                                                cancelButtonText: 'No'
                                            })
                                                .then((result) => {
                                                    if (result.value) {
                                                        self.isLoading = false;
                                                        this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: res.P_NID_COTIZACION } });
                                                    } else {
                                                        this.router.navigate(['/extranet/request-status']);
                                                    }
                                                });
                                        } else {
                                            self.isLoading = false;
                                            swal.fire('Información', 'Se ha recotizado correctamente la cotización N° ' + res.P_NID_COTIZACION + ',  para Emitir debe esperar su aprobación.', 'success');
                                            this.router.navigate(['/extranet/request-status']);
                                        }
                                    } else {
                                        self.isLoading = false;
                                        swal.fire('Información', 'Se ha recotizado correctamente la cotización N° ' + res.P_NID_COTIZACION + ',  para Emitir debe esperar su aprobación. ' + res.P_SMESSAGE, 'success');
                                        this.router.navigate(['/extranet/request-status']);
                                    }
                                } else {
                                    self.isLoading = false;
                                    swal.fire('Información', res.P_MESSAGE, 'error');
                                }
                            },
                            error => {
                                swal.fire('Información', this.genericServerErrorMessage, 'error');
                            }
                        );
                    }
                });

        } else {
            swal.fire('Información', CommonMethods.listToString(errorList), 'error')
        }

    }

    /**Decide que operación hacer de acuerdo al modo de esta vista */
    async manageOperation() {
        if (this.codProducto == 3 && this.nTransac != 1) {
            //validar estado de tramite actual
            //await swal.fire('Información', "La cotización ha sido derivada al ejecutivo comercial para su aprobación", 'warning');
            //return;
        }
        switch (this.mode) {
            case CommonMethods.TIPO_VISTAS.RECOTIZAR:
                if (this.codProducto == 2) {
                    this.modifyQuotation();
                } else {
                    this.recotizar();
                }
                break;
            case CommonMethods.TIPO_VISTAS.EVALUAR:
                this.AddStatusChange();
                break;
            case CommonMethods.TIPO_VISTAS.EMITIR:
                this.emitirPoliza();
                break;
            case CommonMethods.TIPO_VISTAS.EMITIRR:
                this.emitirPoliza();
                break;
            case CommonMethods.TIPO_VISTAS.AUTORIZAR:
                this.AddStatusChange();
                break;
            case CommonMethods.TIPO_VISTAS.RENOVAR:
                this.renovarPoliza();
                break;
            case CommonMethods.TIPO_VISTAS.INCLUIR:
                this.incluirPoliza();
                break;
            case CommonMethods.TIPO_VISTAS.ENDOSAR:
                this.endosarPoliza();
                break;
            case CommonMethods.TIPO_VISTAS.EXCLUIR:
                this.excluirPoliza();
                break;
            default:
                this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: this.quotationNumber } });
                break;
        }
    }

    /**Primera búsqueda de cambios de estado de cotización */
    firstSearch() {
        this.filter.PageNumber = 1;
        if (this.isTransact) {
            this.searchTrackingTransact()
        } else {
            this.searchTracking();
        }
    }
    /**Búsqueda de estados de la cotización accionados por el cambio de página */
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    /**Proceso de búsqueda de cambios de estado de la cotización */
    searchTracking() {
        this.quotationService.getTrackingList(this.filter).subscribe(
            res => {
                this.isLoading = false;
                this.statusChangeList = res.GenericResponse;
                this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                this.totalItems = this.statusChangeList.length;

                if (this.statusChangeList.length == 0) {
                    this.statusChangeList = [];
                } else {
                    if (this.statusChangeList.length > 1) {
                        const files = this.statusChangeList[0].FilePathList;
                        const estadoAnterior = this.statusChangeList[1].Status;
                        const estadoUltimo = this.statusChangeList[0].Status;

                        if ((estadoAnterior == 'CREADO' && files == null) ||
                            (this.mode == CommonMethods.TIPO_VISTAS.EMITIRR && estadoUltimo == 'CREADO') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.EMITIRR && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.EMITIR && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.RENOVAR && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.DECLARAR && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.INCLUIR && estadoUltimo == 'AP. POR TÉCNICA') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.ENDOSAR && estadoUltimo == 'CREADO') ||
                            (this.mode == CommonMethods.TIPO_VISTAS.EMITIRR && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == CommonMethods.TIPO_VISTAS.INCLUIR && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == CommonMethods.TIPO_VISTAS.RENOVAR && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == CommonMethods.TIPO_VISTAS.DECLARAR && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1)) ||
                            (this.mode == CommonMethods.TIPO_VISTAS.ENDOSAR && estadoUltimo == 'APROBADO' && (this.perfil != 5 && this.perfil != 136 && this.isProfileOpe != 1))
                        ) {
                            this.inputsQuotation.estadoPago = true;
                        } else {
                            this.inputsQuotation.estadoPago = false;
                        }
                    }
                }
            },
            err => {
                swal.fire('Información', this.genericServerErrorMessage, 'error');
            }
        );
    }

    openFilePicker(fileList: string[]) {
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.ngbModal.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
        }

    }

    /**Muestra las comisión propuesta original de salud */
    switchHealthPropCommissionValue() {
        if (!this.enabledHealthMainPropCommission) this.inputsQuotation.BrokerSaludPropBounty = this.originalHealthMainPropComission;
    }
    /**Muestra las comisión autorizada original de salud */
    switchHealthAuthCommissionValue() {
        if (!this.enabledHealthMainAuthCommission) this.inputsQuotation.BrokerSaludAuthBounty = this.originalHealthMainAuthComission;
    }
    /**Muestra las comisión propuesta original de pensión */
    switchPensionPropCommissionValue() {
        if (!this.enabledPensionMainPropCommission) this.inputsQuotation.BrokerPensionPropBounty = this.originalPensionMainPropComission;
    }
    /**Muestra las comisión autorizada original de pensión */
    switchPensionAuthCommissionValue() {
        if (!this.enabledPensionMainAuthCommission) this.inputsQuotation.BrokerPensionAuthBounty = this.originalPensionMainAuthComission;
    }

    /**Muestra las prima mínima propuesta original de salud */
    switchHealthMinPropPremiumValue() {
        if (!this.enabledHealthMinPropPremium) this.inputsQuotation.SaludPropMinPremium = this.originalHealthMinPropPremium;
        this.checkMinimunPremiumForOriginals(this.healthProductId.id);
    }
    /**Muestra las prima mínima propuesta original de pensión */
    switchPensionMinPropPremiumValue() {
        if (!this.enabledPensionMinPropPremium) this.inputsQuotation.PensionPropMinPremium = this.originalPensionMinPropPremium;
        this.checkMinimunPremiumForOriginals(this.pensionProductId.id);
    }
    /**Muestra las prima mínima autorizada original de pensión */
    switchPensionMinAuthPremiumValue() {
        if (!this.enabledPensionAuthorizedPremium) this.inputsQuotation.PensionAuthMinPremium = this.originalPensionMinAuthPremium;
        this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
    }
    /**Muestra las prima mínima autorizada original de salud */
    switchHealthMinAuthPremiumValue() {
        if (!this.enabledHealthAuthorizedPremium) this.inputsQuotation.HealthAuthMinPremium = this.originalHealthMinAuthPremium;
        this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
    }

    /**Muestra las tasas propuestas originales de salud */
    switchHealthProposedRateValues() {
        if (!this.enabledHealthProposedRate) {
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                item.ProposedRate = item.OriginalProposedRate;
                item.valItemPr = false;
            });
        }
    }
    /**Muestra las tasas propuestas originales de pensión */
    switchPensionProposedRateValues() {
        if (!this.enabledPensionProposedRate) {
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                item.ProposedRate = item.OriginalProposedRate;
                item.valItemPr = false;
            });
        }
    }
    /**Muestra las tasas autorizadas originales de salud */
    switchHealthAuthorizedRateValues() {
        let self = this;
        if (!this.enabledHealthAuthorizedRate) {
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                self.calculateNewPremiums(item.OriginalAuthorizedRate, item.RiskTypeId, self.healthProductId.id);
                item.AuthorizedRate = item.OriginalAuthorizedRate;
                item.valItemAu = false;
            });

        }
    }
    /**Muestra las tasas autorizadas originales de pensión */
    switchPensionAuthorizedRateValues() {
        let self = this;
        if (!this.enabledPensionAuthorizedRate) {
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                self.calculateNewPremiums(item.OriginalAuthorizedRate, item.RiskTypeId, self.pensionProductId.id);
                item.AuthorizedRate = item.OriginalAuthorizedRate;
                item.valItemAu = false;
            });
        }
    }
    /**Muestra la comisión propuesta original para salud*/
    switchHealthSecondaryPropCommissionValue() {
        let self = this;
        if (!this.enabledHealthSecondaryPropCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_SALUD_PRO = item.OriginalHealthPropCommission;
                item.valItemSalPr = false;
            });
        }
    }
    /**Muestra la comisión autorizada original para salud*/
    switchHealthSecondaryAuthCommissionValue() {
        let self = this;
        if (!this.enabledHealthSecondaryAuthCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_SALUD_AUT = item.OriginalHealthAuthCommission;
                item.valItemSal = false;
            });
        }
    }
    /**Muestra la comisión autorizada original para pensión*/
    switchPensionSecondaryAuthCommissionValue() {
        let self = this;
        if (!this.enabledPensionSecondaryAuthCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_PENSION_AUT = item.OriginalPensionAuthCommission;
                item.valItemPen = false;
            });
        }
    }
    /**Muestra la comisión propuesta original para pensión*/
    switchPensionSecondaryPropCommissionValue() {
        let self = this;
        if (!this.enabledPensionSecondaryPropCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_PENSION_PRO = item.OriginalPensionPropCommission;
                item.valItemPenPr = false;
            });
        }
    }

    /**Valida las tasas propuestas */
    areProposedRatesValid(): string[] {
        let errorList = [];

        if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemPenPr == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]')
                }
            });

            this.inputsQuotation.PensionDetailsList.map(element => {
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);

                if (element.WorkersCount <= 0) {
                    element.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
                    if (element.ProposedRate > 0) {
                        errorList.push('No puedes proponer tasas en la categoría ' + element.RiskTypeName + ' de Pensión.')
                    }
                }
                else {
                    if (element.valItemPr == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Pensión]')
                    }
                    if (CommonMethods.isNumber(element.ProposedRate) == false) errorList.push('La tasa propuesta en la categoría ' + element.RiskTypeName + ' de Pensión no es válida.');
                }


                return element;
            });
        }

        if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemSalPr == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]')
                }
            });

            this.inputsQuotation.SaludDetailsList.map(element => {
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);

                if (element.WorkersCount <= 0) {
                    element.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
                    if (element.ProposedRate > 0) {
                        errorList.push('No puedes proponer tasas en la categoría ' + element.RiskTypeName + ' de Salud.')
                    }
                }
                else {
                    if (element.valItemPr == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Salud]')
                    }

                    if (CommonMethods.isNumber(element.ProposedRate) == false) errorList.push('La tasa propuesta en la categoría ' + element.RiskTypeName + ' de Salud no es válida.');
                }

                return element;
            });
        }

        return errorList;
    }

    /**Valida las comisiones autorizadas */
    validateAuthorizedCommmissions(): string[] {
        let self = this;
        let errorList = [];
        this.inputsQuotation.SecondaryBrokerList.map(function (item) {
            if (item.CANAL != '2015000002') {
                if (self.inputsQuotation.SaludDetailsList != null && self.inputsQuotation.SaludDetailsList.length > 0 && self.epsItem.STYPE == 1) {
                    if (CommonMethods.isNumber(item.COMISION_SALUD_AUT) == false) errorList.push('La comisión autorizada de salud de ' + item.COMERCIALIZADOR + ' no es válida.');
                    else if (item.COMISION_SALUD_AUT <= 0 && self.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La comisión autorizada de salud de ' + item.COMERCIALIZADOR + ' debe ser mayor a cero.');
                }
                if (self.inputsQuotation.PensionDetailsList != null && self.inputsQuotation.PensionDetailsList.length > 0) {
                    if (CommonMethods.isNumber(item.COMISION_PENSION_AUT) == false) errorList.push('La comisión autorizada de pensión de ' + item.COMERCIALIZADOR + ' no es válida.');
                    else if (item.COMISION_PENSION_AUT <= 0 && self.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La comisión autorizada de pensión de ' + item.COMERCIALIZADOR + ' debe ser mayor a cero.');
                }
            }
        });
        return errorList;
    }
    /**Valida las primas autorizadas */
    validateAuthorizedPremiums(): string[] {
        let errorList = [];
        if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0 && this.epsItem.STYPE == 1) {
            if (CommonMethods.isNumber(this.inputsQuotation.HealthAuthMinPremium) == false) errorList.push('La prima mínima autorizada de salud no es válida.');
            else if (this.inputsQuotation.HealthAuthMinPremium <= 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La prima mínima autorizada de salud debe ser mayor a cero.');
        }

        if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
            if (CommonMethods.isNumber(this.inputsQuotation.PensionAuthMinPremium) == false) errorList.push('La prima mínima autorizada de pensión no es válida.');
            else if (this.inputsQuotation.PensionAuthMinPremium <= 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) errorList.push('La prima mínima autorizada de pensión debe ser mayor a cero.');
        }

        return errorList;
    }
    /**Valida las tasas autorizadas */
    areAuthorizedRatesValid(): string[] {
        let errorList = [];
        if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemPen == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]')
                }
            });

            this.inputsQuotation.PensionDetailsList.map(element => {
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.AuthorizedRate = CommonMethods.ConvertToReadableNumber(element.AuthorizedRate);
                if (element.WorkersCount > 0 && element.AuthorizedRate == 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) {
                    errorList.push('La tasa autorizada en la categoría ' + element.RiskTypeName + ' de Pensión debe ser mayor a cero.')
                } else {
                    if (element.valItemAu == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Pensión]')
                    }
                };
                return element;
            });
        }
        if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemSal == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]')
                }
            });

            if (!this.template.ins_mapfre) {
                this.inputsQuotation.SaludDetailsList.map(element => {
                    element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
                    element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                    element.AuthorizedRate = CommonMethods.ConvertToReadableNumber(element.AuthorizedRate);
                    if (element.WorkersCount > 0 && element.AuthorizedRate == 0 && this.mainFormGroup.get('status').value == '2' && (this.codProfile == '5' || this.codProfile == '137')) {
                        errorList.push('La tasa autorizada en la categoría ' + element.RiskTypeName + ' de Salud debe ser mayor a cero.');
                    } else {
                        if (element.valItemAu == true) {
                            errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Salud]')
                        }
                    }
                    return element;
                });
            }

        }
        return errorList;
    }

    async getValidateDebt(branchCode, productCode, clientCode, transactionCode): Promise<ValidateDebtReponse> {
        let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = branchCode;
        validateDebtRequest.productCode = productCode;
        validateDebtRequest.clientCode = clientCode;
        validateDebtRequest.transactionCode = transactionCode;
        validateDebtRequest.profileCode = Number(this.perfil);
        validateDebtRequest.nintermed = JSON.parse(localStorage.getItem('currentUser'))['canal'];
        await this.collectionsService.validateDebt(validateDebtRequest).toPromise().then(
            res => {
                this.isLoading = false;
                validateDebtResponse = res;
            },
            err => {
                this.isLoading = false;
            }
        );
        return validateDebtResponse;
    }

    generateAccountStatus(branchCode, productCode, clientCode, documentCode): Promise<any> {
        const genAccountStatusRequest = new GenAccountStatusRequest();
        genAccountStatusRequest.branchCode = branchCode;
        genAccountStatusRequest.productCode = productCode;
        genAccountStatusRequest.clientCode = clientCode;
        genAccountStatusRequest.documentCode = documentCode;
        return swal.queue([{
            title: this.validateDebtResponse.observation,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            text: '¿Desea descargar su Estado de Cuenta?',
            // showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false,
            // showLoaderOnConfirm: true,
            preConfirm: () => {
                // this.isLoading = true;
                return this.createDocument(genAccountStatusRequest)
                    .then(async res => {
                        await this.downloadFile(res.path).then(() => {
                            // this.isLoading = false;
                        });
                    })
                    .catch(() => {
                        swal.insertQueueStep({
                            title: 'Error al descargar el estado de cuenta'
                        });
                    });
            }
        }]);
    }

    generateAccountStatusExterno(branchCode, productCode, clientCode, documentCode, externo): Promise<any> {
        const genAccountStatusRequest = new GenAccountStatusRequest();
        genAccountStatusRequest.branchCode = branchCode;
        genAccountStatusRequest.productCode = productCode;
        genAccountStatusRequest.clientCode = clientCode;
        genAccountStatusRequest.documentCode = documentCode;
        if (externo == 0) {
            return swal.queue([{
                title: this.validateDebtResponse.observation,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
                text: '¿Desea descargar su Estado de Cuenta?',
                // showCloseButton: true,
                showCancelButton: true,
                allowOutsideClick: false,
                // showLoaderOnConfirm: true,
                preConfirm: () => {
                    this.isLoading = true;
                    return this.createDocument(genAccountStatusRequest)
                        .then(async res => {
                            await this.downloadFile(res.path).then(() => {
                                this.isLoading = false;
                            });
                        })
                        .catch(() => {
                            swal.insertQueueStep({
                                title: 'Error al descargar el estado de cuenta'
                            });
                        });
                }
            }]);
        } else {
            return swal.queue([{
                title: this.validateDebtResponse.observation,
                confirmButtonText: 'Aceptar',
                text: 'Para mayor información comunicarse con el Ejecutivo de Comercial',
                // showCloseButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                // showLoaderOnConfirm: true,
                preConfirm: () => {
                    this.isLoading = true;
                }
            }]);
        }

    }

    async createDocument(request: GenAccountStatusRequest): Promise<GenAccountStatusResponse> {
        let genAccountStatusResponse: GenAccountStatusResponse = {};
        await this.collectionsService.generateAccountStatus(request).toPromise().then(
            res => {
                genAccountStatusResponse = res;
            },
            err => {
            }
        );
        return genAccountStatusResponse;
    }

    async dataClient() {
        let data: any = {};
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.inputsQuotation.DocumentTypeId;
        data.P_SIDDOC = this.inputsQuotation.DocumentNumber.toUpperCase().trim();

        await this.clientInformationService.getCliente360(data).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {

                    this.contractingdata = res.EListClient[0];
                    if (this.flagGobiernoIniciado) { //tramite estado
                        this.inputsQuotation.P_NPENDIENTE = res.P_NPENDIENTE;
                    }
                    this.inputsQuotation.P_SISCLIENT_GBD = (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
                    if (res.EListClient[0].EListContactClient.length == 0 && (this.mode == CommonMethods.TIPO_VISTAS.EVALUAR || this.mode == CommonMethods.TIPO_VISTAS.EMITIR || this.mode == CommonMethods.TIPO_VISTAS.EMITIRR || this.mode == CommonMethods.TIPO_VISTAS.RENOVAR)) {
                        this.flagContact = true;
                    }

                    if (res.EListClient[0].EListEmailClient.length == 0 && (this.mode == CommonMethods.TIPO_VISTAS.EVALUAR || this.mode == CommonMethods.TIPO_VISTAS.EMITIR || this.mode == CommonMethods.TIPO_VISTAS.EMITIRR || this.mode == CommonMethods.TIPO_VISTAS.RENOVAR)) {
                        this.flagEmail = true;
                    }
                }
            }
        );
    }

    async ValidateRestricClient(sclient) {
        if (this.template.ins_validateDebt && sclient != '') {
            if (this.codProducto == 2) {
                this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, sclient, 1);
            } else {
                this.validateDebtResponse = await this.getValidateDebt(this.vidaLeyID.nbranch, this.vidaLeyID.id, sclient, 1);
            }
            if (this.validateDebtResponse.lockMark === 2) {
                this.flagDisabledRestric = true;

            }
        }
    }
    async getValidateLock(request: ValidateLockRequest): Promise<ValidateLockReponse> {
        let validateLockRespone: ValidateLockReponse = {};
        await this.collectionsService.validateLock(request).toPromise().then(
            res => {
                validateLockRespone = res;
            },
            err => {
            }
        );
        return validateLockRespone;
    }


    async getInfoExperia(res): Promise<any> {

        if (this.template.ins_historialCreditoQuotation) {
            const data: any = {};
            data.tipoid = res[0].GenericResponse.TIPO_DOCUMENTO == '1' ? '2' : '1';
            data.id = res[0].GenericResponse.NUM_DOCUMENTO;
            data.papellido = res[0].GenericResponse.P_SLASTNAME;
            data.sclient = this.contractingdata.P_SCLIENT;
            data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
            await this.clientInformationService.invokeServiceExperia(data).toPromise().then(
                res => {
                    this.creditHistory = {};
                    this.creditHistory.nflag = res.nflag;
                    this.creditHistory.sdescript = res.sdescript;
                }
            );
        }
    }

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        switch (modalName) {
            case 'add-contact':
                modalRef = this.modalService.open(
                    AddContactComponent, {
                    size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false
                });
                modalRef.componentInstance.reference = modalRef;
                typeContact.P_NIDDOC_TYPE = this.inputsQuotation.DocumentTypeId;
                typeContact.P_SIDDOC = this.inputsQuotation.DocumentNumber;
                modalRef.componentInstance.typeContact = typeContact;
                modalRef.componentInstance.listaContactos = this.contactList;
                modalRef.componentInstance.itemContacto = null;
                break;
        }
    }

    // Section Contacto
    editContact(row) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        let itemContacto: any = {};
        modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        typeContact.P_NIDDOC_TYPE = this.inputsQuotation.DocumentTypeId;
        typeContact.P_SIDDOC = this.inputsQuotation.DocumentNumber;
        modalRef.componentInstance.typeContact = typeContact;
        this.contactList.map(function (dato) {
            if (dato.P_NROW === row) {
                itemContacto = dato;
            }
        });
        modalRef.componentInstance.itemContacto = itemContacto;
        modalRef.componentInstance.listaContactos = this.contactList;
    }

    deleteContact(row) {
        swal.fire({
            title: 'Eliminar Contacto',
            text: '¿Estás seguro que deseas eliminar esta contacto?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.contactList.splice(row, 1);
                }
            });
    }

    getDate() {
        return new Date();
    }
    async base64ToArrayBuffer(base64): Promise<any> {
        let binaryString = atob(base64);
        let binaryLen = binaryString.length;
        let bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            let ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    async saveByteArray(reportName, byte): Promise<any> {
        let blob = new Blob([byte], { type: 'application/excel' });
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        let fileName = reportName;
        link.download = fileName;
        link.click();
    };

    async downloadFileBase64(stream: string, nameFile: string): Promise<any> {  //Descargar archivos de trama
        let sampleArr = this.base64ToArrayBuffer(stream);
        this.saveByteArray(nameFile + '.xls', sampleArr);
    }
    obtenerBlobFromBase64(b64Data: string, contentType: string) {
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


    async getTramaFile(item: any): Promise<any> {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = item.linea;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        return this.collectionsService.getTramaFile(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {
                    const nameFile: string = item.desMov + '_' + this.quotationNumber;
                    const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                    FileSaver.saveAs(file);
                }
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }


    async formaPagoElegido() {
        if (this.inputsQuotation.poliza.pagoElegido === 'efectivo') {
            this.router.navigate(['/extranet/policy/pago-efectivo']);
        }

        if (this.inputsQuotation.poliza.pagoElegido === 'voucher') {
            if (!!this.inputsQuotation.file) {

                if (!!this.inputsQuotation.actualizarCotizacion) {

                    const params = new FormData();

                    this.inputsQuotation.files.forEach(function (file) {
                        params.append(file.name, file, file.name);
                    });

                    if (!!this.inputsQuotation.file) {
                        params.append(
                            this.inputsQuotation.file.name,
                            this.inputsQuotation.file,
                            this.inputsQuotation.file.name
                        );
                    }

                    this.inputsQuotation.actualizarCotizacion.pagoElegido = 'voucher';
                    params.append('statusChangeData', JSON.stringify(this.inputsQuotation.actualizarCotizacion));

                    swal.fire({
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
                                this.quotationService.changeStatusVL(params).subscribe(
                                    (res) => {
                                        this.isLoading = false;
                                        if (Number(res.StatusCode) === 0) {
                                            swal.fire('Información', 'Operación exitosa.', 'success');
                                            this.router.navigate(['/extranet/request-status']);
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
        if (this.inputsQuotation.poliza.pagoElegido === 'directo') {
            this.FlagPagoNC = JSON.parse(localStorage.getItem('creditdata'));//AVS - PROY NC
            this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));

            if (this.emitirCertificadoTecnica) {
                const myFormData: FormData = new FormData();
                this.inputsQuotation.paramsTrx[0].P_SPAGO_ELEGIDO = 'directo';
                myFormData.append('objetoCE', JSON.stringify(this.inputsQuotation.paramsTrx));
                this.emitirCertificadoEstado(myFormData)
            }
            else if (this.emitirCertificadoOperaciones || this.emitirPolizaOperaciones || this.flagGobiernoIniciado) {
                await this.policyService.getPolicyEmitCab(
                    this.quotationNumber, '1',
                    JSON.parse(localStorage.getItem('currentUser'))['id']
                ).toPromise().then(async (res: any) => {
                    if (!!res.GenericResponse &&
                        res.GenericResponse.COD_ERR == 0) {
                        await this.policyService.getPolicyEmitDet(
                            this.quotationNumber,
                            JSON.parse(localStorage.getItem('currentUser'))['id'])
                            .toPromise().then(

                                async resDet => {
                                    const params = [
                                        {
                                            P_NID_COTIZACION: this.quotationNumber,
                                            P_NID_PROC: res.GenericResponse.NID_PROC,
                                            P_NPRODUCT: 1,
                                            P_NBRANCH: 73,
                                            P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                            P_DSTARTDATE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)),
                                            P_DEXPIRDAT: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_COTIZACION_VL)),
                                            P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                            P_SFLAG_FAC_ANT: 1,
                                            P_FACT_MES_VENCIDO: 0,
                                            P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                            P_IGV: resDet[0].NSUM_IGV,
                                            P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                            P_NAMO_AFEC: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[0].AmountAuthorized : 0,
                                            P_NIVA: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[1].AmountAuthorized : 0,
                                            P_NAMOUNT: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[2].AmountAuthorized : 0,

                                            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],

                                            P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                            P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
                                            FlagCambioFecha: 0,
                                            FlagPolMat: 1,
                                            flagEmitCertificado: 0,
                                            P_SPAGO_ELEGIDO: 'directo'

                                        }
                                    ];
                                    this.SaveEmitCerti(params);
                                })
                    }
                })
            }
            else if (this.codProducto == 3 && this.FlagPagoNC != null && this.flagBotonNC == true && this.stran == 'EM') { //AVS PRY NC - EMISION DE EVALUACION CON NC
                this.isLoading = true;
                // await this.InsertPayNCTEMP();
                this.inputsQuotation.paramsTrx.P_NCOT_NC = 1;

                const myFormData: FormData = new FormData();
                let savedPolicyList = this.inputsQuotation.paramsTrx;

                myFormData.append('objeto', JSON.stringify(savedPolicyList));
                myFormData.append('notaCredito', JSON.stringify(JSON.parse(localStorage.getItem('creditdata'))));

                this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
                    if (res.P_COD_ERR == 0) {
                        let policyVLey = 0;
                        let constancia = 0;

                        policyVLey = Number(res.P_POL_VLEY);
                        constancia = Number(res.P_NCONSTANCIA);
                        if (policyVLey > 0) {
                            this.isLoading = false;
                            swal.fire({
                                title: 'Información',
                                text: 'Se ha generado correctamente la póliza de Vida Ley N° ' + res.P_POL_VLEY,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                                .then((result) => {
                                    if (result.value) {
                                        this.router.navigate(['/broker/policy-transactions-all']);
                                    }
                                });
                        }
                    } else {
                        this.isLoading = false;
                        swal.fire({
                            title: 'Información',
                            text: res.P_MESSAGE,
                            icon: 'error',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                            .then((result) => {
                                if (result.value) {
                                    this.clearInsert();
                                }
                            });
                    }
                });
            } else if ((this.stran == 'IN' || this.stran == 'RE' || this.stran == 'DE') && this.codProducto == 3 && this.flagBotonNC == true && this.FlagPagoNC != null) { //AVS PRY NC - INCLUSION O RENOVACION DE EVALUACION CON NC
                this.isLoading = true;
                // await this.InsertPayNCTEMP();
                this.inputsQuotation.paramsTrx.P_NCOT_NC = 1;

                if (this.stran == 'IN') {
                    this.mode = CommonMethods.TIPO_VISTAS.INCLUDE;
                } else if (this.stran == 'RE') {
                    this.mode = CommonMethods.TIPO_VISTAS.RENEW;
                }
                const msgIncRenov = this.mode === CommonMethods.TIPO_VISTAS.INCLUDE ? 'la Inclusión' : this.mode == CommonMethods.TIPO_VISTAS.ENDOSO ? 'el endoso' : this.sAbrTran == 'DE' ? 'la Declaración' : 'la Renovación';
                const params: FormData = new FormData();

                if (this.files.length > 0) {
                    this.files.forEach(file => {
                        params.append('adjuntos', file, file.name);
                    });
                }

                this.inputsQuotation.poliza.pagoElegido = 'directo';
                params.append('transaccionProtecta', JSON.stringify(this.inputsQuotation.paramsTrx));
                params.append('transaccionMapfre', JSON.stringify(null));
                params.append('notaCredito', JSON.stringify(JSON.parse(localStorage.getItem('creditdata'))));

                this.policyService.transactionPolicy(params).subscribe(
                    res => {
                        this.isLoading = false;
                        if (res.P_COD_ERR == 0) {
                            if (!!this.inputsQuotation.numeroCotizacion) {
                                this.isLoading = false;
                                swal.fire('Información', 'Se ha generado correctamente ' + msgIncRenov + ' de la póliza N° ' + this.inputsQuotation.paramsTrx.P_POLICY, 'success');
                                this.router.navigate(['/extranet/policy-transactions-all']);
                            }
                        } else {
                            this.isLoading = false;
                            swal.fire({
                                title: 'Información',
                                text: res.P_MESSAGE,
                                icon: 'error',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            }).then((result) => {
                                if (result.value) {
                                    this.router.navigate(['/extranet/policy-transactions-all']);
                                }
                            });
                        }
                    },
                    err => {
                        this.isLoading = false;
                    }
                );
            }
        }

        if (this.inputsQuotation.poliza.pagoElegido === 'omitir') {
            swal.fire({
                title: 'Información',
                text: 'Se ha generado correctamente la cotización N° ' +
                    this.inputsQuotation.numeroCotizacion + ', podrás emitirlo en cualquier otro momento.',
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            })
                .then((result) => {
                    if (result.value) {
                        this.router.navigate(['/broker/request-status']);
                    }
                });
        }
    }

    emitirTrx(savedPolicyList) {
        const myFormData: FormData = new FormData();

        savedPolicyList[0].P_SPAGO_ELEGIDO = 'directo';
        myFormData.append('objeto', JSON.stringify(savedPolicyList));

        // swal.fire({
        //   title: 'Información',
        //   text: '¿Desea realizar la emisión?',
        //   type: 'question',
        //   showCancelButton: true,
        //   confirmButtonText: 'Generar',
        //   allowOutsideClick: false,
        //   cancelButtonText: 'Cancelar'

        // }).then((result) => {
        //   if (result.value) {
        this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
            this.isLoading = false;
            if (res.P_COD_ERR == 0) {
                let policyVLey = 0;
                let constancia = 0;

                policyVLey = Number(res.P_POL_VLEY);
                constancia = Number(res.P_NCONSTANCIA);

                if (policyVLey > 0) {
                    swal.fire({
                        title: 'Información',
                        text: 'Se ha generado correctamente la póliza de Vida Ley N° ' + policyVLey,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                        .then((result) => {
                            if (result.value) {
                                this.router.navigate(['/extranet/policy-transactions-all']);
                            }
                        });
                }
            } else if (res.P_COD_ERR == 4) {
                swal.fire({
                    title: 'Información',
                    text: res.P_MESSAGE,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.value) {
                        this.router.navigate(['/extranet/request-status']);
                    }
                });
            } else {
                swal.fire({
                    title: 'Información',
                    text: res.P_MESSAGE,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
            }
        });
        // }
        // });

    }

    renovacionTrx(renovacion) {
        const myFormData: FormData = new FormData();

        renovacion.P_SPAGO_ELEGIDO = 'directo';
        myFormData.append('transaccionProtecta', JSON.stringify(renovacion));

        this.policyService.transactionPolicy(myFormData).subscribe(
            resJob => {
                this.isLoading = false;
                if (resJob.P_COD_ERR == 0) {
                    if (this.inputsQuotation.tipoTransaccion == 2) {
                        swal.fire('Información', 'Se ha generado correctamente la inclusión de la póliza N° ' + this.policyNumber, 'success');
                    }

                    if (this.inputsQuotation.tipoTransaccion == 4) {
                        if (this.sAbrTran == 'DE') {
                            swal.fire('Información', 'Se ha generado correctamente la declaración de la póliza N° ' + this.policyNumber, 'success');
                        } else {
                            swal.fire('Información', 'Se ha generado correctamente la renovación de la póliza N° ' + this.policyNumber, 'success');
                        }
                    }
                    if (this.inputsQuotation.tipoTransaccion == 8) {
                        swal.fire('Información', 'Se ha generado correctamente el endoso de la póliza N° ' + this.policyNumber, 'success');
                    }
                    if (this.inputsQuotation.tipoTransaccion == 3) {
                        swal.fire('Información', 'Se ha generado correctamente la exclusión de la póliza N° ' + this.policyNumber, 'success');
                    }
                    this.router.navigate(['/extranet/policy-transactions-all']);
                } else if (resJob.P_COD_ERR == 2) {
                    swal.fire({
                        title: 'Información',
                        text: resJob.P_MESSAGE,
                        icon: 'info',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            if (this.codProducto == 2) {
                                this.router.navigate(['/extranet/policy-transactions']);
                            } else {
                                this.router.navigate(['/extranet/policy-transactions-all']);
                            }
                        }
                    });
                } else if (resJob.P_COD_ERR == 4) {
                    swal.fire({
                        title: 'Información',
                        text: resJob.P_MESSAGE,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            this.router.navigate(['/extranet/request-status']);
                        }
                    });
                } else {
                    swal.fire({
                        title: 'Información',
                        text: resJob.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    });
                }
            },
            err => {
            }
        );
    }
    //ini - marcos silverio
    seeCovers(nrocotizacion) {
        const modalRef = this.modalService.open(QuotationCoverComponent,
            { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef; //Enviamos la referencia al modal
        modalRef.componentInstance.quotationNumber = this.quotationNumber; //Enviamos el número de cotización
    }
    //fin - marcos silverio
    async ValidateRetroactivity(operacion: number = 1) {
        //let tran = '';
        this.retroVal = 0;
        let FlagCambioFecha = 0;
        if (this.typeTran != '' && this.typeTran != undefined) {
            this.stran = this.typeTran.toString().substring(0, 2).toUpperCase();
        }
        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION) {
            FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.inicioVigencia.setHours(0, 0, 0, 0) ? 1 : 0;
        } else {
            FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        }
        const response: any = {};

        const dataQuotation: any = {};
        dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
        dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.NumeroCotizacion = this.quotationNumber;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
        dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
        dataQuotation.TrxCode = this.stran;
        dataQuotation.RetOP = operacion;
        dataQuotation.FlagCambioFecha = FlagCambioFecha;
        const myFormData: FormData = new FormData();
        myFormData.append('objeto', JSON.stringify(dataQuotation));
        await this.quotationService.ValidateRetroactivity(myFormData).toPromise().then(
            res => {
                response.P_SAPROBADO = res.P_SAPROBADO;
                response.P_NCODE = res.P_NCODE;
                response.P_SMESSAGE = res.P_SMESSAGE;
            }
        );
        return response;
    }
    getStartAseInclude(fecha: Date): Date {
        let fechad = new Date(fecha);

        if (this.inputsQuotation.frecuenciaPago == "5") {
            fechad.setMonth(fechad.getMonth() - 1);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }
        if (this.inputsQuotation.frecuenciaPago == "4") {
            fechad.setMonth(fechad.getMonth() - 2);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }

        if (this.inputsQuotation.frecuenciaPago == "3") {
            fechad.setMonth(fechad.getMonth() - 3);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }

        if (this.inputsQuotation.frecuenciaPago == "2") {
            fechad.setMonth(fechad.getMonth() - 6);
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }

        if (this.inputsQuotation.frecuenciaPago == "1") {
            fechad.setFullYear(fechad.getFullYear() - 1)
            fechad.setDate(fechad.getDate() + this.variable.var_restarDias);
            return new Date(fechad);
        }
    }
    /* Operacion Endoso */

    async endosarPoliza() {
        let errorList: any = [];

        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }

        if (errorList == null || errorList.length == 0) {
            if ((this.buttonName == 'Endosar' && this.mode == CommonMethods.TIPO_VISTAS.ENDOSAR) || this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR) {
                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processEndoso();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processEndoso();
                    }
                } else {
                    this.processEndoso();
                }
            } else {
                this.AddStatusChange();
            }

        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }
    processEndoso() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : '¿Desea realizar el endoso de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Endosar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                this.objetoTrx();
            }
        });
    }
    /* * Operacion Endoso * */
    async GetFechaFin(fecha, freq) {
        const response: any = {};
        await this.quotationService.GetFechaFin(fecha, freq).toPromise().then(
            res => {
                response.FechaExp = res.FechaExp;
            }
        );
        return response;
    }

    async excluirPoliza() {
        const errorList: any = [];
        if (this.flagContact && this.template.ins_addContact) {
            if (this.contactList.length === 0) {
                errorList.push(this.variable.var_contactZero);
            }
        }

        if (this.template.ins_email) {
            if (this.inputsQuotation.P_SE_MAIL === '') {
                errorList.push('Debe ingresar un correo electrónico para la factura.');
            } else {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                    errorList.push('El correo electrónico es inválido.');
                }
            }
        }
        if (errorList == null || errorList.length == 0) {
            if ((this.buttonName == 'Excluir' && this.mode == CommonMethods.TIPO_VISTAS.EXCLUIR) || this.mode == CommonMethods.TIPO_VISTAS.RECOTIZAR) {

                if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    this.contractingdata.P_TipOper = 'INS';
                    this.contractingdata.P_NCLIENT_SEG = -1;

                    if (this.flagContact && this.template.ins_addContact) {
                        this.contractingdata.EListContactClient = [];
                        if (this.contactList.length > 0) {
                            this.contactList.forEach(contact => {
                                if (contact.P_NTIPCONT == 0) {
                                    contact.P_NTIPCONT = 99;
                                }
                                if (contact.P_NIDDOC_TYPE == '0') {
                                    contact.P_NIDDOC_TYPE = null;
                                    contact.P_SIDDOC = null;
                                }
                            });
                            this.contractingdata.EListContactClient = this.contactList;
                        }
                    } else {
                        this.contractingdata.EListContactClient = null;
                    }

                    if (this.flagEmail && this.template.ins_email) {
                        this.contractingdata.EListEmailClient = [];
                        const contractingEmail: any = {};
                        contractingEmail.P_CLASS = '';
                        contractingEmail.P_DESTICORREO = 'Correo Personal';
                        contractingEmail.P_NROW = 1;
                        contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL;
                        contractingEmail.P_SORIGEN = 'SCTR';
                        contractingEmail.P_SRECTYPE = '4';
                        contractingEmail.P_TipOper = '';
                        this.contractingdata.EListEmailClient.push(contractingEmail);
                    } else {
                        this.contractingdata.EListEmailClient = null;
                    }

                    if ((this.flagContact && this.template.ins_addContact) || (this.flagEmail && this.template.ins_email)) {
                        const response: any = await this.updateContracting();
                        if (response.code == '0') {
                            this.processExclude();
                        } else {
                            swal.fire('Información', response.message, 'error');
                            return;
                        }
                    } else {
                        this.processExclude();
                    }
                } else {
                    this.processExclude();
                }
            } else {
                this.AddStatusChange();
            }

        } else {
            swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processExclude() {
        const pregunta = this.procesarPolizaOperaciones ? this.questionTextEstado : '¿Desea realizar la exclusión de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Excluir',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                this.objetoTrx();
            }
        });
    }

    /* Gestión de trámite EHH */
    searchTrackingTransact() {
        let data: any = {};
        data.P_NID_TRAMITE = this.transactNumber;
        data.P_NID_COTIZACION = this.quotationNumber;

        this.transactService.GetHistTransact(data).subscribe(
            res => {
                this.isLoading = false;
                this.statusChangeList = res;
                this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                this.totalItems = this.statusChangeList.length;
                this.GetInfoTransact();
                if (this.statusChangeList.length == 0) {
                    this.statusChangeList = [];
                }
                //INI CAMBIO COMISION VL
                if (this.isTransact) {
                    this.statusChangeList.forEach(e => {
                        if (e.LINEA == 1) {
                            console.log(e.SCOMMENT);
                            let Comentario: string = e.SCOMMENT == null ? '' : e.SCOMMENT;
                            let Comentarios: string[];
                            if (Comentario != null) {
                                Comentarios = Comentario.split("/");
                            }

                            this.mainFormGroup.controls.comment.setValue(e.SCOMMENT == null ? '' : Comentarios[Comentarios.length - 1]);
                        }
                    });
                }
                //FIN CAMBIO COMISION VL
            },
            err => {
                swal.fire('Información', this.genericServerErrorMessage, 'error');
            }
        );
    }

    getUsersList() {
        let data: any = {};
        data.P_NBRANCH = this.vidaLeyID.nbranch;
        data.P_NPRODUCT = this.vidaLeyID.id;
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.transactService.GetUsersTransact(data).subscribe(
            res => {
                this.usersList = res;
                //this.inputsQuotation.UserAssigned = this.userAssigned == 0 || this.userAssigned == undefined ? '' : this.userAssigned;
                let existsUser = false;
                this.usersList.forEach(element => {
                    if (element.NIDUSER == this.userAssigned) {
                        existsUser = true;
                    }
                });
                this.inputsQuotation.UserAssigned = existsUser ? this.userAssigned : (this.usersList.length > 0 ? this.usersList[0].NIDUSER : undefined);
            },
            error => {

            }
        );
    }

    async AsignarTramite() {
        if (this.buttonName == "Rechazar") {
            this.DerivarTramite();
        } else {
            let msg = '';
            if (this.inputsQuotation.UserAssigned == '') {
                msg = 'Seleccione un usuario por favor.';
            }

            if (msg != '') {
                await swal.fire('Error', msg, 'error');
                return
            }

            swal.fire({
                title: 'Información',
                text: "¿Desea asignar el trámite?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Asignar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.isLoading = true;
                    let dataQuotation: any = {};
                    const data: FormData = new FormData(); /* Para los archivos EH */
                    this.files.forEach(file => {
                        data.append(file.name, file);
                    });

                    dataQuotation.P_NID_TRAMITE = this.transactNumber;
                    dataQuotation.P_NID_COTIZACION = this.quotationNumber;
                    dataQuotation.P_NUSERCODE_ASSIGNOR = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    dataQuotation.P_NUSERCODE = this.inputsQuotation.UserAssigned;
                    dataQuotation.P_NSTATUS_TRA = this.isReasignar ? 4 : 3;
                    dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');

                    data.append('objeto', JSON.stringify(dataQuotation));

                    this.transactService.AsignarTransact(data).subscribe(
                        res => {
                            if (res.P_COD_ERR == 0) {
                                this.isLoading = false;
                                swal.fire('Información', 'Se asignó el trámite correctamente al usuario', 'success');
                                this.router.navigate(['/extranet/tray-transact/2']);
                            } else {
                                this.isLoading = false;
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            }
                        },
                        err => {
                            this.isLoading = false;
                            swal.fire('Información', 'Hubo un error con el servidor', 'error');
                        }
                    );
                }
            });
        }
    }

    ContinuarTramite() {
        if (this.mode == CommonMethods.TIPO_VISTAS.ENVIAR && this.enviarPolizaMatrizTramiteEstado) {
            this.EmisionPolizaMatrizTEstado();
        } else if (this.buttonName == "Rechazar") {
            this.DerivarTramite();
        } else if (this.buttonName == "Enviar") {
            this.EnviarTramite();
        } else {
            this.IniciarTramite();
        }
    }
    changeStatusTransact() {
        this.flagRechazoPol = false;
        if (this.mainFormGroup.controls.status.value == 11) {
            this.buttonName = "Rechazar";
            this.flagRechazoPol = true;
        } else if (this.mainFormGroup.controls.status.value == 2) {
            if (this.mode == CommonMethods.TIPO_VISTAS.ASIGNAR) {
                this.buttonName = "Asignar";
            } else {
                if (this.mode == CommonMethods.TIPO_VISTAS.EVALUAR_TRAMITE) {
                    this.buttonName = 'Iniciar Trámite';
                } else {
                    if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT || this.emitirPolizaOperaciones || this.flagGobiernoIniciado || this.procesarPolizaOperaciones) {
                        this.buttonName = 'Emitir';
                    } else {
                        this.buttonName = "Continuar";
                    }
                }
            }
        }
    }

    changeStatusTransactEstado(statusTransact) {
        this.flagRechazoPol = false;
        this.statusTransact = statusTransact.target.value;
        if (statusTransact.target.value == "6") {
            this.buttonName = "Rechazar";
            this.flagRechazoPol = true;
        } else if (statusTransact.target.value == "2") {
            if (this.mode == CommonMethods.TIPO_VISTAS.ASIGNAR) {
                this.buttonName = "Asignar";
            } else {
                if (this.mode == CommonMethods.TIPO_VISTAS.EVALUAR_TRAMITE) {
                    this.buttonName = 'Iniciar Trámite';
                } else if (this.mode == CommonMethods.TIPO_VISTAS.ENVIAR) {
                    this.buttonName = 'Enviar';
                } else {
                    if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EMISION_CERT || this.emitirPolizaOperaciones || this.flagGobiernoIniciado || this.procesarPolizaOperaciones || this.emitirPolizaMatrizTramiteEstado) {
                        this.buttonName = 'Emitir';
                    } else {
                        this.buttonName = "Continuar";
                    }
                }
            }
        } else if (statusTransact.target.value == "25") {
            this.buttonName = "Reevaluar";
        }
    }
    changeMotivoRechazo(motivo) {
        this.rechazoMotivoID = motivo.COD_MOTIVO;
    }

    async motivorechazoTramite() {
        await this.transactService.getMotivRechazoTransact().toPromise().then(
            (res: any) => {
                this.rechazoMotivoList = res;
            }
        );
    }


    async DerivarTramite() {
        if ((this.flagGobiernoIniciado && this.flagRechazoPol) || (this.emitirPolizaMatrizTramiteEstado && this.flagRechazoPol)) {
            let msg = "";

            if (this.rechazoMotivoID == null || this.rechazoMotivoID == "") {
                msg += 'Debe seleccionar el motivo de rechazo. <br />'
            }

            if (this.mainFormGroup.controls.comment.value == "") {
                msg += "Ingrese un comentario por favor."
            }

            if (msg != "") {
                await swal.fire('Error', msg, 'error');
                return;
            }
        }


        swal.fire({
            title: 'Información',
            text: "¿Desea rechazar el trámite?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Rechazar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                let dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.quotationNumber;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_NSTATUS_TRA = 6;
                dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');
                dataQuotation.P_NIDMOTIVO_RECHAZO = this.rechazoMotivoID; // motivo de rechazo tramite
                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.InsertDerivarTransact(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.isLoading = false;
                            swal.fire('Información', 'Se rechazó el trámite correctamente al usuario', 'success');
                            this.router.navigate(['/extranet/tray-transact/2']);
                        } else {
                            this.isLoading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.isLoading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    IniciarTramite() {


        swal.fire({
            title: 'Información',
            text: this.mode == CommonMethods.TIPO_VISTAS.CONTINUAR ? "¿Desea continuar trabajando el trámite?" : "¿Desea empezar a trabajar el trámite?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Continuar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                let dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.quotationNumber;
                dataQuotation.P_NPERFIL = this.codProfile;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_NSTATUS_TRA = this.mode == CommonMethods.TIPO_VISTAS.CONTINUAR ? 17 : 11;
                dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');

                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.InsertHistTransact(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.isLoading = false;
                            this.moveTransaction()
                        } else {
                            this.isLoading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.isLoading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    SetTransac() {
        try {
            switch (this.typeTran) {
                case "Inclusión": {
                    this.nTransac = 2;
                    this.sAbrTran = "IN";
                    break;
                }
                case "Declaración": {
                    this.nTransac = 4;
                    this.sAbrTran = "DE";
                    if (this.mode == CommonMethods.TIPO_VISTAS.RENOVAR) {
                        this.TitleOperacion = "Declaración";
                    }
                    break;
                }
                case "Renovación": {
                    this.nTransac = 4;
                    this.sAbrTran = "RE";
                    break;
                }
                case "Exclusión": {
                    this.nTransac = 3;
                    this.sAbrTran = "EX";
                    break;
                }
                case "Endoso": {
                    this.nTransac = 8;
                    this.sAbrTran = "EN";
                    break;
                }
                case "Broker": {
                    this.nTransac = 13;
                    this.sAbrTran = "BR";
                    break;
                }
                case "Emisión de certificados": {
                    this.nTransac = 14;
                    this.sAbrTran = "EC";
                    break;
                }
                default:
                    this.nTransac = 1;
                    this.sAbrTran = "EM";
                    break;
            }
        } catch (error) {
            this.nTransac = 1;
            this.sAbrTran = "EM";
        }
    }
    moveTransaction() {
        switch (this.nTransac) {
            case 1: this.GetIniciarEmisionPolEstado();
                break;
            case 2: // Incluir
                this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
                break;
            case 3: // Exluir
                this.router.navigate(['/extranet/policy/transaction/exclude'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
                break;
            case 4: // Renovar
                this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
                break;
            case 8: // Endoso
                this.router.navigate(['/extranet/policy/transaction/endosar'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
                break;
            case 13: // Broker
                this.router.navigate(['/extranet/policy/transaction/broker'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
                break;
            case 14: // Emisión de certificado
                //this.GetInfoTransact();
                //this.GetIninicarEmisionCert();
                this.router.navigate(['/extranet/policy/transaction/certificate'], { queryParams: { nroCotizacion: this.quotationNumber, nroPoliza: this.policyNumber } });
                break;

        }
    }

    GetIniciarEmisionPolEstado() {
        let data: any = {};
        data.QuotationNumber = this.quotationNumber;
        data.ProductId = this.productoId;
        data.Status = 'INICIADO';
        data.Mode = 'Iniciado';
        data.From = 'transact2';
        data.PolicyNumber = this.policyNumber;
        data.TypeTransac = "Emisión";
        data.TransactNumber = this.transactNumber;
        data.UserCodeAssigned = this.userAssigned;
        data.SMAIL_EJECCOM = this.quotationDataTra.SMAIL_EJECCOM;
        data.APROB_CLI = this.flagAprobCli;
        data.SPOL_MATRIZ = this.flagGobiernoMatriz;
        data.SPOL_ESTADO = this.flagGobiernoEstado;
        sessionStorage.removeItem('cs-quotation');
        sessionStorage.setItem('cs-quotation', JSON.stringify(data));
        this.flagGobiernoEstado = true;
        this.isPolizaMatriz = this.flagGobiernoMatriz;
        this.isTransact = true;
        //this.emitirCertificadoOperaciones =true;
        this.ngOnInit()
    }

    GetIninicarEmisionCert() {
        let data: any = {};
        data.QuotationNumber = this.quotationNumber;
        data.ProductId = this.productoId;
        data.Status = 'INICIADO';
        data.Mode = 'Iniciado';
        data.From = 'transact2';
        data.PolicyNumber = this.policyNumber;
        data.TypeTransac = "Emisión de certificados";
        data.TransactNumber = this.transactNumber;
        data.UserCodeAssigned = this.userAssigned;
        sessionStorage.removeItem('cs-quotation');
        sessionStorage.setItem('cs-quotation', JSON.stringify(data));
        this.isPolizaMatriz = true;
        this.isTransact = false;
        this.emitirCertificadoOperaciones = true;
        this.ngOnInit()

    }
    GetInfoTransact(setInfo: boolean = true) {
        let data: any = {};
        data.P_NID_TRAMITE = this.transactNumber;
        data.P_NID_COTIZACION = this.quotationNumber;
        data.P_NPRODUCT = this.vidaLeyID.id;
        data.P_NBRANCH = this.vidaLeyID.nbranch;

        this.transactService.GetInfoTransact(data).subscribe(
            res => {
                this.infoTransact = res;
                if (setInfo) {
                    this.SetInfoTransact();
                }
            },
            error => {

            }
        );
    }
    async SetInfoTransact() {
        switch (this.nTransac) {
            case 2: {
                this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
                if (this.flagGobiernoEstado) {
                    this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                }
                break;
            }
            case 3: {
                this.inputsQuotation.FechaAnulacion = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.FECHA_EXCLUSION) : new Date(this.infoTransact.DFEC_TRANSAC);
                this.inputsQuotation.primaCobrada = this.infoTransact.SDEVOLPRI == 1 ? true : false;
                if (this.flagGobiernoEstado) {
                    this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                }
                break;
            }
            case 4: {
                if (this.infoTransact.NFLAG_UPD == 1 || this.infoTransact.NFLAG_UPD == 2) {   //Mejoras CIIU INI
                    this.inputsQuotation.EconomicActivityId = this.infoTransact.SCOD_CIUU;
                    this.inputsQuotation.EconomicActivityName = this.infoTransact.SDESC_CIUU;
                } //Mejoras CIIU FIN
                if (this.sAbrTran != 'DE') {
                    this.inputsQuotation.tipoRenovacion = this.infoTransact.NTIP_RENOV;
                    this.inputsQuotation.frecuenciaPago = this.infoTransact.NPAYFREQ;
                    this.inputsQuotation.desTipoRenovacion = this.setDesRenovFreq(1, this.infoTransact.NTIP_RENOV);
                    this.inputsQuotation.desFrecuenciaPago = this.setDesRenovFreq(2, this.infoTransact.NPAYFREQ);

                    this.inputsQuotation.inicioVigencia = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_COTIZACION_VL) : new Date(this.infoTransact.DFEC_TRANSAC);
                    let res: any = await this.GetFechaFin(CommonMethods.formatDate(this.inputsQuotation.inicioVigencia), this.inputsQuotation.tipoRenovacion);
                    if (res.FechaExp != "")
                        this.inputsQuotation.finVigencia = new Date(res.FechaExp);

                    this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
                    let res1: any = await this.GetFechaFin(CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg), this.inputsQuotation.frecuenciaPago);
                    if (res.FechaExp != "")
                        this.inputsQuotation.FDateFinAseg = new Date(res1.FechaExp);

                    if (this.flagGobiernoEstado) {
                        this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                    }

                } else {
                    this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
                    let res: any = await this.GetFechaFin(CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg), this.inputsQuotation.frecuenciaPago);
                    if (res.FechaExp != "")
                        this.inputsQuotation.FDateFinAseg = new Date(res.FechaExp);

                    if (this.flagGobiernoEstado) {
                        this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                    }
                }
                break;
            }
            case 8: {
                this.inputsQuotation.FDateIniAseg = this.procesarPolizaOperaciones ? new Date(this.dataPolizaEstado.EFECTO_ASEGURADOS) : new Date(this.infoTransact.DFEC_TRANSAC);
                this.inputsQuotation.TYPE_ENDOSO = this.infoTransact.NTYPENDOSO;
                if (this.flagGobiernoEstado) {
                    this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                }
                break;
            }
            case 13: {
                this.inputsQuotation.FDateEffectBroker = new Date(this.infoTransact.DFEC_TRANSAC);
                this.SearchContrator();
                break;
            }
            case 1: {
                if (this.flagGobiernoEstado) {
                    this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                }
                break;
            }

            case 14: {
                if (this.flagGobiernoEstado) {
                    this.inputsQuotation.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
                }
                break;
            }
        }
    }

    setDesRenovFreq(tipo, id) {
        let descriptFreqRenov = '';
        switch (id) {
            case 1: descriptFreqRenov = 'ANUAL'; break;
            case 2: descriptFreqRenov = 'Semestral'; break;
            case 3: descriptFreqRenov = 'Trimestral'; break;
            case 4: descriptFreqRenov = 'Bimestral'; break;
            case 5: descriptFreqRenov = 'Mensual'; break;
            case 6: descriptFreqRenov = 'Especial'; break;
            case 7: descriptFreqRenov = 'Especial'; break;
            default: {
                if (tipo == 1) {
                    descriptFreqRenov = this.inputsQuotation.desTipoRenovacion;
                } else {
                    descriptFreqRenov = this.inputsQuotation.desFrecuenciaPago;
                }
                break;
            }
        }
        return descriptFreqRenov;
    }
    //tipo endoso
    getTypeEndoso() {
        this.policyService.GetTypeEndoso().toPromise().then(
            (res: any) => {
                this.tipoEndoso = res;
            });
    }
    SearchContrator() {
        let searchBroker: any = {};
        searchBroker.P_IS_AGENCY = '0';
        searchBroker.P_NTIPO_BUSQUEDA = 1;
        searchBroker.P_NTIPO_DOC = (this.infoTransact.SCLIENT_RUC.trim().length == 11) ? 1 : 2;;
        searchBroker.P_NNUM_DOC = this.infoTransact.SCLIENT_RUC.trim();
        searchBroker.P_SNOMBRE = "";
        searchBroker.P_SAP_PATERNO = "";
        searchBroker.P_SAP_MATERNO = "";
        searchBroker.P_SNOMBRE_LEGAL = "";

        this.quotationService.searchBroker(searchBroker).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    if (res.listBroker != null && res.listBroker.length > 0) {
                        this.inputsQuotation.SecondaryBrokerList = [];
                        res.listBroker.forEach(item => {
                            item.DES_DOC_COMER = item.STYPCLIENTDOC;
                            item.DOC_COMER = item.NNUMDOC;
                            item.COMERCIALIZADOR = item.RAZON_SOCIAL;
                            item.COMISION_SALUD_PRO = 0;
                            item.COMISION_SALUD = 0;
                            item.COMISION_SALUD_AUT = 0;
                            item.valItemSalPr = false;
                            item.valItemPen = false;
                            item.valItemPenPr = false;
                            item.OriginalHealthPropCommission = 0;
                            item.OriginalPensionPropCommission = 0;
                            item.OriginalHealthAuthCommission = 0;
                            item.OriginalPensionAuthCommission = 0;
                            this.inputsQuotation.SecondaryBrokerList.push(item);
                        });
                    } else {
                        swal.fire("Información", "No hay información con los datos ingresados", "error");
                    }
                } else {
                    swal.fire("Información", res.P_SMESSAGE, "error");
                }

            },
            err => {
                swal.fire("Información", "Ocurrió un problema al solicitar su petición", "error");
            }
        );
    }
    EnviarTramite() {
        swal.fire({
            title: 'Información',
            text: "¿Desea enviar el trámite al ejecutivo comercial?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                let dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.quotationNumber;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_NSTATUS_TRA = 5;
                dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');

                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.InsertDerivarTransact(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.isLoading = false;
                            swal.fire('Información', 'Se envió el trámite correctamente al usuario', 'success');
                            this.router.navigate(['/extranet/tray-transact/2']);
                        } else {
                            this.isLoading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.isLoading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    aprobacionCliente(e) { //LS - Gestion Tramites
        this.flagAprobCli = false;
        this.flagEnvioEmail = 0;

        if (e.target.checked) {
            this.flagAprobCli = true;
            this.flagEnvioEmail = 1;
        }
    }

    async EmisionPolizaEstado() {
        const erroresList: any = [];
        if (this.flagGobiernoIniciado) {
            if (this.nidProc == '' || this.nidProc == '1') {
                erroresList.push('Debe validar una trama para poder emitir la Póliza del estado');
            }
        }

        if (erroresList == null || erroresList.length == 0) {
            this.isLoading = true;

            /* Validar Retroactividad */
            if (this.codProducto == 3) {
                const response: any = await this.ValidateRetroactivity(1);
                if (response.P_NCODE == 4) {
                    this.derivaRetroactividad = true;
                    this.isLoading = false;
                    await swal.fire('Información', response.P_SMESSAGE, 'error');
                    this.isLoading = true;
                }
            }
            /* * Validar Retroactividad * */

            await this.policyService.getPolicyEmitCab(
                this.quotationNumber, '1',
                JSON.parse(localStorage.getItem('currentUser'))['id']
            ).toPromise().then(async (res: any) => {
                if (!!res.GenericResponse &&
                    res.GenericResponse.COD_ERR == 0) {
                    let startDate = null;
                    let endDate = null;
                    let startDateAseg = null;
                    let endDateAseg = null;
                    if (this.template.ins_iniVigencia) {
                        startDate = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
                    }
                    if (this.template.ins_finVigencia) {
                        endDate = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
                    }
                    if (this.template.ins_iniVigenciaAseg) {
                        startDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
                    }
                    if (this.template.ins_finVigenciaAseg) {
                        endDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
                    }
                    let tran = this.sAbrTran;
                    const dataQuotation: any = {};
                    dataQuotation.P_SCLIENT = res.GenericResponse.SCLIENT;
                    dataQuotation.P_NCURRENCY = this.inputsQuotation.CurrencyId;
                    dataQuotation.P_NBRANCH = this.nbranch;
                    dataQuotation.P_DSTARTDATE = startDate; // Fecha Inicio
                    dataQuotation.P_DEXPIRDAT = endDate; // Fecha Inicio

                    dataQuotation.P_DSTARTDATE_ASE = startDateAseg;
                    dataQuotation.P_DEXPIRDAT_ASE = endDateAseg;

                    dataQuotation.P_NIDCLIENTLOCATION = res.GenericResponse.COD_SEDE;
                    dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');
                    dataQuotation.P_SRUTA = '';
                    dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    dataQuotation.P_NACT_MINA = res.GenericResponse.MINA;
                    dataQuotation.P_NTIP_RENOV = res.GenericResponse.TIP_RENOV; // Vida Ley
                    dataQuotation.P_NPAYFREQ = res.GenericResponse.FREQ_PAGO; // Vida Ley
                    dataQuotation.P_SCOD_ACTIVITY_TEC = res.GenericResponse.ACT_TEC_VL; // Vida Ley
                    dataQuotation.P_SCOD_CIUU = res.GenericResponse.ACT_ECO_VL; // Vida Ley
                    dataQuotation.P_NTIP_NCOMISSION = res.GenericResponse.TIP_COMISS; // Vida Ley
                    dataQuotation.P_NPRODUCT = this.vidaLeyID.id; // Vida Ley
                    dataQuotation.P_NEPS = this.epsItem.NCODE // Mapfre
                    dataQuotation.P_NPENDIENTE = this.inputsQuotation.P_NPENDIENTE // Mapfre
                    dataQuotation.P_NCOMISION_SAL_PR = 0
                    dataQuotation.P_NCOMISION_SAL = this.inputsQuotation.desTipoComision; // JRIOS TASA X COMISION
                    dataQuotation.CodigoProceso = this.nidProc
                    dataQuotation.P_NREM_EXC = res.GenericResponse.NREM_EXC; //RQ EXC
                    dataQuotation.P_DERIVA_RETRO = this.derivaRetroactividad == true ? 1 : 0;// retroactividad
                    dataQuotation.retOP = 2; // retroactividad
                    dataQuotation.FlagCambioFecha = 0;// retroactividad
                    dataQuotation.TrxCode = tran;
                    dataQuotation.tipoEndoso = res.GenericResponse.NTYPE_END; //rq mejoras de endoso
                    dataQuotation.SMAIL_EJECCOM = this.inputsQuotation.SMAIL_EJECCOM;
                    dataQuotation.P_SPOL_MATRIZ = res.GenericResponse.SPOL_MATRIZ;
                    dataQuotation.P_SPOL_ESTADO = res.GenericResponse.SPOL_ESTADO;
                    dataQuotation.FlagCotEstado = 2; //2 para generar poliza de estado
                    dataQuotation.P_APROB_CLI = res.GenericResponse.APROB_CLI;
                    let desTipoPlan = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan;
                    let planPropuesto = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.planPropuesto;
                    dataQuotation.flagComerExclu = 0; //RQ - Perfil Nuevo - Comercial Exclusivo

                    if (this.codProducto == 3) {
                        dataQuotation.NumeroCotizacion = this.quotationNumber;
                        dataQuotation.P_NID_TRAMITE = res.GenericResponse.NID_TRAMITE;
                    }
                    dataQuotation.QuotationDet = [];
                    dataQuotation.QuotationCom = [];

                    if (this.isPolizaMatriz != true) {
                        if (this.template.ins_categoriaList) {
                            for (let i = 0; i < this.categoryList.length; i++) {
                                const itemQuotationDet: any = {};

                                itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                                itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                                itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
                                itemQuotationDet.P_RANGO = this.categoryList[i].SRANGO_EDAD; /// GCAA 09012024
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
                                itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
                                itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate
                                itemQuotationDet.P_NPREMIUM_MENSUAL = CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
                                itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
                                itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                                itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
                                itemQuotationDet.P_NSUM_PREMIUMN = this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
                                itemQuotationDet.P_NSUM_IGV = this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
                                itemQuotationDet.P_NSUM_PREMIUM = this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
                                itemQuotationDet.P_NRATE = this.rateByPlanList[0].NTASA;
                                itemQuotationDet.P_NDISCOUNT = '0';
                                itemQuotationDet.P_NACTIVITYVARIATION = '0';
                                itemQuotationDet.P_FLAG = '0';
                                /* Nuevos parametros ins_cotizacion_det */
                                itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago);
                                itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago);
                                itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago);
                                //if (itemQuotationDet.P_NTOTAL_TRABAJADORES >0){ /// GCAA
                                dataQuotation.QuotationDet.push(itemQuotationDet);
                                //}
                        }
                        }
                    } else {
                        /*
                        if (this.template.ins_categoriaList) {
                          if (this.countinputEMP != 0 || this.planillainputEMP != 0 || this.tasainputEMP != 0 || this.MontoSinIGVEMP != 0){
                            this.categoryPolizaMatList[0].sactive = true;
                          }
                          if (this.countinputOBR != 0 || this.planillainputOBR != 0 || this.tasainputOBR != 0 || this.MontoSinIGVOBR != 0){
                            this.categoryPolizaMatList[1].sactive = true;
                          }
                          if (this.countinputOAR != 0 || this.planillainputOAR != 0 || this.tasainputOAR != 0 || this.MontoSinIGVOAR != 0){
                            this.categoryPolizaMatList[2].sactive = true;
                          }
                          if (this.countinputEE != 0 || this.planillainputEE != 0 || this.tasainputEE != 0 || this.MontoSinIGVEE != 0){
                            this.categoryPolizaMatList[3].sactive = true;
                          }
                          if (this.countinputOE != 0 || this.planillainputOE != 0 || this.tasainputOE != 0 || this.MontoSinIGVOE != 0){
                            this.categoryPolizaMatList[4].sactive = true;
                          }
                          if (this.countinputOARE != 0 || this.planillainputOARE != 0 || this.tasainputOARE != 0 || this.MontoSinIGVOARE != 0){
                            this.categoryPolizaMatList[5].sactive = true;
                          }
                          for (let i = 0; i < this.categoryPolizaMatList.length; i++) {
                            if(this.categoryPolizaMatList[i].sactive == true){

                              const itemQuotationDet: any = {};
                              itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                              itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                              itemQuotationDet.P_NMODULEC = this.categoryPolizaMatList[i].NCATEGORIA;
                              if(this.categoryPolizaMatList[i].NCATEGORIA == 1){
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP;
                                itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP;
                                itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP;
                              }
                              if(this.categoryPolizaMatList[i].NCATEGORIA == 2){
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR;
                                itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR;
                                itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR;
                              }
                              if(this.categoryPolizaMatList[i].NCATEGORIA == 3){
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR;
                                itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR;
                                itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR;
                              }
                              if(this.categoryPolizaMatList[i].NCATEGORIA == 5){
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEE;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEE;
                                itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEE;
                                itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEE;
                              }
                              if(this.categoryPolizaMatList[i].NCATEGORIA == 6){
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOE;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOE;
                                itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOE;
                                itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOE;
                              }
                              if(this.categoryPolizaMatList[i].NCATEGORIA == 7){
                                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOARE;
                                itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOARE;
                                itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOARE;
                                itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOARE;
                              }

                              itemQuotationDet.P_NTASA_PROP = 0;
                              // itemQuotationDet.P_NPREMIUM_MENSUAL = this.nTransac == 8 ? this.amountPremiumList[i].NPREMIUMN_TOT : CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
                              itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION;
                              itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                              itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;

                              itemQuotationDet.P_NSUM_PREMIUMN = this.TotalSinIGV == 0 ? 0 : this.TotalSinIGV;
                              itemQuotationDet.P_NSUM_IGV = this.SumaConIGV == 0 ? 0 : this.SumaConIGV;
                              itemQuotationDet.P_NSUM_PREMIUM = this.TotalConIGV == 0 ? 0 : this.TotalConIGV;

                              itemQuotationDet.P_NRATE = 0;
                              itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                              itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                              itemQuotationDet.P_FLAG = '0';
                              itemQuotationDet.P_NAMO_AFEC = 0; //montos agregados.
                              itemQuotationDet.P_NIVA =0;
                              itemQuotationDet.P_NAMOUNT = 0;
                              dataQuotation.QuotationDet.push(itemQuotationDet);
                            }
                          }
                        }*/
                    }
                    if (this.brokerList.length > 0 && (tran == "EM")) {

                        this.brokerList.forEach(dataBroker => {
                            const itemQuotationCom: any = {};
                            itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                            itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Desarrollo
                            itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                            //itemQuotationCom.P_NCOMISION_SAL = 0;
                            itemQuotationCom.P_NCOMISION_SAL = this.inputsQuotation.desTipoComision; // JRIOS TASA X COMISION
                            itemQuotationCom.P_NCOMISION_SAL_PR = 0;
                            itemQuotationCom.P_NCOMISION_PEN = 0;
                            itemQuotationCom.P_NCOMISION_PEN_PR = 0;
                            itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                            itemQuotationCom.P_NLOCAL = dataBroker.NLOCAL; //this.selectedDep[index];
                            dataQuotation.QuotationCom.push(itemQuotationCom);

                        });
                    }



                    const myFormData: FormData = new FormData()
                    this.files.forEach(file => {
                        myFormData.append(file.name, file);
                    });

                    myFormData.append('objeto', JSON.stringify(dataQuotation));

                    const dataValidaCambioPlan = {
                        PlanPropuesto: this.planPropuesto,
                        PlanSeleccionado: this.inputsQuotation.desTipoPlan,
                        TipoTransaccion: this.typeTran
                    };
                    myFormData.append('objetoValidaCambioPlan', JSON.stringify(dataValidaCambioPlan));


                    this.isLoading = false;
                    let title = this.emitirPolizaOperaciones || this.flagGobiernoEstado ? '¿Desea realizar la emisión de la póliza?' : '¿Desea realizar la emisión de certificados?';

                    swal.fire({
                        title: 'Información',
                        text: title,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Generar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'

                    }).then((result) => {
                        if (result.value) {
                            this.isLoading = true;
                            this.quotationService.insertQuotation(myFormData).subscribe(
                                async res => {
                                    let quotationNumber = 0;
                                    let transactNumber = 0;
                                    let mensajeRes = '';
                                    let mensajeOperaciones = ' el cual fue derivado al área de técnica para su gestión';
                                    let mensajePolMatriz = this.isPolizaMatriz ? ' y el trámite de Emisión de póliza matriz' : !this.isPolizaMatriz && this.flagGobiernoEstado ? ' y el trámite de Emisión' : '';
                                    if (res.P_COD_ERR == 0) {
                                        this.inputsQuotation.P_MINA = false;
                                        quotationNumber = res.P_NID_COTIZACION;
                                        transactNumber = res.P_NID_TRAMITE;
                                        this.isLoading = false;
                                        /*if(this.flagPolizaMat == true){

                                          await this.policyemit.getPolicyEmitCab(
                                            res.P_NID_COTIZACION, '1',
                                            JSON.parse(localStorage.getItem('currentUser'))['id']
                                          ).toPromise().then(async (resCab: any) => {
                                            if (!!resCab.GenericResponse &&
                                              resCab.GenericResponse.COD_ERR == 0) {
                                              await this.policyemit.getPolicyEmitDet(
                                                res.P_NID_COTIZACION,
                                                JSON.parse(localStorage.getItem('currentUser'))['id'])
                                                .toPromise().then(
                                                  async resDet => {
                                                    const params = [
                                                      {
                                                        P_NID_COTIZACION: res.P_NID_COTIZACION,
                                                        P_NID_PROC: resCab.GenericResponse.NID_PROC,
                                                        P_NBRANCH: this.vidaLeyID.nbranch,
                                                        P_NPRODUCT: this.vidaLeyID.id,
                                                        P_SCOLTIMRE: resCab.GenericResponse.TIP_RENOV,
                                                        P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.FDateIni),
                                                        P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.FDateFin),
                                                        P_NPAYFREQ: resCab.GenericResponse.FREQ_PAGO,
                                                        P_SFLAG_FAC_ANT: 1,
                                                        P_FACT_MES_VENCIDO: 0,
                                                        P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                                        P_IGV: resDet[0].NSUM_IGV,
                                                        P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                                        P_SCOMMENT: '',
                                                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                                        P_DIRECTO: res.P_SAPROBADO,
                                                        P_NID_TRAMITE: res.P_NID_TRAMITE
                                                      }
                                                    ];

                                                    this.objetoEmitPolicyMat(params);

                                                  }
                                                  );
                                              }
                                            });

                                        }else{*/

                                        if (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') {

                                            if (this.flagAprobCli) {
                                                swal.fire('Información', "Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.", 'success');
                                                this.router.navigate(['/extranet/policy-transactions-all']);
                                            } else {
                                                // this.objetoTrx();
                                                this.EmisionPolizaEstadoOperaciones();
                                                // cargar modal de pagos.
                                            }
                                        } else {
                                            swal.fire('Información', res.P_SMESSAGE, 'success');
                                            this.router.navigate(['/extranet/policy-transactions-all']);

                                        }

                                    } else {
                                        this.isLoading = false;
                                        swal.fire('Información', res.P_MESSAGE, 'error');
                                    }
                                },
                                err => {
                                    this.isLoading = false;
                                    swal.fire('Información', 'Hubo un error con el servidor', 'error');
                                }
                            );

                        }
                    });
                }
            });


        } else {
            swal.fire('Información', this.listToString(erroresList), 'error');
        }


    }
    //GESTION TRAMITES ESTADO -  POLIZA MATRIZ - VL
    async EmisionPolizaEstadoSinTrama() {
        const erroresList: any = [];

        if (this.flagGobiernoIniciado) {
            if (this.statusTransact == '') {
                erroresList.push('Debe Seleccionar un estado para poder emitir la Póliza');
            }
        }

        if (erroresList == null || erroresList.length == 0) {
            this.isLoading = true;

            /* Validar Retroactividad */
            if (this.codProducto == 3) {
                const response: any = await this.ValidateRetroactivity(1);
                if (response.P_NCODE == 4) {
                    this.derivaRetroactividad = true;
                    this.isLoading = false;
                    await swal.fire('Información', response.P_SMESSAGE, 'error');

                }
            }
            /* * Validar Retroactividad * */
            this.isLoading = false;
            swal.fire({
                title: 'Información',
                text: this.statusTransact == '25' ? '¿Desea generar la reevaluación del trámite?' : '¿Desea realizar la Emisión de póliza matriz?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Generar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            })
                .then((result) => {
                    if (result.value) {
                        this.isLoading = true;
                        this.policyService.getPolicyEmitCab(
                            this.quotationNumber, '1',
                            JSON.parse(localStorage.getItem('currentUser'))['id']
                        ).toPromise().then(async (res: any) => {
                            if (!!res.GenericResponse &&
                                res.GenericResponse.COD_ERR == 0) {
                                let startDate = null;
                                let endDate = null;
                                let startDateAseg = null;
                                let endDateAseg = null;
                                if (this.template.ins_iniVigencia) {
                                    startDate = CommonMethods.formatDate(this.inputsQuotation.inicioVigencia);
                                }
                                if (this.template.ins_finVigencia) {
                                    endDate = CommonMethods.formatDate(this.inputsQuotation.finVigencia);
                                }
                                if (this.template.ins_iniVigenciaAseg) {
                                    startDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
                                }
                                if (this.template.ins_finVigenciaAseg) {
                                    endDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
                                }
                                let tran = this.sAbrTran;
                                const dataQuotation: any = {};
                                dataQuotation.P_SCLIENT = res.GenericResponse.SCLIENT;
                                dataQuotation.P_NCURRENCY = this.inputsQuotation.CurrencyId;
                                dataQuotation.P_NBRANCH = this.nbranch;
                                dataQuotation.P_DSTARTDATE = startDate; // Fecha Inicio
                                dataQuotation.P_DEXPIRDAT = endDate; // Fecha Inicio

                                dataQuotation.P_DSTARTDATE_ASE = startDateAseg;
                                dataQuotation.P_DEXPIRDAT_ASE = endDateAseg;

                                dataQuotation.P_NIDCLIENTLOCATION = res.GenericResponse.COD_SEDE;
                                dataQuotation.P_SCOMMENT = this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, '');
                                dataQuotation.P_SRUTA = '';
                                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                                dataQuotation.P_NACT_MINA = res.GenericResponse.MINA;
                                dataQuotation.P_NTIP_RENOV = res.GenericResponse.TIP_RENOV; // Vida Ley
                                dataQuotation.P_NPAYFREQ = res.GenericResponse.FREQ_PAGO; // Vida Ley
                                dataQuotation.P_SCOD_ACTIVITY_TEC = res.GenericResponse.ACT_TEC_VL; // Vida Ley
                                dataQuotation.P_SCOD_CIUU = res.GenericResponse.ACT_ECO_VL; // Vida Ley
                                dataQuotation.P_NTIP_NCOMISSION = res.GenericResponse.TIP_COMISS; // Vida Ley
                                dataQuotation.P_NPRODUCT = this.vidaLeyID.id; // Vida Ley
                                dataQuotation.P_NEPS = this.epsItem.NCODE // Mapfre
                                dataQuotation.P_NPENDIENTE = this.inputsQuotation.P_NPENDIENTE // Mapfre
                                dataQuotation.P_NCOMISION_SAL_PR = 0
                                dataQuotation.CodigoProceso = this.nidProc
                                dataQuotation.P_NREM_EXC = res.GenericResponse.NREM_EXC; //RQ EXC
                                dataQuotation.P_DERIVA_RETRO = this.derivaRetroactividad == true ? 1 : 0;// retroactividad
                                dataQuotation.retOP = 2; // retroactividad
                                dataQuotation.FlagCambioFecha = 0;// retroactividad
                                dataQuotation.TrxCode = tran;
                                dataQuotation.tipoEndoso = res.GenericResponse.NTYPE_END; //rq mejoras de endoso
                                dataQuotation.SMAIL_EJECCOM = this.inputsQuotation.SMAIL_EJECCOM;
                                dataQuotation.P_SPOL_MATRIZ = res.GenericResponse.SPOL_MATRIZ;
                                dataQuotation.P_SPOL_ESTADO = res.GenericResponse.SPOL_ESTADO;
                                dataQuotation.FlagCotEstado = 2; //2 para generar poliza de estado
                                dataQuotation.P_APROB_CLI = res.GenericResponse.APROB_CLI;
                                let desTipoPlan = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan;
                                let planPropuesto = this.isPolizaMatriz == true ? this.inputsQuotation.desTipoPlanPM : this.planPropuesto;
                                dataQuotation.flagComerExclu = 0; //RQ - Perfil Nuevo - Comercial Exclusivo

                                if (this.codProducto == 3) {
                                    dataQuotation.NumeroCotizacion = this.quotationNumber;
                                    dataQuotation.P_NID_TRAMITE = res.GenericResponse.NID_TRAMITE;
                                }
                                dataQuotation.QuotationDet = [];
                                dataQuotation.QuotationCom = [];

                                if (this.isPolizaMatriz != true) {
                                    if (this.template.ins_categoriaList) {
                                        for (let i = 0; i < this.categoryList.length; i++) {
                                            const itemQuotationDet: any = {};

                                            itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                                            itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                                            itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
                                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
                                            itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
                                            if (this.categoryList[i].NTASA != undefined) {
                                                itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
                                            } else {
                                                itemQuotationDet.P_NTASA_CALCULADA = this.CalculateList[0].RateCalculate;
                                            }
                                            itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate
                                            itemQuotationDet.P_NPREMIUM_MENSUAL = CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
                                            itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
                                            itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                                            itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
                                            if (this.amountDetailTotalList.length > 0) {
                                                itemQuotationDet.P_NSUM_PREMIUMN = this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
                                                itemQuotationDet.P_NSUM_IGV = this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
                                                itemQuotationDet.P_NSUM_PREMIUM = this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
                                            }

                                            if (this.rateByPlanList[0] != undefined) {
                                                itemQuotationDet.P_NRATE = this.rateByPlanList[0].NTASA;
                                            } else {
                                                itemQuotationDet.P_NRATE = this.CalculateList[0].RateCalculate;
                                            }
                                            itemQuotationDet.P_NDISCOUNT = '0';
                                            itemQuotationDet.P_NACTIVITYVARIATION = '0';
                                            itemQuotationDet.P_FLAG = '0';
                                            /* Nuevos parametros ins_cotizacion_det */
                                            itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago);
                                            itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago);
                                            itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago);

                                            dataQuotation.QuotationDet.push(itemQuotationDet);
                                        }
                                    }
                                } else {
                                    console.log(res.GenericResponse)

                                }

                                if (this.brokerList.length > 0 && (tran == "EM")) {

                                    this.brokerList.forEach(dataBroker => {
                                        const itemQuotationCom: any = {};
                                        itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                                        itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Desarrollo
                                        itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                                        itemQuotationCom.P_NCOMISION_SAL = 0;
                                        itemQuotationCom.P_NCOMISION_SAL_PR = 0;
                                        itemQuotationCom.P_NCOMISION_PEN = 0;
                                        itemQuotationCom.P_NCOMISION_PEN_PR = 0;
                                        itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                                        itemQuotationCom.P_NLOCAL = dataBroker.NLOCAL; //this.selectedDep[index];
                                        dataQuotation.QuotationCom.push(itemQuotationCom);

                                    });
                                }



                                const myFormData: FormData = new FormData()
                                this.files.forEach(file => {
                                    myFormData.append(file.name, file);
                                });

                                myFormData.append('quotationEnvioMariz', JSON.stringify(dataQuotation));

                                const dataValidaCambioPlan = {
                                    PlanPropuesto: this.planPropuesto,
                                    PlanSeleccionado: this.inputsQuotation.desTipoPlan,
                                    TipoTransaccion: this.typeTran,
                                    ReevaluarTecnica: this.statusTransact == '25',
                                    P_NID_COTIZACION: this.quotationNumber,
                                    P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id']
                                };
                                console.log(dataValidaCambioPlan);
                                myFormData.append('objetoEnvioMariz', JSON.stringify(dataValidaCambioPlan));

                                this.quotationService.envioTecnicaPolizaMatriz(myFormData).subscribe(
                                    async res => {
                                        if (res.P_COD_ERR == 0) {
                                            this.isLoading = false;
                                            swal.fire('Información', res.P_MESSAGE, 'success');
                                            this.router.navigate(['/extranet/policy-transactions-all']);

                                        } else {
                                            this.isLoading = false;
                                            swal.fire('Información', res.P_MESSAGE, 'error');
                                        }
                                    },
                                    err => {
                                        this.isLoading = false;
                                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                                    }
                                );

                            }
                        });
                    }
                });

        } else {
            swal.fire('Información', this.listToString(erroresList), 'error');
        }


    }

    async EmisionPolizaEstadoOperaciones() {
        await this.EmitCertificado();
    }


    async EmitCertificado() { //LS - Gestion Tramites Estado
        const erroresList: any = [];
        if (this.emitirCertificadoOperaciones) {
            if (this.nidProc == '' || this.nidProc == '1') {
                erroresList.push('Debe validar una trama para poder emitir los certificados.');
            }
        }

        if (erroresList == null || erroresList.length == 0) {
            this.isLoading = true;
            /* Validar Retroactividad */
            if (this.codProducto == 3) {
                const response: any = await this.ValidateRetroactivity(1);
                if (response.P_NCODE == 4) {
                    // this.router.navigate(['/extranet/request-status']);
                    this.isLoading = false;
                    await swal.fire('Información', response.P_SMESSAGE, 'error');
                    this.isLoading = true;
                }
            }
            /* * Validar Retroactividad * */
            await this.policyService.getPolicyEmitCab(
                this.quotationNumber, '1',
                JSON.parse(localStorage.getItem('currentUser'))['id']
            ).toPromise().then(async (res: any) => {
                if (!!res.GenericResponse &&
                    res.GenericResponse.COD_ERR == 0) {
                    await this.policyService.getPolicyEmitDet(
                        this.quotationNumber,
                        JSON.parse(localStorage.getItem('currentUser'))['id'])
                        .toPromise().then(
                            async resDet => {
                                const params = [
                                    {
                                        P_NID_COTIZACION: this.quotationNumber,
                                        P_NID_PROC: this.nidProc,
                                        P_NPRODUCT: this.productoId,
                                        P_NBRANCH: this.nbranch,
                                        P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                        P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                                        P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                                        P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                        P_SFLAG_FAC_ANT: 1,
                                        P_FACT_MES_VENCIDO: 0,
                                        P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                        P_IGV: resDet[0].NSUM_IGV,
                                        P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                        P_NAMO_AFEC: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[0].AmountAuthorized : 0,
                                        P_NIVA: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[1].AmountAuthorized : 0,
                                        P_NAMOUNT: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[2].AmountAuthorized : 0,
                                        P_SCOMMENT: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia) !=
                                            CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                            'Se ha modificado el inicio de vigencia: Antes = ' +
                                            CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) +
                                            '.Ahora = ' + CommonMethods.formatDate(this.inputsQuotation.finVigencia) : this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, ''),
                                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                        /* Campos para retroactividad */
                                        P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                        P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
                                        planId: this.flagGobiernoIniciado ? res.GenericResponse.NIDPLAN : this.planList.find(f => f.SDESCRIPT == this.inputsQuotation.desTipoPlan).NIDPLAN,
                                        FlagCambioFecha: this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
                                        /* Campos para retroactividad */
                                        //FlagPolMat: 1,
                                        //FlagEnvioTEjecutivo: this.flagEnvioEmail,
                                        flagEmitCertificado: this.flagGobiernoIniciado || this.emitirPolizaOperaciones ? 1 : 0
                                    }
                                ];

                                if (params[0].P_NID_PROC == '') {
                                    await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                                        resCod => {
                                            params[0].P_NID_PROC = resCod;
                                        }
                                    );
                                }
                                this.EmitCerti(params);

                            }
                        );
                }
            });
        } else {
            swal.fire('Información', this.listToString(erroresList), 'error');
        }

    }

    derivar() { // ?

    }

    EmitCerti(saveCerti) {

        this.isLoading = false;
        let title = this.emitirPolizaOperaciones || this.flagGobiernoEstado ? '¿Desea realizar la emisión de la póliza?' : '¿Desea realizar la emisión de certificados?';
        if (this.emitirPolizaOperaciones) {
            swal.fire({
                title: 'Información',
                text: title,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Generar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'

            }).then((result) => {

                if (result.value) {
                    this.isLoading = true;
                    let dataQuotation: any = {};
                    const data: FormData = new FormData();

                    dataQuotation.P_NID_TRAMITE = this.transactNumber;
                    dataQuotation.P_NFLAG_EMAIL = this.flagAprobCli ? 1 : 0 // this.flagEnvioEmail;
                    this.datasavecertificados = saveCerti;
                    this.SaveEmitCerti(saveCerti);

                }
            });
        } else if (this.flagGobiernoEstado) {
            this.SaveEmitCerti(saveCerti);

        }

    }



    /*

      EmitCerti(saveCerti){

        this.isLoading = false;
        let title = this.emitirPolizaOperaciones? '¿Desea realizar la emisión de la p+oliza?' : '¿Desea realizar la emisión de certificados?';

        swal.fire({
          title: 'Información',
          text: title,
          type: 'question',
          showCancelButton: true,
          confirmButtonText: 'Generar',
          allowOutsideClick: false,
          cancelButtonText: 'Cancelar'

        }).then((result) => {

          if (result.value) {
            this.isLoading = true;
            let dataQuotation: any = {};
            const data: FormData = new FormData();

            dataQuotation.P_NID_TRAMITE = this.transactNumber;
            dataQuotation.P_NFLAG_EMAIL =this.flagAprobCli? 1:0 // this.flagEnvioEmail;

            this.transactService.EnvioEmail(dataQuotation).subscribe(
              res => {
                if (res.P_COD_ERR == 0) {
                  this.datasavecertificados = saveCerti;
                  this.SaveEmitCerti(saveCerti);

                  // if(this.emitirCertificadoOperaciones){
                  //
                  //   this.OpenModalPagos(saveCerti);

                  // }



                } else {
                  this.isLoading = false;
                  swal.fire('Información', res.P_MESSAGE, 'error');
                }
              },
              err => {
                this.isLoading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
              }
            );

          }
        });
      }
    */
    SaveEmitCerti(saveCerti) {

        let title = this.emitirPolizaOperaciones || this.flagGobiernoIniciado ? 'Se ha generado correctamente la póliza de Vida Ley N° ' : 'Se ha generado correctamente la Emisión de Certificados';
        if (this.flagAprobCli) {
            title = 'Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.';
        }
        const myFormData: FormData = new FormData();
        if (this.files.length > 0) {
            this.files.forEach(file => {
                myFormData.append('adjuntos', file, file.name);
            });
        }
        myFormData.append('objeto', JSON.stringify(saveCerti));
        if ((this.flagGobiernoIniciado || this.emitirPolizaOperaciones) && saveCerti[0].flagEmitCertificado == 1) {
            if (!this.flagAprobCli)
                this.OpenModalPagos(saveCerti);
        } else {
            this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
                if (res.P_COD_ERR == 0) {
                    let policyVLey = 0;
                    let constancia = 0;

                    policyVLey = Number(res.P_POL_VLEY);
                    constancia = Number(res.P_NCONSTANCIA);

                    if ((this.emitirCertificadoOperaciones && policyVLey == 0 && !this.flagAprobCli) && this.emitirCertificadoTecnica == false && res.P_SAPROBADO != 'A') {

                        if (!this.flagAprobCli && saveCerti[0].flagEmitCertificado == 1)
                            this.OpenModalPagos(saveCerti);


                    } else {
                        if (this.flagAprobCli || policyVLey == 0 || this.emitirCertificadoTecnica == true) { // al enviar al ejecutivo viene con policy cero y status S
                            this.isLoading = false;
                            swal.fire({
                                title: 'Información',
                                text: (this.flagAprobCli && policyVLey == 0 && res.P_SAPROBADO == 'S') || this.emitirCertificadoTecnica == true ? title : res.P_MESSAGE,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            }).then((result) => {
                                if (result.value) {
                                    if (this.from == 'transact2') {
                                        this.router.navigate(['/extranet/tray-transact/1']);
                                    }
                                }
                            });
                        } else {
                            if ((this.emitirCertificadoOperaciones && policyVLey > 0) || this.flagGobiernoIniciado || this.emitirPolizaOperaciones) {
                                this.isLoading = false;
                                //let title = 'Se ha generado correctamente la Emisión de Certificados';
                                title = this.emitirPolizaOperaciones || this.flagGobiernoIniciado ? title + policyVLey.toString() : title;
                                swal.fire({
                                    title: 'Información',
                                    text: title,
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                                    .then((result) => {
                                        if (result.value) {
                                            if (this.from == 'transact2') {
                                                this.router.navigate(['/extranet/tray-transact/1']);
                                            }
                                        }
                                    });
                            }
                        }

                    }
                } else if (res.P_COD_ERR == 1 || res.P_COD_ERR == 4 || res.P_SAPROBADO == 'A') {
                    this.isLoading = false;
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            if (this.from == 'transact1') {
                                this.router.navigate(['/extranet/tray-transact/1']);
                            } else if (this.from == 'transact2') {
                                this.router.navigate(['/extranet/tray-transact/2']);
                            } else {
                                this.router.navigate(['/extranet/request-status']);
                            }
                        }
                    });
                } else {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                }
            });
        }
    }

    AprobCliente(e) {
        this.flagEnvioEmail = 0;

        if (e.target.checked) {
            this.flagEnvioEmail = 1;
        }

    }

    reverseMovementIncomplete() {

        swal.fire({
            title: 'Información',
            text: '¿Deseas reversar los movimientos pendientes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Reversar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                var data: any = {
                    quotation: this.quotationNumber,
                    codBranch: this.vidaLeyID.nbranch
                };

                this.quotationService.reverseMovementsIncomplete(data).subscribe(
                    res => {
                        this.isLoading = false;

                        if (res.codError == 0) {
                            this.mode = CommonMethods.TIPO_VISTAS.VISUALIZAR;
                            this.searchTracking();
                            swal.fire('Información', '' + res.desError, 'success');
                        } else {
                            swal.fire('Información', res.desError, 'error');
                        }

                    },
                    err => {
                        this.isLoading = false;
                        swal.fire('Información', 'Hubo un error al ejecutar el proceso', 'error');
                    }
                );
            }
        });
    }
    changeRateProposed(event, valor, row) {
        this.arrayRateProposed = [];

        if (this.categoryList.length > 0) {
            this.categoryList.forEach(element => {
                if (element.ProposalRate == undefined || element.ProposalRate == '') {
                    element.ProposalRate = 0;
                    this.arrayRateProposed.push(element.ProposalRate);
                } else {
                    this.arrayRateProposed.push(element.ProposalRate);
                };
            });
        }
        if (this.categoryList.length == this.arrayRateProposed.length) {
            this.isRateProposed = true;
            this.validarExcel(-1);
        }
    }
    clearInsert() {
        // Datos Contratante

        this.inputsQuotation.P_NIDDOC_TYPE = '-1'; // Tipo de documento
        this.inputsQuotation.P_SIDDOC = ''; // Nro de documento
        this.inputsQuotation.P_SFIRSTNAME = ''; // Nombre
        this.inputsQuotation.P_SLASTNAME = ''; // Apellido Paterno
        this.inputsQuotation.P_SLASTNAME2 = ''; // Apellido Materno
        this.inputsQuotation.P_SLEGALNAME = ''; // Razon social
        this.inputsQuotation.P_SE_MAIL = ''; // Email
        this.inputsQuotation.P_SDESDIREBUSQ = ''; // Direccion
        this.inputsQuotation.tipoRenovacion = ''; // Tipo de renovación
        this.inputsQuotation.frecuenciaPago = ''; // Frecuencia de pago
        this.canTasaVL = true;
        this.inputsQuotation.P_COMISION = ''

        this.excelSubir = null;
        this.archivoExcel = null;
        this.files = null;
        // this.flagEmailNull = true;
        this.flagEmail = false;
        this.flagContact = false;
        this.inputsQuotation.desTipoPlan = ''
        this.inputsQuotation.FDateIni = new Date();
        this.inputsQuotation.FDateFin = new Date();
        this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);

        // Datos Cotización
        this.inputsQuotation.P_NCURRENCY = '1'; // Moneda
        this.inputsQuotation.P_NIDSEDE = null; // Sede
        this.inputsQuotation.P_NTECHNICAL = null; // Actividad Tecnica
        this.inputsQuotation.P_NECONOMIC = null; // Actividad Economica
        this.inputsQuotation.P_DELIMITER = ''; // Delimitación check
        this.inputsQuotation.P_SDELIMITER = '0'; // Delimitacion  1 o 0
        this.inputsQuotation.P_NPROVINCE = null;
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;

        //Cotizador
        this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = '1'; // Tipo persona

        this.categoryList.forEach(element => {
            element.ProposalRate = null;
        });

        this.categoryList = [];
        this.rateByPlanList = [];
        this.validateLockResponse = {};
        this.validateDebtResponse = {};
        this.excelSubir = null;
        this.creditHistory = null;
        this.inputsQuotation.commissionProposed = null;
        this.isPolizaMatriz = false;
    }

    async procesarPolizaEstadoOperaciones() {  // para procesar directamente transaciones del estado Vida Ley
        switch (this.mode) {
            case CommonMethods.TIPO_VISTAS.RENOVAR:
                this.processRenovation();
                break;
            case CommonMethods.TIPO_VISTAS.INCLUIR:
                this.processInclude();
                break;
            case CommonMethods.TIPO_VISTAS.ENDOSAR:
                this.processEndoso();
                break;
            case CommonMethods.TIPO_VISTAS.EXCLUIR:
                this.processExclude();
                break;

        }
    }
    emitirCertificadoEstado(datasavecertificados) {
        this.policyService.emitirCertificadoEstado(datasavecertificados).subscribe(res => {

            if (res.P_COD_ERR == 0) {
                let policyVLey = 0;
                let constancia = 0;

                policyVLey = Number(res.P_NPOLICY);
                constancia = Number(res.P_NCONSTANCIA);
                let title = 'Se ha generado correctamente la Emisión de Certificados de la póliza N° ';
                title = title + policyVLey.toString();
                swal.fire({
                    title: 'Información',
                    text: title,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
                    .then((result) => {
                        if (result.value) {
                            this.router.navigate(['/extranet/tray-transact/1']);

                        }
                    });
            }
        }

        );

    }

    async loadDatosCotizadorPolizaMatriz() {
        await this.policyService.getPolicyEmitDet(
            this.quotationNumber, JSON.parse(localStorage.getItem('currentUser'))['id'])
            .toPromise().then(
                async resDet => {

                    var frecPago = 0;

                    switch (Number(this.dataPolizaEstado.FREQ_PAGO)) {
                        case 1:
                            frecPago = 12 // Anual
                            break;
                        case 2:
                            frecPago = 6 // Semestral
                            break;
                        case 3:
                            frecPago = 3 // Trimestral
                            break;
                        case 4:
                            frecPago = 2 // Bimestral
                            break;
                        case 5:
                            frecPago = 1; // Mensual
                            break;

                        default:
                            break;
                    }

                    for (let i = 0; i < resDet.length; i++) {
                        // GCAA 24112023
                        if (resDet[i].TIP_RIESGO == "1") {
                            this.countinputEMP_18_36 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP_18_36 = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP_18_36 = resDet[i].TASA;
                            this.MontoSinIGVEMP_18_36 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
                        }

                        /*if (resDet[i].TIP_RIESGO == "1" && resDet[i].SRANGO_EDAD == "37-55") {
                            this.countinputEMP_37_55 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP_37_55 = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP_37_55 = resDet[i].TASA;
                            this.MontoSinIGVEMP_37_55 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "1" && resDet[i].SRANGO_EDAD == "56-63") {
                            this.countinputEMP_56_63 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP_56_63 = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP_56_63 = resDet[i].TASA;
                            this.MontoSinIGVEMP_56_63 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "1" && resDet[i].SRANGO_EDAD == "64-70") {
                            this.countinputEMP_64_70 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP_64_70  = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP_64_70  = resDet[i].TASA;
                            this.MontoSinIGVEMP_64_70  = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "1" && resDet[i].SRANGO_EDAD == "71-80") {
                            this.countinputEMP_71_80 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP_71_80 = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP_71_80 = resDet[i].TASA;
                            this.MontoSinIGVEMP_71_80 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "1" && resDet[i].SRANGO_EDAD == "81-99") {
                            this.countinputEMP_81_99 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP_81_99 = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP_81_99 = resDet[i].TASA;
                            this.MontoSinIGVEMP_81_99 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);
                        }*/

                        ////////////////////////////////

                        if (resDet[i].TIP_RIESGO == "2") {
                            this.countinputOBR_18_36 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR_18_36 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR_18_36 = resDet[i].TASA;
                            this.MontoSinIGVOBR_18_36 =CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }

                        /*if (resDet[i].TIP_RIESGO == "2" && resDet[i].SRANGO_EDAD == "37-55") {
                            this.countinputOBR_37_55 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR_37_55 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR_37_55 = resDet[i].TASA;
                            this.MontoSinIGVOBR_37_55 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "2" && resDet[i].SRANGO_EDAD == "56-63") {
                            this.countinputOBR_56_63 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR_56_63 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR_56_63 = resDet[i].TASA;
                            this.MontoSinIGVOBR_56_63 =CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "2" && resDet[i].SRANGO_EDAD == "64-70") {
                            this.countinputOBR_64_70 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR_64_70 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR_64_70 = resDet[i].TASA;
                            this.MontoSinIGVOBR_64_70 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "2" && resDet[i].SRANGO_EDAD == "71-80") {
                            this.countinputOBR_71_80 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR_71_80 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR_71_80 = resDet[i].TASA;
                            this.MontoSinIGVOBR_71_80 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/


                        /*if (resDet[i].TIP_RIESGO == "2" && resDet[i].SRANGO_EDAD == "81-99") {
                            this.countinputOBR_81_99 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR_81_99 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR_81_99 = resDet[i].TASA;
                            this.MontoSinIGVOBR_81_99 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /////////////////////////////////

                        if (resDet[i].TIP_RIESGO == "3") {
                            this.countinputOAR_18_36 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR_18_36 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR_18_36 = resDet[i].TASA;
                            this.MontoSinIGVOAR_18_36 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }
                        
                        /*if (resDet[i].TIP_RIESGO == "3" && resDet[i].SRANGO_EDAD == "37-55") {
                            this.countinputOAR_37_55 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR_37_55 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR_37_55 = resDet[i].TASA;
                            this.MontoSinIGVOAR_37_55 =CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "3" && resDet[i].SRANGO_EDAD == "56-63") {
                            this.countinputOAR_56_63 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR_56_63 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR_56_63 = resDet[i].TASA;
                            this.MontoSinIGVOAR_56_63 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "3" && resDet[i].SRANGO_EDAD == "64-70") {
                            this.countinputOAR_64_70 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR_64_70 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR_64_70 = resDet[i].TASA;
                            this.MontoSinIGVOAR_64_70 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/
                        
                        /*if (resDet[i].TIP_RIESGO == "3" && resDet[i].SRANGO_EDAD == "71-80") {
                            this.countinputOAR_71_80 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR_71_80 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR_71_80 = resDet[i].TASA;
                            this.MontoSinIGVOAR_71_80 =CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /*if (resDet[i].TIP_RIESGO == "3" && resDet[i].SRANGO_EDAD == "81-99") {
                            this.countinputOAR_81_99 = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR_81_99 = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR_81_99 = resDet[i].TASA;
                            this.MontoSinIGVOAR_81_99 = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA)*Number.parseFloat(resDet[i].TASA) / 100, 6,1);                            
                        }*/

                        /////////////////////////////////////////////


                        if (resDet[i].TIP_RIESGO == "5") {
                            this.countinputEE = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEE = resDet[i].MONTO_PLANILLA;
                            this.tasainputEE = resDet[i].TASA;
                            this.MontoSinIGVEE = resDet[i].PRIMA;
                            //this.MontoFPSinIGVEE = resDet[i].PRIMA;
                            this.MontoSinIGVEE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                        }
                        if (resDet[i].TIP_RIESGO == "6") {
                            this.countinputOE = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOE = resDet[i].MONTO_PLANILLA;
                            this.tasainputOE = resDet[i].TASA;
                            this.MontoSinIGVOE = resDet[i].PRIMA;
                            //this.MontoFPSinIGVOE = resDet[i].PRIMA;
                            this.MontoSinIGVOE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                        }
                        if (resDet[i].TIP_RIESGO == "7") {
                            this.countinputOARE = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOARE = resDet[i].MONTO_PLANILLA;
                            this.tasainputOARE = resDet[i].TASA;
                            this.MontoSinIGVOARE = resDet[i].PRIMA;
                            //this.MontoFPSinIGVOARE = resDet[i].PRIMA;
                            this.MontoSinIGVOARE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                        }
                    }


                    for (let i = 0; i < this.CalculateList.length; i++) {
                        // GCAA 01/12/2023
                        if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO') {                        
                            this.MontoFPSinIGVEMP_18_36 = CommonMethods.formatValor(this.MontoSinIGVEMP_18_36 * frecPago, 6, 1)
                        }
                        /*if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO' && this.CalculateList[i].SRANGO_EDAD == '37-55') {                        
                            this.MontoFPSinIGVEMP_37_55 = CommonMethods.formatValor(this.MontoSinIGVEMP_37_55 * frecPago, 6, 1)
                        }
                        if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO' && this.CalculateList[i].SRANGO_EDAD == '56-63') {                            
                            this.MontoFPSinIGVEMP_56_63 = CommonMethods.formatValor(this.MontoSinIGVEMP_56_63  * frecPago, 6, 1)
                        }
                        if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO' && this.CalculateList[i].SRANGO_EDAD == '64-70') {                        
                            this.MontoFPSinIGVEMP_64_70 = CommonMethods.formatValor(this.MontoSinIGVEMP_64_70 * frecPago, 6, 1)
                        }
                        if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO' && this.CalculateList[i].SRANGO_EDAD == '71-80') {                        
                            this.MontoFPSinIGVEMP_71_80 = CommonMethods.formatValor(this.MontoSinIGVEMP_71_80 * frecPago, 6, 1)
                        }
                        if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO' && this.CalculateList[i].SRANGO_EDAD == '81-99') {                                                
                            this.MontoFPSinIGVEMP_81_99 = CommonMethods.formatValor(this.MontoSinIGVEMP_81_99 * frecPago, 6, 1)
                        }*/

                        //////////////////////////////////


                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO') {                            
                            this.MontoFPSinIGVOBR_18_36 = CommonMethods.formatValor(this.MontoSinIGVOBR_18_36 * frecPago, 6, 1)
                        }

                        /*if (this.CalculateList[i].CategoryCalculate == 'OBRERO' && this.CalculateList[i].SRANGO_EDAD == '37-55') {                            
                            this.MontoFPSinIGVOBR_37_55 = CommonMethods.formatValor(this.MontoSinIGVOBR_37_55 * frecPago, 6, 1)
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO' && this.CalculateList[i].SRANGO_EDAD == '56-63') {                            
                            this.MontoFPSinIGVOBR_56_63 = CommonMethods.formatValor(this.MontoSinIGVOBR_56_63  * frecPago, 6, 1)
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO' && this.CalculateList[i].SRANGO_EDAD == '64-70') {                            
                            this.MontoFPSinIGVOBR_64_70 = CommonMethods.formatValor(this.MontoSinIGVOBR_64_70 * frecPago, 6, 1)
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO' && this.CalculateList[i].SRANGO_EDAD == '71-80') {                            
                            this.MontoFPSinIGVOBR_71_80 = CommonMethods.formatValor(this.MontoSinIGVOBR_71_80 * frecPago, 6, 1)
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO' && this.CalculateList[i].SRANGO_EDAD == '81-99') {                            
                            this.MontoFPSinIGVOBR_81_99 = CommonMethods.formatValor(this.MontoSinIGVOBR_81_99 * frecPago, 6, 1)
                        }*/

                        //////////////////////////////

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO') {                            
                            this.MontoFPSinIGVOAR_18_36 = CommonMethods.formatValor(this.MontoSinIGVOAR_18_36 * frecPago, 6, 1);
                        }

                        /*if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO' && this.CalculateList[i].SRANGO_EDAD == '37-55') {                            
                            this.MontoFPSinIGVOAR_37_55 = CommonMethods.formatValor(this.MontoSinIGVOAR_37_55 * frecPago, 6, 1);
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO' && this.CalculateList[i].SRANGO_EDAD == '56-63') {                            
                            this.MontoFPSinIGVOAR_56_63 = CommonMethods.formatValor(this.MontoSinIGVOAR_56_63 * frecPago, 6, 1);
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO' && this.CalculateList[i].SRANGO_EDAD == '64-70') {                            
                            this.MontoFPSinIGVOAR_64_70 = CommonMethods.formatValor(this.MontoSinIGVOAR_64_70 * frecPago, 6, 1);
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO' && this.CalculateList[i].SRANGO_EDAD == '71-80') {                            
                            this.MontoFPSinIGVOAR_71_80 = CommonMethods.formatValor(this.MontoSinIGVOAR_71_80 * frecPago, 6, 1);
                        }

                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO' && this.CalculateList[i].SRANGO_EDAD == '81-99') {                            
                            this.MontoFPSinIGVOAR_81_99 = CommonMethods.formatValor(this.MontoSinIGVOAR_81_99 * frecPago, 6, 1);
                        }*/

                        ///////////////////////////////////


                        if (this.CalculateList[i].CategoryCalculate == 'EMPLEADO EXCEDENTE') {
                            // this.MontoFPSinIGVEE = this.CalculateList[i].PremiumCalculate.toFixed(6);
                            this.MontoFPSinIGVEE = CommonMethods.formatValor(this.MontoSinIGVEE * frecPago, 6, 1);
                        }
                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO EXCEDENTE') {
                            // this.MontoFPSinIGVOE = this.CalculateList[i].PremiumCalculate.toFixed(6);
                            this.MontoFPSinIGVOE = CommonMethods.formatValor(this.MontoSinIGVOE * frecPago, 6, 1);
                        }
                        if (this.CalculateList[i].CategoryCalculate == 'OBRERO ALTO RIESGO EXCEDENTE') {
                            // this.MontoFPSinIGVOARE = this.CalculateList[i].PremiumCalculate.toFixed(6);
                            this.MontoFPSinIGVOARE = CommonMethods.formatValor(this.MontoSinIGVOARE * frecPago, 6, 1);
                        }
                    }

                    this.TotalSinIGV = CommonMethods.formatValor(
                        Number(this.MontoSinIGVEMP_18_36) +
                        /*
                        Number(this.MontoSinIGVEMP_37_55) +
                        Number(this.MontoSinIGVEMP_56_63) +
                        Number(this.MontoSinIGVEMP_64_70) +
                        Number(this.MontoSinIGVEMP_71_80) +
                        Number(this.MontoSinIGVEMP_81_99) +
                        */
                        Number(this.MontoSinIGVOBR_18_36) +
                        /*
                        Number(this.MontoSinIGVOBR_37_55) +
                        Number(this.MontoSinIGVOBR_56_63) +
                        Number(this.MontoSinIGVOBR_64_70) +
                        Number(this.MontoSinIGVOBR_71_80) +
                        Number(this.MontoSinIGVOBR_81_99) +
                        */
                        Number(this.MontoSinIGVOAR_18_36) +
                        /*
                        Number(this.MontoSinIGVOAR_37_55) +
                        Number(this.MontoSinIGVOAR_56_63) +
                        Number(this.MontoSinIGVOAR_64_70) +
                        Number(this.MontoSinIGVOAR_71_80) +
                        Number(this.MontoSinIGVOAR_81_99) + 
                        */
                        Number(this.MontoSinIGVEE) + 
                        Number(this.MontoSinIGVOE) + 
                        Number(this.MontoSinIGVOARE),
                        2, 1);
                    
                    
                        this.TotalFPSinIGV = CommonMethods.formatValor(
                            Number(this.MontoFPSinIGVEMP_18_36) +
                            /*
                            Number(this.MontoFPSinIGVEMP_37_55) +
                            Number(this.MontoFPSinIGVEMP_56_63) +
                            Number(this.MontoFPSinIGVEMP_64_70) +
                            Number(this.MontoFPSinIGVEMP_71_80) +
                            Number(this.MontoFPSinIGVEMP_81_99) +
                            */
                            Number(this.MontoFPSinIGVOBR_18_36) +
                            /*
                            Number(this.MontoFPSinIGVOBR_37_55) +
                            Number(this.MontoFPSinIGVOBR_56_63) +
                            Number(this.MontoFPSinIGVOBR_64_70) +
                            Number(this.MontoFPSinIGVOBR_71_80) +
                            Number(this.MontoFPSinIGVOBR_81_99) +
                            */
                            Number(this.MontoFPSinIGVOAR_18_36) +
                            /*
                            Number(this.MontoFPSinIGVOAR_37_55) +
                            Number(this.MontoFPSinIGVOAR_56_63) +
                            Number(this.MontoFPSinIGVOAR_64_70) +
                            Number(this.MontoFPSinIGVOAR_71_80) +
                            Number(this.MontoFPSinIGVOAR_81_99) +
                            */
                            Number(this.MontoFPSinIGVEE) + 
                            Number(this.MontoFPSinIGVOE) + 
                            Number(this.MontoFPSinIGVOARE), 2, 1);

                    this.TotalConIGV = CommonMethods.formatValor(this.TotalSinIGV * 118 / 100, 2, 1);
                    this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV * 118 / 100, 2, 1);
                }
            );
    }

    async EmisionPolizaMatrizTEstado() {
        if (this.statusTransact == '25') {
            let msg = "";

            if (this.mainFormGroup.controls.comment.value == "") {
                msg += "Ingrese un comentario por favor."
            }

            if (msg != "") {
                await swal.fire('Error', msg, 'error');
                return;
            }
            this.EmisionPolizaEstadoSinTrama();
        } else if (this.statusTransact == '6') {
            this.AsignarTramite();
        } else if (this.mode == CommonMethods.TIPO_VISTAS.ENVIAR && this.flagAprobCli) {
            this.EnviarTramite();
        } else {
            const erroresList: any = [];

            if (this.emitirPolizaMatrizTramiteEstado) {
                if (this.statusTransact == '') {
                    erroresList.push('Debe Seleccionar un estado para poder emitir la Póliza');
                }
            }

            if (erroresList == null || erroresList.length == 0) {
                this.isLoading = true;
                await this.policyService.getPolicyEmitCab(
                    this.quotationNumber, '1',
                    JSON.parse(localStorage.getItem('currentUser'))['id']
                ).toPromise().then(async (res: any) => {
                    if (!!res.GenericResponse &&
                        res.GenericResponse.COD_ERR == 0) {
                        await this.policyService.getPolicyEmitDet(
                            this.quotationNumber,
                            JSON.parse(localStorage.getItem('currentUser'))['id'])
                            .toPromise().then(
                                async resDet => {
                                    const params = [
                                        {
                                            P_NID_COTIZACION: this.quotationNumber,
                                            P_NID_PROC: "",
                                            P_NPRODUCT: this.productoId,
                                            P_NBRANCH: this.nbranch,
                                            P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                            P_DSTARTDATE: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia),
                                            P_DEXPIRDAT: CommonMethods.formatDate(this.inputsQuotation.finVigencia),
                                            P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                            P_SFLAG_FAC_ANT: 1,
                                            P_FACT_MES_VENCIDO: 0,
                                            P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                            P_IGV: resDet[0].NSUM_IGV,
                                            P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                            P_NAMO_AFEC: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(0, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[0].AmountAuthorized : 0,
                                            P_NIVA: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[1].AmountAuthorized : 0,
                                            P_NAMOUNT: this.flagGobiernoIniciado ? this.GetAmountDetailTotalListValue(2, this.inputsQuotation.frecuenciaPago) : this.emitirPolizaOperaciones ? this.AuthorizedDetailList[2].AmountAuthorized : 0,
                                            P_SCOMMENT: CommonMethods.formatDate(this.inputsQuotation.inicioVigencia) !=
                                                CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                                'Se ha modificado el inicio de vigencia: Antes = ' +
                                                CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL)) +
                                                '.Ahora = ' + CommonMethods.formatDate(this.inputsQuotation.finVigencia) : this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, ''),
                                            P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                            P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                            P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg),
                                            planId: this.flagGobiernoIniciado ? res.GenericResponse.NIDPLAN : this.planList.find(f => f.SDESCRIPT == this.inputsQuotation.desTipoPlan).NIDPLAN,
                                            FlagCambioFecha: this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0,
                                            flagEmitCertificado: this.flagGobiernoIniciado || this.emitirPolizaOperaciones ? 1 : 0,
                                            P_NPOLIZA_MATRIZ: this.flagGobiernoMatriz == true ? 1 : 0,
                                            P_SPAGO_ELEGIDO: 'directo'
                                        }
                                    ];

                                    this.EmitPoliMatrizTramiteEstado(params);

                                }
                            );
                    }
                });
            } else {
                swal.fire('Información', this.listToString(erroresList), 'error');
            }
        }

    }

    EmitPoliMatrizTramiteEstado(saveParams) {

        this.isLoading = false;
        let title = this.flagGobiernoEstado ? '¿Desea realizar la  Emisión de póliza matriz?' : '¿Desea realizar la emisión de certificados?';
        if (this.emitirPolizaMatrizTramiteEstado) {
            swal.fire({
                title: 'Información',
                text: title,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Generar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'

            }).then((result) => {

                if (result.value) {
                    this.isLoading = true;
                    let dataQuotation: any = {};
                    const data: FormData = new FormData();

                    dataQuotation.P_NID_TRAMITE = this.transactNumber;
                    dataQuotation.P_NFLAG_EMAIL = this.flagAprobCli ? 1 : 0 // this.flagEnvioEmail;
                    this.datasavecertificados = saveParams;
                    this.SaveEmitPoliMatrizTramiteEstado(saveParams);

                }
            });
        } else if (this.flagGobiernoEstado) {
            this.SaveEmitPoliMatrizTramiteEstado(saveParams);

        }

    }

    SaveEmitPoliMatrizTramiteEstado(saveParams) {

        let title = 'Se ha generado correctamente la póliza de Vida Ley N° ';
        if (this.flagAprobCli) {
            title = 'Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.';
        }
        const myFormData: FormData = new FormData();
        if (this.files.length > 0) {
            this.files.forEach(file => {
                myFormData.append('adjuntos', file, file.name);
            });
        }
        myFormData.append('objeto', JSON.stringify(saveParams));
        if ((this.flagGobiernoIniciado || this.emitirPolizaOperaciones) && saveParams[0].flagEmitCertificado == 1) {
            if (!this.flagAprobCli)
                this.OpenModalPagos(saveParams);
        } else {
            this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {
                console.log('savePolicyEmit_res');
                console.log(res);
                if (res.P_COD_ERR == 0) {
                    let policyVLey = 0;
                    let constancia = 0;

                    policyVLey = Number(res.P_POL_VLEY);
                    constancia = Number(res.P_NCONSTANCIA);

                    this.isLoading = false;
                    title = !this.flagAprobCli && policyVLey > 0 ? title + policyVLey.toString() : title;
                    swal.fire({
                        title: 'Información',
                        text: title,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                        .then((result) => {
                            if (result.value) {
                                if (this.from == 'transact2') {
                                    this.router.navigate(['/extranet/tray-transact/1']);
                                }
                            }
                        });

                } else if (res.P_COD_ERR == 1 || res.P_COD_ERR == 4 || res.P_SAPROBADO == 'A') {
                    this.isLoading = false;
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            if (this.from == 'transact1') {
                                this.router.navigate(['/extranet/tray-transact/1']);
                            } else if (this.from == 'transact2') {
                                this.router.navigate(['/extranet/tray-transact/2']);
                            } else {
                                this.router.navigate(['/extranet/request-status']);
                            }
                        }
                    });
                } else {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                }

            });
        }



    }

    async getTramaFileSCTR(item: any): Promise<any> {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = item.linea;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        return this.collectionsService.getTramaFileSCTR(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {

                    if (item.linea == 3) {
                        const nameFile: string = 'COTIZACION' + '_' + this.quotationNumber;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    } else {
                        const nameFile: string = item.desMov + '_' + this.quotationNumber;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    }
                }
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    async InsertPayNCTEMP() {
        this.CreditDataNC = JSON.parse(localStorage.getItem('creditdata'));
        this.cotizacionNC = JSON.parse(localStorage.getItem('policydata'));
        this.CanalNC = JSON.parse(localStorage.getItem('currentUser'));
        this.UserID = JSON.parse(localStorage.getItem('currentUser'))['id'];

        let NCRollQuotation: any = {};
        NCRollQuotation.ListainsertNCTEMP = [];

        for (let i = 0; i < this.CreditDataNC.length; i++) {
            const itemNCTEMP: any = {};
            itemNCTEMP.P_NID_COTIZACION = Number(this.cotizacion.numeroCotizacion);
            itemNCTEMP.P_NRECEIPT_NC = Number(this.CreditDataNC[i].documento_nc);
            itemNCTEMP.P_MONEDA = Number(this.inputsQuotation.CurrencyId) || Number(this.CreditDataNC.moneda) || 1;
            itemNCTEMP.P_NAMOUNT_NC = Number(this.CreditDataNC[i].monto);
            itemNCTEMP.P_SCODCHANNEL = Number(this.CanalNC.canal);
            itemNCTEMP.P_NIDPAYTYPE = this.CreditDataNC[i].forma_pago == 'NC' ? 4 : this.CreditDataNC[i].forma_pago || this.CreditDataNC[i].forma_pago == 'PCP' ? 7 : this.CreditDataNC[i].forma_pago;
            itemNCTEMP.P_NIDUSER = Number(this.UserID);
            itemNCTEMP.P_ESTADO = 1;
            itemNCTEMP.P_NTYPETRANSAC = this.nTransac != null ? this.nTransac : 0;
            itemNCTEMP.P_DESTYPETRANSAC = this.sAbrTran != null ? this.sAbrTran : 'NO HAY REGISTRO';

            NCRollQuotation.ListainsertNCTEMP.push(itemNCTEMP);
        }

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(NCRollQuotation));

        await this.accPersonalesService.insertNCTemp(myFormData).toPromise().then(async (res: any) => { });
    }

    formatoTrama() {
        const data: any = {};
        data.poliza = 0;
        this.isLoading = true;
        this.policyemit.DownloadExcelPlantillaVidaLey(data).toPromise().then(
            res => {
                const nameFile: string = 'TramaVl_Recotizacion'
                const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsm', { type: '	application/vnd.ms-excel.sheet.macroEnabled.12' });
                FileSaver.saveAs(file);
                this.isLoading = false;
            },
            err => {
                this.isLoading = false
            }
        )
    }

}
