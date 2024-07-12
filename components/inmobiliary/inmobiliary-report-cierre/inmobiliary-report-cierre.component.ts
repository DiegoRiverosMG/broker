import { Component, OnInit } from '@angular/core';
import { InmobiliaryLoadMassiveService } from '../../../services/inmobiliaryLoadMassive/inmobiliary-load-massive.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { forkJoin } from "rxjs";
import * as FileSaver from 'file-saver';
import moment from 'moment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-inmobiliary-report-cierre',
    templateUrl: './inmobiliary-report-cierre.component.html',
    styleUrls: ['./inmobiliary-report-cierre.component.css']
})

export class InmobiliaryReportCierreComponent implements OnInit {

    types: any = [];
    reportData: any = [];

    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 15;
    totalItems = 0;
    maxSize = 10;

    bsConfig: Partial<BsDatepickerConfig>;
    diaActual = moment(new Date()).toDate();
    isLoading: boolean = false;

    filters: any = {
        P_NPRODUCT: '',
        P_STARTDATE: '',
        P_ENDDATE: ''
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
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.filters.P_STARTDATE = this.diaActual;
        this.filters.P_ENDDATE = this.diaActual;
        this.filters.P_NPRODUCT = '0';
    }

    getParams = () => {
        let $0 = this.InmobiliaryLoadMassiveService.ListarTipoServicioCierre();
        return forkJoin([ $0 ]).subscribe(
            res => {
                this.types = res[0].Result.P_LIST;
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
        this.InmobiliaryLoadMassiveService.GetInmobiliairyReporteCierre(this.filters).subscribe(
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
        this.InmobiliaryLoadMassiveService.GetDataInmobiliairyReporteCierre(this.filters).subscribe(                  
            res => {
                this.isLoading = false;
                if (res.response == 0) {
                    if (res.Data != null) {
                        const file = new File(
                            [this.obtenerBlobFromBase64(res.Data, '')],
                            'Reporte_Cierre_Inmobiliarias.xlsx',
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
}