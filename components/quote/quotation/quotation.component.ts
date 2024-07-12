import { InputDateComponent } from './../../../../../shared/components/input-date/input-date.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

// Importación de servicios
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { ContractorLocationIndexService } from '../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
import { AddressService } from '../../../services/shared/address.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { ContractorLocationFormComponent } from '../../maintenance/contractor-location/contractor-location-form/contractor-location-form.component';
import { ValErrorComponent } from '../../../modal/val-error/val-error.component';

// componentes para ser usados como MODAL
import { SearchContractingComponent } from '../../../modal/search-contracting/search-contracting.component';
import { SearchBrokerComponent } from '../../../modal/search-broker/search-broker.component';
import { AccessFilter } from './../../access-filter';
import { ModuleConfig } from './../../module.config';
import swal from 'sweetalert2';
import { QuotationCoverComponent } from '../quotation-cover/quotation-cover.component';

// Util
import { CommonMethods } from './../../common-methods';
import { ValidateLockReponse } from '../../../interfaces/validate-lock-response';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import { ValidateLockRequest } from '../../../models/collection/validate-lock-request';
import { ValidateDebtRequest } from '../../../models/collection/validate-debt.request';
import { ValidateDebtReponse } from '../../../interfaces/validate-debt-response';
import { GenAccountStatusRequest } from '../../../models/collection/gen-account-status-request';
import { GenAccountStatusResponse } from '../../../interfaces/gen-account-status-response';
import { OthersService } from '../../../services/shared/others.service';
import { AddContactComponent } from '../../../modal/add-contact/add-contact.component';
import { ToastrService } from 'ngx-toastr';
import { tryCatch } from 'rxjs/internal/util/tryCatch';
import { AccPersonalesService } from '../acc-personales/acc-personales.service';
import { CommissionLotFilter } from '@root/layout/broker/models/commissionlot/commissionlotfilter';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-quotation',
    templateUrl: './quotation.component.html',
    styleUrls: ['./quotation.component.css']
})
export class QuotationComponent implements OnInit {
    isLoading: boolean = false;
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueIniMin: Date = new Date();
    bsValueFinMin: Date = new Date();
    bsValueFinMax: Date = new Date();

    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    saludID = JSON.parse(localStorage.getItem('saludID'));
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    perfil = '';
    codFlat = '';
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    codProfile: any;
    //epsItem = JSON.parse(sessionStorage.getItem('eps'))
    epsItem = JSON.parse(localStorage.getItem('eps'))
    lblProducto = '';
    lblFecha = '';

    statePrimaSalud = true;
    statePrimaPension = true;
    stateComision = true;
    stateQuotation = true;
    stateBrokerTasaSalud = true;
    stateBrokerTasaPension = true;
    blockDoc = true;
    blockSearch = true;
    stateSearch = false;
    messageWorker = '';
    maxlength = 8;
    minlength = 8;
    documentTypeList: any = [];
    currencyList: any = [];
    economicActivityList: any = [];
    technicalList: any = [];
    departmentList: any = [];
    provinceList: any = [];
    districtList: any = [];
    sedesList: any = [];
    savedPolicyList: any = [];
    inputsQuotation: any = {};
    savedPolicyEmit: any = {};
    files: File[] = [];
    archivoExcel: File;
    lastFileAt: Date;
    contratanteId = '';
    userId = 0;
    maxSize = 10485760;
    totalNetoSalud = 0;
    totalNetoPension = 0;
    igvSalud = 0;
    igvPension = 0;
    brutaTotalSalud = 0;
    brutaTotalPension = 0;
    flagDisableVL = 0;
    disabledFlat: any = [];
    totalNetoSaludSave = 0;
    totalNetoPensionSave = 0;
    igvSaludSave = 0;
    igvPensionSave = 0;
    brutaTotalSaludSave = 0;
    brutaTotalPensionSave = 0;
    cotizacionID: string = '';

    totalNetoSaludSave2: number = 0.0;
    totalNetoSaludSave3: number = 0.0;
    totalNetoSaludSave6: number = 0.0;

    ComisionObjeto: any = ""; // TASA X COMISION (JRIOS)

    igvSaludSave2: number = 0.0;
    igvSaludSave3: number = 0.0;
    igvSaludSave6: number = 0.0;
    igvSaludYear: number = 0.0;
    brutaTotalSaludSave2: any;
    brutaTotalSaludSave3: any;
    brutaTotalSaludSave6: any;
    brutaTotalSaludYear: any;

    resList: any = [];
    listaTasasSalud: any = [];
    listaTasasPension: any = [];
    productList: any = [];
    EListClient: any = [];
    brokerList: any = [];
    brokerList_PRI: any = [];
    tasasList: any = [];
    categoryList: any = [];
    rateByPlanList: any = [];
    detailPlanList: any = [];
    amountPremiumList: any = [];
    amountDetailTotalList: any = [];
    comisionList: any = []
    planesList: any = []
    municipalityTariff = 0
    discountPension = '';
    discountSalud = '';
    activityVariationPension = '';
    activityVariationSalud = '';
    commissionPension = '';
    commissionSalud = '';
    nidProc = '';
    comPropuestaSalud: boolean = false;
    comPropuestaPension: boolean = false;
    primMinimaPension: boolean = false;
    primMinimaSalud: boolean = false;
    comPropuesta: boolean = false;
    igvPensionWS: number = 0;
    igvSaludWS: number = 0;
    mensajePrimaPension = '';
    mensajePrimaSalud = '';
    activityMain = '';
    subActivity = '';
    inputsValidate: any = {};

    CreditDataNC: any; //AVS NC
    cotizacionNC: any; //AVS NC
    CanalNC: any; //AVS NC
    UserID: any; //AVS NC
    FlagPagoNC: any; //AVS NC
    flagBotonNC: any; //AVS NC

    BrokerDep = []; //R.P.
    selectedDep = []; //R.P.
    BrokerObl = []; //R.P.
    reloadTariff = false;
    canProposeComission = true;
    canAddSecondaryBroker = true;
    canProposeMinimunPremium = true;
    canProposeRate = true;
    sedeId = '0';
    tasaVL: any = [];
    canTasaVL = true;
    excelSubir: File;
    clickValidarExcel = false;
    loading = false;
    erroresList: any = [];
    errorExcel = false;
    primatotalSCTR: number;
    primatotalSalud: number;
    totalSTRC: any;
    totalSalud: any;
    tipoRenovacion: any;
    frecuenciaPago: any;
    totalNetoPensionYear: number = 0;
    totalNetoSaludYear: number = 0;
    contractingdata: any;
    totalNetoPensionSave2: number = 0.0;
    totalNetoPensionSave3: number = 0.0;
    totalNetoPensionSave6: number = 0.0;
    igvVidaLeyWS: number = 0;
    igvPensionSave2: number = 0.0;
    igvPensionSave3: number = 0.0;
    igvPensionSave6: number = 0.0;
    igvPensionYear: number = 0.0;
    brutaTotalPensionSave2: any;
    brutaTotalPensionSave3: any;
    brutaTotalPensionSave6: any;
    brutaTotalPensionYear: any;
    btnCotiza: boolean = true;
    btnNormal: boolean = true;
    mensajeEquivalente: string = '';
    primaNetaM = 0;
    igvAccM = 0;
    primaTotalM = 0;
    primaNetaR = 0;
    igvAccR = 0;
    primaTotalR = 0;
    primaNeta = 0;
    igvAcc = 0;
    primaTotal = 0;
    template: any = {};
    variable: any = {};
    prima: any = {};
    canAddContractor = true;
    tipoEspecial = false;
    creditHistory: any = null;
    dayConfig: any = 0;
    dayRetroConfig: any = 0;
    nrocotizacion: any = 0; // MRC
    isRateProposed: boolean = false; // MRC
    arrayRateProposed = []; //MRC
    stateRecotiza: boolean = false; //MRC
    inputsContracting: any = {};
    dEmiPension = 0;
    dEmiSalud = 0;
    errorMessageBroker = 'Cliente no está registrado en PROTECTA, favor de comunicarse con el área canal corporativo';
    perfilActual: any;
    validateLockResponse: ValidateLockReponse = {};
    validateDebtResponse: ValidateDebtReponse = {};
    contactList: any = [];

    @ViewChild('desde') desde: any;
    @ViewChild('hasta') hasta: any;
    flagContact: boolean = false;
    flagEmail: boolean = false;

    typeTran = ''; // declaraciones VL - EH
    disTasaProp: boolean = false;// declaraciones VL - EH
    typeGobiernoMatriz = false;
    // variables de prueba para abrir modal de pagos
    modal: any = {};
    cotizacion: any = {};
    flagAprobCli: boolean = false;
    quotationDataTra: any;
    flagEnvioEmail = 0;
    planPropuesto: '';
    planList: any = [];
    descPlanBD: '';

    flagExc: boolean = false;

    perfilExterno = false;

    derivaRetroactividad: boolean = false;
    FechaEfectoInicial: Date;
    nroSalud: any;
    isDeclare: boolean = false;
    transaccionProtecta: any;
    transaccionMapfre: any;

    annulmentID: any = null
    nroPension: any;
    nroPoliza: any;

    nTransac: number = 0;
    sAbTransac: string = "";
    tipoEndoso: any = [];
    changeList: any = [];
    flagConfirm: any = 1;

    flagComerExclu: number = 0; //RQ - Perfil Nuevo - Comercial Exclusivo
    polCabDate: any;
    questionText: string;
    flagPolizaMat: boolean = false;
    // listFlagCategory: any = [{ 'ID': 1, 'flagEMP': false}, { 'ID': 2, 'flagOBR': false}, { 'ID': 3, 'flagOAR': false}, { 'ID': 4, 'flagEE': false}, { 'ID': 5, 'flagOE': false}, { 'ID': 6, 'flagOARE': false}];
  categoryPolizaMatList: any = [
   /* 
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false , rango: '18-36'},
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false , rango: '37-55'},
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false , rango: '56-63'},
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false , rango: '64-70'},
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false , rango: '71-80'},
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false , rango: '81-99'},

    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false , rango: '18-36'},
    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false , rango: '37-55'},
    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false , rango: '56-63'},
    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false , rango: '64-70'},
    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false , rango: '71-80'},
    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false , rango: '81-99'},

    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false, rango: '18-36'},
    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false, rango: '37-55'},
    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false, rango: '56-63'},
    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false, rango: '64-70'},
    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false, rango: '71-80'},
    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false, rango: '81-99'},

    { NCATEGORIA: '5', SCATEGORIA: 'Empleado Excedente', sactive: false, rango: '' },
    { NCATEGORIA: '6', SCATEGORIA: 'Obrero Excedente', sactive: false , rango: '' },
    { NCATEGORIA: '7', SCATEGORIA: 'Obrero Alto Riesgo Excedente', sactive: false, rango: '' },

    */
    { NCATEGORIA: '1', SCATEGORIA: 'Empleado', sactive: false},
    { NCATEGORIA: '2', SCATEGORIA: 'Obrero', sactive: false},
    { NCATEGORIA: '3', SCATEGORIA: 'Obrero Alto Riesgo', sactive: false},
    { NCATEGORIA: '5', SCATEGORIA: 'Empleado Excedente', sactive: false},
    { NCATEGORIA: '6', SCATEGORIA: 'Obrero Excedente', sactive: false },
    { NCATEGORIA: '7', SCATEGORIA: 'Obrero Alto Riesgo Excedente', sactive: false},
  ];

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
    flagGobiernoEstado: boolean = false;
    flagActivateExc = 0;
    chkTope = 0;

    // para calculos decimales cotizacion GT Estado -VL
    v_MontoSinIGVEMP_18_36 = 0;
    /*
    v_MontoSinIGVEMP_37_55 = 0;
    v_MontoSinIGVEMP_56_63 = 0;
    v_MontoSinIGVEMP_64_70 = 0;
    v_MontoSinIGVEMP_71_80 = 0;
    v_MontoSinIGVEMP_81_99 = 0;
    */
   
    v_MontoSinIGVOBR_18_36 = 0;
    /*
    v_MontoSinIGVOBR_37_55 = 0;
    v_MontoSinIGVOBR_56_63 = 0;
    v_MontoSinIGVOBR_64_70 = 0;
    v_MontoSinIGVOBR_71_80 = 0;
    v_MontoSinIGVOBR_81_99 = 0;
    */

    v_MontoSinIGVOAR_18_36 = 0;
    /*
    v_MontoSinIGVOAR_37_55 = 0;
    v_MontoSinIGVOAR_56_63 = 0;
    v_MontoSinIGVOAR_64_70 = 0;
    v_MontoSinIGVOAR_71_80 = 0;
    v_MontoSinIGVOAR_81_99 = 0;
    */

    v_MontoSinIGVEE = 0;
    v_MontoSinIGVOE = 0;
    v_MontoSinIGVOARE = 0;

    disabledEndosoFechaAseg = true;
    flagdisabledCIIU = false; //Mejoras CIIU VL
    flagBuscarCIIU = false; //Mejoras CIIU VL
    flagCIIUEmpty = false; //Mejoras CIIU VL
    flagBrokerDirecto: any; //AVS - PRY COMISIONES 06/07/2023

    constructor(
        private route: ActivatedRoute,
        private policyemit: PolicyemitService,
        private router: Router,
        private modalService: NgbModal,
        private quotationService: QuotationService,
        private clientInformationService: ClientInformationService,
        private addressService: AddressService,
        private contractorLocationIndexService: ContractorLocationIndexService,
        private collectionsService: CobranzasService,
        private datePipe: DatePipe,
        private accPersonalesService: AccPersonalesService,
        private othersService: OthersService,
        private toastr: ToastrService,
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

    async ngOnInit() {
        const response: ValidateLockReponse = <ValidateLockReponse>{};

        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

        //
        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
        this.lblFecha = CommonMethods.tituloPantalla();
        this.codProfile = await this.getProfileProduct(); // 20230325
        this.perfilActual = await this.getProfileProduct(); // 20230325
        //Perfil 32 de Petro Peru externo - AVS
        if (this.perfilActual == '32') {
            this.perfil = '32';
        } else {
            this.perfil = this.variable.var_prefilExterno;
        }    
        
        //INI - RQ - Perfil Nuevo - Comercial Exclusivo
        if (this.perfilActual == '164' || this.perfilActual == '134' || this.perfilActual == '32') //Perfil Externo --Se adiciona perfil Broker PETROPERU - AVS
        {
            this.flagComerExclu = 1;
        }
        //FIN - RQ - Perfil Nuevo - Comercial Exclusivo

        if (this.template.ins_validaPermisos) {
            if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['quotation']) == false) {
                this.router.navigate(['/extranet/home']);
            }
            this.canProposeComission = AccessFilter.hasPermission('6');
            this.canAddSecondaryBroker = AccessFilter.hasPermission('7');
            this.canProposeMinimunPremium = AccessFilter.hasPermission('8');
            this.canProposeRate = AccessFilter.hasPermission('9');
            this.canAddContractor = AccessFilter.hasPermission('34');
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userId = currentUser['id'];

        this.inputsValidate = CommonMethods.generarCampos(30, 0);
        this.disabledFlat = CommonMethods.generarCampos(30, 1);
        this.inputsQuotation.P_TYPE_SEARCH = this.variable.var_tipoBusqueda; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = 2; // this.variable.var_tipoPersona; // Tipo persona
        this.inputsQuotation.P_WORKER = 0;
        this.inputsQuotation.P_NIDDOC_TYPE = '-1'; // Tipo de documento

        this.inputsQuotation.NBRANCH = await CommonMethods.branchXproduct(this.codProducto);
        await this.getDocumentTypeList();
        await this.getProductList();
        await this.getTechnicalActivityList(this.codProducto);
        await this.getDepartmentList(null);
        await this.getIGVData();
        await this.obtenerTipoRenovacion();
        await this.getCurrencyList();
        await this.getDataConfig();
        //await this.getComisionList();
        await this.getPlanList();
        await this.getTypeEndoso();

        //  Broker R.P.
        await this.getDepartamento();
        await this.getBrokerObl();

        this.inputsQuotation.primaMinimaPension = this.codProducto == 2 ? this.variable.var_primaMinimaPension : '';

        this.route.queryParams
            .subscribe(params => {
                this.inputsQuotation.P_NIDDOC_TYPE = params.typeDocument;
                this.inputsQuotation.P_SIDDOC = params.document;
                this.nrocotizacion = params.nroCotizacion;
                this.typeTran = params.typeTransac;
                this.SetTransac();
            });

        if (this.nrocotizacion == undefined) {
            await this.getComisionList(0);
        } else {
            await this.getComisionList(this.nrocotizacion);
        }

        if (this.inputsQuotation.P_NIDDOC_TYPE != undefined && this.inputsQuotation.P_SIDDOC != undefined && this.inputsQuotation.P_NIDDOC_TYPE != '' && this.inputsQuotation.P_SIDDOC != '') {
            this.buscarContratante();
            this.selTipoDocumento(this.inputsQuotation.P_NIDDOC_TYPE);
            this.cambioDocumento(this.inputsQuotation.P_SIDDOC);
        } else {
            // Datos Contratante
            this.inputsQuotation.P_NIDDOC_TYPE = '-1';
            this.inputsQuotation.P_SIDDOC = ''; // Nro de documento
            this.inputsQuotation.P_SFIRSTNAME = ''; // Nombre
            this.inputsQuotation.P_SLASTNAME = ''; // Apellido Paterno
            this.inputsQuotation.P_SLASTNAME2 = ''; // Apellido Materno
            this.inputsQuotation.P_SLEGALNAME = ''; // Razon social
            this.inputsQuotation.P_SE_MAIL = ''; // Email
            this.inputsQuotation.P_SDESDIREBUSQ = ''; // Direccion
            this.inputsQuotation.P_SISCLIENT_GBD = '2';
            // Datos Cotización
            this.inputsQuotation.P_NPRODUCT = this.productList.length > 1 ? '-1' : this.inputsQuotation.P_NPRODUCT; // Producto
            this.inputsQuotation.P_NCURRENCY = this.variable.var_codMoneda; // Moneda
            this.inputsQuotation.P_NIDSEDE = null; // Sede
            this.inputsQuotation.P_NTECHNICAL = null; // Actividad tecnica
            this.inputsQuotation.P_NECONOMIC = null; // Actividad Economica
            this.inputsQuotation.P_DELIMITER = ''; // Delimitación check
            this.inputsQuotation.P_MINA = false; // Delimitación check
            this.inputsQuotation.P_SDELIMITER = '0'; // Delimitacion  1 o 0
            this.inputsQuotation.P_NPROVINCE = null;
            this.inputsQuotation.P_NLOCAL = null;
            this.inputsQuotation.P_NMUNICIPALITY = null;
            this.inputsQuotation.P_PLANILLA = 0;

            this.inputsQuotation.P_COMISION_PRO = null;
            this.inputsQuotation.rateObrProposed = null;
            this.inputsQuotation.rateEmpProposed = null;
        }

        if (this.perfilActual == this.perfil || this.template.ins_iniciarBroker) {
            this.brokerIni();
        }

        this.variable.var_isBroker = false;
        if (this.perfilActual == this.perfil && this.codProducto == '3') {
            this.inputsContracting.EListAddresClient = [];
            this.inputsContracting.EListPhoneClient = [];
            this.inputsContracting.EListEmailClient = [];
            this.inputsContracting.EListContactClient = [];
            this.inputsContracting.EListCIIUClient = [];
            this.variable.var_isBroker = true;
        }

        this.inputsQuotation.FDateIni = new Date();
        this.inputsQuotation.FDateIniMin = new Date();
        this.inputsQuotation.FDateFin = new Date();
        this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);
        this.inputsQuotation.FDateFin.setDate(this.inputsQuotation.FDateFin.getDate() - this.variable.var_restarDias);
        this.bsValueIniMin = new Date();
        this.bsValueFinMin = this.inputsQuotation.FDateFin;
        this.inputsQuotation.P_COMISION = ''; // Comision
        this.inputsQuotation.tipoRenovacion = '';
        this.inputsQuotation.frecuenciaPago = '';

        if (this.template.ins_retroactividad) {
            if (this.template.ins_firstDay && this.variable.var_isBroker) {
                this.inputsQuotation.FDateIniMin.setDate(0);
                this.inputsQuotation.FDateIniMin.setDate(this.inputsQuotation.FDateIniMin.getDate() + 1);
            } else {
                this.inputsQuotation.FDateIniMin = new Date();
                this.inputsQuotation.FDateIniMin.setDate(this.inputsQuotation.FDateIniMin.getDate() - this.dayRetroConfig);
            }

            this.inputsQuotation.FDateIniFin = new Date();
            this.inputsQuotation.FDateIniFin.setDate(this.inputsQuotation.FDateIniFin.getDate() + this.dayConfig);
        }

        //cuando sea perfil externo
        if (this.perfil == this.perfilActual) {
            this.inputsQuotation.FDateIniMin = new Date();
            this.perfilExterno = true;
        }

        // Cotizador
        this.inputsQuotation.P_PRIMA_MIN_SALUD = ''; // Prima minima salud
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = ''; // Prima minima salud propuesta
        this.inputsQuotation.P_PRIMA_END_SALUD = ''; // Prima endoso salud
        this.inputsQuotation.P_PRIMA_MIN_PENSION = ''; // Prima minima pension
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = ''; // Prima minima pension propuesta
        this.inputsQuotation.P_PRIMA_END_PENSION = ''; // Prima endoso pension
        this.inputsQuotation.P_SCOMMENT = '';

