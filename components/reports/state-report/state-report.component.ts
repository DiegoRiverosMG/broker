import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
//Otros componentes
import { SearchContractingComponent } from '../../../modal/search-contracting/search-contracting.component';
//Importación de modelos
import { ClientDataToSearch } from '../../../models/shared/client-information/client-data-to-search';
import { ContractorForTable } from '../../../models/maintenance/contractor-location/contractor-for-table';
//Importación de servicios
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { StateReportService } from '../../../services/report/state-report.service'
//Configuración
import { GlobalValidators } from './../../global-validators';
@Component({
  selector: 'app-state-report',
  templateUrl: './state-report.component.html',
  styleUrls: ['./state-report.component.css']
})
export class StateReportComponent implements OnInit {
  isLoading: boolean = false;  //True para mostrar pantalla de carga, false para ocultarla

  /**
   * Variables de paginación
   */
  public rotate = true; //Si rotar las páginas cuando maxSize > el número de páginas generado
  public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
  public totalItems = 0; //total de items encontrados
  public foundResults: ContractorForTable[] = [];  //Lista de registros encontrados durante la búsqueda
  filter = new ClientDataToSearch(); //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

  documentNumberLength: number = 0; //Cantidad de caracteres que se puede insertar en el campo Nro de documento
  isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.
  mainFormGroup: FormGroup;

  documentTypeList: any[] = []; //Lista de tipos de documento
  personTypeList: any[] = []; //Lista de tipos de persona
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"]

  genericErrorMessage = "Ha ocurrido un error inesperado. Por favor contáctese con soporte."; //Mensaje de error genérico
  notfoundMessage: string = "No se encontraron registros";

  constructor(
    private modalService: NgbModal,
    private mainFormBuilder: FormBuilder,
    private clientInformationService: ClientInformationService,
    private router: Router,
    private stateReportService: StateReportService
  ) {
  }

