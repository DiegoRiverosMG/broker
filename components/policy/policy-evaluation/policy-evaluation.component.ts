import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// Importación de servicios
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { OthersService } from '../../../services/shared/others.service';

// Importacion de modelos
import { QuotationStatusChange } from '../../../models/quotation/request/quotation-status-change';
import { Status } from '../../../models/quotation/response/status';
import { Reason } from '../../../models/quotation/response/reason';
import { QuotationTracking } from '../../../models/quotation/response/quotation-tracking'

// SweetAlert
import swal from 'sweetalert2';
// Configuración
import { CommonMethods } from './../../common-methods';
import { AccessFilter } from './../../access-filter'
import { QuotationTrackingSearch } from '../../../models/quotation/request/quotation-tracking-search';
import { FilePickerComponent } from '../../../modal/file-picker/file-picker.component'
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service'; // 20230325
import { AuthorizedRate } from '../../../models/quotation/request/authorized-rate';
import { Broker } from '../../../models/quotation/request/broker';
import { BrokerProduct } from '../../../models/quotation/request/broker-product';

@Component({
    selector: 'app-policy-evaluation',
    templateUrl: './policy-evaluation.component.html',
    styleUrls: ['./policy-evaluation.component.css']
})
export class PolicyEvaluationComponent implements OnInit {

    /**
       * Variables de paginación
       */
    rotate = true; // Si rotar las páginas cuando maxSize > el número de páginas generado
    maxSize = 15; // cantidad de paginas que se mostrarán en el html del paginado
    totalItems = 0; // total de items encontrados
    /**Datos de filtro para la búsqueda de cambios de estado de la cotización */
    filter = new QuotationTrackingSearch();
    /**Lista de resultados de búsqueda de cambios de estado de la cotización */
    statusChangeList: QuotationTracking[];

    quotationNumber: string;  //Número de cotización
    policyNumber: string;  //Número de poliza
    nroProcess: string;  //Número de poliza
    statusChangeRequest = new QuotationStatusChange();  //Objeto principal a enviar en la operación de cambio de estado
    pensionAuthorizedRate: boolean = false;  //habilitar los campos de tasa autorizada de SCTR pensión
    saludAuthorizedRate: boolean = false;  //habilitar los campos de tasa autorizada de SCTR salud

    bsConfig: Partial<BsDatepickerConfig>;

    estimatedWorkerQuantity: string;
    /**Código equivalente del código del distrito */
    zipCode: string;
    reasonList: Status[] = []; //Lista de razones para el cambio de estado
    statusList: Reason[] = []; //Lista de estados de cotización

    files: File[] = []; //Lista de archivos cargados para subirse
    lastFileAt: Date; //Variable de componente FILES para ordenar por fecha
    filesMaxSize = 10485760;  //Limite del total de tamaño de archivos

    /**Modo: evaluar, solover, recotizar, emitir */
    mode: string;
    isLoading: Boolean = false; //true:mostrar | false:ocultar pantalla de carga
    mainFormGroup: FormGroup;
    inputsQuotation: any = {}; //Datos de cotización que se carga para evaluar la cotización

    //Mensaje de manejo de errores
    genericServerErrorMessage: string = 'Ha ocurrido un error inesperado, contáctese con soporte.';
    redirectionMessage: string = 'Usted será redireccionado a la página anterior.';
    originalHealthMainPropComission: number;
    originalPensionMainPropComission: number;
    originalPensionMainAuthComission: number;
    originalHealthMainAuthComission: number;
    originalHealthMinPropPremium: number;
    originalPensionMinPropPremium: number;
    originalPensionMinAuthPremium: number;
    originalHealthMinAuthPremium: number;
    enabledPensionProposedRate: boolean;
    enabledHealthProposedRate: boolean;
    enabledPensionAuthorizedRate: boolean;
    enabledHealthAuthorizedRate: boolean;
    enabledHealthMinPropPremium: boolean;
    enabledHealthAuthorizedPremium: boolean;
    enabledPensionMinPropPremium: boolean;
    enabledPensionAuthorizedPremium: boolean;
    enabledHealthMainPropCommission: boolean;
    enabledHealthMainAuthCommission: boolean;
    enabledPensionMainPropCommission: boolean;
    enabledPensionMainAuthCommission: boolean;
    enabledHealthSecondaryPropCommission: boolean;
    enabledPensionSecondaryPropCommission: boolean;
    enabledHealthSecondaryAuthCommission: boolean;
    enabledPensionSecondaryAuthCommission: boolean;
    buttonName: string;
    evaluationLabel: string;
    healthIGV: number;
    pensionIGV: number;
    vidaLeyIGV: number;
    healthProductId = JSON.parse(localStorage.getItem('saludID'))
    pensionProductId = JSON.parse(localStorage.getItem('pensionID'))
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'))
    //epsItem = JSON.parse(sessionStorage.getItem('eps'))
    epsItem = JSON.parse(localStorage.getItem('eps'))
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    pensionMessage: string;
    isNetPremiumLessThanMinHealthPremium: boolean;
    isNetPremiumLessThanMinPensionPremium: boolean;
    healthMessage: string;
    typeTransac: string;
    tipoRenovacion: any;
    frecuenciaPago: any;
    canBillMonthly: boolean = true;
    canBillInAdvance: boolean = true;
    canProposeRate: boolean = true;
    canSeeRiskRate: boolean = true;
    dEmiPension = 0
    dEmiSalud = 0
    lblFecha: string = '';
    lblProducto: string = '';
    template: any = {}
    variable: any = {}
    profileId: any; // 20230325
    userId: number; // 20230325

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private policyService: PolicyemitService,
        private quotationService: QuotationService,
        private mainFormBuilder: FormBuilder,
        private domSanitizer: DomSanitizer,
        private othersService: OthersService,
        private ngbModal: NgbModal,
        private parameterSettingsService: ParameterSettingsService // 20230325
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
        this.createFormControl();
        this.initializeForm();
        this.userId = JSON.parse(localStorage.getItem('currentUser'))['id']; // 20230325
        this.profileId = await this.getProfileProduct(); // 20230325

        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

