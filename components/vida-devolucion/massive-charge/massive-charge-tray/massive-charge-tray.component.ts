import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';

import { String } from './constants/string';
import { datePickerConfig } from '@shared/config/config';
import { fadeAnimation } from '@shared/animations/animations';
import {
  ChannelSalesModel,
  PointSalesModel,
} from '@shared/models/channel-point-sales/channel-point-sale.model';
import { RegularExpressions } from '@shared/regexp/regexp';

import { UtilsService } from '@shared/services/utils/utils.service';
import { MassiveChargeService } from '@root/layout/broker/services/vida-devolucion/massive-charge/massive-charge.service';

@Component({
  selector: 'app-massive-charge-tray',
  templateUrl: './massive-charge-tray.component.html',
  styleUrls: ['./massive-charge-tray.component.sass'],
  animations: [fadeAnimation],
})
export class MassiveChargeTrayComponent implements OnInit {
  private minDateStartDate = new Date(`01-01-${new Date().getFullYear()}`);
  private minDateEndDate = this.minDateStartDate;

  startDateConfig: Partial<BsDatepickerConfig>;
  endDateConfig: Partial<BsDatepickerConfig>;

  formFilters: FormGroup = this.builder.group({
    salesChannel: [null, Validators.min(0)],
    pointSale: [null, Validators.min(0)],
    startDate: [null],
    endDate: [null],
    processId: [null, Validators.pattern(RegularExpressions.numbers)],
  }); // *FORMULARIO DE FILTROS

  formMassiveCharge: FormGroup = this.builder.group({
    file: [null, Validators.required],
  }); // *FORMULARIO DE NUEVA CARGA MASIVA

  private allowedExtensions: Array<string> = String.allowedExtensions; // *EXTENSIONES PERMITIDAS

  uploadedFileInfo: any = null; // *INFORMACIÓN DE ARCHIVO ADJUNTO

  salesChannels$: Array<any> = [];
  pointsSale$: Array<any> = [];
  private onSearchOnloadingPage = true; // *LISTAR GRILLA CUANDO SE CARGA POR PRIMERA VEZ LA PÁGINA

  gridDataList$: Array<any> = []; // *LISTA DE DATOS DE LA GRILLA
  itemsPerPage = 10; // *ITEMS QUE SE MUESTRAN POR PAGINA
  private gridDataListCurrentPage = 1; // *PÁGINA ACTUAL DE LA GRILLA

  history$: Array<any> = [];

  private itemSelected: any = null;
  messageError = ''; // *MENSAJES DE ERROR

  @ViewChild('modalNewMassiveCharge', { static: true, read: TemplateRef })
  private modalNewMassiveCharge: TemplateRef<ElementRef>; // *MODAL NUEVA CARGA

  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  private modalHistory: TemplateRef<ElementRef>; // *MODAL HISTORIAL

  constructor(
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly utilsService: UtilsService,
    private readonly massiveChargeService: MassiveChargeService
  ) { }

  ngOnInit(): void {
    this.datePickerConfiguration();
    this.formFiltersValueChanges();
    this.getSalesChannels();
    this.onSearch(true);
  }

  // *CONTROLES DEL FORMULARIO DE FILTROS - (FORMFILTERS)
  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  // *USUARIO ACTUAL
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  // *PAGINADO
  get currentPage(): number {
    return this.gridDataListCurrentPage;
  }

  set currentPage(value: number) {
    this.gridDataListCurrentPage = value;
    this.onSearch();
  }

