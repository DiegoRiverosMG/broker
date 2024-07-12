import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { isNumeric } from 'rxjs/internal-compatibility';
//Importación de servicios
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
//Modelos
import { InsuredPolicySearch } from '../../../models/polizaEmit/request/insured-policy-search';
//Configuración
import { GlobalValidators } from './../../global-validators';
import { ModuleConfig } from './../../module.config';
import { CommonMethods } from '../../common-methods';
@Component({
    selector: 'app-insured-report',
    templateUrl: './insured-report.component.html',
    styleUrls: ['./insured-report.component.css']
})
export class InsuredReportComponent implements OnInit {
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
    filter: InsuredPolicySearch = new InsuredPolicySearch(); //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

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
        private excelService: ExcelService
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
        this.mainFormGroup.controls.policyNumber.setValidators([Validators.maxLength(10), this.OnlyNumberValidator]);  // [pending] maxlength

        this.mainFormGroup.controls.product.setValue('');
        this.mainFormGroup.controls.movement.setValue('');
        this.mainFormGroup.controls.startDate.setValue(ModuleConfig.StartDate);
        this.mainFormGroup.controls.endDate.setValue(ModuleConfig.EndDate);

        this.mainFormGroup.controls.searchMode.setValue('1');
        this.mainFormGroup.controls.documentType.setValue('');
        this.mainFormGroup.controls.documentNumber.setValue('');
        this.mainFormGroup.controls.documentNumber.setValidators([Validators.maxLength(0), this.OnlyNumberValidator]);
        this.mainFormGroup.controls.personType.setValue('1');

        this.mainFormGroup.controls.paternalLastName.setValue('');
        this.mainFormGroup.controls.paternalLastName.setValidators([Validators.maxLength(19), Validators.pattern(this.latinTextPattern)]);
        this.mainFormGroup.controls.maternalLastName.setValue('');
        this.mainFormGroup.controls.maternalLastName.setValidators([Validators.maxLength(19), Validators.pattern(this.latinTextPattern)]);
        this.mainFormGroup.controls.firstName.setValue('');
        this.mainFormGroup.controls.firstName.setValidators([Validators.maxLength(19), Validators.pattern(this.latinTextPattern)]);


        this.mainFormGroup.setValidators([this.dateSort]);
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
     * Patrones
     */
    public dniPattern = '(^(?!.*([1][2][3][4][5][6][7][8])).*)(^[0-9]{8,8}$)';  //Patrón para validar el DNI
    public cePattern = '^[a-zA-Z0-9]*$';  //Patrón para validar el carnet de extranjeria
    public legalNamePattern = '^[a-zA-Z \*\-\,\:\(\)\&\$\#]*$'; //Patrón para validar la razón social
    public latinTextPattern = '^[a-zA-Z \u00C0-\u024F ]*$';  //Patrón para validar los nombres, apellido paterno y materno

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
     * VALIDADORES
     */

