import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from '../../../common-methods';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { UtilityService } from '../../../../../../shared/services/general/utility.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModuleConfig } from '../../../module.config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalValidators } from '../../../global-validators';
import { FilePickerComponent } from '../../../../modal/file-picker/file-picker.component';
import { QuotationTrackingComponent } from '../../quotation-tracking/quotation-tracking.component';
import { isNumeric } from 'rxjs/internal-compatibility';
import swal from 'sweetalert2';

@Component({
    selector: 'app-request-covid',
    templateUrl: './request-covid.component.html',
    styleUrls: ['./request-covid.component.css']
})

export class RequestCovidComponent implements OnInit {
    isLoading = false;
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = ModuleConfig.StartDate;
    bsValueFin: Date = ModuleConfig.EndDate;

    currentPage = 1;
    rotate = true;
    maxSize = 5;
    itemsPerPage = 5;
    totalItems = 0;
    foundResults: any = [];
    filter: any = {};

    brokerDocumentMaxLength = 0;
    contractorDocumentMaxLength = 0;
    isValidatedInClickButton = false;
    mainFormGroup: FormGroup;

    statusList: any[] = [];
    productTypeList: any[] = [];
    documentTypeList: any[];
    searchModeList: any[] = [{ 'Id': '1', 'Name': 'Nro. de Documento' }, { 'Id': '2', 'Name': 'Nombres' }];
    personTypeList: any[] = [{ 'Id': '1', 'Name': 'Persona Natural' }, { 'Id': '2', 'Name': 'Persona Jurídica' }];
    amountDetailTotalList: any = [];

    notfoundMessage = ModuleConfig.NotFoundMessage;
    genericErrorMessage = ModuleConfig.GenericErrorMessage;
    redirectionMessage = ModuleConfig.RedirectionMessage;
    invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
    invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
    invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
    invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;

    isExternalUser = false;
    brokerName: string;
    canApproveQuotation = true;
    canModifyQuotation = true;
    listToShow: any;
    perfil: any;

    discountPension = '';
    activityVariationPension = '';
    nidProc = '';
    template: any = {};
    variable: any = {};
    lblProducto = '';
    lblFecha = '';

    covidId = JSON.parse(localStorage.getItem('covidID'))['id'];
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    nbranch: any = '';

    constructor(
        private mainFormBuilder: FormBuilder,
        private policyService: PolicyemitService,
        public utilityService: UtilityService,
        private clientService: ClientInformationService,
        private quotationService: QuotationService,
        private modalService: NgbModal,
        private router: Router
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
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE);

