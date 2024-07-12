import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ProviComisionesService } from '../../../services/report/reporte-proviComisiones.service';

@Component({
  selector: 'app-reporte-proviComisiones',
  templateUrl: './reporte-proviComisiones.component.html',
  styleUrls: ['./reporte-proviComisiones.component.css']
})
export class ReporteProviComisionesComponent implements OnInit {

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
proviComisionesResults: any[] = [];

//Tipo reporte
nType_Report:number = 6;

constructor(
  private formBuilder: FormBuilder,
  private modalService: NgbModal,
  private proviComisionesService: ProviComisionesService,
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
  this.filterForm.controls.branch.setValue('66');  
  this.filterForm.controls.startDate.setValue(this.bsValueIni);
  this.filterForm.controls.endDate.setValue(this.bsValueFin);
  this.filterForm.setValidators([GlobalValidators.dateSort]);
}

cleanValidation() { }

//Carga listado de Ramo
private getBranchTypesList() {
  this.proviComisionesService.getBranchTypesList().subscribe(
      res => { this.branchTypeList = res; },
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
  )
}

//Generar Reportes
generateProviComisiones(){
  this.isLoading = true;
  this.isValidatedInClickButton = true;

  if(this.filterForm.invalid){
    return;
  }else{
    Swal.fire({
      title: 'Advertencia',
      text: 'Está seguro que desea generar el reporte de Preliminar Detalle Producción con el rango de fechas de producción del ' + this.datepipe.transform(this.filterForm.value.startDate, 'dd/MM/yyyy') + ' al ' + this.datepipe.transform(this.filterForm.value.endDate, 'dd/MM/yyyy') +' ?',
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
        this.proviComisionesService.postGenerateProviComisiones(data).subscribe(
          res => { 
                      this.proviComisionesResults = res; 
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
