import { PolizaAsegurados } from '../../../models/polizaEmit/PolizaAsegurados';
import { PolizaEmitCab } from '../../../models/polizaEmit/polizaEmitCab';
import { PolizaEmitComer } from '../../../models/polizaEmit/polizaEmitComer';
import { ProfileEsp } from '../../../models/shared/client-information/Profile-Esp';
import { PolizaEmitDet, PolizaEmitDetAltoRiesgo, PolizaEmitDetMedianoRiesgo, PolizaEmitDetBajoRiesgo } from '../../../models/polizaEmit/PolizaEmitDet';
import { Component, OnInit, Input, ElementRef, ViewContainerRef, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ValErrorComponent } from '../../../modal/val-error/val-error.component';
import { VisaService } from '../../../../../shared/services/pago/visa.service';
import { AppConfig } from '../../../../../app.config';
import * as FileSaver from 'file-saver';

//Compartido
import { AccessFilter } from './../../access-filter'
import { ModuleConfig } from './../../module.config'
import { OthersService } from '../../../services/shared/others.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { MethodsPaymentComponent } from '../../../modal/methods-payment/methods-payment.component';

// Util
import { CommonMethods } from './../../common-methods'
import { ToastrService } from 'ngx-toastr';
import { SessionToken } from './../../../../client/shared/models/session-token.model'
import { ValidateLockReponse } from '@root/layout/broker/interfaces/validate-lock-response';
import { ValidateDebtReponse } from '@root/layout/broker/interfaces/validate-debt-response';
import { ValidateDebtRequest } from '@root/layout/broker/models/collection/validate-debt.request';
import { ValidateLockRequest } from '@root/layout/broker/models/collection/validate-lock-request';
import { CobranzasService } from '@root/layout/broker/services/cobranzas/cobranzas.service';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
@Component({
  selector: 'app-policy-form',
  templateUrl: './policy-form.component.html',
  styleUrls: ['./policy-form.component.css']
})
export class PolicyFormComponent implements OnInit {
  nrocotizacion: any = '';
  savedPolicyList: any = [];
  ListainsertEmit: any = [];
  savedPolicyEmit: any = {};
  dataQuotation: any = {};
  @Input() public reference: any;
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;
  files: File[] = []
  flagAltoP = false;
  flagBajoP = false;
  flagMedianoP = false;
  flagTipoR = false
  lastFileAt: Date
  lastInvalids: any
  maxSize: any
  primas: any[] = []
  flagExtension = false;
  tamañoArchivo = 0;
  disabledFecha = true;
  errorFrecPago = false;
  loading = false;
  existoso = false;
  activacion = false;
  activacionFin = false;
  factorIgv: any;
  totalSTRC = 0;
  totalSalud = 0;
  activacionExitoso = false;
  NroSalud: any;
  NroPension: any;
  ProductoPension: any;
  ProductoSalud: any;
  flagBusqueda = false;
  fechaEvento: any;
  flagFechaMenorMayor = true;
  flagFechaMenorMayorFin = true;
  flagEmail = false;
  flagEmailNull = true;
  clickValidarArchivos = false;
  clickValidarExcel = false;
  valcheck1 = false
  valcheck2: boolean
  valcheck3: boolean
  asegurados: any = []
  cotizacionID: string = '';
  erroresList: any = [];
  saludList: any = [];
  pensionList: any = [];
  tasasList: any = [];
  contractingdata: any = [];
  activityVariationPension = '';
  activityVariationSalud = '';
  totalNetoSaludSave = 0.0;
  totalNetoPensionSave = 0.0;
  igvSaludSave = 0.0;
  igvPensionSave = 0.0;
  brutaTotalSaludSave = 0.0;
  brutaTotalPensionSave = 0.0;
  mensajePrimaPension = '';
  mensajePrimaSalud = '';
  igvPensionWS: number = 0.0;
  igvSaludWS: number = 0.0;
  endosoPension: string;
  endosoSalud: string;
  bsConfig: Partial<BsDatepickerConfig>;
  igvPension = 0;
  igvSalud = 0;
  nidProc = '' 

  validateLockResponse: ValidateLockReponse = {};
  validateDebtResponse: ValidateDebtReponse = {};

  isValidatedInClickButton: boolean = false;
  ValFecha: boolean = false;
  excelSubir: File;
  errorExcel = false;
  errorNroCot = false;
  excelJson: any[] = [];
  archivosJson: any[] = [];
  mensajeValidacion = '';
  indentificacion = '';
  flagColumnas = false;
  primaTotalPension = 0;
  primatotalSalud = 0;
  filePathList = [];
  validaciones = [];
  validacionIndentifacion = [];
  validacionIndentifacionRUC20 = [];
  validacionIndentifacionRUC10 = [];
  mensajeValidacionInd = '';
  objcolumnas = [];
  objcolumnasRuc20 = [];
  objcolumnasRuc10 = [];
  polizaEmit: any = {};
  polizaEmitCab: any = {};
  SClient: string;
  polizaEmitComer: any[] = [];
  polizaEmitComerDTOPrincipal: PolizaEmitComer = new PolizaEmitComer();
  polizaEmitComerDTO: PolizaEmitComer = new PolizaEmitComer();
  polizaEmitDet: any[] = [];
  polizaEmitComerPrincipal = [] = [];
  polizaEmitDetDTO: PolizaEmitDet = new PolizaEmitDet();
  polizaEmitDetAltoRiesgo: PolizaEmitDetAltoRiesgo = new PolizaEmitDetAltoRiesgo();
  polizaEmitDetMedianoRiesgo: PolizaEmitDetMedianoRiesgo = new PolizaEmitDetMedianoRiesgo();
  polizaEmitDetBajoRiesgo: PolizaEmitDetBajoRiesgo = new PolizaEmitDetBajoRiesgo();
  polizaAsegurados: PolizaAsegurados = new PolizaAsegurados();
  profileEsp: ProfileEsp[];
  tipoRenovacion: any = [];
  frecuenciaPago: any = [];
  lblProducto: string = '';
  lblFecha: string = '';
  fechaCheck: boolean = true;
  tableComer = false;
  processID: any = '';
  mode: String; //emitir, incluir, renovar : emit, include, renew
  title: string; //titulo del formulario
  pensionID = JSON.parse(localStorage.getItem('pensionID'));
  saludID = JSON.parse(localStorage.getItem('saludID'));
  vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
  perfil = '';
  codFlat = '';
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']
  //epsItem = JSON.parse(sessionStorage.getItem('eps'))
  epsItem = JSON.parse(localStorage.getItem('eps'))
  currentUser = JSON.parse(localStorage.getItem('currentUser'))
  profileId: any;
  usercode = JSON.parse(localStorage.getItem('currentUser'))['id']
  tipoClientGBD = JSON.parse(localStorage.getItem('inputsquotation'));
  emisionMapfre: any

