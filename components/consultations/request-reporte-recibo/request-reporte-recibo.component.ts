/*************************************************************************************************/
/*  NOMBRE              :   REQUEST-REPORTE-RECIBO.COMPONENT.HTML                                */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   19-12-2022                                                           */
/*  VERSIÓN             :   1.0 - REPORTE DE RECIBOS                                             */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-reporte-recibo',
  templateUrl: './request-reporte-recibo.component.html',
  styleUrls: ['./request-reporte-recibo.component.sass']
})

export class RequestReporteReciboComponent implements OnInit {

  reportes: [];

  listToShow: any = [];
  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;
  maxSize = 10;

  constructor() { }

  ngOnInit(): void {

  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.reportes.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

}