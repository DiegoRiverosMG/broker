import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
//Modelos
import { ContractorForTable } from '../../../../models/maintenance/contractor-location/contractor-for-table';
import { AccountTransactionSearch } from '../../../../models/report/state-report/request/account-transaction-search';
//Servicios
import { StateReportService } from '../../../../services/report/state-report.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
//Herramientas globales
import { CommonMethods } from './../../../common-methods';
import { CreditEvaluationView } from '../../../../models/report/state-report/response/credit-evaluation-view';
import { CreditQualificationRecordComponent } from '../credit-qualification-record/credit-qualification-record.component';

//Configuración
import { GlobalValidators } from './../../../global-validators';
import { ModuleConfig } from './../../../module.config';
import { AccessFilter } from './../../../access-filter';
import { AccountTransaction } from '../../../../models/report/state-report/response/account-transaction';
import { ClientEnablement } from '../../../../models/report/state-report/request/client-enablement';
@Component({
    selector: 'app-contractor-state',
    templateUrl: './contractor-state.component.html',
    styleUrls: ['./contractor-state.component.css']
})
export class ContractorStateComponent implements OnInit {
    contractor = new ContractorForTable();

    isLoading: boolean = false;  //True para mostrar pantalla de carga, false para ocultarla
    // datepicker
    public bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = ModuleConfig.StartDate;  //Fecha inicial del componente
    bsValueFin: Date = ModuleConfig.EndDate;  //Fecha final del componente
    /**
    * Variables de paginación
    */
    rotate = true; //Si rotar las páginas cuando maxSize > el número de páginas generado
    maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
    totalItems = 0; //total de items encontrados
    filter = new AccountTransactionSearch(); //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente
    foundResults: AccountTransaction[] = [];  //Lista de registros encontrados durante la búsqueda

    mainFormGroup: FormGroup;
    isValidatedInClickButton: boolean = false;  //Flag que indica si el formulario ha sido validado por la acción BUSCAR. Este flag nos sirve para hacer la validación al momento de accionar la búsqueda.

    qualificationTypeList: any[] = [];  //Lista de tipos de calificaciones
    productList: any[] = []; //Lista de productos
    paymentStateList: any[] = [];  //Lista de estados de pago

    genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico
    redirectionMessage = ModuleConfig.RedirectionMessage;
    invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
    invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
    invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
    invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;
    notFoundMessage = ModuleConfig.NotFoundMessage;

    /**Puede habilitar los movimientos del contratante? */
    canEnableContractorMovement: boolean;
    constructor(
        private stateReportService: StateReportService,
        private mainFormBuilder: FormBuilder,
        private policyService: PolicyemitService,
        private clientInformationService: ClientInformationService,
        private modalService: NgbModal,
        private activatedRoute: ActivatedRoute,
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

    ngOnInit() {
        if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['account_state']) == false) this.router.navigate(['/extranet/home']);
        this.canEnableContractorMovement = AccessFilter.hasPermission('32');

        this.contractor = JSON.parse(sessionStorage.getItem('cs-contractor'));
        sessionStorage.removeItem('cs-contractor');

        if (this.contractor == null || this.contractor.Id == null || this.contractor.Id.toString().trim() == '') this.router.navigate(['/extranet/home']);
        //Preparación de filtro
        this.filter.ClientId = this.contractor.Id;
        this.filter.LimitPerPage = 5;

        this.createForm();
        this.initializeForm();

