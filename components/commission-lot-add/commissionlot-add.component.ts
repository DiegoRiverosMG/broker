import { NgxSpinnerService } from 'ngx-spinner';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommissionLotService as ComlotService } from '../../services/commisslot/comissionlot.service';
import { CommissionLotAttach } from '../../models/commissionlot/commissionlotattach';
import { Router, ActivatedRoute } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { ChannelPointService } from '@shared/services/channelpoint/channelpoint.service';
import { ChannelSalesService } from '@shared/services/channelsales/channelsales.service';
import { ChannelPoint } from '@shared/models/channelpoint/channelpoint';
import { ChannelSales } from '@shared/models/channelsales/channelsales';
import { TableType } from '../../models/commissionlot/tabletype';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators
} from '@angular/forms';
import moment from 'moment';
import { forkJoin, Subscription } from 'rxjs';

import { CommissionLotService } from '../../services/commission-lot/commission-lot.service';
import { UtilsService } from '@shared/services/utils/utils.service';

import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { datePickerConfig } from '@shared/config/config';
import { RegularExpressions } from '@shared/regexp/regexp';

defineLocale('es', esLocale);

interface IFile {
  id: number;
  fileType: number;
  fileTypeName: 'PDF' | 'XML';
  file: File;
  fileName: string;
}

@Component({
  selector: 'app-commissionlot-add',
  templateUrl: './commissionlot-add.component.html',
  styleUrls: ['./commissionlot-add.component.scss']
})
export class CommissionLotAddComponent implements OnInit, OnDestroy {
  tipoCanal = 0;

  ListChannelSales: any[] = [];
  ListChannelPoint: any[] = [];
  channelSalesPayload: ChannelSales;

  lstBranch: TableType[];
  lstProduct: TableType[];

  // *Refactoring variables
  subscription: Subscription = new Subscription();

  formFilters: FormGroup = this.builder.group({
    salesChannel: [null],
    pointSale: [null],
    branch: [null],
    product: [null],
    startDate: [null],
    endDate: [null],
    currency: [null]
  });

