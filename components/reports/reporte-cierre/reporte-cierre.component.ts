import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReporteCierreService } from '../../../services/report/reporte-cierre.service';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'app-reporte-cierre',
    templateUrl: './reporte-cierre.component.html',
    styleUrls: ['./reporte-cierre.component.css']
})
export class ReporteCierreComponent implements OnInit {

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

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private reporteCierreService: ReporteCierreService,
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
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate()); // DGC 04/07/2023
        this.bsValueFin = new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate()); // DGC 04/07/2023
        this.createForm();
        this.initializeForm();
        this.getBranchTypesList();
        //this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
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
        this.reporteCierreService.getBranchTypesList().subscribe(
            res => { this.branchTypeList = res; },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
        )
    }

    //Generar Reportes
    generateCierre() {
        this.isLoading = true;
        this.isValidatedInClickButton = true;

        if (this.filterForm.invalid) {
            return;
        } else {
            Swal.fire({
                title: 'Advertencia',
                text: 'Está seguro que desea generar el reporte de Cierre de Producción con el rango de fechas del ' + this.datepipe.transform(this.filterForm.value.startDate, 'dd/MM/yyyy') + ' al ' + this.datepipe.transform(this.filterForm.value.endDate, 'dd/MM/yyyy'),
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
                showCancelButton: true,
                icon: 'warning'
            }).then((result) => {
                if (result.value) {
                    const data = {
                        BranchId: this.filterForm.value.branch,
                        EndDate: this.filterForm.value.endDate,
                        IdReport: 1,
                        NTYPE_REPORT: this.nType_Report,
                        StartDate: this.filterForm.value.startDate,
                        UserName: JSON.parse(localStorage.getItem("currentUser")).username
                    };
                    console.log('', data);
                    this.reporteCierreService.postGenerateReporteCierre(data).subscribe(
                        res => {
                            this.reporteCierreResults = res;
                            this.isLoading = false;
                        },
                        err => {
                            this.isLoading = false;
                        }
                    );

                } else if (result.dismiss) {

                }
            })


        }
    }
}