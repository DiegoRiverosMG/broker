import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from "@angular/forms";
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ContractorViewComponent } from '../contractor-view/contractor-view.component';
import { ActivatedRoute, Router } from "@angular/router";
import Swal from 'sweetalert2';
import { SearchContractingComponent } from '../../../../modal/search-contracting/search-contracting.component';
//Importación de servicios
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { ContractorLocationIndexService } from '../../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';

//Importación de modelos
import { DocumentType } from '../../../../models/shared/client-information/document-type';
import { ClientDataToSearch } from '../../../../models/shared/client-information/client-data-to-search';
import { ContractorForTable } from '../../../../models/maintenance/contractor-location/contractor-for-table';
import { Contractor } from '../../../../models/maintenance/contractor-location/contractor';
//Datos Globales
import { CommonMethods } from './../../../common-methods';
import { GlobalValidators } from './../../../global-validators';
import { ModuleConfig } from './../../../module.config';
import { AccessFilter } from './../../../access-filter';

import { AppConfig } from '../../../../../../app.config';
import { ButtonVisaComponent } from '../../../../../../shared/components/button-visa/button-visa.component';
import { Certificado } from '../../../../models/certificado/certificado';
@Component({
  selector: 'app-contractor-location-index',
  templateUrl: './contractor-location-index.component.html',
  styleUrls: ['./contractor-location-index.component.css']
})
export class ContractorLocationIndexComponent implements OnInit {
  currentClient = new ContractorForTable();  //Datos de cliente actual encontrado en el método firstSearch(), que será usado para el método pageChanged() que procesa la paginación

  public documentTypeList: any = []; //Lista de tipos de documento

  public isLoadingScreenNotVisible: boolean = true;
  public isValidatedInClickButton: boolean = false;

  documentNumberLength: number = 0; //Tamaño de campo de número de documento, este valor es variable
  /*
    Variables de paginación
  */
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  public existResults: boolean;

  mainFormGroup: FormGroup;
  genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico
  redirectionMessage = ModuleConfig.RedirectionMessage;
  invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
  invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
  invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
  invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;
  listToShow: any;
  codProducto = JSON.parse(localStorage.getItem("codProducto")) ? JSON.parse(localStorage.getItem("codProducto"))["productId"] : null;
  //epsItem: any = JSON.parse(sessionStorage.getItem("eps"));
  epsItem: any = JSON.parse(localStorage.getItem("eps"));
  variable: any = {}
  lblProducto: string = "";
  lblFecha: string = "";

  constructor(private modalService: NgbModal,
    private clientInformationService: ClientInformationService,
    private contractorLocationIndexService: ContractorLocationIndexService,
    private mainFormBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.getDocumentTypeList();
    // Configuracion de las variables
    this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
    this.lblFecha = CommonMethods.tituloPantalla()
    if (AccessFilter.hasPermission(ModuleConfig.ViewIdList["contractor_location"]) == false) this.router.navigate(['/extranet/home']);
    this.createForm();
    this.initializeForm();
    this.activatedRoute.queryParams.subscribe(params => {

      if (params.Sender != null && params.Sender == "add-contractor") {
        this.mainFormGroup.controls.searchMode.patchValue("1");
        this.mainFormGroup.controls.documentType.patchValue(params.DocumentType);
        this.changeValidators();
        this.mainFormGroup.controls.documentNumber.patchValue(params.DocumentNumber);

        this.firstSearch();
      }
    });
  }

