import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
    selector: 'app-vdp-reporte-asesores-ventas-vigentes',
    templateUrl: './vdp-reporte-asesores-ventas-vigentes.component.html',
    styleUrls: ['./vdp-reporte-asesores-ventas-vigentes.component.css']
})
export class VdpReporteAsesoresVentasVigentesComponent implements OnInit {

    //CheckBox
    UnselectedItemMessage: any = '';
    StartDateSelected: any = '';
    EndDateSelected: any = '';


    isError: boolean = false;

    //Pantalla de carga
    isLoading: boolean = false;
    bsConfig: Partial<BsDatepickerConfig>;

    // data: ReportAtpSearch = new ReportAtpSearch();
    datosCombo: any[] = [];
    selectedOption: number | null;
    selectedSupervisor: number | null;
    supervisores: any[] = [];

    public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
    public totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';

    //Formato de la fecha
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
        this.selectedOption = null;
        this.selectedSupervisor = null;
        this.getDataForComboBox();
    }

    exportToExcel() {
        if (this.foundResults != null && this.foundResults.length > 0)
            this.excelService.generateReportControlVDPExcel(this.foundResults, 'Reporte_Polizas_VDP_');
        else
            swal.fire('Información', 'No hay datos para exportar a excel.', 'error');
    }

    onOptionSelected() {
        console.log('Opción seleccionada Jefe:', this.selectedOption);
        this.getSupervisoresPorJefe(this.selectedOption);
        console.log('Código del Supervisor seleccionado:', this.selectedSupervisor);
    }

    getDataForComboBox(): void {
        this.AtpReportService.ObtenerDatosJefeVentas(1).subscribe(
            (data) => {
                this.datosCombo = data.genericResponse;
            },
            (error) => {
                console.error('Error al obtener los datos:', error);
            }
        );
    }

    getSupervisoresPorJefe(codigoJefe: number) {

        this.AtpReportService.ObtenerDatosSupervisor(codigoJefe).subscribe(
            (data) => {
                this.supervisores = data.genericResponse;
            },
            (error) => {
                console.error('Error al obtener los supervisores:', error);
            }
        );

    }

    generarReporte() {

        if (this.selectedOption === null &&  this.selectedSupervisor === null) {
            swal.fire('Advertencia', 'Por favor, complete los campos de jefe y supervisor.', 'warning');
            return; // Detener la ejecución si faltan datos
        }
        if (this.selectedOption === null ) {
            swal.fire('Advertencia', 'Por favor, complete los campos de jefe.', 'warning');
            return; // Detener la ejecución si faltan datos
        }
        if (this.selectedSupervisor === null) {
            swal.fire('Advertencia', 'Por favor, complete los campos de supervisor.', 'warning');
            return; // Detener la ejecución si faltan datos
        }
    
        swal.fire({
            title: 'Advertencia',
            text: '¿Está seguro que desea generar el reporte con los datos seleccionados?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
    
                // Obtener los códigos de jefe y supervisor
                const codigoJefe = this.selectedOption;
                const codigoSupervisor = this.selectedSupervisor;
    
                // Llamar al servicio para generar el reporte en el backend
                this.AtpReportService.ReportAsesoresVentasVigentesVDP({ codigo_jefe: codigoJefe, codigo_supervisor: codigoSupervisor }).subscribe(
                    res => {
                        this.foundResults = res.genericResponse;

                        //console.log("RESULTADO: ", res.genericResponse);
    
                        if (this.foundResults != null && this.foundResults.length > 0) {
                            this.totalItems = this.foundResults.length;
                            this.excelService.generateReportAsesoresVentasVigentesVDP(this.foundResults, '-AsesoresDeVentasVigentes');
                            //console.log('REPORTE DESCARGANDO');
                        } else {
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
