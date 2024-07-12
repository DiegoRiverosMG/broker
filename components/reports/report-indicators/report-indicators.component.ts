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
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';
import { PolicyMovementDetailsAllComponent } from '../../policy-all/policy-movement-details-all/policy-movement-details-all.component';
import { BillReportReceiptColumnDialogComponent } from '../bill-report-receipt-column-dialog/bill-report-receipt-column-dialog.component';
import { QuotationReportService } from '../../../services/report/quotation-report.service';
import { QuotationService } from '../../../services/quotation/quotation.service';

import { ReportIndicatorsService } from '../../../services/report/report-indicators.service';

import { GlobalValidators } from './../../global-validators';
import { isNumeric } from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-report-indicators',
  templateUrl: './report-indicators.component.html',
  styleUrls: ['./report-indicators.component.css']
})
export class ReportIndicatorsComponent implements OnInit {

  @ViewChild('desde', null) desde: any;
  @ViewChild('hasta', null) hasta: any;
  userType: number = 1; // 1: admin, 2:emisor, 3:comercial, 4:tecnico, 5:cobranza
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
  usersList: any = [];

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

  canRenovate: boolean;
  canInclude: boolean;

  flagDate = 1;

  typeReportList: any[] = [{ 'Id': '1', 'Name': 'Tramites Pendientes' },
  { 'Id': '2', 'Name': 'Productividad' },
  { 'Id': '3', 'Name': 'Tiempo Total de Atencion' },
  { 'Id': '4', 'Name': 'Tipo de Tramite' }];

  userList: any[] = [{ 'Id': '1', 'Name': 'Nro. de Documento' }, { 'Id': '2', 'Name': 'Nombres' }];
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
  // documentTypeList_US: any[] = [];
  requestTypeList: any[] = [];
  cutList: any[] = [{ 'Id': '1', 'Name': '09:00 AM' }, 
                    { 'Id': '2', 'Name': '12:00 PM' }, 
  { 'Id': '3', 'Name': '06:00 PM' }];
  busquedaPorList: any[] = [{ 'Id': '1', 'Name': 'Nro. trámite' }, 
                            { 'Id': '2', 'Name': 'Nro. Cotización' }, 
  { 'Id': '3', 'Name': 'Nro. póliza' }];
  billList: any[] = [{ 'Id': '1', 'Name': 'Gobierno' }, 
  { 'Id': '2', 'Name': 'Privado' }];
  flagDateT = 0;
  flagDateBool = 1;

  constructor(
    private mainFormBuilder: FormBuilder,
    private clientInformationService: ClientInformationService,
    private quotationService: QuotationService,
    private quotationReportService: QuotationReportService,
    private reportIndicatorsService: ReportIndicatorsService,
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
      type_report: ['3'], // Tipo de Reporte
      cut: ['0'], // Corte
      busqueda_por: ['1'], // Busqueda por numero: 1 = tramite, 2 cotizacion, 3 = poliza
      procedureNumber: ['', [Validators.maxLength(10), GlobalValidators.onlyNumberValidator]], // Número de tramite
      quotationNumber: ['', [Validators.maxLength(10), GlobalValidators.onlyNumberValidator]], // Número de cotizacion
      policy: ['', [Validators.maxLength(10), GlobalValidators.onlyNumberValidator]], // Número de póliza
      status: ['0'],  // estado de cotización
      type_bill: ['0'], // Tipo de Cuenta
      type_request: ['0'], // Tipo de Solicitud
      user: ['0'],  // Usuario
      inlineRadioOptions: 'option1', // Fecha Operacion
      startDate: [ModuleConfig.StartDate, [Validators.required]], // Fecha inferior para búsqueda
      endDate: [ModuleConfig.EndDate, [Validators.required]] // Fecha superior para búsqueda
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
    this.typeReportChanged(undefined);
    this.branch = await CommonMethods.branchXproduct(this.codProducto);

    this.getBranchList();
    this.getTransaccionList();
    this.getStatusList();
    this.getUsersList();
  }

