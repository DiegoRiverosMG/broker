import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';

import { Payroll } from '../../models/payroll/payroll';
import { PayrollService } from '../../services/payroll/payroll.service';
import { PayrollFilter } from '../../models/payroll/payrollfilter';
import { StateChannelType } from '../../models/state/statechanneltype';
import { StateService } from '../../services/state/state.service';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe, DecimalPipe } from '@angular/common';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PayrollCab } from '../../models/payroll/payrollcab';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { ConcPayroll } from '../../models/payroll/concpayroll';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommissionState } from '../../models/commissionlot/commissionstate';
import { CommissionLotService } from '../../services/commisslot/comissionlot.service';

defineLocale('es', esLocale);
@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.css']
})
export class CommissionComponent implements OnInit {

  public bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  dia = this.fecha.getDate();
  mes = this.fecha.getMonth() === 0 ? 1 : this.fecha.getMonth();
  anio = this.fecha.getFullYear();

  bsValueIni: Date = new Date(this.anio + '-' + this.mes + '-' + this.dia);
  bsValueFin: Date = new Date();
  isAdmin: boolean;

  lstComision: any[];
  lstEstadoComision: CommissionState[];
  lstCanales: any[];
  idCanal = 0;
  idEstado = 0;

  public InputsFilter: any = {};
  npage = 0;

  public totalItems = 0;
  public itemsPerPage = 15;
  fExistRegistro: any = false;
  msgErrorLista = '';

  rotate = true;
  maxSize = 10;
  currentPage = 0;

  constructor(private payrollService: PayrollService,
    public datePipe: DatePipe,
    public decimalPipe: DecimalPipe,
    public utilityService: UtilityService,
    private excelService: ExcelService,
    private channelSalesService: ChannelSalesService,
    private commissionlotService: CommissionLotService,
    private spinner: NgxSpinnerService,
  ) {

  }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.bsConfig = Object.assign({},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true
      });

    this.isAdmin = true; // currentUser.profileId === 20;

    if (this.isAdmin) {
      this.LoadChannelSales();
    }
    this.cargarEstadosComision();
  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;
    const lstChannelRequest = new ChannelSales(nusercode, '0', '');
    this.channelSalesService.getPostChannelSales(lstChannelRequest)
      .subscribe(
        data => {
          this.lstCanales = <any[]>data;
          this.lstCanales = this.lstCanales.filter(n => n.nchannel !== 2015000002);

          // this.onSelectChannel(this.lstCanales[0].nchannel);
          // this.buscarComisiones();
        },
        error => {
          console.log(error);
        }
      );
  }

  buscarComisiones() {
    this.npage = 1;
    this.totalItems = 0;
    this.lstComision = [];
    this.solicitarComisiones();
  }

  solicitarComisiones() {
    const request = {
      IdCanal: this.idCanal,
      IdPuntoVenta: null,
      FechaInicio: this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy'),
      FechaFin: this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy'),
      Pagina: this.npage,
      CantidadRegistros: this.itemsPerPage,
      IdEstado: this.idEstado
    };

    this.spinner.show();

    this.payrollService.getComissions(request).subscribe(
      data => {
        this.lstComision = <any[]>data;
        this.fExistRegistro = this.lstComision.length > 0;
        this.totalItems = this.lstComision.length > 0 ? this.lstComision[0].cantidadRegistros : 0;
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        console.log(error);
      }
    );

  }

  pageChanged(event: any): void {
    this.npage = event.page;
    this.solicitarComisiones();
  }

  onSelectChannel(canal: number) {
    this.lstComision = [];
    this.totalItems = 0;
    this.idCanal = Number(canal);
  }

  onVotedParentChannelSales(idChannelSales: string) {
    this.totalItems = 0;
    this.InputsFilter.P_NID_NCHANNELTYPE = idChannelSales;
  }

  onVotedParentChannelPoint(idChannelSales: string) {
    if (idChannelSales === '') {
      idChannelSales = null;
    }
    this.InputsFilter.P_NID_NSALESPOINT = idChannelSales;
    this.buscarComisiones();
  }

  descargarExcel() {
    const request = {
      IdCanal: this.idCanal,
      IdPuntoVenta: null,
      FechaInicio: this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy'),
      FechaFin: this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy'),
      Pagina: 0,
      CantidadRegistros: 0,
      IdEstado: this.idEstado
    };

    this.spinner.show();

    this.payrollService.getComissions(request).subscribe(
      data => {
        this.excelService.exportComission(<any[]>data, 'ReporteComision');
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        console.log(error);
      }
    );

  }

  cargarEstadosComision() {
    // console.log("get onGetCommissionState");
    const commissionstate = new CommissionState(0, '');

    this.commissionlotService.getCommissionState(commissionstate).subscribe(
      data => {
        this.lstEstadoComision = <CommissionState[]>data;
      },
      error => { }
    );
  }

  seleccionEstado(estado) {
    this.idEstado = Number(estado);
  }


}
