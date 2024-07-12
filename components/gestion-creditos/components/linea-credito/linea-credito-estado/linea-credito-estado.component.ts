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
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { RegularExpressions } from '@shared/regexp/regexp';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { UtilsService } from '@shared/services/utils/utils.service';
import { LineaCreditoEstadoService } from '../../../shared/services/linea-credito-estado.service';

@Component({
  selector: 'app-linea-credito-estado',
  templateUrl: './linea-credito-estado.component.html',
  styleUrls: ['./linea-credito-estado.component.sass'],
})
export class LineaCreditoEstadoComponent implements OnInit {
  formFilter: FormGroup = this.builder.group({
    search: [''],
    state: [''],
    active: [''],
    locked: [''],
    initialDate: [''],
    expirationDate: [''],
  });

  formEdit: FormGroup = this.builder.group({
    creditEdit: [
      '',
      [Validators.required, Validators.pattern(RegularExpressions.numbers)],
    ],
    expirationDateEdit: ['', Validators.required],
    typeContract: ['', Validators.required],
  });

  formCreate: FormGroup = this.builder.group({
    channelCreate: ['', Validators.required],
    contractorCreate: ['', Validators.required],
    tdrCreate: ['', Validators.required],
    tcCreate: ['', Validators.required],
    creditCreate: [
      '',
      [
        Validators.required,
        Validators.min(1),
        Validators.pattern(RegularExpressions.numbers),
      ],
    ],
    initialDateCreate: [{ value: '', disabled: true }, Validators.required],
    expirationDateCreate: ['', Validators.required],
  });

  private pageTableStateChannels: number = 1;
  private pageTableHistory: number = 1;

  messageConfirmTrue: string = '';
  messageErrorEdit: string = '';

  dataEditCredit: any = {};
  dataCancelCredit: any = {};

  datePickerConfig: Partial<BsDatepickerConfig>;

  isAuthorized: boolean = false;

  // tslint:disable-next-line:no-inferrable-types
  fechaInitial: string = '01/01/2023';
  valueDateFin: Date = new Date();
  valueDateInit: Date = moment(this.fechaInitial, 'DD/MM/YYYY').toDate();

  // Listado de Canales
  dataListChannels$: Array<any> = [];
  // *Listado de Tipo Contrato y Contratante
  dataParameters$: Array<any> = [];
  // *Listado del Resumen de línea de crédito
  dataSummaryCredit$: Array<any> = [];
  // *Listado del historial de línea de crédito
  listCreditHistory$: Array<any> = [];
  // *Lista de línea crédito del estado globales
  stateSalesChannels$: Array<any> = [];
  // *Lista de línea crédito del estado filtrados
  stateSalesChannelsFiltered$: Array<any> = [];

  @ViewChild('modalSummary', { static: true, read: TemplateRef })
  modalSummary: TemplateRef<ElementRef>;

  @ViewChild('modalEdit', { static: true, read: TemplateRef })
  modalEdit: TemplateRef<ElementRef>;

  @ViewChild('modalCreate', { static: true, read: TemplateRef })
  modalCreate: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmCreate', { static: true, read: TemplateRef })
  modalConfirmCreate: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmCancel', { static: true, read: TemplateRef })
  modalConfirmCancel: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmEdit', { static: true, read: TemplateRef })
  modalConfirmEdit: TemplateRef<ElementRef>;

  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  modalHistory: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmTrue', { static: true, read: TemplateRef })
  modalConfirmTrue: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmFalse', { static: true, read: TemplateRef })
  modalConfirmFalse: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly lineaCreditoEstadoService: LineaCreditoEstadoService,
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

