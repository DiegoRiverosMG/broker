import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ReportSalesCF } from '../../../models/reportsalescf/reportsalescf';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ValidatorService } from '../../../../../shared/services/general/validator.service';
import { UbigeoComponent } from '../../../../../shared/components/common/ubigeo/ubigeo.component';
import { DatePipe } from '@angular/common';
import { SalesClientReportService } from '../../../services/report/sales-client-report.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import swal from 'sweetalert2';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-sale-client-report',
  templateUrl: './sale-client-report.component.html',
  styleUrls: ['./sale-client-report.component.css']
})
export class SaleClientReportComponent implements OnInit {

  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;

  /*Variables de paginacion */
  paginacion: any = {};
  currentPage = 1; //página actual
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  listToShow: any[] = [];

  // Variable indica si se obtuvo o no Informacion
  fExistRegistro: any = false;
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueIniMax: Date = new Date();
  bsValueFinMin: Date = new Date();
  bsValueFinMax: Date = new Date();

  // Parametros de Filtros

  resultStateSalesReport = '0';
  transaccionList: any = [];
  productList: any = [];
  filter: any = {};

  resultError = true;
  listErrores = [];
  listado: any[];
  mensaje: string;
  listSalesReport: any = [];
  // ListReportSalesCFExport: any[];
  // reportSalesCF: ReportSalesCF;
  msgErrorLista = '';
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  nbranch: any = '';

  constructor(
    private clientInformationService: ClientInformationService,
    private salesClientReportService: SalesClientReportService,
    private policyemit: PolicyemitService,
    private excelService: ExcelService,
    public utilityService: UtilityService,
    private datePipe: DatePipe) {

    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false
      }
    );

    this.filter.FPrimaIni = '';
    this.filter.FPrimaFin = '';
    this.filter.FPoliza = '';
    this.filter.transaccion = '';
    this.filter.product = ''
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.CurrentPage = this.currentPage;
  }

  async ngOnInit() {
    this.msgErrorLista = 'No se encontraron registros';

    this.filter.FDateIni = new Date();
    this.filter.FDateIni.setMonth(this.filter.FDateIni.getMonth() - 12);
    this.filter.FDateFin = new Date();
    this.bsValueIniMax = new Date();
    this.bsValueFinMin = this.filter.FDateIni;
    this.bsValueFinMax = new Date();


    this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
    this.getTransaccionList();
    this.getProductList();
  }

  getTransaccionList() {
    this.policyemit.getTransaccionList().subscribe(
      res => {
        this.transaccionList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getProductList() {
    this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.nbranch).subscribe(
      res => {
        this.productList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  valInicio(event) {
    this.bsValueFinMin = new Date(this.filter.FDateIni);

  }
  valFin(event) {
    this.bsValueIniMax = new Date(this.filter.FDateFin);
  }

  onVotedParentStateSales(idStateSales: string) {
    this.resultStateSalesReport = idStateSales;
  }

  EventSearch(event) {
    this.loadReporteCF();
  }

  loadReporteCF(): void {
    this.paginacion.CurrentPage = this.currentPage;
    let data: any = {}
    data.P_NESTADO = this.resultStateSalesReport
    data.P_NTIPO_TRANSAC = this.filter.transaccion
    data.P_NPOLIZA = this.filter.FPoliza
    data.P_NPRODUCT = this.filter.product
    data.P_PRIMA_DESDE = this.filter.FPrimaIni
    data.P_PRIMA_HASTA = this.filter.FPrimaFin
    data.P_TRANS_DESDE = this.filter.FDateIni.getDate().toString().padStart(2, '0') + '/' + (this.filter.FDateIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.filter.FDateIni.getFullYear()
    data.P_TRANS_HASTA = this.filter.FDateFin.getDate().toString().padStart(2, '0') + '/' + (this.filter.FDateFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.filter.FDateFin.getFullYear()

    this.salesClientReportService.getSaleClientReport(data)
      .subscribe(
        res => {
          this.listSalesReport = res;
          this.msgErrorLista = '';
          if (this.listSalesReport.length > 0) {
            this.fExistRegistro = true;
            this.totalItems = this.listSalesReport.length;
            this.listToShow = this.listSalesReport.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
          } else {
            this.fExistRegistro = false;
            this.msgErrorLista = 'No se encontraron registros';
          }
        },
        error => {
          this.fExistRegistro = false;
          this.msgErrorLista = 'Error de Sistemas. Comunicarse con Soporte!';
        }
      );
  }

  setPage(pageNo: number): void {
    // tslint:disable-next-line:no-debugger
    this.currentPage = pageNo;
  }

  pageChanged(currentPage: any): void {
    this.currentPage = currentPage;
    this.listToShow = this.listSalesReport
    this.listToShow = this.listSalesReport.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  mostrarMas() {
    this.pageChanged(1);
  }

  EventDownload(event) {
    if (this.listSalesReport.length > 0) {
      this.excelService.exportReportKunturSalesCF(this.listSalesReport, 'ReporteVentaKunturCliente');
    } else {
      swal.fire('Información', 'No hay registros para el reporte', 'error');
    }
  }


}
