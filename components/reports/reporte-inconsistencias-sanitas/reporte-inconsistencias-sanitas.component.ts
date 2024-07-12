import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import Swal from 'sweetalert2';
import { GlobalValidators } from '../../global-validators';
import { ReporteInconsistenciasSanitasService } from '@root/layout/broker/services/report/reporte-inconsistencias-sanitas.service';
import { DatePipe } from '@angular/common';
import { ReporteInconsistenciasSanitasViewComponent } from './reporte-inconsistencias-sanitas-view/reporte-inconsistencias-sanitas-view.component';

@Component({
  selector: 'app-reporte-inconsistencias-sanitas',
  templateUrl: './reporte-inconsistencias-sanitas.component.html',
  styleUrls: ['./reporte-inconsistencias-sanitas.component.css']
})
export class ReporteInconsistenciasSanitasComponent implements OnInit {

  filterForm: FormGroup;
  ramos: any[] = [];
  listToShow: any[] = [
    { "ID": 1, "TIPO_INCONSISTENCIA": "ASEGURADOS NO REGISTRADOS", "CANTIDAD": "0", "FECHA_INI_PROD": "",  "FECHA_FIN_PROD": ""},
    { "ID": 2, "TIPO_INCONSISTENCIA": "DIFERENCIA DE PRIMAS", "CANTIDAD": "0", "FECHA_INI_PROD": "",  "FECHA_FIN_PROD": ""},
    { "ID": 3, "TIPO_INCONSISTENCIA": "DUPLICIDAD DE ASEGURADOS", "CANTIDAD": "0", "FECHA_INI_PROD": "",  "FECHA_FIN_PROD": ""}]; 
      
  isLoading: boolean = false;
  isValidatedInClickButton: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();
  StartDateOff = false;
  EndDateOff = false;
  message: string = null;
  listAse: any[] = [];
  listDif: any[] = [];
  listDup: any[] = [];
  canAse: number = 0;
  canDif: number = 0;
  canDup: number = 0;
  currentPage = 1;

  constructor
  (
    private formBuilder: FormBuilder,
    private inconsistenciasSanitasService: ReporteInconsistenciasSanitasService,
    private datepipe: DatePipe,
    private modalService: NgbModal
  ){
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
    this.createForm();
    this.initializeForm();
    this.getBranchList();
  }

  private createForm(): void{
    this.filterForm = this.formBuilder.group({
      branch: ['', [Validators.required]],
      startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  private initializeForm(): void{
    this.filterForm.controls.branch.setValue('77');
    this.filterForm.controls.startDate.setValue(this.bsValueIni);
    this.filterForm.controls.endDate.setValue(this.bsValueFin);
    this.filterForm.setValidators([GlobalValidators.dateSort]);
  }

  cleanValidation() { }
    
  private getBranchList(){
    console.log("getBranch");
    this.inconsistenciasSanitasService.listarRamos().subscribe(
      res => { this.ramos = res; },
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }      
    )
    
  }

  openTipoInconsistencia(item){
    let tipoInconsistencia = item.ID;

    if(tipoInconsistencia == 1){
      if(this.listAse.length <= 0){
        return;
      }
    }else{
      if(tipoInconsistencia == 2){
        if(this.listDif.length <= 0){
          return;
        }
      }else{
        if(tipoInconsistencia == 3){
          if(this.listDup.length <= 0){
            return;
          }
        }
      }
    }

    const modalRef = this.modalService.open(ReporteInconsistenciasSanitasViewComponent, {
      size: 'xl',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.contractor = item;
    modalRef.componentInstance.listAse = this.listAse;
    modalRef.componentInstance.listDif = this.listDif;
    modalRef.componentInstance.listDup = this.listDup;
    /*
    modalRef.result.then(
      (Interval) => {
        this.currentPage = 1;
        clearInterval(Interval);
        this.listAse;
        //this.GetProcessHeader();
      }
    );*/
  }
  
  generarReporte(){
    if (this.bsValueIni > this.bsValueFin){
      this.message = "La fecha inicial no puede ser mayor a la fecha final.";

      Swal.fire({
        title: 'Información',
        text: this.message,
        icon: 'info',
        confirmButtonText: 'Continuar',
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
        }
      });

      err => {
        this.isLoading = false;
      }
    }else{
      Swal.fire({
        title: "Advertencia",
        text: "¿ Está seguro que desea generar el reporte de inconsistencias ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.value) {
          this.isLoading = true;
          this.isValidatedInClickButton = true;
  
          if(this.filterForm.invalid){
            this.isLoading = false;
            return;
          }else{
            const data = {
              NBRANCH : this.filterForm.value.branch,
              DSTARTDATE : this.filterForm.value.startDate,
              DEXPIRDAT : this.filterForm.value.endDate        
            };
  
            this.inconsistenciasSanitasService.generarReporte(data).subscribe(
              res => { 
                this.listAse = res.ASEGURADOS;
                this.canAse = this.listAse.length;
  
                this.listDif = res.DIFERENCIAS;
                this.canDif = this.listDif.length;

                this.listDup = res.DUPLICADOS;
                this.canDup = this.listDup.length;
  
                this.listToShow = [
                  { "ID": 1, "TIPO_INCONSISTENCIA": "ASEGURADOS NO REGISTRADOS", "CANTIDAD": this.canAse, "FECHA_INI_PROD": data.DSTARTDATE,  "FECHA_FIN_PROD": data.DEXPIRDAT},
                  { "ID": 2, "TIPO_INCONSISTENCIA": "DIFERENCIA DE PRIMAS", "CANTIDAD": this.canDif, "FECHA_INI_PROD": data.DSTARTDATE,  "FECHA_FIN_PROD": data.DEXPIRDAT},
                  { "ID": 3, "TIPO_INCONSISTENCIA": "DUPLICIDAD DE ASEGURADOS", "CANTIDAD": this.canDup, "FECHA_INI_PROD": data.DSTARTDATE,  "FECHA_FIN_PROD": data.DEXPIRDAT}];
  
                this.isLoading = false;
              },
              err => {
                this.isLoading = false;
                Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte.', 'error');
              }
            );
          }  
        }
      });
    }    
  }
}

