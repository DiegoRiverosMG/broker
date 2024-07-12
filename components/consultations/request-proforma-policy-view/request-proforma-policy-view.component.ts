import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { RequestProformaService } from '../../../services/requestproforma/request-proforma.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-request-proforma-policy-view',
  templateUrl: './request-proforma-policy-view.component.html',
  styleUrls: ['./request-proforma-policy-view.component.css'],
})
export class RequestProformaPolicyViewComponent implements OnInit {
  listToShow: any = [];
  processDetailList: any = [];

  //Paginación
  currentPage = 1; // página actual
  rotate = true;
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 6; // limite de items por página
  totalItems: any = []; // total de items encontrados

  isLoading: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>;
  interval: any;

  @Input() public reference: any;
  @Input() public proforma: any;

  constructor(
    private modalService: NgbModal,
    private ProformaService: RequestProformaService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  ngOnInit() {
    this.GetProcessDetail();
  }

  // startTimer() {

  //   this.stopTimer();
  //   this.interval = setInterval(() => {
  //     this.GetProcessDetail();
  //   }, 2000);
  //   console.log(this.interval);
  // }

  // stopTimer() {
  //   clearInterval(this.interval);
  // }

  //Reporte de la búsqueda para Excel
  downloadModalListToExcel() {
    if (this.processDetailList != null && this.processDetailList.length > 0) {
      this.isLoading = true;
      this.ProformaService.DownloadModalListToExcel(
        this.processDetailList,
        'Reportes'
      );
    } else {
      Swal.fire('Información', 'No hay registros para exportar.', 'info');
    }
    this.isLoading = false;
  }

  //Reporte de la búsqueda para PDF
  downloadModalListToPDF() {
    if (this.processDetailList != null && this.processDetailList.length > 0) {
      this.isLoading = true;
      this.ProformaService.DownloadModalListToPDF(this.processDetailList);
    } else {
      Swal.fire('Información', 'No hay registros para exportar.', 'info');
    }
    this.isLoading = false;
  }

  //Listar detalle de proforma seleccionad
  GetProcessDetail() {
    this.listToShow = [];
    this.processDetailList = [];
    this.currentPage = 1; // página actual
    this.rotate = true; //
    this.maxSize = 4; // cantidad de paginas que se mostrarán en el paginado
    this.itemsPerPage = 4; // limite de items por página
    this.totalItems = 0; // total de items encontrados

    const _data: any = {};
    _data.scertype = this.proforma.scertype;
    _data.branch = this.proforma.branch;
    _data.product = this.proforma.product;
    _data.policy = this.proforma.policy;
    _data.proforma = this.proforma.proforma;
    _data.purePremium = this.proforma.purePremium;
    _data.rightIssue = this.proforma.rightIssue;
    _data.igv = this.proforma.igv;
    _data.serieNumber = this.proforma.serieNumber;
    _data.requestType = this.proforma.requestType;
    _data.billDate = this.proforma.billDate;
    _data.billType = this.proforma.billType;
    _data.billNumber = this.proforma.billNumber;
    _data.startReceipt = this.proforma.startReceipt;
    _data.endReceipt = this.proforma.endReceipt;
    _data.docType = this.proforma.docType;
    _data.docNumber = this.proforma.docNumber;
    _data.clientName = this.proforma.clientName;
    _data.ciu = this.proforma.ciu;
    _data.activity = this.proforma.activity;
    this.isLoading = true;
    this.ProformaService.GetListInsured(_data).subscribe(
      //Response del Back
      (res) => {
        if (res.P_NCODE == '0') {
          this.processDetailList = res.listInsu;
          this.totalItems = this.processDetailList.length;
          if (
            this.processDetailList.length != 0 ||
            this.processDetailList != null
          ) {
            this.listToShow = this.processDetailList.slice(
              (this.currentPage - 1) * this.itemsPerPage,
              this.currentPage * this.itemsPerPage
            );
          } else {
            swal.fire('Información', 'No se encontraron registros', 'error');
            this.isLoading = false;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          swal.fire({
            title: 'Información',
            text: res.P_SMESSAGE,
            icon: 'info',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
          });
        }
        this.isLoading = false;
      }
    );

    (err) => {
      this.isLoading = false;
    };
  }
  //Cambio de página
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.processDetailList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
}