  formInvoice: FormGroup = this.builder.group({
    generals: this.builder.group({
      emmissionDate: [null],
      voucherType: [null],
      serialNumber: ['', Validators.pattern(RegularExpressions.numbers)],
      invoiceNumber: ['', Validators.pattern(RegularExpressions.numbers)],
      ruc: [
        '',
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.minLength(11),
          Validators.maxLength(11)
        ])
      ]
    }),
    bank: this.builder.group({
      typeBank: [null],
      accountType: [null],
      accountNumber: [
        '',
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.minLength(5),
          Validators.maxLength(30)
        ])
      ],
      cci: [
        '',
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.minLength(5),
          Validators.maxLength(30)
        ])
      ],
      entityName: [''],
      foreignEntity: [null]
    }),
    fileType: [null],
    file: [null]
  });

  attachments: any[] = [];
  messageInfoAttachments = '';
  idComissionLot: any = '';

  private pageLots = 1;
  currentpageLotsIncluded = 1;

  private pageLotDetail = 1;

  params: {
    action: string;
    lotId: number;
    stateId: number;
    branchId: number;
  } = null;

  commissionLotList$: any = {};
  commissionLotListIncluded: any[] = [];
  commissionLotDetail$: any = {};
  commissionLotSelected: any = {};

  commissionLotCheckedAll = false;
  isCommissionLotIncludedAllChecked = false;
  commissionLotDetailCheckedAll = false;

  commissionLotSummary: {
    ammount: string;
    igv: string;
    total: string;
  } = {
    ammount: '0',
    igv: '0',
    total: '0'
  };

  parameters$: {
    typesReceipts: any[];
    typesBanks: any[];
    accountTypes: any[];
  } = {
    typesReceipts: [],
    typesBanks: [],
    accountTypes: []
  };

  private minDate: Date = new Date(
    new Date().setMonth(new Date().getMonth() - 6)
  );
  private maxDate: Date = new Date();

  startDateConfig: Partial<BsDatepickerConfig> = {
    ...datePickerConfig,
    maxDate: this.maxDate
  };
  endDateConfig: Partial<BsDatepickerConfig> = this.startDateConfig;
  emmissionDateConfig: Partial<BsDatepickerConfig> = {
    ...datePickerConfig,
    maxDate: this.maxDate
  };

  messageInfo: {
    success: boolean;
    showImage: boolean;
    message?: string;
  } = {
    success: false,
    showImage: false,
    message: ''
  };

  idTimeOutCommissionLotListForInclude = [];
  commissionLotListForInclude = [];
  errorMessageCommissionLotList = '';
  errorMessageSaveCommissionLot = '';

  attachmentsForDetach = [];

  lotDetail: Partial<{
    datosCabecera: any;
    datosPago: any;
    datosAdjunto: any;
  }> = {};

  creditNotesOfPolicy: any[] = [];

  @ViewChild('modalCommissionLotDetail', { static: true, read: TemplateRef })
  modalCommissionLotDetail: TemplateRef<ElementRef>;

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmSaveCommissionLot', { static: true, read: TemplateRef })
  modalConfirmSaveCommissionLot: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmBackStep', { static: true, read: TemplateRef })
  modalConfirmBackStep: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmLot', { static: true, read: TemplateRef })
  modalConfirmLot: TemplateRef<ElementRef>;

  @ViewChild('modalRemoveLot', { static: true, read: TemplateRef })
  modalRemoveLot: TemplateRef<ElementRef>;

  @ViewChild('modalCreditNotes', { static: true, read: TemplateRef })
  modalCreditNotes: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly comlotservice: ComlotService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly channelPointService: ChannelPointService,
    private readonly channelSalesService: ChannelSalesService,
    private readonly spinner: NgxSpinnerService,
    private readonly commissionLotService: CommissionLotService,
    private readonly utilsService: UtilsService,
    private readonly vc: ViewContainerRef,
    private readonly cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    this.valueChangesForm();
    this.resetFormInvoiceGeneral();
    this.resetFormInvoiceBank();
    this.resetFormInvoiceAttachments();

    this.tipoCanal = +this.currentUser.tipoCanal;

    this.initComponent();
    this.getParameters();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initComponent(): void {
    this.channelSalesPayload = new ChannelSales(
      this.currentUser['id'],
      '0',
      ''
    );
    const branchesPayload = new TableType(0, '', this.tipoCanal);

    const channelSalesService = this.channelSalesService.getPostChannelSales(
      this.channelSalesPayload
    );
    const branchesService = this.comlotservice.getBranch(branchesPayload);

    const channelSalesResponse = (response: any[]) => {
      this.ListChannelSales = response;
    };

    const branchesResponse = (response: Array<TableType>) => {
      this.lstBranch = response.filter((x) => x.nid !== 82);
    };

    this.spinner.show();
    forkJoin([channelSalesService, branchesService]).subscribe({
      next: ([channelSalesRes, branchesRes]: any[]) => {
        channelSalesResponse(channelSalesRes);
        branchesResponse(branchesRes);
        this.resetFormFilters();
        this.getUrlParameters();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  getUrlParameters(): void {
    this.route.params.subscribe((obj: any) => {
      this.params = {
        action: obj.accion,
        lotId: +obj.id || null,
        branchId: +obj.nidbranch || null,
        stateId: +obj.nidstate || null
      };

      if (obj.accion == 'upd') {
        this.formFilters.disable({
          emitEvent: false
        });
        this.getCommissionLotDetail();
        return;
      }
    });
  }

  LoadChannelSales(): void {
    this.channelSalesPayload = new ChannelSales(
      this.currentUser['id'],
      '0',
      ''
    );
    this.spinner.show();
    this.channelSalesService.getPostChannelSales(this.channelSalesPayload).subscribe(
      (data: any[]) => {
        this.ListChannelSales = data;

        this.spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  onGetLstBranch() {
    const payload = new TableType(0, '', this.tipoCanal);

    this.comlotservice.getBranch(payload).subscribe(
      (data: Array<TableType>) => {
        this.lstBranch = data;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  onSelectChannelSales(channelSalesId) {
    if (channelSalesId == 0) {
      this.ListChannelPoint = [];
      return;
    }

    const salePoint = new ChannelPoint(channelSalesId.toString(), 0);
    this.channelPointService.getPostChannelPoint(salePoint).subscribe(
      (data: any[]) => {
        this.ListChannelPoint = data ?? [];

        if (this.ListChannelPoint.length == 0) {
          return;
        }

        if (this.ListChannelPoint.length == 1) {
          this.formFilterControl['pointSale'].setValue(
            this.ListChannelPoint[0]?.nnumpoint ?? 0
          );
          return;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  onSelectBranch(branchId) {
    this.lstProduct = [];
    const tableType = new TableType(branchId, '', this.tipoCanal);

    this.comlotservice.getProduct(tableType).subscribe(
      (data: Array<TableType>) => {
        this.lstProduct = data.map((x) => ({
          ...x,
          sdescript: x.sdescript.trim()
        }));

        if (this.lstProduct.length == 0) {
          return;
        }

        if (data?.length == 1 && this.params.action != 'upd') {
          this.formFilterControl['product'].setValue(+data[0].nid);
          return;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  validateXML(commissloattach: CommissionLotAttach, file: File, e: any) {
    this.spinner.show();
    this.commissionLotService.validateXML({ data: commissloattach, file }).subscribe(
      (response) => {
        this.spinner.hide();

        // tslint:disable-next-line:no-inferrable-types
        const tolerance: number = 0.5;

        const isInvalidAmmountTotal =
          Math.abs(+this.commissionLotSummary.total - +response.montoTotal) >
          tolerance;

        const isInvalidIGV =
          Math.abs(+this.commissionLotSummary.igv - response.impuesto) >
          tolerance;

        if (isInvalidAmmountTotal || isInvalidIGV) {
          this.messageInfo = {
            success: false,
            showImage: true,
            message:
              'El monto de su factura no coincide con el monto total declarado.'
          };
          this.vc.createEmbeddedView(this.modalMessage);
          this.formInvoiceControl['fileType'].setValue(null);
          this.formInvoiceControl['file'].setValue(null);
          return;
        }

        const fileInfo: IFile = {
          id: new Date().getTime(),
          fileType: +this.formInvoiceControl['fileType'].value,
          fileTypeName:
            this.formInvoiceControl['fileType'].value == 1 ? 'PDF' : 'XML',
          file: e.target.files[0],
          fileName: e.target.files[0].name
        };

        this.attachments.push(fileInfo);
        this.formInvoiceControl['fileType'].setValue(null);
        this.formInvoiceControl['file'].setValue(null);

        if (response.success) {
          this.formInvoiceGeneralControl['serialNumber'].setValue(
            response.numeroSerie
          );
          this.formInvoiceGeneralControl['invoiceNumber'].setValue(
            response.numeroFactura
          );
          this.formInvoiceGeneralControl['ruc'].setValue(response.numeroRuc);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  // *Refactoring
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  get formInvoiceControl(): { [key: string]: AbstractControl } {
    return this.formInvoice.controls;
  }

  get formInvoiceGeneral(): FormGroup {
    return this.formInvoiceControl['generals'] as FormGroup;
  }

  get formInvoiceGeneralControl(): { [key: string]: AbstractControl } {
    return this.formInvoiceGeneral.controls;
  }

  get formInvoiceBank(): FormGroup {
    return this.formInvoiceControl['bank'] as FormGroup;
  }

  get formInvoiceBankControl(): { [key: string]: AbstractControl } {
    return this.formInvoiceBank.controls;
  }

  get currentPageLots(): number {
    return this.pageLots;
  }

  set currentPageLots(value: number) {
    this.pageLots = value;
  }

  set currentPageCommissionLotIncluded(page: number) {
    this.currentpageLotsIncluded = page;
    this.validateCommissionLotIncludedCheckedAll();
  }

  get currentPageLotDetail(): number {
    return this.pageLotDetail;
  }

  set currentPageLotDetail(value: number) {
    this.pageLotDetail = value;
  }

  resetFormFilters(): void {
    this.formFilterControl['startDate'].setValue(this.minDate);
    this.formFilterControl['endDate'].setValue(this.maxDate);
    this.formFilterControl['salesChannel'].setValue(+this.currentUser['canal']);

    if (this.route.snapshot.params['accion'] != 'upd') {
      this.formFilterControl['branch'].setValue(66);
      this.formFilterControl['currency'].setValue(1);
    }

    this.formFilters.enable({
      emitEvent: false
    });

    this.commissionLotList$ = {};
    this.commissionLotListIncluded = [];
    this.commissionLotSummary = {
      igv: '0',
      ammount: '0',
      total: '0'
    };
    this.pageLots = 1;
  }

  resetFormInvoiceGeneral(): void {
    this.formInvoiceGeneralControl['emmissionDate'].setValue(new Date());
    this.formInvoiceGeneralControl['voucherType'].setValue('2');
    this.formInvoiceGeneralControl['serialNumber'].setValue('');
    this.formInvoiceGeneralControl['invoiceNumber'].setValue('');
    this.formInvoiceGeneralControl['ruc'].setValue('');
  }

  resetFormInvoiceBank(): void {
    this.formInvoiceBankControl['typeBank'].setValue(0);
    this.formInvoiceBankControl['accountType'].setValue(0);
    this.formInvoiceBankControl['accountNumber'].setValue('');
    this.formInvoiceBankControl['cci'].setValue('');
    this.formInvoiceBankControl['entityName'].setValue('');
    this.formInvoiceBankControl['foreignEntity'].setValue(null);
  }

  resetFormInvoiceAttachments(): void {
    this.formInvoiceControl['fileType'].setValue(null);
    this.formInvoiceControl['file'].setValue(null);
    this.attachments = [];
    this.messageInfoAttachments = '';
  }

  valueChangesForm(): void {
    this.formFilterControl['startDate'].valueChanges.subscribe(
      (value: string) => {
        this.endDateConfig = {
          ...this.endDateConfig,
          minDate: new Date(value)
        };
      }
    );

    this.formFilterControl['endDate'].valueChanges.subscribe(
      (value: string) => {
        this.startDateConfig = {
          ...this.startDateConfig,
          maxDate: new Date(value)
        };
      }
    );

    this.formFilterControl['salesChannel'].valueChanges.subscribe(
      (value: string) => {
        this.formFilterControl['pointSale'].setValue(null);
        this.onSelectChannelSales(+value);
      }
    );

    this.formFilterControl['branch'].valueChanges.subscribe((value: string) => {
      if (this.route.snapshot.params['action'] != 'upd') {
        this.formFilterControl['product'].setValue(null);
      }

      this.onSelectBranch(+value);
    });

    this.formInvoiceGeneralControl['voucherType'].valueChanges.subscribe(
      (value: string) => {
        this.resetFormInvoiceAttachments();
        this.validateVoucherType(+value);
      }
    );

    this.formInvoiceGeneralControl['serialNumber'].valueChanges.subscribe(
      (value: string) => {
        if (
          this.formInvoiceGeneralControl['serialNumber'].hasError('pattern')
        ) {
          this.formInvoiceGeneralControl['serialNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formInvoiceGeneralControl['invoiceNumber'].valueChanges.subscribe(
      (value: string) => {
        if (
          this.formInvoiceGeneralControl['invoiceNumber'].hasError('pattern')
        ) {
          this.formInvoiceGeneralControl['invoiceNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formInvoiceGeneralControl['ruc'].valueChanges.subscribe(
      (value: string) => {
        if (this.formInvoiceGeneralControl['ruc'].hasError('pattern')) {
          this.formInvoiceGeneralControl['ruc'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formInvoiceBankControl['typeBank'].valueChanges.subscribe(() => {
      this.formInvoiceBankControl['entityName'].setValue(null);
      this.formInvoiceBankControl['foreignEntity'].setValue(null);
    });

    this.formInvoiceBankControl['foreignEntity'].valueChanges.subscribe(
      (value: string) => {
        this.validateCCI(value);
      }
    );

    this.formInvoiceBankControl['accountNumber'].valueChanges.subscribe(
      (value: string) => {
        if (this.formInvoiceBankControl['accountNumber'].hasError('pattern')) {
          this.formInvoiceBankControl['accountNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formInvoiceBankControl['cci'].valueChanges.subscribe(
      (value: string) => {
        if (this.formInvoiceBankControl['cci'].hasError('pattern')) {
          this.formInvoiceBankControl['cci'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  validateCCI(value): void {
    this.formInvoiceBankControl['cci'].setValue('');

    if (+value == 1) {
      this.formInvoiceBankControl['cci'].setValidators(
        Validators.compose([
          Validators.pattern(RegularExpressions.alphaNumeric),
          Validators.minLength(5),
          Validators.maxLength(30)
        ])
      );
      this.formInvoiceBankControl['cci'].updateValueAndValidity();
      return;
    }

    this.formInvoiceBankControl['cci'].setValidators(
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(5),
        Validators.maxLength(30)
      ])
    );
    this.formInvoiceBankControl['cci'].updateValueAndValidity();
  }

  get placeholderCCI(): string {
    const bank = this.formInvoiceBankControl['typeBank'].value == 5;
    const foreignEntity =
      this.formInvoiceBankControl['foreignEntity'].value == 1;
    return bank && foreignEntity ? 'SWIFT/BIC (CCI)' : 'N° de CCI';
  }

  validateVoucherType(value: number): void {
    if (value == 2) {
      this.formInvoiceGeneralControl['serialNumber'].disable({
        emitEvent: false
      });
      this.formInvoiceGeneralControl['invoiceNumber'].disable({
        emitEvent: false
      });
      this.formInvoiceGeneralControl['ruc'].disable({
        emitEvent: false
      });

      this.formInvoiceGeneralControl['serialNumber'].setValue('');
      this.formInvoiceGeneralControl['invoiceNumber'].setValue('');
      this.formInvoiceGeneralControl['ruc'].setValue('');
      return;
    }

    this.formInvoiceGeneralControl['serialNumber'].enable({
      emitEvent: false
    });
    this.formInvoiceGeneralControl['invoiceNumber'].enable({
      emitEvent: false
    });
    this.formInvoiceGeneralControl['ruc'].enable({
      emitEvent: false
    });

    this.formInvoiceGeneralControl['serialNumber'].updateValueAndValidity({
      emitEvent: false
    });
    this.formInvoiceGeneralControl['invoiceNumber'].updateValueAndValidity({
      emitEvent: false
    });
    this.formInvoiceGeneralControl['ruc'].updateValueAndValidity({
      emitEvent: false
    });
  }

  getParameters(): void {
    const subs = this.commissionLotService.getParameters().subscribe({
      next: (response) => {
        this.parameters$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });

    this.subscription.add(subs);
  }

  onSearch(resetPage = false): void {
    if (resetPage) {
      this.currentPageLots = 1;
    }

    const payload = {
      idCanal: this.formFilterControl['salesChannel'].value,
      idPuntoVenta: this.formFilterControl['pointSale'].value || 0,
      idRamo: this.formFilterControl['branch'].value || 0,
      idProducto: this.formFilterControl['product'].value || 0,
      fechaInicio: moment(this.formFilterControl['startDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFilterControl['endDate'].value).format(
        'DD/MM/YYYY'
      ),
      idMoneda: this.formFilterControl['currency'].value,
      checked: this.commissionLotCheckedAll
    };
    this.commissionLotList$ = [];

    this.spinner.show();
    const subs = this.commissionLotService.getCommissionLotListReceivable(payload).subscribe({
      next: (response: any) => {
        this.commissionLotList$ = response;
        if (this.commissionLotList$.data?.length) {
          this.formFilters.disable({
            emitEvent: false
          });

          this.commissionLotList$.data = this.commissionLotList$.data.map(
            (obj) => ({
              ...obj,
              estadoComision: 'POR COBRAR',
              checked: !this.commissionLotHasIncluded(obj)
                ? payload.checked
                : false,
              disabled: this.commissionLotListIncluded.some(
                (x) =>
                  `${x.agrupado == 2 ? x.numeroPoliza : x.numeroRecibo}${
                    x.fechaPago
                  }` ==
                  `${x.agrupado == 2 ? obj.numeroPoliza : obj.numeroRecibo}${
                    obj.fechaPago
                  }`
              )
            })
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      }
    });

    this.subscription.add(subs);
  }

  exportExcel(): void {
    if (!this.commissionLotList$?.data?.length) {
      return;
    }

    if (this.params?.lotId) {
      const data = this.commissionLotList$?.data?.map((obj: any) => ({
        Canal: obj.canal,
        'N° Póliza': obj.numeroPoliza,
        'N° Recibo': obj.numeroRecibo,
        'N° Comprobante': obj.comprobante,
        Moneda: obj.idMoneda == 1 ? 'SOLES' : 'DÓLARES',
        'Prima total': +obj.primaTotal,
        '% Comisión': +obj.porcentajeComision,
        Comisión: +parseFloat(obj.montoComision).toFixed(2),
        'Fecha de inicio de vigencia': moment(
          obj.fechaEmision,
          'DD/MM/YYYY'
        ).toDate(),
        'Fecha facturación': moment(obj.fechaPago, 'DD/MM/YYYY').toDate(),
        Estado: 'POR COBRAR'
      }));

      const exportExcelPaylad: IExportExcel = {
        fileName: `COMISIONES_POR_COBRAR`,
        data: data
      };

      this.utilsService.exportExcel(exportExcelPaylad);
      return;
    }

    this.spinner.show();

    const payload = {
      idCanal: this.formFilterControl['salesChannel'].value,
      idPuntoVenta: this.formFilterControl['pointSale'].value || 0,
      idRamo: this.formFilterControl['branch'].value || 0,
      idProducto: this.formFilterControl['product'].value || 0,
      fechaInicio: moment(this.formFilterControl['startDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFilterControl['endDate'].value).format(
        'DD/MM/YYYY'
      ),
      idMoneda: this.formFilterControl['currency'].value
    };

    const subs = this.commissionLotService.downloadExcel(payload).subscribe({
      next: (response: any) => {
        if (response.listaPolizasExcel?.length) {
          response.listaPolizasExcel.sort((a, b) =>
            a.numeroPoliza < b.numeroPoliza ? -1 : 1
          );
          const data = response.listaPolizasExcel.map((obj: any) => ({
            Canal: obj.canal,
            'N° Póliza': obj.numeroPoliza,
            'N° Recibo': obj.numeroRecibo,
            'N° Comprobante': obj.comprobante,
            Moneda: obj.idMoneda == 1 ? 'SOLES' : 'DÓLARES',
            'Prima total': +obj.primaTotal,
            'Prima neta': +obj.primaNeta,
            '% Comisión': +obj.porcentajeComision,
            Comisión: +parseFloat(obj.montoComision).toFixed(2),
            'Fecha de inicio de vigencia': moment(
              obj.fechaEmision,
              'DD/MM/YYYY'
            ).toDate(),
            'Fecha de fin de vigencia': moment(
              obj.fechaFinVigencia,
              'DD/MM/YYYY'
            ).toDate(),
            'Fecha facturación': moment(obj.fechaPago, 'DD/MM/YYYY').toDate(),
            Estado: obj.estadoComision
          }));

          const exportExcelPaylad: IExportExcel = {
            fileName: `COMISIONES_POR_COBRAR`,
            data: data
          };

          this.utilsService.exportExcel(exportExcelPaylad);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      }
    });

    this.subscription.add(subs);
  }

  getDetail(resetPage = false, data: any = {}, include = false): void {
    this.commissionLotDetail$ = {};
    this.commissionLotSelected = data;

    if (resetPage) {
      this.currentPageLotDetail = 1;
    }

    const payload = {
      idCanal: this.formFilterControl['salesChannel'].value,
      idRamo: this.formFilterControl['branch'].value || 0,
      idProducto: this.formFilterControl['product'].value || 0,
      idMoneda: this.formFilterControl['currency'].value,
      poliza: this.commissionLotSelected.numeroPoliza,
      fechaPago: data.fechaPago,
      checked: this.commissionLotDetailCheckedAll
    };

    this.spinner.show();
    const subs = this.commissionLotService.getCommissionDetail(payload).subscribe({
      next: (response: any) => {
        response.data = response.data.map((obj: any) => ({
          ...obj,
          checked: this.commissionLotHasIncluded(obj)
            ? payload.checked
            : false,
          isReceipt: true,
          disabled: this.commissionLotListIncluded.some(
            (x) =>
              `${x.numeroRecibo}${x.fechaPago}` ==
              `${obj.numeroRecibo}${obj.fechaPago}`
          ),
          haveCreditNotes: data.haveCreditNotes
        }));

        this.commissionLotDetail$ = response;

        if (!data.numeroPoliza) {
          return;
        }

        if (!include) {
          this.vc.createEmbeddedView(this.modalCommissionLotDetail);
          return;
        }

        this.commissionLotDetail$.data = this.commissionLotDetail$.data.map(
          (obj: any) => ({
            ...obj,
            checked: true
          })
        );

        this.includeCommissionLotDetail(data);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      }
    });

    this.subscription.add(subs);
  }

  getCommissionLotDetail(): void {
    this.spinner.show();
    this.commissionLotService.getCommissionLotDetail(this.params.lotId).subscribe({
      next: (response: any) => {
        this.lotDetail = response;
        const header = response.datosCabecera;
        const invoice = response.datosPago;
        const attachments = response.datosAdjunto;

        // *Filtros
        this.formFilterControl['branch'].setValue(+header.idRamo);
        this.formFilterControl['product'].setValue(+header.idProducto);
        this.formFilterControl['currency'].setValue(+header.idMoneda);

        // *Datos generales
        this.formInvoiceGeneralControl['emmissionDate'].setValue(
          invoice.fechaEmisionComprobante
            ? moment(invoice.fechaEmisionComprobante, 'DD/MM/YYYY').toDate()
            : null
        );
        this.formInvoiceGeneralControl['voucherType'].setValue(
          +invoice.idTipoDocumento || 0
        );
        this.formInvoiceGeneralControl['invoiceNumber'].setValue(
          +invoice.numeroComprobante || null
        );
        this.formInvoiceGeneralControl['ruc'].setValue(invoice.ruc || null);
        this.formInvoiceGeneralControl['serialNumber'].setValue(
          invoice.serie || null
        );

        // *Datos bancarios
        this.formInvoiceBankControl['typeBank'].setValue(
          +invoice.idTipoBanco || 0,
          {
            emitEvent: false
          }
        );

        this.formInvoiceBankControl['accountType'].setValue(
          +invoice.idTipoCuenta || 0
        );

        this.formInvoiceBankControl['accountNumber'].setValue(
          invoice.numeroCuenta || null
        );

        this.formInvoiceBankControl['entityName'].setValue(
          invoice.entidadExtranjera || null
        );

        this.formInvoiceBankControl['foreignEntity'].setValue(
          invoice.idEntidadExtranjera || null,
          {
            emitEvent: false
          }
        );

        this.validateCCI(this.formInvoiceBankControl['foreignEntity'].value);

        this.formInvoiceBankControl['cci'].setValue(
          invoice.numeroCuentaInterbancaria || null
        );

        const lots = [];

        response.datosDetalle.forEach((obj: any) => {
          const data = {
            ...obj,
            numeroPoliza: obj.numeroPoliza.toString(),
            checked: false,
            isCreditNote: obj.flagNc == 1,
            haveCreditNotes:
              obj.flagNc == 1 ? false : response.datosDetalle.filter((x) => x.pertenece).some((x) => x.pertenece == this.generateCommissionLotId(obj))
          };

          if (obj.flagNc == 1) {
            data.notaCredito = obj.comprobante;
            data.comprobante = '-';
          }

          this.commissionLotListIncluded.push(data);
          lots.push({
            ...data,
            disabled: true
          });
        });

        this.commissionLotList$.data = lots;

        this.orderByCommissionLotList();
        this.orderByCommissionLotListIncluded();

        attachments.map((obj: any) => {
          const fileInfo: IFile = {
            id: new Date().getTime(),
            fileName: obj.nombreArchivo,
            fileType: +obj.tipoArchivo,
            fileTypeName: +obj.tipoArchivo == 1 ? 'PDF' : 'XML',
            file: this.utilsService.base64ToFile({
              base64: obj.archivo,
              fileName: obj.nombreArchivo
            })
          };
          this.attachments.push(fileInfo);
        });

        this.calculateSumamryCommissionLot();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  showModalCommissionLotDetail(data: any): void {
    this.commissionLotDetailCheckedAll = false;
    this.getDetail(true, data);
  }

  hideModalCommissionLotDetail(): void {
    this.vc.clear();
    this.commissionLotSelected = {};
  }

  validateCommissionLotCheckedAll(): void {
    const filter = this.commissionLotList$.data.filter(
      (obj) => !this.commissionLotHasIncluded(obj)
    );
    this.commissionLotCheckedAll = filter.every((x) => x.checked);
  }

  validateCommissionLotDetailCheckedAll(): void {
    this.commissionLotDetailCheckedAll = this.commissionLotDetail$.data.filter((obj) => !this.commissionLotHasIncluded(obj)).every((x) => x.checked);
  }

  commissionLotMarkAsChecked(data: any): void {
    data.checked = !data.checked;
    this.validateCommissionLotCheckedAll();
  }

  commissionLotDetailMarkAsChecked(data: any): void {
    data.checked = !data.checked;
    this.validateCommissionLotDetailCheckedAll();
  }

  commissionLotIncludedMarkAsChecked(data): void {
    data.checked = !data.checked;
    this.commissionLotListIncluded.filter(x => x.numeroPoliza == data.numeroPoliza && x.isCreditNote).forEach((x) => {
      x.checked = data.checked;
    });

    this.validateCommissionLotIncludedCheckedAll();
  }

  /**
   * If the commissionLotDetailCheckedAll is true, then set the checked property of each object in the
   * commissionLotDetail$.data array to true, otherwise set it to false.
   * @param {boolean} checked - boolean - this is the value of the checkbox that is checked/unchecked
   */
  commissionLotDetailMarkAllAsChecked(checked: boolean): void {
    this.commissionLotDetailCheckedAll = checked;
    this.commissionLotDetail$.data = this.commissionLotDetail$.data.map(
      (obj: any) => ({
        ...obj,
        checked: obj.disabled
          ? false
          : !this.commissionLotHasIncluded(obj)
            ? checked
            : false
      })
    );
  }

  commissionLotMarkAllAsChecked(checked: boolean): void {
    this.commissionLotCheckedAll = checked;
    this.commissionLotList$.data = this.commissionLotList$.data.map(
      (obj: any) => ({
        ...obj,
        checked: obj.disabled ? false : checked
      })
    );
  }

  commissionLotIncludedMarkAllAsChecked(checked: boolean): void {
    this.commissionLotListIncluded = this.commissionLotListIncluded.map(
      (obj: any) => ({
        ...obj,
        checked: checked
      })
    );
    this.validateCommissionLotIncludedCheckedAll();
  }

  validateCommissionLotIncludedCheckedAll(): void {
    this.isCommissionLotIncludedAllChecked =
      this.commissionLotIncludedIsAllChecked;
    this.cd.detectChanges();
  }

  includeCommissionLot(): void {
    this.commissionLotListForInclude = [];
    this.errorMessageCommissionLotList = '';

    if (this.attachments.length) {
      this.vc.createEmbeddedView(this.modalConfirmLot);
    } else {
      this.addCommissionLot();
    }
  }

  addCommissionLot(): void {
    if (!this.commissionLotList$.data.some((x) => x.checked)) {
      return;
    }

    if (this.params.action == 'upd') {
      this.commissionLotList$.data.sort((a, b) => b.haveCreditNotes - a.haveCreditNotes).forEach((obj: any) => {
        if (obj.checked && !obj.disabled) {
          const somePolicyOfCreditNoteHasIncluded = this.commissionLotListIncluded.some((x) => this.generateCommissionLotId(x) == obj.pertenece);

          if (obj.isCreditNote && !somePolicyOfCreditNoteHasIncluded) {
            this.commissionLotListForInclude.push(obj.pertenece);

            this.errorMessageCommissionLotList =
              'Para incluir la(s) nota(s) de crédito debe incluir la póliza correspondiente a la(s) nota(s) de crédito';
          }

          if ((obj.isCreditNote && somePolicyOfCreditNoteHasIncluded) || !obj.isCreditNote) {
            obj.checked = false;
            obj.disabled = true;

            this.commissionLotListIncluded.push({
              ...obj,
              checked: this.commissionLotListIncluded.length > 0 ? this.commissionLotListIncluded.every((x) => x.checked) : false
            });
            return;
          }
        }
      });

      this.commissionLotCheckedAll = false;

      this.idTimeOutCommissionLotListForInclude.forEach((x) => {
        clearTimeout(x);
      });

      const timeout = setTimeout(() => {
        this.commissionLotListForInclude = [];
      }, 1000);
      this.idTimeOutCommissionLotListForInclude.push(timeout);

      this.orderByCommissionLotList();
      this.orderByCommissionLotListIncluded();
      this.calculateSumamryCommissionLot();
      return;
    }

    this.spinner.show();

    const payload = {
      idRamo: +this.formFilterControl['branch'].value,
      idProducto: +this.formFilterControl['product'].value,
      idCanal: +this.formFilterControl['salesChannel'].value,
      idUsuario: +this.currentUser['id'],
      listaPolizas: this.commissionLotList$.data.filter((x) => x.checked).map((obj: any) => ({ poliza: +obj.numeroPoliza })) as any[]
    };

    this.commissionLotService.validateDuplicationCommissions(payload).subscribe({
      next: (response: any) => {
        interface IPolicy {
          poliza: string;
          duplicidad: boolean;
          notasCredito: any[];
        }

        const policies = (response.listaPolizas ?? []) as Array<IPolicy>;

        this.commissionLotList$.data.forEach((obj: any) => {
          const policy = policies.find((x) => x.poliza == obj.numeroPoliza) as IPolicy;

          if (!policy) {
            return;
          }

          if (obj.checked && !policy.duplicidad) {
            obj.checked = false;
            obj.haveCreditNotes = policy.notasCredito.length > 0;

            if (obj.agrupado == 2) {
              this.getDetail(true, obj, true);
            } else {
              obj.disabled = true;
              this.commissionLotListIncluded.push({
                ...obj,
                checked: this.commissionLotListIncluded.length > 0
                  ? this.commissionLotListIncluded.every((x) => x.checked)
                  : false,
                notaCredito: policy.notasCredito.length > 1 ? 'VARIOS' : policy.notasCredito.length == 1 ? policy.notasCredito[0].comprobante : null
              });
            }

            // *Notas de credito de la póliza
            policy.notasCredito?.map((obj2: any) => {
              const isIncluded = this.commissionLotListIncluded.some(
                (x) => x.numeroRecibo == obj2.numeroRecibo
              );

              if (isIncluded) {
                return;
              }

              this.commissionLotListIncluded.push({
                ...obj2,
                pertenece: this.generateCommissionLotId(obj2),
                checked: false,
                agrupado: obj.agrupado,
                isCreditNote: true
              });
            });
          }
        });

        this.orderByCommissionLotListIncluded();

        if (policies.some((x) => x.duplicidad)) {
          const policiesDuplicated = policies.filter((x) => x.duplicidad).map((obj) => obj.poliza);

          const message =
            policiesDuplicated.length == 1
              ? `La póliza N° ${policiesDuplicated[0]} no se puede incluir porque existe una duplicidad en sus comprobantes`
              : `Las pólizas ${policiesDuplicated.join(
                ', '
              )} no se pueden incluir porque existe una duplicidad en sus comprobantes`;

          this.messageInfo = {
            success: false,
            showImage: false,
            message: message
          };
          this.vc.createEmbeddedView(this.modalMessage);
        }

        this.validateCommissionLotCheckedAll();
        this.calculateSumamryCommissionLot();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);

        this.messageInfo = {
          showImage: true,
          success: false,
          message:
            'Tenemos problemas para validar la información, por favor inténtelo más tarde'
        };
        this.vc.createEmbeddedView(this.modalMessage);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
        this.resetFormInvoiceGeneral();
        this.resetFormInvoiceAttachments();
      }
    });
  }

  /**
   * If the object is checked, then set the object's checked property to false and push the object to
   * the commissionLotListIncluded array.
   */
  includeCommissionLotDetail(data?: any, getCreditNotes = false): void {
    const countPushed =
      this.commissionLotDetail$.data.filter((x) => x.checked || x.disabled)?.length ?? 0;

    if (countPushed == this.commissionLotDetail$.data.length) {
      const find =
        this.commissionLotList$.data.find(
          (x) =>
            `${x.numeroRecibo}${x.fechaPago}` ==
            `${(data ?? this.commissionLotSelected).numeroRecibo}${
              (data ?? this.commissionLotSelected).fechaPago
            }`
        ) ?? {};
      find.disabled = true;
    }

    this.commissionLotDetail$.data = this.commissionLotDetail$.data.map(
      (obj: any) => {
        if (
          !this.commissionLotListIncluded.some(
            (x) =>
              `${x.numeroRecibo}${x.fechaPago}` ==
              `${obj.numeroRecibo}${obj.fechaPago}`
          )
        ) {
          if (obj.checked) {
            obj.checked = false;
            this.commissionLotListIncluded.push({
              ...obj,
              agrupado: this.commissionLotSelected.agrupado
            });
          }
        }
        return obj;
      }
    );

    if (!getCreditNotes) {
      this.commissionLotDetailCheckedAll = false;
      this.orderByCommissionLotListIncluded();
      this.calculateSumamryCommissionLot();
      this.hideModalCommissionLotDetail();
      return;
    }

    this.spinner.show();

    const payload = {
      idRamo: +this.formFilterControl['branch'].value,
      idProducto: +this.formFilterControl['product'].value,
      idCanal: +this.formFilterControl['salesChannel'].value,
      idUsuario: +this.currentUser['id'],
      listaPolizas: [
        {
          poliza: this.commissionLotDetail$.data[0].numeroPoliza
        }
      ]
    };

    this.commissionLotService.validateDuplicationCommissions(payload).subscribe({
      next: (response: any) => {
        const creditNotes = response.listaPolizas[0].notasCredito ?? [];

        creditNotes.map((obj: any) => {
          const isIncluded = this.commissionLotListIncluded.some(
            (x) => x.numeroRecibo == obj.numeroRecibo
          );

          if (isIncluded) {
            return;
          }

          this.commissionLotListIncluded.push({
            ...obj,
            checked: false,
            agrupado: this.commissionLotDetail$.data[0].agrupado,
            isCreditNote: true,
            pertenece: this.generateCommissionLotId(obj)
          });
        });

        this.commissionLotDetailCheckedAll = false;
        this.orderByCommissionLotListIncluded();
        this.calculateSumamryCommissionLot();
        this.hideModalCommissionLotDetail();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  excludeCommissionLot(): void {
    this.commissionLotListForInclude = [];
    this.errorMessageCommissionLotList = '';

    if (this.attachments.length) {
      this.vc.createEmbeddedView(this.modalRemoveLot);
    } else {
      this.removeCommissionLot();
    }
  }

  /* Checking if the commission lot has an error. */
  hasErrorCommissionLotForInclude(data: any): boolean {
    return this.commissionLotListForInclude.includes(
      this.generateCommissionLotId(data)
    );
  }

  /* Removing the commission lot. */
  removeCommissionLot(): void {
    const policiesUncheckedWithCreditNotes = this.commissionLotListIncluded.filter((x) => x.haveCreditNotes && !x.checked).map((obj) => this.generateCommissionLotId(obj));

    /**
     * It takes a boolean and an object as parameters and returns a string.
     * @param isGrouped - 2 = grouped, 1 = not grouped
     * @param data - is the object that contains the data that I want to concatenate.
     * @returns A string.
     */
    const concatReceiptPaymentDate = (isGrouped, data) => {
      return `${isGrouped == 2 ? data.numeroPoliza : data.numeroRecibo}${data.fechaPago}`;
    };

    this.commissionLotListIncluded.filter((x) => x.checked).forEach((commissionLotIncluded) => {
      /* Checking if the commissionLotIncluded is already in the commissionLotList$.data array. */
      const find = this.commissionLotList$.data.find(
        (commissionLot) =>
          concatReceiptPaymentDate(commissionLot.agrupado, commissionLot) == concatReceiptPaymentDate(commissionLot.agrupado, commissionLotIncluded)
      ) ?? {};

      find.disabled = false;
      find.checked = false;

      /* Checking if the commissionLotIncluded object has a property called haveCreditNotes and if it
      does, it is checking if the property isReceipt is false. */
      if (commissionLotIncluded.haveCreditNotes && !commissionLotIncluded.isReceipt) {
        const includePolicyWhitCreditNotes = policiesUncheckedWithCreditNotes.includes(this.generateCommissionLotId(commissionLotIncluded));

        if (includePolicyWhitCreditNotes) {
          return;
        }

        this.commissionLotListIncluded.filter((x) => x.isCreditNote &&
          this.generateCommissionLotId(x) ==
          this.generateCommissionLotId(commissionLotIncluded)).forEach((x) => {
          x.checked = true;
        });

        const findPolicy =
          this.commissionLotList$.data.find(
            (x) =>
              this.generateCommissionLotId(x) ==
              this.generateCommissionLotId(commissionLotIncluded)
          ) ?? {};

        findPolicy.disabled = false;
        findPolicy.checked = false;
      }

      if (
        commissionLotIncluded.haveCreditNotes &&
        commissionLotIncluded.isReceipt
      ) {
        const uncheckeds = this.commissionLotListIncluded.filter((x) => !x.checked && x.haveCreditNotes).map((x) => this.generateCommissionLotId(x));

        const isMarkAllReceipts = uncheckeds.includes(
          this.generateCommissionLotId(commissionLotIncluded)
        );

        if (!isMarkAllReceipts) {
          const receipts = this.commissionLotListIncluded.filter(
            (x) =>
              this.generateCommissionLotId(x) ==
              this.generateCommissionLotId(commissionLotIncluded)
          );

          receipts.map((x) => {
            x.checked = true;
          });
        }
      }
    });

    this.commissionLotListIncluded.forEach((obj: any) => {
      if (obj.isCreditNote) {
        const filter = this.commissionLotListIncluded.filter((x) => !x.checked && x.isCreditNote).map((x) => this.generateCommissionLotId(x));

        const checkedAllCreditNotes = filter.includes(this.generateCommissionLotId(obj));

        if (checkedAllCreditNotes) {
          return;
        }

        const finds = this.commissionLotListIncluded.filter(
          (x) =>
            !x.isCreditNote &&
            this.generateCommissionLotId(x) == this.generateCommissionLotId(obj)
        );

        finds.map((x) => {
          const find = this.commissionLotListIncluded.find((y) => y == x) ?? {};
          find.checked = true;

          this.commissionLotList$.data.filter(
            (y) =>
              this.generateCommissionLotId(y) ==
              this.generateCommissionLotId(x)
          ).map((y) => {
            y.disabled = false;
            x.checked = true;
          });
        });
        return;
      }
    });

    this.commissionLotListIncluded = this.commissionLotListIncluded.filter((x) => !x.checked);

    this.validateCommissionLotCheckedAll();
    this.validateCommissionLotIncludedCheckedAll();
    this.commissionLotMarkAllAsChecked(this.commissionLotCheckedAll);
    this.calculateSumamryCommissionLot();

    this.resetFormInvoiceGeneral();
    this.resetFormInvoiceAttachments();
    this.closeModal();
  }

  orderByCommissionLotList(): void {
    this.commissionLotList$.data = this.commissionLotList$.data.sort(
      (a, b) =>
        (b?.numeroPoliza as string)?.localeCompare(a?.numeroPoliza) ||
        b.haveCreditNotes - a.haveCreditNotes
    );
  }

  orderByCommissionLotListIncluded(): void {
    this.commissionLotListIncluded = this.commissionLotListIncluded.sort(
      (a, b) =>
        (b?.numeroPoliza as string)?.localeCompare(a?.numeroPoliza) ||
        b.haveCreditNotes - a.haveCreditNotes
    );
  }

  generateCommissionLotId(data: any): string {
    return `${data.numeroPoliza}-${data.fechaPago.replace(/[/]/g, '')}`;
  }

  commissionLotHasIncluded(data: any): boolean {
    const joinString = (x: any) => {
      return `${x.agrupado == 2 ? x.numeroPoliza : x.numeroRecibo}${x.fechaPago}`;
    };

    return this.commissionLotListIncluded.some(
      (x: any) => joinString(x) == joinString(data)
    );
  }

  calculateSumamryCommissionLot(): void {
    const commissionLotList = this.commissionLotListIncluded.map(
      (x) => +x.montoComision
    );
    const ammount = commissionLotList.reduce(
      (a, b) => +(+a).toFixed(2) + +(+b).toFixed(2),
      0
    );

    const salesChannel = +this.formFilterControl['salesChannel'].value;
    const find =
      +this.ListChannelSales.find((x) => +x.nchannel == salesChannel)?.ntypechannel ?? null;

    const idEditMode: boolean = !!this.params?.lotId;

    /* Checking if the value of the montoIgv property is truthy. */
    const hasIgv: boolean = !!+this.lotDetail.datosPago?.montoIgv;

    const igvCalculate = ammount * 0.18;

    const igv: number = idEditMode
      ? hasIgv
        ? igvCalculate
        : 0
      : find == 11
        ? 0
        : igvCalculate;
    const total = ammount + igv;

    this.commissionLotSummary = {
      ammount: ammount.toFixed(2).toString(),
      igv: igv.toFixed(2).toString(),
      total: total.toFixed(2).toString()
    };

    this.errorMessageSaveCommissionLot = '';

    if (this.validationsButtonSave.total <= 0) {
      this.errorMessageSaveCommissionLot = 'El importe total de la comisión debe ser mayor a 0';
    }

    if (!this.validationsButtonSave.creditNotesIsValid) {
      this.errorMessageSaveCommissionLot =
        'Se debe incluir al menos una nota de crédito';
    }
  }

  /**
   * If the file type is already in the array, then display a message. If the file type is not in the
   * array, then add it to the array.
   * @param {any} e - any =&gt; the event that is triggered when the file is selected
   * @returns The file is being returned as a blob.
   */
  uploadAttachment(e: any) {
    this.messageInfoAttachments = '';

    if (e.target?.files?.length) {
      const existFileType = this.attachments.some(
        (x) => x.fileType == this.formInvoiceControl['fileType'].value
      );

      if (existFileType) {
        // tslint:disable-next-line:max-line-length
        this.messageInfoAttachments = `Solo se puede adjuntar un documento de tipo ${
          this.formInvoiceControl['fileType'].value == 1 ? 'PDF' : 'XML'
        }`;
        this.formInvoiceControl['file'].setValue(null);
        return;
      }

      const ext: string = e.target.files[0].name.split('.').pop().toLocaleLowerCase();

      const fileTypeCodes = {
        pdf: 1,
        xml: 3
      };

      if (fileTypeCodes[ext] != this.formInvoiceControl['fileType'].value) {
        // tslint:disable-next-line:max-line-length
        this.messageInfoAttachments = `Extensión de archivo no permitida, debe adjuntar un archivo ${
          this.formInvoiceControl['fileType'].value == 1 ? 'PDF' : 'XML'
        }`;
        this.formInvoiceControl['file'].setValue(null);
        return;
      }

      if (this.formInvoiceControl['fileType'].value == 3) {
        const file = e.target.files[0];
        const payload = new CommissionLotAttach(
          3,
          this.params.lotId || 0,
          1,
          file,
          e.target.files[0].name,
          'text/xml',
          new Date().toString(),
          'new'
        );
        this.validateXML(payload, file, e);
        return;
      }

      const fileInfo: IFile = {
        id: new Date().getTime(),
        fileType: +this.formInvoiceControl['fileType'].value,
        fileTypeName:
          this.formInvoiceControl['fileType'].value == 1 ? 'PDF' : 'XML',
        file: e.target.files[0],
        fileName: e.target.files[0].name
      };

      this.attachments.push(fileInfo);
      this.formInvoiceControl['fileType'].setValue(null);
      this.formInvoiceControl['file'].setValue(null);
    }
  }

  removeAttachment(data: any) {
    const resetAmmounts = () => {
      this.formInvoiceGeneralControl['serialNumber'].setValue('');
      this.formInvoiceGeneralControl['invoiceNumber'].setValue('');
      this.formInvoiceGeneralControl['ruc'].setValue('');
    };
    const isXMLFileType = data.fileType == 3;

    this.attachments = this.attachments.filter(
      (x) => x.fileType != data.fileType
    );

    if (isXMLFileType) {
      resetAmmounts();
    }

    if (this.params?.lotId) {
      this.attachmentsForDetach.push(data);
    }
  }

  private removeAttachmentService(payload: any) {
    this.commissionLotService.removeAttachment(payload).subscribe();
  }

  backPage(): void {
    this.router.navigate(['broker/commissionlot']);
  }

  get commissionLotIncludedIsAllChecked(): boolean {
    if (!this.commissionLotListIncluded.length) {
      return false;
    }

    const pageIndex = (this.currentpageLotsIncluded - 1) * 10;

    return this.commissionLotListIncluded?.slice(pageIndex, pageIndex + 10).every((x) => x.checked);
  }

  get commissionLotDetailIsEveryChecked(): boolean {
    if (!this.commissionLotDetail$.data?.length) {
      return false;
    }

    return this.commissionLotDetail$.data.every((x) => x.checked);
  }

  get commissionLotIsSomeChecked(): boolean {
    if (!this.commissionLotList$.data?.length) {
      return false;
    }

    return this.commissionLotList$.data?.some((x) => x.checked);
  }

  get commissionLotIncludedIsSomeChecked(): boolean {
    if (!this.commissionLotListIncluded.length) {
      return false;
    }

    return this.commissionLotListIncluded.some((x) => x.checked);
  }

  get commissionLotDetailIsSomeChecked(): boolean {
    if (!this.commissionLotDetail$.data?.length) {
      return false;
    }

    return this.commissionLotDetail$.data?.some((x) => x.checked);
  }

  get totalAmmountCommissionLotIncluded(): number {
    return this.commissionLotListIncluded.map((x) => +(+x.montoComision).toFixed(2)).reduce((a, b) => a + b, 0) ?? 0;
  }

  openModalConfirmSaveCommissionLot(): void {
    this.onResetMessageInfo();
    this.closeModal();
    this.vc.createEmbeddedView(this.modalConfirmSaveCommissionLot);
  }

  saveCommissionLot(): void {
    this.closeModal();

    this.spinner.show();

    const request = {
      data: {
        idLote: this.params.lotId || 0,
        idRamo: this.formFilterControl['branch'].value || 0,
        idProducto: this.formFilterControl['product'].value || 0,
        idCanal: this.formFilterControl['salesChannel'].value || 0,
        idEstado: this.params.stateId || 1,
        cantidad: this.commissionLotListIncluded.length,
        idMoneda: this.formFilterControl['currency'].value || 0,
        idUsuario: this.currentUser.id,
        fechaEmisionComprobante: this.formInvoiceGeneralControl['emmissionDate'].value
          ? moment(
            this.formInvoiceGeneralControl['emmissionDate'].value
          ).format('DD/MM/YYYY')
          : null,
        numeroFactura:
          this.formInvoiceGeneralControl['invoiceNumber'].value || null,
        numeroSerie:
          this.formInvoiceGeneralControl['serialNumber'].value || null,
        idTipoDocumento:
          this.formInvoiceGeneralControl['voucherType'].value || 0,
        montoIgv: this.commissionLotSummary.igv || 0,
        montoNeto: this.commissionLotSummary.ammount || 0,
        montoTotal: this.commissionLotSummary.total || 0,
        numeroRuc: this.formInvoiceGeneralControl['ruc'].value || null,
        banco: this.formInvoiceBankControl['typeBank'].value || 0,
        numeroCuenta:
          this.formInvoiceBankControl['accountNumber'].value || null,
        idTipoCuenta: this.formInvoiceBankControl['accountType'].value || 0,
        numeroCodigoCuenta: this.formInvoiceBankControl['cci'].value || null,
        entidadExtranjera:
          this.formInvoiceBankControl['foreignEntity'].value || null,
        nombreEntidad: this.formInvoiceBankControl['entityName'].value || null,
        detalleLote:
          this.commissionLotListIncluded.map((item) => ({
            poliza: item.numeroPoliza,
            certificado: 0,
            recibo: item.numeroRecibo
          })) || []
      },
      adjuntosLote: this.attachments || []
    };

    const subs = this.commissionLotService.saveCommissionLot(request).subscribe({
      next: (response: any) => {
        this.messageInfo = {
          success: response.success,
          showImage: true
        };

        if (!response.success) {
          this.messageInfo.message = `Ocurrió un error al ${
            this.params.action == 'upd' ? 'actualizar' : 'generar'
          }  el lote`;
          return;
        }

        this.idComissionLot = response.idLote;
        this.messageInfo.message = `Se ${
          this.params.action == 'upd' ? 'actualizó' : 'generó'
        } correctamente el lote N° ${this.idComissionLot}.`;

        if (this.attachmentsForDetach.length && this.params?.lotId) {
          this.attachmentsForDetach.map((obj: any) => {
            const payload = {
              ...obj,
              lotId: this.params?.lotId
            };
            this.removeAttachmentService(payload);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);

        this.messageInfo = {
          success: false,
          showImage: true,
          message: `Tenemos problemas para ${
            this.params.action == 'upd' ? 'actualizar' : 'generar'
          }  el lote, inténtelo más tarde`
        };
        this.spinner.hide();
      },
      complete: () => {
        this.vc.createEmbeddedView(this.modalMessage);
        this.spinner.hide();
      }
    });

    this.subscription.add(subs);
  }

  onResetMessageInfo() {
    this.messageInfo = {
      success: false,
      showImage: false,
      message: ''
    };
  }

  closeModal(): void {
    this.vc.clear();

    if (!this.messageInfo.success) {
      this.onResetMessageInfo();
      return;
    }

    this.backStep();
  }

  openModalConfirmBackStep() {
    this.onResetMessageInfo();
    this.vc.createEmbeddedView(this.modalConfirmBackStep);
  }

  backStep(): void {
    this.router.navigate(['/extranet/commissionlot']);
  }

  get validationsButtonSave(): {
    included: number;
    formInvalid: boolean;
    total: number;
    haveCreditNotes: boolean;
    creditNotesIsValid?: boolean;
  } {
    const obj: any = {
      included: this.commissionLotListIncluded?.length,
      formInvalid: this.formInvoice.invalid,
      total: +this.commissionLotSummary.total,
      haveCreditNotes: this.commissionLotListIncluded?.some(
        (x) => x.haveCreditNotes
      )
    };
    obj.creditNotesIsValid = obj.haveCreditNotes ? this.commissionLotListIncluded.some((x) => x.isCreditNote) : true;
    return obj;
  }

  get disableButtonSave(): boolean {
    return (
      !this.validationsButtonSave.included ||
      this.validationsButtonSave.formInvalid ||
      this.validationsButtonSave.total <= 0 ||
      !this.validationsButtonSave.creditNotesIsValid
    );
  }

  get countCommissionLotSelected(): number {
    return this.commissionLotDetail$.data?.filter((x) => x.checked).length;
  }

  showModalCreditNotes(item): void {
    this.creditNotesOfPolicy = [];

    const payload = {
      idRamo: +this.formFilterControl['branch'].value,
      idProducto: +this.formFilterControl['product'].value,
      idCanal: +this.formFilterControl['salesChannel'].value,
      idUsuario: +this.currentUser['id'],
      listaPolizas: [{ poliza: item.numeroPoliza }]
    };

    this.spinner.show();
    this.commissionLotService.validateDuplicationCommissions(payload).subscribe({
      next: (response) => {
        response.listaPolizas = response.listaPolizas ?? [];
        let creditNotes: any[] = [];
        if (response.listaPolizas.length > 0) {
          creditNotes = response.listaPolizas[0].notasCredito.map((item) => ({
            ...item,
            isCreditNote: true
          }));
        }

        this.creditNotesOfPolicy = [item, ...creditNotes];

        this.vc.createEmbeddedView(this.modalCreditNotes);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    })
  }

  clearModals(): void {
    this.vc.clear();
  }

  countCreditNotes(item): number {
    if (item.isCreditNote) {
      return 0;
    }

    return this.commissionLotListIncluded.filter(x => this.generateCommissionLotId(x) == (`${item.numeroPoliza}-${x.fechaPago.replace(/[/]/g, '')}`) && x.isCreditNote).length
  }

  getFirstLetter(text: string): string {
    return (text.split('')[0] ?? '').toUpperCase();
  }

  get policiesWithoutCreditNotes(): any[] {
    if (this.params.action == 'upd') {
      return this.commissionLotListIncluded;
    }

    return this.commissionLotListIncluded.filter(x => !x.isCreditNote)
  }

  calculateCommision({ numeroPoliza }): number {
    const filter = this.commissionLotListIncluded.filter(x => x.numeroPoliza == numeroPoliza);
    return filter.map(x => +x.montoComision).reduce((a, b) => a + b, 0);
  }
}
