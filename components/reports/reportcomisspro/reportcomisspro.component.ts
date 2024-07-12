import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { ReportComissPROService } from '../../../services/reportcomisspro/reportcomisspro.service';
import { ReportComissPRO } from '../../../models/reportcomisspro/reportcomisspro';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { ChannelpointComponent } from '../../../../../shared/components/common/channelpoint/channelpoint.component';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ValidatorService } from '../../../../../shared/services/general/validator.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reportcomisspro',
  templateUrl: './reportcomisspro.component.html',
  styleUrls: ['./reportcomisspro.component.css']
})
export class ReportcomissproComponent implements OnInit {

  // paginacion
  page: number;

  /*Variables de paginacion */
  public itemsPerPage = 4;
  public totalItems = 0;
  public currentPage = 0;
  paginacion: any = {};
  rotate = true;
  maxSize = 5;
  listErrores = [];
  fExistRegistro: any = false;
  // Parametros de Filtros
  resultStateSalesReport = '0';
  resultSalesModeReport = '0';
  resultChannelSalesReport = '';
  resultChannelPointReport = '';
  resultPaymentTypeReport = '0';
  resultError = true;
  listado: any[];
  filter: any = {};
  mensaje: string;
  ListReportComissPRO: any[];
  ListReportComissPROReport: any[];
  reportComissPRO: ReportComissPRO;
  msgErrorLista = '';
  // prueba
  @Input() sideBar: ChannelpointComponent;


  constructor(private reportcomisscvService: ReportComissPROService, private excelService: ExcelService,
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

  onVotedParentPaymentType(idPaymentType: string) {
    this.resultPaymentTypeReport = idPaymentType;
  }
  onVotedParentStateSales(idStateSales: string) {
    this.resultStateSalesReport = idStateSales;
  }
  onVotedParentSalesMode(idSalesMode: string) {
    this.resultSalesModeReport = idSalesMode;
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
    this.ListReportComissPRO = [];
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
    this.reportComissPRO = new ReportComissPRO(this.resultStateSalesReport, this.resultSalesModeReport,
                                              this.utilityService.getValueDefault(this.filter.FPrimaIni),
                                              this.utilityService.getValueDefault(this.filter.FPrimaFin),
                                              this.utilityService.getFormatDate(this.filter.FDateIni),
                                              this.utilityService.getFormatDate(this.filter.FDateFin),
                                              this.utilityService.getValueDefault(this.filter.FPoliza),
                                              this.resultChannelSalesReport, this.resultChannelPointReport,
                                              this.paginacion.CurrentPage, this.paginacion.ItemsPerPage);
    //console.log(this.reportComissPRO);
    this.reportcomisscvService.getPostReportComissCV(this.reportComissPRO)
      .subscribe(
        data => {
          this.ListReportComissPRO = <any[]>data;
          //console.log(this.ListReportComissPRO);
          this.msgErrorLista = '';
          if (this.ListReportComissPRO.length > 0) {
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
    //console.log(event);
    this.reportComissPRO = new ReportComissPRO(this.resultStateSalesReport, this.resultSalesModeReport,
                                              this.utilityService.getValueDefault(this.filter.FPrimaIni),
                                              this.utilityService.getValueDefault(this.filter.FPrimaFin),
                                              this.utilityService.getFormatDate(this.filter.FDateIni),
                                              this.utilityService.getFormatDate(this.filter.FDateFin),
                                              this.utilityService.getValueDefault(this.filter.FPoliza),
                                              this.resultChannelSalesReport, this.resultChannelPointReport,
                                              this.paginacion.CurrentPage, this.paginacion.ItemsPerPage);
    this.reportComissPRO.NPAGE = "0";
    this.reportComissPRO.NRECORD_PAGE = "0";

    this.reportcomisscvService.getPostReportComissCV(this.reportComissPRO)
      .subscribe(
        data => {
          this.ListReportComissPROReport = <any[]>data;
          if (this.ListReportComissPROReport.length > 0) {
            this.excelService.exportReportComissPRO(this.ListReportComissPROReport, 'ReporteComisionPRO');
          }
        },
        err => {
          console.log(err);
        }
      );
  }

}
