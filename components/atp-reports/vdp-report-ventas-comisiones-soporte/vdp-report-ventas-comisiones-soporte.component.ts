import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { NonNullAssert } from '@angular/compiler';

@Component({
    selector: 'app-vdp-report-ventas-comisiones-soporte',
    templateUrl: './vdp-report-ventas-comisiones-soporte.component.html',
    styleUrls: ['./vdp-report-ventas-comisiones-soporte.component.css']
})
export class VdpReportVentasComisionesSoporteComponent implements OnInit {

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
    currentPage: number = 1; // Página actual
    itemsPerPage: number = 5; // Número de elementos por página
    listToShow: any[] = []; // Declaración de la variable listToShow

    /* Nombres de los perfiles */
    jefe: any = []; // Propiedad para almacenar los datos de los jefe
    ObtenerDatosJefecombo: any = [];
    selectedJefe: any; // Propiedad para almacenar el valor seleccionado
    codigoJefe: string = '0'; // codigo del jefe
    documento_jefe: string = '0';


    supervisores: any = []; // Propiedad para almacenar los datos de los asesores
    ObtenerDatosSupervisorcombo: any = [];
    selectedSupervisor: any; // Propiedad para almacenar el valor seleccionado
    codigoSupervisor: string = '0';
    documento_supervisor: string = '0';


    asesores: any = []; // Propiedad para almacenar los datos de los asesores
    ObtenerDatosAsesorcombo: any = [];
    selectedAsesor: any; // Propiedad para almacenar el valor seleccionado
    codigoAsesor: string = '0';
    documento_asesor: string = '0';







    obtenerdatos: any = [];



    nrosPolizas: string = '';
    sumaPrimaRegularSoles: number = 0; // Debes asegurarte de que esta variable tenga un valor numérico
    formattedSumaPrima: string = ''; // Esta será la variable donde guardaremos la versión formateada
    selectedFrecuencia: string; // Propiedad para almacenar el valor seleccionado
    optionsListFrecuencia = [
        { value: '0', label: 'Todos' },
        { value: '5', label: 'Mensual' },
        { value: '3', label: 'Trimestral' },
        { value: '2', label: 'Semestral' },
        { value: '1', label: 'Anual' }
    ];

    selectedMonthYear: string;
    isDisabled: boolean = false;
    invalidFormat: boolean = false;

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
        this.selectedJefe = '0';
        this.codigoJefe = '0';
        this.ObtenerDatosJefe();
        this.selectedSupervisor = '0';
        this.selectedAsesor = '0';
        this.selectedFrecuencia = this.optionsListFrecuencia[0].value;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        this.selectedMonthYear = `${currentMonth.toString().padStart(2, '0')}/${currentYear}`;

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

    // Función que se ejecuta cuando cambia la selección en el combo box
    onFrecuenciaChange() {
        console.log('Valor seleccionado:', this.selectedFrecuencia);
    }


