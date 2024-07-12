import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CommissionService } from '@root/layout/broker/services/maintenance/commision/commission.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AtpReportService } from '@root/layout/broker/services/atp-reports/atp-report.service';
import { PolicyemitService } from '@root/layout/broker/services/policy/policyemit.service';
import * as FileSaver from 'file-saver';
import { ExcelService } from '@root/layout/broker/services/shared/excel.service';

@Component({
  selector: 'app-config-commission-record',
  templateUrl: './config-commission-record.component.html',
  styleUrls: ['./config-commission-record.component.css']
})
export class ConfigCommissionComponentRecord implements OnInit {


  @Input() public reference: any;

  isLoading: boolean = false;
  list_commission: any = [];

  listToShow: any[] = [];
  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados


  constructor(
    private atpReportService: AtpReportService,
    private policyemit: PolicyemitService,
    private excelService: ExcelService,


  ) {


  }

  ngOnInit() {
    

    this.atpReportService.ListRecodCommissionVDP().subscribe(
    (res: any) => {
       this.list_commission = res;
       this.totalItems = this.list_commission.length;
       this.listToShow = this.list_commission.slice(  
         (this.currentPage - 1) * this.itemsPerPage,
         this.currentPage * this.itemsPerPage
       );
      //  console.log(this.listToShow);
       
    },
    (err: any) => {
      console.error(err);
       }
    )
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.list_commission.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  downloadExcel(){
    this.isLoading = true;
    this.excelService.generateRecordCommissionVDP(this.list_commission,"Historial de Comisiones VDP");
    this.isLoading = false;
  }
  
}