  /**
   * Evento que se dispara al presionar una tecla en el campo Número de Documento y restringe el ingreso según el tipo de documento
   * @param event datos del evento KeyPress
   */
  documentNumberKeyPress(event: any, documentType: string) {

    if (this.mainFormGroup.controls.documentType.value == "") return;
    CommonMethods.validarNroDocumento(event, documentType)
  }
  openContractorModal(item: any) {
    const modalRef = this.modalService.open(ContractorViewComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.contractor = item;

    modalRef.result.then((shouldReload) => {
      if (shouldReload == true) {
        this.currentPage = 1;
        this.processPageChanged();
      }
    }, (reason) => {
    });
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

  cleanValidators() {
    this.isValidatedInClickButton = false;
  }
  cleanPaternalLastNameValidator() {
    this.mainFormGroup.controls.paternalLastName.markAsUntouched();
    this.mainFormGroup.controls.paternalLastName.updateValueAndValidity();
  }
  cleanMaternalLastNameValidator() {
    this.mainFormGroup.controls.maternalLastName.markAsUntouched();
    this.mainFormGroup.controls.maternalLastName.updateValueAndValidity();
  }
  cleanFirstNameValidator() {
    this.mainFormGroup.controls.firstName.markAsUntouched();
    this.mainFormGroup.controls.firstName.updateValueAndValidity();
  }
  cleanInputs() {
    this.mainFormGroup.controls.documentNumber.patchValue(null);
    this.mainFormGroup.controls.paternalLastName.patchValue(null);
    this.mainFormGroup.controls.maternalLastName.patchValue(null);
    this.mainFormGroup.controls.firstName.patchValue(null);
    this.mainFormGroup.controls.legalName.patchValue(null);
  }
  changeValidators() {
    let response = CommonMethods.selTipoDocumento(this.mainFormGroup.controls.documentType.value)
    this.documentNumberLength = response.maxlength

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

  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      documentNumber: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator, GlobalValidators.onlyNumberValidator]],
      paternalLastName: ["", [Validators.maxLength(19)]],
      maternalLastName: ["", [Validators.maxLength(19)]],
      firstName: ["", [Validators.maxLength(19)]],
      legalName: ["", [Validators.maxLength(60)]],
      searchMode: ["1"],
      documentType: [""],
      personType: ["1"]
    });
  }
  private initializeForm() {
    this.mainFormGroup.controls.searchMode.setValue('1');
    this.mainFormGroup.controls.documentType.setValue('');
    this.mainFormGroup.controls.personType.setValue('1');
  }

  /**
   * Obtiene la lista de tipos de documentos
   */
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(0).subscribe(
      res => {
        this.documentTypeList = res;
      },
      err => {
        Swal.fire("Información", "Error inesperado, contáctese con soporte.", "warning");
      }
    );
  }
  firstSearch() {
    this.isValidatedInClickButton = true;
    if (this.mainFormGroup.valid) {
      this.currentPage = 1;
      this.processFirstSearch();
    } else {
      let errorList = [];
      if (this.mainFormGroup.controls.searchMode.value == "1") {
        if (this.mainFormGroup.controls.documentNumber.valid == false) {
          if (this.mainFormGroup.controls.documentNumber.hasError('required')) errorList.push("El número de documento es requerido.");
          else errorList.push("El nro de documento no es válido.");
        }
      } else {
        if (this.mainFormGroup.controls.personType.value == "1") {
          if (this.mainFormGroup.controls.firstName.valid == false) {
            if (this.mainFormGroup.controls.firstName.hasError('required'))
              errorList.push("El nombre es requerido.");
            else errorList.push("El nombre no es válido.");
          } else {
            if (this.mainFormGroup.controls.firstName.value == null || this.mainFormGroup.controls.firstName.value.trim() == "") {
              this.mainFormGroup.controls.firstName.setValue('');
              errorList.push("El nombre es requerido.");
            }
          }

          if (this.mainFormGroup.controls.paternalLastName.valid == false) {
            if (this.mainFormGroup.controls.paternalLastName.hasError('required')) errorList.push("El apellido paterno es requerido.");
            else errorList.push("El apellido paterno no es válido.");
          } else {
            if (this.mainFormGroup.controls.paternalLastName.value == null || this.mainFormGroup.controls.paternalLastName.value.trim() == "") {
              this.mainFormGroup.controls.paternalLastName.setValue('');
              errorList.push("El apellido paterno es requerido.");
            }
          }

          if (this.mainFormGroup.controls.maternalLastName.valid == false) {
            if (this.mainFormGroup.controls.maternalLastName.hasError('required')) errorList.push("El apellido materno es requerido.");
            else errorList.push("El apellido materno no es válido.");
          }
        } else {
          if (this.mainFormGroup.controls.legalName.valid == false) {
            if (this.mainFormGroup.controls.legalName.hasError('required')) errorList.push("La razón social es requerida.");
            else errorList.push("La razón social no es válida.");
          } else {
            if (this.mainFormGroup.controls.legalName.value == null || this.mainFormGroup.controls.legalName.value.trim() == "") {
              this.mainFormGroup.controls.legalName.setValue('');
              errorList.push("La razón social es requerido.");
            }
          }
        }
      }

      Swal.fire('Información', this.listToString(errorList), 'error');
    }

  }
  pageChanged(page: number) {
    this.currentPage = page;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  processPageChanged() {
    this.foundResults = [];
    this.isLoadingScreenNotVisible = false;
    this.contractorLocationIndexService.getContractorLocationList(this.currentClient.Id, this.itemsPerPage, this.currentPage).subscribe(
      res_2 => {
        if (res_2.P_NCODE == 0) {
          let self = this;
          res_2.GENERICLIST.forEach(function (item) {
            let row = new ContractorForTable();
            row.Id = self.currentClient.Id;
            row.DocumentNumber = self.currentClient.DocumentNumber;
            row.DocumentType = self.currentClient.DocumentType;
            row.FullName = self.currentClient.FullName;
            row.Address = self.currentClient.Address;
            row.Phone = self.currentClient.Phone;
            row.Email = self.currentClient.Email;

            row.LocationType = item.Type;
            row.LocationDescription = item.Description;
            row.LocationStatus = item.State;

            row.LocationAddress = item.Address;
            row.LocationDistrict = item.DistrictName;
            row.LocationProvince = item.ProvinceName;
            row.LocationDepartment = item.DepartmentName;
            row.LocationEconomicActivity = item.EconomicActivity;

            self.foundResults.push(row);
          });
          this.totalItems = this.foundResults.length;
          if (this.totalItems == 0) {
            this.foundResults.push(this.currentClient)
          }
          this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
          this.isLoadingScreenNotVisible = true;
        } else {
          Swal.fire('Información', this.listToString(this.stringToList(res_2.P_SMESSAGE)), 'error');
          this.isLoadingScreenNotVisible = true;
        }
      },
      err_2 => {
        this.isLoadingScreenNotVisible = true;
        Swal.fire("Información", this.genericErrorMessage, "error");
      }
    );
  }
  processFirstSearch() {

    this.foundResults = [];
    this.isLoadingScreenNotVisible = false;
    this.existResults = false;

    let data = new ClientDataToSearch();
    data.P_TipOper = "CON";
    data.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

    if (this.mainFormGroup.controls.searchMode.value == "1") {
      data.P_NIDDOC_TYPE = this.mainFormGroup.controls.documentType.value.toString();
      data.P_SIDDOC = this.mainFormGroup.controls.documentNumber.value.toString().toUpperCase();
    } else {
      if (this.mainFormGroup.controls.personType.value == "1") {
        if (this.mainFormGroup.controls.firstName.value.trim() != '' ||
          this.mainFormGroup.controls.paternalLastName.value.trim() != '') {
          data.P_NIDDOC_TYPE = "";
          data.P_SIDDOC = "";
          data.P_SFIRSTNAME = this.mainFormGroup.controls.firstName.value.toString().toUpperCase();
          data.P_SLASTNAME = this.mainFormGroup.controls.paternalLastName.value.toString().toUpperCase();
          data.P_SLASTNAME2 = this.mainFormGroup.controls.maternalLastName.value == null ? "" : this.mainFormGroup.controls.maternalLastName.value.toString().toUpperCase();
          data.P_SLEGALNAME = "";
        } else {
          let msjError = ""
          msjError += this.mainFormGroup.controls.firstName.value.trim() == "" ? "El nombre es requerido. <br>" : ""
          msjError += this.mainFormGroup.controls.paternalLastName.value.trim() == "" ? "El apellido paterno es requerido." : ""
          this.mainFormGroup.controls.firstName.setValue(this.mainFormGroup.controls.firstName.value.trim() == "" ? "" : this.mainFormGroup.controls.firstName.value)
          this.mainFormGroup.controls.paternalLastName.setValue(this.mainFormGroup.controls.paternalLastName.value.trim() == "" ? "" : this.mainFormGroup.controls.paternalLastName.value)
          this.isLoadingScreenNotVisible = true;
          Swal.fire("Información", msjError, "error");
          return
        }

      } else {
        if (this.mainFormGroup.controls.legalName.value.trim() != '') {
          data.P_NIDDOC_TYPE = "";
          data.P_SIDDOC = "";
          data.P_SLEGALNAME = this.mainFormGroup.controls.legalName.value.toString().toUpperCase().tri;
          data.P_SFIRSTNAME = "";
          data.P_SLASTNAME = "";
          data.P_SLASTNAME2 = "";
        } else {
          let msjError = ""
          msjError += this.mainFormGroup.controls.legalName.value.trim() == "" ? "La razón social es requerida. <br>" : ""
          this.mainFormGroup.controls.legalName.setValue(this.mainFormGroup.controls.legalName.value.trim() == "" ? "" : this.mainFormGroup.controls.legalName.value)
          this.isLoadingScreenNotVisible = true;
          Swal.fire("Información", msjError, "error");
          return
        }
      }

    }

    this.clientInformationService.getCliente360(data).subscribe(
      res => {
        let self = this;
        if (res.P_NCODE == 0) {
          if (res.EListClient != null && res.EListClient.length > 0) {
            if (res.EListClient.length != 1) {
              this.isLoadingScreenNotVisible = true;
              const modalRef = this.modalService.open(SearchContractingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
              modalRef.componentInstance.formModalReference = modalRef;
              modalRef.componentInstance.EListClient = res.EListClient;

              modalRef.result.then((item) => {
                if (item != null) {
                  this.currentClient.Id = item.P_SCLIENT;
                  this.currentClient.DocumentNumber = item.P_SIDDOC;

                  this.currentClient.LocationDescription = "";
                  this.currentClient.LocationStatus = "";
                  this.currentClient.LocationType = "";

                  if (item.EListAddresClient != null && item.EListAddresClient.length > 0) this.currentClient.Address = item.EListAddresClient[0].P_SDESDIREBUSQ;
                  else this.currentClient.Address = "";

                  if (item.EListPhoneClient != null && item.EListPhoneClient.length > 0) this.currentClient.Phone = item.EListPhoneClient[0].P_SPHONE;
                  else this.currentClient.Phone = "";

                  if (item.EListEmailClient != null && item.EListEmailClient.length > 0) this.currentClient.Email = item.EListEmailClient[0].P_SE_MAIL;
                  else this.currentClient.Email = "";

                  if (item.P_NIDDOC_TYPE == "1") {
                    this.currentClient.DocumentType = "RUC";
                    this.currentClient.FullName = item.P_SLEGALNAME;
                  } else {
                    if (this.documentTypeList.length > 0) {
                      this.documentTypeList.map(function (element) {
                        if (element.Id == item.P_NIDDOC_TYPE) self.currentClient.DocumentType = element.Name;
                      });
                    }

                    let name = item.P_SFIRSTNAME == null ? "" : item.P_SFIRSTNAME
                    let lastname = item.P_SLASTNAME == null ? "" : item.P_SLASTNAME
                    let lastname2 = item.P_SLASTNAME2 == null ? "" : item.P_SLASTNAME2

                    this.currentClient.FullName = name + " " + lastname + " " + lastname2
                  }
                  this.processPageChanged();
                }
              }, (reason) => {
              });
            } else if (res.EListClient[0].P_SCLIENT != null) {
              if (res.EListClient[0].P_SIDDOC != null) {
                this.currentClient.Id = res.EListClient[0].P_SCLIENT;
                this.currentClient.DocumentNumber = res.EListClient[0].P_SIDDOC;

                this.currentClient.LocationDescription = "";
                this.currentClient.LocationStatus = "";
                this.currentClient.LocationType = "";

                if (res.EListClient[0].EListAddresClient != null && res.EListClient[0].EListAddresClient.length > 0) this.currentClient.Address = res.EListClient[0].EListAddresClient[0].P_SDESDIREBUSQ;
                else this.currentClient.Address = "";

                if (res.EListClient[0].EListPhoneClient != null && res.EListClient[0].EListPhoneClient.length > 0) this.currentClient.Phone = res.EListClient[0].EListPhoneClient[0].P_SPHONE;
                else this.currentClient.Phone = "";

                if (res.EListClient[0].EListEmailClient != null && res.EListClient[0].EListEmailClient.length > 0) this.currentClient.Email = res.EListClient[0].EListEmailClient[0].P_SE_MAIL;
                else this.currentClient.Email = "";

                if (res.EListClient[0].P_NIDDOC_TYPE == "1") {
                  this.currentClient.DocumentType = "RUC";
                  this.currentClient.FullName = res.EListClient[0].P_SLEGALNAME;
                } else {
                  if (this.documentTypeList.length > 0) {
                    this.documentTypeList.map(function (item) {
                      if (item.Id == res.EListClient[0].P_NIDDOC_TYPE) self.currentClient.DocumentType = item.Name;
                    });
                  }

                  let name = res.EListClient[0].P_SFIRSTNAME == null ? "" : res.EListClient[0].P_SFIRSTNAME
                  let lastname = res.EListClient[0].P_SLASTNAME == null ? "" : res.EListClient[0].P_SLASTNAME
                  let lastname2 = res.EListClient[0].P_SLASTNAME2 == null ? "" : res.EListClient[0].P_SLASTNAME2

                  this.currentClient.FullName = name + " " + lastname + " " + lastname2
                }

                this.contractorLocationIndexService.getContractorLocationList(res.EListClient[0].P_SCLIENT, this.itemsPerPage, this.currentPage).subscribe(
                  res_2 => {
                    if (res_2.P_NCODE == 0) {
                      if (res_2.GENERICLIST != null) {
                        res_2.GENERICLIST.forEach(function (item) {
                          let row: any = [];
                          row.Id = self.currentClient.Id;
                          row.DocumentNumber = self.currentClient.DocumentNumber;
                          row.DocumentType = self.currentClient.DocumentType;
                          row.FullName = self.currentClient.FullName;
                          row.Address = self.currentClient.Address;
                          row.Phone = self.currentClient.Phone;
                          row.Email = self.currentClient.Email;

                          row.LocationDescription = item.Description;
                          row.LocationStatus = item.State;
                          row.LocationType = item.Type;

                          row.LocationAddress = item.Address;
                          row.LocationDistrict = item.DistrictName;
                          row.LocationProvince = item.ProvinceName;
                          row.LocationDepartment = item.DepartmentName;
                          row.LocalActivity = item.Activity;
                          row.LocationEconomicActivity = item.EconomicActivity;

                          self.foundResults.push(row)
                        });
                        this.totalItems = this.foundResults.length;
                        if (this.totalItems == 0) {
                          this.foundResults.push(this.currentClient)
                        }

                        this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                        this.isLoadingScreenNotVisible = true;
                      } else {
                        this.foundResults.push(this.currentClient)
                        this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                        this.isLoadingScreenNotVisible = true;
                      }
                    } else {
                      Swal.fire('Información', this.listToString(this.stringToList(res_2.P_SMESSAGE)), 'error');
                      this.isLoadingScreenNotVisible = true;
                    }
                  },
                  err_2 => {
                    this.isLoadingScreenNotVisible = true;
                  }
                );
              } else {
                Swal.fire("Información", "El contratante no cuenta con el nro de documento.", "error");
                this.isLoadingScreenNotVisible = true;
              }

            } else {
              this.isLoadingScreenNotVisible = true;
              if (this.mainFormGroup.controls.searchMode.value == "1") {
                Swal.fire({
                  title: 'Información',
                  text: 'El contratante que estás buscando no está registrado ¿Deseas agregarlo?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Aceptar',
                  cancelButtonText: 'Cancelar'
                }).then((result) => {
                  if (result.value) {
                    this.router.navigate(['/extranet/add-contracting'], { queryParams: { typeDocument: this.mainFormGroup.controls.documentType.value, document: this.mainFormGroup.controls.documentNumber.value, receiver: "contractor-location" } });
                  } else if (result.dismiss === Swal.DismissReason.cancel) {
                  }
                });
              } else {
                Swal.fire("Información", "No hay información con los datos ingresados.", "error");
              }

            }

          } else {
            this.isLoadingScreenNotVisible = true;
            if (this.mainFormGroup.controls.searchMode.value == "1") {
              if (this.mainFormGroup.controls.documentType.value.toString() != "1" && this.mainFormGroup.controls.documentType.value.toString() != "2") {
                Swal.fire({
                  title: 'Información',
                  text: 'El contratante que estás buscando no está registrado ¿Deseas agregarlo?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Aceptar',
                  cancelButtonText: 'Cancelar'
                }).then((result) => {
                  if (result.value) {
                    this.router.navigate(['/extranet/add-contracting'], { queryParams: { typeDocument: this.mainFormGroup.controls.documentType.value, document: this.mainFormGroup.controls.documentNumber.value, receiver: "contractor-location" } });
                  } else if (result.dismiss === Swal.DismissReason.cancel) {
                  }
                });
              } else {
                Swal.fire("Información", "No hay información con los datos ingresados.", "error");
              }

            } else {
              Swal.fire("Información", "No hay información con los datos ingresados.", "error");
            }

          }

        } else if (res.P_NCODE == 3) {
          this.isLoadingScreenNotVisible = true;
          if (this.mainFormGroup.controls.searchMode.value == "1") {
            if (this.mainFormGroup.controls.documentType.value.toString() != "1" && this.mainFormGroup.controls.documentType.value.toString() != "2") {
              Swal.fire({
                title: 'Información',
                text: 'El contratante que estás buscando no está registrado ¿Deseas agregarlo?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
              }).then((result) => {
                if (result.value) {
                  this.router.navigate(['/extranet/add-contracting'], { queryParams: { typeDocument: this.mainFormGroup.controls.documentType.value, document: this.mainFormGroup.controls.documentNumber.value, receiver: "contractor-location" } });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                }
              });
            } else {
              Swal.fire("Información", "No hay información con los datos ingresados.", "error");
            }

          } else {
            Swal.fire("Información", "No hay información con los datos ingresados", "error");
          }
        } else if (res.P_NCODE == 1) {
          this.isLoadingScreenNotVisible = true;
          Swal.fire('Información', res.P_SMESSAGE, 'error');  //Error controlado
        }
        else {
          this.isLoadingScreenNotVisible = true;
          Swal.fire('Información', this.genericErrorMessage, 'error');  //Error controlado
        }

      },
      err => {
        this.isLoadingScreenNotVisible = true;
        Swal.fire("Información", "Error inesperado, contáctese con soporte.", "error");
      }

    );

  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  //SEPARAR MENSAJE DE ERROR DE SP
  splitErrorMessage(acumulatedMessage: string): string[] {
    let isFirst: Boolean = true;
    let response: string[] = [];
    while (acumulatedMessage.search("-") != -1) {
      if (isFirst == true) {
        isFirst = false;
        acumulatedMessage = acumulatedMessage.substring(acumulatedMessage.search("-") + 1);
      } else {
        response.push(acumulatedMessage.substring(0, acumulatedMessage.search("-")));
        acumulatedMessage = acumulatedMessage.substring(acumulatedMessage.search("-") + 1);
      }
    }
    response.push(acumulatedMessage);
    return response;
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
}
