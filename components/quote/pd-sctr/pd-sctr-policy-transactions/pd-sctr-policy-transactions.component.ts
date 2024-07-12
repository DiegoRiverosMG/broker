
import { PolizaAsegurados } from '../../../../models/polizaEmit/PolizaAsegurados';
import { TipoRenovacion } from '../../../../models/polizaEmit/TipoRenovacion';
import { FrecuenciaPago } from '../../../../models/polizaEmit/FrecuenciaPago';
import {
    PolizaEmitDet, PolizaEmitDetAltoRiesgo,
    PolizaEmitDetMedianoRiesgo, PolizaEmitDetBajoRiesgo
} from '../../../../models/polizaEmit/PolizaEmitDet';
import { Component, OnInit, Input, ViewChild, ElementRef, ɵConsole } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { ActivatedRoute, Route, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { ValErrorComponent } from '../../../../modal/val-error/val-error.component';
import { TransactService } from '../../../../services/transact/transact.service';
import { ProfileEsp } from '../../../../models/shared/client-information/Profile-Esp';

// Compartido
import { AccessFilter } from '../../../access-filter'
import { ModuleConfig } from '../../../module.config'
import { QuotationService } from '../../../../services/quotation/quotation.service';
// Modal
import { SearchBrokerComponent } from '../../../../modal/search-broker/search-broker.component';

// Util
import { CommonMethods } from '../../../common-methods'
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../../../../../app.config';
import { GenAccountStatusRequest } from '../../../../models/collection/gen-account-status-request';
import { GenAccountStatusResponse } from '../../../../interfaces/gen-account-status-response';
import { ValidateLockReponse } from '../../../../interfaces/validate-lock-response';
import { ValidateDebtRequest } from '../../../../models/collection/validate-debt.request';
import { ValidateDebtReponse } from '../../../../interfaces/validate-debt-response';
import { CobranzasService } from '../../../../services/cobranzas/cobranzas.service';
import { OthersService } from '../../../../services/shared/others.service';
import { ValidateLockRequest } from '../../../../models/collection/validate-lock-request';
import { AddContactComponent } from '../../../../modal/add-contact/add-contact.component';
import swal from 'sweetalert2';
import { FilePickerComponent } from '../../../../modal/file-picker/file-picker.component';
import { NgbNavbar } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown';
import { BehaviorSubject } from 'rxjs';
import { ParameterSettingsService } from '../../../../services/maintenance/parameter-settings.service';

@Component({
    selector: 'app-pd-sctr-policy-transactions',
    templateUrl: './pd-sctr-policy-transactions.component.html',
    styleUrls: ['./pd-sctr-policy-transactions.component.css']
})
export class PdSctrPolicyTransactionsComponent implements OnInit {
    nrocotizacion: any;
    flagAprovateTecnica: string = '';
    nroPoliza: any;
    savedPolicyList: any = [];
    savedPolicyEmit: any = {};
    @Input() public reference: any;
    @ViewChild('desde') desde: any;
    @ViewChild('desdeAseg') desdeAseg: any;
    @ViewChild('hasta') hasta: any;
    @ViewChild('fileInput', { static: false })
    myFileInput: ElementRef;
    accept = '*'
    files: File[] = []
    flagAltoP = false;
    flagBajoP = false;
    flagMedianoP = false;
    flagTipoR = false
    lastFileAt: Date
    lastInvalids: any
    maxSize: any
    primas: any = []
    flagExtension = false;
    tamañoArchivo = 0;
    disabledFecha = true;
    disabledFechaAseg = true;
    disabledFechaFin = true;
    errorFrecPago = false;
    loading = false;
    existoso = false;
    activacion = false;
    activacionFin = false;
    factorIgv: any;
    totalPension = 0;
    totalSalud = 0;
    activacionExitoso = false;
    nroSalud: any;
    nroPension: any;
    fechaEvento: any;
    flagFechaMenorMayor = true;
    flagFechaMenorMayorFin = true;
    clickValidarArchivos = false;
    clickValidarExcel = false;
    primMinimaPension: boolean = false
    primMinimaSalud: boolean = false
    isRateProposed: boolean = false // MRC
    valcheck1 = false
    valcheck2: boolean
    valcheck3: boolean
    asegurados: any = []
    cotizacionID: string = '';
    erroresList: any = [];
    changeList: any = [];
    saludList: any = [];
    pensionList: any = [];
    tasasList: any = [];
    disabledFlat: any = [];
    arrayRateProposed: any = [];// MRC
    categoryList: any = []// MRC
    commissionState: boolean = false // MRC
    rateByPlanList: any = []// MRC
    comisionList: any = []// MRC
    nidProc = '' // MRC
    // Datos para configurar los datepicker
    bsConfig: Partial<BsDatepickerConfig>;
    igvPension = 0;
    igvSalud = 0;
    igvPensionWS: number = 0.0;
    igvSaludWS: number = 0.0;

    /** prima total neta save */
    totalNetoSaludSave = 0.0;
    totalNetoPensionSave = 0.0;
    /** igv + de save */
    igvSaludSave = 0.0;
    igvPensionSave = 0.0;
    /** prima bruta save */
    brutaTotalSaludSave = 0.0;
    brutaTotalPensionSave = 0.0;

    mensajePrimaPension = '';
    mensajePrimaSalud = '';

    isValidatedInClickButton: boolean = false;
    ValFecha: boolean = false;
    excelSubir: File;
    errorExcel = false;
    errorNroCot = false;
    excelJson: any[] = [];
    archivosJson: any[] = [];
    mensajeValidacion = '';
    indentificacion = '';
    editFlag = true;
    flagColumnas = false;
    primaTotalPension = 0;
    primatotalSalud = 0;
    fechaIniEsp: any = ''; //fecha inicio renovacion 6 - VL
    fechaFinEsp: any = ''; // fecha fin renovacion 6 - VL
    validaciones = [];
    validacionIndentifacion = [];
    validacionIndentifacionRUC20 = [];
    validacionIndentifacionRUC10 = [];
    mensajeValidacionInd = '';
    objcolumnas = [];
    objcolumnasRuc20 = [];
    objcolumnasRuc10 = [];
    polizaEmit: any = {};
    polizaEmitCab: any = [];
    camposValidar: any = [] // MRC
    camposValidar_ERROR: any = [] // MRC
    polizaEmitComer: any = [];
    // polizaEmitComerDTOPrincipal: any = {};
    polizaEmitComerDTO: any = {};
    polizaEmitDet: any = [];
    polizaEmitComerPrincipal: any = [];
    polizaEmitDetDTO: PolizaEmitDet = new PolizaEmitDet();
    polizaEmitDetAltoRiesgo: PolizaEmitDetAltoRiesgo = new PolizaEmitDetAltoRiesgo();
    polizaEmitDetMedianoRiesgo: PolizaEmitDetMedianoRiesgo = new PolizaEmitDetMedianoRiesgo();
    polizaEmitDetBajoRiesgo: PolizaEmitDetBajoRiesgo = new PolizaEmitDetBajoRiesgo();
    polizaAsegurados: PolizaAsegurados = new PolizaAsegurados();
    profileEsp: ProfileEsp[];
    tipoRenovacion: any = [];
    frecuenciaPago: any = [];
    validateLockResponse: ValidateLockReponse = {};

    // tipo endoso
    tipoEndoso: any = [];

    polCabDate: any = [];

    fechaCheck: boolean = true;
    // tableComer = false;
    processID = '';
    mode = ''; // emitir, incluir, renovar : emit, include, renew
    title: string; // titulo del formulario
    stateBrokerSalud = true;
    stateBrokerPension = true;
    statePrimaSalud = true;
    statePrimaPension = true;
    stateCotizadorSalud = true;
    stateCotizadorPension = true;
    stateBrokerTasaSalud = true;
    stateBrokerTasaPension = true;
    stateTasaSalud = true;
    stateTasaPension = true;
    stateTransac = true;
    objEdit: any = [];
    numberWH: number;
    workerMin = 0;
    workerMax = 70;
    municipalityTariff = 0;
    typeMovement: string;
    resList: any = [];
    discountPension = '';
    discountSalud = '';
    activityVariationPension = '';
    activityVariationSalud = '';
    commissionPension = '';
    commissionSalud = '';
    /** Perfil externo */
    prodPension = false;
    prodSalud = false;
    stateWorker = false;
    messageWorker = '';
    totalTrabajadoresSalud = 0;
    totalTrabajadoresPension = 0;
    retarifa = '0';
    endosoPension: string;
    endosoSalud: string;
    questionText: string;
    responseText: string;
    retarif: number;
    facAnticipada: boolean = true;
    facVencido: boolean = false;
    annulmentList: any = [];
    annulmentID: any = null
    fechaBase: any = '';
    fechaBaseHasta: any = '';
    minPension: any = '';
    minSalud: any = '';
    canBillMonthly: boolean = true;
    canBillInAdvance: boolean = true;
    canAddSecondaryBroker: boolean = true;
    canProposeComission: boolean = true;
    canProposeMinimunPremium: boolean = true;
    dayConfig: any = 30;
    canRenew = true;
    nroMovimientoEPS: any = null;
    nroPolizaEps: any = null;
    //planId: any = null;
    DescriptPlan: any = null;
    mensajeEquivalente: string = ''
    disabledEps = false;
    sprimaMinima = 'PRIMA MÍNIMA PENSIÓN';
    isProposedCommission = false;
    canTasaVL = true;
    codProductoLoad: any;
    flagCotN = 'N';
    flagCotF = 'F';
    detailPlanList: any = [];
    amountPremiumList: any = [];
    amountDetailTotalList: any = [];
    btnCotiza: boolean = true;
    btnNormal: boolean = true;
    commissionValue = '';
    stateRiskType = true;
    flagContact: boolean = false;
    flagEmail: boolean = false;
    enabledFrecPago: boolean = false;
    rechazoMotivoList: any = []; //motivos de rechazo tramites.
    rechazoMotivoID: any = null;
    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    saludID = JSON.parse(localStorage.getItem('saludID'));
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    perfil = '';
    codFlat = '';
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    codProfile: any;
    codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
    // epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    template: any = {};
    variable: any = {};
    creditHistory: any = null;
    alertGrati = '';
    clienteValido = false
    dEmiPension = 0;
    dEmiSalud = 0;
    lblProducto: string = '';
    lblFecha: string = '';
    paymentType: any = null;
    visaData: any;
    // prePayment: boolean = false;
    modalRef: BsModalRef;
    @ViewChild('peModal') content;
    contractingdata: any = [];
    monthPerPay: number = 1;
    transaccionProtecta: any;
    transaccionMapfre: any;
    transaccionBroker: any;
    dataCIP: any;
    perfilActual: any;
    validateDebtResponse: ValidateDebtReponse = {};
    flagDisabledRestric: boolean = false;
    contactList: any = [];
    monthsSCTR: any; //AVS Nueva Estimacion de Calculo 23/12/2022

    DateMinFechaIniAseg: Date;
    DateFinFechaIniAseg: Date;

    // variables de prueba para abrir modal de pagos
    modal: any = {};
    cotizacion: any = {};

    planPropuesto: '';
    planList: any = [];
    descPlanBD: '';

    private myMethodSubject = new BehaviorSubject<string>(null);

    stran: string = '';
    isDeclare: boolean = false; // Declaraciones Vida Ley EH

    retroVal = 0;
    retroMsg: string = '';
    FechaEfectoInicial: Date;

    tituloMonto = '';
    nbranch: any = '';
    flagConfirm: any = 0;

    /* Gestión de trámite EHH */
    isUserOp: boolean = false;
    isUserCom: boolean = false;
    isUserExt: boolean = false;
    nTransac: number = 0;
    sAbrTran: string = '';
    sTransac: string = '';
    infoTransact: any = {};
    transactNumber = 0;
    statusChangeList: any = [];
    currentPage = 1; // página actual
    rotate = true; //
    // maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; // total de items encontrados
    listToShow: any = [];
    statusTransact = "";
    flagProcesar: boolean = true;
    buttonName = "";
    msgDerivar = "";
    statusDeriva = 0;
    modificarTransact: boolean = false;
    fileCarta: File[] = []
    sclientComer = "";
    sclientComerNew = "";
    existsOldTransact: boolean = false
    anularTramite: boolean = false;
    isComerExclu = 0;
    resProfileOpe: any = [];
    resProfileComerEx: any[] = [];
    isProfileOpe = 0;
    reingresarTransact: boolean = false;

    BrokerDep = []; // R.P.
    selectedDep = []; // R.P.
    BrokerObl = []; // R.P.
    inputsValidate: any = {};
    flagEstadoReingresar: boolean;
    economicActivityList: any = [];
    technicalList: any = [];
    activityMain = '';
    subActivity = '';
    flagAprob: boolean = false;
    flagIsMatriz: boolean;
    flagGobiernoEstado: boolean = false;
    flagEnvioEmail = 0;
    flagAprobCli: boolean = false;
    flagDisableAprob: boolean = false;
    emsionDirecta = '';
    flagEstadoTransacReingresar: boolean;
    flagEstadoCertificado: boolean = false;
    flagMatrizCert: boolean = false;
    datasavecertificados: any = {};
    dataEstadoCertif: any = {};
    //EAER - Gestion Tramites Estado - 13092022
    countinputEMP = 0;
    planillainputEMP = 0;
    tasainputEMP = 0;
    MontoSinIGVEMP = 0;
    countinputOBR = 0;
    planillainputOBR = 0;
    tasainputOBR = 0;
    MontoSinIGVOBR = 0;
    countinputOAR = 0;
    planillainputOAR = 0;
    tasainputOAR = 0;
    MontoSinIGVOAR = 0;
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
    MontoFPSinIGVEMP = 0;
    MontoFPSinIGVOBR = 0;
    MontoFPSinIGVOAR = 0;
    MontoFPSinIGVEE = 0;
    MontoFPSinIGVOE = 0;
    MontoFPSinIGVOARE = 0;
    TotalFPSinIGV = 0;
    TotalFPConIGV = 0;
    flagActivateExc = 0;
    chkTope = 0;
    // para calculos en reingreso
    v_MontoSinIGVEMP = 0;
    v_MontoSinIGVOBR = 0;
    v_MontoSinIGVOAR = 0;
    v_MontoSinIGVEE = 0;
    v_MontoSinIGVOE = 0;
    v_MontoSinIGVOARE = 0;
    categoryPolizaMatList: any = [{ 'NCATEGORIA': '1', 'SCATEGORIA': 'Empleado', 'sactive': false }, { 'NCATEGORIA': '2', 'SCATEGORIA': 'Obrero', 'sactive': false },
    { 'NCATEGORIA': '3', 'SCATEGORIA': 'Obrero Alto Riesgo', 'sactive': false }, { 'NCATEGORIA': '5', 'SCATEGORIA': 'Empleado Excedente', 'sactive': false },
    { 'NCATEGORIA': '6', 'SCATEGORIA': 'Obrero Excedente', 'sactive': false }, { 'NCATEGORIA': '7', 'SCATEGORIA': 'Obrero Alto Riesgo Excedente', 'sactive': false }];
    //EAER - Gestion Tramites Estado - 13092022

    bsValueIniRetroactividad: any; //AGF 22/03/2023

    //INI - AVS INTERCONEXION SABSA
    RenewSCTR: any;
    valMixSAPSA: any;
    dataEmi_EPS: any = {};
    valSALUD_SCTR: any;
    payPF = 0;
    ListainsertEmit: any = [];
    dataTransaccionDet: any = {};
    usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
    montos_sctr: any = [];
    DataSCTRPENSION: any = [];
    DataSCTRSALUD: any = [];
    files_adjuntos: string[] = [];
    flagCheckboxComisionPension: boolean = false;
    flagCheckboxComisionSalud: boolean = false;
    comPropuestaSalud: boolean = false;
    comPropuestaPension: boolean = false;
    npremiumnExec_Pension: any;
    npremiumn_oriExec_Pension: any; 
    nigvExec_Pension: any; 
    npremiumExec_Pension: any; 
    npremiumnExec_Salud: any;
    npremiumn_oriExec_Salud: any; 
    nigvExec_Salud: any; 
    npremiumExec_Salud: any; 
    //FIN - AVS INTERCONEXION SABSA
    SaludBruta: any;
    PensionBruta: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private policyService: PolicyemitService,
        private policyemit: PolicyemitService,
        private quotationService: QuotationService,
        private clientInformationService: ClientInformationService,
        private toastr: ToastrService,
        private readonly modalServiceInfo: BsModalService,
        private datePipe: DatePipe,
        private readonly appConfig: AppConfig,
        private modalService: NgbModal,
        private collectionsService: CobranzasService,
        private othersService: OthersService,
        private transactService: TransactService,
        private parameterSettingsService: ParameterSettingsService) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }

    async ngOnInit() {
        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE);
        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);
        this.getProfileEsp();
        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME);
        this.lblFecha = CommonMethods.tituloPantalla();
        this.perfil = this.variable.var_prefilExterno;
        this.codFlat = this.variable.var_flatKey;
        this.codProfile = await this.getProfileProduct(); // 20230325;
        this.perfilActual = await this.getProfileProduct(); // 20230325;
        await this.getPerfilTramiteOpe();
        // await this.getPerfilComerEx();
        this.isComerExclu = this.codProfile == '164' || this.perfilActual == '134' ? 1 : 0; //
        // console.log(this.isComerExclu);
        // this.isProfileOpe = this.resProfileOpe.P_NFLAG_PERFIL;

        this.polizaEmit.facturacionVencido = false;
        this.polizaEmit.facturacionAnticipada = false;
        this.polizaEmit.totalTrabajadores = '';
        this.polizaEmit.comentario = '';

        this.loading = true;
        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        await this.obtenerTipoRenovacion();
        await this.motivosAnulacion();
        await this.getDataConfig();
        await this.getDataIgv();
        //await this.getComisionList();
        await this.getPlanList();// MSR
        await this.getTypeEndoso();
        await this.getDepartamento(); // R.P.
        await this.getBrokerObl();  // R.P.
        await this.getTechnicalActivityList(this.codProducto);
        if (this.nbranch == 73) { await this.motivorechazoTramite(); }
        this.camposValidar[0] = '';
        this.camposValidar[1] = '';

        if (!this.template.ins_clienteRegula) { this.clienteValido = true; }
        this.polizaEmitCab.bsValueIni = new Date();
        this.polizaEmitCab.bsValueFin = new Date();
        this.polizaEmitCab.bsValueIniMin = new Date();
        this.polizaEmitCab.bsValueFinMax = new Date();
        this.codProducto == 3 ? this.polizaEmitCab.FDateIniAseg : this.polizaEmitCab.FDateIniAseg = new Date();
        this.codProducto == 3 ? this.polizaEmitCab.FDateFinAseg : this.polizaEmitCab.FDateFinAseg = new Date();
        this.polizaEmitCab.FDateEffectBroker = new Date();
        this.polizaEmitCab.TIPO_DOCUMENTO = '';
        this.polizaEmitCab.tipoRenovacion = '';
        this.polizaEmitCab.ACT_TECNICA = '';
        this.polizaEmitCab.COD_ACT_ECONOMICA = '';
        this.polizaEmitCab.COD_TIPO_SEDE = '';
        this.polizaEmitCab.COD_MONEDA = '';
        this.polizaEmitCab.COD_DEPARTAMENTO = '';
        this.polizaEmitCab.COD_PROVINCIA = '';
        this.polizaEmitCab.COD_DISTRITO = '';
        this.polizaEmitCab.frecuenciaPago = '';
        this.polizaEmitCab.P_COMISION = '';
        this.polizaEmitCab.prePayment = false;
        if (this.template.ins_validaPermisos) {
            this.canProposeComission = AccessFilter.hasPermission('6');
            this.canAddSecondaryBroker = AccessFilter.hasPermission('7');
            this.canProposeMinimunPremium = AccessFilter.hasPermission('8');
            this.canBillMonthly = AccessFilter.hasPermission('16');
            this.canBillInAdvance = AccessFilter.hasPermission('17');
        }

        this.disabledFlat = CommonMethods.generarCampos(20, 1);

        this.mode = this.route.snapshot.paramMap.get('mode');
        if (this.mode == 'include') { // inclusion
            this.title = 'Inclusión en Póliza';
            this.typeMovement = '2';
            this.questionText = '¿Desea realizar la inclusión de asegurados?';
            this.responseText = 'Se ha realizado la inclusión con constancia N° ';
            if (this.template.ins_validaPermisos) { if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_inclusion']) == false) { this.router.navigate(['/extranet/home']); } }
        } else if (this.mode == 'renew') { // renovar
            this.title = Number(this.codProducto) === 3 ? 'Declarar Póliza' : 'Renovación de Póliza';
            this.typeMovement = '4';
            this.questionText = '¿Deseas hacer la renovación de la póliza?';
            this.responseText = 'Se ha realizado la renovación con constancia N° ';
            if (this.template.ins_validaPermisos) { if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_inclusion']) == false) { this.router.navigate(['/extranet/home']); } }
        } else if (this.mode == 'cancel') { // anular
            this.title = 'Anular Póliza';
            this.typeMovement = '7';
            this.questionText = '¿Deseas hacer la anulación de la póliza?';
            this.responseText = 'Se ha realizado la anulación correctamente';
            if (this.template.ins_validaPermisos) { if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_cancel']) == false) { this.router.navigate(['/extranet/home']); } }
        } else if (this.mode == 'exclude') { // excluir
            this.title = 'Excluir en Póliza';
            this.typeMovement = '3';
            this.questionText = '¿Deseas hacer la exclusión de asegurados?';
            this.responseText = 'Se ha realizado la exclusión con constancia N° ';
            this.tituloMonto = 'Monto a devolver';
            if (this.template.ins_validaPermisos) { if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_exclusion']) == false) { this.router.navigate(['/extranet/home']); } }
        } else if (this.mode == 'endosar') { // endosar
            this.title = 'Endosar Póliza';
            this.typeMovement = '8';
            this.questionText = '¿Deseas hacer el endoso de la póliza?';
            this.responseText = 'Se ha realizado el endoso correctamente';
            this.tituloMonto = 'Monto a pagar';
            if (this.template.ins_validaPermisos) { if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_endorsement']) == false) { this.router.navigate(['/extranet/home']); } }
        } else if (this.mode == 'netear') { // netear
            this.title = 'Neteo de Póliza';
            this.typeMovement = '5';
            this.questionText = '¿Deseas hacer el neteo de la póliza?';
            this.responseText = 'Se ha realizado el neteo con constancia N° ';
            if (this.template.ins_validaPermisos) { if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_neteo']) == false) { this.router.navigate(['/extranet/home']); } }
        } else if (this.mode == 'broker') { // modificacion de broker
            this.title = 'Modificar Broker';
            this.typeMovement = '2';
            this.questionText = '¿Deseas hacer la modificacion de broker?';
            this.responseText = 'Se ha realizado la modificación del broker';
        } else if (this.mode == 'certificate') { // emitir certificados
            this.title = 'Emitir Certificados';
            this.typeMovement = '14';
            this.questionText = '¿Deseas hacer la emisión de certificados?';
            this.responseText = 'Se ha realizado la emisión de certificados';
        }
        else if (this.mode == 'emit') { // emitir poliza estado reingreso
            this.title = 'Emitir Póliza';
            this.typeMovement = '1';
            this.questionText = '¿Deseas hacer la emisión dela Póliza?';
            this.responseText = 'Se ha realizado la emisión de la póliza';
        }
        else if (this.mode == 'emit-matrix') { // emitir poliza matriz estado reingreso
            this.title = 'Emitir Póliza Matriz';
            this.typeMovement = '1';
            this.questionText = '¿Deseas hacer la emisión de la Póliza Matriz?';
            this.responseText = 'Se ha realizado la emisión de la póliza matriz';
        }

        this.route.queryParams
            .subscribe(params => {
                this.nrocotizacion = params.nroCotizacion,
                    this.nroPoliza = params.nroPoliza,
                    this.modificarTransact = params.updTr == 1 ? true : false;
                this.reingresarTransact = params.updTr == 2 ? true : false;
                this.flagAprovateTecnica = params.fromTecnica;
            });
        this.SetTransac();

        if (this.nrocotizacion == undefined) {
            await this.getComisionList(0);
        } else {
            await this.getComisionList(this.nrocotizacion);
        }

        if (this.nrocotizacion != undefined) {
            await this.policyemit.valTransactionPolicy(this.nrocotizacion).toPromise().then(
                async res => {
                    if (res.P_COD_ERR == '0') {
                        await this.buscarCotizacion();
                        if (this.transactNumber != 0) {
                            await this.GetInfoTransact();
                            if (this.mode == 'emit-matrix') {
                                this.changeFPMontoSinIGV(); //para cargar los valores por frecuencia
                                this.getEconomicActivityList(this.polizaEmitCab.ACT_TEC_VL);
                            }
                        }

                        else { await this.GetInfoLastTransact(); }
                    } else {
                        this.loading = false;
                        swal.fire('Información', res.P_MESSAGE, 'error')
                            .then((value) => {
                                this.router.navigate(['/extranet/sctr/consulta-polizas']);
                            });
                    }
                },
                err => {
                    this.loading = false;
                }
            );

            if (this.template.ins_prePaymentTrx && (this.typeMovement == '2' || this.typeMovement == '4')) {
                await this.checkPaymentTypes(this.currentUser);
            }

        }

        this.stran = this.mode == 'emit' ? "EM" : this.mode == 'include' ? "IN" : this.mode == 'endosar' ? 'EN' : this.mode == 'exclude' ? "EX" : this.isDeclare ? "DE" : "RE";
        if (this.mode == 'renew') { this.clienteValido = true; } // AGF 02052023
        this.loading = false;
        this.FechaEfectoInicial = this.polizaEmitCab.FDateIniAseg;
        if (this.transactNumber == 0 || this.transactNumber == undefined) this.polizaEmitCab.FDateEffectBroker = new Date();

        this.inputsValidate = CommonMethods.generarCampos(30, 0); // R.P.


        //AGF 22032023 Inicio Agregando fechas minima y maxima permitida SCTR
        this.bsValueIniRetroactividad = new Date();
        let bsValueIniMaxRetroactividad = new Date();
        bsValueIniMaxRetroactividad.setDate(bsValueIniMaxRetroactividad.getDate() + 5);
        this.bsValueIniRetroactividad.setDate(this.bsValueIniRetroactividad.getDate() - 5);

        if (this.codUser == 12340 && this.mode == 'include' || this.mode == 'renew') {

            if (this.bsValueIniRetroactividad < this.polizaEmitCab.bsValueIni) {
                this.polizaEmitCab.bsValueFinMax = bsValueIniMaxRetroactividad;
            }

            else {
                this.polizaEmitCab.bsValueIniMin = this.bsValueIniRetroactividad;
                this.polizaEmitCab.bsValueFinMax = bsValueIniMaxRetroactividad;

                if (this.bsValueIniRetroactividad > this.polizaEmitCab.bsValueIni) { }
                else {
                    this.polizaEmitCab.bsValueIniMin = this.bsValueIniRetroactividad;
                }
            }

        }
        //AGF 22032023 Fin

        // Solo para la renovacion cuando deriva a tecnica
        if (this.mode === 'renew' && this.flagAprovateTecnica === 'renewAprove') {
            await this.policyemit.GetProcessTrama(this.nrocotizacion).toPromise().then(async(res) => {
                this.processID = res.NID_PROC;
                if (res.NCODE == 0) {
                    await this.infoCarga(this.processID);
                    await this.callButtonPE();
                }
            })
        }
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

    // R.P.
    async getDepartamento() {
        await this.clientInformationService.GetBrkDepartamento(this.nbranch, 1).toPromise().then(
            res => {
                this.BrokerDep = res;
            },
            err => {
            }
        );
    }

    async getBrokerObl() {
        await this.clientInformationService.GetBrkObl(this.nbranch).toPromise().then(
            res => {
                this.BrokerObl = res;
            },
            err => {
            }
        );
    }

    // R.P.

    getProfileEsp() {
        this.clientInformationService.getProfileEsp().subscribe(
            res => {
                this.profileEsp = res;
            },
            err => { }
        );
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

                if (this.isProfileOpe == 1) {
                    this.isUserOp = true;
                } else {
                    if (this.codProfile == this.perfil) {
                        this.isUserExt = true;
                    } else {
                        this.isUserCom = true;
                    }
                }
            },
            error => {

            }
        );
    }

    /**
    * Obtener flag de perfil Ope
    */
    async getPerfilComerEx() {
        let dataQuotation: any = {};
        dataQuotation.P_NBRANCH = await CommonMethods.branchXproduct(this.codProducto);
        dataQuotation.P_NPRODUCT = 1;
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NPERFIL = this.codProfile;
        this.transactService.getPerfilComercialEx(dataQuotation).subscribe(
            res => {
                this.resProfileComerEx = res;
            },
            error => {

            }
        );
    }

    async getDataIgv() {

        const data = ['I', 'D'];

        // Pension
        for (const item of data) {
            const itemIGV: any = {};
            itemIGV.P_NBRANCH = this.pensionID.nbranch;
            itemIGV.P_NPRODUCT = this.pensionID.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.igvPensionWS = item == 'I' ? res : this.igvPensionWS;
                    this.dEmiPension = item == 'D' ? res : this.dEmiPension;
                }
            );
        }

        // Salud
        for (const item of data) {
            const itemIGV: any = {};
            itemIGV.P_NBRANCH = this.saludID.nbranch;
            itemIGV.P_NPRODUCT = this.saludID.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.igvSaludWS = item == 'I' ? res : this.igvSaludWS;
                    this.dEmiSalud = item == 'D' ? res : this.dEmiSalud;
                }
            );
        }

        // Vida  Ley
        // let itemIGV: any = {};
        // itemIGV.P_NBRANCH = 1;
        // itemIGV.P_NPRODUCT = this.vidaLeyID;
        // itemIGV.P_TIPO_REC = 'A';

        // await this.quotationService.getIGV(itemIGV).toPromise().then(
        //     res => {
        //         this.vidaLeyIGV = res
        //     }
        // );
    }

    async checkPaymentTypes(user: any) {
        await this.policyemit.checkPaymentTypes(user).toPromise().then(
            res => {
                this.paymentType = res;
            },
            error => {
                if (error.status == 401) {
                    swal.fire('Información', 'Su sesión ha terminado, vuelva a ingresar', 'question')
                        .then((value) => {
                            this.router.navigate(['/extranet/login']);
                        });
                }
            }
        );
    }

    changeRateProposed(event, valor, row) {
        this.arrayRateProposed = [];

        if (this.categoryList.length > 0) {
            this.categoryList.forEach(element => {
                if (element.ProposalRate == undefined) { } else { this.arrayRateProposed.push(element.ProposalRate) };
            });
        }
        if (this.categoryList.length == this.arrayRateProposed.length) {
            this.isRateProposed = true;
            this.validarExcel(-1);
        }
    }

    valClear(idx) {
        this.camposValidar[idx] = '';
    }

    onProposed(event) {
        if (event.target.checked) {
            this.commissionState = false;
            this.pensionList = [];
            // this.rateByPlanList = [];
            this.categoryList = [];
            this.rateByPlanList = [];
        }
        else {
            this.commissionState = true;
            this.polizaEmitCab.commissionProposed = null;
            this.polizaEmitCab.rateObrProposed = null;
            this.polizaEmitCab.rateEmpProposed = null;
            this.camposValidar[0] = '';
        }
    }

    validateDecimal(int, index) {
        let input: any;
        if (index == 0) {
            input = this.polizaEmitCab.commissionProposed;
        }

        if (input != null && input != '') {
            var result = CommonMethods.validateEnteros(int, input);
            if (result != '') {
                this.camposValidar[index] = index.toString();
                this.camposValidar_ERROR[index] = result;
            }
            else {
                this.camposValidar[index] = '';
            }
        }
    }

    getComisionList(nrocotizacion: any) {
        this.quotationService.getComisionList(nrocotizacion).subscribe(
            res => {
                this.comisionList = res;
            }
        );
    }

    async getPlanList() {
        const data = {
            P_NBRANCH: this.vidaLeyID.nbranch,
            P_NPRODUCT: this.vidaLeyID.id,
            P_NTIP_RENOV: 0,
            P_NCURRENCY: this.polizaEmitCab.COD_MONEDA == null ? 1 : this.polizaEmitCab.COD_MONEDA,
            P_NIDPLAN: 0
        }
        await this.quotationService.getPlans(data).toPromise().then(
            res => {
                this.planList = res;
            },
            err => {
            }
        );
    }

    getDataConfig() {
        this.policyemit.getDataConfig('DIASADD_EMISION').toPromise().then(
            res => {
                if (res[0] != undefined) {
                    this.dayConfig = Number(res[0].SDATA);
                }
            }
        );
    }

    onFacturacion() {
        if (this.excelSubir != undefined) { // AGF 02052023
            this.validarExcel(undefined, true);
            this.resetearPrimas(this.polizaEmitCab.PRIMA_PEN_END, this.pensionID.id, this.polizaEmit.facturacionVencido)
            this.resetearPrimas(this.polizaEmitCab.PRIMA_SALUD_END, this.saludID.id, this.polizaEmit.facturacionVencido)

            this.facAnticipada = this.polizaEmit.facturacionVencido ? true : false
            this.facVencido = this.polizaEmit.facturacionAnticipada ? true : false

            if (!this.polizaEmit.facturacionVencido && !this.polizaEmit.facturacionAnticipada) {
                this.facVencido = false;
                this.facAnticipada = false;
            }
        }

    }

    changePlanilla(cantPlanilla, valor) {
        let totPlan = cantPlanilla != '' ? Number(cantPlanilla) : 0;
        totPlan = isNaN(totPlan) ? 0 : totPlan;
        let netoPension = 0;
        let netoSalud = 0;
        let self = this;
        this.retarifa = '1';

        // Lista Salud
        if (this.saludList.length > 0) {
            this.saludList.map(function (dato) {
                if (dato.TIP_RIESGO == valor) {
                    dato.MONTO_PLANILLA = totPlan;
                    dato.PRIMA = CommonMethods.formatValor((totPlan * Number(dato.TASA_CALC)) / 100, 2);
                }
                netoSalud = netoSalud + Number(dato.PRIMA)
            });
            this.primatotalSalud = CommonMethods.formatValor(netoSalud, 2);
            this.igvSalud = CommonMethods.formatValor((this.primatotalSalud * this.igvSaludWS) - this.primatotalSalud, 6);
            let totalPreviewSalud = Number(this.primatotalSalud) + Number(this.igvSalud);
            this.totalSalud = CommonMethods.formatValor(totalPreviewSalud, 6)

            if (Number(this.primatotalSalud.toString()) < this.polizaEmitCab.PRIMA_SALUD_END) {
                // console.log(this.totalNetoSaludSave);
                this.totalNetoSaludSave = this.polizaEmitCab.PRIMA_SALUD_END;
                this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 6);
                this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.totalNetoSaludSave) + Number(this.igvSaludSave), 6);
                this.mensajePrimaSalud = this.variable.var_msjPrimaMin;
            } else {
                this.mensajePrimaSalud = '';
                this.totalNetoSaludSave = this.primatotalSalud;
                this.igvSaludSave = this.igvSalud;
                this.brutaTotalSaludSave = this.totalSalud;
            }
        }

        // Lista Pension
        if (this.pensionList.length > 0) {
            this.pensionList.map(function (dato) {
                if (dato.TIP_RIESGO == valor) {
                    dato.MONTO_PLANILLA = totPlan;
                    dato.PRIMA = CommonMethods.formatValor((totPlan * Number(dato.TASA_CALC)) / 100, 2);
                }
                netoPension = netoPension + Number(dato.PRIMA)
            });
            this.primaTotalPension = CommonMethods.formatValor(netoPension, 2);
            this.igvPension = CommonMethods.formatValor((this.primaTotalPension * this.igvPensionWS) - this.primaTotalPension, 6);
            let totalPreviewPension = Number(this.primaTotalPension) + Number(this.igvPension);
            this.totalPension = CommonMethods.formatValor(totalPreviewPension, 6)


            if (Number(this.primaTotalPension.toString()) < this.polizaEmitCab.PRIMA_PEN_END) {
                this.totalNetoPensionSave = this.polizaEmitCab.PRIMA_PEN_END;
                this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 6);
                this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.totalNetoPensionSave) + Number(this.igvPensionSave), 6);
                this.mensajePrimaPension = this.variable.var_msjPrimaMin;
            } else {
                this.mensajePrimaPension = ''
                this.totalNetoPensionSave = this.primaTotalPension
                this.igvPensionSave = this.igvPension;
                this.brutaTotalPensionSave = this.totalPension;
            }
        }
    }

    changePrimaPropuesta(cantPrima, valor) {
        let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
        totPrima = isNaN(totPrima) ? 0 : totPrima;
        let self = this;

        // Lista Salud
        if (this.saludList.length > 0) {
            if (totPrima > 0 && this.saludID.id == valor) {
                if (Number(this.primatotalSalud.toString()) < totPrima) {
                    this.totalNetoSaludSave = CommonMethods.formatValor(totPrima, 2);
                    // console.log(this.totalNetoSaludSave);
                    this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 6);
                    this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.totalNetoSaludSave.toString()) + Number(this.igvSaludSave.toString()), 6);
                    this.mensajePrimaSalud = this.variable.var_msjPrimaMin;
                } else {
                    this.mensajePrimaSalud = ''
                    this.totalNetoSaludSave = this.primatotalSalud
                    this.igvSaludSave = this.igvSalud;
                    this.brutaTotalSaludSave = this.totalSalud;
                }
            } else {
                if (this.saludID.id == valor) {
                    if (Number(this.primatotalSalud.toString()) < this.polizaEmitCab.PRIMA_SALUD_END) {
                        this.totalNetoSaludSave = CommonMethods.formatValor(this.polizaEmitCab.PRIMA_SALUD_END, 2)
                        this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 6);
                        this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.totalNetoSaludSave.toString()) + Number(this.igvSaludSave.toString()), 6);
                        this.mensajePrimaSalud = this.variable.var_msjPrimaMin;
                    } else {
                        this.mensajePrimaSalud = ''
                        this.totalNetoSaludSave = this.primatotalSalud
                        this.igvSaludSave = this.igvSalud;
                        this.brutaTotalSaludSave = this.totalSalud;
                    }
                }
            }
        }

        // Lista Pension
        if (this.pensionList.length > 0) {
            if (totPrima > 0 && this.pensionID.id == valor) {
                if (Number(this.primaTotalPension.toString()) < totPrima) {
                    this.totalNetoPensionSave = CommonMethods.formatValor(totPrima, 6) //AVS Nueva Estimacion de Calculo 23/12/2022
                    this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 6);
                    this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.totalNetoPensionSave.toString()) + Number(this.igvPensionSave.toString()), 6);
                    this.mensajePrimaPension = this.variable.var_msjPrimaMin;
                } else {
                    this.mensajePrimaPension = ''
                    this.totalNetoPensionSave = this.primaTotalPension
                    this.igvPensionSave = this.igvPension;
                    this.brutaTotalPensionSave = this.totalPension;
                }
            } else {
                if (this.pensionID.id == valor) {
                    if (Number(this.primaTotalPension.toString()) < this.polizaEmitCab.PRIMA_PEN_END) {
                        this.totalNetoPensionSave = CommonMethods.formatValor(this.polizaEmitCab.PRIMA_PEN_END, 6) //AVS Nueva Estimacion de Calculo 23/12/2022
                        this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 6);
                        this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.totalNetoPensionSave.toString()) + Number(this.igvPensionSave.toString()), 6);
                        this.mensajePrimaPension = this.variable.var_msjPrimaMin;
                    } else {
                        this.mensajePrimaPension = ''
                        this.totalNetoPensionSave = this.primaTotalPension
                        this.igvPensionSave = this.igvPension;
                        this.brutaTotalPensionSave = this.totalPension;
                    }
                }
            }

        }

    }

    comisionPropuesta(porPropuesto, fila, tipoId) {
        porPropuesto = !isNaN(Number(porPropuesto)) ? Number(porPropuesto) : 0
        let sumComision = 0

        this.polizaEmitComer.forEach(broker => {
            broker.COMISION_PENSION_PRO = tipoId == 1 ? porPropuesto : broker.COMISION_PENSION_PRO
            broker.COMISION_SALUD_PRO = tipoId == 2 ? porPropuesto : broker.COMISION_SALUD_PRO
            sumComision = tipoId == 1 ? sumComision + broker.COMISION_PENSION_PRO : sumComision + broker.COMISION_SALUD_PRO
        });

        if (sumComision > 100) {
            this.polizaEmitComer[fila].valItemPen = tipoId == 1 ? true : this.polizaEmitComer[fila].valItemPen
            this.polizaEmitComer[fila].valItemSal = tipoId == 2 ? true : this.polizaEmitComer[fila].valItemSal
        }
        else {
            this.polizaEmitComer[fila].valItemPen = tipoId == 1 ? false : this.polizaEmitComer[fila].valItemPen
            this.polizaEmitComer[fila].valItemSal = tipoId == 2 ? false : this.polizaEmitComer[fila].valItemSal
        }
    }



    changeTasaPropuestaPension(planPro, valor) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;

        if (planProp > 100) {
            this.pensionList.forEach(item => {
                if (item.DES_RIESGO == valor) {
                    item.valItem = true;
                }
            });
        }
        else {
            this.pensionList.forEach(item => {
                if (item.DES_RIESGO == valor) {
                    item.valItem = false;
                }
            });
        }

        // Lista Pension
        if (this.pensionList != '') {
            this.pensionList.map(function (dato) {
                if (dato.DES_RIESGO == valor) {
                    dato.TASA_PRO = planProp;
                }
            });
        }

        let tasa = 0;
        this.pensionList.map((item) => {
            this.calculateNewPremiums(tasa = (item.TASA_PRO == '' || item.TASA_PRO == 0) ? item.TASA_CALC : item.TASA_PRO, item.TIP_RIESGO, this.pensionID.id);
            item.valItem = false;
        });
    }

    changeTasaPropuestaSalud(planPro, valor) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;

        if (planProp > 100) {
            this.saludList.forEach(item => {
                if (item.DES_RIESGO == valor) {
                    item.valItem = true;
                }
            });
        }
        else {
            this.saludList.forEach(item => {
                if (item.DES_RIESGO == valor) {
                    item.valItem = false;
                }
            });
        }

        // Lista Salud
        if (this.saludList != '') {
            this.saludList.map(function (dato) {
                if (dato.DES_RIESGO == valor) {
                    dato.TASA_PRO = planProp;
                }
            });
        }

        let tasa = 0;
        this.saludList.map((item) => {
            this.calculateNewPremiums(tasa = item.planProp == 0 ? item.rate : item.planProp, item.nmodulec, this.saludID.id);
            item.valItem = false;
        });
    }

    clearVal() {
        this.errorNroCot = false;
    }

    seleccionArchivos() {
        if (this.files.length === 0) {
            this.clickValidarArchivos = false;
        }
        this.clickValidarArchivos = true;
    }

    seleccionExcel(archivo: File) {
        this.excelSubir = null;
        if (!archivo) {
            this.excelSubir = null;
            this.clickValidarExcel = false;
            return;
        }
        this.excelSubir = archivo;
        this.clickValidarExcel = true;

        this.categoryList = [];
        this.rateByPlanList = [];
    }

    validarExcel(codComission, change_reg_vencido = false) {
        if (this.cotizacionID != '') {
            if (this.excelSubir != undefined) {

                let error = !this.editFlag ? this.canRenew ? this.validarComision() : 'Para validar el excel deberá tener una combinación correcta para tarifario' : '';

                            if (error == '') {
                    if (!this.editFlag) {
                        swal.fire({
                            title: 'Información',
                            text: 'Se tomará en cuenta los datos ingresados hasta este momento para validar la trama, asegurese de haber hecho las modificaciones correspondientes ¿Desea continuar?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Validar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.value) {
                                this.validarTrama(codComission);
                        }
                        });
                    } else {
                        this.validarTrama(codComission);
                    }
                } else {
                    swal.fire('Información', error, 'error');
                }

                // if (this.editFlag) { // Sin modificacion
                //     this.validarTrama(codComission);
                // } else { // Con modificacion
                //     if (this.canRenew == true) {
                //         let error = this.validarComision();
                //         if (error == '') {
                //             this.validarTrama(codComission);
                //             // this.conModificacion(change_reg_vencido, true);
                //         } else {
                //             swal.fire('Información', error, 'error');
                //         }
                //     } else {
                //         swal.fire('Información', 'Para validar el excel deberá tener una combinación correcta para tarifario', 'error');
                //     }
                // }
            } else {
                swal.fire('Información', 'Adjunte una trama para validar', 'error');
            }

        } else {
            swal.fire('Información', 'Ingrese una cotización', 'error');
        }
    };

    conModificacion(change_reg_vencido = false, trama = false) {
        let self = this;
        let dataQuotation: any = {};

        const myFiles: FormData = new FormData(); /* Para los archivos EH */
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });

        //console.log(this.polizaEmitCab.MIN_PENSION);
        dataQuotation.P_NID_COTIZACION = this.nrocotizacion;    //R.P.
        dataQuotation.NumeroCotizacion = this.nrocotizacion;    //R.P.
        dataQuotation.P_STRAN = this.stran;
        dataQuotation.P_SCLIENT = this.polizaEmitCab.SCLIENT;
        dataQuotation.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA;
        dataQuotation.P_NBRANCH = this.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = 0;
        dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NREM_EXC = this.polizaEmitCab.P_NREM_EXC == true ? 1 : 0; // RQ EXC EHH
        dataQuotation.P_ESTADO = this.polizaEmitCab.ESTADO_COT; //AVS - INTERCONEXION SABSA 21/09/2023
        dataQuotation.RetOP = 2; // ehh retroactividad
        dataQuotation.planId = this.mode == 'endosar' || this.polizaEmitCab.desTipoPlan == undefined ? 0 : this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.polizaEmitCab.desTipoPlan).NIDPLAN;
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial == undefined ? 0 : this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.polizaEmitCab.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
        dataQuotation.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA 
        dataQuotation.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA 
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        dataQuotation.P_NBRANCH = this.pensionID.nbranch;
        dataQuotation.P_NPRODUCT = this.pensionID.id;
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.CodigoProceso = this.processID;
        if (this.mode == 'include') {
            dataQuotation.TrxCode = 'IN';
        } else if (this.mode == 'endosar') {
            dataQuotation.TrxCode = 'EN';
        } else {
            if (this.isDeclare) {
                dataQuotation.TrxCode = 'DE';
            } else {
                dataQuotation.TrxCode = 'RE';
            }
        }
        if (this.isDeclare) {
            dataQuotation.IsDeclare = this.isDeclare;
        }
        dataQuotation.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
        dataQuotation.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni); // Fecha Inicio
        dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin); // Fecha hasta

        if (this.template.ins_iniVigenciaAseg) {
            dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        }
        if (this.template.ins_finVigenciaAseg) {
            dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        }

        // Detalle de Cotizacion Pension
        const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
        const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

        if (this.pensionList.length > 0) {
            this.pensionList.forEach(dataPension => {
                let savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataPension.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.MONTO_PLANILLA;
                //savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
                savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA_CALC;//WV
                savedPolicyEmit.P_NTASA_PROP = dataPension.TASA_PRO == '' ? '0' : dataPension.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_PENSION;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_PENSION_PR == '' ? '0' : this.polizaEmitCab.MIN_PENSION_PR;

                if (this.mode === 'renew' && this.flagAprovateTecnica === 'renewAprove') { // AGF 22042024 cambio transac de renovacion retornar a bandeja cuando deriva a tecnica
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_PENSION_AUT;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_PENSION_AUT;
                }

                savedPolicyEmit.P_NPREMIUM_END = this.endosoPension == null ? '0' : this.endosoPension;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvPensionSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                savedPolicyEmit.P_NRATE = dataPension.TASA == null ? '0' : dataPension.TASA; //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
                savedPolicyEmit.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Detalle de Cotizacion Salud
        if (this.saludList.length > 0) {
            const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
            const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

            this.saludList.forEach(dataSalud => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.saludID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_SALUD;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_SALUD_PR == '' ? '0' : this.polizaEmitCab.MIN_SALUD_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoSalud == null ? '0' : this.endosoSalud;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvSaludSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                savedPolicyEmit.P_NRATE = dataSalud.rateDet == null ? '0' : dataSalud.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Comercializadores secundarios
        var index = 0;
        if (this.polizaEmitComer.length > 0) {
            this.polizaEmitComer.forEach(dataBroker => {
                let itemQuotationCom: any = {};
                itemQuotationCom.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
                itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                itemQuotationCom.P_NCOMISION_SAL = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
                itemQuotationCom.P_NCOMISION_SAL_PR = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
                itemQuotationCom.P_NCOMISION_PEN = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
                itemQuotationCom.P_NCOMISION_PEN_PR = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
                itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                dataQuotation.QuotationCom.push(itemQuotationCom);
                index = index + 1;
            });
        }

        // --Ini - Marcos Silverio
        dataQuotation.planSeleccionado = this.polizaEmitCab.desTipoPlan == undefined ? '' : this.polizaEmitCab.desTipoPlan;
        dataQuotation.planPropuesto = this.planPropuesto == undefined ? '' : this.planPropuesto;
        // --Fin - Marcos Silverio

        dataQuotation.TipoEndoso = this.polizaEmitCab.TYPE_ENDOSO === '' ? this.polizaEmitCab.TYPE_ENDOSO = 0 : this.polizaEmitCab.TYPE_ENDOSO;

        if (this.nTransac == 4 && this.editFlag == false && this.RenewSCTR != false) {
            this.loading = false;
            swal.fire({
                title: 'Información',
                text: 'Se tomará en cuenta los datos ingresados hasta este momento para validar la trama, asegurese de haber hecho las modificaciones correspondientes ¿Desea continuar?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Validar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {

                    /* */

                    if (trama) {
                        this.modifyPolicy(dataQuotation); // Implementar
                    } else {
                        this.policyemit.renewMod(dataQuotation != null ? dataQuotation : this.polizaEmitCab.paramsTrx).subscribe(
                            res => {
                                this.loading = false;
                                if (res.P_COD_ERR == 0) {
                                    if (res.P_SAPROBADO == 'N' && this.nTransac == 4 && (res.P_NCODE == 1 || res.P_NCODE == 2)) {
                                        this.loading = false;
                                        swal.fire({
                                            title: 'Información',
                                            text: res.P_SMESSAGE,
                                            icon: 'info',
                                            onClose: () => {
                                                this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                            }
                                        });
                                    } else {
                                        if(this.polizaEmit.facturacionVencido == true){ //AVS - INTERCONEXION SABSA
                                            this.createJob();
                                        }else{
                                            this.OpenModalPagosSCTR(dataQuotation);
                                        }

                                        // this.validarTrama(undefined);
                                    }
                                } else {
                                    this.loading = false;
                                    swal.fire('Información', res.P_MESSAGE, 'error');
                                }
                            },
                            err => {
                                this.loading = false;
                                swal.fire('Información', 'Hubo un error con el servidor', 'error');
                            }
                        );
                    }

                    /* */


                    // self.loading = true;
                    // this.policyemit.renewMod(dataQuotation).subscribe(
                    //     res => {
                    //         self.loading = false;
                    //         if (res.P_COD_ERR == 0) {
                    //             this.validarTrama(undefined);
                    //         } else {
                    //             self.loading = false;
                    //             swal.fire('Información', res.P_MESSAGE, 'error');
                    //         }
                    //     },
                    //     err => {
                    //         self.loading = false;
                    //         swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    //     }
                    // );



                }
                // AGF Inicio 02052023
                else {
                    if (change_reg_vencido) {
                        this.polizaEmit.facturacionVencido = !this.polizaEmit.facturacionVencido;
                    }
                }
                // AGF Fin 02052023
            });
        } else {
            this.loading = false;

            if (this.typeMovement != '7') {
                /** */
                this.policyemit.renewMod(dataQuotation != null ? dataQuotation : this.polizaEmitCab.paramsTrx, this.polizaEmitCab.myFiles).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            if (res.P_SAPROBADO == 'N' && this.nTransac == 4 && (res.P_NCODE == 1 || res.P_NCODE == 2)) {
                                this.loading = false;
                                swal.fire({
                                    title: 'Información',
                                    text: res.P_SMESSAGE,
                                    icon: 'info',
                                    onClose: () => {
                                        this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                    }
                                });
                            } else {
                                if(this.polizaEmit.facturacionVencido == true){ //AVS - INTERCONEXION SABSA
                                    this.createJob();
                                }else{
                                    this.OpenModalPagosSCTR(dataQuotation);
                                }
                            }
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );

                /** */

            } else { //AVS - Incidencia Anulacion 16/06/2023

                // this.modifyPolicyTrx(dataQuotation, this.polizaEmitCab.myFiles)
                this.createJob();

            }
        }
    }

    modifyPolicyTrx() {

        this.createJob();

        // this.policyemit.renewMod(this.polizaEmitCab.paramsTrx, this.polizaEmitCab.myFiles).subscribe(
        //     res => {
        //         if (res.P_COD_ERR == 0) {
        //             if (res.P_SAPROBADO == 'N' && this.nTransac == 4 && res.P_NCODE == 1) {
        //                 this.loading = false;
        //                 swal.fire({
        //                     title: 'Información',
        //                     text: res.P_SMESSAGE,
        //                     icon: 'error',
        //                     onClose: () => {
        //                         this.router.navigate(['/extranet/sctr/consulta-polizas']);
        //                     }
        //                 });
        //             } else {
        //                 this.createJob();
        //             }
        //         } else {
        //             this.loading = false;
        //             swal.fire('Información', res.P_MESSAGE, 'error');
        //         }
        //     },
        //     err => {
        //         this.loading = false;
        //         swal.fire('Información', 'Hubo un error con el servidor', 'error');
        //     }
        // );
    }

    modifyPolicy(dataQuotation = null) {
        this.loading = true;
        this.policyemit.renewMod(dataQuotation != null ? dataQuotation : this.polizaEmitCab.paramsTrx).subscribe(
            res => {
                this.loading = false;
                if (res.P_COD_ERR == 0) {
                        this.validarTrama(undefined);
            } else {
                    this.loading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            err => {
                this.loading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
            }
        );
    }

    OpenModalPagosSCTR(paramsTrx) {

        this.polizaEmitCab.trama = {
            PRIMA_TOTAL: 0,
            NIDPROC: paramsTrx.CodigoProceso,
        };

        this.polizaEmitCab.contratante = {
            email: this.polizaEmitCab.CORREO,
            NOMBRE_RAZON: this.polizaEmitCab.NOMBRE_RAZON,
            COD_PRODUCT: this.polizaEmitCab.NPRODUCT,
            NBRANCH: this.polizaEmitCab.NBRANCH,
            tipoDocumento: {
                Id: this.polizaEmitCab.TIPO_DOCUMENTO
            },
            tipoPersona: {
                codigo: this.polizaEmitCab.TIPO_DOCUMENTO == 1 &&
                    this.polizaEmitCab.NUM_DOCUMENTO.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.polizaEmitCab.NUM_DOCUMENTO,
            emisionDirecta: !this.polizaEmitCab.prePayment ? 'S' : 'N', // Evaluar
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateLockResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.polizaEmitCab.poliza = {
            producto: {
                COD_PRODUCT: this.polizaEmitCab.NPRODUCT,
                NBRANCH: this.polizaEmitCab.NBRANCH,
            }
        };

        const msgIncRenov = this.mode == 'include' ? 'la inclusión' : this.mode == 'endosar' ? 'el endoso' : this.sAbrTran == 'DE' ? 'la declaración' : 'la renovación';
        const countPolicy = this.polizaEmitCab.NCOT_MIXTA == 1 ? 'las pólizas' : 'la póliza';
        const msgPolicy = this.polizaEmitCab.NCOT_MIXTA == 1 ? this.nroPension + ' / ' + this.nroSalud : this.polizaEmitCab.NPRODUCT == 1 ? this.nroPension : this.nroSalud;
        this.polizaEmitCab.prepago = {
            P_NID_COTIZACION: paramsTrx.P_NID_COTIZACION,
            msjCotizacion: 'Selecciona una de las opciones de pago para ' + msgIncRenov + ' de ' + countPolicy + ' N° ' + msgPolicy,
        };

        this.polizaEmitCab.brokers = this.polizaEmitComer;
        for (const item of this.polizaEmitCab.brokers) {
            item.COD_CANAL = item.CANAL;
        }

        this.polizaEmitCab.COD_TIPO_FRECUENCIA = this.polizaEmitCab.frecuenciaPago

        // console.log(this.polizaEmitCab.paramsTrx);
        this.polizaEmitCab.tipoTransaccion = this.typeMovement; // this.nTransac; // rev
        this.polizaEmitCab.transac = this.sAbrTran;
        this.polizaEmitCab.files = this.files;
        this.polizaEmitCab.paramsTrx = paramsTrx;
        this.polizaEmitCab.numeroCotizacion = paramsTrx.P_NID_COTIZACION;
        this.cotizacion = this.polizaEmitCab;

        this.modal.pagos = true;
        this.loading = true;
    }

    primaCobradaChange() {
        if (this.excelSubir !== undefined && this.excelSubir !== null) {
            this.validarTrama();
        }
    }

    async objetoTrx(res) {
        await this.policyemit.getPolicyEmitCab(
            this.nrocotizacion, '1',
            JSON.parse(localStorage.getItem('currentUser'))['id']
        ).toPromise().then(async (resCab: any) => {
            if (!!resCab.GenericResponse &&
                resCab.GenericResponse.COD_ERR == 0) {
                await this.policyemit.getPolicyEmitDet(
                    this.nrocotizacion,
                    JSON.parse(localStorage.getItem('currentUser'))['id'])
                    .toPromise().then(
                        async resDet => {
                            await this.quotationService.getProcessCode(this.nrocotizacion).toPromise().then(
                                resCod => {
                                    // const params = [
                                    //   {
                                    //     P_NID_COTIZACION: this.nrocotizacion,
                                    //     P_NID_PROC: resCod,
                                    //     P_NPRODUCT: this.vidaLeyID,
                                    //     P_SCOLTIMRE: resCab.GenericResponse.TIP_RENOV,
                                    //     P_DSTARTDATE: CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION)),
                                    //     P_DEXPIRDAT: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_COTIZACION)),
                                    //     P_NPAYFREQ: resCab.GenericResponse.FREQ_PAGO,
                                    //     P_SFLAG_FAC_ANT: 1,
                                    //     P_FACT_MES_VENCIDO: 0,
                                    //     P_NPREM_NETA: resDet[0].NSUM_PREMIUMN,
                                    //     P_IGV: resDet[0].NSUM_IGV,
                                    //     P_NPREM_BRU: resDet[0].NSUM_PREMIUM,
                                    //     P_SCOMMENT: '',
                                    //     P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                    //     P_DIRECTO: res.P_SAPROBADO,
                                    //     P_POLICY: this.policyNumber,
                                    //   }
                                    // ];

                                    const params = {
                                        P_NBRANCH: this.vidaLeyID.nbranch,
                                        P_NPRODUCTO: this.vidaLeyID.id,
                                        P_NID_COTIZACION: this.cotizacionID,
                                        P_DEFFECDATE: this.codProducto == 3 && this.mode == 'endosar' ? CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_ASEGURADOS)) : CommonMethods.formatDate(new Date(this.polizaEmitCab.FDateIniAseg)),
                                        P_DEXPIRDAT: this.codProducto == 3 && this.mode == 'endosar' ? CommonMethods.formatDate(new Date(resCab.GenericResponse.EXPIRACION_ASEGURADOS)) : CommonMethods.formatDate(new Date(this.polizaEmitCab.FDateFinAseg)),
                                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                        P_NTYPE_TRANSAC: this.typeMovement,
                                        P_NID_PROC: this.processID,
                                        P_FACT_MES_VENCIDO: this.polizaEmit.facturacionVencido == true ? 1 : 0,
                                        P_SFLAG_FAC_ANT: 1,
                                        P_SCOLTIMRE: resCab.GenericResponse.TIP_RENOV,
                                        P_NPAYFREQ: resCab.GenericResponse.FREQ_PAGO,
                                        P_NMOV_ANUL: 0,
                                        P_NNULLCODE: 0,
                                        P_SCOMMENT: this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''),
                                        // P_NPREM_BRU: this.AuthorizedDetailList[2].AmountAuthorized,
                                        P_DIRECTO: res.P_SAPROBADO,
                                        P_MESSAGE: res.P_SMESSAGE,
                                        P_POLICY: this.nroPoliza,
                                        P_STRAN: this.stran, // retroactividad
                                        P_DSTARTDATE_ASE: CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg),
                                        P_DSTARTDATE_POL: CommonMethods.formatDate(this.polizaEmitCab.bsValueIni),
                                        P_DEXPIRDAT_POL: CommonMethods.formatDate(this.polizaEmitCab.bsValueFin),
                                        P_NAMO_AFEC: this.GetAmountDetailTotalListValue(0, this.mode == 'include' ? 1 : this.mode == 'endosar' || this.mode == 'exclude' ? 9 : this.polizaEmitCab.frecuenciaPago),
                                        P_NIVA: this.GetAmountDetailTotalListValue(1, this.mode == 'include' ? 1 : this.mode == 'endosar' || this.mode == 'exclude' ? 9 : this.polizaEmitCab.frecuenciaPago),
                                        P_NAMOUNT: this.GetAmountDetailTotalListValue(2, this.mode == 'include' ? 1 : this.mode == 'endosar' || this.mode == 'exclude' ? 9 : this.polizaEmitCab.frecuenciaPago)
                                    };

                                    if (res.P_SAPROBADO === 'V') {
                                        const actualizarCotizacion = {
                                            QuotationNumber: this.nrocotizacion,
                                            Status: 2,
                                            Reason: '',
                                            Comment: '',
                                            User: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                            Product: this.vidaLeyID.id,
                                            Nbranch: this.vidaLeyID.nbranch,
                                            Gloss: '',
                                            GlossComment: '',
                                            flag: this.template.ins_mapfre,
                                            saludAuthorizedRateList: [],
                                            pensionAuthorizedRateList: [],
                                            BrokerList: [],
                                            Flag: 0,
                                        };

                                        this.polizaEmitComer.forEach((item) => {
                                            actualizarCotizacion.BrokerList.push({
                                                Id: item.CANAL,
                                                ProductList: [
                                                    {
                                                        Product: this.vidaLeyID.id,
                                                        AuthorizedCommission: 0,
                                                    },
                                                ],
                                            });
                                        });

                                        resDet.forEach((item) => {
                                            actualizarCotizacion.saludAuthorizedRateList.push({
                                                ProductId: this.vidaLeyID.id,
                                                RiskTypeId: item.TIP_RIESGO,
                                                AuthorizedRate: item.TASA_CALC,
                                                AuthorizedPremium: 0,
                                                AuthorizedMinimunPremium: 0,
                                            });
                                        });

                                        this.polizaEmitCab.actualizarCotizacion = actualizarCotizacion;

                                    }

                                    console.log(params);
                                    this.flagEnvioEmail == 0 && this.transactNumber != 0 && this.flagGobiernoEstado ? this.trasaccionDirectaOperaciones(params) : this.OpenModalPagos(params);
                                });
                        }
                    );
            }
        });
    }

    OpenModalPagos(paramsTrx) {

        let primaTotal = 0;
        primaTotal = this.mode != 'include' ?
            this.polizaEmitCab.frecuenciaPago == 5 ?
                this.amountDetailTotalList[2].NAMOUNT_MEN :
                this.polizaEmitCab.frecuenciaPago == 4 ?
                    this.amountDetailTotalList[2].NAMOUNT_BIM :
                    this.polizaEmitCab.frecuenciaPago == 3 ?
                        this.amountDetailTotalList[2].NAMOUNT_TRI :
                        this.polizaEmitCab.frecuenciaPago == 2 ?
                            this.amountDetailTotalList[2].NAMOUNT_SEM :
                            this.polizaEmitCab.frecuenciaPago == 1 ?
                                this.amountDetailTotalList[2].NAMOUNT_ANU :
                                0 : this.amountDetailTotalList[2].NAMOUNT_ANU;

        this.polizaEmitCab.trama = {
            PRIMA_TOTAL: primaTotal,
            NIDPROC: this.flagEstadoCertificado ? paramsTrx[0].P_NID_PROC : paramsTrx.P_NID_PROC,
        };

        this.polizaEmitCab.contratante = {
            email: this.polizaEmitCab.CORREO,
            NOMBRE_RAZON: this.polizaEmitCab.NOMBRE_RAZON,
            COD_PRODUCT: this.vidaLeyID.id,
            NBRANCH: this.vidaLeyID.nbranch,
            tipoDocumento: {
                Id: this.polizaEmitCab.TIPO_DOCUMENTO
            },
            tipoPersona: {
                codigo: this.polizaEmitCab.TIPO_DOCUMENTO == 1 &&
                    this.polizaEmitCab.NUM_DOCUMENTO.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.polizaEmitCab.NUM_DOCUMENTO,
            emisionDirecta: this.flagEstadoCertificado ? 'S' : paramsTrx.P_DIRECTO,
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateLockResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.polizaEmitCab.poliza = {
            producto: {
                COD_PRODUCT: this.vidaLeyID.id,
                NBRANCH: this.vidaLeyID.nbranch,
            }
        };

        const msgIncRenov = this.mode == 'certificate' ? 'la emisión de certificados' : this.mode == 'include' ? 'la inclusión' : this.mode == 'endosar' ? 'el endoso' : this.sAbrTran == 'DE' ? 'la declaración' : 'la renovación';
        this.polizaEmitCab.prepago = {
            P_NID_COTIZACION: this.flagEstadoCertificado ? paramsTrx[0].P_NID_COTIZACION : paramsTrx.P_NID_COTIZACION,
            msjCotizacion: 'Selecciona una de las opciones de pago para ' + msgIncRenov +
                ' de la póliza N° ' + this.nroPoliza,
        };

        this.polizaEmitCab.brokers = this.polizaEmitComer;
        for (const item of this.polizaEmitCab.brokers) {
            item.COD_CANAL = item.CANAL;
        }

        this.polizaEmitCab.tipoTransaccion = this.typeMovement;
        this.polizaEmitCab.files = this.files;
        this.polizaEmitCab.paramsTrx = paramsTrx;
        this.polizaEmitCab.numeroCotizacion = this.flagEstadoCertificado ? paramsTrx[0].P_NID_COTIZACION : paramsTrx.P_NID_COTIZACION;
        this.cotizacion = this.polizaEmitCab;

        this.modal.pagos = true;
        this.loading = true;
    }

    async formaPagoElegido() {
        if (this.polizaEmitCab.poliza.pagoElegido == 'transferencia' || this.polizaEmitCab.poliza.pagoElegido == 'cash') {
            this.onPaymentKushki();                
        } if (this.polizaEmitCab.poliza.pagoElegido === 'efectivo') {
            this.onPayment();
        } if (this.polizaEmitCab.poliza.pagoElegido === 'directo') {
            this.polizaEmitCab.paramsTrx.P_SPAGO_ELEGIDO = 'directo';
            // if (this.nTransac == 4 && this.editFlag == false && this.RenewSCTR != false) { // con modificacion
            //     this.modifyPolicy(); // Implementar
            //     console.log('Con Modificacion')
            // } else {
            //     console.log('sin Modificacion')
                this.modifyPolicyTrx()
            // }
        }
        /*
        console.log('this.polizaEmitCab', this.polizaEmitCab)

        if (this.polizaEmitCab.poliza.pagoElegido === 'efectivo') {
            this.onPayment();
        }

        if (this.polizaEmitCab.poliza.pagoElegido === 'directo') {
                this.polizaEmitCab.paramsTrx.P_SPAGO_ELEGIDO = 'directo';
            // if (this.nTransac == 4 && this.editFlag == false && this.RenewSCTR != false) { // con modificacion
            //     this.modifyPolicy(); // Implementar
            //     console.log('Con Modificacion')
            // } else {
            //     console.log('sin Modificacion')
                this.modifyPolicyTrx()
            // }
        }*/
    }

    async onPaymentKushki() {
        console.log('Entra onPaymentKushki');
        this.payPF = 1;

        // this.visaData.email = this.polizaEmitCab.CORREO;
        await this.validateFlow();
        if(this.files.length > 0){
            await this.filesAdjuntos(this.files);
        }

        let policyData: any = {};
        policyData.visaData = null;
        policyData.savedPolicyList = this.transaccionProtecta;
        policyData.contractingdata = this.contractingdata;
        policyData.emisionMapfre = this.transaccionMapfre == null ? null : this.transaccionMapfre;
        policyData.adjuntos = this.files_adjuntos;
        policyData.transaccion = this.typeMovement; //AVS INTERCONEXION SAPSA
        policyData.dataCIP = this.dataCIP;

        if(this.polizaEmitCab.poliza.pagoElegido == 'transferencia'){
            policyData.dataCIP.tipoPago = "3"
        }else if(this.polizaEmitCab.poliza.pagoElegido == 'cash'){
            policyData.dataCIP.tipoPago = "2"
        } 

        let self = this;
        let dataQuotation: any = {};

        const myFiles: FormData = new FormData();
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });

        dataQuotation.P_NID_COTIZACION = this.nrocotizacion;    //R.P.
        dataQuotation.NumeroCotizacion = this.nrocotizacion;    //R.P.
        dataQuotation.P_STRAN = this.stran;
        dataQuotation.P_SCLIENT = this.polizaEmitCab.SCLIENT;
        dataQuotation.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA;
        dataQuotation.P_NBRANCH = this.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = 0;
        dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NREM_EXC = this.polizaEmitCab.P_NREM_EXC == true ? 1 : 0; // RQ EXC EHH
        dataQuotation.RetOP = 2; // ehh retroactividad
        dataQuotation.planId = this.mode == 'endosar' || this.polizaEmitCab.desTipoPlan == undefined ? 0 : this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.polizaEmitCab.desTipoPlan).NIDPLAN;
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial == undefined ? 0 : this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.polizaEmitCab.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
        dataQuotation.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA 
        dataQuotation.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA 
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        dataQuotation.P_NBRANCH = this.pensionID.nbranch;
        dataQuotation.P_NPRODUCT = this.pensionID.id;
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.CodigoProceso = this.processID;

        if (this.mode == 'include') {
            dataQuotation.TrxCode = 'IN';
        } else if (this.mode == 'endosar') {
            dataQuotation.TrxCode = 'EN';
        } else {
            if (this.isDeclare) {
                dataQuotation.TrxCode = 'DE';
            } else {
                dataQuotation.TrxCode = 'RE';
            }
        }

        if (this.isDeclare) {
            dataQuotation.IsDeclare = this.isDeclare;
        }

        dataQuotation.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
        dataQuotation.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni); // Fecha Inicio
        dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin); // Fecha hasta

        if (this.template.ins_iniVigenciaAseg) {
            dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        }
        if (this.template.ins_finVigenciaAseg) {
            dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        }

        // Detalle de Cotizacion Pension
        const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
        const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

        if (this.pensionList.length > 0) {
            this.pensionList.forEach(dataPension => {
                let savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataPension.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
                savedPolicyEmit.P_NTASA_PROP = dataPension.TASA_PRO == '' ? '0' : dataPension.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_PENSION;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_PENSION_PR == '' ? '0' : this.polizaEmitCab.MIN_PENSION_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoPension == null ? '0' : this.endosoPension;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvPensionSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                savedPolicyEmit.P_NRATE = dataPension.TASA == null ? '0' : dataPension.TASA; //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
                savedPolicyEmit.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Detalle de Cotizacion Salud
        if (this.saludList.length > 0) {
            const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
            const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

            this.saludList.forEach(dataSalud => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.saludID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_SALUD;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_SALUD_PR == '' ? '0' : this.polizaEmitCab.MIN_SALUD_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoSalud == null ? '0' : this.endosoSalud;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvSaludSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                savedPolicyEmit.P_NRATE = dataSalud.rateDet == null ? '0' : dataSalud.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Comercializadores secundarios
        var index = 0;
        if (this.polizaEmitComer.length > 0) {
            this.polizaEmitComer.forEach(dataBroker => {
                let itemQuotationCom: any = {};
                itemQuotationCom.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
                itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                itemQuotationCom.P_NCOMISION_SAL = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
                itemQuotationCom.P_NCOMISION_SAL_PR = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
                itemQuotationCom.P_NCOMISION_PEN = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
                itemQuotationCom.P_NCOMISION_PEN_PR = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
                itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                dataQuotation.QuotationCom.push(itemQuotationCom);
                index = index + 1;
            });
        }

        // --Ini - Marcos Silverio
        dataQuotation.planSeleccionado = this.polizaEmitCab.desTipoPlan == undefined ? '' : this.polizaEmitCab.desTipoPlan;
        dataQuotation.planPropuesto = this.planPropuesto == undefined ? '' : this.planPropuesto;
        // --Fin - Marcos Silverio
        dataQuotation.TipoEndoso = this.polizaEmitCab.TYPE_ENDOSO === '' ? this.polizaEmitCab.TYPE_ENDOSO = 0 : this.polizaEmitCab.TYPE_ENDOSO;

        const payPF = this.payPF;

        if (policyData.savedPolicyList.length > 0) {
            for (let i = 0; i < policyData.savedPolicyList.length; i++) {
                policyData.savedPolicyList[i].P_PAYPF = payPF;
            }
        } else {
            policyData.savedPolicyList.P_PAYPF = payPF;
        }

        policyData.dataCIP.ExternalId_EPS = this.nroMovimientoEPS;
        localStorage.setItem('policydata', JSON.stringify(policyData));
        console.log('onPaymentKushki()');
        console.log(this.dataCIP);
        //return;
        this.router.navigate(['/extranet/policy/pago-kushki']);
    }    


    async validarTrama(codComission?) {
        this.errorExcel = false;
        this.loading = true;

        const myFormData: FormData = new FormData();
        myFormData.append('dataFile', this.isRateProposed ? null : this.excelSubir);

        const data: any = {};
        data.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.nroCotizacion = this.cotizacionID;
        data.type_mov = this.typeMovement;
        data.retarif = this.retarifa;
        data.date = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        data.dateFn = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        data.eps = this.epsItem.STYPE;
        data.nroCotizacionEPS = null;
        data.nroPolizaEPS = this.nroPolizaEps;
        data.tipDocumento = this.polizaEmitCab.TIPO_DOCUMENTO;
        data.nroDocumento = this.polizaEmitCab.NUM_DOCUMENTO;
        data.tipRenovacion = this.polizaEmitCab.tipoRenovacion;
        data.codRamo = this.nbranch;
        data.codProceso = this.nidProc; //AVS - INTERCONEXION SABSA 20/09/2023
        data.codMixta = this.polizaEmitCab.NCOT_MIXTA; //AVS - INTERCONEXION SABSA 20/09/2023
        data.nroPolizaSalud = this.nroSalud; //AVS - INTERCONEXION SABSA 20/09/2023
        data.nroProduct = this.polizaEmitCab.NPRODUCT; //AVS - INTERCONEXION SABSA

        myFormData.append('objValida', JSON.stringify(data));
        // console.log(this.totalNetoPensionSave);

        await this.policyemit.valGestorList(myFormData).toPromise().then(
            async res => {
                // console.log(this.totalNetoPensionSave);
                this.tasasList = []
                this.pensionList = []
                this.saludList = []
                this.erroresList = res.C_TABLE;
                if (res.P_COD_ERR == '1') {
                    swal.fire('Información', res.P_MESSAGE, 'error');
                } else {
                    if (this.erroresList != null) {
                        if (this.erroresList.length > 0) {
                            this.processID = '';
                            this.nroMovimientoEPS = null
                            let modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                            modalRef.componentInstance.formModalReference = modalRef;
                            modalRef.componentInstance.erroresList = this.erroresList;
                        } else {
                            this.processID = res.P_NID_PROC;
                            this.nroMovimientoEPS = res.P_NID_PROC_EPS;
                            await this.infoCarga(this.processID)
                            // await this.callButtonVisa(this.currentUser)
                            await this.callButtonPE();

                            // if (Number(this.typeMovement) == 4 && Number(this.typeMovement) == 2) {
                            //FLAG DE VALIDAR PRIMA Y RIESGOS - SCTR
                            // let paytypeSCTR = await this.obtenerPaytypeSCTR(); //AVS - INTERCONEXION SABSA 03/11/2023
                            this.polizaEmitCab.prePayment = await this.obtenerPaytypeSCTR(); //AVS - INTERCONEXION SABSA 03/11/2023
                            // this.prePayment = paytypeSCTR; //AVS - INTERCONEXION SABSA 03/11/2023

                            // }
                            // await this.validatePrePayment()
                            // if (this.template.ins_prePaymentEmision) {
                            // this.prePayment = false
                            // if (this.paymentType != null) {
                            //     // Pago visa
                            //     if (this.paymentType.bvisa == 1) {
                            //         // console.log(this.totalNetoPensionSave);
                            //         await this.callButtonVisa(this.currentUser)
                            //     }

                            //     // Pago efectivo
                            //     if (this.paymentType.bpagoefectivo == 1) {
                            //         await this.callButtonPE()
                            //     }
                            // }

                            // await this.validatePrePayment()

                            // }

                            swal.fire('Información', 'Se validó correctamente la trama', 'success');
                        }
                    } else {
                        swal.fire('Información', 'El archivo enviado contiene errores', 'error');
                    }
                }
                this.loading = false;

            },
            err => {
                this.loading = false;
            }
        );
    }

    async validatePrePayment() {
        // Valida score xperian -- Protecta y en Mapfre
        if (this.template.ins_validateHighScore || (this.template.ins_mapfre && this.pensionList.length > 0 && this.saludList.length == 0)) {
            if (this.creditHistory.nflag == 0) {
                this.polizaEmitCab.prePayment = true;
            }
        }
        // Valida periodo corto - Solo Mapfre
        if (this.template.ins_mapfre && this.saludList.length > 0) {
            if (this.polizaEmitCab.tipoRenovacion == '5' || this.polizaEmitCab.tipoRenovacion == '4') {
                this.polizaEmitCab.prePayment = true;
            }
        }
        // Valida cliente del estado
        if (this.template.ins_clienteGobierno || (this.template.ins_mapfre && this.pensionList.length > 0 && this.saludList.length == 0)) {
            if (this.contractingdata.P_SISCLIENT_GBD == '1' || this.polizaEmitCab.tipoRenovacion == '7') {
                this.polizaEmitCab.prePayment = false;
            }
        }
    }

    // async prePaymentChange() {

    //     let data = {
    //         nbranch: this.nbranch,
    //         nproduct: this.polizaEmitCab.NPRODUCT,
    //         ncotizacion: this.cotizacionID,
    //         nflagMixto: this.polizaEmitCab.NCOT_MIXTA
    //     }

    //     await this.policyemit.validateAgencySCTR(data).toPromise().then(
    //         async res => {
    //             if (res.P_COD_ERR == 0) {
    //                 if (this.prePayment) {
    //                     this.visaData.email = this.polizaEmitCab.CORREO;
    //                     await this.validateFlow();
    //                     let policyData: any = {};
    //                     policyData.visaData = this.visaData;
    //                     policyData.savedPolicyList = this.transaccionProtecta;
    //                     policyData.contractingdata = this.contractingdata;
    //                     policyData.emisionMapfre = this.transaccionMapfre == null ? null : this.transaccionMapfre;
    //                     policyData.adjuntos = this.files;
    //                     policyData.transaccion = this.typeMovement; //AVS INTERCONEXION SAPSA
    //                     policyData.dataCIP = this.dataCIP;
    //                     localStorage.setItem('policydata', JSON.stringify(policyData));
    //                 }
    //             } else {
    //                 this.prePayment = false;
    //                 swal.fire('Información', res.P_MESSAGE, 'error');
    //             }
    //         },
    //         error => {
    //             this.loading = false;
    //         }
    //     );
    // }

    async callButtonVisa(userData: any) {
        console.log('callButtonVisa');        
        let totalPolicy = 0;
        if (Number(this.typeMovement) == 3) {
            totalPolicy = CommonMethods.formatValor(Number(this.totalNetoPensionSave) + Number(this.totalNetoSaludSave), 2);
        } else {
            totalPolicy = await this.CalculateAjustedAmounts();
        }
        const nameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
        const lastnameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : '';
        const dataVisa: any = {};
        dataVisa.ExternalId = this.processID;
        dataVisa.Amount = totalPolicy;
        dataVisa.Canal = this.polizaEmitComer[0].CANAL; // userData.canal
        dataVisa.PuntoVenta = 0; // userData.puntoVenta
        dataVisa.Flujo = 0;
        dataVisa.CodigoComercio = CommonMethods.commercialCode(this.codProducto);
        dataVisa.Ramo = this.pensionID.nbranch;
        dataVisa.Producto = this.pensionID.id;
        dataVisa.TipoDocumento = this.polizaEmitCab.TIPO_DOCUMENTO;
        dataVisa.NumeroDocumento = this.polizaEmitCab.NUM_DOCUMENTO;
        dataVisa.Email = this.polizaEmitCab.CORREO;
        dataVisa.Nombre = nameClient + ' ' + lastnameClient;
        dataVisa.tipoSolicitud = 1; // Solo para emision

        await this.policyemit.generateTokenVisa(dataVisa, userData.token).toPromise().then(
            async res => {
                const config = {
                    action: AppConfig.ACTION_FORM_VISA_SCTR,
                    timeoutUrl: CommonMethods.urlTimeout(this.codProducto, this.typeMovement),
                    merchantid: CommonMethods.commercialCode(this.codProducto)
                };
                this.visaData = { ...config, ...res };
                this.visaData.flow = CommonMethods.visaFlow(this.codProducto);
                this.visaData.quotationNumber = this.nrocotizacion;
            },
            error => {
                this.loading = false;
            }
        );
    }

    async onPayment() {
        this.payPF = 1;

        // this.visaData.email = this.polizaEmitCab.CORREO;
        await this.validateFlow();
        if(this.files.length > 0){
            await this.filesAdjuntos(this.files);
        }
        let policyData: any = {};
        policyData.visaData = null;
        policyData.savedPolicyList = this.transaccionProtecta;
        policyData.contractingdata = this.contractingdata;
        policyData.emisionMapfre = this.transaccionMapfre == null ? null : this.transaccionMapfre;
        policyData.adjuntos = this.files_adjuntos;
        policyData.transaccion = this.typeMovement; //AVS INTERCONEXION SAPSA
        policyData.dataCIP = this.dataCIP;

        let self = this;
        let dataQuotation: any = {};

        const myFiles: FormData = new FormData();
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });

        dataQuotation.P_NID_COTIZACION = this.nrocotizacion;    //R.P.
        dataQuotation.NumeroCotizacion = this.nrocotizacion;    //R.P.
        dataQuotation.P_STRAN = this.stran;
        dataQuotation.P_SCLIENT = this.polizaEmitCab.SCLIENT;
        dataQuotation.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA;
        dataQuotation.P_NBRANCH = this.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = 0;
        dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NREM_EXC = this.polizaEmitCab.P_NREM_EXC == true ? 1 : 0; // RQ EXC EHH
        dataQuotation.RetOP = 2; // ehh retroactividad
        dataQuotation.planId = this.mode == 'endosar' || this.polizaEmitCab.desTipoPlan == undefined ? 0 : this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.polizaEmitCab.desTipoPlan).NIDPLAN;
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial == undefined ? 0 : this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.polizaEmitCab.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
        dataQuotation.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA 
        dataQuotation.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA 
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        dataQuotation.P_NBRANCH = this.pensionID.nbranch;
        dataQuotation.P_NPRODUCT = this.pensionID.id;
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.CodigoProceso = this.processID;

        if (this.mode == 'include') {
            dataQuotation.TrxCode = 'IN';
        } else if (this.mode == 'endosar') {
            dataQuotation.TrxCode = 'EN';
        } else {
            if (this.isDeclare) {
                dataQuotation.TrxCode = 'DE';
            } else {
                dataQuotation.TrxCode = 'RE';
            }
        }

        if (this.isDeclare) {
            dataQuotation.IsDeclare = this.isDeclare;
        }

        dataQuotation.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
        dataQuotation.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni); // Fecha Inicio
        dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin); // Fecha hasta

        if (this.template.ins_iniVigenciaAseg) {
            dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        }
        if (this.template.ins_finVigenciaAseg) {
            dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        }

        // Detalle de Cotizacion Pension
        const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
        const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

        if (this.pensionList.length > 0) {
            this.pensionList.forEach(dataPension => {
                let savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataPension.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA; //CAMBIO AVS dataPension.TASA_CALC; PRY ESTIMACIONES
                savedPolicyEmit.P_NTASA_PROP = dataPension.TASA_PRO == '' ? '0' : dataPension.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_PENSION;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_PENSION_PR == '' ? '0' : this.polizaEmitCab.MIN_PENSION_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoPension == null ? '0' : this.endosoPension;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvPensionSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                savedPolicyEmit.P_NRATE = dataPension.TASA == null ? '0' : dataPension.TASA; //CAMBIO AVS dataPension.rateDet == null ? '0' : dataPension.rateDet; PRY ESTIMACIONES
                savedPolicyEmit.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Detalle de Cotizacion Salud
        if (this.saludList.length > 0) {
            const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
            const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

            this.saludList.forEach(dataSalud => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.saludID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_SALUD;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_SALUD_PR == '' ? '0' : this.polizaEmitCab.MIN_SALUD_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoSalud == null ? '0' : this.endosoSalud;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvSaludSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                savedPolicyEmit.P_NRATE = dataSalud.rateDet == null ? '0' : dataSalud.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.GetNamoAfectDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.GetNivaDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.GetNamountDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Comercializadores secundarios
        var index = 0;
        if (this.polizaEmitComer.length > 0) {
            this.polizaEmitComer.forEach(dataBroker => {
                let itemQuotationCom: any = {};
                itemQuotationCom.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
                itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                itemQuotationCom.P_NCOMISION_SAL = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
                itemQuotationCom.P_NCOMISION_SAL_PR = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
                itemQuotationCom.P_NCOMISION_PEN = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
                itemQuotationCom.P_NCOMISION_PEN_PR = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
                itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                dataQuotation.QuotationCom.push(itemQuotationCom);
                index = index + 1;
            });
        }

        // --Ini - Marcos Silverio
        dataQuotation.planSeleccionado = this.polizaEmitCab.desTipoPlan == undefined ? '' : this.polizaEmitCab.desTipoPlan;
        dataQuotation.planPropuesto = this.planPropuesto == undefined ? '' : this.planPropuesto;
        // --Fin - Marcos Silverio
        dataQuotation.TipoEndoso = this.polizaEmitCab.TYPE_ENDOSO === '' ? this.polizaEmitCab.TYPE_ENDOSO = 0 : this.polizaEmitCab.TYPE_ENDOSO;

        const payPF = this.payPF;

        if (policyData.savedPolicyList.length > 0) {
            for (let i = 0; i < policyData.savedPolicyList.length; i++) {
                policyData.savedPolicyList[i].P_PAYPF = payPF;
            }
        } else {
            policyData.savedPolicyList.P_PAYPF = payPF;
        }

        policyData.dataCIP.ExternalId_EPS = this.nroMovimientoEPS;
        localStorage.setItem('policydata', JSON.stringify(policyData));

        this.router.navigate(['/extranet/policy/pago-efectivo']);
    }

    openPagoEfectivoInfo() {
        this.modalRef = this.modalServiceInfo.show(this.content);
    }

    async callButtonPE() {
        // const totalPolicy = await this.calculateTotal()
        console.log('callButtonPE');
        let totalPolicy = 0;
        /*if (Number(this.typeMovement) == 3) {
            totalPolicy = CommonMethods.formatValor(Number(this.totalNetoPensionSave) + Number(this.totalNetoSaludSave), 2);
        } else {*/
             totalPolicy = await this.CalculateAjustedAmounts();
        //}
        const nameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
        const lastnameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : '';

        this.dataCIP = {}
        this.dataCIP.tipoSolicitud = 1; // Que envio en la renovacion ?
        this.dataCIP.monto = totalPolicy;
        this.dataCIP.correo = this.polizaEmitCab.CORREO;
        this.dataCIP.conceptoPago = CommonMethods.conceptProduct(this.codProducto);
        this.dataCIP.nombres = nameClient;
        this.dataCIP.Apellidos = lastnameClient;
        this.dataCIP.ubigeoINEI = await this.ubigeoInei(this.polizaEmitCab.COD_DISTRITO);
        this.dataCIP.tipoDocumento = this.polizaEmitCab.TIPO_DOCUMENTO;
        this.dataCIP.numeroDocumento = this.polizaEmitCab.NUM_DOCUMENTO;
        this.dataCIP.telefono = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : '';
        this.dataCIP.ramo = this.pensionID.nbranch;
        this.dataCIP.producto = this.polizaEmitCab.NCOT_MIXTA == 1 ? this.pensionID.id : this.polizaEmitCab.NPRODUCT;
        this.dataCIP.ExternalId = this.processID;
        this.dataCIP.quotationNumber = this.nrocotizacion;
        this.dataCIP.codigoCanal = this.polizaEmitComer[0].CANAL;
        this.dataCIP.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.dataCIP.eps = Number(this.epsItem.NCODE); //AVS - INTERCONEXION SABSA
        this.dataCIP.Moneda = this.polizaEmitCab.COD_MONEDA; //AVS - INTERCONEXION SABSA
        if (Number(this.epsItem.NCODE) == 3 && this.polizaEmitCab.NCOT_MIXTA == 1 || this.nbranch == this.pensionID.nbranch && this.polizaEmitCab.NPRODUCT == 2) { //AVS - INTERCONEXION SABSA 19/09/2023
          this.dataCIP.producto_EPS = this.saludID.id;
          this.dataCIP.ExternalId_EPS = '';
          /*this.dataCIP.monto_pension = parseFloat(Number(this.brutaTotalPensionSave).toString()).toFixed(2);
          this.dataCIP.monto_salud = parseFloat(Number(this.brutaTotalSaludSave).toString()).toFixed(2);*/
          this.dataCIP.monto_pension = parseFloat(Number(this.PensionBruta).toString()).toFixed(2);
          this.dataCIP.monto_salud = parseFloat(Number(this.SaludBruta).toString()).toFixed(2);
          
          this.dataCIP.mixta = this.polizaEmitCab.NCOT_MIXTA;
        }

        console.log('this.dataCIP');
        console.log(this.dataCIP);
    }

    async ubigeoInei(distrito) {
        let ubigeo = 0
        await this.quotationService.equivalentMunicipality(distrito).toPromise().then(
            res => {
                ubigeo = res;
            },
            error => {
                ubigeo = 0
            }

        );

        return ubigeo;
    }

    async validateFlow() {
        let mensaje = '';
        mensaje = await this.validateEmit()

        if (mensaje == '') {
            this.savedPolicyList = [];
            await this.dataEmision();

        } else {
            // this.prePayment = false
            this.loading = false;
            swal.fire('Información', mensaje, 'error');
        }
    }

    async visaClick() {
        await this.insertEmitDet();
        localStorage.setItem('objetoDet', JSON.stringify(this.ListainsertEmit));
        this.appConfig.AddEventAnalityc();
    }

    async calculateTotal() {
        // console.log(this.totalNetoSaludSave);
        let totalPolicy = 0;
        if (this.monthPerPay == 0) {
            const initialDate = new Date(CommonMethods.formatDateCalculate(this.polizaEmitCab.bsValueIni)).getTime();
            const finalDate = new Date(CommonMethods.formatDateCalculate(this.polizaEmitCab.bsValueFin)).getTime();
            const daysDifferences = (finalDate - initialDate) / (1000 * 60 * 60 * 24) + 1;
            const dayMonth = daysDifferences / CommonMethods.dayMonth();
            const premiumDaySalud = CommonMethods.formatValor(Number(this.totalNetoSaludSave) * dayMonth, 6); // Prima diaria Salud
            const premiumDayPension = CommonMethods.formatValor(Number(this.totalNetoPensionSave) * dayMonth, 6); // Prima diaria Pension
            const premiumDaySaludDE = CommonMethods.formatValor((Number(this.totalNetoSaludSave) * this.dEmiSalud) * dayMonth, 6); // Prima diaria Salud + DE
            const premiumDayPensionDE = CommonMethods.formatValor((Number(this.totalNetoPensionSave) * this.dEmiPension) * dayMonth, 6); // Prima diaria Pension + DE
            const igvSalud = CommonMethods.formatValor(Number(premiumDaySalud) * (Number(this.igvSaludWS) - 1), 6);
            const igvPension = CommonMethods.formatValor(Number(premiumDayPension) * (Number(this.igvPensionWS) - 1), 6);
            const premiumSalud = Number(premiumDaySaludDE) + Number(igvSalud);
            const premiumPension = Number(premiumDayPensionDE) + Number(igvPension);
            totalPolicy = CommonMethods.formatValor(Number(premiumPension) + Number(premiumSalud), 2);
        } else {
            const premiumDaySalud = Number(CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) * this.monthPerPay, 6));
            const premiumDayPension = Number(CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) * this.monthPerPay, 6));
            const igvSalud = CommonMethods.formatValor(Number(CommonMethods.formatValor(Number(this.totalNetoSaludSave) * this.monthPerPay, 2)) * (Number(this.igvSaludWS) - 1), 6);
            const igvPension = CommonMethods.formatValor(Number(CommonMethods.formatValor(Number(this.totalNetoPensionSave) * this.monthPerPay, 2)) * (Number(this.igvPensionWS) - 1), 6);
            const premiumSalud = Number(premiumDaySalud) + Number(igvSalud);
            const premiumPension = Number(premiumDayPension) + Number(igvPension);
            totalPolicy = CommonMethods.formatValor(Number(premiumPension) + Number(premiumSalud), 2);
        }

        return totalPolicy;
    }

    validarComision() {
        let mensaje = ''
        let self = this;
        if (this.polizaEmitComer.length == 0) {
            mensaje += 'Debe tener al menos un broker agregado <br />';
        } else {
            this.polizaEmitComer.forEach(broker => {
                if (self.saludList.length > 0) {
                    if (broker.valItemSal == true) {
                        mensaje += 'La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]<br>'
                    }
                }
                if (self.pensionList.length > 0) {
                    if (broker.valItemPen == true) {
                        mensaje += 'La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]<br>'
                    }
                }
            });
        }
        return mensaje;
    }

    limpiar() {
        this.activacionExitoso = false;
        this.validaciones = [];
        this.validacionIndentifacion = [];
        this.validacionIndentifacionRUC20 = [];
        this.validacionIndentifacionRUC10 = [];
        this.objcolumnas = [];
        this.objcolumnasRuc20 = [];
        this.objcolumnasRuc10 = [];
    }

    async equivalentMuni() {
        if (this.template.ins_llamarTarifario) {
            this.saludList = []
            this.pensionList = []
            this.mensajePrimaPension = ''
            this.mensajePrimaSalud = ''

            if (this.polizaEmitComer.length > 0 && this.polizaEmitCab.DES_ACT_ECONOMICA != null && this.polizaEmitCab.COD_DISTRITO) {
                await this.quotationService.equivalentMunicipality(this.polizaEmitCab.COD_DISTRITO).toPromise().then(
                    async res => {
                        this.municipalityTariff = res;
                        await this.getTarifario();
                    }
                );
            } else {
                this.tasasList = []
                this.messageWorker = ''
            }
        }
    }


    limpiarTarifario() {
        this.messageWorker = '';
        this.primMinimaSalud = false
        this.primMinimaPension = false
        this.statePrimaSalud = true
        this.statePrimaPension = true
        this.stateBrokerTasaPension = true
        this.stateBrokerTasaSalud = true
        this.retarifa = '0';
        this.polizaEmitCab.PRIMA_SALUD_END = ''
        this.polizaEmitCab.MIN_SALUD_PR = ''
        this.polizaEmitCab.PRIMA_PEN_END = ''
        this.polizaEmitCab.MIN_PENSION_PR = ''
    }

    async getTarifario() {
        this.limpiarTarifario()

        if (this.polizaEmitCab.DES_ACT_ECONOMICA == null || this.polizaEmitCab.COD_DISTRITO == null
            || this.polizaEmitComer.length == 0) {
            return
        }

        let data: any = {};
        data.protectaTariff = {};
        data.protectaTariff.activity = this.polizaEmitCab.COD_ACT_ECONOMICA; // Sub-Actividad
        data.protectaTariff.workers = this.polizaEmit.totalTrabajadores;
        data.protectaTariff.zipCode = this.municipalityTariff.toString(); // Ubigeo Equivalente
        data.protectaTariff.queryDate = ''; // Fecha
        data.protectaTariff.channel = []; //

        // Agregando el clientId
        let client: any = {}
        client.clientId = this.polizaEmitCab.SCLIENT; // Cliente Contratante
        data.protectaTariff.channel.push(client);

        // Agregando los brokerId y middlemanId | Lista de comercializadores
        this.polizaEmitComer.forEach(broker => {
            if (broker.TIPO_CANAL == '6' || broker.TIPO_CANAL == '8') {
                let brokerItem: any = {};
                brokerItem.brokerId = broker.CANAL.toString();
                data.protectaTariff.channel.push(brokerItem);
            } else {
                let middlemanItem: any = {};
                middlemanItem.middlemanId = broker.CANAL.toString();
                data.protectaTariff.channel.push(middlemanItem);
            }
        });

        this.loading = true;
        this.clientInformationService.getTariff(data).subscribe(
            async res => {
                this.loading = false;
                if (res.fields !== null) {
                    this.resList = res;
                    this.editFlag = false

                    // Recorre lo recibido del tarifario
                    await this.generarTasasListas(this.resList)

                } else {
                    this.clearTariff();
                    swal.fire('Información', this.variable.var_sinCombinacion, 'error');
                }
            },
            err => {
                this.loading = false;
                this.clearTariff();
                swal.fire('Información', this.variable.var_sinCombinacion, 'error');
            }
        );
    }

    async generarTasasListas(resList: any) {
        // const nproductP = "120";
        // const nproductS = "130";
        for (var item of resList.fields) {
            let tasasList = await this.cargarTasasServicio(item)
            this.pensionList = item.fieldEquivalenceCore == this.pensionID.id && item.branch == this.pensionID.nbranch ? tasasList : this.pensionList;
            this.saludList = item.fieldEquivalenceCore == this.saludID.id && item.branch == this.saludID.nbranch ? tasasList : this.saludList;
        }

        if ((this.pensionList.length > 0 && this.prodPension) || this.saludList.length > 0 && this.prodSalud) {
            this.canRenew = true
        } else {
            this.canRenew = false
            this.clearTariff();
            swal.fire('Información', this.variable.var_errorTarifario, 'error');
            return;
        }
    }

    async cargarTasasServicio(item: any) {
        var listaTasas: any = []
        if (item.enterprise[0].netRate != undefined) {
            listaTasas = item.enterprise[0].netRate
        } else {
            listaTasas = []
        }

        if (item.channelDistributions != undefined) {
            item.channelDistributions.forEach(channel => {
                this.polizaEmitComer.forEach(broker => {
                    if (channel.roleId == broker.COD_CANAL) {
                        if (item.fieldEquivalenceCore == this.pensionID.id && item.branch == this.pensionID.nbranch) {
                            broker.COMISION_PENSION = (Number(item.commission) * Number(channel.distribution)) / 100;
                            broker.COMISION_PENSION_AUT = (Number(item.commission) * Number(channel.distribution)) / 100;
                        }
                        if (item.fieldEquivalenceCore == this.saludID.id && item.branch == this.saludID.nbranch) {
                            broker.COMISION_SALUD = (Number(item.commission) * Number(channel.distribution)) / 100;
                            broker.COMISION_SALUD_AUT = (Number(item.commission) * Number(channel.distribution)) / 100;
                        }
                    }
                });
            });
        }

        return await listaTasas
    }

    clearTariff() {
        this.tasasList = [];
        this.retarifa = '0';
        this.pensionList = []
        this.saludList = []
        this.polizaEmitComer.forEach(item => {
            item.COMISION_SALUD_PRO = '0';
            item.COMISION_PENSION_PRO = '0';
        });

        this.polizaEmitCab.MIN_SALUD = ''; // Prima minima salud
        this.polizaEmitCab.MIN_SALUD_PR = ''; // Prima minima salud propuesta
        this.polizaEmitCab.MIN_PENSION = ''; // Prima minima pension
        this.polizaEmitCab.MIN_PENSION_PR = ''; // Prima minima pension propuesta
        this.totalNetoPensionSave = 0.00
        this.totalNetoSaludSave = 0.00
        this.igvPensionSave = 0.00
        this.igvSaludSave = 0.00
        this.brutaTotalPensionSave = 0.00
        this.brutaTotalSaludSave = 0.00
        this.comPropuestaSalud = false
        this.comPropuestaPension = false
    }

    addBroker(event) {
        let modalRef = this.modalService.open(SearchBrokerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.listaBroker = this.polizaEmitComer;

        modalRef.result.then((BrokerData) => {
            BrokerData.COMISION_SALUD_AUT = 0;
            BrokerData.COMISION_SALUD_PRO = 0;
            BrokerData.COMISION_PENSION_AUT = 0;
            BrokerData.COMISION_PENSION_PRO = 0;
            BrokerData.CANAL = BrokerData.COD_CANAL.toString()
            BrokerData.COMERCIALIZADOR = BrokerData.RAZON_SOCIAL
            BrokerData.DES_DOC_COMER = BrokerData.STYPCLIENTDOC
            BrokerData.DOC_COMER = BrokerData.NNUMDOC
            BrokerData.PRINCIPAL = 0
            BrokerData.TIPO_CANAL = BrokerData.NTYPECHANNEL
            BrokerData.TYPE_DOC_COMER = BrokerData.NTIPDOC
            BrokerData.eliminarBroker = this.perfil == this.codProfile ? false : true;
            this.sclientComerNew = BrokerData.SCLIENT;
            this.polizaEmitComer.push(BrokerData);
            if (this.mode == 'endosar' || this.editFlag == false) {
                this.equivalentMuni();
            }
        })
    }

    deleteBroker(row) {
        swal.fire({
            title: 'Eliminar Broker',
            text: '¿Estás seguro que deseas eliminar este broker?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.polizaEmitComer.splice(row, 1);
                    if (this.mode == 'endosar' || this.editFlag == false) {
                        this.equivalentMuni();
                    }
                }
            });
    }

    async buscarCotizacion() {
        this.cotizacionID = '';
        this.nroPension = '';
        this.nroSalud = '';
        this.pensionList = [];
        this.saludList = [];
        this.tasasList = [];

        if (this.nrocotizacion != undefined && this.nrocotizacion != 0) {
            const self = this;
            await this.policyemit.getPolicyEmitCab(this.nrocotizacion, this.typeMovement, JSON.parse(localStorage.getItem('currentUser'))['id'])
                .toPromise().then(async res => {
                    this.polCabDate = res.GenericResponse;
                    this.cotizacionID = this.nrocotizacion;
                    if (this.typeMovement == '7') {
                        this.processID = res.GenericResponse.NID_PROC; //AVS - INTERCONEXION SABSA
                    }
                    if (res.GenericResponse !== null) {
                        if (res.GenericResponse.COD_ERR == 0) {
                            var selectedPlan = this.planList.find(f => f.NIDPLAN == res.GenericResponse.NIDPLAN.toString());
                            if (selectedPlan != undefined) {
                                this.DescriptPlan = selectedPlan.SDESCRIPT.toUpperCase();
                            }
                            //this.DescriptPlan = this.planList.find(f => f.NIDPLAN == res.GenericResponse.NIDPLAN.toString()).SDESCRIPT.toUpperCase();
                            this.nroPolizaEps = res.GenericResponse.SPOLICY_MPE;
                            this.polizaEmitCab = res.GenericResponse;
                            this.polizaEmitCab.MINA = res.GenericResponse.MINA == '1' ? true : false;
                            this.polizaEmitCab.DELIMITACION = res.GenericResponse.DELIMITACION == '1' ? '* La actividad cuenta con delimitación' : '';
                            this.minPension = res.GenericResponse.MIN_PENSION_AUT;
                            this.minSalud = res.GenericResponse.MIN_SALUD_AUT;
                            this.polizaEmitCab.prePayment = false;
                            this.transactNumber = res.GenericResponse.NID_TRAMITE;
                            this.polizaEmit.SMAIL_EJECCOM = res.GenericResponse.SMAIL_EJECCOM;
                            this.valMixSAPSA = res.GenericResponse.NCOT_MIXTA; //AVS - INTERCONEXION SABSA
                            this.valSALUD_SCTR = res.GenericResponse.NPRODUCT;

                            await this.callClient360();
                            await this.invokeExperian();

                            // Detalle de comercializadores
                            await this.policyemit.getPolicyEmitComer(this.nrocotizacion)
                                .toPromise().then(async res => {
                                    this.polizaEmitComer = [];
                                    if (res != null && res.length > 0) {
                                        await this.llenarBroker(res);
                                        // Ini Cotizacion EAER -  Gestion de tramites con el Estado Sin trama
                                        // if (res[0].GenericResponse.SPOL_MATRIZ == 1) {
                                        this.loadDatosCotizadorPolizaMatriz();

                                        //}
                                        // Fin Cotizacion EAER -  Gestion de tramites con el Estado Sin trama
                                    }
                                });

                            // seteo valores iniciaoles de rango de vigencia de asegurados
                            this.DateMinFechaIniAseg = this.polizaEmitCab.bsValueIniMin;
                            this.DateFinFechaIniAseg = this.polizaEmitCab.bsValueFinMax;

                            // Detalle de cotizacion
                            await this.policyemit.getPolicyEmitDet(this.nrocotizacion, JSON.parse(localStorage.getItem('currentUser'))['id'])
                                .toPromise().then((res: any) => {
                                    this.primaTotalPension = 0;
                                    this.primatotalSalud = 0;
                                    if (res.length > 0) {
                                        this.cargarTasasPoliza(res);
                                    }
                                });

                            // Detalle de cotización como póliza
                            await this.policyemit.getPolicyCot(this.nrocotizacion, parseInt(this.typeMovement))
                                .toPromise().then(async (res: any) => {
                                    if (res != null) {
                                        await this.cargarDatosPoliza(res);
                                    }

                                    await this.configFechas();
                                    let renovar = true;
                                    if (this.template.ins_validaPermisos) {
                                        renovar = AccessFilter.hasPermission('20');
                                    }
                                    
                                    if (this.mode == 'renew' && renovar && this.template.ins_renovar) {
                                        if (this.flagAprovateTecnica == 'renewAprove') {
                                            this.editFlag = true;
                                                        this.clienteValido = false; // AGF 02052023
                                                        if (this.polizaEmitCab.tipoRenovacion == '6' || this.polizaEmitCab.tipoRenovacion == '7') {
                                                            this.disabledFecha = true;
                                                            this.disabledFechaFin = false;
                                                        }
                                        }else{
                                            swal.fire({
                                                title: 'Renovación',
                                                text: '¿Desea generar renovación con modificación de datos?',
                                                icon: 'info',
                                                showCancelButton: true,
                                                confirmButtonText: 'SÍ',
                                                allowOutsideClick: false,
                                                cancelButtonText: 'NO'
                                            })
                                                .then((result) => {
                                                    //debugger;
                                                    if (result.value) {
                                                        this.editFlag = false;
    
                                                        if (this.polizaEmitCab.tipoRenovacion == '6' || this.polizaEmitCab.tipoRenovacion == '7') {
                                                            this.disabledFecha = true;
                                                            this.disabledFechaFin = false;
                                                        }
    
                                                        if (this.polizaEmit.facturacionVencido == true) {
                                                            this.facVencido = false;
                                                            this.facAnticipada = true;
                                                        }
    
                                                        if (this.polizaEmit.facturacionAnticipada == true) {
                                                            this.facVencido = true;
                                                            this.facAnticipada = false;
                                                        }
    
                                                        if (this.polizaEmit.facturacionVencido == false && this.polizaEmit.facturacionAnticipada == false) {
                                                            this.facVencido = false;
                                                            this.facAnticipada = false;
                                                        }
                                                    } else {
                                                        this.editFlag = true;
                                                        this.clienteValido = false; // AGF 02052023
                                                        if (this.polizaEmitCab.tipoRenovacion == '6' || this.polizaEmitCab.tipoRenovacion == '7') {
                                                            this.disabledFecha = true;
                                                            this.disabledFechaFin = false;
                                                        }
                                                    }
                                                });
                                        }
                                        
                                    }

                                    if (this.mode == 'endosar') {
                                        this.editFlag = false;
                                        if (this.polizaEmit.facturacionVencido == true) {
                                            this.facVencido = false;
                                            this.facAnticipada = true;
                                        }

                                        if (this.polizaEmit.facturacionAnticipada == true) {
                                            this.facVencido = true;
                                            this.facAnticipada = false;
                                        }

                                        if (this.polizaEmit.facturacionVencido == false && this.polizaEmit.facturacionAnticipada == false) {
                                            this.facVencido = false;
                                            this.facAnticipada = false;
                                        }
                                    }
                                    if (this.mode == 'include' || this.mode == 'exclude' || this.mode == 'netear' || this.mode == 'endosar') {
                                        this.disabledFecha = false;
                                        this.disabledFechaFin = true;
                                    }

                                });

                            if (this.mode === 'exclude') {
                                this.polizaEmitCab.primaCobrada = false;
                                this.polizaEmitCab.stateReturn = 'DEUDA';
                                this.polizaEmitCab.amountReturn = 0;
                            }

                        } else {
                            this.loading = false;
                            swal.fire('Información', res.GenericResponse.MENSAJE, 'error')
                                .then((value) => {
                                    this.router.navigate(['/extranet/sctr/consulta-polizas']);
                                })
                            this.clearInfo();
                            return;
                        }
                    } else {
                        this.clearInfo();
                    }
                }, error => {
                    this.loading = false;
                });
        } else {
            swal.fire('Información', 'Ingresar nro de cotización', 'error');
        }

        try {
            const validateLockReq = new ValidateLockRequest();
            validateLockReq.branchCode = this.pensionID.nbranch;
            validateLockReq.productCode = this.pensionID.id;
            validateLockReq.documentType = this.polizaEmitCab.TIPO_DOCUMENTO;
            validateLockReq.documentNumber = this.polizaEmitCab.NUM_DOCUMENTO != null ? this.polizaEmitCab.NUM_DOCUMENTO.toString().trim().toUpperCase() : '';
            this.validateLockResponse = await this.getValidateLock(validateLockReq);
            if (this.validateLockResponse.lockMark == 1) {
                this.flagDisabledRestric = true;
                swal.fire('Información', this.validateLockResponse.observation, 'error');
                this.loading = false;
                this.router.navigate(['/extranet/sctr/consulta-polizas']);
                return;
            } else {
                //this.loading = false;
                if (this.template.ins_validateDebt && this.mode !== 'certificate') {
                    if (this.mode !== 'exclude') {
                        //AVS Mejoras SCTR Deudas
                        //AVS Interconexion SAPSA - se comenta por incompatibilidad 25/05/2023 
                        //this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.polizaEmitCab.SCLIENT, (this.flagEstadoReingresar? '1': this.mode === 'include' ? '2' : this.mode === 'endosar' ? '8' : this.variable.var_movimientoRenovacion));
                        this.loading = false;
                        /*if (this.creditHistory.nflag == this.variable.var_riesgoBajo || this.creditHistory.nflag == this.variable.var_riesgoAlto) {
                            if (this.validateDebtResponse.lockMark != 0) {
                                //AVS Mejoras SCTR Deudas
                                await this.generateAccountStatus(this.pensionID.nbranch, this.pensionID.id, this.polizaEmitCab.SCLIENT, this.variable.var_accountStatusCode).then(() => {
                                    this.loading = false;
                                });
                            }
                            if (this.validateDebtResponse.lockMark == 1) { this.flagDisabledRestric = true; }
                        }*/
                    } else {
                        this.loading = false;
                        //AVS Mejoras SCTR Deudas
                        this.validateDebtResponse = await this.getValidateDebtPolicy(this.pensionID.nbranch, this.pensionID.id, this.polizaEmitCab.SCLIENT, this.nroSalud);
                        console.log(this.validateDebtResponse)
                        /*if (Number(this.validateDebtResponse.amount.replace(',', '')) > 0) {
                            this.flagDisabledRestric = true;
                            this.polizaEmitCab.amountReturn = this.validateDebtResponse.amount;
                            swal.fire('Información', 'El cliente presenta una deuda al día ' + CommonMethods.formatDate(new Date()) + '. No puedes procesar la exclusión hasta que realice el pago de la deuda.', 'error');
                        }*/
                    }
                }
            }
        } catch (e) {

        }

        // CommonMethods.clearBack();
    }

    async invokeExperian(): Promise<any> {
        if (this.template.ins_historialCreditoTransaction) {
            const data: any = {};
            data.tipoid = this.polizaEmitCab.TIPO_DOCUMENTO == '1' ? '2' : '1';
            data.id = this.polizaEmitCab.NUM_DOCUMENTO;
            data.papellido = this.polizaEmitCab.NOMBRE_RAZON;
            data.sclient = this.polizaEmitCab.SCLIENT;
            data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
            return this.clientInformationService.invokeServiceExperia(data).toPromise().then(
                res => {
                    this.creditHistory = {}
                    this.creditHistory.nflag = res.nflag;
                    this.creditHistory.sdescript = res.sdescript;
                }
            );
        }
    }

    async callClient360() {
        const data: any = {};
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.polizaEmitCab.TIPO_DOCUMENTO;
        data.P_SIDDOC = this.polizaEmitCab.NUM_DOCUMENTO != null ? this.polizaEmitCab.NUM_DOCUMENTO.toString().trim().toUpperCase() : '';

        await this.clientInformationService.getCliente360(data).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    this.contractingdata = res.EListClient[0];
                    this.polizaEmitCab.P_SISCLIENT_GBD = (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
                    if (res.EListClient[0].EListContactClient.length == 0) {
                        // this.flagContact = this.epsItem.NCODE != 3 ? true : false;
                        this.flagContact = true;
                    }

                    if (res.EListClient[0].EListEmailClient.length == 0) {
                        this.flagEmail = true;
                    }

                    // if (this.polizaEmitCab.P_SISCLIENT_GBD == 1 && this.isComerExclu == 0) {
                    //     this.flagGobiernoEstado = true;
                    // }


                }
            }, error => {
                this.loading = false;
            }
        );
    }

    async cargarDatosPoliza(res: any) {
        this.nroPension = res[0].POL_PEN;
        this.nroSalud = res[0].POL_SAL;
        this.polizaEmitCab.tipoRenovacion = res[0].TIP_RENOV;

        this.fechaIniEsp = res[0].DESDE;  // fecha ini para renovacion 6  vida ley
        this.fechaFinEsp = res[0].HASTA; //fechas  ini para renovacion 6 vida ley

        await this.cargarFrecuencia();
        this.polizaEmit.facturacionVencido = res[0].FACT_MES_VENC == 0 ? false : true;
        this.polizaEmit.facturacionAnticipada = res[0].FACT_ANTI == 0 ? false : true;
        this.polizaEmitCab.frecuenciaPago = res[0].FREC_PAGO;

        const fechaInicio = this.mode == 'renew' ? new Date(res[0].HASTA) : new Date(res[0].DESDE);

        if (this.template.ins_daySumVig || (this.mode == 'renew' && this.codProducto == 2)) {
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        }

        this.fechaBase = fechaInicio;
        this.polizaEmitCab.bsValueIni = fechaInicio;
        this.polizaEmitCab.bsValueIniMin = fechaInicio;

        if (this.mode != 'renew') {
            this.fechaBaseHasta = res[0].HASTA;
            this.polizaEmitCab.bsValueFin = new Date(res[0].HASTA);
        }

        if (this.mode != 'renew') {
            this.polizaEmitCab.bsValueFinMax = new Date(res[0].HASTA);
        }

        if (this.mode == 'renew' || this.mode == 'endosar' || this.mode == 'include' || this.mode == 'exclude' || this.mode == 'certificate' || this.flagEstadoReingresar) {
            if (this.template.ins_iniVigenciaAseg && this.template.ins_finVigenciaAseg) {
                this.polizaEmitCab.FDateFinAseg = new Date(res[0].HASTA_ASEG);
                this.polizaEmitCab.FDateIniAseg = new Date(res[0].DESDE_ASEG);

                await this.ChangeFrecPago(new Date(res[0].DESDE_ASEG));
            }
            if (this.mode != 'include') {
                await this.fechaFin(this.polizaEmitCab.tipoRenovacion, res[0].HASTA, res[0].DESDE);
            }
        }
    }

    cargarTasasPoliza(res: any) {
        // console.log(this.polizaEmitCab.MIN_PENSION);
        for (const item of res) {
            let totalTrabajadores = 0;
            item.PRIMA = CommonMethods.formatValor(item.PRIMA, 2);
            item.TASA_PRO = '';
            item.PRIMA_MIN_PRO = '';
            item.rateDet = item.TASA_RIESGO;
            totalTrabajadores = totalTrabajadores + Number(item.NUM_TRABAJADORES)

            this.polizaEmitCab.PRIMA_PEN_END = item.ID_PRODUCTO == this.pensionID.id ? this.mode == 'renew' ? item.PRIMA_MIN_AUT : item.PRIMA_END : this.polizaEmitCab.PRIMA_PEN_END;
            this.polizaEmitCab.MIN_PENSION_PR = item.ID_PRODUCTO == this.pensionID.id ? 0 : this.polizaEmitCab.MIN_PENSION_PR;
            this.endosoPension = item.ID_PRODUCTO == this.pensionID.id ? item.PRIMA_END : this.endosoPension;
            this.activityVariationPension = item.ID_PRODUCTO == this.pensionID.id ? item.VARIACION_TASA : this.activityVariationPension;
            this.primaTotalPension = item.ID_PRODUCTO == this.pensionID.id ? CommonMethods.formatValor(item.NSUM_PREMIUMN, 2) : this.primaTotalPension;
            this.igvPension = item.ID_PRODUCTO == this.pensionID.id ? CommonMethods.formatValor(item.NSUM_IGV, 6) : this.igvPension;
            this.totalPension = item.ID_PRODUCTO == this.pensionID.id ? CommonMethods.formatValor(item.NSUM_PREMIUM, 6) : this.totalPension;
            this.totalNetoPensionSave = item.ID_PRODUCTO == this.pensionID.id ? CommonMethods.formatValor(item.NSUM_PREMIUMN, 6) : this.totalNetoPensionSave;
            this.igvPensionSave = item.ID_PRODUCTO == this.pensionID.id ? CommonMethods.formatValor(item.NSUM_IGV, 6) : this.igvPensionSave;
            this.brutaTotalPensionSave = item.ID_PRODUCTO == this.pensionID.id ? CommonMethods.formatValor(item.NSUM_PREMIUM, 6) : this.brutaTotalPensionSave;

            this.polizaEmitCab.PRIMA_SALUD_END = item.ID_PRODUCTO == this.saludID.id ? this.mode == 'renew' ? item.PRIMA_MIN_AUT : item.PRIMA_END : this.polizaEmitCab.PRIMA_SALUD_END;
            this.polizaEmitCab.MIN_SALUD_PR = item.ID_PRODUCTO == this.saludID.id ? 0 : this.polizaEmitCab.MIN_SALUD_PR;
            this.endosoSalud = item.ID_PRODUCTO == this.saludID.id ? item.PRIMA_END : this.endosoSalud;
            this.activityVariationSalud = item.ID_PRODUCTO == this.saludID.id ? item.VARIACION_TASA : this.activityVariationSalud;
            this.primatotalSalud = item.ID_PRODUCTO == this.saludID.id ? CommonMethods.formatValor(item.NSUM_PREMIUMN, 2) : this.primatotalSalud;
            this.igvSalud = item.ID_PRODUCTO == this.saludID.id ? CommonMethods.formatValor(item.NSUM_IGV, 6) : this.igvSalud;
            this.totalSalud = item.ID_PRODUCTO == this.saludID.id ? CommonMethods.formatValor(item.NSUM_PREMIUM, 6) : this.totalSalud;
            this.totalNetoSaludSave = item.ID_PRODUCTO == this.saludID.id ? CommonMethods.formatValor(item.NSUM_PREMIUMN, 6) : this.totalNetoSaludSave;
            this.igvSaludSave = item.ID_PRODUCTO == this.saludID.id ? CommonMethods.formatValor(item.NSUM_IGV, 6) : this.igvSaludSave;
            this.brutaTotalSaludSave = item.ID_PRODUCTO == this.saludID.id ? CommonMethods.formatValor(item.NSUM_PREMIUM, 6) : this.brutaTotalSaludSave;

            item.ID_PRODUCTO == this.pensionID.id ? this.pensionList.push(item) : this.saludList.push(item);
            this.polizaEmitCab.totalTrabajadores = totalTrabajadores;
            this.prodPension = item.ID_PRODUCTO == this.pensionID.id ? true : this.prodPension;
            this.prodSalud = item.ID_PRODUCTO == this.saludID.id ? true : this.prodSalud;
        }

        this.tasasList = this.pensionList.length > 0 ? this.pensionList : this.saludList.length > 0 ? this.saludList : [];
    }

    llenarBroker(res: any) {
        for (const item of res) {
            item.eliminarBroker = true;
            item.COMISION_PENSION_AUT = item.COMISION_PENSION_AUT == '' ? '0' : item.COMISION_PENSION_AUT;
            item.COMISION_PENSION_PRO = '0';
            item.COMISION_SALUD_AUT = item.COMISION_SALUD_AUT == '' ? '0' : item.COMISION_SALUD_AUT;
            item.COMISION_SALUD_PRO = '0';
            item.valItemSal = false;
            item.valItemPen = false;
            this.sclientComer = item.SCLIENT;
            // this.sclientComerNew = this.modificarTransact ? item.SCLIENT : '';
        }

        this.polizaEmitComer = res;
        if (this.perfil == this.codProfile) {
            this.polizaEmitComer[0].eliminarBroker = false;
        } else {
            this.polizaEmitComer[0].eliminarBroker = true;
        }
    }

    clearInfo() {
        this.polizaEmitCab = {};
        this.polizaEmitCab.bsValueIni = new Date();
        this.polizaEmitCab.bsValueFin = new Date();
        this.polizaEmitCab.bsValueIniMin = new Date();
        this.polizaEmitCab.bsValueFinMax = new Date();
        this.polizaEmitCab.TIPO_DOCUMENTO = '';
        this.polizaEmitCab.tipoRenovacion = '';
        this.polizaEmitCab.ACT_TECNICA = '';
        this.polizaEmitCab.COD_ACT_ECONOMICA = '';
        this.polizaEmitCab.COD_TIPO_SEDE = '';
        this.polizaEmitCab.COD_MONEDA = '';
        this.polizaEmitCab.COD_DEPARTAMENTO = '';
        this.polizaEmitCab.COD_PROVINCIA = '';
        this.polizaEmitCab.COD_DISTRITO = '';
        this.polizaEmitCab.frecuenciaPago = '';
        this.comPropuestaSalud = false
        this.comPropuestaPension = false

        CommonMethods.formatValor(1, 61);
    }


    async obtenerTipoRenovacion() {
        const requestTypeRen: any = {};
        requestTypeRen.P_NEPS = this.epsItem.STYPE;
        requestTypeRen.P_NPRODUCT = this.codProducto;
        requestTypeRen.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        if (this.mode == 'broker' || (this.editFlag && !this.enabledFrecPago)) { // INI POLIZAS ESPECIALES RI JTV 11102022
            requestTypeRen.P_ENABLED = 0;
        }
        else {
            requestTypeRen.P_ENABLED = 1;
        } // FIN POLIZAS ESPECIALES RI JTV 11102022

        await this.policyemit.getTipoRenovacion(requestTypeRen)
            .toPromise().then(async (res: any) => {
                this.tipoRenovacion = res;
                if (this.polizaEmitCab.tipoRenovacion !== undefined) {
                    await this.cargarFrecuencia();
                }
            });
    }

    motivosAnulacion() {
        this.policyemit.GetAnnulment().toPromise().then(
            (res: any) => {
                this.annulmentList = res;
            });
    }
    // tipo endoso
    getTypeEndoso() {
        this.policyemit.GetTypeEndoso().toPromise().then(
            (res: any) => {
                this.tipoEndoso = res;
                this.polizaEmitCab.TYPE_ENDOSO = '';
            });
    }

    async infoCarga(processID: any) {
        // console.log(this.polizaEmitCab.PRIMA_PEN_END);
        let Vencido = this.facVencido == true ? 1 : 0; //AVS - INTERCONEXION SABSA
        if (processID != '') {
            await this.policyemit.getPolicyEmitDetTX(processID, this.typeMovement, JSON.parse(localStorage.getItem('currentUser'))['id'], Vencido)
                .toPromise().then(async res => {
                    if (res.length > 0) {
                        this.pensionList = [];
                        this.saludList = [];
                        this.primaTotalPension = 0;
                        this.primatotalSalud = 0;

                        await this.completarCalculos(res);
                        let remunProducto = this.pensionList.length > 0 ? this.pensionID.id : this.saludID.id; //AVS - INTERCONEXION SABSA
                        if (this.template.ins_rmaList && (this.pensionList.length > 0 || this.saludList.length > 0)) { await this.remuneracionMaximaList(res, remunProducto); } //AVS - INTERCONEXION SABSA
                        // AGF 02052023
                        if (this.template.ins_clienteRegula && this.mode !== "renew") { this.clienteValido = res[0].OPC_MES_VENCIDO == 1 ? true : false; }
                        if (Number(this.typeMovement) != 3) { //AVS - INTERCONEXION SABSA
                            this.resetearPrimas(this.polizaEmitCab.PRIMA_PEN_END, this.pensionID.id, this.polizaEmit.facturacionVencido);
                            this.resetearPrimas(this.polizaEmitCab.PRIMA_SALUD_END, this.saludID.id, this.polizaEmit.facturacionVencido);
                        }
                        console.log(this.pensionList, this.saludList);
                        
                        this.tasasList = this.pensionList.length > 0 ? this.pensionList : this.saludList.length > 0 ? this.saludList : [];
                        this.cargarPlanillas();
                        this.verificarFlat();
                        console.log("Fecha bsValueIni: " + CommonMethods.formatDate(this.polizaEmitCab.bsValueIni));
                        console.log("Fecha FECHA_REGISTRO: " + this.polizaEmitCab.FECHA_REGISTRO);
                        let varCalcExec: number = (CommonMethods.formatDate(this.polizaEmitCab.bsValueIni) === CommonMethods.formatDateToDDMMYYYY(this.polizaEmitCab.FECHA_REGISTRO)) ? 1 : 2;
                        //let nproduct_exec: number = (this.polizaEmitCab.NCOT_MIXTA === 1) ? this.pensionID.id : (this.polizaEmitCab.NPRODUCT === Number(this.pensionID.id)) ? this.pensionID.id : this.saludID.id;
                        let fecha_exclusion = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni)

                        if (Number(this.typeMovement) == 3) { //AVS - INTERCONEXION SABSA
                            if (this.pensionList.length > 0) {
                                this.totalNetoPensionSave = this.totalNetoPensionSave != null ? this.polizaEmitCab.primaComPensionPre : this.totalNetoPensionSave;
                                this.polizaEmitCab.primaComPension = this.polizaEmitCab.primaComPensionPre != null ? this.polizaEmitCab.primaComPensionPre : this.polizaEmitCab.primaComPension;
                                this.igvPensionSave = this.igvPension != null ? this.igvPension : this.igvPension != undefined ? this.igvPension : this.igvPension != 0 ? this.igvPension : this.igvPensionSave;
                                this.brutaTotalPensionSave = this.brutaTotalPensionSave != null ? (Number(this.polizaEmitCab.primaComPensionPre) + Number(this.igvPension)) : this.brutaTotalPensionSave; //AGF 09012024 parseo IGV
                                await this.calculosExcSCTR(processID, this.pensionID.nbranch, this.pensionID.id, this.nrocotizacion, this.nroPension, varCalcExec, fecha_exclusion);
                            }
                            if (this.saludList.length > 0) {
                                this.totalNetoSaludSave = this.totalNetoSaludSave != null ? this.polizaEmitCab.primaComSaludPre : this.totalNetoSaludSave;
                                this.polizaEmitCab.primaComSalud = this.polizaEmitCab.primaComSaludPre != null ? this.polizaEmitCab.primaComSaludPre : this.polizaEmitCab.primaComSalud;
                                this.igvSaludSave = this.igvSalud != null ? this.igvSalud : this.igvSalud != undefined ? this.igvSalud : this.igvSalud != 0 ? this.igvSalud : this.igvSaludSave;
                                this.brutaTotalSaludSave = this.brutaTotalSaludSave != null ? (Number(this.polizaEmitCab.primaComSaludPre) + Number(this.igvSalud)) : this.brutaTotalSaludSave; //AGF 09012024 parseo IGV
                                await this.calculosExcSCTR(processID, this.pensionID.nbranch, this.saludID.id, this.nrocotizacion, this.nroSalud, varCalcExec, fecha_exclusion);
                            }
                        }
                    } else {
                        this.primaTotalPension = 0;
                        this.primatotalSalud = 0;
                        this.igvPension = 0;
                        this.igvSalud = 0;
                        this.totalSalud = 0;
                        this.totalPension = 0;
                    }
                })
        }

    }

    cargarPlanillas() {
        if (this.pensionList.length > 0) {
            this.tasasList.forEach(tasa => {
                this.pensionList.forEach(pension => {
                    if (tasa.TIP_RIESGO == pension.TIP_RIESGO) {
                        tasa.MONTO_PLANILLA_PENSION = pension.MONTO_PLANILLA;
                    }
                });
            });
        }

        if (this.saludList.length > 0) {
            this.tasasList.forEach(tasa => {
                this.saludList.forEach(salud => {
                    if (tasa.TIP_RIESGO == salud.TIP_RIESGO) {
                        tasa.MONTO_PLANILLA_SALUD = salud.MONTO_PLANILLA;
                    }
                });
            });
        }
    }

    remuneracionMaximaList(res: any, productId: any): any {
        for (const item of res) {
            if (item.ID_PRODUCTO == productId) {
                this.polizaEmitCab.rma = item.REMUNERACION_TOPE;
                this.polizaEmitCab.desdeRma = item.REMUN_TOPE_DESDE;
                this.polizaEmitCab.finRma = item.REMUN_TOPE_HASTA;
            }
        }
    }

    verificarFlat() {
        let flat = false;
        this.tasasList.forEach(item => {
            if (item.TIP_RIESGO == 4 && Number(item.MONTO_PLANILLA) > 0) {
                flat = true;
            }
        });

        let num = 0;
        this.tasasList.forEach(item => {
            if (this.editFlag == false) {
                if (flat == false) {
                    this.disabledFlat[num].id = item.TIP_RIESGO;
                    this.disabledFlat[num].value = false;
                    if (item.TIP_RIESGO == '4') {
                        this.disabledFlat[num].value = true;
                    }
                } else {
                    this.disabledFlat[num].id = item.TIP_RIESGO;
                    if (item.TIP_RIESGO == '4') {
                        this.disabledFlat[num].value = false;
                    } else {
                        this.disabledFlat[num].value = true;
                    }
                }
            } else {
                this.disabledFlat[num].value = true;
            }

            num++
        });
    }

    async completarCalculos(res: any) {
        const pensionList = [];
        const saludList = [];

        for (const item of res) {
            if (item.ID_PRODUCTO == this.pensionID.id) {
                pensionList.push(item);
            }

            if (item.ID_PRODUCTO == this.saludID.id) {
                saludList.push(item)
            }
        }

        const infoDataPension: any = await this.infoGenerica(this.pensionID.id, pensionList);
        if (infoDataPension != null) {
            this.activityVariationPension = infoDataPension.actividadVariacion;
            this.primaTotalPension = infoDataPension.totalNetoPre;
            this.brutaTotalPensionSave = infoDataPension.totalNeto;
            this.polizaEmitCab.primaComPension = infoDataPension.primaCom;
            this.polizaEmitCab.primaComPensionPre = infoDataPension.primaComPre;
            this.igvPension = infoDataPension.igvPre;
            this.igvPensionSave = infoDataPension.igv;
            this.totalNetoPensionSave = infoDataPension.totalBrutoPre;
            this.totalNetoPensionSave = infoDataPension.totalBruto;
            this.endosoPension = infoDataPension.endoso;
            this.pensionList = infoDataPension.tasasProducto;
            this.prodPension = this.pensionList.length > 0 ? true : false;
        }

        const infoDataSalud: any = await this.infoGenerica(this.saludID.id, saludList);
        // console.log(infoDataSalud);
        if (infoDataSalud != null) {
            this.activityVariationSalud = infoDataSalud.actividadVariacion;
            this.primatotalSalud = infoDataSalud.totalNetoPre;
            this.brutaTotalSaludSave = infoDataSalud.totalNeto;
            this.polizaEmitCab.primaComSalud = infoDataSalud.primaCom;
            this.polizaEmitCab.primaComSaludPre = infoDataSalud.primaComPre;
            this.igvSalud = infoDataSalud.igvPre;
            this.igvSaludSave = infoDataSalud.igv;
            this.totalNetoSaludSave = infoDataSalud.totalBrutoPre;
            this.totalNetoSaludSave = infoDataSalud.totalBruto;
            this.endosoSalud = infoDataSalud.endoso;
            this.saludList = infoDataSalud.tasasProducto;
            this.prodSalud = this.saludList.length > 0 ? true : false;
        }

        if (this.pensionList.length > 0) {
            for (let i = 0; i < this.pensionList.length; i++) { //AVS - INTERCONEXION SABSA
                if (pensionList[i].DES_RIESGO.toUpperCase().includes('FLAT')) {
                    pensionList[i].DES_RIESGO = 'Riesgo medio';
                }
            }
        }

        if (this.saludList.length > 0) {
            for (let i = 0; i < this.saludList.length; i++) { //AVS - INTERCONEXION SABSA
                if (saludList[i].DES_RIESGO.toUpperCase().includes('FLAT')) {
                    saludList[i].DES_RIESGO = 'Riesgo medio';
                }
            }
        }

        const customOrder = ["Riesgo alto", "Riesgo medio", "Riesgo bajo", "Medio"]; //AVS - INTERCONEXION SABSA 05/09/2023
        this.customSort(this.pensionList, customOrder);
        this.customSort(this.saludList, customOrder);
    }

        //AVS - INTERCONEXION SABSA - ORDENAMIENTO
        customSort(arr, order) {
            return arr.sort((a, b) => {
                const indexA = order.indexOf(a.DES_RIESGO);
                const indexB = order.indexOf(b.DES_RIESGO);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }

    infoGenerica(productoId: any, item: any): any {
        let response: any = {};
        const dEmision: number = productoId == this.pensionID.id ? this.dEmiPension : this.dEmiSalud;
        const igvProducto: number = productoId == this.pensionID.id ? this.igvPensionWS : this.igvSaludWS;
        const tasasProducto: any = item;
        if (tasasProducto.length > 0) {
            let neto = 0;
            let totalTrabajadores = 0;
            tasasProducto.forEach(item => {
                item.TASA_PRO = '';
                item.PRIMA_MIN_PRO = 0;
                item.AUT_PRIMA = Number(item.AUT_PRIMA);
                item.rateDet = item.TASA_RIESGO;
                response.endoso = item.PRIMA_END;
                response.prima_min = CommonMethods.formatValor(item.PRIMA_MIN, 2);
                response.actividadVariacion = !isNaN(Number(item.VARIACION_TASA)) ? item.VARIACION_TASA : 0;
                neto = neto + Number(item.AUT_PRIMA);
                totalTrabajadores = totalTrabajadores + Number(item.NUM_TRABAJADORES);
            });
            this.stateTransac = neto > 0 ? false : true;
            response.mensaje = '';
            response.totalNetoPre = CommonMethods.formatValor(neto, 6);
            response.totalNeto = CommonMethods.formatValor(neto, 6);
            response.primaComPre = CommonMethods.formatValor(neto * dEmision, 6);
            response.primaCom = CommonMethods.formatValor(neto * dEmision, 6);
            response.igvPre = CommonMethods.formatValor((Number(response.totalNetoPre) * Number(igvProducto)) - Number(response.totalNetoPre), 6);
            response.igv = CommonMethods.formatValor((Number(response.totalNeto) * Number(igvProducto)) - Number(response.totalNeto), 6);
            response.totalBrutoPre = CommonMethods.formatValor(Number(response.primaComPre) + Number(response.igv), 6);
            response.totalBruto = CommonMethods.formatValor(Number(response.primaCom) + Number(response.igv), 6);

            if (this.polizaEmit.facturacionVencido == false) {
                if (Number(response.totalNeto) < Number(response.prima_min)) {
                    response.totalNeto = CommonMethods.formatValor(Number(response.prima_min), 6);
                    response.primaCom = CommonMethods.formatValor(response.totalNeto * dEmision, 6);
                    response.igv = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 6);
                    response.totalBruto = CommonMethods.formatValor(Number(response.primaCom) + Number(response.igv), 6);
                    response.mensaje = this.variable.var_msjPrimaMin;
                }
            }

            this.polizaEmitCab.totalTrabajadores = totalTrabajadores;
            response.tasasProducto = tasasProducto;
            // console.log(response.totalNeto);
        } else {
            response = null;
        }
        return response;
    }

    async cambioFecha() {
        this.errorFrecPago = false;
    }

    async validateEmit() {
        let mensaje = '';
        const self = this;
        if (this.cotizacionID == '') {
            this.errorNroCot = true;
            mensaje = 'Debe ingresar una cotización <br />';
        }
        if (this.polizaEmitCab.frecuenciaPago == '' || this.polizaEmitCab.frecuenciaPago == '0') {
            this.errorFrecPago = true;
            mensaje += 'Debe ingresar una frecuencia de pago <br />';
        }
        if (this.polizaEmitCab.tipoRenovacion == '' || this.polizaEmitCab.tipoRenovacion == '0') {
            this.flagTipoR = true;
            mensaje += 'Debe ingresar un tipo de renovación <br />';
        }
        if (this.mode != 'endosar' && this.mode != 'cancel') {
            if (this.excelSubir === undefined) {
                if (this.flagAprovateTecnica !== 'renewAprove'){
                this.errorExcel = true;
                mensaje += 'Debe subir un archivo excel para su validación <br />';
                }
            } else {
                if (this.erroresList.length > 0 || this.processID == '') {
                    this.errorExcel = true;
                    mensaje += 'No se ha procesado la validación de forma correcta <br />';
                }
            }
            if (this.template.ins_addContact && this.contractingdata.EListContactClient != undefined) {
                if (this.contactList.length == 0 && this.contractingdata.EListContactClient.length == 0) {
                    mensaje += this.variable.var_contactZero + '<br />';
                }
            }
        }

        if (this.polizaEmitComer.length == 0) {
            mensaje += 'Debe tener al menos un broker agregado <br />';
        } else {
            var index = 0;
            this.polizaEmitComer.forEach(broker => {
                if (self.saludList.length > 0) {
                    if (broker.valItemSal == true) {
                        mensaje += 'La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]<br>'
                    }
                }
                if (self.pensionList.length > 0) {
                    if (broker.valItemPen == true) {
                        mensaje += 'La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]<br>'
                    }
                }

                // R.P.
                if (this.codProducto == 2 && !this.isUserOp && this.nTransac == 4 && !this.isDeclare) {
                    let obj = '';
                    if (broker.COD_CANAL == undefined || broker.COD_CANAL == '') {

                        obj = this.BrokerObl.find(o => o.NINTERMED == broker.CANAL)

                    } else {

                        obj = this.BrokerObl.find(o => o.NINTERMED == broker.COD_CANAL)

                    }

                    if (obj != null && (this.selectedDep[index] == null || this.selectedDep[index] == "0")) {
                        mensaje += 'Falta completar campo oficina de producción <br>'
                    }
                    index = index + 1;

                }
                // R.P.

            });
        }

        if (this.mode == 'endosar' || this.mode == 'renew') {
            if (this.canRenew == false) {
                if (this.polizaEmitComer.length == 1) {
                    mensaje += 'El broker no tiene ninguna tarifa configurada <br />';
                }
                if (this.polizaEmitComer.length > 1) {
                    mensaje += 'Los brokers no tienen ninguna tarifa configurada <br />';
                }
            }
        }

        if (this.template.ins_email) {
            if (this.polizaEmitCab.CORREO == '' || this.polizaEmitCab.CORREO == undefined) {
                mensaje += 'Debe ingresar un correo electrónico para la factura.';
            } else {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.polizaEmitCab.CORREO) == false) {
                    mensaje += 'El correo electrónico es inválido.';
                }
            }
        }


        // -- validar si usan el tasaList
        if (this.codProducto == 2) {
            if (this.tasasList.length == 0) {
                mensaje += 'Para generar una cotización debe tener un producto <br>'
            } else {
                if (this.tasasList.length > 0) {
                    let countWorker = 0;
                    let countPlanilla = 0;
                    this.tasasList.forEach(item => {
                        if (item.NUM_TRABAJADORES == 0) {
                            countWorker++
                        } else {
                            if (item.MONTO_PLANILLA == 0) {
                                mensaje += 'Debe ingresar un monto en el campo planilla de la categoría ' + item.DES_RIESGO + ' <br>'
                            }
                        }

                        if (item.MONTO_PLANILLA == 0) {
                            countPlanilla++;
                        } else {
                            if (item.NUM_TRABAJADORES == 0) {
                                mensaje += 'Debe ingresar trabajadores de la categoría ' + item.DES_RIESGO + ' <br>'
                            }
                        }
                    });

                    if (countPlanilla == this.tasasList.length) {
                        if (countWorker == this.tasasList.length) {
                            mensaje += 'Debe ingresar trabajadores al menos en un tipo de riesgo <br>';
                        }
                    }


                    if (countWorker == this.tasasList.length) {
                        if (countPlanilla == this.tasasList.length) {
                            mensaje += 'Debe ingresar planilla al menos en un tipo de riesgo <br>';
                        }
                    }
                }
            }

            this.pensionList.forEach(item => {
                if (Number(item.NUM_TRABAJADORES) == 0 && Number(item.MONTO_PLANILLA) == 0) {
                    if (item.TASA_PRO != 0) {
                        mensaje += 'No puedes proponer tasa en la categoría ' + item.DES_RIESGO + ' [Pensión]<br>'
                    }
                } else {
                    if (item.valItem == true) {
                        mensaje += 'La tasa es mayor a 100 en la categoría ' + item.DES_RIESGO + ' [Pensión]<br>'
                    }
                }
            });

            this.saludList.forEach(item => {
                if (Number(item.NUM_TRABAJADORES) == 0 && Number(item.MONTO_PLANILLA) == 0) {
                    if (item.TASA_PRO != 0) {
                        mensaje += 'No puedes proponer tasa en la categoría ' + item.DES_RIESGO + ' [Salud] <br>'
                    }
                } else {
                    if (item.valItem == true) {
                        mensaje += 'La tasa es mayor a 100 en la categoría ' + item.DES_RIESGO + ' [Salud]<br>'
                    }
                }
            });

            if (this.mode == 'cancel') {
                if (this.annulmentID == null) {
                    mensaje += 'Debe ingresar el motivo de anulación <br />'
                }
            }

            if (this.stateWorker == true) {
                mensaje += 'La cantidad de trabajadores no es la correcta <br />';
            }
            /*
                        if (this.validateDebtResponse.lockMark === 1) { ////AVS - Mejoras SCTR - Validacion de deudas
                            mensaje = 'El cliente con cotización N° ' + this.nrocotizacion + ', ' + 'cuenta con deuda pendiente y no se podra realizar la transacción de la poliza';
                        }*/
        }

        return mensaje
    }

    clearValidate(numInput) {
        this.inputsValidate[numInput] = false
    }

    async generarPoliza() {
        //debugger;
        let mensaje = '';
        mensaje = await this.validateEmit();

        if (mensaje == '') {

            let data = {
                nbranch: this.nbranch,
                nproduct: this.polizaEmitCab.NPRODUCT,
                ncotizacion: this.cotizacionID,
                nflagMixto: this.polizaEmitCab.NCOT_MIXTA
            }

            await this.policyemit.validateAgencySCTR(data).toPromise().then(
                async res => {
                    if (res.P_COD_ERR == 1) {
                        mensaje = res.P_MESSAGE;
                    }
                },
                error => {
                    this.loading = false;
                }
            );
        }

        if (mensaje == '') {

            // validar retroactividad
            if (this.codProducto == 2 && this.codProfile == 31 || this.codProducto == 2 && this.codProfile == 32) {
                const response: any = await this.ValidateRetroactivity();
                if (response.P_NCODE == 4) {
                    await swal.fire('Información', response.P_SMESSAGE, 'error');
                    return;
                }
            }

            if (this.template.ins_addContact || this.template.ins_email) {
                this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.contractingdata.P_TipOper = 'INS';
                this.contractingdata.P_NCLIENT_SEG = -1;

                if (this.flagContact && this.template.ins_addContact) {
                    this.contractingdata.EListContactClient = [];
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
                    contractingEmail.P_SE_MAIL = this.polizaEmitCab.CORREO;
                    contractingEmail.P_SORIGEN = 'SCTR';
                    contractingEmail.P_SRECTYPE = '4';
                    contractingEmail.P_TipOper = '';
                    this.contractingdata.EListEmailClient.push(contractingEmail);
                } else {
                    this.contractingdata.EListEmailClient = null;
                }

                if (this.flagContact || this.flagEmail) {
                    const response: any = await this.updateContracting();
                    if (response.code == '0' || response.code == '2') {
                        this.proccessTrx();
                    } else {
                        swal.fire('Información', response.message, 'error');
                        return;
                    }
                } else {
                    this.proccessTrx();
                }
            } else {
                this.proccessTrx();
            }


        } else {
            swal.fire('Información', mensaje, 'error');
        }
    }

    proccessTrx() {
        swal.fire({
            title: 'Información',
            text: this.questionText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.value) {
                if (this.mode == 'endosar') {
                    this.endososarPolicy();
                } else if (this.mode !== 'exclude') {
                        this.RenewSCTR = false;
                        this.conModificacion();
                    } else {
                    this.excludePolicy();
                }
            }
        });
    }

    excludePolicy() {
        const myFiles: FormData = new FormData();
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });
        // LS - Exclusiones con Derivacion a tecnica
        const params = this.obtenerParametrosCotizacion();
        let self = this;
        self.loading = true;
        this.policyemit.renewMod(params, myFiles).subscribe(
            res => {
                if (res.P_COD_ERR == 0) {
                    this.createJob();
                } else {
                    self.loading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            err => {
                self.loading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
            }
        );
    }

    obtenerParametrosCotizacion() {// LS - Exclusiones con Derivacion a tecnica
        let self = this;
        let dataQuotation: any = {};

        const myFiles: FormData = new FormData(); /* Para los archivos EH */
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });

        dataQuotation.P_STRAN = this.stran;
        dataQuotation.P_SCLIENT = this.polizaEmitCab.SCLIENT;
        dataQuotation.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA;
        dataQuotation.P_NBRANCH = this.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = 0;
        dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NREM_EXC = this.polizaEmitCab.P_NREM_EXC == true ? 1 : 0; // RQ EXC EHH
        dataQuotation.RetOP = 2; // ehh retroactividad
        dataQuotation.planId = this.mode == 'endosar' || this.polizaEmitCab.desTipoPlan == undefined ? 0 : this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.polizaEmitCab.desTipoPlan).NIDPLAN;
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.polizaEmitCab.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.P_DEVOLVPRI = this.polizaEmitCab.primaCobrada == true ? 1 : 0;
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];
        dataQuotation.P_NBRANCH = this.pensionID.nbranch;
        dataQuotation.P_NPRODUCT = this.pensionID.id;
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.CodigoProceso = this.processID;
        dataQuotation.TrxCode = 'EX';
        if (this.isDeclare) {
            dataQuotation.IsDeclare = this.isDeclare;
        }
        dataQuotation.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
        dataQuotation.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni); // Fecha Inicio
        dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin); // Fecha hasta

        if (this.mode == 'exclude') {
            dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
            dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        }

        // Detalle de Cotizacion Pension

        const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
        const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

        if (this.pensionList.length > 0) {
            this.pensionList.forEach(dataPension => {
                let savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataPension.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataPension.TASA_PRO == '' ? '0' : dataPension.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_PENSION;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_PENSION_PR == '' ? '0' : this.polizaEmitCab.MIN_PENSION_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoPension == null ? '0' : this.endosoPension;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvPensionSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                savedPolicyEmit.P_NRATE = dataPension.rateDet == null ? '0' : dataPension.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                savedPolicyEmit.P_FLAG = this.retarifa;
                /* Nuevos parametros ins_cotizacion_det EHH */
                savedPolicyEmit.P_NAMO_AFEC = this.mode == 'exclude' ? this.npremiumnExec_Pension : this.GetNamoAfectDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago); 
                savedPolicyEmit.P_NIVA = this.mode == 'exclude' ? this.nigvExec_Pension :  this.GetNivaDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.mode == 'exclude' ? this.npremiumExec_Pension :  this.GetNamountDetailTotalListValue_SCTR_PENSION(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                /* * */
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Detalle de Cotizacion Salud
        if (this.saludList.length > 0) {
            const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
            const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);

            this.saludList.forEach(dataSalud => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
                savedPolicyEmit.P_NBRANCH = this.saludID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_SALUD;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_SALUD_PR == '' ? '0' : this.polizaEmitCab.MIN_SALUD_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoSalud == null ? '0' : this.endosoSalud;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvSaludSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                savedPolicyEmit.P_NRATE = dataSalud.rateDet == null ? '0' : dataSalud.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                savedPolicyEmit.P_FLAG = this.retarifa;
                savedPolicyEmit.P_NAMO_AFEC = this.mode == 'exclude' ? this.npremiumnExec_Salud : this.GetNamoAfectDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NIVA = this.mode == 'exclude' ? this.nigvExec_Salud :  this.GetNivaDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NAMOUNT = this.mode == 'exclude' ? this.npremiumExec_Salud :  this.GetNamountDetailTotalListValue_SCTR_SALUD(this.polizaEmitCab.frecuenciaPago);
                savedPolicyEmit.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Comercializadores secundarios
        var index = 0;
        if (this.polizaEmitComer.length > 0) {
            this.polizaEmitComer.forEach(dataBroker => {
                let itemQuotationCom: any = {};
                itemQuotationCom.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
                itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                itemQuotationCom.P_NCOMISION_SAL = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
                itemQuotationCom.P_NCOMISION_SAL_PR = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
                itemQuotationCom.P_NCOMISION_PEN = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
                itemQuotationCom.P_NCOMISION_PEN_PR = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
                itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                dataQuotation.QuotationCom.push(itemQuotationCom);
                index = index + 1;
            });
        }

        // --Ini - Marcos Silverio
        dataQuotation.planSeleccionado = this.polizaEmitCab.desTipoPlan == undefined ? '' : this.polizaEmitCab.desTipoPlan;
        dataQuotation.planPropuesto = this.planPropuesto == undefined ? '' : this.planPropuesto;
        // --Fin - Marcos Silverio

        dataQuotation.TipoEndoso = this.polizaEmitCab.TYPE_ENDOSO === '' ? this.polizaEmitCab.TYPE_ENDOSO = 0 : this.polizaEmitCab.TYPE_ENDOSO;

        return dataQuotation;
    }

    endososarPolicy() {
        let self = this;
        self.loading = true;
        const dataQuotation: any = {};
        dataQuotation.NumeroCotizacion = this.nrocotizacion;  // RI
        dataQuotation.P_SCLIENT = this.polizaEmitCab.SCLIENT;
        dataQuotation.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA;
        dataQuotation.P_NBRANCH = this.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = '';
        dataQuotation.P_SCOMMENT = ''
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        // Detalle de Cotizacion Pension
        if (this.pensionList.length > 0) {
            this.pensionList.forEach(dataPension => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
                savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.pensionID.id;
                savedPolicyEmit.P_NMODULEC = dataPension.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataPension.TASA_PRO == '' ? '0' : dataPension.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_PENSION;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_PENSION_PR == '' ? '0' : this.polizaEmitCab.MIN_PENSION_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoPension == null ? '0' : this.endosoPension;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvPensionSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                savedPolicyEmit.P_NRATE = dataPension.rateDet == null ? '0' : dataPension.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                savedPolicyEmit.P_FLAG = this.retarifa;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Detalle de Cotizacion Salud
        if (this.saludList.length > 0) {
            this.saludList.forEach(dataSalud => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
                savedPolicyEmit.P_NBRANCH = this.saludID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataSalud.TIP_RIESGO;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.NUM_TRABAJADORES;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.MONTO_PLANILLA;
                savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.TASA_CALC;
                savedPolicyEmit.P_NTASA_PROP = dataSalud.TASA_PRO == '' ? '0' : dataSalud.TASA_PRO;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.PRIMA;
                savedPolicyEmit.P_NPREMIUM_MIN = this.polizaEmitCab.MIN_SALUD;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.polizaEmitCab.MIN_SALUD_PR == '' ? '0' : this.polizaEmitCab.MIN_SALUD_PR;
                savedPolicyEmit.P_NPREMIUM_END = this.endosoSalud == null ? '0' : this.endosoSalud;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvSaludSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                savedPolicyEmit.P_NRATE = dataSalud.rateDet == null ? '0' : dataSalud.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                savedPolicyEmit.P_FLAG = this.retarifa;
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Comercializadores secundarios
        if (this.polizaEmitComer.length > 0) {
            var index = 0;
            this.polizaEmitComer.forEach(dataBroker => {
                const itemQuotationCom: any = {};
                itemQuotationCom.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
                itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.TIPO_CANAL;
                itemQuotationCom.P_NINTERMED = dataBroker.CANAL; // Produccion
                itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                itemQuotationCom.P_NCOMISION_SAL = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_AUT == '' ? '0' : dataBroker.COMISION_SALUD_AUT : '0';
                itemQuotationCom.P_NCOMISION_SAL_PR = self.saludList.length > 0 ? dataBroker.COMISION_SALUD_PRO == '' ? '0' : dataBroker.COMISION_SALUD_PRO : '0';
                itemQuotationCom.P_NCOMISION_PEN = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_AUT == '' ? '0' : dataBroker.COMISION_PENSION_AUT : '0';
                itemQuotationCom.P_NCOMISION_PEN_PR = self.pensionList.length > 0 ? dataBroker.COMISION_PENSION_PRO == '' ? '0' : dataBroker.COMISION_PENSION_PRO : '0';
                itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                dataQuotation.QuotationCom.push(itemQuotationCom);
                index = index + 1;
            });
        }

        this.policyemit.renewMod(dataQuotation).subscribe(
            res => {
                if (res.P_COD_ERR == 0) {
                    self.createJob();
                } else {
                    self.loading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            err => {
                self.loading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
            }
        );
    }

    textValidate(event: any, typeText) {
        CommonMethods.textValidate(event, typeText)
    }

    async dataEmision(idProcessVisa = 0) {
        this.transaccionProtecta = {};
        this.transaccionProtecta.P_NID_COTIZACION = this.cotizacionID; // nro cotizacion
        this.transaccionProtecta.P_DEFFECDATE = Number(this.codProducto) !== 3 ? CommonMethods.formatDate(this.polizaEmitCab.bsValueIni) : this.mode === 'exclude' ? CommonMethods.formatDate(this.polizaEmitCab.FechaAnulacion) : this.mode === 'endosar' ? CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg) : CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        this.transaccionProtecta.P_DEXPIRDAT = Number(this.codProducto) !== 3 ? CommonMethods.formatDate(this.polizaEmitCab.bsValueFin) : this.mode === 'exclude' || this.mode === 'endosar' ? CommonMethods.formatDate(this.polizaEmitCab.FDateFinAseg) : CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        this.transaccionProtecta.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; // Fecha hasta
        this.transaccionProtecta.P_NTYPE_TRANSAC = this.typeMovement; // tipo de movimiento
        this.transaccionProtecta.P_NID_PROC = this.processID; // codigo de proceso (Validar trama)
        this.transaccionProtecta.P_DEVOLVPRI = this.codProducto == 3 && this.mode === 'exclude' && this.polizaEmitCab.primaCobrada == true ? 1 : 0; // Add flag devolucion prima cobrada - JTV 19092022
        this.transaccionProtecta.P_FACT_MES_VENCIDO = this.polizaEmit.facturacionVencido == true ? 1 : 0; // Facturacion Vencida // Add flag regula mes vencido - JTV 19092022
        this.transaccionProtecta.P_SFLAG_FAC_ANT = this.codProducto == 3 ? 1 : this.polizaEmit.facturacionAnticipada == true ? 1 : 0; // Facturacion Anticipada
        this.transaccionProtecta.P_SCOLTIMRE = this.polizaEmitCab.tipoRenovacion; // Tipo de renovacion
        this.transaccionProtecta.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago; // Frecuencia Pago
        this.transaccionProtecta.P_NMOV_ANUL = 0; // Movimiento de anulacion
        this.transaccionProtecta.P_NNULLCODE = this.annulmentID == null ? 0 : this.annulmentID; // Motivo anulacion
        this.transaccionProtecta.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''); // Frecuencia Pago
        this.transaccionProtecta.P_NID_PENSION = this.pensionList.length > 0 ? 1 : this.epsItem.STYPE == 2 ? 0 : 1;
        this.transaccionProtecta.P_NIDPAYMENT = idProcessVisa; // id proceso visa
        this.transaccionProtecta.P_NPRODUCTO = this.codProducto;
        const pensionTxt = this.nroPension != '' ? 'Pensión: ' + this.nroPension : '';
        const saludTxt = this.nroSalud != '' ? 'Salud: ' + this.nroSalud : '';
        const policyText = pensionTxt != '' ? pensionTxt + ' - ' + saludTxt : saludTxt;
        this.transaccionProtecta.P_POLICY = policyText;
        this.transaccionProtecta.P_STRAN = this.stran; // retroactividad
        this.transaccionProtecta.P_NPOLICY_SALUD = this.polizaEmitCab.NCOT_MIXTA === 1 ? this.nroSalud : this.codProducto == 2 ? this.nroSalud : 0; //AVS INTERCONEXION SABSA 13/09/2023
        this.transaccionProtecta.P_NBRANCH = this.polizaEmitCab.NBRANCH; //AVS INTERCONEXION SABSA 13/09/2023
        this.prodPension;
        this.prodSalud;
        const NDEPension = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
        const NDESalud = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);
        this.transaccionProtecta.P_DSTARTDATE_POL = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        this.transaccionProtecta.P_DEXPIRDAT_POL = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);

        if (Number(this.typeMovement) != 3) {
            const pensionData =  this.DataSCTRPENSION;
            const saludData = this.DataSCTRSALUD;

            this.transaccionProtecta.P_NAMO_AFEC = this.pensionList.length > 0 ? Number(pensionData?.['P_NAMO_AFEC'] ?? 0.0) : this.saludList.length > 0 ? Number(saludData?.['P_NAMO_AFEC'] ?? 0.0) : 0.0;
            this.transaccionProtecta.P_NIVA = this.pensionList.length > 0 ? Number(pensionData?.['P_NIVA'] ?? 0.0) : this.saludList.length > 0 ? Number(saludData?.['P_NIVA'] ?? 0.0) : 0.0;
            this.transaccionProtecta.P_NAMOUNT = this.pensionList.length > 0 ? Number(pensionData?.['P_NAMOUNT'] ?? 0.0) : this.saludList.length > 0 ? Number(saludData?.['P_NAMOUNT'] ?? 0.0) : 0.0;
        } else {
            //await this.CalculateAjustedAmounts();
            const pensionData = this.DataSCTRPENSION;
            const saludData = this.DataSCTRSALUD;

            this.transaccionProtecta.P_NAMO_AFEC = this.pensionList.length > 0 ? Number(this.totalNetoPensionSave) ?? 0.0 : this.saludList.length > 0 ? Number(this.totalNetoSaludSave) ?? 0.0 : 0.0;
            this.transaccionProtecta.P_NIVA = this.pensionList.length > 0 ? Number(this.igvPension) ?? 0.0 : this.saludList.length > 0 ? Number(this.igvSalud) ?? 0.0 : 0.0;
            // console.log(this.transaccionProtecta.P_NIVA);
            // console.log(this.transaccionProtecta.P_NAMOUNT);
            // this.transaccionProtecta.P_NAMOUNT = this.pensionList.length > 0 ? Number(this.totalPension) ?? 0.0 : this.saludList.length > 0 ? Number(this.totalSalud) ?? 0.0 : 0.0;  AGF PRIMA COMERCIAL SIN CAMBIOS
            this.transaccionProtecta.P_NAMOUNT = this.pensionList.length > 0 ?  Number(this.brutaTotalPensionSave) ?? 0.0  :  this.saludList.length > 0 ? Number(this.brutaTotalSaludSave) ?? 0.0 : 0.0;


            // AGF ENVIO DE VALORES CORRECTOS
            // this.transaccionProtecta.P_NAMO_AFEC = this.pensionList.length > 0 ? Number(this.totalNetoPensionSave) ?? 0.0 : this.saludList.length > 0 ? Number(this.totalNetoSaludSave) ?? 0.0 : 0.0;
            // this.transaccionProtecta.P_NIVA = this.pensionList.length > 0 ? Number(this.igvPensionSave) ?? 0.0 : this.saludList.length > 0 ? Number(this.igvSaludSave) ?? 0.0 : 0.0;
            // this.transaccionProtecta.P_NAMOUNT = this.pensionList.length > 0 ?  Number(this.brutaTotalPensionSave) ?? 0.0  :  this.saludList.length > 0 ? Number(this.brutaTotalSaludSave) ?? 0.0 : 0.0;
            

        }
        this.transaccionProtecta.P_NDE = this.pensionList.length > 0 ? NDEPension : this.saludList.length > 0 ? NDESalud : 0.0;
        this.transaccionProtecta.P_NCOT_MIXTA = this.polizaEmitCab.NCOT_MIXTA; //AVS INTERCONEXION SABSA 17012023
        this.transaccionProtecta.P_PAYPF = 2; //AVS INTERCONEXION SABSA 17012023
        this.transaccionProtecta.P_NCURRENCY = this.polizaEmitCab.COD_MONEDA; //AVS INTERCONEXION SABSA 06092023
        this.transaccionProtecta.P_SDELIMITER = this.polizaEmitCab.DELIMITACION ? 1 : 0; //AVS INTERCONEXION SABSA 06092023
        this.transaccionProtecta.P_NPREM_MINIMA = this.minSalud; //AVS INTERCONEXION SABSA 06092023
        this.transaccionProtecta.P_NPREM_NETA = this.totalNetoSaludSave; //AVS INTERCONEXION SABSA 06092023
        this.transaccionProtecta.P_IGV = this.igvSaludSave; //AVS INTERCONEXION SABSA 06092023
        this.transaccionProtecta.P_NPREM_BRU = this.brutaTotalSaludSave; //AVS INTERCONEXION SABSA 06092023
        this.transaccionProtecta.P_NID_PROC_EPS = this.nroMovimientoEPS; //AVS INTERCONEXION SABSA 
        this.transaccionProtecta.P_NEPS = Number(this.epsItem.NCODE); //AVS INTERCONEXION SABSA 
        this.transaccionProtecta.flagComisionPension = this.flagCheckboxComisionPension ? 1 : 0;  //AVS - INTERCONEXION SABSA 
        this.transaccionProtecta.flagComisionSalud = this.flagCheckboxComisionSalud ? 1 : 0; //AVS - INTERCONEXION SABSA 

        this.transaccionMapfre = null;

        if (this.template.ins_mapfre && this.saludList.length > 0) {
            let sumPlanilla = 0;
            let sumTrabajador = 0;
            this.tasasList.forEach(item => {
                sumTrabajador = Number(sumTrabajador) + Number(item.NUM_TRABAJADORES);
                sumPlanilla = Number(sumPlanilla) + Number(item.MONTO_PLANILLA);
            });
            this.transaccionMapfre = {};
            this.transaccionMapfre.tipoMovimiento = this.typeMovement;
            this.transaccionMapfre.nroMovimientoCarga = this.nroMovimientoEPS;
            this.transaccionMapfre.cabecera = {};
            this.transaccionMapfre.cabecera.keyService = 'declarar';
            this.transaccionMapfre.producto = {};
            this.transaccionMapfre.poliza = {};
            this.transaccionMapfre.poliza.numPolizaEnlace = this.nroPolizaEps;
            this.transaccionMapfre.poliza.fecEfecSpto = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
            this.transaccionMapfre.poliza.fecVctoSpto = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
            this.transaccionMapfre.riesgoSCTR = [];
            const itemRiesgo: any = {};
            itemRiesgo.tasaSalud = this.saludList[0].TASA;
            itemRiesgo.numAsegSalud = sumTrabajador;
            itemRiesgo.impPlanillaSalud = sumPlanilla;
            this.transaccionMapfre.riesgoSCTR.push(itemRiesgo);
            this.transaccionMapfre.constancia = {};
            this.transaccionMapfre.constancia.ubicacionObraSalud = this.polizaEmitCab.DES_TIPO_SEDE;
        }
        // R.P.
        this.transaccionBroker = {};
        this.transaccionBroker.P_DAT_BROKER = [];
        if (this.polizaEmitComer.length > 0) {
            var index = 0;
            this.polizaEmitComer.forEach(dataBroker => {
                const itemQuotationCom: any = {};
                itemQuotationCom.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
                itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                this.transaccionBroker.P_DAT_BROKER.push(itemQuotationCom);
                index = index + 1;
            });
        }
        // R.P.
    }
    async createJob() {
        const polizaNro = (this.nroSalud != undefined && this.nroSalud == '' ? '' : this.nroSalud);
        const msgIncRenov = this.mode == 'include' ? 'Inclusión' : this.mode == 'exclude' ? 'Exclusión' : this.mode == 'endosar' ? 'Endoso' : this.sAbrTran == 'DE' ? 'la Declaración' : 'Renovación';
        this.mensajeEquivalente = '';
        const myFormData: FormData = new FormData();
        this.loading = true;
        if (this.files.length > 0) {
            this.files.forEach(file => {
                myFormData.append('adjuntos', file, file.name);
            });
        }
        await this.dataEmision();

        myFormData.append('transaccionProtecta', JSON.stringify(this.transaccionProtecta));
        myFormData.append('transaccionMapfre', JSON.stringify(this.transaccionMapfre));
        myFormData.append('transaccionBroker', JSON.stringify(this.transaccionBroker));
        this.codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];

        this.policyemit.transactionPolicy(myFormData).subscribe(
            res => {
                this.loading = false;
                if (res.P_COD_ERR == 0) {
                    if (this.mode == 'cancel' || this.mode == 'endosar') {
                        swal.fire({
                            title: 'Información',
                            text: this.responseText,
                            icon: 'success',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        }).then((result) => {
                            if (result.value) {
                                this.router.navigate(['/extranet/sctr/consulta-polizas']);
                            }
                        });
                    } else {
                        swal.fire({
                            title: 'Información',
                            text: this.responseText + res.P_NCONSTANCIA,
                            icon: 'success',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        }).then((result) => {
                            if (result.value) {
                                this.router.navigate(['/extranet/sctr/consulta-polizas']);
                            }
                        });
                    }
                } else if (res.P_COD_ERR == 2) {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'info',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        }
                    });
                } else {
                    this.DeleteDataSCTR();
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                }
            },
            err => {
                this.loading = false;
            }
        );
    }

    validarArchivos() {
        this.clickValidarArchivos = false;
        this.archivosJson = [];
        this.tamañoArchivo = 0;
        this.flagExtension = false;
        for (let i = 0; i < this.files.length; i++) {
            let size = (this.files[i].size / 1024 / 1024).toFixed(3);
            let sizeNumber = Number.parseFloat(size);
            this.tamañoArchivo = this.tamañoArchivo + sizeNumber;
            var extensiones_permitidas = ['.jpeg', '.jpg', '.png', '.bmp', '.pdf', '.txt', '.doc', '.xls', '.xlsx', '.docx', '.xlsm', '.xltx', '.xltm', '.xlsb', '.xlam', '.docm', '.dotx', '.dotm', '.pptx', '.pptm', '.potx', '.potm', '.ppam', '.ppsx', '.ppsm', '.sldx', '.sldm', '.thmx', '.zip', '.rar'];
            var rutayarchivo = this.files[i].name;
            var ultimo_punto = this.files[i].name.lastIndexOf('.');
            var extension = rutayarchivo.slice(ultimo_punto, rutayarchivo.length);
            if (this.flagExtension === false) {
                if (extensiones_permitidas.indexOf(extension) == -1) {
                    this.flagExtension = true;
                }
            }

        }
        if (this.flagExtension) {
            this.archivosJson.push({
                error: 'Solo se aceptan imagenes y documentos'
            })

            return;
        }
        if (this.tamañoArchivo > 10) {
            this.archivosJson.push({
                error: 'Los archivos en total no deben de tener mas de 10 mb'
            })

            return;
        }
    }

    resetearPropuesto(resetId) {
        switch (resetId) {
            case 1:
                this.statePrimaSalud = !this.statePrimaSalud;
                this.polizaEmitCab.MIN_SALUD_PR = '';
                if (!this.polizaEmit.facturacionVencido) {
                    this.resetearPrimas(0, this.saludID.id, this.polizaEmit.facturacionVencido)
                } else {
                    this.resetearPrimas(this.polizaEmitCab.PRIMA_SALUD_END, this.saludID.id, this.polizaEmit.facturacionVencido)
                }
                break;
            case 2:
                this.statePrimaPension = !this.statePrimaPension;
                this.polizaEmitCab.MIN_PENSION_PR = '';
                if (!this.polizaEmit.facturacionVencido) {
                    this.resetearPrimas(0, this.pensionID.id, this.polizaEmit.facturacionVencido)
                } else {
                    this.resetearPrimas(this.polizaEmitCab.PRIMA_PEN_END, this.pensionID.id, this.polizaEmit.facturacionVencido)
                }
                break;
            case 3:
                this.stateBrokerTasaSalud = !this.stateBrokerTasaSalud
                this.flagCheckboxComisionSalud = this.comPropuestaSalud;
                this.resetearComisiones(this.saludID.id)
                break;
            case 4:
                this.stateBrokerTasaPension = !this.stateBrokerTasaPension
                this.flagCheckboxComisionPension = this.comPropuestaPension;
                this.resetearComisiones(this.pensionID.id)
                break;
        }
    }

    resetearComisiones(productoId) {
        this.polizaEmitComer.forEach(broker => {
            broker.COMISION_SALUD_PRO = productoId == this.saludID.id ? 0 : broker.COMISION_SALUD_PRO
            broker.valItemSal = productoId == this.saludID.id ? false : broker.valItemSal
            broker.COMISION_PENSION_PRO = productoId == this.pensionID.id ? 0 : broker.COMISION_PENSION_PRO
            broker.valItemPen = productoId == this.pensionID.id ? false : broker.valItemPen
        });
    }

    resetearPrimas(primPropuesta, productoId, flag) {
        primPropuesta = !isNaN(Number(primPropuesta)) ? Number(primPropuesta) : 0;
        const tasas = productoId == this.pensionID.id ? this.pensionList : this.saludList
        const totalNeto = productoId == this.pensionID.id ? Number(this.primaTotalPension) : Number(this.primatotalSalud)
        const primaMinima = productoId == this.pensionID.id ? Number(this.polizaEmitCab.PRIMA_PEN_END) : Number(this.polizaEmitCab.PRIMA_SALUD_END)
        const productos = [this.pensionID.id, this.saludID.id];

        if (tasas.length > 0) {
            productos.forEach(async producto => {
                var request = {
                    P_NBRANCH: this.nbranch,
                    P_SCLIENT: this.polizaEmitCab.NUM_DOCUMENTO
                };

                var response = await this.GetFlagPremiumMin(request);
                // console.log(response);
                var flagPrimaMin = response.P_NCODE;
                var flagValPrimaMin = 1;

                if (flagPrimaMin == 1 && this.mode == 'include' && this.codProducto == 2) {
                    flagValPrimaMin = 0;
                }

                if (producto == productoId) {
                    if (flag) {
                        this.calculoNoRegular(primPropuesta, productoId, totalNeto, primaMinima, flagValPrimaMin)
                    } else {
                        this.calculoRegular(primPropuesta, productoId, totalNeto, primaMinima, flagValPrimaMin)
                    }
                }
            });
        }
    }
    calculoNoRegular(primPropuesta: number, productoId: any, totalNeto: number, primaMinima: number, flagValPrimaMin: number) {
        if (primPropuesta > 0) {
            if (primPropuesta > totalNeto) {
                if (this.mode != 'include' && this.mode != 'exclude' && this.mode != 'netear') {
                    this.recalcularPrima(productoId, totalNeto, '')
                } else {
                    if (flagValPrimaMin != 1) {
                        this.recalcularPrima(productoId, totalNeto, '');
                    } else {

                        //INI AGF 16052023 permitiendo prima de trama para regula a mes Vencido para producto pensiones
                        if (primPropuesta > totalNeto && this.mode == 'include' && this.polizaEmit.facturacionVencido == true) {
                            this.recalcularPrima(productoId, totalNeto, this.variable.var_msjPrimaMin)
                        }

                        else {
                            this.recalcularPrima(productoId, primaMinima, this.variable.var_msjPrimaMin)
                        }
                        //FIN AGF 16052023 permitiendo prima de trama para regula a mes Vencido para producto pensiones
                    }
                }
            } else {
                this.recalcularPrima(productoId, totalNeto, '')
            }
        }
    }
    calculoRegular(primPropuesta: number, productoId: any, totalNeto: number, primaMinima: number, flagValPrimaMin: number) {
        if (primPropuesta > 0) {
            if (flagValPrimaMin != 1) {
                this.recalcularPrima(productoId, totalNeto, '');
            } else {
                if (primPropuesta > totalNeto) {
                    this.recalcularPrima(productoId, primPropuesta, this.variable.var_msjPrimaMin)
                } else {
                    this.recalcularPrima(productoId, totalNeto, '')
                }
            }
        } else {
            if (flagValPrimaMin != 1) {
                this.recalcularPrima(productoId, totalNeto, '');
            } else {
                if (totalNeto < primaMinima) {
                    this.recalcularPrima(productoId, primaMinima, this.variable.var_msjPrimaMin)
                } else {
                    this.recalcularPrima(productoId, totalNeto, '')
                }
            }
        }
    }

    recalcularPrima(productoId: any, monPropuesto: number, mensaje: any) {
        if (productoId == this.pensionID.id) {
            this.totalNetoPensionSave = CommonMethods.formatValor(monPropuesto, 6) //AVS Nueva Estimacion de Calculo 23/12/2022
            this.polizaEmitCab.primaComPension = CommonMethods.formatValor(monPropuesto * this.dEmiPension, 6)
            this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 6);
            this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) + Number(this.igvPensionSave), 6)
            this.mensajePrimaPension = mensaje;
        }

        if (productoId == this.saludID.id) {
            if (this.polizaEmit.facturacionVencido == false) {
                this.totalNetoSaludSave = CommonMethods.formatValor(monPropuesto, 2)
                this.polizaEmitCab.primaComSalud = CommonMethods.formatValor(monPropuesto * this.dEmiSalud, 6)
                this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 6);
                this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) + Number(this.igvSaludSave), 6);
                this.mensajePrimaSalud = mensaje;
            }
            // AGF Inicio 02052023
            else {
                this.totalNetoSaludSave = CommonMethods.formatValor(this.polizaEmitCab.primaComSalud, 2);
                this.polizaEmitCab.primaComSalud = CommonMethods.formatValor(this.polizaEmitCab.primaComSalud * this.dEmiSalud, 6);
                this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) + Number(this.igvSaludSave), 6);
            }
            // AGF Fin 02052023
        }
    }

    async fechaFin(tipoRen: string, fechaDesde: string, fecha?: string) {
        const fechaFin = new Date(fechaDesde);
        if (this.codProducto == 2 && this.mode == 'renew') {
            fechaFin.setDate(fechaFin.getDate() + 1);
        }
        const fechaFin2 = new Date(fecha);

        if (tipoRen == '7') {
            if (this.mode != 'endosar') {
                fechaFin.setDate(fechaFin.getDate() + (((fechaFin.getTime() - fechaFin2.getTime()) / 1000 / 60 / 60) / 24) + 1);
                this.polizaEmitCab.bsValueFin = new Date(fechaFin);
            }

            this.flagFechaMenorMayorFin = true;
        }

        if (tipoRen == '6') {
            if (this.mode != 'endosar') {
                fechaFin.setDate(fechaFin.getDate() + (((fechaFin.getTime() - fechaFin2.getTime()) / 1000 / 60 / 60) / 24) + 1);
                this.polizaEmitCab.bsValueFin = new Date(fechaFin);
            }

            this.flagFechaMenorMayorFin = true;
        }

        let res: any = await this.GetFechaFin(CommonMethods.formatDate(fechaFin), tipoRen);
        if (res.FechaExp != "") {
            this.polizaEmitCab.bsValueFin = new Date(res.FechaExp);
        }

        this.flagFechaMenorMayorFin = true;
    }

    async validarTipoRenovacion(event: any) {
        await this.configFechas();
    }

    fechaFinEspecial() {
        if (this.mode == 'include' || this.mode == 'exclude' || this.mode == 'netear') {
            this.polizaEmitCab.bsValueIni = this.fechaBase;
            this.polizaEmitCab.bsValueIniMin = this.fechaBase;
            this.polizaEmitCab.bsValueFinMax = new Date(this.fechaBaseHasta);
            this.polizaEmitCab.bsValueFin = new Date(this.fechaBaseHasta);
            this.disabledFechaFin = true;
        }

        if (this.mode == 'endosar') {
            this.polizaEmitCab.bsValueIni = this.fechaBase;
            this.polizaEmitCab.bsValueIniMin = this.fechaBase;
        }
    }

    async cargarFrecuencia() {
        if (this.polizaEmitCab.tipoRenovacion != undefined) {
            await this.policyemit.getFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
                .toPromise().then(res => {
                    this.frecuenciaPago = res;
                    this.polizaEmitCab.frecuenciaPago = res.length == 1 ? res[0].COD_TIPO_FRECUENCIA : this.polizaEmitCab.tipoRenovacion;
                    // if (res != null && res.length == 1) { this.polizaEmitCab.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA; } //Si solo hay una frecuencia de pago, está se seleccionará automáticamente
                });
        }

    }


    async cargarFrecuenciaRenov() {
        if (this.polizaEmitCab.tipoRenovacion != undefined) {
            await this.policyemit.getFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
                .toPromise().then(res => {
                    this.frecuenciaPago = res;
                    this.polizaEmitCab.frecuenciaPago = res.length == 1 ? res[0].COD_TIPO_FRECUENCIA : this.polizaEmitCab.tipoRenovacion;
                    // if (res != null && res.length == 1) { this.polizaEmitCab.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA; } //Si solo hay una frecuencia de pago, está se seleccionará automáticamente
                });
        }

    }

    async ChangeFrecPago(desde) {
        const fechaF = desde;

        if (this.polizaEmitCab.bsValueIni !== undefined && this.polizaEmitCab.FDateIniAseg !== undefined) {
            if (this.polizaEmitCab.bsValueIni.getTime() === this.polizaEmitCab.FDateIniAseg.getTime()) {
                this.enabledFrecPago = this.codProducto == 3 ? true : false;
            }
        }

        let res: any = await this.GetFechaFin(CommonMethods.formatDate(fechaF), this.polizaEmitCab.frecuenciaPago);
        if (res.FechaExp != "" && this.mode != 'broker') {
            this.polizaEmitCab.FDateFinAseg = new Date(res.FechaExp);
        }

        /*if (this.polizaEmitCab.frecuenciaPago == '5') { // Mensual
          fechaF.setMonth(fechaF.getMonth() + 1);
          fechaF.setDate(fechaF.getDate() - 1);
          this.polizaEmitCab.FDateFinAseg = new Date(fechaF);
        }

        if (this.polizaEmitCab.frecuenciaPago == '4') { // Bimestral
          fechaF.setMonth(fechaF.getMonth() + 2);
          fechaF.setDate(fechaF.getDate() - 1);
          this.polizaEmitCab.FDateFinAseg = new Date(fechaF)
        }

        if (this.polizaEmitCab.frecuenciaPago == '3') { // Trimestral
          fechaF.setMonth(fechaF.getMonth() + 3);
          fechaF.setDate(fechaF.getDate() - 1);
          this.polizaEmitCab.FDateFinAseg = new Date(fechaF);
        }

        if (this.polizaEmitCab.frecuenciaPago == '2') { // Semetral
          fechaF.setMonth(fechaF.getMonth() + 6);
          fechaF.setDate(fechaF.getDate() - 1);
          this.polizaEmitCab.FDateFinAseg = new Date(fechaF);
        }

        if (this.polizaEmitCab.frecuenciaPago == '1') { // Anual
          fechaF.setFullYear(fechaF.getFullYear() + 1)
          fechaF.setDate(fechaF.getDate() - 1);
          this.polizaEmitCab.FDateFinAseg = new Date(fechaF);
        }*/
    }

    async habilitarFechas() {
        this.polizaEmitCab.frecuenciaPago = '0';
        this.disabledFecha = true;
        this.disabledFechaFin = true;
        if (this.polizaEmitCab.tipoRenovacion != undefined) {
            this.cargarFrecuencia();
        }

        await this.configFechas()

        this.categoryList = [];
        this.rateByPlanList = [];
    }

    async configFechas() {
        const fechadesde = this.desde.nativeElement.value.split('/');
        const fechahasta = this.hasta.nativeElement.value.split('/');
        const fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
        const fechaHas = (fechahasta[1]) + '/' + fechahasta[0] + '/' + fechahasta[2];
        if (fechadesde != '' && fechahasta != '') {
            let fechad = new Date(fechaDes);
            const fechah = new Date(fechaHas);

            if (this.polizaEmitCab.tipoRenovacion == '6') {
                this.monthPerPay = 0
                this.disabledFecha = this.mode == 'endosar' || this.mode == 'cancel' || this.mode == 'renew' ? true : false;
                this.disabledFechaFin = this.mode == 'endosar' || this.mode == 'cancel' ? true : false;
                fechad.setDate(fechad.getDate() + 1);

                if (this.mode == 'endosar' && this.codProducto != 3) {
                    this.polizaEmitCab.bsValueIni = new Date()
                    this.polizaEmitCab.bsValueIniMin = new Date();
                    this.polizaEmitCab.bsValueFin = new Date(this.polizaEmitCab.bsValueFin);
                    this.polizaEmitCab.bsValueFinMin = new Date();
                    this.polizaEmitCab.bsValueIniMin = new Date();

                } else {
                    this.polizaEmitCab.bsValueIni = new Date(this.polizaEmitCab.bsValueIni);
                    this.polizaEmitCab.bsValueFin = new Date(this.polizaEmitCab.bsValueFin);
                    this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase);
                    this.polizaEmitCab.bsValueFinMin = new Date(fechad);
                }

                if (this.mode != 'endosar') {
                    if (fechad.getTime() > fechah.getTime()) {
                        this.polizaEmitCab.bsValueFin = new Date(fechad);
                    }
                } else {
                    this.polizaEmitCab.bsValueFin = new Date(this.fechaBaseHasta);
                }


                // this.fechaFinEspecial();
            }

            if (this.polizaEmitCab.tipoRenovacion == '7') {
                this.monthPerPay = 0
                this.disabledFecha = this.mode == 'endosar' || this.mode == 'cancel' || this.mode == 'renew' ? true : false;
                this.disabledFechaFin = this.mode == 'endosar' || this.mode == 'cancel' ? true : false;

                fechad.setDate(fechad.getDate() + 1);

                if (this.mode == 'endosar') {
                    this.polizaEmitCab.bsValueIni = new Date();
                    this.polizaEmitCab.bsValueIniMin = new Date()
                    this.polizaEmitCab.bsValueFin = new Date(this.polizaEmitCab.bsValueFin);
                    this.polizaEmitCab.bsValueFinMin = new Date();

                } else {
                    // this.polizaEmitCab.bsValueIniMin = new Date(this.polizaEmitCab.bsValueIni);
                    this.polizaEmitCab.bsValueIni = new Date(this.polizaEmitCab.bsValueIni);
                    this.polizaEmitCab.bsValueFin = new Date(this.polizaEmitCab.bsValueFin);
                    this.polizaEmitCab.bsValueFinMin = new Date(fechad);
                    this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase)
                }

                if (this.mode != 'endosar') {
                    if (fechad.getTime() > fechah.getTime()) {
                        this.polizaEmitCab.bsValueFin = new Date(fechad);
                    }
                } else {
                    this.polizaEmitCab.bsValueFin = new Date(this.fechaBaseHasta);
                }

                // this.fechaFinEspecial()
            }

            if (this.polizaEmitCab.tipoRenovacion === '5') { // Mensual
                this.monthPerPay = 1
                this.polizaEmitCab.bsValueIni = new Date(this.fechaBase)
                this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase)
                /*fechad.setMonth(fechad.getMonth() + 1);
                fechad.setDate(fechad.getDate() - 1);
                this.polizaEmitCab.bsValueFin = new Date(fechad);*/
                this.flagFechaMenorMayorFin = true;
                // this.fechaFinEspecial()
            }

            if (this.polizaEmitCab.tipoRenovacion === '4') { // Bimestral
                this.monthPerPay = 2
                this.polizaEmitCab.bsValueIni = new Date(this.fechaBase)
                this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase)
                /*fechad.setMonth(fechad.getMonth() + 2);
                fechad.setDate(fechad.getDate() - 1);
                this.polizaEmitCab.bsValueFin = new Date(fechad);*/
                this.flagFechaMenorMayorFin = true;

                // this.fechaFinEspecial()
            }

            if (this.polizaEmitCab.tipoRenovacion === '3') { // Trimestral
                this.monthPerPay = 3
                this.polizaEmitCab.bsValueIni = new Date(this.fechaBase)
                this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase)
                /*fechad.setMonth(fechad.getMonth() + 3);
                fechad.setDate(fechad.getDate() - 1);
                this.polizaEmitCab.bsValueFin = new Date(fechad);*/
                this.flagFechaMenorMayorFin = true;
                // this.fechaFinEspecial()
            }

            if (this.polizaEmitCab.tipoRenovacion === '2') { // Semestral
                this.monthPerPay = 6
                this.polizaEmitCab.bsValueIni = new Date(this.fechaBase)
                this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase)
                /*fechad.setMonth(fechad.getMonth() + 6);
                fechad.setDate(fechad.getDate() - 1);
                this.polizaEmitCab.bsValueFin = new Date(fechad);*/
                this.flagFechaMenorMayorFin = true;
                // this.fechaFinEspecial()
            }

            if (this.polizaEmitCab.tipoRenovacion === '1') { // Anual
                this.monthPerPay = 12
                this.polizaEmitCab.bsValueIni = new Date(this.fechaBase)
                this.polizaEmitCab.bsValueIniMin = new Date(this.fechaBase)
                /*fechad.setFullYear(fechad.getFullYear() + 1)
                fechad.setDate(fechad.getDate() - 1);
                this.polizaEmitCab.bsValueFin = new Date(fechad);*/
                this.flagFechaMenorMayorFin = true;
                // this.fechaFinEspecial()
            }
            let res: any;
            res = await this.GetFechaFin(CommonMethods.formatDate(fechad), this.polizaEmitCab.tipoRenovacion);

            if (res.FechaExp != "" && this.mode != 'broker') {
                this.polizaEmitCab.bsValueFin = new Date(res.FechaExp);
            }

            if (this.codProducto != 3) {
                this.fechaFinEspecial()
            }
        }

        if (this.template.ins_alertaGrati && (this.mode != 'cancel' && this.mode != 'exclude' && this.mode != 'endosar')) {
            if (this.polizaEmitCab.bsValueIni !== undefined && this.polizaEmitCab.bsValueFin !== undefined) {
                const meses = await this.getMesesGrati();
                this.alertGrati = await CommonMethods.alertaGratificacion(this.polizaEmitCab.bsValueIni, this.polizaEmitCab.bsValueFin, meses, this.variable.var_alertGratificacion)
                if (this.alertGrati != '') {
                    this.toastr.warning(this.variable.var_alertToastGratificacion, 'Importante!', { timeOut: 20000, toastClass: 'rmaClass ngx-toastr' });
                } else {
                    this.toastr.clear();
                }
            }
        }
    }

    async getMesesGrati() {
        let response = []
        await this.clientInformationService.getVariables('mesesGrati').toPromise().then(
            res => {
                response = res.split(',')
            }
        );
        return response
    }

    async downloadFile(filePath: string): Promise<any> {  // Descargar archivos de cotización
        this.othersService.downloadFile(filePath).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    let newBlob = new Blob([res], { type: 'application/pdf' });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    const data = window.URL.createObjectURL(newBlob);
                    let link = document.createElement('a');
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

    async getValidateDebt(branchCode, productCode, clientCode, transactionCode): Promise<ValidateDebtReponse> {
        let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = branchCode;
        validateDebtRequest.productCode = productCode;
        validateDebtRequest.clientCode = clientCode;
        validateDebtRequest.transactionCode = transactionCode;
        await this.collectionsService.validateDebt(validateDebtRequest).toPromise().then(
            res => {
                validateDebtResponse = res;
            },
            err => {
            }
        );
        return validateDebtResponse;
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

    async getValidateDebtPolicy(branchCode, productCode, clientCode, nidPolicy): Promise<ValidateDebtReponse> {
        let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = branchCode;
        validateDebtRequest.productCode = productCode;
        validateDebtRequest.clientCode = clientCode;
        validateDebtRequest.nidPolicy = nidPolicy;
        await this.collectionsService.ValidateDebtPolicy(validateDebtRequest).toPromise().then(
            res => {
                validateDebtResponse = res;
            },
            err => {
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
                return this.createDocument(genAccountStatusRequest)
                    .then(async res => {
                        await this.downloadFile(res.path).then(() => {
                            this.loading = false;
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

    listToString(list: String[]): string {
        let output = '';
        if (list != null) {
            list.forEach(function (item) {
                output = output + item + ' <br>'
            });
        }
        return output;
    }

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        switch (modalName) {
            case 'add-contact':
                modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                typeContact.P_NIDDOC_TYPE = this.polizaEmitCab.TIPO_DOCUMENTO;
                typeContact.P_SIDDOC = this.polizaEmitCab.NUM_DOCUMENTO;
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
        typeContact.P_NIDDOC_TYPE = this.polizaEmitCab.TIPO_DOCUMENTO;
        typeContact.P_SIDDOC = this.polizaEmitCab.NUM_DOCUMENTO;
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

    async updateContracting() {
        const response: any = {};
        this.loading = true;
        this.contractingdata.EListAddresClient = null;
        this.contractingdata.EListPhoneClient = null;
        this.contractingdata.EListCIIUClient = null;
        await this.clientInformationService.getCliente360(this.contractingdata).toPromise().then(
            res => {
                response.code = res.P_NCODE;
                response.message = res.P_SMESSAGE;
                if (res.P_NCODE == '0' || res.P_NCODE == '2') {
                    this.loading = false;
                    this.flagContact = false;
                    this.flagEmail = false;
                } else {
                    if (this.template.ins_addContact && this.contactList.length > 0) {
                        this.contractingdata.EListContactClient = [];
                    }
                    this.loading = false;
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
    async ValidateRetroactivity(operacion: number = 1) {
        this.retroVal = 0;
        const response: any = {};
        let trx = '';
        const dataQuotation: any = {};
        dataQuotation.P_NBRANCH = this.pensionID.nbranch;
        dataQuotation.P_NPRODUCT = this.pensionID.id;
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        dataQuotation.P_DSTARTDATE_ASE = this.mode == 'exclude' ? CommonMethods.formatDate(this.polizaEmitCab.FechaAnulacion) : CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg);
        if (this.mode == 'include') {
            trx = "IN"
        } else if (this.mode == 'exclude') {
            trx = "EX"
        } else if (this.isDeclare) {
            trx = "DE"
        } else if (this.mode == 'endosar') {
            trx = "EN"
        }
        else {
            trx = "RE"
        }

        if (this.profileEsp.some(ProfileEsp => ProfileEsp.Profile.toString() == this.perfilActual)) {
            if (this.mode == 'cancel') {
                trx = "AN"
            }

            if ((this.codProducto == 2 && trx == "RE") || (this.codProducto == 2 && trx == "IN") || (this.codProducto == 2 && trx == "AN")) {
                dataQuotation.P_NBRANCH = JSON.parse(localStorage.getItem('pensionID'))['nbranch'];
                dataQuotation.P_NPRODUCT = JSON.parse(localStorage.getItem('codProducto'))['productId'];
                dataQuotation.P_DSTARTDATE_ASE = this.mode == 'exclude' ? CommonMethods.formatDate(this.polizaEmitCab.FechaAnulacion) : CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
            }
        }

        dataQuotation.TrxCode = trx;
        dataQuotation.RetOP = operacion;
        dataQuotation.FlagCambioFecha = 1; // this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.polizaEmitCab.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
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
    async GetFechaFin(fecha, freq) {
        const response: any = {};
        await this.quotationService.GetFechaFin(fecha, freq).toPromise().then(
            res => {
                response.FechaExp = res.FechaExp;
            }
        );
        return response;
    }
    /* Nuevos parametros ins_cotizacion_det EHH */
    GetAmountDetailTotalListValue(tipo, freq): number {
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

    GetNamoAfectDetailTotalListValue_SCTR_PENSION(freq): number { //AVS - Interconexion SAPSA 26/05/2023
        console.log('GetNamoAfectDetailTotalListValue_SCTR_PENSION');
        console.log(freq);
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.totalNetoPensionSave * 1;
            } else if (freq == 4) {
                valorAD = this.totalNetoPensionSave * 2;
            } else if (freq == 3) {
                valorAD = this.totalNetoPensionSave * 3;
            } else if (freq == 2) {
                valorAD = this.totalNetoPensionSave * 6;
            } else if (freq == 1) {
                valorAD = this.totalNetoPensionSave * 12;
            } else if (freq == 9) {
                valorAD = this.totalNetoPensionSave * 1;
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    GetNamoAfectDetailTotalListValue_SCTR_SALUD(freq): number { //AVS - Interconexion SAPSA 26/05/2023
        console.log('GetNamoAfectDetailTotalListValue_SCTR_SALUD');
        console.log(freq);
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.totalNetoSaludSave * 1;
            } else if (freq == 4) {
                valorAD = this.totalNetoSaludSave * 2;
            } else if (freq == 3) {
                valorAD = this.totalNetoSaludSave * 3;
            } else if (freq == 2) {
                valorAD = this.totalNetoSaludSave * 6;
            } else if (freq == 1) {
                valorAD = this.totalNetoSaludSave * 12;
            } else if (freq == 9) {
                valorAD = this.totalNetoSaludSave * 1;
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    GetNivaDetailTotalListValue_SCTR_PENSION(freq): number {
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.igvPensionSave * 1;
            } else if (freq == 4) {
                valorAD = this.igvPensionSave * 2;
            } else if (freq == 3) {
                valorAD = this.igvPensionSave * 3;
            } else if (freq == 2) {
                valorAD = this.igvPensionSave * 6;
            } else if (freq == 1) {
                valorAD = this.igvPensionSave * 12;
            } else if (freq == 9) {
                valorAD = this.igvPensionSave * 1;
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    GetNivaDetailTotalListValue_SCTR_SALUD(freq): number {
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.igvSaludSave * 1;
            } else if (freq == 4) {
                valorAD = this.igvSaludSave * 2;
            } else if (freq == 3) {
                valorAD = this.igvSaludSave * 3;
            } else if (freq == 2) {
                valorAD = this.igvSaludSave * 6;
            } else if (freq == 1) {
                valorAD = this.igvSaludSave * 12;
            } else if (freq == 9) {
                valorAD = this.igvSaludSave * 1;
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    GetNamountDetailTotalListValue_SCTR_PENSION(freq): number {
        console.log('GetNamountDetailTotalListValue_SCTR_PENSION(freq)');
        console.log(freq);
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.brutaTotalPensionSave * 1;
            } else if (freq == 4) {
                valorAD = this.brutaTotalPensionSave * 2;
            } else if (freq == 3) {
                valorAD = this.brutaTotalPensionSave * 3;
            } else if (freq == 2) {
                valorAD = this.brutaTotalPensionSave * 6;
            } else if (freq == 1) {
                valorAD = this.brutaTotalPensionSave * 12;
            } else if (freq == 9) {
                valorAD = this.brutaTotalPensionSave * 1;
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    GetNamountDetailTotalListValue_SCTR_SALUD(freq): number {
        console.log('GetNamountDetailTotalListValue_SCTR_PENSION(freq)');
        console.log(freq);
        let valorAD = 0;
        try {
            if (freq == 5) {
                valorAD = this.brutaTotalSaludSave * 1;
            } else if (freq == 4) {
                valorAD = this.brutaTotalSaludSave * 2;
            } else if (freq == 3) {
                valorAD = this.brutaTotalSaludSave * 3;
            } else if (freq == 2) {
                valorAD = this.brutaTotalSaludSave * 6;
            } else if (freq == 1) {
                valorAD = this.brutaTotalSaludSave * 12;
            } else if (freq == 9) {
                valorAD = this.brutaTotalSaludSave * 1;
            } else {
                valorAD = 0;
            }
        } catch (error) {
            valorAD = 0;
        }
        return valorAD;
    }

    validarExcelAseg() {
        if (this.excelSubir != undefined) {
            this.validarExcel(undefined);
        }
    }

    /* Gestión de trámite EHH */
    SetTransac() {
        try {
            switch (this.mode) {
                case "include": {
                    this.nTransac = 2;
                    this.sAbrTran = "IN";
                    this.sTransac = "Inclusión";
                    break;
                }
                case "renew": {
                    if (this.isDeclare) {
                        this.nTransac = 4;
                        this.sAbrTran = "DE";
                        this.sTransac = "Declaración";
                        this.questionText = '¿Deseas hacer la declaración de la póliza?';
                        this.responseText = 'Se ha realizado la declaración con constancia N° ';
                    } else {
                        this.nTransac = 4;
                        this.sAbrTran = "RE";
                        this.sTransac = "Renovación";
                        this.questionText = '¿Deseas hacer la renovación de la póliza?';
                        this.responseText = 'Se ha realizado la renovación con constancia N° ';
                    }
                    break;
                }
                case "exclude": {
                    this.nTransac = 3;
                    this.sAbrTran = "EX";
                    this.sTransac = "Exclusión";
                    break;
                }
                case "endosar": {
                    this.nTransac = 8;
                    this.sAbrTran = "EN";
                    this.sTransac = "Endoso";
                    break;
                }
                case "broker": {
                    this.nTransac = 13;
                    this.sAbrTran = "BR";
                    this.sTransac = "Modificacion de Broker";
                    break;
                }
                case "certificate": {
                    this.nTransac = 14;
                    this.sAbrTran = "EC";
                    this.sTransac = "Emitir Certificados";
                    break;
                }
                case "emit-matrix": {
                    this.nTransac = 15;
                    this.sAbrTran = "EM";
                    this.sTransac = "Emisión Póliza Matriz";
                    this.editFlag = true;
                    this.enabledFrecPago = true;
                    this.flagEstadoReingresar = true;
                    this.flagIsMatriz = true;
                    break;
                }
                default:
                    this.nTransac = 1;
                    this.sAbrTran = "EM";
                    this.sTransac = "Emisión";
                    break;
            }
        } catch (error) {
            this.nTransac = 1;
            this.sAbrTran = "EM";
            this.sTransac = "Emisión";
        }
    }

    setTitleTransact() {
        if (!this.isUserOp) {
            if (this.modificarTransact) {
                this.title = "Modificar trámite de " + this.sTransac;
            } else if (this.reingresarTransact) {
                this.title = "Reingresar trámite de " + this.sTransac;
            } else {
                this.title = "Generar trámite de " + this.sTransac;
            }

        }
    }

    async finalizarTramite() {
        swal.fire({
            title: 'Información',
            text: "¿Desea anular el trámite N° " + this.transactNumber + " de " + this.sTransac.toLowerCase() + "?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Anular',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let dataQuotation: any = {};
                dataQuotation.P_NID_COTIZACION = this.nrocotizacion;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

                this.transactService.FinalizarTramite(dataQuotation).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.loading = false;
                            swal.fire('Información', 'Se anuló de forma correcta el trámite de ' + this.sTransac + ' N° ' + this.transactNumber + '.', 'success');
                            this.router.navigate(['/extranet/policy-transactions-all']);
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    async generarTramite() {
        let msg = '';
        // if (this.polizaEmit.SMAIL_EJECCOM == undefined || this.polizaEmit.SMAIL_EJECCOM == ''){
        //   msg = 'Ingrese una dirección de correo electrónico para el ejecutivo comercial</br>';
        // }
        if (this.polizaEmit.SMAIL_EJECCOM !== '') {
            if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.polizaEmit.SMAIL_EJECCOM) == false) {
                msg += 'El correo electrónico del ejecutivo comercial es inválido <br />';
            }
        } else {
            if (this.flagGobiernoEstado) {
                if (!this.flagAprob) {
                    msg = '';
                } else {
                    msg = 'Ingrese una dirección de correo electrónico para el ejecutivo comercial</br>';
                }
            } else {
                msg += 'Ingrese una dirección de correo electrónico para el ejecutivo comercial<br />';
            }

        }
        if (this.files.length == 0 && this.mode != 'broker') {
            msg = 'Debe adjuntar por lo menos un archivo<br />';
        }
        if (this.mode == 'broker') {
            if (this.sclientComerNew == undefined || this.sclientComerNew == "") {
                msg = 'Seleccione un nuevo broker para modificar<br />';
            } else {

                if (this.sclientComerNew == this.sclientComer) {
                    msg = 'Seleccione un broker diferente al actual<br />';
                }
            }
            if (this.fileCarta.length == 0) {
                msg = 'Debe adjuntar carta de agenciamiento<br />';
            }
        }
        if (this.nTransac == 8) {
            if (this.polizaEmitCab.TYPE_ENDOSO == undefined || this.polizaEmitCab.TYPE_ENDOSO == '') {
                msg = 'Seleccione tipo de endoso<br />';
            }
        }
        // R.P.
        if (this.polizaEmitComer.length == 0) {
            msg += 'Debe tener al menos un broker agregado <br />';
        } else {

            if (this.codProducto == 2 && !this.isUserOp && this.nTransac == 4 && !this.isDeclare) {
                let index = 0;
                this.polizaEmitComer.forEach(broker => {

                    let obj = this.BrokerObl.find(o => o.NINTERMED == broker.CANAL)

                    if (obj != null && (this.selectedDep[index] == null || this.selectedDep[index] == "0")) {
                        msg += 'Falta completar campo oficina de producción <br>'
                    }
                    index = index + 1;
                });
            }

        }
        // R.P.
        if (msg != '') {
            await swal.fire('Error', msg, 'error');
            return
        }

        swal.fire({
            title: 'Información',
            text: "¿Desea " + (this.modificarTransact == true ? "actualizar el trámite de " + this.sTransac : this.title.toLowerCase()) + "?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: this.modificarTransact == true ? "Actualizar" : 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let dataQuotation: any = {};
                dataQuotation.P_DAT_BROKER = [];
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });
                this.fileCarta.forEach(carta => {
                    data.append("carta_agenciamiento_" + carta.name, carta);
                });
                if (this.modificarTransact) {
                    dataQuotation.P_NID_TRAMITE = this.transactNumber;
                }
                dataQuotation.P_NID_COTIZACION = this.nrocotizacion;
                dataQuotation.P_DFEC_REG = this.mode == 'broker' ? CommonMethods.formatDate(this.polizaEmitCab.FDateEffectBroker) : this.mode == 'exclude' ? CommonMethods.formatDate(this.polizaEmitCab.FechaAnulacion) : CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg);
                dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
                dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
                dataQuotation.P_STRANSAC = this.sAbrTran;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_SMAIL_EJECCOM = this.polizaEmit.SMAIL_EJECCOM;
                dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
                dataQuotation.P_SDEVOLPRI = this.polizaEmitCab.primaCobrada === true ? '1' : '0';
                dataQuotation.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
                dataQuotation.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
                dataQuotation.P_NTYPENDOSO = this.polizaEmitCab.TYPE_ENDOSO == undefined || this.polizaEmitCab.TYPE_ENDOSO == '' ? 0 : this.polizaEmitCab.TYPE_ENDOSO;
                dataQuotation.P_NIDPLAN = this.polizaEmitCab.desTipoPlan == undefined || this.polizaEmitCab.desTipoPlan == '' ? 0 : this.polizaEmitCab.desTipoPlan;
                dataQuotation.P_NINTERMED = 0;
                dataQuotation.P_SCLIENT = this.sclientComerNew;
                dataQuotation.P_APROB_CLI = this.flagGobiernoEstado ? this.flagEnvioEmail : 0;
                dataQuotation.P_SPOL_ESTADO = this.flagGobiernoEstado ? 1 : 0;
                // R.P.
                if (this.polizaEmitComer.length > 0) {
                    let index = 0;
                    this.polizaEmitComer.forEach(dataBroker => {
                        const itemDataBroker: any = {};
                        itemDataBroker.P_NID_COTIZACION = this.nrocotizacion;
                        itemDataBroker.P_SCLIENT_COMER = dataBroker.SCLIENT
                        itemDataBroker.P_NLOCAL = this.selectedDep[index];
                        dataQuotation.P_DAT_BROKER.push(itemDataBroker);
                        index = index + 1;
                    });
                }
                // R.P.
                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.InsUpdTransact(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.loading = false;
                            swal.fire('Información', 'Se ' + (this.modificarTransact == true ? 'actualizó' : 'generó') + ' de forma correcta el trámite de ' + this.sTransac + ' N° ' + (this.modificarTransact == true ? this.transactNumber : res.P_NID_TRAMITE) + ', el cual fue derivado al área de operaciones para su gestión', 'success');
                            this.router.navigate(['/extranet/policy-transactions-all']);
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    GetInfoTransact() {
        const data: any = {};
        data.P_NID_TRAMITE = this.transactNumber;
        data.P_NID_COTIZACION = this.cotizacionID;
        data.P_NPRODUCT = this.vidaLeyID.id;
        data.P_NBRANCH = this.vidaLeyID.nbranch;

        this.transactService.GetInfoTransact(data).subscribe(
            async res => {
                this.infoTransact = res;
                await this.SetInfoTransact();
                this.searchTrackingTransact(this.transactNumber);
            },
            error => {

            }
        );
    }

    async SetInfoTransact() {
        this.polizaEmit.SMAIL_EJECCOM = this.infoTransact.SMAIL_EJECCOM;
        //this.flagAprob = this.flagGobiernoEstado? this.polizaEmitCab.APROB_CLI: null;
        switch (this.nTransac) {
            case 2: {
                this.polizaEmitCab.FDateIniAseg = new Date(this.infoTransact.DFEC_TRANSAC);
                break;
            }
            case 3: {
                this.polizaEmitCab.FechaAnulacion = new Date(this.infoTransact.DFEC_TRANSAC);
                this.polizaEmitCab.primaCobrada = this.infoTransact.SDEVOLPRI == 1 ? true : false;
                break;
            }
            case 4: {
                if (!this.isDeclare) {
                    this.polizaEmitCab.tipoRenovacion = this.infoTransact.NTIP_RENOV;
                    await this.cargarFrecuenciaRenov();
                    this.polizaEmitCab.frecuenciaPago = this.infoTransact.NPAYFREQ;
                    await this.cambioFecha();
                    if (this.polizaEmitCab.tipoRenovacion != "6") {
                        let res: any = await this.GetFechaFin(CommonMethods.formatDate(new Date(this.polizaEmitCab.bsValueIni)), this.polizaEmitCab.tipoRenovacion);
                        if (res.FechaExp != "")
                            this.polizaEmitCab.bsValueFin = new Date(res.FechaExp);
                    }
                    this.flagFechaMenorMayorFin = true;
                }
                break;
            }
            case 8: {
                this.polizaEmitCab.FDateIniAseg = new Date(this.infoTransact.DFEC_TRANSAC);
                this.polizaEmitCab.TYPE_ENDOSO = this.infoTransact.NTYPENDOSO;
                break;
            }
            case 13: {
                this.polizaEmitCab.FDateEffectBroker = new Date(this.infoTransact.DFEC_TRANSAC);
                this.SearchContrator();
                break;
            }
        }
    }

    /* Gestion de tramite historial */

    searchTrackingTransact(transactNumber) {
        const data: any = {};
        data.P_NID_TRAMITE = transactNumber;
        data.P_NID_COTIZACION = this.cotizacionID;

        this.transactService.GetHistTransact(data).subscribe(
            res => {
                this.statusChangeList = res;
                this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                this.totalItems = this.statusChangeList.length;
                if (this.statusChangeList.length == 0) {
                    this.statusChangeList = [];
                }
            },
            err => {
                swal.fire('Información', "Error en el servidor", 'error');
            }
        );
    }
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    openFilePicker(fileList: string[]) {
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.modalService.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
        }
    }

    GetInfoLastTransact() {
        const data: any = {};
        data.P_NID_COTIZACION = this.cotizacionID;
        data.P_NPRODUCT = this.vidaLeyID.id;
        data.P_NBRANCH = this.vidaLeyID.nbranch;
        data.P_STRANSAC = this.sAbrTran;

        this.transactService.GetInfoLastTransact(data).subscribe(
            async res => {
                this.infoTransact = res;
                if (this.infoTransact.NID_TRAMITE != undefined) {
                    this.existsOldTransact = true;
                    await this.SetInfoTransact();
                    this.searchTrackingTransact(this.infoTransact.NID_TRAMITE);
                }
            },
            error => {

            }
        );
    }
    changeStatusTransact() {
        if (this.statusTransact == "6") {
            this.buttonName = "Rechazar";
            this.flagProcesar = false;
            this.msgDerivar = "Se rechazó el trámite correctamente.";
            this.statusDeriva = 6;
        } else if (this.statusTransact == "16") {
            this.buttonName = "Poner en pausa";
            this.flagProcesar = false;
            this.msgDerivar = "Se puso en pausa el trámite correctamente.";
            this.statusDeriva = 16;
        } else {
            this.flagProcesar = true;
        }
    }

    async motivorechazoTramite() {
        await this.transactService.getMotivRechazoTransact().toPromise().then(
            (res: any) => {
                this.rechazoMotivoList = res;
            }
        );
    }

    changeStatusTransactMod() {
        if (this.statusTransact == "99") {
            this.anularTramite = true;
        } else {
            this.anularTramite = false;
        }
    }

    DerivarTramite() {
        if (this.statusDeriva == 6) {
            this.RechazarTramite();
        } else if (this.statusDeriva == 16) {
            this.EnPausaTramite();
        }
    }

    async EnPausaTramite() {
        let msg = "";
        if (this.polizaEmit.comentario == "") {
            msg = "Ingrese un comentario por favor"
        }
        if (msg != "") {
            await swal.fire('Error', msg, 'error');
            return
        }

        swal.fire({
            title: 'Información',
            text: "¿Desea " + this.buttonName.toLowerCase() + " el trámite?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: this.buttonName,
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                const dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.cotizacionID;
                dataQuotation.P_NPERFIL = this.codProfile;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_NSTATUS_TRA = this.statusDeriva;
                dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');

                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.InsertHistTransact(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.loading = false;
                            swal.fire('Información', this.msgDerivar, 'success');
                            this.router.navigate(['/extranet/tray-transact/2']);
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }
    async RechazarTramite() {
        let msg = "";

        if (this.rechazoMotivoID == null || this.rechazoMotivoID == "") {
            msg += 'Debe seleccionar el motivo de rechazo. <br />'
        }

        if (this.polizaEmit.comentario == "") {
            msg += "Ingrese un comentario por favor."
        }

        if (msg != "") {
            await swal.fire('Error', msg, 'error');
            return
        }
        swal.fire({
            title: 'Información',
            text: "¿Desea rechazar el trámite?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: this.buttonName,
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                const dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.cotizacionID;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_NSTATUS_TRA = this.statusDeriva;
                dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
                dataQuotation.P_NIDMOTIVO_RECHAZO = this.rechazoMotivoID; // motivo de rechazo tramite
                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.InsertDerivarTransact(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.loading = false;
                            swal.fire('Información', this.msgDerivar, 'success');
                            this.router.navigate(['/extranet/tray-transact/2']);
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    SearchContrator() {
        const searchBroker: any = {};
        searchBroker.P_IS_AGENCY = '0';
        searchBroker.P_NTIPO_BUSQUEDA = 1;
        searchBroker.P_NTIPO_DOC = (this.infoTransact.SCLIENT_RUC.trim().length == 11) ? 1 : 2;
        searchBroker.P_NNUM_DOC = this.infoTransact.SCLIENT_RUC.trim();
        searchBroker.P_SNOMBRE = "";
        searchBroker.P_SAP_PATERNO = "";
        searchBroker.P_SAP_MATERNO = "";
        searchBroker.P_SNOMBRE_LEGAL = "";

        this.quotationService.searchBroker(searchBroker).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    if (res.listBroker != null && res.listBroker.length > 0) {
                        this.polizaEmitComer = [];
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
                            item.eliminarBroker = true;
                            this.sclientComerNew = item.SCLIENT;
                            this.polizaEmitComer.push(item);
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

    ModificarBroker() {
        swal.fire({
            title: 'Información',
            text: "¿Desea modificar el broker de la cotización?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Modificar Broker",
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                const dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.cotizacionID;
                dataQuotation.P_SCLIENT = this.sclientComerNew;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_DFEC_REG = CommonMethods.formatDate(this.polizaEmitCab.FDateEffectBroker);

                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.UpdateBroker(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.loading = false;
                            swal.fire('Información', "Se procedió a asociar al broker de forma correcta", 'success');
                            this.router.navigate(['/extranet/tray-transact/2']);
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    AnularTramite() {
        swal.fire({
            title: 'Información',
            text: "¿Desea anular el trámite?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Anular",
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                const dataQuotation: any = {};
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.cotizacionID;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_NSTATUS_TRA = 19;
                dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');

                data.append('objeto', JSON.stringify(dataQuotation));

                this.transactService.AnularTramite(data).subscribe(
                    res => {
                        if (res.P_COD_ERR == 0) {
                            this.loading = false;
                            swal.fire('Información', "Se anuló el trámite " + this.transactNumber + " correctamente", 'success');
                            this.router.navigate(['/extranet/tray-transact/2']);
                        } else {
                            this.loading = false;
                            swal.fire('Información', res.P_MESSAGE, 'error');
                        }
                    },
                    err => {
                        this.loading = false;
                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }
    changeTipoEndoso() {
        if (this.polizaEmitCab.TYPE_ENDOSO != 2) {
            this.polizaEmitCab.FDateIniAseg = new Date(this.FechaEfectoInicial);
        }
    }

    validarDecimalPorcentage(int, decimal, input) {
        CommonMethods.validateDecimals(int, decimal, input);
    }
    changeMontoSinIGV(index: number) {
        if (index == 1) {
            this.MontoSinIGVEMP = CommonMethods.formatValor(Number(this.planillainputEMP) * Number(this.tasainputEMP) / 100, 6, 1);
        }
        else if (index == 2) {
            this.MontoSinIGVOBR = CommonMethods.formatValor(Number(this.planillainputOBR) * Number(this.tasainputOBR) / 100, 6, 1);
        }
        else if (index == 3) {
            this.MontoSinIGVOAR = CommonMethods.formatValor(Number(this.planillainputOAR) * Number(this.tasainputOAR) / 100, 6, 1);
        }
        else if (index == 4) {
            this.MontoSinIGVEE = CommonMethods.formatValor(Number(this.planillainputEE) * Number(this.tasainputEE) / 100, 6, 1);
        }
        else if (index == 5) {
            this.MontoSinIGVOE = CommonMethods.formatValor(Number(this.planillainputOE) * Number(this.tasainputOE) / 100, 6, 1);
        }
        else if (index == 6) {
            this.MontoSinIGVOARE = CommonMethods.formatValor(Number(this.planillainputOARE) * Number(this.tasainputOARE) / 100, 6, 1);
        }
        this.changeFPMontoSinIGV();
    }

    changeFPMontoSinIGV() {
        var frecPago = 0;

        switch (Number(this.polizaEmitCab.frecuenciaPago)) {
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

        this.v_MontoSinIGVEMP = Number(this.MontoSinIGVEMP)
        this.v_MontoSinIGVOBR = Number(this.MontoSinIGVOBR)
        this.v_MontoSinIGVOAR = Number(this.MontoSinIGVOAR)
        this.v_MontoSinIGVEE = Number(this.MontoSinIGVEE)
        this.v_MontoSinIGVOE = Number(this.MontoSinIGVOE)
        this.v_MontoSinIGVOARE = Number(this.MontoSinIGVOARE)

        this.MontoFPSinIGVEMP = CommonMethods.formatValor(this.v_MontoSinIGVEMP * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOBR = CommonMethods.formatValor(this.v_MontoSinIGVOBR * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOAR = CommonMethods.formatValor(this.v_MontoSinIGVOAR * Number(frecPago), 6, 1);
        this.MontoFPSinIGVEE = CommonMethods.formatValor(this.v_MontoSinIGVEE * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOE = CommonMethods.formatValor(this.v_MontoSinIGVOE * Number(frecPago), 6, 1);
        this.MontoFPSinIGVOARE = CommonMethods.formatValor(this.v_MontoSinIGVOARE * Number(frecPago), 6, 1);

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVEMP() { //LS - Poliza Matriz

        this.MontoSinIGVEMP = CommonMethods.formatValor(Number(this.planillainputEMP) * Number(this.tasainputEMP) / 100, 6, 1);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOBR() { //LS - Poliza Matriz

        this.MontoSinIGVOBR = CommonMethods.formatValor(Number(this.planillainputOBR) * Number(this.tasainputOBR) / 100, 6, 1);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOAR() { //LS - Poliza Matriz

        this.MontoSinIGVOAR = CommonMethods.formatValor(Number(this.planillainputOAR) * Number(this.tasainputOAR) / 100, 6, 1);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVEE() { //LS - Poliza Matriz

        this.MontoSinIGVEE = CommonMethods.formatValor(Number(this.planillainputEE) * Number(this.tasainputEE) / 100, 6, 1);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOE() { //LS - Poliza Matriz

        this.MontoSinIGVOE = CommonMethods.formatValor(Number(this.planillainputOE) * Number(this.tasainputOE) / 100, 6, 1);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeMontoSinIGVOARE() { //LS - Poliza Matriz

        this.MontoSinIGVOARE = CommonMethods.formatValor(Number(this.planillainputOARE) * Number(this.tasainputOARE) / 100, 6, 1);
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

    changeTotalSinIGV() { //LS - Poliza Matriz
        this.TotalSinIGV = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE), 2, 1);
        this.TotalSinIGV = CommonMethods.formatValor(this.TotalSinIGV, 2, 1);
        this.TotalFPSinIGV = CommonMethods.formatValor(Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE), 2, 1);
        this.TotalFPSinIGV = CommonMethods.formatValor(this.TotalFPSinIGV, 2, 1);
    }



    changeTotalConIGV() { //LS - Poliza Matriz
        // this.TotalConIGV = CommonMethods.formatValor((Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE)) * 118 / 100, 2,1);
        this.TotalConIGV = CommonMethods.formatValor(this.TotalSinIGV * 118 / 100, 2, 1);
        // this.TotalFPConIGV = CommonMethods.formatValor((Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE)) * 118 / 100, 2);
        this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV * 118 / 100, 2, 1);
        this.SumaConIGV = CommonMethods.formatValor(Number(this.TotalFPSinIGV) * 18 / 100, 2, 1);
        // this.SumaConIGV = CommonMethods.formatValor(this.SumaConIGV, 2);
    }


    async reingresarTramite() {
        let msg = '';

        if (this.flagAprob) {
            if (this.polizaEmit.SMAIL_EJECCOM == undefined || this.polizaEmit.SMAIL_EJECCOM == '') {

                if (this.flagEstadoReingresar && this.polizaEmit.APROB_CLI == 0) {
                    msg = '';
                } else {
                    msg = 'Ingrese una dirección de correo electrónico para el ejecutivo comercial</br>';
                }

            }
        }

        if ((this.polizaEmitCab.ACT_TEC_VL == null || this.polizaEmitCab.ACT_TEC_VL == 0) && this.flagEstadoReingresar && this.template.ins_actRealizar) {
            this.inputsValidate[12] = true
            msg += 'Debe seleccionar una actividad a realizar válida <br>'
        }

        if ((this.polizaEmitCab.ACT_ECO_VL == null || this.polizaEmitCab.ACT_ECO_VL == 0) && this.flagEstadoReingresar && this.template.ins_subActividad) {
            this.inputsValidate[3] = true
            msg += 'Debe seleccionar una actividad  válida <br>'
        }

        if (this.files.length == 0 && this.mode != 'broker') {
            msg = 'Debe adjuntar por lo menos un archivo<br />';
        }
        if (this.mode == 'broker') {
            if (this.sclientComerNew == undefined || this.sclientComerNew == "") {
                msg = 'Seleccione un nuevo broker para modificar<br />';
            } else {

                if (this.sclientComerNew == this.sclientComer) {
                    msg = 'Seleccione un broker diferente al actual<br />';
                }
            }
            if (this.fileCarta.length == 0) {
                msg = 'Debe adjuntar carta de agenciamiento<br />';
            }
        }
        if (this.nTransac == 8) {
            if (this.polizaEmitCab.TYPE_ENDOSO == undefined || this.polizaEmitCab.TYPE_ENDOSO == '') {
                msg = 'Seleccione tipo de endoso<br />';
            }
        }

        //R.P.
        if (this.polizaEmitComer.length == 0) {
            msg += 'Debe tener al menos un broker agregado <br />';
        } else {

            if (this.codProducto == 2 && !this.isUserOp && this.nTransac == 4 && !this.isDeclare) {
                var index = 0;
                this.polizaEmitComer.forEach(broker => {

                    let obj = this.BrokerObl.find(o => o.NINTERMED == broker.CANAL)

                    if (obj != null && (this.selectedDep[index] == null || this.selectedDep[index] == "0")) {
                        msg += 'Falta completar campo oficina de producción <br>'
                    }
                    index = index + 1;
                });
            }

        }

        if (this.mode == 'emit-matrix') {

            if (this.statusTransact == '') {
                msg += ('Debe Seleccionar un estado');
            }

            var categorias = this.countinputEMP +
                this.countinputOBR +
                this.countinputOAR +
                this.countinputEE +
                this.countinputOE +
                this.countinputOARE;

            var datosempelado = this.countinputEMP + this.planillainputEMP + this.tasainputEMP;
            var datosObrero = this.countinputOBR + this.planillainputOBR + this.tasainputOBR;
            var datosObreroAR = this.countinputOAR + this.planillainputOAR + this.tasainputOAR;
            var datosEE = this.countinputEE + this.planillainputEE + this.tasainputEE;
            var datosOE = this.countinputOE + this.planillainputOE + this.tasainputOE;
            var datosOARE = this.countinputOARE + this.planillainputOARE + this.tasainputOARE;
            if (categorias == 0) {
                msg += 'Debe ingresar al menos un asegurado. <br />';
            }

            // validacion de montos editables.
            if (this.MontoSinIGVEMP > 0) {
                if (this.countinputEMP > 0 || this.planillainputEMP > 0 || this.tasainputEMP > 0 || datosempelado == 0) {

                    if (this.countinputEMP == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Empleado. <br />';
                    }
                    if (this.planillainputEMP == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Empleado. <br />';
                    }
                    if (this.tasainputEMP == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Empleado. <br />';
                    }

                }
            } else {
                if (this.countinputEMP > 0 || this.planillainputEMP > 0 || this.tasainputEMP > 0) {

                    if (this.countinputEMP == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Empleado. <br />';
                    }
                    if (this.planillainputEMP == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Empleado. <br />';
                    }
                    if (this.tasainputEMP == 0) {
                        msg += 'Debe ingresar da  la tasa  para la categoría Empleado. <br />';
                    }
                    if (this.MontoSinIGVEMP == 0 && (this.countinputEMP > 0 && this.planillainputEMP > 0 && this.tasainputEMP > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Empleado. <br />';
                    }
                }
            }

            if (this.MontoSinIGVOBR > 0) {
                if (this.countinputOBR > 0 || this.planillainputOBR > 0 || this.tasainputOBR > 0 || datosObrero == 0) {

                    if (this.countinputOBR == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero. <br />';
                    }
                    if (this.planillainputOBR == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero. <br />';
                    }
                    if (this.tasainputOBR == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero. <br />';
                    }

                }
            } else {
                if (this.countinputOBR > 0 || this.planillainputOBR > 0 || this.tasainputOBR > 0) {

                    if (this.countinputOBR == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero. <br />';
                    }
                    if (this.planillainputOBR == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero. <br />';
                    }
                    if (this.tasainputOBR == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero. <br />';
                    }
                    if (this.MontoSinIGVOBR == 0 && (this.countinputOBR > 0 && this.planillainputOBR > 0 && this.tasainputOBR > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Obrero. <br />';
                    }
                }
            }

            if (this.MontoSinIGVOAR > 0) {
                if (this.countinputOAR > 0 || this.planillainputOAR > 0 || this.tasainputOAR > 0 || datosObreroAR == 0) {

                    if (this.countinputOAR == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero Alto Riesgo. <br />';
                    }

                    if (this.planillainputOAR == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.tasainputOAR == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Alto Riesgo. <br />';
                    }


                }
            } else {
                if (this.countinputOAR > 0 || this.planillainputOAR > 0 || this.tasainputOAR > 0) {

                    if (this.countinputOAR == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero Alto Riesgo. <br />';
                    }

                    if (this.planillainputOAR == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.tasainputOAR == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.MontoSinIGVOAR == 0 && (this.countinputOAR > 0 && this.planillainputOAR > 0 && this.tasainputOAR > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Obrero Alto Riesgo. <br />';
                    }

                }
            }
            if (this.MontoSinIGVEE > 0) {
                if (this.countinputEE > 0 || this.planillainputEE > 0 || this.tasainputEE > 0 || datosEE == 0) {

                    if (this.countinputEE == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Empleado Excedente. <br />';
                    }
                    if (this.planillainputEE == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Empleado Excedente. <br />';
                    }
                    if (this.tasainputEE == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Empleado Excedente. <br />';
                    }
                    if (this.countinputEMP == 0 && this.countinputEE > 0) {
                        msg += 'Debe ingresar datos  en la categoría Empleado para declarar su excedente. <br />';
                    }
                    if (this.countinputEMP < this.countinputEE) {
                        msg += 'El total de trabajadores para la categoría Empleado Excedente no puede ser mayor a su categoría Empleado. <br />';
                    }

                }

            } else {

                if (this.countinputEE > 0 || this.planillainputEE > 0 || this.tasainputEE > 0) {

                    if (this.countinputEE == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Empleado Excedente. <br />';
                    }
                    if (this.planillainputEE == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Empleado Excedente. <br />';
                    }
                    if (this.tasainputEE == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Empleado Excedente. <br />';
                    }
                    if (this.countinputEMP == 0 && this.countinputEE > 0) {
                        msg += 'Debe ingresar  datos en la categoría Empleado para declarar su excedente. <br />';
                    }
                    if (this.countinputEMP < this.countinputEE) {
                        msg += 'El total de trabajadores para la categoría Empleado Excedente no puede ser mayor a su categoría Empleado. <br />';
                    }
                    if (this.MontoSinIGVEE == 0 && (this.countinputEE > 0 && this.planillainputEE > 0 && this.tasainputEE > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Empleado Excedente. <br />';
                    }

                }
            }

            if (this.MontoSinIGVOE > 0) {
                if (this.countinputOE > 0 || this.planillainputOE > 0 || this.tasainputOE || datosOE == 0) {

                    if (this.countinputOE == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoria Obrero Excedente. <br />';
                    }
                    if (this.planillainputOE == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Excedente. <br />';
                    }
                    if (this.tasainputOE == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Excedente. <br />';
                    }
                    if (this.countinputOBR == 0 && this.countinputOE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero para declarar su excedente. <br />';
                    }
                    if (this.countinputOBR < this.countinputOE) {
                        msg += 'El total de trabajadores para la categoría Obrero Excedente no puede ser mayor a su categoría Obrero. <br />';
                    }
                }
            } else {
                if (this.countinputOE > 0 || this.planillainputOE > 0 || this.tasainputOE > 0) {

                    if (this.countinputOE == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoria Obrero Excedente. <br />';
                    }
                    if (this.planillainputOE == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Excedente. <br />';
                    }
                    if (this.tasainputOE == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Excedente. <br />';
                    }
                    if (this.countinputOBR == 0 && this.countinputOE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero para declarar su excedente. <br />';
                    }
                    if (this.countinputOBR < this.countinputOE) {
                        msg += 'El total de trabajadores para la categoría Obrero Excedente no puede ser mayor a su categora Obrero. <br />';
                    }
                    if (this.MontoSinIGVOE == 0 && (this.countinputOE > 0 && this.planillainputOE > 0 && this.tasainputOE > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Obrero Excedente. <br />';
                    }
                }
            }

            if (this.MontoSinIGVOARE > 0) {
                if (this.countinputOARE > 0 || this.planillainputOARE > 0 || this.tasainputOARE > 0 || datosOARE == 0) {
                    if (this.planillainputOARE == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Alto Riesgo Excedente. <br />';
                    }
                    if (this.tasainputOARE == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Alto Riesgo Excedente. <br />';
                    }
                    if (this.countinputOARE == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero Alto Riesgo Excedente. <br />';
                    }
                    if (this.countinputOAR == 0 && this.countinputOARE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero Alto Riesgo para declarar su excedente. <br />';
                    }
                    if (this.countinputOAR < this.countinputOARE) {
                        msg += 'El total de trabajadores para la categoría Obrero Alto Riesgo Excedente no puede ser mayor a su categoría  Obrero Alto Riesgo. <br />';
                    }
                }
            } else {
                if (this.countinputOARE > 0 || this.planillainputOARE > 0 || this.tasainputOARE > 0) {
                    if (this.planillainputOARE == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Alto Riesgo Excedente. <br />';
                    }
                    if (this.tasainputOARE == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Alto Riesgo Excedente. <br />';
                    }
                    if (this.countinputOARE == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero Alto Riesgo Excedente. <br />';
                    }
                    if (this.countinputOAR == 0 && this.countinputOARE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero Alto Riesgo para declarar su excedente. <br />';
                    }
                    if (this.countinputOAR < this.countinputOARE) {
                        msg += 'El total de trabajadores para la categoría Obrero Alto Riesgo Excedente no puede ser mayor a su categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.MontoSinIGVOARE == 0 && (this.countinputOARE > 0 && this.planillainputOARE > 0 && this.tasainputOARE > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría  Obrero Alto Riesgo Excedente. <br />';
                    }
                }
            }

            if (this.flagActivateExc == 1) {
                //6 campos
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputOAR && this.tasainputEMP == this.tasainputEE && this.tasainputEMP == this.tasainputOE && this.tasainputEMP == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR && this.tasainputOBR == this.tasainputEE && this.tasainputOBR == this.tasainputOE && this.tasainputOBR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEMP == this.tasainputOAR && this.tasainputEMP == this.tasainputEE && this.tasainputEMP == this.tasainputOE && this.tasainputEMP == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR == 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputEE && this.tasainputEMP == this.tasainputOE && this.tasainputEMP == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputOAR && this.tasainputEMP == this.tasainputOE && this.tasainputEMP == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputOAR && this.tasainputEMP == this.tasainputEE && this.tasainputEMP == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputOAR && this.tasainputEMP == this.tasainputEE && this.tasainputEMP == this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //5 campos
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR && this.tasainputOBR == this.tasainputEE && this.tasainputOBR == this.tasainputOE && this.tasainputOBR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOAR == this.tasainputEE && this.tasainputOAR == this.tasainputOE && this.tasainputOAR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR == 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOBR == this.tasainputEE && this.tasainputOBR == this.tasainputOE && this.tasainputOBR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR && this.tasainputOBR == this.tasainputOE && this.tasainputOBR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR && this.tasainputOBR == this.tasainputEE && this.tasainputOBR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR && this.tasainputOBR == this.tasainputEE && this.tasainputOBR == this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //4 campos
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOAR == this.tasainputEE && this.tasainputOAR == this.tasainputOE && this.tasainputOAR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR == 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEE == this.tasainputOE && this.tasainputEE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOAR == this.tasainputOE && this.tasainputOAR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOAR == this.tasainputEE && this.tasainputOAR == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(this.tasainputOAR == this.tasainputEE && this.tasainputOAR == this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //3 campos ultimos
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR == 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEE == this.tasainputOE && this.tasainputEE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR == 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR == 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR == 0 && this.tasainputOAR == 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(this.tasainputEE == this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //3 campos primeros
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR == 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP > 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0) {
                    if (!(this.tasainputEMP == this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

            } else {
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR && this.tasainputEMP == this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR > 0 && this.tasainputOAR == 0) {
                    if (!(this.tasainputEMP == this.tasainputOBR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP > 0 && this.tasainputOBR == 0 && this.tasainputOAR > 0) {
                    if (!(this.tasainputEMP == this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP == 0 && this.tasainputOBR > 0 && this.tasainputOAR > 0) {
                    if (!(this.tasainputOBR == this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
            }
        }

        //R.P.
        if (msg != '') {
            await swal.fire('Error', msg, 'error');
            return
        }

        swal.fire({
            title: 'Información',
            text: "¿Desea reingresar el trámite de " + this.sTransac + "?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                const dataQuotation: any = {};
                dataQuotation.P_DAT_BROKER = [];
                const data: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    data.append(file.name, file);
                });
                this.fileCarta.forEach(carta => {
                    data.append('carta_agenciamiento_' + carta.name, carta);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NID_COTIZACION = this.nrocotizacion;
                dataQuotation.P_DFEC_REG = this.mode == 'broker' ? CommonMethods.formatDate(this.polizaEmitCab.FDateEffectBroker) : this.mode == 'exclude' ? CommonMethods.formatDate(this.polizaEmitCab.FechaAnulacion) : CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg);
                dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
                dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
                dataQuotation.P_STRANSAC = this.sAbrTran;
                dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                dataQuotation.P_SMAIL_EJECCOM = this.polizaEmit.SMAIL_EJECCOM;
                dataQuotation.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
                dataQuotation.P_SDEVOLPRI = this.polizaEmitCab.primaCobrada === true ? '1' : '0';
                dataQuotation.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
                dataQuotation.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
                dataQuotation.P_NTYPENDOSO = this.polizaEmitCab.TYPE_ENDOSO == undefined || this.polizaEmitCab.TYPE_ENDOSO == '' ? 0 : this.polizaEmitCab.TYPE_ENDOSO;
                dataQuotation.P_NIDPLAN = this.polizaEmitCab.desTipoPlan == undefined || this.polizaEmitCab.desTipoPlan == '' ? 0 : this.polizaEmitCab.desTipoPlan;
                dataQuotation.P_NINTERMED = 0;
                dataQuotation.P_SCLIENT = this.sclientComerNew;
                dataQuotation.P_SPOL_ESTADO = this.flagEstadoReingresar || this.flagEstadoTransacReingresar ? this.polizaEmitCab.SPOL_ESTADO : 0;
                dataQuotation.P_SPOL_MATRIZ = this.flagEstadoReingresar || this.flagEstadoTransacReingresar ? parseInt(this.polizaEmitCab.SPOL_MATRIZ) : 0;
                dataQuotation.P_APROB_CLI = this.flagEstadoReingresar || this.flagEstadoTransacReingresar ? this.flagEnvioEmail : 0;
                dataQuotation.QuotationDet = [];

                //R.P.
                if (this.polizaEmitComer.length > 0) {
                    var index = 0;
                    this.polizaEmitComer.forEach(dataBroker => {
                        let itemDataBroker: any = {};
                        itemDataBroker.P_NID_COTIZACION = this.nrocotizacion;
                        itemDataBroker.P_SCLIENT_COMER = dataBroker.SCLIENT
                        itemDataBroker.P_NLOCAL = this.selectedDep[index];
                        dataQuotation.P_DAT_BROKER.push(itemDataBroker);
                        index = index + 1;
                    });
                }
                //R.P.


                data.append('objeto', JSON.stringify(dataQuotation));

                const dataQuotationEstado: any = {};
                dataQuotationEstado.QuotationDet = [];
                const myFormDataEstado: FormData = new FormData();
                if (this.flagEstadoReingresar && (this.mode == 'emit' || this.mode == 'emit-matrix')) {
                    dataQuotationEstado.NumeroCotizacion = this.nrocotizacion;
                    dataQuotationEstado.P_DSTARTDATE = this.polizaEmitCab.bsValueIni;
                    dataQuotationEstado.P_DEXPIRDAT = this.polizaEmitCab.bsValueFin;
                    dataQuotationEstado.P_NTIP_RENOV = this.polizaEmitCab.tipoRenovacion;
                    dataQuotationEstado.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
                    dataQuotationEstado.P_NTIP_NCOMISSION = this.polizaEmitCab.P_COMISION;
                    dataQuotationEstado.P_SCOD_ACTIVITY_TEC = this.polizaEmitCab.ACT_TEC_VL;
                    dataQuotationEstado.P_SCOD_CIUU = this.polizaEmitCab.ACT_ECO_VL;
                    dataQuotationEstado.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    dataQuotationEstado.P_DSTARTDATE_ASE = this.mode == 'emit-matrix' ? CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg) : this.polizaEmitCab.FDateIniAseg;
                    dataQuotationEstado.P_DEXPIRDAT_ASE = this.polizaEmitCab.FDateFinAseg;
                    dataQuotationEstado.P_NREM_EXC = this.polizaEmitCab.NREM_EXC;
                    dataQuotationEstado.planId = this.mode == 'emit-matrix' ? this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.DescriptPlan.toUpperCase()).NIDPLAN : 0;
                    dataQuotationEstado.TrxCode = "EM";
                    dataQuotationEstado.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, '');
                    dataQuotationEstado.P_SRUTA = ''
                    dataQuotationEstado.P_NACT_MINA = this.polizaEmitCab.MINA == true ? 1 : 0;
                    dataQuotationEstado.P_SPOL_ESTADO = this.polizaEmitCab.SPOL_ESTADO;
                    dataQuotationEstado.P_NBRANCH = 73;
                    dataQuotationEstado.P_SPOL_MATRIZ = this.mode == 'emit-matrix' ? 1 : 0;
                    if (this.flagEstadoReingresar && this.mode == 'emit-matrix') {
                        console.log('this.template.ins_categoriaList');
                        console.log(this.template.ins_categoriaList);
                        if (this.template.ins_categoriaList) {
                            if (this.countinputEMP != 0 || this.planillainputEMP != 0 || this.tasainputEMP != 0 || this.MontoSinIGVEMP != 0) {
                                this.categoryPolizaMatList[0].sactive = true;
                            }
                            if (this.countinputOBR != 0 || this.planillainputOBR != 0 || this.tasainputOBR != 0 || this.MontoSinIGVOBR != 0) {
                                this.categoryPolizaMatList[1].sactive = true;
                            }
                            if (this.countinputOAR != 0 || this.planillainputOAR != 0 || this.tasainputOAR != 0 || this.MontoSinIGVOAR != 0) {
                                this.categoryPolizaMatList[2].sactive = true;
                            }
                            if (this.countinputEE != 0 || this.planillainputEE != 0 || this.tasainputEE != 0 || this.MontoSinIGVEE != 0) {
                                this.categoryPolizaMatList[3].sactive = true;
                            }
                            if (this.countinputOE != 0 || this.planillainputOE != 0 || this.tasainputOE != 0 || this.MontoSinIGVOE != 0) {
                                this.categoryPolizaMatList[4].sactive = true;
                            }
                            if (this.countinputOARE != 0 || this.planillainputOARE != 0 || this.tasainputOARE != 0 || this.MontoSinIGVOARE != 0) {
                                this.categoryPolizaMatList[5].sactive = true;
                            }
                            for (let i = 0; i < this.categoryPolizaMatList.length; i++) {
                                console.log('this.categoryPolizaMatList[i].sactive');
                                console.log(this.categoryPolizaMatList[i].sactive);
                                if (this.categoryPolizaMatList[i].sactive == true) {

                                    const itemQuotationDet: any = {};
                                    itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                                    itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                                    itemQuotationDet.P_NMODULEC = this.categoryPolizaMatList[i].NCATEGORIA;
                                    if (this.categoryPolizaMatList[i].NCATEGORIA == 1) {
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP;
                                        itemQuotationDet.P_NTASA_PROP = this.tasainputEMP;
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP;
                                    }
                                    if (this.categoryPolizaMatList[i].NCATEGORIA == 2) {
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR;
                                        itemQuotationDet.P_NTASA_PROP = this.tasainputOBR;
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR;
                                    }
                                    if (this.categoryPolizaMatList[i].NCATEGORIA == 3) {
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR;
                                        itemQuotationDet.P_NTASA_PROP = this.tasainputOAR;
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR;
                                    }
                                    if (this.categoryPolizaMatList[i].NCATEGORIA == 5) {
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEE;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEE;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEE;
                                        itemQuotationDet.P_NTASA_PROP = this.tasainputEE;
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEE;
                                    }
                                    if (this.categoryPolizaMatList[i].NCATEGORIA == 6) {
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOE;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOE;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOE;
                                        itemQuotationDet.P_NTASA_PROP = this.tasainputOE;
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOE;
                                    }
                                    if (this.categoryPolizaMatList[i].NCATEGORIA == 7) {
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOARE;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOARE;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOARE;
                                        itemQuotationDet.P_NTASA_PROP = this.tasainputOARE;
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOARE;
                                    }

                                    //itemQuotationDet.P_NTASA_PROP = 0;
                                    // itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION;
                                    // itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                                    // itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;

                                    itemQuotationDet.P_NSUM_PREMIUMN = this.TotalSinIGV == 0 ? 0 : this.TotalSinIGV;
                                    itemQuotationDet.P_NSUM_IGV = (this.TotalConIGV - this.TotalSinIGV) == 0 ? 0 : (this.TotalConIGV - this.TotalSinIGV);
                                    itemQuotationDet.P_NSUM_PREMIUM = this.TotalConIGV == 0 ? 0 : this.TotalConIGV;

                                    itemQuotationDet.P_NRATE = 0;
                                    itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                                    itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                                    itemQuotationDet.P_FLAG = '0';
                                    itemQuotationDet.P_NAMO_AFEC = this.TotalFPSinIGV == 0 ? 0 : this.TotalFPSinIGV;
                                    itemQuotationDet.P_NIVA = this.SumaConIGV == 0 ? 0 : this.SumaConIGV;
                                    itemQuotationDet.P_NAMOUNT = this.TotalFPConIGV == 0 ? 0 : this.TotalFPConIGV;
                                    dataQuotationEstado.QuotationDet.push(itemQuotationDet);
                                }
                            }
                        }
                    }

                    myFormDataEstado.append('objetoEstado', JSON.stringify(dataQuotationEstado));

                    this.quotationService.UpdateCotizacionClienteEstado(myFormDataEstado).subscribe(
                        async res => {
                            if (res.P_COD_ERR == 0) {
                                this.transactService.InsReingresarTransact(data).subscribe(
                                    res => {
                                        if (res.P_COD_ERR == 0) {
                                            this.loading = false;
                                            swal.fire('Información', 'Se generó de forma correcta el trámite de ' + this.sTransac + ' N° ' + res.P_NID_TRAMITE + ', el cual fue derivado al área de operaciones para su gestión', 'success');
                                            this.router.navigate(['/extranet/policy-transactions-all']);
                                        } else {
                                            this.loading = false;
                                            swal.fire('Información', res.P_MESSAGE, 'error');
                                        }
                                    },
                                    err => {
                                        this.loading = false;
                                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                                    }
                                );
                            } else {
                                this.loading = false;
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            }
                        }
                    );

                } else {
                    this.transactService.InsReingresarTransact(data).subscribe(
                        res => {
                            if (res.P_COD_ERR == 0) {
                                this.loading = false;
                                swal.fire('Información', 'Se generó de forma correcta el trámite de ' + this.sTransac + ' N° ' + res.P_NID_TRAMITE + ', el cual fue derivado al área de operaciones para su gestión', 'success');
                                this.router.navigate(['/extranet/policy-transactions-all']);
                            } else {
                                this.loading = false;
                                swal.fire('Información', res.P_MESSAGE, 'error');
                            }
                        },
                        err => {
                            this.loading = false;
                            swal.fire('Información', 'Hubo un error con el servidor', 'error');
                        }
                    );
                }
            }
        });
    }

    async GetFlagPremiumMin(request: any) {
        let response: any = {};
        await this.policyemit.GetFlagPremiumMin(request).toPromise().then(
            async res => {
                response = res;
            }, error => {
                response = {
                    P_NCODE: 0
                };
            });

        return response;
    }

    async CalculateAjustedAmounts() {
        console.log(this.totalNetoPensionSave);
        let totalPolicyAmount = 0.0;
        // console.log(this.totalNetoPensionSave);
        let totalPolicyPension = 0.0;
        // console.log(this.totalNetoPensionSave);
        let totalPolicySalud = 0.0;
        console.log(this.totalNetoPensionSave);
        await this.getMonthsSCTR(); //AVS Nueva Estimacion de Calculo 23/12/2022
        
        await new Promise(resolve => setTimeout(resolve, 2000));

        totalPolicyPension = await this.getAjustedAmounts(this.pensionID.nbranch, this.pensionID.id, this.totalNetoPensionSave);
        totalPolicySalud = await this.getAjustedAmounts(this.saludID.nbranch, this.saludID.id, this.totalNetoSaludSave);

        this.PensionBruta = totalPolicyPension;
        this.SaludBruta = totalPolicySalud;

        totalPolicyAmount = CommonMethods.formatValor((Number(totalPolicyPension) + Number(totalPolicySalud)), 2);
        return totalPolicyAmount;
    }

    async getAjustedAmounts(nBranch: Number, nProduct: Number, namo_afec: Number) {
        console.log('getAjustedAmounts');
        console.log(namo_afec);
        //AVS Nueva Estimacion de Calculo 23/12/2022
        let totalPolicy = 0.0;
        this.monthsSCTR = this.montos_sctr.P_RESULT;
        const data: any = {};
        data.P_NBRANCH = nBranch;
        data.P_NPRODUCT = nProduct;
        data.P_NAMO_AFEC_INI = CommonMethods.formatValor(Number(namo_afec) * this.monthsSCTR, 2);
        console.log(data.P_NAMO_AFEC_INI);
        

        await this.policyemit.AjustedAmounts(data).toPromise().then(
            res => {
                console.log(res);
                totalPolicy = res.P_NAMOUNT;
                if (res.P_NAMOUNT != 0) {
                    if (this.codProducto == 2 && nProduct == this.pensionID.id) {
                        const sctr: any = {};
                        sctr.P_NAMOUNT = res.P_NAMOUNT;
                        sctr.P_NAMO_AFEC = res.P_NAMO_AFEC;
                        sctr.P_NDE = res.P_NDE;
                        sctr.P_NIVA = res.P_NIVA;
                        sctr.P_NPRODUCT = nProduct;
                        this.DataSCTRPENSION = sctr;
                    } else if (this.codProducto == 2 && nProduct == this.saludID.id) {
                        const sctr: any = {};
                        sctr.P_NAMOUNT = res.P_NAMOUNT;
                        sctr.P_NAMO_AFEC = res.P_NAMO_AFEC;
                        sctr.P_NDE = res.P_NDE;
                        sctr.P_NIVA = res.P_NIVA;
                        sctr.P_NPRODUCT = nProduct;
                        this.DataSCTRSALUD = sctr;
                    }
                }
            },
            err => {
                console.log(err);
            }
        );
        return totalPolicy;
    }

    async getEconomicActivityList(acTecnica) {
        await this.clientInformationService.getEconomicActivityList(acTecnica).toPromise().then(
            res => {
                this.economicActivityList = res;
                if (this.mode == 'emit-matrix') {
                    for (const item of this.economicActivityList) {
                        if (item.ID == this.polizaEmitCab.ACT_ECO_VL) {
                            this.subActivity = item.Name;
                        }
                    }
                }
            },
            err => {
            }
        );
    }
    async getTechnicalActivityList(codProducto?: any) {
        await this.clientInformationService.getTechnicalActivityList(codProducto).toPromise().then(
            res => {
                this.technicalList = res;

            },
            err => {
            }
        );
    }


    async onSelectTechnicalActivity(event) {
        this.economicActivityList = null;
        this.polizaEmitCab.ACT_ECO_VL = null
        if (this.polizaEmitCab.ACT_TEC_VL != null) {
            this.activityMain = event.Name;
            await this.getEconomicActivityList(this.polizaEmitCab.ACT_TEC_VL);
        } else {
            this.activityMain = '';
            this.subActivity = '';
            this.inputsValidate[3] = false
        }
    }

    onSelectEconomicActivity(event) {
        if (this.polizaEmitCab.ACT_ECO_VL != null) {
            if (event != null) {
                this.subActivity = event.Name;
            }
        } else {
            this.subActivity = '';
            this.inputsValidate[3] = false
        }
    }
    aprobacionCliente(e) {
        this.flagAprob = false;
        this.flagEnvioEmail = 0;

        if (e.target.checked) {
            this.flagAprob = true;
            this.flagEnvioEmail = 1;
        }

        if (this.flagAprob) {
            this.flagEnvioEmail = 1;
        }
    }

    trasaccionDirectaOperaciones(paramsTrx) {
        // this.ValidacionPago(paramsTrx);
        let primaTotal = 0;
        primaTotal = this.mode != 'include' ?
            this.polizaEmitCab.frecuenciaPago == 5 ?
                this.amountDetailTotalList[2].NAMOUNT_MEN :
                this.polizaEmitCab.frecuenciaPago == 4 ?
                    this.amountDetailTotalList[2].NAMOUNT_BIM :
                    this.polizaEmitCab.frecuenciaPago == 3 ?
                        this.amountDetailTotalList[2].NAMOUNT_TRI :
                        this.polizaEmitCab.frecuenciaPago == 2 ?
                            this.amountDetailTotalList[2].NAMOUNT_SEM :
                            this.polizaEmitCab.frecuenciaPago == 1 ?
                                this.amountDetailTotalList[2].NAMOUNT_ANU :
                                0 : this.amountDetailTotalList[2].NAMOUNT_ANU;



        this.polizaEmitCab.trama = {
            PRIMA_TOTAL: primaTotal,
            NIDPROC: paramsTrx.P_NID_PROC,
        };

        this.polizaEmitCab.contratante = {
            email: this.polizaEmitCab.CORREO,
            NOMBRE_RAZON: this.polizaEmitCab.NOMBRE_RAZON,
            COD_PRODUCT: this.vidaLeyID.id,
            NBRANCH: this.vidaLeyID.nbranch,
            tipoDocumento: {
                Id: this.polizaEmitCab.TIPO_DOCUMENTO
            },
            tipoPersona: {
                codigo: this.polizaEmitCab.TIPO_DOCUMENTO == 1 &&
                    this.polizaEmitCab.NUM_DOCUMENTO.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.polizaEmitCab.NUM_DOCUMENTO,
            emisionDirecta: this.emsionDirecta,
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateLockResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.polizaEmitCab.poliza = {
            producto: {
                COD_PRODUCT: this.vidaLeyID.id,
                NBRANCH: this.vidaLeyID.nbranch,
            }
        };

        const msgIncRenov = this.mode == 'certificate' ? 'la emisión de certificados' : this.mode == 'include' ? 'la inclusión' : this.mode == 'endosar' ? 'el endoso' : this.sAbrTran == 'DE' ? 'la declaración' : 'la renovación';
        this.polizaEmitCab.prepago = {
            P_NID_COTIZACION: paramsTrx.P_NID_COTIZACION,
            msjCotizacion: 'Selecciona una de las opciones de pago para ' + msgIncRenov +
                ' de la póliza N° ' + this.nroPoliza,
        };

        this.polizaEmitCab.brokers = this.polizaEmitComer;
        for (const item of this.polizaEmitCab.brokers) {
            item.COD_CANAL = item.CANAL;
        }

        this.polizaEmitCab.tipoTransaccion = this.typeMovement;
        this.polizaEmitCab.files = this.files;
        this.polizaEmitCab.paramsTrx = paramsTrx;
        this.polizaEmitCab.numeroCotizacion = paramsTrx.P_NID_COTIZACION;
        this.cotizacion = this.polizaEmitCab;
        this.finalizarTransaccion();

    }

    async finalizarTransaccion() {

        const msgIncRenov = this.mode === 'include' ? 'la Inclusión' : this.mode == 'endosar' ? 'el endoso' : this.sAbrTran == 'DE' ? 'la Declaración' : 'la Renovación';

        const params: FormData = new FormData();
        this.loading = true;
        if (this.files.length > 0) {
            this.files.forEach(file => {
                params.append('adjuntos', file, file.name);
            });
        }

        this.polizaEmitCab.paramsTrx.P_SPAGO_ELEGIDO = 'directo';
        params.append('transaccionProtecta', JSON.stringify(this.polizaEmitCab.paramsTrx));
        params.append('transaccionMapfre', JSON.stringify(null));

        this.policyemit.transactionPolicy(params).subscribe(
            res => {
                this.loading = false;
                if (res.P_COD_ERR == 0) {
                    if (!!this.nrocotizacion) {
                        swal.fire('Información', 'Se ha generado correctamente ' + msgIncRenov + ' de la póliza N° ' + this.nroPoliza, 'success');
                        this.router.navigate(['/extranet/policy-transactions-all']);
                    }
                } else {
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
                this.loading = false;
            }
        );


    }
    async ValidacionPago(paramsTrx) {
        let data: any = {}
        data.ncotizacion = paramsTrx.P_NID_COTIZACION;
        data.nusercode = JSON.parse(localStorage.getItem('currentUser'))['id'];;
        data.npendiente = 0;
        await this.quotationService.ValidarReglasPagos(data).toPromise().then(res => {

            this.emsionDirecta = res.P_SAPROBADO
        })
    }

    async procesarTramaEstado() {
        const erroresList: any = [];
        if (this.flagEstadoCertificado) {
            if (this.nidProc == '' || this.nidProc == '1') {
                erroresList.push('Debe validar una trama para poder emitir los certificados.');
            }
        }
        if (erroresList == null || erroresList.length == 0) {
            this.loading = true;

            await this.policyemit.getPolicyEmitCab(
                this.nrocotizacion, '1',
                JSON.parse(localStorage.getItem('currentUser'))['id']
            ).toPromise().then(async (res: any) => {
                if (!!res.GenericResponse &&
                    res.GenericResponse.COD_ERR == 0) {
                    await this.policyemit.getPolicyEmitDet(
                        this.nrocotizacion,
                        JSON.parse(localStorage.getItem('currentUser'))['id'])
                        .toPromise().then(
                            async resDet => {
                                console.log(res.GenericResponse)
                                let params = [
                                    {
                                        NumeroCotizacion: this.nrocotizacion,
                                        CodigoProceso: this.nidProc,
                                        P_NPRODUCT: this.vidaLeyID.id,
                                        P_NBRANCH: this.nbranch,
                                        P_NTIP_RENOV: res.GenericResponse.TIP_RENOV,
                                        P_DSTARTDATE: CommonMethods.formatDate(this.polizaEmitCab.bsValueIni),
                                        P_DEXPIRDAT: CommonMethods.formatDate(this.polizaEmitCab.bsValueFin),
                                        P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                        P_SFLAG_FAC_ANT: 1,
                                        P_FACT_MES_VENCIDO: 0,
                                        RetOP: 1, //para derivar a tecnica
                                        P_NPREM_NETA: this.GetAmountDetailTotalListValue(0, this.polizaEmitCab.frecuenciaPago),
                                        P_IGV: this.GetAmountDetailTotalListValue(1, this.polizaEmitCab.frecuenciaPago),
                                        P_NPREM_BRU: this.GetAmountDetailTotalListValue(2, this.polizaEmitCab.frecuenciaPago),
                                        P_NAMO_AFEC: this.GetAmountDetailTotalListValue(0, this.polizaEmitCab.frecuenciaPago),
                                        P_NIVA: this.GetAmountDetailTotalListValue(1, this.polizaEmitCab.frecuenciaPago),
                                        P_NAMOUNT: this.GetAmountDetailTotalListValue(2, this.polizaEmitCab.frecuenciaPago),
                                        P_SCOMMENT: this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''),
                                        P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                        P_DSTARTDATE_ASE: CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg),
                                        P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.polizaEmitCab.FDateFinAseg),
                                        planId: res.GenericResponse.NIDPLAN,
                                        FlagCambioFecha: 0,
                                        QuotationDet: []
                                        /* Campos para retroactividad
                                        FlagPolMat: 1,
                                        FlagEnvioTEjecutivo: this.flagEnvioEmail,
                                        flagEmitCertificado:1 */
                                    }
                                ];

                                if (this.template.ins_categoriaList) {
                                    for (let i = 0; i < this.categoryList.length; i++) {
                                        const itemQuotationDet: any = {};
                                        itemQuotationDet.P_NID_COTIZACION = this.nrocotizacion;
                                        itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                                        itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                                        itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
                                        itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
                                        itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
                                        itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
                                        itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate
                                        itemQuotationDet.P_NPREMIUM_MENSUAL = CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
                                        itemQuotationDet.P_NPREMIUM_MIN = this.polizaEmitCab.PRIMA_PEN_END == '' ? '0' : this.polizaEmitCab.PRIMA_PEN_END;
                                        itemQuotationDet.P_NPREMIUM_MIN_PR = '0';
                                        itemQuotationDet.P_NPREMIUM_END = '0';
                                        itemQuotationDet.P_NSUM_PREMIUMN = this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
                                        itemQuotationDet.P_NSUM_IGV = this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
                                        itemQuotationDet.P_NSUM_PREMIUM = this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
                                        itemQuotationDet.P_NRATE = this.rateByPlanList[0].NTASA;
                                        itemQuotationDet.P_NDISCOUNT = '0';
                                        itemQuotationDet.P_NACTIVITYVARIATION = '0';
                                        itemQuotationDet.P_FLAG = '0';
                                        itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.polizaEmitCab.frecuenciaPago);
                                        itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.polizaEmitCab.frecuenciaPago);
                                        itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.polizaEmitCab.frecuenciaPago);

                                        params[0].QuotationDet.push(itemQuotationDet);
                                    }
                                }

                                if (params[0].CodigoProceso == '') {

                                    await this.quotationService.getProcessCode(this.nrocotizacion).toPromise().then(
                                        resCod => {
                                            console.log(resCod);
                                            params[0].CodigoProceso = resCod;
                                        }
                                    );
                                }
                                console.log(params);
                                this.EmitCerti(params);

                            }
                        );
                }
            });
        } else {
            swal.fire('Información', this.listToString(erroresList), 'error');
        }


    }

    EmitCerti(saveCerti) {
        this.loading = false;
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
                this.loading = true;
                let dataQuotation: any = {};
                const data: FormData = new FormData();

                const myFiles: FormData = new FormData(); /* Para los archivos EH */
                this.files.forEach(file => {
                    myFiles.append(file.name, file);
                });

                dataQuotation.P_NID_TRAMITE = this.transactNumber;
                dataQuotation.P_NFLAG_EMAIL = this.flagEnvioEmail;
                this.datasavecertificados = saveCerti[0];

                this.policyemit.procesarTramaEstado(this.datasavecertificados, myFiles).subscribe(
                    (res) => {
                        if (res.P_COD_ERR == 0) {
                            if (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') {

                                if (this.flagAprob && this.flagEstadoCertificado) { // para envios de tramites distinto de emisión del estado
                                    swal.fire('Información', "Se ha notificado sobre la transacción al ejecutivo comercial para su posterior evaluación y/o aprobación.", 'success');
                                    this.router.navigate(['/extranet/policy-transactions-all']);
                                } else {
                                    this.dataEmisionEstado();
                                    //this.OpenModalPagos(this.dataEstadoCertif);
                                    // this.emitirCertificadoEstado(this.datasavecertificados);
                                }

                            } else if (res.P_COD_ERR == 4 || res.P_SAPROBADO == 'A') {
                                this.loading = false;
                                swal.fire({
                                    title: 'Información',
                                    text: res.P_SMESSAGE,
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                }).then((result) => {
                                    if (result.value) {
                                        this.router.navigate(['/extranet/tray-transact/1']);
                                    }
                                });
                            }

                        }
                        else {
                            swal.fire({
                                title: 'Información',
                                text: res.P_SMESSAGE,
                                icon: 'error',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })
                        }

                    }
                );

            }
        });
    }

    emitirCertificadoEstado(datasavecertificados) {
        this.policyemit.emitirCertificadoEstado(datasavecertificados).subscribe(res => {

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

    async dataEmisionEstado() {
        await this.policyemit.getPolicyEmitCab(
            this.nrocotizacion, '1',
            JSON.parse(localStorage.getItem('currentUser'))['id']
        ).toPromise().then(async (res: any) => {
            if (!!res.GenericResponse &&
                res.GenericResponse.COD_ERR == 0) {
                await this.policyemit.getPolicyEmitDet(
                    this.nrocotizacion,
                    JSON.parse(localStorage.getItem('currentUser'))['id'])
                    .toPromise().then(
                        async resDet => {
                            console.log(res.GenericResponse)
                            this.dataEstadoCertif = [
                                {
                                    P_NID_COTIZACION: this.nrocotizacion,
                                    P_NID_PROC: this.nidProc,
                                    P_NPRODUCT: this.vidaLeyID.id,
                                    P_NBRANCH: this.nbranch,
                                    P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                    P_DSTARTDATE: CommonMethods.formatDate(this.polizaEmitCab.bsValueIni),
                                    P_DEXPIRDAT: CommonMethods.formatDate(this.polizaEmitCab.bsValueFin),
                                    P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                    P_SFLAG_FAC_ANT: 1,
                                    P_FACT_MES_VENCIDO: 0,
                                    P_NPREM_NETA: this.GetAmountDetailTotalListValue(0, this.polizaEmitCab.frecuenciaPago),
                                    P_IGV: this.GetAmountDetailTotalListValue(1, this.polizaEmitCab.frecuenciaPago),
                                    P_NPREM_BRU: this.GetAmountDetailTotalListValue(2, this.polizaEmitCab.frecuenciaPago),
                                    P_NAMO_AFEC: this.GetAmountDetailTotalListValue(0, this.polizaEmitCab.frecuenciaPago),
                                    P_NIVA: this.GetAmountDetailTotalListValue(1, this.polizaEmitCab.frecuenciaPago),
                                    P_NAMOUNT: this.GetAmountDetailTotalListValue(2, this.polizaEmitCab.frecuenciaPago),
                                    P_SCOMMENT: this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''),
                                    P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                    P_DSTARTDATE_ASE: CommonMethods.formatDate(this.polizaEmitCab.FDateIniAseg),
                                    P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.polizaEmitCab.FDateFinAseg),
                                    planId: res.GenericResponse.NIDPLAN,
                                    FlagCambioFecha: 0,
                                    P_NPOLICY: res.GenericResponse.NPOLICY,
                                    P_NDE: 0,
                                    P_NIDPAYMENT: 0
                                    /* Campos para retroactividad
                                    FlagPolMat: 1,
                                    FlagEnvioTEjecutivo: this.flagEnvioEmail,
                                    flagEmitCertificado:1*/

                                }
                            ];


                            if (this.dataEstadoCertif[0].P_NID_PROC == '') {

                                await this.quotationService.getProcessCode(this.nrocotizacion).toPromise().then(
                                    resCod => {
                                        console.log(resCod);
                                        this.dataEstadoCertif[0].P_NID_PROC = resCod;
                                    }
                                );
                            }
                            this.OpenModalPagos(this.dataEstadoCertif);
                        }
                    );
            }
        });
        console.log(this.dataEstadoCertif);


    }

    async loadDatosCotizadorPolizaMatriz() {
        await this.policyService.getPolicyEmitDet(
            this.nrocotizacion, JSON.parse(localStorage.getItem('currentUser'))['id'])
            .toPromise().then(
                async resDet => {
                    var frecPago = 0;

                    switch (Number(this.polizaEmitCab.FREQ_PAGO)) {
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

                        if (resDet[i].TIP_RIESGO == "1") {
                            this.countinputEMP = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEMP = resDet[i].MONTO_PLANILLA;
                            this.tasainputEMP = resDet[i].TASA;
                            //this.MontoSinIGVEMP = resDet[i].PRIMA;
                            //this.MontoSinIGVEMP = parseFloat(Number.parseFloat(resDet[i].PRIMA).toFixed(6));
                            this.MontoSinIGVEMP = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                            this.MontoFPSinIGVEMP = CommonMethods.formatValor(this.MontoSinIGVEMP * frecPago, 6, 1)
                        }
                        if (resDet[i].TIP_RIESGO == "2") {
                            this.countinputOBR = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOBR = resDet[i].MONTO_PLANILLA;
                            this.tasainputOBR = resDet[i].TASA;
                            this.MontoSinIGVOBR = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                            //this.MontoFPSinIGVOBR = resDet[i].PRIMA;
                            this.MontoFPSinIGVOBR = CommonMethods.formatValor(this.MontoSinIGVOBR * frecPago, 6, 1);

                        }

                        if (resDet[i].TIP_RIESGO == "3") {
                            this.countinputOAR = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOAR = resDet[i].MONTO_PLANILLA;
                            this.tasainputOAR = resDet[i].TASA;
                            this.MontoSinIGVOAR = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                            //this.MontoFPSinIGVOAR = resDet[i].PRIMA;
                            this.MontoFPSinIGVOAR = CommonMethods.formatValor(this.MontoSinIGVOAR * frecPago, 6, 1);
                        }

                        if (resDet[i].TIP_RIESGO == "5") {
                            this.countinputEE = resDet[i].NUM_TRABAJADORES;
                            this.planillainputEE = resDet[i].MONTO_PLANILLA;
                            this.tasainputEE = resDet[i].TASA;
                            this.MontoSinIGVEE = resDet[i].PRIMA;
                            //this.MontoFPSinIGVEE = resDet[i].PRIMA;
                            this.MontoSinIGVEE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                            this.MontoFPSinIGVEE = CommonMethods.formatValor(this.MontoSinIGVEE * frecPago, 6, 1);
                        }
                        if (resDet[i].TIP_RIESGO == "6") {
                            this.countinputOE = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOE = resDet[i].MONTO_PLANILLA;
                            this.tasainputOE = resDet[i].TASA;
                            this.MontoSinIGVOE = resDet[i].PRIMA;
                            //this.MontoFPSinIGVOE = resDet[i].PRIMA;
                            this.MontoSinIGVOE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                            this.MontoFPSinIGVOE = CommonMethods.formatValor(this.MontoSinIGVOE * frecPago, 6, 1);
                        }
                        if (resDet[i].TIP_RIESGO == "7") {
                            this.countinputOARE = resDet[i].NUM_TRABAJADORES;
                            this.planillainputOARE = resDet[i].MONTO_PLANILLA;
                            this.tasainputOARE = resDet[i].TASA;
                            this.MontoSinIGVOARE = resDet[i].PRIMA;
                            //this.MontoFPSinIGVOARE = resDet[i].PRIMA;
                            this.MontoSinIGVOARE = CommonMethods.formatValor(Number.parseFloat(resDet[i].MONTO_PLANILLA) * Number.parseFloat(resDet[i].TASA) / 100, 6, 1);
                            this.MontoFPSinIGVOARE = CommonMethods.formatValor(this.MontoSinIGVOARE * frecPago, 6, 1);
                        }

                    }

                    this.TotalSinIGV = CommonMethods.formatValor(Number(this.MontoSinIGVEMP) + Number(this.MontoSinIGVOBR) + Number(this.MontoSinIGVOAR) + Number(this.MontoSinIGVEE) + Number(this.MontoSinIGVOE) + Number(this.MontoSinIGVOARE), 2, 1);
                    this.TotalFPSinIGV = CommonMethods.formatValor(Number(this.MontoFPSinIGVEMP) + Number(this.MontoFPSinIGVOBR) + Number(this.MontoFPSinIGVOAR) + Number(this.MontoFPSinIGVEE) + Number(this.MontoFPSinIGVOE) + Number(this.MontoFPSinIGVOARE), 2, 1);

                    this.TotalConIGV = CommonMethods.formatValor(this.TotalSinIGV * 118 / 100, 2, 1);
                    this.TotalFPConIGV = CommonMethods.formatValor(this.TotalFPSinIGV * 118 / 100, 2, 1);


                }
            );
    }
    polizaMatriz(e: any) {
        if (e.target.checked) {
            this.flagActivateExc = 1;
        } else {
            this.flagActivateExc = 0;
        }
    }

    async DeleteDataSCTR() {

        const delSCTR: any = {};
        delSCTR.P_NID_COTIZACION = Number(this.nrocotizacion);

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('DeleteSCTR', JSON.stringify(delSCTR));

        this.policyemit.DeleteDataSCTR(myFormData).subscribe();
    }

    async getMonthsSCTR() { //AVS Nueva Estimacion de Calculo 23/12/2022

        let totalMonths = 0;
        let monthsSCTR: any = {};
        monthsSCTR.date = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
        monthsSCTR.dateFn = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
        monthsSCTR.npayfreq = this.mode == 'include' ? 6 : Number(this.polizaEmitCab.tipoRenovacion);

        await this.policyemit.GetMonthsSCTR(monthsSCTR).toPromise().then(
            res => {
                this.montos_sctr = res;
            },
            err => {
                console.log(err);
            }
        );
        return totalMonths;
    }

    //AVS - INTERCONEXION SABSA
    async insertEmitDet() {
    this.ListainsertEmit = [];
    if (this.pensionList.length > 0 && this.saludList.length == 0) {
      for (let i = 0; i < this.pensionList.length; i++) {
        //if(this.pensionList[i].NUM_TRABAJADORES > 0){
          this.dataTransaccionDet = {};
          this.dataTransaccionDet.NID_COTIZACION = this.nrocotizacion;
          this.dataTransaccionDet.NPRODUCT = this.pensionID.id;
          this.dataTransaccionDet.NMODULEC = this.pensionList[i].TIP_RIESGO;
          this.dataTransaccionDet.NNUM_TRABAJADORES = this.pensionList[i].NUM_TRABAJADORES;
          this.dataTransaccionDet.NMONTO_PLANILLA = Number(this.pensionList[i].MONTO_PLANILLA);
          this.dataTransaccionDet.NTASA_CALCULADA = Number(this.pensionList[i].TASA_CALC);
          this.dataTransaccionDet.NTASA_PROP = this.pensionList[i].TASA_PRO == '' ? 0 : this.pensionList[i].TASA_PRO || this.pensionList[i].TASA_PRO !== '' ? Number(this.pensionList[i].TASA_PRO) : Number(this.pensionList[i].TASA_PRO);
          this.dataTransaccionDet.NTASA_AUTOR = this.pensionList[i].TASA;
          this.dataTransaccionDet.NPREMIUM_MIN = this.pensionList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_MIN_PR = this.pensionList[i].PRIMA_MIN_PRO;
          this.dataTransaccionDet.NPREMIUM_MIN_AU = this.pensionList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_END = this.pensionList[i].PRIMA_END;
          this.dataTransaccionDet.NSUM_PREMIUMN = this.pensionList[i].NSUM_PREMIUMN;
          this.dataTransaccionDet.NSUM_IGV = this.pensionList[i].NSUM_IGV;
          this.dataTransaccionDet.NSUM_PREMIUM = this.pensionList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NUSERCODE = this.usercode;
          this.dataTransaccionDet.NRATE = this.pensionList[i].rateDet;
          this.dataTransaccionDet.NDISCOUNT = this.pensionList[i].DESCUENTO;
          this.dataTransaccionDet.NACTIVITYVARIATION = this.pensionList[i].VARIACION_TASA;
          this.dataTransaccionDet.SSTATREGT = 1;
          this.dataTransaccionDet.NMODULEC_FINAL = this.pensionList[i].TIP_RIESGO;
          this.dataTransaccionDet.NAMO_AFEC = this.pensionList[i].PRIMA_END;
          this.dataTransaccionDet.NIVA = this.pensionList[i].NSUM_IGV;
          this.dataTransaccionDet.NAMOUNT = this.pensionList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NDE = 0;
          this.dataTransaccionDet.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
          this.ListainsertEmit.push(this.dataTransaccionDet);
        //}
      }
    }

    if (this.saludList.length > 0 && this.pensionList.length == 0) {
      for (let i = 0; i < this.saludList.length; i++) {
        //if(this.saludList[i].NUM_TRABAJADORES > 0){
          this.dataTransaccionDet = {};
          this.dataTransaccionDet.NID_COTIZACION = this.nrocotizacion;
          this.dataTransaccionDet.NPRODUCT = this.saludID.id;
          this.dataTransaccionDet.NMODULEC = this.saludList[i].TIP_RIESGO;
          this.dataTransaccionDet.NNUM_TRABAJADORES = this.saludList[i].NUM_TRABAJADORES;
          this.dataTransaccionDet.NMONTO_PLANILLA = Number(this.saludList[i].MONTO_PLANILLA);
          this.dataTransaccionDet.NTASA_CALCULADA = Number(this.saludList[i].TASA_CALC);
          this.dataTransaccionDet.NTASA_PROP = this.saludList[i].TASA_PRO == '' ? 0 : this.saludList[i].TASA_PRO || this.saludList[i].TASA_PRO !== '' ? Number(this.saludList[i].TASA_PRO) : Number(this.saludList[i].TASA_PRO);
          this.dataTransaccionDet.NTASA_AUTOR = this.saludList[i].TASA;
          this.dataTransaccionDet.NPREMIUM_MIN = this.saludList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_MIN_PR = this.saludList[i].PRIMA_MIN_PRO;
          this.dataTransaccionDet.NPREMIUM_MIN_AU = this.saludList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_END = this.saludList[i].PRIMA_END;
          this.dataTransaccionDet.NSUM_PREMIUMN = this.saludList[i].NSUM_PREMIUMN;
          this.dataTransaccionDet.NSUM_IGV = this.saludList[i].NSUM_IGV;
          this.dataTransaccionDet.NSUM_PREMIUM = this.saludList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NUSERCODE = this.usercode;
          this.dataTransaccionDet.NRATE = this.saludList[i].rateDet;
          this.dataTransaccionDet.NDISCOUNT = this.saludList[i].DESCUENTO;
          this.dataTransaccionDet.NACTIVITYVARIATION = this.saludList[i].VARIACION_TASA;
          this.dataTransaccionDet.SSTATREGT = 1;
          this.dataTransaccionDet.NMODULEC_FINAL = this.saludList[i].TIP_RIESGO;
          this.dataTransaccionDet.NAMO_AFEC = this.saludList[i].PRIMA_END;
          this.dataTransaccionDet.NIVA = this.saludList[i].NSUM_IGV;
          this.dataTransaccionDet.NAMOUNT = this.saludList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NDE = 0;
          this.dataTransaccionDet.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
          this.ListainsertEmit.push(this.dataTransaccionDet);
        //}
      }
    }

    if (this.saludList.length > 0 && this.pensionList.length > 0) {
      for (let i = 0; i < this.pensionList.length; i++) {
        //if(this.pensionList[i].NUM_TRABAJADORES > 0){
          this.dataTransaccionDet = {};
          this.dataTransaccionDet.NID_COTIZACION = this.nrocotizacion;
          this.dataTransaccionDet.NPRODUCT = this.pensionID.id;
          this.dataTransaccionDet.NMODULEC = this.pensionList[i].TIP_RIESGO;
          this.dataTransaccionDet.NNUM_TRABAJADORES = this.pensionList[i].NUM_TRABAJADORES;
          this.dataTransaccionDet.NMONTO_PLANILLA = Number(this.pensionList[i].MONTO_PLANILLA);
          this.dataTransaccionDet.NTASA_CALCULADA = Number(this.pensionList[i].TASA_CALC);
          this.dataTransaccionDet.NTASA_PROP = this.pensionList[i].TASA_PRO == '' ? 0 : this.pensionList[i].TASA_PRO || this.pensionList[i].TASA_PRO !== '' ? Number(this.pensionList[i].TASA_PRO) : Number(this.pensionList[i].TASA_PRO);
          this.dataTransaccionDet.NTASA_AUTOR = this.pensionList[i].TASA;
          this.dataTransaccionDet.NPREMIUM_MIN = this.pensionList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_MIN_PR = this.pensionList[i].PRIMA_MIN_PRO;
          this.dataTransaccionDet.NPREMIUM_MIN_AU = this.pensionList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_END = this.pensionList[i].PRIMA_END;
          this.dataTransaccionDet.NSUM_PREMIUMN = this.pensionList[i].NSUM_PREMIUMN;
          this.dataTransaccionDet.NSUM_IGV = this.pensionList[i].NSUM_IGV;
          this.dataTransaccionDet.NSUM_PREMIUM = this.pensionList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NUSERCODE = this.usercode;
          this.dataTransaccionDet.NRATE = this.pensionList[i].rateDet;
          this.dataTransaccionDet.NDISCOUNT = this.pensionList[i].DESCUENTO;
          this.dataTransaccionDet.NACTIVITYVARIATION = this.pensionList[i].VARIACION_TASA;
          this.dataTransaccionDet.SSTATREGT = 1;
          this.dataTransaccionDet.NMODULEC_FINAL = this.pensionList[i].TIP_RIESGO;
          this.dataTransaccionDet.NAMO_AFEC = this.pensionList[i].PRIMA_END;
          this.dataTransaccionDet.NIVA = this.pensionList[i].NSUM_IGV;
          this.dataTransaccionDet.NAMOUNT = this.pensionList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NDE = 0;
          this.dataTransaccionDet.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
          this.ListainsertEmit.push(this.dataTransaccionDet);
        //}
      }

      for (let i = 0; i < this.saludList.length; i++) {
        //if(this.saludList[i].NUM_TRABAJADORES > 0){
          this.dataTransaccionDet = {};
          this.dataTransaccionDet.NID_COTIZACION = this.nrocotizacion;
          this.dataTransaccionDet.NPRODUCT = this.saludID.id;
          this.dataTransaccionDet.NMODULEC = this.saludList[i].TIP_RIESGO;
          this.dataTransaccionDet.NNUM_TRABAJADORES = this.saludList[i].NUM_TRABAJADORES;
          this.dataTransaccionDet.NMONTO_PLANILLA = Number(this.saludList[i].MONTO_PLANILLA);
          this.dataTransaccionDet.NTASA_CALCULADA = Number(this.saludList[i].TASA_CALC);
          this.dataTransaccionDet.NTASA_PROP = this.saludList[i].TASA_PRO == '' ? 0 : this.saludList[i].TASA_PRO || this.saludList[i].TASA_PRO !== '' ? Number(this.saludList[i].TASA_PRO) : Number(this.saludList[i].TASA_PRO);
          this.dataTransaccionDet.NTASA_AUTOR = this.saludList[i].TASA;
          this.dataTransaccionDet.NPREMIUM_MIN = this.saludList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_MIN_PR = this.saludList[i].PRIMA_MIN_PRO;
          this.dataTransaccionDet.NPREMIUM_MIN_AU = this.saludList[i].PRIMA_MIN;
          this.dataTransaccionDet.NPREMIUM_END = this.saludList[i].PRIMA_END;
          this.dataTransaccionDet.NSUM_PREMIUMN = this.saludList[i].NSUM_PREMIUMN;
          this.dataTransaccionDet.NSUM_IGV = this.saludList[i].NSUM_IGV;
          this.dataTransaccionDet.NSUM_PREMIUM = this.saludList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NUSERCODE = this.usercode;
          this.dataTransaccionDet.NRATE = this.saludList[i].rateDet;
          this.dataTransaccionDet.NDISCOUNT = this.saludList[i].DESCUENTO;
          this.dataTransaccionDet.NACTIVITYVARIATION = this.saludList[i].VARIACION_TASA;
          this.dataTransaccionDet.SSTATREGT = 1;
          this.dataTransaccionDet.NMODULEC_FINAL = this.saludList[i].TIP_RIESGO;
          this.dataTransaccionDet.NAMO_AFEC = this.saludList[i].PRIMA_END;
          this.dataTransaccionDet.NIVA = this.saludList[i].NSUM_IGV;
          this.dataTransaccionDet.NAMOUNT = this.saludList[i].NSUM_PREMIUM;
          this.dataTransaccionDet.NDE = 0;
          this.dataTransaccionDet.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
          this.ListainsertEmit.push(this.dataTransaccionDet);
        //}
      }
    }
  }

  async obtenerPaytypeSCTR(): Promise<boolean> {  //AVS - INTERCONEXION SABSA
    let response: any = {};
    let prima = 0.0;

    if (this.valMixSAPSA == 1) {

            response = await this.callServiceMethods(this.brutaTotalPensionSave);

            if (response.P_ORDER !== 1) {
                response = await this.callServiceMethods(this.brutaTotalSaludSave);
            }

        } else {
            if (this.polizaEmitCab.NPRODUCT == 1) {
                prima = this.brutaTotalPensionSave;
            } else {
                prima = this.brutaTotalSaludSave;
            }

            response = await this.callServiceMethods(prima);
        }

        let valTypePay = response.P_ORDER === 1 ? true : false;

        return valTypePay;
        }

    async callServiceMethods(prima) {
        let response: any = {};

        await this.policyemit.getPayMethodsTypeValidate(  //AVS - INTERCONEXION SABSA
        this.creditHistory.sdescript, prima, this.typeMovement
        ).toPromise().then(res => {
            response = res;
        }, err => {
            console.log(err);
        });

        return response;
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

    /**
    * Obtiene el monto de planilla según el tipo de riesgo
    * @param riskTypeId id de tipo de riesgo
    */
    getPayrollAmount(riskTypeId: string) {
        let payRollAmount;
        this.tasasList.forEach(element => {
            if (element.TIP_RIESGO == riskTypeId) { payRollAmount = element.MONTO_PLANILLA; }
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
    * Calcula la primas neta total, IGV de prima neta total y la prima bruta total para las tasas autorizadas y primas mínimas autorizadas por producto
    * @param productId Id de producto
    */
    checkMinimunPremiumForAuthorizedAmounts(productId: string, cantPrima?) {
        if (cantPrima != undefined) {
            let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
            totPrima = isNaN(totPrima) ? 0 : totPrima;
            if (productId == this.saludID.id) {
                this.polizaEmitCab.MIN_SALUD = totPrima
            }

            if (productId == this.pensionID.id) {
                this.polizaEmitCab.MIN_PENSION = totPrima
            }
        }

        if (productId == this.saludID.id) {
            this.polizaEmitCab.MIN_SALUD = CommonMethods.ConvertToReadableNumber(this.polizaEmitCab.MIN_SALUD);
            let NetPremium = 0;
            this.saludList.map(function (item) {
                NetPremium = NetPremium + Number(item.PRIMA);
            });

            if (NetPremium < this.polizaEmitCab.MIN_SALUD) {
                this.totalNetoSaludSave = this.polizaEmitCab.MIN_SALUD;
                this.mensajePrimaSalud = this.variable.var_msjPrimaMin;
            } else {
                this.totalNetoSaludSave = NetPremium;
                this.mensajePrimaSalud = '';
            }
            this.polizaEmitCab.primaComSalud = CommonMethods.formatValor(this.totalNetoSaludSave * this.dEmiSalud, 2);
            this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * Number(this.igvSaludWS.toString())) - this.totalNetoSaludSave, 2);
            this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.igvSaludSave) + Number(this.polizaEmitCab.primaComSalud), 2);

        } else if (productId == this.pensionID.id) {
            this.polizaEmitCab.MIN_PENSION = CommonMethods.ConvertToReadableNumber(this.polizaEmitCab.MIN_PENSION);
            let NetPremium = 0;
            this.pensionList.map(function (item) {
                NetPremium = NetPremium + Number(item.PRIMA);
            });
            if (NetPremium < this.polizaEmitCab.MIN_PENSION) {
                this.totalNetoPensionSave = this.polizaEmitCab.MIN_PENSION;
                this.mensajePrimaPension = this.variable.var_msjPrimaMin;
            } else {
                this.totalNetoPensionSave = NetPremium;
                this.mensajePrimaPension = '';
            }
            this.polizaEmitCab.primaComPension = CommonMethods.formatValor(this.totalNetoPensionSave * this.dEmiPension, 2);
            this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * Number(this.igvPensionWS.toString())) - this.totalNetoPensionSave, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.igvPensionSave) + Number(this.polizaEmitCab.primaComPension), 2);
        }
    }

    /**
    * Calcula la nueva prima según la tasa autorizada ingresada
    * Calcula la nueva prima total neta, IGV a la prima neta y la prima total bruta.
    * @param authorizedRate valor de ngModel de tasa autorizada
    * @param riskTypeId - Id de tipo de riesgo
    * @param productId Id de producto
    * 
    * item.rate, item.nmodulec, this.pensionID.id
    */
    calculateNewPremiums(authorizedRate: any, riskTypeId: string, productId: string) {
        if (!this.template.debug_dummy) {
            let planProp = authorizedRate != '' ? Number(authorizedRate) : 0;
            planProp = isNaN(planProp) ? 0 : planProp;
            authorizedRate = planProp;
            // let self = this;
            if (productId == this.saludID.id) {
                if (authorizedRate > 100) {
                    this.saludList.forEach(item => {
                        if (item.TIP_RIESGO == riskTypeId) {
                            item.valItem = true;
                        }
                    });
                }
                else {
                    this.saludList.forEach(item => {
                        if (item.TIP_RIESGO == riskTypeId) {
                            item.valItem = false;
                        }
                    });
                }
            } else if (productId == this.pensionID.id) {
                if (authorizedRate > 100) {
                    this.pensionList.forEach(item => {
                        if (item.TIP_RIESGO == riskTypeId) {
                            item.valItem = true;
                        }
                    });
                }
                else {
                    this.pensionList.forEach(item => {
                        if (item.TIP_RIESGO == riskTypeId) {
                            item.valItem = false;
                        }
                    });
                }
            }

            if (isNaN(authorizedRate) || authorizedRate.toString().trim() == '') authorizedRate = 0; //Si el input está limpio, lo convertimos a 0

            let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), authorizedRate), 2); //cálculo de prima nueva con la tasa autorizada
            if (productId == this.pensionID.id) { //Si el producto es pensión
                let pensionNewNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
                this.pensionList.forEach((element, key) => {
                    if (element.TIP_RIESGO == riskTypeId) {
                        this.pensionList[key].AUT_PRIMA = newPremium;
                        this.pensionList[key].PRIMA = newPremium;
                        pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(newPremium.toString());
                    } else pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(element.AUT_PRIMA.toString());

                });
                //Cálculo de nueva prima total neta de Pensión
                this.totalNetoPensionSave = CommonMethods.formatValor(pensionNewNetAmount, 2);
                //Cálculo de Prima Comercial de Pensión
                this.polizaEmitCab.primaComPension = CommonMethods.formatValor(this.totalNetoPensionSave * this.dEmiPension, 2);
                //Cálculo de IGV de la nueva prima total neta de Pensión
                this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 2);
                //Cálculo de nueva prima total bruta de Pensión
                this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.igvPensionSave) + Number(this.polizaEmitCab.primaComPension), 2);
                this.checkMinimunPremiumForAuthorizedAmounts(this.pensionID.id);
            }

            if (productId == this.saludID.id) { //Si el producto es Salud
                let saludNewNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
                this.saludList.forEach((element, key) => {
                    if (element.TIP_RIESGO == riskTypeId) {
                        this.saludList[key].AUT_PRIMA = newPremium;
                        this.saludList[key].PRIMA = newPremium;
                        saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(newPremium.toString());
                    } else saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(element.AUT_PRIMA.toString());
                });
                //Cálculo de nueva prima total neta de Salud
                this.totalNetoSaludSave = CommonMethods.formatValor(saludNewNetAmount, 2);
                //Cálculo de Prima Comercial de Pensión
                this.polizaEmitCab.primaComSalud = CommonMethods.formatValor(this.totalNetoSaludSave * this.dEmiSalud, 2);
                //Cálculo de IGV de la nueva prima total neta de Salud
                this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 2);
                //Cálculo de nueva prima total bruta de Salud
                this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.igvSaludSave) + Number(this.polizaEmitCab.primaComSalud), 2);

                this.checkMinimunPremiumForAuthorizedAmounts(this.saludID.id);
            }
        }

    }

    async calculosExcSCTR(nidproc, ramo, producto, nrocotizacion, npolicy, varCalcExec, fecha_exclusion){
        await this.policyemit.getCalcExecSCTR(  //AVS - INTERCONEXION SABSA
        nidproc, ramo, producto, nrocotizacion, npolicy, varCalcExec, fecha_exclusion
        ).toPromise().then(res => {
            if(res.nproduct == Number(this.pensionID.id)){
                this.npremiumnExec_Pension = res.npremiumn;
                this.npremiumn_oriExec_Pension = res.npremiumn_ori;
                this.nigvExec_Pension = res.nigv;
                this.npremiumExec_Pension = res.npremium;
            }else{
                this.npremiumnExec_Salud = res.npremiumn;
                this.npremiumn_oriExec_Salud = res.npremiumn_ori;
                this.nigvExec_Salud = res.nigv;
                this.npremiumExec_Salud = res.npremium;
            }
        }, err => {
            console.log(err);
        });
    }

}