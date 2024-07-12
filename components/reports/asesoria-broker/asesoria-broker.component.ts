import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AsesoriaBrokerService } from '../../../services/report/asesoria-broker.service';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'app-asesoria-broker',
    templateUrl: './asesoria-broker.component.html',
    styleUrls: ['./asesoria-broker.component.css']
})
export class AsesoriaBrokerComponent implements OnInit {

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
    asesoriaBrokerResults: any[] = [];

    //Tipo reporte
    nType_Report: number = 1;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private asesoriaBrokerService: AsesoriaBrokerService,
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
        this.asesoriaBrokerService.getBranchTypesList().subscribe(
            res => { this.branchTypeList = res; },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
        )
    }

    //Generar Reporte
    generateAsesoria() {
        this.isLoading = true;
        this.isValidatedInClickButton = true;

        if (this.filterForm.invalid) {
            return;
        } else {
            Swal.fire({
                title: 'Advertencia',
                text: 'Está seguro que desea generar el reporte de Asesoría por Broker con el rango de fechas de producción del ' + this.datepipe.transform(this.filterForm.value.startDate, 'dd/MM/yyyy') + ' al ' + this.datepipe.transform(this.filterForm.value.endDate, 'dd/MM/yyyy'),
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
                showCancelButton: true,
                icon: 'warning'
            }).then((result) => {
                if (result.value) {
                    const data = {
                        branchId: this.filterForm.value.branch,
                        userName: JSON.parse(localStorage.getItem("currentUser")).username,
                        startDate: this.filterForm.value.startDate,
                        endDate: this.filterForm.value.endDate,
                        nType_Report: this.nType_Report
                    };
                    this.asesoriaBrokerService.postGenerateReportBroker(data).subscribe(
                        res => {
                            this.asesoriaBrokerResults = res;
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
