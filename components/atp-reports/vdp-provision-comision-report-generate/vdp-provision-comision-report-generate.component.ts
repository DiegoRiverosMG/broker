import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
    selector: 'app-vdp-provision-comision-report-generate',
    templateUrl: './vdp-provision-comision-report-generate.component.html',
    styleUrls: ['./vdp-provision-comision-report-generate.component.css']
})
export class VdpProvisionComisionReportGenerateComponent implements OnInit {

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
    proceso: string = '1';
    comboOptions: any[] = [];
    selectedProceso: number;
    isLoadingCabecera: boolean = true;
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

    onProcesoChange(selectedValue: string) {
        // Actualizar el valor seleccionado en tiempo real
        this.proceso = selectedValue;
        console.log(this.proceso)
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        this.GetFechas();
        this.GetCabeceraTypeProceso();
        setTimeout(() => {
            this.GetCabeceraPreeliminar();
        }, 1000);

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

    // CARGA LISTA SELECCIONAR AÑO
    private GetFechas() {
        this.AtpReportService.GetConfigurationComisionVDP(0).subscribe(
            res => {
                const fechas = res.genericResponse[0];
                if (fechas) {
                    const fechaIniParts = fechas.fecha_ini.split('/');
                    const fechaFinParts = fechas.fecha_fin.split('/');

                    const fechaInicio = new Date(parseInt(fechaIniParts[2]), parseInt(fechaIniParts[1]) - 1, parseInt(fechaIniParts[0]));
                    const fechaFin = new Date(parseInt(fechaFinParts[2]), parseInt(fechaFinParts[1]) - 1, parseInt(fechaFinParts[0]));

                    // Hacer algo con las fechas de inicio y fin
                    //console.log("Fecha de inicio:", fechaInicio);
                    //console.log("Fecha de fin:", fechaFin);

                    this.bsValueIni = fechaInicio;
                    this.bsValueFin = fechaFin;



                } else {
                    //console.log("No se encontraron fechas en el genericResponse");
                    this.bsValueIni = null; // Asignar fecha de inicio vacía
                    this.bsValueFin = null; // Asignar fecha de fin vacía

                }
            },
            err => {
                swal.fire('Información', 'Ha ocurrido un error al traer la info de fechas', 'error');
            }
        )
    }


    private GetCabeceraPreeliminar() {
        this.AtpReportService.CabeceraPreeliminar(0).subscribe(
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


    // CARGA CABECERA TIPO DE PROCESO GENERACION DEL REPORTE DE COMISION 
    private GetCabeceraTypeProceso() {
        this.AtpReportService.GetCabeceraTypeProceso(0).subscribe(
            res => {
                this.foundResults = res.genericResponse;

                if (this.foundResults != null && this.foundResults.length > 0) {
                    this.totalItems = res.totalRowNumber;
                    //console.log("Datos tipo de proceso:", this.foundResults);

                    // Asignar los valores al combo box
                    this.comboOptions = this.foundResults.map(item => ({
                        cod_type_proceso: item.cod_type_proceso,
                        name_type_proceso: item.name_type_proceso
                    }));

                    //console.log("Datos tipo de proceso:", this.comboOptions);

                    // Asignar el primer valor por defecto
                    this.selectedProceso = this.comboOptions[0].cod_type_proceso;
                }
                else {
                    this.totalItems = 0;
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


    //Función para procesar los reportes
    ProcessReportsComisionGenerate() {
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
                        title: "Información",
                        text: "¿El reporte de provisión de comisiones se generará con el rango de fechas del " + this.StartDateSelected + " al " + this.EndDateSelected + " ?",
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
                                data.dStart_Date = this.bsValueIni.getFullYear() + "-" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueIni.getDate().toString().padStart(2, '0');
                                data.dExpir_Dat = this.bsValueFin.getFullYear() + "-" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueFin.getDate().toString().padStart(2, '0');
                            } else {
                                data.dStart_Date = null;
                                data.dExpir_Dat = null;
                            }


                            const user = JSON.parse(localStorage.getItem('currentUser'));
                            data.nusercode = user?.id;
                            data.procesovdp = this.proceso;
                            ;
                            //console.log (data.nusercode); -- Codigo de usuario


                            this.AtpReportService.ValidarComisionVDP(data).subscribe(
                                res => {
                                    this.isLoading = false;
                                    const error = res.genericResponse[0];
                                    if (error) {
                                        const nerror = error.error;
                                        const nerror2 = error.error2;

                                        console.log("VALIDACIÓN ERROR 1 = ", nerror2);
                                        console.log("VALIDACIÓN ERROR 2 Y 3 = ", nerror);

                                        // PROCESO NUMERO 1 PREMILIMAR
                                        if (this.proceso == '1') {

                                            if (nerror == 1 || nerror2 == 1) {
                                                console.log("ENTRO:", nerror2);

                                                swal.fire({
                                                    title: "Validación de Provisión de la comisión",
                                                    text: "Se han encontrado los siguientes errores.",
                                                    icon: "warning",
                                                    confirmButtonText: 'Descargar Errores',
                                                    allowOutsideClick: false
                                                }).then((result) => {
                                                    if (result.value) {
                                                        // Realizar la acción de descarga de errores
                                                        //console.log("Descargar errores");

                                                        this.AtpReportService.TablaErroresComisionVDP(data).subscribe(
                                                            res => {
                                                                this.foundResults = res.genericResponse;

                                                                if (this.foundResults != null && this.foundResults.length > 0) {
                                                                    this.totalItems = res.totalRowNumber;
                                                                    this.excelService.generateReportErroresComisionVDP(this.foundResults, 'Errores_export_');
                                                                    this.GetCabeceraTypeProceso();
                                                                    setTimeout(() => {
                                                                        this.GetCabeceraPreeliminar();
                                                                    }, 1000);

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

                                                    } else {
                                                        // Lógica cuando se cancela la descarga de errores
                                                        //console.log("Canceló la descarga de errores");
                                                        this.GetCabeceraTypeProceso();
                                                        setTimeout(() => {
                                                            this.GetCabeceraPreeliminar();
                                                        }, 1000);

                                                    }
                                                });
                                            } else {
                                                this.GetCabeceraTypeProceso();
                                                setTimeout(() => {
                                                    this.GetCabeceraPreeliminar();
                                                }, 1000);
                                            }
                                        } else {

                                            // PROCESO NUMERO 2 DEFINITIVO
                                            if (this.proceso == '2') {
                                                console.log("PROCESO NUMERO 2 DEFINITIVO CORRIENDO")
                                                this.proceso = '1';
                                                this.GetFechas();
                                                this.GetCabeceraTypeProceso();
                                                setTimeout(() => {
                                                    this.GetCabeceraPreeliminar();
                                                }, 1000);
                                            }


                                        }
                                    } else {
                                        console.log("No se encontraron fechas en el genericResponse");
                                    }
                                },
                                err => {
                                    swal.fire('Información', 'Ha ocurrido un error al validar las comisiones', 'error');
                                    this.isLoading = false;
                                }
                            );
                        }
                    });
                }
            }
        }

    }
}
