import { Component, OnInit, Pipe, PipeTransform, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin, Observable } from 'rxjs';
//Modales
import { SearchContractingComponent } from '../../../../modal/search-contracting/search-contracting.component'
//Importación de servicios
import { AgencyService } from '../../../../services/maintenance/agency/agency.service';
import { OthersService } from '../../../../services/shared/others.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { ContractorLocationIndexService } from '../../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
//Modelos
import { ContractorForTable } from '../../../../models/maintenance/contractor-location/contractor-for-table';
import { Agency } from '../../../../models/maintenance/agency/request/agency';
import { ClientDataToSearch } from '../../../../models/shared/client-information/client-data-to-search';

//Configuración
import { GlobalValidators } from './../../../global-validators';
import { ModuleConfig } from './../../../module.config';
import { CommonMethods } from '../../../common-methods';

@Component({
    selector: 'app-agency-form',
    templateUrl: './agency-form.component.html',
    styleUrls: ['./agency-form.component.css']
})

export class AgencyFormComponent implements OnInit {
    @Input() formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí

    public isLoading: boolean = false;
    @Input() public brokerId: string; //id de broker
    @Input() public brokerDocumentType: string; //id de broker
    @Input() public brokerDocumentNumber: string; //id de broker
    @Input() public brokerFullName: string; //id de broker
    @Input() public channelTypeId: string; //tipo de canal
    @Input() documentTypeList: any[] = [];
    public bsConfig: Partial<BsDatepickerConfig>;
    public bsValue: Date = new Date();

    /**Datos del contratante */
    public contractor = new ContractorForTable();

    public mainFormGroup: FormGroup;

    /**Formulario de búsqueda contratante */
    public contractorFormGroup: FormGroup;
    /**Tamaño máximo de número de documento */
    documentNumberLength: number = 0;
    isValidatedInClickButton: boolean = false;

    public sctrSaludFile: File;
    public sctrPensionFile: File;
    public isSctrSaludSelected: boolean = false;
    public isSctrPensionSelected: boolean = false;
    public sctrPensionSucceed: Boolean = false;
    public sctrSaludSucceed: Boolean = false;

    public bsPension: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    public bsSalud: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    public rotate = true; //
    public maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    public itemsPerPage = 3; // limite de items por página
    public totalItemsPension = 0; //total de items encontrados
    public totalItemsSalud = 0; //total de items encontrados
    public currentPagePension = 1;
    public currentPageSalud = 1;
    public foundResultsPension: any[] = [];
    public foundResultsSalud: any[] = [];
    tabPension: boolean = true;
    tabSalud: boolean = false;

    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    saludID = JSON.parse(localStorage.getItem('saludID'));

    NotFoundMessage: string = ModuleConfig.NotFoundMessage;
    GenericErrorMessage: string = ModuleConfig.GenericErrorMessage;
    RedirectionMessage: string = ModuleConfig.RedirectionMessage;
    codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"]

    constructor(private mainFormBuilder: FormBuilder, private clientInformationService: ClientInformationService, private router: Router, private activatedRoute: ActivatedRoute, private contractorLocationIndexService: ContractorLocationIndexService
        , private agencyService: AgencyService, private othersService: OthersService,
        private modalService: NgbModal) {
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
        this.createContractorForm();
        this.createForm();
        this.initializeForm();
    }

    showTabs(tab) {
        switch (tab) {
            case '1':
                this.tabPension = true;
                this.tabSalud = false;
                break;
            case '2':
                this.tabPension = false;
                this.tabSalud = true;
                break;
            default:
                this.tabPension = true;
                this.tabSalud = false;
        }
    }

    firstSearch() {
        this.currentPagePension = 1;
        this.currentPageSalud = 1;
        this.getLastBrokerList(this.pensionID.id, 1);
        this.getLastBrokerList(this.saludID.id, 1);
    }

    pageChanged(event, idProducto) {
        this.currentPagePension = this.pensionID.id == idProducto ? event : this.currentPagePension;
        this.currentPageSalud = this.saludID.id == idProducto ? event : this.currentPageSalud;
        this.getLastBrokerList(idProducto, event);
    }

