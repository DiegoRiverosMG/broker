import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';

import { CommisionCoService } from '../../services/commission-channel/commission-channel.service';
import {
  ChannelSales,
  PuntoVentas,
  Estados,
  Monedas,
  Ramo,
  Productos,
  EstadoL,
  Listado,
  ListadoP,
} from '../../models/commission-channel/commission-channel.model';
import { UtilsService } from '@shared/services/utils/utils.service';
import { IExportExcel } from '../../../../shared/interfaces/export-excel.interface';

@Component({
  selector: 'app-commission-channel',
  templateUrl: './commission-channel.component.html',
  styleUrls: ['./commission-channel.component.scss'],
})
export class CommissionCoComponent implements OnInit, AfterViewInit {
  bsConfig: Partial<BsDatepickerConfig>;
  dataCommision: any = {};
  dataCommisionExcel: any = {};
  formFiltros: FormGroup;
  canales = [];
  canalesFull = [];
  ListChannelPoint: any[];
  estados = [];
  monedas = [];
  ramo: any = [];
  productos: any = [];
  estadosL = [];
  xestado: number;
  pagina: number;

  totalItems: number;

  // FECHAS
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  usuario: any;
  @ViewChild('myChart', { read: ElementRef }) Canvas: ElementRef;
  @ViewChild('myChart2', { read: ElementRef }) Canvas2: ElementRef;
  @ViewChild('myChart3', { read: ElementRef }) Canvas3: ElementRef;
  constructor(
    private readonly commisionCoService: CommisionCoService,
    private readonly builder: FormBuilder,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly utilsService: UtilsService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.formFiltros = this.builder.group({
      canal: [null, Validators.required],
      puntoVenta: [null],
      ramo: [0],
      producto: [0],
      poliza: [null, Validators.pattern(/^[0-9]*$/)],
      fechaD: ['01/01/2020'],
      fechaH: [this.bsValueFin],
      lote: [null, Validators.pattern(/^[0-9]*$/)],
      planilla: [null, Validators.pattern(/^[0-9]*$/)],
      estadoC: [0],
      disponibilidad: [-1],
      estadoL: [0],
    });
  }
  // PAGINADO
  currentPage = 0;
  p = 0;

  ngAfterViewInit(): void {
    /*GRÁFICO
    const myChart = new Chart(this.Canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [
          'Potencial',
          'Pendiente de Pago',
          'Por cobrar',
          'Liquidado',
          'Pagado',
          'Anulado',
        ],
        datasets: [
          {
            label: 'Cantidad',
            data: [17, 19, 12, 11, 17, 20],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {},
    });
    const myChart2 = new Chart(this.Canvas2.nativeElement, {
      type: 'bar',
      data: {
        labels: [
          'Potencial',
          'Pendiente de Pago',
          'Por cobrar',
          'Liquidado',
          'Pagado',
          'Anulado',
        ],
        datasets: [
          {
            label: 'Monto',
            data: [12, 19, 25, 18, 16, 11],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {},
    });
    const myChart3 = new Chart(this.Canvas3.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Disponibilizadas', 'Por Disponibilizar'],
        datasets: [
          {
            label: 'My First Dataset',
            data: [300, 100],
            backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          },
        ],
      },
    }); */
  }

