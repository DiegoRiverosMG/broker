import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalValidators } from '../../global-validators';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ReporteSucaveService } from '../../../services/report/reporte-sucave.service';
import { runInThisContext } from 'vm';
import { Branch } from '../../../models/branch/branch.model';

@Component({
  selector: 'app-reporte-sucave',
  templateUrl: './reporte-sucave.component.html',
  styleUrls: ['./reporte-sucave.component.css']
})
export class ReporteSucaveComponent implements OnInit {

  //
  isLoading: boolean = false;
  isValidatedInClickButton: boolean = false;

  //
  filterForm: FormGroup;

  //Selects
  branchTypeList: any[] = [];
  productTypeList: any[] = [];

  //Fechas
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();
  StartDateOff = false;
  EndDateOff = false;


  //Table
  reporteSoatResults: any[] = [];

  //Tipo reporte
  nType_Report:number = 5;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private reporteSucaveService: ReporteSucaveService,
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
    this.seleccionarRamo();

    this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      branch: [77],
      product: [0],
      startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  //Inicializa variables
  private initializeForm(): void {
    // this.filterForm.controls.branch.setValue('66');
    this.filterForm.controls.startDate.setValue(this.bsValueIni);
    this.filterForm.controls.endDate.setValue(this.bsValueFin);
    this.filterForm.setValidators([GlobalValidators.dateSort]);
  }

  cleanValidation() { }

  //Carga listado de Ramo
  private getBranchTypesList() {
    this.reporteSucaveService.getBranchTypesList().subscribe(
        res => { this.branchTypeList = res; },
        err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )
  }

  //Carga listado de Producto
  seleccionarRamo(){
    this.filterForm.controls.product.setValue(0);
    this.reporteSucaveService.getProductTypesList(this.filterForm.value).subscribe(
      res => {
        this.productTypeList = res;
      },
      err=>{Swal.fire('Información', 'Ha ocurrido un error al traer los productos', 'error'); }
    )
  }

  formatoFecha(item) {
    let day = `0${item.getDate()}`.slice(-2); //("0"+date.getDate()).slice(-2);
    let month = `0${item.getMonth() + 1}`.slice(-2);
    let year = item.getFullYear();
    return `${day}/${month}/${year}`;
  }

  //Generar Reportes
  generateSoat(){
    this.isValidatedInClickButton = true;

    if(this.filterForm.value.branch == 0){
      Swal.fire('Información', 'Seleccione un Ramo', 'warning');
      return;
    }
    if(this.filterForm.value.product == 0){
      Swal.fire('Información', 'Seleccione un Producto', 'warning');
      return;
    }
    if(this.filterForm.invalid){
      return;
    }else{
      Swal.fire({
        title: 'Advertencia',
        text: 'Está seguro que desea generar el reporte Sucave SCTR con el rango de fechas de producción del ' + this.datepipe.transform(this.filterForm.value.startDate, 'dd/MM/yyyy') + ' al ' + this.datepipe.transform(this.filterForm.value.endDate, 'dd/MM/yyyy') +' ?',
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        icon: 'warning'
      }).then((result) => {
        if (result.value) {
          this.isLoading = true;
          const data = {
            IdReport: 1,
            IdProcess: 0,
            BranchId: this.filterForm.value.branch,
            ProductId: this.filterForm.value.product,
            NUserCode: JSON.parse(localStorage.getItem("currentUser")).id,
            UserName: JSON.parse(localStorage.getItem("currentUser")).username,
            FechaIni: this.formatoFecha(this.filterForm.value.startDate),
            FechaFin: this.formatoFecha(this.filterForm.value.endDate)
          };
          console.log('', data);
          this.reporteSucaveService.postGenerateReporteSoat(data).subscribe(
            res => {
              this.reporteSoatResults = res;
              if(res !== 'Error'){
                this.reporteSoatResults.forEach((e)=>{
                  e.DIniProcess = e.DIniProcess.split(' ')[0];
                  e.DFinProcess = e.DFinProcess.split(' ')[0];
                })
                Swal.fire('Información', this.reporteSoatResults[0].mensajeAlerta, 'success');
              }else{
                Swal.fire('Error', 'Ha ocurrido un error al generar el reporte', 'error');
              }
              this.isLoading = false;
            },
            err => {
              Swal.fire('Error', 'Ha ocurrido un error al generar el reporte', 'error');
              this.isLoading = false;
            }
          )
        } else if (result.dismiss) {

        }
      })


    }
  }}
