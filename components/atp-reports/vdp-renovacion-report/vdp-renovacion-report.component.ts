import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
    selector: 'app-atp-report',
    templateUrl: './vdp-renovacion-report.component.html',
    styleUrls: ['./vdp-renovacion-report.component.css']
})
export class VdpRenovationReportComponent implements OnInit {

    //CheckBox
    UnselectedItemMessage: any = '';
    StartDateSelected: any = '';
    EndDateSelected: any = '';


    isError: boolean = false;

    //Pantalla de carga
    isLoading: boolean = false;
    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueFinMax: Date = new Date();
    // data: ReportAtpSearch = new ReportAtpSearch();

    public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
    public totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';

    //Formato de la fecha
    constructor(
        private AtpReportService: AtpReportService,
        private excelService: ExcelService

    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
    }

    //Función para procesar los reportes
    VdpRenovationeportVDP() {
        this.isError = false;
        if (this.bsValueIni == null && this.bsValueFin == null) {
            this.isError = true;
            this.UnselectedItemMessage = 'Las fechas deben estar completas.';
        }

        if (this.isError == true) {
            swal.fire({
                title: 'Información',
                text: this.UnselectedItemMessage,
                icon: 'warning',
                confirmButtonText: 'Continuar',
                allowOutsideClick: false

            }).then((result) => {
                if (result.value) {
                }
            });
            this.isLoading = false;
            err => {
                this.isLoading = false;
            }
        } else {
            if ((this.bsValueIni != null && this.bsValueFin != null)) {
                if (new Date(this.bsValueIni) > new Date(this.bsValueFin)) {
                    this.isError = true;
                    this.UnselectedItemMessage = 'La fecha de operación inicio no puede ser mayor a la fecha de operación fin';
                }

                if (new Date(this.bsValueFin) < new Date(this.bsValueIni)) {
                    this.isError = true;
                    this.UnselectedItemMessage = 'La fecha de operación fin no puede ser menor a la fecha de operación inicio';
                }

                if (this.isError == true) {
                    swal.fire({
                        title: 'Información',
                        text: this.UnselectedItemMessage,
                        icon: 'warning',
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false

                    }).then((result) => {
                        if (result.value) {
                        }
                    });
                    this.isLoading = false;
                    err => {
                        this.isLoading = false;
                    }
                }
                else {
                    if (this.bsValueIni != null && this.bsValueFin != null) {
                        this.StartDateSelected = this.bsValueIni.getDate().toString().padStart(2, '0') + "/" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueIni.getFullYear();
                        this.EndDateSelected = this.bsValueFin.getDate().toString().padStart(2, '0') + "/" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueFin.getFullYear();
                    }
                    swal.fire({
                        title: "Advertencia",
                        text: "¿Está seguro que desea generar el reporte con el rango de fechas del " + this.StartDateSelected + " al " + this.EndDateSelected + " ?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.value) {
                            this.isLoading = true;
                            let data: any = {};
                            //debugger;

                            if (this.bsValueIni != null && this.bsValueFin != null) {
                                data.dStart_Date = this.bsValueIni.getFullYear() + "-" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueIni.getDate().toString().padStart(2, '0');
                                data.dExpir_Dat = this.bsValueFin.getFullYear() + "-" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueFin.getDate().toString().padStart(2, '0');
                            } else {
                                data.dStart_Date = null;
                                data.dExpir_Dat = null;
                            }
                            this.AtpReportService.VdpRenovationeportVDP(data).subscribe(
                                res => {
                                    this.foundResults = res.genericResponse;

                                    if (this.foundResults != null && this.foundResults.length > 0) {
                                        this.totalItems = res.totalRowNumber;
                                        this.excelService.generateReportRenovationExcel(this.foundResults, 'ReporteRenovación -');
                                    }
                                    else {
                                        this.totalItems = 0;
                                        swal.fire('Información', this.notfoundMessage, 'warning');
                                    }
                                    this.isLoading = false;
                                },
                                error => {
                                    this.foundResults = [];
                                    this.totalItems = 0;
                                    this.isLoading = false;
                                    swal.fire('Información', this.genericErrorMessage, 'error');
                                }
                            );
                        }
                    });
                }
            }
        }
    }
}