  ngOnInit() {
    sessionStorage.removeItem("cs-contractor");

    this.createForm();
    this.filter.LimitPerpage = 5;
    this.getDocumentTypeList();
    this.getPersonTypeList();
  }
  /**
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      documentNumber: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator, GlobalValidators.onlyNumberValidator]],
      paternalLastName: [""],
      maternalLastName: [""],
      firstName: [""],
      legalName: [""],
      searchMode: ["1"],
      documentType: [""],
      personType: ["1"]
    });
  }
  /**
   * Obtiene la lista de tipos de documento
   */
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        this.documentTypeList = res;
      },
      () => {
        Swal.fire("Información", this.genericErrorMessage, "error");
      }
    );
  }
  /**
   * Obtiene la lista de tipos de de persona
   */
  getPersonTypeList() {
    this.personTypeList = [{ Id: "1", Name: "Persona Natural" }, { Id: "2", Name: "Persona Jurídica" }];
  }

  /**
   * Evento que se dispara al presionar una tecla en el campo Número de Documento y restringe el ingreso según el tipo de documento
   * @param event datos del evento KeyPress
   */
  documentNumberKeyPress(event: any) {
    let pattern;
    switch (this.mainFormGroup.controls.documentType.value) {
      case "1": { //ruc
        pattern = /[0-9]/;
        break;
      }
      case "2": { //dni
        pattern = /[0-9]/;
        break;
      }
      case "4": { //ce
        pattern = /[0-9A-Za-z]/;
        break;
      }
      default: {  //para los otros tipos de documento
        pattern = /[0-9A-Za-z]/;
        break;
      }
    }

    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
    if (this.mainFormGroup.controls.documentType.value == "") Swal.fire("Información", "Debes seleccionar un tipo de documento", "error");
  }

  /**
   * Deshabilita los validadores de todos los controles
   */
  disableCommonValidators() {
    this.mainFormGroup.controls.documentNumber.setValidators(null);
    this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
    this.mainFormGroup.controls.maternalLastName.setValidators(null);
    this.mainFormGroup.controls.maternalLastName.updateValueAndValidity();
    this.mainFormGroup.controls.paternalLastName.setValidators(null);
    this.mainFormGroup.controls.paternalLastName.updateValueAndValidity();
    this.mainFormGroup.controls.firstName.setValidators(null);
    this.mainFormGroup.controls.firstName.updateValueAndValidity();
    this.mainFormGroup.controls.legalName.setValidators(null);
    this.mainFormGroup.controls.legalName.updateValueAndValidity();

  }

  /**
   * Limpia campos de texto
   */
  cleanInputs() {
    this.mainFormGroup.controls.documentNumber.patchValue(null);
    this.mainFormGroup.controls.paternalLastName.patchValue(null);
    this.mainFormGroup.controls.maternalLastName.patchValue(null);
    this.mainFormGroup.controls.firstName.patchValue(null);
    this.mainFormGroup.controls.legalName.patchValue(null);
  }

  cleanValidators() {
    this.isValidatedInClickButton = false;
  }
  /**
   * Cambia los validadores según el modo de búsqueda
   */
  changeValidators() {
    switch (this.mainFormGroup.controls.documentType.value) {
      case "": { //Ngún documento
        this.documentNumberLength = 0;
        break;
      }
      case "1": { //ruc
        this.documentNumberLength = 11;
        break;
      }
      case "2": { //dni
        this.documentNumberLength = 8;
        break;
      }
      case "4": { //ce
        this.documentNumberLength = 12;
        break;
      }
      case "6": { //pasaporte
        this.documentNumberLength = 12;
        break;
      }
      default: {  //otros tipos de documento
        this.documentNumberLength = 15;
        break;
      }
    }
    this.disableCommonValidators();
    this.cleanInputs();
    this.isValidatedInClickButton = false;
    if (this.mainFormGroup.controls.searchMode.value == "1") {
      if (this.mainFormGroup.controls.documentType.value == "2") { //modo: Por documento, tipodoc:dni
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else if (this.mainFormGroup.controls.documentType.value == "1") { //Ruc
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(11), Validators.minLength(11), GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else if (this.mainFormGroup.controls.documentType.value == "4" || this.mainFormGroup.controls.documentType.value == "6") { //ce o pasaporte
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else { //otros tipos de documento
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(15)]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      }
    } else {
      if (this.mainFormGroup.controls.personType.value == "1") {
        this.mainFormGroup.controls['firstName'].setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern()), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation]);
        this.mainFormGroup.controls.firstName.updateValueAndValidity();
        this.mainFormGroup.controls['paternalLastName'].setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern()), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation]);
        this.mainFormGroup.controls.paternalLastName.updateValueAndValidity();
        this.mainFormGroup.controls['maternalLastName'].setValidators([Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern()), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation]);
        this.mainFormGroup.controls.maternalLastName.updateValueAndValidity();
      } else {
        this.mainFormGroup.controls['legalName'].setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]);
        this.mainFormGroup.controls.legalName.updateValueAndValidity();
      }
    }
  }

  /**
   * Realiza la primera búsqueda accionada por el botón buscar o la tecla ENTER
   */
  firstSearch() {

    this.isValidatedInClickButton = true;
    if (this.mainFormGroup.valid) {
      this.filter.P_TipOper = "CON";
      this.filter.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];
      this.filter.PageNumber = 1;
      if (this.mainFormGroup.controls.searchMode.value == "1") {
        this.filter.P_NIDDOC_TYPE = this.mainFormGroup.controls.documentType.value.toString();
        this.filter.P_SIDDOC = this.mainFormGroup.controls.documentNumber.value;
        this.filter.P_SLEGALNAME = "";
        this.filter.P_SFIRSTNAME = "";
        this.filter.P_SLASTNAME = "";
        this.filter.P_SLASTNAME2 = "";
      } else {
        this.filter.P_NIDDOC_TYPE = "";
        this.filter.P_SIDDOC = "";
        if (this.mainFormGroup.controls.personType.value == "1") {
          this.filter.P_SFIRSTNAME = this.mainFormGroup.controls.firstName.value.toString().toUpperCase();
          this.filter.P_SLASTNAME = this.mainFormGroup.controls.paternalLastName.value.toString().toUpperCase();
          this.filter.P_SLASTNAME2 = this.mainFormGroup.controls.maternalLastName.value == null ? "" : this.mainFormGroup.controls.maternalLastName.value.toString().toUpperCase();
          this.filter.P_SLEGALNAME = "";
        } else {
          this.filter.P_SLEGALNAME = this.mainFormGroup.controls.legalName.value.toString().toUpperCase();
          this.filter.P_SFIRSTNAME = "";
          this.filter.P_SLASTNAME = "";
          this.filter.P_SLASTNAME2 = "";
        }

      }
      this.search();
    } else {
      let errorList = [];
      if (this.mainFormGroup.controls.documentNumber.valid == false) {
        if (this.mainFormGroup.controls.documentNumber.hasError('required')) errorList.push("El número de documento es requerido.");
        else errorList.push("El nro de documento no es válido.");
      }

      if (this.mainFormGroup.controls.firstName.valid == false) {
        if (this.mainFormGroup.controls.firstName.hasError('required')) errorList.push("El nombre es requerido.");
        else errorList.push("El nombre no es válido.");
      }
      if (this.mainFormGroup.controls.paternalLastName.valid == false) {
        if (this.mainFormGroup.controls.paternalLastName.hasError('required')) errorList.push("El apellido paterno es requerido.");
        else errorList.push("El apellido paterno no es válido.");
      }
      if (this.mainFormGroup.controls.maternalLastName.valid == false) {
        if (this.mainFormGroup.controls.maternalLastName.hasError('required')) errorList.push("El apellido materno es requerido.");
        else errorList.push("El apellido materno no es válido.");
      }
      if (this.mainFormGroup.controls.legalName.valid == false) {
        if (this.mainFormGroup.controls.legalName.hasError('required')) errorList.push("La razón social es requerida.");
        else errorList.push("La razón social no es válida.");
      }
      Swal.fire('Información', this.listToString(errorList), 'error');
    }

  }
  /**
   * Realiza la búsqueda accionada por el cambio de página en el paginador
   * @param page número de página seleccionado en el paginador
   */
  pageChanged() {
    this.search();
  }

  /**
   * extrae los datos que provee el servicio
   */
  search() {
    this.isLoading = true;
    this.foundResults = [];
    this.clientInformationService.getCliente360(this.filter).subscribe(
      res => {
        let self = this;
        if (res.P_NCODE == 0) {
          if (res.EListClient != null && res.EListClient.length > 0) {
            if (res.EListClient.length != 1) {
              this.isLoading = false;
              const modalRef = this.modalService.open(SearchContractingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
              modalRef.componentInstance.formModalReference = modalRef;
              modalRef.componentInstance.EListClient = res.EListClient;

              modalRef.result.then((item) => {
                if (item != null) {
                  let data = new ContractorForTable();

                  data.Id = item.P_SCLIENT;
                  data.DocumentNumber = item.P_SIDDOC;

                  if (item.EListAddresClient != null && item.EListAddresClient.length > 0) data.Address = item.EListAddresClient[0].P_SSTREET + ", " + item.EListAddresClient[0].P_DESDISTRITO + ", " + item.EListAddresClient[0].P_DESPROVINCIA + ", " + item.EListAddresClient[0].P_DESDEPARTAMENTO;
                  else data.Address = "";

                  if (item.EListPhoneClient != null && item.EListPhoneClient.length > 0) data.Phone = item.EListPhoneClient[0].P_SPHONE;
                  else data.Phone = "";

                  if (item.EListEmailClient != null && item.EListEmailClient.length > 0) data.Email = item.EListEmailClient[0].P_SE_MAIL;
                  else data.Email = "";

                  if (item.P_NIDDOC_TYPE == "1") {
                    data.DocumentType = "RUC";
                    data.FullName == item.P_SLEGALNAME;
                  } else {
                    this.documentTypeList.map(function (element) {
                      if (element.Id == item.P_NIDDOC_TYPE) data.DocumentType = element.Name;
                    });
                    data.FullName = item.P_SLASTNAME + " " + item.P_SLASTNAME2 + " " + item.P_SFIRSTNAME;
                  }

                  self.stateReportService.getContractorState(data.Id).subscribe(
                    res => {
                      if (res != null) {
                        data.CreditEnablementId = res.CreditEnablementId;
                        data.CreditEnablementName = res.CreditEnablementName;
                        data.MovementEnablementId = res.MovementEnablementId;
                        data.MovementEnablementName = res.MovementEnablementName;
                        data.LastCreditEvaluationId = res.LastCreditEvaluationId;
                        data.LastCreditEvaluationName = res.LastCreditEvaluationName;
                        data.LatePaymentDays = res.LatePaymentDays;
                        self.foundResults.push(data);
                        self.isLoading = false;
                        self.totalItems = 1;
                      }

                    },
                    () => {
                      self.totalItems = 0;
                      self.isLoading = false;
                      Swal.fire("Información", this.genericErrorMessage, "error");
                    }
                  );
                }
              }, () => {
              });
            } else if (res.EListClient[0].P_SCLIENT != null) {

              let data = new ContractorForTable();
              data.Id = res.EListClient[0].P_SCLIENT;
              data.DocumentNumber = res.EListClient[0].P_SIDDOC;

              if (res.EListClient[0].EListAddresClient != null && res.EListClient[0].EListAddresClient.length > 0) data.Address = res.EListClient[0].EListAddresClient[0].P_SSTREET + ", " + res.EListClient[0].EListAddresClient[0].P_DESDISTRITO + ", " + res.EListClient[0].EListAddresClient[0].P_DESPROVINCIA + ", " + res.EListClient[0].EListAddresClient[0].P_DESDEPARTAMENTO;
              else data.Address = "";

              if (res.EListClient[0].EListPhoneClient != null && res.EListClient[0].EListPhoneClient.length > 0) data.Phone = res.EListClient[0].EListPhoneClient[0].P_SPHONE;
              else data.Phone = "";

              if (res.EListClient[0].EListEmailClient != null && res.EListClient[0].EListEmailClient.length > 0) data.Email = res.EListClient[0].EListEmailClient[0].P_SE_MAIL;
              else data.Email = "";

              if (res.EListClient[0].P_NIDDOC_TYPE == "1") {
                data.DocumentType = "RUC";
                data.FullName = res.EListClient[0].P_SLEGALNAME;
              } else {
                this.documentTypeList.map(function (item) {
                  if (item.Id == res.EListClient[0].P_NIDDOC_TYPE) data.DocumentType = item.Name;
                });

                data.FullName = res.EListClient[0].P_SLASTNAME + " " + res.EListClient[0].P_SLASTNAME2 + " " + res.EListClient[0].P_SFIRSTNAME;
              }

              this.stateReportService.getContractorState(data.Id).subscribe(
                res => {
                  data.CreditEnablementId = res.CreditEnablementId;
                  data.CreditEnablementName = res.CreditEnablementName;
                  data.MovementEnablementId = res.MovementEnablementId;
                  data.MovementEnablementName = res.MovementEnablementName;
                  data.LastCreditEvaluationId = res.LastCreditEvaluationId;
                  data.LastCreditEvaluationName = res.LastCreditEvaluationName;
                  data.LatePaymentDays = res.LatePaymentDays;
                  this.foundResults.push(data);
                  this.isLoading = false;
                  this.totalItems = 1;
                },
                () => {
                  this.totalItems = 0;
                  this.isLoading = false;
                  Swal.fire("Información", this.genericErrorMessage, "error");
                }
              );

            } else {
              this.totalItems = 0;
              this.isLoading = false;
              Swal.fire("Información", this.notfoundMessage, "warning");
            }

          } else {
            this.totalItems = 0;
            this.isLoading = false;
            Swal.fire("Información", this.notfoundMessage, "warning");

          }

        } else if (res.P_NCODE == 3) {
          this.totalItems = 0;
          this.isLoading = false;
          Swal.fire("Información", this.notfoundMessage, "warning");
        } else if (res.P_NCODE == 1) {
          this.totalItems = 0;
          this.isLoading = false;
          Swal.fire('Información', res.P_SMESSAGE, 'error');  //Error controlado
        }
        else {
          this.totalItems = 0;
          this.isLoading = false;
          Swal.fire('Información', this.genericErrorMessage, 'error');  //Error controlado
        }

      },
      () => {
        this.totalItems = 0;
        this.isLoading = false;
        Swal.fire("Información", this.genericErrorMessage, "error");
      }

    );
  }

  /**
   * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
   * @param list lista ingresada
   * @returns  string en html
   */
  listToString(list: String[]): string {
    let output = "";
    if (list != null && list.length > 0) {
      list.forEach(function (item) {
        output = output + item + " <br>"
      });
    }
    return output;
  }

  /**
   * Abre el modal con datos básicos del cliente y sus transacciones de cuenta
   * @param clientId Id de cliente
   */
  openAccountTransactionModal(contractor: ContractorForTable) {
    sessionStorage.setItem('cs-contractor', JSON.stringify(contractor));
    this.router.navigate(['/extranet/contractor-state']);
  }
}