        this.getProductList();
        this.getPaymentStateList();
        this.firstSearch(true);
    }
    /**
     * Crea el formulario
     */
    private createForm() {
        this.mainFormGroup = this.mainFormBuilder.group({
            product: [''],  //tipo de producto
            paymentState: [''],  //estados de pago
            startDate: [ModuleConfig.StartDate, [Validators.required]], //Fecha inferior para búsqueda
            endDate: [ModuleConfig.EndDate, [Validators.required]] //Fecha superior para búsqueda
        });
    }
    private initializeForm() {
        this.mainFormGroup.setValidators([GlobalValidators.dateSort]);
    }

    /**
     * Obtiene la lista de estados de pago
     */
    private getPaymentStateList() {
        this.stateReportService.getPaymentStateList().subscribe(
            res => {
                this.paymentStateList = res.GenericResponse;
            },
            error => {
                Swal.fire('Información', this.genericErrorMessage, 'error');
            }
        );
    }

    /**
     * Obtiene la lista de producto
     */
    private getProductList() {
        this.policyService.getProductTypeList().subscribe(
            res => {
                this.productList = res.GenericResponse;
            },
            error => {
                Swal.fire('Información', this.genericErrorMessage, 'error');
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
     * Realiza la primera búsqueda accionada por el botón buscar o la tecla ENTER
     */
    firstSearch(isFirstSearch: boolean) {
        this.isValidatedInClickButton = true;
        if (this.mainFormGroup.valid && this.contractor.Id != null && this.contractor.Id.trim() != '') {

            this.filter.StartDate = this.mainFormGroup.controls.startDate.value;
            this.filter.EndDate = this.mainFormGroup.controls.endDate.value;
            this.filter.Product = this.mainFormGroup.controls.product.value;
            this.filter.PaymentState = this.mainFormGroup.controls.paymentState.value;
            this.filter.PageNumber = 1;
            this.search(isFirstSearch);
        } else {
            let errorList = [];
            if (this.mainFormGroup.hasError('datesNotSortedCorrectly')) errorList.push(this.invalidEndDateOrderMessage);

            if (!this.mainFormGroup.controls.startDate.valid) {
                if (this.mainFormGroup.controls.startDate.hasError('required')) errorList.push('La fecha inicial es requerida.');
                else errorList.push(this.invalidStartDateMessage);
            }
            if (!this.mainFormGroup.controls.endDate.valid) {
                if (this.mainFormGroup.controls.endDate.hasError('required')) errorList.push('La fecha final es requerida.');
                else errorList.push(this.invalidEndDateMessage);
            }

            if (this.contractor.Id == null || this.contractor.Id.trim() == '') errorList.push('El Id del cliente no es válido.');

            Swal.fire('Información', CommonMethods.listToString(errorList), 'error');
        }
    }

    /**
     * Extrae datos de movimientos del servicio
     */
    search(isFirstSearch: boolean) {
        this.isLoading = true;
        this.stateReportService.getAccountTransactionList(this.filter).subscribe(
            res => {
                this.foundResults = res.GenericResponse;
                if (this.foundResults != null && this.foundResults.length > 0) this.totalItems = res.TotalRowNumber;
                else {
                    this.totalItems = 0;
                    if (isFirstSearch == false) Swal.fire('Información', this.notFoundMessage, 'warning');
                }
                this.isLoading = false;
            },
            error => {
                this.foundResults = [];
                this.totalItems = 0;
                this.isLoading = false;
                if (isFirstSearch == false) Swal.fire('Información', this.genericErrorMessage, 'error');
            }
        );
    }

    /**
     * Realiza la búsqueda accionada por el cambio de página en el paginador
     */
    pageChanged() {
        this.search(false);
    }

    /**
     * Habilitar crédito
     */
    enable() {
        Swal.fire({
            title: 'Habilitar',
            text: 'El cliente posee ' + this.contractor.LatePaymentDays + ' días de morosidad ¿Desea habilitar sus movimientos?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                let data = new ClientEnablement();
                data.ClientId = this.contractor.Id;
                data.User = JSON.parse(localStorage.getItem('currentUser'))['id'];
                this.stateReportService.enableClientMovement(data).subscribe(
                    res => {
                        if (res.StatusCode == 0) {
                            Swal.fire('Información', 'Cliente habilitado exitosamente', 'success');
                            this.contractor.MovementEnablementId = '0';
                            this.contractor.MovementEnablementName = 'HABILITADO';
                        }
                        else if (res.StatusCode == 1) Swal.fire('Información', CommonMethods.listToString(res.ErrorMessageList), 'error');
                        else Swal.fire('Información', this.genericErrorMessage, 'error');
                    },
                    error => {
                        Swal.fire('Información', this.genericErrorMessage, 'error');
                    }
                );

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                //nothing
            }
        });
    }

    /**
     * Muestra el historial de evaluaciones crediticias
     */
    seeQualificationTracking() {
        const modalRef = this.modalService.open(CreditQualificationRecordComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.contractor = this.contractor;
        modalRef.componentInstance.qualificationTypeList = this.qualificationTypeList;

        modalRef.result.then((contractor) => { //Esperamos los datos del broker de respuesta
            if (contractor != null) {
                this.contractor.LastCreditEvaluationId = contractor.LastCreditEvaluationId;
                this.contractor.LastCreditEvaluationName = contractor.LastCreditEvaluationName;
            }
        }, (reason) => {
        });
    }

    /**Ir a la página anterior */
    goBack() {
        sessionStorage.removeItem('cs-contractor');
        this.router.navigate(['/extranet/state-report']);
    }
}