        // Configuracion del Variable
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);

        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME);
        this.lblFecha = CommonMethods.tituloPantalla();

        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        if (this.isExternalUser) { this.brokerName = JSON.parse(localStorage.getItem('currentUser'))['desCanal']; }
        this.filter.User = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.perfil = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
        this.createForm();
        this.initializeForm();
        this.getDocumentTypeList();
        this.getProductTypeList();
        this.getStatusList();

        CommonMethods.clearBack();
    }

    private createForm() {
        this.mainFormGroup = this.mainFormBuilder.group({
            product: [''],
            status: [''],
            startDate: [ModuleConfig.StartDate, [Validators.required]],
            endDate: [ModuleConfig.EndDate, [Validators.required]],
            quotationNumber: ['', [Validators.maxLength(10), GlobalValidators.onlyNumberValidator]],

            contractorSearchMode: ['1'],
            contractorDocumentType: [''],
            contractorDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],
            contractorPersonType: ['1'],
            contractorFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],
            contractorPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],
            contractorMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],
            contractorLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]],

            brokerSearchMode: ['1'],
            brokerDocumentType: [''],
            brokerDocumentNumber: ['', [Validators.maxLength(0), GlobalValidators.onlyNumberValidator]],
            brokerPersonType: ['1'],
            brokerFirstName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],
            brokerPaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],
            brokerMaternalLastName: ['', [Validators.maxLength(19), Validators.pattern(GlobalValidators.getLatinTextPattern())]],
            brokerLegalName: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]],
            brokerNameExternal: ['', [Validators.maxLength(60), Validators.pattern(GlobalValidators.getLegalNamePattern())]]
        });
    }

    private initializeForm() {
        this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    }
    /**
     * Obtener lista de estados
     */
    getStatusList() {
        this.quotationService.getStatusList('3', this.codProducto).subscribe(
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
        this.clientService.getProductList(this.codProducto, this.epsItem.NCODE, this.nbranch).subscribe(
            res => {
                this.productTypeList = res;
                if (this.productTypeList.length === 1) {
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
        if (documentType === '') { return; }
        CommonMethods.validarNroDocumento(event, documentType);
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
                this.mainFormGroup.controls.contractorDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
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
            case '1': { // ruc
                this.brokerDocumentMaxLength = 11;
                this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), GlobalValidators.onlyNumberValidator, GlobalValidators.rucNumberValidator]);
                this.mainFormGroup.controls.brokerDocumentNumber.updateValueAndValidity();
                break;
            }
            case '2': { // dni
                this.brokerDocumentMaxLength = 8;
                this.mainFormGroup.controls.brokerDocumentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), GlobalValidators.onlyNumberValidator, Validators.pattern(GlobalValidators.getDniPattern()), GlobalValidators.notAllCharactersAreEqualValidator]);
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
     * Lista tipos de documento
     */
    getDocumentTypeList() {
        this.clientService.getDocumentTypeList(this.codProducto).subscribe(
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
    firstSearch() {
        this.isValidatedInClickButton = true;
        this.listToShow = [];
        this.foundResults = [];
        if (this.mainFormGroup.valid) {
            this.filter.ProductType = this.mainFormGroup.controls.product.value;
            this.filter.Status = this.mainFormGroup.controls.status.value;
            this.filter.StartDate = this.mainFormGroup.controls.startDate.value;
            this.filter.EndDate = this.mainFormGroup.controls.endDate.value;
            this.filter.QuotationNumber = this.mainFormGroup.controls.quotationNumber.value;

            this.filter.ContractorSearchMode = this.mainFormGroup.controls.contractorSearchMode.value;

            if (this.mainFormGroup.controls.contractorSearchMode.value === '1') {
                this.filter.ContractorDocumentType = this.mainFormGroup.controls.contractorDocumentType.value;
                this.filter.ContractorDocumentNumber = this.mainFormGroup.controls.contractorDocumentNumber.value;
                this.filter.ContractorPaternalLastName = '';
                this.filter.ContractorMaternalLastName = '';
                this.filter.ContractorFirstName = '';
                this.filter.ContractorLegalName = '';
            } else if (this.mainFormGroup.controls.contractorSearchMode.value === '2' && this.mainFormGroup.controls.contractorPersonType.value === '1') {
                this.filter.ContractorDocumentType = '';
                this.filter.ContractorDocumentNumber = '';
                this.filter.ContractorPaternalLastName = this.mainFormGroup.controls.contractorPaternalLastName.value;
                this.filter.ContractorMaternalLastName = this.mainFormGroup.controls.contractorMaternalLastName.value;
                this.filter.ContractorFirstName = this.mainFormGroup.controls.contractorFirstName.value;
                this.filter.ContractorLegalName = '';
            } else if (this.mainFormGroup.controls.contractorSearchMode.value === '2' && this.mainFormGroup.controls.contractorPersonType.value === '2') {
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

            if (this.mainFormGroup.controls.brokerSearchMode.value === '1') {
                this.filter.BrokerDocumentType = this.mainFormGroup.controls.brokerDocumentType.value;
                this.filter.BrokerDocumentNumber = this.mainFormGroup.controls.brokerDocumentNumber.value;
                this.filter.BrokerPaternalLastName = '';
                this.filter.BrokerMaternalLastName = '';
                this.filter.BrokerFirstName = '';
                this.filter.BrokerLegalName = '';
            } else if (this.mainFormGroup.controls.brokerSearchMode.value === '2' && this.mainFormGroup.controls.brokerPersonType.value === '1') {
                this.filter.BrokerDocumentType = '';
                this.filter.BrokerDocumentNumber = '';
                this.filter.BrokerPaternalLastName = this.mainFormGroup.controls.brokerPaternalLastName.value;
                this.filter.BrokerMaternalLastName = this.mainFormGroup.controls.brokerMaternalLastName.value;
                this.filter.BrokerFirstName = this.mainFormGroup.controls.brokerFirstName.value;
                this.filter.BrokerLegalName = '';
            } else if (this.mainFormGroup.controls.brokerSearchMode.value === '2' && this.mainFormGroup.controls.brokerPersonType.value === '2') {
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

            if (this.mainFormGroup.controls.contractorDocumentNumber.value.toString().trim() === '' && this.mainFormGroup.controls.contractorSearchMode.value === '1') {
                this.filter.ContractorSearchMode = '3';
            }
            if (this.mainFormGroup.controls.brokerDocumentNumber.value.toString().trim() === '' && this.mainFormGroup.controls.brokerSearchMode.value === '1') {
                this.filter.BrokerSearchMode = '3';
            }

            this.filter.CompanyLNK = this.epsItem.NCODE;

            this.search();
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
        const error = [];
        if (this.mainFormGroup.controls.product.valid === false) { error.push('El producto no es válido.'); }
        if (this.mainFormGroup.controls.status.valid === false) {
            error.push('El estado no es válido.');
        }
        if (this.mainFormGroup.controls.quotationNumber.valid === false) { error.push('El número de cotización no es válido.'); }

        if (this.mainFormGroup.controls.contractorDocumentNumber.valid === false) { error.push('El número de documento del contratante no es válido.'); }
        if (this.mainFormGroup.controls.contractorFirstName.valid === false) { error.push('El nombre del contratante no es válido.'); }
        if (this.mainFormGroup.controls.contractorPaternalLastName.valid === false) { error.push('El apellido paterno del contratante no es válido.'); }
        if (this.mainFormGroup.controls.contractorMaternalLastName.valid === false) { error.push('El apellido materno del contratante no es válido.'); }

        if (this.mainFormGroup.controls.brokerDocumentNumber.valid === false) { error.push('El número de documento del broker no es válido.'); }
        if (this.mainFormGroup.controls.brokerFirstName.valid === false) { error.push('El nombre del broker no es válido.'); }
        if (this.mainFormGroup.controls.brokerPaternalLastName.valid === false) { error.push('El apellido del broker paterno no es válido.'); }
        if (this.mainFormGroup.controls.brokerMaternalLastName.valid === false) { error.push('El apellido del broker materno no es válido.'); }

        if (this.mainFormGroup.controls.startDate.valid && this.mainFormGroup.controls.endDate.valid) {
            if (this.mainFormGroup.hasError('datesNotSortedCorrectly')) { error.push(ModuleConfig.InvalidStartDateOrderMessage); }
        } else {
            if (this.mainFormGroup.controls.startDate.valid === false) {
                if (this.mainFormGroup.controls.startDate.hasError('required')) {
                    error.push('La fecha de inicio es requerida.');
                } else { error.push(ModuleConfig.InvalidStartDateMessage); }
            }
            if (this.mainFormGroup.controls.endDate.valid === false) {
                if (this.mainFormGroup.controls.endDate.hasError('required')) {
                    error.push('La fecha de fin es requerida.');
                } else { error.push(ModuleConfig.InvalidEndDateMessage); }
            }
        }

        swal.fire('Información', this.listToString(error), 'error');
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
        this.quotationService.getQuotationList(this.filter).subscribe(
            async res => {
                if (res.GenericResponse != null && res.GenericResponse.length > 0) {
                    this.foundResults = await this.completeInfo(res.GenericResponse);
                    this.totalItems = this.foundResults.length;
                    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                } else {
                    this.totalItems = 0;
                    swal.fire('Información', this.notfoundMessage, 'warning');
                }
                this.isLoading = false;
            },
            err => {
                this.foundResults = [];
                this.totalItems = 0;
                this.isLoading = false;
                swal.fire('Información', this.genericErrorMessage, 'error');
            }
        );
    }

    completeInfo(data): any {
        for (const item of data) {
            item.Payroll = Number(item.WorkersCount) * Number(item.Rate);
        }
        return data;
    }

    openFilePicker(fileList: string[]) {
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.modalService.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning');
        }

    }

    /**
    * Mostrar modal de tracking
    */
    seeTracking(quotationNumber: string) {
        const modalRef = this.modalService.open(QuotationTrackingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef; // Enviamos la referencia al modal
        modalRef.componentInstance.quotationNumber = quotationNumber; // Enviamos el número de cotización
    }

    /**
     * Cargamos el formulario de cotización en modo EVALUAR
     * @param quotationNumber
     */
    evaluate(quotationNumber: string) {
        this.router.navigate(['/extranet/quotation-evaluation'], { queryParams: { quotationNumber: quotationNumber, mode: 'evaluar' } });
    }
    /**
     * Cargamos el formulario de cotización en modo VISTA
     * @param quotationNumber
     */
    justWatch(quotationNumber: string) {
        this.router.navigate(['/extranet/quotation-evaluation'], { queryParams: { quotationNumber: quotationNumber, mode: 'solover' } });
    }
    /**
     * Cargamos el formulario de modificación de cotización
     * @param quotationNumber
     */
    modifyQuotation(quotationNumber: string) {
        this.router.navigate(['/extranet/quotation'], { queryParams: { quotationNumber: quotationNumber, mode: 'recotizar' } });

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

    quotationNumberPressed(event: any) {
        if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
            event.preventDefault();
        }
    }
    /**
     * Bloquea los otros campos cuando el campo de número de cotización no está vacío; en caso contrario, los desbloquea
     */
    quotationNumberChanged(event: any) {
        if (this.mainFormGroup.controls.quotationNumber.value != null && this.mainFormGroup.controls.quotationNumber.value !== '') {
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
        const clipboardData = event.clipboardData;
        const pastedText = clipboardData.getData('text');
        if (!isNumeric(pastedText)) {
            event.preventDefault();
        } else {
            if (pastedText != null && pastedText.toString().trim() !== '') {
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

    openDetails(item: any) {
        item.From = '';
        sessionStorage.setItem('cs-quotation', JSON.stringify(item));
        this.router.navigate(['/extranet/covid-evaluation']);
    }

    emit(item: any) {
        if (this.template.ins_emisionDirecta) {
            this.emisionDirecta(item);
        } else {
            this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: item.QuotationNumber } });
        }

    }
    emisionDirecta(item: any) {
        const typeMovement = '1';
        let obj: any;
        const renovacion: any = {};
        const myFormData: FormData = new FormData();
        if (item.Mode === 'Renovar') {
            this.policyService.getPolicyEmitCab(item.QuotationNumber, typeMovement, JSON.parse(localStorage.getItem('currentUser'))['id']).subscribe(
                res => {
                    obj = res;
                    this.quotationService.getProcessCode(item.QuotationNumber).subscribe(
                        resCod => {
                            this.nidProc = resCod;
                            renovacion.P_NID_COTIZACION = item.QuotationNumber; // nro cotizacion
                            const effecDate = new Date(obj.GenericResponse.EFECTO_COTIZACION);
                            const expirDate = new Date(obj.GenericResponse.EXPIRACION_COTIZACION);
                            renovacion.P_DEFFECDATE = CommonMethods.formatDate(effecDate);
                            renovacion.P_DEXPIRDAT = CommonMethods.formatDate(expirDate);
                            renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; // Fecha hasta
                            renovacion.P_NTYPE_TRANSAC = '4'; // tipo de movimiento
                            renovacion.P_NID_PROC = this.nidProc; // codigo de proceso (Validar trama)
                            renovacion.P_FACT_MES_VENCIDO = 0; // Facturacion Vencida
                            renovacion.P_SFLAG_FAC_ANT = 0; // Anticipada
                            renovacion.P_SCOLTIMRE = obj.GenericResponse.TIP_RENOV; // Tipo de renovacion
                            renovacion.P_NPAYFREQ = obj.GenericResponse.FREQ_PAGO; // Frecuencia Pago
                            renovacion.P_NMOV_ANUL = 0; // Movimiento de anulacion
                            renovacion.P_NNULLCODE = 0; // Mot /ivo anulacion
                            renovacion.P_SCOMMENT = null; // Frecuencia Pago
                            myFormData.append('transaccionProtecta', JSON.stringify(renovacion));

                            this.policyService.transactionPolicy(myFormData).subscribe(
                                resJob => {
                                    this.isLoading = false;
                                    if (resJob.P_COD_ERR === 0) {
                                        swal.fire('Información', 'Se ha generado correctamente la renovación de la póliza N° ' + item.PolicyNumber, 'success');
                                        this.router.navigate(['/extranet/policy-transactions-all']);
                                    } else if (resJob.P_COD_ERR === 2) {
                                        swal.fire({
                                            title: 'Información',
                                            text: resJob.P_MESSAGE,
                                            icon: 'info',
                                            confirmButtonText: 'OK',
                                            allowOutsideClick: false,
                                        }).then((result) => {
                                            if (result.value) {
                                                if (this.codProducto === 2) {
                                                    this.router.navigate(['/extranet/policy-transactions']);
                                                } else {
                                                    this.router.navigate(['/extranet/policy-transactions-all']);
                                                }
                                            }
                                        });
                                    } else {
                                        swal.fire({
                                            title: 'Información',
                                            text: resJob.P_MESSAGE,
                                            icon: 'error',
                                            confirmButtonText: 'OK',
                                            allowOutsideClick: false,
                                        });
                                    }
                                },
                                err => {
                                }
                            );
                        },
                        err => {
                        }
                    );
                },
                err => {
                }
            );
        }
    }

}
