/*************************************************************************************************/
/*  NOMBRE              :   REPORTE-RECIBO.COMPONENT.HTML                                        */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   19-12-2022                                                           */
/*  VERSIÓN             :   1.0 - REPORTE DE RECIBOS                                             */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../../global-validators';
import { ReporteReciboService } from '@root/layout/broker/services/report/reporte-recibo.service';
import Swal from 'sweetalert2';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reporte-recibo',
  templateUrl: './reporte-recibo.component.html',
  styleUrls: ['./reporte-recibo.component.sass']
})

export class ReporteReciboComponent implements OnInit {

  bsConfig: Partial<BsDatepickerConfig>;
  reportes: [];

  listToShow: any = [];
  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;
  maxSize = 10;

  filterForm: FormGroup;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  branchTypeList: any[] = []; 
  diaActual = moment(new Date()).toDate();
  evaluarBoton: boolean = true;
  isValidatedInClickButton: boolean = false;
  processHeaderList: any = [];
  isLoading: boolean = false;
  reporteReciboResult: any[] = [];

  constructor(
        private formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        private reporteReciboService: ReporteReciboService,
        private datepipe: DatePipe
    ) {    
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
    this.getBranchTypesList();
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      nBranch: [77],
      contratante: [0],
      policy: [0],
      startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  private initializeForm(): void {
    //this.filterForm.controls.nBranch.setValue(''); 
    this.filterForm.controls.contratante.setValue('');
    this.filterForm.controls.policy.setValue('');
    this.filterForm.controls.startDate.setValue(this.diaActual);
    this.filterForm.controls.endDate.setValue(this.diaActual);
    this.filterForm.setValidators([GlobalValidators.dateSort]);
  }

  private getBranchTypesList() {
    this.reporteReciboService.getBranchTypesList().subscribe(
      (s) => {
          console.log('Listado de Ramos', s);
          this.branchTypeList = s.Result.lista;
          console.log(s);
      },
      (e) => {
          console.log(e);
      }
  );
  }

  onProcesar() {
    //this.spinner.show();
    this.isLoading = true;
    this.isValidatedInClickButton = true;

    if(this.filterForm.invalid){
      return;
    }else{
      Swal.fire({
        title: 'Advertencia',
        text: 'Está seguro que desea generar el reporte de recibos con el rango de fechas del ' + this.datepipe.transform(this.filterForm.value.startDate, 'dd/MM/yyyy') + ' al ' + this.datepipe.transform(this.filterForm.value.endDate, 'dd/MM/yyyy') +' ?',
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        icon: 'warning'
      }).then((result) => {
        if (result.value) {
          const data = {
            P_NBRANCH: this.filterForm.value.nBranch,
            P_FEINI: this.filterForm.value.startDate,
            P_FEFIN: this.filterForm.value.endDate,            
            P_NDOCUMENT_CONT: this.filterForm.value.contratante,
            P_NPOLICY: this.filterForm.value.policy,       
            P_NUSERCODE: JSON.parse(localStorage.getItem("currentUser")).username,
            P_USER_REG: JSON.parse(localStorage.getItem("currentUser")).username
          };
          console.log('', data);
          this.reporteReciboService.GenerarReporteRecibosSCTR(data).subscribe(
            res => { 
              this.reporteReciboResult = res; 
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

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.reportes.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

}