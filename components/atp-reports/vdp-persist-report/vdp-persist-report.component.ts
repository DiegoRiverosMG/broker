import { Component, Input, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CtasXcobrarService } from '../../../services/report/ctas-xcobrar.service'
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import { DatePipe } from '@angular/common';
import { ConsoleService } from '@ng-select/ng-select/lib/console.service';
import { Console } from 'console';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { holdReady } from 'jquery';

export interface FiltroBusqueda {
    nombres: string;
    mes: string;
    codigo: number;
}
export interface ConsultaBusqueda {
    DIA?: string;
    MES?: string;
    ANIO?: string;
}


@Component({
    selector: 'app-vdp-persist-report',
    templateUrl: './vdp-persist-report.component.html',
    styleUrls: ['./vdp-persist-report.component.css']
})

export class VdpPersistReportComponent implements OnInit {

    @Input() type_report: number = 1;
    UnselectedItemMessage: any = '';
    textItemMessage: any = '';
    ProcessDateSelected: any = '';
    RespMes: any = '';
    NMONTHPs: any = '';
    entrada: boolean = true;
    dissabled_type: boolean = true;
    FechaProcesar: string = '';
    isError: boolean = false;

    //Pantalla de carga
    isLoading: boolean = false;

    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueProcess: Date = new Date();
    bsValueFinMax: Date = new Date();
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();

    public totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda

    warningMessage = '';
    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';

    isValidatedInClickButton: boolean = false;

    //
    filterForm: FormGroup;

    //Selects
    branchTypeList: any[] = [];

    listaJefe: any[] = [];
    listaSupervisor: any[] = [];
    listaAsesor: any[] = [];
    listaJorge: any[] = [];

    filtroBusqueda: FiltroBusqueda[] = [];
    filtroBusquedaMes: FiltroBusqueda[] = [];
    consultaBusqueda: ConsultaBusqueda;

    FechasProcesardate: Date = new Date();

    isProcess: Number = 1;
    idJefe = 0;

    //Table
    reporteCtasXcobrarResults: any[] = [];