        if (this.template.ins_recotizarCotizacion) {
            if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                this.isLoading = true;
                this.stateSearch = true;
                this.stateRecotiza = true;
                this.policyemit.getPolicyEmitCab(this.nrocotizacion, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 2 : this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 3 : this.variable.var_movimientoEmision, JSON.parse(localStorage.getItem('currentUser'))['id']).subscribe(
                    async res => {
                        this.polCabDate = res.GenericResponse;
                        this.contratanteId = res.GenericResponse.SCLIENT;
                        if (res.GenericResponse !== null) {
                            this.inputsQuotation.P_NIDDOC_TYPE = res.GenericResponse.TIPO_DOCUMENTO;
                            this.inputsQuotation.P_PERSON_TYPE = res.GenericResponse.COD_TIPO_PERSONA;
                            this.inputsQuotation.P_SIDDOC = res.GenericResponse.NUM_DOCUMENTO;
                            if (this.inputsQuotation.P_NIDDOC_TYPE == 1) {
                                this.blockDoc = false;
                                this.inputsQuotation.P_SLEGALNAME = res.GenericResponse.NOMBRE_RAZON;
                            } else if (this.inputsQuotation.P_NIDDOC_TYPE == 2) {
                                this.blockDoc = true;
                                this.inputsQuotation.P_SFIRSTNAME = res.GenericResponse.NOMBRE_RAZON;
                            }

                            this.inputsQuotation.P_SDESDIREBUSQ = res.GenericResponse.DIRECCION;
                            this.inputsQuotation.P_SE_MAIL = res.GenericResponse.CORREO;

                            this.inputsQuotation.P_NPRODUCT = res.GenericResponse.NPRODUCT;
                            this.inputsQuotation.tipoRenovacion = res.GenericResponse.TIP_RENOV;
                            await this.habilitarFechas();
                            this.inputsQuotation.FDateIni = new Date(res.GenericResponse.EFECTO_COTIZACION_VL);
                            this.inputsQuotation.FDateFin = new Date(res.GenericResponse.EXPIRACION_COTIZACION_VL)
                            this.inputsQuotation.frecuenciaPago = res.GenericResponse.FREQ_PAGO;
                            //await this.ValidarFrecPago(null);
                            this.inputsQuotation.P_NCURRENCY = res.GenericResponse.COD_MONEDA;
                            this.inputsQuotation.P_NIDSEDE = res.GenericResponse.COD_TIPO_SEDE;
                            this.inputsQuotation.P_NTECHNICAL = res.GenericResponse.ACT_TEC_VL;
                            this.getEconomicActivityList(this.inputsQuotation.P_NTECHNICAL);
                            this.inputsQuotation.P_NECONOMIC = res.GenericResponse.ACT_ECO_VL;
                            await this.ValidarCIIUPorTransaccion();
                            this.inputsQuotation.P_COMISION = res.GenericResponse.TIP_COMISS;
                            this.inputsQuotation.P_NPROVINCE = res.GenericResponse.COD_DEPARTAMENTO;
                            this.inputsQuotation.P_NLOCAL = res.GenericResponse.COD_PROVINCIA;
                            this.inputsQuotation.P_NMUNICIPALITY = res.GenericResponse.COD_DISTRITO;
                            this.inputsQuotation.P_NTYPE_END = res.GenericResponse.NTYPE_END;
                            this.inputsQuotation.P_NID_TRAMITE = res.GenericResponse.NID_TRAMITE;
                            this.inputsQuotation.SMAIL_EJECCOM = res.GenericResponse.SMAIL_EJECCOM;
                            if (res.GenericResponse.NCOMISION_SAL_PR > 0) {
                                this.inputsQuotation.P_COMISION_PRO = res.GenericResponse.NCOMISION_SAL_PR;
                                this.comPropuesta = true;
                                this.stateComision = false;

                            }
                            this.inputsQuotation.P_MINA = this.codProducto == 3 && res.GenericResponse.MINA == 1 ? true : false;
                            this.canTasaVL = false;
                            const myFormData: FormData = new FormData();
                            const numeroCotizacion = this.nrocotizacion;

                            this.inputsQuotation.P_NREM_EXC = res.GenericResponse.NREM_EXC;

                            this.isLoading = true;
                            await this.callCliente360();
                            await this.brokerRec();
                            await this.ValidarFrecPago(null);
                            /*
                            if (this.typeTran == 'Declaración' ||
                              this.typeTran == 'Renovación' ||
                              this.typeTran == 'Inclusión') {
                              await this.brokerRec();
                            }*/
                            // if (this.nTransac == 3){
                            await this.policyemit.getPolicyCot(this.nrocotizacion, this.nTransac)
                                .toPromise().then((res: any) => {
                                    if (res != null) {
                                        this.nroPension = res[0].POL_PEN;
                                        this.nroSalud = res[0].POL_SAL;
                                        this.nroPoliza = res[0].POL_SAL;
                                        this.inputsQuotation.facturacionAnticipada = res[0].FACT_ANTI == 0 ? false : true;
                                    }
                                });
                            // }

                            this.descPlanBD = res.GenericResponse.SDES_PLAN;

                            if (this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION) {
                                this.inputsQuotation.FDateIniAseg = new Date(res.GenericResponse.EFECTO_ASEGURADOS);
                                this.inputsQuotation.FDateFinAseg = new Date(res.GenericResponse.EXPIRACION_ASEGURADOS);
                            }

                            if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
                                this.inputsQuotation.FDateIniAseg = new Date(res.GenericResponse.EFECTO_ASEGURADOS);
                                this.inputsQuotation.FechaAnulacion = new Date(res.GenericResponse.FECHA_EXCLUSION)
                            }

                            if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) { // INI ENDOSO TECNICA JTV 02022023
                                this.inputsQuotation.FDateIniAseg = new Date(res.GenericResponse.EFECTO_ASEGURADOS);
                                this.inputsQuotation.FDateIniMin = new Date(res.GenericResponse.DEFFECDATE);
                                this.inputsQuotation.FDateIniFin = new Date(res.GenericResponse.EXPIRACION_ASEGURADOS);
                            } // FIN ENDOSO TECNICA JTV 02022023

                            this.inputsQuotation.P_NIDPLAN = res.GenericResponse.NIDPLAN; // ENDOSO TECNICA JTV 24012023

                            if (this.nTransac != 8) { // ENDOSO TECNICA JTV 19052023
                                this.quotationService.getProcessCode(numeroCotizacion).subscribe(
                                    res => {
                                        this.nidProc = res;

                                        myFormData.append('dataFile', null);

                                        let data: any = {}
                                        data.codUsuario = JSON.parse(localStorage.getItem('currentUser'))['id']
                                        data.fechaEfecto = this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION || this.nTransac == 8 ? CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg) : this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion) : this.inputsQuotation.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateIni.getFullYear()
                                        data.comision = this.inputsQuotation.P_COMISION
                                        data.tipoRenovacion = this.inputsQuotation.tipoRenovacion
                                        data.freqPago = this.inputsQuotation.frecuenciaPago
                                        data.codProducto = this.vidaLeyID.id;
                                        data.nbranch = this.vidaLeyID.nbranch;
                                        data.flagCot = this.variable.var_flagCotN;
                                        data.codActividad = this.inputsQuotation.P_NTECHNICAL;
                                        data.flagComisionPro = this.comPropuesta ? '1' : '0';
                                        data.comisionPro = this.inputsQuotation.P_COMISION_PRO == undefined ? '' : this.inputsQuotation.P_COMISION_PRO;
                                        data.codProceso = this.nidProc;
                                        data.flagPolizaEmision = null;
                                        data.tasaObreroPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[0];
                                        data.tasaEmpleadoPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[1];
                                        data.nroCotizacion = this.nrocotizacion;
                                        data.type_mov = this.nTransac; // this.typeTran == 'Inclusión' ? "2" : this.typeTran == "Renovación" || this.typeTran == "Declaración" ? "4" : "1";
                                        data.fechaExpiracion = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg); //rq mejoras de endoso
                                        data.TYPE_ENDOSO = this.inputsQuotation.P_NTYPE_END == '' ? 0 : this.inputsQuotation.P_NTYPE_END; //rq mejoras de endoso

                                        if ([1, 3].includes(data.TYPE_ENDOSO)) { // INI ENDOSO TECNICA JTV 02022023
                                            this.disabledEndosoFechaAseg = true;
                                        }
                                        else if ([2].includes(data.TYPE_ENDOSO)) {
                                            this.disabledEndosoFechaAseg = false;
                                        } // FIN ENDOSO TECNICA JTV 02022023

                                        //Exclusion
                                        data.nroPoliza = Number(this.codProducto) === 3 ? this.nroPoliza : '';
                                        data.fechaExpiracion = Number(this.codProducto) === 3 ? CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg) : '';
                                        data.excludeType = Number(this.codProducto) === 3 ? this.inputsQuotation.primaCobrada === true ? '1' : '0' : '';

                                        myFormData.append('objValida', JSON.stringify(data));

                                        this.quotationService.valTrama(myFormData).subscribe(
                                            res => {
                                                this.isLoading = false;
                                                this.erroresList = res.errorList;

                                                if (res.P_COD_ERR == '1') {
                                                    swal.fire('Información', res.P_MESSAGE, 'error');
                                                }
                                                else {
                                                    if (this.erroresList != null) {
                                                        if (this.erroresList.length > 0) {
                                                            let modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                                                            modalRef.componentInstance.formModalReference = modalRef;
                                                            modalRef.componentInstance.erroresList = this.erroresList;
                                                        } else {
                                                            this.categoryList = res.categoryList;
                                                            this.rateByPlanList = res.rateByPlanList;
                                                            this.detailPlanList = res.detailPlanList;
                                                            this.amountPremiumList = res.amountPremiumList;
                                                            this.amountDetailTotalList = res.amountDetailTotalList;
                                                            this.categoryList.forEach(element => {
                                                                element.sactive = true;
                                                                var total = this.categoryList.reduce(function (prev, sum) {
                                                                    return prev + sum.NCOUNT;
                                                                }, 0);
                                                                if (this.inputsQuotation.tipoRenovacion == 1 && total < 5)
                                                                    this.variable.var_primaMinimaPension = 'PRIMA MÍNIMA ANUAL';
                                                                else
                                                                    this.variable.var_primaMinimaPension = 'PRIMA MÍNIMA MENSUAL';
                                                            });

                                                            this.rateByPlanList.forEach(element => {
                                                                if (element.NTASA != 0)
                                                                    this.btnCotiza = false;
                                                                else
                                                                    this.btnCotiza = true;
                                                                element.sactive = true;
                                                            });

                                                            this.detailPlanList.forEach(element => {
                                                                this.inputsQuotation.P_PRIMA_MIN_PENSION = element.PRIMA_MINIMA;
                                                                this.inputsQuotation.desTipoPlan = element.DET_PLAN;
                                                                this.inputsQuotation.desTipoPlanPM = element.DET_PLAN; // VL-  Poliza Matriz
                                                                this.planPropuesto = element.DET_PLAN; //marcos silverio
                                                            });

                                                            //--INI-VL-MSR-
                                                            this.inputsQuotation.desTipoPlan = this.descPlanBD.toUpperCase();
                                                            this.planPropuesto = this.descPlanBD.toUpperCase() as '';
                                                            //--END-VL-MSR-
                                                            this.inputsQuotation.desTipoPlanPM = this.descPlanBD.toUpperCase();  // VL-  Poliza Matriz

                                                            this.amountPremiumList.forEach(element => {
                                                                element.sactive = true;
                                                            });

                                                            //if ( this.categoryList.length == 0 ) {
                                                            if ((this.categoryList.length == 0 && this.nTransac != 8) || (this.categoryList.length == 0 && this.inputsQuotation.P_NTYPE_END == '2')) { //ENDOSO TECNICA JTV 02022023
                                                                swal.fire('Información', 'No se ha encontrado registros en la trama cargada', 'error');
                                                            }
                                                        }
                                                    } else {
                                                        swal.fire('Información', 'El archivo enviado contiene errores', 'error');
                                                    }
                                                }
                                            },
                                            err => {
                                                this.isLoading = false;
                                            }
                                        );

                                    }
                                );
                            } else { // INI ENDOSO TECNICA JTV 19052023
                                this.isLoading = false;
                            } // FIN ENDOSOS TECNICA JTV 19052023
                        }
                    })
            }
        }

        if (this.codProducto == 3 && (this.typeTran != CommonMethods.TIPO_TRANSACCION.INCLUSION && this.typeTran != CommonMethods.TIPO_TRANSACCION.DECLARACION && this.typeTran != CommonMethods.TIPO_TRANSACCION.ENDOSO)) { // ENDOSO TECNICA JTV 02022023
            this.inputsQuotation.FDateIniMin = undefined;
            this.inputsQuotation.FDateIniFin = undefined;
        }

        CommonMethods.clearBack();
        this.FechaEfectoInicial = this.inputsQuotation.FDateIni;
        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION) {
            this.disTasaProp = true;
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

    //R.P.
    async getDepartamento() {
        await this.clientInformationService.GetBrkDepartamento(this.inputsQuotation.NBRANCH, 1).toPromise().then(
            res => {
                this.BrokerDep = res;
            },
            err => {
            }
        );
    }

    async getBrokerObl() {
        await this.clientInformationService.GetBrkObl(this.inputsQuotation.NBRANCH).toPromise().then(
            res => {
                this.BrokerObl = res;
            },
            err => {
            }
        );
    }
    //R.P.


    onProposed() {
        this.stateComision = !this.stateComision;
        if (this.stateComision) {
            this.categoryList = [];
            this.rateByPlanList = [];
        }
        else {
            this.inputsQuotation.P_COMISION_PRO = null;
            this.inputsQuotation.rateObrProposed = null;
            this.inputsQuotation.rateEmpProposed = null;
            this.inputsValidate[20] = false;
            this.inputsValidate[21] = false;
            this.inputsValidate[22] = false;
        }
    }

    async habilitarFechas() {
        await this.obtenerFrecuenciaPago(this.inputsQuotation.tipoRenovacion)
        await this.validarTipoRenovacion(null)

        if (this.template.ins_mapfre) {
            this.reloadTariff = false;
            this.equivalentMuni();
        }

        this.categoryList = [];
        this.rateByPlanList = [];
        this.inputsQuotation.P_COMISION = '';
    }
    async ValidarFrecPago(event: any) {
        // REQ004
        if (this.codProducto == 3) {
            const fechadesde = this.desde.nativeElement.value.split('/');
            const fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
            const fechad = new Date(fechaDes);

            const res: any = await this.GetFechaFin(CommonMethods.formatDate(fechad), this.inputsQuotation.frecuenciaPago);
            this.inputsQuotation.FDateFinAseg = new Date(res.FechaExp);

            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionAnual) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima anual';
            } else {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
            }
            /*
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionMensual) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
                fechad.setMonth(fechad.getMonth() + 1);
                fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionBiMensual) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
                fechad.setMonth(fechad.getMonth() + 2);
                fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
      
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionTriMensual) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
                fechad.setMonth(fechad.getMonth() + 3);
                fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
      
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionSemestral) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
                fechad.setMonth(fechad.getMonth() + 6);
                fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
      
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionAnual) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima anual';
                fechad.setFullYear(fechad.getFullYear() + 1);
                fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
            */
            if (this.inputsQuotation.frecuenciaPago == this.variable.var_renovacionEspecial) {
                this.inputsQuotation.primaMinimaPension = 'Prima mínima mensual';
                fechad.setDate(fechad.getDate() + 1);
                fechad.setMonth(fechad.getMonth() + 1);
                this.inputsQuotation.FDateFinAseg = new Date(fechad);
            }
            if (this.flagPolizaMat) {
                this.changeFPMontoSinIGV();
            }
            this.categoryList = [];
            this.rateByPlanList = [];
        }
    }

    async getDataConfig() {
        let configDias = ['DIASRETRO_EMISION', 'DIASADD_EMISION']

        for (var config of configDias) {
            let dias = await this.diasConfigurados(config)
            this.dayRetroConfig = config == configDias[0] ? dias : this.dayRetroConfig
            this.dayConfig = config == configDias[1] ? dias : this.dayConfig
        }
    }

    async diasConfigurados(config) {
        let response = 0
        await this.policyemit.getDataConfig(config).toPromise().then(
            res => {
                response = res[0] != undefined ? Number(res[0].SDATA) : 0
            },
            err => {
                response = 0
            }
        );
        return response
    }

    async validarTipoRenovacion(event: any) {
        if (this.template.ins_mapfre) {
            this.equivalentMuni();
        }
        if (this.template.ins_iniVigenciaAseg && this.codProducto == 3) {
            this.inputsQuotation.FDateIniAseg = this.inputsQuotation.FDateIni;
        };

        var fechadesde = this.desde.nativeElement.value.split('/');
        var fechahasta = this.hasta.nativeElement.value.split('/');
        var fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
        var fechaHas = (fechahasta[1]) + '/' + fechahasta[0] + '/' + fechahasta[2];
        let fechad = new Date(fechaDes);
        let fechah = new Date(fechaHas);

        if (this.inputsQuotation.tipoRenovacion != "") {
            const res: any = await this.GetFechaFin(CommonMethods.formatDate(fechad), this.inputsQuotation.tipoRenovacion);
            this.inputsQuotation.FDateFin = new Date(res.FechaExp);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
        }
        /*
        if (this.inputsQuotation.tipoRenovacion == this.variable.var_renovacionMensual) {
            fechad.setMonth(fechad.getMonth() + 1);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.inputsQuotation.FDateFin = new Date(fechad);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
    
        }
        if (this.inputsQuotation.tipoRenovacion == this.variable.var_renovacionBiMensual) {
            fechad.setMonth(fechad.getMonth() + 2);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.inputsQuotation.FDateFin = new Date(fechad);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
    
        }
        if (this.inputsQuotation.tipoRenovacion == this.variable.var_renovacionTriMensual) {
            fechad.setMonth(fechad.getMonth() + 3);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.inputsQuotation.FDateFin = new Date(fechad);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
        }
    
        if (this.inputsQuotation.tipoRenovacion == this.variable.var_renovacionSemestral) {
            fechad.setMonth(fechad.getMonth() + 6);
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.inputsQuotation.FDateFin = new Date(fechad);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
        }
    
        if (this.inputsQuotation.tipoRenovacion == this.variable.var_renovacionAnual) {
            fechad.setFullYear(fechad.getFullYear() + 1)
            fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
            this.inputsQuotation.FDateFin = new Date(fechad);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
        }
        */

        if (this.inputsQuotation.tipoRenovacion == this.variable.var_renovacionEspecial) {
            fechad.setDate(fechad.getDate() + 1);
            this.bsValueFinMin = new Date(fechad);
            fechad.setMonth(fechad.getMonth() + 1);
            this.inputsQuotation.FDateFin = new Date(fechad);
            if (this.inputsQuotation.FDateFinAseg) {
                this.ValidarFrecPago(null);
            }
        }
    }

    async obtenerTipoRenovacion() {
        const requestTypeRen: any = {}
        requestTypeRen.P_NEPS = this.epsItem.STYPE;
        requestTypeRen.P_NPRODUCT = this.codProducto;
        requestTypeRen.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        if (this.cotizacionID == '0' || this.cotizacionID == '') { // INI POLIZAS ESPECIALES RI JTV 11102022
            requestTypeRen.P_ENABLED = 1;
        }
        else {
            requestTypeRen.P_ENABLED = 0;
        } // FIN POLIZAS ESPECIALES RI JTV 11102022

        await this.policyemit.getTipoRenovacion(requestTypeRen).toPromise().then(
            async (res: any) => {
                this.tipoRenovacion = res;
            })
    }

    async obtenerFrecuenciaPago(tipoRenovacion) {
        this.tipoEspecial = tipoRenovacion == 6 || tipoRenovacion == 7 ? true : false;
        await this.policyemit.getFrecuenciaPago(tipoRenovacion).toPromise().then(
            res => {
                this.inputsQuotation.frecuenciaPago = this.inputsQuotation.tipoRenovacion;
                this.frecuenciaPago = res;
                if (this.frecuenciaPago != null && this.frecuenciaPago.length == 1) {
                    this.inputsQuotation.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA;
                }
            })
    }

    async getComisionList(nrocotizacion: any) {
        await this.quotationService.getComisionList(nrocotizacion).subscribe(
            res => {
                this.comisionList = res;
                if (this.codProducto == 3) { //AVS - PRY COMISIONES 07/07/2023
                    this.comisionList.sort((a, b) => a.porcentaje - b.porcentaje);
                    const ventaDirectaIndex = this.comisionList.findIndex(item => item.idComision === 0);
                    if (ventaDirectaIndex !== -1) {
                        const ventaDirecta = this.comisionList.splice(ventaDirectaIndex, 1)[0];
                        this.comisionList.push(ventaDirecta);
                    }
                }
            }
        );
    }

    async onSelectComision(value: any) { //AVS - Comisiones 31/05/2023
        this.inputsQuotation.P_COMISION = value.idComision; // TASA X COMISION (JRIOS)
        //this.brokerList[0].P_COM_SALUD = value.porcentaje; // TASA X COMISION (JRIOS)
        this.categoryList = [];
        this.rateByPlanList = [];
        if (this.codProducto == 3) {
            const selectedComision = [];
            for (let i = 0; i < this.comisionList.length; i++) {
                //if (this.comisionList[i].idComision == value) {
                if (this.comisionList[i].idComision == value.idComision && this.comisionList[i].porcentaje == value.porcentaje) { // TASA X COMISION (JRIOS)
                    selectedComision.push(this.comisionList[i]);
                }
            }
            if (selectedComision.length > 0) {
                if (this.flagBrokerDirecto != 1 && this.brokerList[0].COD_CANAL != 2015000002 && this.brokerList[0].CANAL != 2015000002 && this.brokerList[0].COD_CANAL != '2015000002' && this.brokerList[0].CANAL != '2015000002') {
                    /*if (Number(this.brokerList[0].NTIP_NCOMISSION) == selectedComision[0].idComision) {
                        this.brokerList[0].P_COM_SALUD = Number(this.brokerList_PRI[0].COMISION_SALUD_AUT.trim());
                    } else {
                        this.brokerList[0].P_COM_SALUD = selectedComision[0].porcentaje;
                    }*/
                    this.brokerList[0].P_COM_SALUD = selectedComision[0].porcentaje; // TASA X COMISION (JRIOS)
                } else {
                    this.brokerList[0].P_COM_SALUD = 0;
                    this.inputsQuotation.P_COMISION = 7;
                }
            }
        }
    }


    async equivalenciaMapfre(codProtecta: any, keyTable: any, keyStore: any, required: any = 1) {
        let response: any = {}
        let data: any = {}
        data.codProtecta = codProtecta
        data.keyTable = keyTable
        data.keyStore = keyStore

        await this.quotationService.getEquivalente(data).toPromise().then(res => {
            response = res
            if (res.codError == '0') {
                this.mensajeEquivalente = ''
            } else {
                if (required == 1) {
                    this.mensajeEquivalente = this.mensajeEquivalente + '<br>' + res.mensaje;
                }
            }
        });
        return response.codMapfre
    }

    brokerIni() {
        // Datos del comercializador
        const brokerMain: any = {}
        brokerMain.NTYPECHANNEL = JSON.parse(localStorage.getItem('currentUser'))['tipoCanal'];
        brokerMain.COD_CANAL = JSON.parse(localStorage.getItem('currentUser'))['canal'];
        brokerMain.NCORREDOR = JSON.parse(localStorage.getItem('currentUser'))['brokerId'];
        brokerMain.NTIPDOC = JSON.parse(localStorage.getItem('currentUser'))['sclient'].substr(1, 1);
        brokerMain.NNUMDOC = JSON.parse(localStorage.getItem('currentUser'))['sclient'].substr(3);
        brokerMain.RAZON_SOCIAL = JSON.parse(localStorage.getItem('currentUser'))['desCanal'];
        brokerMain.PROFILE = this.codProfile;
        brokerMain.SCLIENT = JSON.parse(localStorage.getItem('currentUser'))['sclient'];
        brokerMain.P_NPRINCIPAL = 0;
        brokerMain.P_COM_SALUD = 0;
        brokerMain.P_COM_SALUD_PRO = 0;
        brokerMain.P_COM_PENSION = 0;
        brokerMain.P_COM_PENSION_PRO = 0;
        brokerMain.valItemPen = false;
        brokerMain.valItemSal = false;
        if (brokerMain.PROFILE == this.perfil) {
            brokerMain.BLOCK = 1;
        } else {
            brokerMain.BLOCK = 0;
        }
        if (brokerMain.PROFILE == 32 && this.brokerList.length == 0) {
            this.brokerList.push(brokerMain);
        }
        else if (brokerMain.PROFILE != 32) {
            this.brokerList.push(brokerMain);
        }

        if (this.brokerList.length > 0) {
            this.validacionBroker();
        }
    }


    async brokerRec() {
        /*this.brokerList = [];
        await this.policyemit.getPolicyEmitComer(this.nrocotizacion)
          .toPromise().then(async res => {
            if (res != null && res.length > 0) {
              this.brokerList = res;
            }
          });*/
        this.brokerList = [];
        await this.policyemit.getPolicyEmitComer(this.nrocotizacion)
            .toPromise().then(async res => {
                if (res != null && res.length > 0) {
                    res.forEach(element => {
                        const brokerMain: any = {}
                        brokerMain.NTYPECHANNEL = element.TIPO_CANAL;
                        brokerMain.COD_CANAL = element.CANAL;
                        //brokerMain.NCORREDOR = JSON.parse(localStorage.getItem('currentUser'))['brokerId'];
                        brokerMain.NCORREDOR = ''; //AVS - Comisiones 14/06/2023
                        brokerMain.NTIPDOC = element.TYPE_DOC_COMER;
                        brokerMain.NNUMDOC = element.DOC_COMER;
                        brokerMain.RAZON_SOCIAL = element.COMERCIALIZADOR;
                        brokerMain.PROFILE = this.codProfile;
                        brokerMain.SCLIENT = element.SCLIENT;
                        brokerMain.P_NPRINCIPAL = 0;
                        brokerMain.P_COM_SALUD = Number(element.COMISION_SALUD_AUT.trim());
                        brokerMain.P_COM_SALUD_PRO = 0;
                        brokerMain.P_COM_PENSION = 0;
                        brokerMain.P_COM_PENSION_PRO = 0;
                        brokerMain.valItemPen = false;
                        brokerMain.valItemSal = false;
                        if (brokerMain.PROFILE == this.perfil) {
                            brokerMain.BLOCK = 1;
                        } else {
                            brokerMain.BLOCK = 0;
                        }
                        brokerMain.NTIP_NCOMISSION = element.NTIP_NCOMISSION;

                        this.brokerList.push(brokerMain);
                        this.brokerList_PRI = [Object.assign({}, res[0])]; //AVS - Comisiones 15/06/2023

                        this.inputsQuotation.P_COMISION = element.NTIP_NCOMISSION;

                        this.ComisionObjeto = this.comisionList.find(x => x.idComision == this.inputsQuotation.P_COMISION && x.porcentaje == brokerMain.P_COM_SALUD); // TASA X COMISION JRIOS
                    });
                }
            });
    }

    async getIGVData() {
        let data = ['I', 'D']
        // Pension
        for (var item of data) {
            let itemIGV: any = {};
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
        for (var item of data) {
            let itemIGV: any = {};
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
        let itemIGV: any = {};
        itemIGV.P_NBRANCH = this.vidaLeyID.nbranch;
        itemIGV.P_NPRODUCT = this.vidaLeyID.id;
        itemIGV.P_TIPO_REC = 'A';

        await this.quotationService.getIGV(itemIGV).toPromise().then(
            res => {
                this.igvVidaLeyWS = res
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

    async getProductList() {
        await this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.inputsQuotation.NBRANCH).toPromise().then(
            res => {
                this.productList = res;
                if (this.productList.length == 1) {
                    this.inputsQuotation.P_NPRODUCT = this.productList[0].COD_PRODUCT;
                } else {
                    this.inputsQuotation.P_NPRODUCT = '-1';
                }
            },
            err => { }
        );
    }

    async getDocumentTypeList() {
        await this.clientInformationService.getDocumentTypeList(this.codProducto).toPromise().then(
            res => {
                this.documentTypeList = res;
            },
            err => {
            }
        );
    }

    async getCurrencyList() {
        await this.clientInformationService.getCurrencyList().toPromise().then(
            res => {
                this.currencyList = res;
            },
            err => {
            }
        );
    }

    async getPlanList() {
        const data = {
            P_NBRANCH: this.vidaLeyID.nbranch,
            P_NPRODUCT: this.vidaLeyID.id,
            P_NTIP_RENOV: 0,
            P_NCURRENCY: this.inputsQuotation.P_NCURRENCY == null ? 1 : this.inputsQuotation.P_NCURRENCY,
            P_NIDPLAN: 0
        }

        await this.quotationService.getPlans(data).toPromise().then(
            res => {
                this.planList = res;
                this.inputsQuotation.desTipoPlanPM = this.planList[0].SDESCRIPT.toUpperCase(); // VL - Poliza Matriz
            },
            err => {
            }
        );
    }

    async getEconomicActivityList(acTecnica) {
        await this.clientInformationService.getEconomicActivityList(acTecnica).toPromise().then(
            res => {
                this.economicActivityList = res;
            },
            err => {
            }
        );
    }

    async getDepartmentList(itemDireccion) {
        if (itemDireccion != null) {
            await this.addressService.getDepartmentList().toPromise().then(
                res => {
                    if (itemDireccion.P_NPROVINCE != null) {
                        itemDireccion.P_NPROVINCE = Number(itemDireccion.P_NPROVINCE);
                    } else {
                        res.forEach(element => {
                            if (element.Name == itemDireccion.P_DESDEPARTAMENTO) {
                                itemDireccion.P_NPROVINCE = element.Id;
                            }
                        });
                    }
                },
                err => { }
            );
        } else {
            await this.addressService.getDepartmentList().toPromise().then(
                res => {
                    this.departmentList = res;
                },
                err => {
                }
            );
        }
    }

    async getProvinceList(itemDireccion) {
        if (itemDireccion != null) {
            if (itemDireccion.P_NPROVINCE != null && itemDireccion.P_NPROVINCE != '') {
                return await this.addressService.getProvinceList(itemDireccion.P_NPROVINCE).toPromise().then(
                    res => {
                        if (itemDireccion.P_NLOCAL != null) {
                            itemDireccion.P_NLOCAL = Number(itemDireccion.P_NLOCAL);
                        } else {
                            res.forEach(element => {
                                if (itemDireccion.P_DESPROVINCIA.search('CALLAO') !== -1) {
                                    itemDireccion.P_NLOCAL = element.Id;
                                } else {
                                    if (element.Name == itemDireccion.P_DESPROVINCIA) {
                                        itemDireccion.P_NLOCAL = element.Id;
                                    }
                                }
                            });
                        }
                    },
                    err => { }
                );
            } else {
                return itemDireccion.P_NLOCAL = null;
            }
        } else {
            const province = this.inputsQuotation.P_NPROVINCE == null ? '0' : this.inputsQuotation.P_NPROVINCE;
            return await this.addressService.getProvinceList(province).toPromise().then(
                res => {
                    this.provinceList = res;
                },
                err => {
                }
            );
        }
    }

    async getDistrictList(itemDireccion) {
        if (itemDireccion != null) {
            if (itemDireccion.P_NLOCAL != null && itemDireccion.P_NLOCAL != '') {
                return await this.addressService.getDistrictList(itemDireccion.P_NLOCAL).toPromise().then(
                    res => {
                        if (itemDireccion != null) {
                            if (itemDireccion.P_NMUNICIPALITY != null) {
                                itemDireccion.P_NMUNICIPALITY = Number(itemDireccion.P_NMUNICIPALITY);
                            } else {
                                res.forEach(element => {
                                    if (element.Name == itemDireccion.P_DESDISTRITO) {
                                        itemDireccion.P_NMUNICIPALITY = element.Id;
                                    }
                                });
                            }
                        }
                    },
                    err => { }
                );
            } else {
                return itemDireccion.P_NMUNICIPALITY = null
            }
        } else {
            let local = this.inputsQuotation.P_NLOCAL == null ? '0' : this.inputsQuotation.P_NLOCAL;
            return await this.addressService.getDistrictList(local).toPromise().then(
                res => {
                    this.districtList = res;
                },
                err => {
                }
            );
        }
    }

    resetearPropuesto(resetId) {
        switch (resetId) {
            case 1:
                this.statePrimaSalud = !this.statePrimaSalud;
                this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = '';
                this.resetearPrimas(0, this.saludID.id)
                break;
            case 2:
                this.statePrimaPension = !this.statePrimaPension;
                this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = '';
                this.resetearPrimas(0, this.pensionID.id)
                break;
            case 3:
                this.stateBrokerTasaSalud = !this.stateBrokerTasaSalud;
                this.resetearComisiones(this.saludID.id)
                break;
            case 4:
                this.stateBrokerTasaPension = !this.stateBrokerTasaPension;
                this.resetearComisiones(this.pensionID.id)
                break;
            case 5: //
                this.stateComision = !this.stateComision;
                this.resetearcomisionVidaLey()
        }
    }

    resetearcomisionVidaLey() {
        if (this.stateComision) {
            this.categoryList = [];
            this.rateByPlanList = [];
        }
        else {
            this.inputsQuotation.P_COMISION_PRO = null;
            this.inputsQuotation.rateObrProposed = null;
            this.inputsQuotation.rateEmpProposed = null;
        }

    }

    resetearComisiones(productoId) {
        this.brokerList.forEach(broker => {
            broker.P_COM_SALUD_PRO = productoId == this.saludID.id ? 0 : broker.P_COM_SALUD_PRO
            broker.valItemSal = productoId == this.saludID.id ? false : broker.valItemSal
            broker.P_COM_PENSION_PRO = productoId == this.pensionID.id ? 0 : broker.P_COM_PENSION_PRO
            broker.valItemPen = productoId == this.pensionID.id ? false : broker.valItemPen
        });
    }

    async buscarContratante() {
        const self = this;
        let msg = '';
        this.mensajeEquivalente = '';

        if (this.inputsQuotation.P_TYPE_SEARCH == 1) {
            if (this.inputsQuotation.P_NIDDOC_TYPE == -1) {
                msg += 'Debe ingresar tipo de documento <br />';
            }
            if (this.inputsQuotation.P_SIDDOC.trim() == '') {
                msg += 'Debe ingresar número de documento <br />';
            }
        } else {
            if (this.inputsQuotation.P_PERSON_TYPE == 1) {
                if (this.inputsQuotation.P_SFIRSTNAME.trim() == '') {
                    msg += 'Debe ingresar nombre del contratante <br />';
                }
                if (this.inputsQuotation.P_SLASTNAME.trim() == '') {
                    msg += 'Debe ingresar apellido paterno del contratante <br />';
                }
            } else {
                if (this.inputsQuotation.P_SLEGALNAME.trim() == '') {
                    msg += 'Debe ingresar razón social <br />';
                }
            }
        }

        if (msg != '') {
            swal.fire('Información', msg, 'error');
            return;
        }

        if (this.inputsQuotation.P_NIDDOC_TYPE == 1 && this.inputsQuotation.P_SIDDOC.trim().length > 1) {
            if (CommonMethods.validateRuc(this.inputsQuotation.P_SIDDOC)) {
                swal.fire('Información', 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20', 'error');
                return;
            }
        }

        self.isLoading = true;
        const data: any = {}
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE != '-1' ? this.inputsQuotation.P_NIDDOC_TYPE : '';
        data.P_SIDDOC = this.inputsQuotation.P_SIDDOC.toUpperCase();
        data.P_SFIRSTNAME = this.inputsQuotation.P_SFIRSTNAME != null ? this.inputsQuotation.P_SFIRSTNAME.toUpperCase() : '';
        data.P_SLASTNAME = this.inputsQuotation.P_SLASTNAME != null ? this.inputsQuotation.P_SLASTNAME.toUpperCase() : '';
        data.P_SLASTNAME2 = this.inputsQuotation.P_SLASTNAME2 != null ? this.inputsQuotation.P_SLASTNAME2.toUpperCase() : '';
        data.P_SLEGALNAME = this.inputsQuotation.P_SLEGALNAME != null ? this.inputsQuotation.P_SLEGALNAME.toUpperCase() : '';

        // Mapfre
        if (this.inputsQuotation.P_TYPE_SEARCH == 1 && this.template.ins_mapfre) {
            data.validaMapfre = {};
            data.validaMapfre.cabecera = {};
            data.validaMapfre.cabecera.keyService = 'validarCliente';
            data.validaMapfre.cliente = {};
            data.validaMapfre.cliente.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey')  //
            data.validaMapfre.cliente.codDocum = this.inputsQuotation.P_SIDDOC; //
        }

        if (this.mensajeEquivalente != '') {
            swal.fire('Información', this.mensajeEquivalente, 'error');
            self.isLoading = false;
            return;
        }

        if (this.inputsQuotation.P_TYPE_SEARCH == 1 && this.template.ins_validateLock) {
            const validateLockReq = new ValidateLockRequest();
            if (this.codProducto == 3) {
                validateLockReq.branchCode = this.vidaLeyID.nbranch;
            } else if (this.codProducto == 2) { //AVS Mejoras SCTR
                validateLockReq.branchCode = this.pensionID.nbranch;
            }
            validateLockReq.productCode = this.vidaLeyID.id;
            validateLockReq.documentType = this.inputsQuotation.P_NIDDOC_TYPE;
            validateLockReq.documentNumber = this.inputsQuotation.P_SIDDOC;
            this.validateLockResponse = await this.getValidateLock(validateLockReq);
        }

        if (this.validateLockResponse.lockMark == 1) {
            swal.fire('Información', this.validateLockResponse.observation, 'error');
            self.isLoading = false;
            this.router.navigate(['/extranet/request-status']);
            return;
        }

        await this.clientInformationService.getCliente360(data).toPromise().then(
            async res => {
                this.contratanteId = '';
                if (res.P_NCODE == 0) {
                    if (res.EListClient.length == 0) {
                        this.canTasaVL = true;
                        this.stateQuotation = true;
                        this.activityMain = '';
                        this.subActivity = '';
                        this.economicActivityList = null;
                        if (this.inputsQuotation.P_SIDDOC != '') {
                            this.clearinputsCotizacion();
                            if (this.canAddContractor) {
                                if (this.inputsQuotation.P_NIDDOC_TYPE != '1' && this.inputsQuotation.P_NIDDOC_TYPE != '2') {
                                    await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
                                } else {
                                    swal.fire('Información', this.variable.var_noInformacion360, 'error');
                                }
                            } else {
                                swal.fire('Información', this.variable.var_noInformacion360, 'error');
                            }
                        } else {
                            swal.fire('Información', this.variable.var_noInformacion360, 'error');
                        }

                    } else {
                        if (res.EListClient[0].P_SCLIENT == null) {
                            this.canTasaVL = true;
                            this.stateQuotation = true;
                            this.activityMain = ''
                            this.subActivity = ''

                            if (this.canAddContractor) {
                                if (this.variable.var_isBroker) {
                                    await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, res);
                                } else {
                                    await this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
                                }
                            } else { swal.fire('Información', this.variable.var_noInformacion360, 'error'); }
                        } else {
                            if (res.EListClient.length == 1) {
                                if (res.EListClient[0].P_SIDDOC != null) {
                                    this.EListClient = res.EListClient;
                                    await this.cargarDatosCliente(res);
                                } else {
                                    swal.fire('Información', 'El contratante no cuenta con el nro de documento.', 'error');
                                }
                            } else {
                                this.EListClient = res.EListClient;
                                const modalRef = this.modalService.open(SearchContractingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                                modalRef.componentInstance.formModalReference = modalRef;
                                modalRef.componentInstance.EListClient = this.EListClient;

                                modalRef.result.then(async (ContractorData) => {
                                    if (ContractorData != undefined) {
                                        this.onSelectEconomicActivity(null);
                                        this.contractingdata = ContractorData;
                                        this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
                                        this.inputsQuotation.P_PERSON_TYPE = '2';
                                        this.inputsQuotation.P_SLEGALNAME = '';
                                        this.inputsQuotation.P_SFIRSTNAME = '';
                                        this.inputsQuotation.P_SLASTNAME = '';
                                        this.inputsQuotation.P_SLASTNAME2 = '';
                                        this.inputsQuotation.P_SE_MAIL = '';
                                        if (this.template.ins_sede) {
                                            this.stateQuotation = false;
                                        }
                                        this.blockSearch = true;
                                        this.stateSearch = false;


                                        const data: any = {};
                                        data.P_TipOper = 'CON';
                                        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                                        data.P_NIDDOC_TYPE = ContractorData.P_NIDDOC_TYPE;
                                        data.P_SIDDOC = ContractorData.P_SIDDOC;

                                        // Mapfre
                                        if (this.template.ins_mapfre) {
                                            data.validaMapfre = {};
                                            data.validaMapfre.cabecera = {};
                                            data.validaMapfre.cabecera.keyService = 'validarCliente';
                                            data.validaMapfre.cliente = {};
                                            data.validaMapfre.cliente.tipDocum = await this.equivalenciaMapfre(ContractorData.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey');   //
                                            data.validaMapfre.cliente.codDocum = ContractorData.P_SIDDOC; //
                                        }

                                        this.clientInformationService.getCliente360(data).subscribe(
                                            res => {
                                                if (res.P_NCODE == 0) {
                                                    this.cargarDatosCliente(res);
                                                } else {
                                                    this.inputsQuotation.P_TYPE_SEARCH = '1';
                                                    this.blockDoc = true;
                                                    this.clearinputsCotizacion();
                                                    swal.fire('Información', res.P_SMESSAGE, 'error');
                                                }
                                            },
                                            err => {
                                                this.inputsQuotation.P_TYPE_SEARCH = '1';
                                                this.clearinputsCotizacion();
                                            }
                                        );
                                    }
                                }, (reason) => {
                                });
                            }

                        }
                    }
                } else if (res.P_NCODE == 3) {
                    this.canTasaVL = true;
                    this.stateQuotation = true;
                    this.clearinputsCotizacion();
                    if (this.variable.var_isBroker) {
                        swal.fire('Error', this.errorMessageBroker, 'error');
                        this.creditHistory = null;
                    } else {
                        if (this.canAddContractor) {
                            if (this.inputsQuotation.P_NIDDOC_TYPE != '1' && this.inputsQuotation.P_NIDDOC_TYPE != '2') {
                                this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
                            } else {
                                if (this.codProfile == 32) {
                                    this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
                                } else {
                                    if (this.codProducto == 3) {
                                        this.agregaContratante(this.inputsQuotation.P_NIDDOC_TYPE, this.inputsQuotation.P_SIDDOC, 'quotation', res.P_NCODE, null);
                                    } else {
                                        swal.fire('Información', this.variable.var_noInformacion360, 'error');
                                        this.creditHistory = null;
                                    }
                                }
                            }
                        } else {
                            swal.fire('Información', this.variable.var_noInformacion360, 'error');
                            this.creditHistory = null;
                        }
                    }
                } else {
                    this.inputsQuotation.P_TYPE_SEARCH = '1';
                    this.blockDoc = true;
                    this.clearinputsCotizacion();
                    swal.fire('Información', res.P_SMESSAGE, 'error');
                }

                self.isLoading = false;
            },
            err => {
                this.contratanteId = '';
                self.isLoading = false;
                swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
            }
        );

        if (this.template.ins_validateDebt && this.contratanteId != '') {
            if (this.codProducto == 2) { //AVS Mejoras SCTR Deudas
                this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.contratanteId, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 2 : this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION ? 4 : 1); //Recotizacion
            } else {
                this.validateDebtResponse = await this.getValidateDebt(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.contratanteId, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 2 : this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION ? 4 : 1); //Recotizacion
            }
            if (this.validateDebtResponse.lockMark != 0) {
                if (Number(this.perfilActual) == Number(this.perfil)) {
                    if (this.codProducto == 2) {
                        await this.generateAccountStatusExterno(this.pensionID.nbranch, this.pensionID.id, this.contratanteId, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                            self.isLoading = false;
                        });
                    } else {
                        await this.generateAccountStatusExterno(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.contratanteId, this.variable.var_accountStatusCode, this.validateDebtResponse.external).then(() => {
                            self.isLoading = false;
                        });
                    }
                } else {
                    if (this.codProducto == 2) { // AVS Mejoras SCTR
                        await this.generateAccountStatus(this.pensionID.nbranch, this.pensionID.id, this.contratanteId, this.variable.var_accountStatusCode).then(() => {
                            self.isLoading = false;
                        });
                    } else {
                        await this.generateAccountStatus(this.vidaLeyID.nbranch, this.vidaLeyID.id, this.contratanteId, this.variable.var_accountStatusCode).then(() => {
                            self.isLoading = false;
                        });
                    }
                }
            } else {
                self.isLoading = false;
            }
        }
    }

    async getAddress(): Promise<void> {
        let numdir = 1;
        if (this.inputsContracting.EListAddresClient.length > 0) {
            for (const item of this.inputsContracting.EListAddresClient) {
                item.P_NROW = numdir++;
                item.P_CLASS = '';
                item.P_DESTIDIRE = 'PARTICULAR';
                item.P_SRECTYPE = item.P_SRECTYPE == '' || item.P_SRECTYPE == null ? '2' : item.P_SRECTYPE;
                item.P_STI_DIRE = item.P_STI_DIRE == '' || item.P_STI_DIRE == null ? '88' : item.P_STI_DIRE;
                item.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION == '' || item.P_SNUM_DIRECCION == null ? '0' : item.P_SNUM_DIRECCION;
                item.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO == null ? item.P_SDES_DEP_DOM : item.P_DESDEPARTAMENTO;
                item.P_DESPROVINCIA = item.P_DESPROVINCIA == null ? item.P_SDES_PRO_DOM : item.P_DESPROVINCIA;
                item.P_DESDISTRITO = item.P_DESDISTRITO == null ? item.P_SDES_DIS_DOM : item.P_DESDISTRITO;
                item.P_NCOUNTRY = item.P_NCOUNTRY == null || item.P_NCOUNTRY == '' ? '1' : item.P_NCOUNTRY;
                await this.getDepartmentList(item);
                await this.getProvinceList(item);
                await this.getDistrictList(item);
                item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION == '' ? 'NO ESPECIFICADO' : item.P_SNOM_DIRECCION.replace(/[().]/g, '').replace(/[-]/g, '');
                if (this.inputsContracting.P_NIDDOC_TYPE == 1) {
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDISTRITO.length).trim();
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESPROVINCIA.length).trim();
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ == '' ? item.P_SDESDIREBUSQ : item.P_SDESDIREBUSQ.replace(/[().]/g, '').replace(/[-]/g, '');
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDISTRITO.length).trim();
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESPROVINCIA.length).trim();
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                }
            }
        }
    }

    async agregaContratante(documentType, documentNumber, receiverStr, ncode, response) {
        if (this.variable.var_isBroker) {
            this.inputsContracting = response.EListClient[0];
            this.inputsContracting.EListAddresClient = response.EListClient[0].EListAddresClient;
            this.inputsContracting.EListAddresClient.length > 0 ? await this.getAddress() : this.inputsContracting.EListAddresClient = [];
            this.inputsContracting.EListPhoneClient = [];
            this.inputsContracting.EListEmailClient = [];
            this.inputsContracting.EListContactClient = [];
            this.inputsContracting.EListCIIUClient = [];
            this.inputsContracting.P_CodAplicacion = 'SCTR';
            this.inputsContracting.P_TipOper = 'INS';
            this.inputsContracting.P_NSPECIALITY = '99';
            this.inputsContracting.P_SBLOCKADE = '2';
            this.inputsContracting.P_NTITLE = '99';
            this.inputsContracting.P_NNATIONALITY = '1';
            this.inputsContracting.P_SBLOCKLAFT = '2';
            this.inputsContracting.P_SISCLIENT_IND = '2';
            this.inputsContracting.P_SISRENIEC_IND = '1';
            this.inputsContracting.P_SPOLIZA_ELECT_IND = '2';
            this.inputsContracting.P_SPROTEG_DATOS_IND = '2';
            this.inputsContracting.P_SISCLIENT_GBD = '2';
            this.inputsContracting.P_SISCLIENT_CONTRA = '1';
            this.inputsContracting.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            if (this.inputsContracting.EListAddresClient.length > 0) {
                this.isLoading = true;
                await this.clientInformationService.getCliente360(this.inputsContracting).toPromise().then(
                    async res => {
                        if (res.P_NCODE === '0') {
                            const data: any = {};
                            data.P_TipOper = 'CON';
                            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                            data.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE != '-1' ? this.inputsQuotation.P_NIDDOC_TYPE : '';
                            data.P_SIDDOC = this.inputsQuotation.P_SIDDOC.toUpperCase();
                            data.P_SFIRSTNAME = this.inputsQuotation.P_SFIRSTNAME != null ? this.inputsQuotation.P_SFIRSTNAME.toUpperCase() : '';
                            data.P_SLASTNAME = this.inputsQuotation.P_SLASTNAME != null ? this.inputsQuotation.P_SLASTNAME.toUpperCase() : '';
                            data.P_SLASTNAME2 = this.inputsQuotation.P_SLASTNAME2 != null ? this.inputsQuotation.P_SLASTNAME2.toUpperCase() : '';
                            data.P_SLEGALNAME = this.inputsQuotation.P_SLEGALNAME != null ? this.inputsQuotation.P_SLEGALNAME.toUpperCase() : '';

                            await this.clientInformationService.getCliente360(data).toPromise().then(
                                async res => {
                                    if (res.P_NCODE == 0) {
                                        if (res.EListClient.length == 1) {
                                            await this.cargarDatosCliente(res);
                                        }
                                    }
                                    // this.isLoading = false;
                                }
                            );
                        } else if (res.P_NCODE === '1') {
                            // this.isLoading = false;
                            swal.fire('Información', this.errorMessageBroker, 'error');
                        } else {
                            // this.isLoading = false;
                            swal.fire('Información', this.errorMessageBroker, 'warning');
                        }
                        this.isLoading = false;
                    }
                );
            } else {
                this.isLoading = false;
                swal.fire('Información', this.errorMessageBroker, 'error');
            }

        } else {
            this.isLoading = false;
            swal.fire({
                title: 'Información',
                text: 'El contratante que estás buscando no está registrado ¿Deseas agregarlo?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.router.navigate(['/extranet/add-contracting'], { queryParams: { typeDocument: documentType, document: documentNumber, receiver: receiverStr, code: ncode } });
                }
            });
        }
    }

    async callCliente360() {
        const data: any = {};
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        data.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE;
        data.P_SIDDOC = this.inputsQuotation.P_SIDDOC;
        await this.clientInformationService.getCliente360(data).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {
                    this.contractingdata = res.EListClient[0];
                }
            }
        );

        if (this.template.ins_historialCreditoQuotation) {
            const dataXperian: any = {};
            dataXperian.tipoid = this.inputsQuotation.P_NIDDOC_TYPE == '1' ? '2' : '1';
            dataXperian.id = this.inputsQuotation.P_SIDDOC;
            dataXperian.papellido = this.inputsQuotation.P_SLASTNAME;
            dataXperian.sclient = this.contratanteId;
            dataXperian.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
            await this.clientInformationService.invokeServiceExperia(dataXperian).toPromise().then(
                res => {
                    this.creditHistory = {};
                    this.creditHistory.nflag = res.nflag;
                    this.creditHistory.sdescript = res.sdescript;
                }
            );
        }
    }

    async cargarDatosCliente(res) {
        this.contractingdata = res.EListClient[0];
        this.canTasaVL = this.template.ins_disabledComision;
        this.onSelectEconomicActivity(null);
        this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = '2';
        this.inputsQuotation.P_SLEGALNAME = '';
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
        this.inputsQuotation.P_SE_MAIL = '';
        this.inputsQuotation.P_SISCLIENT_GBD =
            (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
        this.blockSearch = true;
        this.stateSearch = false;

        const inputsQuotationGBD: any = {};
        inputsQuotationGBD.P_SISCLIENT_GBD =
            (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
        localStorage.setItem('inputsquotation', JSON.stringify(inputsQuotationGBD));

        this.contratanteId = this.contractingdata.P_SCLIENT;
        this.inputsQuotation.P_NIDDOC_TYPE = this.contractingdata.P_NIDDOC_TYPE;
        this.inputsQuotation.P_SIDDOC = this.contractingdata.P_SIDDOC;
        this.inputsQuotation.P_NPENDIENTE = res.P_NPENDIENTE;
        if (this.contractingdata.P_NIDDOC_TYPE == 1 && this.contractingdata.P_SIDDOC.length > 1) {
            if (this.contractingdata.P_SIDDOC.substr(0, 2) == '10' || this.contractingdata.P_SIDDOC.substr(0, 2) == '15' || this.contractingdata.P_SIDDOC.substr(0, 2) == '17') {
                this.blockDoc = true;
            } else {
                this.blockDoc = false;
            }
        }
        this.inputsQuotation.P_SFIRSTNAME = this.contractingdata.P_SFIRSTNAME;
        this.inputsQuotation.P_SLEGALNAME = this.contractingdata.P_SLEGALNAME;
        this.inputsQuotation.P_SLASTNAME = this.contractingdata.P_SLASTNAME;
        this.inputsQuotation.P_SLASTNAME2 = this.contractingdata.P_SLASTNAME2;
        if (this.contractingdata.EListAddresClient.length > 0) {
            this.inputsQuotation.P_SDESDIREBUSQ = this.contractingdata.EListAddresClient[0].P_SDESDIREBUSQ;
            if (this.codProducto == 3) {
                this.contractingdata.EListAddresClient = null;
            }
        }
        if (this.contractingdata.EListEmailClient.length > 0) {
            this.inputsQuotation.P_SE_MAIL = this.contractingdata.EListEmailClient[0].P_SE_MAIL;
        }

        if (this.contractingdata.EListContactClient.length == 0 && this.template.ins_addContact) {
            this.flagContact = true;
        }

        if (this.contractingdata.EListEmailClient.length == 0 && this.template.ins_email) {
            this.flagEmail = true;
        }

        if (this.template.ins_sede) {
            this.getContractorLocationList(this.contratanteId);
        }

        // if (this.template.ins_email) {
        //   this.flagEmailNull = this.inputsQuotation.P_SE_MAIL == '' ? false : true;
        // }


        if (this.template.ins_historialCreditoQuotation) {
            const data: any = {};
            data.tipoid = this.inputsQuotation.P_NIDDOC_TYPE == '1' ? '2' : '1';
            data.id = this.inputsQuotation.P_SIDDOC;
            data.papellido = this.inputsQuotation.P_SLASTNAME;
            data.sclient = this.contratanteId;
            data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
            await this.clientInformationService.invokeServiceExperia(data).toPromise().then(
                res => {
                    this.creditHistory = {};
                    this.creditHistory.nflag = res.nflag;
                    this.creditHistory.sdescript = res.sdescript;
                }
            );
        } else {
            this.creditHistory = {};
            this.creditHistory.nflag = 0;
        }
        this.changeBillType();
    }

    async getContractorLocationList(contratanteId: string) {
        await this.contractorLocationIndexService.getContractorLocationList(contratanteId, 999, 1).toPromise().then(
            res => {
                const list: any = [];
                const self = this;

                if (res.GENERICLIST != null) {
                    if (res.GENERICLIST.length > 0) {
                        this.stateQuotation = false;

                        res.GENERICLIST.forEach(sede => {
                            if (sede.State == 'Activo') {
                                list.push(sede);
                                if (sede.Type == self.variable.var_tipoSede) {
                                    self.inputsQuotation.P_NIDSEDE = Number(sede.Id);
                                    self.inputsQuotation.P_NPROVINCE = Number(sede.Departament);
                                    self.inputsQuotation.P_NLOCAL = Number(sede.Province);
                                    self.inputsQuotation.P_NMUNICIPALITY = Number(sede.Municipality);
                                    self.inputsQuotation.P_SSEDE = sede.Description;
                                }
                            }
                        });

                        this.sedesList = list;
                        this.onSelectSede();
                        if (this.productList.length > 1) {
                            this.inputsQuotation.P_NPRODUCT = '-1';
                        }
                    } else {
                        if (this.productList.length > 1) {
                            this.inputsQuotation.P_NPRODUCT = '-1';
                        }
                        this.stateQuotation = true;
                    }
                } else {
                    if (this.productList.length > 1) {
                        this.inputsQuotation.P_NPRODUCT = '-1';
                    }
                    this.stateQuotation = true;
                }
            },
            err => {
            }
        );
    }

    onSelectSede() {
        switch (this.inputsQuotation.P_NIDSEDE) {
            case null:
                this.inputsQuotation.P_NTECHNICAL = null;
                this.inputsQuotation.P_NECONOMIC = null;
                this.inputsQuotation.P_NPROVINCE = null;
                this.inputsQuotation.P_NLOCAL = null;
                this.inputsQuotation.P_NMUNICIPALITY = null;
                break;
            case 0:
                this.inputsValidate[2] = false
                this.inputsQuotation.P_NTECHNICAL = null;
                this.inputsQuotation.P_NECONOMIC = null;
                this.inputsQuotation.P_NPROVINCE = null;
                this.inputsQuotation.P_NLOCAL = null;
                this.inputsQuotation.P_NMUNICIPALITY = null
                this.validarSedes();
                break;
            default:
                this.inputsValidate[2] = false
                this.economicValue(this.inputsQuotation.P_NIDSEDE);
                break;
        }
    }

    onSelectDepartment() {
        this.inputsValidate[4] = false
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
        this.getProvinceList(null);
        this.getDistrictList(null);
    }

    onSelectTypeSearch() {
        this.clearinputsCotizacion();
        switch (this.inputsQuotation.P_TYPE_SEARCH) {
            case '1':
                this.blockSearch = true;
                this.inputsQuotation.P_NIDDOC_TYPE = '-1';
                this.inputsQuotation.P_SIDDOC = '';
                this.inputsQuotation.P_PERSON_TYPE = '2';
                this.stateSearch = false;
                this.blockDoc = true;

                break;

            case '2':
                this.blockSearch = false;
                this.inputsQuotation.P_NIDDOC_TYPE = '-1';
                this.inputsQuotation.P_SIDDOC = '';
                this.inputsQuotation.P_PERSON_TYPE = '2';
                this.stateSearch = true;
                this.blockDoc = false;
                break;

        }
    }

    onSelectProvince() {
        this.inputsValidate[5] = false
        this.inputsQuotation.P_NMUNICIPALITY = null;
        this.getDistrictList(null);
    }

    onSelectDistrict() {
        if (this.inputsQuotation.P_NMUNICIPALITY == null) {
        } else {
            this.inputsValidate[6] = false
            this.equivalentMuni();
        }
    }

    calcularTarifa() {

        let countWorker = 0;
        let countPlanilla = 0;
        let msg = '';

        // No se ingresa ningun valor
        this.tasasList.forEach(item => {
            if (item.totalWorkes == 0) {
                this.inputsValidate[8] = false
                countWorker++
            } else {
                if (item.planilla == 0) {
                    msg += 'Debe ingresar monto de planilla del riesgo ' + item.description + ' <br>'
                }
            }

            if (item.planilla == 0) {
                this.inputsValidate[9] = false
                countPlanilla++;
            } else {
                if (item.totalWorkes == 0) {
                    msg += 'Debe ingresar trabajadores en el riesgo ' + item.description + ' <br>'
                }
            }
        });

        if (msg != '') {
            swal.fire('Información', msg, 'error');
            return;
        } else {
            // Falta algún valor
            if (countPlanilla == this.tasasList.length) {
                msg += 'Debe ingresar un monto de planilla en al menos un riesgo <br>'
            }

            if (countWorker == this.tasasList.length) {
                msg += 'Debe ingresar trabajadores en al menos un riesgo <br>'
            }

            if (msg != '') {
                swal.fire('Información', msg, 'error');
                return;
            } else {
                this.reloadTariff = true
                this.equivalentMuni()
            }
        }
    }

    async equivalentMuni() {
        if (this.template.ins_llamarTarifario) {
            this.listaTasasSalud = []
            this.listaTasasPension = []
            this.mensajePrimaPension = ''
            this.mensajePrimaSalud = ''

            if (this.template.ins_mapfre) {
                if (this.inputsQuotation.tipoRenovacion == '') {
                    return;
                }
            }

            if (this.brokerList.length > 0 && this.inputsQuotation.P_NMUNICIPALITY != null && this.inputsQuotation.P_NTECHNICAL != null) {
                await this.quotationService.equivalentMunicipality(this.inputsQuotation.P_NMUNICIPALITY).toPromise().then(
                    res => {
                        this.municipalityTariff = res;
                        this.getTarifario();
                    }
                );
            } else {
                this.tasasList = []
                this.messageWorker = ''
                this.reloadTariff = false
            }
        }
    }

    async economicValue(sedeID) {
        let self = this;
        this.sedesList.map(function (dato) {
            if (dato.Id == sedeID) {
                self.inputsQuotation.P_NTECHNICAL = dato.IdTechnical;
                self.inputsQuotation.P_NECONOMIC = dato.IdActivity;
                self.inputsQuotation.P_SDELIMITER = dato.Delimiter;
                self.inputsQuotation.P_NPROVINCE = Number(dato.Departament);
                self.inputsQuotation.P_NLOCAL = Number(dato.Province);
                self.inputsQuotation.P_NMUNICIPALITY = Number(dato.Municipality);
                self.inputsQuotation.P_SSEDE = dato.Description
                self.activityMain = dato.Activity;
                self.subActivity = dato.EconomicActivity;
            }
        });

        await this.getEconomicActivityList(this.inputsQuotation.P_NTECHNICAL);
        this.inputsQuotation.P_DELIMITER = this.inputsQuotation.P_SDELIMITER == '0' ? '' : '* La actividad cuenta con delimitación'
        await this.getProvinceList(null);
        await this.getDistrictList(null);
        await this.equivalentMuni();
    }

    validarSedes() {
        this.contractorLocationIndexService.getSuggestedLocationType(this.contratanteId, this.userId).subscribe(
            res => {
                if (res.P_NCODE == 1) {
                    swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
                } else {
                    let location: any = {}//solo para enviar el ID de contratante
                    location.ContractorId = this.contratanteId; //solo para enviar el ID de contratante
                    if (res.P_NCODE == 2) this.openLocationModal(location, false, '2'); //crear sucursal
                    else if (res.P_NCODE == 3) this.openLocationModal(location, false, '1'); //crear principal
                }
            },
            err => {
                swal.fire('Información', err, 'error');
            }
        );
    }

    openLocationModal(contractorLocation: any, openModalInEditMode: boolean, suggestedLocationType: string) {
        const modalRef = this.modalService.open(ContractorLocationFormComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.contractorLocationData = contractorLocation;
        modalRef.componentInstance.openedInEditMode = openModalInEditMode;
        modalRef.componentInstance.suggestedLocationType = suggestedLocationType;
        modalRef.componentInstance.willBeSaved = true;

        modalRef.result.then(async (shouldToUpdateLocationTable) => {
            await this.getContractorLocationList(this.contratanteId);

            await this.equivalentMuni();
            await this.onSelectSede();
            await this.getProvinceList(null);
            await this.getDistrictList(null);
        });
    }

    listToString(inputList: String[]): string {
        let output = '';
        inputList.forEach(function (item) {
            output = output + item + ' <br>'
        });
        return output;
    }

    stringToList(inputString: string): string[] {
        let isFirst: Boolean = true;
        let responseList: string[] = [];
        while (inputString.search('-') != -1) {
            if (isFirst == true) {
                isFirst = false;
                inputString = inputString.substring(inputString.search('-') + 1);
            } else {
                responseList.push(inputString.substring(0, inputString.search('-')));
                inputString = inputString.substring(inputString.search('-') + 1);
            }
        }
        return responseList;
    }

    async onSelectTechnicalActivity(event) {
        this.economicActivityList = null;
        this.inputsQuotation.P_DELIMITER = '';
        this.inputsQuotation.P_NECONOMIC = null
        if (this.inputsQuotation.P_NTECHNICAL != null) {
            this.activityMain = event.Name;
            await this.getEconomicActivityList(this.inputsQuotation.P_NTECHNICAL);
        } else {
            this.activityMain = '';
            this.subActivity = '';
            this.inputsValidate[3] = false
        }
        if (this.codProducto == 3) {
            this.categoryList = [];
            this.rateByPlanList = [];
            this.inputsQuotation.P_COMISION = '';
        }
    }

    onSelectEconomicActivity(event) {
        if (this.inputsQuotation.P_NECONOMIC != null) {
            this.inputsQuotation.P_DELIMITER = this.economicActivityList[0].Delimiter == '0' ? '' : '* La actividad cuenta con delimitación'
            if (event != null) {
                this.subActivity = event.Name;
            }
            this.equivalentMuni();
        } else {
            this.subActivity = '';
            this.inputsQuotation.P_DELIMITER = '';
            this.inputsValidate[3] = false
        }
    }

    clearValidate(numInput) {
        this.inputsValidate[numInput] = false
    }

    selTipoDocumento(tipoDocumento) {
        this.blockDoc = true;
        this.clearinputsCotizacion();
        let response = CommonMethods.selTipoDocumento(tipoDocumento)
        this.maxlength = response.maxlength
        this.minlength = response.minlength
        this.inputsValidate[0] = response.inputsValidate

    }

    onSelectTypePerson(typePersonID) {
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLEGALNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
        this.inputsQuotation.P_SDESDIREBUSQ = '';
        this.inputsQuotation.P_SE_MAIL = '';

        switch (typePersonID) {
            case '1':
                this.blockDoc = true;
                break;
            case '2':
                this.blockDoc = false;
                break;
        }
    }

    seleccionExcel(archivo: File) {
        if (this.typeTran != CommonMethods.TIPO_TRANSACCION.ENDOSO) { // INI ENDOSO TECNICA JTV 18042023
            this.inputsQuotation.P_NREM_EXC = false;
        } // FIN ENDOSO TECNICAJ TV 18042023

        this.excelSubir = null;
        if (!archivo) {
            this.excelSubir = null;
            this.clickValidarExcel = false;
            return;
        }
        this.categoryList = [];
        this.rateByPlanList = [];
        this.excelSubir = archivo;
        this.clickValidarExcel = true;
    }

    validarTopeLey(e) {
        this.flagActivateExc = 0;
        this.clearInputPolMat();

        if (this.flagPolizaMat && e.target.checked) {
            this.flagActivateExc = 1;
            return;
        }
        else if (!this.flagPolizaMat) {
            this.validarExcel(null, 1);
        }
    }

    clearInputPolMat() {
        if (!this.flagPolizaMat) {

            this.countinputEMP_18_36 = 0;
            //this.countinputEMP_56_63 = 0;
            //this.countinputEMP_71_80 = 0;

            this.countinputOBR_18_36 = 0;
            //this.countinputOBR_56_63 = 0;
            //this.countinputOBR_71_80 = 0;

            this.countinputOAR_18_36= 0;
            //this.countinputOAR_56_63= 0;
            //this.countinputOAR_71_80= 0;

            this.planillainputEMP_18_36 = 0;
            //this.planillainputEMP_56_63 = 0;
            //this.planillainputEMP_71_80 = 0;

            this.tasainputEMP_18_36 = 0;
            //this.tasainputEMP_56_63 = 0;
            //this.tasainputEMP_71_80 = 0;
            
            this.MontoSinIGVEMP_18_36 = 0;
            //this.MontoSinIGVEMP_56_63 = 0;
            //this.MontoSinIGVEMP_71_80 = 0;
            
            this.planillainputOBR_18_36 = 0;
            //this.planillainputOBR_56_63 = 0;
            //this.planillainputOBR_71_80 = 0;
            
            this.tasainputOBR_18_36 = 0;
            //this.tasainputOBR_56_63 = 0;
            //this.tasainputOBR_71_80 = 0;
      
            this.MontoSinIGVOBR_18_36 = 0;
            //this.MontoSinIGVOBR_56_63 = 0;
            //this.MontoSinIGVOBR_71_80 = 0;
            
            this.planillainputOAR_18_36 = 0;
            //this.planillainputOAR_56_63 = 0;
            //this.planillainputOAR_71_80 = 0;
            
            this.tasainputOAR_18_36 = 0;
            //this.tasainputOAR_56_63 = 0;
            //this.tasainputOAR_71_80 = 0;
            
            this.MontoSinIGVOAR_18_36 = 0;
            //this.MontoSinIGVOAR_56_63 = 0;
            //this.MontoSinIGVOAR_71_80 = 0;
        }
        if (this.inputsQuotation.P_NREM_EXC == false) {
            this.countinputEE = 0;
            this.planillainputEE = 0;
            this.tasainputEE = 0;
            this.MontoSinIGVEE = 0;
            this.countinputOE = 0;
            this.planillainputOE = 0;
            this.tasainputOE = 0;
            this.MontoSinIGVOE = 0;
            this.countinputOARE = 0;
            this.planillainputOARE = 0;
            this.tasainputOARE = 0;
            this.MontoSinIGVOARE = 0;
        }
        this.changeFPMontoSinIGV();
    }

    validarExcel(codComission, topeLey: number = 0) {
        if (this.codProducto == 3 && (codComission == 99 || codComission == 100)) {
            return;
        }

        let msg = '';

        if (this.template.ins_tipRenovacion) {
            if (this.inputsQuotation.tipoRenovacion == '') {
                msg += 'Debe elegir el tipo de renovación  <br>';
            }
        }

        if (this.template.ins_comision) {
            if (codComission == null) {
                this.btnNormal = true;
                this.isRateProposed = false;
            }

            this.btnCotiza = codComission == 100 ? false : codComission == 99 ? true : this.btnCotiza;
            this.btnNormal = codComission == 99 ? false : codComission == 100 ? true : this.btnNormal;

            if (this.inputsQuotation.P_COMISION == '' && !this.flagGobiernoEstado) {
                msg += 'Seleccione Tarifa  <br>';
            }
        }

        if (this.excelSubir == undefined) {
            if (this.nidProc == '' && !this.flagGobiernoEstado) {
                msg += 'Adjunte una trama para validar  <br>'
            }
        }

        if (msg == '') {
            if (this.inputsQuotation.P_NREM_EXC == 1 && topeLey == 1) {
                this.toastr.info("Se activó el control \"Sin tope de ley\", el sistema considerará el excedente", 'Informacion', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
            } else if (this.nTransac != 8) { // ENDOSO TECNICA JTV 18042023
                this.inputsQuotation.P_NREM_EXC = 0;
                //if(!this.flagGobiernoEstado)
                this.flagExc = false;
            }

            // Comentado porque ya no irá validacion
            // if (this.typeTran == 'Inclusión')
            // {
            //   var dateToday = new Date(this.polCabDate.DEFFECDATE);
            //   var fechaEfecto = new Date(this.inputsQuotation.FDateIniAseg);

            //   if (fechaEfecto.getTime() < dateToday.getTime())
            //   {
            //     this.toastr.info("La fecha seleccionada debe ser mayor a la fecha de la última transacción", 'Informacion', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
            //     return;
            //   }
            // }
            if (this.inputsQuotation.P_NREM_EXC)
                this.flagActivateExc = 1;
            else
                this.flagActivateExc = 0;

            if (!this.flagGobiernoEstado) {
                this.validarTrama(codComission);
            }
        } else {
            if (codComission == null || codComission == '-1') {
                swal.fire('Información', msg, 'error');
            }
        }
    };

    validarTrama(codComission?: any) {
        this.errorExcel = false;
        this.isLoading = true;
        const myFormData: FormData = new FormData();
        myFormData.append('dataFile', this.isRateProposed ? null : this.excelSubir);
        const data: any = {};
        data.codUsuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
        //data.fechaEfecto = this.typeTran == 'Inclusión' ? CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg) : this.typeTran == 'Exclusión' ? CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion) : this.typeTran == 'Endoso' ? CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg) : this.inputsQuotation.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateIni.getFullYear();
        switch (this.typeTran) {
            case CommonMethods.TIPO_TRANSACCION.INCLUSION:
            case CommonMethods.TIPO_TRANSACCION.ENDOSO:
                data.fechaEfecto = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg)
                break;
            case CommonMethods.TIPO_TRANSACCION.EXCLUSION:
                data.fechaEfecto = CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion)
            default:
                data.fechaEfecto = this.inputsQuotation.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateIni.getFullYear();
        }
        data.fechaFin = this.inputsQuotation.FDateFin.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateFin.getFullYear();
        //data.comision = this.inputsQuotation.P_COMISION;
        data.comision = this.ComisionObjeto.idComision; // JRIOS TASA X COMISION
        data.comision_porcentaje = this.ComisionObjeto.porcentaje; // JRIOS TASA X COMISION
        data.tipoRenovacion = this.inputsQuotation.tipoRenovacion;
        data.freqPago = this.inputsQuotation.frecuenciaPago;
        data.codProducto = this.inputsQuotation.P_NPRODUCT;
        data.flagCot = codComission == null ? this.variable.var_flagCotN : codComission == 99 ? this.variable.var_flagCotF : this.variable.var_flagCotN;
        data.codActividad = this.inputsQuotation.P_NTECHNICAL;
        data.flagComisionPro = this.comPropuesta ? '1' : '0';
        data.planesList = this.template.ins_planesList ? this.tasaVL : null; // AP
        data.comisionPro = 0;
        data.codProceso = this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? this.nidProc : this.isRateProposed ? this.nidProc : '';
        data.flagPolizaEmision = this.isRateProposed ? 1 : null;
        data.codRamo = this.inputsQuotation.NBRANCH;
        /*if (this.categoryList.length > 1) {
            data.tasaObreroPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[0] === undefined ? '' : this.arrayRateProposed[0]
            data.tasaEmpleadoPro = this.arrayRateProposed.length < 1 ? '' : this.arrayRateProposed[1] === undefined ? '' : this.arrayRateProposed[1]
        } else if (this.categoryList.length == 1) {
            if (this.categoryList[0].ModuleCode == 1) {
                data.tasaObreroPro = ''
        data.tasaEmpleadoPro = this.arrayRateProposed[0] === undefined ? '' : this.arrayRateProposed[0];
      } else if (this.categoryList[0].ModuleCode == 2) {
        data.tasaObreroPro = this.arrayRateProposed[0] === undefined ? '' : this.arrayRateProposed[0];
        data.tasaEmpleadoPro = '';
            }
        } else {
            data.tasaObreroPro = ''
            data.tasaEmpleadoPro = ''
        }*/ //cotizacion
        data.categoryList = this.categoryList; //cotizacion
        data.remExc = this.inputsQuotation.P_NREM_EXC == true ? 1 : 0; //rq Exc EH

        data.type_mov = this.nTransac; // this.typeTran == 'Inclusión' ? "2" : this.typeTran == 'Endoso' ? "8" : this.typeTran == "Renovación" || this.typeTran == "Declaración" ? "4" : "1";
        data.nroCotizacion = this.nrocotizacion;
        data.fechaExpiracion = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
        data.TYPE_ENDOSO = this.inputsQuotation.P_NTYPE_END == '' ? 0 : this.inputsQuotation.P_NTYPE_END;
        data.NCURRENCY = this.inputsQuotation.P_NCURRENCY;

        //Exclusion
        data.nroPoliza = Number(this.codProducto) === 3 ? this.nroPoliza : '';
        data.fechaExpiracion = Number(this.codProducto) === 3 ? CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg) : '';
        data.excludeType = Number(this.codProducto) === 3 ? this.inputsQuotation.primaCobrada === true ? '1' : '0' : '';
        myFormData.append('objValida', JSON.stringify(data));
        this.quotationService.valTrama(myFormData).subscribe(
            async res => {
                this.isLoading = false;
                this.erroresList = res.baseError.errorList;
                this.changeList = res.baseError.changeList;
                if (res.P_COD_ERR == '1') {
                    swal.fire('Información', res.P_MESSAGE, 'error');
                } else {

                    if (this.erroresList != null) {
                        if (this.erroresList.length > 0) {
                            this.listaTasasPension = [];
                            this.tasasList = [];
                            this.inputsQuotation.P_PRIMA_MIN_PENSION = '';

                            const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                            modalRef.componentInstance.formModalReference = modalRef;
                            modalRef.componentInstance.erroresList = this.erroresList;
                        } else {
                            if (this.changeList.length > 0) {
                                const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                                modalRef.componentInstance.formModalReference = modalRef;
                                modalRef.componentInstance.changeList = this.changeList;
                                await modalRef.result.then((flag) => {
                                    this.flagConfirm = flag;
                                });
                            }
                            this.nidProc = res.NIDPROC;
                            this.categoryList = this.nrocotizacion != undefined && this.nrocotizacion != '' && this.categoryList.length > 0 ? this.categoryList : res.categoryList;
                            this.rateByPlanList = res.rateByPlanList;
                            this.detailPlanList = res.detailPlanList;
                            this.amountPremiumList = res.amountPremiumList;
                            this.amountDetailTotalList = res.amountDetailTotalList;
                            if (this.template.ins_categoriaList) {
                                this.categoryList.forEach(element => {
                                    element.sactive = true;
                                    const total = this.categoryList.reduce(function (prev, sum) {
                                        return prev + sum.NCOUNT;
                                    }, 0);
                                    if (this.inputsQuotation.tipoRenovacion == 1 && this.inputsQuotation.frecuenciaPago == 1)//if (this.inputsQuotation.tipoRenovacion == 1 && total < 5)
                                    {
                                        this.variable.var_primaMinimaPension = 'PRIMA MÍNIMA ANUAL';
                                    } else {
                                        this.variable.var_primaMinimaPension = 'PRIMA MÍNIMA MENSUAL';
                                    }
                                });

                                this.rateByPlanList.forEach(element => {
                                    if (codComission == null) {
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
                                    this.planPropuesto = element.DET_PLAN; //Marcos silverio
                                });

                                this.amountPremiumList.forEach(element => {
                                    element.sactive = true;
                                });

                                //if ( this.categoryList.length == 0 ) {
                                if ((this.categoryList.length == 0 && this.nTransac != 8) || (this.categoryList.length == 0 && this.inputsQuotation.P_NTYPE_END == '2')) { //ENDOSO TECNICA JTV 02022023
                                    swal.fire('Información', 'No se ha encontrado registros en la trama cargada', 'error');
                                } else {
                                    if (codComission == null) {
                                        if (this.nTransac != 8) {
                                            swal.fire('Información', 'Se validó correctamente la trama', 'success');
                                        }
                                        if (this.codProducto == 3 && this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION) {
                                            this.disTasaProp = true;
                                        }
                                    }
                                }

                            }
                            if (codComission == null) {
                                if (this.nTransac != 8) {
                                    swal.fire('Información', 'Se validó correctamente la trama', 'success');
                                }
                            }
                            if (res.P_FLAG_EXC == 1) {
                                if (this.flagExc == false && this.perfilExterno == false) {
                                    this.toastr.info("La trama de asegurados supera la RMA, considerar que se puede activar el control \"Sin tope de ley\", para que el sistema considere el Excedente", 'Informacion', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
                                }

                                // Solo debe permitir habilitar el flag de excedentes en la emisiones y recotizaciones de emision
                                if (this.nTransac == 1) { // INI COMISIONES VL II JTV 10052023
                                    this.flagExc = true;
                                } // FIN COMISIONES VL II JTV 10052023
                            } else {
                                this.flagExc = false;
                            }
                        }
                    } else {
                        swal.fire('Información', 'El archivo enviado contiene errores', 'error');
                    }
                }

            },
            err => {
                this.isLoading = false;
            }
        );
    }

    infoCarga(planillaList: any, codComission?: any) {
        let self = this;

        if (planillaList.length > 0) {
            this.listaTasasPension = []
            this.listaTasasSalud = []

            planillaList.forEach(item => {
                if (item.ID_PRODUCTO == this.vidaLeyID.id) {
                    this.inputsQuotation.P_PRIMA_MIN_PENSION = CommonMethods.formatValor(this.tasaVL[0].primaMinima, 2);
                    this.tasaVL.forEach(tasa => {
                        if (tasa.idTasa == item.TIP_RIESGO && tasa.tasa != '') {
                            item.rate = tasa.tasa;
                            item.rateDet = tasa.tasa;
                        }

                        if (codComission == 99) {
                            if (tasa.idTasa == 3) {
                                item.rate = tasa.tasa == '' ? 1 : tasa.tasa;
                                item.rateDet = tasa.tasa == '' ? 1 : tasa.tasa;
                            }
                        }
                    });

                    item.id = item.TIP_RIESGO;
                    item.planilla = item.MONTO_PLANILLA;
                    item.totalWorkes = item.NUM_TRABAJADORES;
                    item.planProp = '0';
                    item.premiumMonth = CommonMethods.formatValor((Number(item.MONTO_PLANILLA) * Number(item.rate)) / 100, 2);
                    item.premiumMonth2 = CommonMethods.formatValor(item.premiumMonth * 2, 2);
                    item.premiumMonth3 = CommonMethods.formatValor(item.premiumMonth * 3, 2);
                    item.premiumMonth6 = CommonMethods.formatValor(item.premiumMonth * 6, 2);
                    item.premiumYear = CommonMethods.formatValor(item.premiumMonth * 12, 2);
                    item.description = item.DES_RIESGO;
                    this.listaTasasPension.push(item);
                    this.listaTasasSalud.push(item);
                    this.listaTasasPension.map(function (dato) {
                        dato.sactive = true;
                        if (dato.TIP_RIESGO == '3') {
                            dato.sactive = false;
                        }
                    });
                    this.listaTasasSalud.map(function (dato) {
                        dato.sactive = true;
                        if (dato.TIP_RIESGO == '3') {
                            dato.sactive = false;
                        }
                    });

                }
            });

            let sumPen = 0;
            let sumPen2 = 0;
            let sumPen3 = 0;
            let sumPen6 = 0;
            let sumPen12 = 0;

            this.listaTasasPension.forEach(item => {
                if (item.sactive == true) {
                    sumPen = sumPen + Number(item.premiumMonth)
                    sumPen2 = sumPen2 + Number(item.premiumMonth2)
                    sumPen3 = sumPen3 + Number(item.premiumMonth3)
                    sumPen6 = sumPen6 + Number(item.premiumMonth6)
                    sumPen12 = sumPen12 + Number(item.premiumYear)
                }
            });

            this.listaTasasSalud.forEach(item => {
                if (item.sactive == true) {
                    sumPen = sumPen + Number(item.premiumMonth)
                    sumPen2 = sumPen2 + Number(item.premiumMonth2)
                    sumPen3 = sumPen3 + Number(item.premiumMonth3)
                    sumPen6 = sumPen6 + Number(item.premiumMonth6)
                    sumPen12 = sumPen12 + Number(item.premiumYear)
                }
            });

            this.totalNetoPensionSave = Number(sumPen) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen, 2);
            this.totalNetoPensionSave2 = Number(sumPen2) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen2, 2);
            this.totalNetoPensionSave3 = Number(sumPen3) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen3, 2);
            this.totalNetoPensionSave6 = Number(sumPen6) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen6, 2);
            this.totalNetoPensionYear = Number(sumPen12) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen12, 2);
            this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvVidaLeyWS) - this.totalNetoPensionSave, 2);
            this.igvPensionSave2 = CommonMethods.formatValor((this.totalNetoPensionSave2 * this.igvVidaLeyWS) - this.totalNetoPensionSave2, 2);
            this.igvPensionSave3 = CommonMethods.formatValor((this.totalNetoPensionSave3 * this.igvVidaLeyWS) - this.totalNetoPensionSave3, 2);
            this.igvPensionSave6 = CommonMethods.formatValor((this.totalNetoPensionSave6 * this.igvVidaLeyWS) - this.totalNetoPensionSave6, 2);
            this.igvPensionYear = CommonMethods.formatValor((this.totalNetoPensionYear * this.igvVidaLeyWS) - this.totalNetoPensionYear, 2);
            this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.totalNetoPensionSave.toString()) + Number(this.igvPensionSave.toString()), 2);
            this.brutaTotalPensionSave2 = CommonMethods.formatValor(Number(this.totalNetoPensionSave2.toString()) + Number(this.igvPensionSave2.toString()), 2);
            this.brutaTotalPensionSave3 = CommonMethods.formatValor(Number(this.totalNetoPensionSave3.toString()) + Number(this.igvPensionSave3.toString()), 2);
            this.brutaTotalPensionSave6 = CommonMethods.formatValor(Number(this.totalNetoPensionSave6.toString()) + Number(this.igvPensionSave6.toString()), 2);
            this.brutaTotalPensionYear = CommonMethods.formatValor(Number(this.totalNetoPensionYear.toString()) + Number(this.igvPensionYear.toString()), 2);

            this.totalNetoSaludSave = Number(sumPen) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen, 2);
            this.totalNetoSaludSave2 = Number(sumPen2) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen2, 2);
            this.totalNetoSaludSave3 = Number(sumPen3) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen3, 2);
            this.totalNetoSaludSave6 = Number(sumPen6) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen6, 2);
            this.totalNetoSaludYear = Number(sumPen12) < Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) ? CommonMethods.formatValor(this.inputsQuotation.P_PRIMA_MIN_PENSION, 2) : CommonMethods.formatValor(sumPen12, 2);
            this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvVidaLeyWS) - this.totalNetoSaludSave, 2);
            this.igvSaludSave2 = CommonMethods.formatValor((this.totalNetoSaludSave2 * this.igvVidaLeyWS) - this.totalNetoSaludSave2, 2);
            this.igvSaludSave3 = CommonMethods.formatValor((this.totalNetoSaludSave3 * this.igvVidaLeyWS) - this.totalNetoSaludSave3, 2);
            this.igvSaludSave6 = CommonMethods.formatValor((this.totalNetoSaludSave6 * this.igvVidaLeyWS) - this.totalNetoSaludSave6, 2);
            this.igvSaludYear = CommonMethods.formatValor((this.totalNetoSaludYear * this.igvVidaLeyWS) - this.totalNetoSaludYear, 2);
            this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.totalNetoSaludSave.toString()) + Number(this.igvSaludSave.toString()), 2);
            this.brutaTotalSaludSave2 = CommonMethods.formatValor(Number(this.totalNetoSaludSave2.toString()) + Number(this.igvSaludSave2.toString()), 2);
            this.brutaTotalSaludSave3 = CommonMethods.formatValor(Number(this.totalNetoSaludSave3.toString()) + Number(this.igvSaludSave3.toString()), 2);
            this.brutaTotalSaludSave6 = CommonMethods.formatValor(Number(this.totalNetoSaludSave6.toString()) + Number(this.igvSaludSave6.toString()), 2);
            this.brutaTotalSaludYear = CommonMethods.formatValor(Number(this.totalNetoSaludYear.toString()) + Number(this.igvSaludYear.toString()), 2);

            if (this.listaTasasPension.length > 0) {
                this.tasasList = this.listaTasasPension;
            }

            if (this.listaTasasPension.length == 0) {
                this.tasasList = [];
            }

            if (this.listaTasasSalud.length > 0) {
                this.tasasList = this.listaTasasSalud;
            }

            if (this.listaTasasSalud.length == 0) {
                this.tasasList = [];
            }

            let sumWorkers = 0;
            this.tasasList.map(function (dato) {
                dato.sactive = true;
                if (dato.TIP_RIESGO == '3') {
                    dato.sactive = false;
                } else {
                    sumWorkers = Number(sumWorkers) + Number(dato.NUM_TRABAJADORES)
                }
            });

            if (this.template.ins_tasasPlanList) {
                if (sumWorkers < 5 && this.brutaTotalPensionYear < 1500) {
                    this.inputsQuotation.desTipoPlan = 'Plan de Ley'
                } else if (this.brutaTotalPensionYear <= 1500) {
                    this.inputsQuotation.desTipoPlan = 'Plan Básico'
                } else if (this.brutaTotalPensionYear > 1500 && this.brutaTotalPensionYear <= 4500) {
                    this.inputsQuotation.desTipoPlan = 'Plan Completo'
                } else if (this.brutaTotalPensionYear > 4500) {
                    this.inputsQuotation.desTipoPlan = 'Plan Especial'
                }
            }
        } else {
            this.primatotalSCTR = 0;
            this.primatotalSalud = 0;
            this.igvPension = 0;
            this.igvSalud = 0;
            this.totalSalud = 0;
            this.totalSTRC = 0;
        }
    }

    clearinputsCotizacion() {
        // Contratistas
        this.inputsQuotation.P_SFIRSTNAME = '';
        this.inputsQuotation.P_SLEGALNAME = '';
        this.inputsQuotation.P_SLASTNAME = '';
        this.inputsQuotation.P_SLASTNAME2 = '';
        this.inputsQuotation.P_SDESDIREBUSQ = '';
        this.inputsQuotation.P_SE_MAIL = '';
        this.reloadTariff = false;
        this.canTasaVL = true;
        this.inputsQuotation.P_COMISION = ''
        // this.flagEmailNull = true;
        this.flagEmail = false;
        this.flagContact = false;
        this.tasaVL = []
        this.inputsQuotation.desTipoPlan = '';
        this.contractingdata = undefined;

        // Cotizacion
        this.inputsQuotation.P_NIDSEDE = null;
        this.inputsQuotation.P_NCURRENCY = '1';
        this.inputsQuotation.P_NTECHNICAL = null;
        this.inputsQuotation.P_NECONOMIC = null;
        this.inputsQuotation.P_DELIMITER = '';
        //this.inputsQuotation.P_SDELIMITER = '0'; AVS - Mejoras SCTR
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
        this.inputsQuotation.P_NPROVINCE = null;

        if (this.productList != null) {
            if (this.productList.length > 1) {
                this.inputsQuotation.P_NPRODUCT = '-1';
            }
        }

        this.inputsQuotation.tipoRenovacion = '';
        this.inputsQuotation.frecuenciaPago = '';
        this.inputsQuotation.P_PLANILLA = 0

        // Sedes
        this.sedesList = [];
        this.stateQuotation = true;
        this.activityMain = ''
        this.subActivity = ''
        this.provinceList = [];
        this.districtList = [];
        this.listaTasasPension = [];
        this.listaTasasSalud = [];
        this.inputsQuotation.FDateIni = new Date();
        this.inputsQuotation.FDateFin = new Date();
        this.inputsQuotation.FDateFin.setMonth(this.inputsQuotation.FDateIni.getMonth() + 1);
        this.inputsQuotation.FDateFin.setDate(this.inputsQuotation.FDateFin.getDate() - 1);

        this.inputsQuotation.FDateIniAseg = new Date();
        this.inputsQuotation.FDateFinAseg = new Date();
        this.inputsQuotation.FDateFinAseg.setMonth(this.inputsQuotation.FDateIniAseg.getMonth() + 1);
        this.inputsQuotation.FDateFinAseg.setDate(this.inputsQuotation.FDateFinAseg.getDate() - 1);

        this.bsValueIniMin = new Date();
        this.bsValueFinMin = this.inputsQuotation.FDateFin;
        this.tipoEspecial = false
        this.creditHistory = null
        this.clearTariff()

        this.inputsQuotation.P_NREM_EXC = undefined
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
            this.validarExcel(-1, 1);
        }
    }

    cambioDocumento(nroDocumento) {
        this.stateQuotation = true;
        this.clearinputsCotizacion();
        if (this.inputsQuotation.P_NIDDOC_TYPE == 1 && nroDocumento.length > 1) {
            if (nroDocumento.substr(0, 2) == '10' || nroDocumento.substr(0, 2) == '15' || nroDocumento.substr(0, 2) == '17') {
                this.blockDoc = true;
                this.inputsQuotation.P_SLEGALNAME = '';
            } else {
                this.blockDoc = false;
                this.inputsQuotation.P_SFIRSTNAME = '';
                this.inputsQuotation.P_SLASTNAME = '';
                this.inputsQuotation.P_SLASTNAME2 = '';
            }
        }
        if (nroDocumento.length > 0) {
            this.inputsValidate[1] = false
        }
    }

    onSelectProducto(event) {
        if (this.template.ins_clearTasas) {
            this.tasasList = [];
            this.listaTasasSalud = [];
            this.listaTasasPension = [];
            this.mensajePrimaPension = ''
            this.mensajePrimaSalud = ''
        }

        if (this.inputsQuotation.P_NPRODUCT != '-1') {
            this.reloadTariff = false;
            this.equivalentMuni();
        } else {
            this.clearTariff();
        }
    }

    volverCotizar(cantidad, idTasa, fila, tipoCambio) {
        cantidad = !isNaN(Number(cantidad)) ? Number(cantidad) : 0
        this.inputsQuotation.P_WORKER = 0
        this.inputsQuotation.P_PLANILLA = 0
        this.messageWorker = this.variable.var_msjCalcularNuevo
        this.reloadTariff = true
        let productos = [this.pensionID.id, this.saludID.id]

        this.tasasList.forEach(item => {
            if (item.id == idTasa) {
                item.totalWorkes = tipoCambio == 1 ? cantidad : item.totalWorkes;
                item.planilla = tipoCambio == 2 ? cantidad : item.planilla;
            }
            this.inputsQuotation.P_WORKER = this.inputsQuotation.P_WORKER + item.totalWorkes
            this.inputsQuotation.P_PLANILLA = this.inputsQuotation.P_PLANILLA + Number(item.planilla)
        });

        productos.forEach(producto => {
            let riesgos: any = producto == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
            if (riesgos.length > 0) {
                riesgos.forEach(item => {
                    if (item.id == idTasa) {
                        item.totalWorkes = tipoCambio == 1 ? cantidad : item.totalWorkes;
                        item.planilla = tipoCambio == 2 ? cantidad : item.planilla;
                    }
                    item.rate = CommonMethods.formatValor(0, 6)
                    item.planProp = 0
                    item.premiumMonth = CommonMethods.formatValor(0, 2)
                });
            }

            this.listaTasasPension = producto == this.pensionID.id ? riesgos : this.listaTasasPension
            this.listaTasasSalud = producto == this.saludID.id ? riesgos : this.listaTasasSalud
        });

        this.totalNetoSaludSave = CommonMethods.formatValor(0, 2);
        this.inputsQuotation.primaComSalud = CommonMethods.formatValor(0, 2);
        this.igvSaludSave = CommonMethods.formatValor(0, 2);
        this.brutaTotalSaludSave = CommonMethods.formatValor(0, 2)
        this.mensajePrimaSalud = ''

        this.totalNetoPensionSave = CommonMethods.formatValor(0, 2);
        this.inputsQuotation.primaComPension = CommonMethods.formatValor(0, 2);
        this.igvPensionSave = CommonMethods.formatValor(0, 2);
        this.brutaTotalPensionSave = CommonMethods.formatValor(0, 2)
        this.mensajePrimaPension = ''

        if (this.inputsQuotation.P_WORKER > 0 || this.inputsQuotation.P_PLANILLA > 0) {
            if (this.codFlat == idTasa) {
                this.disabledFlat.forEach(disable => {
                    disable.value = true;
                    this.disabledFlat[fila].value = false;
                });
            } else {
                this.disabledFlat.forEach(disable => {
                    if (disable.id == this.codFlat) {
                        disable.value = true;
                    }
                });
            }
        } else {
            if (this.inputsQuotation.P_PLANILLA == 0 && this.inputsQuotation.P_WORKER == 0) {
                this.disabledFlat.forEach(disable => {
                    disable.value = false;
                });
            }
        }

    }

    comisionPropuesta(porPropuesto, fila, tipoId) {
        porPropuesto = !isNaN(Number(porPropuesto)) ? Number(porPropuesto) : 0
        let sumComision = 0

        this.brokerList.forEach(broker => {
            broker.P_COM_PENSION_PRO = tipoId == 1 ? porPropuesto : broker.P_COM_PENSION_PRO
            broker.P_COM_SALUD_PRO = tipoId == 2 ? porPropuesto : broker.P_COM_SALUD_PRO
            sumComision = tipoId == 1 ? sumComision + broker.P_COM_PENSION_PRO : sumComision + broker.P_COM_SALUD_PRO
        });

        if (sumComision > 100) {
            this.brokerList[fila].valItemPen = tipoId == 1 ? true : this.brokerList[fila].valItemPen
            this.brokerList[fila].valItemSal = tipoId == 2 ? true : this.brokerList[fila].valItemSal
        }
        else {
            this.brokerList[fila].valItemPen = tipoId == 1 ? false : this.brokerList[fila].valItemPen
            this.brokerList[fila].valItemSal = tipoId == 2 ? false : this.brokerList[fila].valItemSal
        }
    }

    resetearPrimas(primPropuesta, productoId) {
        primPropuesta = !isNaN(Number(primPropuesta)) ? Number(primPropuesta) : 0;
        let tasas = productoId == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
        let totalNeto = productoId == this.pensionID.id ? Number(this.totalNetoPension) : Number(this.totalNetoSalud)
        let primaMinima = productoId == this.pensionID.id ? Number(this.inputsQuotation.P_PRIMA_MIN_PENSION) : Number(this.inputsQuotation.P_PRIMA_MIN_SALUD)
        let productos = [this.pensionID.id, this.saludID.id]

        if (tasas.length > 0) {
            productos.forEach(producto => {
                if (producto == productoId) {
                    if (primPropuesta > 0) {
                        if (primPropuesta > totalNeto) {
                            this.recalcularPrima(productoId, primPropuesta, this.variable.var_msjPrimaMin)
                        } else {
                            this.recalcularPrima(productoId, totalNeto, '')
                        }
                    } else {
                        if (totalNeto < primaMinima) {
                            this.recalcularPrima(productoId, primaMinima, this.variable.var_msjPrimaMin)
                        } else {
                            this.recalcularPrima(productoId, totalNeto, '')
                        }
                    }
                }

            });
        }
    }

    recalcularPrima(productoId: any, monPropuesto: number, mensaje: any) {
        if (productoId == this.pensionID.id) {
            this.totalNetoPensionSave = CommonMethods.formatValor(monPropuesto, 2)
            this.inputsQuotation.primaComPension = CommonMethods.formatValor(this.totalNetoPensionSave * this.dEmiPension, 2);
            this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 2);
            this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.inputsQuotation.primaComPension) + Number(this.igvPensionSave), 2)
            this.mensajePrimaPension = mensaje;
        }

        if (productoId == this.saludID.id) {
            this.totalNetoSaludSave = CommonMethods.formatValor(monPropuesto, 2)
            this.inputsQuotation.primaComSalud = CommonMethods.formatValor(this.totalNetoSaludSave * this.dEmiSalud, 2);
            this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 2);
            this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.inputsQuotation.primaComSalud) + Number(this.igvSaludSave), 2)
            this.mensajePrimaSalud = mensaje;
        }
    }

    resetearTasas(tasaPropuesta, idTasa, fila, productoId) {
        tasaPropuesta = !isNaN(Number(tasaPropuesta)) ? Number(tasaPropuesta) : 0;
        let listaTasa = productoId == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud
        // let listaTasaValidar = productoId == this.pensionID ? this.listaTasasSalud : this.listaTasasPension
        let productos = [this.pensionID.id, this.saludID.id]
        // let sumTasaPropuesta = 0
        // let sumTasaPropuestaEspejo = 0

        if (listaTasa.length > 0) {
            productos.forEach(producto => {
                if (producto == productoId) {

                    if (tasaPropuesta > 100) {
                        listaTasa[fila].valItem = true
                    }
                    else {
                        listaTasa[fila].valItem = false
                    }

                    listaTasa[fila].planProp = tasaPropuesta

                    if (this.template.ins_mapfre && productoId == this.saludID.id) {
                        listaTasa.forEach(item => {

                            item.planProp = tasaPropuesta;
                        });

                    }
                }
            });
        }
    }

    /** cambio de prima */
    changePrima(planPro, valor, row) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;
        let self = this;

        //Lista Pension
        this.planesList.forEach(item => {
            if (item.NCATEGORIA == valor) {
                item.NPREMIUM_PRO = planProp;
            }
        });
    }

    limpiarTarifario() {
        this.messageWorker = '';
        this.primMinimaSalud = false;
        this.primMinimaPension = false;
        this.statePrimaSalud = true;
        this.statePrimaPension = true;
        this.inputsQuotation.P_PRIMA_MIN_SALUD = ''
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = ''
        this.inputsQuotation.P_PRIMA_MIN_PENSION = ''
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = ''
    }

    async getTarifario() {
        // Limpiar objetos de tarifario
        this.limpiarTarifario()

        if (this.inputsQuotation.P_NTECHNICAL == null || this.inputsQuotation.P_NMUNICIPALITY == null ||
            this.inputsQuotation.P_NPRODUCT == '-1' || this.brokerList.length == 0 || this.contratanteId == '')
            return

        let data: any = {};
        data.protectaTariff = {};
        data.protectaTariff.activity = this.inputsQuotation.P_NECONOMIC; // Sub-Actividad
        data.protectaTariff.workers = this.inputsQuotation.P_WORKER;
        data.protectaTariff.zipCode = this.municipalityTariff.toString(); // Ubigeo Equivalente
        data.protectaTariff.queryDate = ''; // Fecha
        data.protectaTariff.channel = []; //

        //Agregando el clientId
        let client: any = {}
        client.clientId = this.contratanteId; // Cliente Contratante
        data.protectaTariff.channel.push(client);

        //Agregando los brokerId y middlemanId | Lista de comercializadores
        this.brokerList.forEach(broker => {
            if (broker.NTYPECHANNEL == '6' || broker.NTYPECHANNEL == '8') {
                let brokerItem: any = {}
                brokerItem.brokerId = broker.NCORREDOR.toString();
                data.protectaTariff.channel.push(brokerItem);
            } else {
                let middlemanItem: any = {}
                middlemanItem.middlemanId = broker.COD_CANAL.toString();
                data.protectaTariff.channel.push(middlemanItem);
            }
        });

        this.isLoading = true;

        // Mapfre
        if (this.template.ins_mapfre && (this.inputsQuotation.P_NPRODUCT == '0' || this.inputsQuotation.P_NPRODUCT == this.saludID.id)) {
            data.mapfreTariff = {}
            data.mapfreTariff.cabecera = {}
            data.mapfreTariff.cabecera.tariff = this.reloadTariff
            data.mapfreTariff.cabecera.keyService = 'cotizar'
            data.mapfreTariff.poliza = {}
            data.mapfreTariff.poliza.fecEfecSpto = this.inputsQuotation.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateIni.getFullYear()
            data.mapfreTariff.poliza.fecVctoSpto = this.inputsQuotation.FDateFin.getDate().toString().padStart(2, '0') + '/' + (this.inputsQuotation.FDateFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.inputsQuotation.FDateFin.getFullYear()
            data.mapfreTariff.poliza.codFormaDeclaracion = await this.equivalenciaMapfre(this.inputsQuotation.tipoRenovacion, 'renovacion', 'tableKey') // Tipo de renovación
            data.mapfreTariff.poliza.codActRiesgo = await this.equivalenciaMapfre(this.inputsQuotation.P_NECONOMIC, 'actividadEconomica', 'tableKey') // Revisar CIIU
            data.mapfreTariff.poliza.tipoPeriodo = this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4' ? 'C' : 'N' // Revisar
            data.mapfreTariff.poliza.moneda = {}
            data.mapfreTariff.poliza.moneda.codMon = this.inputsQuotation.P_NCURRENCY
            data.mapfreTariff.producto = {}
            data.mapfreTariff.riesgoSCTR = []
            let item: any = {}
            item.nomCentroRiesgoSalud = this.inputsQuotation.P_SSEDE
            item.numAsegSalud = this.inputsQuotation.P_WORKER;
            item.impPlanillaSalud = this.inputsQuotation.P_PLANILLA;
            data.mapfreTariff.riesgoSCTR.push(item)
            data.mapfreTariff.contratante = {}
            data.mapfreTariff.contratante.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey') //'DNI' equivalente
            data.mapfreTariff.contratante.codDocum = this.inputsQuotation.P_SIDDOC
            data.mapfreTariff.contratante.nombre = this.contractingdata.P_NPERSON_TYP == '1' ? this.contractingdata.P_SFIRSTNAME + ' ' + this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : this.contractingdata.P_SLEGALNAME
            data.mapfreTariff.mcaGuardado = 'N'
        }

        this.clientInformationService.getTariff(data).subscribe(
            async res => {
                this.isLoading = false;
                if (res.fields !== null) {
                    this.resList = res;

                    // Recorre lo recibido del tarifario
                    await this.generarTasasListas(this.resList)

                    // Confirma tasas (Producto elegido)
                    await this.tasaProductoConfigurada()

                } else {
                    this.clearTariff();
                    swal.fire('Información', this.variable.var_sinCombinacion, 'error');
                }
            },
            err => {
                this.isLoading = false;
                this.clearTariff();
                swal.fire('Información', this.variable.var_sinCombinacion, 'error');
            }
        );
    }

    tasaProductoConfigurada() {
        let productos = [this.variable.var_ambosProductos, this.pensionID.id, this.saludID.id]
        productos.forEach(async producto => {
            if (producto == this.inputsQuotation.P_NPRODUCT) {
                if (this.listaTasasSalud.length > 0 && this.listaTasasPension.length > 0 || (this.template.ins_mapfre && producto == this.saludID.id)) {
                    if (!this.reloadTariff) {
                        this.tasasList = producto == this.pensionID.id || producto == this.variable.var_ambosProductos ? this.listaTasasPension : this.listaTasasSalud
                    }
                    this.listaTasasPension = producto == this.pensionID.id || producto == this.variable.var_ambosProductos ? this.listaTasasPension : []
                    this.listaTasasSalud = producto == this.saludID.id || producto == this.variable.var_ambosProductos ? this.listaTasasSalud : []

                    if (!this.reloadTariff) {
                        this.messageWorker = this.variable.var_msjCalcularNuevo
                    }

                    await this.completarCalculos();

                } else {
                    this.clearTariff();
                    swal.fire('Información', this.variable.var_errorTarifario, 'error');
                    return;
                }
            }
        });
    }

    generarTasasListas(resList: any) {
        this.resList.fields.forEach(async item => {
            if (item.fieldEquivalenceCore == this.pensionID.id && item.branch == this.pensionID.nbranch) {
                this.listaTasasPension = await this.cargarTasasServicio(item)
            }

            if (item.fieldEquivalenceCore == this.saludID.id && item.branch == this.saludID.nbranch) {
                this.listaTasasSalud = await this.cargarTasasServicio(item)
            }
        });
    }

    async cargarTasasServicio(item: any) {
        var self = this
        var listaTasas: any = []

        if (item.enterprise[0].netRate != undefined) {
            item.enterprise[0].netRate.map(function (dato) {
                dato.rate = CommonMethods.formatValor(Number(dato.rate) * 100, 6);
                dato.premiumMonth = CommonMethods.formatValor(Number('0'), 2);
                dato.planilla = 0;
                dato.planProp = 0;
                dato.totalWorkes = 0;
                dato.sactive = true;
                dato.valItem = false;
                if (self.reloadTariff == false) {
                    dato.rate = CommonMethods.formatValor(0, 6)
                }
            });
        }

        if (item.enterprise[0].riskRate != undefined) {
            item.enterprise[0].riskRate.forEach(net => {
                item.enterprise[0].netRate.map(function (dato) {
                    if (net.id == dato.id) {
                        dato.rateDet = CommonMethods.formatValor(Number(net.rate) * 100, 6)
                    }
                });
            });
        }

        if (item.enterprise[0].netRate != null) {
            let activeFlat = false;
            item.enterprise[0].netRate.map(function (dato) {
                dato.status = 0;
            });

            var num = 0
            item.enterprise[0].netRate.forEach(item => {
                self.disabledFlat[num].id = item.id
                if (self.reloadTariff == false) {
                    self.disabledFlat[num].value = false
                    if (this.template.ins_mapfre) {
                        if (this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4') {
                            item.disabled = true
                        } else {
                            item.disabled = false
                        }
                    }
                } else {
                    if (this.template.ins_mapfre) {
                        if (this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4') {
                            item.disabled = true
                        } else {
                            item.disabled = false
                        }
                    }
                }
                num++
            });

            if (this.perfil == this.perfilActual) {
                item.enterprise[0].netRate.forEach(risk => {
                    if (risk.id == this.codFlat) {
                        risk.status = 1;
                        activeFlat = true;
                        num++
                    }
                });

                if (activeFlat == false) {
                    item.enterprise[0].netRate.forEach(risk => {
                        risk.status = 1;
                    });
                }

                listaTasas = item.enterprise[0].netRate

            } else {
                item.enterprise[0].netRate.forEach(risk => {
                    risk.status = 1;
                });

                listaTasas = item.enterprise[0].netRate;
            }

        } else {
            listaTasas = []
        }

        return listaTasas
    }

    completarCalculos() {
        this.resList.fields.forEach(async item => {
            if (item.fieldEquivalenceCore == this.pensionID.id && item.branch == this.pensionID.nbranch) {
                let infoPension: any = await this.infoGenerica(this.pensionID.id, item);
                this.discountPension = infoPension != null ? infoPension.discount : 0;
                this.activityVariationPension = infoPension != null ? infoPension.activityVariation : 0;
                this.commissionPension = infoPension != null ? infoPension.commission : 0;
                this.inputsQuotation.P_PRIMA_MIN_PENSION = infoPension != null ? infoPension.prima_min : 0;
                this.inputsQuotation.P_PRIMA_END_PENSION = infoPension != null ? infoPension.prima_end : 0;
                this.inputsQuotation.primaComPension = infoPension != null ? infoPension.primaCom : 0;
                this.inputsQuotation.primaComPensionPre = infoPension != null ? infoPension.primaComPre : 0;
                this.totalNetoPensionSave = infoPension != null ? infoPension.totalNeto : 0;
                this.totalNetoPension = infoPension != null ? infoPension.totalNetoPre : 0;
                this.igvPensionSave = infoPension != null ? infoPension.igv : 0;
                this.igvPension = infoPension != null ? infoPension.igvPre : 0;
                this.brutaTotalPensionSave = infoPension != null ? infoPension.totalBruto : 0;
                this.brutaTotalPension = infoPension != null ? infoPension.totalBrutoPre : 0;
                this.mensajePrimaPension = infoPension != null ? infoPension.mensaje : 0;
                this.listaTasasPension = infoPension != null ? infoPension.tasasProducto : this.listaTasasPension;
            }

            if (item.fieldEquivalenceCore == this.saludID.id && item.branch == this.saludID.nbranch) {
                let infoSalud: any = await this.infoGenerica(this.saludID.id, item)
                this.discountSalud = infoSalud != null ? infoSalud.discount : 0
                this.activityVariationSalud = infoSalud != null ? infoSalud.activityVariation : 0
                this.commissionSalud = infoSalud != null ? infoSalud.commission : 0
                this.inputsQuotation.P_PRIMA_MIN_SALUD = infoSalud != null ? infoSalud.prima_min : 0
                this.inputsQuotation.P_PRIMA_END_SALUD = infoSalud != null ? infoSalud.prima_end : 0
                this.inputsQuotation.primaComSalud = infoSalud != null ? infoSalud.primaCom : 0
                this.inputsQuotation.primaComSaludPre = infoSalud != null ? infoSalud.primaComPre : 0
                this.totalNetoSaludSave = infoSalud != null ? infoSalud.totalNeto : 0
                this.totalNetoSalud = infoSalud != null ? infoSalud.totalNetoPre : 0
                this.igvSaludSave = infoSalud != null ? infoSalud.igv : 0
                this.igvSalud = infoSalud != null ? infoSalud.igvPre : 0
                this.brutaTotalSaludSave = infoSalud != null ? infoSalud.totalBruto : 0
                this.brutaTotalSalud = infoSalud != null ? infoSalud.totalBrutoPre : 0
                this.mensajePrimaSalud = infoSalud != null ? infoSalud.mensaje : 0
                this.listaTasasSalud = infoSalud != null ? infoSalud.tasasProducto : this.listaTasasSalud
            }

        });
    }

    infoGenerica(productoId: any, item: any): any {
        // let self = this
        let response: any = {}
        let dEmision: number = productoId == this.pensionID.id ? this.dEmiPension : this.dEmiSalud
        let igvProducto: number = productoId == this.pensionID.id ? this.igvPensionWS : this.igvSaludWS
        let tasasProducto: any = productoId == this.pensionID.id ? this.listaTasasPension : this.listaTasasSalud

        if (tasasProducto.length > 0) {
            response.discount = item.discount == null ? '0' : item.discount;
            response.activityVariation = item.activityVariation == null ? '0' : item.activityVariation;
            response.commission = item.commission == null ? '0' : item.commission;

            if (item.enterprise[0].netRate != undefined) {
                let neto = 0;
                tasasProducto.forEach(item => {
                    this.tasasList.forEach(dato => {
                        if (item.id == dato.id) {
                            item.totalWorkes = dato.totalWorkes;
                            item.planilla = dato.planilla;
                            item.planProp = 0;
                            item.premiumMonth = CommonMethods.formatValor((Number(dato.planilla) * Number(item.rate)) / 100, 2);
                        }
                    });
                    neto = neto + Number(item.premiumMonth)
                });

                if (tasasProducto.length > 0) {
                    if (this.reloadTariff == true) {
                        response.prima_min = item.enterprise[0].minimumPremium == null ? '0' : item.enterprise[0].minimumPremium;
                        response.prima_end = item.enterprise[0].minimumPremiumEndoso == null ? '0' : item.enterprise[0].minimumPremiumEndoso;
                    } else {
                        response.prima_min = 0;
                        response.prima_end = 0;
                    }
                }

                response.mensaje = ''
                if (this.template.ins_mapfre && productoId == this.saludID.id) {
                    response.totalNeto = CommonMethods.formatValor(item.enterprise[0].impPneta, 2)
                    response.primaCom = CommonMethods.formatValor(item.enterprise[0].impPneta, 2)
                    response.igv = CommonMethods.formatValor(item.enterprise[0].impImptos + item.enterprise[0].impRecargos, 2)
                    response.totalBruto = CommonMethods.formatValor(item.enterprise[0].impPrimaTotal, 2)
                } else {
                    response.totalNetoPre = CommonMethods.formatValor(neto, 2)
                    response.totalNeto = CommonMethods.formatValor(neto, 2)
                    response.primaComPre = CommonMethods.formatValor(neto * dEmision, 2)
                    response.primaCom = CommonMethods.formatValor(neto * dEmision, 2)
                    response.igvPre = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 2);
                    response.igv = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 2);
                    response.totalBrutoPre = CommonMethods.formatValor(Number(response.primaComPre.toString()) + Number(response.igv.toString()), 2)
                    response.totalBruto = CommonMethods.formatValor(Number(response.primaCom.toString()) + Number(response.igv.toString()), 2)
                }

                if (Number(response.totalNeto) < Number(response.prima_min)) {
                    response.totalNeto = CommonMethods.formatValor(Number(response.prima_min), 2)
                    response.primaCom = CommonMethods.formatValor(response.totalNeto * dEmision, 2)
                    response.igv = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 2)
                    response.totalBruto = CommonMethods.formatValor(Number(response.primaCom.toString()) + Number(response.igv.toString()), 2)
                    response.mensaje = this.variable.var_msjPrimaMin
                }

                if (item.channelDistributions != undefined) {
                    item.channelDistributions.forEach(channel => {
                        this.brokerList.forEach(broker => {
                            if (channel.roleId == broker.COD_CANAL) {
                                if (productoId == this.pensionID.id) {
                                    broker.P_COM_PENSION = (Number(response.commission) * Number(channel.distribution)) / 100;
                                }
                                if (productoId == this.saludID.id) {
                                    broker.P_COM_SALUD = (Number(response.commission) * Number(channel.distribution)) / 100;
                                }
                            }
                        });
                    });
                }
            }

            response.tasasProducto = tasasProducto;
        }
        else {
            response = null
        }
        return response;
    }

    FlagValidacionVL() {
        this.flagDisableVL = this.codProducto == 3 && (!this.stateQuotation || this.typeTran === CommonMethods.TIPO_TRANSACCION.RENOVACION || this.typeTran === CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran === CommonMethods.TIPO_TRANSACCION.INCLUSION || this.typeTran === CommonMethods.TIPO_TRANSACCION.EXCLUSION || this.typeTran === CommonMethods.TIPO_TRANSACCION.ENDOSO) ? 1 : 0;
    }


    async grabarCotizacion() {
        let msg = '';
        this.isLoading = true;
        let flag = true;
        this.FlagValidacionVL();

        if (this.codProducto == '3' && this.flagPolizaMat) {
            if (this.inputsQuotation.P_COMISION == '') {
                flag = false;
                msg += 'Para generar una cotización debe tener una tarifa <br>';
            }
        }

        if (this.template.ins_categoriaList) {
            if (this.flagPolizaMat != true && this.typeGobiernoMatriz == true) {
                if (this.categoryList.length == 0) {
                    flag = false;
                    this.inputsValidate[7] = true
                    msg += 'Para generar una cotización debe tener un producto <br>';
                }
            }
        }

        if (this.template.ins_planesList && this.typeGobiernoMatriz == true) {
            if (this.planesList.length == 0) {
                flag = false;
                this.inputsValidate[7] = true
                msg += 'Para generar una cotización debe tener un plan <br>';
            }
        }

        if (this.template.ins_tasasList) {
            if (this.tasasList.length == 0) {
                flag = false;
                this.inputsValidate[7] = true
                msg += 'Para generar una cotización debe tener un producto <br>';
            }
        }

        if (this.files.length == 0 && this.flagGobiernoEstado == true) {
            flag = false;
            msg = 'Debe adjuntar por lo menos un archivo<br />';
        }

        if (this.flagAprobCli && (this.inputsQuotation.SMAIL_EJECCOM == undefined || this.inputsQuotation.SMAIL_EJECCOM == '')) {
            flag = false;
            msg = 'Ingrese una dirección de correo electrónico para el ejecutivo comercial</br>';
        }

        if (flag) {
            // Campos simples
            if (this.inputsQuotation.P_NIDDOC_TYPE == '-1') {
                this.inputsValidate[0] = true
                msg += 'Debe ingresar el tipo de documento <br>';
            }

            if (this.inputsQuotation.P_SIDDOC == '') {
                this.inputsValidate[1] = true
                msg += 'Debe ingresar el número de documento <br>'
            }

            // Ini vidaley
            if (this.inputsQuotation.P_COMISION == '' && this.template.ins_comision && this.flagPolizaMat != true) {
                this.inputsValidate[16] = true
                msg += 'Debe ingresar el porcentaje de comisión <br>'
            }
            if (this.inputsQuotation.tipoRenovacion == '' && this.template.ins_tipRenovacion) {
                this.inputsValidate[17] = true
                msg += 'Debe ingresar el tipo de renovación <br>'
            }
            if (this.inputsQuotation.frecuenciaPago == '' && this.template.ins_frecPago) {
                this.inputsValidate[18] = true
                msg += 'Debe ingresar la frecuencia de pago <br>'
            }

            if (this.codProducto == '2') {
                if (this.template.ins_email) {
                    if (this.inputsQuotation.P_SE_MAIL == '' || this.inputsQuotation.P_SE_MAIL == undefined) {
                        this.inputsValidate[19] = true
                        msg += 'Debe ingresar un correo electrónico para la factura.';
                    } else {
                        if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                            this.inputsValidate[19] = true
                            msg += 'El correo electrónico es inválido.';
                        }
                    }
                }

                if (this.inputsQuotation.P_SDESDIREBUSQ == '' || this.inputsQuotation.P_SDESDIREBUSQ == undefined) {
                    msg += 'La dirección del cliente no puede estar vacío <br>';
                }

            }

            if (this.codProducto == '3') {
                if (this.template.ins_email) {
                    if (this.inputsQuotation.P_SE_MAIL !== '') {
                        if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.P_SE_MAIL) == false) {
                            this.inputsValidate[19] = true
                            msg += 'El correo electrónico es inválido <br />';
                        }
                    }
                }
                /*if (this.inputsQuotation.SMAIL_EJECCOM !== ''){
                  if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsQuotation.SMAIL_EJECCOM) == false) {
                    msg += 'El correo electrónico del ejecutivo comercial es inválido <br />';
                  }
                } else {
                  msg += 'Debe ingresar el correo electrónico del ejecutivo comercial.<br />';
                }*/
            }

            if (this.nrocotizacion == undefined || this.nrocotizacion == '') {
                if (this.inputsQuotation.P_NIDDOC_TYPE == '1') {
                    if (this.inputsQuotation.P_SIDDOC.toUpperCase().substr(0, 2) == '10' || this.inputsQuotation.P_SIDDOC.toUpperCase().substr(0, 2) == '15' || this.inputsQuotation.P_SIDDOC.toUpperCase().substr(0, 2) == '17') {
                        if (this.inputsQuotation.P_SFIRSTNAME == '' || this.inputsQuotation.P_SFIRSTNAME == null) {
                            msg += 'El nombre del cliente no puede estar vacío <br>';
                        }
                        if (this.inputsQuotation.P_SLASTNAME == '' || this.inputsQuotation.P_SLASTNAME == null) {
                            msg += 'El apellido paterno del cliente no puede estar vacío <br>';
                        }
                    } else {
                        if (this.inputsQuotation.P_SLEGALNAME == '' || this.inputsQuotation.P_SLEGALNAME == null) {
                            msg += 'La razón social del cliente no puede estar vacío <br>';
                        }
                    }

                } else {
                    if (this.inputsQuotation.P_SFIRSTNAME == '' || this.inputsQuotation.P_SFIRSTNAME == null) {
                        msg += 'El nombre del cliente no puede estar vacío <br>';
                    }
                    if (this.inputsQuotation.P_SLASTNAME == '' || this.inputsQuotation.P_SLASTNAME == null) {
                        msg += 'El apellido paterno del cliente no puede estar vacío <br>';
                    }
                }
            }

            if (this.brokerList.length > 0) {
                var index = 0;
                this.brokerList.forEach(broker => {
                    if (this.listaTasasSalud.length > 0 && this.template.ins_saludList) {
                        if (broker.valItemSal == true) {
                            msg += 'La suma total de las comisiones propuestas es mayor a 100 [Salud]<br>'
                        }
                    }
                    if (this.listaTasasPension.length > 0 && this.template.ins_pensionList) {
                        if (broker.valItemPen == true) {
                            msg += 'La suma total de las comisiones propuestas es mayor a 100 [Pensión]<br>'
                        }
                    }

                    if ((this.nTransac == 1 || this.nTransac == 4) && this.sAbTransac != 'DE') {
                        let obj = this.BrokerObl.find(o => o.NINTERMED == broker.COD_CANAL)

                        if (obj != null && (this.selectedDep[index] == null || this.selectedDep[index] == "0")) {
                            msg += 'Falta completar campo oficina de producción <br>'
                        }
                    }
                    index = index + 1;

                });
            } else {
                msg += 'Debe seleccionar al menos un broker <br>'
            }

            if (this.inputsQuotation.P_NPRODUCT == '-1') {
                this.inputsValidate[11] = true
                msg += 'Debe seleccionar un producto válido <br>'
            }

            if (this.sedesList.length > 0) {
                if (this.inputsQuotation.P_NIDSEDE == null || this.inputsQuotation.P_NIDSEDE == 0) {
                    this.inputsValidate[2] = true
                    msg += 'Debe seleccionar una sede válida <br>'
                }
            } else {
                if ((this.inputsQuotation.P_NTECHNICAL == null || this.inputsQuotation.P_NTECHNICAL == 0)
                    && this.template.ins_actRealizar) {
                    this.inputsValidate[12] = true
                    msg += 'Debe seleccionar una actividad a realizar válida <br>'
                }
                if (((this.inputsQuotation.P_NECONOMIC == null || this.inputsQuotation.P_NECONOMIC == 0) && (this.flagDisableVL == 0 || this.flagBuscarCIIU))
                    && this.template.ins_subActividad) {
                    this.inputsValidate[3] = true
                    msg += this.flagBuscarCIIU ? 'Falta completar campo CIIU  <br>' : 'Debe seleccionar una actividad económica válida <br>'
                }
                if ((this.inputsQuotation.P_NPROVINCE == null || this.inputsQuotation.P_NPROVINCE == 0)
                    && this.template.ins_departamento) {
                    this.inputsValidate[4] = true
                    msg += 'Debe seleccionar un departamento válida <br>'
                }
                if ((this.inputsQuotation.P_NLOCAL == null || this.inputsQuotation.P_NLOCAL == 0)
                    && this.template.ins_provincia) {
                    this.inputsValidate[5] = true
                    msg += 'Debe seleccionar una provincia válida <br>'
                }
                if ((this.inputsQuotation.P_NMUNICIPALITY == null || this.inputsQuotation.P_NMUNICIPALITY == 0)
                    && this.template.ins_distrito) {
                    this.inputsValidate[6] = true
                    msg += 'Debe seleccionar un distrito válida <br>'
                }
            }

            let countWorker = 0;
            let countPlanilla = 0;

            if (this.listaTasasSalud.length > 0 && this.template.ins_saludList) {
                this.listaTasasSalud.forEach(item => {
                    if (item.totalWorkes == 0) {
                        this.inputsValidate[8] = true
                        countWorker++
                    } else {
                        if (item.planilla == 0) {
                            msg += 'Debe ingresar un monto en el campo planilla de la categoría ' + item.description + ' [Salud] <br>'
                        }
                    }
                    if (item.planilla == 0) {
                        this.inputsValidate[9] = true
                        countPlanilla++;
                    } else {
                        if (item.totalWorkes == 0) {
                            msg += 'Debe ingresar trabajadores de la categoría ' + item.description + ' [Salud] <br>'
                        }
                    }

                    if (item.totalWorkes == 0 && item.planilla == 0) {
                        if (item.planProp != 0) {
                            if (!this.template.ins_mapfre) {
                                msg += 'No puedes proponer tasa en la categoría ' + item.description + ' [Salud]<br>'
                            }
                        }
                    } else {
                        if (item.valItem == true) {
                            if (!this.template.ins_mapfre) {
                                msg += 'La tasa propuesta es mayor a 100 en la categoría ' + item.description + ' [Salud]<br>'
                            }
                            if (this.template.ins_mapfre) {
                                msg += 'La tasa propuesta es mayor a 100 <br>'
                            }
                        }
                    }
                });
            }

            if (this.listaTasasPension.length > 0 && this.template.ins_pensionList) {
                this.listaTasasPension.forEach(item => {
                    if (item.totalWorkes == 0) {
                        this.inputsValidate[8] = true
                        countWorker++
                    } else {
                        if (item.planilla == 0) {
                            msg += 'Debe ingresar un monto en el campo planilla de la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    }
                    if (item.planilla == 0) {
                        this.inputsValidate[9] = true
                        countPlanilla++;
                    } else {
                        if (item.totalWorkes == 0) {
                            msg += 'Debe ingresar trabajadores de la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    }

                    if (item.totalWorkes == 0 && item.planilla == 0) {
                        if (item.planProp != 0) {
                            msg += 'No puedes proponer tasa en la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    } else {
                        if (item.valItem == true) {
                            msg += 'La tasa es mayor a 100 en la categoría ' + item.description + ' [Pensión]<br>'
                        }
                    }

                });
            }

            if (this.template.ins_tasasList) {
                if (this.listaTasasPension.length > 0 && this.listaTasasSalud.length > 0) {
                    var tasasTotalSCTRMIX = this.listaTasasPension.length + this.listaTasasSalud.length

                    if (countPlanilla == tasasTotalSCTRMIX) {
                        if (countWorker == tasasTotalSCTRMIX) {
                            msg += 'Debe ingresar trabajadores al menos en un tipo de riesgo <br>';
                        }
                    }
                    if (countWorker == tasasTotalSCTRMIX) {
                        if (countPlanilla == tasasTotalSCTRMIX) {
                            msg += 'Debe ingresar planilla al menos en un tipo de riesgo <br>';
                        }
                    }
                } else {
                    if (countPlanilla == this.tasasList.length) {
                        if (countWorker == this.tasasList.length) {
                            msg += 'Debe ingresar trabajadores al menos en un tipo de riesgo <br>';
                        }
                    }
                    if (countWorker == this.tasasList.length) {
                        if (countPlanilla == this.tasasList.length) {
                            msg += 'Debe ingresar planilla al menos en un tipo de riesgo <br>';
                        }
                    }
                }
            }
        }

        if (this.messageWorker != '') {
            msg += 'Para continuar debe haber calculado la prima <br />';
        }

        if (this.flagConfirm == 0 && this.nTransac == 8 && this.codProducto == '3') {
            msg += 'Debe validar la trama para realizar el endoso';
        }

        let sumSize = 0;
        this.files.forEach(file => {
            sumSize = sumSize + file.size;
        });

        if (sumSize > this.maxSize) {
            this.inputsValidate[10] = true
            msg += 'La suma del tamaño de los archivos no puede superar los 10MB  <br>';
        }

        if (this.codProducto == 3 && this.flagPolizaMat) {
            //if (this.inputsQuotation.P_NREM_EXC == true){
            //   if (this.MontoSinIGVEMP_18_36!= 0 && this.MontoSinIGVEE == 0){
            //     msg += 'El monto por cobrar del excedente de Empleado debe ser mayor a 0  <br>';
            //   }
            //   if (this.MontoSinIGVOBR_18_36!= 0 && this.MontoSinIGVOE == 0){
            //     msg += 'El monto por cobrar del excedente de Obrero debe ser mayor a 0  <br>';
            //   }
            //   if (this.MontoSinIGVOAR_18_36!= 0 && this.MontoSinIGVOARE == 0){
            //     msg += 'El monto por cobrar del excedente de Obrero de Alto Riesgo debe ser mayor a 0  <br>';
            //   }
            // validaciones Poliza Matriz
            //     var categorias =  this.countinputEMP_18_36 +
            //                     this.countinputOBR_18_36+
            //                     this.countinputOAR+
            //                     this.countinputEE+
            //                     this.countinputOE+
            //                     this.countinputOARE;
            // if(categorias==0) {
            //   msg += 'Debe ingresar al menos una categoría <br />';
            // }


            // }
            var categorias = this.countinputEMP_18_36 +
                this.countinputOBR_18_36+
                this.countinputOAR_18_36+
                this.countinputEE +
                this.countinputOE +
                this.countinputOARE;

            var datosempelado = this.countinputEMP_18_36 + this.planillainputEMP_18_36 + this.tasainputEMP_18_36;
            var datosObrero = this.countinputOBR_18_36 + this.planillainputOBR_18_36 + this.tasainputOBR_18_36;
            var datosObreroAR = this.countinputOAR_18_36 + this.planillainputOAR_18_36 + this.tasainputOAR_18_36;
            var datosEE = this.countinputEE + this.planillainputEE + this.tasainputEE;
            var datosOE = this.countinputOE + this.planillainputOE + this.tasainputOE;
            var datosOARE = this.countinputOARE + this.planillainputOARE + this.tasainputOARE;
            if (categorias == 0) {
                msg += 'Debe ingresar al menos un asegurado. <br />';
            }

            // validacion de montos editables.
            if (this.MontoSinIGVEMP_18_36 > 0) {
                if (this.countinputEMP_18_36 > 0 || this.planillainputEMP_18_36 > 0 || this.tasainputEMP_18_36 > 0 || datosempelado == 0) {

                    if (this.countinputEMP_18_36 == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Empleado. <br />';
                    }
                    if (this.planillainputEMP_18_36 == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Empleado. <br />';
                    }
                    if (this.tasainputEMP_18_36 == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Empleado. <br />';
                    }
                }
            } else {
                if (this.countinputEMP_18_36 > 0 || this.planillainputEMP_18_36 > 0 || this.tasainputEMP_18_36 > 0) {

                    if (this.countinputEMP_18_36 == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Empleado. <br />';
                    }
                    if (this.planillainputEMP_18_36 == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Empleado. <br />';
                    }
                    if (this.tasainputEMP_18_36 == 0) {
                        msg += 'Debe ingresar da  la tasa  para la categoría Empleado. <br />';
                    }
                    if (this.MontoSinIGVEMP_18_36 == 0 && (this.countinputEMP_18_36 > 0 && this.planillainputEMP_18_36 > 0 && this.tasainputEMP_18_36 > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Empleado. <br />';
                    }
                }
            }

            if (this.MontoSinIGVOBR_18_36 > 0) {
                if (this.countinputOBR_18_36 > 0 || this.planillainputOBR_18_36 > 0 || this.tasainputOBR_18_36 > 0 || datosObrero == 0) {

                    if (this.countinputOBR_18_36 == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero. <br />';
                    }
                    if (this.planillainputOBR_18_36 == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero. <br />';
                    }
                    if (this.tasainputOBR_18_36 == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero. <br />';
                    }

                }
            } else {
                if (this.countinputOBR_18_36 > 0 || this.planillainputOBR_18_36 > 0 || this.tasainputOBR_18_36 > 0) {

                    if (this.countinputOBR_18_36 == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero. <br />';
                    }
                    if (this.planillainputOBR_18_36 == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero. <br />';
                    }
                    if (this.tasainputOBR_18_36 == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero. <br />';
                    }
                    if (this.MontoSinIGVOBR_18_36 == 0 && (this.countinputOBR_18_36 > 0 && this.planillainputOBR_18_36 > 0 && this.tasainputOBR_18_36 > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría Obrero. <br />';
                    }
                }
            }

            if (this.MontoSinIGVOAR_18_36 > 0) {
                if (this.countinputOAR_18_36 > 0 || this.planillainputOAR_18_36 > 0 || this.tasainputOAR_18_36 > 0 || datosObreroAR == 0) {

                    if (this.countinputOAR_18_36 == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero Alto Riesgo. <br />';
                    }

                    if (this.planillainputOAR_18_36 == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.tasainputOAR_18_36 == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Alto Riesgo. <br />';
                    }


                }
            } else {
                if (this.countinputOAR_18_36 > 0 || this.planillainputOAR_18_36 > 0 || this.tasainputOAR_18_36 > 0) {

                    if (this.countinputOAR_18_36 == 0) {
                        msg += 'Debe ingresar  el total de trabajadores  para la categoría Obrero Alto Riesgo. <br />';
                    }

                    if (this.planillainputOAR_18_36 == 0) {
                        msg += 'Debe ingresar  el monto de planilla  para la categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.tasainputOAR_18_36 == 0) {
                        msg += 'Debe ingresar  la tasa  para la categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.MontoSinIGVOAR_18_36 == 0 && (this.countinputOAR_18_36 > 0 && this.planillainputOAR_18_36 > 0 && this.tasainputOAR_18_36 > 0)) {
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
                    if (this.countinputEMP_18_36 == 0 && this.countinputEE > 0) {
                        msg += 'Debe ingresar datos  en la categoría Empleado para declarar su excedente. <br />';
                    }
                    if (this.countinputEMP_18_36 < this.countinputEE) {
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
                    if (this.countinputEMP_18_36 == 0 && this.countinputEE > 0) {
                        msg += 'Debe ingresar  datos en la categoría Empleado para declarar su excedente. <br />';
                    }
                    if (this.countinputEMP_18_36 < this.countinputEE) {
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
                    if (this.countinputOBR_18_36 == 0 && this.countinputOE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero para declarar su excedente. <br />';
                    }
                    if (this.countinputOBR_18_36 < this.countinputOE) {
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
                    if (this.countinputOBR_18_36 == 0 && this.countinputOE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero para declarar su excedente. <br />';
                    }
                    if (this.countinputOBR_18_36 < this.countinputOE) {
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
                    if (this.countinputOAR_18_36 == 0 && this.countinputOARE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero Alto Riesgo para declarar su excedente. <br />';
                    }
                    if (this.countinputOAR_18_36 < this.countinputOARE) {
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
                    if (this.countinputOAR_18_36 == 0 && this.countinputOARE > 0) {
                        msg += 'Debe ingresar datos en la categoría Obrero Alto Riesgo para declarar su excedente. <br />';
                    }
                    if (this.countinputOAR_18_36 < this.countinputOARE) {
                        msg += 'El total de trabajadores para la categoría Obrero Alto Riesgo Excedente no puede ser mayor a su categoría Obrero Alto Riesgo. <br />';
                    }
                    if (this.MontoSinIGVOARE == 0 && (this.countinputOARE > 0 && this.planillainputOARE > 0 && this.tasainputOARE > 0)) {
                        msg += 'Debe ingresar el Monto por cobrar sin IGV para la categoría  Obrero Alto Riesgo Excedente. <br />';
                    }
                }
            }

        }

        if (this.typeGobiernoMatriz) {
            if (this.flagActivateExc == 1) {
                //INICIO GCAA 11012024
                const camposFiltrar = [
                    this.tasainputEMP_18_36,
                    //this.tasainputEMP_56_63,
                    //this.tasainputEMP_71_80,
                    this.tasainputOBR_18_36,
                    //this.tasainputOBR_56_63,
                    //this.tasainputOBR_71_80,
                    this.tasainputOAR_18_36,
                    //this.tasainputOAR_56_63,
                    //this.tasainputOAR_71_80
                ];
                
                console.log('MATRIZ - GCAA - camposFiltrar');
                console.log(camposFiltrar);

                 const camposLlenosConValor = camposFiltrar.filter(campo => campo !== undefined && campo !== null && campo.toString() != '' && campo !== 0 && campo > 0);        
               
                 console.log('MATRIZ - GCAA - camposLlenosConValor');
                 console.log(camposLlenosConValor);

                 const valoresIguales = camposLlenosConValor.every(campo => campo === camposLlenosConValor[0]);
                
                 if (camposLlenosConValor.length > 1 && !valoresIguales) {
                    msg += 'Las Tasas tienen que ser iguales. <br />';
                 } 
                //FIN GCAA 11012024

         


                //6 campos
                /*
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOBR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputEE && 
                        this.tasainputEMP_18_36== this.tasainputOE && 
                        this.tasainputEMP_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOBR_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputOBR_18_36== this.tasainputEE && 
                        this.tasainputOBR_18_36== this.tasainputOE && 
                        this.tasainputOBR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputEE && 
                        this.tasainputEMP_18_36== this.tasainputOE && 
                        this.tasainputEMP_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOBR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputEE && 
                        this.tasainputEMP_18_36== this.tasainputOE && 
                        this.tasainputEMP_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOBR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputOE && 
                        this.tasainputEMP_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOBR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputEE && 
                        this.tasainputEMP_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOBR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputEE && 
                        this.tasainputEMP_18_36== this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //5 campos
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOBR_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputOBR_18_36== this.tasainputEE && 
                        this.tasainputOBR_18_36== this.tasainputOE && 
                        this.tasainputOBR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOAR_18_36== this.tasainputEE && 
                        this.tasainputOAR_18_36== this.tasainputOE && 
                        this.tasainputOAR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOBR_18_36== this.tasainputEE && 
                        this.tasainputOBR_18_36== this.tasainputOE && 
                        this.tasainputOBR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOBR_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputOBR_18_36== this.tasainputOE && 
                        this.tasainputOBR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOBR_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputOBR_18_36== this.tasainputEE && 
                        this.tasainputOBR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(
                        this.tasainputOBR_18_36== this.tasainputOAR_18_36&& 
                        this.tasainputOBR_18_36== this.tasainputEE && 
                        this.tasainputOBR_18_36== this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //4 campos
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOAR_18_36== this.tasainputEE && 
                        this.tasainputOAR_18_36== this.tasainputOE && 
                        this.tasainputOAR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEE == this.tasainputOE && 
                        this.tasainputEE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOAR_18_36== this.tasainputOE && 
                        this.tasainputOAR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputOAR_18_36== this.tasainputEE && 
                        this.tasainputOAR_18_36== this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(
                        this.tasainputOAR_18_36== this.tasainputEE && 
                        this.tasainputOAR_18_36== this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //3 campos ultimos
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(
                        this.tasainputEE == this.tasainputOE && 
                        this.tasainputEE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE == 0 && this.tasainputOE > 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputOE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }

                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE > 0 && this.tasainputOE == 0 && this.tasainputOARE > 0) {
                    if (!(this.tasainputEE == this.tasainputOARE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36== 0 && this.tasainputEE > 0 && this.tasainputOE > 0 && this.tasainputOARE == 0) {
                    if (!(this.tasainputEE == this.tasainputOE)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                //3 campos primeros
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0) {
                    if (!(this.tasainputEMP_18_36== this.tasainputOBR_18_36&& this.tasainputEMP_18_36== this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36== 0) {
                    if (!(this.tasainputEMP_18_36== this.tasainputOBR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0) {
                    if (!(this.tasainputEMP_18_36== this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEE == 0 && this.tasainputOE == 0 && this.tasainputOARE == 0 && this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0) {
                    if (!(this.tasainputOBR_18_36== this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                */

            } else {

                 //INICIO GCAA 11012024
                 const camposFiltrar = [
                    this.tasainputEMP_18_36,
                    //this.tasainputEMP_56_63,
                    //this.tasainputEMP_71_80,
                    this.tasainputOBR_18_36,
                    //this.tasainputOBR_56_63,
                    //this.tasainputOBR_71_80,
                    this.tasainputOAR_18_36,
                    //this.tasainputOAR_56_63,
                    //this.tasainputOAR_71_80
                ];

                 const camposLlenosConValor = camposFiltrar.filter(campo => campo !== undefined && campo !== null && campo.toString() != '' && campo !== 0 && campo > 0);        
                 const valoresIguales = camposLlenosConValor.every(campo => campo === camposLlenosConValor[0]);
                
                 if (camposLlenosConValor.length > 1 && !valoresIguales) {
                    msg += 'Las Tasas tienen que ser iguales. <br />';
                 } 
                //FIN GCAA 11012024


                /*
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0) {
                    if (!(
                        this.tasainputEMP_18_36== this.tasainputOBR_18_36&& 
                        this.tasainputEMP_18_36== this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36== 0) {
                    if (!(this.tasainputEMP_18_36== this.tasainputOBR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36> 0 && this.tasainputOBR_18_36== 0 && this.tasainputOAR_18_36> 0) {
                    if (!(this.tasainputEMP_18_36== this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }
                if (this.tasainputEMP_18_36== 0 && this.tasainputOBR_18_36> 0 && this.tasainputOAR_18_36> 0) {
                    if (!(this.tasainputOBR_18_36== this.tasainputOAR)) {
                        msg += 'Las Tasas tienen que ser iguales. <br />';
                    }
                }*/
                }

        }
        const self = this;
        if (msg == '') {
            //validar retroactividad
            if (this.codProducto == 3 && (this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION || this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION)) {
                self.isLoading = false;

                if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
                    if (this.inputsQuotation.P_NTYPE_END == 2) {
                        const response: any = await this.ValidateRetroactivity();

                        if (response.P_NCODE == 4) {
                            await swal.fire('Información', response.P_SMESSAGE, 'error');
                            //return; // bloquear derivacion a tecnica por retroactividad en endoso // ENDOSO TECNICA JTV 23012023
                        }
                    }
                }
                else {
                    const response: any = await this.ValidateRetroactivity();

                    if (response.P_NCODE == 4) {
                        await swal.fire('Información', response.P_SMESSAGE, 'error');
                        /*if (this.mode == 'exclude') {
                          return;
                        }*/
                    }
                }
                //self.isLoading = true;
            }

            if (self.template.ins_email || self.template.ins_addContact) {
                if (this.contractingdata != undefined) {
                    if (this.flagEmail || this.flagContact) {
                        this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                        this.contractingdata.P_TipOper = 'INS'
                        this.contractingdata.P_NCLIENT_SEG = -1;

                        if (this.flagEmail && this.inputsQuotation.P_SE_MAIL !== '') {
                            this.contractingdata.EListEmailClient = [];
                            const contractingEmail: any = {}
                            contractingEmail.P_CLASS = ''
                            contractingEmail.P_DESTICORREO = 'Correo Personal'
                            contractingEmail.P_NROW = 1
                            contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                            contractingEmail.P_SE_MAIL = this.inputsQuotation.P_SE_MAIL
                            contractingEmail.P_SORIGEN = 'SCTR'
                            contractingEmail.P_SRECTYPE = '4'
                            contractingEmail.P_TipOper = ''
                            this.contractingdata.EListEmailClient.push(contractingEmail)
                        } else {
                            this.contractingdata.EListEmailClient = null;
                        }

                        if (this.flagContact && this.contactList.length > 0) {
                            this.contractingdata.EListContactClient = [];
                            self.contactList.forEach(contact => {
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

                        if (((this.flagContact && this.contactList.length == 0) || (this.flagEmail && this.inputsQuotation.P_SE_MAIL === '')) && this.creditHistory != null) {
                            self.isLoading = false;
                            swal.fire({
                                title: 'Información',
                                text: this.creditHistory.nflag == 0 ? this.variable.var_contactHighScore : this.variable.var_contactLowScore,
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Continuar',
                                allowOutsideClick: false,
                                cancelButtonText: 'Cancelar'
                            })
                                .then(async (result) => {
                                    if (result.value) {
                                        self.isLoading = true;
                                        await this.updateContracting();
                                    } else {
                                        self.isLoading = false;
                                        return;
                                    }
                                });
                        } else {
                            await this.updateContracting();
                        }
                    } else {
                        if ((this.typeTran != CommonMethods.TIPO_TRANSACCION.EXCLUSION && this.typeTran != CommonMethods.TIPO_TRANSACCION.ENDOSO) || (this.inputsQuotation.P_NTYPE_END == 2 && this.GetAmountDetailTotalListValue(1, this.inputsQuotation.frecuenciaPago) > 0)) {  // ENDOSO TECNICA JTV 12042023
                            if (this.typeTran != CommonMethods.TIPO_TRANSACCION.INCLUSION && this.typeTran != CommonMethods.TIPO_TRANSACCION.ENDOSO && this.typeTran != CommonMethods.TIPO_TRANSACCION.DECLARACION && this.typeTran != CommonMethods.TIPO_TRANSACCION.RENOVACION) {
                                this.emitirCotizacion();
                            } else {
                                self.isLoading = false;
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
                                        self.isLoading = true;
                                        this.conModificacion();
                                    }
                                });
                            }
                        } else {
                            this.proccessTrx();
                        }
                    }
                } else {
                    swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
                    self.isLoading = false;
                    return;
                }
            } else {
                if (this.typeTran != CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
                    this.emitirCotizacion()
                } else {
                    this.proccessTrx();
                }
            }

        } else {
            swal.fire('Información', msg, 'error');
            self.isLoading = false;
            return;
        }
    }

    conModificacion() {
        let self = this;
        let dataQuotation: any = {};

        const myFiles: FormData = new FormData(); /* Para los archivos EH */
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });

        dataQuotation.P_STRAN = 'RC'; //this.sAbTransac;
        dataQuotation.P_SCLIENT = this.inputsQuotation.SCLIENT;
        dataQuotation.P_NCURRENCY = this.inputsQuotation.P_NCURRENCY;
        dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = 0;
        dataQuotation.P_SCOMMENT = this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, '');
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NREM_EXC = this.inputsQuotation.P_NREM_EXC == true ? 1 : 0; //RQ EXC EHH
        dataQuotation.RetOP = 2; //ehh retroactividad
        //dataQuotation.planId = this.typeTran == 'Endoso' ? 0 : this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.inputsQuotation.desTipoPlan).NIDPLAN;
        dataQuotation.planId = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.inputsQuotation.P_NIDPLAN : this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.inputsQuotation.desTipoPlan).NIDPLAN; // ENDOSOS TECNICA JTV 24012023
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        if (this.codProducto == 3) {
            dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
            dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
            dataQuotation.NumeroCotizacion = this.nrocotizacion;
            dataQuotation.CodigoProceso = this.nidProc;
            if (this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION) {
                dataQuotation.TrxCode = 'IN';
            } else if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
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
            dataQuotation.P_NTIP_RENOV = this.inputsQuotation.tipoRenovacion;
            dataQuotation.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago;
            dataQuotation.P_SCOD_ACTIVITY_TEC = !this.template.ins_actRealizarSave ? null : this.inputsQuotation.P_NTECHNICAL; // Vida Ley
            dataQuotation.P_NTIP_NCOMISSION = this.inputsQuotation.P_COMISION; // Vida Ley
            dataQuotation.P_SCOD_CIUU = !this.template.ins_subActividadSave ? null : this.inputsQuotation.P_NECONOMIC; // Vida Ley
            dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.FDateIni); //Fecha Inicio
            dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.FDateFin); // Fecha hasta

            if (this.template.ins_iniVigenciaAseg) {
                dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
            }
            if (this.template.ins_finVigenciaAseg) {
                dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
            }
        }

        // Detalle de Cotizacion Pension
        if (this.codProducto == 2) {
            if (this.listaTasasPension.length > 0) {
                this.listaTasasPension.forEach(dataPension => {
                    let savedPolicyEmit: any = {};
                    savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; //Cotizacion
                    savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch;
                    savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Pensión
                    savedPolicyEmit.P_NMODULEC = dataPension.TIP_RIESGO;
                    savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataPension.NUM_TRABAJADORES;
                    savedPolicyEmit.P_NMONTO_PLANILLA = dataPension.MONTO_PLANILLA;
                    savedPolicyEmit.P_NTASA_CALCULADA = dataPension.TASA_CALC;
                    savedPolicyEmit.P_NTASA_PROP = dataPension.TASA_PRO == '' ? '0' : dataPension.TASA_PRO;
                    savedPolicyEmit.P_NPREMIUM_MENSUAL = dataPension.PRIMA;
                    savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
                    savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                    savedPolicyEmit.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == null ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
                    savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                    savedPolicyEmit.P_NSUM_IGV = this.igvPensionSave;
                    savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                    savedPolicyEmit.P_NRATE = dataPension.rateDet == null ? '0' : dataPension.rateDet;
                    savedPolicyEmit.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                    savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                    savedPolicyEmit.P_FLAG = '0';
                    dataQuotation.QuotationDet.push(savedPolicyEmit);
                });
            }
        } else {
            for (let i = 0; i < this.categoryList.length; i++) {
                const itemQuotationDet: any = {};
                itemQuotationDet.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
                itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
        itemQuotationDet.P_RANGO = this.categoryList[i].SRANGO_EDAD; /// GCAA 10102023
                itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
                itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
                itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
                itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate;
                itemQuotationDet.P_NPREMIUM_MENSUAL = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountPremiumList[i].NPREMIUMN_TOT : CommonMethods.formatValor((parseFloat(this.categoryList[i].NTOTAL_PLANILLA) * parseFloat(this.categoryList[i].NTASA)) / 100, 2);
                itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION; // EH this.polizaEmitCab.P_PRIMA_END_PENSION;
                itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
                itemQuotationDet.P_NSUM_PREMIUMN = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountDetailTotalList[0].NAMOUNT_TOT : this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
                itemQuotationDet.P_NSUM_IGV = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountDetailTotalList[1].NAMOUNT_TOT : this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
                itemQuotationDet.P_NSUM_PREMIUM = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountDetailTotalList[2].NAMOUNT_TOT : this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
                itemQuotationDet.P_NRATE = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? 0 : this.rateByPlanList[0].NTASA;
                itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                itemQuotationDet.P_FLAG = '0';
                /* Nuevos parametros ins_cotizacion_det EHH */
                itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
                itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
                itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
                /* * */
                dataQuotation.QuotationDet.push(itemQuotationDet);
            }
        }


        // Detalle de Cotizacion Salud
        if (this.listaTasasSalud.length > 0) {

            this.listaTasasSalud.forEach(dataSalud => {
                const savedPolicyEmit: any = {};
                savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; //Cotizacion
                savedPolicyEmit.P_NBRANCH = this.saludID.nbranch;
                savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Pensión
                savedPolicyEmit.P_NMODULEC = dataSalud.id;
                savedPolicyEmit.P_NTOTAL_TRABAJADORES = dataSalud.totalWorkes;
                savedPolicyEmit.P_NMONTO_PLANILLA = dataSalud.planilla;
                savedPolicyEmit.P_NTASA_CALCULADA = dataSalud.rate;
                savedPolicyEmit.P_NTASA_PROP = dataSalud.planProp == '' ? '0' : dataSalud.planProp;
                savedPolicyEmit.P_NPREMIUM_MENSUAL = dataSalud.premiumMonth;
                savedPolicyEmit.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_SALUD;
                savedPolicyEmit.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO;
                savedPolicyEmit.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_SALUD == null ? '0' : this.inputsQuotation.P_PRIMA_END_SALUD;
                savedPolicyEmit.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                savedPolicyEmit.P_NSUM_IGV = this.igvSaludSave;
                savedPolicyEmit.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                savedPolicyEmit.P_NRATE = dataSalud.rateDet == null ? '0' : dataSalud.rateDet;
                savedPolicyEmit.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                savedPolicyEmit.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                savedPolicyEmit.P_FLAG = '0';
                dataQuotation.QuotationDet.push(savedPolicyEmit);
            });
        }

        // Comercializadores secundarios
        if (this.codProducto == 2) {
            if (this.brokerList.length > 0) {
                var index = 0;
                this.brokerList.forEach(dataBroker => {
                    let itemQuotationCom: any = {};
                    itemQuotationCom.P_NID_COTIZACION = this.cotizacionID; //Cotizacion
                    itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
                    itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Produccion
                    itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                    itemQuotationCom.P_NCOMISION_SAL = self.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD == '' ? '0' : dataBroker.P_COM_SALUD : '0';
                    itemQuotationCom.P_NCOMISION_SAL_PR = self.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD_PRO == '' ? '0' : dataBroker.P_COM_SALUD_PRO : '0';
                    itemQuotationCom.P_NCOMISION_PEN = self.listaTasasPension.length > 0 ? dataBroker.P_COM_PENSION == '' ? '0' : dataBroker.P_COM_PENSION : '0';
                    itemQuotationCom.P_NCOMISION_PEN_PR = self.listaTasasPension.length > 0 ? dataBroker.P_COM_PENSION_PRO == '' ? '0' : dataBroker.P_COM_PENSION_PRO : '0';
                    itemQuotationCom.P_NPRINCIPAL = dataBroker.PRINCIPAL;
                    itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                    dataQuotation.QuotationCom.push(itemQuotationCom);
                    index = index + 1;
                });
            }
        }
        else {
            if (this.brokerList.length > 0 && (this.sAbTransac == "EM")) {
                var index = 0;
                this.brokerList.forEach(dataBroker => {
                    const itemQuotationCom: any = {};
                    itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
                    itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Desarrollo
                    itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                    itemQuotationCom.P_NCOMISION_SAL = 0
                    itemQuotationCom.P_NCOMISION_SAL_PR = 0
                    itemQuotationCom.P_NCOMISION_PEN = 0
                    itemQuotationCom.P_NCOMISION_PEN_PR = 0
                    itemQuotationCom.P_NPRINCIPAL = 1;
                    itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                    dataQuotation.QuotationCom.push(itemQuotationCom);
                    index = index + 1;
                });
            } else if (this.brokerList.length > 0 && (this.sAbTransac == "RE")) {
                var index = 0;
                this.brokerList.forEach(dataBroker => {
                    const itemQuotationCom: any = {};
                    itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
                    itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Desarrollo
                    itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                    itemQuotationCom.P_NCOMISION_SAL = dataBroker.P_COM_SALUD;
                    itemQuotationCom.P_NCOMISION_SAL_PR = 0
                    itemQuotationCom.P_NCOMISION_PEN = 0
                    itemQuotationCom.P_NCOMISION_PEN_PR = 0
                    itemQuotationCom.P_NPRINCIPAL = 1;
                    itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                    dataQuotation.QuotationCom.push(itemQuotationCom);
                    index = index + 1;
                });
            }
        }

        //--Ini - Marcos Silverio
        dataQuotation.planSeleccionado = this.inputsQuotation.desTipoPlan == undefined ? '' : this.inputsQuotation.desTipoPlan;
        dataQuotation.planPropuesto = this.planPropuesto == undefined ? '' : this.planPropuesto;
        //--Fin - Marcos Silverio

        // INI ENDOSOS TECNICA JTV 10012023
        //dataQuotation.TipoEndoso = this.inputsQuotation.TYPE_ENDOSO === '' ? this.inputsQuotation.TYPE_ENDOSO = 0 : this.inputsQuotation.TYPE_ENDOSO;
        dataQuotation.TipoEndoso = this.inputsQuotation.P_NTYPE_END === '' ? 0 : this.inputsQuotation.P_NTYPE_END;
        // FIN ENDOSOS TECNICA JTV 10012023

        this.obtenerTipoRenovacion();

        if (this.codProducto == 2) {
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
                    self.loading = true;
                    this.policyemit.renewMod(dataQuotation).subscribe(
                        res => {
                            self.loading = false;
                            if (res.P_COD_ERR == 0) {
                                this.validarTrama(undefined);

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
            });
        } else {
            //self.loading = true;
            self.isLoading = true;
            this.policyemit.renewMod(dataQuotation, myFiles).subscribe(
                res => {
                    self.isLoading = false;
                    if (res.P_COD_ERR == 0) {

                        if (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') {

                            /* Gestión Trámite EHH - comentado */
                            let _primaTotal = 0;
                            try {
                                _primaTotal = this.amountDetailTotalList[2].NAMOUNT_TOT
                            } catch (e) {
                                _primaTotal = 0;
                            }
                            if (this.codProducto == 3 && this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO && res.P_SAPROBADO == 'S' && _primaTotal <= 0) {
                                this.createJob();
                            } else {

                                this.objetoTrxPol(res);
                                // this.createJob();
                            }
                        } else {
                            if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                                swal.fire('Información', /*'Se ha generado correctamente la renovación N° ' + this.nrocotizacion + '. ' + */res.P_SMESSAGE, 'success');
                                this.router.navigate(['/extranet/policy-transactions-all']);
                            }

                        }
                    } else {
                        self.isLoading = false;
                        swal.fire('Información', res.P_MESSAGE, 'error');
                    }
                },
                err => {
                    self.isLoading = false;
                    swal.fire('Información', 'Hubo un error con el servidor', 'error');
                }
            );
        }
    }

    async updateContracting() {
        if ((this.flagEmail && this.inputsQuotation.P_SE_MAIL !== '') || (this.flagContact && this.contactList.length > 0)) {
            this.contractingdata.EListAddresClient = null;
            this.contractingdata.EListPhoneClient = null;
            this.contractingdata.EListCIIUClient = null;

            await this.clientInformationService.getCliente360(this.contractingdata).toPromise().then(
                res => {
                    if (res.P_NCODE == '0' || res.P_NCODE == '2') {
                        this.flagEmail = false;
                        this.flagContact = false;
                        this.emitirCotizacion()
                    } else {
                        this.isLoading = false;
                        swal.fire('Información', res.P_SMESSAGE, 'error');
                        return;
                    }
                }
            );
        } else {
            this.emitirCotizacion()
        }
    }

    async emitirCotizacion() {
        const self = this;
        self.isLoading = false;
        let tipoTexto = '¿Desea generar la cotización?';
        let confirmButtonTexto = 'Generar';
        let cancelButtonTexto = 'Cancelar';
        //if (this.nrocotizacion == undefined || this.nrocotizacion == ''){
        if (this.flagGobiernoEstado != true) {
            const response: any = await this.ValidateRetroactivity();
            if (response.P_NCODE == 4) {
                this.derivaRetroactividad = true;
                await swal.fire('Información', response.P_SMESSAGE, 'error');
                //return;
            } else {
                this.derivaRetroactividad = false;
            }
        } else {
            tipoTexto = this.flagPolizaMat ? '¿Desea generar trámite de Emisión de póliza matriz?' : '¿Desea generar el trámite de Emisión?';
            confirmButtonTexto = 'Si';
            cancelButtonTexto = 'No';
        }
        //}

        swal.fire({
            title: 'Información',
            text: tipoTexto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: confirmButtonTexto,
            allowOutsideClick: false,
            cancelButtonText: cancelButtonTexto
        })
            .then((result) => {
                if (result.value) {
                    self.isLoading = true;
                    if (self.template.ins_sede) {
                        if (self.sedesList.length == 0) {
                            const sede: any = {};
                            sede.Action = '1'
                            sede.Address = 'DIRECCION PRINCIPAL'
                            sede.ContactList = []
                            sede.ContractorId = this.contratanteId
                            sede.DepartmentId = this.inputsQuotation.P_NPROVINCE
                            sede.Description = 'PRINCIPAL'
                            sede.DistrictId = this.inputsQuotation.P_NMUNICIPALITY
                            sede.EconomicActivityId = this.inputsQuotation.P_NECONOMIC
                            sede.ProvinceId = this.inputsQuotation.P_NLOCAL
                            sede.StateId = '1'
                            sede.TechnicalActivityId = this.inputsQuotation.P_NTECHNICAL
                            sede.TypeId = '1'
                            sede.UserCode = JSON.parse(localStorage.getItem('currentUser'))['id']

                            this.contractorLocationIndexService.updateContractorLocation(sede).subscribe(
                                res => {
                                    if (res.P_NCODE == 0) {
                                        this.sedeId = res.P_RESULT;
                                        self.proceso(this.sedeId, self)
                                    } else if (res.P_NCODE == 1) {
                                        self.isLoading = false;
                                        swal.fire('Información', 'Ocurrió un problema en la creación de la sede', 'error');
                                        return;
                                    } else if (res.P_NCODE == 2) {
                                        self.proceso(this.sedeId, self)
                                    }
                                },
                                err => {
                                    swal.fire('Información', err, 'error');
                                }
                            );
                        } else {
                            self.proceso(this.sedeId, self)
                        }
                    } else {
                        self.proceso(1, self)
                    }
                }
            });
    }

    async proceso(sedeId, self) {
        // Inicio
        let startDate = null;
        let endDate = null;

        let startDateAseg = null;
        let endDateAseg = null;

        if (this.template.ins_iniVigencia) {
            startDate = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
        } else {
            const now = new Date();
            startDate = CommonMethods.formatDate(now);
        }

        if (this.template.ins_finVigencia) {
            endDate = CommonMethods.formatDate(this.inputsQuotation.FDateFin);
        }

        if (this.template.ins_iniVigenciaAseg) {
            startDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
        }

        if (this.template.ins_finVigenciaAseg) {
            endDateAseg = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
        }

        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
            startDateAseg = CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion);
        }
        let tran = this.sAbTransac;
        /*let tran = '';
        if (this.typeTran == 'Inclusión') {
          tran = 'IN';
        } else if (this.typeTran == 'Declaración') {
          tran = 'DE';
        } else if (this.typeTran == 'Renovación') {
          tran = 'RE';
        } else if (this.typeTran == 'Exclusión') {
          tran = 'EX';
        } else {
          tran = 'EM'
        }*/

        const dataQuotation: any = {};
        dataQuotation.P_SCLIENT = this.contratanteId;
        dataQuotation.P_NCURRENCY = this.inputsQuotation.P_NCURRENCY;
        dataQuotation.P_NBRANCH = this.inputsQuotation.NBRANCH;
        dataQuotation.P_DSTARTDATE = startDate; // Fecha Inicio
        dataQuotation.P_DEXPIRDAT = endDate; // Fecha Inicio

        dataQuotation.P_DSTARTDATE_ASE = startDateAseg;
        dataQuotation.P_DEXPIRDAT_ASE = endDateAseg;

        dataQuotation.P_NIDCLIENTLOCATION = this.template.ins_sede ? self.sedesList.length > 0 ? this.inputsQuotation.P_NIDSEDE : sedeId : sedeId;
        dataQuotation.P_SCOMMENT = this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, '');
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = this.userId;
        dataQuotation.P_NACT_MINA = this.inputsQuotation.P_MINA == true ? 1 : 0;
        dataQuotation.P_NTIP_RENOV = this.inputsQuotation.tipoRenovacion; // Vida Ley
        dataQuotation.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago; // Vida Ley
        dataQuotation.P_SCOD_ACTIVITY_TEC = !this.template.ins_actRealizarSave ? null : this.inputsQuotation.P_NTECHNICAL; // Vida Ley
        dataQuotation.P_SCOD_CIUU = !this.template.ins_subActividadSave ? null : this.inputsQuotation.P_NECONOMIC; // Vida Ley
        dataQuotation.P_NTIP_NCOMISSION = this.inputsQuotation.P_COMISION; // Vida Ley
        dataQuotation.P_NPRODUCT = this.inputsQuotation.P_NPRODUCT; // Vida Ley
        dataQuotation.P_NEPS = this.epsItem.NCODE // Mapfre
        dataQuotation.P_NPENDIENTE = this.inputsQuotation.P_NPENDIENTE // Mapfre
        dataQuotation.P_NCOMISION_SAL_PR = 0 // MRC
        dataQuotation.CodigoProceso = this.nidProc // MRC
        dataQuotation.P_NREM_EXC = this.inputsQuotation.P_NREM_EXC == true ? 1 : 0; //RQ EXC EHH
        dataQuotation.P_DERIVA_RETRO = this.derivaRetroactividad == true ? 1 : 0;//ehh retroactividad
        dataQuotation.retOP = 2; //ehh retroactividad
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIni.setHours(0, 0, 0, 0) ? 1 : 0;//ehh retroactividad
        dataQuotation.TrxCode = tran;
        dataQuotation.tipoEndoso = this.inputsQuotation.P_NTYPE_END == '' ? 0 : this.inputsQuotation.P_NTYPE_END; //rq mejoras de endoso
        dataQuotation.SMAIL_EJECCOM = this.inputsQuotation.SMAIL_EJECCOM;
        dataQuotation.P_SPOL_MATRIZ = this.flagPolizaMat == true ? 1 : 0;
        dataQuotation.P_SPOL_ESTADO = this.flagGobiernoEstado == true ? 1 : 0;
        dataQuotation.FlagCotEstado = dataQuotation.P_SPOL_ESTADO;
        dataQuotation.P_NIDPLAN = this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.inputsQuotation.desTipoPlanPM).NIDPLAN;;
        dataQuotation.P_APROB_CLI = this.flagAprobCli == true ? 1 : 0;
        let desTipoPlan = this.flagPolizaMat == true ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan;
        let planPropuesto = this.flagPolizaMat == true ? this.inputsQuotation.desTipoPlanPM : this.planPropuesto;
        dataQuotation.flagComerExclu = this.flagComerExclu; //RQ - Perfil Nuevo - Comercial Exclusivo

        localStorage.setItem('dataquotation', JSON.stringify(dataQuotation));

        if (this.codProducto == 3) {
            dataQuotation.NumeroCotizacion = this.nrocotizacion;
            if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
                dataQuotation.P_NID_TRAMITE = this.inputsQuotation.P_NID_TRAMITE;
            }
            if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                dataQuotation.recotizacion = 1;
            }
        }
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        if (this.listaTasasSalud.length > 0 && this.template.ins_mapfre) {
            dataQuotation.cotizacionMapfre = {}
            dataQuotation.cotizacionMapfre.cabecera = {}
            dataQuotation.cotizacionMapfre.cabecera.tariff = this.reloadTariff
            dataQuotation.cotizacionMapfre.cabecera.keyService = 'cotizar'
            dataQuotation.cotizacionMapfre.poliza = {}
            dataQuotation.cotizacionMapfre.poliza.fecEfecSpto = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
            dataQuotation.cotizacionMapfre.poliza.fecVctoSpto = CommonMethods.formatDate(this.inputsQuotation.FDateFin);
            dataQuotation.cotizacionMapfre.poliza.codFormaDeclaracion = await this.equivalenciaMapfre(this.inputsQuotation.tipoRenovacion, 'renovacion', 'tableKey') // Tipo de renovación
            dataQuotation.cotizacionMapfre.poliza.codActRiesgo = await this.equivalenciaMapfre(this.inputsQuotation.P_NECONOMIC, 'actividadEconomica', 'tableKey') // Revisar CIIU
            dataQuotation.cotizacionMapfre.poliza.tipoPeriodo = this.inputsQuotation.tipoRenovacion == '5' || this.inputsQuotation.tipoRenovacion == '4' ? 'C' : 'N' // Revisar
            dataQuotation.cotizacionMapfre.poliza.moneda = {}
            dataQuotation.cotizacionMapfre.poliza.moneda.codMon = this.inputsQuotation.P_NCURRENCY
            dataQuotation.cotizacionMapfre.producto = {}
            dataQuotation.cotizacionMapfre.riesgoSCTR = []
            const item: any = {}
            item.nomCentroRiesgoSalud = this.inputsQuotation.P_SSEDE
            item.numAsegSalud = this.inputsQuotation.P_WORKER;
            item.impPlanillaSalud = this.inputsQuotation.P_PLANILLA;
            dataQuotation.cotizacionMapfre.riesgoSCTR.push(item)
            dataQuotation.cotizacionMapfre.contratante = {}
            dataQuotation.cotizacionMapfre.contratante.tipDocum = await this.equivalenciaMapfre(this.inputsQuotation.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey')  //'DNI' equivalente
            dataQuotation.cotizacionMapfre.contratante.codDocum = this.inputsQuotation.P_SIDDOC
            dataQuotation.cotizacionMapfre.contratante.nombre = this.contractingdata.P_NPERSON_TYP == '1' ? this.contractingdata.P_SFIRSTNAME + ' ' + this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : this.contractingdata.P_SLEGALNAME
            dataQuotation.cotizacionMapfre.mcaGuardado = 'S'
        }

        // Detalle de Cotizacion Pension
        if (this.template.ins_pensionList) {
            if (this.listaTasasPension.length > 0) {
                this.listaTasasPension.forEach(dataPension => {
                    if (dataPension.sactive) {
                        const itemQuotationDet: any = {};
                        itemQuotationDet.P_NBRANCH = this.pensionID.nbranch;
                        itemQuotationDet.P_NPRODUCT = this.pensionID.id;
                        itemQuotationDet.P_NMODULEC = dataPension.id;
                        itemQuotationDet.P_NTOTAL_TRABAJADORES = dataPension.totalWorkes;
                        itemQuotationDet.P_NMONTO_PLANILLA = dataPension.planilla;
                        itemQuotationDet.P_NTASA_CALCULADA = dataPension.rate;
                        itemQuotationDet.P_NTASA_PROP = dataPension.planProp == '' ? '0' : dataPension.planProp;
                        itemQuotationDet.P_NPREMIUM_MENSUAL = dataPension.premiumMonth;
                        itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
                        itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                        itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
                        itemQuotationDet.P_NSUM_PREMIUMN = this.totalNetoPensionSave;
                        itemQuotationDet.P_NSUM_IGV = this.igvPensionSave;
                        itemQuotationDet.P_NSUM_PREMIUM = this.brutaTotalPensionSave;
                        itemQuotationDet.P_NRATE = dataPension.rateDet == '' ? '0' : dataPension.rateDet;
                        itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                        itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                        itemQuotationDet.P_FLAG = '0';
                        //Ini - RI
                        itemQuotationDet.P_NAMO_AFEC = this.totalNetoPensionSave;
                        itemQuotationDet.P_NIVA = this.igvPensionSave;
                        itemQuotationDet.P_NAMOUNT = this.brutaTotalPensionSave;
                        itemQuotationDet.P_NDE = CommonMethods.formatValor(Number(this.inputsQuotation.primaComPension) - Number(this.totalNetoPensionSave), 2);
                        //Fin - RI
                        dataQuotation.QuotationDet.push(itemQuotationDet);
                    }
                });
            }
        }

        if (this.flagPolizaMat != true) {
            if (this.template.ins_categoriaList) {
                for (let i = 0; i < this.categoryList.length; i++) {
                    const itemQuotationDet: any = {};
                    if (this.nTransac == 8) {
                        itemQuotationDet.P_NID_COTIZACION = this.nrocotizacion;
                    }
                    itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                    itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                    itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
          itemQuotationDet.P_RANGO = this.categoryList[i].SRANGO_EDAD; /// GCAA 10102023
                    itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
                    itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
                    itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
                    itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate
                    itemQuotationDet.P_NPREMIUM_MENSUAL = this.nTransac == 8 ? this.amountPremiumList[i].NPREMIUMN_TOT : CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
                    itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION;
                    itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                    itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
                    itemQuotationDet.P_NSUM_PREMIUMN = this.nTransac == 8 ? this.amountDetailTotalList[0].NAMOUNT_TOT : this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
                    itemQuotationDet.P_NSUM_IGV = this.nTransac == 8 ? this.amountDetailTotalList[1].NAMOUNT_TOT : this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
                    itemQuotationDet.P_NSUM_PREMIUM = this.nTransac == 8 ? this.amountDetailTotalList[2].NAMOUNT_TOT : this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
                    itemQuotationDet.P_NRATE = this.nTransac == 8 ? 0 : this.rateByPlanList[0].NTASA;
                    itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
                    itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
                    itemQuotationDet.P_FLAG = '0';
                    /* Nuevos parametros ins_cotizacion_det EHH */
                    itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.nTransac == 8 ? 9 : this.inputsQuotation.frecuenciaPago);
                    itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.nTransac == 8 ? 9 : this.inputsQuotation.frecuenciaPago);
                    itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.nTransac == 8 ? 9 : this.inputsQuotation.frecuenciaPago);
                    /* * */
                 //if (itemQuotationDet.P_NTOTAL_TRABAJADORES >0){ /// GCAA
                    dataQuotation.QuotationDet.push(itemQuotationDet);
                  
                //}
            }
      }
        } else {


            if (this.template.ins_categoriaList) {
                // this.listFlagCategory[0].flagEMP = false;
                // let flagOBR = true; let flagOAR = true; let flagEE = true; let flagOE = true; let flagOARE = true;
                if (this.countinputEMP_18_36 != 0 || this.planillainputEMP_18_36 != 0 || this.tasainputEMP_18_36 != 0 || this.MontoSinIGVEMP_18_36 != 0) {
                    this.categoryPolizaMatList[0].sactive = true;
                }
            
                //if (this.countinputEMP_37_55 != 0 || this.planillainputEMP_37_55 != 0 || this.tasainputEMP_37_55 != 0 || this.MontoSinIGVEMP_37_55 != 0) {
                //this.categoryPolizaMatList[1].sactive = true;
                //}

                //if (this.countinputEMP_56_63 != 0 || this.planillainputEMP_56_63 != 0 || this.tasainputEMP_56_63 != 0 || this.MontoSinIGVEMP_56_63 != 0) {
                //this.categoryPolizaMatList[2].sactive = true;
                //}
              
                //if (this.countinputEMP_64_70 != 0 || this.planillainputEMP_64_70 != 0 || this.tasainputEMP_64_70 != 0 || this.MontoSinIGVEMP_64_70 != 0 ) {
                //this.categoryPolizaMatList[3].sactive = true;
                //}

                //if (this.countinputEMP_71_80 != 0 || this.planillainputEMP_71_80 != 0 || this.tasainputEMP_71_80 != 0 || this.MontoSinIGVEMP_71_80 != 0) {
                //this.categoryPolizaMatList[4].sactive = true;
                //}

                //if (this.countinputEMP_81_99 != 0 || this.planillainputEMP_81_99 != 0 || this.tasainputEMP_81_99 != 0 || this.MontoSinIGVEMP_81_99 != 0) {
                //this.categoryPolizaMatList[5].sactive = true;
                //}

                    ///////////////////////////////
                if (this.countinputOBR_18_36 != 0 || this.planillainputOBR_18_36 != 0 || this.tasainputOBR_18_36 != 0 || this.MontoSinIGVOBR_18_36 != 0) {
                    this.categoryPolizaMatList[1].sactive = true;
                } 
  
                //if (this.countinputOBR_18_36 != 0 || this.planillainputOBR_18_36 != 0 || this.tasainputOBR_18_36 != 0 || this.MontoSinIGVOBR_18_36 != 0) {
                //    this.categoryPolizaMatList[6].sactive = true;
                //}

                //if (this.countinputOBR_37_55 != 0 || this.planillainputOBR_37_55 != 0 || this.tasainputOBR_37_55 != 0 || this.MontoSinIGVOBR_37_55 != 0) {
                //    this.categoryPolizaMatList[7].sactive = true;
                //}
        
                //if (this.countinputOBR_56_63 != 0 || this.planillainputOBR_56_63 != 0 || this.tasainputOBR_56_63 != 0 || this.MontoSinIGVOBR_56_63 != 0) {
                //    this.categoryPolizaMatList[8].sactive = true;
                //}
        
                //if (this.countinputOBR_64_70 != 0 || this.planillainputOBR_64_70 != 0 || this.tasainputOBR_64_70 != 0 || this.MontoSinIGVOBR_64_70 != 0) {
                //    this.categoryPolizaMatList[9].sactive = true;
                //}

                //if (this.countinputOBR_71_80 != 0 || this.planillainputOBR_71_80 != 0 || this.tasainputOBR_71_80 != 0 || this.MontoSinIGVOBR_71_80 != 0) {
                //    this.categoryPolizaMatList[10].sactive = true;
                //}
        
                //if (this.countinputOBR_81_99 != 0 || this.planillainputOBR_81_99 != 0 || this.tasainputOBR_81_99 != 0 || this.MontoSinIGVOBR_81_99 != 0) {
                //    this.categoryPolizaMatList[11].sactive = true;
                //}

                    ///////////////////////////////
                if (this.countinputOAR_18_36 != 0 || this.planillainputOAR_18_36 != 0 || this.tasainputOAR_18_36 != 0 || this.MontoSinIGVOAR_18_36 != 0) {
                    this.categoryPolizaMatList[2].sactive = true;
                }

                //if (this.countinputOAR_18_36 != 0 || this.planillainputOAR_18_36 != 0 || this.tasainputOAR_18_36 != 0 || this.MontoSinIGVOAR_18_36 != 0) {
                //    this.categoryPolizaMatList[12].sactive = true;
                //}
            
                //if (this.countinputOAR_37_55 != 0 || this.planillainputOAR_37_55 != 0 || this.tasainputOAR_37_55 != 0 || this.MontoSinIGVOAR_37_55 != 0) {
                //    this.categoryPolizaMatList[13].sactive = true;
                //}

                //if (this.countinputOAR_56_63 != 0 || this.planillainputOAR_56_63!= 0 || this.tasainputOAR_56_63 != 0 || this.MontoSinIGVOAR_56_63 != 0) {
                //    this.categoryPolizaMatList[14].sactive = true;
                //}

                //if (this.countinputOAR_64_70 != 0 || this.planillainputOAR_64_70 != 0 || this.tasainputOAR_64_70 != 0 || this.MontoSinIGVOAR_64_70 != 0) {
                //    this.categoryPolizaMatList[15].sactive = true;
                //}

                //if (this.countinputOAR_71_80 != 0 || this.planillainputOAR_71_80 != 0 || this.tasainputOAR_56_63 != 0 || this.MontoSinIGVOAR_71_80 != 0 ) {
                //    this.categoryPolizaMatList[16].sactive = true;
                //    }

                //if (this.countinputOAR_81_99 != 0 || this.planillainputOAR_81_99 != 0 || this.tasainputOAR_81_99 != 0 || this.MontoSinIGVOAR_81_99 != 0) {
                //    this.categoryPolizaMatList[17].sactive = true;
                //}

                    ///////////////////////////////

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
          if (this.categoryPolizaMatList[i].sactive == true) { // SI ES POLIZA MATRIZ
                        const itemQuotationDet: any = {};
                        itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
                        itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
                        itemQuotationDet.P_NMODULEC = this.categoryPolizaMatList[i].NCATEGORIA;
            itemQuotationDet.P_RANGO = this.categoryPolizaMatList[i].rango; /// GCAA 10102023

            console.log(this.categoryPolizaMatList);
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1) {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_18_36;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_18_36;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_18_36;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_18_36;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_18_36;
                        }
            
                        /*
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1 &&  this.categoryPolizaMatList[i].rango == '18-36') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_18_36;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_18_36;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_18_36;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_18_36;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_18_36;
                        }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1 &&  this.categoryPolizaMatList[i].rango == '37-55') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_37_55;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_37_55;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_37_55;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_37_55;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_37_55;
                        }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1 &&  this.categoryPolizaMatList[i].rango == '56-63') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_56_63;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_56_63;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_56_63;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_56_63;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_56_63;
                        }
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1 &&  this.categoryPolizaMatList[i].rango == '64-70') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_64_70;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_64_70;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_64_70;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_64_70;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_64_70;
              }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1 &&  this.categoryPolizaMatList[i].rango == '71-80') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_71_80 ?? 0;
              }
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 1 &&  this.categoryPolizaMatList[i].rango == '81-99') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputEMP_81_99 ?? 0;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputEMP_71_80 ?? 0;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVEMP_71_80 ?? 0;
                        }*/

                         ///////////////////////////////
                         if (this.categoryPolizaMatList[i].NCATEGORIA == 2) {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_18_36;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_18_36;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_18_36;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_18_36;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_18_36;
                        }      
                        /*
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 2 &&  this.categoryPolizaMatList[i].rango == '18-36') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_18_36;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_18_36;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_18_36;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_18_36;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_18_36;
                        }        

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 2 &&  this.categoryPolizaMatList[i].rango == '37-55') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_37_55;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_37_55;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_37_55;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_37_55;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_37_55;
                        }
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 2 &&  this.categoryPolizaMatList[i].rango == '56-63') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_56_63;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_56_63;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_56_63;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_56_63;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_56_63;
                        }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 2 &&  this.categoryPolizaMatList[i].rango == '64-70') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_64_70;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_64_70;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_64_70;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_64_70;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_64_70;
                        }
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 2 &&  this.categoryPolizaMatList[i].rango == '71-80') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_71_80;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_71_80;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_71_80;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_71_80;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_71_80;
              }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 2 &&  this.categoryPolizaMatList[i].rango == '81-99') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOBR_81_99;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOBR_81_99;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOBR_81_99;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOBR_81_99;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOBR_81_99;
                        }*/

                         ///////////////////////////////
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3) {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_18_36;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_18_36;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_18_36;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_18_36;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_18_36;
                        }
                        /*
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3  &&  this.categoryPolizaMatList[i].rango == '18-36') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_18_36;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_18_36;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_18_36;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_18_36;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_18_36;
              }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3  &&  this.categoryPolizaMatList[i].rango == '37-55') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_37_55;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_37_55;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_37_55;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_37_55;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_37_55;
                        }
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3  &&  this.categoryPolizaMatList[i].rango == '56-63') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_56_63;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_56_63;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_56_63;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_56_63;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_56_63;
                        }

                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3  &&  this.categoryPolizaMatList[i].rango == '64-70') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_64_70;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_64_70;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_64_70;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_64_70;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_64_70;
                        }
            
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3  &&  this.categoryPolizaMatList[i].rango == '71-80') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_71_80;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_71_80;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_71_80;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_71_80;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_71_80;
              }
                        
                        if (this.categoryPolizaMatList[i].NCATEGORIA == 3  &&  this.categoryPolizaMatList[i].rango == '81-99') {
                            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.countinputOAR_81_99;
                            itemQuotationDet.P_NMONTO_PLANILLA = this.planillainputOAR_81_99;
                            itemQuotationDet.P_NTASA_CALCULADA = this.tasainputOAR_81_99;
                            itemQuotationDet.P_NTASA_PROP = this.tasainputOAR_81_99;
                            itemQuotationDet.P_NPREMIUM_MENSUAL = this.MontoSinIGVOAR_81_99
              }
                        */

                         ///////////////////////////////

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

                        //.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate;
                        // itemQuotationDet.P_NPREMIUM_MENSUAL = this.nTransac == 8 ? this.amountPremiumList[i].NPREMIUMN_TOT : CommonMethods.formatValor((Number(this.categoryList[i].NTOTAL_PLANILLA) * Number(this.categoryList[i].NTASA)) / 100, 2);
                        itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION;
                        itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
                        itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;

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
                        dataQuotation.QuotationDet.push(itemQuotationDet);
                    }
                }
            }
        }

        // Detalle de Cotizacion Salud
        if (this.template.ins_saludList) {
            if (this.listaTasasSalud.length > 0) {
                this.listaTasasSalud.forEach(dataSalud => {
                    const itemQuotationDet: any = {};
                    itemQuotationDet.P_NBRANCH = this.saludID.nbranch;
                    itemQuotationDet.P_NPRODUCT = this.saludID.id; // Salud
                    itemQuotationDet.P_NMODULEC = dataSalud.id;
                    itemQuotationDet.P_NTOTAL_TRABAJADORES = dataSalud.totalWorkes;
                    itemQuotationDet.P_NMONTO_PLANILLA = dataSalud.planilla;
                    itemQuotationDet.P_NTASA_CALCULADA = dataSalud.rate;
                    itemQuotationDet.P_NTASA_PROP = dataSalud.planProp == '' ? '0' : dataSalud.planProp;
                    itemQuotationDet.P_NPREMIUM_MENSUAL = dataSalud.premiumMonth;
                    itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_SALUD;
                    itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO;
                    itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_SALUD == '' ? '0' : this.inputsQuotation.P_PRIMA_END_SALUD;
                    itemQuotationDet.P_NSUM_PREMIUMN = this.totalNetoSaludSave;
                    itemQuotationDet.P_NSUM_IGV = this.igvSaludSave;
                    itemQuotationDet.P_NSUM_PREMIUM = this.brutaTotalSaludSave;
                    itemQuotationDet.P_NRATE = dataSalud.rateDet == '' ? '0' : dataSalud.rateDet;
                    itemQuotationDet.P_NDISCOUNT = this.discountSalud == '' ? '0' : this.discountSalud;
                    itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationSalud == '' ? '0' : this.activityVariationSalud;
                    itemQuotationDet.P_FLAG = '0';
                    //Ini - RI
                    itemQuotationDet.P_NAMO_AFEC = this.totalNetoSaludSave;
                    itemQuotationDet.P_NIVA = this.igvSaludSave;
                    itemQuotationDet.P_NAMOUNT = this.brutaTotalSaludSave;
                    itemQuotationDet.P_NDE = CommonMethods.formatValor(Number(this.inputsQuotation.primaComSalud) - Number(this.totalNetoSaludSave), 2);
                    //Fin - RI
                    dataQuotation.QuotationDet.push(itemQuotationDet);
                });
            }
        }


        // Comercializadores
        if (this.codProducto == 2) {
            if (this.brokerList.length > 0) {
                var index = 0;
                this.brokerList.forEach(dataBroker => {
                    const itemQuotationCom: any = {};
                    itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
                    itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Desarrollo
                    itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                    itemQuotationCom.P_NCOMISION_SAL = self.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD == '' ? '0' : dataBroker.P_COM_SALUD : '0';
                    itemQuotationCom.P_NCOMISION_SAL_PR = self.listaTasasSalud.length > 0 ? dataBroker.P_COM_SALUD_PRO == '' ? '0' : dataBroker.P_COM_SALUD_PRO : '0';
                    itemQuotationCom.P_NCOMISION_PEN = self.listaTasasPension.length > 0 ? dataBroker.P_COM_PENSION == '' ? '0' : dataBroker.P_COM_PENSION : '0';
                    itemQuotationCom.P_NCOMISION_PEN_PR = self.listaTasasPension.length > 0 ? dataBroker.P_COM_PENSION_PRO == '' ? '0' : dataBroker.P_COM_PENSION_PRO : '0';
                    itemQuotationCom.P_NPRINCIPAL = 1;
                    itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                    dataQuotation.QuotationCom.push(itemQuotationCom);
                    index = index + 1;
                });
            }
        } else {
            /*if(this.isProposedCommission) {*/
            if (this.brokerList.length > 0 && (tran == "EM")) {
                var index = 0;
                this.brokerList.forEach(dataBroker => {
                    const itemQuotationCom: any = {};
                    itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
                    itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Desarrollo
                    itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
                    itemQuotationCom.P_NCOMISION_SAL = dataBroker.P_COM_SALUD == null || dataBroker.P_COM_SALUD == undefined || dataBroker.P_COM_SALUD == '' ? 0 : dataBroker.P_COM_SALUD;
                    itemQuotationCom.P_NCOMISION_SAL_PR = 0;
                    itemQuotationCom.P_NCOMISION_PEN = 0;
                    itemQuotationCom.P_NCOMISION_PEN_PR = 0;
                    itemQuotationCom.P_NPRINCIPAL = 1;
                    itemQuotationCom.P_NLOCAL = this.selectedDep[index];
                    dataQuotation.QuotationCom.push(itemQuotationCom);
                    index = index + 1;
                });
            }
        }

        dataQuotation.P_SISCLIENT_GBD = this.contractingdata.P_SISCLIENT_GBD
        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(dataQuotation));
        //Marcos Silverio
        const dataValidaCambioPlan = {
            PlanPropuesto: this.planPropuesto,
            PlanSeleccionado: this.flagPolizaMat ? this.inputsQuotation.desTipoPlanPM : this.inputsQuotation.desTipoPlan,
            TipoTransaccion: this.typeTran
        };
        myFormData.append('objetoValidaCambioPlan', JSON.stringify(dataValidaCambioPlan));

        this.quotationService.insertQuotation(myFormData).subscribe(
            async res => {
                let quotationNumber = 0;
                let transactNumber = 0;
                let mensajeRes = '';
                let mensajeOperaciones = ' el cual fue derivado al área de operaciones para su gestión';
                let mensajePolMatriz = this.flagPolizaMat ? ' y el trámite de Emisión de póliza matriz' : !this.flagPolizaMat && this.flagGobiernoEstado ? ' y el trámite de Emisión' : '';
                if (res.P_COD_ERR == 0) {
                    this.inputsQuotation.P_MINA = false;
                    quotationNumber = res.P_NID_COTIZACION;
                    transactNumber = res.P_NID_TRAMITE;
                    self.isLoading = false;
                    if (this.codProducto == 2) {
                        if (this.validateDebtResponse.lockMark === 1) {
                            self.isLoading = false;
                            this.clearInsert();
                            this.clearInsertSCTR();
                            if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
                                mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + 'el cliente cuenta con deuda pendiente y no se puede emitir la poliza';
                            } else {
                                mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE;
                            }
                            swal.fire('Información', mensajeRes, 'success');
                            this.router.navigate(['/broker/request-status']);
                        } else {
                            this.clearInsert();
                            await this.emitPolicy(res, self, quotationNumber, myFormData);
                        }
                    } else {
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
                            if (!this.flagContact && (!this.flagEmail && this.inputsQuotation.P_SE_MAIL != '')) {
                                // this.OpenModalPagos(dataQuotation, res);
                                if (this.validateDebtResponse.lockMark === 1) {
                                    self.isLoading = false;
                                    this.clearInsert();
                                    if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
                                        mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ' y el trámite N° ' + transactNumber + ', ' + res.P_SMESSAGE;
                                    } else {
                                        mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE;
                                    }
                                    swal.fire('Información', mensajeRes, 'success');
                                } else {
                                    await this.emitPolicy(res, self, quotationNumber, myFormData);
                                    // this.objetoTrx(res);
                                }

                            } else {
                                if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                                    swal.fire('Información', 'Se ha generado correctamente la recotización N° ' + quotationNumber, 'success');
                                    this.clearInsert();
                                    this.router.navigate(['/broker/request-status'])
                                } else {
                                    swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber, 'success');
                                    this.clearInsert();
                                    this.router.navigate(['/broker/request-status'])
                                }
                            }
                        } else {
                            if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                                if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
                                    mensajeRes = 'Se ha generado correctamente la recotización N° ' + quotationNumber + ' y el trámite N° ' + transactNumber + ',' + res.P_SMESSAGE;
                                } else {
                                    mensajeRes = 'Se ha generado correctamente la recotización N° ' + quotationNumber + ',' + res.P_SMESSAGE;
                                }
                                swal.fire('Información', mensajeRes, 'success');

                                this.clearInsert();
                                this.router.navigate(['/broker/request-status'])
                            } else {
                                if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo

                                    mensajeRes = this.flagGobiernoEstado && this.flagPolizaMat ? 'Se ha generado correctamente la cotización N° ' + quotationNumber + mensajePolMatriz + ' N° ' + transactNumber + ',' + mensajeOperaciones :
                                        this.flagGobiernoEstado && !this.flagPolizaMat ? 'Se ha generado correctamente la cotización N° ' + quotationNumber + mensajePolMatriz + ' N° ' + transactNumber + ',' + mensajeOperaciones
                                            : 'Se ha generado correctamente la cotización N° ' + quotationNumber + ' y el trámite N° ' + transactNumber + ',' + res.P_SMESSAGE;
                                } else {
                                    mensajeRes = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ',' + res.P_SMESSAGE;
                                }
                                swal.fire('Información', mensajeRes, 'success');
                                this.clearInsert();
                                this.router.navigate(['/broker/request-status'])
                            }
                        }
                        // }
                    }

                } else {
                    self.isLoading = false;
                    swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            err => {
                self.isLoading = false;
                swal.fire('Información', 'Hubo un error con el servidor', 'error');
            }
        );
    }

    validarDataPolizaMatriz() {
        let msg = ""
        var categorias = this.countinputEMP_18_36 +
            this.countinputOBR_18_36+
            this.countinputOAR_18_36+
            this.countinputEE +
            this.countinputOE +
            this.countinputOARE;
        if (categorias == 0) {
            msg += 'Debe ingresar al menos una categoria <br />';
        }

        if (msg == "") {
            return;
        } else {
            swal.fire('Información', msg, 'error');
        }

    }

    objetoEmitPolicyMat(paramsPolicy) {
        const params: FormData = new FormData();
        params.append('objeto', JSON.stringify(paramsPolicy));
        let nid_tramite = paramsPolicy[0].P_NID_TRAMITE;
        let nid_cotizacion = paramsPolicy[0].P_NID_COTIZACION;
        this.policyemit.savePolicyEmit(params).subscribe((res: any) => {
            if (res.P_COD_ERR == 0) {
                let policyVLey = 0;
                let constancia = 0;

                policyVLey = Number(res.P_POL_VLEY);
                constancia = Number(res.P_NCONSTANCIA);
                if (policyVLey > 0) {
                    swal.fire('Información', 'Se generó de forma correcta el trámite de Emisión ' + nid_tramite + ', número de cotización ' + nid_cotizacion + ' y número de póliza ' + policyVLey +
                        '.', 'success');

                    this.clearInsert();
                    this.router.navigate(['/broker/request-status'])
                }
            } else {
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
    }

    async proccessTrx() {
        const self = this;
        self.isLoading = false;
        const response: any = await this.ValidateRetroactivity();
        let tQuest;

        // INI ENDOSO TECNICA JTV 14042023
        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
            tQuest = '¿Deseas hacer la exclusión de asegurados?';
        } else if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
            tQuest = '¿Deseas hacer el endoso de asegurados?';
        }
        // FIN ENDOSO TECNICA JTV 14042023

        if (response.P_NCODE == 4) {
            this.derivaRetroactividad = true;
            await swal.fire('Información', response.P_SMESSAGE, 'error');
        }
        swal.fire({
            title: 'Información',
            //text: '¿Deseas hacer la exclusión de asegurados?', ENDOSO TECNICA JTV 14042023
            text: tQuest, // ENDOSO TENICA JTV 14042023
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.value) {
                if (this.codProducto == 3) {
                    if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION || this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) { // ENDOSO TECNICA JTV 13042023
                        const myFiles: FormData = new FormData();
                        this.files.forEach(file => {
                            myFiles.append(file.name, file);
                        });
                        const params = this.obtenerParametrosCotizacion();
                        let self = this;
                        self.isLoading = true;

                        this.policyemit.renewMod(params, myFiles).subscribe(
                            res => {
                                if (res.P_COD_ERR == 0) {
                                    if (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') {
                                        this.createJob();
                                    } else {

                                        if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                                            swal.fire('Información', res.P_SMESSAGE, 'success');
                                            this.router.navigate(['/extranet/policy-transactions-all']);
                                        }

                                    }
                                } else {
                                    self.isLoading = false;
                                    swal.fire('Información', res.P_MESSAGE, 'error');
                                }
                            },
                            err => {
                                self.isLoading = false;
                                swal.fire('Información', 'Hubo un error con el servidor', 'error');
                            }
                        );
                    }
                }
            }
        });
    }

    obtenerParametrosCotizacion() {
        let self = this;
        let dataQuotation: any = {};

        const myFiles: FormData = new FormData(); /* Para los archivos EH */
        this.files.forEach(file => {
            myFiles.append(file.name, file);
        });

        dataQuotation.P_STRAN = 'RC';
        dataQuotation.P_SCLIENT = this.inputsQuotation.SCLIENT == null || this.inputsQuotation.SCLIENT == undefined ? this.inputsQuotation.P_SIDDOC : this.inputsQuotation.SCLIENT; // ENDOSO TECNICA JTV 14042023
        dataQuotation.P_NCURRENCY = this.inputsQuotation.COD_MONEDA === null || this.inputsQuotation.COD_MONEDA == undefined ? this.inputsQuotation.P_NCURRENCY : this.inputsQuotation.COD_MONEDA; // ENDOSO TECNICA JTV 14042023
        dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
        dataQuotation.P_DSTARTDATE = new Date();
        dataQuotation.P_NIDCLIENTLOCATION = 0;
        dataQuotation.P_SCOMMENT = this.inputsQuotation.P_SCOMMENT;
        dataQuotation.P_SRUTA = '';
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.P_NREM_EXC = this.inputsQuotation.P_NREM_EXC == true ? 1 : 0; //RQ EXC EHH
        dataQuotation.RetOP = 2; //ehh retroactividad
        dataQuotation.planId = this.planList.find(f => f.SDESCRIPT.toUpperCase() == this.inputsQuotation.desTipoPlan).NIDPLAN;
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.QuotationDet = [];
        dataQuotation.QuotationCom = [];

        if (this.codProducto == 3) {
            dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
            dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
            dataQuotation.NumeroCotizacion = this.nrocotizacion;
            dataQuotation.CodigoProceso = this.nidProc;

            // INI ENDOSO TECNICA JTV 14042023
            if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
                dataQuotation.TrxCode = 'EX';
            } else if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
                dataQuotation.TrxCode = 'EN';
                dataQuotation.TipoEndoso = this.inputsQuotation.P_NTYPE_END;
            }
            // FIN ENDOSO TECNICA JTV 14042023

            if (this.isDeclare) {
                dataQuotation.IsDeclare = this.isDeclare;
            }
            dataQuotation.P_NTIP_RENOV = this.inputsQuotation.tipoRenovacion;
            dataQuotation.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago;
            dataQuotation.P_SCOD_ACTIVITY_TEC = !this.template.ins_actRealizarSave ? null : this.inputsQuotation.P_NTECHNICAL; // Vida Ley
            dataQuotation.P_NTIP_NCOMISSION = this.inputsQuotation.P_COMISION; // Vida Ley
            dataQuotation.P_SCOD_CIUU = !this.template.ins_subActividadSave ? null : this.inputsQuotation.P_NECONOMIC; // Vida Ley
            dataQuotation.P_DSTARTDATE = this.typeTran === CommonMethods.TIPO_TRANSACCION.EXCLUSION ? CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion) : CommonMethods.formatDate(this.inputsQuotation.bsValueIni); //Fecha Inicio
            dataQuotation.P_DEXPIRDAT = this.typeTran === CommonMethods.TIPO_TRANSACCION.EXCLUSION ? CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg) : CommonMethods.formatDate(this.inputsQuotation.bsValueFin); // Fecha hasta

            if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
                dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion);
                dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
            } else if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) { // INI ENDOSO TECNICA JTV 14042023
                dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
                dataQuotation.P_DEXPIRDAT_ASE = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
                dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
                dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.FDateFin);
            } // FIN ENDOSO TECNICA JTV 14042023
        }

        for (let i = 0; i < this.categoryList.length; i++) {
            const itemQuotationDet: any = {};
            itemQuotationDet.P_NID_COTIZACION = this.nrocotizacion; //Cotizacion
            itemQuotationDet.P_NBRANCH = this.vidaLeyID.nbranch;
            itemQuotationDet.P_NPRODUCT = this.vidaLeyID.id; // config
            itemQuotationDet.P_NMODULEC = this.categoryList[i].SCATEGORIA;
      itemQuotationDet.P_RANGO = this.categoryList[i].SRANGO_EDAD; /// GCAA 10102023
            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.categoryList[i].NCOUNT;
            itemQuotationDet.P_NMONTO_PLANILLA = this.categoryList[i].NTOTAL_PLANILLA;
            itemQuotationDet.P_NTASA_CALCULADA = this.categoryList[i].NTASA;
            itemQuotationDet.P_NTASA_PROP = this.categoryList[i].ProposalRate == '' ? 0 : this.categoryList[i].ProposalRate;
            itemQuotationDet.P_NPREMIUM_MENSUAL = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountPremiumList[i].NPREMIUMN_TOT : CommonMethods.formatValor((parseFloat(this.categoryList[i].NTOTAL_PLANILLA) * parseFloat(this.categoryList[i].NTASA)) / 100, 2);
            itemQuotationDet.P_NPREMIUM_MIN = this.inputsQuotation.P_PRIMA_MIN_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION; // EH this.polizaEmitCab.P_PRIMA_END_PENSION;
            itemQuotationDet.P_NPREMIUM_MIN_PR = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? '0' : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO;
            itemQuotationDet.P_NPREMIUM_END = this.inputsQuotation.P_PRIMA_END_PENSION == '' ? '0' : this.inputsQuotation.P_PRIMA_END_PENSION;
            itemQuotationDet.P_NSUM_PREMIUMN = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountDetailTotalList[0].NAMOUNT_TOT : this.amountDetailTotalList[0].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[0].NAMOUNT_ANU / 12) : this.amountDetailTotalList[0].NAMOUNT_MEN;
            itemQuotationDet.P_NSUM_IGV = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountDetailTotalList[1].NAMOUNT_TOT : this.amountDetailTotalList[1].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[1].NAMOUNT_ANU / 12) : this.amountDetailTotalList[1].NAMOUNT_MEN;
            itemQuotationDet.P_NSUM_PREMIUM = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? this.amountDetailTotalList[2].NAMOUNT_TOT : this.amountDetailTotalList[2].NAMOUNT_MEN == 0 ? (this.amountDetailTotalList[2].NAMOUNT_ANU / 12) : this.amountDetailTotalList[2].NAMOUNT_MEN;
            itemQuotationDet.P_NRATE = this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? 0 : this.amountPremiumList[i].NTASA;
            itemQuotationDet.P_NDISCOUNT = this.discountPension == '' ? '0' : this.discountPension;
            itemQuotationDet.P_NACTIVITYVARIATION = this.activityVariationPension == '' ? '0' : this.activityVariationPension;
            itemQuotationDet.P_FLAG = '0';
            /* Nuevos parametros ins_cotizacion_det EHH */
            itemQuotationDet.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
            itemQuotationDet.P_NIVA = this.GetAmountDetailTotalListValue(1, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
            itemQuotationDet.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
            /* * */
            dataQuotation.QuotationDet.push(itemQuotationDet);
        }

        return dataQuotation;
    }

    async createJob() {
        const polizaNro = (this.nroSalud != undefined && this.nroSalud == '' ? '' : this.nroSalud);
        const msgIncRenov = this.typeTran; // ENDOSO TECNICA JTV 14042023
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
        this.codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];

        this.policyemit.transactionPolicy(myFormData).subscribe(
            res => {
                this.loading = false;
                if (res.P_COD_ERR == 0) {
                    if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                        swal.fire('Información', 'Se ha generado correctamente la ' + msgIncRenov + ' de la póliza N° ' + this.nroPoliza, 'success');
                        this.router.navigate(['/extranet/request-status']);
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
            },
            err => {
                this.loading = false;
            }
        );
    }

    async dataEmision(idProcessVisa = 0) {
        this.transaccionProtecta = {};
        this.transaccionProtecta.P_NID_COTIZACION = this.nrocotizacion; // nro cotizacion

        // INI ENDOSO TECNICA JTV 14042023
        if (Number(this.codProducto) !== 3) {
            this.transaccionProtecta.P_DEFFECDATE = CommonMethods.formatDate(this.inputsQuotation.bsValueIni);
            this.transaccionProtecta.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.bsValueFin);
        } else if (this.typeTran === CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
            this.transaccionProtecta.P_DEFFECDATE = CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion);
            this.transaccionProtecta.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
        } else if (this.typeTran === CommonMethods.TIPO_TRANSACCION.ENDOSO) {
            this.transaccionProtecta.P_DEFFECDATE = CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg);
            this.transaccionProtecta.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg);
        } else {
            this.transaccionProtecta.P_DEFFECDATE = CommonMethods.formatDate(this.inputsQuotation.bsValueIni);
            this.transaccionProtecta.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.bsValueFin);
        } // FIN ENDOSO TECNICA JTV 14042023

        //this.transaccionProtecta.P_DEFFECDATE = Number(this.codProducto) !== 3 ? CommonMethods.formatDate(this.inputsQuotation.bsValueIni) : this.typeTran === 'Exclusión' ? CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion) : CommonMethods.formatDate(this.inputsQuotation.bsValueIni);
        //this.transaccionProtecta.P_DEXPIRDAT = Number(this.codProducto) !== 3 ? CommonMethods.formatDate(this.inputsQuotation.bsValueFin) : this.typeTran === 'Exclusión' ? CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg) : CommonMethods.formatDate(this.inputsQuotation.bsValueFin);
        this.transaccionProtecta.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; // Fecha hasta
        this.transaccionProtecta.P_NTYPE_TRANSAC = this.nTransac; // tipo de movimiento ENDOSO TECNICA JTV 14042023
        this.transaccionProtecta.P_NID_PROC = this.nidProc; // codigo de proceso (Validar trama)
        this.transaccionProtecta.P_FACT_MES_VENCIDO = this.codProducto == 3 ? this.typeTran === CommonMethods.TIPO_TRANSACCION.EXCLUSION ? this.inputsQuotation.primaCobrada == true ? 1 : 0 : 0 : 0; // Facturacion Vencida
        this.transaccionProtecta.P_SFLAG_FAC_ANT = this.codProducto == 3 ? 1 : this.inputsQuotation.facturacionAnticipada == true ? 1 : 0; // Facturacion Anticipada
        this.transaccionProtecta.P_SCOLTIMRE = this.inputsQuotation.tipoRenovacion; // Tipo de renovacion
        this.transaccionProtecta.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago; // Frecuencia Pago
        this.transaccionProtecta.P_NMOV_ANUL = 0; // Movimiento de anulacion
        this.transaccionProtecta.P_NNULLCODE = this.annulmentID == null ? 0 : this.annulmentID; // Motivo anulacion
        this.transaccionProtecta.P_SCOMMENT = this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, ''); // Frecuencia Pago
        this.transaccionProtecta.P_NID_PENSION = this.listaTasasPension.length > 0 ? 1 : this.epsItem.STYPE == 2 ? 0 : 1;
        this.transaccionProtecta.P_NIDPAYMENT = idProcessVisa; // id proceso visa
        this.transaccionProtecta.P_NPRODUCTO = this.codProducto;
        const pensionTxt = this.nroPension != '' ? 'Pensión: ' + this.nroPension : '';
        const saludTxt = this.nroSalud != '' ? 'Salud: ' + this.nroSalud : '';
        const policyText = pensionTxt != '' ? pensionTxt + ' - ' + saludTxt : saludTxt;
        this.transaccionProtecta.P_POLICY = policyText;

        // INI ENDOSO TECNICA JTV 14042023
        if (this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION) {
            this.transaccionProtecta.P_STRAN = 'EX';
        } else if (this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
            this.transaccionProtecta.P_STRAN = 'EN';
        }
        // FIN ENDOSO TECNICA JTV 14042023

        this.transaccionProtecta.P_DSTARTDATE_POL = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
        this.transaccionProtecta.P_DEXPIRDAT_POL = CommonMethods.formatDate(this.inputsQuotation.FDateFin);
        this.transaccionProtecta.P_NAMO_AFEC = this.GetAmountDetailTotalListValue(0, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
        this.transaccionProtecta.P_NIVA = this.GetAmountDetailTotalListValue(1, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
        this.transaccionProtecta.P_NAMOUNT = this.GetAmountDetailTotalListValue(2, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago);
        this.transaccionMapfre = null;

    }

    primaCobradaChange() {
        if (this.excelSubir !== undefined && this.excelSubir !== null) {
            this.validarTrama();
        }
    }

    //ini - marcos silverio
    seeCovers(nrocotizacion) {
        const modalRef = this.modalService.open(QuotationCoverComponent,
            { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef; //Enviamos la referencia al modal
        modalRef.componentInstance.quotationNumber = this.nrocotizacion; //Enviamos el número de cotización
    }
    //fin - marcos silverio

    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }
    limpiar() {
        if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
            this.router.navigate(['/extranet/quotation-evaluation']);
        } else {
            this.clearInsert();
            this.clearInsertSCTR(); //Debe estar junto con el clearInsert para evitar conflictos de que la data no se borre - AVS 07/12/2022
        }
    }
    clearInsert() {
        // Datos Contratante
        this.blockDoc = true;
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
        this.tasaVL = []
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
        this.bsValueIniMin = new Date();
        this.bsValueFinMin = new Date();
        this.bsValueFinMin.setDate(this.bsValueFinMin.getDate() + 1);

        // Datos Cotización
        this.inputsQuotation.P_NCURRENCY = '1'; // Moneda
        this.inputsQuotation.P_NIDSEDE = null; // Sede
        this.inputsQuotation.P_NTECHNICAL = null; // Actividad Tecnica
        this.inputsQuotation.P_NECONOMIC = null; // Actividad Economica
        this.inputsQuotation.P_DELIMITER = ''; // Delimitación check
        //this.inputsQuotation.P_SDELIMITER = '0'; // Delimitacion  1 o 0 -- AVS Mejoras SCTR
        this.inputsQuotation.P_NPROVINCE = null;
        this.inputsQuotation.P_NLOCAL = null;
        this.inputsQuotation.P_NMUNICIPALITY = null;
        if (this.productList.length > 1) {
            this.inputsQuotation.P_NPRODUCT = '-1';
        }
        this.sedeId = '0'

        // Sedes
        this.sedesList = [];
        this.stateQuotation = true;
        this.activityMain = ''
        this.subActivity = ''
        this.provinceList = [];
        this.districtList = [];
        //Validacion para derivacion a tecnica de SCTR
        //this.listaTasasPension = [];
        //this.listaTasasSalud = [];

        //Cotizador
        this.clearTariff();

        this.inputsQuotation.P_TYPE_SEARCH = '1'; // Tipo de busqueda
        this.inputsQuotation.P_PERSON_TYPE = '2'; // Tipo persona
        //Validacion para derivacion a tecnica de SCTR
        //this.brokerList = [];
        if (this.perfilActual == this.perfil || this.template.ins_iniciarBroker) {
            this.brokerIni();
        }

        this.maxlength = 8;

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

        this.flagPolizaMat = false;
    }

    //AVS - Eliminacion de broker luego del movimiento tecnica
    clearInsertSCTR() {
        this.brokerList = [];
        this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = '';
        this.listaTasasPension = [];
        this.listaTasasSalud = [];
        this.inputsQuotation.P_SDELIMITER = '0';
    }

    clearTariff() {
        this.comPropuestaSalud = false
        this.comPropuestaPension = false
        this.comPropuesta = false
        this.statePrimaSalud = true
        this.statePrimaPension = true
        this.stateBrokerTasaSalud = true
        this.stateBrokerTasaPension = true
        this.blockSearch = true
        this.stateSearch = false
        this.reloadTariff = false
        this.messageWorker = ''
        this.tasasList = [];
        /* this.listaTasasPension = []
        this.listaTasasSalud = [] */
        this.inputsQuotation.P_PRIMA_MIN_SALUD = ''; // Prima minima salud
        this.inputsQuotation.P_PRIMA_MIN_SALUD_PRO = ''; // Prima minima salud propuesta
        this.inputsQuotation.P_PRIMA_MIN_PENSION = ''; // Prima minima pension

        //Validacion para derivacion a tecnica de SCTR
        //this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO = ''; // Prima minima pension propuesta

        this.totalNetoPensionSave = 0.00
        this.totalNetoSaludSave = 0.00
        this.igvPensionSave = 0.00
        this.igvSaludSave = 0.00
        this.brutaTotalPensionSave = 0.00
        this.brutaTotalSaludSave = 0.00
        this.discountPension = '';
        this.discountSalud = '';
        this.activityVariationPension = '';
        this.activityVariationSalud = '';
        this.commissionPension = '';
        this.commissionSalud = '';
        this.inputsQuotation.P_SCOMMENT = ''; // Comentario
        this.files = []; // Archivos
    }

    addBroker() {
        let modalRef = this.modalService.open(SearchBrokerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.listaBroker = this.brokerList;
        modalRef.componentInstance.brokerMain = this.inputsQuotation.P_SIDDOC_COM;

        modalRef.result.then((BrokerData) => {
            BrokerData.P_COM_SALUD = 0;
            BrokerData.P_COM_SALUD_PRO = 0;
            BrokerData.P_COM_PENSION = 0;
            BrokerData.P_COM_PENSION_PRO = 0;
            BrokerData.PROFILE = this.codProfile;
            BrokerData.NCORREDOR = BrokerData.NCORREDOR == '' ? BrokerData.COD_CANAL : BrokerData.NCORREDOR;
            BrokerData.BLOCK = 0;
            BrokerData.valItemPen = false;
            BrokerData.valItemSal = false;
            this.brokerList.push(BrokerData);
            if (this.brokerList.length > 0) { //AVS- PRY COMISIONES 06/07/2023
                this.validacionBroker();
            }
            this.equivalentMuni();
        });
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
                    this.categoryList = [];
                    this.rateByPlanList = [];
                    this.inputsQuotation.P_COMISION = ''; //AVS - PRY COMISIONES 23/08/2023

                    this.brokerList.splice(row, 1);
                    this.selectedDep.splice(row, 1);
                    this.equivalentMuni();
                }
            });
    }

    validarNroDocumento(event: any, tipoDocumento) {
        CommonMethods.validarNroDocumento(event, tipoDocumento)
    }

    textValidate(event: any, tipoTexto) {
        CommonMethods.textValidate(event, tipoTexto)
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
    async getValidateDebt(branchCode, productCode, clientCode, transactionCode): Promise<ValidateDebtReponse> {
        let validateDebtResponse: ValidateLockReponse = {};
        const validateDebtRequest = new ValidateDebtRequest();
        validateDebtRequest.branchCode = branchCode;
        validateDebtRequest.productCode = productCode;
        validateDebtRequest.clientCode = clientCode;
        validateDebtRequest.transactionCode = transactionCode;
        validateDebtRequest.profileCode = Number(this.perfilActual);
        validateDebtRequest.nintermed = JSON.parse(localStorage.getItem('currentUser'))['canal'];

        await this.collectionsService.validateDebt(validateDebtRequest).toPromise().then(
            res => {
                validateDebtResponse = res;
            }
        );
        return validateDebtResponse;
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

    dataQuot = JSON.parse(localStorage.getItem('dataquotation'));
    async emitPolicy(res, self, quotationNumber, myFormData) {
        let message = 'Se generó la cotización';
        if (this.codProducto == 3) {
            if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                message = 'Se recotizó la cotización';
            }
        }

        let flagAuthVL = this.codProducto == 3 && (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V' || res.P_SAPROBADO == 'N') ? 1 : 0;
        let flagAuthSCTR = this.codProducto == 2 && (res.P_SAPROBADO == 'S' || res.P_SAPROBADO == 'V') ? 1 : 0;

        if (flagAuthSCTR == 1 || flagAuthVL == 1) {
            if (res.P_NCODE == 0) {
                if (!this.template.ins_emisionDirecta) {
                    self.isLoading = false;
                    swal.fire({
                        title: 'Información',
                        text: 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ¿Deseas realizar la emisión?',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Emitir',
                        cancelButtonText: 'Cancelar'
                    })
                        .then((result) => {
                            if (result.value) {
                                this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: quotationNumber } });
                            } else {
                                this.router.navigate(['/extranet/request-status']);
                            }
                        });
                } else {
                    if (this.validateDebtResponse.lockMark === 1) {
                        self.isLoading = false;
                        swal.fire('Información', 'Se ha generado correctamente la cotización N° ' +
                            quotationNumber + ', ' + res.P_SMESSAGE, 'success');
                    } else {
                        this.objetoTrx(res);
                    }
                }
            } else {
                if (this.codProducto == 3) {
                    this.clearInsert();
                }
                self.isLoading = false;
                swal.fire('Información',
                    'Se ha generado correctamente la cotización N° ' +
                    quotationNumber + ',  para emitir debe esperar su aprobación.',
                    'success');
            }
        } else {
            self.isLoading = false;
            if (this.codProducto == 3) {
                if (this.nrocotizacion != undefined && this.nrocotizacion != '') {
                    swal.fire('Información', 'Se ha generado correctamente la recotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE, 'success');
                } else {
                    swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', ' + res.P_SMESSAGE, 'success');
                }

            } else {
                if (res.P_NCODE == 2) {
                    swal.fire('Información', res.P_SMESSAGE, 'success');
                    this.router.navigate(['/broker/request-status']);
                } else {

                    this.serviciosTasasSCTR(quotationNumber);
                    swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber + ',  para emitir debe esperar su aprobación. ' + res.P_SMESSAGE, 'success');
                    this.clearInsertSCTR();
                    if (this.perfilActual == "31" || this.perfilActual == "32") {
                        this.router.navigate(['/broker/request-status']);
                    }
                }
            }
            this.clearInsert();
            this.clearInsertSCTR();
        }
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
                        })
                    })
            }
        }])
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
                            })
                        })
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

    async downloadFile(filePath: string): Promise<any> {  //Descargar archivos de cotización
        return this.othersService.downloadFile(filePath).toPromise().then(
            res => {
                if (res.StatusCode == 1) {
                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
                    var newBlob = new Blob([res], { type: 'application/pdf' });
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }
                    const data = window.URL.createObjectURL(newBlob);

                    var link = document.createElement('a');
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

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        const typeContact: any = {};
        switch (modalName) {
            case 'add-contact':
                modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                typeContact.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE;
                typeContact.P_SIDDOC = this.inputsQuotation.P_SIDDOC;
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
        typeContact.P_NIDDOC_TYPE = this.inputsQuotation.P_NIDDOC_TYPE;
        typeContact.P_SIDDOC = this.inputsQuotation.P_SIDDOC;
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

    async objetoTrx(res) {
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
                                    P_NID_TRAMITE: this.flagComerExclu == 0 ? res.P_NID_TRAMITE : 0,
                                    P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                    P_DEXPIRDAT_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateFinAseg)
                                }
                            ];

                            if (params[0].P_NID_PROC == '') {
                                await this.quotationService.getProcessCode(res.P_NID_COTIZACION).toPromise().then(
                                    resCod => {
                                        params[0].P_NID_PROC = resCod;
                                    }
                                );
                            }

                            if (res.P_SAPROBADO === 'V') {
                                const actualizarCotizacion = {
                                    QuotationNumber: res.P_NID_COTIZACION,
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
                                }

                                this.brokerList.forEach((item) => {
                                    actualizarCotizacion.BrokerList.push({
                                        Id: item.COD_CANAL,
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

                                this.inputsQuotation.actualizarCotizacion = actualizarCotizacion;

                            }

                            this.OpenModalPagos(params);
                        }
                    );
            }
        });
    }

    async objetoTrxPol(res) {
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
                            const params = {
                                P_NBRANCH: this.vidaLeyID.nbranch,
                                P_NPRODUCTO: this.vidaLeyID.id,
                                P_NID_COTIZACION: this.nrocotizacion,
                                P_DEFFECDATE: this.codProducto == 3 && this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_ASEGURADOS)) : CommonMethods.formatDate(new Date(this.inputsQuotation.FDateIniAseg)),
                                P_DEXPIRDAT: this.codProducto == 3 && this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? CommonMethods.formatDate(new Date(resCab.GenericResponse.EXPIRACION_ASEGURADOS)) : CommonMethods.formatDate(new Date(this.inputsQuotation.FDateFinAseg)),
                                P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
                                P_NTYPE_TRANSAC: this.nTransac,
                                P_NID_PROC: resCab.GenericResponse.NID_PROC,
                                P_FACT_MES_VENCIDO: this.inputsQuotation.primaCobrada == true ? 1 : 0,
                                P_SFLAG_FAC_ANT: 1,
                                P_SCOLTIMRE: resCab.GenericResponse.TIP_RENOV,
                                P_NPAYFREQ: resCab.GenericResponse.FREQ_PAGO,
                                P_NMOV_ANUL: 0,
                                P_NNULLCODE: 0,
                                P_SCOMMENT: this.inputsQuotation.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, ''),
                                // P_NPREM_BRU: this.AuthorizedDetailList[2].AmountAuthorized,
                                P_DIRECTO: res.P_SAPROBADO,
                                P_MESSAGE: res.P_SMESSAGE,
                                P_POLICY: this.nroPoliza,
                                P_STRAN: this.typeTran, //retroactividad
                                P_DSTARTDATE_ASE: CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg),
                                P_DSTARTDATE_POL: CommonMethods.formatDate(this.inputsQuotation.FDateIni),
                                P_DEXPIRDAT_POL: CommonMethods.formatDate(this.inputsQuotation.FDateFin),
                                P_NAMO_AFEC: this.GetAmountDetailTotalListValue(0, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago),
                                P_NIVA: this.GetAmountDetailTotalListValue(1, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago),
                                P_NAMOUNT: this.GetAmountDetailTotalListValue(2, this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 1 : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO || this.typeTran == CommonMethods.TIPO_TRANSACCION.EXCLUSION ? 9 : this.inputsQuotation.frecuenciaPago)
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

                                this.brokerList.forEach((item) => {
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

                                this.inputsQuotation.actualizarCotizacion = actualizarCotizacion;

                            }

                            this.OpenModalPagosPol(params);
                        }
                    );
            }
        });
    }

    OpenModalPagos(paramsTrx) {

        const primaTotal = this.typeTran != CommonMethods.TIPO_TRANSACCION.INCLUSION ?
            this.inputsQuotation.frecuenciaPago == 5 ?
                this.amountDetailTotalList[2].NAMOUNT_MEN :
                this.inputsQuotation.frecuenciaPago == 4 ?
                    this.amountDetailTotalList[2].NAMOUNT_BIM :
                    this.inputsQuotation.frecuenciaPago == 3 ?
                        this.amountDetailTotalList[2].NAMOUNT_TRI :
                        this.inputsQuotation.frecuenciaPago == 2 ?
                            this.amountDetailTotalList[2].NAMOUNT_SEM :
                            this.inputsQuotation.frecuenciaPago == 1 ?
                                this.amountDetailTotalList[2].NAMOUNT_ANU :
                                0 : this.amountDetailTotalList[2].NAMOUNT_ANU;
                
        this.inputsQuotation.trama = {
            PRIMA_TOTAL: primaTotal,
            NIDPROC: paramsTrx[0].P_NID_PROC,
        };

        this.inputsQuotation.contratante = {
            email: this.inputsQuotation.P_SE_MAIL,
            NOMBRE_RAZON: this.inputsQuotation.P_SLEGALNAME,
            COD_PRODUCT: this.vidaLeyID.id,
            tipoDocumento: {
                Id: this.inputsQuotation.P_NIDDOC_TYPE
            },
            tipoPersona: {
                codigo: this.inputsQuotation.P_NIDDOC_TYPE == 1 &&
                    this.inputsQuotation.P_SIDDOC.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.inputsQuotation.P_SIDDOC,
            emisionDirecta: paramsTrx[0].P_DIRECTO,
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateLockResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.inputsQuotation.poliza = {
            producto: {
                COD_PRODUCT: this.vidaLeyID.id,
            }
        };

        let mensajeCot = '';

        if (this.flagComerExclu == 0) { //RQ - Perfil Nuevo - Comercial Exclusivo
            this.inputsQuotation.prepago = {
                P_NID_COTIZACION: paramsTrx[0].P_NID_COTIZACION,
                msjCotizacion: 'Se ha generado la cotización N° ' + paramsTrx[0].P_NID_COTIZACION +
                    ' y el trámite N° ' + paramsTrx[0].P_NID_TRAMITE + ', puedes emitirla de las siguientes formas:',
            };
        } else {
            this.inputsQuotation.prepago = {
                P_NID_COTIZACION: paramsTrx[0].P_NID_COTIZACION,
                msjCotizacion: 'Se ha generado la cotización N° ' + paramsTrx[0].P_NID_COTIZACION + ', puedes emitirla de las siguientes formas:',
            };
        }

        // this.inputsQuotation.prepago = {
        //   P_NID_COTIZACION: paramsTrx[0].P_NID_COTIZACION,
        //   msjCotizacion: 'Se ha generado la cotización N° ' + paramsTrx[0].P_NID_COTIZACION +
        //     ' y el trámite N° ' + paramsTrx[0].P_NID_TRAMITE + ', puedes emitirla de las siguientes formas:',
        // };

        this.inputsQuotation.brokers = this.brokerList;
        // for (const item of this.inputsQuotation.brokers) {
        //   item.COD_CANAL = item.CANAL;
        // }

        this.inputsQuotation.tipoTransaccion = this.nTransac;
        this.inputsQuotation.transac = this.sAbTransac;
        this.inputsQuotation.files = this.files;
        this.inputsQuotation.paramsTrx = paramsTrx;
        this.inputsQuotation.numeroCotizacion = paramsTrx[0].P_NID_COTIZACION;
        this.cotizacion = this.inputsQuotation;

        localStorage.removeItem('creditdata'); // AVS PRY NC
        localStorage.removeItem('botonNC'); // AVS PRY NC
        this.modal.pagos = true;
        this.isLoading = true;
    }

    OpenModalPagosPol(paramsTrx) {

        let primaTotal = 0;
        if (this.codProducto == 3 && this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
            try {
                primaTotal = this.amountDetailTotalList[2].NAMOUNT_TOT
            } catch (e) {
                primaTotal = 0;
            }
        } else {
            primaTotal = this.typeTran != CommonMethods.TIPO_TRANSACCION.INCLUSION ?
                this.inputsQuotation.frecuenciaPago == 5 ?
                    this.amountDetailTotalList[2].NAMOUNT_MEN :
                    this.inputsQuotation.frecuenciaPago == 4 ?
                        this.amountDetailTotalList[2].NAMOUNT_BIM :
                        this.inputsQuotation.frecuenciaPago == 3 ?
                            this.amountDetailTotalList[2].NAMOUNT_TRI :
                            this.inputsQuotation.frecuenciaPago == 2 ?
                                this.amountDetailTotalList[2].NAMOUNT_SEM :
                                this.inputsQuotation.frecuenciaPago == 1 ?
                                    this.amountDetailTotalList[2].NAMOUNT_ANU :
                                    0 : this.amountDetailTotalList[2].NAMOUNT_ANU;
        }


        this.inputsQuotation.trama = {
            PRIMA_TOTAL: primaTotal,
            NIDPROC: paramsTrx.P_NID_PROC,
        };

        this.inputsQuotation.contratante = {
            email: this.inputsQuotation.P_SE_MAIL,
            NOMBRE_RAZON: this.inputsQuotation.P_SLEGALNAME,
            COD_PRODUCT: this.vidaLeyID.id,
            NBRANCH: this.vidaLeyID.nbranch,
            tipoDocumento: {
                Id: this.inputsQuotation.P_NIDDOC_TYPE
            },
            tipoPersona: {
                codigo: this.inputsQuotation.P_NIDDOC_TYPE == 1 &&
                    this.inputsQuotation.P_SIDDOC.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.inputsQuotation.P_SIDDOC,
            emisionDirecta: paramsTrx.P_DIRECTO,
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            debtMark: this.validateLockResponse.lockMark,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.inputsQuotation.poliza = {
            producto: {
                COD_PRODUCT: this.vidaLeyID.id,
                NBRANCH: this.vidaLeyID.nbranch,
            }
        };

        const msgIncRenov = this.typeTran == CommonMethods.TIPO_TRANSACCION.INCLUSION ? 'la inclusión' : this.typeTran == CommonMethods.TIPO_TRANSACCION.ENDOSO ? 'el endoso' : this.sAbTransac == 'DE' ? 'la declaración' : 'la renovación';
        this.inputsQuotation.prepago = {
            P_NID_COTIZACION: paramsTrx.P_NID_COTIZACION,
            msjCotizacion: 'Selecciona una de las opciones de pago para ' + msgIncRenov +
                ' de la póliza N° ' + this.nroPoliza,
        };

        this.inputsQuotation.brokers = this.brokerList;
        for (const item of this.inputsQuotation.brokers) {
            item.COD_CANAL = item.CANAL;
        }

        this.inputsQuotation.tipoTransaccion = this.nTransac;
        this.inputsQuotation.transac = this.sAbTransac;
        this.inputsQuotation.files = this.files;
        this.inputsQuotation.paramsTrx = paramsTrx;
        this.inputsQuotation.numeroCotizacion = paramsTrx.P_NID_COTIZACION;
        this.cotizacion = this.inputsQuotation;

        this.modal.pagos = true;
        this.isLoading = true;
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
            this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));//AVS - PROY NC

            if (this.nTransac != 2 && this.nTransac != 3 && this.nTransac != 4 && this.nTransac != 8) {
                const params: FormData = new FormData();
                this.inputsQuotation.paramsTrx[0].P_SPAGO_ELEGIDO = 'directo';

                if (this.codProducto == 3 && this.FlagPagoNC != null && this.flagBotonNC == true) { //AVS - PROY NC
                    this.isLoading = true;
                    this.inputsQuotation.paramsTrx[0].P_NCOT_NC = 1;
                    //   await this.InsertPayNCTEMP();
                }

                params.append('objeto', JSON.stringify(this.inputsQuotation.paramsTrx));
                params.append('notaCredito', JSON.stringify(JSON.parse(localStorage.getItem('creditdata'))));

                this.policyemit.savePolicyEmit(params).subscribe((res: any) => {
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
            }
            else {
                const msgIncRenov = this.nTransac == 2 ? 'la Inclusión' : this.nTransac == 8 ? 'el endoso' : this.sAbTransac == 'DE' ? 'la Declaración' : 'la Renovación';
                const params: FormData = new FormData();
                this.loading = true;
                if (this.files.length > 0) {
                    this.files.forEach(file => {
                        params.append('adjuntos', file, file.name);
                    });
                }

                if (this.codProducto == 3 && this.FlagPagoNC != null && this.flagBotonNC == true) { //AVS - PROY NC
                    this.isLoading = true;
                    this.inputsQuotation.paramsTrx[0].P_NCOT_NC = 1;
                    //   await this.InsertPayNCTEMP();
                }

                this.inputsQuotation.paramsTrx.P_SPAGO_ELEGIDO = 'directo';
                params.append('transaccionProtecta', JSON.stringify(this.inputsQuotation.paramsTrx));
                params.append('transaccionMapfre', JSON.stringify(null));
                params.append('notaCredito', JSON.stringify(JSON.parse(localStorage.getItem('creditdata'))));

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

    async ValidateRetroactivity(operacion: number = 1) {
        let tran = this.sAbTransac;
        const response: any = {};
        const dataQuotation: any = {};
        dataQuotation.P_NBRANCH = this.vidaLeyID.nbranch;
        dataQuotation.P_NPRODUCT = this.vidaLeyID.id;
        dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        dataQuotation.NumeroCotizacion = this.nrocotizacion;
        dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsQuotation.FDateIni);
        dataQuotation.P_DSTARTDATE_ASE = this.typeTran != CommonMethods.TIPO_TRANSACCION.EXCLUSION ? CommonMethods.formatDate(this.inputsQuotation.FDateIniAseg) : CommonMethods.formatDate(this.inputsQuotation.FechaAnulacion);
        dataQuotation.TrxCode = tran;
        dataQuotation.RetOP = operacion;
        //dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIni.setHours(0, 0, 0, 0) ? 1 : 0;
        dataQuotation.tipoEndoso = this.inputsQuotation.P_NTYPE_END; // ENDOSO TECNICA JTV 21032023
        dataQuotation.FlagCambioFecha = this.FechaEfectoInicial.setHours(0, 0, 0, 0) != this.inputsQuotation.FDateIniAseg.setHours(0, 0, 0, 0) ? 1 : 0; // ENDOSO TECNICA JTV 25012023
        dataQuotation.P_SISCLIENT_GBD = this.contractingdata.P_SISCLIENT_GBD; // ED 22092023
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
    /* Nuevos parametros ins_cotiza_det */
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

    SetTransac() {
        try {
            switch (this.typeTran) {
                case CommonMethods.TIPO_TRANSACCION.INCLUSION: {
                    this.nTransac = 2;
                    this.sAbTransac = "IN";
                    this.questionText = '¿Desea realizar la inclusión de asegurados?';
                    break;
                }
                case CommonMethods.TIPO_TRANSACCION.RENOVACION: {
                    this.nTransac = 4;
                    this.sAbTransac = "RE";
                    this.questionText = '¿Deseas hacer la renovación de la póliza?';
                    break;
                }
                case CommonMethods.TIPO_TRANSACCION.DECLARACION: {
                    this.nTransac = 4;
                    this.sAbTransac = "DE";
                    this.isDeclare = true;
                    this.questionText = '¿Deseas hacer la declaración de la póliza?';
                    break;
                }
                case CommonMethods.TIPO_TRANSACCION.ENDOSO: {
                    this.nTransac = 8;
                    this.sAbTransac = "EN";
                    this.questionText = '¿Deseas hacer el endoso de la póliza?';
                    break;
                }
                case CommonMethods.TIPO_TRANSACCION.EXCLUSION: {
                    this.nTransac = 3;
                    this.sAbTransac = "EX";
                    break;
                }
                default:
                    this.nTransac = 1;
                    this.sAbTransac = "EM";
                    break;
            }
        } catch (error) {
            this.nTransac = 1;
            this.sAbTransac = "EM";
        }
    }
    validarExcelAseg() {
        if (this.excelSubir != undefined) {
            if (this.nTransac == 8 || this.nTransac == 2) {
                this.validarExcel(undefined);
            }
        } else {
            if (this.nTransac == 8) {
                this.categoryList = [];
                this.rateByPlanList = [];
            }
        }
    }
    //tipo endoso
    getTypeEndoso() {
        this.policyemit.GetTypeEndoso().toPromise().then(
            (res: any) => {
                this.tipoEndoso = res;
            });
    }

    validarExcelExclu() { //LS - Exclusiones con Derivacion a tecnica

        if (this.excelSubir == undefined) {
            if (this.nidProc == '') {
                this.quotationService.getProcessCode(this.nrocotizacion).toPromise().then(
                    resCod => {
                        this.nidProc = resCod;
                    }
                );
            } else {
                this.validarExcel(undefined);
            }
        } else {
            this.validarExcel(undefined);
        }
        // if (this.typeTran == 'Exclusión'){
        //   this.validarExcel(undefined);
        // }
    }

    changeBillType() {

        this.flagGobiernoEstado = false;
        this.flagPolizaMat = false;
        this.inputsQuotation.P_NPOLICY_MAT = false;
        this.inputsQuotation.P_NREM_EXC = false;
        //this.flagExc = false;
        this.clearInputPolMat();

        if (this.inputsQuotation.P_SISCLIENT_GBD == 1 && this.flagComerExclu == 0 && this.codProducto == 3) {
            this.flagGobiernoEstado = true;
            //this.flagExc = true;
        }
    }

    polizaMatriz(e: any) {
        this.flagPolizaMat = false;
        this.inputsQuotation.P_NREM_EXC = false;
        this.flagActivateExc = 0;
        //this.flagExc = false;
        this.categoryList = [];
        this.rateByPlanList = [];
        this.clearInputPolMat();
        this.typeGobiernoMatriz = false;
        if (e.target.checked) {
            this.flagPolizaMat = true;
            //this.flagExc = true;
            this.typeGobiernoMatriz = true;

        }
    }
    aprobacionCliente(e) {
        this.flagAprobCli = false;
        this.flagEnvioEmail = 0;

        if (e.target.checked) {
            this.flagAprobCli = true;
            this.flagEnvioEmail = 1;
        }
    }


    validarDecimalPorcentage(int, decimal, input) {
        CommonMethods.validateDecimals(int, decimal, input);
    }
    changeMontoSinIGV(index: number) {
    
    console.log(index);

    if (index == 1) { 
    this.MontoSinIGVEMP_18_36 = CommonMethods.formatValor((Number(this.planillainputEMP_18_36) * Number(this.tasainputEMP_18_36)) / 100,6,1);
    } /*else if (index == 1111) {
    this.MontoSinIGVEMP_37_55 = CommonMethods.formatValor((Number(this.planillainputEMP_37_55) * Number(this.tasainputEMP_37_55)) / 100,6,1);
    } else if (index == 11) {
    this.MontoSinIGVEMP_56_63 = CommonMethods.formatValor((Number(this.planillainputEMP_56_63) * Number(this.tasainputEMP_56_63)) / 100,6,1);
    } else if (index == 11111) {
    this.MontoSinIGVEMP_64_70 = CommonMethods.formatValor((Number(this.planillainputEMP_64_70) * Number(this.tasainputEMP_64_70)) / 100,6,1);
    } else if (index == 111) {
    this.MontoSinIGVEMP_71_80 = CommonMethods.formatValor((Number(this.planillainputEMP_71_80) * Number(this.tasainputEMP_71_80)) / 100,6,1);    
    } else if (index == 111111) {
    this.MontoSinIGVEMP_81_99 = CommonMethods.formatValor((Number(this.planillainputEMP_81_99) * Number(this.tasainputEMP_81_99)) / 100,6,1);    
    } */else if (index == 2) {
    this.MontoSinIGVOBR_18_36 = CommonMethods.formatValor((Number(this.planillainputOBR_18_36) * Number(this.tasainputOBR_18_36)) / 100,6,1);
    } /*else if (index == 2222) {
    this.MontoSinIGVOBR_37_55 = CommonMethods.formatValor((Number(this.planillainputOBR_37_55) * Number(this.tasainputOBR_37_55)) / 100,6,1);
    } else if (index == 22) {
    this.MontoSinIGVOBR_56_63 = CommonMethods.formatValor((Number(this.planillainputOBR_56_63) * Number(this.tasainputOBR_56_63)) / 100,6,1);
    } else if (index == 22222) {
    this.MontoSinIGVOBR_64_70 = CommonMethods.formatValor((Number(this.planillainputOBR_64_70) * Number(this.tasainputOBR_64_70)) / 100,6,1);
    } else if (index == 222) {
    this.MontoSinIGVOBR_71_80 = CommonMethods.formatValor((Number(this.planillainputOBR_71_80) * Number(this.tasainputOBR_71_80)) / 100,6,1);
    } else if (index == 222222) {
    this.MontoSinIGVOBR_81_99 = CommonMethods.formatValor((Number(this.planillainputOBR_81_99) * Number(this.tasainputOBR_81_99)) / 100,6,1);
    } */else if (index == 3) {
    this.MontoSinIGVOAR_18_36 = CommonMethods.formatValor((Number(this.planillainputOAR_18_36) * Number(this.tasainputOAR_18_36)) / 100,6,1);
    } /*else if (index == 3333) {
    this.MontoSinIGVOAR_37_55 = CommonMethods.formatValor((Number(this.planillainputOAR_37_55) * Number(this.tasainputOAR_37_55)) / 100,6,1);
    } else if (index == 33) {
    this.MontoSinIGVOAR_56_63 = CommonMethods.formatValor((Number(this.planillainputOAR_56_63) * Number(this.tasainputOAR_56_63)) / 100,6,1);
    } else if (index == 33333) {
    this.MontoSinIGVOAR_64_70 = CommonMethods.formatValor((Number(this.planillainputOAR_64_70) * Number(this.tasainputOAR_64_70)) / 100,6,1);
      }else if (index == 333) {
    this.MontoSinIGVOAR_71_80 = CommonMethods.formatValor((Number(this.planillainputOAR_71_80) * Number(this.tasainputOAR_71_80)) / 100,6,1);
    } else if (index == 333333) {
    this.MontoSinIGVOAR_81_99 = CommonMethods.formatValor((Number(this.planillainputOAR_81_99) * Number(this.tasainputOAR_81_99)) / 100,6,1);
    }*/


   // } else if (index == 4) {
    //  this.MontoSinIGVEE = CommonMethods.formatValor((Number(this.planillainputEE) * Number(this.tasainputEE)) / 100,6,1);
    
    //} else if (index == 5) {
    //  this.MontoSinIGVOE = CommonMethods.formatValor((Number(this.planillainputOE) * Number(this.tasainputOE)) / 100,6,1);
    
   // } else if (index == 6) {
   //   this.MontoSinIGVOARE = CommonMethods.formatValor((Number(this.planillainputOARE) * Number(this.tasainputOARE)) / 100,6,1);
   // }

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

    this.v_MontoSinIGVEMP_18_36 = Number(this.MontoSinIGVEMP_18_36);
    /*this.v_MontoSinIGVEMP_37_55 = Number(this.MontoSinIGVEMP_37_55);
    this.v_MontoSinIGVEMP_56_63 = Number(this.MontoSinIGVEMP_56_63);
    this.v_MontoSinIGVEMP_64_70 = Number(this.MontoSinIGVEMP_64_70);
    this.v_MontoSinIGVEMP_71_80 = Number(this.MontoSinIGVEMP_71_80);
    this.v_MontoSinIGVEMP_81_99 = Number(this.MontoSinIGVEMP_81_99);*/

    this.v_MontoSinIGVOBR_18_36 = Number(this.MontoSinIGVOBR_18_36);
    /*this.v_MontoSinIGVOBR_37_55 = Number(this.MontoSinIGVOBR_37_55);
    this.v_MontoSinIGVOBR_56_63 = Number(this.MontoSinIGVOBR_56_63);
    this.v_MontoSinIGVOBR_64_70 = Number(this.MontoSinIGVOBR_64_70);
    this.v_MontoSinIGVOBR_71_80 = Number(this.MontoSinIGVOBR_71_80);
    this.v_MontoSinIGVOBR_81_99 = Number(this.MontoSinIGVOBR_81_99);*/

    this.v_MontoSinIGVOAR_18_36 = Number(this.MontoSinIGVOAR_18_36);
    /*this.v_MontoSinIGVOAR_37_55 = Number(this.MontoSinIGVOAR_37_55);
    this.v_MontoSinIGVOAR_56_63 = Number(this.MontoSinIGVOAR_56_63);
    this.v_MontoSinIGVOAR_64_70 = Number(this.MontoSinIGVOAR_64_70);
    this.v_MontoSinIGVOAR_71_80 = Number(this.MontoSinIGVOAR_71_80);
    this.v_MontoSinIGVOAR_81_99 = Number(this.MontoSinIGVOAR_81_99);*/

    this.v_MontoSinIGVEE = Number(this.MontoSinIGVEE);
    this.v_MontoSinIGVOE = Number(this.MontoSinIGVOE);
    this.v_MontoSinIGVOARE = Number(this.MontoSinIGVOARE);

    this.MontoFPSinIGVEMP_18_36 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_18_36) * Number(frecPago),6,1);
    /*this.MontoFPSinIGVEMP_37_55 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_37_55) * Number(frecPago),6,1);
    this.MontoFPSinIGVEMP_56_63 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_56_63) * Number(frecPago),6,1);
    this.MontoFPSinIGVEMP_64_70 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_64_70) * Number(frecPago),6,1);
    this.MontoFPSinIGVEMP_71_80 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_71_80) * Number(frecPago),6,1);
    this.MontoFPSinIGVEMP_81_99 = CommonMethods.formatValor(Number(this.MontoSinIGVEMP_81_99) * Number(frecPago),6,1);*/

    this.MontoFPSinIGVOBR_18_36 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_18_36) * Number(frecPago),6,1);
    /*this.MontoFPSinIGVOBR_37_55 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_37_55) * Number(frecPago),6,1);
    this.MontoFPSinIGVOBR_56_63 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_56_63) * Number(frecPago),6,1);
    this.MontoFPSinIGVOBR_64_70 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_64_70) * Number(frecPago),6,1);
    this.MontoFPSinIGVOBR_71_80 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_71_80) * Number(frecPago),6,1);
    this.MontoFPSinIGVOBR_81_99 = CommonMethods.formatValor(Number(this.MontoSinIGVOBR_81_99) * Number(frecPago),6,1);*/

    this.MontoFPSinIGVOAR_18_36 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_18_36) * Number(frecPago),6,1);
    /*this.MontoFPSinIGVOAR_37_55 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_37_55) * Number(frecPago),6,1);
    this.MontoFPSinIGVOAR_56_63 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_56_63) * Number(frecPago),6,1);
    this.MontoFPSinIGVOAR_64_70 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_64_70) * Number(frecPago),6,1);
    this.MontoFPSinIGVOAR_71_80 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_71_80) * Number(frecPago),6,1);
    this.MontoFPSinIGVOAR_81_99 = CommonMethods.formatValor(Number(this.MontoSinIGVOAR_81_99) * Number(frecPago),6,1);*/

    this.MontoFPSinIGVEE = CommonMethods.formatValor(Number(this.MontoSinIGVEE) * Number(frecPago),6,1);
    this.MontoFPSinIGVOE = CommonMethods.formatValor(Number(this.MontoSinIGVOE) * Number(frecPago),6,1);
    this.MontoFPSinIGVOARE = CommonMethods.formatValor(Number(this.MontoSinIGVOARE) * Number(frecPago),6,1);

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

  changeMontoSinIGVEMP() {
    //LS - Poliza Matriz

    this.MontoSinIGVEMP_18_36 = CommonMethods.formatValor((Number(this.planillainputEMP_18_36) * Number(this.tasainputEMP_18_36)) / 100,6,1);
    /*this.MontoSinIGVEMP_37_55 = CommonMethods.formatValor((Number(this.planillainputEMP_37_55) * Number(this.tasainputEMP_37_55)) / 100,6,1);
    this.MontoSinIGVEMP_56_63 = CommonMethods.formatValor((Number(this.planillainputEMP_56_63) * Number(this.tasainputEMP_56_63)) / 100,6,1);
    this.MontoSinIGVEMP_64_70 = CommonMethods.formatValor((Number(this.planillainputEMP_64_70) * Number(this.tasainputEMP_64_70)) / 100,6,1);
    this.MontoSinIGVEMP_71_80 = CommonMethods.formatValor((Number(this.planillainputEMP_71_80) * Number(this.tasainputEMP_71_80)) / 100,6,1);
    this.MontoSinIGVEMP_81_99 = CommonMethods.formatValor((Number(this.planillainputEMP_81_99) * Number(this.tasainputEMP_81_99)) / 100,6,1);*/
        
        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

  changeMontoSinIGVOBR() {
    //LS - Poliza Matriz

    this.MontoSinIGVOBR_18_36 = CommonMethods.formatValor((Number(this.planillainputOBR_18_36) * Number(this.tasainputOBR_18_36)) / 100,6,1);
    /*this.MontoSinIGVOBR_37_55 = CommonMethods.formatValor((Number(this.planillainputOBR_37_55) * Number(this.tasainputOBR_37_55)) / 100,6,1);
    this.MontoSinIGVOBR_56_63 = CommonMethods.formatValor((Number(this.planillainputOBR_56_63) * Number(this.tasainputOBR_56_63)) / 100,6,1);
    this.MontoSinIGVOBR_64_70 = CommonMethods.formatValor((Number(this.planillainputOBR_64_70) * Number(this.tasainputOBR_64_70)) / 100,6,1);
    this.MontoSinIGVOBR_71_80 = CommonMethods.formatValor((Number(this.planillainputOBR_71_80) * Number(this.tasainputOBR_71_80)) / 100,6,1);
    this.MontoSinIGVOBR_81_99 = CommonMethods.formatValor((Number(this.planillainputOBR_81_99) * Number(this.tasainputOBR_81_99)) / 100,6,1);*/

        this.changeTotalSinIGV();
        this.changeTotalConIGV();
    }

  changeMontoSinIGVOAR() {
    //LS - Poliza Matriz

    this.MontoSinIGVOAR_18_36 = CommonMethods.formatValor((Number(this.planillainputOAR_18_36) * Number(this.tasainputOAR_18_36)) / 100,6,1);
    /*this.MontoSinIGVOAR_37_55 = CommonMethods.formatValor((Number(this.planillainputOAR_37_55) * Number(this.tasainputOAR_37_55)) / 100,6,1);
    this.MontoSinIGVOAR_56_63 = CommonMethods.formatValor((Number(this.planillainputOAR_56_63) * Number(this.tasainputOAR_56_63)) / 100,6,1);
    this.MontoSinIGVOAR_64_70 = CommonMethods.formatValor((Number(this.planillainputOAR_64_70) * Number(this.tasainputOAR_64_70)) / 100,6,1);
    this.MontoSinIGVOAR_71_80 = CommonMethods.formatValor((Number(this.planillainputOAR_71_80) * Number(this.tasainputOAR_71_80)) / 100,6,1);
    this.MontoSinIGVOAR_81_99 = CommonMethods.formatValor((Number(this.planillainputOAR_81_99) * Number(this.tasainputOAR_81_99)) / 100,6,1);*/

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

  changeTotalSinIGV() {
    //LS - Poliza Matriz
    this.TotalSinIGV = CommonMethods.formatValor(
            Number(this.MontoSinIGVEMP_18_36) +
            /*Number(this.MontoSinIGVEMP_37_55) +
            Number(this.MontoSinIGVEMP_56_63) +
            Number(this.MontoSinIGVEMP_64_70) +
            Number(this.MontoSinIGVEMP_71_80) +
            Number(this.MontoSinIGVEMP_81_99) +*/
            Number(this.MontoSinIGVOBR_18_36) +
            /*Number(this.MontoSinIGVOBR_37_55) +
            Number(this.MontoSinIGVOBR_56_63) +
            Number(this.MontoSinIGVOBR_64_70) +
            Number(this.MontoSinIGVOBR_71_80) +
            Number(this.MontoSinIGVOBR_81_99) +*/
            Number(this.MontoSinIGVOAR_18_36) +
            /*Number(this.MontoSinIGVOAR_37_55) +
            Number(this.MontoSinIGVOAR_56_63) +
            Number(this.MontoSinIGVOAR_64_70) +
            Number(this.MontoSinIGVOAR_71_80) +
            Number(this.MontoSinIGVOAR_81_99) +*/
        Number(this.MontoSinIGVEE) +
        Number(this.MontoSinIGVOE) +
        Number(this.MontoSinIGVOARE),
      2,
      1
    );

        this.TotalSinIGV = CommonMethods.formatValor(this.TotalSinIGV, 2, 1);
    
    this.TotalFPSinIGV = CommonMethods.formatValor(
            Number(this.MontoFPSinIGVEMP_18_36) +
            /*Number(this.MontoFPSinIGVEMP_37_55) +
            Number(this.MontoFPSinIGVEMP_56_63) +
            Number(this.MontoFPSinIGVEMP_64_70) +
            Number(this.MontoFPSinIGVEMP_71_80) +
            Number(this.MontoFPSinIGVEMP_81_99) +*/
            Number(this.MontoFPSinIGVOBR_18_36) +
            /*Number(this.MontoFPSinIGVOBR_37_55) +
            Number(this.MontoFPSinIGVOBR_56_63) +
            Number(this.MontoFPSinIGVOBR_64_70) +
            Number(this.MontoFPSinIGVOBR_71_80) +
            Number(this.MontoFPSinIGVOBR_81_99) +*/
            Number(this.MontoFPSinIGVOAR_18_36) +
            /*Number(this.MontoFPSinIGVOAR_37_55) +
            Number(this.MontoFPSinIGVOAR_56_63) +
            Number(this.MontoFPSinIGVOAR_64_70) +
            Number(this.MontoFPSinIGVOAR_71_80) +
            Number(this.MontoFPSinIGVOAR_81_99) +*/

        Number(this.MontoFPSinIGVEE) +
        Number(this.MontoFPSinIGVOE) +
        Number(this.MontoFPSinIGVOARE),
      2,
      1
    );
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

    serviciosTasasSCTR(quotationNumber) {

        const itemData: any = {};
        itemData.P_LISTATASAPENSION_LENGTH = this.listaTasasPension.length;
        itemData.P_LISTATASASALUD_LENGTH = this.listaTasasSalud.length;
        itemData.P_LISTATASAPENSION_PLANPROP0 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[0].planProp) : Number(this.listaTasasPension[0].planPro);
        itemData.P_LISTATASAPENSION_PLANPROP1 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[1].planProp) : Number(this.listaTasasPension[1].planPro);
        itemData.P_LISTATASAPENSION_PLANPROP2 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[2].planProp) : Number(this.listaTasasPension[2].planPro);
        itemData.P_LISTATASAPENSION_PLANPROP3 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[3].planProp) : Number(this.listaTasasPension[3].planPro);
        itemData.P_COM_PENSION_PRO = this.brokerList[0].P_COM_PENSION_PRO;
        itemData.P_WORKER = this.inputsQuotation.P_WORKER;
        itemData.P_PRIMA_MIN_PENSION_PRO = this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO == '' ? 0 : this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO || this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO !== '' ? Number(this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO) : Number(this.inputsQuotation.P_PRIMA_MIN_PENSION_PRO);
        itemData.P_NACT_MINA = JSON.parse(localStorage.getItem('dataquotation'))['P_NACT_MINA'];
        itemData.P_LISTATASASALUD_PLANPROP0 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[0].planProp) : Number(this.listaTasasSalud[0].planPro);
        itemData.P_LISTATASASALUD_PLANPROP1 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[1].planProp) : Number(this.listaTasasSalud[1].planPro);
        itemData.P_LISTATASASALUD_PLANPROP2 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[2].planProp) : Number(this.listaTasasSalud[2].planPro);
        itemData.P_LISTATASASALUD_PLANPROP3 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[3].planProp) : Number(this.listaTasasSalud[3].planPro);
        itemData.P_NID_COTIZACION = quotationNumber;
        itemData.P_MENSAJE = '';
        itemData.P_SDELIMITER = Number(this.inputsQuotation.P_SDELIMITER);
        itemData.RATE_PENSION0 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[0].rate) : Number(this.listaTasasPension[0].rate);
        itemData.RATE_PENSION1 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[1].rate) : Number(this.listaTasasPension[1].rate);
        itemData.RATE_PENSION2 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[2].rate) : Number(this.listaTasasPension[2].rate);
        itemData.RATE_PENSION3 = this.listaTasasPension.length == 0 ? 0 : this.listaTasasPension.length || this.listaTasasPension.length > 0 ? Number(this.listaTasasPension[3].rate) : Number(this.listaTasasPension[3].rate);
        itemData.RATE_SALUD0 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[0].rate) : Number(this.listaTasasSalud[0].rate);
        itemData.RATE_SALUD1 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[1].rate) : Number(this.listaTasasSalud[1].rate);
        itemData.RATE_SALUD2 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[2].rate) : Number(this.listaTasasSalud[2].rate);
        itemData.RATE_SALUD3 = this.listaTasasSalud.length == 0 ? 0 : this.listaTasasSalud.length || this.listaTasasSalud.length > 0 ? Number(this.listaTasasSalud[3].rate) : Number(this.listaTasasSalud[3].rate);

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(itemData));

        this.policyemit.Msj_TecnicsSCTR(myFormData).subscribe();
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
            itemNCTEMP.P_NID_COTIZACION = this.cotizacionNC.savedPolicyList && this.cotizacionNC.savedPolicyList.length > 0 ? Number(this.cotizacionNC.savedPolicyList[0].P_NID_COTIZACION) : Number(this.cotizacion.numeroCotizacion);
            itemNCTEMP.P_NRECEIPT_NC = Number(this.CreditDataNC[i].documento_nc);
            itemNCTEMP.P_MONEDA = Number(this.CreditDataNC.moneda) || 1;
            itemNCTEMP.P_NAMOUNT_NC = Number(this.CreditDataNC[i].monto);
            itemNCTEMP.P_SCODCHANNEL = Number(this.CanalNC.canal);
            itemNCTEMP.P_NIDPAYTYPE = this.CreditDataNC[i].forma_pago == 'NC' ? 4 : this.CreditDataNC[i].forma_pago || this.CreditDataNC[i].forma_pago == 'PCP' ? 7 : this.CreditDataNC[i].forma_pago;
            itemNCTEMP.P_NIDUSER = Number(this.UserID);
            itemNCTEMP.P_ESTADO = 1;
            itemNCTEMP.P_NTYPETRANSAC = this.nTransac != null ? this.nTransac : 0;
            itemNCTEMP.P_DESTYPETRANSAC = this.sAbTransac != null ? this.sAbTransac : 'NO HAY REGISTRO';

            NCRollQuotation.ListainsertNCTEMP.push(itemNCTEMP);
        }

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(NCRollQuotation));

        await this.accPersonalesService.insertNCTemp(myFormData).toPromise().then(async (res: any) => { });

    }

    // INI ENDOSO TECNICA JTV 01022023
    changeTipoEndoso() {
        if (this.inputsQuotation.P_NTYPE_END != 2) {
            this.disabledEndosoFechaAseg = true;
            this.inputsQuotation.FDateIniAseg = new Date(this.FechaEfectoInicial);
        }
        else {
            this.disabledEndosoFechaAseg = false;
        }
    }
    // FIN ENDOSO TECNICA JTV 01022023

    async ValidarCIIUPorTransaccion() {
        this.flagCIIUEmpty = (this.typeTran == CommonMethods.TIPO_TRANSACCION.DECLARACION || this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION) && this.isEmptyString(this.inputsQuotation.P_NECONOMIC) ? true : false  //Mejoras CIIU VL
        if (this.flagCIIUEmpty) {
            this.inputsQuotation.P_NECONOMIC = null;
        }
        this.flagdisabledCIIU = this.flagCIIUEmpty || (this.typeTran == CommonMethods.TIPO_TRANSACCION.RENOVACION); //Mejoras CIIU VL
        this.flagBuscarCIIU = this.flagdisabledCIIU;
    }

    isEmptyString(data: string): boolean {
        return (typeof data === "string" && data.trim().length == 0) || data == null ? true : false;
    }

    formatoTrama() {
        const data: any = {};
        data.poliza = 0;
        this.loading = true;
        this.policyemit.DownloadExcelPlantillaVidaLey(data).toPromise().then(
            res => {
                const nameFile: string = 'TramaVl_Cotizacion'
                const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsm', { type: '	application/vnd.ms-excel.sheet.macroEnabled.12' });
                FileSaver.saveAs(file);
                this.loading = false;
            },
            err => {
                this.loading = false
            }
        )
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

    validacionBroker() { //AVS - PRY COMSIIONES 06/07/2023
        const data: any = {};
        data.P_SCLIENT = this.brokerList[0].SCLIENT;
        this.flagBrokerDirecto = 0;
        this.quotationService.validateBroker(data).toPromise().then(
            res => {
                this.flagBrokerDirecto = res.P_FLAG_BROKER;
            }
        )
    }
}
