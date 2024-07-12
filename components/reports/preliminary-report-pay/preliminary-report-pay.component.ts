import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import Swal from 'sweetalert2';
import { PreliminaryReportService } from '../../../services/report/preliminary-report.service';
import { ModuleConfig } from './../../module.config';
import { GlobalValidators } from '../../global-validators';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-preliminary-report-pay',
  templateUrl: './preliminary-report-pay.component.html',
  styleUrls: ['./preliminary-report-pay.component.css']
})
export class PreliminaryReportPayComponent implements OnInit {
  isLoading: boolean = false;
    isValidatedInClickButton: boolean = false;
    filterForm: FormGroup;

    // selects
    branchTypeList: any[] = [];     //ramo
    typeProcessTypeList: any[] = []; //proceso
    reportTypeList: any[] = [];     //tipo preliminar
    branchPeriodList: any[] = [];   //lista de periodos

    // datepicker
    public bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsIdPeriodo: Int32Array;
    bsperiodoMes: Int32Array;
    bsperiodoAnio: Int32Array;

    
     //CheckBox 
    public isCobra:any = true; //cobranza
    SelectedValue: any = '';

    // table
    preliminaryResults: any[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
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
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate()); // DGC 04/07/2023
        this.bsValueFin = new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate()); // DGC 04/07/2023
        this.createForm();
        this.initializeForm();
        this.getBranchTypesList();
        this.getProcessTypesList();   
    }

    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            branch: [''],
            product: [''],
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
        // INI MMQ 14-03-2023 MOD
        this.filterForm.controls.report.setValue('2');
        this.filterForm.controls.TypeProcess.setValue('2');
        //this.getBranchPeriod(this.filterForm.value.branch);
        this.filterForm.controls.startDate.setValue(this.bsValueIni);
        this.filterForm.controls.endDate.setValue(this.bsValueFin);
        this.filterForm.controls.startDate.enable();
        this.filterForm.controls.endDate.enable();    
        // FIN MMQ 14-03-2023 MOD
    }

    cleanValidation() { }
    /*     
    onSelectedBranch() {
        if (this.filterForm.value.branch !== "0"){
            this.getBranchPeriod(this.filterForm.value.branch);
        }else
            this.branchTypeList = [];
    }

    // llamada a los servicios
    getBranchPeriod(branchId) {
        this.preliminaryService.getBranchPeriod(Number(branchId), 2).subscribe(
            res => {
                if(res!= undefined && res.length>0){

                    this.branchPeriodList = res;      
                    this.filterForm.controls.startDate.setValue(new Date(this.branchPeriodList[0].fchIniPeriodo));   
                    this.filterForm.controls.endDate.setValue(new Date(this.branchPeriodList[0].fchFinPeriodo)); 
                    this.bsIdPeriodo = this.branchPeriodList[0].IdPeriodo;
                    this.bsperiodoMes = this.branchPeriodList[0].periodoMes;
                    this.bsperiodoAnio = this.branchPeriodList[0].periodoAnio
                }else{
                    Swal.fire('Información', 'Debe generar los periodos del presente mes. Póngase en contacto con el administrador', 'error');
                }
                },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer el periodo del ramo', 'error'); }
        )
    }
    */
    getBranchTypesList() {
        this.preliminaryService.getBranchTypesList().subscribe(
            res => { this.branchTypeList = res; },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
        )
    }

    getProcessTypesList() {
        this.preliminaryService.getProcessTypesList().subscribe(
            res => { this.typeProcessTypeList = res;
                this.filterForm.controls.TypeProcess.setValue('2');   // FIN MMQ 14-03-2023 MOD FIN
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al traer los procesos', 'error'); }
        )
    }

    generatePreliminary() {    
        if(this.isCobra == false){  
            Swal.fire('Información', 'Debe seleccionar el tipo de preliminar.', 'error');
            return;
        }
    
        this.isLoading = true;
        this.isValidatedInClickButton = true;

        if (this.filterForm.invalid) {
            this.isLoading = false;
            return;
        }
        else {
            //Valores para el Tipo preliminar (checkbox)
            if (this.isCobra == false) {                
                this.SelectedValue = 1;
            }        
            else if(this.isCobra == true) {                
                this.SelectedValue = 2;
            }
            else if(this.isCobra == true) {                
                this.SelectedValue = 0;
            }
            
            const data = {
                userName: JSON.parse(localStorage.getItem("currentUser")).username,
                reportId: JSON.stringify(this.SelectedValue) === '' ? 0 : JSON.stringify(this.SelectedValue), 
                branchId: this.filterForm.value.branch,
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