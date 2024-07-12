/**********************************************************************************************/
/*  NOMBRE              :   rebillReport.component.TS                                           */
/*  DESCRIPCION         :   Reporte de Refacturación                                          */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                              */
/*  FECHA               :   01/11/2023                                                          */
/*  VERSION             :   1.0                                                                 */
/*************************************************************************************************/
import { Component, OnInit, ViewChild, ɵConsole } from '@angular/core';
import {
    CheckboxControlValueAccessor,
    FormBuilder,
    Validators,
} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ReporteRebillService } from '../../services/rebillReport/rebillReport.service';
import { FormControl, FormGroup, Validator } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
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
    nTipDocu?: number;
    idPoliza?: string;
    idComprobante?: string;
    idCliDocument?: string;
}
export interface ActionConfig {
    nbranch?: number;
    nparameter?: number;
    nproduct?: number;
    nTipDocu?: number;
    idPoliza?: string;
    idComprobante?: string;
    idCliDocument?: string;
}
@Component({
    selector: 'app-rebillReport',
    templateUrl: './rebillReport.component.html',
    styleUrls: ['./rebillReport.component.css'],

})
export class ReporteRefacturacion implements OnInit {

    diaActual = moment(new Date()).toDate();
    loading = true;
    filterConfig: FiltroConfig;
    filterForm: FormGroup;
    actionConfig: ActionConfig;
    bsConfig: Partial<BsDatepickerConfig>;

    public ColorButton: string;

    public ListarTipoConsultas = [];
    public ListaRamoPay = [];
    public listarTipDocu = [];
    public ListaProducto = [];
    ListParameter: any = [];
    ListProduct: any = [];
    processHeaderList: any = [];
    reporteListadoXLSX: any = [];
    listToShow: any = [];
    selectedType = 'predefined';
    selectedPermiso = 'predefined';
    selectedExp = 'predefined';
    isLoading: boolean = false;
    evaluarBoton: boolean = true;

    maxSize = 10;
    itemsPerPage = 5;
    totalItems = 0;
    currentPage = 1;


