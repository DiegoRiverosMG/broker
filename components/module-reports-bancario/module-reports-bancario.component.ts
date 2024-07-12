/*************************************************************************************************/
/*  NOMBRE              :   MODULE-REPORTS-BANCARIO.COMPONENT.TS                                 */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   07-03-2023                                                           */
/*  VERSIÓN             :   1.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { forkJoin } from "rxjs";
import { ModuleReportsService } from '../../../backoffice/services/module-reports/module-reports.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-module-reports-bancario',
  templateUrl: './module-reports-bancario.component.html',
  styleUrls: ['./module-reports-bancario.component.css']
})

export class ModuleReportsBancarioComponent implements OnInit {

  origen: any = [];
  submitted: boolean = false;
  filterForm: FormGroup;
  //listToShow: any = [];
  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;
  maxSize = 10;
  listToShow: any = [
    {"codigo": 1, "descripcion": "Control Bancario - Cargador CB", "tipo": "Control Bancario", "estado": "Habilitado"},
    {"codigo": 2, "descripcion": "Control Bancario - Cargador CB SCTR", "tipo": "Control Bancario", "estado": "Habilitado"},
    {"codigo": 3, "descripcion": "Control Bancario - Producto VDP", "tipo": "Control Bancario", "estado": "Habilitado"},
  ];

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private moduleReportsService: ModuleReportsService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.getParams();
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      NNUMORI: [1, Validators.required]
    });
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listToShow.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  getParams = () => {
    let $origen = this.moduleReportsService.listarOrigen();
    return forkJoin([$origen]).subscribe(
      res => {
        this.origen = res[0].Result.combos;
      },
      err => {
        Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
      }
    )
  }

  mostrarModalAgregar(content: any) {
    this.submitted = false;
    this.modalService.open(content, { backdrop: 'static', size: 'md', keyboard: false, centered: true });
  }

  mostrarModalEditar(content: any) {
    this.submitted = false;
    this.modalService.open(content, { backdrop: 'static', size: 'md', keyboard: false, centered: true });
  }

}