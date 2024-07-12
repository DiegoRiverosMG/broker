import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { TableType } from '../../models/commissionlot/tabletype';
import { LogsUsuarios } from '../../models/logs/logsUsuarios';
import { CommissionLotService } from '../../services/commisslot/comissionlot.service';
import { LogsService } from '../../services/logs/logs.service';

@Component({
  selector: 'app-logs-usuarios',
  templateUrl: './logs-usuarios.component.html',
  styleUrls: ['./logs-usuarios.component.css']
})
export class LogsUsuariosComponent implements OnInit {

  public bsConfig: Partial<BsDatepickerConfig>;
  // Array para los campos de tipo texto
  public InputsFilter: any = {};

  npage = 1;
  paginacion: any = {};
  rotate = true;
  maxSize = 5;
  public currentPage = 0;
  public itemsPerPage = 10;
  public totalItems = 0;
  public tipoCanal = 0;
  public idUser = 0;
  canalHist: number;
  msgErrorLista = '';
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  showfilterChannel: boolean;
  channelSales: ChannelSales;
  ListChannelSales: any[];
  ListUsers: any[];
  ListPages: any[];
  ListEvensLogs: LogsUsuarios[];

  ListEvensLogsExport: LogsUsuarios[];
  // Variable indica si se obtuvo o no Informacion
  fExistRegistro: any = false;

  ListLogs: LogsUsuarios[];
  ObjEvenlogs =
    new LogsUsuarios('01/01/2017', '31/12/2017', '', '', '', '', 0, '', 0, '', '', '', '', '', '', '', 0, 0, 0, 0);
  constructor(
    private eventLogService: LogsService,
    private channelSalesService: ChannelSalesService,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private datePipe: DatePipe) {
    this.bsConfig = Object.assign({},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true
      });
    this.InputsFilter.P_DATEBEGIN = '';
    this.InputsFilter.P_DATEEND = '';
    this.InputsFilter.P_SCODCHANNEL = '';
    this.InputsFilter.P_SIDUSER = '0';
    this.InputsFilter.P_SPAGE = '0';
    this.InputsFilter.P_SOPTION = '';
    // Variables de salida

    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.npage = this.npage;
  }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.tipoCanal = +currentUser.tipoCanal;
    this.canalHist = currentUser.canal;
    this.idUser = currentUser.id;
    this.LoadChannelSales();
    this.onSelectChannelSales(this.canalHist);
  }

  onEventSearch() {
    const datebegin = this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy').split('/');
    this.InputsFilter.P_DATEBEGIN = datebegin[2] + datebegin[1] + datebegin[0];
    const dateend = this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy').split('/');
    this.InputsFilter.P_DATEEND = dateend[2] + dateend[1] + (+dateend[0] + 1);
    this.npage = 0;
    this.onLoadLogEvents();
  }



  pageChanged(event: any): void {
    this.paginacion.npage = event.page;
    this.onLoadLogEvents();
  }

  onSelectChannelSales(channelSalesId) {
    if (channelSalesId === '0') {
      this.InputsFilter.P_SCODCHANNEL = this.canalHist;
    } else {
      this.InputsFilter.P_SCODCHANNEL = channelSalesId;
    }
    this.LoadUsers(channelSalesId);

  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let nusercode = currentUser && currentUser.id;
    if (nusercode === 52) {
      nusercode = 36;
    }
    this.channelSales = new ChannelSales(nusercode, '0', '');
    this.spinner.show();
    this.channelSalesService.getPostChannelSales(this.channelSales).subscribe(
      data => {
        this.ListChannelSales = <any[]>data;
        this.ListChannelSales = this.ListChannelSales.sort((a, b) => (a.sdescript < b.sdescript ? -1 : 1));
        if (this.ListChannelSales.length === 1) {
          this.showfilterChannel = true;
        } else {
          this.showfilterChannel = false;
        }

        this.spinner.hide();
      },
      error => {
        console.log(error);
      }
    );
  }

  LoadUsers(channel): void {
    const tableType = new TableType(+channel, '', 0);
    this.spinner.show();
    this.eventLogService.getUsersByChannel(tableType).subscribe(
      data => {
        this.ListUsers = <any[]>data;
        this.ListUsers = this.ListUsers.sort((a, b) => (a.firstName < b.firstName ? -1 : 1));
        this.onSelectUser(0);
        this.spinner.hide();
      },
      error => {
        console.log(error);
        this.spinner.hide();
      }
    );

  }

  onSelectUser(user) {
    this.InputsFilter.P_SIDUSER = user;
    this.LoadPages(user);
  }

  LoadPages(user): void {
    this.spinner.show();
    this.eventLogService.getPagesByUser(user, this.InputsFilter.P_SCODCHANNEL).subscribe(
      data => {
        this.ListPages = <LogsUsuarios[]>data;
        this.InputsFilter.P_SPAGE = 0;

        this.spinner.hide();
      },
      error => {
        console.log(error);
        this.spinner.hide();
      }
    );

  }

  onSelectPage(page): void {
    this.InputsFilter.P_SPAGE = page;
  }

  onLoadLogEvents() {
    this.ObjEvenlogs = new LogsUsuarios(
      this.InputsFilter.P_DATEBEGIN,
      this.InputsFilter.P_DATEEND,
      this.InputsFilter.P_SCODCHANNEL,
      this.InputsFilter.P_SIDUSER,
      this.InputsFilter.P_SPAGE,
      '',
      0,
      '',
      0,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      0, 0,
      this.paginacion.npage,
      this.paginacion.ItemsPerPage,
    );
    this.spinner.show();
    this.eventLogService.getEventLogs(this.ObjEvenlogs).subscribe(
      data => {
        this.ListEvensLogs = <LogsUsuarios[]>data;
        if (this.ListEvensLogs.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = data[0].nrecorD_COUNT;
        } else {
          this.fExistRegistro = false;
          this.msgErrorLista = 'No se encontraron Registros..';
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        console.log(error);
      }
    );

  }
  EventDownload(event) {
    this.ObjEvenlogs = new LogsUsuarios(
      this.InputsFilter.P_DATEBEGIN,
      this.InputsFilter.P_DATEEND,
      this.InputsFilter.P_SCODCHANNEL,
      this.InputsFilter.P_SIDUSER,
      this.InputsFilter.P_SPAGE,
      '',
      0,
      '',
      0,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      0, 0,
      this.paginacion.npage,
      this.paginacion.ItemsPerPage,
    );
    this.ObjEvenlogs.NPAGE = 0;
    this.ObjEvenlogs.NRECORDPAGE = 0;
    this.eventLogService.getEventLogs(this.ObjEvenlogs).subscribe(
      data => {
        this.ListEvensLogsExport = <LogsUsuarios[]>data;

        if (this.ListEvensLogsExport.length > 0) {
          this.excelService.exportReportEventsUsuarios(this.ListEvensLogsExport, 'ReporteEventosUsuarios');
        }
      },
      error => {
        console.log(error);
      }
    );

  }

}
