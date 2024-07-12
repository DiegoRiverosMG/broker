import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgencyFormComponent } from '../agency-form/agency-form.component';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BrokerSearchBynameComponent } from '../broker-search-byname/broker-search-byname.component';
import { ActivatedRoute, Router } from "@angular/router";
import Swal from 'sweetalert2';

//Importación de servicios
import { AgencyService } from '../../../../services/maintenance/agency/agency.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { OthersService } from '../../../../services/shared/others.service';
import { QuotationService } from '../../../../services/quotation/quotation.service';
//Modelos
import { BrokerAgencySearch } from '../../../../models/maintenance/agency/request/broker-agency-search';
import { BrokerAgency } from '../../../../models/maintenance/agency/response/broker-agency';
import { DocumentType } from '../../../../models/shared/client-information/document-type';
//Configuración
import { GlobalValidators } from './../../../global-validators';
import { ModuleConfig } from './../../../module.config'
import { AccessFilter } from './../../../access-filter'
import { CommonMethods } from '../../../common-methods';

@Component({
  selector: 'app-agency-index',
  templateUrl: './agency-index.component.html',
  styleUrls: ['./agency-index.component.css']
})
export class AgencyIndexComponent implements OnInit {
  // datepicker
  public bsConfig: Partial<BsDatepickerConfig>;
  public bsValueIni: Date = ModuleConfig.StartDate; //Fecha inicial del componente
  public bsValueFin: Date = ModuleConfig.EndDate;  //Fecha final del componente

  /**
   * Variables de paginación
   */
  public rotate = true; //Si rotar las páginas cuando maxSize > el número de páginas generado
  public maxSize = 5; //cantidad de paginas que se mostrarán en el html del paginado
  public totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda

  filter = new BrokerAgencySearch(); //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automáticamente

  documentNumberLength: number = 0; //Cantidad de caracteres que se puede insertar en el campo Nro de documento
  isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.
  mainFormGroup: FormGroup;

  documentTypeList: DocumentType[]; //Lista de tipos de documento

  public isLoading: boolean = false;  //Flag para mostrar y ocultar la pantalla de carga

  genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico
  redirectionMessage = ModuleConfig.RedirectionMessage;
  invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
  invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
  invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
  invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"]