    /**
     * Validar que todos los caracteres sean iguales
     * @param control valor de control de formulario
     */
    notAllCharactersAreEqualValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.length == 8) {
            let areAllEqual: boolean = true;
            for (var i = 0; i < control.value.length; i++) {
                if (i > 0) {
                    if (control.value.charAt(i) != control.value.charAt(i - 1)) areAllEqual = false;
                }
            }
            if (areAllEqual == true) return { 'AllCharactersAreEqual': true };
            else return null; //validation was passed
        } else {
            return null;
        }
    }

    /**
     * Validar que todos los caracteres sean solo números
     * @param control valor de control de formulario
     */
    OnlyNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != '') {
            if (/^[0-9]+$/.test(control.value)) return null;
            else return { 'IsNotNumber': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que todos los caracteres sean solo números o caracteres de alfabeto
     * @param control valor de control de formulario
     */
    OnlyNumberAndTextValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != '') {
            if (/^[0-96a-zA-Z]+$/.test(control.value)) return null;
            else return { 'IsNotNumberOrText': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que todos los caracteres sean caracteres de alfabeto y espacios
     * @param control valor de control de formulario
     */
    OnlyTextAndSpaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != '') {
            if (/^[A-Za-z ]+$/.test(control.value)) return null;
            else return { 'IsNotTextOrSpace': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que el número de RUC solo pueda empezar con '10', '15', '17' y '20', en caso contrario será considerado no válido
     * @param control valor de control de formulario
     */
    RucNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != '') {
            if (control.value.toString().trim().substring(0, 2) == '10' || control.value.toString().trim().substring(0, 2) == '15'
                || control.value.toString().trim().substring(0, 2) == '17' || control.value.toString().trim().substring(0, 2) == '20') {
                return null;
            } else return { 'notValidRUC': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que no haya más de 3 vocales juntas
     * @param control valor de control de formulario
     */
    vowelLimitValidation(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != '') {
            let vowelCount = 0;
            for (let i = 0; i < control.value.toString().trim().length; i++) {
                if (/[aeiouAEIOU]/.test(control.value.toString().trim().charAt(i))) vowelCount++;
                else vowelCount = 0;

                if (vowelCount > 3) return { 'moreThanThreeVowels': true };
            }
            return null;
        } else {
            return null;
        }
    }

    /**
     * Validar que no haya 5 consonantes juntas
     * @param control valor de control de formulario
     */
    consonantLimitValidation(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != '') {
            let consonantCount = 0;
            for (let i = 0; i < control.value.toString().trim().length; i++) {
                if (/[qwrtyupsdfghjkñzxcvbnm]/.test(control.value.toString().trim().charAt(i))) consonantCount++;
                else consonantCount = 0;

                if (consonantCount == 5) return { 'moreThanFiveConsonants': true };
            }
            return null;
        } else {
            return null;
        }
    }

    /**
     * Validar que la fecha de inicio 'startDate' no sea posterior a la fecha de fin 'endDate'
     * @param group formulario
     */
    dateSort(group: FormGroup): any {
        if (group) {
            if (group.get('startDate').value > group.get('endDate').value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
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
                this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(11), Validators.maxLength(11), this.OnlyNumberValidator, this.RucNumberValidator]);
                this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
                break;
            }
            case '2': { //dni
                this.documentNumberLength = 8;
                this.mainFormGroup.controls.documentNumber.setValidators([Validators.minLength(8), Validators.maxLength(8), this.OnlyNumberValidator]);
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


            this.filter.InsuredSearchMode = this.mainFormGroup.controls.searchMode.value;
            if (this.mainFormGroup.controls.searchMode.value == '1' && this.mainFormGroup.controls.documentNumber.value.toString().trim() == '') {
                this.filter.InsuredSearchMode = '3';
            }
            this.filter.InsuredDocumentType = this.mainFormGroup.controls.documentType.value;
            this.filter.InsuredDocumentNumber = this.mainFormGroup.controls.documentNumber.value;
            this.filter.InsuredPaternalLastName = this.mainFormGroup.controls.paternalLastName.value;
            this.filter.InsuredMaternalLastName = this.mainFormGroup.controls.maternalLastName.value;
            this.filter.InsuredFirstName = this.mainFormGroup.controls.firstName.value;
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
        this.policyService.getInsuredPolicyList(this.filter).subscribe(
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
                this.mainFormGroup.setValidators([this.dateSort]);
            }
            this.mainFormGroup.updateValueAndValidity();
        }
    }

    /**
     * Genera archivo de excel con la tabla de la vista
     */
    exportToExcel() {
        if (this.foundResults != null && this.foundResults.length > 0) this.excelService.generateInsuredPolicyExcel(this.foundResults, 'Asegurados');
        else Swal.fire('Información', 'No hay datos para exportar a excel.', 'error')
    }
    onPaste(event: ClipboardEvent) {
        //let clipboardData = event.clipboardData || window.clipboardData;
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
}