  procedureNumberPressed(event: any) {
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

  NumberChanged(event: any) {
    const procedure = this.mainFormGroup.controls.procedureNumber.value;
    const quotation = this.mainFormGroup.controls.quotationNumber.value;
    const policy = this.mainFormGroup.controls.policy.value;

    if ((procedure != null && procedure != '') || (quotation != null && quotation != '') || (policy != null && policy != '')) {
      this.mainFormGroup.controls.type_report.disable();
      this.mainFormGroup.controls.cut.disable();
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.type_bill.disable();
      this.mainFormGroup.controls.type_request.disable();
      this.mainFormGroup.controls.user.disable();
      this.flagDateT = 1;
      this.flagDateBool = 0;

      this.mainFormGroup.setValidators(null);

    } else {
      this.typeReportChanged(undefined);
    }
    this.mainFormGroup.updateValueAndValidity();
  }

  changeBusqueda() {
    this.mainFormGroup.controls.procedureNumber.patchValue('');
    this.mainFormGroup.controls.quotationNumber.patchValue('');
    this.mainFormGroup.controls.policy.patchValue('');
    this.NumberChanged(undefined);
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
    this.reportIndicatorsService.getProcedureStatusList().subscribe(
      res => {
        this.statusList = res;
      },
      error => { console.log(error); }
    );
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.mainFormGroup.controls.branch.value).subscribe(
      res => {
        this.productList = res
        this.mainFormGroup.controls.product.patchValue(this.productList[0].COD_PRODUCT);
      },
      err => { console.log(err); }
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
    this.reportIndicatorsService.GetRequestAllList().subscribe(
      res => {
        this.requestTypeList = res;
      },
      error => { console.log(error); }
    );
  }

  getUsersList() {
    this.reportIndicatorsService.getUsersList(this.codProducto == 3 ? 1 : this.codProducto, this.mainFormGroup.controls.branch.value).subscribe(
      res => {
        this.usersList = res;
      },
      err => { console.log(err); }
    );
  }

  // obtenerDocumentTypeUSList() {
  //   this.quotationReportService.obtenerDocumentType().subscribe(
  //     res => {
  //       this.documentTypeList_US = res;
  //     },
  //     err => {
  //       console.log(err);
  //     }
  //   );
  // }

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
      case 4:
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
      this.filter.nTypeReport = this.mainFormGroup.controls.type_report.value;
      this.filter.nCut = this.mainFormGroup.controls.cut.value;
      this.filter.nProcedure = this.mainFormGroup.controls.procedureNumber.value;
      this.filter.nQuotation = this.mainFormGroup.controls.quotationNumber.value;
      this.filter.nPolicy = this.mainFormGroup.controls.policy.value;
      this.filter.nState = this.mainFormGroup.controls.status.value;
      this.filter.nTypeBill = this.mainFormGroup.controls.type_bill.value;
      this.filter.nTypeRequest = this.mainFormGroup.controls.type_request.value;
      this.filter.nUserCode = this.mainFormGroup.controls.user.value;
      this.filter.flagDate = this.flagDate;
      this.filter.startDate = this.mainFormGroup.controls.startDate.value;
      this.filter.endDate = this.mainFormGroup.controls.endDate.value;


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
    this.reportIndicatorsService.obtenerReporteDeTramites(this.filter).subscribe(
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
      this.reportIndicatorsService.obtenerReporteDeTramitesExcel(this.filter).subscribe(res => {
        this.isLoading = false;
        const typeRep = this.filter.nTypeReport;
        if (res == '') {
          Swal.fire('Información', 'Error al descargar Excel o no se encontraron resultados', 'error');
        } else {
          const blob = this.b64toBlob(res);
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          if (typeRep == 1) { a.download = 'Reporte de Trámites Pendientes.xlsx'; }
          if (typeRep == 2) { a.download = 'Reporte de Productividad.xlsx'; }
          if (typeRep == 3) { a.download = 'Reporte de Tiempo Total.xlsx'; }
          if (typeRep == 4) { a.download = 'Reporte de Tipos Trámites.xlsx'; }
          a.click();
        }
      });
    } catch (error) {
      this.isLoading = false;
      Swal.fire('Información', 'Error al descargar Excel', 'error');
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

  /**
  *
  */
  cleanValidation() {
    this.isValidatedInClickButton = false;
  }

  resetForm() {
    this.mainFormGroup.controls.branch.patchValue('73');
    this.mainFormGroup.controls.product.patchValue('1');
    this.mainFormGroup.controls.type_report.patchValue('3');
    this.mainFormGroup.controls.cut.patchValue('0');
    this.mainFormGroup.controls.busqueda_por.patchValue('1');
    this.mainFormGroup.controls.procedureNumber.patchValue('');
    this.mainFormGroup.controls.quotationNumber.patchValue('');
    this.mainFormGroup.controls.policy.patchValue('');
    this.mainFormGroup.controls.status.patchValue('0');

    this.mainFormGroup.controls.type_bill.patchValue('0');
    this.mainFormGroup.controls.type_request.patchValue('0');
    this.mainFormGroup.controls.startDate.patchValue(ModuleConfig.StartDate);
    this.mainFormGroup.controls.endDate.patchValue(ModuleConfig.EndDate);
    this.mainFormGroup.controls.inlineRadioOptions.patchValue('option1');
    this.flagDate = 1;

    // this.mainFormGroup.controls.contractorSearchMode.patchValue('1');

    this.foundResults = [];
    this.currentPage = 1; // página actual
    this.rotate = true; // maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    this.itemsPerPage = 5; // limite de items por página
    this.totalItems = 0; // total de items encontrados

    this.typeReportChanged(undefined);
  }

  /**
   * Bloquea los otros campos cuando el campo de número de cotización no está vacío; en caso contrario, los desbloquea
   */
  typeReportChanged(event: any) {
    debugger;
    const typeReport = Number(this.mainFormGroup.controls.type_report.value);

    if (typeReport === 1) {
      this.mainFormGroup.controls.cut.enable();
      this.mainFormGroup.controls.type_report.enable();
      this.mainFormGroup.controls.busqueda_por.disable();
      this.mainFormGroup.controls.procedureNumber.disable();
      this.mainFormGroup.controls.cut.patchValue('1');
      this.mainFormGroup.controls.status.patchValue('0');
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.type_bill.disable();
      this.mainFormGroup.controls.type_request.disable();
      this.mainFormGroup.controls.user.patchValue('0');
      this.flagDateT = 0;
      this.flagDateBool = 0;

      this.mainFormGroup.setValidators(null);

    } else if (typeReport === 2) {
      this.mainFormGroup.controls.cut.disable();
      this.mainFormGroup.controls.type_report.enable();
      this.mainFormGroup.controls.busqueda_por.disable();
      this.mainFormGroup.controls.procedureNumber.disable();
      this.mainFormGroup.controls.cut.patchValue('0');
      this.mainFormGroup.controls.status.patchValue('0');
      this.mainFormGroup.controls.status.disable();
      this.mainFormGroup.controls.type_bill.disable();
      this.mainFormGroup.controls.type_request.disable();
      this.mainFormGroup.controls.user.patchValue('0');
      this.flagDateT = 1;
      this.flagDateBool = 0;

      this.mainFormGroup.setValidators(null);

    } else if (typeReport === 3) {
      this.mainFormGroup.controls.cut.disable();
      this.mainFormGroup.controls.branch.enable();
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.busqueda_por.enable();
      this.mainFormGroup.controls.procedureNumber.enable();
      this.mainFormGroup.controls.cut.patchValue('0');
      this.mainFormGroup.controls.status.patchValue('0');
      this.mainFormGroup.controls.status.enable();
      this.mainFormGroup.controls.type_report.enable();
      this.mainFormGroup.controls.type_bill.enable();
      this.mainFormGroup.controls.type_request.enable();
      this.mainFormGroup.controls.user.enable();
      this.mainFormGroup.controls.startDate.enable();
      this.mainFormGroup.controls.endDate.enable();
      this.mainFormGroup.controls.user.patchValue('0');
      this.flagDateT = 1;
      this.flagDateBool = 1;

      this.mainFormGroup.setValidators(null);

    } else if (typeReport === 4) {
      this.mainFormGroup.controls.cut.disable();
      this.mainFormGroup.controls.type_report.enable();
      this.mainFormGroup.controls.branch.enable();
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.busqueda_por.disable();
      this.mainFormGroup.controls.procedureNumber.disable();
      this.mainFormGroup.controls.cut.patchValue('0');
      this.mainFormGroup.controls.status.patchValue('0');
      this.mainFormGroup.controls.status.enable();
      this.mainFormGroup.controls.type_bill.disable();
      this.mainFormGroup.controls.type_request.enable();
      this.mainFormGroup.controls.startDate.enable();
      this.mainFormGroup.controls.endDate.enable();
      this.mainFormGroup.controls.user.patchValue('0');
      this.flagDateT = 1;
      this.flagDateBool = 0;

      this.mainFormGroup.setValidators(null);

    }
    this.mainFormGroup.updateValueAndValidity();
  }

}
