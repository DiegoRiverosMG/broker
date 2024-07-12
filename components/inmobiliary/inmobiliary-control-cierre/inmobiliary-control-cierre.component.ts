import { Component, OnInit } from '@angular/core';
import { InmobiliaryLoadMassiveService } from '../../../services/inmobiliaryLoadMassive/inmobiliary-load-massive.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { forkJoin } from "rxjs";
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-inmobiliary-control-cierre',
    templateUrl: './inmobiliary-control-cierre.component.html',
    styleUrls: ['./inmobiliary-control-cierre.component.css']
})

export class InmobiliaryControlCierreComponent implements OnInit {

    docs: any = [];
    porVencer: any = [];
    estadosBills: any = [];
    reportData: any = [];

    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 15;
    totalItems = 0;
    maxSize = 10;

    bsConfig: Partial<BsDatepickerConfig>;
    isLoading: boolean = false;

    filters: any = {
        P_NTYPCLIENTDOC: '',
        P_SCLINUMDOCU: '',
        P_SCOD_INTERNO: '',
        P_NBILLSTAT: '',
        P_STARTDATE: '',
        P_ENDDATE: '',
        P_NPOR_VENCER: ''
    };

    constructor(
        private InmobiliaryLoadMassiveService: InmobiliaryLoadMassiveService
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
        this.getParams();
        this.initParams();
    }

    initParams = () => {
        this.filters.P_NTYPCLIENTDOC = '0';
        this.filters.P_NBILLSTAT = '0';
        this.filters.P_NPOR_VENCER = '6';
    }

    getParams = () => {
        let $0 = this.InmobiliaryLoadMassiveService.ListarDocumentosCierre();
        let $1 = this.InmobiliaryLoadMassiveService.ListarPorVencerCierre();
        let $2 = this.InmobiliaryLoadMassiveService.ListarEstadosBillsCierre();
        return forkJoin([ $0, $1, $2 ]).subscribe(
            res => {
                this.docs = res[0].Result.P_LIST;
                this.porVencer = res[1].Result.P_LIST;
                this.estadosBills = res[2].Result.P_LIST;
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
            }
        );    
    }

    getReport = () => {
        this.isLoading = true;
        if (this.filters.P_STARTDATE && !this.filters.P_ENDDATE) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de fin es requerida.', 'warning');
            return;
        }
        if (!this.filters.P_STARTDATE && this.filters.P_ENDDATE) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de inicio es requerida.', 'warning');
            return;
        }
        if (new Date(this.filters.P_STARTDATE) > new Date(this.filters.P_ENDDATE)) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de inicio no puede ser mayor a la fecha de fin.', 'warning');
            return;
        }
        this.InmobiliaryLoadMassiveService.GetInmobiliairyCierreReport(this.filters).subscribe(
            res => {
                this.isLoading = false;
                if (res.Result.P_NCODE == 0) {
                    this.currentPage = 1;
                    this.reportData = res.Result.P_LIST;
                    this.totalItems = this.reportData.length;
                    this.listToShow = this.reportData.slice(
                        (this.currentPage - 1) * this.itemsPerPage,
                        this.currentPage * this.itemsPerPage
                    );
                    if (this.reportData.length == 0) {
                        Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                    }
                } else {
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                this.isLoading = false;
                Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
            }
        )
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.reportData.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    exportReport = () => {
        this.isLoading = true;
        if (this.filters.P_STARTDATE && !this.filters.P_ENDDATE) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de fin es requerida.', 'warning');
            return;
        }
        if (!this.filters.P_STARTDATE && this.filters.P_ENDDATE) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de inicio es requerida.', 'warning');
            return;
        }
        if (new Date(this.filters.P_STARTDATE) > new Date(this.filters.P_ENDDATE)) {
            this.isLoading = false;
            Swal.fire('Información', 'La fecha de inicio no puede ser mayor a la fecha de fin.', 'warning');
            return;
        }
        this.InmobiliaryLoadMassiveService.GetDataReportInmobiliariasControlSeguimiento(this.filters).subscribe(                  
            res => {
                this.isLoading = false;
                if (res.response == 0) {
                    if (res.Data != null) {
                        const file = new File(
                            [this.obtenerBlobFromBase64(res.Data, '')],
                            'Reporte_Seguimiento_Control_Inmobiliarias.xlsx',
                            { type: 'text/xls' }
                        );
                        FileSaver.saveAs(file);  
                    }                                    
                }                
            },
            err => {
                this.isLoading = false;
                Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
            }            
        )
    }

    obtenerBlobFromBase64 = (b64Data: string, contentType: string) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);            
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    selDate = () => {
        this.filters.P_NPOR_VENCER = '0';
    }

    selMonth = () => {
        this.filters.P_STARTDATE = '';
        this.filters.P_ENDDATE = '';
    }
}