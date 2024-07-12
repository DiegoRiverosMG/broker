import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
    selector: 'app-vdp-provision-comision-consultation',
    templateUrl: './vdp-provision-comision-consultation.component.html',
    styleUrls: ['./vdp-provision-comision-consultation.component.css']
})
export class VdpProvisionComisionConsultationComponent implements OnInit {

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

    currentPage: number = 1; // Página actual
    itemsPerPage: number = 5; // Número de elementos por página
    listToShow: any[] = []; // Declaración de la variable listToShow

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
/*         setTimeout(() => {
            this.ReportMonitoreoComisionCabeceraVDP();
        }, 1000); */

    }


    //Cambio de página
    updateListToShow() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = this.currentPage * this.itemsPerPage;
        this.listToShow = this.foundResults.slice(startIndex, endIndex);
    }

    pageChanged(page: number) {
        this.currentPage = page;
        this.updateListToShow();
    }

    ReportMonitoreoComisionCabeceraVDP(data) {
        console.log("envio de fechas", data);
        
        this.AtpReportService.ReportMonitoreoComisionCabeceraVDP(data).subscribe(
            res => {
                this.foundResults = res.genericResponse;
                this.totalItems = this.foundResults.length;
                this.updateListToShow(); // Actualizar la lista a mostrar

                if (this.foundResults.length > 0) {
                    console.log("Datos tabla:", this.foundResults); // Imprimir el arreglo completo en la consola
                } else {
                    console.log("Datos tabla:", "NO SE ENCONTRARON DATOS"); // Imprimir el arreglo completo en la consola
                }

                this.isLoading = false;
            },
            error => {
                this.foundResults = [];
                this.totalItems = 0;
                this.isLoading = false;
            }
        );
    }

    //Función para descargar archivo
    getFileReportProvision(id: any , dStart_Date, dExpir_Dat) {

        
        const data={dStart_Date,dExpir_Dat}

        data.dStart_Date = this.bsValueIni.getFullYear() + "-" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueIni.getDate().toString().padStart(2, '0');
        data.dExpir_Dat = this.bsValueFin.getFullYear() + "-" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueFin.getDate().toString().padStart(2, '0');

        console.log("fecha data: " , data);
        console.log("VALOR DE ID: ", id)
        if (id != null && id != 0) {
            this.isLoading = true;
            this.AtpReportService.MonitoreoReporteProvisionComisionVDP(id).subscribe(
                res => {
                    this.foundResults = res.genericResponse;

                    console.log(res);

                    if (this.foundResults != null) {

                        this.totalItems = res.totalRowNumber;
                        if (this.totalItems > 0) {
                            if (this.foundResults.reportProvi != null && this.foundResults.reportProvi.length > 0) {
                                this.excelService.generateReportProvisionVDP(this.foundResults.reportProvi, id+'-PROVISIÓN DE COMISIÓN');
                            }
                            if (this.foundResults.reportConta != null && this.foundResults.reportConta.length > 0) {
                                this.excelService.generateReportContabilidadVDP(this.foundResults.reportConta, id+'-CONTABILIDAD DE COMISIÓN');
                            }
                            setTimeout(() => {
                                this.ReportMonitoreoComisionCabeceraVDP(data);
                            }, 1000);
                        } else {
                            swal.fire('Información', this.notfoundMessage, 'warning');
                            setTimeout(() => {
                                this.ReportMonitoreoComisionCabeceraVDP(data);
                            }, 1000);
                        }
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
    }


    //Función para procesar los reportes
    ProcessMonitoreoProviVDP() {
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
                            this.isLoading = true;
                            let data: any = {};
                           

                            if (this.bsValueIni != null && this.bsValueFin != null) {
                                data.dStart_Date = this.bsValueIni.getFullYear() + "-" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueIni.getDate().toString().padStart(2, '0');
                                data.dExpir_Dat = this.bsValueFin.getFullYear() + "-" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueFin.getDate().toString().padStart(2, '0');
                            } else {
                                data.dStart_Date = null;
                                data.dExpir_Dat = null;
                            }
                            this.ReportMonitoreoComisionCabeceraVDP(data);


                            
                }
            }
        }
    }
}
