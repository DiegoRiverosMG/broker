import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
    selector: 'app-atp-report',
    templateUrl: './vdp-ContaComision-report.component.html',
    styleUrls: ['./vdp-ContaComision-report.component.css']
})
export class VdpContaComisionReportComponent implements OnInit {

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
    ReportContaComisionVDP() {


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
            swal.fire({
                title: "Advertencia",
                text: "¿Está seguro que desea generar el reporte de contabilidad Comisión VDP?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.isLoading = true;
                    let data: any = {};
                    this.AtpReportService.ReportContaComisionVDP(data).subscribe(
                        res => {
                            this.foundResults = res.genericResponse;

                            if (this.foundResults != null && this.foundResults.length > 0) {
                                this.totalItems = res.totalRowNumber;
                                this.excelService.generateReportContaComisionVDPExcel(this.foundResults, 'ReporteContabilidadComisión -');
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
