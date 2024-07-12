import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
    selector: 'app-vdp-anual-resume-report.component',
    templateUrl: './vdp-anual-resume-report.component.html',
    styleUrls: ['./vdp-anual-resume-report.component.css']
})
export class VdpAnualResumeReportComponent implements OnInit {

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
    public foundResults: any;  //Lista de registros encontrados durante la búsqueda
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
                dateInputFormat: "YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);

    }
    exportToExcel() {
        if (this.foundResults != null && this.foundResults.length > 0)
            this.excelService.generateResumenAnualPolizasVDPExcel(this.foundResults, 'ResumenAnual');
        else
            swal.fire('Información', 'No hay datos para exportar a excel.', 'error');
    }

    //Función para procesar los reportes
    ProcessReportControlYear() {
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
                    this.UnselectedItemMessage = 'El año de emisión inicio no puede ser mayor al año de emisión fin';
                }

                if (new Date(this.bsValueFin) < new Date(this.bsValueIni)) {
                    this.isError = true;
                    this.UnselectedItemMessage = 'El año de emisión fin no puede ser menor al año de emisión inicio';
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
                        this.StartDateSelected = this.bsValueIni.getFullYear();
                        this.EndDateSelected = this.bsValueFin.getFullYear();
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
                            if (this.bsValueIni != null && this.bsValueFin != null) {

                                data.dStart_Date = this.bsValueIni.getFullYear() + "-" + "01" + "-" + "01";
                                data.dExpir_Dat = this.bsValueFin.getFullYear() + "-" + "12" + "-" + "01";


                                //data.dStart_Date =  "01" + "-" + "01"+ "-" +  this.bsValueIni.getFullYear();
                                //data.dExpir_Dat =  "12" + "/" + "01"+ "/" +   this.bsValueFin.getFullYear();

                                console.log(this.bsValueIni.getFullYear());
                            } else {
                                data.dStart_Date = null;
                                data.dExpir_Dat = null;
                            }
                            this.AtpReportService.ProcessReportControlYear(data).subscribe(
                                res => {
                                    this.foundResults = res.genericResponse;
                                    if (this.foundResults.reportYear == 0 && this.foundResults.reportYearTotal == 0) {
                                        this.totalItems = res.totalRowNumber;
                                        if (this.foundResults.reportYear = null && this.foundResults.reportYear.length == 0)
                                            (this.foundResults.reportYearTotal = null && this.foundResults.reportYearTotal.length == 0)
                                        {
                                            this.totalItems = 0;
                                            swal.fire('Información', this.notfoundMessage, 'warning');
                                        }
                                    } else {
                                        this.excelService.generateResumenAnualPolizasVDPExcel(this.foundResults, 'ResumenAnual_VDP_');
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