    onDisabledChange() {
        if (this.isDisabled) {
            this.selectedMonthYear = ''; // Limpiar el valor si se deshabilita
            this.invalidFormat = false; // Reiniciar el mensaje de error
        }
        else {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            this.selectedMonthYear = `${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
        }
    }

    validateMonthYearFormat() {
        if (!this.isDisabled && this.selectedMonthYear) {
            const regex = /^(0[1-9]|1[0-2])\/\d{4}$/; // Validar formato MM/YYYY
            if (!regex.test(this.selectedMonthYear)) {
                this.invalidFormat = true;
            } else {
                this.invalidFormat = false;
            }
        } else {
            this.invalidFormat = false; // Reiniciar el mensaje de error si no hay valor
        }
    }

    formatCurrency(amount: number): string {
        //console.log("MONTO",amount);
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    }



    //ObtenerDatosJefe
    ObtenerDatosJefe() {
        let data: any = {};
        this.AtpReportService.ReportSoporteJefecomboVDP(0).subscribe(
            res => {
                this.ObtenerDatosJefecombo = res.genericResponse; // Asigna los datos de los asesores a la propiedad asesores
                this.totalItems = this.jefe.length;

                if (this.ObtenerDatosJefecombo.length > 0) {

                    console.log("COMBOBOX-JEFE", this.ObtenerDatosJefecombo);
                    this.ObtenerDatosSupervisor(this.codigoJefe);
                } else {
                }
                this.isLoading = false;
            },
            error => {
                this.ObtenerDatosJefecombo = []; // En caso de error, asigna un arreglo vacío a la propiedad asesores
                this.totalItems = 0;
                this.isLoading = false;
            }
        );
    }

    onJefeChange() {
        // Verifica si se ha seleccionado un "Jefe"
        if (this.selectedJefe !== null && this.selectedJefe !== undefined) {
            if (this.selectedJefe == '0') {
                this.codigoJefe = '0';
                console.log("Se seleccionó 'Todos' en el combobox de Jefe", "valor:", this.codigoJefe);
                this.ObtenerDatosSupervisor(this.codigoJefe);
                this.selectedSupervisor = '0';
                this.selectedAsesor = '0';
                //documentos
                this.documento_jefe = '0';
                this.documento_supervisor = '0';
                this.documento_asesor = '0';
            } else {
                const jefeSeleccionado = this.ObtenerDatosJefecombo.find(jefe => jefe.codigo_jefe === this.selectedJefe);
                if (jefeSeleccionado) {
                    const nombreJefe = jefeSeleccionado.nombres_jefe;
                    this.codigoJefe = jefeSeleccionado.codigo_jefe;
                    this.documento_jefe = jefeSeleccionado.documento_jefe;
                    console.log("Jefe seleccionado:", nombreJefe, "Codigo Jefe seleccionado:", this.codigoJefe, "DNI Jefe:", this.documento_jefe);
                    this.ObtenerDatosSupervisor(this.codigoJefe);
                    this.selectedSupervisor = '0';
                    this.selectedAsesor = '0';
                    this.documento_supervisor = '0';
                    this.documento_asesor = '0';
                }
            }
        }
    }


    //ObtenerDatosSupervisor
    ObtenerDatosSupervisor(codigojefex: string,) {
        let data: any = {};
        data.nid_jefe = codigojefex
        this.AtpReportService.ReportSoporteSupervisorcomboVDP(data).subscribe(
            res => {
                this.ObtenerDatosSupervisorcombo = res.genericResponse;
                this.totalItems = this.supervisores.length;

                if (this.ObtenerDatosSupervisorcombo.length > 0) {

                    console.log("COMBOBOX-SUPERVISOR", this.ObtenerDatosSupervisorcombo);
                    this.ObtenerDatosAsesor(this.codigoJefe, this.codigoSupervisor);
                } else {
                }
                this.isLoading = false;
            },
            error => {
                this.ObtenerDatosSupervisorcombo = []; // En caso de error, asigna un arreglo vacío a la propiedad asesores
                this.totalItems = 0;
                this.isLoading = false;
            }
        );
    }

    onSupervisorChange() {
        // Verifica si se ha seleccionado un "Supervisor"
        if (this.selectedSupervisor !== null && this.selectedSupervisor !== undefined) {
            if (this.selectedSupervisor == '0') {
                this.codigoSupervisor = '0';
                console.log("Se seleccionó 'Todos' en el combobox de Supervisor", "valor:", this.codigoSupervisor);
                this.ObtenerDatosAsesor(this.codigoJefe, this.codigoSupervisor);
                this.selectedAsesor = '0';
                this.documento_supervisor = '0';
                this.documento_asesor = '0';
            } else {
                const supervisorSeleccionado = this.ObtenerDatosSupervisorcombo.find(supervisor => supervisor.codigo_supervisor === this.selectedSupervisor);
                if (supervisorSeleccionado) {
                    const nombreSupervisor = supervisorSeleccionado.nombres_supervisor;
                    this.codigoSupervisor = supervisorSeleccionado.codigo_supervisor;
                    this.documento_supervisor = supervisorSeleccionado.documento_supervisor;
                    console.log("Supervisor seleccionado:", nombreSupervisor, "Codigo Supervisor seleccionado:", this.codigoSupervisor, "DNI Supervisor:", this.documento_supervisor);
                    this.ObtenerDatosAsesor(this.codigoJefe, this.codigoSupervisor);
                    this.selectedAsesor = '0';
                    this.documento_asesor = '0';
                }
            }
        }
    }


    //ObtenerDatosAsesor
    ObtenerDatosAsesor(codigojefex: string, codigosupervisorx: string,) {
        let data: any = {};
        data.nid_jefe = codigojefex
        data.nid_supervisor = codigosupervisorx

        this.AtpReportService.ReportSoporteAsesorcomboVDP(data).subscribe(
            res => {
                this.ObtenerDatosAsesorcombo = res.genericResponse;
                this.totalItems = this.asesores.length;

                if (this.ObtenerDatosAsesorcombo.length > 0) {

                    console.log("COMBOBOX-ASESOR", this.ObtenerDatosAsesorcombo);
                } else {
                }
                this.isLoading = false;
            },
            error => {
                this.ObtenerDatosAsesorcombo = []; // En caso de error, asigna un arreglo vacío a la propiedad asesores
                this.totalItems = 0;
                this.isLoading = false;
            }
        );
    }


    onAsesorChange() {
        // Verifica si se ha seleccionado un "Asesor"
        if (this.selectedAsesor !== null && this.selectedAsesor !== undefined) {
            if (this.selectedAsesor == '0') {
                this.codigoAsesor = '0';
                this.documento_asesor = '0';
                console.log("Se seleccionó 'Todos' en el combobox de Asesor", "valor:", this.codigoAsesor);
            } else {
                const AsesorSeleccionado = this.ObtenerDatosSupervisorcombo.find(asesor => asesor.codigo_asesor === this.selectedAsesor);
                if (AsesorSeleccionado) {
                    const nombreAsesor = AsesorSeleccionado.nombres_asesor;
                    this.codigoAsesor = AsesorSeleccionado.codigo_asesor;
                    this.documento_asesor = AsesorSeleccionado.documento_asesor;
                    console.log("Asesor seleccionado:", nombreAsesor, "Codigo Asesor seleccionado:", this.codigoAsesor, "DNI Asesor:", this.documento_asesor);
                }
            }
        }
    }




    //Función para descargar archivo
    getFileReport(arrayNuevo: any[] = this.foundResults): void {

        if (arrayNuevo != null && arrayNuevo.length > 0) {
            this.excelService.generateReporteComsionesventasvigentesVDP(arrayNuevo, 'Reporte de ventas de comisiones VDP+-Perfil Soporte');

        } else {
            swal.fire('Información', "No se encontraron datos", 'warning');
        }

    }

    ProcessReportsComisionGenerate() {

        if (this.invalidFormat == true) {

            swal.fire('Información', "Formato de mes no valido", 'error');
        }
        else {

            this.foundResults = [];
            let data: any = {};

            let frec = this.selectedFrecuencia;
            let mes = this.selectedMonthYear;

            if (mes == '') {
                mes = '0'
            }
            data.frec = frec;
            data.mes = mes;
            data.dni = this.documento_jefe; //DNI DE JEFE
            data.dnisupervisor = this.documento_supervisor; // DNI SUPERVISOR
            data.dniasesor = this.documento_asesor; // DNI ASESOR

            console.log("parametros para ejecutar buscar", data);

            this.isLoading = true;
            this.AtpReportService.ReportVentasVigentesPerfilVDPJefe(data).subscribe(
                res => {
                    console.log("res", res)
                    this.foundResults = res.genericResponse.map((result: any) => {
                        result.hasChanges = false;
                        return result;
                    });

                    if (this.foundResults.length > 0) {
                        this.isLoading = true;
                        this.totalItems = this.foundResults.length;
                        this.updateListToShow(); // Actualizar la lista a mostrar
                        console.log("Datos tabla:", this.foundResults); // Imprimir el arreglo completo en la consola

                        const firstResult = this.foundResults[0];
                        this.nrosPolizas = firstResult.p_total_nros_polizas;
                        this.sumaPrimaRegularSoles = firstResult.p_total_suma_prima_regular_soles;
                        this.formattedSumaPrima = this.formatCurrency(this.sumaPrimaRegularSoles);
                        console.log("Cambiar", firstResult);

                        console.log("primer array foundResults", this.foundResults)

                    } else {
                        swal.fire('Información', "No se encontraron datos", 'warning');
                        this.nrosPolizas = '';
                        this.formattedSumaPrima = '';
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
    }

    limpiar() {
        this.isLoading = true;
        this.isDisabled = false;
        this.foundResults = [];
        this.selectedFrecuencia = this.optionsListFrecuencia[0].value;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        this.selectedMonthYear = `${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
        //limpiar todos los datos
        this.selectedJefe = '0';
        this.selectedSupervisor = '0';
        this.selectedAsesor = '0';
        this.documento_jefe = '0';
        this.documento_supervisor = '0';
        this.documento_asesor = '0';
        this.codigoJefe = '0';
        this.codigoSupervisor = '0';
        this.codigoAsesor = '0';
        this.nrosPolizas = '';
        this.sumaPrimaRegularSoles = 0;
        this.formattedSumaPrima = '';
        this.isLoading = false;
    }

}
