import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegularExpressions } from '../../../../shared/regexp/regexp';
import { UtilsService } from '../../../../shared/services/utils/utils.service';
import { ValidateLotService } from '../../services/validate-lot/validate-lot.service';

@Component({
  selector: 'app-validation-lot',
  templateUrl: './validation-lot.component.html',
  styleUrls: ['./validation-lot.component.sass'],
})
export class ValidationLotComponent implements OnInit {
  formFilter: FormGroup = this.builder.group({
    channel: [''],
    branch: [''],
    product: [''],
    idPolicy: ['', Validators.pattern(RegularExpressions.numbers)],
    state: [''],
    idLot: ['', Validators.pattern(RegularExpressions.numbers)],
    currency: [''],
    initialDate: [''],
    finalDate: [''],
  });

  page: number = 1;
  datePickerConfig: Partial<BsDatepickerConfig>;
  fechaInitial: Date = new Date(new Date().setDate(new Date().getDate() - 7));
  valueDateInit: Date = moment('01/01/2019', 'DD/MM/YYYY').toDate();
  messageInfo: string = '';
  messageResponse: string = '';

  // Data de poliza filtrada
  dataPolicyFiltered: Array<any> = [];
  // Listado de Canales
  dataListChannels: Array<any> = [];
  // Listado de Productos
  dataListProducts: Array<any> = [];
  // Listado de Ramo
  dataListBranchs: Array<any> = [];
  // Data de detalle Lote
  dataLotSummary: Array<any> = [];
  // *Lista global
  dataListLots: any;
  // *Lista filtrada
  dataListLotsFiltered: any;

