import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { isNumeric } from 'rxjs/internal-compatibility';
//Importación de servicios
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { OthersService } from '../../../services/shared/others.service';
//Modelos
import { PolicyProofSearch } from '../../../models/polizaEmit/request/policy-proof-search';

//Configuración
import { GlobalValidators } from './../../global-validators';
import { ModuleConfig } from './../../module.config'
import { AccessFilter } from './../../access-filter'
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-policy-movement-proof',
  templateUrl: './policy-movement-proof.component.html',
  styleUrls: ['./policy-movement-proof.component.css']
})
export class PolicyMovementProofComponent implements OnInit {
  isLoading: boolean = false;  //True para mostrar pantalla de carga, false para ocultarla
  // datepicker
  public bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = ModuleConfig.StartDate;  //Fecha inicial del componente
  bsValueFin: Date = ModuleConfig.EndDate;  //Fecha final del componente

  /**
   * Variables de paginación
   */
  public rotate = true; //Si rotar las páginas cuando maxSize > el número de páginas generado
  public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
  public totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

  documentNumberLength: number = 0; //Cantidad de caracteres que se puede insertar en el campo Nro de documento
  isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.
  mainFormGroup: FormGroup;

  movementTypeList: any[] = []; //Lista de tipos de movimiento
  productTypeList: any[] = [];  //Lista de tipos de producto
  documentTypeList: any[] = []; //Lista de tipos de documento
    //epsItem = JSON.parse(sessionStorage.getItem('eps'))
    epsItem = JSON.parse(localStorage.getItem('eps'))
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  branch: any;

  genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
  notfoundMessage: string = 'No se encontraron registros';

  invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
  invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
  invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
  invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;

  constructor(
    private mainFormBuilder: FormBuilder,
    private policyService: PolicyemitService,
    private clientInformationService: ClientInformationService,
    private router: Router,
    private othersService: OthersService
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
    if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_proof']) == false) { this.router.navigate(['/extranet/home']); }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filter.LimitPerpage = 5;
    this.createForm();
    this.initializeForm();
    this.branch = await CommonMethods.branchXproduct(this.codProducto);
    this.getDocumentTypeList();
    this.getMovementTypeList();
    this.getProductTypeList();
  }

  mostrarMas() {
    this.firstSearch();
  }

  /**
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      product: [''],  //Producto
      movement: [''],  //Movimiento de póliza
      startDate: ['', [Validators.required]], //Fecha inferior para búsqueda
      endDate: ['', [Validators.required]], //Fecha superior para búsqueda
      proofNumber: [''], //Número de constancia de póliza
      searchMode: ['1'],  //Modo de búsqueda de asegurado
      documentType: [''],  //Tipo de documento de asegurado
      documentNumber: [''],  //Número de documento de asegurado
      personType: ['1'], //Tipo de persona de asegurado
      firstName: [''],  //Nombre de asegurado
      paternalLastName: [''], //Apellido paterno de asegurado
      maternalLastName: ['']  //Apellido materno de asegurado
    });
  }

  /**
   * Inicializa el formulario con sus valores por defecto
   */
  private initializeForm() {
    this.mainFormGroup.controls.proofNumber.setValue('');
    this.mainFormGroup.controls.proofNumber.setValidators([Validators.maxLength(10), GlobalValidators.onlyNumberValidator]);  // [pending] maxlength

    this.mainFormGroup.controls.product.setValue('');
    this.mainFormGroup.controls.movement.setValue('');
    this.mainFormGroup.controls.startDate.setValue(ModuleConfig.StartDate);
    this.mainFormGroup.controls.endDate.setValue(ModuleConfig.EndDate);

    this.mainFormGroup.controls.searchMode.setValue('1');
    this.mainFormGroup.controls.documentType.setValue('');
    this.mainFormGroup.controls.documentNumber.setValue('');
    this.mainFormGroup.controls.documentNumber.setValidators([Validators.maxLength(0), GlobalValidators.onlyNumberValidator]);
    this.mainFormGroup.controls.personType.setValue('1');

    this.mainFormGroup.controls.paternalLastName.setValue('');
    this.mainFormGroup.controls.paternalLastName.setValidators([Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]);
    this.mainFormGroup.controls.maternalLastName.setValue('');
    this.mainFormGroup.controls.maternalLastName.setValidators([Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]);
    this.mainFormGroup.controls.firstName.setValue('');
    this.mainFormGroup.controls.firstName.setValidators([Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]);


    this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    this.mainFormGroup.updateValueAndValidity();
  }

