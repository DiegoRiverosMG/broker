/**********************************************************************************************/
/*  NOMBRE              :   creditNote.component.TS                                             */
/*  DESCRIPCION         :   Capa components                                                     */
/*  AUTOR               :   MATERIAGRIS - MAXIMO JOSUE CORONEL FLORES                           */
/*  FECHA               :   18/10/2022                                                          */
/*  VERSION             :   1.0                                                                 */
/*************************************************************************************************/

import { Component, OnInit, ViewChild, ɵConsole } from '@angular/core';
import {
    NgbModal,
    NgbActiveModal,
    ModalDismissReasons,
    NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { truncateSync } from 'fs';
import {
    CheckboxControlValueAccessor,
    FormBuilder,
    Validators,
} from '@angular/forms';
//import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CreditNoteService } from '../../services/creditNote/creditNote.service';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validator } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
import { Payroll } from '../../models/payroll/payroll';
import { NULL_EXPR, THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { CallTracker } from 'assert';
import { NgxSpinnerService } from 'ngx-spinner';
import { Validacion } from '../../models/generacion-qr/generacion-qr.model';
import swal from 'sweetalert2';
import moment from 'moment';
import { GlobalValidators } from '../global-validators';
import { ExcelService } from '../../../../shared/services/excel/excel.service';

export class listPremiumResults {
    COMPROBANTE: string = '';
    DEFFECDATE: Date = null;
    DDESDE: Date = null;
    DEXPIRDAT: Date = null;
    EMP_ID: number = null;
    IMPDEVO: number = null;
    NAMOUNT: number = null;
    NBRANCH: number = null; //pk
    NCERTIF: number = null;
    NEWDEFFECDATE: Date = null;
    NEWDEXPIRDAT: Date = null;
    NEWIMPDEVO: number = null;
    NEWPORDEVO: number = null;
    NPOLICY: number = null;
    NPRODUCT: number = null; //pk
    NRECEIPT: number = null; //pk
    NRECEIPTDEV: number = null;
    NTYPCLIENTDOC: number = null;
    PORDEVO: number = null;
    SCERTYPE: string = ''; //pk
    SCLIENAME: string = '';
    SCLIENT: string = '';
    SCLINUMDOCU: string = '';
    SDES_BRANCH: string = '';
    SDES_COMPRO: string = '';
    SDES_DOCIDE: string = '';
    SDES_MONEDA: string = '';
    SDES_PRODMAST: string = '';

    PK_IMAGINARIO: string = '';
    VALIDADOR: boolean = false;
    VALOR_UNICO: string = '';
    NTIPO: number = null;
    NMCN: number = 0;

}
@Component({
    selector: 'app-creditNote',
    templateUrl: './creditNote.component.html',
    styleUrls: ['./creditNote.component.css'],
})
export class CreditNoteComponent implements OnInit {
    filterForm = new FormGroup({
        idBranch: new FormControl(''),
        Parameter: new FormControl(''),
        idProduct: new FormControl(''),
        NPOLICY: new FormControl(''),
        certificado: new FormControl(''),
        idDocumento: new FormControl(0),
        documento: new FormControl(''),
        idTipCompro: new FormControl(0),
        comprobante: new FormControl(''),
        startDate: new FormControl(''),
        endDate: new FormControl(''),
        VALIDADOR: new FormControl(''),
    });
    detRecibForm: FormGroup;
    detCargaMas: FormGroup; //migrantes 12/09/2023
    botonDeshabilitado = false;//migrantes 12/09/2023
    botonDeshabilitado3 = false;//migrantes 12/09/2023
    excelSubir: File;//migrantes 12/09/2023
    ncData: any = {};
    public formGroup: FormGroup;

    selecionadosCarrito: number = 0;

    filterForm2 = new FormGroup({});
    totalItems = 0;
    currentPage = 1;
    active = 1;
    listToShow: any = [];
    itemsPerPage = 10;

    totalItemsDet = 0;
    currentPageDet = 1;
    activeDet = 1;
    itemsPerPageDet = 10;

    selectedRowIds: Set<number> = new Set<number>(); //para prueba grilla
    selecRowIds: Set<number> = new Set<number>(); //para prueba grilla POPUP 1
    //Llenamos los combos
    ListBranch: any = [];
    ListProduct: any = [];
    ListParameter: any = [];
    ListDocument: any = [];
    ListBills: any = [];
    listComPago: any = [];
    productTypeList: any[] = []; //Lista de tipos de producto
    ListState: any = [];
    //para tablas
    listPremiumResults: listPremiumResults[] = [];
    listPremiumResultsCarrito: listPremiumResults[] = [];
    listReciDev: any[] = [];
    listDetRecDev: any[] = [];
    listNcMas: any[] = [];//migrantes 12/09/2023
    listReciResu: any[] = []; //migrantes 12/09/2023
    reporteListadoXLSX: any = [];//migrantes 12/09/2023
    checkDevolucion: any[] = [];
    checkTotal: any = [];
    //verifica los datos de la grilla 1 de recibos
    haveBillsDataNC = true;
    haveBillsDataPago = true;
    selectedType = 'predefined';
    selectedBoton = 'predefined';
    selectedBoton3Exp = 'predefined';
    selectedBoton3Gen = 'predefined';
    selectedBoton3Error = 'predefined';//migrantes 22/02/2024
    columnaError = 'predefined';//migrantes 22/02/2024
    selectedMsg3Gen = 'predefined';

    fechaPrueba = '';
    // fechaActual = '';
    fechaInicio = '';
    //Pantalla de carga
    isLoading: boolean = false;
    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    submitted: boolean = false;
    maxValue: number;

    ifcheckCertif: boolean = false;

    checkPoliza: any = [];
    checkInit: boolean = false;
    checkFin: boolean = false;
    valDocumento: boolean = false;
    valComprobante: boolean = false;

    IS_SELECTR: boolean = true;

    dataTable: any = [];
    dataDevolucion: any = [];
    diaActual = moment(new Date()).toDate();

    //Formato de la fecha
    constructor(
        config: NgbModalConfig,
        private modalService: NgbModal,
        //private modalService: NgbModal,
        private CreditNoteService: CreditNoteService,
        private formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        private excelService: ExcelService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false,
            }
        );
        config.backdrop = 'static';
        config.keyboard = false;
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit(): void {
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate()); // DGC 09/06/2023
        this.createForm();
        this.initializeForm();
        this.getBranchesPremiumReport();
        this.getDocuTypesList();
        this.getBillTypeList();
        this.initializeForm();
        this.TipoComprobante();
        this.TipoDocumento();
    }

    private createForm(): void {
        this.detRecibForm = this.formBuilder.group({
            NMCN: [0],
            NUSERCODE: [0],
            NCOMMIT: [1],
            P_NFLAG_ANUL: 0,
            P_CHECKANU: [false]
        });
        this.detCargaMas = this.formBuilder.group({ //migrantes 12/09/2023
            NMCN: [0],
            NUSERCODE: [0],
            NCOMMIT: [1],
            P_NFLAG_ANUL: 0,
            P_CHECKANU: [false]
        });
        this.filterForm = this.formBuilder.group({
            // idBranch: [null, [Validators.required]],
            idBranch: [null],
            Parameter: [null],
            // idProduct: [null, [Validators.required]],
            idProduct: [null],
            // NPOLICY: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
            NPOLICY: ['', [Validators.pattern(/^[0-9]*$/)]],
            certificado: ['', [Validators.pattern(/^[0-9]*$/)]],
            idDocumento: [null],
            documento: ['', [Validators.pattern(/^[0-9]*$/)]],
            idTipCompro: [null],
            comprobante: [''],
            startDate: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            endDate: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            VALIDADOR: ['']
        });
    }
    private initializeForm(): void {

        this.checkInit = true;
        this.checkFin = false;
        this.filterForm.setValidators([GlobalValidators.dateSort]);
    }

    public selectUsers(event: any, listPremiumResults: any) {
        listPremiumResults.flag = !listPremiumResults.flag;
    }
    //Método para obtener los ramos
    getBranchesPremiumReport() {
        this.CreditNoteService.getBranchTypesList().subscribe(
            (res) => {
                this.ListBranch = res;
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error al obtener los ramos.',
                    'error'
                );
            }
        );
    }
    // Lista los tipos de documento
    getDocuTypesList() {
        this.CreditNoteService.getDocuTypesList().subscribe(
            (res) => {
                this.ListDocument = res;
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error al obtener los tipos de documento.',
                    'error'
                );
            }
        );
    }

    getBillTypeList() {
        this.CreditNoteService.getBillTypeList().subscribe(
            (res) => {
                this.ListBills = res;
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error al obtener los tipos de comprobante.',
                    'error'
                );
            }
        );
    }
    //Método para obtener los productos y masivos
    SelectBranch() {
        this.filterForm.controls.NPOLICY.setValue('');
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        let data = {};
        data = { NBRANCH: this.filterForm.value.idBranch };

        if (this.filterForm.value.idBranch == '999') {
            this.selectedType = 'opentype'; //muestra el dropdown de masivos
            this.ListProduct = null;
            this.CreditNoteService.GetProductPremiumReport(data).subscribe(
                (res) => {
                    if (res != undefined && res.length > 0) {
                        this.ListParameter = res;
                    } else {
                        Swal.fire(
                            'Información',
                            'Debe selecionar el masivo, póngase en contacto con el administrador.' +
                            this.filterForm.value.Parameter,
                            'error'
                        );
                    }
                },
                (err) => {
                    Swal.fire(
                        'Información',
                        'Ha ocurrido un error ' + this.filterForm.value.Parameter,
                        'error'
                    );
                }
            );
        } else {
            this.selectedType = 'predefined'; //oculta el dropdown de masivos
            this.CreditNoteService.GetProductPremiumReport(data).subscribe(
                (res) => {
                    if (res != undefined && res.length > 0) {
                        this.ListProduct = res;
                    } else {
                        Swal.fire(
                            'Información',
                            'Debe selecionar el ramo, póngase en contacto con el administrador.' +
                            this.filterForm.value.idBranch,
                            'error'
                        );
                    }
                },
                (err) => {
                    Swal.fire(
                        'Información',
                        'Ha ocurrido un error ' + this.filterForm.value.idBranch,
                        'error'
                    );
                }
            );
        }
    }

    //oBTIENE Y LISTA LOS PRODUCTOS DE MASIVOS CON DATOS DE PELIMINAR PARAMETER
    SelectParemeter() {
        this.filterForm.controls.NPOLICY.setValue('');
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        this.filterForm.controls.idProduct.setValue(0);
        const data = { NPARAMETER: this.filterForm.value.Parameter };
        //// console.log (this.filterForm.value.Parameter);
        this.CreditNoteService.GetParameter(data).subscribe(
            (res) => {
                if (res != undefined && res.length > 0) {
                    this.ListProduct = res;
                } else {
                    Swal.fire(
                        'Información',
                        'Debe selecionar el ramo, póngase en contacto con el administrador.' +
                        this.filterForm.value.Parameter,
                        'error'
                    );
                }
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error ' + this.filterForm.value.Parameter,
                    'error'
                );
            }
        );
    }
    SelectParemeter2() { //migrantes 12/09/2023
        this.filterForm.controls.NPOLICY.setValue('');//LIMPIA CAMPO
    }

    msgError(msg) {
        Swal.fire({
            title: 'Información',
            text: msg,
            icon: 'error',
            allowOutsideClick: true,
            heightAuto: false,
        });
    }
    msgAlert(msg) {
        Swal.fire({
            title: 'Información',
            text: msg,
            icon: 'warning',
            allowOutsideClick: true,
            heightAuto: false,
        });
    }
    selectDoc = () => {
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        // this.filterForm.controls.idTipCompro.setValue(null);
        // this.filterForm.controls.comprobante.setValue(null);
        this.filterForm.controls.idBranch.setValue(null);
        this.filterForm.controls.Parameter.setValue(null);
        this.filterForm.controls.idProduct.setValue(null);
        this.filterForm.controls.NPOLICY.setValue(null);
        this.selectedType = 'predefined'
    }
    selectComp = () => {
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        this.filterForm.controls.idBranch.setValue(null);
        this.filterForm.controls.Parameter.setValue(null);
        this.filterForm.controls.idProduct.setValue(null);
        this.filterForm.controls.NPOLICY.setValue(null);
        this.selectedType = 'predefined'
    }

    searchNC() {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.spinner.show();
            //07/02/2023      
            this.listPremiumResults = [];

            //VALIDACIONES DE FORMA
            if (this.validacionBusqueda() == true) {
                this.listPremiumDev();
            } else {
                this.spinner.hide();
            }
        }
    }

    validacionBusqueda() {
        //VALIDACIONES
        //CASO UNO CUANDO SELECCIONA ALGUN TIPO DE DOCUMENTO ,TIENE QUE DIGITAR EL DOCUMENTO SELECCIONADO
        if (this.filterForm.value.idDocumento == null && this.filterForm.value.idTipCompro == null) {
            this.submitted = true;
            //CASO DOS CUANDO SELECCIONE ALGUN RAMO O MASIVO O TIPO PRODUCTO O POLIZA ,SE TIENEN QUE LLENAR LOS 4
            if (this.filterForm.value.idBranch == null || this.filterForm.value.idBranch == 0) {
                this.msgAlert('Debe selecionar el ramo.');
                return false;
            }
            else {
                //CASO CUANDO SELECCIONAS DENTRO DE RAMO ALGUN MASIVO
                if (this.filterForm.value.idBranch == '999') {
                    if (this.filterForm.value.Parameter == null || this.filterForm.value.Parameter == 0) {
                        this.msgAlert('Debe selecionar el masivo.');
                        return false;
                    }
                    else {
                        if (this.filterForm.value.idProduct == null || this.filterForm.value.idProduct == 0) {
                            this.msgAlert('Debe selecionar el producto.');
                            return false;
                        }
                        else {
                            if (this.filterForm.value.NPOLICY == null || this.filterForm.value.NPOLICY == 0) {
                                this.msgAlert('Debe ingresar la póliza.');
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                    }
                }
                else {
                    if (this.filterForm.value.idProduct == null || this.filterForm.value.idProduct == 0) {
                        this.msgAlert('Debe selecionar el producto.');
                        return false;
                    }
                    else {
                        if (this.filterForm.value.NPOLICY == null || this.filterForm.value.NPOLICY == 0) {
                            this.msgAlert('Debe ingresar la póliza.');
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
            }
        }
        if (this.filterForm.value.idDocumento !== null && this.filterForm.value.idTipCompro !== null) {
            this.filterForm.controls.idBranch.value == false;
            this.submitted = false;
            if (this.filterForm.value.idDocumento !== 0 && this.filterForm.value.documento == '') {
                this.msgAlert('Debe ingresar el número del documento.');
                return false;
            }
            else if (this.filterForm.value.idTipCompro !== 0 && this.filterForm.value.comprobante == '') {
                this.msgAlert('Debe ingresar el comprobante de pago.');
                return false;
            }
            else {
                if (this.filterForm.value.idTipCompro !== null) {
                    this.filterForm.value.comprobante = this.filterForm.value.comprobante.trim();

                    if (this.filterForm.value.comprobante.indexOf('F') > -1 || this.filterForm.value.comprobante.indexOf('B') > -1) {
                    }
                    else {
                        this.msgAlert('El comprobante de pago debe comenzar con F (Factura) o B (Boleta)');
                        this.spinner.hide();
                        return false;
                    }
                    if (this.filterForm.value.comprobante.indexOf('-') > -1) {
                    }
                    else {
                        this.msgAlert('No se encontró el símbolo - ');
                        this.spinner.hide();
                        return false;
                    }
                    if (this.filterForm.value.comprobante.length <= 5) {
                        this.msgAlert('Debe escribir más de 5 dígitos.');
                        this.spinner.hide();
                        return false;
                    }
                }
                return true;
            }
        }
        if (this.filterForm.value.idDocumento !== null) {
            this.filterForm.controls.idBranch.value == false;
            this.submitted = false;
            if (this.filterForm.value.idDocumento !== 0 && this.filterForm.value.documento == '') {
                this.msgAlert('Debe ingresar el número del documento.');
                return false;
            }
            return true;
        }
        if (this.filterForm.value.idTipCompro !== null) {
            this.filterForm.controls.idBranch.value == false;
            this.submitted = false;
            if (this.filterForm.value.idTipCompro !== 0 && this.filterForm.value.comprobante == '') {
                this.msgAlert('Debe ingresar el comprobante de pago.');
                return false;
            }
            else {
                if (this.filterForm.value.idTipCompro !== null) {
                    this.filterForm.value.comprobante = this.filterForm.value.comprobante.trim();

                    if (this.filterForm.value.comprobante.indexOf('F') > -1 || this.filterForm.value.comprobante.indexOf('B') > -1) {
                    }
                    else {
                        this.msgAlert('El comprobante de pago debe comenzar con F (Factura) o B (Boleta)');
                        this.spinner.hide();
                        return false;
                    }
                    if (this.filterForm.value.comprobante.indexOf('-') > -1) {
                    }
                    else {
                        this.msgAlert('No se encontró el símbolo - ');
                        this.spinner.hide();
                        return false;
                    }
                    if (this.filterForm.value.comprobante.length <= 5) {
                        this.msgAlert('Debe escribir más de 5 dígitos.');
                        this.spinner.hide();
                        return false;
                    }
                }
                return true;
            }
        }
    }



    // busca y lista los recibos para devolver
    listPremiumDev() {
        const data = {
            NBRANCH: null,
            NPRODUCT: this.filterForm.value.idProduct,
            NPOLICY: this.filterForm.value.NPOLICY,
            NCERTIF: null,
            SCOMPROBANTE: null,
            idTipCompro: null,
            SCLINUMDOCU: null,
            SFECHAINI: null,
            SFECHAFIN: null,
            NTIPO: 0,
        };
        if (this.filterForm.value.idBranch == '999') {
            data.NBRANCH = this.filterForm.value.Parameter;
        } else {
            data.NBRANCH = this.filterForm.value.idBranch;
        }
        if (this.filterForm.value.certificado == '') {
            data.NCERTIF = -1;
        } else {
            data.NCERTIF = this.filterForm.value.certificado;
        }
        if (
            this.filterForm.value.documento == '' ||
            this.filterForm.value.documento == undefined
        ) {
            data.SCLINUMDOCU = '0';
        } else {
            data.SCLINUMDOCU = this.filterForm.value.documento;
        }
        if (this.filterForm.value.idTipCompro == '') {
            data.idTipCompro = '';
        } else {
            data.idTipCompro = this.filterForm.value.idTipCompro;
        }
        if (
            this.filterForm.value.comprobante == '' ||
            this.filterForm.value.comprobante == undefined
        ) {
            data.SCOMPROBANTE = '0';
        } else {
            data.SCOMPROBANTE = this.filterForm.value.comprobante;
        }
        if (this.filterForm.value.startDate == '') {
            data.SFECHAINI = '';
        } else {
            data.SFECHAINI = this.formatoFecha(this.filterForm.value.startDate);
        }
        if (this.filterForm.value.endDate == '') {
            data.SFECHAFIN = '';
        } else {
            data.SFECHAFIN = this.formatoFecha(this.filterForm.value.endDate);
        }

        this.spinner.show();
        this.CreditNoteService.getListPremiumDev(data).subscribe(
            (res) => {
                res.PremiumVM.forEach((e, i) => {
                    e.VALOR_UNICO =
                        e.NBRANCH + '-' + e.NPRODUCT + '-' + e.NRECEIPT + '-' + e.SCERTYPE + '-' + e.NCERTIF;
                    if (this.listPremiumResultsCarrito.length > 0) {
                        this.listPremiumResultsCarrito.forEach((j) => {
                            if (j.VALOR_UNICO == e.VALOR_UNICO) {
                                e.VALIDADOR = true;
                            }
                        });
                    }
                });
                if (res.PremiumVM.length > 0) {
                    this.checkInit = false;
                    this.checkFin = true;
                } else {
                    this.checkInit = true;
                    this.checkFin = false;
                }
                //VALIDACION DEL CLIENTE
                if (res.PremiumVM.length > 0) {
                    if (this.listPremiumResultsCarrito.length > 0) {
                        if (
                            this.listPremiumResultsCarrito[0].SCLIENT ==
                            res.PremiumVM[0].SCLIENT
                        ) {
                            this.listPremiumResults = res.PremiumVM;
                            this.totalItems = res.PremiumVM.length;
                            this.listToShow = this.listPremiumResults.slice(
                                (this.currentPage - 1) * this.itemsPerPage,
                                this.currentPage * this.itemsPerPage
                            );
                            this.isLoading = false;
                        } else {
                            this.msgError('Mantenga la selección del cliente.');
                            return;
                        }
                    } else {
                        this.listPremiumResults = res.PremiumVM;
                        this.totalItems = res.PremiumVM.length;
                        this.listToShow = this.listPremiumResults.slice(
                            (this.currentPage - 1) * this.itemsPerPage,
                            this.currentPage * this.itemsPerPage
                        );

                        this.isLoading = false;
                    }

                    this.spinner.hide();
                } else {
                    this.spinner.hide();
                    this.isLoading = false;
                    this.msgError('No hay registros, verifique los filtros ingresados.');
                }
            },
            (err) => {
                this.isLoading = false;
                this.spinner.hide();
            }
        );
    }

    ClickTodos(checkbox, item) {
        if (checkbox == true) {
            this.checkInit = true;
            this.checkFin = true;
        } else {
            this.checkInit = false;
            this.checkFin = false;
        }
        this.checkDevolucion = item;
        this.checkDevolucion.forEach((e, i) => {
            if (checkbox == true) {
                if (e.VALIDADOR == false) {
                    this.onRowClick(i, e);
                }
            } else {
                e.VALIDADOR = false;
                this.listPremiumResults.forEach((x) => {
                    if (e.VALOR_UNICO == x.VALOR_UNICO) {
                        x.VALIDADOR = false;
                    }
                });
                this.listPremiumResultsCarrito = [];
                this.selecionadosCarrito = this.listPremiumResultsCarrito.length;
            }
        });
    }
    //devuelve la lista seleccionada para realizar los calculos de prima  y prorrateo - grilla2
    listaReciDev(content) {
        this.spinner.show();
        let fecha_inicio = this.listToShow[0].DEFFECDATE;
        this.fechaInicio = moment(fecha_inicio).format('YYYY-MM-DD');
        this.listReciDev = [];
        let fecha = new Date();

        this.listPremiumResultsCarrito.forEach((e, i) => {
            e.NTIPO = 0;
            if (i == this.listPremiumResultsCarrito.length - 1) {
                e.NTIPO = 1;
            }
        });
        const data = this.listPremiumResultsCarrito;
        this.CreditNoteService.getListReciDev(data).subscribe(
            (res) => {
                if (res.EST == 0) {
                    if (res.PremiumVM.length > 0) {
                        this.listReciDev = res.PremiumVM;
                        this.listReciDev.forEach((e, i) => {
                            e.DDESDE = this.formatoFecha(new Date(e.DDESDE));
                            e.Validador = e.DDESDE;
                        });
                        this.modalService.open(content, {
                            size: 'xl',
                            backdropClass: 'light-blue-backdrop',
                            backdrop: 'static',
                            keyboard: false,
                        });
                        console.log('resultado P_CHEK.. ', res.P_CHEK);
                        if (res.P_CHEK == 1) {
                            this.ifcheckCertif = true;
                        } else {
                            this.ifcheckCertif = false;
                        }
                    }
                    this.spinner.hide();
                } else if (
                    res.EST == 1 ||
                    res.EST == 3 ||
                    res.EST == 4 ||
                    res.EST == 5
                ) {
                    this.msgAlert(res.MESSAGE);
                    this.spinner.hide();
                } else {
                    this.msgError(res.MESSAGE);
                    this.spinner.hide();
                }
                this.isLoading = false;
            },
            (err) => {
                // this.isLoading = false;
            }
        );
    }

    cargarTrama(content3) {
        this.limpiar3();
        this.modalService.open(content3, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });

    }

    getProoduct(isSelected, product) {
        // console.log(isSelected, product.SCLIENAME);
    }

    detReciDev(content2) {
        Swal.fire({
            title: 'Estas seguro de realizar la Devolución?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.spinner.show();

                this.detRecibForm.controls.NMCN.setValue(this.listReciDev[0].NMCN);
                this.detRecibForm.controls.NUSERCODE.setValue(
                    JSON.parse(localStorage.getItem('currentUser')).id
                );
                this.detRecibForm.controls.NCOMMIT.setValue(1);


                if (this.detRecibForm.get('P_CHECKANU').value == true) {
                    this.detRecibForm.controls.P_NFLAG_ANUL.setValue(1);
                } else {
                    this.detRecibForm.controls.P_NFLAG_ANUL.setValue(0);
                }

                /**LISTAR EL DETALLE DE LAS NOTAS DE CREDITO**/
                this.CreditNoteService.getListDetRecDev(
                    this.detRecibForm.value
                ).subscribe(
                    (res) => {
                        if (res.EST == 0) {
                            if (res.PremiumVM.length > 0) {
                                Swal.fire({
                                    title: 'El proceso se realizó con éxito.',
                                    icon: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'Continuar',
                                    allowOutsideClick: false,
                                    // cancelButtonText: 'Cancelar',
                                }).then((result) => {
                                    if (result.value) {
                                        this.listDetRecDev = res.PremiumVM;
                                        this.listDetRecDev.forEach((e) => {
                                            e.SMONEDA = e.SMONEDA.toUpperCase();
                                            e.SPRODUCT = e.SPRODUCT.toUpperCase();
                                            e.SBRANCH = e.SBRANCH.toUpperCase();
                                        });
                                        this.modalService.open(content2, {
                                            size: 'xl',
                                            backdropClass: 'light-blue-backdrop',
                                            backdrop: 'static',
                                            keyboard: false,
                                        });
                                    }
                                });
                            } else {
                                this.msgAlert('No hay registros.');
                            }
                        } else if (
                            res.EST == 1 ||
                            res.EST == 2 ||
                            res.EST == 3 ||
                            res.EST == 4 ||
                            res.EST == 5 ||
                            res.EST == 6
                        ) {
                            this.msgError(res.MESSAGE);
                        } else {
                            this.msgError(res.MESSAGE);
                        }
                        this.spinner.hide();
                    },
                    (err) => {
                        this.spinner.hide();
                    }
                );
            }
        });
    }

    Pruebas() {
        let prueba = [];
        for (let i = 0; i < 20; i++) {
            let ELEMENTOUNICO = i + 1 + '-' + (i + 2) + '-' + 'ELEMENTOUNICO';

            const data = {
                NBRANCH: i,
                NPRODUCT: i + 1,
                NPOLICY: i + 2,
                NCERTIF: i + 9,
                DEFFECDATE: new Date(),
                DEXPIRDAT: new Date(),
                ELEMENTOUNICO: ELEMENTOUNICO,
            };

            prueba.push(data);
        }

        for (let i = 0; i < prueba.length; i++) {
            if (prueba[i].ELEMENTOUNICO == '14-15-ELEMENTOUNICO') {
                // console.log('lo encontre', prueba[i].ELEMENTOUNICO);
                prueba.splice(i, 1);
            }
        }

        // console.log('pruebas unitarias', prueba);

        // es el indice el primer item y el 1 es la cantidad hacia arriba que debe eliminar

        // console.log('pruebas unitarias', prueba);
    }

    rowIsSelected(id: number) {
        return this.selectedRowIds.has(id);
        // console.log(id);
    }
    //capturador de eventos grilla 1 de recibos
    onRowClick(id: number, gri1: any) {
        this.spinner.show();
        let valorAdd = true;
        if (gri1.VALIDADOR == true) {
            this.listPremiumResultsCarrito = this.listPremiumResultsCarrito.filter(
                (item) => item.VALOR_UNICO !== gri1.VALOR_UNICO
            );

            /*
            this.listPremiumResultsCarrito = this.listPremiumResultsCarrito.filter(
                (item) => {
                    this.listToShow.forEach((e, i) => 
                    {
                        if (item.VALOR_UNICO !== e.VALOR_UNICO) 
                        {
                            return true;
                        }
                        return false;
                    });                    
                }
            );
            */

            gri1.VALIDADOR = false;
        } else {
            if (this.listPremiumResultsCarrito.length > 0) {

                this.listPremiumResultsCarrito.forEach((e, i) => {
                    if (gri1.VALOR_UNICO == e.VALOR_UNICO) {
                        valorAdd = false;
                    }
                });

                if (valorAdd == true) {
                    gri1.VALIDADOR = true;
                    this.listPremiumResultsCarrito.push(gri1);
                    //this.listToShow.splice(id,1);
                }
            } else {
                gri1.VALIDADOR = true;
                this.listPremiumResultsCarrito.push(gri1);
                //this.listToShow.splice(id,1);
            }
        }

        this.selecionadosCarrito = this.listPremiumResultsCarrito.length;
        this.listPremiumResultsCarrito.length == this.listPremiumResults.length
            ? (this.checkInit = true)
            : (this.checkInit = false);
        this.listPremiumResultsCarrito.length == 0
            ? (this.checkFin = false)
            : (this.checkFin = true);

        this.spinner.hide();
    }

    //capturador de eventos grilla popup 1 y realiza calculos
    onRowClic2(filaResi: any, indice: number) {
        this.listDetRecDev = [];
        this.dataDevolucion = filaResi;
        let fechaIni = new Date(this.dataDevolucion.DDESDE);
        let fechaFin = new Date(this.dataDevolucion.DEXPIRDAT);
        if (fechaIni > fechaFin) {
            this.msgAlert(
                'La fecha de inicio del recibo ' +
                this.dataDevolucion.NRECEIPT +
                ' no puede ser mayor a la fecha de fin.'
            );
            this.dataDevolucion.DDESDE = this.dataDevolucion.Validador;
            return;
        }
        this.isLoading = true;
        this.CreditNoteService.getFilaResi(this.dataDevolucion).subscribe(
            (res) => {
                if (res.EST == 0) {
                    this.listDetRecDev = res.PremiumVM;
                    this.listDetRecDev.forEach((e) => {
                        e.DDESDE = this.formatoFecha(new Date(e.DDESDE));
                        e.Validador = e.DDESDE;
                        this.listReciDev[indice] = e;
                    });
                    this.fechaPrueba = this.fechaInicio;
                } else if (
                    res.EST == 1 ||
                    res.EST == 3 ||
                    res.EST == 4 ||
                    res.EST == 5
                ) {
                    this.msgAlert(res.MESSAGE);
                    this.listReciDev[indice].DDESDE = this.dataDevolucion.Validador;
                    this.fechaInicio = this.fechaPrueba;
                } else {
                    this.msgError(res.MESSAGE);
                    this.listReciDev[indice].DDESDE = this.dataDevolucion.Validador;
                    this.fechaInicio = this.fechaPrueba;
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }

    rowIsSelected2(id: number) {
        return this.selecRowIds.has(id);
        // console.log(id);
    }
    validarPoliza(evt) {
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        if (
            this.filterForm.value.NPOLICY == null ||
            this.filterForm.value.NPOLICY == undefined ||
            this.filterForm.value.NPOLICY == ''
        ) {
            this.msgError('Ingrese la póliza.');
            return false;
        }
    }
    validarDocumento(evt) {
        if (
            this.filterForm.value.idDocumento == null ||
            this.filterForm.value.idDocumento == undefined ||
            this.filterForm.value.idDocumento == ''
        ) {
            this.msgError('Seleccione un tipo de documento.');
            return false;
        }
        else {
            var code = evt.which ? evt.which : evt.keyCode;
            if (code == 8) {
                // espacios
                return true;
            } else if (code >= 48 && code <= 57) {
                // es un numero?
                if (this.filterForm.value.idDocumento == 1) {
                    if (this.filterForm.value.documento.length == 0) {
                        if (evt.key == 1 || evt.key == 2) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        if (this.filterForm.value.documento.length < 11) {
                            return true;
                        } else {
                            this.msgError('Sobrepasó el límite de 11 números.');
                            return false;
                        }
                    }
                } else {
                    if (this.filterForm.value.idDocumento == 2) {
                        if (this.filterForm.value.documento.length < 8) {
                            return true;
                        } else {
                            this.msgError('Sobrepasó el límite de 8 números.');
                            return false;
                        }
                    }
                }
            } else {
                // otros.
                this.msgError('Ingrese solo números.');
                return false;
            }
        }
    }

    validarComprobante() {
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        if (
            this.filterForm.value.idTipCompro == null ||
            this.filterForm.value.idTipCompro == undefined ||
            this.filterForm.value.idTipCompro == ''
        ) {
            this.msgError('Seleccione un tipo de comprobante.');
            return false;
        }
    }

    TipoComprobante() {
        this.filterForm.controls.comprobante.setValue('');
        if (this.filterForm.value.idTipCompro == null) {
            this.filterForm.controls.comprobante.disable();
        } else {
            this.filterForm.controls.comprobante.enable();
        }
    }

    TipoDocumento() {
        this.filterForm.controls.documento.setValue('');
        if (this.filterForm.value.idDocumento == null) {
            this.filterForm.controls.documento.disable();
        } else {
            this.filterForm.controls.documento.enable();
        }
    }

    TipoDocumentoN(evt) {
        if (evt == 1) {
            this.maxValue = 11;
        }
        if (evt == 2) {
            this.maxValue = 8;
        }
    }

    soloNumeros(evt) {
        var code = evt.which ? evt.which : evt.keyCode;
        this.selectedBoton = 'predefined'; //oculta el boton para carga masiva
        if (code == 8) {
            // espacios
            return true;
        } else if (code >= 48 && code <= 57) {
            // es un numero?

            return true;
        } else {
            // otros.
            return false;
        }
    }

    limpiar() {
        this.modalService.dismissAll();
        this.listPremiumResults = [];
        this.listPremiumResultsCarrito = [];
        this.selecionadosCarrito = 0;
        this.botonDeshabilitado = true;
        this.selectedBoton = 'predefined';
        this.ListParameter = 0;
        this.selectedType = 'predefined';

        this.filterForm = new FormGroup({
            idBranch: new FormControl(''),
            Parameter: new FormControl(''),
            idProduct: new FormControl(''),
            NPOLICY: new FormControl(''),
            certificado: new FormControl(''),
            idDocumento: new FormControl(''),
            documento: new FormControl(''),
            idTipCompro: new FormControl(''),
            comprobante: new FormControl(''),
            startDate: new FormControl(''),
            endDate: new FormControl(''),
        });
        this.ngOnInit();
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.listPremiumResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }
    pageChangedDet(currentPageDet) {
        this.currentPageDet = currentPageDet;
        this.listPremiumResultsCarrito = this.listPremiumResultsCarrito.slice(
            (this.currentPageDet - 1) * this.itemsPerPageDet,
            this.currentPageDet * this.itemsPerPageDet
        );
    }

    asignarTodos() {
        let fecha = new Date(this.fechaInicio);
        let validador = 0;
        this.listReciDev.forEach((e, i) => {
            let fechaFin = new Date(e.DEXPIRDAT);
            if (fechaFin < fecha) {
                return (validador = 1);
            }
        });
        if (validador == 1) {
            this.msgAlert(
                'La fecha genérica no puede ser mayor a los registros de las fechas de fin.'
            );
            this.fechaInicio = this.fechaPrueba;
            return;
        }
        this.listReciDev.forEach((e, i) => {
            e.DDESDE = this.fechaInicio;
            this.onRowClic2(e, i);
        });
    }

    formatoFecha(item) {
        let day = `0${item.getDate()}`.slice(-2); //("0"+date.getDate()).slice(-2);
        let month = `0${item.getMonth() + 1}`.slice(-2);
        let year = item.getFullYear();
        return `${year}-${month}-${day}`;
    }

    validarCargaMas(evt) { //migrantes 12/09/2023
        const data = {
            NBRANCH: null,
            NPRODUCT: this.filterForm.value.idProduct,
            NPOLICY: this.filterForm.value.NPOLICY
        };

        if (this.filterForm.value.idBranch == '999') {
            data.NBRANCH = this.filterForm.value.Parameter;
        } else {
            data.NBRANCH = this.filterForm.value.idBranch;
        };

        if ((this.filterForm.value.idBranch != null && this.filterForm.value.idBranch != '') &&
            (this.filterForm.value.idProduct != null && this.filterForm.value.idProduct != '') &&
            (this.filterForm.value.NPOLICY != null && this.filterForm.value.NPOLICY != '')) {
            console.log('datos de ramo, producto y poliza: ' + data.NBRANCH + ' - ' + data.NPRODUCT + ' - ' + data.NPOLICY);


            this.spinner.show();
            this.CreditNoteService.valCargaMasiva(data).subscribe(
                (res) => {
                    if (res.p_nest == 1) {
                        this.selectedBoton = 'opentype'; //muestra el boton para carga masiva
                        this.botonDeshabilitado = true;
                        this.spinner.hide();
                    }
                    this.spinner.hide();
                },
                (err) => {
                    this.isLoading = false;
                    this.spinner.hide();
                }
            );

        };
        console.log('Sin validar: ')
        this.spinner.hide();
    }

    seleccionExcel(archivo: File) { //migrantes 12/09/2023
        this.excelSubir = null;
        if (!archivo) {
            this.excelSubir = null;
            return;
        }
        this.excelSubir = archivo;
    }

    validarExcel() { //migrantes 12/09/2023
        this.spinner.show();
        let msg = '';
        if (this.excelSubir == null) {
            msg += 'Adjunte una trama para validar '
        }

        if (msg === '') {
            this.insertarTrama();
            this.isLoading = true;
        } else {
            this.isLoading = false;
            this.spinner.hide();

            this.msgAlert(msg);
        }

    }

    insertarTrama() { //migrantes 12/09/2023
        this.spinner.show();
        const myFormData: FormData = new FormData();
        myFormData.append('dataFile', this.excelSubir);
        this.listReciDev = [];

        this.CreditNoteService.insertarTrama(myFormData).subscribe(
            (res) => {
                if (res.NCODE == 0) {
                    this.listReciDev = res.PremiumVM;
                    this.selectedBoton3Gen = 'opentype'; //muestra el boton generar NC
                    this.botonDeshabilitado = false;
                    this.spinner.hide();
                    this.isLoading = false;
                    this.ncData.cantNC = res.NCANTNC;
                    this.ncData.skey = res.SKEY;
                    this.selectedMsg3Gen = 'opentype';
                } else if (res.NCODE == -1){
                    this.isLoading = false;
                    this.spinner.hide();
                    this.listReciDev = res.PremiumVM;
                    this.selectedBoton3Error = 'opentype';
                    this.msgError(res.MESSAGE);

                }else{
                    this.isLoading = false;
                    this.spinner.hide();
                    this.msgError(res.MESSAGE);
                }
            },
            (err) => {
                this.isLoading = false;
                this.spinner.hide();
            }
        );
    }

    generarNcMas(content4) //migrantes 12/09/2023
    {
        this.listNcMas = [];
        const data = {
            NBRANCH: null,
            NPRODUCT: this.filterForm.value.idProduct,
            NPOLICY: this.filterForm.value.NPOLICY,
            SKEY: null,
            NUSERCODE: null
        };

        if (this.filterForm.value.idBranch == '999') {
            data.NBRANCH = this.filterForm.value.Parameter;
        } else {
            data.NBRANCH = this.filterForm.value.idBranch;
        };

        data.SKEY = this.ncData.skey;
        data.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
        console.log('NUSERCODE: ' + data.NUSERCODE);

        this.CreditNoteService.genNcMasiva(data).subscribe(
            (res) => {
                if (res.NCODE == '0') {
                    this.selectedBoton3Exp = 'opentype';
                    this.selectedBoton3Gen = 'predefined';
                    this.botonDeshabilitado = true;
                    this.spinner.hide();

                    Swal.fire({
                        title: 'SE GENERARON ' + this.ncData.cantNC + ' NOTAS DE CRÉDITO',
                        icon: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false,
                        // cancelButtonText: 'Cancelar',
                    }).then((result) => {
                        if (result.value) {
                            this.listNcMas = res.PremiumVM;
                            this.spinner.hide();
                            this.isLoading = false;
                            this.modalService.open(content4, {
                                size: 'xl',
                                backdropClass: 'light-blue-backdrop',
                                backdrop: 'static',
                                keyboard: false,
                            });
                        }
                    });
                } else {

                    this.isLoading = false;
                    this.spinner.hide();
                    this.msgError(res.MESSAGE);
                    return;
                }

            },
            (err) => {
                this.isLoading = false;
                this.spinner.hide();
            }
        );


    }

    exportar4() //migrantes 12/09/2023
    {
        this.spinner.show();

        this.spinner.hide();
        //this.cabeceraExcel(this.listarNC);
        this.reporteListadoXLSX = this.listNcMas;
        this.excelService.expNcMasExcelFile(
            this.reporteListadoXLSX,
            'Reporte_Nota_Credito'
        );
    }

    exportarError() //migrantes 22/02/2024
    {
        this.spinner.show();

        this.spinner.hide();
        this.reporteListadoXLSX = this.listReciDev;
        this.excelService.expErrorNcMasExcelFile(
            this.reporteListadoXLSX,
            'Reporte_Errores_Nota_Credito'
        );
    }

    limpiar3() {
        this.selectedBoton3Exp = 'predefined';
        this.selectedBoton3Gen = 'predefined';
        this.selectedMsg3Gen = 'predefined';
        this.listReciDev = [];
        this.excelSubir = null;
        this.selectedBoton3Error = 'predefined';//migrantes 22/02/2024

    }

    cerrar3(content3)//migrantes 12/09/2023
    {
        Swal.fire({
            title: '¿Desea cerrar la ventana?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.limpiar3();
                this.modalService.dismissAll(content3);
            }
        });


    }

    cerrar4(content4)//migrantes 12/09/2023
    {
        Swal.fire({
            title: '¿Desea cerrar la ventana?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.limpiar3();
                this.limpiar();
                this.modalService.dismissAll(content4);
            }
        });


    }

}
