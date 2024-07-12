import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

//Importación de servicios
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
//Modelos
import { PolicyTransactionSearch } from '../../../models/polizaEmit/request/policy-transaction-search';
import { PolicyTransaction } from '../../../models/polizaEmit/response/policy-transaction';
//Configuración
import { GlobalValidators } from './../../global-validators';
import { ModuleConfig } from './../../module.config';
import { AccessFilter } from './../../access-filter';
import { isNumeric } from 'rxjs/internal-compatibility';
import { CommonMethods } from '../../common-methods';
@Component({
    selector: 'app-transaction-report',
    templateUrl: './transaction-report.component.html',
    styleUrls: ['./transaction-report.component.css']
})
export class TransactionReportComponent implements OnInit {
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
    filter: PolicyTransactionSearch = new PolicyTransactionSearch(); //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

    documentNumberLength: number = 0; //Cantidad de caracteres que se puede insertar en el campo Nro de documento
    isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.
    mainFormGroup: FormGroup;

    movementTypeList: any[] = []; //Lista de tipos de movimiento
    productTypeList: any[] = [];  //Lista de tipos de producto
    documentTypeList: any[] = []; //Lista de tipos de documento

    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));
    nbranch: any = '';

    constructor(
        private mainFormBuilder: FormBuilder,
        private policyService: PolicyemitService,
        private clientInformationService: ClientInformationService,
        private excelService: ExcelService,
        private router: Router
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                // containerClass: 'theme-dark-blue',
                showWeekNumbers: false
            }
        );
    }

    async ngOnInit() {
        if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['transaction_report']) == false) this.router.navigate(['/extranet/home']);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.filter.LimitPerpage = 5;
        this.createForm();
        this.initializeForm();

        this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
        this.getDocumentTypeList();
        this.getMovementTypeList();
        this.getProductTypeList();
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
            policyNumber: [''], //Número de póliza
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
        this.mainFormGroup.controls.policyNumber.setValue('');
        this.mainFormGroup.controls.policyNumber.setValidators([Validators.maxLength(10), GlobalValidators.onlyNumberValidator]);  // [pending] maxlength

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
                this.movementTypeList = res.GenericResponse;
            },
            error => {
                Swal.fire('Información', this.genericErrorMessage, 'error');
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
                Swal.fire('Información', this.genericErrorMessage, 'error');
            }
        );
    }
    /**
     * Obtiene los tipos de producto
     */
    getProductTypeList() {
        this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.nbranch).subscribe(
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

    /**
     * Evento que se dispara al presionar una tecla en el campo Número de Documento y restringe el ingreso según el tipo de documento
     * @param event datos del evento KeyPress
     */
    documentNumberKeyPress(event: any) {
        let pattern;
        switch (this.mainFormGroup.controls.documentType.value) {
            case '1': { //ruc
                pattern = /[0-9]/;
                break;
            }
            case '2': { //dni
                pattern = /[0-9]/;
                break;
            }
            case '4': { //ce
                pattern = /[0-9A-Za-z]/;
                break;
            }
            case '6': { //pasaporte
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
        if (this.mainFormGroup.controls.documentType.value == '') Swal.fire('Información', 'Debes seleccionar un tipo de documento', 'error');
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
            case '': { //Ngún documento
                this.documentNumberLength = 0;
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
                this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), GlobalValidators.onlyNumberValidator]);
                this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
                break;
            }
            case '4': { //ce
                this.documentNumberLength = 12;
                this.mainFormGroup.controls.documentNumber.setValidators([Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
                this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
                break;
            }
            case '6': { //pasaporte
                this.documentNumberLength = 12;
                this.mainFormGroup.controls.documentNumber.setValidators([Validators.maxLength(12), Validators.pattern(GlobalValidators.getCePattern())]);
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
            //Preparación de datos
            this.filter.ProductType = this.mainFormGroup.controls.product.value;
            this.filter.MovementType = this.mainFormGroup.controls.movement.value;
            this.filter.StartDate = this.bsValueIni;
            this.filter.EndDate = this.bsValueFin;
            this.filter.PolicyNumber = this.mainFormGroup.controls.policyNumber.value;
            this.filter.PageNumber = 1;

            this.filter.ContractorSearchMode = this.mainFormGroup.controls.searchMode.value;
            if (this.mainFormGroup.controls.searchMode.value == '1' && this.mainFormGroup.controls.documentNumber.value.toString().trim() == '') this.filter.ContractorSearchMode = '3';
            this.filter.ContractorDocumentType = this.mainFormGroup.controls.documentType.value;
            this.filter.ContractorDocumentNumber = this.mainFormGroup.controls.documentNumber.value;
            this.filter.ContractorPaternalLastName = this.mainFormGroup.controls.paternalLastName.value;
            this.filter.ContractorMaternalLastName = this.mainFormGroup.controls.maternalLastName.value;
            this.filter.ContractorFirstName = this.mainFormGroup.controls.firstName.value;
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
        if (this.mainFormGroup.hasError('datesNotSortedCorrectly')) error.push('Las fechas no tienen un orden correcto.');
        if (this.mainFormGroup.controls.policyNumber.valid == false) error.push('El número de póliza no es válido.');
        if (this.mainFormGroup.controls.documentNumber.valid == false) error.push('El número de documento no es válido.');
        if (this.mainFormGroup.controls.firstName.valid == false) error.push('El nombre no es válido.');
        if (this.mainFormGroup.controls.paternalLastName.valid == false) error.push('El apellido paterno no es válido.');
        if (this.mainFormGroup.controls.maternalLastName.valid == false) error.push('El apellido materno no es válido.');

        if (this.mainFormGroup.controls.startDate.valid == false) {
            if (this.mainFormGroup.controls.startDate.hasError('required')) error.push('La fecha inicial es requerida.');
            else error.push('La fecha inicial no es válida.');
        }
        if (this.mainFormGroup.controls.endDate.valid == false) {
            if (this.mainFormGroup.controls.endDate.hasError('required')) error.push('La fecha final es requerida.');
            else error.push('La fecha final no es válida.');
        }


        Swal.fire('Información', this.listToString(error), 'error');
    }

    /**
     * extrae los datos que provee el servicio
     */
    search() {
        this.isLoading = true;
        this.policyService.getPolicyTransactionList(this.filter).subscribe(
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
                output = output + item + ' <br>';
            });
        }
        return output;
    }

    /**
     * Bloquea los otros campos cuando el campo de número de póliza no está vacío; en caso contrario, los desbloquea
     */
    policyNumberChanged(event: any) {
        if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
            event.preventDefault();
        } else {
            if (this.mainFormGroup.controls.policyNumber.value != null && this.mainFormGroup.controls.policyNumber.value != '') {
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
    }

    /**
     * Genera archivo de excel con la tabla de la vista
     */
    exportToExcel() {
        if (this.foundResults != null && this.foundResults.length > 0) this.excelService.generatePolicyTransactionExcel(this.foundResults, 'Transacciones');
        else Swal.fire('Información', 'No hay datos para exportar a excel.', 'error');

    }
    onPaste(event: ClipboardEvent) {
        //let clipboardData = event.clipboardData || window.clipboardData;
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');
        if (!isNumeric(pastedText)) {
            event.preventDefault();
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

}
