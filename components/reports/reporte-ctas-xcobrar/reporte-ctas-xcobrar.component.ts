import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CtasXcobrarService } from '../../../services/report/ctas-xcobrar.service'
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reporte-ctas-xcobrar',
  templateUrl: './reporte-ctas-xcobrar.component.html',
  styleUrls: ['./reporte-ctas-xcobrar.component.css']
})
export class ReporteCtasXcobrarComponent implements OnInit {
    
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

  //Nombre Ramo Seleccionado
  ramoSelected: string="";
  

  //Table
  reporteCtasXcobrarResults: any[] = [];

  //Tipo reporte
  nType_Report:number = 4;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private ctasXcobrarService: CtasXcobrarService,
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

  ngOnInit() : void {
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
    this.ctasXcobrarService.getBranchTypesList().subscribe(
        res => { this.branchTypeList = res; },
        err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )
  }
  getBranch(item){
    this.branchTypeList.forEach(element => {
      if(element.Id == item){
        this.ramoSelected=element.Description;
        return;
      }
    });
  }
  //Generar Reporte
  generateCtasXcobrar(){
    this.isLoading = true;
    this.isValidatedInClickButton = true;

    if(this.filterForm.invalid){
      return;
    }else{
      Swal.fire({
        title: 'Advertencia',
        text: '¿ Está seguro que desea generar el reporte de Cuentas por Cobrar  para el Ramo ' + this.ramoSelected + " ?",
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
          this.ctasXcobrarService.postGenerateReportBroker(data).subscribe(
            res => { 
                        this.reporteCtasXcobrarResults = res; 
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
