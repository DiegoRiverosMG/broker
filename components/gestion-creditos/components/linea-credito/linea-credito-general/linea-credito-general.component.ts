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

import { NgxSpinnerService } from 'ngx-spinner';
import { RegularExpressions } from '@shared/regexp/regexp';
import { UtilsService } from '@shared/services/utils/utils.service';
import { LineaCreditoGeneralService } from '../../../shared/services/linea-credito-general.service';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { MessageString } from '@shared/constants/string';
import moment from 'moment';

@Component({
  selector: 'app-linea-credito-general',
  templateUrl: './linea-credito-general.component.html',
  styleUrls: ['./linea-credito-general.component.sass'],
})
export class LineaCreditoGeneralComponent implements OnInit {
  formFilter: FormGroup = this.builder.group({
    search: [''],
    credit: [''],
  });

  formConfiguration: FormGroup = this.builder.group({
    enableNightlyBilling: [0, Validators.required],
    enableVisa: [0, Validators.required],
    enablePagoEfectivo: [0, Validators.required],
    proposal: [0, Validators.required],
    creditAmmount: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.decimal),
        Validators.required,
        Validators.maxLength(10),
      ]),
    ],
    creditDays: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
        Validators.maxLength(5),
      ]),
    ],
  });

  // *Lista de canales de venta para la grilla
  salesChannels$: Array<any> = [];
  salesChannelsFiltered$: Array<any> = [];
  // *Listado del historial de línea de crédito
  listCreditHistory$: Array<any> = [];

  private pageTableSalesChannels = 1;

  private pageTableHistory: number = 1;

  creditRowSelected: any = null;

  messageInfo: string = null;

  isAuthorized: boolean = false;

  // *Variable para volver a listar la grilla cuando se cierra el modal
  startAgain = false;

  @ViewChild('modalConfiguration', { static: true, read: TemplateRef })
  modalConfiguration: TemplateRef<ElementRef>;

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  modalHistory: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly lineaCreditoGeneralService: LineaCreditoGeneralService,
    private readonly utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.getSalesChannels();
    this.formFilterValueChanges();

    this.formConfigurationControl['proposal'].valueChanges.subscribe(
      (value: string) => {
        if (!+value) {
          this.formConfigurationControl['creditAmmount'].disable({
            emitEvent: false,
          });
          this.formConfigurationControl['creditDays'].disable({
            emitEvent: false,
          });
        } else {
          this.formConfigurationControl['creditAmmount'].enable({
            emitEvent: false,
          });
          this.formConfigurationControl['creditDays'].enable({
            emitEvent: false,
          });
        }
      }
    );

    this.formConfigurationControl['creditAmmount'].valueChanges.subscribe(
      (value) => {
        if (value) {
          const regex = /^\d+(\.\d{0,2})?$/;

          if (!regex.test(value)) {
            this.formConfigurationControl['creditAmmount'].setValue(
              value?.toString().substring(0, value.length - 1)
            );
          }
        }
      }
    );
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get userCredit(): any {
    return JSON.parse(localStorage.getItem('creditUser'));
  }

  get currentPage(): number {
    return this.pageTableSalesChannels;
  }

  set currentPage(page: number) {
    this.pageTableSalesChannels = page;
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get formConfigurationControl(): { [key: string]: AbstractControl } {
    return this.formConfiguration.controls;
  }

  get currentPageHistory(): number {
    return this.pageTableHistory;
  }

  set currentPageHistory(page: number) {
    this.pageTableHistory = page;
  }

  getSalesChannels(): void {
    this.spinner.show();
    this.lineaCreditoGeneralService.getSalesChannels().subscribe({
      next: (response: Array<any>) => {
        console.dir(response);
        this.salesChannels$ = this.salesChannelsFiltered$ = response ?? [];

        this.isAuthorized = this.userCredit?.autorizado;
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

  // *Botón descargar excel
  downloadExcel(): void {
    if (!this.salesChannelsFiltered$.length) {
      return;
    }

    const payload: IExportExcel = {
      fileName: 'ReporteVentas',
      data: this.salesChannelsFiltered$.map((value: any) => ({
        'CODIGO ': value.codigoCanal,
        'CANAL ': value.cliente,
        'TIPO ': value.tipoCanal,
        'INICIO VIGENCIA': moment(value.inicioVigencia).format('DD/MM/YYYY'),
        'PROPUESTA ': value.aplicaCredito == 1 ? 'CREDITO' : 'CONTADO',
        'MONTO CREDITO': value.montoCredito,
        'DIAS CREDITO': value.diasCredito,
        'DEUDA ': value.montoDeuda,
        'DIAS NO REPORTADOS': value.diasNoReportados,
        'BLOQUEADO ': value.bloqueado == 1 ? 'SI' : 'NO',
        'FACTURA ': value.generaComprobante === 1 ? 'SI' : 'NO',
        'VISA ':
          value.habilitaVisa === 1
            ? 'SI'
            : value.habilitaVisa === 2
            ? 'SI (TELEPAGO)'
            : 'NO',
        'PAGO EFECTIVO': value.habilitaPagoEfectivo === 1 ? 'SI' : 'NO',
      })),
    };
    this.utilsService.exportExcel(payload);
  }

  formFilterValueChanges(): void {
    this.formFilter.valueChanges.subscribe((value: any) => {
      this.salesChannelsFiltered$ = this.salesChannels$.filter(
        (x: any) =>
          (x.cliente
            .toString()
            .toLowerCase()
            .trim()
            .includes(value.search.toLowerCase().trim()) ||
            x.codigoCanal
              .toString()
              .toLowerCase()
              .trim()
              .includes(value.search.toLowerCase().trim())) &&
          (value.credit == true ? x.aplicaCredito == 1 : true)
      );
    });
  }

  formConfigurationReset(): void {
    this.formConfigurationControl['enableNightlyBilling'].setValue(0);
    this.formConfigurationControl['enableVisa'].setValue(0);
    this.formConfigurationControl['enablePagoEfectivo'].setValue(0);
    this.formConfigurationControl['proposal'].setValue(0);
    this.formConfigurationControl['creditAmmount'].setValue(null);
    this.formConfigurationControl['creditDays'].setValue(null);

    this.formConfigurationControl['creditAmmount'].enable();
    this.formConfigurationControl['creditDays'].enable();
  }

  closeModal(): void {
    this.viewContainerRef.clear();
    this.formConfigurationReset();
    this.creditRowSelected = null;
    this.messageInfo = null;

    if (this.startAgain) {
      this.getSalesChannels();
    }

    this.startAgain = false;
  }

  openModalConfiguration(item: any): void {
    this.closeModal();

    if (this.isAuthorized) {
      this.creditRowSelected = item;
      this.formConfigurationControl['enableNightlyBilling'].setValue(
        item.generaComprobante
      );
      this.formConfigurationControl['enableVisa'].setValue(item.habilitaVisa);
      this.formConfigurationControl['enablePagoEfectivo'].setValue(
        item.habilitaPagoEfectivo
      );
      this.formConfigurationControl['proposal'].setValue(item.aplicaCredito);
      this.formConfigurationControl['creditAmmount'].setValue(
        item.montoCredito
      );
      this.formConfigurationControl['creditDays'].setValue(item.diasCredito);

      this.viewContainerRef.createEmbeddedView(this.modalConfiguration);
    }
  }

  saveConfiguration(): void {
    this.spinner.show();

    const payload = {
      CodigoCanal: this.creditRowSelected.codigoCanal,
      AplicaCredito: this.formConfigurationControl['proposal'].value,
      MontoCredito: this.formConfigurationControl['creditAmmount'].value,
      DiasCredito: this.formConfigurationControl['creditDays'].value,
      GeneraComprobante:
        this.formConfigurationControl['enableNightlyBilling'].value,
      HabilitaVisa: this.formConfigurationControl['enableVisa'].value,
      HabilitaPagoEfectivo:
        this.formConfigurationControl['enablePagoEfectivo'].value,
      IdUsuario: this.currentUser['id'],
    };

    this.lineaCreditoGeneralService.updateChannel(payload).subscribe({
      next: (response: boolean) => {
        this.startAgain = response;

        if (!response) {
          this.messageInfo = MessageString.errorUpdate;
          return;
        }

        this.closeModal();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.messageInfo = MessageString.errorUpdate;
        this.startAgain = false;

        this.spinner.hide();
      },
    });
  }

  showModalHistory(item: any): void {
    this.spinner.show();
    this.creditRowSelected = item;

    this.lineaCreditoGeneralService
      .getCreditHistory(item.codigoCanal)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.listCreditHistory$ = response.verHistorial.map(
              (item: any) => ({
                ...item,
                propuesta:
                  item.propuesta == 'CREDITO' ? 'CRÉDITO' : item.propuesta,
              })
            );
            this.viewContainerRef.createEmbeddedView(this.modalHistory);
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
}
