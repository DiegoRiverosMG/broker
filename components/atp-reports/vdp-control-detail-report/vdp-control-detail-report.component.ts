import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { parse } from 'path';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { ResultadoComponent } from '../../resultado/resultado.component';

@Component({
    selector: 'app-vdp-control-detail-report.component',
    templateUrl: './vdp-control-detail-report.component.html',
    styleUrls: ['./vdp-control-detail-report.component.css']
})
export class VdpControlDetailReportComponent implements OnInit {

    //CheckBox
    UnselectedItemMessage: any = '';
    nPolicy: any = '';


    isError: boolean = false;

    //Pantalla de carga
    isLoading: boolean = false;

    public totalItems = 0; //total de items encontrados

    public resultado = 0;

    public foundResults: any;  //Lista de registros encontrados durante la búsqueda

    warningMessage = '';
    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';

    //Formato de la fecha
    constructor(
        private atpReportService: AtpReportService,
        private excelService: ExcelService

    ) {
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        this.nPolicy == '';
    }
    //Función para procesar los reportes
    ReportRegistryPoliciesDetail() {
        this.isError = false;
        if (this.nPolicy == '') {
            this.isError = true;
            this.UnselectedItemMessage = 'El número de póliza debe estar completado.';
            swal.fire('Advertencia', this.UnselectedItemMessage, 'error');
        } else {
            this.isError = false;
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
                    data.nPolicy = parseFloat(this.nPolicy);
                    debugger;
                    this.atpReportService.ReportRegistryPoliciesDetail(data).subscribe(

                        res => {
                            //debugger;
                            this.foundResults = res.genericResponse;
                            if (this.foundResults.reportPoliciesDetail == 0 && this.foundResults.ReportPoliciesDetailTotal == 0) {
                                this.totalItems = res.totalRowNumber;
                                if (this.foundResults.reportPoliciesDetail = null && this.foundResults.reportPoliciesDetail.length == 0)
                                    (this.foundResults.reportPoliciesDetailTotal = null && this.foundResults.reportPoliciesDetailTotal.length == 0)
                                {
                                    this.totalItems = 0;
                                    swal.fire('Información', this.notfoundMessage, 'warning');
                                }
                            } else {
                                this.excelService.generateReportControlDetailVDPExcel(this.foundResults, 'ReportePólizasDetalle_VDP_');
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


