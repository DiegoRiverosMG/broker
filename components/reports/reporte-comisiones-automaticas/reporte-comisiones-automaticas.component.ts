import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import moment from 'moment';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ReporteComisionesAutomaticasService } from '../../../services/report/reporte-comisiones-automaticas.service';

@Component({
  selector: 'app-reporte-comisiones-automaticas',
  templateUrl: './reporte-comisiones-automaticas.component.html',
  styleUrls: ['./reporte-comisiones-automaticas.component.css']
})
export class ReporteComisionesAutomaticasComponent implements OnInit {

//
isLoading: boolean = false;
isValidatedInClickButton: boolean = false;

//
filterForm: FormGroup;

//Selects
branchTypeList: any[] = []; 

//Fechas
bsConfig: Partial<BsDatepickerConfig>;
bsValueIni = moment(new Date()).toDate();
bsValueFin = moment(new Date()).toDate();
bsValueFinMax: Date = new Date();
StartDateOff = false;
EndDateOff = false;

EstadoCom=[[1,'Potencial',true],
           [2,'Pendiente de pago',true],
           [3,'Por Cobrar',true],
           [4,'Liquidado',true],
           [5,'Pagado',true],
           [6,'Anulado',true]
          ];
marcar:string="Marcar/Desmarcar Todos";
marcado:boolean=true;
//Table
reporteComisionesAutomaticasResults: any[] = [];

//Tipo reporte
nType_Report:number = 5;

constructor(
  private formBuilder: FormBuilder,
  private modalService: NgbModal,
  private reporteComisionesAutomaticasService: ReporteComisionesAutomaticasService,
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
  this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate());
  this.bsValueFin = new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate());  
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
  this.filterForm.controls.startDate.setValue(new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate()));
  this.filterForm.controls.endDate.setValue(new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate()));
  //this.filterForm.setValidators([GlobalValidators.dateSort]);
}

cleanValidation() { }

//Carga listado de Ramo
private getBranchTypesList() {
  const data = {
    SREPORT: "COMISIONES_AUTOMATICAS"
  };
  this.reporteComisionesAutomaticasService.getBranchTypesList(data).subscribe(
      res => { this.branchTypeList = res; },
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
  )
}

onChange(id:number, email:string, isChecked: boolean) {
  console.log(id+"|"+email+"|"+isChecked);
  this.EstadoCom[id-1][2]=isChecked;
}
marcadesmarca(isChecked: boolean) {
  for(let i=0;i<this.EstadoCom.length;i++){
    //console.log(this.EstadoCom[i][2]+"|"+isChecked);
    this.EstadoCom[i][2]=isChecked;
    //console.log(this.EstadoCom[i][2]+"|"+isChecked);
  }
}
//Generar Reportes
generateComisionesAutomaticas(){
  this.isLoading = true;
  this.isValidatedInClickButton = true;

  let valores=",";
  for(let i=0;i<this.EstadoCom.length;i++){
    if(this.EstadoCom[i][2]){
      console.log(this.EstadoCom[i][0]+"|"+this.EstadoCom[i][1]+"|"+this.EstadoCom[i][2]);
      valores+=this.EstadoCom[i][0]+",";
    }
  }

  if(this.filterForm.invalid){
    return;
  }else{
    Swal.fire({
      title: 'Advertencia',
      text: 'Está seguro que desea generar el reporte de Comisiones Automáticas con el rango de fechas ' + this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy') + ' al ' + this.datepipe.transform(this.bsValueFin, 'dd/MM/yyyy') +' ?',
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      icon: 'warning'
    }).then((result) => {
      if (result.value) {
        const data = {
          SREPORT: "COMISIONES_AUTOMATICAS",
          BranchId: this.filterForm.value.branch,
          EndDate: new Date(this.bsValueFin.getFullYear(), this.bsValueFin.getMonth(), this.bsValueFin.getDate()),
          IdReport: 1,
          NTYPE_REPORT: this.nType_Report,
          StartDate: new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate()),
          UserName: JSON.parse(localStorage.getItem("currentUser")).username,
          estados: valores
        };
        console.log('', data);
        this.reporteComisionesAutomaticasService.postGenerateReporteComisionesAutomaticas(data).subscribe(
          res => { 
                      this.reporteComisionesAutomaticasResults = res; 
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
