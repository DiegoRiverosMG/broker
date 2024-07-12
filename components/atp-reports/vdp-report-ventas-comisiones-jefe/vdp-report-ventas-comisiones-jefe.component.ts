import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { NonNullAssert } from '@angular/compiler';

@Component({
    selector: 'app-vdp-report-ventas-comisiones-jefe',
    templateUrl: './vdp-report-ventas-comisiones-jefe.component.html',
    styleUrls: ['./vdp-report-ventas-comisiones-jefe.component.css']
})
export class VdpReportVentasComisionesJefeComponent implements OnInit {

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
    ObtenerDatosAsesorcombo: any = [];
    asesores: any = []; // Propiedad para almacenar los datos de los asesores
    jefe: any = []; // Propiedad para almacenar los datos de los jefe
    obtenerdatos: any = [];

    cod_supervisor: string;
    documento_supervisor: string;
    supervisorVenta: string;

    cod_jefe: string;
    documento_jefe: string;
    jefeVenta: string;

    nrosPolizas: string;
    sumaPrimaRegularSoles: number = 0; // Debes asegurarte de que esta variable tenga un valor numérico
    formattedSumaPrima: string = ''; // Esta será la variable donde guardaremos la versión formateada

    selectedFrecuencia: string; // Propiedad para almacenar el valor seleccionado

    selectedJefe: any; // Propiedad para almacenar el valor seleccionado

    selectedAsesor: string; // Propiedad para almacenar el valor seleccionado

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

        /*  
        setTimeout(() => {
            this.GeneracionPlanillaPagosCabeceraVDP();
        }, 1000); */

        this.ObtenerDatos();
        this.selectedFrecuencia = this.optionsListFrecuencia[0].value;
        this.selectedJefe = '0';
        this.selectedAsesor = '0';
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

    onJefeChange() {

        let codigojefe = this.cod_jefe
        let codigosupervisor = this.selectedJefe.codigo_supervisor
        let dnisupervisor = this.selectedJefe.documento_supervisor

        if (codigosupervisor == undefined) {
            codigosupervisor = '0';
        }
        if (dnisupervisor == undefined) {
            dnisupervisor = '0';
        }
        console.log("SE ENCONTRARON DATOS SUPERVISOR", codigosupervisor)
        console.log("SE ENCONTRARON DATOS DNI SUPERVISOR", dnisupervisor)
        this.ObtenerDatosAsesor(codigosupervisor, codigojefe)
    }