  @ViewChild('modalSummary', { static: true, read: TemplateRef })
  modalSummary: TemplateRef<ElementRef>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly validateLotService: ValidateLotService,
    private readonly vc: ViewContainerRef,
    private readonly utilsService: UtilsService
  ) {
    this.datePickerConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: true,
      }
    );
  }

  ngOnInit() {
    this.getListChannels();
    this.getListBranchs();

    this.formFilterControl['channel'].setValue('0');
    this.formFilterControl['branch'].setValue('0');
    this.formFilterControl['product'].setValue('0');
    this.formFilterControl['state'].setValue('0');
    this.formFilterControl['currency'].setValue('0');
    this.formFilterControl['initialDate'].setValue(this.fechaInitial);
    this.formFilterControl['finalDate'].setValue(new Date());

    this.formFilterControl['idPolicy'].valueChanges.subscribe((val) => {
      if (this.formFilterControl['idPolicy'].hasError('pattern')) {
        this.formFilterControl['idPolicy'].setValue(
          val?.toString().substring(0, val.length - 1)
        );
      }
    });

    this.formFilterControl['idLot'].valueChanges.subscribe((val) => {
      if (this.formFilterControl['idLot'].hasError('pattern')) {
        this.formFilterControl['idLot'].setValue(
          val?.toString().substring(0, val.length - 1)
        );
      }
    });

    this.formFilterControl['branch'].valueChanges.subscribe((val) => {
      this.formFilterControl['product'].setValue('0');
      this.dataListProducts = [];
      this.getListProducts(val);
    });
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get currentPage(): number {
    return this.page;
  }

  set changeCurrentPage(value: number) {
    this.page = value;
    this.searchDataFiltered();
  }

  getListChannels(): void {
    const payload = {
      nusercode: +this.currentUser?.id,
      nchannel: '0',
      scliename: '',
    };
    this.validateLotService.getChannelSales(payload).subscribe({
      next: (response: any) => {
        this.dataListChannels = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  getListBranchs(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        this.dataListBranchs = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  getListProducts(val: any): void {
    this.spinner.show();
    const payload = {
      branchId: +val,
      userType: this.currentUser['tipoCanal'],
    };
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.dataListProducts = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  searchDataFiltered(): void {
    this.spinner.show();

    const request = {
      idRamo: +this.formFilterControl['branch'].value || 0,
      idProducto: +this.formFilterControl['product'].value || 0,
      idCanal: +this.formFilterControl['channel'].value || 0,
      numeroPoliza: +this.formFilterControl['idPolicy'].value || 0,
      idEstado: +this.formFilterControl['state'].value || 0,
      idLote: +this.formFilterControl['idLot'].value || 0,
      idMoneda: +this.formFilterControl['currency'].value || 0,
      fechaInicio: moment(this.formFilterControl['initialDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFilterControl['finalDate'].value).format(
        'DD/MM/YYYY'
      ),
      indice: this.page,
      cantidadRegistros: 10,
    };

    this.validateLotService.getListValidationLot(request).subscribe({
      next: (response: any) => {
        this.dataListLotsFiltered = response;
        this.messageResponse = '';
        this.spinner.hide();
        if (!response.listadoLotes.length) {
          this.messageResponse =
            'No se encontró coincidencias con los criterios de búsqueda';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  cleanData(): void {
    this.formFilterControl['channel'].setValue('0');
    this.formFilterControl['branch'].setValue('0');
    this.formFilterControl['product'].setValue('0');
    this.formFilterControl['idPolicy'].setValue('');
    this.formFilterControl['state'].setValue('0');
    this.formFilterControl['idLot'].setValue('');
    this.formFilterControl['currency'].setValue('0');
    this.formFilterControl['initialDate'].setValue(this.fechaInitial);
    this.formFilterControl['finalDate'].setValue(new Date());
    this.dataListLotsFiltered = {};
    this.messageResponse = '';
  }

  downloadList(): void {
    const payload = {
      fileName: 'Validacion_lotes',
      data: this.dataListLotsFiltered.listadoLotes.map((value: any) => ({
        'CANAL ': value.canal,
        'RAMO ': value.ramo,
        'PRODUCTO ': value.producto,
        'N° LOTE ': +value.numeroLote,
        'CANTIDAD COMISIONES ': +value.cantidadComisiones,
        'FECHA ENVIO LOTE': moment(value.fechaLote, 'DD/MM/YYYY').toDate(),
        'ESTADO ': value.estado,
        'MONEDA ': value.moneda,
        'IMPORTE NETO ': +parseFloat(value.comisionNeta),
      })),
    };
    this.utilsService.exportExcel(payload);
  }

  downloadReportLot(id: number) {
    this.spinner.show();

    this.validateLotService.downloadDataLot(id).subscribe({
      next: (response: any) => {
        if (!response.success) {
          this.messageInfo =
            'Ocurrió un problema al intentar descargar el archivo, inténtelo más tarde.';
          this.spinner.hide();
          this.vc.createEmbeddedView(this.modalMessage);
          return;
        }

        const payload = {
          fileName: 'Reporte_lote',
          data: response.detalleReporte.map((value: any) => ({
            'Ramo ': value.ramo,
            'Producto ': value.producto,
            'Planilla ': value.planilla,
            'Póliza ': value.poliza,
            'Tipo de intermediario': value.tipoIntermediario,
            'Canal ': value.canal,
            'Nro. Comprobante ': value.nroComprobante,
            'recibo ': value.recibo,
            'Fecha inicio de Vigencia': moment(
              value.fechaInicioVigencia,
              'DD/MM/YYYY'
            ).toDate(),
            'Fecha fin de vigencia': moment(
              value.fechaFinVigencia,
              'DD/MM/YYYY'
            ).toDate(),
            'Fecha facturación': moment(value.fechaPago, 'DD/MM/YYYY').toDate(),
            'Tipo de Moneda': value.moneda,
            'Prima Total': +value.primaTotal,
            'Prima Neta': +parseFloat(value.primaNeta).toFixed(2),
            'Porcentaje ': +value.porcentajeComision,
            'Comisión Neta': +parseFloat(value.comisionNeta).toFixed(2),
            'Estado Comisión': value.estadoComision,
            'Fecha de disponibilización': value.fechaDisponibilizacion
              ? moment(value.fechaDisponibilizacion, 'DD/MM/YYYY').toDate()
              : '',
            'Lote ': id,
            'Fecha envío lote': moment(value.fechaLote, 'DD/MM/YYYY').toDate(),
            'Fecha act. últ. estado': moment(
              value.fechaActualizacionEstado,
              'DD/MM/YYYY'
            ).toDate(),
            'Estado Lote': value.estadoLote,
            'Importe neto lote': +parseFloat(value.comisionNetaLote).toFixed(2),
            'IGV Lote': +parseFloat(value.comisionIgvLote).toFixed(2),
            'Importe Total Lote': +parseFloat(value.comisionTotalLote).toFixed(
              2
            ),
            'Serie Factura Broker': value.serieFacturaBroker,
            'Nro. Factura Broker': value.nroFacturaBroker,
            'RUC Factura': value.rucFactura,
          })),
        };
        this.utilsService.exportExcel(payload);
        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  showModalSummary(item: any): void {
    this.spinner.show();

    this.validateLotService.getLotSummary(+item).subscribe({
      next: (response: any) => {
        this.dataLotSummary = response.detalleLote;
        this.vc.createEmbeddedView(this.modalSummary);
        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  hideModal(): void {
    this.vc.clear();
    this.messageInfo = '';
  }
}