    constructor(
        private AtpReportService: AtpReportService,
        private excelService: ExcelService,
        private formBuilder: FormBuilder,
        private ctasXcobrarService: CtasXcobrarService,
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

    ngOnInit(): void {
        this.consultaBusqueda = {};
        this.consultaBusqueda.DIA = '';
        this.createForm();
        this.getListaJefe()
        //this.bsValueProcess = new Date(this.bsValueProcess.getFullYear(), this.bsValueProcess.getMonth(), 1);
        this.FechaProcesar == '';
        this.isProcess = 1;

    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            branch: [''],
            startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
        });
    }



    cleanValidation() { }


    // CARGA LISTA SELECCIONAR AÑO
    private getListaJefe() {
        this.AtpReportService.getListaJefe(0).subscribe(
            res => {
                this.filtroBusqueda = res.genericResponse;
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al traer la info de Año', 'error'); }
        )
    }
    // Iterar la lista MES
    getSupervisor() {

        this.AtpReportService.getListaSupervisor(Number(this.consultaBusqueda.ANIO)).subscribe(
            res => {
                this.filtroBusquedaMes = res.genericResponse;
                console.log(this.consultaBusqueda.ANIO);
            },

            err => { swal.fire('Información', 'Ha ocurrido un error al traer la info de Mes', 'error'); }
        );
    }

    getDays(month) {
        const year = new Date().getFullYear();
        const date = new Date(year, month, 0);
        return date.getDate();
    };



    changeHandler(process) {
        this.isProcess = process;
        console.log("Tipo proceso:", this.isProcess)
        if (this.isProcess == 1) {
            this.entrada = true;
            this.consultaBusqueda.MES = '';
            this.consultaBusqueda.ANIO = '';
            this.consultaBusqueda.DIA = '';
        }
        if (this.isProcess == 2) {
            this.entrada = false;
            this.consultaBusqueda.MES = '';
            this.consultaBusqueda.ANIO = '';
            this.consultaBusqueda.DIA = '';
        }

    }

    changeHandlerByType(process) {
        this.type_report = process;

        if (this.type_report == 1) {
            this.dissabled_type = true;
            this.consultaBusqueda.MES = '';
            this.consultaBusqueda.ANIO = '';
            this.consultaBusqueda.DIA = '';
        }
        else if (this.type_report == 2) {
            this.dissabled_type = false;
            this.consultaBusqueda.MES = '';
            this.consultaBusqueda.ANIO = '';
            this.consultaBusqueda.DIA = '';
        }
    }
    //Generar Reporte
    //Función para procesar los reportes
    /* CONSULTA PARA EL BOTON CONSULTAR */
    processReports() {

        if (this.type_report == 1) { //AGF 23062023 Agregando tipo de reporte por fechas

            if (this.isProcess == 1) {
                this.isError = false;
                if (this.consultaBusqueda.MES === undefined || this.consultaBusqueda.ANIO === undefined) {
                    this.isError = true;
                    this.UnselectedItemMessage = 'Los campos deben estar completos';
                    swal.fire({
                        title: 'Información',
                        text: this.UnselectedItemMessage,
                        icon: 'warning',
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false
                    })
                } else {
                    swal.fire({
                        title: "Advertencia",
                        text: "¿Está seguro que desea generar el reporte?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        //poner proceso
                        switch (this.consultaBusqueda.MES) {
                            case '01': this.NMONTHPs = "3"; break;
                            case '04': this.NMONTHPs = "6"; break;
                            case '07': this.NMONTHPs = "9"; break;
                            case '10': this.NMONTHPs = "12"; break;
                        }
                        if (result.value) {
                            this.isLoading = true;
                            let data: any = {};
                            if (this.bsValueProcess != null) {
                                this.FechasProcesardate = new Date(parseInt(this.consultaBusqueda.ANIO), (parseInt(this.consultaBusqueda.MES) - 1), 1);
                                data.dProcess_Date = this.FechasProcesardate;
                                data.mesecitos = this.NMONTHPs;
                                data.procesoss = '1';
                            }
                            this.AtpReportService.ProcessPersistReport(data).subscribe(
                                res => {
                                    this.foundResults = res.genericResponse;
                                    if (this.foundResults != null && this.foundResults.length > 0) {
                                        this.totalItems = res.totalRowNumber;
                                        this.excelService.generateReportPersist1VDPExcel(this.foundResults, 'ReportePersistenciaVDP_');
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
            /* CONSULTA PARA EL BOTON PROCESAR */
            if (this.isProcess == 2) {
                this.isError = false;
                if (this.consultaBusqueda.DIA === '' || this.consultaBusqueda.MES == null || this.consultaBusqueda.ANIO == null) {
                    this.isError = true;
                    this.UnselectedItemMessage = 'Los campos deben estar completos';
                    swal.fire({
                        title: 'Información',
                        text: this.UnselectedItemMessage,
                        icon: 'warning',
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false
                    })
                } else {
                    const diasIn = Number(this.consultaBusqueda.DIA)
                    const numeroDias = this.getDays(this.consultaBusqueda.MES)
                    //console.log(diasIn, numeroDias);
                    this.isError = false;
                    this.textItemMessage = `¿Está seguro que desea generar el reporte en la fecha ${this.consultaBusqueda.DIA + '/' + this.consultaBusqueda.MES + '/' + this.consultaBusqueda.ANIO}?`;
                    if (diasIn >= 1 && diasIn <= numeroDias) {
                        //console.log("oK")
                        swal.fire({
                            title: "Advertencia",
                            text: this.textItemMessage,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            //poner proceso
                            switch (this.consultaBusqueda.MES) {
                                case '01': this.NMONTHPs = "3"; break;
                                case '04': this.NMONTHPs = "6"; break;
                                case '07': this.NMONTHPs = "9"; break;
                                case '10': this.NMONTHPs = "12"; break;
                            }
                            if (result.value) {
                                this.isLoading = true;
                                let data: any = {};
                                if (this.bsValueProcess != null) {
                                    data.dProcess_Date = this.consultaBusqueda.ANIO + '-' + this.consultaBusqueda.MES + '-' + this.consultaBusqueda.DIA;
                                    console.log(data.dProcess_Date);
                                    //data.dProcess_Date = this.consultaBusqueda.DIA + '-' + this.consultaBusqueda.MES + '-' + this.consultaBusqueda.ANIO;

                                    this.FechasProcesardate = new Date(parseInt(this.consultaBusqueda.ANIO), (parseInt(this.consultaBusqueda.MES) - 1), (parseInt(this.consultaBusqueda.DIA)));
                                    //data.dProcess_Date = this.FechasProcesardate;
                                    const user = JSON.parse(localStorage.getItem('currentUser')); //AGF 23062023
                                    data.mesecitos = this.NMONTHPs;
                                    data.procesoss = '2';
                                    data.nuser = user?.id; //AGF 23062023

                                }

                                // INI AGF 23062023 Agregando validacion al servicio
                                this.AtpReportService.ValProcessPersistReport(data).subscribe(res => {

                                    if (res.p_COD_ERR == 1) {
                                        this.isLoading = false;
                                        let format_date = new Date(res.p_CREATEDATE);

                                        swal.fire({
                                            title: "Advertencia",
                                            text: `${res.p_MESSAGE} el día ${format_date.toLocaleDateString('es-ES')}, si continúa la información almacenada se actualizará. Deseas continuar?`,
                                            icon: "warning",
                                            showCancelButton: true,
                                            confirmButtonText: 'Aceptar',
                                            allowOutsideClick: false,
                                            cancelButtonText: 'Cancelar'
                                        }).then((result) => {

                                            if (result.value) {
                                                this.isLoading = true;
                                                this.AtpReportService.ProcessPersistReport(data).subscribe(
                                                    res => {
                                                        console.log(res);

                                                        this.foundResults = res.genericResponse;

                                                        if (this.foundResults != null && this.foundResults.length > 0) {
                                                            this.totalItems = res.totalRowNumber;
                                                            this.excelService.generateReportPersist2VDPExcel(this.foundResults, 'ReportePersistenciaVDP_');


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
                                        })


                                    }

                                    else {

                                        this.AtpReportService.ProcessPersistReport(data).subscribe(
                                            res => {

                                                this.foundResults = res.genericResponse;

                                                if (this.foundResults != null && this.foundResults.length > 0) {
                                                    this.totalItems = res.totalRowNumber;
                                                    this.excelService.generateReportPersist2VDPExcel(this.foundResults, 'ReportePersistenciaVDP_');


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

                                },
                                    error => {
                                        this.foundResults = [];
                                        this.totalItems = 0;
                                        this.isLoading = false;
                                        swal.fire('Información', this.genericErrorMessage, 'error');
                                    })
                                // Fin 23062023
                            }
                        });
                    } else {
                        //console.log("mes:", this.consultaBusqueda.MES)
                        switch (this.consultaBusqueda.MES) {
                            case '01': this.RespMes = 'Enero'; break;
                            case '02': this.RespMes = "Febrero"; break;
                            case '03': this.RespMes = "Marzo"; break;
                            case '04': this.RespMes = "Abril"; break;
                            case '05': this.RespMes = "Mayo"; break;
                            case '06': this.RespMes = "Junio"; break;
                            case '07': this.RespMes = "Julio"; break;
                            case '08': this.RespMes = "Agosto"; break;
                            case '09': this.RespMes = "Septiembre"; break;
                            case '10': this.RespMes = "Octubre"; break;
                            case '11': this.RespMes = "Noviembre"; break;
                            case '12': this.RespMes = "Diciembre"; break;
                            default: err => { swal.fire('Información', 'Ha ocurrido un error ', 'error'); }; break;
                        }
                        this.isError = true;
                        this.UnselectedItemMessage = ` El mes de ${this.RespMes} tiene de 1 a ${numeroDias} días.`;
                        if (this.isError == true) {
                            swal.fire({
                                title: 'Información',
                                text: this.UnselectedItemMessage,
                                icon: 'warning',
                                confirmButtonText: 'Continuar',
                                allowOutsideClick: false
                            }).then((result) => {
                                this.consultaBusqueda.DIA = ''
                                //console.log(result);
                            });
                        }
                    }

                }
            }
        }

        else if (this.type_report == 2) {

            this.isError = false;

            if (this.bsValueIni === null || this.bsValueFin == null) {
                this.isError = true;
                this.UnselectedItemMessage = 'Los campos deben estar completos';
                swal.fire({
                    title: 'Información',
                    text: this.UnselectedItemMessage,
                    icon: 'warning',
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false
                })
            } else {
                swal.fire({
                    title: "Advertencia",
                    text: "¿Está seguro que desea generar el reporte?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {

                    if (result.value) {
                        this.isLoading = true;
                        let data: any = {};

                        const user = JSON.parse(localStorage.getItem('currentUser'));
                        data.date_proces = this.bsValueIni;
                        data.init_date = this.bsValueIni;
                        data.fin_date = this.bsValueFin;
                        data.ncode = user.id;


                        this.AtpReportService.ProcessPersistReportByDate(data).subscribe(
                            res => {

                                this.foundResults = res.genericResponse;

                                if (this.foundResults != null && this.foundResults.length > 0) {
                                    this.totalItems = res.totalRowNumber;
                                    console.log(this.foundResults);
                                    this.excelService.generateReportPersistByDateVDPExcel(this.foundResults, 'ReportePersistenciaVDP_');
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

        } //AGF 23062023 Agregando tipo de reporte por fechas


    }
}