    onAsesorChange() {
        console.log('Valor seleccionado asesor:', this.selectedAsesor);

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


    //ObtenerDatosSupevisor
    ObtenerDatosSupervisor(nid_jefe_x: string) {
        let data: any = {};
        data.nid_jefe = nid_jefe_x;
        this.AtpReportService.ReportJefePoliciescomboVDP(data).subscribe(
            res => {
                this.jefe = res.genericResponse; // Asigna los datos de los asesores a la propiedad asesores
                this.totalItems = this.jefe.length;

                if (this.jefe.length > 0) {

                    let nid_asesor = '0'
                    this.ObtenerDatosAsesor(nid_asesor, nid_jefe_x);

                    console.log("SE ENCONTRARON DATOS SUPERVISOR", this.jefe)

                } else {
                    console.log("NO SE ENCONTRARON DATOS DEL SUPERVISOR");
                }
                this.isLoading = false;
            },
            error => {
                this.jefe = []; // En caso de error, asigna un arreglo vacío a la propiedad asesores
                this.totalItems = 0;
                this.isLoading = false;
            }
        );
    }

    ObtenerDatosAsesor(nid_supervisor_x: string, nid_jefe_x: string) {

        let data: any = {};
        data.nid_asesor = nid_supervisor_x;
        if (nid_jefe_x == null) {
            nid_jefe_x = '0'
        }
        data.nid_jefe = nid_jefe_x;
        //ObtenerDatosAsesor
        this.AtpReportService.ReportSupervisorPoliciescomboVDP(data).subscribe(
            res => {
                this.asesores = res.genericResponse; // Asigna los datos de los asesores a la propiedad asesores
                this.totalItems = this.asesores.length;

                if (this.asesores.length > 0) {
                    console.log("SE ENCONTRARON DATOS ASESORES", this.asesores)
                } else {
                    console.log("NO SE ENCONTRARON DATOS ASESORES");
                }
                this.isLoading = false;
            },
            error => {
                this.asesores = []; // En caso de error, asigna un arreglo vacío a la propiedad asesores
                this.totalItems = 0;
                this.isLoading = false;
            }
        );

    }



    //TRAER INFORMACIÓN
    ObtenerDatos() {
        let data: any = {};
        const user = JSON.parse(localStorage.getItem('currentUser'));
        data.dni = user?.dni;

        console.log("DNI USUARIO", data.dni);

        this.AtpReportService.ReporJefePoliciesVDP(data).subscribe(
            res => {
                this.obtenerdatos = res.genericResponse;
                this.totalItems = this.obtenerdatos.length;

                if (this.obtenerdatos.length > 0) {
                    // Obtener el primer objeto dentro del array
                    const firstResult = this.obtenerdatos[0];

                    this.cod_jefe = firstResult.codigo_jefe;
                    this.documento_jefe = firstResult.documento_jefe;
                    this.jefeVenta = firstResult.jefe;
                    this.nrosPolizas = firstResult.nros_polizas;
                    this.sumaPrimaRegularSoles = firstResult.suma_prima_regular_soles;
                    this.ObtenerDatosSupervisor(this.cod_jefe); // cambiar
                    console.log(this.jefeVenta, this.nrosPolizas, this.sumaPrimaRegularSoles, this.cod_jefe, this.documento_jefe);
                    this.formattedSumaPrima = this.formatCurrency(this.sumaPrimaRegularSoles);

                } else {
                    console.log("NO SE ENCONTRARON DATOS DEL USUARIO");
                }

                this.isLoading = false;
            },
            error => {
                this.obtenerdatos = [];
                this.totalItems = 0;
                this.isLoading = false;
            }
        );
    }


    //Función para descargar archivo
    getFileReport(arrayNuevo: any[] = this.foundResults): void {

        if (arrayNuevo != null && arrayNuevo.length > 0) {
            this.excelService.generateReporteComsionesventasvigentesVDP(arrayNuevo, 'Reporte de ventas de comisiones VDP+-Perfil Jefe');

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
            let user = JSON.parse(localStorage.getItem('currentUser'));
            let dniasesor = this.selectedAsesor; // DNI ASESOR 
            let dnisupervisor = this.selectedJefe.documento_supervisor //DNI SUPERVISOR
            if (dnisupervisor == undefined) {
                dnisupervisor = '0';
            }
            if (mes == '') {
                mes = '0'
            }

            data.frec = frec;
            data.mes = mes;
            data.dni = user?.dni; //DNI DE JEFE
            data.dnisupervisor = dnisupervisor; // DNI SUPERVISOR
            data.dniasesor = dniasesor; // DNI ASESOR

            console.log("parametros", data);



            this.isLoading = true;
            //this.ObtenerDatos2();
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
                        this.supervisorVenta = firstResult.p_total_asesor_ventas;
                        this.nrosPolizas = firstResult.p_total_nros_polizas;
                        this.sumaPrimaRegularSoles = firstResult.p_total_suma_prima_regular_soles;

                        this.formattedSumaPrima = this.formatCurrency(this.sumaPrimaRegularSoles);
                        console.log("Cambiar", firstResult);

                        console.log("primer array foundResults", this.foundResults)

                    } else {
                        swal.fire('Información', "No se encontraron datos", 'warning');
                        this.jefeVenta = '';
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
        this.ObtenerDatos();
        this.selectedFrecuencia = this.optionsListFrecuencia[0].value;
        this.selectedAsesor = '0';
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        this.selectedMonthYear = `${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
        this.isLoading = false;
    }

}