  // *VALUE CHANGES FORMULARIO
  formFiltersValueChanges(): void {
    this.formFilterControl['startDate'].valueChanges.subscribe(
      (value: string) => {
        if (!value) {
          return;
        }

        this.minDateEndDate = new Date(value);
        this.datePickerConfiguration();
      }
    );

    this.formFilterControl['salesChannel'].valueChanges.subscribe(() => {
      this.formFilterControl['pointSale'].setValue(null);
      if (+this.formFilterControl['salesChannel'].value > 0) {
        this.getPointSale();
      }
    });

    this.formFilterControl['processId'].valueChanges.subscribe(
      (value: string) => {
        if (value && this.formFilterControl['processId'].hasError('pattern')) {
          this.formFilterControl['processId'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  // *FECHAS VALOR POR DEFECTO
  datePickerConfiguration(): void {
    this.startDateConfig = this.endDateConfig = {
      ...datePickerConfig,
      maxDate: new Date(),
      minDate: this.minDateStartDate,
    };

    this.endDateConfig = {
      ...this.endDateConfig,
      minDate: this.minDateEndDate,
    };
  }

  // *RESTABLECER VALOR DEL FORMUARIO
  resetFormFilters(): void {
    this.formFilterControl['processId'].setValue(null);
    this.formFilterControl['startDate'].setValue(this.minDateStartDate);
    this.formFilterControl['endDate'].setValue(new Date());
    this.setValueSalesChannel();
  }

  // *ASIGNAR VALOR A CANAL DE VENTA
  setValueSalesChannel(): void {
    this.formFilterControl['salesChannel'].enable({
      emitEvent: false,
    });
    if (this.salesChannels$.length == 1) {
      this.formFilterControl['salesChannel'].disable({
        emitEvent: false,
      });
    }
    this.formFilterControl['salesChannel'].setValue(
      this.salesChannels$.length == 1 ? this.salesChannels$[0].id : 0
    );
  }

  // *ASIGNAR VALOR A PUNTO DE VENTA
  setValuePointSale(): void {
    this.formFilterControl['pointSale'].enable({
      emitEvent: false,
    });
    if (this.pointsSale$.length == 1) {
      this.formFilterControl['pointSale'].disable({
        emitEvent: false,
      });
    }
    this.formFilterControl['pointSale'].setValue(
      this.pointsSale$.length == 1 ? this.pointsSale$[0].id : 0
    );
    if (this.onSearchOnloadingPage) {
      this.onSearch();
    }
  }

  // *OBTENER CANALES DE VENTA
  getSalesChannels(): void {
    this.salesChannels$ = [
      {
        id: 2021000004,
        description: 'VIDA DEVOLUCIÓN PROTECTA⁺',
      },
    ];
    this.resetFormFilters();
    return;

    this.spinner.show();
    this.salesChannels$ = [];
    this.utilsService.channelSales(+this.currentUser.id).subscribe({
      next: (response: ChannelSalesModel) => {
        console.dir(response);
        if (response.items) {
          this.salesChannels$ = response.items || [];
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.resetFormFilters();
      },
      complete: () => {
        this.spinner.hide();
        this.resetFormFilters();
      },
    });
  }

  // *OBTENER PUNTOS DE VENTA
  getPointSale(): void {
    if (this.formFilterControl['salesChannel'].invalid) {
      return;
    }

    if (+this.formFilterControl['salesChannel'].value == 0) {
      this.setValuePointSale();
      return;
    }

    this.spinner.show();
    this.pointsSale$ = [];
    const channelId = this.formFilterControl['salesChannel'].value;
    this.utilsService.pointSales(channelId).subscribe({
      next: (response: PointSalesModel) => {
        console.dir(response);
        this.pointsSale$ = response.items || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
        this.setValuePointSale();
      },
    });
  }

  // *LISTAR GRILLA - (BOTÓN BUSCAR)
  onSearch(resetCurrentPage = false): void {
    if (resetCurrentPage) {
      this.currentPage = 1;
      return;
    }



    this.spinner.show();
    this.onSearchOnloadingPage = false;

    const payload = {
      idProceso: this.formFilterControl['processId'].value || 0,
      codigoCanal: +this.formFilterControl['salesChannel'].value || 0,
      codigoPuntoVenta: +this.formFilterControl['pointSale'].value || 0,
      fechaInicio: moment(this.formFilterControl['startDate'].value).format(
        'DD/MM/YYYY'
      ) || this.minDateStartDate,
      fechaFin: moment(this.formFilterControl['endDate'].value).format(
        'DD/MM/YYYY'
      ) || new Date(),
      indice: this.currentPage,
      cantidadRegistros: this.itemsPerPage,
    };

    this.gridDataList$ = [];
    console.log(payload);
    this.massiveChargeService.onSearch(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.gridDataList$ = response.data;
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

  // *HISTORIAL DE CARGA MASIVA
  history(id: number): void {
    this.itemSelected = id;
    this.history$ = [];
    this.spinner.show();
    this.massiveChargeService.history(id).subscribe({
      next: (response: any) => {
        console.dir(response);
        if (response.success) {
          this.history$ = response.data;
          this.vc.createEmbeddedView(this.modalHistory);
        }
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

  // *DETALLE DE CARGA MASIVA
  detail(id: number): void {
    const path = `/extranet/vidadevolucion/carga-masiva/detalle/${id}`;
    this.router.navigate([path]);
  }

  // *DESCARGAR ARCHIVO SUBIDO
  downloadExcel(processId: number): void {
    if (!processId) {
      return;
    }
    this.spinner.show();

    this.massiveChargeService.downloadExcel(processId).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.archivo) {
          this.utilsService.downloadFile({
            fileBase64: response.archivo,
            fileName: response.nombreArchivo,
          });
        }
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

  // *NUEVA CARGA MASIVA
  newMassiveCharge(): void {
    this.closeModals();
    this.vc.createEmbeddedView(this.modalNewMassiveCharge);
  }

  // *DESCARGAR FORMATO TRAMA
  downloadRasterFormat(): void {
    this.spinner.show();
    this.massiveChargeService.rasterFormat().subscribe({
      next: (response: any) => {
        console.dir(response);
        if (response.success) {
          const payload = {
            fileName: response.nombre,
            fileBase64: response.archivo,
          };
          this.utilsService.downloadFile(payload);
        }
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

  // *ADJUNTAR ARCHIVO DE CARGA MASIVA - (MODAL CARGA DE ARCHIVO - BOTÓN ADJUNTAR ARCHIVO)
  uploadFileMassiveCharge(e: FileList): void {
    if (!e.length) {
      this.uploadedFileInfo = null;
      this.messageError = '';
      return;
    }

    const file = e[0];
    const ext: string = file.name.split('.').pop().toLocaleLowerCase();

    this.uploadedFileInfo = null;
    this.messageError = '';

    if (!this.allowedExtensions.includes(ext)) {
      this.messageError = String.invalidExtensionFile;
      this.formMassiveCharge.reset();
      return;
    }

    if (file.size / 1000000 > 25) {
      this.messageError = String.fileWeightLimit;
      this.formMassiveCharge.reset();
      return;
    }

    this.uploadedFileInfo = {
      file: file,
      fileName: file.name,
      size: file.size,
      ext: ext,
    };
  }

  // *VALIDAR ARCHIVO ADJUNTADO - (MODAL CARGA DE ARCHIVO - BOTÓN VALIDAR ARCHIVO)
  validateFileMassiveCharge(): void {
    if (this.formMassiveCharge.invalid) {
      return;
    }
    this.spinner.show();

    const payload = {
      fileInfo: this.uploadedFileInfo,
      userId: +this.currentUser['id'],
    };
    this.massiveChargeService.validateFileUploaded(payload).subscribe({
      next: (response: any) => {
        console.log(response);
        sessionStorage.setItem(
          'vdp-massive-charge-detail',
          JSON.stringify(response)
        );

        this.messageError = response.message;
        this.uploadedFileInfo = null;
        this.formMassiveCharge.reset();

        if (response.detalleProceso || response.errores) {
          const path = `/extranet/vidadevolucion/carga-masiva/detalle`;
          this.router.navigate([path]);
        }
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

  // *CERRAR ÚLTIMO MODAL
  closeLastModal(): void {
    this.vc.remove();
  }

  // *CERRAR TODOS LOS MODALES
  closeModals(): void {
    this.vc.clear();
    this.itemSelected = null;
    this.messageError = '';
    this.uploadedFileInfo = null;
    this.formMassiveCharge.reset();
  }
}