    constructor(
        config: NgbModalConfig,
        private service: ReporteRebillService,
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
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate()); // DGC 09/06/2023
        this.createForm();
        this.loading = false;
        this.filterConfig = {};
        this.filterForm.controls.nBranch.setValue(0);
        this.filterForm.controls.nParameter.setValue(0);
        this.filterForm.controls.nProduct.setValue(0);
        this.filterForm.controls.nTipDocu.setValue(0);
        this.filterForm.controls.idPoliza.setValue('');
        //this.filterForm.controls.idTipoConsulta.setValue(0);
        this.filterForm.controls.idComprobante.setValue('');
        this.filterForm.controls.idCliDocument.setValue('');
        this.filterForm.controls.startDate.setValue(this.diaActual);
        this.filterForm.controls.endDate.setValue(this.diaActual);
        this.actionConfig = {};
        this.ColorButton = 'purple';
        this.service.listarRamo().subscribe(
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
        this.service.tipoDocumento().subscribe(
            (s) => {
                console.log('Listado tipo de docu', s);
                this.listarTipDocu = s;
                console.log(s);
                // this.idEstadoReciboSel = 0;
            },
            (e) => {
                console.log(e);
            }
        );
    }
    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            nBranch: [0],
            nProduct: [0],
            nTipDocu: [0],
            nParameter: [0],
            idPoliza: [''],
            idComprobante: [''],
            idCliDocument: [''],
            idTipoConsulta: [-1],
            startDate: new FormControl(this.diaActual),
            endDate: new FormControl(this.diaActual),
        });
    }

    SelectBranch() {
        this.filterForm.controls.nParameter.setValue(0);
        this.selectedExp = 'predefined';
        this.filterForm.controls.nProduct.setValue(0);
        this.filterForm.controls.idTipoConsulta.setValue(0);
        this.filterForm.controls.idComprobante.setValue('');
        this.filterForm.controls.idCliDocument.setValue('');
        this.filterForm.controls.startDate.setValue(this.diaActual);
        this.filterForm.controls.endDate.setValue(this.diaActual);
        this.filterForm.controls.nTipDocu.setValue(0);
        this.ListParameter = [];
        this.ListaProducto = [];
        let data = {};
        data = { nBranch: this.filterForm.value.nBranch };

        if (this.filterForm.value.nBranch == '999') {
            this.selectedType = 'opentype'; //muestra el dropdown de masivos
            this.ListProduct = null;
            this.service.listarProducto(data).subscribe(
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
            this.service.listarProducto(data).subscribe(
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

    selectTipo() {
        this.filterForm.controls.nBranch.setValue(0);
        this.filterForm.controls.nParameter.setValue(0);
        this.filterForm.controls.nProduct.setValue(0);
        this.filterForm.controls.idPoliza.setValue('');
        this.filterForm.controls.idComprobante.setValue('');
        this.filterForm.controls.idCliDocument.setValue('');
        this.selectedExp = 'predefined';
    }

    seleccionRamo() {
        this.filterForm.controls.nProduct.setValue(0);
        let data = {};
        data = { nBranch: this.filterForm.value.nParameter };
        this.service.listarProducto(data).subscribe(
            (s) => {
                console.log('Listado de PRODUCTO', s);
                this.ListaProducto = s;
            },
            (e) => {
                console.log(e);
            }
        );
    }

    onConsultar() {
        this.selectedPermiso = 'predefined';
        this.selectedExp = 'predefined';
        this.processHeaderList = null;
        this.spinner.show();
        this.filtrarDatos();
        if (this.evaluarBoton == false) {
            return (this.evaluarBoton = true);
        }
        this.processHeaderList = [];
        this.listToShow = [];

        this.currentPage = 1;
        this.maxSize = 5;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.service.listarRefact(this.filterForm.value).subscribe(
            s => {

                if (s[0].P_EST == 0) {

                    this.spinner.hide();
                    this.processHeaderList = s[0].lista;
                    this.totalItems = this.processHeaderList.length;
                    this.listToShow = this.processHeaderList.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.processHeaderList.length > 0) {
                        this.selectedExp = 'opentype';

                        const data = { NUSERCODE: null, nBranch: null, nProduct: null };
                        data.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
                        if (this.filterForm.controls.nBranch.value == 999) {
                            data.nBranch = this.filterForm.controls.nParameter.value;
                        } else {
                            data.nBranch = this.filterForm.controls.nBranch.value;
                        }

                        data.nProduct = this.filterForm.controls.nProduct.value;
                        console.log('datos de permiso: us: ' + data.NUSERCODE + ' ramo: ' + data.nBranch + ' prod: ' + data.nProduct);
                        this.service.permisoUser(data).subscribe(
                            (s) => {
                                console.log('Permiso recibido', s);
                                if (s == '1') {//permiso de ver el campo Motivo
                                    this.selectedPermiso = 'opentype';
                                }
                                console.log('respuesta de permiso user: ' + s);
                                // this.idEstadoReciboSel = 0;
                            },
                            (e) => {
                                console.log(e);
                            }
                        );

                    }

                } else {
                    this.spinner.hide();
                    Swal.fire('Alerta!', s[0].P_MENSAGE, 'error');
                    this.selectedExp = 'predefined';
                }

            },
            (e) => {
                console.log(e);
                Swal.fire('Alerta!', 'Error al ingresar los datos.', 'error');
                this.spinner.hide();
                this.selectedExp = 'predefined';
            }
        );
    }

    onExportar() {
        var p = 0;
        this.spinner.show();
        this.filtrarDatos();

        if (this.evaluarBoton == false) {
            return (this.evaluarBoton = true);
        }

        if (this.selectedPermiso == 'opentype') {//habilita el campo Motivo al exportar en excel
            this.spinner.hide();
            this.reporteListadoXLSX = this.processHeaderList;
            this.excelService.exportRefacExcelFileM(
                this.reporteListadoXLSX, 'Reporte_Refacturación');
        } else {
            this.spinner.hide();
            this.reporteListadoXLSX = this.processHeaderList;
            this.excelService.exportRefacExcelFile(
                this.reporteListadoXLSX, 'Reporte_Refacturación');
        }

    }

    filtrarDatos() {
        let mensajeAdvertencia = '';
        if (this.filterForm.value.idComprobante != '') {
            if (
                this.filterForm.value.idComprobante.indexOf('F') > -1 ||
                this.filterForm.value.idComprobante.indexOf('B') > -1
            ) {
            } else {
                mensajeAdvertencia = '* El comprobante debe de comenzar con F-B ,';
            }
            if (this.filterForm.value.idComprobante.indexOf('-') > -1) {
            } else {
                mensajeAdvertencia = mensajeAdvertencia + '* En el campo Comprobante no se encontro el simbolo - ';
            }
            if (this.filterForm.value.idComprobante.length <= 5) {
                mensajeAdvertencia = mensajeAdvertencia + '* En el campo Comprobante escribir mas de 5 digitos ';
            }
        }

        if ((this.filterForm.value.idComprobante == '' ||
            this.filterForm.value.idComprobante == null) &&
            (this.filterForm.value.idPoliza == '' ||
                this.filterForm.value.idPoliza == null) &&
            (this.filterForm.value.idCliDocument == '' ||
                this.filterForm.value.idCliDocument == null)) {
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

        if (this.filterForm.value.idPoliza == '' ||
            this.filterForm.value.idPoliza == null) {
            this.filterForm.value.idPoliza = '0';
        } else {
            this.filterForm.value.idPoliza = this.filterForm.value.idPoliza;
        }

        if ((this.filterForm.value.startDate == '' ||
            this.filterForm.value.startDate == null) &&
            (this.filterForm.value.endDate == '' ||
                this.filterForm.value.endDate == null)) {

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
                    mensajeAdvertencia = mensajeAdvertencia + '* Fecha de Inicio no debe ser posterior a la Fecha Fin. ';
                }
            }
        }

        if (this.filterForm.value.idPoliza > 0 && this.filterForm.value.nBranch == 0) {
            mensajeAdvertencia = mensajeAdvertencia + '* Debe seleccionar el ramo para la póliza ingresada. ';
        }

        if (mensajeAdvertencia != '') {
            Swal.fire('Información', mensajeAdvertencia, 'warning');
            this.spinner.hide();
            return (this.evaluarBoton = false);
        }

    }
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.processHeaderList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

}