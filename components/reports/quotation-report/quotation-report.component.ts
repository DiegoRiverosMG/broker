import { Component, OnInit, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

// Compartido
import { AccessFilter } from './../../access-filter';
import { ModuleConfig } from './../../module.config';
import Swal from 'sweetalert2';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { PolicyService } from '../../../services/policy/policy.service';
import { BillReportService } from '../../../services/report/bill-report.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';
import { PolicyMovementDetailsAllComponent } from '../../policy-all/policy-movement-details-all/policy-movement-details-all.component';
import { BillReportReceiptColumnDialogComponent } from '../bill-report-receipt-column-dialog/bill-report-receipt-column-dialog.component';
import { QuotationReportService } from '../../../services/report/quotation-report.service';
import { QuotationService } from '../../../services/quotation/quotation.service';

import { GlobalValidators } from './../../global-validators';
import { isNumeric } from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-quotation-report',
  templateUrl: './quotation-report.component.html',
  styleUrls: ['./quotation-report.component.css']
})
export class QuotationReportComponent implements OnInit {
  @ViewChild('desde', null) desde: any;
  @ViewChild('hasta', null) hasta: any;
  userType = 1; // 1: admin, 2:emisor, 3:comercial, 4:tecnico, 5:cobranza
  bsConfig: Partial<BsDatepickerConfig>;

  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueIniMax: Date = new Date();
  bsValueFinMin: Date = new Date();
  bsValueFinMax: Date = new Date();

  mainFormGroup: FormGroup;

  branchList: any = [];
  productList: any = [];
  transaccionList: any = [];
  documentTypeList: any = [];
  listToShow: any[] = [];
  statusList: any[] = []; // Lista de estados de cotización

