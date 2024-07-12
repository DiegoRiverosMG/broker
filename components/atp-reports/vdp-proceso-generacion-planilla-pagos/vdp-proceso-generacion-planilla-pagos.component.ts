import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { NonNullAssert } from '@angular/compiler';

@Component({
    selector: 'app-vdp-proceso-generacion-planilla-pagos',
    templateUrl: './vdp-proceso-generacion-planilla-pagos.component.html',
    styleUrls: ['./vdp-proceso-generacion-planilla-pagos.component.css']
})
export class VdpProcesoGeneracionPlanillaPagosComponent implements OnInit {

    //CheckBox
    UnselectedItemMessage: any = '';
    StartDateSelected: any = '';
    EndDateSelected: any = '';


    isError: boolean = false;

    //Pantalla de carga
    isLoading: boolean = false;
    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueFinMes: Date = new Date();
    bsValuePagoPlanilla: Date = new Date();
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

        this.bsValueFinMes = new Date(this.bsValueFinMes.getFullYear(), this.bsValueFinMes.getMonth(), this.bsValueFinMes.getDate());
        this.bsValuePagoPlanilla = new Date(this.bsValuePagoPlanilla.getFullYear(), this.bsValuePagoPlanilla.getMonth(), this.bsValuePagoPlanilla.getDate());
        this.GetCabeceraTypeProceso();
        setTimeout(() => {
            this.GeneracionPlanillaPagosCabeceraVDP();
        }, 1000);

    }

    //CAMBIO DE PAGINA DE LA TABLA
    updateListToShow() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = this.currentPage * this.itemsPerPage;
        this.listToShow = this.foundResults.slice(startIndex, endIndex);
    }

    pageChanged(page: number) {
        this.currentPage = page;
        this.updateListToShow();
    }

    //Función para descargar archivo
    getFileReport(id: any) {
        console.log("VALOR DE ID: ", id);
        if (id != null && id != 0) {
            this.isLoading = true;
            this.AtpReportService.GeneracionPlanillaPagosDetalleVDP(id).subscribe(
                res => {
                    this.foundResults = res.genericResponse;

                    if (this.foundResults != null && this.foundResults.length > 0) {
                        this.totalItems = res.totalRowNumber;
                        this.excelService.generatePlanillaPagosDetalleVDP(this.foundResults, 'PROCESO DE GENERACIÓN DE PLANILLA DE PAGOS');
                        setTimeout(() => {
                            this.GeneracionPlanillaPagosCabeceraVDP();
                        }, 1000);
                        this.GetCabeceraTypeProceso();
                        this.proceso = '1';
                    }
                    else {
                        this.totalItems = 0;
                        swal.fire('Información', this.notfoundMessage, 'warning');
                        setTimeout(() => {
                            this.GeneracionPlanillaPagosCabeceraVDP();
                        }, 1000);
                        this.GetCabeceraTypeProceso();
                        this.proceso = '1';
                    }
                    this.isLoading = false;
                },
                error => {
                    this.foundResults = [];
                    this.totalItems = 0;
                    this.isLoading = false;
                    swal.fire('Información', this.genericErrorMessage, 'error');
                    setTimeout(() => {
                        this.GeneracionPlanillaPagosCabeceraVDP();
                    }, 1000);
                    this.GetCabeceraTypeProceso();
                    this.proceso = '1';
                }
            );
        }
    }


    //CABECERA
    private GeneracionPlanillaPagosCabeceraVDP() {
        this.AtpReportService.GeneracionPlanillaPagosCabeceraVDP(0).subscribe(
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


    // CARGA CABECERA TIPO DE PROCESO 
    private GetCabeceraTypeProceso() {
        this.AtpReportService.GeneracionPlanillaPagosTypeProceso(0).subscribe(
            res => {
                this.foundResults = res.genericResponse;

                if (this.foundResults != null && this.foundResults.length > 0) {
                    this.totalItems = res.totalRowNumber;
                    // Asignar los valores al combo box
                    this.comboOptions = this.foundResults.map(item => ({
                        cod_type_proceso: item.cod_type_proceso,
                        name_type_proceso: item.name_type_proceso
                    }));
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

    ProcessReportsComisionGenerate() {

        if (this.proceso == '1') {
            //NO SE USA EN ESTE PROCESO PERO IGUAL SE ENVIA A LA API OPCIONALMENTE
            this.bsValuePagoPlanilla = new Date(this.bsValuePagoPlanilla.getFullYear(), this.bsValuePagoPlanilla.getMonth(), this.bsValuePagoPlanilla.getDate());

            this.isError = false;

            if (this.bsValueFinMes == null) {
                this.isError = true;
                this.UnselectedItemMessage = 'La fecha debe estar completa.';
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
                if ((this.bsValueFinMes != null)) {
                    if (this.bsValueFinMes != null) {
                        this.StartDateSelected = this.bsValueFinMes.getDate().toString().padStart(2, '0') + "/" + (this.bsValueFinMes.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueFinMes.getFullYear();
                    }
                    swal.fire({
                        title: "Información",
                        text: "¿Desea generar el proceso preliminar hasta la fecha " + this.StartDateSelected + "?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.value) {
                            this.isLoading = true;
                            let data: any = {};

                            if (this.bsValueFinMes != null) {
                                data.g_fecha_fin_mes = this.bsValueFinMes.getFullYear() + "-" + (this.bsValueFinMes.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueFinMes.getDate().toString().padStart(2, '0');
                                //NO SE USA EN ESTE PROCESO PERO IGUAL SE ENVIA A LA API OPCIONALMENTE
                                data.g_fecha_pago = this.bsValuePagoPlanilla.getFullYear() + "-" + (this.bsValuePagoPlanilla.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValuePagoPlanilla.getDate().toString().padStart(2, '0');
                            } else {
                                data.g_fecha_fin_mes = null;
                                //NO SE USA EN ESTE PROCESO PERO IGUAL SE ENVIA A LA API OPCIONALMENTE
                                data.g_fecha_pago = null;
                            }

                            const user = JSON.parse(localStorage.getItem('currentUser'));
                            data.nusercode = user?.id;
                            data.procesovdp = this.proceso;
                            ;
                            //console.log (data.nusercode);  //Codigo de usuario
                            //console.log (data.procesovdp);  //Codigo de proceso
                            this.AtpReportService.GeneracionPlanillaPagos(data).subscribe(
                                res => {
                                    this.isLoading = false;
                                    const error = res?.g_nerror;

                                    console.log(error)

                                    if (error == '1') {

                                        swal.fire({
                                            title: 'Cambios guardados',
                                            text: 'Los cambios se han guardado exitosamente.',
                                            icon: 'success',
                                            confirmButtonText: 'Aceptar'
                                        });

                                        setTimeout(() => {
                                            this.GeneracionPlanillaPagosCabeceraVDP();
                                        }, 1000);
                                        this.GetCabeceraTypeProceso();

                                    }
                                    else if (error == '0') {

                                        swal.fire({
                                            title: 'Información',
                                            text: 'No se ha encontrado información para procesar.',
                                            icon: 'warning',
                                            confirmButtonText: 'Aceptar'
                                        });

                                        setTimeout(() => {
                                            this.GeneracionPlanillaPagosCabeceraVDP();
                                        }, 1000);
                                        this.GetCabeceraTypeProceso();

                                    }
                                },
                                err => {
                                    swal.fire('Información', 'Ha ocurrido un error al procesar preliminar, intentalo nuevamente.', 'error');
                                    this.isLoading = false;
                                }
                            );
                        }
                    });
                }
            }

        }
        else if (this.proceso == '2') {
            //NO SE USA EN ESTE PROCESO PERO IGUAL SE ENVIA A LA API OPCIONALMENTE
            this.bsValueFinMes = new Date(this.bsValueFinMes.getFullYear(), this.bsValueFinMes.getMonth(), this.bsValueFinMes.getDate());

            this.isError = false;

            if (this.bsValuePagoPlanilla == null) {
                this.isError = true;
                this.UnselectedItemMessage = 'La fecha deben estar completa.';
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
                if ((this.bsValuePagoPlanilla != null)) {
                    if (this.bsValuePagoPlanilla != null) {
                        this.StartDateSelected = this.bsValuePagoPlanilla.getDate().toString().padStart(2, '0') + "/" + (this.bsValuePagoPlanilla.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValuePagoPlanilla.getFullYear();
                    }
                    swal.fire({
                        title: "Información",
                        text: "¿Desea generar el proceso definitivo con la fecha de pago " + this.StartDateSelected + "?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.value) {
                            this.isLoading = true;
                            let data: any = {};



                            if (this.bsValuePagoPlanilla != null) {
                                data.g_fecha_pago = this.bsValuePagoPlanilla.getFullYear() + "-" + (this.bsValuePagoPlanilla.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValuePagoPlanilla.getDate().toString().padStart(2, '0');
                                //NO SE USA EN ESTE PROCESO PERO IGUAL SE ENVIA A LA API OPCIONALMENTE
                                data.g_fecha_fin_mes = this.bsValueFinMes.getFullYear() + "-" + (this.bsValueFinMes.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueFinMes.getDate().toString().padStart(2, '0');
                            } else {
                                data.g_fecha_pago = null;
                                //NO SE USA EN ESTE PROCESO PERO IGUAL SE ENVIA A LA API OPCIONALMENTE
                                data.g_fecha_fin_mes = null;
                            }

                            const user = JSON.parse(localStorage.getItem('currentUser'));
                            data.nusercode = user?.id;
                            data.procesovdp = this.proceso;
                            ;
                            //console.log (data.nusercode);  //Codigo de usuario
                            //console.log (data.procesovdp);  //Codigo de proceso
                            this.AtpReportService.GeneracionPlanillaPagos(data).subscribe(
                                res => {
                                    this.isLoading = false;
                                    const error = res?.g_nerror;

                                    console.log(error)

                                    if (error == '1') {

                                        swal.fire({
                                            title: 'Cambios guardados',
                                            text: 'Los cambios se han guardado exitosamente.',
                                            icon: 'success',
                                            confirmButtonText: 'Aceptar'
                                        });

                                        setTimeout(() => {
                                            this.GeneracionPlanillaPagosCabeceraVDP();
                                        }, 1000);
                                        this.proceso = '1';
                                        this.GetCabeceraTypeProceso();

                                    }
                                    else if (error == '0') {

                                        swal.fire({
                                            title: 'Información',
                                            text: 'No se ha encontrado información para procesar.',
                                            icon: 'warning',
                                            confirmButtonText: 'Aceptar'
                                        });

                                        setTimeout(() => {
                                            this.GeneracionPlanillaPagosCabeceraVDP();
                                        }, 1000);
                                        this.proceso = '1';
                                        this.GetCabeceraTypeProceso();

                                    }
                                },
                                err => {
                                    swal.fire('Información', 'Ha ocurrido un error al procesar definitivo, intentalo nuevamente.', 'error');
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
