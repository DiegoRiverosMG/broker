import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bill-report-receipt-column-dialog',
  templateUrl: './bill-report-receipt-column-dialog.component.html',
  styleUrls: ['./bill-report-receipt-column-dialog.component.css']
})
export class BillReportReceiptColumnDialogComponent implements OnInit {
  
  selectAllCheckbox: boolean
  columnas: any[]
  reference: NgbModalRef;
  
  constructor() {
  }


  ngOnInit() {
  }

  selectColumnList(c: any) {
        c.value = !c.value
        this.selectAllCheckbox = false
  }
  
  selectAll() {
    this.selectAllCheckbox = !this.selectAllCheckbox
    this.columnas.forEach(it => it.value = this.selectAllCheckbox)
  }

}