  get f(): any {
    return this.formFiltros.controls;
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.getChannel();
    this.getEstados();
    this.getCurrency();
    this.getbranch();
    this.getcommissionlotstate();

    this.formFiltros.get('canal').setValue(this.usuario.canal);

    this.f['poliza'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['poliza'].hasError('pattern')) {
          this.f['poliza'].setValue(val.substring(0, val.length - 1));
        }
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 0) {
          this.f['poliza'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.f['lote'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['lote'].hasError('pattern')) {
          this.f['lote'].setValue(val.substring(0, val.length - 1));
        }
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 0) {
          this.f['lote'].setValue(val.substring(0, val.length - 1));
        }
      }
    });

    this.f['planilla'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['planilla'].hasError('pattern')) {
          this.f['planilla'].setValue(val.substring(0, val.length - 1));
        }
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 0) {
          this.f['planilla'].setValue(val.substring(0, val.length - 1));
        }
      }
    });
  }

  nuevoTramite() {
    this.spinner.show();
    this.router.navigate(['broker/commissionlot']);
    this.spinner.hide();
  }
  getChannel() {
    const datos = new ChannelSales(this.usuario.id, '0', '');
    this.commisionCoService.getChannel(datos).subscribe(
      (res) => {
        this.canalesFull = this.canales = <any[]>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  searchCanales(search: string) {
    if (search) {
      this.canales = this.canalesFull.filter(
        (s) => s.sdescript.toLowerCase().indexOf(search.toLowerCase()) >= 0
      );
    } else {
      this.canales = this.canalesFull;
    }
  }

  changeValueCanal(data) {
    this.formFiltros.get('puntoVenta').setValue(null);
    const datos = new PuntoVentas(data, 0);
    this.commisionCoService.getPuntoVentas(datos).subscribe(
      (res) => {
        this.ListChannelPoint = <any[]>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getEstados() {
    const datos = new Estados(0, '');
    this.commisionCoService.getEstados(datos).subscribe(
      (res) => {
        this.estados = <any[]>res;
        this.xestado = this.estados[0].nidstate;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getCurrency() {
    const datos = new Monedas(0, '', 0);
    this.commisionCoService.getCurrency(datos).subscribe(
      (res) => {
        this.monedas = <any[]>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getbranch() {
    const datos = new Ramo(0, '', 5);
    this.commisionCoService.getbranch(datos).subscribe(
      (res) => {
        this.ramo = <any>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onSelectBranch(BranchID) {
    this.productos = [];
    this.f['producto'].setValue(BranchID);
    if (+BranchID !== 0) {
      this.changeValueRamo(BranchID);
    } else {
      this.f['producto'].setValue(0);
    }
    if (BranchID == 66 || BranchID == 80 || BranchID == 82 || BranchID == 73) {
      this.f['producto'].setValue(1);
    }
  }

  changeValueRamo(dato) {
    this.formFiltros.get('producto').setValue(0);
    const datos = new Productos(dato, '', 5);
    this.commisionCoService.getproducts(datos).subscribe(
      (res) => {
        this.productos = <any>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getcommissionlotstate() {
    const datos = new EstadoL(1, '', 0, 0);
    this.commisionCoService.getcommissionlotstate(datos).subscribe(
      (res) => {
        this.estadosL = <any[]>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  changeValueEstado(data) {
    this.formFiltros.get('disponibilidad').setValue(-1);
  }

  descargarDatos() {
    this.spinner.show();
    const datos = new Listado(
      this.f['canal'].value,
      this.f['disponibilidad'].value,
      moment(this.f['fechaD'].value).format('DD/MM/YYYY'),
      moment(this.f['fechaH'].value).format('DD/MM/YYYY'),
      this.f['poliza'].value || 0,
      this.f['planilla'].value || 0,
      0,
      0,
      this.f['ramo'].value,
      this.f['producto'].value,
      this.f['lote'].value || 0,
      this.f['estadoL'].value,
      this.f['estadoC'].value
    );
    this.commisionCoService.getListado(datos).subscribe(
      (res: ListadoP) => {
        this.dataCommisionExcel = res;
        const payloadExcel: IExportExcel = {
          fileName: 'REPORTE-COMISIONES-CANAL',
          data: res.comisiones.map((obj) => ({
            Ramo: obj.ramo,
            Producto: obj.producto,
            Canal: obj.canal,
            'Nro. Planilla': +obj.idJob || '-',
            Póliza: +obj.numeroPoliza || '-',
            'Nro. Comprobante': obj.comprobante || '-',
            'Fecha de inicio de vigencia': moment(
              obj.fechaInicio,
              'DD/MM/YYYY'
            ).toDate(),
            'Fecha fin de vigencia': moment(
              obj.fechaFin,
              'DD/MM/YYYY'
            ).toDate(),
            'Fecha facturación': moment(obj.fechaPago, 'DD/MM/YYYY').toDate(),
            'Tipo moneda': obj.moneda,
            'Prima total': parseFloat(obj.primaTotal),
            'Prima neta': parseFloat(obj.primaNeta),
            Porcentaje: parseFloat(obj.porcentajeComision),
            'Comisión neta': parseFloat(obj.montoComision),
            Estado: obj.estadoComision,
            'Fecha de disponibilización': obj.fechaDisponibilizacion
              ? moment(obj.fechaDisponibilizacion, 'DD/MM/YYYY').toDate()
              : '-',
            Recibo: obj.numeroRecibo,
            Lote: obj.idLote || '-',
            'Estado de lote': obj.estadoLote || '-',
            Pendiente: obj.pendiente
              ? moment(obj.pendiente, 'DD/MM/YYYY HH:mm:ss').toDate()
              : '-',
            'Enviado a aprobación': obj.enviadoAprobacion
              ? moment(obj.enviadoAprobacion, 'DD/MM/YYYY hh:mm:ss').toDate()
              : '-',
            Devuelto: obj.devuelto
              ? moment(obj.devuelto, 'DD/MM/YYYY hh:mm:ss').toDate()
              : '-',
            Aprobado: obj.aprobado
              ? moment(obj.aprobado, 'DD/MM/YYYY hh:mm:ss').toDate()
              : '-',
            'Listo para pago': obj.listoParaPago
              ? moment(obj.listoParaPago, 'DD/MM/YYYY hh:mm:ss').toDate()
              : '-',
            Liquidado: obj.liquidado
              ? moment(obj.liquidado, 'DD/MM/YYYY hh:mm:ss').toDate()
              : '-',
            Anulado: obj.anulado
              ? moment(obj.anulado, 'DD/MM/YYYY hh:mm:ss').toDate()
              : '-',
          })),
        };
        this.utilsService.exportExcel(payloadExcel);

        this.spinner.hide();
      },
      (err) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  limpiar() {
    this.formFiltros.get('canal').setValue(null);
    this.formFiltros.get('puntoVenta').setValue(null);
    this.formFiltros.get('producto').setValue(null);
    this.formFiltros.get('ramo').setValue(null);
    this.formFiltros.get('poliza').setValue(0);
    this.formFiltros.get('fechaD').setValue(this.bsValueIni);
    this.formFiltros.get('fechaH').setValue(this.bsValueFin);
    this.formFiltros.get('poliza').setValue(0);
    this.formFiltros.get('lote').setValue(0);
    this.formFiltros.get('planilla').setValue(0);
    this.formFiltros.get('estadoC').setValue(0);
    this.formFiltros.get('disponibilidad').setValue(null);
    this.formFiltros.get('estadoL').setValue(0);

    this.ListChannelPoint = [];
    this.productos = [];
  }

  buscar(reset?: boolean) {
    if (reset) {
      this.p = 1;
    }
    this.spinner.show();

    const datos = new Listado(
      this.f['canal'].value,
      this.f['disponibilidad'].value,
      moment(this.f['fechaD'].value).format('DD/MM/YYYY'),
      moment(this.f['fechaH'].value).format('DD/MM/YYYY'),
      this.f['poliza'].value || 0,
      this.f['planilla'].value || 0,
      this.p || 1,
      10,
      this.f['ramo'].value,
      this.f['producto'].value,
      this.f['lote'].value || 0,
      this.f['estadoL'].value,
      this.f['estadoC'].value
    );
    this.commisionCoService.getListado(datos).subscribe(
      (res) => {
        this.dataCommision = <ListadoP>res;
        this.totalItems =
          +this.dataCommision?.comisiones[0]?.cantidadRegistros || 0;
        this.spinner.hide();
      },
      (err) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  onSelectProduct(id) {
    if (id == 0) {
      this.f['producto'].setValue(0);
    } else {
      this.f['producto'].setValue(id);
    }
  }

  pageChange(page) {
    this.p = page;
    this.buscar();
  }
}
