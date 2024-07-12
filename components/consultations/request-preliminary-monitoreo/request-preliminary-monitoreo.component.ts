import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PreliminaryReportService } from '../../../services/report/preliminary-report.service';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import { DatePipe } from '@angular/common';
import * as FileSaver from 'file-saver';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-request-preliminary-monitoreo',
  templateUrl: './request-preliminary-monitoreo.component.html',
  styleUrls: ['./request-preliminary-monitoreo.component.css']
})

export class RequestPreliminaryMonitoreoComponent implements OnInit {

    isLoading: boolean = false;
    isValidatedInClickButton: boolean = false;
    filterForm: FormGroup;

    // selects
    branchTypeList: any[] = [];//ramo

    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date(new Date().setDate(ModuleConfig.StartDate.getDate() - 15));
    bsValueFin: Date = ModuleConfig.EndDate;

    //txtidcabecera
    public isIdCabecera:any = 0;
    SelectedValue: any = '';

    // table
    preliminaryResults: any[] = [];

    //Tipo preliminar
    nType_Preliminary:number = 1;

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
        private preliminaryService: PreliminaryReportService,
        private date: DatePipe
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
        this.getBranchTypesList()
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            branch: [''],
            startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
        });
    }

    private initializeForm(): void {
        this.filterForm.controls.branch.setValue('0');
        this.filterForm.controls.startDate.setValue(this.bsValueIni);
        this.filterForm.controls.endDate.setValue(this.bsValueFin);
        this.filterForm.setValidators([GlobalValidators.dateSort]);
    }

    cleanValidation() { }

    //Retorna ramos
    private getBranchTypesList() {
        this.preliminaryService.getBranchTypesList().subscribe(
            res => { this.branchTypeList = res; },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
        )
    }

    //
    generateFindMonitor() {
        this.isLoading = true;
        this.isValidatedInClickButton = true;
        if (this.filterForm.invalid) {
            this.isLoading = false;
            return;
        }
        else {
            this.listToShow = [];
            this.preliminaryResults = [];
            this.currentPage = 1; // página actual
            this.rotate = true; //
            this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
            this.itemsPerPage = 6; // limite de items por página
            this.totalItems = 0; // total de items encontrados

            const data = {
                branchId: this.filterForm.value.branch,
                startDate: this.filterForm.value.startDate,
                endDate: this.filterForm.value.endDate,
                ReportId: this.nType_Preliminary
            };

            this.preliminaryService.postGenerateMonitorProcess(data).subscribe(
                res => {
                    this.preliminaryResults = res;
                    this.totalItems = this.preliminaryResults.length;
                    this.listToShow = this.preliminaryResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                    this.isLoading = false;
                },
                err => {
                    this.isLoading = false;
                }
            );
        }
    }

    //Función para descargar archivo
    getFilePreliminaryReport(IDMONITOR: any) {
        if (IDMONITOR != null && IDMONITOR != 0) {
        this.isLoading = true;
        this.preliminaryService.GetFilePreliminaryReport(IDMONITOR.trim()).subscribe(
            //Respuesta del servicio
            res => {
            let _data = res;
            if (_data.response == 0) {
                if (_data.Data != null) {
                const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                    IDMONITOR.toUpperCase() + '.xlsx', { type: 'text/xls' });
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

    //Cambio de página
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.preliminaryResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
}
