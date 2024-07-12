import { Component, OnInit, ɵConsole } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { DatePipe } from '@angular/common';
import { isNumeric } from 'rxjs/internal-compatibility';
import Swal from 'sweetalert2';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//SERVICES
import { AgencyService } from '../../../services/maintenance/agency/agency.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { OthersService } from '../../../services/shared/others.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
//MODELOS
import { QuotationSearch } from '../../../models/quotation/request/quotation-search';
import { QuotationTracking } from '../../../models/quotation/response/quotation-tracking';
//Configuración
import { GlobalValidators } from './../../global-validators';
import { ModuleConfig } from './../../module.config';
import { AccessFilter } from './../../access-filter'
import { FilePickerComponent } from '../../../modal/file-picker/file-picker.component';
import { CommonMethods } from '../../common-methods';
import { TransactService } from '../../../services/transact/transact.service';
import { ReassingTransactComponent } from '../reassing-transact/reassing-transact.component';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';

@Component({
  selector: 'app-tray-transact',
  templateUrl: './tray-transact.component.html',
  styleUrls: ['./tray-transact.component.css']
})
export class TrayTransactComponent implements OnInit {
  isLoading: boolean = false;  //True para mostrar pantalla de carga, false para ocultarla
  // datepicker
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = ModuleConfig.StartDate;  //Fecha inicial del componente
  bsValueFin: Date = ModuleConfig.EndDate;  //Fecha final del componente
  /**
   * Variables de paginación
   */
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

  brokerDocumentMaxLength = 0;  //Cantidad de caracteres que se puede insertar en el campo Nro de documento de Broker
  contractorDocumentMaxLength = 0;  //Cantidad de caracteres que se puede insertar en el campo Nro de documento de Contratante
  isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.
  mainFormGroup: FormGroup;

  statusList: any[] = []; //Lista de estados de cotización
  productTypeList: any[] = [];  //Lista de tipos de producto
  branchList: any[] = [];  //Lista de tipos de producto
  documentTypeList: any[];  //Lista de tipos de documento
  searchModeList: any[] = [{ 'Id': '1', 'Name': 'Nro. de Documento' }, { 'Id': '2', 'Name': 'Nombres' }];
  personTypeList: any[] = [{ 'Id': '1', 'Name': 'Persona Natural' }, { 'Id': '2', 'Name': 'Persona Jurídica' }];
  amountDetailTotalList: any = [];

  savedPolicyEmit: any = {};
  notfoundMessage = ModuleConfig.NotFoundMessage;
  genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico
  redirectionMessage = ModuleConfig.RedirectionMessage;
  invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
  invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
  invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
  invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;

  /**Es un usuario externo? */
  isExternalUser: boolean = false;
  /**Nombre de broker (Si es usuario externo) */
  brokerName: string;
  /**Puede aprobar cotizaciones? */
  canApproveQuotation: boolean = true;
  /**Puede recotizar? */
  canModifyQuotation: boolean = true;
  listToShow: any;
  perfil: any;
  branch: any;
  //epsItem = JSON.parse(sessionStorage.getItem('eps'))
  epsItem = JSON.parse(localStorage.getItem('eps'))
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'))['id'];
  discountPension = '';
  activityVariationPension = '';
  nidProc = '';
  template: any = {}
  variable: any = {}
  lblProducto: string = '';
  lblFecha: string = '';

  typeSearch = 0;
  title = '';
  resProfileOpe: any = [];
  isProfileOpe = 0;

