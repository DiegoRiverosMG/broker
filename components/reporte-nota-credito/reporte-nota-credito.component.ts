/**********************************************************************************************/
/*  NOMBRE              :   reporte-nota-credito.component.TS                                   */
/*  DESCRIPCION         :   Reporte de Nota de Credito                                          */
/*  AUTOR               :   MATERIAGRIS - MAXIMO JOSUE CORONEL FLORES                           */
/*  FECHA               :   08/11/2022                                                          */
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
import { ReporteNotaCreditoService } from '../../services/reporte-nota-credito/reporte-nota-credito.service';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validator } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
import { Payroll } from '../../models/payroll/payroll';
import { NULL_EXPR, THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { CallTracker } from 'assert';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import moment from 'moment';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD/MM/YYYY',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};
export interface IRamoPay {
    idRamoPay: number;
    descripcionRamoPay: string;
}
export interface FiltroConfig {
    nbranch?: number;
    nparameter?: number;
    nproduct?: number;
    idPoliza?: string;
    idComprobante?: string;
    idCliDocument?: string;
}
export interface ActionConfig {
    nbranch?: number;
    nparameter?: number;
    nproduct?: number;
    idPoliza?: string;
    idComprobante?: string;
    idCliDocument?: string;
}

@Component({
    selector: 'app-reporte-nota-credito',
    templateUrl: './reporte-nota-credito.component.html',
    styleUrls: ['./reporte-nota-credito.component.css'],
    // providers: [
    //   { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    //   {
    //     provide: DateAdapter,
    //     useClass: MomentDateAdapter,

    //     deps: [MAT_DATE_LOCALE]
    //   },
    //   { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    // ]
})
export class ReporteNotaCreditoComponent implements OnInit {
    // public listareporteprocesado:ReporteExtractoResultado[]=[];
    // DatosConsultaReporte=new DatosConsultarReporteExtracto();

    selectedValue: number;
    placeholderBusqueda: string = '';
    filterConfig: FiltroConfig;
    actionConfig: ActionConfig;
    filterForm: FormGroup;

    evaluar: boolean = true;
    evaluarBoton: boolean = true;

    busquedaDevolucion: string = '';
    mostrarDevolucion: boolean = false;
    mostrarDetalleDevolucion: boolean = false;
    activarEstadoDevolucion: boolean = true;
    activarInputDevolucion: boolean = false;

    /*   formularioNotaCredito:boolean = false; */
    formularioNroOperacion: boolean = false;

    // @ViewChild(MatPaginator) paginator: MatPaginator;
    // // @ViewChild('paginator1') paginator1: MatPaginator;
    // // @ViewChild('paginator2') paginator2: MatPaginator;

    loading = true;
    botonEstado: boolean = true;
    fechaPrueba: string = '';
    listarNC: any = [];
    isLoading: boolean = false;

    // public listareporterecibopendienteNC: ReporteReciboPendienteNCResultado[] = [];

    // public listadoRecibosSelFPTemp: ListadoReciboFPSelTemp[] = [];

    // DatosConsultaReciboPendienteNC = new DatosConsultarReciboPendienteNC();
    // DatosConsultaContratanteNC = new DatosConsultarContratanteNC();
    // public resultadoContratanteNC: any = new DatosRespuestaContratanteNC();
    public montoAcumuladoCheck = 0;
    public montoAcumuladoFPCheck = 0;
    public montoDiferencia = '';
    public docContratante = '';
    public codContratante = '';
    public ColorButton: string;
    mensaje: string = 'Hola';
    arrayTipo = [];
    arrayNota = [];
    newarrayNota: string;

    displayedColumnsReporteListado = [
        'combrobante',
        'fecha_comprobante',
        'estado',
        'prima',
        'impuesto',
        'prima_total',
        'factura_afecta',
        'monto_afecta',
        'modo_uso',
        'monto_usado',
        'saldo',
        'fecha_emision',
        'fecha_aplicacion',
        'fecha_anulacion',
    ];

    // dataSourceReporteListado = new MatTableDataSource<ReporteExtractoResultado>(this.listareporteprocesado);

    // dataSourceReporteReciboPendienteNC1: ReporteReciboPendienteNCResultado;

    // iReporteReciboPendienteNCResultado:IReporteReciboPendienteNCResultado;

    listToShow: any = [];
    processHeaderList: any = [];
    reporteListadoXLSX: any = [];
    maxSize = 10;
    itemsPerPage = 5;
    totalItems = 0;
    currentPage = 1;
    isValidatedInClickButton: boolean = false;

    validarDetalle = 1;
    montoActual = 0;
    montoNuevo = 0;
    CabeceraListado = [];

    public ListaRamoPay = [];
    public ListaProducto = [];
    public ListarTipoConsultas = [];
    bsConfig: Partial<BsDatepickerConfig>;

    /*Para MASIVO 999*/
    selectedType = 'predefined';
    ListProduct: any = [];
    ListParameter: any = [];
    /*Para MASIVO 999*/

    /*Para la fecha del dia*/
    diaActual = moment(new Date()).toDate();
    /*Para la fecha del dia*/

    // dataSourceReporteFormaPagoAplicadoNCTemp = new MatTableDataSource<ListadoReciboFPSelTemp>(this.listadoRecibosSelFPTemp);

    constructor(
        config: NgbModalConfig,
        private service: ReporteNotaCreditoService,
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
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

    ngOnInit() {
        //this.spinner.show();
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate()); // DGC 09/06/2023
        this.createForm();
        this.loading = false;
        this.filterConfig = {};
        this.filterForm.controls.nBranch.setValue(0);
        this.filterForm.controls.nParameter.setValue(0);
        this.filterForm.controls.nProduct.setValue(0);
        this.filterForm.controls.idPoliza.setValue('');
        this.filterForm.controls.idTipoConsulta.setValue(0);
        this.filterForm.controls.idComprobante.setValue('');
        this.filterForm.controls.idCliDocument.setValue('');
        this.filterForm.controls.startDate.setValue(this.diaActual);
        this.filterForm.controls.endDate.setValue(this.diaActual);
        this.actionConfig = {};
        this.ColorButton = 'purple';
        this.service.ListarRamoPay().subscribe(
            (s) => {
                console.log('Listado de Ramos', s);
                this.ListaRamoPay = s;
                console.log(s);
                // this.idEstadoReciboSel = 0;
            },
            (e) => {
                console.log(e);
            }
        );
        this.service.ListarTipoConsulta().subscribe(
            (s) => {
                console.log('Listado Tipo de Consultas', s);
                this.ListarTipoConsultas = s;
                console.log(s);
            },
            (e) => {
                console.log(e);
            }
        );
        //this.seleccionRamo();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            nBranch: [0],
            nProduct: [0],
            nParameter: [0],
            idPoliza: [''],
            idComprobante: [''],
            idCliDocument: [''],
            idTipoConsulta: [-1],
            startDate: new FormControl(this.diaActual),
            endDate: new FormControl(this.diaActual),
        });
    }

    seleccionRamo() {
        this.filterForm.controls.nProduct.setValue(0);
        let data = {};
        data = { nBranch: this.filterForm.value.nParameter };
        this.service.ListarProductoPay(data).subscribe(
            (s) => {
                console.log('Listado de PRODUCTO', s);
                this.ListaProducto = s;
            },
            (e) => {
                console.log(e);
            }
        );
    }

    /*Nuevo para ramo 999 MASIVO*/
    //Método para obtener los productos y masivos
    SelectBranch() {
        //this.filterForm.controls.nBranch.setValue(0);
        this.filterForm.controls.nParameter.setValue(0);
        this.filterForm.controls.nProduct.setValue(0);
        //this.filterForm.controls.idPoliza.setValue('');
        this.filterForm.controls.idTipoConsulta.setValue(0);
        this.filterForm.controls.idComprobante.setValue('');
        this.filterForm.controls.idCliDocument.setValue('');
        this.filterForm.controls.startDate.setValue(this.diaActual);
        this.filterForm.controls.endDate.setValue(this.diaActual);
        this.ListParameter = [];
        this.ListaProducto = [];
        let data = {};
        data = { nBranch: this.filterForm.value.nBranch };

        if (this.filterForm.value.nBranch == '999') {
            this.selectedType = 'opentype'; //muestra el dropdown de masivos
            this.ListProduct = null;
            this.service.GetProductPremiumReport(data).subscribe(
                (res) => {
                    if (res != undefined && res.length > 0) {
                        this.ListParameter = res;
                    } else {
                        Swal.fire(
                            'Información',
                            'Debe selecionar el Masivo Correspondiente. Póngase en contacto con el administrador' +
                            this.filterForm.value.nBranch,
                            'error'
                        );
                    }
                },
                (err) => {
                    Swal.fire(
                        'Información',
                        'Ha ocurrido un error ' + this.filterForm.value.nBranch,
                        'error'
                    );
                }
            );
        } else {
            this.selectedType = 'predefined'; //oculta el dropdown de masivos
            this.service.GetProductPremiumReport(data).subscribe(
                (res) => {
                    if (res != undefined && res.length > 0) {
                        this.ListaProducto = res;
                    } else {
                        Swal.fire(
                            'Información',
                            'Debe selecionar el Ramo. Póngase en contacto con el administrador' +
                            this.filterForm.value.nBranch,
                            'error'
                        );
                    }
                },
                (err) => {
                    Swal.fire(
                        'Información',
                        'Ha ocurrido un error ' + this.filterForm.value.nBranch,
                        'error'
                    );
                }
            );
        }
    }

    soloNumeros(evt: any) {
        return evt.charCode >= 48 && evt.charCode <= 57;
    }

    formatoFecha(item) {
        let day = `0${item.getDate()}`.slice(-2); //("0"+date.getDate()).slice(-2);
        let month = `0${item.getMonth() + 1}`.slice(-2);
        let year = item.getFullYear();
        return `${month}/${day}/${year}`;
    }

    convertFromStringToDate(responseDate) {
        let dateComponents = responseDate.split('T');
        let datePieces = dateComponents[0].split('/');
        datePieces[0].length == 1
            ? (datePieces[0] = '0' + datePieces[0])
            : (datePieces[0] = datePieces[0]);
        let año = datePieces[2].split(' ');
        datePieces[2] = año[0];
        return datePieces[0] + '/' + datePieces[1] + '/' + datePieces[2];
    }

    filtrarDatos() {
        let mensajeAdvertencia = '';
        if (this.filterForm.value.idComprobante != '') {
            if (
                this.filterForm.value.idComprobante.indexOf('0') > -1 ||
                this.filterForm.value.idComprobante.indexOf('FC') > -1 ||
                this.filterForm.value.idComprobante.indexOf('BC') > -1
            ) {
            } else {
                mensajeAdvertencia = '* La nota de credito debe de comenzar con 0-BC-FC ,';
            }
            if (this.filterForm.value.idComprobante.indexOf('-') > -1) {
            } else {
                mensajeAdvertencia = mensajeAdvertencia + '* En el campo Comprobante no se encontro el simbolo - ';
            }
            if (this.filterForm.value.idComprobante.length <= 5) {
                mensajeAdvertencia = mensajeAdvertencia + '* En el campo Comprobante escribir mas de 5 digitos ';
            }
        }
        if (
            (this.filterForm.value.idComprobante == '' ||
                this.filterForm.value.idComprobante == null) &&
            (this.filterForm.value.idPoliza == '' ||
                this.filterForm.value.idPoliza == null) &&
            (this.filterForm.value.idCliDocument == '' ||
                this.filterForm.value.idCliDocument == null)
        ) {
            if (this.filterForm.value.nBranch == 999) {
                if (this.filterForm.value.nParameter == 0) {
                    mensajeAdvertencia = mensajeAdvertencia + '* Seleccione un Ramo Masivo. ';
                }
            }
            if (this.filterForm.value.nBranch == 0) {
                mensajeAdvertencia = mensajeAdvertencia + '* Seleccione un Ramo. ';
            }
            if (this.filterForm.value.nProduct == 0) {
                mensajeAdvertencia = mensajeAdvertencia + '* Seleccione un Producto. ';
            }
        }

        if (this.filterForm.value.idTipoConsulta == -1) {
            mensajeAdvertencia = mensajeAdvertencia + '* Seleccione un Tipo de Movimiento N.C. ';
        }

        if (
            this.filterForm.value.idPoliza == '' ||
            this.filterForm.value.idPoliza == null
        ) {
            this.filterForm.value.idPoliza = '0';
        } else {
            this.filterForm.value.idPoliza = this.filterForm.value.idPoliza;
        }

        if (
            (this.filterForm.value.startDate == '' ||
                this.filterForm.value.startDate == null) &&
            (this.filterForm.value.endDate == '' ||
                this.filterForm.value.endDate == null)

        ) {

        } else {
            if (
                (this.filterForm.value.startDate == '' ||
                    this.filterForm.value.startDate == null) &&
                (this.filterForm.value.endDate != '' ||
                    this.filterForm.value.endDate != null)

            ) {
                mensajeAdvertencia = mensajeAdvertencia + '* Debe colocar fecha de inicio. ';
            }

            if ((this.filterForm.value.startDate != '' ||
                this.filterForm.value.startDate != null) &&
                (this.filterForm.value.endDate != '' ||
                    this.filterForm.value.endDate != null)
            ) {
                if (
                    this.filterForm.value.startDate >
                    this.filterForm.value.endDate
                ) {
                    mensajeAdvertencia = mensajeAdvertencia + '* Fecha de Inicio NO debe ser posterior a la Fecha Fin. ';
                }
            }
        }

        if(this.filterForm.value.idPoliza > 0 && this.filterForm.value.nBranch == 0){
            mensajeAdvertencia = mensajeAdvertencia + '* Debe seleccionar el ramo para la póliza ingresada. ';
        }

        if(mensajeAdvertencia != ''){
            Swal.fire('Información', mensajeAdvertencia, 'warning');
            this.spinner.hide();
            return (this.evaluarBoton = false);
        }

    }

    onFiltrar() {
        this.processHeaderList = null;
        this.spinner.show();
        this.filtrarDatos();
        if (this.evaluarBoton == false) {
            return (this.evaluarBoton = true);
        }

        this.isValidatedInClickButton = true;
        this.listToShow = [];
        this.processHeaderList = [];

        this.currentPage = 1;
        this.maxSize = 5;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.service.ListarNotaCredito(this.filterForm.value).subscribe(
            (s) => {
                this.processHeaderList = s[0].lista;
                if (this.processHeaderList.length > 0) {
                    this.processHeaderList.forEach((e) => {
                        e.FECHA_COMPROBANTE = e.FECHA_COMPROBANTE.split(' ')[0];
                    });
                }
                this.totalItems = this.processHeaderList.length;
                this.listToShow = this.processHeaderList.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
                if (this.processHeaderList.length === 0) {
                    Swal.fire({
                        title: 'Información',
                        text: 'No se encuentran procesos con la fecha ingresada.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                        }
                    });
                }
                this.spinner.hide();
                
                console.log(this.processHeaderList);
            },
            (e) => {
                console.log(e);
                Swal.fire('Alerta!', 'Error al ingresar los datos.', 'error');
                this.spinner.hide();
            }
        );
    }

    onExportar() {
        this.spinner.show();
        this.filtrarDatos();

        if (this.evaluarBoton == false) {
            return (this.evaluarBoton = true);
        }

        this.spinner.hide();
        this.reporteListadoXLSX = this.processHeaderList;
        this.excelService.exportNCExcelFile(
            this.reporteListadoXLSX,
            'Reporte_Nota_Credito'
        );
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.processHeaderList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    cabeceraExcel(item) {
        this.CabeceraListado = [];
        item.forEach((e, i) => {
            this.CabeceraListado.push({
                Combrobante: '',
                Derecho_Emision: '',
                Emision_Afecta: '',
                Fecha_Comprobante: '',
                Estado: '',
                Fecha_Estado: '',
                Prima: '',
                Impuesto: '',
                Prima_Total: '',
                Transaccion: '',
                Inicio_Poliza: '',
                Fin_Poliza: '',
                Factura_Afecta: '',
                Monto_Afecta: '',
                Modo_Uso: '',
                Monto_Usado: '',
                Saldo: '',
                //Nuevos campos JE 18/11/2022
                Fecha_Emision: '',
                Fecha_Aplicacion: '',
                Fecha_Anulacion: '',
            });

            this.CabeceraListado[i].Combrobante = e.comprobante;
            this.CabeceraListado[i].Fecha_Comprobante = e.fechA_COMPROBANTE;
            this.CabeceraListado[i].Derecho_Emision = e.derechO_EMISION;
            this.CabeceraListado[i].Emision_Afecta = e.emisioN_FAC_AFECTA;
            this.CabeceraListado[i].Estado = e.estadO_COMPROBANTE;
            this.CabeceraListado[i].Fecha_Estado = e.fechA_ESTADO;
            this.CabeceraListado[i].Prima = e.primA_NETA;
            this.CabeceraListado[i].Impuesto = e.impuesto;
            this.CabeceraListado[i].Prima_Total = e.primA_TOTAL;
            this.CabeceraListado[i].Transaccion = e.ntransac;
            this.CabeceraListado[i].Inicio_Poliza = e.iniciO_POLIZA;
            this.CabeceraListado[i].Fin_Poliza = e.fiN_POLIZA;
            this.CabeceraListado[i].Factura_Afecta = e.facturA_AFECTA;
            this.CabeceraListado[i].Monto_Afecta = e.montO_FAC_AFECTA;
            this.CabeceraListado[i].Modo_Uso = e.modO_DE_USO;
            this.CabeceraListado[i].Monto_Usado = e.montO_USADO;
            this.CabeceraListado[i].Saldo = e.saldO_NC;
            this.CabeceraListado[i].Fecha_Emision = e.emisioN_FAC_AFECTA;
            this.CabeceraListado[i].Fecha_Aplicacion = e.fechA_APLICACION;
            this.CabeceraListado[i].Fecha_Anulacion = e.fechA_ANULACION;
        });
    }

}