  ngOnInit(): void {
    this.getParametersCredit();
    this.getListChannels();

    this.formFilterControl['state'].setValue('0');
    this.formFilterControl['active'].setValue('2');
    this.formFilterControl['locked'].setValue('2');
    this.formFilterControl['initialDate'].setValue(
      moment(this.fechaInitial, 'DD/MM/YYYY').toDate()
    );
    this.formFilterControl['expirationDate'].setValue(
      new Date(new Date().setMonth(new Date().getMonth() + 6))
    );

    this.getStateSalesChannels();

    this.formCreateControl['creditCreate'].valueChanges.subscribe((val) => {
      if (this.formCreateControl['creditCreate'].hasError('pattern')) {
        this.formCreateControl['creditCreate'].setValue(
          val?.toString().substring(0, val.length - 1)
        );
      }
      if (this.formCreateControl['creditCreate'].hasError('min')) {
        this.formCreateControl['creditCreate'].setValue(
          val?.toString().substring(0, val.length - 1)
        );
      }
    });

    this.formCreateControl['tdrCreate'].valueChanges.subscribe((val) => {
      if (this.formCreateControl['tdrCreate'].hasError('pattern')) {
        this.formCreateControl['tdrCreate'].setValue(
          val?.toString().substring(0, val.length - 1)
        );
      }
    });

    this.formFilter.valueChanges.subscribe((value: any) => {
      const validateIncludes = (x: string, y: string) => {
        return x
          .toString()
          .toLowerCase()
          .trim()
          .includes(y.toString().toLowerCase().trim());
      };

      this.stateSalesChannelsFiltered$ = this.stateSalesChannels$.filter(
        (x: any) =>
          (validateIncludes(x.canal, value.search) ||
            validateIncludes(x.cliente, value.search) ||
            validateIncludes(x.tdr, value.search)) &&
          (value.state == '0' ? true : x.idEstado == value.state) &&
          (value.active == '2' ? true : x.idActivo == value.active) &&
          (value.locked == '2' ? true : x.idBloqueado == value.locked) &&
          Date.parse(moment(x.fechaInicio, 'DD/MM/YYYY').toDate().toString()) >=
            Date.parse(this.formFilterControl['initialDate'].value) &&
          Date.parse(moment(x.fechaFin, 'DD/MM/YYYY').toDate().toString()) <=
            Date.parse(this.formFilterControl['expirationDate'].value)
      );
    });
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get formEditControl(): { [key: string]: AbstractControl } {
    return this.formEdit.controls;
  }

  get formCreateControl(): { [key: string]: AbstractControl } {
    return this.formCreate.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get userCredit(): any {
    return JSON.parse(localStorage.getItem('creditUser'));
  }

  get currentPage(): number {
    return this.pageTableStateChannels;
  }

  set changeCurrentPage(page: number) {
    this.pageTableStateChannels = page;
  }

  get currentPageHistory(): number {
    return this.pageTableHistory;
  }

  set currentPageHistory(page: number) {
    this.pageTableHistory = page;
  }

  getParametersCredit(): void {
    this.spinner.show();

    const request = {
      canal: null,
      cliente: null,
    };
    this.lineaCreditoEstadoService.getParametersCredit(request).subscribe({
      next: (response: Array<any>) => {
        this.dataParameters$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getListChannels(): void {
    this.spinner.show();

    this.utilsService.channelSales(+this.currentUser?.id).subscribe({
      next: (response: any) => {
        this.dataListChannels$ = response.items;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getStateSalesChannels(): void {
    this.spinner.show();

    const request = {
      idEstado: this.formFilterControl['state'].value || '0',
      idActivo: this.formFilterControl['active'].value || '2',
      idBloqueado: this.formFilterControl['locked'].value || '2',
      fechaInicio: this.fechaInitial,
      fechaFin: moment(this.formFilterControl['expirationDate'].value).format(
        'DD/MM/YYYY'
      ),
    };

    this.lineaCreditoEstadoService.getStateSalesChannels(request).subscribe({
      next: (response: Array<any>) => {
        this.stateSalesChannels$ = response.map((item: any) => ({
          ...item,
          isLocked:
            moment(item.fechaFin, 'DD/MM/YYYY').toDate() < this.valueDateFin,
        }));

        this.stateSalesChannelsFiltered$ = this.stateSalesChannels$;

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

  saveEdit(): void {
    this.spinner.show();

    const payload = {
      tc: this.formEditControl['typeContract'].value,
      credito: this.formEditControl['creditEdit'].value,
      fechaFin: moment(this.formEditControl['expirationDateEdit'].value).format(
        'DD/MM/YYYY'
      ),
      tdr: this.dataEditCredit.tdr,
      canal: this.dataEditCredit.codigoCanal,
      cliente: this.dataEditCredit.codigoCliente,
      usuario: this.currentUser?.id.toString(),
    };

    this.lineaCreditoEstadoService.updateStateCredit(payload).subscribe({
      next: (response: any) => {
        this.hideModal();
        this.dataEditCredit = {};
        this.getStateSalesChannels();
        this.messageConfirmTrue = 'Se han guardado los cambios con éxito';
        this.vc.createEmbeddedView(this.modalConfirmTrue);
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

  saveCreateCredit(): void {
    this.hideModal();
    this.spinner.show();

    const request = {
      canal: this.formCreateControl['channelCreate'].value,
      cliente: this.formCreateControl['contractorCreate'].value,
      tdr: this.formCreateControl['tdrCreate'].value.toUpperCase(),
      tc: this.formCreateControl['tcCreate'].value,
      credito: this.formCreateControl['creditCreate'].value,
      fechaInicio: moment(
        this.formCreateControl['initialDateCreate'].value
      ).format('DD/MM/YYYY'),
      fechaFin: moment(
        this.formCreateControl['expirationDateCreate'].value
      ).format('DD/MM/YYYY'),
      usuario: this.currentUser?.id.toString(),
    };
    this.lineaCreditoEstadoService.createStateCredit(request).subscribe({
      next: (response: any) => {
        if (response.existeLineaCredito == '1') {
          this.hideModal();
          this.vc.createEmbeddedView(this.modalConfirmFalse);
          return;
        }
        this.messageConfirmTrue =
          'Se creó la línea de crédito del estado con éxito.';
        this.vc.createEmbeddedView(this.modalConfirmTrue);
        this.getStateSalesChannels();
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

  showModalSummary(item: any): void {
    this.lineaCreditoEstadoService
      .getCreditSummary(+item.idLineaCredito)
      .subscribe({
        next: (response: any) => {
          this.dataSummaryCredit$ = response;

          this.vc.createEmbeddedView(this.modalSummary);
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

  showModalHistory(item: any): void {
    this.lineaCreditoEstadoService
      .getCreditHistory(+item.idLineaCredito)
      .subscribe({
        next: (response: any) => {
          this.listCreditHistory$ = response.verHistorial;

          this.vc.createEmbeddedView(this.modalHistory);
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

  showModalEdit(item: any): void {
    this.hideModal();

    if (this.isAuthorized) {
      this.dataEditCredit = item;

      this.formEditControl['typeContract'].setValue(item.idTipoContrato);
      this.formEditControl['creditEdit'].setValue(item.credito);
      this.formEditControl['expirationDateEdit'].setValue(
        moment(item.fechaFin, 'DD/MM/YYYY').toDate()
      );

      this.formEditControl['creditEdit'].valueChanges.subscribe((value) => {
        if (value < +item.deuda) {
          this.messageErrorEdit = `El crédito no puede ser menor a la deuda actual: S/. ${item.deuda}`;
        } else {
          this.messageErrorEdit = '';
        }
      });

      this.vc.createEmbeddedView(this.modalEdit);
    }
  }

  showModalCreate(): void {
    this.hideModal();

    if (this.isAuthorized) {
      this.formCreateControl['channelCreate'].setValue('');
      this.formCreateControl['contractorCreate'].setValue('');
      this.formCreateControl['tcCreate'].setValue('');
      this.formCreateControl['tdrCreate'].setValue('');
      this.formCreateControl['creditCreate'].setValue('');
      this.formCreateControl['initialDateCreate'].setValue(new Date());
      this.formCreateControl['expirationDateCreate'].setValue(new Date());
      this.vc.createEmbeddedView(this.modalCreate);
    }
  }

  showModalConfirm(): void {
    this.hideModal();
    this.vc.createEmbeddedView(this.modalConfirmCreate);
  }

  showModalConfirmCancel(item: any): void {
    this.hideModal();

    if (this.isAuthorized) {
      this.dataCancelCredit = item;
      this.vc.createEmbeddedView(this.modalConfirmCancel);
    }
  }

  showModalConfirmEdit(item: any): void {
    this.hideModal();

    this.vc.createEmbeddedView(this.modalConfirmEdit);
  }

  hideModal(): void {
    this.messageErrorEdit = '';
    this.vc.clear();
  }

  hideModalConfirm(): void {
    this.hideModal();
    this.vc.createEmbeddedView(this.modalCreate);
  }

  hideModalConfirmEdit(): void {
    this.hideModal();
    this.vc.createEmbeddedView(this.modalEdit);
  }

  changeActive(item: any): void {
    if (this.isAuthorized) {
      this.spinner.show();

      const request = {
        canal: item.codigoCanal,
        cliente: item.codigoCliente,
        tdr: item.tdr,
        idActivo: item.idActivo == '1' ? '0' : '1',
        idBloqueado: item.idBloqueado == '1' ? '0' : '1',
        usuario: this.currentUser?.id.toString(),
      };

      this.lineaCreditoEstadoService.changeStateActivate(request).subscribe({
        next: (response: any) => {
          this.getStateSalesChannels();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    }
  }

  cancelCredit(): void {
    this.spinner.show();

    const request = {
      canal: this.dataCancelCredit.codigoCanal,
      cliente: this.dataCancelCredit.codigoCliente,
      tdr: this.dataCancelCredit.tdr,
      idEstado: '4',
      usuario: this.currentUser?.id.toString(),
    };
    this.lineaCreditoEstadoService.cancelStateCredit(request).subscribe({
      next: (response: any) => {
        this.getStateSalesChannels();
        this.hideModal();
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

  downloadList(): void {
    const payload: IExportExcel = {
      fileName: 'Linea_Credito_Estado',
      data: this.stateSalesChannelsFiltered$.map((value: any) => ({
        'ID ': +value.idLineaCredito,
        'CANAL ': value.canal,
        'CONTRATANTE ': value.cliente,
        'TDR ': value.tdr,
        'TIPO CONTRATO ': value.tipoContrato,
        'CREDITO ': +value.credito,
        'DEUDA ': +value.deuda,
        'SALDO ': +value.saldo,
        'FECHA INICIO': value.fechaInicio,
        'FECHA FIN': value.fechaFin,
        'BLOQUEADO ': value.bloqueado,
        'ACTIVO ': value.activo,
        'ESTADO ': value.estado,
      })),
    };
    this.utilsService.exportExcel(payload);
  }
}
