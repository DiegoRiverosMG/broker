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
import { PolicyMovementDetailsAllComponent } from '../policy-movement-details-all/policy-movement-details-all.component';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';
import { TransactService } from '../../../services/transact/transact.service';

import { GlobalValidators } from './../../global-validators';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';

@Component({
  selector: 'app-policy-transactions-all',
  templateUrl: './policy-transactions-all.component.html',
  styleUrls: ['./policy-transactions-all.component.css']
})
export class PolicyTransactionsAllComponent implements OnInit {
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;
  userType = 1; // 1: admin, 2:emisor, 3:comercial, 4:tecnico, 5:cobranza
  bsConfig: Partial<BsDatepickerConfig>;

  mainFormGroup: FormGroup;

  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueIniMax: Date = new Date();
  bsValueFinMin: Date = new Date();
  bsValueFinMax: Date = new Date();

  branchList: any = [];
  productList: any = [];
  transaccionList: any = [];
  policyList: any = [];
  documentTypeList: any = [];
  InputsSearch: any = {};
  listToShow: any[] = [];

  maxlength = 8;
  minlength = 8;

  stateSearch = false;
  stateSearchPolicy = false;
  stateSearchNroPolicy = false;
  blockSearch = true;
  blockDoc = true;
  isLoading = false;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  selectedPolicy: string;

  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  canRenovate: boolean;
  canInclude: boolean;
  canExclude: boolean;
  canEndoso: boolean;
  profile: any;
  externalProfile: '';
  vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));

  canBroker: boolean;
  genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico
  notfoundMessage = ModuleConfig.NotFoundMessage;

  searchModeList: any[] = [{ 'Id': '1', 'Name': 'Por Nro. de Documento' }, { 'Id': '2', 'Name': 'Nombres' }];
  personTypeList: any[] = [{ 'Id': '1', 'Name': 'Persona Natural' }, { 'Id': '2', 'Name': 'Persona Jurídica' }];

  contractorDocumentMaxLength = 0;
  brokerDocumentMaxLength = 0;
  isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.
  filter: any = {};
  public foundResults: any = [];
  resProfileOpe: any[] = [];
  isProfileOpe = 0;
  canCertificate: boolean;

  constructor(
    private mainFormBuilder: FormBuilder,
    private clientInformationService: ClientInformationService,
    private policyErmitService: PolicyemitService,
    private modalService: NgbModal,
    private router: Router,
    private datePipe: DatePipe,
    private transactService: TransactService,
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


  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  async ngOnInit() {
    this.createForm();
    this.initializeForm();
    this.profile = await this.getProfileProduct(); // 20230325
    this.canRenovate = true;
    this.canInclude = true;
    this.canExclude = Number(this.profile) === 8 || Number(this.profile) === 137 ? false : true;
    this.canEndoso = Number(this.profile) === 134 ? false : true;
    this.canBroker = Number(this.profile) === 164 || Number(this.profile) === 134 ? false : true;
    this.canCertificate = Number(this.profile) === 164 || Number(this.profile) === 134 ? false : true; // Tramite Estado -VL
    this.InputsSearch.NTYPE_HIST = '0';
    this.InputsSearch.NBRANCH = '0';

    this.InputsSearch.NPRODUCT = '0';
    this.InputsSearch.P_NIDTRANSACCION = '0';
    this.InputsSearch.NPOLICY = '';

    this.InputsSearch.NIDDOC_TYPE = '-1';
    this.InputsSearch.SIDDOC = '';
    this.InputsSearch.P_PERSON_TYPE = '1';
    this.InputsSearch.P_TYPE_SEARCH = '1';
    this.InputsSearch.SFIRSTNAME = '';
    this.InputsSearch.SLEGALNAME = '';
    this.InputsSearch.SLASTNAME = '';
    this.InputsSearch.SLASTNAME2 = '';

    this.bsValueIni = new Date();
    this.bsValueIni.setDate(this.bsValueIni.getDate() - 30);
    this.bsValueFin = new Date();
    this.bsValueIniMax = new Date();
    this.bsValueFinMin = this.bsValueIni;
    this.bsValueFinMax = new Date();    

    this.getBranchList();
    this.getTransaccionList();
    this.getDocumentTypeList();
    if (Number(this.codProducto) === 3) {
      this.selectVidaLey();
    }
    await this.getPerfilTramiteOpe();
    //this.isProfileOpe = this.resProfileOpe[0].P_NFLAG_PERFIL;
    // console.log(this.isProfileOpe);

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
    dataQuotation.P_NPERFIL = await this.getProfileProduct(); // 20230325
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
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      typeTransac: ['0'],
      branch: ['73'],
      product: ['1'],  //Producto
      status: [''],  //estado de cotización
      startDate: [ModuleConfig.StartDate, [Validators.required]], //Fecha inferior para búsqueda
      endDate: [ModuleConfig.EndDate, [Validators.required]], //Fecha superior para búsqueda
      policy: ['', [Validators.maxLength(11), GlobalValidators.onlyNumberValidator]], //Número de póliza

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
      brokerLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]] //Razón social de broker
    });
  }
  private initializeForm() {
    this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
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
        this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(7), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
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
        this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(7), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
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
  *
  */
  cleanValidation() {
    this.isValidatedInClickButton = false;
  }

  /**
   * Identifica y muestra los errores
   */
  identifyAndShowErrors() {
    let error = [];
    if (this.mainFormGroup.controls.product.valid == false) error.push('El producto no es válido.');
    if (this.mainFormGroup.controls.status.valid == false) error.push('El estado no es válido.');
    if (this.mainFormGroup.controls.policy.valid == false) error.push('El número de póliza no es válido.');

    if (this.mainFormGroup.controls.contractorDocumentNumber.valid == false) error.push('El número de documento del contratante no es válido.');
    if (this.mainFormGroup.controls.contractorFirstName.valid == false) error.push('El nombre del contratante no es válido.');
    if (this.mainFormGroup.controls.contractorPaternalLastName.valid == false) error.push('El apellido paterno del contratante no es válido.');
    if (this.mainFormGroup.controls.contractorMaternalLastName.valid == false) error.push('El apellido materno del contratante no es válido.');

    if (this.mainFormGroup.controls.brokerDocumentNumber.valid == false) error.push('El número de documento del broker no es válido.');
    if (this.mainFormGroup.controls.brokerFirstName.valid == false) error.push('El nombre del broker no es válido.');
    if (this.mainFormGroup.controls.brokerPaternalLastName.valid == false) error.push('El apellido del broker paterno no es válido.');
    if (this.mainFormGroup.controls.brokerMaternalLastName.valid == false) error.push('El apellido del broker materno no es válido.');

    if (this.mainFormGroup.controls.startDate.valid && this.mainFormGroup.controls.endDate.valid) {
      if (this.mainFormGroup.hasError('datesNotSortedCorrectly')) error.push(ModuleConfig.InvalidStartDateOrderMessage);
    } else {
      if (this.mainFormGroup.controls.startDate.valid == false) {
        if (this.mainFormGroup.controls.startDate.hasError('required')) error.push('La fecha de inicio es requerida.');
        else error.push(ModuleConfig.InvalidStartDateMessage);
      }
      if (this.mainFormGroup.controls.endDate.valid == false) {
        if (this.mainFormGroup.controls.endDate.hasError('required')) error.push('La fecha de fin es requerida.');
        else error.push(ModuleConfig.InvalidEndDateMessage);
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
        output = output + item + ' <br>'
      });
    }
    return output;
  }

  choosePolicyClk(evt, selection: any, transacction: number) {
    if (selection.toString().includes('sc_')) {
      Swal.fire('Información', "La póliza no tiene cotizacion.", 'error');
      return;
    }
    if (selection !== undefined && selection !== '') {
      if (this.policyList.length > 0) {
        this.policyList.forEach(item => {
          if (Number(item.NID_COTIZACION) === Number(selection)) {
            this.policyErmitService.valTransactionPolicy(item.NID_COTIZACION).subscribe(
              res => {
                if (Number(res.P_COD_ERR) === 0) {
                  const data: any = {};
                  data.NBRANCH = item.NBRANCH;
                  data.NPRODUCT = item.NPRODUCT;
                  data.NPOLICY = item.NPOLIZA;
                  data.NID_COTIZACION = item.NID_COTIZACION;
                  data.NTYPE_TRANSAC = transacction;
                  this.policyErmitService.ValidatePolicyRenov(data).subscribe(
                    res => {
                      if (Number(res.P_NCODE) === 0) {
                        this.moveTransaction(transacction, item);
                      } else {
                        let mensaje = (res.P_SMESSAGE as string).split(";");
                        var mensajeHTML = document.createElement("div");
                        if(mensaje[1] == undefined){
                          mensaje[1] = ""
                        }
                        
                        mensajeHTML.innerHTML = "<p>" + mensaje[0] + "</p><p style='margin-top: 0px; padding-top: 0px;'>" + mensaje[1] + "</p>"
                        Swal.fire({
                          title: 'Información',
                          icon: 'error',
                          html: mensajeHTML
                        })

                        // Swal.fire('Información', res.P_SMESSAGE, 'error');
                      }
                    }
                  );
                } else {
                  Swal.fire('Información', res.P_MESSAGE, 'error');
                }
              },
              err => {
                this.isLoading = false;
              }
            );
          }
        });
      }
    } else {
      Swal.fire('Información', 'Para continuar deberá elegir una póliza', 'error');
    }
    evt.preventDefault();
  }

  moveTransaction(transacction, policy) {
    switch (transacction) {
      case 1: // Anular
        this.router.navigate(['/extranet/policy/transaction/cancel'], { queryParams: { nroCotizacion: policy.NID_COTIZACION } });
        break;
      case 2: // Incluir
        this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: policy.NID_COTIZACION, nroPoliza: policy.NPOLIZA } });
        break;
      case 3: // Exluir
        this.router.navigate(['/extranet/policy/transaction/exclude'], { queryParams: { nroCotizacion: policy.NID_COTIZACION, nroPoliza: policy.NPOLIZA } });
        break;
      case 4: // Renovar
        this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: policy.NID_COTIZACION, nroPoliza: policy.NPOLIZA } });
        break;
      case 5: // Neteo
        this.router.navigate(['/extranet/policy/transaction/netear'], { queryParams: { nroCotizacion: policy.NID_COTIZACION } });
        break;
      case 8: // Endoso
        this.router.navigate(['/extranet/policy/transaction/endosar'], { queryParams: { nroCotizacion: policy.NID_COTIZACION, nroPoliza: policy.NPOLIZA } });
        break;
      case 9: // Facturacion
        // this.recibosPoliza(item);
        break;
      case 13:
        this.router.navigate(['/extranet/policy/transaction/broker'], { queryParams: { nroCotizacion: policy.NID_COTIZACION, nroPoliza: policy.NPOLIZA } });
        break;
      case 14:
        this.router.navigate(['/extranet/policy/transaction/certificate'], { queryParams: { nroCotizacion: policy.NID_COTIZACION, nroPoliza: policy.NPOLIZA } });
        break;
    }
  }

  async selectVidaLey() {
    this.InputsSearch.NBRANCH = this.vidaLeyID.nbranch;
    await this.SelectBranch();
    this.InputsSearch.NPRODUCT = this.vidaLeyID.id;
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.InputsSearch.NBRANCH).subscribe(
      res => {
        this.productList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  SelectBranch() {
    this.productList = null;
    this.InputsSearch.NPRODUCT = '0';
    if (this.InputsSearch.NBRANCH != null) {
      this.getProductsListByBranch();
    }
  }

  getBranchList() {
    this.clientInformationService.getBranch().subscribe(
      res => {
        this.branchList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getTransaccionList() {
    this.policyErmitService.getTransactionAllList().subscribe(
      res => {
        this.transaccionList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        this.documentTypeList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  openModal(item) {
    const modalRef = this.modalService.open(PolicyMovementDetailsAllComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.itemTransaccionList = this.policyList;
    modalRef.componentInstance.NBRANCH = item.NBRANCH;
    modalRef.componentInstance.NPRODUCT = item.NPRODUCT;
    modalRef.componentInstance.NPOLICY = item.NPOLIZA;

    modalRef.componentInstance.SBRANCH = item.SRAMO;
    modalRef.componentInstance.SPRODUCT = item.SPRODUCTO;
    modalRef.componentInstance.SCONTRATANTE = item.SCONTRATANTE;
    modalRef.componentInstance.loading.subscribe(res => {
      this.isLoading = res;
    });

  }

  onKeyPress(event) {
    let strError = '';

    if (Number(this.InputsSearch.NBRANCH) === 0) {
      strError = '- Seleccione un ramo';
    } else if (Number(this.InputsSearch.NPRODUCT) === 0) {
      strError += '- Seleccione un producto';
    }

    if (strError !== '') {
      Swal.fire('Error', strError, 'error');
    }
  }

  onSelectTypeSearch() {
    switch (this.InputsSearch.P_TYPE_SEARCH) {
      case '1':
        this.blockSearch = true;
        this.blockDoc = true;
        this.InputsSearch.SFIRSTNAME = '';
        this.InputsSearch.SLEGALNAME = '';
        this.InputsSearch.SLASTNAME = '';
        this.InputsSearch.SLASTNAME2 = '';
        break;

      case '2':
        this.blockSearch = false;
        this.blockDoc = true;
        this.InputsSearch.NIDDOC_TYPE = '-1';
        this.InputsSearch.SIDDOC = '';
        this.InputsSearch.P_PERSON_TYPE = '1';
        break;

    }

    this.stateSearchNroPolicy = false;
  }

  buscarPoliza(excel: number = 0) {
    if (this.mainFormGroup.controls.policy.value > 0) {
      this.mainFormGroup.controls.policy.setValue(this.mainFormGroup.controls.policy.value.replace(/\s/g, ""));
    }
    if (excel != 1) {
      this.isValidatedInClickButton = true;
      this.listToShow = [];
      this.currentPage = 1; // página actual
      this.maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
      this.totalItems = 0; // total de items encontrados
    }
    if (this.mainFormGroup.valid) {
      //Preparación de datos
      let iniDate = this.mainFormGroup.controls.startDate.value;
      let finDate = this.mainFormGroup.controls.endDate.value;

      this.filter.NTYPE_HIST = this.mainFormGroup.controls.typeTransac.value;
      this.filter.NBRANCH = this.mainFormGroup.controls.branch.value;
      this.filter.NPRODUCT = this.mainFormGroup.controls.product.value;
      this.filter.NPOLICY = this.mainFormGroup.controls.policy.value;
      this.filter.DINI = iniDate.getDate().toString().padStart(2, '0') + '/' + (iniDate.getMonth() + 1).toString().padStart(2, '0') + '/' + iniDate.getFullYear();;
      this.filter.DFIN = finDate.getDate().toString().padStart(2, '0') + '/' + (finDate.getMonth() + 1).toString().padStart(2, '0') + '/' + finDate.getFullYear();;
      this.filter.NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
      // this.filter.flagDate = this.flagDate;

      // this.filter.ContractorSearchMode = this.mainFormGroup.controls.contractorSearchMode.value;

      if (this.mainFormGroup.controls.contractorSearchMode.value == '1') {
        this.filter.NTYPE_DOC = this.mainFormGroup.controls.contractorDocumentType.value != '' ? this.mainFormGroup.controls.contractorDocumentType.value : 0;
        this.filter.SIDDOC = this.mainFormGroup.controls.contractorDocumentNumber.value;
        this.filter.SLASTNAME = '';
        this.filter.SLASTNAME2 = '';
        this.filter.SFIRSTNAME = '';
        this.filter.SLEGALNAME = '';
      } else if (this.mainFormGroup.controls.contractorSearchMode.value == '2' && this.mainFormGroup.controls.contractorPersonType.value == '1') {
        this.filter.NTYPE_DOC = 0;
        this.filter.SIDDOC = '';
        this.filter.SLASTNAME = this.mainFormGroup.controls.contractorPaternalLastName.value;
        this.filter.SLASTNAME2 = this.mainFormGroup.controls.contractorMaternalLastName.value;
        this.filter.SFIRSTNAME = this.mainFormGroup.controls.contractorFirstName.value;
        this.filter.SLEGALNAME = '';
      } else if (this.mainFormGroup.controls.contractorSearchMode.value == '2' && this.mainFormGroup.controls.contractorPersonType.value == '2') {
        this.filter.NTYPE_DOC = 0;
        this.filter.SIDDOC = '';
        this.filter.SLASTNAME = '';
        this.filter.SLASTNAME2 = '';
        this.filter.SFIRSTNAME = '';
        this.filter.SLEGALNAME = this.mainFormGroup.controls.contractorLegalName.value;
      } else {
        this.filter.NTYPE_DOC = 0;
        this.filter.SIDDOC = '';
        this.filter.SLASTNAME = '';
        this.filter.SLASTNAME2 = '';
        this.filter.SFIRSTNAME = '';
        this.filter.SLEGALNAME = '';
      }

      // this.filter.BrokerSearchMode = this.mainFormGroup.controls.brokerSearchMode.value;

      if (this.mainFormGroup.controls.brokerSearchMode.value == '1') {
        this.filter.NTYPE_DOC_BR = this.mainFormGroup.controls.brokerDocumentType.value != '' ? this.mainFormGroup.controls.brokerDocumentType.value : 0;
        this.filter.SIDDOC_BR = this.mainFormGroup.controls.brokerDocumentNumber.value;
        this.filter.SLASTNAME_BR = '';
        this.filter.SLASTNAME2_BR = '';
        this.filter.SFIRSTNAME_BR = '';
        this.filter.SLEGALNAME_BR = '';
      } else if (this.mainFormGroup.controls.brokerSearchMode.value == '2' && this.mainFormGroup.controls.brokerPersonType.value == '1') {
        this.filter.NTYPE_DOC_BR = 0;
        this.filter.SIDDOC_BR = '';
        this.filter.SLASTNAME_BR = this.mainFormGroup.controls.brokerPaternalLastName.value;
        this.filter.SLASTNAME2_BR = this.mainFormGroup.controls.brokerMaternalLastName.value;
        this.filter.SFIRSTNAME_BR = this.mainFormGroup.controls.brokerFirstName.value;
        this.filter.SLEGALNAME_BR = '';
      } else if (this.mainFormGroup.controls.brokerSearchMode.value == '2' && this.mainFormGroup.controls.brokerPersonType.value == '2') {
        this.filter.NTYPE_DOC_BR = 0;
        this.filter.SIDDOC_BR = '';
        this.filter.SLASTNAME_BR = '';
        this.filter.SLASTNAME2_BR = '';
        this.filter.SFIRSTNAME_BR = '';
        this.filter.SLEGALNAME_BR = this.mainFormGroup.controls.brokerLegalName.value;
      } else {
        this.filter.NTYPE_DOC_BR = 0;
        this.filter.SIDDOC_BR = '';
        this.filter.SLASTNAME_BR = '';
        this.filter.SLASTNAME2_BR = '';
        this.filter.SFIRSTNAME_BR = '';
        this.filter.SLEGALNAME_BR = '';
      }

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
    this.policyErmitService.GetPolicyTransAllList(this.filter).subscribe(
      res => {

        this.policyList = res;
        if (this.policyList != null && this.policyList.length > 0) {
          this.totalItems = this.policyList.length
          this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage))
        } else {
          this.totalItems = 0;
          Swal.fire('Información', this.notfoundMessage, 'warning');
        }
        this.isLoading = false;
      },
      err => {
        this.policyList = [];
        this.totalItems = 0;
        this.isLoading = false;
        Swal.fire('Información', this.genericErrorMessage, 'error');

      }
    );
  }

  excel() {
    this.isLoading = true;
    try {
      this.policyErmitService.GetPolicyTransAllListExcel(this.filter).subscribe(res => {
        this.isLoading = false;
        if (res == "") {
          Swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
        } else {
          const blob = this.b64toBlob(res);
          const blobUrl = URL.createObjectURL(blob);
          let a = document.createElement("a")
          a.href = blobUrl
          a.download = "Reporte de pólizas.xlsx"
          a.click()
        };
      })
    } catch (error) {
      this.isLoading = false;
      Swal.fire('Información', "Error al descargar Excel", 'error');
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

  onSelectTypeDocument() {
    this.blockDoc = true;
    const response = CommonMethods.selTipoDocumento(this.InputsSearch.P_NIDDOC_TYPE);
    this.maxlength = response.maxlength;
    this.minlength = response.minlength;
    this.InputsSearch.SIDDOC = '';
  }

  onSelectTypePerson() {
    switch (this.InputsSearch.P_PERSON_TYPE) {
      case '1':
        this.blockDoc = true;
        break;
      case '2':
        this.blockDoc = false;
        break;
    }
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  changeDoc(document) {
    if (document.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      this.stateSearchNroPolicy = false;
    }
  }

  changeFirstName(firstname) {
    if (firstname.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      if (this.InputsSearch.SLASTNAME !== '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      } else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName(lastname) {
    if (lastname.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      if (this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      } else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName2(lastname2) {
    if (lastname2.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      if (this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME) {
        this.stateSearchNroPolicy = true;
      } else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeContractor(contractor) {
    if (contractor.length > 0 || this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME !== '' || this.InputsSearch.SLASTNAME2 !== '') {
      this.stateSearchNroPolicy = true;
    } else {
      this.stateSearchNroPolicy = false;
    }
  }

  changePolicy(sdoc) {
    if (sdoc.length > 0) {
      this.stateSearch = true;
      this.stateSearchPolicy = false;
      this.InputsSearch.P_NIDPRODUCT = '0';
      this.InputsSearch.P_NIDTRANSACCION = '0';
      this.InputsSearch.NIDDOC_TYPE = '-1';
      this.InputsSearch.SIDDOC = '';
      this.InputsSearch.P_PERSON_TYPE = '1';
      this.InputsSearch.P_TYPE_SEARCH = '1';
      this.InputsSearch.SFIRSTNAME = '';
      this.InputsSearch.SLEGALNAME = '';
      this.InputsSearch.SLASTNAME = '';
      this.InputsSearch.SLASTNAME2 = '';
      this.blockDoc = true;
    } else {
      this.stateSearch = false;
    }
  }

  valInicio(event) {
    this.bsValueFinMin = new Date(this.bsValueIni);

  }
  valFin(event) {
    this.bsValueIniMax = new Date(this.bsValueFin);
  }

  documentNumberKeyPress(event: any, documentType: string) {
    if (documentType === '') { return; }
    CommonMethods.validarNroDocumento(event, documentType);
  }

  choosePolicyBroker(evt, selection: any, transacction: number) {
    if (selection.toString().includes('sc_')) {
      Swal.fire('Información', "La póliza no tiene cotizacion.", 'error');
      return;
    }
    if (selection !== undefined && selection !== '') {
      if (this.policyList.length > 0) {
        this.policyList.forEach(item => {
          if (Number(item.NID_COTIZACION) === Number(selection)) {
            this.moveTransaction(transacction, item);
          }
        });
      }
    } else {
      Swal.fire('Información', 'Para continuar deberá elegir una póliza', 'error');
    }
    evt.preventDefault();
  }

}
