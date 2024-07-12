import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';

import { CommisionCoService } from '../../services/commission-channel/commission-channel.service';
import {
  ChannelSales,
  Estados,
  Ramo,
  Productos,
  EstadoL,
  Listado,
} from '../../models/commission-channel/commission-channel.model';
import { UtilsService } from '@shared/services/utils/utils.service';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { RegularExpressions } from '@shared/regexp/regexp';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-commission-report',
  templateUrl: './commission-report.component.html',
  styleUrls: ['./commission-report.component.scss'],
})
export class CommissionReportComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  dataCommision: any = {};
  dataCommisionExcel: any = {};
  totalChannels: Array<any> = [];
  listCommissionStatus: Array<any> = [];
  listStatusLot: Array<any> = [];
  listBranch: Array<any> = [];
  products: Array<any>= [];
  totalItems: number;

  // FECHAS
  currentDate: Date = new Date();
  bsStartValue: Date = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 3));
  bsEndValue: Date = new Date();

  // PAGINADO
  currentPage = 0;

  formFilters: FormGroup = this.builder.group({
    channel: ['', Validators.required],
    branch: [''],
    product: [''],
    policy: ['', Validators.pattern(RegularExpressions.numbers)],
    startDate: [this.bsStartValue],
    endDate: [this.bsEndValue],
    lot: ['', Validators.pattern(RegularExpressions.numbers)],
    spreadsheet: ['', Validators.pattern(RegularExpressions.numbers)],
    commissionStatus: [''],
    availability: [''],
    lotStatus: [''],
  });

  @ViewChild('modalMessageInfo', { static: true })
  modalMessageInfo: TemplateRef<ElementRef>;

  constructor(
    private readonly commisionCoService: CommisionCoService,
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly utilsService: UtilsService,
    private readonly vc: ViewContainerRef,
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
  }

  ngOnInit(): void {
    this.getChannel();
    this.getcommissionStatus();
    this.getbranch();
    this.getCommissionLotStatus();

    this.f['channel'].setValue(this.currentUser.canal);
    this.f['branch'].setValue('0');
    this.f['product'].setValue('0');
    this.f['commissionStatus'].setValue('0');
    this.f['availability'].setValue('-1');
    this.f['lotStatus'].setValue('0');

    this.f['policy'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['policy'].hasError('pattern')) {
          this.f['policy'].setValue(val.slice(0, val.length - 1));
        }
      }
    });

    this.f['lot'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['lot'].hasError('pattern')) {
          this.f['lot'].setValue(val.slice(0, val.length - 1));
        }
      }
    });

    this.f['spreadsheet'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.f['spreadsheet'].hasError('pattern')) {
          this.f['spreadsheet'].setValue(val.slice(0, val.length - 1));
        }
      }
    });
  }

  get f(): any {
    return this.formFilters.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  getChannel() {
    this.spinner.show();

    const data: ChannelSales = {
      nusercode: this.currentUser.id,
      nchannel: '0',
      scliename: '',
    };

    this.commisionCoService.getChannel(data).subscribe({
      next: (response: any) => {
        this.totalChannels = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getcommissionStatus() {
    const data: Estados = {
      nidstate: 0,
      sdescription: '',
    };

    this.commisionCoService.getEstados(data).subscribe({
      next: (response: any) => {
        this.listCommissionStatus = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getbranch() {
    const data: Ramo = {
      nid: 0,
      sdescript: '',
      typeuser: 5,
    };

    this.commisionCoService.getbranch(data).subscribe({
      next: (response: any) => {
        this.listBranch = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  onSelectBranch(BranchID) {
    this.products = [];
    this.f['product'].setValue(BranchID);
    if (+BranchID !== 0) {
      this.changeValueRamo(BranchID);
    } else {
      this.f['product'].setValue(0);
    }
    if (BranchID == 66 || BranchID == 80 || BranchID == 82 || BranchID == 73) {
      this.f['product'].setValue(1);
    }
  }

  changeValueRamo(dato) {
    this.formFilters.get('product').setValue(0);

    const data: Productos = {
         nid: dato,
         sdescript: '',
         typeuser: 5
    }
    
    this.commisionCoService.getproducts(data).subscribe({
      next: (response: any) => {
        this.products = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getCommissionLotStatus() {
    const data: EstadoL = {
      nidstate: 1,
      sdescription: '',
      nchanneltype: 0,
      niD_ESTTABLE_ANT: 0,
    };

    this.commisionCoService.getcommissionlotstate(data).subscribe({
      next: (response: any) => {
        this.listStatusLot = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  changeValueEstado(data) {
    this.formFilters.get('availability').setValue(-1);
  }

  downloadExcel() {
    this.spinner.show();

    const data: Listado = {
      codigoCanal: this.f['channel'].value,
      disponibilidad: this.f['availability'].value,
      fechaInicio: moment(this.f['startDate'].value).format('DD/MM/YYYY'),
      fechaFin: moment(this.f['endDate'].value).format('DD/MM/YYYY'),
      numeroPoliza: this.f['policy'].value || 0,
      idPlanilla: this.f['spreadsheet'].value || 0,
      pagina: 0,
      cantidadRegistros: 0,
      IdRamo: this.f['branch'].value,
      IdProducto: this.f['product'].value,
      IdLote: this.f['lot'].value || 0,
      IdEstadoLote: this.f['lotStatus'].value,
      IdEstadoComision: this.f['commissionStatus'].value,
    };

    this.commisionCoService.getListado(data).subscribe({
      next: (response: any) => {
        this.dataCommisionExcel = response;
        const payloadExcel: IExportExcel = {
          fileName: 'REPORTE-COMISIONES-CANAL',
          data: response.comisiones.map((obj) => ({
            Ramo: obj.ramo,
            Producto: obj.producto,
            Canal: obj.canal,
            Contratante: obj.contratante || '-',
            'Nro Planilla': +obj.idJob || '-',
            'Nro Póliza': +obj.numeroPoliza || '-',
            'Nro. Comprobante': obj.comprobante || '-',
            'Fecha de inicio de vigencia': moment(
              obj.fechaInicio,'DD/MM/YYYY').toDate(),
            'Fecha fin de vigencia': moment(
              obj.fechaFin,'DD/MM/YYYY').toDate(),
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
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  search(reset?: boolean) {

    const newDate = new Date(this.f['startDate'].value);
    newDate.setMonth(newDate.getMonth() + 3);

    if(this.f['endDate'].value.setHours(0, 0, 0, 0) > newDate.setHours(0, 0, 0, 0)) {
        this.vc.createEmbeddedView(this.modalMessageInfo);
        this.dataCommision = {};
        return;
    }

    if (reset) {
      this.currentPage = 1;
    }

    this.spinner.show();

    const data: Listado = {
      codigoCanal: this.f['channel'].value,
      disponibilidad: this.f['availability'].value,
      fechaInicio: moment(this.f['startDate'].value).format('DD/MM/YYYY'),
      fechaFin: moment(this.f['endDate'].value).format('DD/MM/YYYY'),
      numeroPoliza: this.f['policy'].value || 0,
      idPlanilla: this.f['spreadsheet'].value || 0,
      pagina: this.currentPage || 1,
      cantidadRegistros: 10,
      IdRamo: this.f['branch'].value,
      IdProducto: this.f['product'].value,
      IdLote: this.f['lot'].value || 0,
      IdEstadoLote: this.f['lotStatus'].value,
      IdEstadoComision: this.f['commissionStatus'].value,
    }
    
    this.commisionCoService.getListado(data).subscribe({
      next: (response: any) => {
        this.dataCommision = response;
        this.totalItems =
          +this.dataCommision?.comisiones[0]?.cantidadRegistros || 0;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  pageChange(page) {
    this.currentPage = page;
    this.search();
  }

  hideModal() {
    this.vc.clear();
  }
}
