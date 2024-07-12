import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PreliminaryReportService } from '../../../services/report/preliminary-report.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-preliminary-report',
    templateUrl: './preliminary-report.component.html',
    styleUrls: ['./preliminary-report.component.css']
})

export class PreliminaryReportComponent implements OnInit {
    
    isLoading: boolean = false;
    isValidatedInClickButton: boolean = false;
    filterForm: FormGroup;
    productBool: boolean = false;
    submitted: boolean = false;

    branchTypeList: any[] = [];
    typeProcessTypeList: any[] = [];
    branchPeriodList: any[] = [];
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();

    bsIdPeriodo: Int32Array;
    bsperiodoMes: Int32Array;
    bsperiodoAnio: Int32Array;
    isPrima: any = true;
    SelectedValue: any = '';
    preliminaryResults: any[] = [];
    products: any = [];

    constructor(
        private formBuilder: FormBuilder,
        private preliminaryService: PreliminaryReportService
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
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate());
        this.bsValueFin = new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate());
        this.createForm();
        this.initializeForm();
        this.getBranchTypesList();
        this.getProcessTypesList();
        this.getProducts();
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            branch: [''],
            product: [''],
            productN: [''],
            report: [''],
            TypeProcess: [''],
            startDate: [''],
            endDate: [''],
            idPeriodo: [''],
            PeriodoMes:[''],
            PeriodoAnio:[''],
            chkPrima:[''],
            chkcobra:[''],
        });
    }

    private initializeForm(): void {
        this.filterForm.controls.branch.setValue('77');
        this.filterForm.controls.product.setValue('0');
        this.filterForm.controls.productN.setValue('');
        this.filterForm.controls.report.setValue('0');
        this.filterForm.controls.TypeProcess.setValue('0');
        this.getBranchPeriod(this.filterForm.value.branch);
        this.filterForm.controls.startDate.setValue(this.bsValueIni);
        this.filterForm.controls.endDate.setValue(this.bsValueFin);
        this.filterForm.controls.startDate.disable();
        this.filterForm.controls.endDate.disable();
    }

    getProducts = () => {
        this.preliminaryService.listarProductosVILP().subscribe(
            res => {
                this.products = res.Result.LISTA;
            }
        )
    }
         
    onSelectedBranch(e) {
        if (Number(e) !== 0) {
            this.getBranchPeriod(e);
        } else {
            this.branchTypeList = [];
        }
        this.filterForm.controls.productN.setValue('');
        if (Number(e) == 71) {
            this.productBool = true;
            this.filterForm.controls.productN.setValidators(Validators.required);
            this.filterForm.controls.productN.updateValueAndValidity();
        } else {
            this.productBool = false;
            this.filterForm.controls.productN.clearValidators();
            this.filterForm.controls.productN.updateValueAndValidity();
        }
    }

    getBranchPeriod(branchId) {
        this.preliminaryService.getBranchPeriod(Number(branchId), 1).subscribe(
            res => {
                if (res != undefined && res.length > 0) {
                    this.branchPeriodList = res;      
                    this.filterForm.controls.startDate.setValue(new Date(this.branchPeriodList[0].fchIniPeriodo));   
                    this.filterForm.controls.endDate.setValue(new Date(this.branchPeriodList[0].fchFinPeriodo)); 
                    this.bsIdPeriodo = this.branchPeriodList[0].IdPeriodo;
                    this.bsperiodoMes = this.branchPeriodList[0].periodoMes;
                    this.bsperiodoAnio = this.branchPeriodList[0].periodoAnio
                } else {
                    Swal.fire('Información', 'Debe generar los periodos del presente mes. Póngase en contacto con el administrador.', 'warning');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al traer el periodo del ramo.', 'error');
            }
        )
    }

    getBranchTypesList() {
        this.preliminaryService.getBranchTypesList().subscribe(
            res => {
                this.branchTypeList = res;
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al traer los ramos.', 'error');
            }
        )
    }

    getProcessTypesList() {
        this.preliminaryService.getProcessTypesList().subscribe(
            res => { this.typeProcessTypeList = res;
                this.filterForm.controls.TypeProcess.setValue('1');            
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al traer los procesos.', 'error');
            }
        )
    }
    
    generatePreliminary() {
        this.submitted = true;
        if (this.filterForm.valid) {
            if (this.isPrima == false) {
                Swal.fire('Información', 'Debe seleccionar el tipo de preliminar.', 'warning');
                return;
            }
            this.isLoading = true;
            this.isValidatedInClickButton = true;
            if (this.filterForm.invalid) {
                this.isLoading = false;
                return;
            } else {
                if (this.isPrima == true) {
                    this.SelectedValue = 1;
                } else if (this.isPrima == false) {
                    this.SelectedValue = 2;
                } else if (this.isPrima == true) {
                    this.SelectedValue = 0;
                }
                const data = {
                    userName: JSON.parse(localStorage.getItem("currentUser")).username,
                    reportId: JSON.stringify(this.SelectedValue) === '' ? 0 : JSON.stringify(this.SelectedValue), 
                    branchId: this.filterForm.value.branch,
                    productN: this.filterForm.value.productN,
                    productId: this.filterForm.value.product,
                    startDate: this.bsValueIni,
                    endDate: this.bsValueFin,
                    TypeProcess: this.filterForm.value.TypeProcess,
                    idPeriodo: this.bsIdPeriodo,
                    PeriodoMes: this.bsperiodoMes, 
                    PeriodoAnio: this.bsperiodoAnio                
                };
                this.preliminaryService.postGeneratePreliminaryReport(data).subscribe(
                    res => { 
                        this.preliminaryResults = res; 
                        this.isLoading = false;
                    },
                    err => { 
                        this.isLoading = false;
                    }
                );
            }
        }
    }

    cleanValidation() { }
}