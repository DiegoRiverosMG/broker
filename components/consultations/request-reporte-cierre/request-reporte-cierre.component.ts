import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import * as FileSaver from 'file-saver';
import { ReporteCierreService } from '../../../services/report/reporte-cierre.service';

@Component({
    selector: 'app-request-reporte-cierre',
    templateUrl: './request-reporte-cierre.component.html',
    styleUrls: ['./request-reporte-cierre.component.css']
})
export class RequestReporteCierreComponent implements OnInit {

    //
    isLoading: boolean = false;
    isValidatedInClickButton: boolean = false;

    //
    filterForm: FormGroup;

    //Selects
    branchTypeList: any[] = [];

    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueFinMax: Date = new Date();
    StartDateOff = false;
    EndDateOff = false;

    //Table
    reporteCierreResults: any[] = [];

    //Tipo reporte
    nType_Report: number = 2;

    //id reporte
    idReport: string = "";

    //Paginación
    listToShow: any = [];
    currentPage = 1; // página actual
    rotate = true;
    maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 6; // limite de items por página
    totalItems: any = []; // total de items encontrados

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private requestReporteCierreService: ReporteCierreService,
        private datepipe: DatePipe
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        )
    }

    ngOnInit(): void {
        this.createForm();
        this.initializeForm();
        this.getBranchTypesList();

        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            branch: [''],
            startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
        });
    }

    //Inicializa variables
    private initializeForm(): void {
        this.filterForm.controls.branch.setValue('0');
        this.filterForm.controls.startDate.setValue(this.bsValueIni);
        this.filterForm.controls.endDate.setValue(this.bsValueFin);
        this.filterForm.setValidators([GlobalValidators.dateSort]);
    }

    cleanValidation() { }

    //Carga listado de Ramo
    private getBranchTypesList() {
        this.requestReporteCierreService.getBranchTypesList().subscribe(
            res => { this.branchTypeList = res; },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
        )
    }

    //Buscar reporte
    findReporteCierre() {
        this.isLoading = true;
        this.isValidatedInClickButton = true;
        if (this.filterForm.invalid) {
            return;
        }
        else {
            this.listToShow = [];
            this.reporteCierreResults = [];
            this.currentPage = 1; // página actual
            this.rotate = true; //
            this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
            this.itemsPerPage = 6; // limite de items por página
            this.totalItems = 0; // total de items encontrados

            const data = {
                idReport: this.idReport,
                branchId: this.filterForm.value.branch,
                startDate: this.filterForm.value.startDate,
                endDate: this.filterForm.value.endDate,
                nType_Report: this.nType_Report
            };

            this.requestReporteCierreService.getReportStatusCierre(data).subscribe(
                res => {
                    this.reporteCierreResults = res;
                    this.totalItems = this.reporteCierreResults.length;
                    this.listToShow = this.reporteCierreResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                    this.isLoading = false;
                },
                err => {
                    this.isLoading = false;
                }
            );
        }
    }

    //Función para descargar archivo
    getFileReporteCierre(IDREPORT: any) {
        console.log(IDREPORT);
        if (IDREPORT != null && IDREPORT != 0) {
            this.isLoading = true;
            this.requestReporteCierreService.getFileReporteCierre(IDREPORT.trim()).subscribe(
                //Respuesta del servicio
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                                IDREPORT.toUpperCase() + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: 'El reporte no se encuentra disponible en este momento.',
                            icon: 'error',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                    this.isLoading = false;
                },
                err => {
                    this.isLoading = false;
                }
            );
        }
    }

    //Decodifica el archivo de base64 a String en nuestro caso a Excel
    obtenerBlobFromBase64(b64Data: string, contentType: string) {
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

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.reporteCierreResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
}
