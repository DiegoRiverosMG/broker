import { Component, OnInit, ViewChild } from '@angular/core';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { PrepayrollService } from '../../../services/prepayroll/prepayroll.service';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { StateChannelType } from '../../../models/state/statechanneltype';
import { StateService } from '../../../services/state/state.service';
import { PrepayrollFilter } from '../../../models/prepayroll/prepayroll-filter.model';

import { ModalDirective, BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { Router } from '../../../../../../../node_modules/@angular/router';
import { AppConfig } from '../../../../../app.config';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { PrepayrollItemList } from '../../../models/prepayroll/prepayroll-list.model';
import { DatePipe } from '../../../../../../../node_modules/@angular/common';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { Prepayroll } from '../../../models/prepayroll/prepayroll.model';
import { PrepayrollPayment } from '../../../models/prepayroll/prepayroll-payment.model';
import { PrepayrollDetail } from '../../../models/prepayroll/prepayroll-detail.model';
defineLocale('es', esLocale);

@Component({
  selector: 'app-prepayroll-list',
  templateUrl: './prepayroll-list.component.html',
  styleUrls: ['./prepayroll-list.component.css']
})
export class PrePayrollListComponent implements OnInit {
  //#region Variables de Clase
  @ViewChild('childModalConfirmasivo', { static: true }) childModalConfirmasivo: ModalDirective;
  message: string;
  messageinfo: string;
  IdPrePayroll: number;
  modalRef: BsModalRef;
  usuario: any;
  mensajeError = 'No se encontraron registros...';
  lista = [];
  //listaCanales = [];
  listaCanales: any[];
  listaEstadoCanal = [];
  ListCodChannel = '';
  canal: ChannelSales;

  fecha = new Date();
  dia = this.fecha.getDate();
  mes = this.fecha.getMonth() == 0 ? 1 : this.fecha.getMonth();// this.fecha.getMonth() - 0;
  anio = this.fecha.getFullYear();

  dpValueIni: Date = new Date(this.anio + '-' + this.mes + '-' + this.dia);
  dpValueFin: Date = new Date();
  filtrosBus: PrepayrollFilter;
  public bsConfig: Partial<BsDatepickerConfig>;
  bInit = true;
  public itemsPerPage = 5;
  public totalItems = 0;
  fExistRegistro: any = false;
  npage = 1;
  paginacion: any = {};
  prePayRoll: Prepayroll;
  ListPrePayRollGeneral: any = {};
  listPrePayrollDetail = [];
  listPrepayrollPayment = [];

  //#endregion

  constructor(private router: Router,
    private datePipe: DatePipe,
    private prepayrollService: PrepayrollService,
    private channelSalesService: ChannelSalesService,
    private estadosService: StateService,
    private excelService: ExcelService,
  ) {
    this.bsConfig = Object.assign({},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true
      });
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.npage = this.npage;
  }

  ngOnInit() {
    this.initComponent();
  }

  initComponent() {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.setValoresFiltros();
    this.listarEstados();
  }

  setValoresFiltros() {
    if (this.bInit) {
      this.filtrosBus = new PrepayrollFilter();
      this.filtrosBus.CodigoCanal = '0';
      this.filtrosBus.CodigoCanalConcatenado = '0';
      this.filtrosBus.Estado = '0';
      this.filtrosBus.Id = '0';
      this.filtrosBus.NumeroPagina = this.paginacion.npage;
      this.filtrosBus.RegistrosPorPagina = this.paginacion.ItemsPerPage;
      this.filtrosBus.FechaInicial = this.datePipe.transform(this.dpValueIni, 'dd/MM/yyyy');
      this.filtrosBus.FechaFinal = this.datePipe.transform(this.dpValueFin, 'dd/MM/yyyy');

      this.bInit = false;
    } else {
      this.filtrosBus.FechaInicial = this.datePipe.transform(this.dpValueIni, 'dd-MM-yyyy');
      this.filtrosBus.FechaFinal = this.datePipe.transform(this.dpValueFin, 'dd-MM-yyyy');
      this.filtrosBus.NumeroPagina = this.paginacion.npage;
      this.filtrosBus.RegistrosPorPagina = this.paginacion.ItemsPerPage;
    }
  }

  listarEstados() {
    const filtro = new StateChannelType(9999, '', 9999, 0);

    this.estadosService
      .GetStatexChannelType(filtro)
      .subscribe(
        res => {
          this.listaEstadoCanal = <StateChannelType[]>res;
          this.listarCanalesVenta();
        },
        err => {
          console.log(err);
        }
      );
  }

  listarCanalesVenta() {
    this.canal = new ChannelSales(this.usuario.id, '0', '');

    this.channelSalesService
      .getPostChannelSales(this.canal)
      .subscribe(
        data => {
          this.listaCanales = <any[]>data;
          this.listaCanales.forEach(element => {
            this.ListCodChannel += element.nchannel + ',';
          });
          this.ListCodChannel = this.ListCodChannel.slice(0, -1);
          this.filtrosBus.CodigoCanalConcatenado = this.ListCodChannel;
          this.listarPreplanillas();
        },
        error => {
          console.log(error);
        }
      );
  }

  listarPreplanillas() {
    this.prepayrollService
      .listar(this.filtrosBus)
      .subscribe(
        res => {
          //console.log('preplanilla');
          //console.log(res);
          this.lista = res;

          if (this.lista.length > 0) {
            this.fExistRegistro = true;
            this.totalItems = this.lista[0].totalregistros;
          } else {
            this.fExistRegistro = false;
          }

        },
        err => {
          console.log(err);
        }
      );
  }




  onChangeEstado(estadoId) {
    // console.log(estadoId);
    // if (estadoId === '0') {
    // this.filtrosBus.Estado = this.ListStateID;
    // } else {
    this.filtrosBus.Estado = estadoId;
    // }
  }

  onChangeCanal(canalId) {
    // console.log(canalId);
    // if (canalId === '0') {
    // this.filtrosBus.CodigoCanal = this.ListCodChannel;
    // } else {
    //this.filtrosBus.CodigoCanal = canalId;
    // }
    //console.log(canalId);
    if (canalId == '0') {
      this.filtrosBus.CodigoCanalConcatenado = this.ListCodChannel;
    } else {
      this.filtrosBus.CodigoCanalConcatenado = canalId;
    }
  }

  onBuscar() {
    this.setValoresFiltros();
    this.listarPreplanillas();
  }

  onAddPrePlanilla() {
    //this.router.navigate(['broker/prepayrolladd']);
    this.router.navigate(['broker/prepayrolladd', 'add', 0, 0]);
  }


  onEventSearch() {
    this.npage = 0;
    this.onBuscar();
  }

  pageChanged(event: any): void {
    this.paginacion.npage = event.page;
    this.onBuscar();
  }

  EventDownload(event) {
    this.filtrosBus.NumeroPagina = 0;
    this.filtrosBus.RegistrosPorPagina = 0;
    this.prepayrollService
      .listar(this.filtrosBus)
      .subscribe(
        res => {
          if (res.length > 0) {
            this.excelService.exportReportPrePayroll(res, 'ReportePrePayRoll');
          } /*else {

        }*/

        },
        err => {
          console.log(err);
        }
      );
    // console.log(event);
    //
  }

  onImprimir(nropreplanilla: number) {
    this.prePayRoll = new Prepayroll(nropreplanilla, 0, 0, 0, '', '', '', '', 0, '', '', '', [], []);
    this.prepayrollService.GetPrePayRollGeneral(this.prePayRoll)
      .subscribe(
        data => {
          this.ListPrePayRollGeneral = <Prepayroll[]>data;
          this.listPrePayrollDetail = this.ListPrePayRollGeneral.detalles;
          this.listPrepayrollPayment = this.ListPrePayRollGeneral.pagos;
          if (this.ListPrePayRollGeneral.id > 0)
            this.excelService.exportReportPrePayrollGeneral(this.ListPrePayRollGeneral, this.listPrePayrollDetail, this.listPrepayrollPayment, 'ReportePrePayroll');
        },
        error => {
          console.log(error);
        }
      );
  }

  openModalConfirmacion(idprepayroll: string) {
    this.childModalConfirmasivo.show();
    this.message = 'Esta seguro de descargar el detalle de la Pre-Planilla? ';
    this.IdPrePayroll = +idprepayroll;
  }

  confirm(): void {
    this.onImprimir(this.IdPrePayroll);
    this.childModalConfirmasivo.hide();
  }

  closeconfirm(): void {
    this.childModalConfirmasivo.hide();
  }
  ActualizarPrePlanilla(id: number): void {
    this.router.navigate(['broker/prepayrolladd', 'upd', id, 0]);
  }
}