  constructor(
    private mainFormBuilder: FormBuilder,
    private policyService: PolicyemitService,
    public utilityService: UtilityService,
    private clientInformationService: ClientInformationService,
    private quotationService: QuotationService,
    private modalService: NgbModal,
    private router: Router,
    private transactService: TransactService,
    private route: ActivatedRoute,
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
    // Configuracion del Template
    this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

    // Configuracion del Variable
    this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
    this.lblFecha = CommonMethods.tituloPantalla()

    if (this.template.ins_validaPermisos) {
      if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['quotation_request']) == false) this.router.navigate(['/extranet/home']);
      this.isExternalUser = !AccessFilter.hasPermission('11');
      this.canApproveQuotation = AccessFilter.hasPermission('12');
      this.canModifyQuotation = AccessFilter.hasPermission('37');
    }
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.typeSearch = +params.get('typeSearch')
      this.refresh();
    })
    /*this.route.queryParams
    .subscribe(params => {
      this.typeSearch = params.typeSearch
    });*/

    if (this.typeSearch == 1) {
      this.title = "Consulta de Trámites";
    } else {
      this.title = "Bandeja de Trámites";
    }

    if (this.isExternalUser) this.brokerName = JSON.parse(localStorage.getItem('currentUser'))['desCanal'];
    this.filter.User = JSON.parse(localStorage.getItem('currentUser'))['id'];
    //await this.getPerfilTramiteOpe();
    //this.isProfileOpe = this.resProfileOpe[0].P_NFLAG_PERFIL;
    this.createForm();
    this.getBranchList();
    this.initializeForm();
    this.branch = await CommonMethods.branchXproduct(this.codProducto);
    this.getDocumentTypeList();
    //this.getProductsListByBranch();
    this.getStatusList();
    this.perfil = await this.getProfileProduct(); // 20230325
    await this.getPerfilTramiteOpe();
    CommonMethods.clearBack();
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
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      branch: [''],  //Ramo
      product: [''],  //Producto
      status: [''],  //estado de cotización
      startDate: [ModuleConfig.StartDate, [Validators.required]], //Fecha inferior para búsqueda
      endDate: [ModuleConfig.EndDate, [Validators.required]], //Fecha superior para búsqueda
      transactNumber: ['', [Validators.minLength(1), Validators.maxLength(10), GlobalValidators.onlyNumberValidator]], //Número de trámite
      quotationNumber: ['', [Validators.minLength(1), Validators.maxLength(10), GlobalValidators.onlyNumberValidator]], //Número de cotización
      policyNumber: ['', [Validators.minLength(1), Validators.maxLength(10), GlobalValidators.onlyNumberValidator]], //Número de póliza
      typeClient: [''],  //estado de cotización

      contractorSearchMode: ['1'],  //Modo de búsqueda de contratante
      contractorDocumentType: [''],  //Tipo de documento de contratante
      contractorDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],  //Número de documento de contratante
      contractorPersonType: ['1'], //Tipo de persona de contratante
      contractorFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  //Nombre de contratante
      contractorPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], //Apellido paterno de contratante
      contractorMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  //Apellido materno de contratante
      contractorLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]],  //Razón social de contratante

      brokerSearchMode: ['1'],  //Modo de búsqueda de contratante
      brokerDocumentType: [''],  //Tipo de documento de contratante
      brokerDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],  //Número de documento de contratante
      brokerPersonType: ['1'], //Tipo de persona de contratante
      brokerFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  //Nombre de broker
      brokerPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], //Apellido paterno de broker
      brokerMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], //Apellido materno de broker
      brokerLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]], //Razón social de broker
      brokerNameExternal: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]] //Razón social de broker
    });
  }
  private initializeForm() {
    this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
  }

  /**
  * Obtener flag de perfil Ope
  */
  async getPerfilTramiteOpe() {
    let dataQuotation: any = {};
    dataQuotation.P_NBRANCH = await CommonMethods.branchXproduct(this.codProducto);
    dataQuotation.P_NPRODUCT = 1;
    dataQuotation.P_NPERFIL = this.perfil;
    this.transactService.getPerfilTramiteOpe(dataQuotation).subscribe(
      res => {
        // this.resProfileOpe = res;
        this.isProfileOpe = res.P_NFLAG_PERFIL;
      },
      error => {

      }
    );
  }

  /**
   * Obtener lista de estados
   */
  getStatusList() {
    this.transactService.GetStatusListTransact().subscribe(
      res => {
        this.statusList = res;
      },
      error => {

      }
    );
  }
  /**
  * Obtiene los tipos de producto
  */
  getProductTypeList() {
    this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.branch).subscribe(
      res => {
        this.productTypeList = res;
        if (this.productTypeList.length == 1) {
          this.mainFormGroup.controls.product.patchValue(this.productTypeList[0].COD_PRODUCT);
        } else {
          this.mainFormGroup.controls.product.patchValue('');
        }
      },
      err => {
      }
    );
  }

  /**
  *
  */
  cleanValidation() {
    this.isValidatedInClickButton = false;
  }

  /**
   * Previene ingreso de datos en el campo [número de documento] según el tipo de documento
   * @param event Evento activador, este objeto contiene el valor ingresado
   * @param documentType Tipo de documento seleccionado
   */
  documentNumberKeyPress(event: any, documentType: string) {
    if (documentType == '') return;
    CommonMethods.validarNroDocumento(event, documentType)
  }

  /**
   * Limpiar campos y cambiar la propiedad MaxLength de los campos de CONTRATANTE
   */
  contractorDocumentTypeChanged() {
    switch (this.mainFormGroup.controls.contractorDocumentType.value) {
      case '1': { //ruc
        this.contractorDocumentMaxLength = 11;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      case '2': { //dni
        this.contractorDocumentMaxLength = 8;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      case '4': { //ce
        this.contractorDocumentMaxLength = 12;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      case '6': { //pasaporte
        this.contractorDocumentMaxLength = 12;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      default: {  //otros tipos de documento
        this.contractorDocumentMaxLength = 15;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.maxLength(15)]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
    }
    this.cleanContractorInputs();
  }

  /**
   * Limpia campos de broker
   */
  cleanBrokerInputs() {
    this.mainFormGroup.controls.brokerDocumentNumber.patchValue('');
    this.mainFormGroup.controls.brokerFirstName.patchValue('');
    this.mainFormGroup.controls.brokerPaternalLastName.patchValue('');
    this.mainFormGroup.controls.brokerMaternalLastName.patchValue('');
    this.mainFormGroup.controls.brokerLegalName.patchValue('');
  }
  /**
   * Limpia campos de contratante
   */
  cleanContractorInputs() {
    this.mainFormGroup.controls.contractorDocumentNumber.patchValue('');
    this.mainFormGroup.controls.contractorFirstName.patchValue('');
    this.mainFormGroup.controls.contractorPaternalLastName.patchValue('');
    this.mainFormGroup.controls.contractorMaternalLastName.patchValue('');
    this.mainFormGroup.controls.contractorLegalName.patchValue('');
  }

  /**
   * Limpia campos y cambia la propiedad MaxLength del campo Nro de documento del broker
   */
  brokerDocumentTypeChanged() {
    switch (this.mainFormGroup.controls.brokerDocumentType.value) {
      case '1': { //ruc
        this.brokerDocumentMaxLength = 11;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      case '2': { //dni
        this.brokerDocumentMaxLength = 8;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      case '4': { //ce
        this.brokerDocumentMaxLength = 12;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      case '6': { //pasaporte
        this.brokerDocumentMaxLength = 12;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      default: {  //otros tipos de documento
        this.brokerDocumentMaxLength = 15;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.maxLength(15)]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
    }
    this.cleanBrokerInputs();
  }

  /**
   * Lista tipos de documento
   */
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        this.documentTypeList = res;
      },
      err => {
      }
    );
  }

  /**
   * Realiza la primera búsqueda accionada por el botón buscar o la tecla ENTER
   */
  firstSearch(excel: number = null) {
    if (this.mainFormGroup.controls.transactNumber.value > 0) {
      this.mainFormGroup.controls.transactNumber.setValue(this.mainFormGroup.controls.transactNumber.value.replace(/\s/g, ""));
    }
    if (this.mainFormGroup.controls.quotationNumber.value > 0) {
      this.mainFormGroup.controls.quotationNumber.setValue(this.mainFormGroup.controls.quotationNumber.value.replace(/\s/g, ""));
    }
    if (this.mainFormGroup.controls.policyNumber.value > 0) {
      this.mainFormGroup.controls.policyNumber.setValue(this.mainFormGroup.controls.policyNumber.value.replace(/\s/g, ""));
    }
    if (excel != 1) {
      this.isValidatedInClickButton = true;
      this.listToShow = [];
      this.foundResults = [];
    }
    if (this.mainFormGroup.valid) {
      //Preparación de datos
      this.filter.Nbranch = this.mainFormGroup.controls.branch.value;
      this.filter.ProductType = this.mainFormGroup.controls.product.value;
      this.filter.Status = this.mainFormGroup.controls.status.value;
      this.filter.StartDate = this.mainFormGroup.controls.startDate.value;
      this.filter.EndDate = this.mainFormGroup.controls.endDate.value;
      this.filter.TransactNumber = this.mainFormGroup.controls.transactNumber.value;
      this.filter.QuotationNumber = this.mainFormGroup.controls.quotationNumber.value;
      this.filter.PolicyNumber = this.mainFormGroup.controls.policyNumber.value;
      this.filter.TypeClient = this.mainFormGroup.controls.typeClient.value;
      this.filter.TypeSearch = this.typeSearch;

      this.filter.ContractorSearchMode = this.mainFormGroup.controls.contractorSearchMode.value;

      if (this.mainFormGroup.controls.contractorSearchMode.value == '1') {
        this.filter.ContractorDocumentType = this.mainFormGroup.controls.contractorDocumentType.value;
        this.filter.ContractorDocumentNumber = this.mainFormGroup.controls.contractorDocumentNumber.value;
        this.filter.ContractorPaternalLastName = '';
        this.filter.ContractorMaternalLastName = '';
        this.filter.ContractorFirstName = '';
        this.filter.ContractorLegalName = '';
      } else if (this.mainFormGroup.controls.contractorSearchMode.value == '2' && this.mainFormGroup.controls.contractorPersonType.value == '1') {
        this.filter.ContractorDocumentType = '';
        this.filter.ContractorDocumentNumber = '';
        this.filter.ContractorPaternalLastName = this.mainFormGroup.controls.contractorPaternalLastName.value;
        this.filter.ContractorMaternalLastName = this.mainFormGroup.controls.contractorMaternalLastName.value;
        this.filter.ContractorFirstName = this.mainFormGroup.controls.contractorFirstName.value;
        this.filter.ContractorLegalName = '';
      } else if (this.mainFormGroup.controls.contractorSearchMode.value == '2' && this.mainFormGroup.controls.contractorPersonType.value == '2') {
        this.filter.ContractorDocumentType = '';
        this.filter.ContractorDocumentNumber = '';
        this.filter.ContractorPaternalLastName = '';
        this.filter.ContractorMaternalLastName = '';
        this.filter.ContractorFirstName = '';
        this.filter.ContractorLegalName = this.mainFormGroup.controls.contractorLegalName.value;
      } else {
        this.filter.ContractorDocumentType = '';
        this.filter.ContractorDocumentNumber = '';
        this.filter.ContractorPaternalLastName = '';
        this.filter.ContractorMaternalLastName = '';
        this.filter.ContractorFirstName = '';
        this.filter.ContractorLegalName = '';
      }

      this.filter.BrokerSearchMode = this.mainFormGroup.controls.brokerSearchMode.value;

      if (this.mainFormGroup.controls.brokerSearchMode.value == '1') {
        this.filter.BrokerDocumentType = this.mainFormGroup.controls.brokerDocumentType.value;
        this.filter.BrokerDocumentNumber = this.mainFormGroup.controls.brokerDocumentNumber.value;
        this.filter.BrokerPaternalLastName = '';
        this.filter.BrokerMaternalLastName = '';
        this.filter.BrokerFirstName = '';
        this.filter.BrokerLegalName = '';
      } else if (this.mainFormGroup.controls.brokerSearchMode.value == '2' && this.mainFormGroup.controls.brokerPersonType.value == '1') {
        this.filter.BrokerDocumentType = '';
        this.filter.BrokerDocumentNumber = '';
        this.filter.BrokerPaternalLastName = this.mainFormGroup.controls.brokerPaternalLastName.value;
        this.filter.BrokerMaternalLastName = this.mainFormGroup.controls.brokerMaternalLastName.value;
        this.filter.BrokerFirstName = this.mainFormGroup.controls.brokerFirstName.value;
        this.filter.BrokerLegalName = '';
      } else if (this.mainFormGroup.controls.brokerSearchMode.value == '2' && this.mainFormGroup.controls.brokerPersonType.value == '2') {
        this.filter.BrokerDocumentType = '';
        this.filter.BrokerDocumentNumber = '';
        this.filter.BrokerPaternalLastName = '';
        this.filter.BrokerMaternalLastName = '';
        this.filter.BrokerFirstName = '';
        this.filter.BrokerLegalName = this.mainFormGroup.controls.brokerLegalName.value;
      } else {
        this.filter.BrokerDocumentType = '';
        this.filter.BrokerDocumentNumber = '';
        this.filter.BrokerPaternalLastName = '';
        this.filter.BrokerMaternalLastName = '';
        this.filter.BrokerFirstName = '';
        this.filter.BrokerLegalName = '';
      }

      if (this.mainFormGroup.controls.contractorDocumentNumber.value.toString().trim() == '' && this.mainFormGroup.controls.contractorSearchMode.value == '1') {
        this.filter.ContractorSearchMode = '3';
      }
      if (this.mainFormGroup.controls.brokerDocumentNumber.value.toString().trim() == '' && this.mainFormGroup.controls.brokerSearchMode.value == '1') {
        this.filter.BrokerSearchMode = '3';
      }

      this.filter.CompanyLNK = this.epsItem.NCODE;
      //this.filter.Nbranch = this.branch;

      if (excel == 1) {
        //this.excel();
        this.excelConsultaTramite();

      } else {
        this.search();
      }
    } else {
      this.identifyAndShowErrors();
    }
  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  /**
   * Identifica y muestra los errores
   */
  identifyAndShowErrors() {
    let error = [];
    if (this.mainFormGroup.controls.branch.status == 'INVALID') error.push('El ramo no es válido.');
    if (this.mainFormGroup.controls.product.status == 'INVALID') error.push('El producto no es válido.');
    if (this.mainFormGroup.controls.status.status == 'INVALID') error.push('El estado no es válido.');
    if (this.mainFormGroup.controls.transactNumber.status == 'INVALID') error.push('El número de trámite no es válido.');
    if (this.mainFormGroup.controls.quotationNumber.status == 'INVALID') error.push('El número de cotización no es válido.');
    if (this.mainFormGroup.controls.policyNumber.status == 'INVALID') error.push('El número de pólicy no es válido.');

    if (this.mainFormGroup.controls.contractorDocumentNumber.status == 'INVALID') error.push('El número de documento del contratante no es válido.');
    if (this.mainFormGroup.controls.contractorFirstName.status == 'INVALID') error.push('El nombre del contratante no es válido.');
    if (this.mainFormGroup.controls.contractorPaternalLastName.status == 'INVALID') error.push('El apellido paterno del contratante no es válido.');
    if (this.mainFormGroup.controls.contractorMaternalLastName.status == 'INVALID') error.push('El apellido materno del contratante no es válido.');

    if (this.mainFormGroup.controls.brokerDocumentNumber.status == 'INVALID') error.push('El número de documento del broker no es válido.');
    if (this.mainFormGroup.controls.brokerFirstName.status == 'INVALID') error.push('El nombre del broker no es válido.');
    if (this.mainFormGroup.controls.brokerPaternalLastName.status == 'INVALID') error.push('El apellido del broker paterno no es válido.');
    if (this.mainFormGroup.controls.brokerMaternalLastName.status == 'INVALID') error.push('El apellido del broker materno no es válido.');

    if (this.mainFormGroup.controls.startDate.status == 'VALID' && this.mainFormGroup.controls.endDate.status == 'VALID') {
      if (this.mainFormGroup.hasError('datesNotSortedCorrectly')) error.push(ModuleConfig.InvalidStartDateOrderMessage);
    } else {
      if (this.mainFormGroup.controls.startDate.status == 'INVALID') {
        if (this.mainFormGroup.controls.startDate.hasError('required')) error.push('La fecha de inicio es requerida.');
        else error.push(ModuleConfig.InvalidStartDateMessage);
      }
      if (this.mainFormGroup.controls.endDate.status == 'INVALID') {
        if (this.mainFormGroup.controls.endDate.hasError('required')) error.push('La fecha de fin es requerida.');
        else error.push(ModuleConfig.InvalidEndDateMessage);
      }
    }

    Swal.fire('Información', this.listToString(error), 'error');
  }


  /**
   * Realiza la búsqueda accionada por el cambio de página en el paginador
   * @param page número de página seleccionado en el paginador
   */
  pageChanged(page: number) {
    this.currentPage = page;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  /**
  * extrae los datos que provee el servicio
  */
  search() {
    this.isLoading = true;
    this.transactService.GetTransactList(this.filter).subscribe(
      res => {
        this.foundResults = res.GenericResponse;
        if (this.foundResults != null && this.foundResults.length > 0) {
          this.totalItems = this.foundResults.length;
          this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        }
        else {
          this.totalItems = 0;
          Swal.fire('Información', this.notfoundMessage, 'warning');
        }
        this.isLoading = false;
      },
      err => {
        this.foundResults = [];
        this.totalItems = 0;
        this.isLoading = false;
        Swal.fire('Información', this.genericErrorMessage, 'error');

      }
    );
  }

  openFilePicker(fileList: string[]) {
    if (fileList != null && fileList.length > 0) {
      const modalRef = this.modalService.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
      modalRef.componentInstance.fileList = fileList;
      modalRef.componentInstance.ngbModalRef = modalRef;
    } else {
      Swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
    }

  }

  /**
   * Cargamos el formulario de cotización en modo EVALUAR
   * @param transactNumber
   */
  evaluate(transactNumber: string) {
    this.router.navigate(['/extranet/quotation-evaluation'], { queryParams: { transactNumber: transactNumber, mode: 'evaluar' } });
  }
  /**
   * Cargamos el formulario de cotización en modo VISTA
   * @param transactNumber
   */
  justWatch(transactNumber: string) {
    this.router.navigate(['/extranet/quotation-evaluation'], { queryParams: { transactNumber: transactNumber, mode: 'solover' } });
  }
  /**
   * Cargamos el formulario de modificación de cotización
   * @param transactNumber
   */
  modifyQuotation(transactNumber: string) {
    this.router.navigate(['/extranet/quotation'], { queryParams: { transactNumber: transactNumber, mode: 'recotizar' } });

  }

  /**
   * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
   * @param list lista ingresada
   * @returns  string en html
   */
  listToString(list: String[]): string {
    let output = '';
    if (list != null && list.length > 0) {
      list.forEach(function (item) {
        output = output + item + ' <br>'
      });
    }
    return output;
  }

  transactNumberPressed(event: any) {
    if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
      event.preventDefault();
    }
  }

  quotationNumberPressed(event: any) {
    if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
      event.preventDefault();
    }
  }

  policyNumberPressed(event: any) {
    if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
      event.preventDefault();
    }
  }
  /**
   * Bloquea los otros campos cuando el campo de número de cotización no está vacío; en caso contrario, los desbloquea
   */
  transactNumberChanged(event: any) {
    if (this.mainFormGroup.controls.transactNumber.value != null && this.mainFormGroup.controls.transactNumber.value != '') {
      this.mainFormGroup.controls.quotationNumber.disable();
      this.mainFormGroup.controls.policyNumber.disable();
      this.mainFormGroup.controls.branch.disable();
      this.mainFormGroup.controls.product.disable();
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.startDate.disable();
      this.mainFormGroup.controls.endDate.disable();

      this.mainFormGroup.controls.contractorSearchMode.disable();
      this.mainFormGroup.controls.contractorPersonType.disable();
      this.mainFormGroup.controls.contractorDocumentType.disable();
      this.mainFormGroup.controls.contractorDocumentNumber.disable();
      this.mainFormGroup.controls.contractorPaternalLastName.disable();
      this.mainFormGroup.controls.contractorMaternalLastName.disable();
      this.mainFormGroup.controls.contractorFirstName.disable();
      this.mainFormGroup.controls.contractorLegalName.disable();

      this.mainFormGroup.controls.brokerSearchMode.disable();
      this.mainFormGroup.controls.brokerPersonType.disable();
      this.mainFormGroup.controls.brokerDocumentType.disable();
      this.mainFormGroup.controls.brokerDocumentNumber.disable();
      this.mainFormGroup.controls.brokerPaternalLastName.disable();
      this.mainFormGroup.controls.brokerMaternalLastName.disable();
      this.mainFormGroup.controls.brokerFirstName.disable();
      this.mainFormGroup.controls.brokerLegalName.disable();

      this.mainFormGroup.setValidators(null);

    } else {
      this.mainFormGroup.controls.quotationNumber.enable();
      this.mainFormGroup.controls.policyNumber.enable();
      this.mainFormGroup.controls.branch.enable();
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.status.enable();
      this.mainFormGroup.controls.startDate.enable();
      this.mainFormGroup.controls.endDate.enable();

      this.mainFormGroup.controls.contractorSearchMode.enable();
      this.mainFormGroup.controls.contractorPersonType.enable();
      this.mainFormGroup.controls.contractorDocumentType.enable();
      this.mainFormGroup.controls.contractorDocumentNumber.enable();
      this.mainFormGroup.controls.contractorPaternalLastName.enable();
      this.mainFormGroup.controls.contractorMaternalLastName.enable();
      this.mainFormGroup.controls.contractorFirstName.enable();
      this.mainFormGroup.controls.contractorLegalName.enable();

      this.mainFormGroup.controls.brokerSearchMode.enable();
      this.mainFormGroup.controls.brokerPersonType.enable();
      this.mainFormGroup.controls.brokerDocumentType.enable();
      this.mainFormGroup.controls.brokerDocumentNumber.enable();
      this.mainFormGroup.controls.brokerPaternalLastName.enable();
      this.mainFormGroup.controls.brokerMaternalLastName.enable();
      this.mainFormGroup.controls.brokerFirstName.enable();
      this.mainFormGroup.controls.brokerLegalName.enable();
      this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    }
    this.mainFormGroup.updateValueAndValidity();
  }

  quotationNumberChanged(event: any) {
    if (this.mainFormGroup.controls.quotationNumber.value != null && this.mainFormGroup.controls.quotationNumber.value != '') {
      this.mainFormGroup.controls.transactNumber.disable();
      this.mainFormGroup.controls.policyNumber.disable();
      this.mainFormGroup.controls.branch.disable();
      this.mainFormGroup.controls.product.disable();
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.startDate.disable();
      this.mainFormGroup.controls.endDate.disable();

      this.mainFormGroup.controls.contractorSearchMode.disable();
      this.mainFormGroup.controls.contractorPersonType.disable();
      this.mainFormGroup.controls.contractorDocumentType.disable();
      this.mainFormGroup.controls.contractorDocumentNumber.disable();
      this.mainFormGroup.controls.contractorPaternalLastName.disable();
      this.mainFormGroup.controls.contractorMaternalLastName.disable();
      this.mainFormGroup.controls.contractorFirstName.disable();
      this.mainFormGroup.controls.contractorLegalName.disable();

      this.mainFormGroup.controls.brokerSearchMode.disable();
      this.mainFormGroup.controls.brokerPersonType.disable();
      this.mainFormGroup.controls.brokerDocumentType.disable();
      this.mainFormGroup.controls.brokerDocumentNumber.disable();
      this.mainFormGroup.controls.brokerPaternalLastName.disable();
      this.mainFormGroup.controls.brokerMaternalLastName.disable();
      this.mainFormGroup.controls.brokerFirstName.disable();
      this.mainFormGroup.controls.brokerLegalName.disable();

      this.mainFormGroup.setValidators(null);

    } else {
      this.mainFormGroup.controls.transactNumber.enable();
      this.mainFormGroup.controls.policyNumber.enable();
      this.mainFormGroup.controls.branch.enable();
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.status.enable();
      this.mainFormGroup.controls.startDate.enable();
      this.mainFormGroup.controls.endDate.enable();

      this.mainFormGroup.controls.contractorSearchMode.enable();
      this.mainFormGroup.controls.contractorPersonType.enable();
      this.mainFormGroup.controls.contractorDocumentType.enable();
      this.mainFormGroup.controls.contractorDocumentNumber.enable();
      this.mainFormGroup.controls.contractorPaternalLastName.enable();
      this.mainFormGroup.controls.contractorMaternalLastName.enable();
      this.mainFormGroup.controls.contractorFirstName.enable();
      this.mainFormGroup.controls.contractorLegalName.enable();

      this.mainFormGroup.controls.brokerSearchMode.enable();
      this.mainFormGroup.controls.brokerPersonType.enable();
      this.mainFormGroup.controls.brokerDocumentType.enable();
      this.mainFormGroup.controls.brokerDocumentNumber.enable();
      this.mainFormGroup.controls.brokerPaternalLastName.enable();
      this.mainFormGroup.controls.brokerMaternalLastName.enable();
      this.mainFormGroup.controls.brokerFirstName.enable();
      this.mainFormGroup.controls.brokerLegalName.enable();
      this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    }
    this.mainFormGroup.updateValueAndValidity();
  }

  policyNumberChanged(event: any) {
    if (this.mainFormGroup.controls.policyNumber.value != null && this.mainFormGroup.controls.policyNumber.value != '') {
      this.mainFormGroup.controls.transactNumber.disable();
      this.mainFormGroup.controls.quotationNumber.disable();
      this.mainFormGroup.controls.branch.disable();
      this.mainFormGroup.controls.product.disable();
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.startDate.disable();
      this.mainFormGroup.controls.endDate.disable();

      this.mainFormGroup.controls.contractorSearchMode.disable();
      this.mainFormGroup.controls.contractorPersonType.disable();
      this.mainFormGroup.controls.contractorDocumentType.disable();
      this.mainFormGroup.controls.contractorDocumentNumber.disable();
      this.mainFormGroup.controls.contractorPaternalLastName.disable();
      this.mainFormGroup.controls.contractorMaternalLastName.disable();
      this.mainFormGroup.controls.contractorFirstName.disable();
      this.mainFormGroup.controls.contractorLegalName.disable();

      this.mainFormGroup.controls.brokerSearchMode.disable();
      this.mainFormGroup.controls.brokerPersonType.disable();
      this.mainFormGroup.controls.brokerDocumentType.disable();
      this.mainFormGroup.controls.brokerDocumentNumber.disable();
      this.mainFormGroup.controls.brokerPaternalLastName.disable();
      this.mainFormGroup.controls.brokerMaternalLastName.disable();
      this.mainFormGroup.controls.brokerFirstName.disable();
      this.mainFormGroup.controls.brokerLegalName.disable();

      this.mainFormGroup.setValidators(null);

    } else {
      this.mainFormGroup.controls.transactNumber.enable();
      this.mainFormGroup.controls.quotationNumber.enable();
      this.mainFormGroup.controls.branch.enable();
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.status.enable();
      this.mainFormGroup.controls.startDate.enable();
      this.mainFormGroup.controls.endDate.enable();

      this.mainFormGroup.controls.contractorSearchMode.enable();
      this.mainFormGroup.controls.contractorPersonType.enable();
      this.mainFormGroup.controls.contractorDocumentType.enable();
      this.mainFormGroup.controls.contractorDocumentNumber.enable();
      this.mainFormGroup.controls.contractorPaternalLastName.enable();
      this.mainFormGroup.controls.contractorMaternalLastName.enable();
      this.mainFormGroup.controls.contractorFirstName.enable();
      this.mainFormGroup.controls.contractorLegalName.enable();

      this.mainFormGroup.controls.brokerSearchMode.enable();
      this.mainFormGroup.controls.brokerPersonType.enable();
      this.mainFormGroup.controls.brokerDocumentType.enable();
      this.mainFormGroup.controls.brokerDocumentNumber.enable();
      this.mainFormGroup.controls.brokerPaternalLastName.enable();
      this.mainFormGroup.controls.brokerMaternalLastName.enable();
      this.mainFormGroup.controls.brokerFirstName.enable();
      this.mainFormGroup.controls.brokerLegalName.enable();
      this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    }
    this.mainFormGroup.updateValueAndValidity();
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    if (!isNumeric(pastedText)) {
      event.preventDefault()
    } else {
      if (pastedText != null && pastedText.toString().trim() != '') {
        this.mainFormGroup.controls.branch.disable();
        this.mainFormGroup.controls.product.disable();
        this.mainFormGroup.controls.status.disable();
        this.mainFormGroup.controls.startDate.disable();
        this.mainFormGroup.controls.endDate.disable();

        this.mainFormGroup.controls.contractorSearchMode.disable();
        this.mainFormGroup.controls.contractorPersonType.disable();
        this.mainFormGroup.controls.contractorDocumentType.disable();
        this.mainFormGroup.controls.contractorDocumentNumber.disable();
        this.mainFormGroup.controls.contractorPaternalLastName.disable();
        this.mainFormGroup.controls.contractorMaternalLastName.disable();
        this.mainFormGroup.controls.contractorFirstName.disable();
        this.mainFormGroup.controls.contractorLegalName.disable();

        this.mainFormGroup.controls.brokerSearchMode.disable();
        this.mainFormGroup.controls.brokerPersonType.disable();
        this.mainFormGroup.controls.brokerDocumentType.disable();
        this.mainFormGroup.controls.brokerDocumentNumber.disable();
        this.mainFormGroup.controls.brokerPaternalLastName.disable();
        this.mainFormGroup.controls.brokerMaternalLastName.disable();
        this.mainFormGroup.controls.brokerFirstName.disable();
        this.mainFormGroup.controls.brokerLegalName.disable();

        this.mainFormGroup.setValidators(null);
      }
    }

  }

  openDetails(item: any, reasignar: number = 0) {
    item.TypeTransac = CommonMethods.textFormat(item.typeTransac);

    item.From = 'transact' + this.typeSearch;
    if (reasignar == 0) {
      if (item.Mode == 'Iniciado' && ((item.TypeTransac != 'Emision' && item.TypeTransac != 'Emision Poliza Matriz') || item.SPOL_ESTADO != 1)) {
        this.moveTransaction(item.TypeTransac, item.QuotationNumber, item.PolicyNumber)
      } else if (item.Mode == 'Modificar') {
        this.moveTransactionUPD(item.TypeTransac, item.QuotationNumber, item.PolicyNumber);
      } else if (item.Mode == 'Reingresar') {
        this.moveTransactionRT(item.TypeTransac, item.QuotationNumber, item.PolicyNumber);
      } else {
        sessionStorage.setItem('cs-quotation', JSON.stringify(item));
        this.router.navigate(['/extranet/quotation-evaluation']);
      }
    } else {
      item.Mode = 'Asignar';
      sessionStorage.setItem('cs-quotation', JSON.stringify(item));
      this.router.navigate(['/extranet/quotation-evaluation']);
    }
  }

  b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

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

  excel() {
    this.isLoading = true;
    try {
      this.quotationService.GetExcelQuotationList(this.filter).subscribe(res => {
        this.isLoading = false;
        if (res == "") {
          Swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
        } else {
          const blob = this.b64toBlob(res);
          const blobUrl = URL.createObjectURL(blob);
          let a = document.createElement("a")
          a.href = blobUrl
          a.download = "reporte_cotizacion_lista.xlsx"
          a.click()
        };
      })
    } catch (error) {
      this.isLoading = false;
      Swal.fire('Información', "Error al descargar Excel", 'error');
    }
  }
  excelConsultaTramite() {
    this.isLoading = true;
    try {
      this.transactService.GetExcelTransactList(this.filter).subscribe(res => {
        this.isLoading = false;
        if (res == "") {
          Swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
        } else {
          const blob = this.b64toBlob(res);
          const blobUrl = URL.createObjectURL(blob);
          let a = document.createElement("a")
          a.href = blobUrl
          a.download = "Reporte_consulta_de_trámites.xlsx"
          a.click()
        };
      })
    } catch (error) {
      this.isLoading = false;
      Swal.fire('Información', "Error al descargar Excel", 'error');
    }
  }

  moveTransaction(transaction, cotizacion, poliza) { //AVS PRY NC
    switch (transaction) {
      case "Inclusión": { // Incluir
        this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
      case "Exclusión": { // Exluir
        this.router.navigate(['/extranet/policy/transaction/exclude'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
      case "Renovación": { // Renovar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
      case "Declaración": { // Declarar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
      case "Endoso": { // Endoso
        this.router.navigate(['/extranet/policy/transaction/endosar'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
      case "Broker": { // Endoso
        this.router.navigate(['/extranet/policy/transaction/broker'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
      case "Emisión de certificados": { // EC
        this.router.navigate(['/extranet/policy/transaction/certificate'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza } });
        break;
      }
    }
  }

  moveTransactionUPD(transaction, cotizacion, poliza) {
    transaction = CommonMethods.textFormat(transaction);
    switch (transaction) {
      case 'Inclusion': // Incluir
        this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
      case 'Exclusion': // Exluir
        this.router.navigate(['/extranet/policy/transaction/exclude'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
      case 'Renovacion': // Renovar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
      case 'Declaracion': // Declarar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
      case 'Endoso': // Endoso
        this.router.navigate(['/extranet/policy/transaction/endosar'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
      case 'Broker': // Endoso
        this.router.navigate(['/extranet/policy/transaction/broker'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
      case 'Emision de certificados': // EC
        this.router.navigate(['/extranet/policy/transaction/certificate'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 1 } });
        break;
    }
  }

  moveTransactionRT(transaction, cotizacion, poliza) {
    transaction = CommonMethods.textFormat(transaction);
    switch (transaction) {
      case 'Inclusion': // Incluir
        this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Exclusion': // Exluir
        this.router.navigate(['/extranet/policy/transaction/exclude'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Renovacion': // Renovar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Declaracion': // Declarar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Endoso': // Endoso
        this.router.navigate(['/extranet/policy/transaction/endosar'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Broker': // Endoso
        this.router.navigate(['/extranet/policy/transaction/broker'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Emision':
        this.router.navigate(['/extranet/policy/transaction/emit'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
      case 'Emision Poliza Matriz':
        this.router.navigate(['/extranet/policy/transaction/emit-matrix'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;

      case 'Emision de certificados': // EC
        this.router.navigate(['/extranet/policy/transaction/certificate'], { queryParams: { nroCotizacion: cotizacion, nroPoliza: poliza, updTr: 2 } });
        break;
    }
  }

  openModal(item, flagModo) {
    const modalRef = this.modalService.open(ReassingTransactComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    let branchAux;
    modalRef.componentInstance.reference = modalRef;
    //modalRef.componentInstance.itemTransaccionList = this.policyList;
    //modalRef.componentInstance.NBRANCH = item.NBRANCH;
    //modalRef.componentInstance.NPRODUCT = item.ProductName;
    modalRef.componentInstance.NPOLICY = item.PolicyNumber;
    modalRef.componentInstance.NQUOTATION = item.QuotationNumber;
    modalRef.componentInstance.NTRANSACT = item.TransactNumber;

    this.branchList.forEach(element => {
      if (element.NBRANCH == this.branch) {
        branchAux = element.SDESCRIPT
      }
    });
    modalRef.componentInstance.SBRANCH = branchAux;
    modalRef.componentInstance.SPRODUCT = item.ProductName;
    modalRef.componentInstance.SCONTRATANTE = item.ContractorFullName;
    modalRef.componentInstance.STYPETRANSAC = item.TypeTransac;
    modalRef.componentInstance.SSTATUS = item.Status;
    modalRef.componentInstance.SMODE = flagModo;
    modalRef.componentInstance.NUSERCODE = item.UserCodeAssigned;
    modalRef.componentInstance.SMAILACTUAL = item.MailActual;

    // modalRef.result.then((renovacion) => {
    //   if (renovacion != undefined) {
    //     this.router.navigate(['/extranet/tray-transact/1']);
    //   }
    // }, (reason) => {
    // });
  }

  async refresh() {
    try {
      this.listToShow = [];
      this.foundResults = [];
      this.mainFormGroup.controls.transactNumber.setValue('');
      this.mainFormGroup.controls.quotationNumber.setValue('');
      this.mainFormGroup.controls.policyNumber.setValue('');
      this.mainFormGroup.controls.startDate.setValue(ModuleConfig.StartDate);
      this.mainFormGroup.controls.endDate.setValue(ModuleConfig.EndDate);
      this.mainFormGroup.controls.typeClient.setValue('');
      this.mainFormGroup.controls.status.setValue('');
      this.mainFormGroup.controls.contractorSearchMode.setValue('1');
      this.mainFormGroup.controls.contractorDocumentType.setValue('');
      this.mainFormGroup.controls.contractorDocumentNumber.setValue('');
      this.mainFormGroup.controls.contractorPersonType.setValue('1');
      this.mainFormGroup.controls.contractorFirstName.setValue('');
      this.mainFormGroup.controls.contractorPaternalLastName.setValue('');
      this.mainFormGroup.controls.contractorMaternalLastName.setValue('');
      this.mainFormGroup.controls.contractorLegalName.setValue('');
      this.mainFormGroup.controls.brokerSearchMode.setValue('1');
      this.mainFormGroup.controls.brokerDocumentType.setValue('');
      this.mainFormGroup.controls.brokerDocumentNumber.setValue('');
      this.mainFormGroup.controls.brokerPersonType.setValue('1');
      this.mainFormGroup.controls.brokerFirstName.setValue('');
      this.mainFormGroup.controls.brokerPaternalLastName.setValue('');
      this.mainFormGroup.controls.brokerMaternalLastName.setValue('');
      this.mainFormGroup.controls.brokerLegalName.setValue('');
      this.mainFormGroup.controls.brokerNameExternal.setValue('');
      this.policyNumberChanged(null);
      this.quotationNumberChanged(null);
      this.transactNumberChanged(null);
    } catch {

    }
  }
 getBranchList() {
    this.clientInformationService.getBranch().subscribe(
      res => {
        this.branchList = res;
        this.mainFormGroup.controls.branch.setValue(this.branch);
        this.SelectBranch();
      },
      err => {
        console.log(err);
      }
    );
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.mainFormGroup.controls.branch.value).subscribe(
      res => {
        this.productTypeList = res;
        if (this.productTypeList.length == 1) {
          this.mainFormGroup.controls.product.patchValue(this.productTypeList[0].COD_PRODUCT);
        } else {
          this.mainFormGroup.controls.product.patchValue('');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  SelectBranch() {
    this.productTypeList = null;
    if (this.mainFormGroup.controls.branch.value != null) {
      this.getProductsListByBranch();
    }
  }
}
