import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ReportSalesPROService } from '../../../services/reportsalespro/reportsalespro.service';
import { ReportSalesPRO } from '../../../models/reportsalespro/reportsalespro';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ValidatorService } from '../../../../../shared/services/general/validator.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reportsalespro',
  templateUrl: './reportsalespro.component.html',
  styleUrls: ['./reportsalespro.component.css']
})
export class ReportsalesproComponent implements OnInit {

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
  listado: any[];
  listErrores = [];
  filter: any = {};
  mensaje: string;
  ListReportSalesPRO: any[];
  ListReportSalesPROReport: any[];
  reportSalesPRO: ReportSalesPRO;
  msgErrorLista = '';

  constructor(
    private reportsalesproService: ReportSalesPROService,
    private excelService: ExcelService,
    public utilityService: UtilityService,
    private validatorService: ValidatorService,
    public datePipe: DatePipe) {
    //
    this.filter.FPrimaIni = '';
    this.filter.FPrimaFin = '';
    this.filter.FDateIni = '2017-01-01';
    this.filter.FDateFin = '9999-01-01';
    this.filter.FPoliza = '';
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.CurrentPage = this.currentPage;
  }

  ngOnInit() {
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    this.filter.FDateIni = anio.toString() + '-' + (0 + 1).toString().padStart(2, '0') + '-' + dia.toString().padStart(2, '0');
    this.filter.FDateFin = anio.toString() + '-' + (mes + 1).toString().padStart(2, '0') + '-' + dia.toString().padStart(2, '0');
    this.msgErrorLista = 'No se encontraron Registros..';
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
    this.ListReportSalesPRO = [];
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
    this.reportSalesPRO = new ReportSalesPRO(this.resultDepReport, this.resultProReport, this.resultDisReport,
                                            this.resultStateSalesReport, this.resultSalesModeReport,
                                            this.utilityService.getValueDefault(this.filter.FPrimaIni),
                                            this.utilityService.getValueDefault(this.filter.FPrimaFin), this.resultUsoReport,
                                            this.utilityService.getFormatDate(this.filter.FDateIni),
                                            this.utilityService.getFormatDate(this.filter.FDateFin),
                                            this.utilityService.getValueDefault(this.filter.FPoliza),
                                            this.resultChannelSalesReport,
                                            this.resultChannelPointReport,
                                            this.paginacion.CurrentPage, this.paginacion.ItemsPerPage);
    //console.log('reportSalesPRO:' + this.reportSalesPRO);
    this.reportsalesproService.getPostReportSalesPRO(this.reportSalesPRO)
      .subscribe(
        data => {
          this.ListReportSalesPRO = <any[]>data;
          this.msgErrorLista = '';
          if (this.ListReportSalesPRO.length > 0) {
            this.fExistRegistro = true;
            this.totalItems = data[0].nrecorD_COUNT;
          } else {
            this.fExistRegistro = false;
            this.msgErrorLista = 'No se encontraron Registros..';
          }
        },
        error => {
          console.log(error);
          this.fExistRegistro = false;
          this.msgErrorLista = 'Error de Sistemas. Comunicarse con Soporte!';
        }
      );
  }

  setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }
  pageChanged(event: any): void {
    this.page = event.page;
    this.currentPage = event.page - 1;
    this.loadReporteCF();
  }

  EventDownload(event) {
    //console.log(event);
    this.reportSalesPRO = new ReportSalesPRO(this.resultDepReport, this.resultProReport, this.resultDisReport,
                                            this.resultStateSalesReport, this.resultSalesModeReport,
                                            this.utilityService.getValueDefault(this.filter.FPrimaIni),
                                            this.utilityService.getValueDefault(this.filter.FPrimaFin), this.resultUsoReport,
                                            this.utilityService.getFormatDate(this.filter.FDateIni),
                                            this.utilityService.getFormatDate(this.filter.FDateFin),
                                            this.utilityService.getValueDefault(this.filter.FPoliza),
                                            this.resultChannelSalesReport,
                                            this.resultChannelPointReport,
                                            this.paginacion.CurrentPage, this.paginacion.ItemsPerPage);
    this.reportSalesPRO.NPAGE = "0";
    this.reportSalesPRO.NRECORD_PAGE = "0";

    this.reportsalesproService.getPostReportSalesPRO(this.reportSalesPRO)
      .subscribe(
        data => {
          this.ListReportSalesPROReport = <any[]>data;
          if (this.ListReportSalesPROReport.length > 0) {
            this.excelService.exportReportSalesPRO(this.ListReportSalesPROReport, 'ReporteCanalVentaProtecta');
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  isDateCorrect(event, valDate: string) {
    //console.log('valDate:' + valDate);
    const splitted = valDate.split('-');
    if (Number(splitted[0]) > 2015) {
      return true;
    } else {
      return false;
    }
  }

}