  /**
   * Obtiene los tipos de movimiento de la póliza
   */
  getMovementTypeList() {
    this.policyService.getMovementTypeList().subscribe(
      res => {
        res.GenericResponse.forEach(element => {
          if (element.Id == '1' || element.Id == '2' || element.Id == '3' || element.Id == '4' || element.Id == '5') this.movementTypeList.push(element);
        });
      },
      error => {
        Swal.fire('Información', this.genericErrorMessage, 'error')
      }
    );
  }
  /**
   * Obtiene los tipos de documento
   */
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        this.documentTypeList = res;
      },
      error => {
        Swal.fire('Información', this.genericErrorMessage, 'error')
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
          this.mainFormGroup.controls.product.patchValue('')
        }
      },
      error => {
        Swal.fire('Información', this.genericErrorMessage, 'error')
      }
    );
  }
  /**
   * Evento que se dispara al presionar una tecla en el campo Número de Documento y restringe el ingreso según el tipo de documento
   * @param event datos del evento KeyPress
   */
  documentNumberKeyPress(event: any) {
    if (this.mainFormGroup.controls.documentType.value == '') return;
    CommonMethods.validarNroDocumento(event, this.mainFormGroup.controls.documentType.value)
  }

  /**
   *
   */
  cleanValidation() {
    this.isValidatedInClickButton = false;
  }

  /**
   * Limpia todos los campos
   */
  cleanInputs() {
    this.mainFormGroup.controls.documentNumber.patchValue('');
    this.mainFormGroup.controls.paternalLastName.patchValue('');
    this.mainFormGroup.controls.maternalLastName.patchValue('');
    this.mainFormGroup.controls.firstName.patchValue('');
  }
  /**
   * Cambiar validaciones según modo
   * Cambiar tamaño de número de documento según el tipo de documento
   */
  documentTypeChanged() {
    //Volvemos a configurar el tamaño del campo de número de documento según el tipo de documento
    switch (this.mainFormGroup.controls.documentType.value) {
      case '': { //ningún documento seleccionado
        this.documentNumberLength = 0;
        this.mainFormGroup.controls.documentNumber.setValidators([]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
      }
      case '1': { //ruc
        this.documentNumberLength = 11;
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
      }
      case '2': { //dni
        this.documentNumberLength = 8;
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
      }
      case '4': { //ce
        this.documentNumberLength = 12;
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
      }
      case '6': { //pasaporte
        this.documentNumberLength = 12;
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
      }
      default: {  //otros tipos de documento
        this.documentNumberLength = 15;
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.maxLength(15)]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
        break;
      }

    }
    this.cleanInputs();
  }

  /**
   * Realiza la primera búsqueda accionada por el botón buscar o la tecla ENTER
   */
  firstSearch() {
    this.isValidatedInClickButton = true;
    if (this.mainFormGroup.valid) {
      this.filter.ProductType = this.mainFormGroup.controls.product.value;
      this.filter.MovementType = this.mainFormGroup.controls.movement.value;
      this.filter.StartDate = this.bsValueIni;
      this.filter.EndDate = this.bsValueFin;
      this.filter.ProofNumber = this.mainFormGroup.controls.proofNumber.value;
      this.filter.PageNumber = 1;

      this.filter.InsuredSearchMode = this.mainFormGroup.controls.searchMode.value;
      if (this.mainFormGroup.controls.searchMode.value == '1' && this.mainFormGroup.controls.documentNumber.value.toString().trim() == '') {
        this.filter.InsuredSearchMode = '3';
      }
      this.filter.InsuredDocumentType = this.mainFormGroup.controls.documentType.value;
      this.filter.InsuredDocumentNumber = this.mainFormGroup.controls.documentNumber.value;
      this.filter.InsuredPaternalLastName = this.mainFormGroup.controls.paternalLastName.value;
      this.filter.InsuredMaternalLastName = this.mainFormGroup.controls.maternalLastName.value;
      this.filter.InsuredFirstName = this.mainFormGroup.controls.firstName.value;
      this.filter.Nbranch = this.branch;
      this.search();
    } else {
      this.identifyAndShowErrors();
    }

  }

  /**
   * Realiza la búsqueda accionada por el cambio de página en el paginador
   * @param page número de página seleccionado en el paginador
   */
  pageChanged(page: number) {
    this.search();
  }
  /**
   * Identifica y muestra los errores
   */
  identifyAndShowErrors() {
    let error = [];
    if (this.mainFormGroup.controls.proofNumber.valid == false) error.push('El número de constancia no es válido.');
    if (this.mainFormGroup.controls.documentNumber.valid == false) error.push('El número de documento no es válido.');
    if (this.mainFormGroup.controls.firstName.valid == false) error.push('El nombre no es válido.');
    if (this.mainFormGroup.controls.paternalLastName.valid == false) error.push('El apellido paterno no es válido.');
    if (this.mainFormGroup.controls.maternalLastName.valid == false) error.push('El apellido materno no es válido.');

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
   * extrae los datos que provee el servicio
   */
  search() {
    this.isLoading = true;
    this.policyService.getPolicyProofList(this.filter).subscribe(
      res => {
        this.foundResults = res.GenericResponse;

        if (this.foundResults != null && this.foundResults.length > 0) this.totalItems = res.TotalRowNumber;
        else {
          this.totalItems = 0;
          Swal.fire('Información', this.notfoundMessage, 'warning');
        }
        this.isLoading = false;
      },
      error => {
        this.foundResults = [];
        this.totalItems = 0;
        this.isLoading = false;
        Swal.fire('Información', this.genericErrorMessage, 'error');
      }
    );
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

  proofNumberPressed(event: any) {
    if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
      event.preventDefault();
    }
  }
  /**
   * Bloquea los otros campos cuando el campo de número de póliza no está vacío; en caso contrario, los desbloquea
   */
  proofNumberChanged(event: any) {
    if (this.mainFormGroup.controls.proofNumber.value != null && this.mainFormGroup.controls.proofNumber.value != '') {
      this.mainFormGroup.controls.product.disable();
      this.mainFormGroup.controls.movement.disable();
      this.mainFormGroup.controls.startDate.disable();
      this.mainFormGroup.controls.endDate.disable();

      this.mainFormGroup.controls.searchMode.disable();
      this.mainFormGroup.controls.documentType.disable();
      this.mainFormGroup.controls.documentNumber.disable();

      this.mainFormGroup.controls.paternalLastName.disable();
      this.mainFormGroup.controls.maternalLastName.disable();
      this.mainFormGroup.controls.firstName.disable();
      this.mainFormGroup.setValidators(null);

    } else {
      this.mainFormGroup.controls.product.enable();
      this.mainFormGroup.controls.movement.enable();
      this.mainFormGroup.controls.startDate.enable();
      this.mainFormGroup.controls.endDate.enable();

      this.mainFormGroup.controls.searchMode.enable();
      this.mainFormGroup.controls.documentType.enable();
      this.mainFormGroup.controls.documentNumber.enable();

      this.mainFormGroup.controls.paternalLastName.enable();
      this.mainFormGroup.controls.maternalLastName.enable();
      this.mainFormGroup.controls.firstName.enable();
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
        this.mainFormGroup.controls.product.disable();
        this.mainFormGroup.controls.movement.disable();
        this.mainFormGroup.controls.startDate.disable();
        this.mainFormGroup.controls.endDate.disable();

        this.mainFormGroup.controls.searchMode.disable();
        this.mainFormGroup.controls.documentType.disable();
        this.mainFormGroup.controls.documentNumber.disable();

        this.mainFormGroup.controls.paternalLastName.disable();
        this.mainFormGroup.controls.maternalLastName.disable();
        this.mainFormGroup.controls.firstName.disable();
        this.mainFormGroup.setValidators(null);
      }
    }

  }

  downloadFile(filePath: string) {
    this.othersService.downloadFile(filePath).subscribe(
      res => {
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
      },
      err => {
        Swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
      }
    );
  }
}