    private getLastBrokerList(idProducto, page) {

        this.foundResultsPension = this.pensionID.id == idProducto ? [] : this.foundResultsPension;
        this.foundResultsSalud = this.saludID.id == idProducto ? [] : this.foundResultsSalud;
        this.agencyService.getLastBrokerList(this.contractor.Id, CommonMethods.branchXproduct(this.codProducto), idProducto, this.itemsPerPage, page).subscribe(
            res => {
                this.totalItemsPension = this.pensionID.id == idProducto ? res.TotalRowNumber : this.totalItemsPension;
                this.totalItemsSalud = this.saludID.id == idProducto ? res.TotalRowNumber : this.totalItemsSalud;
                if (res.TotalRowNumber > 0) {
                    if (this.pensionID.id == idProducto) {
                        this.foundResultsPension = res.GenericResponse;
                    } else {
                        this.foundResultsSalud = res.GenericResponse;
                    }
                }
                this.isLoading = false;
            },
            err => {
                this.isLoading = false;
                Swal.fire("Información", "Error inesperado, por favor contáctese con soporte.", "error");
            }
        );
    }
    private createContractorForm() {
        this.contractorFormGroup = this.mainFormBuilder.group({
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
    disableCommonValidators() {
        this.contractorFormGroup.controls.documentNumber.setValidators(null);
        this.contractorFormGroup.controls.documentNumber.updateValueAndValidity();
        this.contractorFormGroup.controls.maternalLastName.setValidators(null);
        this.contractorFormGroup.controls.maternalLastName.updateValueAndValidity();
        this.contractorFormGroup.controls.paternalLastName.setValidators(null);
        this.contractorFormGroup.controls.paternalLastName.updateValueAndValidity();
        this.contractorFormGroup.controls.firstName.setValidators(null);
        this.contractorFormGroup.controls.firstName.updateValueAndValidity();
        this.contractorFormGroup.controls.legalName.setValidators(null);
        this.contractorFormGroup.controls.legalName.updateValueAndValidity();

    }

    cleanValidators() {
        this.isValidatedInClickButton = false;
    }
    cleanPaternalLastNameValidator() {
        this.contractorFormGroup.controls.paternalLastName.markAsUntouched();
        this.contractorFormGroup.controls.paternalLastName.updateValueAndValidity();
    }
    cleanMaternalLastNameValidator() {
        this.contractorFormGroup.controls.maternalLastName.markAsUntouched();
        this.contractorFormGroup.controls.maternalLastName.updateValueAndValidity();
    }
    cleanFirstNameValidator() {
        this.contractorFormGroup.controls.firstName.markAsUntouched();
        this.contractorFormGroup.controls.firstName.updateValueAndValidity();
    }
    cleanInputs() {
        this.contractorFormGroup.controls.documentNumber.patchValue(null);
        this.contractorFormGroup.controls.paternalLastName.patchValue(null);
        this.contractorFormGroup.controls.maternalLastName.patchValue(null);
        this.contractorFormGroup.controls.firstName.patchValue(null);
        this.contractorFormGroup.controls.legalName.patchValue(null);
    }
    changeValidators(type) {
        if (type == 1) {
            this.contractorFormGroup.controls.personType.setValue("1");
        }
        if (type == 2) {
            let response = CommonMethods.selTipoDocumento(this.contractorFormGroup.controls.documentType.value)
            this.documentNumberLength = response.maxlength
        }

        if (type == 3) {
            this.isValidatedInClickButton = false;
            if (this.contractorFormGroup.controls.searchMode.value == "1") {
                if (this.contractorFormGroup.controls.documentType.value == "2") {
                    this.contractorFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
                    this.contractorFormGroup.controls.documentNumber.updateValueAndValidity();
                } else if (this.contractorFormGroup.controls.documentType.value == "1") { //Ruc
                    this.contractorFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(11), Validators.minLength(11), GlobalValidators.rucNumberValidator]);
                    this.contractorFormGroup.controls.documentNumber.updateValueAndValidity();
                } else if (this.contractorFormGroup.controls.documentType.value == "4" || this.contractorFormGroup.controls.documentType.value == "6") { //ce o pasaporte
                    this.contractorFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
                    this.contractorFormGroup.controls.documentNumber.updateValueAndValidity();
                } else { //otros tipos de documento
                    this.contractorFormGroup.controls.documentNumber.setValidators([Validators.required, Validators.maxLength(15)]);
                    this.contractorFormGroup.controls.documentNumber.updateValueAndValidity();
                }

            } else {
                if (this.contractorFormGroup.controls.personType.value == "1") {
                    this.contractorFormGroup.controls['firstName'].setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern()), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation]);
                    this.contractorFormGroup.controls.firstName.updateValueAndValidity();
                    this.contractorFormGroup.controls['paternalLastName'].setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern()), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation]);
                    this.contractorFormGroup.controls.paternalLastName.updateValueAndValidity();
                    this.contractorFormGroup.controls['maternalLastName'].setValidators([Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern()), GlobalValidators.vowelLimitValidation, GlobalValidators.consonantLimitValidation]);
                    this.contractorFormGroup.controls.maternalLastName.updateValueAndValidity();
                } else {
                    this.contractorFormGroup.controls['legalName'].setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]);
                    this.contractorFormGroup.controls.legalName.updateValueAndValidity();
                }
            }
        }

        this.disableCommonValidators();
        this.cleanInputs();

    }
    private createForm() {
        this.mainFormGroup = this.mainFormBuilder.group({
            saludAgencyDate: [""],
            pensionAgencyDate: [""],
            sctrSaludFilePath: [{ value: "", disabled: true }],
            sctrPensionFilePath: [{ value: "", disabled: true }]
        });
    }
    private initializeForm() {
        this.mainFormGroup.controls.saludAgencyDate.setValue(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
        this.mainFormGroup.controls.pensionAgencyDate.setValue(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    }
    sctrSaludStateChanged() {
        if (this.isSctrSaludSelected) {
            this.mainFormGroup.controls.sctrSaludFilePath.enable();

            this.mainFormGroup.controls.saludAgencyDate.setValidators([Validators.required, GlobalValidators.tooOldDateValidator, GlobalValidators.notValidDate]);
            this.mainFormGroup.controls.saludAgencyDate.updateValueAndValidity();
        }
        else {
            this.mainFormGroup.controls.sctrSaludFilePath.disable();

            this.mainFormGroup.controls.saludAgencyDate.setValidators(null);
            this.mainFormGroup.controls.saludAgencyDate.updateValueAndValidity();
        }

    }
    sctrPensionStateChanged() {
        if (this.isSctrPensionSelected) {
            this.mainFormGroup.controls.sctrPensionFilePath.enable();

            this.mainFormGroup.controls.pensionAgencyDate.setValidators([Validators.required, GlobalValidators.tooOldDateValidator, GlobalValidators.notValidDate]);
            this.mainFormGroup.controls.pensionAgencyDate.updateValueAndValidity();
        }
        else {
            this.mainFormGroup.controls.sctrPensionFilePath.disable();

            this.mainFormGroup.controls.pensionAgencyDate.setValidators(null);
            this.mainFormGroup.controls.pensionAgencyDate.updateValueAndValidity();
        }

    }
    getDocumentTypeList() {

        this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
            res => {
                this.documentTypeList = res;
            },
            err => {
            }
        );
    }
    documentNumberKeyPress(event: any) {
        if (this.contractorFormGroup.controls.documentType.value == "") return;
        CommonMethods.validarNroDocumento(event, this.contractorFormGroup.controls.documentType.value)
    }

    searchContractor() {
        this.isValidatedInClickButton = true;
        if (this.contractorFormGroup.valid) {
            this.currentPagePension = 1;
            this.currentPageSalud = 1;
            this.processSearchContractor();
        } else {
            let errorList = [];
            if (this.contractorFormGroup.controls.documentNumber.valid == false) {
                if (this.contractorFormGroup.controls.documentNumber.hasError('required')) errorList.push("El número de documento es requerido.");
                else errorList.push("El nro de documento no es válido.");
            }

            if (this.contractorFormGroup.controls.firstName.valid == false) {
                if (this.contractorFormGroup.controls.firstName.hasError('required')) errorList.push("El nombre es requerido.");
                else errorList.push("El nombre no es válido.");
            }
            if (this.contractorFormGroup.controls.paternalLastName.valid == false) {
                if (this.contractorFormGroup.controls.paternalLastName.hasError('required')) errorList.push("El apellido paterno es requerido.");
                else errorList.push("El apellido paterno no es válido.");
            }
            if (this.contractorFormGroup.controls.maternalLastName.valid == false) {
                if (this.contractorFormGroup.controls.maternalLastName.hasError('required')) errorList.push("El apellido materno es requerido.");
                else errorList.push("El apellido materno no es válido.");
            }
            if (this.contractorFormGroup.controls.legalName.valid == false) {
                if (this.contractorFormGroup.controls.legalName.hasError('required')) errorList.push("La razón social es requerida.");
                else errorList.push("La razón social no es válida.");
            }
            Swal.fire('Información', this.listToString(errorList), 'error');
        }

    }

    processSearchContractor() {
        this.foundResultsPension = [];
        this.foundResultsSalud = [];
        this.isLoading = true;
        let data = new ClientDataToSearch();
        data.P_TipOper = "CON";
        data.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

        if (this.contractorFormGroup.controls.searchMode.value == "1") {
            data.P_NIDDOC_TYPE = this.contractorFormGroup.controls.documentType.value.toString();
            data.P_SIDDOC = this.contractorFormGroup.controls.documentNumber.value;
        } else {
            if (this.contractorFormGroup.controls.personType.value == "1") {
                data.P_NIDDOC_TYPE = "";
                data.P_SIDDOC = "";
                data.P_SFIRSTNAME = this.contractorFormGroup.controls.firstName.value.toString().toUpperCase();
                data.P_SLASTNAME = this.contractorFormGroup.controls.paternalLastName.value.toString().toUpperCase();
                data.P_SLASTNAME2 = this.contractorFormGroup.controls.maternalLastName.value == null ? "" : this.contractorFormGroup.controls.maternalLastName.value.toString().toUpperCase();
                data.P_SLEGALNAME = "";
            } else {
                data.P_NIDDOC_TYPE = "";
                data.P_SIDDOC = "";
                data.P_SLEGALNAME = this.contractorFormGroup.controls.legalName.value.toString().toUpperCase();
                data.P_SFIRSTNAME = "";
                data.P_SLASTNAME = "";
                data.P_SLASTNAME2 = "";
            }

        }

        this.clientInformationService.getCliente360(data).subscribe(
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
                                    this.contractor.Id = item.P_SCLIENT;
                                    this.contractor.DocumentNumber = item.P_SIDDOC;

                                    if (item.EListAddresClient != null && item.EListAddresClient.length > 0) this.contractor.Address = item.EListAddresClient[0].P_SSTREET + ", " + item.EListAddresClient[0].P_DESDISTRITO + ", " + item.EListAddresClient[0].P_DESPROVINCIA + ", " + item.EListAddresClient[0].P_DESDEPARTAMENTO;
                                    else this.contractor.Address = "No registrado";

                                    if (item.EListPhoneClient != null && item.EListPhoneClient.length > 0) this.contractor.Phone = item.EListPhoneClient[0].P_SPHONE;
                                    else this.contractor.Phone = "No registrado";

                                    if (item.EListEmailClient != null && item.EListEmailClient.length > 0) this.contractor.Email = item.EListEmailClient[0].P_SE_MAIL;
                                    else this.contractor.Email = "No registrado";

                                    if (item.P_NIDDOC_TYPE == "1") {
                                        this.contractor.DocumentType = "RUC";
                                        this.contractor.FullName == item.P_SLEGALNAME;
                                    } else {
                                        this.documentTypeList.map(function (element) {
                                            if (element.Id == item.P_NIDDOC_TYPE) self.contractor.DocumentType = element.Name;
                                        });
                                        this.contractor.FullName = item.P_SLASTNAME + " " + item.P_SLASTNAME2 + " " + item.P_SFIRSTNAME;
                                    }
                                    this.getLastBrokerList(this.pensionID.id, this.currentPagePension);
                                    this.getLastBrokerList(this.saludID.id, this.currentPageSalud);
                                }
                            }, (reason) => {
                            });
                        } else if (res.EListClient[0].P_SCLIENT != null) {
                            this.contractor.Id = res.EListClient[0].P_SCLIENT;
                            this.contractor.DocumentNumber = res.EListClient[0].P_SIDDOC;

                            if (res.EListClient[0].EListAddresClient != null && res.EListClient[0].EListAddresClient.length > 0) this.contractor.Address = res.EListClient[0].EListAddresClient[0].P_SSTREET + ", " + res.EListClient[0].EListAddresClient[0].P_DESDISTRITO + ", " + res.EListClient[0].EListAddresClient[0].P_DESPROVINCIA + ", " + res.EListClient[0].EListAddresClient[0].P_DESDEPARTAMENTO;
                            else this.contractor.Address = "No registrado";

                            if (res.EListClient[0].EListPhoneClient != null && res.EListClient[0].EListPhoneClient.length > 0) this.contractor.Phone = res.EListClient[0].EListPhoneClient[0].P_SPHONE;
                            else this.contractor.Phone = "No registrado";

                            if (res.EListClient[0].EListEmailClient != null && res.EListClient[0].EListEmailClient.length > 0) this.contractor.Email = res.EListClient[0].EListEmailClient[0].P_SE_MAIL;
                            else this.contractor.Email = "No registrado";

                            if (res.EListClient[0].P_NIDDOC_TYPE == "1") {
                                this.contractor.DocumentType = "RUC";
                                this.contractor.FullName = res.EListClient[0].P_SLEGALNAME;
                            } else {
                                this.documentTypeList.map(function (item) {
                                    if (item.Id == res.EListClient[0].P_NIDDOC_TYPE) self.contractor.DocumentType = item.Name;
                                });

                                this.contractor.FullName = res.EListClient[0].P_SLASTNAME + " " + res.EListClient[0].P_SLASTNAME2 + " " + res.EListClient[0].P_SFIRSTNAME;
                            }

                            this.getLastBrokerList(this.pensionID.id, this.currentPagePension);
                            this.getLastBrokerList(this.saludID.id, this.currentPageSalud);

                        } else {
                            this.isLoading = false;
                            Swal.fire("Información", this.NotFoundMessage, "error");
                            this.contractor = new ContractorForTable();
                        }


                    } else {
                        this.isLoading = false;
                        Swal.fire("Información", this.NotFoundMessage, "error");
                        this.contractor = new ContractorForTable();
                    }

                } else if (res.P_NCODE == 3) {
                    this.isLoading = false;
                    Swal.fire("Información", this.NotFoundMessage, "error");
                    this.contractor = new ContractorForTable();
                } else if (res.P_NCODE == 1) {
                    this.isLoading = false;
                    Swal.fire('Información', res.P_SMESSAGE, 'error');  //Error controlado
                }
                else {
                    this.isLoading = false;
                    Swal.fire('Información', this.GenericErrorMessage, 'error');  //Error controlado
                }

            },
            err => {
                this.isLoading = false;
                Swal.fire("Información", this.GenericErrorMessage, "error");
            }

        );
    }
    sctrSaludFileChanged(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.sctrSaludFile = file;
        }
    }
    sctrPensionFileChanged(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.sctrPensionFile = file;
        }
    }

    private prepareFile(_file: File): any {
        let input = new FormData();
        if (_file != null) input.append('agencyFile', _file, _file.name);
        return input;
    }
    private getFilExtension(_filename: string): string {
        return _filename.split('.').pop();
    }

    uploadFile(filePath: string, file: FormData) {
        this.othersService.uploadFile(filePath, "agency", file).subscribe(
            res => {
                if (res.StatusCode == 0) {
                    Swal.fire("Información", "Operación exitosa", 'success');
                    this.formModalReference.close(true);
                } else {
                    this.isLoading = false;
                    Swal.fire('Información', res.Message, 'error');
                }
            },
            err => {
                this.isLoading = false;
                Swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    tryToProcessPensionAgency(salud_ErrorList: string[], salud_SuccessList: string[]) {
        let self = this;
        let errorList: string[] = [];
        let successList: string[] = [];

        let pensionAgencyData = new Agency();
        pensionAgencyData.BrokerId = this.brokerId;
        pensionAgencyData.ContractorId = this.contractor.Id;
        pensionAgencyData.AgencyDate = this.mainFormGroup.controls.pensionAgencyDate.value;
        pensionAgencyData.ChannelTypeId = this.channelTypeId;
        pensionAgencyData.User = JSON.parse(localStorage.getItem("currentUser"))["id"];
        pensionAgencyData.ProductId = JSON.parse(localStorage.getItem("pensionID"))["id"];

        let date = new Date();
        date.setDate(pensionAgencyData.AgencyDate.getDate());
        date.setFullYear(pensionAgencyData.AgencyDate.getFullYear());
        date.setMonth(pensionAgencyData.AgencyDate.getMonth());
        date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
        pensionAgencyData.AgencyDate = date;

        if (this.mainFormGroup.controls.sctrPensionFilePath.value != null && this.mainFormGroup.controls.sctrPensionFilePath.value != "") {
            pensionAgencyData.FileName = "agency-pension-" + pensionAgencyData.BrokerId + "-" + pensionAgencyData.ContractorId + "-" + pensionAgencyData.AgencyDate.getDate() + "-" + String(pensionAgencyData.AgencyDate.getMonth() + 1) + "-" + pensionAgencyData.AgencyDate.getFullYear()
                + "." + this.getFilExtension(this.mainFormGroup.controls.sctrPensionFilePath.value)
        } else {
            pensionAgencyData.FileName = "";
        }
        this.agencyService.addAgency(pensionAgencyData, this.prepareFile(this.sctrPensionFile)).subscribe(
            res => {
                if (res.StatusCode == 0) {
                    this.sctrPensionSucceed = true;
                    this.isSctrPensionSelected = false;
                    successList.push("El agenciamiento de SCTR Pensión ha sido exitoso.");
                    this.isLoading = false;
                } else {
                    this.sctrPensionSucceed = false;
                    this.isLoading = false;
                    errorList.push(res.Message);

                }
                let text = self.createContent(salud_SuccessList, salud_ErrorList, successList, errorList);
                let icon;
                if (this.sctrPensionSucceed && this.sctrSaludSucceed) {
                    icon = "success";
                }
                else if (this.sctrPensionSucceed == false && this.sctrSaludSucceed == false) {
                    icon = "error";
                }
                else {
                    icon = "warning";
                }

                Swal.fire({
                    title: 'Información',
                    html: text,
                    icon: icon,
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.value) {
                        if (this.sctrPensionSucceed && this.sctrSaludSucceed) {
                            this.formModalReference.close(true);
                        } else if (this.sctrPensionSucceed || this.sctrSaludSucceed) {
                            this.firstSearch();
                        }

                    } else {
                        this.firstSearch();
                    }
                })

            },
            err => {

                let text = self.createContent(salud_SuccessList, salud_ErrorList, successList, errorList);
                let icon;
                if (this.sctrSaludSucceed) {
                    icon = "warning";
                } else {
                    icon = "error";
                }

                Swal.fire({
                    title: 'Información',
                    html: text,
                    icon: icon,
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.value) {

                    }
                })

            }
        );
    }

    manageAgency() { //administrar agenciamiento
        this.isLoading = true;
                                                                                                                                                                        //AVS - Se comenta ya que validacion sera a nivel BD
        if (this.mainFormGroup.valid && (this.isSctrPensionSelected == true || this.isSctrSaludSelected == true) && (this.contractor.Id != null && this.contractor.Id != "") /*&& (this.sctrPensionFile != undefined)*/) {
            let errorList = [];
            let successList = [];
            let self = this;

            if (this.isSctrSaludSelected && this.isSctrPensionSelected && this.sctrSaludSucceed == false && this.sctrPensionSucceed == false) {
                let saludAgencyData = new Agency();
                saludAgencyData.BrokerId = this.brokerId;
                saludAgencyData.ContractorId = this.contractor.Id;
                saludAgencyData.AgencyDate = this.mainFormGroup.controls.saludAgencyDate.value;
                saludAgencyData.ChannelTypeId = this.channelTypeId;
                saludAgencyData.User = JSON.parse(localStorage.getItem("currentUser"))["id"];
                saludAgencyData.ProductId = JSON.parse(localStorage.getItem("saludID"))["id"];

                if (this.mainFormGroup.controls.sctrSaludFilePath.value != null && this.mainFormGroup.controls.sctrSaludFilePath.value != "") {
                    saludAgencyData.FileName = "agency-salud-" + saludAgencyData.BrokerId + "-" + saludAgencyData.ContractorId + "-" + saludAgencyData.AgencyDate.getDate() + "-" + String(saludAgencyData.AgencyDate.getMonth() + 1) + "-" + saludAgencyData.AgencyDate.getFullYear()
                        + "." + this.getFilExtension(this.mainFormGroup.controls.sctrSaludFilePath.value);
                }
                else {
                    saludAgencyData.FileName = "";
                }
                let date = new Date();
                date.setDate(saludAgencyData.AgencyDate.getDate());
                date.setFullYear(saludAgencyData.AgencyDate.getFullYear());
                date.setMonth(saludAgencyData.AgencyDate.getMonth());
                date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
                saludAgencyData.AgencyDate = date;
                this.agencyService.addAgency(saludAgencyData, this.prepareFile(this.sctrSaludFile)).subscribe(
                    res => {
                        if (res.StatusCode == 0) {
                            this.sctrSaludSucceed = true;
                            this.isSctrSaludSelected = false;
                            successList.push("El agenciamiento de SCTR Salud ha sido exitoso.");
                            self.tryToProcessPensionAgency(errorList, successList);
                        } else {
                            this.sctrSaludSucceed = false;
                            errorList.push(res.Message);
                            self.tryToProcessPensionAgency(errorList, successList);
                        }
                    },
                    err => {
                        this.sctrSaludSucceed = false;
                        errorList.push("El agenciamiento de SCTR Salud no pudo ser procesado.");
                        self.tryToProcessPensionAgency(errorList, successList);

                    }
                );

            } else if (this.isSctrSaludSelected && this.sctrSaludSucceed == false) {
                let saludAgencyData = new Agency();
                saludAgencyData.BrokerId = this.brokerId;
                saludAgencyData.ContractorId = this.contractor.Id;
                saludAgencyData.AgencyDate = this.mainFormGroup.controls.saludAgencyDate.value;
                saludAgencyData.ChannelTypeId = this.channelTypeId;
                saludAgencyData.User = JSON.parse(localStorage.getItem("currentUser"))["id"];
                saludAgencyData.ProductId = JSON.parse(localStorage.getItem("saludID"))["id"];

                if (this.mainFormGroup.controls.sctrSaludFilePath.value != null && this.mainFormGroup.controls.sctrSaludFilePath.value != "") {
                    saludAgencyData.FileName = "agency-salud-" + saludAgencyData.BrokerId + "-" + saludAgencyData.ContractorId + "-" + saludAgencyData.AgencyDate.getDate() + "-" + String(saludAgencyData.AgencyDate.getMonth() + 1) + "-" + saludAgencyData.AgencyDate.getFullYear()
                        + "." + this.getFilExtension(this.mainFormGroup.controls.sctrSaludFilePath.value);
                }
                else {
                    saludAgencyData.FileName = "";
                }
                let date = new Date();
                date.setDate(saludAgencyData.AgencyDate.getDate());
                date.setFullYear(saludAgencyData.AgencyDate.getFullYear());
                date.setMonth(saludAgencyData.AgencyDate.getMonth());
                date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
                saludAgencyData.AgencyDate = date;
                this.agencyService.addAgency(saludAgencyData, this.prepareFile(this.sctrSaludFile)).subscribe(
                    res => {
                        if (res.StatusCode == 0) {

                            this.sctrSaludSucceed = true;
                            this.isSctrSaludSelected = false;
                            this.isLoading = false;
                            Swal.fire({
                                title: 'Información',
                                text: "El agenciamiento de SCTR Salud ha sido exitoso.",
                                icon: 'success',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Ok'
                            }).then((result) => {
                                if (result.value) {
                                    this.formModalReference.close(true);
                                } else {
                                    this.firstSearch();
                                }
                            })
                        } else {
                            this.sctrSaludSucceed = false;
                            this.isLoading = false;
                            errorList.push(res.Message);
                            Swal.fire("Información", this.createContent(null, errorList, null, null), "error");
                        }
                    },
                    err => {
                        errorList.push("El agenciamiento de SCTR Salud no pudo ser procesado.");
                        this.sctrSaludSucceed = false;
                        this.isLoading = false;
                        Swal.fire("Información", this.createContent(null, errorList, null, null), "error");

                    }
                );

            } else if (this.isSctrPensionSelected && this.sctrPensionSucceed == false) {
                let pensionAgencyData = new Agency();
                pensionAgencyData.BrokerId = this.brokerId;
                pensionAgencyData.ContractorId = this.contractor.Id;
                pensionAgencyData.AgencyDate = this.mainFormGroup.controls.pensionAgencyDate.value;
                pensionAgencyData.ChannelTypeId = this.channelTypeId;
                pensionAgencyData.User = JSON.parse(localStorage.getItem("currentUser"))["id"];
                pensionAgencyData.ProductId = JSON.parse(localStorage.getItem("pensionID"))["id"];
                let date = new Date();
                date.setDate(pensionAgencyData.AgencyDate.getDate());
                date.setFullYear(pensionAgencyData.AgencyDate.getFullYear());
                date.setMonth(pensionAgencyData.AgencyDate.getMonth());
                date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
                pensionAgencyData.AgencyDate = date;
                if (this.mainFormGroup.controls.sctrPensionFilePath.value != null && this.mainFormGroup.controls.sctrPensionFilePath.value != "") {
                    pensionAgencyData.FileName = "agency-pension-" + pensionAgencyData.BrokerId + "-" + pensionAgencyData.ContractorId + "-" + pensionAgencyData.AgencyDate.getDate() + "-" + String(pensionAgencyData.AgencyDate.getMonth() + 1) + "-" + pensionAgencyData.AgencyDate.getFullYear()
                        + "." + this.getFilExtension(this.mainFormGroup.controls.sctrPensionFilePath.value)
                } else {
                    pensionAgencyData.FileName = "";
                }

                this.agencyService.addAgency(pensionAgencyData, this.prepareFile(this.sctrPensionFile)).subscribe(
                    res => {
                        if (res.StatusCode == 0) {
                            this.sctrPensionSucceed = true;
                            this.isSctrPensionSelected = false;
                            this.isLoading = false;
                            Swal.fire({
                                title: 'Información',
                                text: "El agenciamiento de SCTR Pensión ha sido exitoso.",
                                icon: 'success',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Ok'
                            }).then((result) => {
                                if (result.value) {
                                    this.formModalReference.close(true);
                                } else {
                                    this.firstSearch();
                                }
                            })
                        } else {
                            this.sctrPensionSucceed = false;
                            this.isLoading = false;
                            errorList.push(res.Message);
                            Swal.fire("Información", this.createContent(null, null, null, errorList), "error");
                        }
                    },
                    err => {
                        errorList.push("El agenciamiento de SCTR Pensión no pudo ser procesado.");
                        this.isLoading = false;
                        this.sctrPensionSucceed = false;
                        Swal.fire("Información", this.createContent(null, null, null, errorList), "error");
                    }
                );

            }

        } else {
            let errorList = [];
            if (this.isSctrPensionSelected == false && this.isSctrSaludSelected == false) {
                errorList.push("Debe seleccionar uno de los dos productos.")
            }
            if (this.contractor.Id == null || this.contractor.Id == "") {
                errorList.push("El contratante no es válido.");
            }
            if (this.mainFormGroup.controls.saludAgencyDate.valid == false) {
                if (this.mainFormGroup.controls.saludAgencyDate.hasError('required')) errorList.push("La fecha de agenciamiento de Sctr Salud es requerida.");
                else errorList.push("La fecha de agenciamiento de Sctr Salud no es válida.");
            }
            if (this.mainFormGroup.controls.pensionAgencyDate.valid == false) {
                if (this.mainFormGroup.controls.pensionAgencyDate.hasError('required')) errorList.push("La fecha de agenciamiento de Sctr Pensión es requerida.");
                else errorList.push("La fecha de agenciamiento de Sctr Pensión no es válida.");
            }
            /*if (this.sctrPensionFile == undefined) {
                errorList.push("La Carta de Agenciamiento es requerida. Por favor adjunte el archivo")
            }*/ //AVS - Se comenta ya que validacion sera a nivel BD
            this.isLoading = false;
            Swal.fire('Información', this.listToString(errorList), 'error');
        }
    }
    createContent(salud_SuccessList: string[], salud_ErrorList: string[], pension_SuccessList: string[], pension_ErrorList: string[]): string {
        let content = "";
        if ((salud_SuccessList != null && salud_SuccessList.length > 0) || (salud_ErrorList != null && salud_ErrorList.length > 0)) {
            content = content + "<p style='text-align:center'>SCTR SALUD</p>";
            if (salud_SuccessList != null && salud_SuccessList.length > 0) {
                let lista = "";
                salud_SuccessList.forEach(function (item) {
                    lista = lista + "<p>" + item + "</p>";
                });
                content = content + "<p style='text-align:center'>" + lista + "</p>";
            }
            if (salud_ErrorList != null && salud_ErrorList.length > 0) {
                let lista = "";
                salud_ErrorList.forEach(function (item) {
                    lista = lista + "<p>" + item + "</p>";
                });
                content = content + "<p style='text-align:center'>" + lista + "</p>";
            }
        }
        content = content + "<br>";
        if ((pension_SuccessList != null && pension_SuccessList.length > 0) || (pension_ErrorList != null && pension_ErrorList.length > 0)) {
            content = content + "<p style='text-align:center'>SCTR PENSIÓN</p>";
            if (pension_SuccessList != null && pension_SuccessList.length > 0) {
                let lista = "";
                pension_SuccessList.forEach(function (item) {
                    lista = lista + "<p>" + item + "</p>";
                });
                content = content + "<p style='text-align:center'>" + lista + "</p>";
            }
            if (pension_ErrorList != null && pension_ErrorList.length > 0) {
                let lista = "";
                pension_ErrorList.forEach(function (item) {
                    lista = lista + "<p>" + item + "</p>";
                });
                content = content + "<p style='text-align:center'>" + lista + "</p>";
            }
        }
        return content;
    }
    listToString(inputList: String[]): string {
        let output = "";
        inputList.forEach(function (item) {
            output = output + item + " <br>"
        });
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
        if (isFirst == true) { //cuando solo hay un mensaje sin guiones
            responseList.push(inputString.trim());
        }
        return responseList;
    }
    appendToList(newList: string[], mainList: string[]): string[] {
        newList.map(function (item) {
            mainList.push(item);
        });
        return mainList;
    }
}
