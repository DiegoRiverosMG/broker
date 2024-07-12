import { Component, OnInit, Input } from '@angular/core';
import { ReportSalesCVService } from '../../../services/reportsalescv/reportsalescv.service';
import { ReportSalesCV } from '../../../models/reportsalescv/reportsalescv';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ValidatorService } from '../../../../../shared/services/general/validator.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reportsalescv',
  templateUrl: './reportsalescv.component.html',
  styleUrls: ['./reportsalescv.component.css']
})
export class ReportsalescvComponent implements OnInit {

  // paginacion
  page: number;

  /*Variables de paginacion */
  public itemsPerPage = 4;
  public totalItems = 0;
  public currentPage = 0;
  paginacion: any = {};
  rotate = true;
  maxSize = 5;

  fExistRegistro: any = false;
  // Parametros de Filtros
  resultUsoReport = '0';
  resultDepReport = '0';
  resultProReport = '0';
  resultDisReport = '0';
  resultStateSalesReport = '0';
  resultSalesModeReport = '0';
  resultPaymentTypeReport = '0';
  resultChannelSalesReport = '';
  resultChannelPointReport = '';
  resultError = true;
  listErrores = [];
  listado: any[];
  msgErrorLista = '';
  filter: any = {};
  mensaje: string;
  ListReportSalesCV: any[];
  ListReportSalesCVExport: any[]; 
  reportSalesCV: ReportSalesCV; // (0, 0, 0, 0, 0, 0, 0, 0, '01/01/2017', '01/01/2017', 0, '', '', 0, 0);
  canal = '';
  indpuntoVenta = '';

  constructor(private reportsalescvService: ReportSalesCVService, private excelService: ExcelService,
              public utilityService: UtilityService, private validatorService: ValidatorService, private datePipe: DatePipe,) {
    this.filter.FPrimaIni = '';
    this.filter.FPrimaFin = '';
    this.filter.FDateIni = '2017-01-01';
    this.filter.FDateFin = '2019-01-01';
    this.filter.FPoliza = '';
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.CurrentPage = this.currentPage;
  }

  ngOnInit() {
    this.msgErrorLista = 'No se encontraron Registros..';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canal = currentUser && currentUser.canal;
    this.indpuntoVenta = currentUser && currentUser.indpuntoVenta;
  }

  onVotedParentUso(idUso: string) {
    this.resultUsoReport = idUso;
  }
  onVotedParentDep(idDep: string) {
    this.resultDepReport = idDep;
  }
  onVotedParentPro(idPro: string) {
    this.resultProReport = idPro;
  }
  onVotedParentDis(idDis: string) {
    this.resultDisReport = idDis;
  }

  onVotedParentPaymentType(idPaymentType: string) {
    this.resultPaymentTypeReport = idPaymentType;
  }
  onVotedParentSalesMode(idSalesMode: string) {
    this.resultSalesModeReport = idSalesMode;
  }
  onVotedParentStateSales(idStateSales: string) {
    this.resultStateSalesReport = idStateSales;
  }
  onVotedParentChannelSales(idChannelSales: string) {
    this.resultChannelSalesReport = idChannelSales;
  }
  onVotedParentChannelPoint(idChannelSales: string) {
    this.resultChannelPointReport = idChannelSales;
  }

  EventSearch(event) {
    if (this.EventValidate(event) === true) {
      this.loadReporteCF();
    }
  }

  EventValidate(event) {
    this.currentPage = 0;
    this.totalItems = 0;
    this.resultError = true;
    this.fExistRegistro = false;
    this.ListReportSalesCV = [];
    this.listErrores = [];

    this.listErrores = this.utilityService.isValidateReport(event, this.filter.FDateIni, this.filter.FDateFin,
      this.utilityService.getValueDefault(this.filter.FPrimaIni),
      this.utilityService.getValueDefault(this.filter.FPrimaFin));

    if (this.listErrores.length > 0) {
      this.resultError = false;
      return false;
    } else {
        this.resultError = true;
        return true;
    }
  }

  loadReporteCF(): void {
    this.paginacion.CurrentPage = this.currentPage;
    this.reportSalesCV = new ReportSalesCV (this.resultDepReport, this.resultProReport, this.resultDisReport, 
                                            this.resultStateSalesReport, this.resultSalesModeReport,
                                            this.utilityService.getValueDefault(this.filter.FPrimaIni),
                                            this.utilityService.getValueDefault(this.filter.FPrimaFin), this.resultUsoReport,
                                            this.utilityService.getFormatDate(this.filter.FDateIni),
                                            this.utilityService.getFormatDate(this.filter.FDateFin),
                                            this.utilityService.getValueDefault(this.filter.FPoliza),
                                             this.resultChannelSalesReport,
                                            this.resultChannelPointReport,
                                            this.paginacion.CurrentPage, this.paginacion.ItemsPerPage, this.indpuntoVenta);
    //console.log(this.reportSalesCV);
    this.reportsalescvService.getPostReportSalesCV(this.reportSalesCV)
    .subscribe(
      data => {
        this.ListReportSalesCV = <any[]>data;
        //console.log(this.ListReportSalesCV);
        //console.log('ListReportSalesCV:' + this.ListReportSalesCV);
        this.msgErrorLista = '';
        if (this.ListReportSalesCV.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = data[0].nrecorD_COUNT;
        } else {
          this.fExistRegistro = false;
          this.msgErrorLista = 'No se encontraron Registros..';
        }
      },
      error => {
        console.log('error:' + error);
        this.fExistRegistro = false;
        this.msgErrorLista = 'Error de Sistemas. Comunicarse con Soporte!';
      }
    );
  }

  setPage(pageNo: number): void {
    // tslint:disable-next-line:no-debugger
    this.currentPage = pageNo;
  }
  pageChanged(event: any): void {
    this.page = event.page;
    this.currentPage = event.page - 1;
    this.loadReporteCF();
  }

  EventDownload(event) {
    this.reportSalesCV = new ReportSalesCV (this.resultDepReport, this.resultProReport, this.resultDisReport, 
                                            this.resultStateSalesReport, this.resultSalesModeReport,
                                            this.utilityService.getValueDefault(this.filter.FPrimaIni),
                                            this.utilityService.getValueDefault(this.filter.FPrimaFin), this.resultUsoReport,
                                            this.utilityService.getFormatDate(this.filter.FDateIni),
                                            this.utilityService.getFormatDate(this.filter.FDateFin),
                                            this.utilityService.getValueDefault(this.filter.FPoliza),
                                            this.resultChannelSalesReport,
                                            this.resultChannelPointReport,
                                            this.paginacion.CurrentPage, this.paginacion.ItemsPerPage, this.indpuntoVenta);
    this.reportSalesCV.NPAGE = "0";
    this.reportSalesCV.NRECORD_PAGE = "0";

    this.reportsalescvService.getPostReportSalesCV(this.reportSalesCV)
    .subscribe(
    data => {                
              this.ListReportSalesCVExport = <any[]>data;
                if (this.ListReportSalesCVExport.length > 0) {          
                  this.excelService.exportReportSalesCV(this.ListReportSalesCVExport, 'ReporteCanalVenta');
                } 
              },
    err => {
    console.log(err);
    }
    );  
  }

}
