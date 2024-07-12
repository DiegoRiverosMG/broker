import { Component, OnInit, Input } from '@angular/core';
import { ReportSalesCFService } from '../../../services/reportsalescf/reportsalescf.service';
import { ReportSalesCF } from '../../../models/reportsalescf/reportsalescf';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ValidatorService } from '../../../../../shared/services/general/validator.service';
import { UbigeoComponent } from '../../../../../shared/components/common/ubigeo/ubigeo.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reportsalescf',
  templateUrl: './reportsalescf.component.html',
  styleUrls: ['./reportsalescf.component.css']
})
export class ReportsalescfComponent implements OnInit {

  /*Variables de paginacion */
  page: number;
  paginacion: any = {};
  rotate = true;
  maxSize = 5;
  public itemsPerPage = 4;
  public totalItems = 0;
  public currentPage = 0;

  // Variable indica si se obtuvo o no Informacion
  fExistRegistro: any = false;

  // Parametros de Filtros
  resultUsoReport = '0';
  resultDepReport = '0';
  resultProReport = '0';
  resultDisReport = '0';
  resultStateSalesReport = '0';
  resultChannelSalesReport = '0';
  resultSalesModeReport = '0';
  filter: any = {};

  resultError = true;
  listErrores = [];
  listado: any[];
  mensaje: string;
  ListReportSalesCF: any[];
  ListReportSalesCFExport: any[];
  reportSalesCF: ReportSalesCF;
  msgErrorLista = '';
  constructor(private reportsalescfService: ReportSalesCFService, private excelService: ExcelService,
    public utilityService: UtilityService, private validatorService: ValidatorService, private datePipe: DatePipe) {
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

  /*onVotedParentPaymentType(idPaymentType: string) {
    this.resultPaymentTypeReport = idPaymentType;
  }*/
  onVotedParentSalesMode(idSalesMode: string) {
    this.resultSalesModeReport = idSalesMode;
  }

  onVotedParentStateSales(idStateSales: string) {
    this.resultStateSalesReport = idStateSales;
  }
  onVotedParentChannelSales(idChannelSales: string) {
    this.resultChannelSalesReport = idChannelSales;
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
    this.ListReportSalesCF = [];
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
    this.reportSalesCF = new ReportSalesCF(this.resultDepReport, this.resultProReport, this.resultDisReport,
      this.resultStateSalesReport, this.resultSalesModeReport,
      this.utilityService.getValueDefault(this.filter.FPrimaIni),
      this.utilityService.getValueDefault(this.filter.FPrimaFin), this.resultUsoReport,
      this.utilityService.getFormatDate(this.filter.FDateIni),
      this.utilityService.getFormatDate(this.filter.FDateFin),
      this.utilityService.getValueDefault(this.filter.FPoliza),
      this.paginacion.CurrentPage,
      this.paginacion.ItemsPerPage);
    // console.log(this.reportSalesCF);
    this.reportsalescfService.getPostReportSalesCF(this.reportSalesCF)
      .subscribe(
        data => {
          this.ListReportSalesCF = <any[]>data;
          this.msgErrorLista = '';
          if (this.ListReportSalesCF.length > 0) {
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
    // tslint:disable-next-line:no-debugger
    this.currentPage = pageNo;
  }
  pageChanged(event: any): void {
    this.page = event.page;
    this.currentPage = event.page - 1;
    this.loadReporteCF();
  }

  EventDownload(event) {
    this.reportSalesCF = new ReportSalesCF(this.resultDepReport, this.resultProReport, this.resultDisReport,
      this.resultStateSalesReport, this.resultSalesModeReport,
      this.utilityService.getValueDefault(this.filter.FPrimaIni),
      this.utilityService.getValueDefault(this.filter.FPrimaFin), this.resultUsoReport,
      this.utilityService.getFormatDate(this.filter.FDateIni),
      this.utilityService.getFormatDate(this.filter.FDateFin),
      this.utilityService.getValueDefault(this.filter.FPoliza),
      this.paginacion.CurrentPage,
      this.paginacion.ItemsPerPage);
    this.reportSalesCF.NPAGE = '0';
    this.reportSalesCF.NRECORD_PAGE = '0';

    this.reportsalescfService.getPostReportSalesCF(this.reportSalesCF)
      .subscribe(
        data => {
          this.ListReportSalesCFExport = <any[]>data;
          if (this.ListReportSalesCFExport.length > 0) {
            this.excelService.exportReportSalesCF(this.ListReportSalesCFExport, 'ReporteClienteFinal');
          }
        },
        err => {
          console.log(err);
        }
      );
  }

}