  constructor(private modalService: NgbModal, private mainFormBuilder: FormBuilder, private agencyService: AgencyService, private clientInformationService: ClientInformationService, private router: Router, private activatedRoute: ActivatedRoute,
    private othersService: OthersService, private quotationService: QuotationService) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );
  }

  ngOnInit() {
    if (AccessFilter.hasPermission(ModuleConfig.ViewIdList["agency"]) == false) this.router.navigate(['/extranet/home']);
    this.createForm();
    this.initializeForm();

    this.getDocumentTypeList();
    this.filter.LimitPerpage = 5;
  }

  /**
   * Crea el formulario
   */
  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      documentNumber: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(8), GlobalValidators.notAllCharactersAreEqualValidator, GlobalValidators.onlyNumberValidator]],  //Número de documento
      searchMode: ["", [Validators.required]],  //Modo de búsqueda
      documentType: [""],  //Tipo de documento
      startDate: ["", [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]], //Fecha inferior para búsqueda
      endDate: ["", [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]], //Fecha superior para búsqueda
      personType: [""], //Tipo de persona
      legalName: [""], //Razón social
      firstName: [""], //Nombre
      paternalLastName: [""], //Apellido paterno
      maternalLastName: [""]  //Apellido materno
    });
  }
  /**
   * Inicializa el formulario con sus valores por defecto
   */
  private initializeForm() {
    this.mainFormGroup.controls.searchMode.setValue('1');
    this.mainFormGroup.controls.documentType.setValue('');
    this.mainFormGroup.controls.startDate.setValue(ModuleConfig.StartDate);
    this.mainFormGroup.controls.endDate.setValue(ModuleConfig.EndDate);
    this.mainFormGroup.controls.personType.setValue('1');

    this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    this.mainFormGroup.updateValueAndValidity();
  }

  documentNumberKeyPress(event: any) {
    if (this.mainFormGroup.controls.documentType.value == "") return;
    CommonMethods.validarNroDocumento(event, this.mainFormGroup.controls.documentType.value)
  }

  cleanValidation() {
    this.isValidatedInClickButton = false;
  }

  /**
   * Limpia todos los campos
   */
  cleanInputs() {
    this.mainFormGroup.controls.documentNumber.patchValue("");
    this.mainFormGroup.controls.paternalLastName.patchValue("");
    this.mainFormGroup.controls.maternalLastName.patchValue("");
    this.mainFormGroup.controls.firstName.patchValue("");
    this.mainFormGroup.controls.legalName.patchValue("");
  }

  /**
   * Deshabilita todas las validaciones
   */
  disableCommonValidators() {
    this.mainFormGroup.controls.documentNumber.setValidators(null);
    this.mainFormGroup.controls.documentNumber.updateValueAndValidity();

    this.mainFormGroup.controls.startDate.setValidators(null);
    this.mainFormGroup.controls.startDate.updateValueAndValidity();
    this.mainFormGroup.controls.endDate.setValidators(null);
    this.mainFormGroup.controls.endDate.updateValueAndValidity();
    this.mainFormGroup.controls.firstName.setValidators(null);
    this.mainFormGroup.controls.firstName.updateValueAndValidity();
    this.mainFormGroup.controls.paternalLastName.setValidators(null);
    this.mainFormGroup.controls.paternalLastName.updateValueAndValidity();
    this.mainFormGroup.controls.maternalLastName.setValidators(null);
    this.mainFormGroup.controls.maternalLastName.updateValueAndValidity();
    this.mainFormGroup.controls.legalName.setValidators(null);
    this.mainFormGroup.controls.legalName.updateValueAndValidity();
  }

  /**
   * Cambiar validaciones según modo
   * Cambiar tamaño de número de documento según el tipo de documento
   */
  changeValidators() {
    //Volvemos a configurar el tamaño del campo de número de documento según el tipo de documento
    this.bsValueIni = ModuleConfig.StartDate; //Fecha inicial del componente
    this.bsValueFin = ModuleConfig.EndDate;  //Fecha final del componente
    let response = CommonMethods.selTipoDocumento(this.mainFormGroup.controls.documentType.value)
    this.documentNumberLength = response.maxlength

    this.disableCommonValidators();
    this.cleanInputs();
    this.isValidatedInClickButton = false;

    if (this.mainFormGroup.controls.searchMode.value == "1") {  //modo: Por documento
      if (this.mainFormGroup.controls.documentType.value == "2") { //DNI
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else if (this.mainFormGroup.controls.documentType.value == "1") { //Ruc
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(11), Validators.minLength(11), GlobalValidators.rucNumberValidator]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else if (this.mainFormGroup.controls.documentType.value == "4" || this.mainFormGroup.controls.documentType.value == "6") { //ce y passaporte
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else { //otros tipos de documento
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(15)]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      }
      this.mainFormGroup.controls.startDate.setValidators([Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]);
      this.mainFormGroup.controls.startDate.updateValueAndValidity();
      this.mainFormGroup.controls.endDate.setValidators([Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]);
      this.mainFormGroup.controls.endDate.updateValueAndValidity();
      this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
      this.mainFormGroup.updateValueAndValidity();
    } else {  //Por nombres
      if (this.mainFormGroup.controls.personType.value == "1") {  //Apellido paterno, apellido materno y nombres
        this.mainFormGroup.controls['firstName'].setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(19), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation, Validators.pattern(GlobalValidators.getLatinTextPattern())]);
        this.mainFormGroup.controls.firstName.updateValueAndValidity();
        this.mainFormGroup.controls['paternalLastName'].setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(19), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation, Validators.pattern(GlobalValidators.getLatinTextPattern())]);
        this.mainFormGroup.controls.paternalLastName.updateValueAndValidity();
        this.mainFormGroup.controls['maternalLastName'].setValidators([Validators.maxLength(19), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation, Validators.pattern(GlobalValidators.getLatinTextPattern())]);
        this.mainFormGroup.controls.maternalLastName.updateValueAndValidity();
      } else {  //Por razón social
        this.mainFormGroup.controls['legalName'].setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]);
        this.mainFormGroup.controls.legalName.updateValueAndValidity();
      }
    }
  }

  /**
   * Obtener lista de tipos de documento
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
   * Abrir modal de agenciamiento
   */
  openAgencyModal() {
    if (this.filter.BrokerId == null || this.filter.BrokerId.toString().trim() == "" || this.filter.ChannelTypeId == null || this.filter.ChannelTypeId.toString().trim() == null) {
      Swal.fire("Información", "El broker o el tipo de canal no han sido obtenidos correctamente", "error");
    } else {
      const modalRef = this.modalService.open(AgencyFormComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
      modalRef.componentInstance.formModalReference = modalRef; //Referencia a modal
      modalRef.componentInstance.documentTypeList = this.documentTypeList;  //Lista de tipos de documento
      modalRef.componentInstance.brokerId = this.filter.BrokerId; //Id de broker
      modalRef.componentInstance.channelTypeId = this.filter.ChannelTypeId; //Id de tipo de canal
      modalRef.componentInstance.brokerFullName = this.filter.FullName; //Nombre completo de broker
      modalRef.componentInstance.brokerDocumentType = this.filter.DocumentTypeId; //Tipo de documento de broker
      modalRef.componentInstance.brokerDocumentNumber = this.filter.DocumentNumber; //Número de documento de broker

      modalRef.result.then((shouldToUpdateLocationTable) => {
        if (shouldToUpdateLocationTable == true) { // Verificar si debemos actualizar la tabla
          this.firstSearch();
        }
      }, (reason) => {
      });
    }

  }

  /**
   * Búsqueda de broker-agenciamiento accionado por los botones de cambios de paginación
   * @param page número de página
   */
  pageChanged(page: number) {
    this.searchAgency();
  }

  /**
   * Primera búsqueda de broker-agenciamiento
   * Se acciona al presionar el botón "buscar" o la tecla Enter enlazada al control correspondiente
   */
  firstSearch() {

    this.filter.PageNumber = 1;
    this.isValidatedInClickButton = true;
    if (this.mainFormGroup.valid) {
      let obj: any = {}
      obj.P_NTIPO_BUSQUEDA = this.mainFormGroup.controls.searchMode.value;
      obj.P_NTIPO_DOC = this.mainFormGroup.controls.documentType.value;
      obj.P_NNUM_DOC = this.mainFormGroup.controls.documentNumber.value;
      obj.P_IS_AGENCY = '1';  //Solo va a buscar los que tienen tipo de canal 6 y 9
      if (this.mainFormGroup.controls.personType.value == "1") {
        obj.P_SNOMBRE = this.mainFormGroup.controls.firstName.value;
        obj.P_SAP_PATERNO = this.mainFormGroup.controls.paternalLastName.value;
        obj.P_SAP_MATERNO = this.mainFormGroup.controls.maternalLastName.value;
      } else {
        obj.P_SNOMBRE_LEGAL = this.mainFormGroup.controls.legalName.value;
      }
      this.searchBroker(obj);
    } else {
      let errorList = [];
      if (this.mainFormGroup.controls.documentNumber.valid == false) {
        if (this.mainFormGroup.controls.documentNumber.hasError('required')) errorList.push("El número de documento es requerido.");
        else errorList.push("El número de documento no es válido.");
      }

      if (this.mainFormGroup.controls.startDate.valid && this.mainFormGroup.controls.endDate.valid) {
        if (this.mainFormGroup.hasError("datesNotSortedCorrectly")) errorList.push(ModuleConfig.InvalidStartDateOrderMessage);
      } else {
        if (this.mainFormGroup.controls.startDate.valid == false) {
          if (this.mainFormGroup.controls.startDate.hasError('required')) errorList.push("La fecha de inicio es requerida.");
          else errorList.push(ModuleConfig.InvalidStartDateMessage);
        }
        if (this.mainFormGroup.controls.endDate.valid == false) {
          if (this.mainFormGroup.controls.endDate.hasError('required')) errorList.push("La fecha de fin es requerida.");
          else errorList.push(ModuleConfig.InvalidEndDateMessage);
        }
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
   * Extrae los datos que provee el servicio
   */
  searchBroker(obj: any) {
    this.isLoading = true;
    this.quotationService.searchBroker(obj).subscribe(
      res => {
        if (res.P_NCODE == 0) {
          if (res.listBroker != null && res.listBroker.length > 0) {  //Si solo se ha encontrado un registro, empezamos con la búsqueda de agenciamientos
            if (res.listBroker.length == 1) {
              this.filter.BrokerId = res.listBroker[0].NCORREDOR;
              this.filter.ChannelTypeId = res.listBroker[0].NTYPECHANNEL;
              this.filter.StartDate = this.mainFormGroup.controls.startDate.value;
              this.filter.EndDate = this.mainFormGroup.controls.endDate.value;

              this.filter.DocumentTypeId = res.listBroker[0].NTIPDOC;
              this.filter.DocumentNumber = res.listBroker[0].NNUMDOC;
              this.filter.FullName = res.listBroker[0].RAZON_SOCIAL;

              this.mainFormGroup.controls.searchMode.patchValue("1");
              this.mainFormGroup.controls.documentType.patchValue(this.filter.DocumentTypeId);
              this.mainFormGroup.controls.documentNumber.patchValue(this.filter.DocumentNumber);
              this.searchAgency();
            } else {  //Si se ha encontrado más de un resultado, mostramos el modal de selección
              this.openSearchModal(res.listBroker);
            }
          } else {
            this.filter.BrokerId = "";
            this.filter.ChannelTypeId = "";
            this.filter.DocumentTypeId = "";
            this.filter.DocumentNumber = "";
            this.filter.FullName = "";

            this.foundResults = [];
            Swal.fire("Información", "No se ha encontrado resultados.", "error");
          }
        } else {
          this.filter.BrokerId = "";
          this.filter.ChannelTypeId = "";
          this.filter.DocumentTypeId = "";
          this.filter.DocumentNumber = "";
          this.filter.FullName = "";

          this.foundResults = [];
          Swal.fire("Información", res.P_SMESSAGE, "error");
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire("Información", this.genericErrorMessage, "error");
      }
    );
  }

  searchAgency() {
    this.agencyService.getBrokerAgencyList(this.filter).subscribe(
      res => {
        this.foundResults = res.GenericResponse;
        if (res.GenericResponse != null && res.GenericResponse.length > 0) {
          this.totalItems = res.TotalRowNumber;
        } else {
          this.totalItems = 0;
          Swal.fire("Información", "Este broker no tiene agenciamientos para el rango de fecha seleccionado.", "error");
        }
      },
      error => {
        this.totalItems = 0;
        Swal.fire("Información", this.genericErrorMessage, "error");
      }
    )
  }
  /**
   * Abre el modal de búsqueda para los casos en qué se encuentre más de un resultado en la búsqueda de brokers
   */
  openSearchModal(foundResults: any[]) {
    const modalRef = this.modalService.open(BrokerSearchBynameComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.foundResults = foundResults;

    modalRef.result.then((brokerData) => { //Esperamos los datos del broker de respuesta
      if (brokerData != null) {
        this.filter.BrokerId = brokerData.NCORREDOR;
        this.filter.ChannelTypeId = brokerData.NTYPECHANNEL;
        this.filter.DocumentTypeId = brokerData.NTIPDOC;
        this.filter.DocumentNumber = brokerData.NNUMDOC;
        this.filter.FullName = brokerData.RAZON_SOCIAL;

        this.filter.StartDate = this.mainFormGroup.controls.startDate.value;
        this.filter.EndDate = this.mainFormGroup.controls.endDate.value;

        this.mainFormGroup.controls.searchMode.patchValue("1");
        this.mainFormGroup.controls.documentType.patchValue(this.filter.DocumentTypeId);
        this.mainFormGroup.controls.documentNumber.patchValue(this.filter.DocumentNumber);
      }
    }, (reason) => {
    });
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
  stringToList(inputString: string): string[] {
    let isFirst: Boolean = true;
    let responseList: string[] = [];
    while (inputString.search("-") != -1) {
      if (isFirst == true) {
        isFirst = false;
        inputString = inputString.substring(inputString.search("-") + 1);
      } else {
        responseList.push(inputString.substring(0, inputString.search("-")));
        inputString = inputString.substring(inputString.search("-") + 1);
      }
    }
    return responseList;
  }
  downloadFile(filePath: string, rootName: string) {
    this.othersService.downloadFile(filePath).subscribe(
      res => {
        var newBlob = new Blob([res], { type: "application/pdf" });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }
        const data = window.URL.createObjectURL(newBlob);

        var link = document.createElement('a');
        link.href = data;

        link.download = filePath.substring(filePath.lastIndexOf("\\") + 1);
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        setTimeout(function () {
          window.URL.revokeObjectURL(data);
          link.remove();
        }, 100);
      },
      err => {
        Swal.fire('Información', 'El archivo no ha sido encontrado.', 'error');
      }
    );
  }

}