  /**Puede facturar a mes vencido? */
  canBillMonthly: boolean = true;
  /**Puede facturar anticipadamente? */
  canBillInAdvance: boolean = true;
  /** Facturacion a mes vencido */
  facVencido: boolean = false;
  /** Facturacion anticipada */
  facAnticipada: boolean = false;
  /**Tenemos un número de cotización? */
  hasQuotationNumber: boolean = false;
  dayConfig: any = 0;
  dayRetroConfig: any = 0;
  monthPerPay = 1;
  monthsSCTR: any; //AVS - Nueva Estimación De Cálculo
  disabledEps = false;
  mensajeEquivalente: string = '';
  nroMovimientoEPS: any = null
  nroCotizacionEps: any = null
  template: any = {}
  variable: any = {}
  alertGrati = ''
  clienteValido = false
  dEmiPension = 0
  dEmiSalud = 0
  paymentType: any = null
  visaData: any;
  prePayment: boolean = false
  modalRef: BsModalRef;
  @ViewChild('peModal') content;
  creditHistory: any = null
  dataCIP: any;
  perfilActual: any;
  nbranch: any = '';
  montos_sctr: any = [];
  DataSCTRPENSION: any = [];
  DataSCTRSALUD: any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private othersService: OthersService,
    private toastr: ToastrService,
    private policyemit: PolicyemitService,
    private quotationService: QuotationService,
    private modalService: NgbModal,
    private visaService: VisaService,
    private viewContainerRef: ViewContainerRef,
    private factoryResolver: ComponentFactoryResolver,
    private clientInformationService: ClientInformationService,
    private readonly appConfig: AppConfig,
    private collectionsService: CobranzasService,
    private readonly modalServiceInfo: BsModalService,
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

    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME);

    this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
    this.profileId = await this.getProfileProduct(); // 20230325

    this.lblFecha = CommonMethods.tituloPantalla();
    this.perfil = this.variable.var_prefilExterno;
    this.codFlat = this.variable.var_flatKey;
    this.perfilActual = await this.getProfileProduct(); // 20230325
    this.getProfileEsp();

    this.loading = true;

    await this.route.queryParams
      .subscribe(params => {
        this.nrocotizacion = params.quotationNumber;
        if (this.nrocotizacion != null && this.nrocotizacion !== undefined && this.nrocotizacion.toString().trim() != '') { this.hasQuotationNumber = true; }
      });

    await this.obtenerTipoRenovacion();
    await this.getDataConfig();

    if (this.template.ins_validaPermisos) {
      if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_emission']) == false) { this.router.navigate(['/extranet/home']); }
      this.canBillMonthly = AccessFilter.hasPermission('16');
      this.canBillInAdvance = AccessFilter.hasPermission('17');
    }

    if (!this.template.ins_clienteRegula) { this.clienteValido = true; }
    this.polizaEmit.facturacionVencido = false;
    this.polizaEmit.facturacionAnticipada = false;
    this.polizaEmit.comentario = '';
    this.polizaEmitCab.MINA = false;
    this.polizaEmitCab.bsValueIni = ModuleConfig.StartDateTrx;
    this.polizaEmitCab.bsValueFin = ModuleConfig.EndDateTrx;
    this.polizaEmitCab.bsValueIniMin = new Date();
    this.polizaEmitCab.bsValueFinMax = new Date();
    this.polizaEmitCab.bsValueFinMin = new Date();
    this.polizaEmitComerDTOPrincipal.TYPE_DOC_COMER = '';
    this.polizaEmitComerDTOPrincipal.DES_DOC_COMER = 'Seleccione';
    this.polizaEmitDet.push(this.polizaEmitDetDTO);
    this.polizaEmitCab.TIPO_DOCUMENTO = '';
    this.polizaEmitCab.tipoRenovacion = '';
    this.polizaEmitCab.ACT_TECNICA = '';
    this.polizaEmitCab.COD_ACT_ECONOMICA = '';
    //this.polizaEmitCab.P_SISCLIENT_GBD = this.tipoClientGBD == null ? '2' : this.tipoClientGBD;
    this.polizaEmitCab.COD_TIPO_SEDE = '';
    this.polizaEmitCab.COD_MONEDA = '';
    this.polizaEmitCab.COD_DEPARTAMENTO = '';
    this.polizaEmitCab.COD_PROVINCIA = '';
    this.polizaEmitCab.COD_DISTRITO = '';
    this.polizaEmitCab.frecuenciaPago = '';
    this.polizaEmitCab.prePayment = false;

    if (this.template.ins_prePaymentEmision) {
      await this.checkPaymentTypes(this.currentUser)
    }



    if (this.nrocotizacion != undefined) {
      this.buscarCotizacion(event);
    }

    await this.getDataIgv()
    this.loading = false;

    CommonMethods.clearBack();
  }

  async getProfileProduct() {
    let profile = 0;

    let _data: any = {};
    _data.nUsercode = this.usercode;
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
            })
        }
      }
    );
  }

  async getDataIgv() {
    let data = ['I', 'D']
    // Pension
    for (var item of data) {
      let itemIGV: any = {};
      itemIGV.P_NBRANCH = this.pensionID.nbranch;
      itemIGV.P_NPRODUCT = this.pensionID.id;
      itemIGV.P_TIPO_REC = item;

      await this.quotationService.getIGV(itemIGV).toPromise().then(
        res => {
          this.igvPensionWS = item == 'I' ? res : this.igvPensionWS
          this.dEmiPension = item == 'D' ? res : this.dEmiPension
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
          this.igvSaludWS = item == 'I' ? res : this.igvSaludWS
          this.dEmiSalud = item == 'D' ? res : this.dEmiSalud
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

  async getDataConfig() {
    await this.policyemit.getDataConfig('DIASRETRO_EMISION').toPromise().then(
      res => {
        if (res[0] != undefined) {
          this.dayRetroConfig = Number(res[0].SDATA)
        }
      },
      err => {
      }
    );

    await this.policyemit.getDataConfig('DIASADD_EMISION').toPromise().then(
      res => {
        if (res[0] != undefined) {
          this.dayConfig = Number(res[0].SDATA)
        }
      },
      err => {
      }
    );
  }

  onFacturacion() {
    this.resetearPrimas(this.polizaEmitCab.MIN_PENSION_AUT, this.pensionID.id, this.polizaEmit.facturacionVencido)
    this.resetearPrimas(this.polizaEmitCab.MIN_SALUD_AUT, this.saludID.id, this.polizaEmit.facturacionVencido)

    this.facAnticipada = this.polizaEmit.facturacionVencido ? true : false
    this.facVencido = this.polizaEmit.facturacionAnticipada ? true : false

    if (!this.polizaEmit.facturacionVencido && !this.polizaEmit.facturacionAnticipada) {
      this.facVencido = false;
      this.facAnticipada = false;
    }
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
  }

  getProfileEsp() {
    this.clientInformationService.getProfileEsp().subscribe(
        res => {
            this.profileEsp = res;
        },
        err => { }
    );
  }


  validarExcel() {
    if (this.cotizacionID != '') {
      if (this.excelSubir != undefined) {
        this.validarTrama()
      } else {
        swal.fire('Información', 'Adjunte una trama para validar', 'error');
      }

    } else {
      swal.fire('Información', 'Ingrese una cotización', 'error');
    }
  };

  async validarTrama() {
    let mensaje = '';
    mensaje = await this.validateEmit('cot')
    if (mensaje === '') {
      this.errorExcel = false;
      this.loading = true;

      const myFormData: FormData = new FormData();
      myFormData.append('dataFile', this.excelSubir);

      const data: any = {};
      data.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
      data.nroCotizacion = this.cotizacionID;
      data.type_mov = '1';
      data.retarif = '1';
      data.date = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
      data.dateFn = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
      data.eps = this.epsItem.STYPE;
      data.nroCotizacionEPS = this.nroCotizacionEps;
      data.nroPolizaEPS = null;
      data.tipDocumento = this.polizaEmitCab.TIPO_DOCUMENTO;
      data.nroDocumento = this.polizaEmitCab.NUM_DOCUMENTO;
      data.tipRenovacion = this.polizaEmitCab.tipoRenovacion;
      data.codRamo = this.nbranch;
      data.codProceso = this.nidProc;

      myFormData.append('objValida', JSON.stringify(data));

      await this.policyemit.valGestorList(myFormData).toPromise().then(
        async res => {
          this.tasasList = []
          this.pensionList = []
          this.saludList = []
          this.visaData = null;
          this.erroresList = res.C_TABLE;
          if (res.P_COD_ERR == '1') {
            swal.fire('Información', res.P_MESSAGE, 'error');
          } else {
            if (this.erroresList != null) {
              if (this.erroresList.length > 0) {
                this.processID = '';
                this.nroMovimientoEPS = null
                const modalRef = this.modalService.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.formModalReference = modalRef;
                modalRef.componentInstance.erroresList = this.erroresList;
              } else {
                this.processID = res.P_NID_PROC;
                this.nroMovimientoEPS = res.P_NID_PROC_EPS;
                await this.infoCarga(this.processID)

                if (this.template.ins_prePaymentEmision) {
                  this.prePayment = false;
                  if (this.paymentType != null) {
                    // Pago visa
                    if (this.paymentType.bvisa == 1) {
                      await this.callButtonVisa(this.currentUser);
                    }

                    // Pago efectivo
                    if (this.paymentType.bpagoefectivo == 1) {
                      await this.callButtonPE();
                    }
                  }

                  await this.validatePrePayment();
                }

                swal.fire('Información', 'Se validó correctamente la trama', 'success');
              }
            } else {
              swal.fire('Información', 'El archivo enviado contiene errores', 'error');
            }
          }

        },
        err => {
          this.loading = false;
        }
      );
    } else {
      swal.fire('Información', mensaje, 'error');
    }

    this.loading = false;
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

  async prePaymentChange() {
    if (this.prePayment) {
      this.visaData.email = this.polizaEmitCab.CORREO;
      await this.validateFlow();
      const policyData: any = {};
      policyData.visaData = this.visaData;
      policyData.savedPolicyList = this.savedPolicyList;
      policyData.contractingdata = this.contractingdata;
      policyData.emisionMapfre = this.emisionMapfre == null ? null : this.emisionMapfre;
      policyData.adjuntos = this.files;
      policyData.transaccion = 1;
      policyData.dataCIP = this.dataCIP;
      localStorage.setItem('policydata', JSON.stringify(policyData));
    }
  }

  async callButtonVisa(userData: any) {
    // const totalPolicy = await this.calculateTotal();  // RI - SCTR - LNSR
    const totalPolicy = await this.CalculateAjustedAmounts();
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
          timeoutUrl: CommonMethods.urlTimeout(this.codProducto, 1),
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

  onPayment() {
    this.router.navigate(['/extranet/policy/pago-efectivo']);
  }

  openPagoEfectivoInfo() {
    this.modalRef = this.modalServiceInfo.show(this.content);
  }

  async callButtonPE() {
    // let totalPolicy = await this.calculateTotal() // RI - SCTR - LNSR
    let totalPolicy = await this.CalculateAjustedAmounts();
    let nameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
    let lastnameClient = this.contractingdata.P_NPERSON_TYP == 1 ? this.contractingdata.P_SLASTNAME + ' ' + this.contractingdata.P_SLASTNAME2 : ''

    this.dataCIP = {}
    this.dataCIP.tipoSolicitud = 1 // Solo para emision
    this.dataCIP.monto = totalPolicy
    this.dataCIP.correo = this.polizaEmitCab.CORREO
    this.dataCIP.conceptoPago = CommonMethods.conceptProduct(this.codProducto)
    this.dataCIP.nombres = nameClient
    this.dataCIP.Apellidos = lastnameClient
    this.dataCIP.ubigeoINEI = await this.ubigeoInei(this.polizaEmitCab.COD_DISTRITO)
    this.dataCIP.tipoDocumento = this.polizaEmitCab.TIPO_DOCUMENTO
    this.dataCIP.numeroDocumento = this.polizaEmitCab.NUM_DOCUMENTO
    this.dataCIP.telefono = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : ''
    this.dataCIP.ramo = this.pensionID.nbranch
    this.dataCIP.producto = this.pensionID.id
    this.dataCIP.ExternalId = this.processID
    this.dataCIP.quotationNumber = this.nrocotizacion
    this.dataCIP.codigoCanal = this.polizaEmitComer[0].CANAL;
    this.dataCIP.codUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
    // localStorage.setItem('policydataCIP', JSON.stringify(dataCIP))
  }

  async ubigeoInei(distrito) {
    let ubigeo = 0
    await this.quotationService.equivalentMunicipality(distrito).toPromise().then(
      res => {
        ubigeo = res;
      },
      error => {
        this.loading = false;
        ubigeo = 0;
      }
    );
    return ubigeo;
  }

  async validateFlow() {
    let mensaje = '';
    mensaje = await this.validateEmit();

    if (mensaje == '') {
      let ncodeStatus = '0'

      if (this.flagEmailNull == false) {
        ncodeStatus = await this.updateClient();
      }

      if (ncodeStatus == '0') {
        this.flagEmailNull = true;
        this.savedPolicyList = [];
        await this.dataEmision(this.visaData.idProcess);

      } else {
        this.prePayment = false;
        this.loading = false;
        swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
      }

    } else {
      this.prePayment = false
      this.loading = false;
      swal.fire('Información', mensaje, 'error');
    }
  }

  visaClick() {
    this.appConfig.AddEventAnalityc();
  }

  async calculateTotal() {
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

  async infoCarga(processID: any) {
    let self = this;
    let Vencido = this.facVencido == true ? 1 : 0; //AVS - INTERCONEXION SABSA
    if (processID != '') {
      await this.policyemit.getPolicyEmitDetTX(processID, '1', JSON.parse(localStorage.getItem('currentUser'))['id'], Vencido)
        .toPromise().then(async res => {
          if (res.length > 0) {
            this.pensionList = []
            this.saludList = []
            this.primaTotalPension = 0;
            this.primatotalSalud = 0;

            await this.completarCalculos(res)
            if (this.template.ins_rmaList && this.pensionList.length > 0) await this.remuneracionMaximaList(res, this.pensionID.id)
            if (this.template.ins_clienteRegula) await this.getRegulaClient(res)
            await this.resetearPrimas(this.polizaEmitCab.MIN_PENSION_AUT, this.pensionID.id, this.polizaEmit.facturacionVencido)
            await this.resetearPrimas(this.polizaEmitCab.MIN_SALUD_AUT, this.saludID.id, this.polizaEmit.facturacionVencido)
            this.tasasList = this.pensionList.length > 0 ? this.pensionList : this.saludList.length > 0 ? this.saludList : []
            await this.cargarPlanillas()

          } else {
            this.primaTotalPension = 0;
            this.primatotalSalud = 0;
            this.igvPension = 0;
            this.igvSalud = 0;
            this.totalSalud = 0;
            this.totalSTRC = 0;
          }
        })
    }

  }
  getRegulaClient(res: any) {
    for (let item of res) {
      if (item.OPC_MES_VENCIDO == 1) {
        this.clienteValido = true
        break
      } else {
        this.clienteValido = false
      }
    }
  }

  cargarPlanillas() {
    if (this.pensionList.length > 0) {
      this.tasasList.forEach(tasa => {
        this.pensionList.forEach(pension => {
          if (tasa.TIP_RIESGO == pension.TIP_RIESGO)
            tasa.MONTO_PLANILLA_PENSION = pension.MONTO_PLANILLA
        });
      });
    }

    if (this.saludList.length > 0) {
      this.tasasList.forEach(tasa => {
        this.saludList.forEach(salud => {
          if (tasa.TIP_RIESGO == salud.TIP_RIESGO)
            tasa.MONTO_PLANILLA_SALUD = salud.MONTO_PLANILLA
        });
      });
    }
  }

  remuneracionMaximaList(res: any, productId: any): any {
    for (let item of res) {
      if (item.ID_PRODUCTO == productId) {
        this.polizaEmitCab.rma = item.REMUNERACION_TOPE
        this.polizaEmitCab.desdeRma = item.REMUN_TOPE_DESDE
        this.polizaEmitCab.finRma = item.REMUN_TOPE_HASTA
      }
    }
  }

  resetearPrimas(primPropuesta, productoId, flag) {
    primPropuesta = !isNaN(Number(primPropuesta)) ? Number(primPropuesta) : 0;
    const tasas = productoId == this.pensionID.id ? this.pensionList : this.saludList
    const totalNeto = productoId == this.pensionID.id ? Number(this.primaTotalPension) : Number(this.primatotalSalud)
    const primaMinima = productoId == this.pensionID.id ? Number(this.polizaEmitCab.PRIMA_PEN_END) : Number(this.polizaEmitCab.PRIMA_SALUD_END)
    const productos = [this.pensionID.id, this.saludID.id]

    if (tasas.length > 0) {
      productos.forEach(producto => {
        if (producto == productoId) {
          if (flag) {
            this.calculoNoRegular(primPropuesta, productoId, totalNeto, primaMinima)
          } else {
            this.calculoRegular(primPropuesta, productoId, totalNeto, primaMinima)
          }
        }
      });
    }
  }

  calculoNoRegular(primPropuesta: number, productoId: any, totalNeto: number, primaMinima: number) {
    if (primPropuesta > 0) {
      if (primPropuesta > totalNeto) {
        this.recalcularPrima(productoId, totalNeto, '')

      } else {
        this.recalcularPrima(productoId, totalNeto, '')
      }
    }
  }
  calculoRegular(primPropuesta: number, productoId: any, totalNeto: number, primaMinima: number) {
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

  recalcularPrima(productoId: any, monPropuesto: number, mensaje: any) {
    if (productoId == this.pensionID.id) {
      this.totalNetoPensionSave = CommonMethods.formatValor(monPropuesto, 6/*2 AVS - Nueva Estimación De Cálculo 22/12/2022*/)
      this.polizaEmitCab.primaComPension = CommonMethods.formatValor(monPropuesto * this.dEmiPension, 6);
      this.igvPensionSave = CommonMethods.formatValor((this.totalNetoPensionSave * this.igvPensionWS) - this.totalNetoPensionSave, 6);
      this.brutaTotalPensionSave = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) + Number(this.igvPensionSave), 6)
      this.mensajePrimaPension = mensaje;
    }

    if (productoId == this.saludID.id) {
      this.totalNetoSaludSave = CommonMethods.formatValor(monPropuesto, 2);
      this.polizaEmitCab.primaComSalud = CommonMethods.formatValor(monPropuesto * this.dEmiSalud, 6);
      this.igvSaludSave = CommonMethods.formatValor((this.totalNetoSaludSave * this.igvSaludWS) - this.totalNetoSaludSave, 6);
      this.brutaTotalSaludSave = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) + Number(this.igvSaludSave), 6);
      this.mensajePrimaSalud = mensaje;
    }
  }
  async completarCalculos(res: any) {
    let pensionList = []
    let saludList = []

    for (let item of res) {
      if (item.ID_PRODUCTO == this.pensionID.id) {
        pensionList.push(item)
      }

      if (item.ID_PRODUCTO == this.saludID.id) {
        saludList.push(item)
      }
    }

    let infoDataPension: any = await this.infoGenerica(this.pensionID.id, pensionList)
    if (infoDataPension != null) {
      this.activityVariationPension = infoDataPension.actividadVariacion
      this.primaTotalPension = infoDataPension.totalNetoPre
      this.brutaTotalPensionSave = infoDataPension.totalNeto
      this.polizaEmitCab.primaComPension = infoDataPension.primaCom
      this.polizaEmitCab.primaComPensionPre = infoDataPension.primaComPre
      this.igvPension = infoDataPension.igvPre
      this.igvPensionSave = infoDataPension.igv
      this.totalNetoPensionSave = infoDataPension.totalBrutoPre
      this.totalNetoPensionSave = infoDataPension.totalBruto
      this.endosoPension = infoDataPension.endoso
      this.pensionList = infoDataPension.tasasProducto;
    }

    let infoDataSalud: any = await this.infoGenerica(this.saludID.id, saludList)
    if (infoDataSalud != null) {
      this.activityVariationSalud = infoDataSalud.actividadVariacion
      this.primatotalSalud = infoDataSalud.totalNetoPre
      this.brutaTotalSaludSave = infoDataSalud.totalNeto
      this.polizaEmitCab.primaComSalud = infoDataSalud.primaCom
      this.polizaEmitCab.primaComSaludPre = infoDataSalud.primaComPre
      this.igvSalud = infoDataSalud.igvPre
      this.igvSaludSave = infoDataSalud.igv
      this.totalNetoSaludSave = infoDataSalud.totalBrutoPre
      this.totalNetoSaludSave = infoDataSalud.totalBruto
      this.endosoSalud = infoDataSalud.endoso
      this.saludList = infoDataSalud.tasasProducto;
    }
  }
  infoGenerica(productoId: any, item: any): any {
    let response: any = {}
    const dEmision: number = productoId == this.pensionID.id ? this.dEmiPension : this.dEmiSalud
    const igvProducto: number = productoId == this.pensionID.id ? this.igvPensionWS : this.igvSaludWS
    const tasasProducto: any = item
    if (tasasProducto.length > 0) {
      let neto = 0;
      let totalTrabajadores = 0
      tasasProducto.forEach(item => {
        item.TASA_PRO = ''
        item.PRIMA_MIN_PRO = 0;
        item.AUT_PRIMA = Number(item.AUT_PRIMA)
        item.rateDet = item.TASA_RIESGO;
        response.endoso = item.PRIMA_END;
        response.prima_min = CommonMethods.formatValor(item.PRIMA_MIN, 2);
        response.actividadVariacion = !isNaN(Number(item.VARIACION_TASA)) ? item.VARIACION_TASA : 0
        neto = neto + Number(item.AUT_PRIMA)
        totalTrabajadores = totalTrabajadores + Number(item.NUM_TRABAJADORES);
      });
      response.mensaje = '';
      // if (this.template.ins_mapfre && productoId == this.saludID) {
      // 	response.totalNeto = CommonMethods.formatValor(item.enterprise[0].impPneta, 2)
      // 	response.primaCom = CommonMethods.formatValor(item.enterprise[0].impPneta, 2)
      // 	response.igv = CommonMethods.formatValor(item.enterprise[0].impImptos + item.enterprise[0].impRecargos, 2)
      // 	response.totalBruto = CommonMethods.formatValor(item.enterprise[0].impPrimaTotal, 2)
      // } else {
      response.totalNetoPre = CommonMethods.formatValor(neto, 6);
      response.totalNeto = CommonMethods.formatValor(neto, 6);
      response.primaComPre = CommonMethods.formatValor(neto * dEmision, 6);
      response.primaCom = CommonMethods.formatValor(neto * dEmision, 6);
      response.igvPre = CommonMethods.formatValor((Number(response.totalNetoPre) * Number(igvProducto)) - Number(response.totalNetoPre), 6);
      response.igv = CommonMethods.formatValor((Number(response.totalNeto) * Number(igvProducto)) - Number(response.totalNeto), 6);
      response.totalBrutoPre = CommonMethods.formatValor(Number(response.primaComPre) + Number(response.igv), 6);
      response.totalBruto = CommonMethods.formatValor(Number(response.primaCom) + Number(response.igv), 6);
      // }

      if (Number(response.totalNeto) < Number(response.prima_min)) {
        response.totalNeto = CommonMethods.formatValor(Number(response.prima_min), 6);
        response.primaCom = CommonMethods.formatValor(response.totalNeto * dEmision, 6);
        response.igv = CommonMethods.formatValor((response.totalNeto * igvProducto) - response.totalNeto, 6);
        response.totalBruto = CommonMethods.formatValor(Number(response.primaCom) + Number(response.igv), 6);
        response.mensaje = this.variable.var_msjPrimaMin;
      }

      this.polizaEmitCab.totalTrabajadores = totalTrabajadores;
      response.tasasProducto = tasasProducto;
    } else {
      response = null;
    }
    return response;
  }

  buscarCotizacion(event) {
    this.cotizacionID = '';
    this.NroPension = '';
    this.NroSalud = '';
    this.flagBusqueda = false;
    this.pensionList = [];
    this.saludList = [];
    this.tasasList = [];
    const typeMovement = '1';
    this.flagEmailNull = true;
    // Cabeza Cotizacion | Datos de la póliza
    if (this.nrocotizacion != undefined && this.nrocotizacion != 0) {
      this.policyemit.getPolicyEmitCab(this.nrocotizacion, typeMovement, JSON.parse(localStorage.getItem('currentUser'))['id'])
        .toPromise().then(async res => {
          this.cotizacionID = this.nrocotizacion;
          if (res.GenericResponse !== null) {
            if (res.GenericResponse.MENSAJE == null ||
              res.GenericResponse.MENSAJE === '') {
              // if (res.GenericResponse.COD_ERR == 0) {
              this.filePathList = res.GenericResponse.RUTAS;
              this.SClient = res.GenericResponse.SCLIENT;
              this.nroCotizacionEps = res.GenericResponse.SCOTIZA_LNK;

              this.polizaEmitCab = res.GenericResponse;
              if (this.polizaEmitCab.CORREO == '') {
                this.flagEmailNull = false;
              }
              await this.dataClient();

              if (this.template.ins_historialCreditoTransaction) {
                const data: any = {};
                data.tipoid = this.contractingdata.P_NIDDOC_TYPE == '1' ? '2' : '1';
                data.id = this.contractingdata.P_SIDDOC;
                data.papellido = this.contractingdata.P_SLASTNAME;
                data.sclient = this.contractingdata.P_SCLIENT;
                data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.clientInformationService.invokeServiceExperia(data).subscribe(
                  res => {
                    this.creditHistory = {}
                    this.creditHistory.nflag = res.nflag;
                    this.creditHistory.sdescript = res.sdescript;
                  }
                );
              }

              this.polizaEmitCab.tipoRenovacion = this.template.ins_tipRenovacion ? res.GenericResponse.FREQ_PAGO : '';

              if (this.template.ins_frecPago) {
                this.obtenerFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
              }

              this.polizaEmitCab.frecuenciaPago = this.template.ins_frecPago ? res.GenericResponse.FREQ_PAGO : '';

              this.polizaEmitCab.bsValueIni = !this.template.ins_mapfre ? new Date() : new Date(this.polizaEmitCab.EFECTO_COTIZACION);
              this.polizaEmitCab.bsValueIniMin = new Date(this.polizaEmitCab.EFECTO_COTIZACION);
              this.polizaEmitCab.bsValueIniMin.setDate(this.polizaEmitCab.bsValueIniMin.getDate() - this.dayRetroConfig);
              this.polizaEmitCab.bsValueFin = new Date(res.GenericResponse.EXPIRACION_COTIZACION);

              this.polizaEmitCab.bsValueFinMin = this.polizaEmitCab.bsValueIni;
              this.polizaEmitCab.bsValueFinMax = new Date(this.polizaEmitCab.EXPIRACION_COTIZACION);
              this.polizaEmitCab.bsValueFinMax.setDate(this.polizaEmitCab.bsValueFinMax.getDate() + this.dayConfig);

              this.polizaEmitCab.MINA = res.GenericResponse.MINA == '1' ? true : false;
              this.polizaEmitCab.DELIMITACION = res.GenericResponse.DELIMITACION == '1' ? '* La actividad cuenta con delimitación' : '';
              this.flagBusqueda = true;
              this.polizaEmitCab.prePayment = false;

              this.policyemit.getPolicyEmitComer(this.nrocotizacion)
                .subscribe((res: any) => {
                  this.tableComer = true
                  this.polizaEmitComer = [];
                  if (res.length > 0 && res !== null) {
                    res.forEach(com => {
                      com.COMISION_PENSION_AUT = com.COMISION_PENSION_AUT == '' ? '0' : com.COMISION_PENSION_AUT;
                      com.COMISION_PENSION_PRO = com.COMISION_PENSION_PRO == '' ? '0' : com.COMISION_PENSION_PRO;
                      com.COMISION_PENSION = com.COMISION_PENSION == '' ? '0' : com.COMISION_PENSION;
                      com.COMISION_SALUD = com.COMISION_SALUD == '' ? '0' : com.COMISION_SALUD;
                      com.COMISION_SALUD_AUT = com.COMISION_SALUD_AUT == '' ? '0' : com.COMISION_SALUD_AUT;
                      com.COMISION_SALUD_PRO = com.COMISION_SALUD_PRO == '' ? '0' : com.COMISION_SALUD_PRO;
                    });
                    this.polizaEmitComer = res
                    this.flagBusqueda = true;
                  } else {
                    this.polizaEmitComerDTOPrincipal = {};
                    this.polizaEmitComer = [];
                  }
                })
            } else {
              swal.fire('Información', res.GenericResponse.MENSAJE, 'error')
                .then((value) => {
                  if(this.profileId == 31){
                    this.router.navigate(['/extranet/policy-transactions']);
                  }else{
                  this.router.navigate(['/extranet/request-status']);
                  }
                })
              this.limpiarCampos();
            }

            this.validateDebtResponse = await this.getValidateDebt(this.pensionID.nbranch, this.pensionID.id, this.contractingdata.P_SCLIENT, 1); //AVS - Mejoras SCTR - 1 - Emision 

            if (this.validateDebtResponse.lockMark === 1) { ////AVS - Mejoras SCTR - Validacion de deudas
                let mensajeRes = '';
                mensajeRes = 'El cliente con cotización N° ' + this.nrocotizacion + ', ' + 'cuenta con deuda pendiente y no se podra emitir la poliza'; 
                swal.fire({
                  title: 'Información',
                  text: mensajeRes,
                  icon: 'error',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                })
                  .then((result) => {
                    if (result.value) {
                      this.router.navigate(['/broker/request-status']);
                    }
                  });
            }
            
          } else {
            this.limpiarCampos()
          }

        })
    } else {
      swal.fire('Información', 'Ingresar nro de cotización', 'error');
    }
  }

  limpiarCampos() {
    this.polizaEmitCab = new PolizaEmitCab();
    this.polizaEmitCab.bsValueIni = new Date();
    this.polizaEmitCab.bsValueFin = new Date();
    this.polizaEmitCab.bsValueIniMin = new Date();
    this.polizaEmitCab.bsValueFinMin = new Date();
    this.polizaEmitCab.bsValueFinMax = new Date();
    this.polizaEmitCab.TIPO_DOCUMENTO = '';
    this.polizaEmitCab.tipoRenovacion = '';
    this.polizaEmitCab.ACT_TECNICA = ''
    this.polizaEmitCab.COD_ACT_ECONOMICA = ''
    this.polizaEmitCab.P_SISCLIENT_GBD = '';
    this.polizaEmitCab.COD_TIPO_SEDE = '';
    this.polizaEmitCab.COD_MONEDA = '';
    this.polizaEmitCab.COD_DEPARTAMENTO = ''
    this.polizaEmitCab.COD_PROVINCIA = ''
    this.polizaEmitCab.COD_DISTRITO = ''
    this.polizaEmitCab.frecuenciaPago = '';
    this.polizaEmitComer = []
    this.polizaEmit.facturacionVencido = false
    this.polizaEmit.facturacionAnticipada = false
    this.facVencido = false
    this.facAnticipada = false
  }

  async dataClient() {
    let data: any = {};
    data.P_TipOper = 'CON';
    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    data.P_NIDDOC_TYPE = this.polizaEmitCab.TIPO_DOCUMENTO;
    data.P_SIDDOC = this.polizaEmitCab.NUM_DOCUMENTO.toUpperCase().trim();

    await this.clientInformationService.getCliente360(data).toPromise().then(
      res => {
        this.contractingdata = res.EListClient[0];
      }
    );
  }

  async obtenerTipoRenovacion() {
    let requestTypeRen: any = {}
    requestTypeRen.P_NEPS = this.epsItem.STYPE
    requestTypeRen.P_NPRODUCT = this.codProducto
    requestTypeRen.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']
    await this.policyemit.getTipoRenovacion(requestTypeRen).toPromise().then(
      res => {
        this.tipoRenovacion = res;
      })
  }
  async obtenerFrecuenciaPago(tipoRenovacion: any) {
    await this.policyemit.getFrecuenciaPago(tipoRenovacion).toPromise().then(
      res => {
        if (!this.template.ins_frecPago) {
          this.polizaEmitCab.frecuenciaPago = this.polizaEmitCab.tipoRenovacion;
        }
        this.frecuenciaPago = res;
        // Si solo hay una frecuencia de pago, está se seleccionará automáticamente
        if (this.frecuenciaPago != null && this.frecuenciaPago.length == 1 && !this.template.ins_frecPago) {
          this.polizaEmitCab.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA;
        }

      })
  }

  downloadExcel() {
    const client: string = this.SClient;
    if (client != null && this.nrocotizacion !== undefined && this.nrocotizacion !== 0) {
      const data: any = {};
      data.contratante = this.polizaEmitCab.NOMBRE_RAZON;
      data.ruc = this.polizaEmitCab.NUM_DOCUMENTO;
      data.moneda = this.polizaEmitCab.DES_MONEDA;
      data.cotizacion = this.nrocotizacion;
      data.sclient = client;
      data.operacion = 1;
      data.movimiento = 0;
      data.poliza = 0;

      this.loading = true;
      this.policyemit.downloadExcel(data).toPromise().then(
        res => {
          this.loading = false;
          if (res.indEECC === 0) {
            const nameFile: string = 'Modelo_' + this.nrocotizacion;
            const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
            FileSaver.saveAs(file);
          }
        },
        err => {
          this.loading = false;
        });
    } else {
      swal.fire('Información', 'Debes buscar una cotizacion', 'error');
    }
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

  cambioFecha() {
    this.errorFrecPago = false;
  }

  async validateEmit(flow: any = 'emit') {
    let mensaje = ''
    if (this.cotizacionID == '') {
      this.errorNroCot = true;
      mensaje = 'Debe ingresar una cotización <br />';
    }
    if (this.polizaEmitCab.frecuenciaPago === '') {
      this.errorFrecPago = true;
      mensaje += 'Debe ingresar una frecuencia de pago <br />';
    }
    if (this.polizaEmitCab.tipoRenovacion === '') {
      this.flagTipoR = true;
      mensaje += 'Debe ingresar un tipo de renovación <br />';
    }

    if (flow == 'emit') {
      if (this.excelSubir === undefined) {
        this.errorExcel = true;
        mensaje += 'Debe subir un archivo excel para su validación <br />';
      } else {
        if (this.erroresList.length > 0 || this.processID == '') {
          this.errorExcel = true;
          mensaje += 'No se ha procesado la validación de forma correcta <br />';
        }
      }
    }


    if (this.polizaEmitCab.CORREO == '') {
      this.flagEmail = true;
      mensaje += 'Debes ingresar un correo electrónico <br />';
    } else {
      if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.polizaEmitCab.CORREO) == false) {
        this.flagEmail = true;
        mensaje += 'El correo electrónico es inválido <br />';
      } else {
        this.flagEmail = false;
      }
    }

    return mensaje;
  }

  async generarPoliza(forma: NgForm) {
    this.loading = true;
    let mensaje = '';

    mensaje = await this.validateEmit();

    if (mensaje == '') {
      let ncodeStatus = '0';

      if (this.flagEmailNull == false) {
        ncodeStatus = await this.updateClient();
      }

      if (ncodeStatus == '0') {
        this.flagEmailNull = true;
        this.emitirContrac();
      } else {
        this.loading = false;
        swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
      }

    } else {
      this.loading = false;
      swal.fire('Información', mensaje, 'error');
    }

  }

  async equivalenciaMapfre(codProtecta: any, keyTable: any, keyStore: any, required: any = 1) {
    let response: any = {};
    const data: any = {};
    data.codProtecta = codProtecta;
    data.keyTable = keyTable;
    data.keyStore = keyStore;

    await this.quotationService.getEquivalente(data).toPromise().then(res => {
      response = res;
      if (res.codError === '1' && required === 1) {
        this.mensajeEquivalente = this.mensajeEquivalente + '<br>' + res.mensaje;
      }
    });
    return response.codMapfre;
  }

  async updateClient() {
    let ncode = '0';
    if (this.contractingdata != undefined) {
      if (this.flagEmailNull == false) {
        this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.contractingdata.P_TipOper = 'INS';
        this.contractingdata.P_NCLIENT_SEG = -1;
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
        if (!this.template.ins_mapfre) {
          this.contractingdata.EListAddresClient = null;
          this.contractingdata.EListPhoneClient = null;
          this.contractingdata.EListContactClient = null;
          this.contractingdata.EListCIIUClient = null;
        }

        await this.clientInformationService.getCliente360(this.contractingdata).toPromise().then(
          async res => {
            ncode = res.P_NCODE;
          },
          error => { ncode = '1'; }
        );
      } else {
        ncode = '0';
      }
    } else {
      ncode = '1';
    }

    return ncode;
  }

  async dataEmision(idProcessVisa = 0) {
    this.mensajeEquivalente = '';
    this.savedPolicyList = [];

    if (this.template.ins_mapfre && this.nroMovimientoEPS != null) {
      this.emisionMapfre = {}
      this.emisionMapfre.numCotizacion = this.nroCotizacionEps;
      this.emisionMapfre.nroMovimientoCarga = this.nroMovimientoEPS;
      this.emisionMapfre.cabecera = {};
      this.emisionMapfre.cabecera.keyService = 'emitir';
      this.emisionMapfre.poliza = {};
      this.emisionMapfre.poliza.mcaPolizaMesAdelantado = 'S'; // Facturación adelantada
      this.emisionMapfre.contratante = {};
      this.emisionMapfre.contratante.tipDocum = await this.equivalenciaMapfre(this.contractingdata.P_NIDDOC_TYPE, 'tipDocumento', 'tableKey');
      this.emisionMapfre.contratante.codDocum = this.contractingdata.P_SIDDOC;
      this.emisionMapfre.contratante.mcaFisico = this.contractingdata.P_NPERSON_TYP === '1' ? 'S' : 'N'; // Marca persona natural
      this.emisionMapfre.contratante.Nombre = this.contractingdata.P_NPERSON_TYP === '1' ? this.contractingdata.P_SFIRSTNAME : this.contractingdata.P_SLEGALNAME;
      this.emisionMapfre.contratante.apePaterno = this.contractingdata.P_NPERSON_TYP === '1' ? CommonMethods.validateTextNull(this.contractingdata.P_SLASTNAME) : null;
      this.emisionMapfre.contratante.apeMaterno = this.contractingdata.P_NPERSON_TYP === '1' ? CommonMethods.validateTextNull(this.contractingdata.P_SLASTNAME2) : null;
      this.emisionMapfre.contratante.email = this.polizaEmitCab.CORREO;
      this.emisionMapfre.contratante.tlfNumero = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : '0';
      this.emisionMapfre.contratante.tlfMovil = this.contractingdata.EListPhoneClient.length > 0 ? this.contractingdata.EListPhoneClient[0].P_SPHONE : '0';
      this.emisionMapfre.contratante.tipCargo = this.contractingdata.P_NPERSON_TYP === '2' && this.contractingdata.EListContactClient.length > 0 ? await this.equivalenciaMapfre(this.contractingdata.EListContactClient[0].P_NTIPCONT, 'cargo', 'tableKey') : null; // Persona Juridica;
      this.emisionMapfre.contratante.tipCargo = this.emisionMapfre.contratante.tipCargo === '-1' ? '41' : this.emisionMapfre.contratante.tipCargo; // default en caso no exista
      this.emisionMapfre.contratante.nomContacto = '';
      if (this.contractingdata.P_NPERSON_TYP === '2' && this.contractingdata.EListContactClient.length > 0) {
        this.emisionMapfre.contratante.nomContacto = CommonMethods.validateTextNull(this.contractingdata.EListContactClient[0].P_SNOMBRES) + ' ' +
          CommonMethods.validateTextNull(this.contractingdata.EListContactClient[0].P_SAPEPAT) + ' ' +
          CommonMethods.validateTextNull(this.contractingdata.EListContactClient[0].P_SAPEMAT); // Persona Juridica
      } else {
        this.emisionMapfre.contratante.nomContacto = null;
      }
      this.emisionMapfre.contratante.fecNacimiento = CommonMethods.validateTextNull(this.contractingdata.P_DBIRTHDAT);
      this.emisionMapfre.contratante.mcaSexo = this.contractingdata.P_NPERSON_TYP === '1' ? this.contractingdata.P_SSEXCLIEN === '1' ? '0' : '1' : null;
      this.emisionMapfre.contratante.codProfesion = this.contractingdata.P_NPERSON_TYP === '1' ? await this.equivalenciaMapfre(this.contractingdata.P_NSPECIALITY, 'profesion', 'tableKey') : null;
      this.emisionMapfre.contratante.codProfesion = this.emisionMapfre.contratante.codProfesion === '-1' ? '0' : this.emisionMapfre.contratante.codProfesion;
      // this.emisionMapfre.contratante.tipActEconomica = this.contractingdata.P_NPERSON_TYP == '2' && this.contractingdata.EListCIIUClient.length > 0 ? await this.equivalenciaMapfre(this.contractingdata.EListCIIUClient[0].P_SCIIU, 'actividadEconomica', 'tableKey') : null // Persona juridica
      this.emisionMapfre.contratante.tipActEconomica = this.contractingdata.P_NPERSON_TYP === '2' ? '9999' : null; // Persona juridica
      this.emisionMapfre.contratante.estadoCivil = this.contractingdata.P_NPERSON_TYP === '2' ? null : this.contractingdata.P_NCIVILSTA === '5' ? 'S' : await this.equivalenciaMapfre(this.contractingdata.P_NCIVILSTA, 'estadoCivil', 'tableKey');
      this.emisionMapfre.contratante.nacionalidad = await this.equivalenciaMapfre(this.contractingdata.P_NNATIONALITY, 'nacionalidad', 'tableKey');
      if (this.contractingdata.EListAddresClient.length > 0) {
        this.emisionMapfre.contratante.direccion = [];
        const itemDireccion: any = {};
        itemDireccion.codPais = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NCOUNTRY, 'nacionalidad', 'tableKey');
        itemDireccion.codDepartamento = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NPROVINCE, 'departamento', 'ubigeoKey');
        itemDireccion.codProvincia = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NLOCAL, 'provincia', 'ubigeoKey');
        itemDireccion.codDistrito = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NMUNICIPALITY, 'distrito', 'ubigeoKey');
        itemDireccion.tipDomicilio = this.contractingdata.EListAddresClient[0].P_STI_DIRE != null ? await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_DIRE, 'tipDomicilio', 'tableKey') : '25';
        itemDireccion.nomDomicilio = this.contractingdata.EListAddresClient[0].P_SNOM_DIRECCION != null ? this.contractingdata.EListAddresClient[0].P_SNOM_DIRECCION.substr(0, 39) : this.contractingdata.EListAddresClient[0].P_SDESDIREBUSQ.substr(0, 39);
        itemDireccion.tipNumero = this.contractingdata.EListAddresClient[0].P_STI_BLOCKCHALET != null ? await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_BLOCKCHALET, 'tipNumero', 'tableKey') : '1';
        itemDireccion.descNumero = this.contractingdata.EListAddresClient[0].P_SNUM_DIRECCION != null || this.contractingdata.EListAddresClient[0].P_SNUM_DIRECCION !== '' ? this.contractingdata.EListAddresClient[0].P_SNUM_DIRECCION : '0';
        itemDireccion.tipInterior = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_INTERIOR, 'tipInterior', 'tableKey');
        itemDireccion.nroInterior = this.contractingdata.EListAddresClient[0].P_SNUM_INTERIOR;
        itemDireccion.tipZona = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_STI_CJHT, 'tipZona', 'tableKey');
        itemDireccion.nomZona = this.contractingdata.EListAddresClient[0].P_SNOM_CJHT == null ? '' : this.contractingdata.EListAddresClient[0].P_SNOM_CJHT.substr(0, 29);
        itemDireccion.refDireccion = this.contractingdata.EListAddresClient[0].P_SREFERENCE == null ? '' : this.contractingdata.EListAddresClient[0].P_SREFERENCE.substr(0, 39);
        itemDireccion.codigoPostal = await this.equivalenciaMapfre(this.contractingdata.EListAddresClient[0].P_NMUNICIPALITY, 'codPostal', 'ubigeoKey', 0);
        itemDireccion.codigoPostal = itemDireccion.codigoPostal === '-1' ? '' : itemDireccion.codigoPostal;
        this.emisionMapfre.contratante.direccion.push(itemDireccion);
      }
      this.emisionMapfre.constancia = {};
      this.emisionMapfre.constancia.ubicacionObraSalud = this.polizaEmitCab.DES_TIPO_SEDE;

    }

    if (this.mensajeEquivalente !== '') {
      this.prePayment = false;
      this.loading = false;
      swal.fire('Información', this.mensajeEquivalente, 'error');
      return;
    }

    if (this.saludList.length > 0) {
      this.savedPolicyEmit = {};
      this.savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; // Cotizacion
      this.savedPolicyEmit.P_NID_PROC = this.processID; // Proceso
      this.savedPolicyEmit.P_NBRANCH = this.saludID.nbranch; // Producto
      this.savedPolicyEmit.P_NPRODUCT = this.saludID.id; // Producto
      this.savedPolicyEmit.P_SCOLTIMRE = this.polizaEmitCab.tipoRenovacion; // Tipo Renovacion
      this.savedPolicyEmit.P_DSTARTDATE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
      this.savedPolicyEmit.P_DEXPIRDAT = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
      this.savedPolicyEmit.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago // Frecuencia Pago
      this.savedPolicyEmit.P_SFLAG_FAC_ANT = this.polizaEmit.facturacionAnticipada == true ? 1 : 0; // Facturacion Anticipada
      this.savedPolicyEmit.P_FACT_MES_VENCIDO = this.polizaEmit.facturacionVencido == true ? 1 : 0; // Facturacion Vencida
      this.savedPolicyEmit.P_NPREM_NETA = this.totalNetoSaludSave; // Prima Mensual
      this.savedPolicyEmit.P_IGV = this.igvSaludSave; // IGV
      this.savedPolicyEmit.P_NPREM_BRU = this.brutaTotalSaludSave; // Total bruta
      this.savedPolicyEmit.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''); // Comentario
      this.savedPolicyEmit.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario
      this.savedPolicyEmit.P_NIDPAYMENT = idProcessVisa; // id proceso visa
      //Ini - RI
      this.savedPolicyEmit.P_NAMO_AFEC = this.totalNetoSaludSave;
      this.savedPolicyEmit.P_NIVA = this.igvSaludSave;
      this.savedPolicyEmit.P_NAMOUNT = this.brutaTotalSaludSave;
      this.savedPolicyEmit.P_NDE = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComSalud) - Number(this.totalNetoSaludSave), 2);
      this.savedPolicyEmit.P_DSTARTDATE_ASE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
      this.savedPolicyEmit.P_DEXPIRDAT_ASE = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
      //Fin - RI
      this.savedPolicyList.push(this.savedPolicyEmit);
    }

    if (this.pensionList.length > 0) {
      this.savedPolicyEmit = {};
      this.savedPolicyEmit.P_NID_COTIZACION = this.cotizacionID; //Cotizacion
      this.savedPolicyEmit.P_NID_PROC = this.processID; // Proceso
      this.savedPolicyEmit.P_NBRANCH = this.pensionID.nbranch; // Producto
      this.savedPolicyEmit.P_NPRODUCT = this.pensionID.id; // Producto
      this.savedPolicyEmit.P_SCOLTIMRE = this.polizaEmitCab.tipoRenovacion; //Tipo Renovacion
      this.savedPolicyEmit.P_DSTARTDATE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
      this.savedPolicyEmit.P_DEXPIRDAT = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
      this.savedPolicyEmit.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago // Frecuencia Pago
      this.savedPolicyEmit.P_SFLAG_FAC_ANT = this.polizaEmit.facturacionAnticipada == true ? 1 : 0; // Facturacion Anticipada
      this.savedPolicyEmit.P_FACT_MES_VENCIDO = this.polizaEmit.facturacionVencido == true ? 1 : 0; // Facturacion Vencida
      this.savedPolicyEmit.P_NPREM_NETA = this.totalNetoPensionSave; // Prima Mensual
      this.savedPolicyEmit.P_IGV = this.igvPensionSave; // IGV
      this.savedPolicyEmit.P_NPREM_BRU = this.brutaTotalPensionSave; // Total bruta
      this.savedPolicyEmit.P_SCOMMENT = this.polizaEmit.comentario.toUpperCase().replace(/[<>%]/g, ''); //Comentario
      this.savedPolicyEmit.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario
      this.savedPolicyEmit.P_NIDPAYMENT = idProcessVisa; // id proceso visa
      //Ini - RI

      if(this.codProducto = 2){//AVS Nueva Estimación De Cálculo 23/11/2022
        this.savedPolicyEmit.P_NAMO_AFEC = this.pensionList.length > 0 ? Number(this.DataSCTRPENSION.P_NAMO_AFEC) : this.saludList.length > 0 ? Number(this.DataSCTRSALUD.P_NAMO_AFEC) : 0.0;
        this.savedPolicyEmit.P_NIVA = this.pensionList.length > 0 ? Number(this.DataSCTRPENSION.P_NIVA) : this.saludList.length > 0 ? Number(this.DataSCTRSALUD.P_NIVA) : 0.0;
        this.savedPolicyEmit.P_NAMOUNT = this.pensionList.length > 0 ? Number(this.DataSCTRPENSION.P_NAMOUNT) : this.saludList.length > 0 ? Number(this.DataSCTRSALUD.P_NAMOUNT) : 0.0;
      }else{
      this.savedPolicyEmit.P_NAMO_AFEC = this.totalNetoPensionSave;
      this.savedPolicyEmit.P_NIVA = this.igvPensionSave;
      this.savedPolicyEmit.P_NAMOUNT = this.brutaTotalPensionSave;
      }
      this.savedPolicyEmit.P_NDE = CommonMethods.formatValor(Number(this.polizaEmitCab.primaComPension) - Number(this.totalNetoPensionSave), 2);
      this.savedPolicyEmit.P_DSTARTDATE_ASE = this.polizaEmitCab.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueIni.getFullYear(); //Fecha Inicio
      this.savedPolicyEmit.P_DEXPIRDAT_ASE = this.polizaEmitCab.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.polizaEmitCab.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.polizaEmitCab.bsValueFin.getFullYear(); // Fecha Fin
      //Fin - RI
      this.savedPolicyList.push(this.savedPolicyEmit);

    }
  }


  async emitirContrac() {
    let myFormData: FormData = new FormData()
    this.savedPolicyList = [];
    this.ListainsertEmit = [];
    await this.dataEmision();
    await this.insertEmitDet();

    if (this.files.length > 0) {
      this.files.forEach(file => {
        myFormData.append('adjuntos', file, file.name);
      });
    }

    myFormData.append('objeto', JSON.stringify(this.savedPolicyList));
    myFormData.append('emisionMapfre', JSON.stringify(this.emisionMapfre));
    myFormData.append('objetoDet', JSON.stringify(this.ListainsertEmit));

    this.loading = false;

    //Customer customer = list.FirstOrDefault(cus => cus.FirstName == "John");
    //if (customer != null)
    //{
        // Use customer
    //}


    if(this.profileEsp.some(ProfileEsp => ProfileEsp.Profile.toString() == this.perfilActual))
    {
      const response: any = await this.ValidateRetroactivity();
        if (response.P_NCODE == 4) {
        await swal.fire('Información', response.P_SMESSAGE, 'error');
        return;
      }
    }

    swal.fire({
      title: 'Información',
      text: '¿Desea realizar la emisión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    })
      .then((result) => {
        if (result.value) {
          this.loading = true;
          this.policyemit.savePolicyEmit(myFormData)
            
            .subscribe((res: any) => {
              this.loading = false;
              if (res.P_COD_ERR == 0) {
                this.flagEmailNull = true;
                let policyPension = 0;
                let policySalud = 0;
                let constancia = 0

                policyPension = Number(res.P_POL_PENSION);
                policySalud = Number(res.P_POL_SALUD);
                constancia = Number(res.P_NCONSTANCIA);

                this.NroPension = policyPension;
                this.NroSalud = policySalud;

                if (policyPension > 0 && policySalud > 0) {

                  swal.fire({
                    title: 'Información',
                    text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' y la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                  })
                    .then(async (result) => {
                      if (result.value) {
                        this.router.navigate(['/extranet/policy-transactions']);
                      }
                    });
                }
                else {
                  if (policyPension > 0) {
                    swal.fire({
                      title: 'Información',
                      text: 'Se ha generado correctamente la póliza de Pensión N° ' + policyPension + ' con Constancia N° ' + constancia,
                      icon: 'success',
                      confirmButtonText: 'OK',
                      allowOutsideClick: false,
                    })
                      .then(async (result) => {
                        if (result.value) {
                          this.router.navigate(['/extranet/policy-transactions']);
                        }
                      });
                  }
                  if (policySalud > 0) {
                    let mensaje = ''
                    if (this.epsItem.NCODE == 1) {
                      mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud + ' con Constancia N° ' + constancia;
                    }
                    if (this.epsItem.NCODE == 2) {
                      mensaje = 'Se ha generado correctamente la póliza de Salud N° ' + policySalud;
                    }
                    swal.fire({
                      title: 'Información',
                      text: mensaje,
                      icon: 'success',
                      confirmButtonText: 'OK',
                      allowOutsideClick: false,
                    })
                      .then(async (result) => {
                        if (result.value) {
                          this.router.navigate(['/extranet/policy-transactions']);
                        }
                      });
                  }
                }
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
      });

  }

  // async registerPayment(policyPension, policySalud) {

  //   var totalPolicy = await this.totalPerPolicy();
  //   let modalRef = this.modalService.open(MethodsPaymentComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
  //   modalRef.componentInstance.formModalReference = modalRef;
  //   modalRef.componentInstance.correoContracting = this.polizaEmitCab.CORREO;
  //   modalRef.componentInstance.dataClient = this.contractingdata;
  //   modalRef.componentInstance.typePayment = '2';
  //   modalRef.componentInstance.typeMovement = '1';
  //   modalRef.componentInstance.product = this.pensionList.length > 0 ? this.pensionID : this.saludID;
  //   modalRef.componentInstance.policy = policyPension != 0 ? policyPension : policySalud;
  //   modalRef.componentInstance.channel = JSON.parse(localStorage.getItem('currentUser'))['canal'];
  //   modalRef.componentInstance.salepoint = JSON.parse(localStorage.getItem('currentUser'))['indpuntoVenta'];
  //   modalRef.componentInstance.idUser = JSON.parse(localStorage.getItem('currentUser'))['id'];
  //   modalRef.componentInstance.totalPolicy = totalPolicy;
  //   return;
  // }

  // async totalPerPolicy() {
  //   let totalPolicy = 0
  //   if (this.monthPerPay == 0) {
  //     let dayIni = this.polizaEmitCab.bsValueIni.getDate() < 10 ? '0' + this.polizaEmitCab.bsValueIni.getDate() : this.polizaEmitCab.bsValueIni.getDate();
  //     let monthPreviewIni = this.polizaEmitCab.bsValueIni.getMonth() + 1;
  //     let monthIni = monthPreviewIni < 10 ? '0' + monthPreviewIni : monthPreviewIni;
  //     let yearIni = this.polizaEmitCab.bsValueIni.getFullYear();
  //     let dayFin = this.polizaEmitCab.bsValueFin.getDate() < 10 ? '0' + this.polizaEmitCab.bsValueFin.getDate() : this.polizaEmitCab.bsValueFin.getDate();
  //     let monthPreviewFin = this.polizaEmitCab.bsValueFin.getMonth() + 1;
  //     let monthFin = monthPreviewFin < 10 ? '0' + monthPreviewFin : monthPreviewFin;
  //     let yearFin = this.polizaEmitCab.bsValueFin.getFullYear();

  //     let fechaInicio = new Date(yearIni + '-' + monthIni + '-' + dayIni).getTime();
  //     let fechaFin = new Date(yearFin + '-' + monthFin + '-' + dayFin).getTime();

  //     let diffDay = (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)
  //     let perDaySal = Number(this.totalNetoSaludSave) / 30
  //     let perDayPen = Number(this.totalNetoPensionSave) / 30

  //     let primPerPen = Number((Number(perDayPen) * diffDay)) * Number(this.igvPensionWS)

  //     let primPerSal = Number((Number(perDaySal) * diffDay)) * Number(this.igvSaludWS)

  //     totalPolicy = Number(CommonMethods.formatValor(primPerPen, 2)) + Number(CommonMethods.formatValor(primPerSal, 2));

  //   } else {
  //     totalPolicy = (Number(this.brutaTotalPensionSave) + Number(this.brutaTotalSaludSave)) * this.monthPerPay
  //   }

  //   return totalPolicy;
  // }

  validarArchivos() {
    this.clickValidarArchivos = false;
    this.archivosJson = [];
    this.tamañoArchivo = 0;
    this.flagExtension = false;
    for (let i = 0; i < this.files.length; i++) {
      let size = (this.files[i].size / 1024 / 1024).toFixed(3);
      let sizeNumber = Number(size);
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

  async validarTipoRenovacion(event: any) {
    if (this.template.ins_mapfre) {
      this.pensionList = []
      this.saludList = []
      this.tasasList = []
      this.primaTotalPension = 0;
      this.primatotalSalud = 0;
    }

    await this.configFechas()
  }

  async habilitarFechas() {
    this.flagTipoR = false;
    this.activacion = false;
    this.disabledFecha = true;
    this.errorFrecPago = false;

    await this.obtenerFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
    await this.configFechas()
  }

  async configFechas() {
    var fechadesde = this.desde.nativeElement.value.split('/');
    var fechahasta = this.hasta.nativeElement.value.split('/');
    var fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
    var fechaHas = (fechahasta[1]) + '/' + fechahasta[0] + '/' + fechahasta[2];
    let fechad = new Date(fechaDes);
    let fechah = new Date(fechaHas);

    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionEspecial) { //Especial
      this.monthPerPay = 0
      fechad.setDate(fechad.getDate() + 1);
      this.polizaEmitCab.bsValueFinMin = new Date(fechad);
      if (fechad.getTime() > fechah.getTime()) {
        this.polizaEmitCab.bsValueFin = new Date(fechad);
      }
      this.disabledFecha = false;
    }
    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionEspecialEstado) { //Especial Estado
      this.monthPerPay = 0
      fechad.setDate(fechad.getDate() + 1);
      this.polizaEmitCab.bsValueFinMin = new Date(fechad);
      if (fechad.getTime() > fechah.getTime()) {
        this.polizaEmitCab.bsValueFin = new Date(fechad);
      }
      this.disabledFecha = false;
    }
    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionMensual) { //Mensual
      this.monthPerPay = 1
      fechad.setMonth(fechad.getMonth() + 1);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.polizaEmitCab.bsValueFin = new Date(fechad);
      this.flagFechaMenorMayorFin = true;
    }
    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionBiMensual) { //Bimestral
      this.monthPerPay = 2
      fechad.setMonth(fechad.getMonth() + 2);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.polizaEmitCab.bsValueFin = new Date(fechad);
      this.flagFechaMenorMayorFin = true;
    }
    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionTriMensual) { //Trimestral
      this.monthPerPay = 3
      fechad.setMonth(fechad.getMonth() + 3);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.polizaEmitCab.bsValueFin = new Date(fechad);
      this.flagFechaMenorMayorFin = true;
    }
    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionSemestral) { //Semestral
      this.monthPerPay = 6
      fechad.setMonth(fechad.getMonth() + 6);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.polizaEmitCab.bsValueFin = new Date(fechad);
      this.flagFechaMenorMayorFin = true;
    }

    if (this.polizaEmitCab.tipoRenovacion == this.variable.var_renovacionAnual) { //Anual
      this.monthPerPay = 12
      fechad.setFullYear(fechad.getFullYear() + 1)
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.polizaEmitCab.bsValueFin = new Date(fechad);
      this.flagFechaMenorMayorFin = true;
    }

    if (this.nrocotizacion != null && this.nrocotizacion !== undefined && this.nrocotizacion.toString().trim() != '') {
      if (this.template.ins_alertaGrati) {
        if (this.polizaEmitCab.bsValueIni !== undefined && this.polizaEmitCab.bsValueFin !== undefined) {
          const meses = await this.getMesesGrati();
          this.alertGrati = await CommonMethods.alertaGratificacion(this.polizaEmitCab.bsValueIni, this.polizaEmitCab.bsValueFin, meses, this.variable.var_alertGratificacion)
          if (this.alertGrati !== '') {
            this.toastr.warning(this.variable.var_alertToastGratificacion, 'Importante!', { timeOut: 20000, toastClass: 'rmaClass ngx-toastr' });
          } else {
            this.toastr.clear();
          }
        }
      }
    }

    if (this.polizaEmitCab.CORREO != '' && this.cotizacionID != '' && this.excelSubir != undefined) {
      this.validarExcel()
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

  textValidate(event: any, typeText) {
    CommonMethods.textValidate(event, typeText)
  }

  downloadFile(filePath: string) {  //Descargar archivos de cotización
    this.othersService.downloadFile(filePath).subscribe(
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

  listToString(list: String[]): string {
    let output = '';
    if (list != null) {
      list.forEach(function (item) {
        output = output + item + ' <br>'
      });
    }
    return output;
  }

  async CalculateAjustedAmounts(){
    let totalPolicyAmount = 0.0;
    let totalPolicyPension = 0.0;
    let totalPolicySalud = 0.0;
    await this.getMonthsSCTR(); //AVS Nueva Estimación De Cálculo 23/12/2022

    totalPolicyPension = await this.getAjustedAmounts(this.pensionID.nbranch, this.pensionID.id, this.totalNetoPensionSave);
    totalPolicySalud = await this.getAjustedAmounts(this.saludID.nbranch, this.saludID.id, this.totalNetoSaludSave);
    
    totalPolicyAmount = CommonMethods.formatValor((Number(totalPolicyPension) + Number(totalPolicySalud)) , 2)
    
    return totalPolicyAmount;
  }

  async getAjustedAmounts(nBranch :Number, nProduct :Number,namo_afec :Number) {

    if(this.codProducto = 2){ //AVS Nueva Estimación De Cálculo 23/12/2022
      let totalPolicy = 0.0;
      this.monthsSCTR = this.montos_sctr.P_RESULT;
      const data: any = {};
      data.P_NBRANCH = nBranch;
      data.P_NPRODUCT = nProduct;
      data.P_NAMO_AFEC_INI = CommonMethods.formatValor(Number(namo_afec) * this.monthsSCTR, 2);

      await this.policyemit.AjustedAmounts(data).toPromise().then(
          res => {
              console.log(res);
              totalPolicy = res.P_NAMOUNT;
              if(res.P_NAMOUNT !=0){
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
  }else{
    let totalPolicy = 0.0
    let data: any = {};
    data.P_NBRANCH = nBranch;
    data.P_NPRODUCT = nProduct;
    data.P_NAMO_AFEC_INI = CommonMethods.formatValor(Number(namo_afec) * this.monthPerPay, 2);
    await this.policyemit.AjustedAmounts(data).toPromise().then(
      res => {
        console.log(res);
        totalPolicy = res.P_NAMOUNT
      },
      err => {
        console.log(err);
      }
    );
    return totalPolicy;
    }
  }

  //AVS - PRY INTERCONEXION SABSA 17/07/2023
  async insertEmitDet() {
    this.ListainsertEmit = [];
    if (this.pensionList.length > 0 && this.saludList.length == 0) {
    for (let i = 0; i < this.pensionList.length; i++) {
        this.dataQuotation = {};
        this.dataQuotation.NID_COTIZACION = this.nrocotizacion;
        this.dataQuotation.NPRODUCT = this.pensionID.id;
        this.dataQuotation.NMODULEC = this.pensionList[i].TIP_RIESGO;
        this.dataQuotation.NNUM_TRABAJADORES = this.pensionList[i].NUM_TRABAJADORES;
        this.dataQuotation.NMONTO_PLANILLA = Number(this.pensionList[i].MONTO_PLANILLA);
        this.dataQuotation.NTASA_CALCULADA = Number(this.pensionList[i].TASA_CALC);
        this.dataQuotation.NTASA_PROP = this.pensionList[i].TASA_PRO == '' ? 0 : this.pensionList[i].TASA_PRO || this.pensionList[i].TASA_PRO !== '' ? Number(this.pensionList[i].TASA_PRO) : Number(this.pensionList[i].TASA_PRO);
        this.dataQuotation.NTASA_AUTOR = this.pensionList[i].TASA;
        this.dataQuotation.NPREMIUM_MIN = this.pensionList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_MIN_PR = this.pensionList[i].PRIMA_MIN_PRO;
        this.dataQuotation.NPREMIUM_MIN_AU = this.pensionList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_END = this.pensionList[i].PRIMA_END;
        this.dataQuotation.NSUM_PREMIUMN = this.pensionList[i].NSUM_PREMIUMN;
        this.dataQuotation.NSUM_IGV = this.pensionList[i].NSUM_IGV;
        this.dataQuotation.NSUM_PREMIUM = this.pensionList[i].NSUM_PREMIUM;
        this.dataQuotation.NUSERCODE = this.usercode;
        this.dataQuotation.NRATE = this.pensionList[i].rateDet;
        this.dataQuotation.NDISCOUNT = this.pensionList[i].DESCUENTO;
        this.dataQuotation.NACTIVITYVARIATION = this.pensionList[i].VARIACION_TASA;
        this.dataQuotation.SSTATREGT = 1;
        this.dataQuotation.NMODULEC_FINAL = this.pensionList[i].TIP_RIESGO;
        this.dataQuotation.NAMO_AFEC = this.pensionList[i].PRIMA_END;
        this.dataQuotation.NIVA = this.pensionList[i].NSUM_IGV;
        this.dataQuotation.NAMOUNT = this.pensionList[i].NSUM_PREMIUM;
        this.dataQuotation.NDE = 0;
        this.dataQuotation.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
        this.ListainsertEmit.push(this.dataQuotation);
    }
    }

    if (this.saludList.length > 0 && this.pensionList.length == 0) {
      for (let i = 0; i < this.saludList.length; i++) {
        this.dataQuotation = {};
        this.dataQuotation.NID_COTIZACION = this.nrocotizacion;
        this.dataQuotation.NPRODUCT = this.saludID.id;
        this.dataQuotation.NMODULEC = this.saludList[i].TIP_RIESGO;
        this.dataQuotation.NNUM_TRABAJADORES = this.saludList[i].NUM_TRABAJADORES;
        this.dataQuotation.NMONTO_PLANILLA = Number(this.saludList[i].MONTO_PLANILLA);
        this.dataQuotation.NTASA_CALCULADA = Number(this.saludList[i].TASA_CALC);
        this.dataQuotation.NTASA_PROP = this.saludList[i].TASA_PRO == '' ? 0 : this.saludList[i].TASA_PRO || this.saludList[i].TASA_PRO !== '' ? Number(this.saludList[i].TASA_PRO) : Number(this.saludList[i].TASA_PRO);
        this.dataQuotation.NTASA_AUTOR = this.saludList[i].TASA;
        this.dataQuotation.NPREMIUM_MIN = this.saludList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_MIN_PR = this.saludList[i].PRIMA_MIN_PRO;
        this.dataQuotation.NPREMIUM_MIN_AU = this.saludList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_END = this.saludList[i].PRIMA_END;
        this.dataQuotation.NSUM_PREMIUMN = this.saludList[i].NSUM_PREMIUMN;
        this.dataQuotation.NSUM_IGV = this.saludList[i].NSUM_IGV;
        this.dataQuotation.NSUM_PREMIUM = this.saludList[i].NSUM_PREMIUM;
        this.dataQuotation.NUSERCODE = this.usercode;
        this.dataQuotation.NRATE = this.saludList[i].rateDet;
        this.dataQuotation.NDISCOUNT = this.saludList[i].DESCUENTO;
        this.dataQuotation.NACTIVITYVARIATION = this.saludList[i].VARIACION_TASA;
        this.dataQuotation.SSTATREGT = 1;
        this.dataQuotation.NMODULEC_FINAL = this.saludList[i].TIP_RIESGO;
        this.dataQuotation.NAMO_AFEC = this.saludList[i].PRIMA_END;
        this.dataQuotation.NIVA = this.saludList[i].NSUM_IGV;
        this.dataQuotation.NAMOUNT = this.saludList[i].NSUM_PREMIUM;
        this.dataQuotation.NDE = 0;
        this.dataQuotation.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
        this.ListainsertEmit.push(this.dataQuotation);
      }
    }

    if (this.saludList.length > 0 && this.pensionList.length > 0) {
      for (let i = 0; i < this.pensionList.length; i++) {
        this.dataQuotation = {};
        this.dataQuotation.NID_COTIZACION = this.nrocotizacion;
        this.dataQuotation.NPRODUCT = this.pensionID.id;
        this.dataQuotation.NMODULEC = this.pensionList[i].TIP_RIESGO;
        this.dataQuotation.NNUM_TRABAJADORES = this.pensionList[i].NUM_TRABAJADORES;
        this.dataQuotation.NMONTO_PLANILLA = Number(this.pensionList[i].MONTO_PLANILLA);
        this.dataQuotation.NTASA_CALCULADA = Number(this.pensionList[i].TASA_CALC);
        this.dataQuotation.NTASA_PROP = this.pensionList[i].TASA_PRO == '' ? 0 : this.pensionList[i].TASA_PRO || this.pensionList[i].TASA_PRO !== '' ? Number(this.pensionList[i].TASA_PRO) : Number(this.pensionList[i].TASA_PRO);
        this.dataQuotation.NTASA_AUTOR = this.pensionList[i].TASA;
        this.dataQuotation.NPREMIUM_MIN = this.pensionList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_MIN_PR = this.pensionList[i].PRIMA_MIN_PRO;
        this.dataQuotation.NPREMIUM_MIN_AU = this.pensionList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_END = this.pensionList[i].PRIMA_END;
        this.dataQuotation.NSUM_PREMIUMN = this.pensionList[i].NSUM_PREMIUMN;
        this.dataQuotation.NSUM_IGV = this.pensionList[i].NSUM_IGV;
        this.dataQuotation.NSUM_PREMIUM = this.pensionList[i].NSUM_PREMIUM;
        this.dataQuotation.NUSERCODE = this.usercode;
        this.dataQuotation.NRATE = this.pensionList[i].rateDet;
        this.dataQuotation.NDISCOUNT = this.pensionList[i].DESCUENTO;
        this.dataQuotation.NACTIVITYVARIATION = this.pensionList[i].VARIACION_TASA;
        this.dataQuotation.SSTATREGT = 1;
        this.dataQuotation.NMODULEC_FINAL = this.pensionList[i].TIP_RIESGO;
        this.dataQuotation.NAMO_AFEC = this.pensionList[i].PRIMA_END;
        this.dataQuotation.NIVA = this.pensionList[i].NSUM_IGV;
        this.dataQuotation.NAMOUNT = this.pensionList[i].NSUM_PREMIUM;
        this.dataQuotation.NDE = 0;
        this.dataQuotation.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
        this.ListainsertEmit.push(this.dataQuotation);
      }

      for (let i = 0; i < this.saludList.length; i++) {
        this.dataQuotation = {};
        this.dataQuotation.NID_COTIZACION = this.nrocotizacion;
        this.dataQuotation.NPRODUCT = this.saludID.id;
        this.dataQuotation.NMODULEC = this.saludList[i].TIP_RIESGO;
        this.dataQuotation.NNUM_TRABAJADORES = this.saludList[i].NUM_TRABAJADORES;
        this.dataQuotation.NMONTO_PLANILLA = Number(this.saludList[i].MONTO_PLANILLA);
        this.dataQuotation.NTASA_CALCULADA = Number(this.saludList[i].TASA_CALC);
        this.dataQuotation.NTASA_PROP = this.saludList[i].TASA_PRO == '' ? 0 : this.saludList[i].TASA_PRO || this.saludList[i].TASA_PRO !== '' ? Number(this.saludList[i].TASA_PRO) : Number(this.saludList[i].TASA_PRO);
        this.dataQuotation.NTASA_AUTOR = this.saludList[i].TASA;
        this.dataQuotation.NPREMIUM_MIN = this.saludList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_MIN_PR = this.saludList[i].PRIMA_MIN_PRO;
        this.dataQuotation.NPREMIUM_MIN_AU = this.saludList[i].PRIMA_MIN;
        this.dataQuotation.NPREMIUM_END = this.saludList[i].PRIMA_END;
        this.dataQuotation.NSUM_PREMIUMN = this.saludList[i].NSUM_PREMIUMN;
        this.dataQuotation.NSUM_IGV = this.saludList[i].NSUM_IGV;
        this.dataQuotation.NSUM_PREMIUM = this.saludList[i].NSUM_PREMIUM;
        this.dataQuotation.NUSERCODE = this.usercode;
        this.dataQuotation.NRATE = this.saludList[i].rateDet;
        this.dataQuotation.NDISCOUNT = this.saludList[i].DESCUENTO;
        this.dataQuotation.NACTIVITYVARIATION = this.saludList[i].VARIACION_TASA;
        this.dataQuotation.SSTATREGT = 1;
        this.dataQuotation.NMODULEC_FINAL = this.saludList[i].TIP_RIESGO;
        this.dataQuotation.NAMO_AFEC = this.saludList[i].PRIMA_END;
        this.dataQuotation.NIVA = this.saludList[i].NSUM_IGV;
        this.dataQuotation.NAMOUNT = this.saludList[i].NSUM_PREMIUM;
        this.dataQuotation.NDE = 0;
        this.dataQuotation.FRECUENCIA_PAGO = Number(this.polizaEmitCab.frecuenciaPago);
        this.ListainsertEmit.push(this.dataQuotation);
      }
    }
  }

  async ValidateRetroactivity(operacion: number = 1) {
    const response: any = {};
    let trx = '';
    const dataQuotation: any = {};
    dataQuotation.P_NBRANCH = JSON.parse(localStorage.getItem('pensionID'))['nbranch'];
    dataQuotation.P_NPRODUCT = JSON.parse(localStorage.getItem('codProducto'))['productId'];       
    dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    dataQuotation.NumeroCotizacion = this.nrocotizacion;
    dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);        
    dataQuotation.P_DSTARTDATE_ASE = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni); 
    dataQuotation.TrxCode = "EM";
    dataQuotation.RetOP = operacion;
    dataQuotation.FlagCambioFecha = 1;
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

  async getMonthsSCTR(){ //AVS Nueva Estimación De Cálculo 23/12/2022

    let totalMonths = 0;
    let monthsSCTR: any = {};
    monthsSCTR.date = CommonMethods.formatDate(this.polizaEmitCab.bsValueIni);
    monthsSCTR.dateFn = CommonMethods.formatDate(this.polizaEmitCab.bsValueFin);
    monthsSCTR.npayfreq = Number(this.polizaEmitCab.tipoRenovacion);

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

}