  genericErrorMessage = ModuleConfig.GenericErrorMessage; // Mensaje de error genérico
  notfoundMessage = ModuleConfig.NotFoundMessage;
  invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
  invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
  invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
  invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;

  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));

  maxlength = 8;
  minlength = 8;

  isLoading = false;

  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  documentTypeList_BR: any = [];

  tableColumns = [
    { name: 'Ramo', value: true, id: 'c1' },
    { name: 'Producto', value: true, id: 'c2' },
    { name: 'Cotización', value: true, id: 'c3' },
    { name: 'Fecha Cotización', value: true, id: 'c4' },
    { name: 'Fecha Aprobación', value: true, id: 'c5' },
    { name: 'Trx Pendiente', value: true, id: 'c6' },
    { name: 'Estado', value: true, id: 'c7' },
    { name: 'Nro Póliza', value: true, id: 'c8' },
    { name: 'Fecha Emisión', value: true, id: 'c9' },
    { name: 'Tipo de documento', value: false, id: 'c10' },
    { name: 'Doc. Contratante', value: true, id: 'c11' },
    { name: 'Contratante', value: true, id: 'c12' },
    { name: 'Tipo de Canal', value: true, id: 'c13' },
    { name: 'Tipo de Documento', value: false, id: 'c14' },
    { name: 'Doc Broker', value: true, id: 'c15' },
    { name: 'Broker', value: false, id: 'c16' },
    { name: 'Prima Mínima', value: false, id: 'c17' },
    { name: 'Planilla', value: true, id: 'c18' },
    { name: 'Prima Neta', value: true, id: 'c19' },
    { name: 'Usuario', value: true, id: 'c20' },
    { name: 'Procedencia', value: false, id: 'c21' },
  ];

  selectAllCheckbox = false;
  searchButtonPressed = false;


  canRenovate: boolean;
  canInclude: boolean;

  flagDate = 1;

  searchModeList: any[] = [{ 'Id': '1', 'Name': 'Nro. de Documento' }, { 'Id': '2', 'Name': 'Nombres' }];
  personTypeList: any[] = [{ 'Id': '1', 'Name': 'Persona Natural' }, { 'Id': '2', 'Name': 'Persona Jurídica' }];
  personTypeList_US: any[] = [{ 'Id': '1', 'Name': 'Persona Natural' }];
  contractorDocumentMaxLength = 0;
  brokerDocumentMaxLength = 0;
  userDocumentMaxLength = 0;
  filter: any = {};
  branch: any;
  isValidatedInClickButton: boolean;
  public foundResults: any = [];
  channelTypeList: any[] = [];
  documentTypeList_US: any[] = [];

  constructor(
    private mainFormBuilder: FormBuilder,
    private clientInformationService: ClientInformationService,
    private billReportService: BillReportService,
    private quotationReportService: QuotationReportService,
    private quotationService: QuotationService,
    private policyErmitService: PolicyemitService,
    private modalService: NgbModal,
    private router: Router,
    private datePipe: DatePipe

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

  /**
   * Crea el formulario
   */
  createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      branch: ['73'],
      product: ['1'],  // Producto
      status: ['0'],  // estado de cotización
      busqueda_cot: ['1'],
      startDate: [ModuleConfig.StartDate, [Validators.required]], // Fecha inferior para búsqueda
      endDate: [ModuleConfig.EndDate, [Validators.required]], // Fecha superior para búsqueda
      quotationNumber: ['', [Validators.maxLength(6), GlobalValidators.onlyNumberValidator]], // Número de póliza
      policy: ['', [Validators.maxLength(11), GlobalValidators.onlyNumberValidator]], // Número de póliza
      trx_pendiente: ['0'],
      type_canal: ['0'],

      contractorSearchMode: ['1'],  // Modo de búsqueda de contratante
      contractorDocumentType: [''],  // Tipo de documento de contratante
      // tslint:disable-next-line:max-line-length
      contractorDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],  // Número de documento de contratante
      contractorPersonType: ['1'], // Tipo de persona de contratante
      // tslint:disable-next-line:max-line-length
      contractorFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  // Nombre de contratante
      // tslint:disable-next-line:max-line-length
      contractorPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], // Apellido paterno de contratante
      // tslint:disable-next-line:max-line-length
      contractorMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  // Apellido materno de contratante
      // tslint:disable-next-line:max-line-length
      contractorLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]],  // Razón social de contratante

      brokerSearchMode: ['1'],  // Modo de búsqueda de contratante
      brokerDocumentType: [''],  // Tipo de documento de contratante
      brokerDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],  // Número de documento de contratante
      brokerPersonType: ['1'], // Tipo de persona de contratante
      brokerFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  // Nombre de broker
      brokerPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], // Apellido paterno de broker
      brokerMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], // Apellido materno de broker
      brokerLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]], // Razón social de broker
      brokerNameExternal: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]], // Razón social de broker

      userSearchMode: ['1'],  // Modo de búsqueda de contratante
      userDocumentType: [''],  // Tipo de documento de contratante
      userDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],  // Número de documento de contratante
      userPersonType: ['1'], // Tipo de persona de contratante
      userFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],  // Nombre de user
      userPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], // Apellido paterno de user
      userMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]], // Apellido materno de user
      userLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]], // Razón social de broker
      inlineRadioOptions: 'option1'
    });
  }
  private initializeForm() {
    this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
  }


  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  async ngOnInit() {
    this.canRenovate = true;
    this.canInclude = true;

    this.bsValueIni = new Date();
    this.bsValueIni.setDate(this.bsValueIni.getDate() - 30);
    this.bsValueFin = new Date();
    this.bsValueIniMax = new Date();
    this.bsValueFinMin = this.bsValueIni;
    this.bsValueFinMax = new Date();

    this.createForm();
    this.initializeForm();
    this.branch = await CommonMethods.branchXproduct(this.codProducto);

    this.getBranchList();
    this.getTransaccionList();
    this.getDocumentTypeList();
    this.getStatusList();
    this.GetChannelTypeAllList();
    this.obtenerDocumentTypeUSList();
    // this.obtenerEstadosPago()
    // this.obtenerEstadosFactura()

  }



  /**
   * Previene ingreso de datos en el campo [número de documento] según el tipo de documento
   * @param event Evento activador, este objeto contiene el valor ingresado
   * @param documentType Tipo de documento seleccionado
   */
  documentNumberKeyPress(event: any, documentType: string) {
    if (documentType == '') { return; }
    CommonMethods.validarNroDocumento(event, documentType);
  }


  /**
  * Obtener lista de estados
  */
  getStatusList() {
    this.quotationReportService.getStatusList('3', this.codProducto).subscribe(
      res => {
        this.statusList = res;
      },
      error => { console.log(error); }
    );
  }

  /**
  *
  */
  cleanValidation() {
    this.isValidatedInClickButton = false;
  }

  /**
  *Método que limpia los campos de Cotización y Póliza
  */
  cleanNumber() {

    this.mainFormGroup.controls.quotationNumber.patchValue('');
    this.mainFormGroup.controls.policy.patchValue('');

    this.quotationNumberChanged(undefined);
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.mainFormGroup.controls.branch.value).subscribe(
      res => {
        this.productList = res
        this.mainFormGroup.controls.product.patchValue(this.productList[0].COD_PRODUCT);
      },
      err => { console.log(err) }
    );
  }

  SelectBranch() {
    this.productList = null;
    // this.desBranchSelected = this.InputsProduct.SDESCRIPT;
    // this.getProductsListByBranch();
    if (this.mainFormGroup.controls.branch.value != null) {
      this.getProductsListByBranch();
    }
  }

  getBranchList() {

    this.clientInformationService.getBranches(this.codProducto, this.epsItem.NCODE).subscribe(
      res => {
        this.branchList = res;
        this.mainFormGroup.controls.branch.patchValue(this.branchList[0].NBRANCH);
        this.getProductsListByBranch();
      },
      err => {
        console.log(err);
      }
    );
  }

  getTransaccionList() {
    this.policyErmitService.getTransactionAllList().subscribe(
      res => {
        res.forEach(element => {
          if (element.NCOD_TRANSAC != '7') { this.transaccionList.push(element); }
        });
      },
      err => {
        console.log(err);
      }
    );
  }

  GetChannelTypeAllList() {
    this.quotationReportService.GetChannelTypeAllList().subscribe(
      res => {
        this.channelTypeList = res;
      },
      err => {
        console.log(err);
      }
    );

  }

  obtenerDocumentTypeUSList() {
    this.quotationReportService.obtenerDocumentType().subscribe(
      res => {
        this.documentTypeList_US = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        if (this.codProducto == 3) {
          this.documentTypeList = res.filter(function (obj) {
            return obj.Id == 1;
          });
          this.documentTypeList_BR = res.filter(function (obj) {
            return obj.Id == 1;
          });
        } else {
          this.documentTypeList = res;
          this.documentTypeList_BR = res;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  openModal() {
    let modalRef: NgbModalRef;

    modalRef = this.modalService.open(BillReportReceiptColumnDialogComponent, { size: 'sm', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.columnas = this.tableColumns;
    modalRef.componentInstance.selectAllCheckbox = this.selectAllCheckbox;
  }

  quotationNumberPressed(event: any) {
    if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
      event.preventDefault();
    }
  }

  /**
   * Limpiar campos y cambiar la propiedad MaxLength de los campos de CONTRATANTE
   */
  contractorDocumentTypeChanged() {
    switch (this.mainFormGroup.controls.contractorDocumentType.value) {
      case '1': { // ruc
        this.contractorDocumentMaxLength = 11;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      case '2': { // dni
        this.contractorDocumentMaxLength = 8;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(7), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      case '4': { // ce
        this.contractorDocumentMaxLength = 12;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      case '6': { // pasaporte
        this.contractorDocumentMaxLength = 12;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
      default: {  // otros tipos de documento
        this.contractorDocumentMaxLength = 15;
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.maxLength(15)]);
        this.mainFormGroup.controls.contractorDocumentNumber.updateValueAndValidity();
        break;
      }
    }
    this.cleanContractorInputs();
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
      case '1': { // ruc
        this.brokerDocumentMaxLength = 11;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      case '2': { // dni
        this.brokerDocumentMaxLength = 8;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(7), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      case '4': { // ce
        this.brokerDocumentMaxLength = 12;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      case '6': { // pasaporte
        this.brokerDocumentMaxLength = 12;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
      default: {  // otros tipos de documento
        this.brokerDocumentMaxLength = 15;
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.maxLength(15)]);
        this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
        break;
      }
    }
    this.cleanBrokerInputs();
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
   * Limpia campos y cambia la propiedad MaxLength del campo Nro de documento del broker
   */
  userDocumentTypeChanged() {
    switch (this.mainFormGroup.controls.userDocumentType.value) {
      case '1': { // ruc
        this.userDocumentMaxLength = 11;
        this.mainFormGroup.controls.userDocumentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.userDocumentNumber.updateValueAndValidity();
        break;
      }
      case '2': { // dni
        this.userDocumentMaxLength = 8;
        this.mainFormGroup.controls.userDocumentNumber.setValidators([Validators.minLength(7), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.userDocumentNumber.updateValueAndValidity();
        break;
      }
      case '4': { // ce
        this.userDocumentMaxLength = 12;
        this.mainFormGroup.controls.userDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.userDocumentNumber.updateValueAndValidity();
        break;
      }
      case '6': { // pasaporte
        this.userDocumentMaxLength = 12;
        this.mainFormGroup.controls.userDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.userDocumentNumber.updateValueAndValidity();
        break;
      }
      default: {  // otros tipos de documento
        this.userDocumentMaxLength = 15;
        this.mainFormGroup.controls.userDocumentNumber.setValidators([Validators.maxLength(15)]);
        this.mainFormGroup.controls.userDocumentNumber.updateValueAndValidity();
        break;
      }
    }
    this.cleanUserInputs();
  }

  /**
   * Limpia campos de broker
   */
  cleanUserInputs() {
    this.mainFormGroup.controls.userDocumentNumber.patchValue('');
    this.mainFormGroup.controls.userFirstName.patchValue('');
    this.mainFormGroup.controls.userPaternalLastName.patchValue('');
    this.mainFormGroup.controls.userMaternalLastName.patchValue('');
    this.mainFormGroup.controls.userLegalName.patchValue('');
  }

  chooseDateClk(flag: number = 0) {
    switch (flag) {
      case 1:
        this.flagDate = flag;
        break;
      case 2:
        this.flagDate = flag;
        break;
      case 3:
        this.flagDate = flag;
        break;
    }
  }

  buscarPoliza(excel: number = null) {

    if (this.mainFormGroup.controls.quotationNumber.value > 0) {
      this.mainFormGroup.controls.quotationNumber.setValue(this.mainFormGroup.controls.quotationNumber.value.replace(/\s/g, ''));
    }
    if (excel != 1) {
      this.isValidatedInClickButton = true;
      this.listToShow = [];
      this.foundResults = [];
    }
    if (this.mainFormGroup.valid) {
      // Preparación de datos
      this.filter.nbranch = this.mainFormGroup.controls.branch.value;
      this.filter.nProduct = this.mainFormGroup.controls.product.value;
      this.filter.nState = this.mainFormGroup.controls.status.value;
      this.filter.startDate = this.mainFormGroup.controls.startDate.value;
      this.filter.endDate = this.mainFormGroup.controls.endDate.value;
      this.filter.nQuotation = this.mainFormGroup.controls.quotationNumber.value;
      this.filter.nPolicy = this.mainFormGroup.controls.policy.value;
      this.filter.trxPendiente = this.mainFormGroup.controls.trx_pendiente.value;
      this.filter.typeCanal = this.mainFormGroup.controls.type_canal.value;
      this.filter.flagDate = this.flagDate;

      // this.filter.ContractorSearchMode = this.mainFormGroup.controls.contractorSearchMode.value;

      if (this.mainFormGroup.controls.contractorSearchMode.value == '1') {
        this.filter.nIdDocType = this.mainFormGroup.controls.contractorDocumentType.value != '' ? this.mainFormGroup.controls.contractorDocumentType.value : 0;
        this.filter.sDoc = this.mainFormGroup.controls.contractorDocumentNumber.value;
        this.filter.SLASTNAME = '';
        this.filter.SLASTNAME2 = '';
        this.filter.SFIRSTNAME = '';
        this.filter.SLEGALNAME = '';
      } else if (this.mainFormGroup.controls.contractorSearchMode.value == '2' && this.mainFormGroup.controls.contractorPersonType.value == '1') {
        this.filter.nIdDocType = 0;
        this.filter.sDoc = '';
        this.filter.SLASTNAME = this.mainFormGroup.controls.contractorPaternalLastName.value;
        this.filter.SLASTNAME2 = this.mainFormGroup.controls.contractorMaternalLastName.value;
        this.filter.SFIRSTNAME = this.mainFormGroup.controls.contractorFirstName.value;
        this.filter.SLEGALNAME = '';
      } else if (this.mainFormGroup.controls.contractorSearchMode.value == '2' && this.mainFormGroup.controls.contractorPersonType.value == '2') {
        this.filter.nIdDocType = 0;
        this.filter.sDoc = '';
        this.filter.SLASTNAME = '';
        this.filter.SLASTNAME2 = '';
        this.filter.SFIRSTNAME = '';
        this.filter.SLEGALNAME = this.mainFormGroup.controls.contractorLegalName.value;
      } else {
        this.filter.nIdDocType = 0;
        this.filter.sDoc = '';
        this.filter.SLASTNAME = '';
        this.filter.SLASTNAME2 = '';
        this.filter.SFIRSTNAME = '';
        this.filter.SLEGALNAME = '';
      }

      // this.filter.BrokerSearchMode = this.mainFormGroup.controls.brokerSearchMode.value;

      if (this.mainFormGroup.controls.brokerSearchMode.value == '1') {
        this.filter.nIdDocType_BR = this.mainFormGroup.controls.brokerDocumentType.value != '' ? this.mainFormGroup.controls.brokerDocumentType.value : 0;
        this.filter.sDoc_BR = this.mainFormGroup.controls.brokerDocumentNumber.value;
        this.filter.SLASTNAME_BR = '';
        this.filter.SLASTNAME2_BR = '';
        this.filter.SFIRSTNAME_BR = '';
        this.filter.SLEGALNAME_BR = '';
      } else if (this.mainFormGroup.controls.brokerSearchMode.value == '2' && this.mainFormGroup.controls.brokerPersonType.value == '1') {
        this.filter.nIdDocType_BR = 0;
        this.filter.sDoc_BR = '';
        this.filter.SLASTNAME_BR = this.mainFormGroup.controls.brokerPaternalLastName.value;
        this.filter.SLASTNAME2_BR = this.mainFormGroup.controls.brokerMaternalLastName.value;
        this.filter.SFIRSTNAME_BR = this.mainFormGroup.controls.brokerFirstName.value;
        this.filter.SLEGALNAME_BR = '';
      } else if (this.mainFormGroup.controls.brokerSearchMode.value == '2' && this.mainFormGroup.controls.brokerPersonType.value == '2') {
        this.filter.nIdDocType_BR = 0;
        this.filter.sDoc_BR = '';
        this.filter.SLASTNAME_BR = '';
        this.filter.SLASTNAME2_BR = '';
        this.filter.SFIRSTNAME_BR = '';
        this.filter.SLEGALNAME_BR = this.mainFormGroup.controls.brokerLegalName.value;
      } else {
        this.filter.nIdDocType_BR = 0;
        this.filter.sDoc_BR = '';
        this.filter.SLASTNAME_BR = '';
        this.filter.SLASTNAME2_BR = '';
        this.filter.SFIRSTNAME_BR = '';
        this.filter.SLEGALNAME_BR = '';
      }

      // this.filter.UserSearchMode = this.mainFormGroup.controls.userDocumentType.value;

      if (this.mainFormGroup.controls.userSearchMode.value == '1') {
        this.filter.nIdDocType_US = this.mainFormGroup.controls.userDocumentType.value != '' ? this.mainFormGroup.controls.userDocumentType.value : 0;
        this.filter.sDoc_US = this.mainFormGroup.controls.userDocumentNumber.value;
        this.filter.SLASTNAME_US = '';
        this.filter.SLASTNAME2_US = '';
        this.filter.SFIRSTNAME_US = '';
        this.filter.SLEGALNAME_US = '';
      } else if (this.mainFormGroup.controls.userSearchMode.value == '2' && this.mainFormGroup.controls.userPersonType.value == '1') {
        this.filter.nIdDocType_US = 0;
        this.filter.sDoc_US = '';
        this.filter.SLASTNAME_US = this.mainFormGroup.controls.userPaternalLastName.value;
        this.filter.SLASTNAME2_US = this.mainFormGroup.controls.userMaternalLastName.value;
        this.filter.SFIRSTNAME_US = this.mainFormGroup.controls.userFirstName.value;
        this.filter.SLEGALNAME_US = '';
      } else if (this.mainFormGroup.controls.userSearchMode.value == '2' && this.mainFormGroup.controls.userPersonType.value == '2') {
        this.filter.nIdDocType_US = 0;
        this.filter.sDoc_US = '';
        this.filter.SLASTNAME_US = '';
        this.filter.SLASTNAME2_US = '';
        this.filter.SFIRSTNAME_US = '';
        this.filter.SLEGALNAME_US = this.mainFormGroup.controls.userLegalName.value;
      } else {
        this.filter.nIdDocType_US = 0;
        this.filter.sDoc_US = '';
        this.filter.SLASTNAME_US = '';
        this.filter.SLASTNAME2_US = '';
        this.filter.SFIRSTNAME_US = '';
        this.filter.SLEGALNAME_US = '';
      }

      // if (this.mainFormGroup.controls.contractorDocumentNumber.value.toString().trim() == '' && this.mainFormGroup.controls.contractorSearchMode.value == '1') {
      //   this.filter.ContractorSearchMode = '3';
      // }
      // if (this.mainFormGroup.controls.brokerDocumentNumber.value.toString().trim() == '' && this.mainFormGroup.controls.brokerSearchMode.value == '1') {
      //   this.filter.BrokerSearchMode = '3';
      // }
      // if (this.mainFormGroup.controls.userDocumentNumberR.value.toString().trim() == '' && this.mainFormGroup.controls.userSearchMode.value == '1') {
      //   this.filter.UserSearchMode = '3';
      // }

      // this.filter.CompanyLNK = this.epsItem.NCODE;
      // this.filter.Nbranch = this.branch;

      if (excel == 1) {
        this.excel();
      } else {
        this.search();
      }
    } else {
      this.identifyAndShowErrors();
    }
  }

  /**
  * extrae los datos que provee el servicio
  */
  search() {
    this.isLoading = true;
    this.quotationReportService.obtenerReporteDeCotizaciones(this.filter).subscribe(
      res => {

        this.foundResults = res.lista;
        if (this.foundResults != null && this.foundResults.length > 0) {
          this.totalItems = this.foundResults.length;
          this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        } else {
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

  excel() {
    this.isLoading = true;
    try {
      this.quotationReportService.obtenerReporteDeCotizacionesExcel(this.filter).subscribe(res => {
        this.isLoading = false;
        if (res == '') {
          Swal.fire('Información', 'Error al descargar Excel o no se encontraron resultados', 'error');
        } else {
          const blob = this.b64toBlob(res);
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = 'Reporte de Cotizaciones.xlsx'
          a.click()
        };
      });
    } catch (error) {
      this.isLoading = false;
      Swal.fire('Información', 'Error al descargar Excel', 'error');
    }
  }

  identifyAndShowErrors() {
    const error = [];
    if (this.mainFormGroup.controls.product.valid === false) { error.push('El producto no es válido.'); }
    if (this.mainFormGroup.controls.status.valid === false) { error.push('El estado no es válido.'); }
    if (this.mainFormGroup.controls.quotationNumber.valid === false) { error.push('El número de cotización no es válido.'); }
    if (this.mainFormGroup.controls.policy.valid === false) { error.push('El número de póliza no es válido.'); }

    if (this.mainFormGroup.controls.contractorDocumentNumber.valid === false) { error.push('El número de documento del contratante no es válido.'); }
    if (this.mainFormGroup.controls.contractorFirstName.valid === false) { error.push('El nombre del contratante no es válido.'); }
    if (this.mainFormGroup.controls.contractorPaternalLastName.valid === false) { error.push('El apellido paterno del contratante no es válido.'); }
    if (this.mainFormGroup.controls.contractorMaternalLastName.valid === false) { error.push('El apellido materno del contratante no es válido.'); }

    if (this.mainFormGroup.controls.brokerDocumentNumber.valid === false) { error.push('El número de documento del broker no es válido.'); }
    if (this.mainFormGroup.controls.brokerFirstName.valid === false) { error.push('El nombre del broker no es válido.'); }
    if (this.mainFormGroup.controls.brokerPaternalLastName.valid === false) { error.push('El apellido del broker paterno no es válido.'); }
    if (this.mainFormGroup.controls.brokerMaternalLastName.valid === false) { error.push('El apellido del broker materno no es válido.'); }

    if (this.mainFormGroup.controls.userDocumentNumber.valid === false) { error.push('El número de documento del usuario no es válido.'); }
    if (this.mainFormGroup.controls.userFirstName.valid === false) { error.push('El nombre del usuaio no es válido.'); }
    if (this.mainFormGroup.controls.userPaternalLastName.valid === false) { error.push('El apellido paterno del usuario no es válido.'); }
    if (this.mainFormGroup.controls.userMaternalLastName.valid === false) { error.push('El apellido materno del usuario no es válido.'); }

    if (this.mainFormGroup.controls.startDate.valid && this.mainFormGroup.controls.endDate.valid) {
      if (this.mainFormGroup.hasError('datesNotSortedCorrectly')) { error.push(ModuleConfig.InvalidStartDateOrderMessage); }
    } else {
      if (this.mainFormGroup.controls.startDate.valid === false) {
        if (this.mainFormGroup.controls.startDate.hasError('required')) { error.push('La fecha de inicio es requerida.'); } else { error.push(ModuleConfig.InvalidStartDateMessage); }
      }
      if (this.mainFormGroup.controls.endDate.valid === false) {
        if (this.mainFormGroup.controls.endDate.hasError('required')) { error.push('La fecha de fin es requerida.'); } else { error.push(ModuleConfig.InvalidEndDateMessage); }
      }
    }

    Swal.fire('Información', this.listToString(error), 'error');
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
        output = output + item + ' <br>';
      });
    }
    return output;
  }

  /**
   * Bloquea los otros campos cuando el campo de número de cotización no está vacío; en caso contrario, los desbloquea
   */
  quotationNumberChanged(event: any) {
    const quotationNum = this.mainFormGroup.controls.quotationNumber.value;
    const policyNum = this.mainFormGroup.controls.policy.value;

    if ((quotationNum != null && quotationNum !== '') || (policyNum != null && policyNum !== '')) {
      this.mainFormGroup.controls.branch.disable();
      this.mainFormGroup.controls.product.disable();
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.trx_pendiente.disable();
      this.mainFormGroup.controls.type_canal.disable();
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

      this.mainFormGroup.controls.userSearchMode.disable();
      this.mainFormGroup.controls.userPersonType.disable();
      this.mainFormGroup.controls.userDocumentType.disable();
      this.mainFormGroup.controls.userDocumentNumber.disable();
      this.mainFormGroup.controls.userPaternalLastName.disable();
      this.mainFormGroup.controls.userMaternalLastName.disable();
      this.mainFormGroup.controls.userFirstName.disable();
      this.mainFormGroup.controls.userLegalName.disable();

      this.mainFormGroup.setValidators(null);

    } else {
      this.mainFormGroup.controls.branch.enable();
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.status.enable();
      this.mainFormGroup.controls.trx_pendiente.enable();
      this.mainFormGroup.controls.type_canal.enable();
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

      this.mainFormGroup.controls.userSearchMode.enable();
      this.mainFormGroup.controls.userPersonType.enable();
      this.mainFormGroup.controls.userDocumentType.enable();
      this.mainFormGroup.controls.userDocumentNumber.enable();
      this.mainFormGroup.controls.userPaternalLastName.enable();
      this.mainFormGroup.controls.userMaternalLastName.enable();
      this.mainFormGroup.controls.userFirstName.enable();
      this.mainFormGroup.controls.userLegalName.enable();
      this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    }
    this.mainFormGroup.updateValueAndValidity();
  }

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text');
    if (!isNumeric(pastedText)) {
      event.preventDefault();
    } else {
      if (pastedText != null && pastedText.toString().trim() !== '') {
        this.mainFormGroup.controls.branch.disable();
        this.mainFormGroup.controls.product.disable();
        this.mainFormGroup.controls.status.disable();
        this.mainFormGroup.controls.trx_pendiente.disable();
        this.mainFormGroup.controls.type_canal.disable();
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

        this.mainFormGroup.controls.userSearchMode.disable();
        this.mainFormGroup.controls.userPersonType.disable();
        this.mainFormGroup.controls.userDocumentType.disable();
        this.mainFormGroup.controls.userDocumentNumber.disable();
        this.mainFormGroup.controls.userPaternalLastName.disable();
        this.mainFormGroup.controls.userMaternalLastName.disable();
        this.mainFormGroup.controls.userFirstName.disable();
        this.mainFormGroup.controls.userLegalName.disable();

        this.mainFormGroup.setValidators(null);
      }
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

  resetForm() {
    this.mainFormGroup.controls.branch.patchValue('73');
    this.mainFormGroup.controls.product.patchValue('1');
    this.mainFormGroup.controls.status.patchValue('0');
    this.mainFormGroup.controls.busqueda_cot.patchValue('1');
    this.mainFormGroup.controls.startDate.patchValue(ModuleConfig.StartDate);
    this.mainFormGroup.controls.endDate.patchValue(ModuleConfig.EndDate);
    this.mainFormGroup.controls.quotationNumber.patchValue('');
    this.mainFormGroup.controls.policy.patchValue('');
    this.mainFormGroup.controls.trx_pendiente.patchValue('0');
    this.mainFormGroup.controls.type_canal.patchValue('0');
    this.mainFormGroup.controls.inlineRadioOptions.patchValue('option1');
    this.flagDate = 1;

    this.mainFormGroup.controls.contractorSearchMode.patchValue('1');
    this.mainFormGroup.controls.contractorPersonType.patchValue('1');
    this.mainFormGroup.controls.contractorDocumentType.patchValue('');
    this.mainFormGroup.controls.contractorDocumentNumber.patchValue('');
    this.mainFormGroup.controls.contractorPaternalLastName.patchValue('');
    this.mainFormGroup.controls.contractorMaternalLastName.patchValue('');
    this.mainFormGroup.controls.contractorFirstName.patchValue('');
    this.mainFormGroup.controls.contractorLegalName.patchValue('');

    this.mainFormGroup.controls.brokerSearchMode.patchValue('1');
    this.mainFormGroup.controls.brokerPersonType.patchValue('1');
    this.mainFormGroup.controls.brokerDocumentType.patchValue('');
    this.mainFormGroup.controls.brokerDocumentNumber.patchValue('');
    this.mainFormGroup.controls.brokerPaternalLastName.patchValue('');
    this.mainFormGroup.controls.brokerMaternalLastName.patchValue('');
    this.mainFormGroup.controls.brokerFirstName.patchValue('');
    this.mainFormGroup.controls.brokerLegalName.patchValue('');

    this.mainFormGroup.controls.userSearchMode.patchValue('1');
    this.mainFormGroup.controls.userPersonType.patchValue('1');
    this.mainFormGroup.controls.userDocumentType.patchValue('');
    this.mainFormGroup.controls.userDocumentNumber.patchValue('');
    this.mainFormGroup.controls.userPaternalLastName.patchValue('');
    this.mainFormGroup.controls.userMaternalLastName.patchValue('');
    this.mainFormGroup.controls.userFirstName.patchValue('');
    this.mainFormGroup.controls.userLegalName.patchValue('');

    this.foundResults = [];
    this.currentPage = 1; // página actual
    this.rotate = true; // maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    this.itemsPerPage = 5; // limite de items por página
    this.totalItems = 0; // total de items encontrados

    this.quotationNumberChanged(undefined);
  }


  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  valInicio(event) {
    this.bsValueFinMin = new Date(this.bsValueIni);

  }
  valFin(event) {
    this.bsValueIniMax = new Date(this.bsValueFin);
  }


}

