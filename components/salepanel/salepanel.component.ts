import { ModalDirective } from 'ngx-bootstrap/modal';
import { ChannelPointService } from '../../../../shared/services/channelpoint/channelpoint.service';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Papel } from '../../models/papel/papel';
import { PapelService } from '../../services/papel/papel.service';
import { Router } from '@angular/router';
import { ChannelPoint } from '../../../../shared/models/channelpoint/channelpoint';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '../../../../app.config';
import { EventStrings } from '../../shared/events/events';
import { DebtReportService } from '../../services/debt-report/debt-report.service';
import { DebtReportModel } from '../../models/debt-report/debt-report.model';
import { IDebtReport } from '../../interfaces/debt-report.interface';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-sale-panel',
  templateUrl: './salepanel.component.html',
  styleUrls: [
    './salepanel.component.scss',
    './salepanel.component-mobile.scss',
  ],
})
export class SalePanelComponent implements OnInit {
  EventStrings: typeof EventStrings = EventStrings;
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Nro. de ventas por mes',
            fontSize: 14,
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Cantidad de ventas',
            fontSize: 14,
          },
        },
      ],
    },
    plugins: {
      datalabels: {
        color: '#2b0d61',
        formatter: function (value, context) {
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
      },
    },
  };

  public barChartLabels: Label[] = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  showGraph = false;
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: any[];
  public anios: any[];
  public dataGeneral: any = {};
  public dataEstado: any[];
  public itemStateSelected: any = {};

  showQ = true;
  isEvaluateLock = false;

  itemsVentas: Array<any>;

  formTypeChar: FormGroup;

  @ViewChild('childModalGrafica', { static: true })
  childModalGrafica: ModalDirective;
  Papel = new Papel();
  id = 0;
  nombre = '';
  canal = '';
  puntoVenta = '';
  indpuntoVenta = 0;
  cpLaser = 0;
  cpManual = 0;
  cpDigital = 0;
  hayComboPuntoVenta = false;
  ListChannelPoint: ChannelPoint[] = [];
  channelPoint = new ChannelPoint('', 0);

  bMostrarPuntoVentas = false;
  desLaser = false;
  desManual = false;
  desDigital = false;

  anioSelected: number;
  cboPuntoVenta: number;
  showquantity = false;

  constructor(
    private router: Router,
    private channelPointService: ChannelPointService,
    private papelService: PapelService,
    private emissionService: EmisionService,
    public cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private eventTracker: EmisionService,
    private readonly _debtReportService: DebtReportService,
    private readonly _builder: FormBuilder
  ) {
    this.itemsVentas = [];
    this.formTypeChar = this._builder.group({
      type: ['quantity'],
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.limpiarsession();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canal = currentUser && currentUser.canal;
    this.id = currentUser && currentUser.id;
    this.indpuntoVenta = currentUser && currentUser.indpuntoVenta;
    const puntoVenta = currentUser && currentUser.puntoVenta;
    this.nombre = currentUser && currentUser.firstName;
    if (this.indpuntoVenta === 0) {
      this.getVentaPapel(this.canal, 0);
    } else {
      this.getVentaPapel(this.canal, puntoVenta);
    }
    this.bMostrarPuntoVentas =
      this.indpuntoVenta === 0 || this.indpuntoVenta === undefined;
    if (this.bMostrarPuntoVentas) {
      this.setComboPuntoVenta();
    }
    this.evaluateLock();
    this.f['type'].valueChanges.subscribe((val) => {
      this.updateChart(val === 'quantity');
    });
    sessionStorage.removeItem('acept-terms-stepall');
  }
  get f(): any {
    return this.formTypeChar.controls;
  }

  evaluateLock() {
    this.spinner.show();

    const isAdmin = localStorage.getItem(AppConfig.PROFILE_ADMIN_GUID);
    const service =
      isAdmin !== '1'
        ? this.emissionService.informacionVentas()
        : this.emissionService.informacionVentasCanal(this.canal);

    service.subscribe(
      (res) => {
        this.dataGeneral = res;
        this.showGrafica(res.ventasHistoricas);
        this.isEvaluateLock = true;

        if (res.ventasEstado.length > 0) {
          this.dataEstado = res.ventasEstado?.map((item: any) => ({
            ...item,
            dataSelect: `${item.contratante} - ${item.tdr} (S/. ${parseFloat(
              item.lineaCredito
            ).toFixed(2)})`,
            mensaje: item.bloqueado
              ? 'No estás al día en tus pagos'
              : 'Felicidades! Estás al día en tus pagos',
          }));

          this.setItemState(this.dataEstado[0]?.idLineaCredito);
        }

        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  setItemState(id: number) {
    this.itemStateSelected = this.dataEstado.find(
      (item) => item.idLineaCredito == id
    );
  }

  showGrafica(data) {
    this.showGraph = false;

    this.anios = [];

    const loAnios = data
      .map((item) => item.anio)
      .filter((value, index, self) => self.indexOf(value) === index);
    this.anios = loAnios.sort(function (a, b) {
      if (a > b) {
        return -1;
      }
      if (a < b) {
        return 1;
      }
      return 0;
    });
    this.anioSelected = this.anios[0];
    this.prepareData(this.anios[0]);

    this.eventTracker
      .registrarEvento('', EventStrings.PANEL_VER_GRAFICA)
      .subscribe();
  }

  updateChart(val) {
    this.showQ = val;

    this.barChartOptions = {
      responsive: true,
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: this.showQ
                ? 'Nro. de ventas por mes'
                : 'monto en ventas por mes',
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: this.showQ
                ? 'Cantidad de ventas'
                : 'monto total en ventas',
            },
          },
        ],
      },
      plugins: {
        datalabels: {
          color: '#2b0d61',
          formatter: function (value, context) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
        },
      },
    };

    this.prepareData(this.anioSelected);
  }

  prepareData(anio) {
    const vnr = {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      label: 'Ventas no pagadas',
      stack: 'a',
      datalabels: {
        font: { size: '14' },
        display: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];

          return value > 0;
        },
      },
    };

    const vsr = {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      label: 'Ventas pagadas',
      stack: 'a',
      datalabels: {
        font: { size: '14' },
        display: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value > 0;
        },
      },
    };

    const cdv = {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      label: 'Total de ventas',
      type: 'line',
      datalabels: {
        align: 'bottom',
        offset: -21,
        font: {
          size: '14',
          weight: 'normal',
        },
        padding: { bottom: '10' },
      },
    };

    const mData = this.dataGeneral?.ventasHistoricas?.filter(
      (x) => Number((x as any).anio) === Number(anio)
    );
    for (let index = 0; index < mData.length; index++) {
      const element = mData[index];
      const dt = element as any;

      if (this.showQ) {
        vnr.data[Number(dt.mes) - 1] = dt.totalSinPlanilla;
        vsr.data[Number(dt.mes) - 1] = dt.totalConPlanilla;
        cdv.data[Number(dt.mes) - 1] = dt.totalVentas;
      } else {
        vnr.data[Number(dt.mes) - 1] = dt.primaSinPlanilla;
        vsr.data[Number(dt.mes) - 1] = dt.primaConPlanilla;
        cdv.data[Number(dt.mes) - 1] = dt.primaVentas;
      }
    }

    this.barChartData = [vnr, vsr, cdv];
    this.showGraph = true;
    this.cd.detectChanges();
    // this.childModalGrafica.show();
  }

  closeGrafica() {
    this.childModalGrafica.hide();
  }

  limpiarsession() {
    sessionStorage.removeItem('placa');
    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
  }

  validaDeshabilitados(tipo: number): boolean {
    let deshabilitado = false;
    if (tipo > 0) {
      if (this.bMostrarPuntoVentas) {
        if (this.hayComboPuntoVenta) {
          deshabilitado = true;
        }
      } else {
        deshabilitado = false;
      }
    } else {
      deshabilitado = false;
    }

    if (tipo > 0 && !this.bMostrarPuntoVentas) {
      deshabilitado = true;
    }
    return deshabilitado;
  }

  onComprarAll(tipo: number, porVender: number) {
    if (porVender == 0) {
      return;
    }
    sessionStorage.setItem(
      'Modalidad',
      JSON.stringify({ tipoCertificado: tipo })
    );

    this.eventTracker
      .registrarEvento(
        '',
        tipo === 2
          ? EventStrings.PANEL_SOAT_LASER
          : EventStrings.PANEL_SOAT_DIGITAL
      )
      .subscribe(() => {
        this.router.navigate(['broker/stepAll']);
      });
  }

  getVentaPapel(canal, puntoVenta) {
    this.spinner.show();
    return this.papelService.getVentaPapel(canal, puntoVenta).subscribe(
      (result) => {
        this.Papel = <Papel>result;
        this.cpLaser = Number(this.Papel.v_NTOTAL_LASER_NV);
        this.cpManual = Number(this.Papel.v_NTOTAL_MANUAL_NV);
        this.cpDigital = Number(this.Papel.v_NTOTAL_DIGITAL_NV);
        this.desDigital = this.validaDeshabilitados(this.cpDigital);
        this.desLaser = this.validaDeshabilitados(this.cpLaser);
        this.desManual = this.validaDeshabilitados(this.cpManual);
        this.itemsVentas = [
          {
            title: 'PÓLIZAS DIGITALES',
            ventas: this.Papel.v_NTOTAL_DIGITAL_V,
            porVender: this.Papel.v_NTOTAL_DIGITAL_NV,
            image: 'assets/icons/certificado_digital.svg',
            action: 3,
            type: 1,
          },
          {
            title: 'PÓLIZAS LÁSER URBANO',
            ventas: this.Papel.v_NTOTAL_LASER_V_PU,
            porVender: this.Papel.v_NTOTAL_LASER_NV_PU,
            image: 'assets/icons/certificado_laser.svg',
            action: 2,
            type: 2,
          },
          {
            title: 'PÓLIZAS LÁSER PARTICULAR',
            ventas: this.Papel.v_NTOTAL_LASER_V_PA,
            porVender: this.Papel.v_NTOTAL_LASER_NV_PA,
            image: 'assets/icons/certificado_laser.svg',
            action: 2,
            type: 3,
          },
        ];
        if (this.isEvaluateLock) {
          this.spinner.hide();
        }
      },
      (error) => {
        this.spinner.hide();
        console.log(<any>error);
      }
    );
  }

  setComboPuntoVenta() {
    const salePoint = new ChannelPoint(this.canal, this.indpuntoVenta);
    this.channelPointService.getPostChannelPoint(salePoint).subscribe(
      (data) => {
        this.ListChannelPoint = <ChannelPoint[]>data;
        if (this.ListChannelPoint.length === 1) {
          this.cboPuntoVenta = this.ListChannelPoint[0].nnumpoint;
          this.setPuntoVenta(this.cboPuntoVenta);
          this.cd.markForCheck();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  setPuntoVenta(id) {
    this.hayComboPuntoVenta = id !== undefined;
    this.getVentaPapel(this.canal, id);
    this.ActualizarLocalStorage(id);
  }

  ActualizarLocalStorage(pv: any) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const puntoVenta = pv;
    const desPuntoVenta = this.ListChannelPoint.find(
      (e) => Number(e.nnumpoint) === Number(pv)
    ).sdescript;
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: currentUser && currentUser['id'],
        username: currentUser && currentUser['username'],
        token: currentUser && currentUser['token'],
        firstName: currentUser && currentUser['firstName'],
        lastName: currentUser && currentUser['lastName'],
        lastName2: currentUser && currentUser['lastName2'],
        email: currentUser && currentUser['email'],
        canal: currentUser && currentUser['canal'],
        puntoVenta: puntoVenta,
        indpuntoVenta: currentUser && currentUser['indpuntoVenta'],
        desCanal: currentUser && currentUser['desCanal'],
        desPuntoVenta: desPuntoVenta,
        tipoCanal: currentUser && currentUser['tipoCanal'],
        tdocument: currentUser && currentUser['tdocument'],
        dni: currentUser && currentUser['dni'],
        sclient: currentUser && currentUser['sclient'],
        menu: currentUser && currentUser['menu'],
        brokerId: currentUser && currentUser['brokerId'],
        intermediaId: currentUser && currentUser['intermediaId'],
        profileId: currentUser && currentUser['profileId'],
        permissionList: currentUser && currentUser['permissionList'],
        flagCambioClave: currentUser && currentUser['flagCambioClave'],
        productoPerfil: currentUser && currentUser['productoPerfil'],
      })
    );
  }

  Irhistorial(): void {
    this.router.navigate(['broker/historial']);
  }
  textItemVenta(vendidos?: any): string {
    return `${vendidos} Vendidos`;
  }
  textAmmountVenta(porVender): string {
    return `${porVender} por vender`;
  }
  exportToExcel(): void {
    this.spinner.show();
    const channel = sessionStorage.getItem('canalVentaCliente');
    this._debtReportService.getData(channel).subscribe(
      (res: Array<IDebtReport>) => {
        console.dir(res);
        this.spinner.hide();
        if (!!res?.length) {
          this._debtReportService.exportToExcel(new DebtReportModel(res));
        }
      },
      (err: any) => {
        console.error(err);
        this.spinner.hide();
      }
    );
  }
}