        // Configuracion de las variables
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)

        let policyData = JSON.parse(sessionStorage.getItem('cs-quotation'));
        if (policyData == null || policyData === undefined) { this.router.navigate(['/extranet/policy-request']); }
        else {
            this.policyNumber = policyData.PolicyNumber;
            this.quotationNumber = policyData.QuotationNumber;
            this.mode = policyData.Mode;
            this.nroProcess = policyData.NroProcess;
            this.typeTransac = policyData.TypeTransac;

            this.obtenerTipoRenovacion();

            if (this.quotationNumber == null || this.quotationNumber === undefined || this.mode == null || this.mode === undefined) {
                this.router.navigate(['/extranet/policy-request']);
            } else {
                this.evaluationLabel = 'Evaluación';
                this.buttonName = 'CONTINUAR';
            }

            if (this.template.ins_validaPermisos) {
                this.canProposeRate = AccessFilter.hasPermission('13');
                this.canSeeRiskRate = AccessFilter.hasPermission('36');
                this.canBillMonthly = AccessFilter.hasPermission('16');
                this.canBillInAdvance = AccessFilter.hasPermission('17');
            }


            this.isLoading = true;
            this.getIGVData();
            this.getStatusList();

            this.filter.QuotationNumber = this.quotationNumber;
            this.filter.PageNumber = 1;
            this.filter.LimitPerPage = 5;
            this.firstSearch();
        }
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = this.userId;
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

    async obtenerTipoRenovacion() {
        let requestTypeRen: any = {}
        requestTypeRen.P_NEPS = this.epsItem.STYPE
        requestTypeRen.P_NPRODUCT = this.codProducto
        requestTypeRen.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']

        await this.policyService.getTipoRenovacion(requestTypeRen).toPromise().then(
            async (res: any) => {
                this.tipoRenovacion = res;
            })
    }

    async cargarFrecuencia() {
        await this.policyService.getFrecuenciaPago(this.inputsQuotation.tipoRenovacion).toPromise().then(
            res => {
                this.inputsQuotation.frecuenciaPago = this.inputsQuotation.tipoRenovacion;
                this.frecuenciaPago = res;
                if (this.frecuenciaPago != null && this.frecuenciaPago.length == 1) {
                    this.inputsQuotation.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA;
                }
            })
    }

    createFormControl() { //Crear 'mainFormGroup'
        this.mainFormGroup = this.mainFormBuilder.group({
            reason: [''], //Razón de cambio de estado
            status: ['', [Validators.required]],  //Nuevo estado de cotización
            comment: [''] //Comentario adicional para el cambio de estado de cotización
        });
    }

    initializeForm() {  //Inicializar 'mainFormGroup'
        this.mainFormGroup.controls.reason.setValue('');
        this.mainFormGroup.controls.status.setValue('');
        this.mainFormGroup.controls.comment.setValue('');
    }

    getSafeUrl(unsafeUrl: string) { //Este método transforma una url 'insegura' en una 'segura' para evitar la alteración del 'sanitizer de html'
        return this.domSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    }

    downloadFile(filePath: string) {  //Descargar archivos de cotización
        this.othersService.downloadFile(filePath).subscribe(
            res => {
                if (res.StatusCode == 1) {
                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                } else {
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
                }

            },
            err => {
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    /**Obtiene el IGV para Salud y el IGV x Derecho de emisión para Pensión */
    async getIGVData() {
        this.isLoading = true;

        let data = ['I', 'D']

        // Pension
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.pensionProductId.nbranch;
            itemIGV.P_NPRODUCT = this.pensionProductId.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.pensionIGV = item == 'I' ? res : this.pensionIGV
                    this.dEmiPension = item == 'D' ? res : this.dEmiPension
                }
            );
        }

        // Salud
        for (var item of data) {
            let itemIGV: any = {};
            itemIGV.P_NBRANCH = this.healthProductId.nbranch;
            itemIGV.P_NPRODUCT = this.healthProductId.id;
            itemIGV.P_TIPO_REC = item;

            await this.quotationService.getIGV(itemIGV).toPromise().then(
                res => {
                    this.healthIGV = item == 'I' ? res : this.healthIGV
                    this.dEmiSalud = item == 'D' ? res : this.dEmiSalud
                }
            );
        }

        // Vida  Ley
        let itemIGV: any = {};
        itemIGV.P_NBRANCH = this.vidaLeyID.nbranch;
        itemIGV.P_NPRODUCT = this.vidaLeyID.id;
        itemIGV.P_TIPO_REC = 'A';

        await this.quotationService.getIGV(itemIGV).toPromise().then(
            res => {
                this.vidaLeyIGV = res
            }
        );

        await this.getQuotationData();
    }

    /**
     * Obtiene una lista de estados de cotización
     */
    getStatusList() {
        this.quotationService.getStatusList('3', this.codProducto).subscribe(
            res => {
                res.forEach(element => {
                    if (element.Id == '2' || element.Id == '3') {
                        if (element.Id == '3') element.Name = 'NO PROCEDE'
                        this.statusList.push(element);
                    }
                });
            },
            error => {

            }
        );
    }

    /**
     * Obtiene el monto de planilla según el tipo de riesgo
     * @param riskTypeId id de tipo de riesgo
     */
    getPayrollAmount(riskTypeId: string) {
        let payRollAmount;
        this.inputsQuotation.SharedDetailsList.forEach(element => {
            if (element.RiskTypeId == riskTypeId) payRollAmount = element.PayrollAmount;
        });
        return payRollAmount;
    }

    /**
     * Calcula la prima
     * @param payrollAmount monto de planilla
     * @param rate tasa
     */
    calculatePremium(payrollAmount: number, rate: number) {
        // return Number(payrollAmount.toString()) * Number(rate.toString());
        return Number(payrollAmount.toString()) * Number(rate.toString()) / 100;
    }

    /**
     * Calcula la nueva prima según la tasa autorizada ingresada
     * Calcula la nueva prima total neta, IGV a la prima neta y la prima total bruta.
     * @param authorizedRate valor de ngModel de tasa autorizada
     * @param riskTypeId - Id de tipo de riesgo
     * @param productId Id de producto
     */
    calculateNewPremiums(authorizedRate: any, riskTypeId: string, productId: string) {
        if (!this.template.debug_dummy) {
            let planProp = authorizedRate != '' ? Number(authorizedRate) : 0;
            planProp = isNaN(planProp) ? 0 : planProp;
            authorizedRate = planProp;
            // let self = this;
            if (productId == this.healthProductId.id) {
                if (authorizedRate > 100) {
                    this.inputsQuotation.SaludDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = true;
                        }
                    });
                }
                else {
                    this.inputsQuotation.SaludDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = false;
                        }
                    });
                }
            } else if (productId == this.pensionProductId.id) {
                if (authorizedRate > 100) {
                    this.inputsQuotation.PensionDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = true;
                        }
                    });
                }
                else {
                    this.inputsQuotation.PensionDetailsList.forEach(item => {
                        if (item.RiskTypeId == riskTypeId) {
                            item.valItemAu = false;
                        }
                    });
                }
            }

            if (isNaN(authorizedRate) || authorizedRate.toString().trim() == '') authorizedRate = 0; //Si el input está limpio, lo convertimos a 0

            let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), authorizedRate), 2); //cálculo de prima nueva con la tasa autorizada
            if (productId == this.pensionProductId.id) { //Si el producto es pensión
                let pensionNewNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
                this.inputsQuotation.PensionDetailsList.forEach((element, key) => {
                    if (element.RiskTypeId == riskTypeId) {
                        this.inputsQuotation.PensionDetailsList[key].NewPremium = newPremium;
                        pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(newPremium.toString());
                    } else pensionNewNetAmount = Number(pensionNewNetAmount.toString()) + Number(element.NewPremium.toString());

                });
                //Cálculo de nueva prima total neta de Pensión
                this.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(pensionNewNetAmount, 2);
                //Cálculo de Prima Comercial de Pensión
                this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
                //Cálculo de IGV de la nueva prima total neta de Pensión
                this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNewNetAmount, 2);
                //Cálculo de nueva prima total bruta de Pensión
                this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);

                this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
            }

            if (productId == this.healthProductId.id) { //Si el producto es Salud
                let saludNewNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
                this.inputsQuotation.SaludDetailsList.forEach((element, key) => {
                    if (element.RiskTypeId == riskTypeId) {
                        this.inputsQuotation.SaludDetailsList[key].NewPremium = newPremium;
                        saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(newPremium.toString());
                    } else saludNewNetAmount = Number(saludNewNetAmount.toString()) + Number(element.NewPremium.toString());
                });
                //Cálculo de nueva prima total neta de Salud
                this.inputsQuotation.SaludNewNetAmount = CommonMethods.formatValor(saludNewNetAmount, 2);
                //Cálculo de Prima Comercial de Pensión
                this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
                //Cálculo de IGV de la nueva prima total neta de Salud
                this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * this.healthIGV) - this.inputsQuotation.SaludNewNetAmount, 2);
                //Cálculo de nueva prima total bruta de Salud
                this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

                this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
            }
        }

    }

    // changeTasaPropuestaPension(planPro, valor) {
    //     let planProp = planPro != '' ? Number(planPro) : 0;
    //     planProp = isNaN(planProp) ? 0 : planProp;
    //     let self = this;

    //     if (planProp > 100) {
    //         this.inputsQuotation.PensionDetailsList.forEach(item => {
    //             if (item.RiskTypeId == valor) {
    //                 item.valItemPr = true;
    //             }
    //         });
    //     }
    //     else {
    //         this.inputsQuotation.PensionDetailsList.forEach(item => {
    //             if (item.RiskTypeId == valor) {
    //                 item.valItemPr = false;
    //             }
    //         });
    //     }
    // }

    changeTasaPropuestaPension(planPro, valor) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;

        if (planProp > 100) {
            this.inputsQuotation.PensionDetailsList.forEach(item => {
                if (item.RiskTypeName == valor) {
                    item.valItem = true;
                }
            });
        }
        else {
            this.inputsQuotation.PensionDetailsList.forEach(item => {
                if (item.RiskTypeName == valor) {
                    item.valItem = false;
                }
            });
        }

        // Lista Pension
        if (this.inputsQuotation.PensionDetailsList != '') {
            this.inputsQuotation.PensionDetailsList.map(function (dato) {
                if (dato.DES_RIESGO == valor) {
                    dato.TASA_PRO = planProp;
                }
            });
        }

        let tasa = 0;
        this.inputsQuotation.PensionDetailsList.map((item) => {
            this.calculateNewPremiums(tasa = (item.AuthorizedRate == '' || item.AuthorizedRate == 0) ? item.OriginalAuthorizedRate : item.AuthorizedRate, item.RiskTypeId, this.pensionProductId.id);
            item.valItem = false;
        });
    }

    changeTasaPropuestaSalud(planPro, valor) {
        let planProp = planPro != '' ? Number(planPro) : 0;
        planProp = isNaN(planProp) ? 0 : planProp;
        let self = this;

        if (planProp > 100) {
            this.inputsQuotation.SaludDetailsList.forEach(item => {
                if (item.RiskTypeId == valor) {
                    item.valItemPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SaludDetailsList.forEach(item => {
                if (item.RiskTypeId == valor) {
                    item.valItemPr = false;
                }
            });
        }
    }

    /**
     * Calcula la prima según la tasa propuesta ingresada
     * Calcula la prima total neta, IGV a la prima neta y la prima total bruta.
     * @param rate valor de ngModel de tasa propuesta
     * @param riskTypeId - Id de tipo de riesgo
     * @param productId Id de producto
     */
    calculatePremiums(rate: any, riskTypeId: string, productId: string) {
        if (isNaN(rate) || rate.toString().trim() == '') rate = 0; //Si el input está limpio, lo convertimos a 0

        let newPremium = CommonMethods.formatValor(this.calculatePremium(this.getPayrollAmount(riskTypeId), rate), 2); //cálculo de prima nueva con la tasa autorizada
        if (productId == this.pensionProductId.id) { //Si el producto es pensión
            let pensionTotalNetAmount = 0.00; //nueva prima total neta de Pensión, con la tasa autorizada
            this.inputsQuotation.PensionDetailsList.forEach((element, key) => {
                if (element.RiskTypeId == riskTypeId) {
                    this.inputsQuotation.PensionDetailsList[key].Premium = newPremium;
                    pensionTotalNetAmount = Number(pensionTotalNetAmount.toString()) + Number(newPremium.toString());
                } else pensionTotalNetAmount = Number(pensionTotalNetAmount.toString()) + Number(element.NewPremium.toString());

            });
            //Cálculo de nueva prima total neta de Pensión
            this.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(pensionTotalNetAmount, 2);
            //Cálculo de nueva prima comercial de Pension
            this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(pensionTotalNetAmount * this.dEmiPension, 2);
            //Cálculo de IGV de la nueva prima total neta de Pensión
            this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNetAmount, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionCalculatedIGV) + Number(this.inputsQuotation.PensionPrimaComercial), 2);
        }
        if (productId == this.healthProductId.id) { //Si el producto es Salud
            let saludTotalNetAmount = 0.00; //prima prima total neta de Salud, según la tasa autorizada
            this.inputsQuotation.SaludDetailsList.forEach((element, key) => {
                if (element.RiskTypeId == riskTypeId) {
                    this.inputsQuotation.SaludDetailsList[key].Premium = newPremium;
                    saludTotalNetAmount = Number(saludTotalNetAmount.toString()) + Number(newPremium.toString());
                } else saludTotalNetAmount = Number(saludTotalNetAmount.toString()) + Number(element.NewPremium.toString());
            });
            //Cálculo de nueva prima total neta de Salud
            this.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(saludTotalNetAmount, 2);
            //Cálculo de nueva prima comercial de Salud
            this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(saludTotalNetAmount * this.dEmiSalud, 2);
            //Cálculo de IGV de la nueva prima total neta de Salud
            this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNetAmount * this.healthIGV) - this.inputsQuotation.SaludNetAmount, 2);
            //Cálculo de nueva prima total bruta de Salud
            this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludCalculatedIGV) + Number(this.inputsQuotation.SaludPrimaComercial), 2);
        }

        if (Number(this.inputsQuotation.SaludNetAmount) < Number(this.inputsQuotation.SaludMinPremium)) {
            this.isNetPremiumLessThanMinHealthPremium = true;
            let premium = (this.inputsQuotation.SaludPropMinPremium != null && this.inputsQuotation.SaludPropMinPremium !== undefined && Number(this.inputsQuotation.SaludPropMinPremium) > 0) ? this.inputsQuotation.SaludPropMinPremium : this.inputsQuotation.SaludMinPremium;
            // this.healthMessage = 'El monto calculado no supera la prima mínima, la cotización se generará con el siguiente monto S /. ' + premium * this.healthIGV;
            this.healthMessage = this.variable.var_msjPrimaMin;
        } else {
            this.isNetPremiumLessThanMinHealthPremium = false;
            this.healthMessage = '';
        }

        if (Number(this.inputsQuotation.PensionNetAmount) < Number(this.inputsQuotation.PensionMinPremium)) {
            this.isNetPremiumLessThanMinPensionPremium = true;
            let premium = (this.inputsQuotation.PensionPropMinPremium != null && this.inputsQuotation.PensionPropMinPremium !== undefined && Number(this.inputsQuotation.PensionPropMinPremium) > 0) ? this.inputsQuotation.PensionPropMinPremium : this.inputsQuotation.PensionMinPremium;
            // this.pensionMessage = 'El monto calculado no supera la prima mínima, la cotización se generará con el siguiente monto S /. ' + premium * this.pensionIGV;
            this.pensionMessage = this.variable.var_msjPrimaMin;
        } else {
            this.isNetPremiumLessThanMinPensionPremium = false;
            this.pensionMessage = '';
        }

    }
    /**
     * Obtener los datos de la cotización, para ello se llama a 3 procedimientos
     * getPolicyEmitCab: Obtiene los datos principales de cotización, cliente, sede.
     * getPolicyEmitComer: Obtiene los brokers incluidos en la cotización
     * getPolicyEmitDet: Obtiene detalles de la cotización como montos de planilla, total de trabajadores, primas, tasas según producto y riesgo
     */
    async getQuotationData() {  //Obtener datos de cotización: cabecera, brokers y detalles.
        this.isLoading = true;
        let self = this;
        let Vencido = this.inputsQuotation.facturacionVencido ? 1 : 0; //AVS - INTERCONEXION SABSA

        forkJoin(this.policyService.getPolicyEmitCab(this.quotationNumber, this.typeTransac, JSON.parse(localStorage.getItem('currentUser'))['id']),
            this.policyService.getPolicyEmitComer(this.quotationNumber),
            this.policyService.getPolicyEmitDetTX(this.nroProcess, this.typeTransac, JSON.parse(localStorage.getItem('currentUser'))['id'], Vencido),
            this.policyService.getPolicyCot(this.quotationNumber)).toPromise().then(
                (res: any) => {
                    if (res[0].GenericResponse == null || res[1].length == 0 || res[2].length == 0) { //Verificamos si todos los datos de las 3 peticiones han sido obtenidos
                        swal.fire('Información', 'No se encontraron los datos necesarios para esta cotización. ' + this.redirectionMessage, 'error');
                        this.router.navigate(['/extranet/policy-request']);
                    } else {
                        if (res[0].StatusCode == 2) {
                            swal.fire('Información', this.listToString(res[0].ErrorMessageList), 'warning');
                        }
                        //Datos de cotización
                        this.inputsQuotation.Date = res[0].GenericResponse.FECHA; //

                        //Datos de contratante
                        this.inputsQuotation.DocumentTypeId = res[0].GenericResponse.TIPO_DOCUMENTO;
                        this.inputsQuotation.DocumentTypeName = res[0].GenericResponse.TIPO_DES_DOCUMENTO;
                        this.inputsQuotation.DocumentNumber = res[0].GenericResponse.NUM_DOCUMENTO;
                        this.inputsQuotation.P_SNOMBRES = res[0].GenericResponse.NOMBRE_RAZON;
                        this.inputsQuotation.P_SDESDIREBUSQ = res[0].GenericResponse.DIRECCION;
                        this.inputsQuotation.P_SE_MAIL = res[0].GenericResponse.CORREO;

                        //AVS - INTERCONEXION SABSA
                        this.inputsQuotation.P_NCOT_MIXTA = res[0].GenericResponse.NCOT_MIXTA;
                        this.inputsQuotation.P_NPRODUCT = res[0].GenericResponse.NPRODUCT;

                        //Datos de cotización - sede
                        this.inputsQuotation.CurrencyId = res[0].GenericResponse.COD_MONEDA;
                        this.inputsQuotation.CurrencyName = res[0].GenericResponse.DES_MONEDA;
                        this.inputsQuotation.LocationId = res[0].GenericResponse.COD_TIPO_SEDE;
                        this.inputsQuotation.LocationName = res[0].GenericResponse.DES_TIPO_SEDE;

                        this.inputsQuotation.EconomicActivityId = res[0].GenericResponse.COD_ACT_ECONOMICA;
                        this.inputsQuotation.EconomicActivityName = res[0].GenericResponse.DES_ACT_ECONOMICA;
                        this.inputsQuotation.TechnicalActivityId = res[0].GenericResponse.ACT_TECNICA;
                        this.inputsQuotation.TechnicalActivityName = res[0].GenericResponse.DES_ACT_TECNICA;
                        this.inputsQuotation.HasDelimiter = Number(res[0].GenericResponse.DELIMITACION) == 0 ? false : true;
                        this.inputsQuotation.IsMining = Number(res[0].GenericResponse.MINA) == 0 ? false : true;
                        this.inputsQuotation.DepartmentId = res[0].GenericResponse.COD_DEPARTAMENTO;
                        this.inputsQuotation.DepartmentName = res[0].GenericResponse.DES_DEPARTAMENTO;
                        this.inputsQuotation.ProvinceId = res[0].GenericResponse.COD_PROVINCIA;
                        this.inputsQuotation.ProvinceName = res[0].GenericResponse.DES_PROVINCIA;
                        this.inputsQuotation.DistrictId = res[0].GenericResponse.COD_DISTRITO;
                        this.inputsQuotation.DistrictName = res[0].GenericResponse.DES_DISTRITO;

                        this.inputsQuotation.Comment = res[0].GenericResponse.COMENTARIO;
                        this.inputsQuotation.FilePathList = res[0].GenericResponse.RUTAS;

                        this.inputsQuotation.SaludPropMinPremium = res[0].GenericResponse.MIN_SALUD_PR;
                        this.originalHealthMinPropPremium = res[0].GenericResponse.MIN_SALUD_PR;
                        this.inputsQuotation.HealthAuthMinPremium = res[0].GenericResponse.MIN_SALUD_AUT;
                        this.originalHealthMinAuthPremium = this.inputsQuotation.HealthAuthMinPremium;
                        this.inputsQuotation.SaludMinPremium = res[0].GenericResponse.MIN_SALUD;
                        this.inputsQuotation.PensionPropMinPremium = res[0].GenericResponse.MIN_PENSION_PR;
                        this.originalPensionMinPropPremium = res[0].GenericResponse.MIN_PENSION_PR;
                        this.inputsQuotation.PensionMinPremium = res[0].GenericResponse.MIN_PENSION;
                        this.inputsQuotation.PensionAuthMinPremium = res[0].GenericResponse.MIN_PENSION_AUT;
                        this.inputsQuotation.NBRANCH = res[0].GenericResponse.NBRANCH;
                        this.originalPensionMinAuthPremium = this.inputsQuotation.PensionAuthMinPremium;

                        //Datos de brokers
                        this.inputsQuotation.SecondaryBrokerList = [];
                        res[1].forEach(item => {
                            item.COMISION_SALUD_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO);
                            item.COMISION_PENSION_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO);
                            item.COMISION_SALUD_AUT = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_AUT);
                            item.COMISION_PENSION_AUT = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_AUT);
                            item.COMISION_SALUD = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD);
                            item.COMISION_PENSION = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION);
                            item.valItemSal = false;
                            item.valItemSalPr = false;
                            item.valItemPen = false;
                            item.valItemPenPr = false;
                            item.OriginalHealthPropCommission = item.COMISION_SALUD_PRO;
                            item.OriginalPensionPropCommission = item.COMISION_PENSION_PRO;
                            item.OriginalHealthAuthCommission = item.COMISION_SALUD_AUT;
                            item.OriginalPensionAuthCommission = item.COMISION_PENSION_AUT;
                            self.inputsQuotation.SecondaryBrokerList.push(item);
                        });

                        //Detalles de cotización
                        this.inputsQuotation.SharedDetailsList = []; //Lista compartida que contiene Nro de trabajadores y Monto de planilla
                        this.inputsQuotation.PensionDetailsList = []; //Lista de detalles de Pensión, cada registro contiene: riesgo, tasa, prima, tasa propuesta
                        this.inputsQuotation.SaludDetailsList = []; //Lista de detalles de Salud, cada registro contiene: riesgo, tasa, prima, tasa propuesta

                        this.inputsQuotation.SaludNetAmount = 0.00; //Prima total neta de Salud
                        this.inputsQuotation.SaludPrimaComercial = 0.00 // Prima Comercial de Salud
                        this.inputsQuotation.SaludGrossAmount = 0.00; //Prima total bruta de Salud
                        this.inputsQuotation.SaludCalculatedIGV = 0.00; //Igv de prima total neta de Salud

                        this.inputsQuotation.PensionNetAmount = 0.00; //Prima total neta de Pensión
                        this.inputsQuotation.PensionPrimaComercial = 0.00 // Prima Comercial de Pension
                        this.inputsQuotation.PensionGrossAmount = 0.00; //Prima total bruta de Pensión
                        this.inputsQuotation.PensionCalculatedIGV = 0.00; //Igv de prima total neta de Pensión

                        this.inputsQuotation.SaludNewNetAmount = 0.00;  //Nueva Prima total neta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas
                        this.inputsQuotation.SaludNewPrimaComercial = 0.00 // Nueva Prima Comercal, correspondiente a las primas nuevas generadas por tasas autorizadas
                        this.inputsQuotation.SaludNewGrossAmount = 0.00;  //Nueva Prima total bruta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas
                        this.inputsQuotation.SaludNewCalculatedIGV = 0.00;  //Nuevo Igv de prima total neta de Salud, correspondiente a las primas nuevas generadas por tasas autorizadas

                        this.inputsQuotation.PensionNewNetAmount = 0.00;  //Nueva Prima total neta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                        this.inputsQuotation.PensionNewPrimaComercial = 0.00 // Nueva Prima Comercal, correspondiente a las primas nuevas generadas por tasas autorizadas
                        this.inputsQuotation.PensionNewGrossAmount = 0.00;  //Nueva Prima total bruta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas
                        this.inputsQuotation.PensionNewCalculatedIGV = 0.00;  //Nuevo Igv de prima total neta de Pensión, correspondiente a las primas nuevas generadas por tasas autorizadas

                        res[2].forEach(element => {
                            if (element.ID_PRODUCTO == this.pensionProductId.id) { //Si es un elemento de pensión
                                let item: any = {};
                                item.RiskRate = CommonMethods.formatValor(element.TASA_RIESGO, 6);
                                item.RiskTypeId = element.TIP_RIESGO; //Id tipo de riesgo
                                if (element.DES_RIESGO.search('Alto') != -1) {
                                    element.DES_RIESGO = 'Alto (Obreros)'
                                }

                                if (element.DES_RIESGO.search('Bajo') != -1) {
                                    element.DES_RIESGO = 'Bajo (Administrativos)'
                                }
                                item.RiskTypeName = element.DES_RIESGO; //Nombre de tipo de riesgo
                                item.Rate = CommonMethods.formatValor(element.TASA_CALC, 6);  //Tasa
                                item.Premium = CommonMethods.formatValor(element.PRIMA, 2); //Prima
                                item.ProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta
                                item.OriginalProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta original
                                item.OriginalAuthorizedRate = CommonMethods.formatValor(element.TASA, 6); //tasa autorizada original
                                item.AuthorizedRate = CommonMethods.formatValor(element.TASA, 6);
                                item.NewPremium = CommonMethods.formatValor(element.AUT_PRIMA, 2);
                                item.EndorsmentPremium = element.PRIMA_END; //Prima de endoso
                                item.Discount = CommonMethods.formatValor(element.DESCUENTO, 2); //Descuento
                                item.Variation = CommonMethods.formatValor(element.VARIACION_TASA, 2); //Variación de la tasa
                                item.valItemAu = false;
                                item.valItemPr = false;
                                self.inputsQuotation.PensionDetailsList.push(item);
                                self.inputsQuotation.PensionNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.PensionNewNetAmount) + Number(element.AUT_PRIMA), 2);

                                self.inputsQuotation.PensionNetAmount = CommonMethods.formatValor(element.NSUM_PREMIUMN, 2);
                                self.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiPension, 2);
                                self.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((element.NSUM_PREMIUMN * this.pensionIGV) - element.NSUM_PREMIUMN, 2);
                                self.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(element.NSUM_PREMIUM, 2);

                                item.WorkersCount = element.NUM_TRABAJADORES;
                                item.PayrollAmount = element.MONTO_PLANILLA;
                            }
                            if (element.ID_PRODUCTO == this.healthProductId.id) { //Si es un elemento de pensión
                                let item: any = {};
                                item.RiskRate = CommonMethods.formatValor(element.TASA_RIESGO, 6);
                                item.RiskTypeId = element.TIP_RIESGO; //Id tipo de riesgo
                                if (element.DES_RIESGO.search('Alto') != -1) {
                                    element.DES_RIESGO = 'Alto (Obreros)'
                                }

                                if (element.DES_RIESGO.search('Bajo') != -1) {
                                    element.DES_RIESGO = 'Bajo (Administrativos)'
                                }
                                item.RiskTypeName = element.DES_RIESGO; //Nombre de tipo de riesgo
                                item.Rate = CommonMethods.formatValor(element.TASA_CALC, 6);  //Tasa
                                item.Premium = CommonMethods.formatValor(element.PRIMA, 2); //Prima
                                item.ProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta
                                item.OriginalProposedRate = CommonMethods.formatValor(element.TASA_PRO, 6); //Tasa propuesta original
                                item.OriginalAuthorizedRate = CommonMethods.formatValor(element.TASA, 6); //tasa autorizada original
                                item.AuthorizedRate = CommonMethods.formatValor(element.TASA, 6);
                                item.NewPremium = CommonMethods.formatValor(element.AUT_PRIMA, 2);
                                item.EndorsmentPremium = element.PRIMA_END; //Prima de endoso
                                item.Discount = CommonMethods.formatValor(element.DESCUENTO, 2); //Descuento
                                item.Variation = CommonMethods.formatValor(element.VARIACION_TASA, 2); //Variación de la tasa
                                item.valItemAu = false;
                                item.valItemPr = false;
                                self.inputsQuotation.SaludDetailsList.push(item);
                                self.inputsQuotation.SaludNewNetAmount = CommonMethods.formatValor(Number(self.inputsQuotation.SaludNewNetAmount) + Number(element.AUT_PRIMA), 2);
                                self.inputsQuotation.SaludNetAmount = CommonMethods.formatValor(element.NSUM_PREMIUMN, 2);
                                self.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(element.NSUM_PREMIUMN * self.dEmiSalud, 2);
                                self.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((element.NSUM_PREMIUMN * this.healthIGV) - element.NSUM_PREMIUMN, 2);
                                self.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(element.NSUM_PREMIUM, 2);

                                item.WorkersCount = element.NUM_TRABAJADORES;
                                item.PayrollAmount = element.MONTO_PLANILLA;
                            }

                            let add = true;
                            self.inputsQuotation.SharedDetailsList.forEach(subelement => {
                                if (subelement.RiskTypeId == element.TIP_RIESGO) {
                                    add = false;
                                }
                            });
                            if (add == true) {
                                self.inputsQuotation.SharedDetailsList.push({ 'RiskTypeId': element.TIP_RIESGO, 'RiskTypeName': element.DES_RIESGO, 'WorkersCount': element.NUM_TRABAJADORES, 'PayrollAmount': element.MONTO_PLANILLA });
                            }
                        });

                        if (this.inputsQuotation.SharedDetailsList.length > 0) {
                            for (let i = 0; i < self.inputsQuotation.SharedDetailsList.length; i++) { //AVS - INTERCONEXION SABSA
                                if (this.inputsQuotation.SharedDetailsList[i].RiskTypeName.toUpperCase().includes('FLAT')) {
                                    this.inputsQuotation.SharedDetailsList[i].RiskTypeName = 'Riesgo medio';
                                }
                            }
                        }

                        if (this.inputsQuotation.PensionDetailsList.length > 0) {
                            for (let i = 0; i < this.inputsQuotation.PensionDetailsList.length; i++) { //AVS - INTERCONEXION SABSA
                                if (this.inputsQuotation.PensionDetailsList[i].RiskTypeName.toUpperCase().includes('FLAT')) {
                                    this.inputsQuotation.PensionDetailsList[i].RiskTypeName = 'Riesgo medio';
                                }
                            }
                        }
                
                        if (this.inputsQuotation.SaludDetailsList.length > 0) {
                            for (let i = 0; i < this.inputsQuotation.SaludDetailsList.length; i++) { //AVS - INTERCONEXION SABSA
                                if (this.inputsQuotation.SaludDetailsList[i].RiskTypeName.toUpperCase().includes('FLAT')) {
                                    this.inputsQuotation.SaludDetailsList[i].RiskTypeName = 'Riesgo medio';
                                }
                            }
                        }
                
                        const customOrder = ["Riesgo alto", "Riesgo medio", "Riesgo bajo", "Medio"]; //AVS - INTERCONEXION SABSA 05/09/2023
                        this.customSort(this.inputsQuotation.SharedDetailsList, customOrder);
                        this.customSort(this.inputsQuotation.PensionDetailsList, customOrder);
                        this.customSort(this.inputsQuotation.SaludDetailsList, customOrder);

                        this.cargarDatosPoliza(res[3][0]);

                        this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
                        this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * this.pensionIGV) - this.inputsQuotation.PensionNewNetAmount, 2);
                        this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);

                        this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
                        this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * this.healthIGV) - this.inputsQuotation.SaludNewNetAmount, 2);
                        this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

                        if (this.mode == 'recotizar') {
                            this.checkMinimunPremiumForOriginals(this.healthProductId.id);
                            this.checkMinimunPremiumForOriginals(this.pensionProductId.id);
                        } else {
                            this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
                            this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
                        }

                    }
                    this.isLoading = false;
                },
                (error) => {
                    this.isLoading = false;
                    swal.fire('Información', this.genericServerErrorMessage + ' ' + this.redirectionMessage, 'error');
                    this.router.navigate(['/extranet/policy-request']);
                }
            );
    }

    async cargarDatosPoliza(res: any) {
        this.inputsQuotation.tipoRenovacion = res.TIP_RENOV;
        await this.cargarFrecuencia();
        this.inputsQuotation.facturacionVencido = res.FACT_MES_VENC == 0 ? false : true;
        this.inputsQuotation.facturacionAnticipada = res.FACT_ANTI == 0 ? false : true;
        this.inputsQuotation.frecuenciaPago = res.FREC_PAGO;

        const fechaInicio = new Date(res.HASTA);

        // if (this.template.ins_daySumVig) {
        fechaInicio.setDate(fechaInicio.getDate() + 1);
        // }

        this.inputsQuotation.desde = fechaInicio;
        this.inputsQuotation.hasta = new Date(res.HASTA);

        this.fechaFin(this.inputsQuotation.tipoRenovacion, res.HASTA, res.DESDE);

        // this.nroPension = res[0].POL_PEN;
        // this.nroSalud = res[0].POL_SAL;

    }

    fechaFin(tipoRen: string, fechaDesde: string, fecha?: string) {
        const fechaFin = new Date(fechaDesde);
        const fechaFin2 = new Date(fecha);
        fechaFin.setDate(fechaFin.getDate() + 1);

        /** */
        if (tipoRen == '7') {
            fechaFin.setDate(fechaFin.getDate() - 1);
            fechaFin.setDate(fechaFin.getDate() + (((fechaFin.getTime() - fechaFin2.getTime()) / 1000 / 60 / 60) / 24) + 1);
            this.inputsQuotation.hasta = new Date(fechaFin);
        }

        if (tipoRen == '6') {
            fechaFin.setDate(fechaFin.getDate() - 1);
            fechaFin.setDate(fechaFin.getDate() + (((fechaFin.getTime() - fechaFin2.getTime()) / 1000 / 60 / 60) / 24) + 1);
            this.inputsQuotation.hasta = new Date(fechaFin);
        }

        if (tipoRen == '5') {
            fechaFin.setMonth(fechaFin.getMonth() + 1);
            fechaFin.setDate(fechaFin.getDate());
            this.inputsQuotation.hasta = new Date(fechaFin);
            if (!this.template.ins_daySumVig) {
                this.inputsQuotation.hasta.setDate(this.inputsQuotation.hasta.getDate() - 1);
            }
        }

        if (tipoRen == '4') {
            fechaFin.setMonth(fechaFin.getMonth() + 2);
            fechaFin.setDate(fechaFin.getDate());
            this.inputsQuotation.hasta = new Date(fechaFin);
            if (!this.template.ins_daySumVig) {
                this.inputsQuotation.hasta.setDate(this.inputsQuotation.hasta.getDate() - 1);
            }
        }

        if (tipoRen == '3') {
            fechaFin.setMonth(fechaFin.getMonth() + 3);
            fechaFin.setDate(fechaFin.getDate());
            this.inputsQuotation.hasta = new Date(fechaFin);
            if (!this.template.ins_daySumVig) {
                this.inputsQuotation.hasta.setDate(this.inputsQuotation.hasta.getDate() - 1);
            }
        }

        if (tipoRen == '2') {
            fechaFin.setMonth(fechaFin.getMonth() + 6);
            fechaFin.setDate(fechaFin.getDate());
            this.inputsQuotation.hasta = new Date(fechaFin);
            if (!this.template.ins_daySumVig) {
                this.inputsQuotation.hasta.setDate(this.inputsQuotation.hasta.getDate() - 1);
            }
        }

        if (tipoRen == '1') {
            fechaFin.setFullYear(fechaFin.getFullYear() + 1)
            fechaFin.setDate(fechaFin.getDate());
            this.inputsQuotation.hasta = new Date(fechaFin);
            if (!this.template.ins_daySumVig) {
                this.inputsQuotation.hasta.setDate(this.inputsQuotation.hasta.getDate() - 1);
            }
        }
    }

    changeSaludPropuesta(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_AUT = ComProp
                    item.valItemSal = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_AUT = ComProp
                    item.valItemSal = false;
                }
            });
        }
    }

    changeSaludPropuestaPr(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_PRO = ComProp
                    item.valItemSalPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_SALUD_PRO = ComProp
                    item.valItemSalPr = false;
                }
            });
        }
    }

    changePensionPropuesta(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_AUT = ComProp
                    item.valItemPen = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_AUT = ComProp
                    item.valItemPen = false;
                }
            });
        }
    }

    changePensionPropuestaPr(cantComPro, valor) {
        let ComProp = cantComPro != '' ? Number(cantComPro) : 0;
        ComProp = isNaN(ComProp) ? 0 : ComProp;

        if (ComProp > 100) {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_PRO = ComProp
                    item.valItemPenPr = true;
                }
            });
        }
        else {
            this.inputsQuotation.SecondaryBrokerList.forEach(item => {
                if (item.DOC_COMER == valor) {
                    item.COMISION_PENSION_PRO = ComProp
                    item.valItemPenPr = false;
                }
            });
        }
    }

    /**
     * Calcula la primas neta total, IGV de prima neta total y la prima bruta total para las tasas autorizadas y primas mínimas autorizadas por producto
     * @param productId Id de producto
     */
    checkMinimunPremiumForAuthorizedAmounts(productId: string, cantPrima?) {
        if (cantPrima != undefined) {
            let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
            totPrima = isNaN(totPrima) ? 0 : totPrima;
            if (productId == this.healthProductId.id) {
                this.inputsQuotation.HealthAuthMinPremium = totPrima
            }

            if (productId == this.pensionProductId.id) {
                this.inputsQuotation.PensionAuthMinPremium = totPrima
            }
        }


        if (productId == this.healthProductId.id) {
            this.inputsQuotation.HealthAuthMinPremium = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.HealthAuthMinPremium);
            let NetPremium = 0;
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                NetPremium = NetPremium + Number(item.NewPremium);
            });

            if (NetPremium < this.inputsQuotation.HealthAuthMinPremium) {
                this.inputsQuotation.SaludNewNetAmount = this.inputsQuotation.HealthAuthMinPremium;
                this.healthMessage = this.variable.var_msjPrimaMin;
            } else {
                this.inputsQuotation.SaludNewNetAmount = NetPremium;
                this.healthMessage = '';
            }
            this.inputsQuotation.SaludNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNewNetAmount * this.dEmiSalud, 2);
            this.inputsQuotation.SaludNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNewNetAmount * Number(this.healthIGV.toString())) - this.inputsQuotation.SaludNewNetAmount, 2);
            this.inputsQuotation.SaludNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludNewCalculatedIGV) + Number(this.inputsQuotation.SaludNewPrimaComercial), 2);

        } else if (productId == this.pensionProductId.id) {
            this.inputsQuotation.PensionAuthMinPremium = CommonMethods.ConvertToReadableNumber(this.inputsQuotation.PensionAuthMinPremium);
            let NetPremium = 0;
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                NetPremium = NetPremium + Number(item.NewPremium);
            });
            if (NetPremium < this.inputsQuotation.PensionAuthMinPremium) {
                this.inputsQuotation.PensionNewNetAmount = this.inputsQuotation.PensionAuthMinPremium;
                this.pensionMessage = this.variable.var_msjPrimaMin;
            } else {
                this.inputsQuotation.PensionNewNetAmount = NetPremium;
                this.pensionMessage = '';
            }
            this.inputsQuotation.PensionNewPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNewNetAmount * this.dEmiPension, 2);
            this.inputsQuotation.PensionNewCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNewNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNewNetAmount, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.inputsQuotation.PensionNewGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionNewCalculatedIGV) + Number(this.inputsQuotation.PensionNewPrimaComercial), 2);
        }
    }
    checkMinimunPremiumForOriginals(productId: string, cantPrima?) {
        if (cantPrima != undefined) {
            let totPrima = cantPrima != '' ? Number(cantPrima) : 0;
            totPrima = isNaN(totPrima) ? 0 : totPrima;
            if (productId == this.healthProductId.id) {
                this.inputsQuotation.SaludPropMinPremium = totPrima
            }

            if (productId == this.pensionProductId.id) {
                this.inputsQuotation.PensionPropMinPremium = totPrima
            }
        }

        if (productId == this.healthProductId.id) {
            let healthPremiumToBeCompared = (this.inputsQuotation.SaludPropMinPremium != null && this.inputsQuotation.SaludPropMinPremium !== undefined && Number(this.inputsQuotation.SaludPropMinPremium) > 0) ? this.inputsQuotation.SaludPropMinPremium : this.inputsQuotation.SaludMinPremium;
            let originalNetPremium = 0;
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                originalNetPremium = originalNetPremium + Number(item.Premium);
            });

            if (originalNetPremium < healthPremiumToBeCompared) { //Si hay tasa propuesta
                this.isNetPremiumLessThanMinHealthPremium = true;
                //Cálculo de nueva prima total neta de Salud
                this.inputsQuotation.SaludNetAmount = healthPremiumToBeCompared;
                this.healthMessage = this.variable.var_msjPrimaMin;
            } else {
                this.isNetPremiumLessThanMinHealthPremium = false;
                //Cálculo de nueva prima total neta de Salud
                this.inputsQuotation.SaludNetAmount = originalNetPremium;
                this.healthMessage = '';
            }
            //Calculo de Prima Comercial de Salud
            this.inputsQuotation.SaludPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.SaludNetAmount * this.dEmiSalud, 2);
            //Cálculo de IGV de la nueva prima total neta de Salud
            this.inputsQuotation.SaludCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.SaludNetAmount * Number(this.healthIGV.toString())) - this.inputsQuotation.SaludNetAmount, 2);
            //Cálculo de nueva prima total bruta de Salud
            this.inputsQuotation.SaludGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.SaludCalculatedIGV) + Number(this.inputsQuotation.SaludPrimaComercial), 2);

        } else if (productId == this.pensionProductId.id) {
            let pensionPremiumToBeCompared = (this.inputsQuotation.PensionPropMinPremium != null && this.inputsQuotation.PensionPropMinPremium !== undefined && Number(this.inputsQuotation.PensionPropMinPremium) > 0) ? this.inputsQuotation.PensionPropMinPremium : this.inputsQuotation.PensionMinPremium;
            let originalNetPremium = 0;
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                originalNetPremium = originalNetPremium + Number(item.Premium);
            });
            if (originalNetPremium < pensionPremiumToBeCompared) {
                this.isNetPremiumLessThanMinPensionPremium = true;
                //Cálculo de nueva prima total neta de Pensión
                this.inputsQuotation.PensionNetAmount = pensionPremiumToBeCompared;
                this.pensionMessage = this.variable.var_msjPrimaMin;
            } else {
                this.isNetPremiumLessThanMinPensionPremium = false;
                this.inputsQuotation.PensionNetAmount = originalNetPremium;
                this.pensionMessage = '';
            }
            //Calculo de Prima Comercial de Salud
            this.inputsQuotation.PensionPrimaComercial = CommonMethods.formatValor(this.inputsQuotation.PensionNetAmount * this.dEmiPension, 2);
            //Cálculo de IGV de la nueva prima total neta de Pensión
            this.inputsQuotation.PensionCalculatedIGV = CommonMethods.formatValor((this.inputsQuotation.PensionNetAmount * Number(this.pensionIGV.toString())) - this.inputsQuotation.PensionNetAmount, 2);
            //Cálculo de nueva prima total bruta de Pensión
            this.inputsQuotation.PensionGrossAmount = CommonMethods.formatValor(Number(this.inputsQuotation.PensionCalculatedIGV) + Number(this.inputsQuotation.PensionPrimaComercial), 2);
        }
    }

    /**
     * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
     * @param list lista ingresada
     * @returns  string en html
     */
    listToString(list: String[]): string {
        let output = '';
        if (list != null) {
            list.forEach(function (item) {
                output = output + item + ' <br>'
            });
        }
        return output;
    }

    /**
     * Envia la petición de cambio de estado de la cotización e inserción de tasas autorizadas con las primas autorizadas
     */
    AddStatusChange() {
        debugger;
        const errorList = this.areAuthorizedRatesValid();
        if (this.mainFormGroup.valid == true && (errorList == null || errorList.length == 0)) {
            const savedPolicy: any = {};
            savedPolicy.P_NID_COTIZACION = this.quotationNumber;
            savedPolicy.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            savedPolicy.P_NTYPE_TRANSAC = this.typeTransac;
            savedPolicy.P_NID_PROC = this.nroProcess;
            savedPolicy.P_SCOMMENT = this.mainFormGroup.controls.comment.value == '' ? '' : this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, ''); // Comentario
            savedPolicy.P_SASIGNAR = 'A';
            savedPolicy.P_SAPROBADO = this.mainFormGroup.controls.status.value == 2 ? 'A' : 'R';
            savedPolicy.P_DEFFECDATE = CommonMethods.formatDate(this.inputsQuotation.desde);
            savedPolicy.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsQuotation.hasta);
            savedPolicy.P_FACT_MES_VENCIDO = this.inputsQuotation.facturacionVencido ? 1 : 0;
            savedPolicy.P_SFLAG_FAC_ANT = this.inputsQuotation.facturacionAnticipada ? 1 : 0;
            savedPolicy.P_SCOLTIMRE = this.inputsQuotation.tipoRenovacion;
            savedPolicy.P_NPAYFREQ = this.inputsQuotation.frecuenciaPago;
            savedPolicy.P_NAMO_AFEC = Number(this.inputsQuotation.PensionNetAmount); //AVS - Regula Mes Vencido 25/11/2022
            savedPolicy.P_NIVA = Number(this.inputsQuotation.PensionNewCalculatedIGV); //AVS - Regula Mes Vencido 25/11/2022
            savedPolicy.P_NAMOUNT = Number(this.inputsQuotation.PensionNewGrossAmount); //AVS - Regula Mes Vencido 25/11/2022
            savedPolicy.P_NEPS = Number(this.epsItem.NCODE); //AVS - INTERCONEXION SABSA
            savedPolicy.P_NBRANCH = this.inputsQuotation.NBRANCH; //AVS - INTERCONEXION SABSA
            savedPolicy.P_NCOT_MIXTA = this.inputsQuotation.P_NCOT_MIXTA; //AVS - INTERCONEXION SABSA
            savedPolicy.P_NPRODUCT = this.inputsQuotation.P_NPRODUCT; //AVS - INTERCONEXION SABSA
            console.log(savedPolicy);
            const operacion = this.mainFormGroup.controls.status.value == 2 ? '¿Desea realizar la aprobación de esta transacción?' : '¿Desea realizar el rechazo de esta transacción?';
            swal.fire({
                title: 'Información',
                text: operacion,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            })
                .then((result) => {
                    if (result.value) {
                        this.isLoading = true;
                        this.policyService.savedPolicyTransac(savedPolicy).subscribe(
                            res => {
                                if (res.P_NCODE == 0) {
                                    swal.fire('Información', 'La operación se ha aprobado exitosamente', 'success');
                                    this.router.navigate(['/extranet/policy-request']);
                                } else if (res.P_NCODE == 2) {
                                    swal.fire('Información', 'La operación se ha rechazado exitosamente', 'success');
                                    this.router.navigate(['/extranet/policy-request']);
                                } else {  //Error no controlado en el servicio
                                    swal.fire('Información', 'Hubo un error al procesar su solicitud', 'error');  //Use las herramientas de desarrollador de su navegador para ver el error en esta petición peticiones
                                }
                                this.isLoading = false;
                            },
                            err => {
                                swal.fire('Información', 'Hubo un error al procesar su solicitud', 'error');  //Use las herramientas de desarrollador de su navegador para ver el error en esta petición peticiones
                                this.isLoading = false;
                            }
                        );
                    }
                });
        } else {

            if (this.mainFormGroup.controls.status.hasError('required')) errorList.push('El estado es obligatorio.');
            swal.fire('Información', this.listToString(errorList), 'error');
        }
    }

    /**Metodo que cambia el estado de la cotizacion para el proceso de renovación -jg**/
    NewAddStatusChange(){
        const formData = new FormData();
        const errorList = this.areAuthorizedRatesValid();
        if (this.mainFormGroup.valid == true && (errorList == null || errorList.length == 0)) {
            const renovatePolicy: any = {};
            renovatePolicy.QuotationNumber = this.quotationNumber; //Id cotizacion
            renovatePolicy.Status = this.mainFormGroup.controls.status.value;
            ///renovatePolicy.P_SAPROBADO = this.mainFormGroup.controls.status.value; // Estado de tecnica APROBADO O RECHAZADO
            renovatePolicy.Comment = this.mainFormGroup.controls.comment.value == '' ? '' : this.mainFormGroup.controls.comment.value.toUpperCase().replace(/[<>%]/g, ''); //Comentario
            renovatePolicy.Nbranch = this.inputsQuotation.NBRANCH; // 77
            renovatePolicy.Product = this.inputsQuotation.P_NPRODUCT; // producto 1
            renovatePolicy.User = JSON.parse(localStorage.getItem('currentUser'))['id']; //Usuario
            renovatePolicy.RenovateStatus = 1; 
            renovatePolicy.pensionAuthorizedRateList = [];
            renovatePolicy.saludAuthorizedRateList = [];
            renovatePolicy.BrokerList = [];
            
            this.inputsQuotation.PensionDetailsList.forEach((element) => {
                const item = new AuthorizedRate();
                item.ProductId = JSON.parse(localStorage.getItem('pensionID'))['id'];
                item.RiskTypeId = element.RiskTypeId;
                item.AuthorizedRate = element.AuthorizedRate;
                item.AuthorizedPremium = element.NewPremium;
                item.AuthorizedMinimunPremium = this.inputsQuotation.PensionAuthMinPremium;

                renovatePolicy.pensionAuthorizedRateList.push(item);
            });

            this.inputsQuotation.SaludDetailsList.forEach((element) => {
                const item = new AuthorizedRate();
                item.ProductId = JSON.parse(localStorage.getItem('saludID'))['id'];
                item.RiskTypeId = element.RiskTypeId;
                item.AuthorizedRate = element.AuthorizedRate;
                item.AuthorizedPremium = element.NewPremium;
                item.AuthorizedMinimunPremium = this.inputsQuotation.HealthAuthMinPremium;

                renovatePolicy.saludAuthorizedRateList.push(item);
            });

            this.inputsQuotation.SecondaryBrokerList.forEach(element => {
                const item = new Broker();
                item.Id = element.CANAL;
                item.ProductList = [];
                if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
                    const obj = new BrokerProduct();
                    obj.Product = this.pensionProductId.id;
                    obj.AuthorizedCommission = element.COMISION_PENSION_AUT;
                    item.ProductList.push(obj);
                }
                if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
                    const obj = new BrokerProduct();
                    obj.Product = this.healthProductId.id;
                    obj.AuthorizedCommission = element.COMISION_SALUD_AUT;
                    item.ProductList.push(obj);
                }
                renovatePolicy.BrokerList.push(item);
            });

            formData.append('statusChangeData', JSON.stringify(renovatePolicy));
            console.log(renovatePolicy)

            const operacion = this.mainFormGroup.controls.status.value == 2 ? '¿Desea realizar la aprobación de esta transacción?' : '¿Desea realizar el rechazo de esta transacción?';
            swal.fire({
                title: 'Información',
                text: operacion,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            })
                .then((result) => {
                    if (result.value) {
                        this.isLoading = true;
                        this.quotationService.changeStatus(formData).subscribe(
                            res => {
                                if (res.StatusCode == 0) {
                                    swal.fire('Información', 'Se ha realizado correctamente la operación.', 'success');
                                    this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                                } else if (res.StatusCode == 1) { // Error de validación
                                    swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
                                } else {
                                    swal.fire('Información', this.genericServerErrorMessage, 'error');
                                }
                                this.isLoading = false;
                            },
                            err => {
                                swal.fire('Información', this.genericServerErrorMessage, 'error');
                                this.isLoading = false;
                            }
                        );
                    }
                });
        }
        // console.log('Nuevo Metodo de Renovación')

    }

    /**Decide que operación hacer de acuerdo al modo de esta vista */
    manageOperation() {
        this.AddStatusChange();
    }

    /**Primera búsqueda de cambios de estado de cotización */
    firstSearch() {
        this.filter.PageNumber = 1;
        this.searchTracking();
    }
    /**Búsqueda de estados de la cotización accionados por el cambio de página */
    pageChanged(event) {
        this.searchTracking();
    }
    /**Proceso de búsqueda de cambios de estado de la cotización */
    searchTracking() {
        this.policyService.getPolicyTrackingList(this.filter).subscribe(
            res => {
                this.totalItems = res.TotalRowNumber;
                if (res.TotalRowNumber > 0) {
                    this.statusChangeList = res.GenericResponse;
                    this.isLoading = false;
                } else {
                    this.totalItems = 0;
                    this.statusChangeList = [];
                    this.isLoading = false;
                }
            },
            err => {
                swal.fire('Información', this.genericServerErrorMessage, 'error');
            }
        );
    }

    openFilePicker(fileList: string[]) {
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.ngbModal.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
        }

    }

    /**Muestra las comisión propuesta original de salud */
    switchHealthPropCommissionValue() {
        if (!this.enabledHealthMainPropCommission) this.inputsQuotation.BrokerSaludPropBounty = this.originalHealthMainPropComission;
    }
    /**Muestra las comisión autorizada original de salud */
    switchHealthAuthCommissionValue() {
        if (!this.enabledHealthMainAuthCommission) this.inputsQuotation.BrokerSaludAuthBounty = this.originalHealthMainAuthComission;
    }
    /**Muestra las comisión propuesta original de pensión */
    switchPensionPropCommissionValue() {
        if (!this.enabledPensionMainPropCommission) this.inputsQuotation.BrokerPensionPropBounty = this.originalPensionMainPropComission;
    }
    /**Muestra las comisión autorizada original de pensión */
    switchPensionAuthCommissionValue() {
        if (!this.enabledPensionMainAuthCommission) this.inputsQuotation.BrokerPensionAuthBounty = this.originalPensionMainAuthComission;
    }

    /**Muestra las prima mínima propuesta original de salud */
    switchHealthMinPropPremiumValue() {
        if (!this.enabledHealthMinPropPremium) this.inputsQuotation.SaludPropMinPremium = this.originalHealthMinPropPremium;
        this.checkMinimunPremiumForOriginals(this.healthProductId.id);
    }
    /**Muestra las prima mínima propuesta original de pensión */
    switchPensionMinPropPremiumValue() {
        if (!this.enabledPensionMinPropPremium) this.inputsQuotation.PensionPropMinPremium = this.originalPensionMinPropPremium;
        this.checkMinimunPremiumForOriginals(this.pensionProductId.id);
    }
    /**Muestra las prima mínima autorizada original de pensión */
    switchPensionMinAuthPremiumValue() {
        if (!this.enabledPensionAuthorizedPremium) this.inputsQuotation.PensionAuthMinPremium = this.originalPensionMinAuthPremium;
        this.checkMinimunPremiumForAuthorizedAmounts(this.pensionProductId.id);
    }
    /**Muestra las prima mínima autorizada original de salud */
    switchHealthMinAuthPremiumValue() {
        if (!this.enabledHealthAuthorizedPremium) this.inputsQuotation.HealthAuthMinPremium = this.originalHealthMinAuthPremium;
        this.checkMinimunPremiumForAuthorizedAmounts(this.healthProductId.id);
    }

    /**Muestra las tasas propuestas originales de salud */
    switchHealthProposedRateValues() {
        if (!this.enabledHealthProposedRate) {
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                item.ProposedRate = item.OriginalProposedRate;
                item.valItemPr = false;
            });
        }
    }
    /**Muestra las tasas propuestas originales de pensión */
    switchPensionProposedRateValues() {
        if (!this.enabledPensionProposedRate) {
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                item.ProposedRate = item.OriginalProposedRate;
                item.valItemPr = false;
            });
        }
    }
    /**Muestra las tasas autorizadas originales de salud */
    switchHealthAuthorizedRateValues() {
        let self = this;
        if (!this.enabledHealthAuthorizedRate) {
            this.inputsQuotation.SaludDetailsList.map(function (item) {
                self.calculateNewPremiums(item.OriginalAuthorizedRate, item.RiskTypeId, self.healthProductId.id);
                item.AuthorizedRate = item.OriginalAuthorizedRate;
                item.valItemAu = false;
            });

        }
    }
    /**Muestra las tasas autorizadas originales de pensión */
    switchPensionAuthorizedRateValues() {
        let self = this;
        if (!this.enabledPensionAuthorizedRate) {
            this.inputsQuotation.PensionDetailsList.map(function (item) {
                self.calculateNewPremiums(item.OriginalAuthorizedRate, item.RiskTypeId, self.pensionProductId.id);
                item.AuthorizedRate = item.OriginalAuthorizedRate;
                item.valItemAu = false;
            });
        }
    }
    /**Muestra la comisión propuesta original para salud*/
    switchHealthSecondaryPropCommissionValue() {
        let self = this;
        if (!this.enabledHealthSecondaryPropCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_SALUD_PRO = item.OriginalHealthPropCommission;
                item.valItemSalPr = false;
            });
        }
    }
    /**Muestra la comisión autorizada original para salud*/
    switchHealthSecondaryAuthCommissionValue() {
        let self = this;
        if (!this.enabledHealthSecondaryAuthCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_SALUD_AUT = item.OriginalHealthAuthCommission;
                item.valItemSal = false;
            });
        }
    }
    /**Muestra la comisión autorizada original para pensión*/
    switchPensionSecondaryAuthCommissionValue() {
        let self = this;
        if (!this.enabledPensionSecondaryAuthCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_PENSION_AUT = item.OriginalPensionAuthCommission;
                item.valItemPen = false;
            });
        }
    }
    /**Muestra la comisión propuesta original para pensión*/
    switchPensionSecondaryPropCommissionValue() {
        let self = this;
        if (!this.enabledPensionSecondaryPropCommission) {
            self.inputsQuotation.SecondaryBrokerList.map(function (item) {
                item.COMISION_PENSION_PRO = item.OriginalPensionPropCommission;
                item.valItemPenPr = false;
            });
        }
    }

    /**Valida las tasas propuestas */
    areProposedRatesValid(): string[] {
        let errorList = [];

        if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemPenPr == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]')
                }
            });

            this.inputsQuotation.PensionDetailsList.map(element => {
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);

                if (element.WorkersCount <= 0) {
                    element.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
                    if (element.ProposedRate > 0) {
                        errorList.push('No puedes proponer tasas en la categoría ' + element.RiskTypeName + ' de Pensión.')
                    }
                }
                else {
                    if (element.valItemPr == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Pensión]')
                    }
                    if (CommonMethods.isNumber(element.ProposedRate) == false) errorList.push('La tasa propuesta en la categoría ' + element.RiskTypeName + ' de Pensión no es válida.');
                }


                return element;
            });
        }

        if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemSalPr == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]')
                }
            });

            this.inputsQuotation.SaludDetailsList.map(element => {
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);

                if (element.WorkersCount <= 0) {
                    element.ProposedRate = CommonMethods.ConvertToReadableNumber(element.ProposedRate);
                    if (element.ProposedRate > 0) {
                        errorList.push('No puedes proponer tasas en la categoría ' + element.RiskTypeName + ' de Salud.')
                    }
                }
                else {
                    if (element.valItemPr == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Salud]')
                    }

                    if (CommonMethods.isNumber(element.ProposedRate) == false) errorList.push('La tasa propuesta en la categoría ' + element.RiskTypeName + ' de Salud no es válida.');
                }

                return element;
            });
        }

        return errorList;
    }

    /**Valida las comisiones autorizadas */
    validateAuthorizedCommmissions(): string[] {
        let self = this;
        let errorList = [];
        this.inputsQuotation.SecondaryBrokerList.map(function (item) {
            if (item.CANAL != '2015000002') {
                if (self.inputsQuotation.SaludDetailsList != null && self.inputsQuotation.SaludDetailsList.length > 0 && self.epsItem.STYPE == 1) {
                    if (CommonMethods.isNumber(item.COMISION_SALUD_AUT) == false) errorList.push('La comisión autorizada de salud de ' + item.COMERCIALIZADOR + ' no es válida.');
                    else if (item.COMISION_SALUD_AUT <= 0 && self.mainFormGroup.get('status').value == '2' && (this.profileId == '5' || this.profileId == '137')) errorList.push('La comisión autorizada de salud de ' + item.COMERCIALIZADOR + ' debe ser mayor a cero.');
                }
                if (self.inputsQuotation.PensionDetailsList != null && self.inputsQuotation.PensionDetailsList.length > 0) {
                    if (CommonMethods.isNumber(item.COMISION_PENSION_AUT) == false) errorList.push('La comisión autorizada de pensión de ' + item.COMERCIALIZADOR + ' no es válida.');
                    else if (item.COMISION_PENSION_AUT <= 0 && self.mainFormGroup.get('status').value == '2' && (this.profileId == '5' || this.profileId == '137')) errorList.push('La comisión autorizada de pensión de ' + item.COMERCIALIZADOR + ' debe ser mayor a cero.');
                }
            }
        });
        return errorList;
    }
    /**Valida las primas autorizadas */
    validateAuthorizedPremiums(): string[] {
        let errorList = [];
        if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0 && this.epsItem.STYPE == 1) {
            if (CommonMethods.isNumber(this.inputsQuotation.HealthAuthMinPremium) == false) errorList.push('La prima mínima autorizada de salud no es válida.');
            else if (this.inputsQuotation.HealthAuthMinPremium <= 0 && this.mainFormGroup.get('status').value == '2' && (this.profileId == '5' || this.profileId == '137')) errorList.push('La prima mínima autorizada de salud debe ser mayor a cero.');
        }

        if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
            if (CommonMethods.isNumber(this.inputsQuotation.PensionAuthMinPremium) == false) errorList.push('La prima mínima autorizada de pensión no es válida.');
            else if (this.inputsQuotation.PensionAuthMinPremium <= 0 && this.mainFormGroup.get('status').value == '2' && (this.profileId == '5' || this.profileId == '137')) errorList.push('La prima mínima autorizada de pensión debe ser mayor a cero.');
        }

        return errorList;
    }
    /**Valida las tasas autorizadas */
    areAuthorizedRatesValid(): string[] {
        let errorList = [];
        if (this.inputsQuotation.PensionDetailsList != null && this.inputsQuotation.PensionDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemPen == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Pensión]')
                }
            });

            this.inputsQuotation.PensionDetailsList.map(element => {
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.AuthorizedRate = CommonMethods.ConvertToReadableNumber(element.AuthorizedRate);
                if (element.WorkersCount > 0 && element.AuthorizedRate == 0 && this.mainFormGroup.get('status').value == '2' && (this.profileId == '5' || this.profileId == '137')) {
                    errorList.push('La tasa autorizada en la categoría ' + element.RiskTypeName + ' de Pensión debe ser mayor a cero.')
                } else {
                    if (element.valItemAu == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Pensión]')
                    }
                };
                return element;
            });
        }
        if (this.inputsQuotation.SaludDetailsList != null && this.inputsQuotation.SaludDetailsList.length > 0) {
            this.inputsQuotation.SecondaryBrokerList.forEach(broker => {
                if (broker.valItemSal == true) {
                    errorList.push('La comisión propuesta en ' + broker.COMERCIALIZADOR + ', es mayor a 100 [Salud]')
                }
            });

            this.inputsQuotation.SaludDetailsList.map(element => {
                element.WorkersCount = CommonMethods.ConvertToReadableNumber(element.WorkersCount);
                element.Premium = CommonMethods.ConvertToReadableNumber(element.Premium);
                element.AuthorizedRate = CommonMethods.ConvertToReadableNumber(element.AuthorizedRate);
                if (element.WorkersCount > 0 && element.AuthorizedRate == 0 && this.mainFormGroup.get('status').value == '2' && (this.profileId == '5' || this.profileId == '137')) {
                    errorList.push('La tasa autorizada en la categoría ' + element.RiskTypeName + ' de Salud debe ser mayor a cero.');
                } else {
                    if (element.valItemAu == true) {
                        errorList.push('La tasa propuesta es mayor a 100 en la categoría ' + element.RiskTypeName + ' [Salud]')
                    }
                }
                return element;
            });

        }
        return errorList;
    }

    //AVS - INTERCONEXION SABSA - ORDENAMIENTO
    customSort(arr, order) {
        return arr.sort((a, b) => {
            const indexA = order.indexOf(a.RiskTypeName);
            const indexB = order.indexOf(b.RiskTypeName);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }
}