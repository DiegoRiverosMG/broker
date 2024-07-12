import { Response } from './../../../vidaindividual-latest/services/step1/DTOs/step1.dto';
import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { PayrollService } from '../../services/payroll/payroll.service';
import { PayrollPayment } from '../../models/payroll/payrollpayment';
import { PayrollCab } from '../../models/payroll/payrollcab';
import { PayrollDetail } from '../../models/payroll/payrolldetail';
import { PayrollFilter } from '../../models/payroll/payrollfilter';
import { ActivatedRoute, Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { StateChannelType } from '../../models/state/statechanneltype';
import { StateService } from '../../services/state/state.service';
import { UtilityService } from '@shared/services/general/utility.service';
import { ChannelPointService } from '@shared/services/channelpoint/channelpoint.service';
import { ChannelSalesService } from '@shared/services/channelsales/channelsales.service';
import { ChannelPoint } from '@shared/models/channelpoint/channelpoint';
import { ChannelSales } from '@shared/models/channelsales/channelsales';
import { ConfirmService } from '@shared/components/confirm/confirm.service';
import { VisaService } from '@shared/services/pago/visa.service';
import { PagoEfectivoService } from '@shared/services/pago/pago-efectivo.service';
import { SessionToken } from '../../../client/shared/models/session-token.model';
import { ButtonVisaComponent } from '@shared/components/button-visa/button-visa.component';
import { AppConfig } from '@root/app.config';
import { NgxSpinnerService } from 'ngx-spinner';
import { TableType } from '../../models/payroll/tabletype';
import { Currency } from '../../models/currency/currency';
import { environment } from 'environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isNullOrUndefined } from 'util';
import { EventStrings } from '../../shared/events/events';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { PolicyemitService } from '../../services/policy/policyemit.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { UtilsService } from '@shared/services/utils/utils.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentInfoResponseModel } from '@shared/models/document-information/document-information.model';
import { RegularExpressions } from '@shared/regexp/regexp';
import { KushkiService } from '../../../../shared/services/kushki/kushki.service';
import { String } from '@shared/components/kushki-form/constants/constants';
import { Kushki } from '@kushki/js';
import { v4 as uuid } from 'uuid';

defineLocale('es', esLocale);

@Component({
  selector: 'app-payroll-add',
  templateUrl: './payroll-add.component.html',
  styleUrls: ['./payroll-add.component.scss'],
})
export class PayrollAddComponent implements OnInit, OnDestroy {
  flag_grabar_planilla: boolean = false;
  IdTipoPago: string;
  messageinfo: string;
  setting_pay: string = '';
  planillaBuscar: string = '';
  channelPointId: string = '0';
  strObservacion: string = '';
  showModalPE: boolean = false;
  channelSalesId: string = '2017000025';
  puntoVenta: number = 0;

  showColumnsSOAT: boolean = true;
  showSelected: boolean = true;
  showCheckbox: boolean = false;
  showFiltrosLiquidacion: boolean = false;
  showDatosLiquidacion: boolean = false;
  showbtnGenerarPlanilla: boolean = false;
  showbtnGrabarTodo: boolean = false;
  showbtnEliminardePlanilla: boolean = false;
  showFiltrosEnviar: boolean = false;
  showTitleEvaluacion: boolean = false;
  paymentUrl: SafeResourceUrl;
  message: string;
  flagConfirmacion: string;

  ListCertificado: any[] = [];
  ListCertificadoFilter: any[] = [];
  ListPayRollGeneral: any = {};
  listPayrollDetail: any[] = [];
  listpayrollPaymentAdd: any[] = [];
  lstStateChannel: StateChannelType[];
  arrayNumerodoc: string = '';
  tipoCanal: number = 0;

  profileId: number = 0;
  selectedAll: any;
  selectedAllPlanilla: any;
  selectedAllPaymentRows: false;
  cantidadSoats: number = 0;
  totalplanilla: number = 0;
  totaldeclarado: number = 0;
  saldo: number = 0;

  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();

  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  bsValueFecOp: Date = new Date();
  resultBank: any = {};
  resultPaymentType: any = {};
  resultCurrentType: any = {};
  resultAccountBank: any = {};
  payrollPaymentAdd: any = {};
  result: any = {};
  resultPolAsocPlanilla: any = {};

  keypayment = 0;
  payrollCab = new PayrollCab(
    0,
    '',
    0,
    '',
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    [],
    [],
    '',
    ''
  );

  ListChannelSales: any[];
  ListChannelPoint: any[];
  channelSales: ChannelSales;
  salesPointIdSelected: any;

  lstBranch: TableType[];
  ListBranch: any[];
  ListBranchID = '';
  branchId = 66;

  lstProduct: TableType[];
  ListProduct: any[];
  lstProductsPE: number[];
  productId = 0;
  productSession = 0;

  lstCurrency: Currency[];
  ListCurrencyID = '';
  currencyId = 1;
  currencyAcron = 'S/';
  scurrency = '';
  lockfilter = false;

  npolicy;
  flagNpolicyConsulta = false;
  blockfilter = false;

  usuario;
  bPlanillaManual = false;
  btnVisa;
  frameResult;
  bLoading = false;
  bMostrarButtons = true;
  bMostrarButtonPE = false;
  bVisa = false;
  bVisaProduct = false;
  bPagoEfectivo = false;
  bBotonesActividad = true;
  bPagoEfectivoProduct = false;

  contractorControl: FormControl = this.builder.control('');
  listContractors$: any[] = [];
  contractorSelected: Partial<{ id: string; name: string }> = {};

  private kushki: Kushki;
  cardType: string = '';
  messageInfoKushki: string = '';
  paymentType$: any;
  methodKushki = {
    card: 4,
    cash: 5,
    transfer: 6,
  };

  kushkiForm: FormGroup = this.builder.group({
    cardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(14),
        Validators.maxLength(16),
      ],
    ],
    dueDate: [
      '',
      [
        Validators.pattern('^(0[1-9]|1[0-2])/(0[1-9]|[1-2][0-9]|3[0-1])$'),
        Validators.required,
        Validators.maxLength(5),
      ],
    ],
    cvv: [
      '',
      [
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(3),
        Validators.maxLength(4),
      ],
    ],
  });

  DOCUMENTTYPES = {
    '1': 'RUC',
    '2': 'DNI',
    '4': 'CE',
    '15': 'PTP',
  };
  SEARCHTYPES = {
    document: '1',
    names: '2',
  };
  PERSONTYPES = {
    natural: '1',
    business: '2',
  };

  documentNumberContractorValidations: {
    minLength: number;
    maxLength: number;
  } = {
    minLength: 8,
    maxLength: 8,
  };
  formContractor: FormGroup = this.builder.group({
    searchType: [this.SEARCHTYPES.document],
    personType: [this.PERSONTYPES.natural],
    documentType: ['2', [Validators.required]],
    documentNumber: [
      '',
      [
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(
          this.documentNumberContractorValidations.minLength
        ),
        Validators.maxLength(
          this.documentNumberContractorValidations.maxLength
        ),
      ],
    ],
    legalName: [''],
    names: [''],
    apePat: [''],
    apeMat: [''],
  });

  currentPageListContractors: number = 1;
  clientCodeContractorControl: FormControl = this.builder.control('');
  visaFormInitialized: boolean = false;

  //@ViewChild('modalResultadoPE') modalResultado;
  @ViewChild('modalResultadoPE', { static: true, read: TemplateRef })
  modalResultadoPE: TemplateRef<ElementRef>;
  //   @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('modalLiquidacion', { static: true, read: TemplateRef })
  modalLiquidacion: TemplateRef<ElementRef>;
  //   @ViewChild('childModalInfo', { static: true }) childModalInfo: ModalDirective;
  @ViewChild('modalInfo', { static: true, read: TemplateRef })
  modalInfo: TemplateRef<ElementRef>;
  //   @ViewChild('childModalConfirmasivo', { static: true })
  //   childModalConfirmasivo: ModalDirective;
  @ViewChild('modalConfirmasivo', { static: true, read: TemplateRef })
  modalConfirmasivo: TemplateRef<ElementRef>;
  @ViewChild('modalContractor', { static: true, read: TemplateRef })
  modalContractor: TemplateRef<ElementRef>;
  @ViewChild('modalKushkiCard', { static: true, read: TemplateRef })
  modalKushkiCard: TemplateRef<ElementRef>;

  constructor(
    private payrollService: PayrollService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private serviceState: StateService,
    private router: Router,
    public utilityService: UtilityService,
    private channelPointService: ChannelPointService,
    private channelSalesService: ChannelSalesService,
    private confirmService: ConfirmService,
    private readonly sanitizer: DomSanitizer,
    private visaService: VisaService,
    private pagoEfectivoService: PagoEfectivoService,
    private vcr: ViewContainerRef,
    private spinner: NgxSpinnerService,
    private emissionService: EmisionService,
    private factoryResolver: ComponentFactoryResolver,
    private policyemit: PolicyemitService,
    private readonly builder: FormBuilder,
    private readonly utilsService: UtilsService,
    private readonly kushkiService: KushkiService,
    private readonly viewContainerRef: ViewContainerRef
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
    this.paymentType$ = {
      niubiz: false,
      kushkiCard: false,
      kushkiCash: false,
      kushkiTransfer: false,
    };
  }

  ngOnInit() {
    this.spinner.show();
    this.formContractorValidations();
    this.ProductsPagoEfectivo();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.tipoCanal = +currentUser.tipoCanal;
    this.profileId = +currentUser.profileId;
    this.channelSalesId = currentUser.canal;
    this.puntoVenta = currentUser.puntoVenta;

    const id: string = this.route.snapshot.paramMap.get('id') || '';
    const accion: string = this.route.snapshot.paramMap.get('accion') || '';
    const nidstate: string = this.route.snapshot.paramMap.get('nidstate') || '';

    this.onGetCurency();
    this.LoadChannelSales();
    this.onSelectChannelSales(this.channelSalesId);

    if (accion === 'send') {
      const StateChannel = new StateChannelType(
        0,
        '',
        this.tipoCanal,
        +nidstate
      );
      this.serviceState
          .GetStatexChannelTypexStateAnt(StateChannel)
          .subscribe((data) => {
            this.lstStateChannel = <StateChannelType[]>data;
            if (this.lstStateChannel.length === 0) {
              this.showSelected = false;
              this.showTitleEvaluacion = false;
              this.showbtnGrabarTodo = false;
            } else {
              this.showSelected = true;
              this.showTitleEvaluacion = true;
              this.showbtnGrabarTodo = false;
            }
          });
      this.showDatosLiquidacion = true;

      this.payrollCab.NIDPAYROLL = +id;
      this.payrollCab.SCODCHANNEL = this.tipoCanal;
      if (this.payrollCab.NIDPAYROLL > 0) {
        this.payrollService.GetPayRollGeneral(this.payrollCab).subscribe(
          (data) => {
            this.ListPayRollGeneral = <PayrollCab[]>data;
            this.strObservacion = this.ListPayRollGeneral.sobservacion;
            this.listPayrollDetail = this.ListPayRollGeneral.listpayrolldetail;
            this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
            this.listpayrollPaymentAdd =
              this.ListPayRollGeneral.listpayrollpayment;
            this.keypayment = this.listpayrollPaymentAdd.length;
            this.showColumnsSOAT = this.listPayrollDetail[0].nbranch === 66;

            // sumar el importa total del certificado
            this.cantidadSoats = this.listPayrollDetail.length;
            this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
            this.scurrency = this.listPayrollDetail[0].scurrency;

            for (let e = 0; e < this.listPayrollDetail.length; e++) {
              this.totalplanilla += this.listPayrollDetail[e].npremium;
            }

            // sumar el importa total del payment
            for (let i = 0; i < this.listpayrollPaymentAdd.length; i++) {
              this.totaldeclarado += this.listpayrollPaymentAdd[i].namount;
            }
            this.calcular();
          },
          (error) => {
            console.log(error);
          }
        );
      }
    } else if (accion === 'upd') {
      this.showSelected = false;
      this.showCheckbox = true;
      this.showFiltrosLiquidacion = true;
      this.showDatosLiquidacion = true;
      this.showbtnGenerarPlanilla = true;
      this.showbtnGrabarTodo = true;
      this.showbtnEliminardePlanilla = true;
      this.showFiltrosEnviar = true;
      this.bMostrarButtons = false;
      this.lockfilter = true;
      this.getCertificado();
      this.payrollCab.NIDPAYROLL = +id;
      if (this.payrollCab.NIDPAYROLL > 0) {
        this.payrollService.GetPayRollGeneral(this.payrollCab).subscribe(
          (data) => {
            this.ListPayRollGeneral = <PayrollCab[]>data;
            this.listPayrollDetail = this.ListPayRollGeneral.listpayrolldetail;
            this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
            this.listpayrollPaymentAdd =
              this.ListPayRollGeneral.listpayrollpayment;
            this.keypayment = this.listpayrollPaymentAdd.length;

            // sumar el importa total del certificado
            this.cantidadSoats = this.listPayrollDetail.length;
            this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
            this.scurrency = this.listPayrollDetail[0].scurrency;
            this.showColumnsSOAT =
              this.listPayrollDetail[0].nbranch === 66 ? true : false;

            for (let e = 0; e < this.listPayrollDetail.length; e++) {
              this.totalplanilla += this.listPayrollDetail[e].npremium;
            }

            // sumar el importa total del payment
            for (let i = 0; i < this.listpayrollPaymentAdd.length; i++) {
              this.totaldeclarado += this.listpayrollPaymentAdd[i].namount;
            }
            this.calcular();
            sessionStorage.removeItem('dataBranchProdcut');
          },
          (error) => {
            console.log(error);
          }
        );
      }
    } else if (accion === 'add') {
      this.showSelected = false;
      this.showCheckbox = true;
      this.showFiltrosLiquidacion = true;
      this.showDatosLiquidacion = false;
      this.showbtnGenerarPlanilla = true;
      this.showbtnGrabarTodo = true;
      this.showbtnEliminardePlanilla = true;
      this.showFiltrosEnviar = true;
      this.getCertificado();
    } else if (accion === 'pago') {
      this.showSelected = false;
      this.showCheckbox = true;
      this.showFiltrosLiquidacion = true;
      this.showDatosLiquidacion = false;
      this.showbtnGenerarPlanilla = true;
      this.showbtnGrabarTodo = true;
      this.showFiltrosEnviar = true;
      this.showbtnEliminardePlanilla = true;
      this.bBotonesActividad = true;
      this.getCertificadoSession();
    }

    this.kushkiFormControl['cardNumber'].valueChanges.subscribe(
      (value: string) => {
        this.cardType = undefined;
        if (this.kushkiFormControl['cardNumber'].hasError('pattern')) {
          this.kushkiFormControl['cardNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.kushkiFormControl['dueDate'].valueChanges.subscribe(
      (value: string) => {
        const split = value.split('/');

        split.forEach((val) => {
          const regex = new RegExp(RegularExpressions.numbers);

          if (!regex.test(val)) {
            if (!val) {
              return;
            }

            this.kushkiFormControl['dueDate'].setValue('', {
              emitEvent: false,
            });
          }
        });

        if (value.length === 2) {
          this.kushkiFormControl['dueDate'].setValue(`${value}/`);
        }
      }
    );

    this.kushkiFormControl['cvv'].valueChanges.subscribe((value: string) => {
      if (this.kushkiFormControl['cvv'].hasError('pattern')) {
        this.kushkiFormControl['cvv'].setValue(
          value.slice(0, value.length - 1)
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.btnVisa) {
      this.btnVisa.destroy();
    }

    if (this.frameResult) {
      this.frameResult.destroy();
    }
  }

  get formContractorControl(): { [key: string]: AbstractControl } {
    return this.formContractor.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  get kushkiFormControl(): { [key: string]: AbstractControl } {
    return this.kushkiForm.controls;
  }

  get uuid(): any {
    if (sessionStorage.getItem('soat-uuid')) {
      return sessionStorage.getItem('soat-uuid');
    }

    const guid = uuid();
    sessionStorage.setItem('soat-uuid', guid);
    return this.uuid;
  }

  formContractorValidations(): void {
    this.formContractor.valueChanges.subscribe((): void => {
      this.contractorSelected = {};
      this.listContractors$ = [];
    });

    this.formContractorControl['searchType'].valueChanges.subscribe(
      (value: string): void => {
        this.resetFormContractor();

        if (value == this.SEARCHTYPES.document) {
          this.formContractorControl['documentNumber'].enable({
            emitEvent: false,
          });
          this.formContractorControl['legalName'].disable({
            emitEvent: false,
          });
          this.formContractorControl['names'].disable({
            emitEvent: false,
          });
          this.formContractorControl['apePat'].disable({
            emitEvent: false,
          });
          this.formContractorControl['apeMat'].disable({
            emitEvent: false,
          });
          return;
        }

        this.formContractorControl['personType'].setValue(
          this.PERSONTYPES.natural
        );
        this.formContractorControl['documentNumber'].disable({
          emitEvent: false,
        });
        this.formContractorControl['legalName'].enable({
          emitEvent: false,
        });
        this.formContractorControl['names'].enable({
          emitEvent: false,
        });
        this.formContractorControl['apePat'].enable({
          emitEvent: false,
        });
        this.formContractorControl['apeMat'].enable({
          emitEvent: false,
        });
      }
    );

    this.formContractorControl['personType'].valueChanges.subscribe(
      (value: string): void => {
        this.formContractorControl['names'].setValue('');
        this.formContractorControl['apePat'].setValue('');
        this.formContractorControl['apeMat'].setValue('');
        this.formContractorControl['legalName'].setValue('');

        const updateControlsAndValidity = (): void => {
          this.formContractorControl['names'].updateValueAndValidity();
          this.formContractorControl['apePat'].updateValueAndValidity();
          this.formContractorControl['apeMat'].updateValueAndValidity();
          this.formContractorControl['legalName'].updateValueAndValidity();
        };

        if (+value === +this.PERSONTYPES.natural) {
          this.formContractorControl['documentType'].setValue('2');

          this.formContractorControl['names'].setValidators([
            Validators.pattern(RegularExpressions.text),
            Validators.required,
            Validators.minLength(3),
          ]);
          this.formContractorControl['apePat'].setValidators([
            Validators.pattern(RegularExpressions.text),
            Validators.required,
            Validators.minLength(3),
          ]);
          this.formContractorControl['apeMat'].setValidators([
            Validators.pattern(RegularExpressions.text),
            Validators.minLength(3),
          ]);
          this.formContractorControl['legalName'].clearValidators();
          updateControlsAndValidity();
          return;
        }

        this.formContractorControl['legalName'].setValidators([
          Validators.required,
          Validators.minLength(4),
        ]);
        this.formContractorControl['names'].clearValidators();
        this.formContractorControl['apePat'].clearValidators();
        this.formContractorControl['apeMat'].clearValidators();
        updateControlsAndValidity();

        this.formContractorControl['documentType'].setValue('1');
      }
    );

    this.formContractorControl['documentType'].valueChanges.subscribe(
      (value: string): void => {
        switch (+value) {
          case 1:
            this.documentNumberContractorValidations = {
              minLength: 11,
              maxLength: 11,
            };
            this.formContractorControl['documentNumber'].setValidators([
              Validators.pattern(RegularExpressions.numbers),
              Validators.minLength(11),
              Validators.maxLength(11),
              Validators.required,
            ]);
            break;
          case 2:
            this.documentNumberContractorValidations = {
              minLength: 8,
              maxLength: 8,
            };
            this.formContractorControl['documentNumber'].setValidators([
              Validators.pattern(RegularExpressions.numbers),
              Validators.minLength(8),
              Validators.maxLength(8),
              Validators.required,
            ]);
            break;
          case 4:
            this.documentNumberContractorValidations = {
              minLength: 9,
              maxLength: 12,
            };
            this.formContractorControl['documentNumber'].setValidators([
              Validators.pattern(RegularExpressions.alpha),
              Validators.minLength(9),
              Validators.maxLength(12),
              Validators.required,
            ]);
            break;
        }

        this.formContractorControl['documentNumber'].updateValueAndValidity();
        this.formContractorControl['documentNumber'].setValue('');
      }
    );

    this.formContractorControl['documentNumber'].valueChanges.subscribe(
      (value: string): void => {
        if (
          this.formContractorControl['documentNumber'].hasError('pattern') ||
          this.formContractorControl['documentNumber'].hasError('maxlength')
        ) {
          this.formContractorControl['documentNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formContractorControl['names'].valueChanges.subscribe(
      (value: string): void => {
        if (!value) {
          return;
        }

        if (this.formContractorControl['names'].hasError('pattern')) {
          this.formContractorControl['names'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formContractorControl['apePat'].valueChanges.subscribe(
      (value: string): void => {
        if (!value) {
          return;
        }

        if (this.formContractorControl['apePat'].hasError('pattern')) {
          this.formContractorControl['apePat'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formContractorControl['apeMat'].valueChanges.subscribe(
      (value: string): void => {
        if (!value) {
          return;
        }

        if (this.formContractorControl['apeMat'].hasError('pattern')) {
          this.formContractorControl['apeMat'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  initComponent() {
    const usuarioSession = localStorage.getItem('currentUser');
    this.productSession = this.validaSessionProduct();
    if (usuarioSession !== null) {
      this.usuario = JSON.parse(usuarioSession);
    }

    this.onGetLstBranch();
    const accion = this.route.snapshot.paramMap.get('accion') || '';
    if (accion === 'add') {
      this.branchId = 66;
      this.productId = 1;
    } else if (accion === 'upd') {
      this.branchId = JSON.parse(
        sessionStorage.getItem('dataBranchProdcut')
      ).branch;
      this.productId = JSON.parse(
        sessionStorage.getItem('dataBranchProdcut')
      ).product;
    } else {
    }
    this.onSelectBranch(this.branchId, false);
    this.onSelectProduct(this.productId);
  }

  showHideModalContractor(show: boolean): void {
    if (!show) {
      this.vcr.clear();
      return;
    }

    if (this.contractorSelected.id) {
      return;
    }

    // this.resetFormContractor();
    this.clientCodeContractorControl.setValue('');
    this.currentPageListContractors = 1;
    this.formContractorControl['searchType'].setValue(
      this.SEARCHTYPES.document
    );
    this.listContractors$ = [];
    this.vcr.createEmbeddedView(this.modalContractor);
  }

  getDocumentInfo(): void {
    if (this.formContractor.invalid) {
      return;
    }

    this.currentPageListContractors = 1;

    if (
      this.formContractorControl['searchType'].value == this.SEARCHTYPES.names
    ) {
      this.searchDocumentByNames();
      return;
    }

    const payload: any = {
      idRamo: 100,
      idTipoDocumento: this.formContractorControl['documentType'].value,
      numeroDocumento:
        this.formContractorControl['documentNumber'].value.toUpperCase(),
      token: new Date().getTime().toString(),
    };
    this.spinner.show();
    this.utilsService.documentInfoResponse(payload).subscribe({
      next: (response: DocumentInfoResponseModel): void => {
        console.dir(response);

        if (!response.success) {
          this.listContractors$ = [];
          return;
        }
        const responseTransform = {
          ...response,
          contractor:
            this.formContractorControl['documentType'].value == 1
              ? response.legalName
              : `${response.names ?? ''} ${response.apePat ?? ''} ${
                response.apeMat ?? ''
              }`.trim(),
        };

        this.listContractors$ = [responseTransform];

        if (this.listContractors$.length == 1) {
          this.clientCodeContractorControl.setValue(
            this.listContractors$[0].clientCode
          );
          this.onChangeSelectContractor(this.listContractors$[0]);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      },
    });
  }

  searchDocumentByNames(): void {
    this.listContractors$ = [];
    this.spinner.show();
    const payload = {
      nombres: this.formContractorControl['names'].value || null,
      apellidoPaterno: this.formContractorControl['apePat'].value || null,
      apellidoMaterno: this.formContractorControl['apeMat'].value || null,
      razonSocial: this.formContractorControl['legalName'].value || null,
      idUsuario: +this.currentUser['id'],
    };
    this.utilsService.searchDocumentByNames(payload).subscribe({
      next: (response: any[]): void => {
        console.dir(response);

        let documentTypesIncludes: number[] = [2, 4, 15];

        if (
          this.formContractorControl['personType'].value ===
          this.PERSONTYPES.business
        ) {
          documentTypesIncludes = [1];
        }

        this.listContractors$ = response
          .map((obj: any) => ({
            clientCode: obj.CodigoCliente,
            documentType: +obj.IdTipoDocumento,
            documentNumber: obj.NumeroDocumento,
            contractor:
              this.formContractorControl['personType'].value ==
              this.PERSONTYPES.natural
                ? `${obj.Nombre ?? ''} ${obj.ApellidoPaterno ?? ''} ${
                  obj.ApellidoMaterno ?? ''
                }`.trim()
                : obj.RazonSocial,
          }))
          .filter(
            (item) =>
              documentTypesIncludes.includes(item.documentType) &&
              item.documentNumber
          );

        console.log(this.listContractors$);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      },
    });
  }

  resetFormContractor(): void {
    this.formContractor.patchValue({
      personType: '',
      documentType: '2',
      documentNumber: '',
      legalName: '',
      names: '',
      apePat: '',
      apeMat: '',
    });
  }

  removeContractorSelected(): void {
    this.contractorSelected = {};
    this.contractorControl.setValue('');
  }

  selectContractor(): void {
    this.contractorControl.setValue(this.contractorSelected.name);
    this.showHideModalContractor(false);
  }

  onChangeSelectContractor(item): void {
    this.contractorSelected = {
      id: item.clientCode,
      name: item.contractor,
    };
  }

  aceptarmsginfo() {
    //this.childModal.hide();
    this.viewContainerRef.clear();
    this.router.navigate(['broker/payroll']);
  }

  aceptar() {
    //this.childModalInfo.hide();
    this.viewContainerRef.clear();
  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;
    this.channelSales = new ChannelSales(nusercode, '0', '');
    this.channelSalesService.getPostChannelSales(this.channelSales).subscribe(
      (data) => {
        this.ListChannelSales = <any[]>data;
        // Si tiene un canal seleccionado por defecto
        // if (this.ListChannelSales.length === 1) {
        //   this.ListChannelSales.forEach(element => {
        //     // this.ChannelSaleSelected = element.nchannel
        //     this.channelSalesId = '2017000025'; // element.nchannel;
        //   });
        // } else {
        //   this.channelSalesId = '0';
        // }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSelectChannelPoint(channelPointId) {
    this.channelPointId = channelPointId;
  }

  onSelectChannelSales(channelSalesId) {
    this.channelSalesId = channelSalesId;
    if (channelSalesId === '0') {
      this.ListChannelPoint = [];
    } else {
      const salePoint = new ChannelPoint(channelSalesId.toString(), 0);
      this.channelPointService.getPostChannelPoint(salePoint).subscribe(
        (data) => {
          this.ListChannelPoint = <any[]>data;
          if (this.ListChannelPoint.length > 0) {
            if (!this.flagNpolicyConsulta) {
              this.salesPointIdSelected = this.ListChannelPoint[0].nnumpoint;
            }
            if (this.ListChannelPoint.length > 1) {
              const all = {
                nnumpoint: null,
                sdescript: 'TODOS',
              };
              this.ListChannelPoint = [all].concat(this.ListChannelPoint);
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  getPaymentType() {
    const data = {
      aplicacion: 2,
      idRamo: this.branchId,
      idProducto: 1,
      codigoCanal: '0',
    };

    this.utilsService.obtenerMetodoPago(data).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.paymentType$.niubiz = response.tiposPago.some(
          (val: any) => val.idTipoPago == 2
        );
        this.paymentType$.kushkiCard = response.tiposPago.some(
          (val: any) => val.idTipoPago == 6
        );
        this.paymentType$.kushkiCash = response.tiposPago.some(
          (val: any) => val.idTipoPago == 7
        );
        this.paymentType$.kushkiTransfer = response.tiposPago.some(
          (val: any) => val.idTipoPago == 8
        );
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  CancelaryRegresar(): void {
    this.router.navigate(['broker/payroll']);
  }

  onSelectState(StateID) {
    if (StateID === '0') {
      this.payrollCab.NIDSTATE = +StateID;
    } else {
      this.payrollCab.NIDSTATE = +StateID;
    }
  }

  onEventSearch() {
    this.lockfilter = false;
    this.blockfilter = false;
    this.getCertificado();
  }

  getCertificado() {
    const payrollFilterCertificate = new PayrollFilter(
      '01/01/2017',
      '01/01/2019',
      0,
      '2018000059',
      '',
      0,
      0,
      0,
      1
    );

    if (!isNullOrUndefined(this.npolicy) && this.npolicy !== '') {
      payrollFilterCertificate.NPOLICY = this.npolicy;
    } else {
      payrollFilterCertificate.DISSUEDAT_INI = this.datePipe.transform(
        this.bsValueIni,
        'dd/MM/yyyy'
      );
      payrollFilterCertificate.DISSUEDAT_FIN = this.datePipe.transform(
        this.bsValueFin,
        'dd/MM/yyyy'
      );
      payrollFilterCertificate.SCHANNEL_BO = this.channelSalesId;
      payrollFilterCertificate.SSALEPOINT_BO = +this.channelPointId
        ? this.channelPointId
        : '0';
      payrollFilterCertificate.NBRANCH = this.branchId;
      payrollFilterCertificate.NPRODUCT = this.productId;
      payrollFilterCertificate.NCURRENCY = this.currencyId;
      payrollFilterCertificate.SCLIENT = this.contractorSelected.id || '0';

      if (this.bVisa) {
        this.bVisaProduct =
          +this.productId === 0 ||
          +this.branchId === 66 ||
          +this.branchId === 77 ||
          +this.branchId === 73;
      }
      this.showColumnsSOAT = +this.branchId === 66;
    }

    this.spinner.show();
    this.payrollService.getPostCertificado(payrollFilterCertificate).subscribe(
      (data) => {
        this.ListCertificado = <any[]>data;
        for (let e = 0; e < this.ListCertificado.length; e++) {
          for (let f = 0; f < this.listPayrollDetail.length; f++) {
            const objeto = this.ListCertificado.find(
              (x) => x.npolicy === this.listPayrollDetail[f].npolicy
            );
            const index = this.ListCertificado.indexOf(objeto);
            if (index >= 0) {
              this.ListCertificadoFilter.push(objeto);
            }
          }
        }
        const missing = this.ListCertificado.filter(
          (item) => this.ListCertificadoFilter.indexOf(item) < 0
        );
        this.ListCertificado = missing;

        if (
          !isNullOrUndefined(this.npolicy) &&
          this.npolicy !== '' &&
          this.ListCertificado.length > 0
        ) {
          this.getCertificadoByPolicy();
        }
        if (this.bVisa) {
          this.bVisaProduct =
            this.ListCertificado.length > 0
              ? this.ListCertificado[0].nbranch === 66 ||
              this.ListCertificado[0].nbranch === 77 ||
              this.ListCertificado[0].nbranch === 73
              : false;
        }

        if (this.ListCertificado.length > 0) {
          this.showColumnsSOAT = this.ListCertificado[0].nbranch === 66;
        }

        if (this.listPayrollDetail.length > 0) {
          this.lockfilter = true;
        }

        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getCertificadoSession() {
    const payrollFilterCertificate = new PayrollFilter(
      '01/01/2017',
      '01/01/2019',
      0,
      '2018000059',
      '',
      0,
      0,
      0,
      1
    );
    payrollFilterCertificate.DISSUEDAT_INI = this.datePipe.transform(
      this.bsValueIni,
      'dd/MM/yyyy'
    );
    payrollFilterCertificate.DISSUEDAT_FIN = this.datePipe.transform(
      this.bsValueFin,
      'dd/MM/yyyy'
    );
    payrollFilterCertificate.SCHANNEL_BO = this.channelSalesId;
    payrollFilterCertificate.SSALEPOINT_BO = +this.channelPointId
      ? this.channelPointId
      : '0';
    payrollFilterCertificate.NBRANCH = this.branchId;
    payrollFilterCertificate.NPRODUCT = this.productId;
    payrollFilterCertificate.NCURRENCY = this.currencyId;

    this.payrollService.getPostCertificado(payrollFilterCertificate).subscribe(
      (data) => {
        this.ListCertificado = <any[]>data;
        const pagoPlanilla = JSON.parse(sessionStorage.getItem('planilla'));
        this.ListPayRollGeneral = <PayrollCab[]>pagoPlanilla;
        this.listPayrollDetail = pagoPlanilla.LISTPAYROLLDETAIL;
        this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
        this.showColumnsSOAT = +this.listPayrollDetail[0].nbranch === 66;
        this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
        this.scurrency = this.listPayrollDetail[0].scurrency;
        for (let e = 0; e < this.ListCertificado.length; e++) {
          for (let f = 0; f < this.listPayrollDetail.length; f++) {
            const objeto = this.ListCertificado.find(
              (x) => x.npolicy === this.listPayrollDetail[f].npolicy
            );
            const index = this.ListCertificado.indexOf(objeto);
            if (index >= 0) {
              this.ListCertificadoFilter.push(objeto);
            }
          }
        }
        this.ListCertificado = this.ListCertificado.filter(
          (item) => this.ListCertificadoFilter.indexOf(item) < 0
        );

        this.cantidadSoats = this.listPayrollDetail.length;
        for (let e = 0; e < this.listPayrollDetail.length; e++) {
          this.totalplanilla += this.listPayrollDetail[e].npremium;
        }
        this.calcular();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectAll() {
    for (let i = 0; i < this.ListCertificado.length; i++) {
      this.ListCertificado[i].selected = this.selectedAll;
    }
  }

  selectAllPlanilla() {
    for (let i = 0; i < this.listPayrollDetail.length; i++) {
      this.listPayrollDetail[i].selected = this.selectedAllPlanilla;
    }
  }

  selectAllPayment() {
    for (let i = 0; i < this.listpayrollPaymentAdd.length; i++) {
      this.listpayrollPaymentAdd[i].selected = this.selectedAllPaymentRows;
    }
  }

  checkIfAllSelected() {
    this.ListCertificado.every(function(item: PayrollDetail) {
      return item.selected === true;
    });
  }

  checkIfAllSelectedPlanilla() {
    this.listPayrollDetail.every(function(item: PayrollDetail) {
      return item.selected === true;
    });
  }

  checkIfAllSelectedPayment() {
    this.listpayrollPaymentAdd.every(function(item: PayrollPayment) {
      return item.selected === true;
    });
  }

  btn_Incluir() {
    let contador = 0;
    for (let i = 0; i < this.ListCertificado.length; i++) {
      if (this.ListCertificado[i].selected === true) {
        this.arrayNumerodoc += this.ListCertificado[i].npolicy + ',';
        contador++;
      }
    }
    if (contador > 0) {
      this.EliminarCertificado();
    } else {
      this.messageinfo = 'Por favor, seleccione un registro';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
    }
    this.getPaymentType();
  }

  EliminarCertificado() {
    this.arrayNumerodoc = this.arrayNumerodoc.slice(0, -1);
    this.ListCertificado.filter((x) => x.selected).forEach((obj): void => {
      this.cantidadSoats++;

      obj.selected = false;
      obj.NIDPAYROLLDETAIL = 1000;
      obj.NUSERREGISTER = 9999;
      this.totalplanilla += obj.npremium;

      this.listPayrollDetail.push(obj);
    });
    this.listPayrollDetail.forEach((obj: any): void => {
      this.ListCertificado = this.ListCertificado.filter(
        (x) => x.nreceipt != obj.nreceipt
      );
    });

    this.currencyAcron = this.listPayrollDetail[0].sshortcurrency;
    this.scurrency = this.listPayrollDetail[0].scurrency;
    this.arrayNumerodoc = '';
    this.selectedAll = false;
    this.lockfilter = true;
  }

  btn_Eliminar() {
    let contador = 0;
    for (let e = 0; e < this.listPayrollDetail.length; e++) {
      if (this.listPayrollDetail[e].selected === true) {
        this.arrayNumerodoc += this.listPayrollDetail[e].npolicy + ',';
        contador++;
      }
    }
    if (contador > 0) {
      this.EliminarCertificadoAgregados();
    } else {
      this.messageinfo = 'Por favor, seleccione un registro';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
    }
  }

  EliminarCertificadoAgregados() {
    // eliminar listado matriz
    this.listPayrollDetail
        .filter((x) => x.selected)
        .forEach((obj: any): void => {
          const payroll = Object.create(obj);
          this.totalplanilla -= payroll.npremium;
          payroll.selected = false;
          this.ListCertificado.push(payroll);
        });
    this.listPayrollDetail = this.listPayrollDetail.filter((x) => !x.selected);

    this.lockfilter = !!this.listPayrollDetail.length;
    this.arrayNumerodoc = '';
    this.selectedAllPlanilla = false;
    this.ListCertificado = this.ListCertificado.sort((a: any, b: any) =>
      a.nreceipt < b.nreceipt ? 1 : -1
    );
    this.calcular();
  }

  AgregarDatosLiquidacion() {
    if (
      this.resultCurrentType.id === undefined ||
      this.resultCurrentType.id === null ||
      this.resultCurrentType.id === '0'
    ) {
      this.messageinfo = 'Por favor, seleccione tipo de moneda';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (
      this.payrollPaymentAdd.NAMOUNT === undefined ||
      this.payrollPaymentAdd.NAMOUNT === null ||
      this.payrollPaymentAdd.NAMOUNT === ''
    ) {
      this.messageinfo = 'Por favor, ingrese importe';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (this.payrollPaymentAdd.NAMOUNT === '0') {
      this.messageinfo = 'Por favor, el importe debe ser mayor que cero';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (
      Number(
        (+this.payrollPaymentAdd.NAMOUNT + this.totaldeclarado).toFixed(2)
      ) > Number(this.totalplanilla.toFixed(2))
    ) {
      this.messageinfo =
        'No puede agregar un voucher que totalice un monto mayor al de la planilla';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (
      this.resultPaymentType.id === undefined ||
      this.resultPaymentType.id === null ||
      this.resultPaymentType.id === '0'
    ) {
      this.messageinfo = 'Por favor, seleccione tipo de pago';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (
      this.resultBank.id === undefined ||
      this.resultBank.id === null ||
      this.resultBank.id === '0'
    ) {
      this.messageinfo = 'Por favor, seleccione un banco';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (
      this.payrollPaymentAdd.SOPERATIONNUMBER === undefined ||
      this.payrollPaymentAdd.SOPERATIONNUMBER === null ||
      this.payrollPaymentAdd.SOPERATIONNUMBER === ''
    ) {
      this.messageinfo = 'Por favor, ingrese numero de operación';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    if (
      this.payrollPaymentAdd.SREFERENCE === undefined ||
      this.payrollPaymentAdd.SREFERENCE === null ||
      this.payrollPaymentAdd.SREFERENCE === ''
    ) {
      this.messageinfo = 'Por favor, ingrese referencia';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return;
    }

    this.keypayment++;
    const payrollpayment = new PayrollPayment(
      0,
      0,
      0,
      0,
      0,
      0,
      '',
      '',
      '',
      '',
      0,
      '',
      '',
      '',
      '',
      false
    );
    payrollpayment.nidpayrolldetail = this.keypayment;
    payrollpayment.ncurrency = this.resultCurrentType.id;
    payrollpayment.ncurrencytext = this.resultCurrentType.text;

    payrollpayment.nbank = this.resultBank.id;
    payrollpayment.nbanktext = this.resultBank.text;

    payrollpayment.nbankaccount = this.resultAccountBank.id;
    payrollpayment.nbankaccounttext = this.resultAccountBank.text;

    payrollpayment.nidpaidtype = this.resultPaymentType.id;
    payrollpayment.nidpaidtypetext = this.resultPaymentType.text;

    payrollpayment.namount = +this.payrollPaymentAdd.NAMOUNT;
    payrollpayment.soperationnumber = this.payrollPaymentAdd.SOPERATIONNUMBER;
    payrollpayment.doperationdate = this.datePipe.transform(
      this.bsValueFecOp,
      'dd/MM/yyyy'
    );
    payrollpayment.sreference = this.payrollPaymentAdd.SREFERENCE;
    payrollpayment.sstate = '2';
    payrollpayment.nuserregister = 9997;
    payrollpayment.selected = false;

    if (this.listpayrollPaymentAdd.length > 0) {
      const objeto = this.listpayrollPaymentAdd.find(
        (payrollpaymentsearch) =>
          payrollpaymentsearch.nbank === payrollpayment.nbank &&
          payrollpaymentsearch.soperationnumber ===
          payrollpayment.soperationnumber
      );
      if (objeto != null) {
        this.messageinfo = 'El número de operación ya existe';
        this.viewContainerRef.createEmbeddedView(this.modalInfo);
        return;
      } else {
        this.listpayrollPaymentAdd.push(payrollpayment);
      }
    } else {
      this.listpayrollPaymentAdd.push(payrollpayment);
    }

    this.totaldeclarado += payrollpayment.namount;

    this.payrollPaymentAdd.NAMOUNT = '';
    this.payrollPaymentAdd.SOPERATIONNUMBER = '';
    this.payrollPaymentAdd.SREFERENCE = '';
    this.calcular();
  }

  QuitarDatosLiquidacion() {
    if (this.listpayrollPaymentAdd.length === 0) {
      this.messageinfo = 'No se ha agregado algún voucher para ser eliminado';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
    } else {
      for (let i = 0; i < this.listpayrollPaymentAdd.length; i++) {
        if (this.listpayrollPaymentAdd[i].selected === true) {
          this.arrayNumerodoc +=
            this.listpayrollPaymentAdd[i].nidpayrolldetail + ',';
        }
      }
      if (this.arrayNumerodoc.length === 0) {
        this.messageinfo = 'No ha seleccionado algún voucher para eliminar';
        this.viewContainerRef.createEmbeddedView(this.modalInfo);
      } else {
        this.EliminarPayment();
      }
    }
  }

  EliminarPayment() {
    this.arrayNumerodoc = this.arrayNumerodoc.slice(0, -1);
    const arrayDocaElimnar = this.arrayNumerodoc.split(',');
    for (let e = 0; e < arrayDocaElimnar.length; e++) {
      const nidpayrolldetail = +arrayDocaElimnar[e];
      const objeto = this.listpayrollPaymentAdd.find(
        (book) => book.nidpayrolldetail === nidpayrolldetail
      );
      this.keypayment--;
      this.totaldeclarado -= objeto.namount;
      objeto.selected = false;
      const Index = this.listpayrollPaymentAdd.indexOf(objeto);
      this.listpayrollPaymentAdd.splice(Index, 1);
    }
    this.arrayNumerodoc = '';
    this.selectedAllPaymentRows = false;
    this.calcular();
  }

  onVotedParentBank(Bank: any) {
    this.resultBank = Bank;
  }

  onVotedParentAccountBank(AccountBank: any) {
    this.resultAccountBank = AccountBank;
  }

  onVotedCurrentType(CurrentType: any) {
    this.resultCurrentType = CurrentType;
  }

  onVotedParentPaymentType(PaymentType: any) {
    this.resultPaymentType = PaymentType;
  }

  derivarPlanilla() {
    if (this.payrollCab.NIDSTATE === 0) {
      this.messageinfo = 'Por favor seleccione un estado';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
    } else {
      if (
        Number(this.totalplanilla.toFixed(2)) -
        Number(this.totaldeclarado.toFixed(2)) !==
        0
      ) {
        this.messageinfo =
          'La planilla debe de cuadrar para ser enviada a evaluación';
        this.viewContainerRef.createEmbeddedView(this.modalInfo);
      } else {
        this.payrollCab.sobservacion = this.strObservacion;
        this.payrollCab.NUSERREGISTER = JSON.parse(
          localStorage.getItem('currentUser')
        ).id;
        this.payrollService.getPostDerivarPlanilla(this.payrollCab).subscribe(
          (data) => {
            this.result = data;
            this.message = this.result.noutidpayroll;
            this.viewContainerRef.createEmbeddedView(this.modalLiquidacion);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  }

  grabarTodo() {
    if (this.listpayrollPaymentAdd.length !== 0) {
      if (+this.totalplanilla.toFixed(2) !== +this.totaldeclarado.toFixed(2)) {
        this.messageinfo = 'El importe a liquidar es diferente al importe declarado.';
        this.viewContainerRef.createEmbeddedView(this.modalInfo);
        return;
      } else {
        this.procederGrabar();
      }
    } else {
      this.procederGrabar();
    }
  }

  procederGrabar() {
    const valido = this.validarPlanilla();

    if (!valido) {
      return;
    }

    this.spinner.show();

    this.payrollCab.NAMOUNTTOTAL = Math.round(this.totalplanilla * 100) / 100;
    this.payrollCab.NQUANTITY = this.cantidadSoats;
    this.payrollCab.NUSERREGISTER = JSON.parse(
      localStorage.getItem('currentUser')
    ).id;
    this.payrollCab.DREGPAYROLL = this.datePipe.transform(
      new Date(),
      'dd/MM/yyyy'
    );
    this.payrollCab.SCODCHANNEL = Number(this.channelSalesId); // this.usuario.canal;
    this.payrollCab.NBRANCH = this.listPayrollDetail[0].nbranch;
    this.payrollCab.NPRODUCT = this.productId;
    this.payrollCab.NCURRENCY = this.listPayrollDetail[0].ncurrency;
    this.payrollCab.LISTPAYROLLDETAIL = this.listPayrollDetail;
    this.payrollCab.LISTPAYROLLPAYMENT = this.listpayrollPaymentAdd;

    // this.payrollCab.NIDSTATE = this.listpayrollPaymentAdd.length === 0 ? 1 : 2;
    this.payrollCab.NIDSTATE = this.listpayrollPaymentAdd.length === 0 ? 1 : 7;
    this.listPayrollDetail = [];
    this.listpayrollPaymentAdd = [];
    this.cantidadSoats = 0;
    this.totalplanilla = 0;
    this.totaldeclarado = 0;
    this.payrollService.getPostGrabarPlanillaManual(this.payrollCab).subscribe(
      (data) => {
        this.result = data;
        if (this.payrollCab.NIDPAYROLL === 0) {
          if (this.payrollCab.LISTPAYROLLPAYMENT.length === 0) {
            // SI LA PLANILLA NO TIENE PAGO
            this.message =
              'Se generó la Planilla Nro: ' + this.result.noutidpayroll;
            this.emissionService
                .registrarEvento(this.message, EventStrings.PAYROLL_CREAR)
                .subscribe();
            this.viewContainerRef.createEmbeddedView(this.modalLiquidacion);
          } else {
            // SI TIENE PAGO
            this.message =
              'Se generó la Planilla Nro: ' +
              this.result.noutidpayroll +
              ' y se envió a conciliar.';
            this.emissionService
                .registrarEvento(this.message, EventStrings.PAYROLL_CREAR)
                .subscribe();
            this.viewContainerRef.createEmbeddedView(this.modalLiquidacion);
          }
        } else {
          this.message =
            'Se actualizó la Planilla Nro: ' + this.result.noutidpayroll;
          this.emissionService
              .registrarEvento(this.message, EventStrings.PAYROLL_ACTUALIZAR)
              .subscribe();
          this.viewContainerRef.createEmbeddedView(this.modalLiquidacion);
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  validarPlanilla() {
    if (this.cantidadSoats === 0) {
      this.messageinfo = 'El monto de la planilla no puede ser cero';
      this.viewContainerRef.createEmbeddedView(this.modalInfo);
      return false;
    }
    return true;
  }

  //#region Pagos
  confirmarMedioPago(tipoPago: string, flag_grabar_planilla: boolean) {
    const valido = this.validarPlanilla();
    if (!valido) {
      return;
    }

    if (flag_grabar_planilla === true) {
      this.flag_grabar_planilla = flag_grabar_planilla;
      this.bLoading = false;
      this.bMostrarButtons = false;
      this.showDatosLiquidacion = true;
    } else {
      let NPOLICYLIST = '';
      this.listPayrollDetail.forEach((element) => {
        NPOLICYLIST += element.npolicy + ',';
      });
      if (this.listPayrollDetail.length > 0) {
        this.spinner.show();

        NPOLICYLIST = NPOLICYLIST.slice(0, -1);
        const detaill = new PayrollDetail(
          0,
          0,
          '',
          0,
          '',
          0,
          0,
          '',
          '',
          '',
          '',
          '',
          0,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          false,
          0
        );
        detaill.NPOLICYLIST = NPOLICYLIST;
        this.payrollService.ValidarPolizaAsociadoAplanilla(detaill).subscribe(
          (data) => {
            this.spinner.hide();
            this.resultPolAsocPlanilla = data;
            let NIDPAYROLLIST = '';
            this.resultPolAsocPlanilla.forEach((element) => {
              NIDPAYROLLIST += (element.nidpayroll ?? '') + ',';
            });
            if (this.resultPolAsocPlanilla.length > 0) {
              NIDPAYROLLIST = NIDPAYROLLIST.slice(0, -1);
              this.messageinfo =
                'El número de póliza ' + NIDPAYROLLIST + ' se encuentra asociado a una Planilla';
              this.viewContainerRef.createEmbeddedView(this.modalInfo);
            } else {
              this.flag_grabar_planilla = flag_grabar_planilla;
              this.viewContainerRef.createEmbeddedView(this.modalConfirmasivo);
              this.message =
                'Esta seguro de seleccionar el medio de pago? Esta acción no se puede deshacer';
              this.flagConfirmacion = 'confirmacionmediopago';
              this.IdTipoPago = tipoPago;
            }
          },
          (error) => {
            console.log(error);
            this.spinner.hide();
          }
        );
      } else {
        this.viewContainerRef.createEmbeddedView(this.modalConfirmasivo);
        this.message =
          'Esta seguro de seleccionar el medio de pago? Esta acción no se puede deshacer';
        this.flagConfirmacion = 'confirmacionmediopago';
        this.IdTipoPago = tipoPago;
      }
    }
  }

  registrarPlanilla(tipoPago: string) {
    this.payrollCab.NAMOUNTTOTAL = this.totalplanilla;
    this.payrollCab.NIDSTATE = 1;
    this.payrollCab.NQUANTITY = this.cantidadSoats;
    this.payrollCab.NUSERREGISTER = this.usuario.id;
    this.payrollCab.DREGPAYROLL = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    this.payrollCab.SCODCHANNEL = Number(this.channelSalesId);
    this.payrollCab.NBRANCH = this.branchId;
    this.payrollCab.NPRODUCT = this.productId;
    this.payrollCab.NCURRENCY = this.currencyId;
    this.payrollCab.LISTPAYROLLDETAIL = this.listPayrollDetail;
    this.payrollCab.LISTPAYROLLPAYMENT = [];
    // this.listPayrollDetail = [];
    // this.listpayrollPaymentAdd = [];
    // this.cantidadSoats = 0;
    // this.totalplanilla = 0;
    // this.totaldeclarado = 0;

    sessionStorage.setItem('planilla', JSON.stringify(this.payrollCab));

    switch (tipoPago) {
      case '1':
        this.mostrarPlanillaManual();
        break;
      case '2':
      case '9':
        this.PagoVisa(tipoPago);
        break;
      case '3':
      case '5':
      case '6':
        this.generarPlanilla(tipoPago);
        break;
      default:
        break;
    }
  }

  mostrarPlanillaManual() {
    this.bLoading = false;
    // this.bMostrarButtons = false;
    this.bPlanillaManual = true;
    this.showDatosLiquidacion = true;
  }

  PagoVisa(tipoPago) {
    // this.bMostrarButtons = false;
    this.generarSessionToken(tipoPago);
  }

  generarSessionToken(tipoPago) {
    this.visaService
        .generarSessionToken(
          -1,
          this.totalplanilla,
          this.channelSalesId,
          this.puntoVenta,
          0,
          this.branchId,
          this.productId
        )
        .subscribe(
          (res) => {
            const data = <SessionToken>res;
            sessionStorage.setItem('sessionToken', data.sessionToken);
            sessionStorage.setItem(
              'idSessionToken',
              JSON.stringify((data as any).id)
            );

            if (this.paymentType$.kushkiCard && +tipoPago !== 9) {
              this.getCredentials(this.methodKushki.card);
            } else {
              this.createNiubizForm(data);
              this.spinner.show();

              setTimeout(() => {
                (document.querySelector('.start-js-btn') as any)?.click()
                this.spinner.hide();
              }, 2000);
            }

            this.bLoading = false;
          },
          (error) => {
            console.log(error);
          }
        );
  }

  createNiubizForm(data): void {
    if (this.visaFormInitialized) {
      return;
    }

    const factory = this.factoryResolver.resolveComponentFactory(ButtonVisaComponent);
    this.btnVisa = factory.create(this.vcr.parentInjector);

    if (+this.productId === 0 || +this.branchId === 66) {
      this.btnVisa.instance.merchantId = environment.codigocomercio;
    } else if (+this.branchId === 77) {
      this.btnVisa.instance.merchantId = environment.codigocomercioSctr;
    } else if (+this.branchId === 73) {
      this.btnVisa.instance.merchantId = environment.codigocomercioVidaLey;
    }

    sessionStorage.setItem('merchantIdSession', this.btnVisa.instance.merchantId);

    this.btnVisa.instance.action = AppConfig.ACTION_FORM_VISA_PAYROLL;
    this.btnVisa.instance.amount = this.payrollCab.NAMOUNTTOTAL; // Enviar el monto total
    this.btnVisa.instance.sessionToken = data.sessionToken;
    this.btnVisa.instance.purchaseNumber = data.purchaseNumber;
    this.btnVisa.instance.merchantLogo = AppConfig.MERCHANT_LOGO_VISA;
    this.btnVisa.instance.userId = this.usuario.id; // Enviar el id del usuario
    this.btnVisa.instance.timeouturl = 'broker/payroll';

    this.vcr.insert(this.btnVisa.hostView);
    this.visaFormInitialized = true;
  }

  generarPlanilla(tipoPago) {
    this.spinner.show();
    this.bLoading = true;
    this.payrollCab.NIDSTATE = 10;
    this.payrollCab.CIPNUMERO = '';
    this.payrollCab.NBRANCH = this.branchId;
    this.payrollCab.NPRODUCT = this.productId;
    this.payrollCab.NCURRENCY = this.listPayrollDetail[0].ncurrency;

    // FIXME: NO GENERA CIP
    this.payrollService.getPostGrabarPlanillaManual(this.payrollCab).subscribe(
      (response) => {
        this.result = response;
        console.log(response);
        this.spinner.hide();
        if (tipoPago === '3') {
          this.bMostrarButtons = false;
          this.bMostrarButtonPE = true;
          this.bLoading = false;
          this.pagarConPagoEfectivo();
        }

        if (tipoPago === '5') {
          this.getCredentials(this.methodKushki.cash);
        }

        if (tipoPago === '6') {
          this.getCredentials(this.methodKushki.transfer);
        }
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  pagarConPagoEfectivo() {
    this.showModalPE = false;
    this.bMostrarButtonPE = false;
    this.pagoEfectivoService
        .generarCipPlanillas(
          this.usuario.firstName, // nombres del usuario
          this.usuario.lastName, // apellidos del usuario
          this.usuario.email, // correo del usuario
          this.usuario.desCanal, // nombre del canal
          +(+this.totalplanilla).toFixed(2), // monto
          this.result.noutidpayroll, // proceso Id
          this.result.noutidpayroll, // planilla Id
          AppConfig.FLUJO_PLANILLA,
          this.usuario.id,
          // Number(this.channelSalesId),
          this.branchId,
          this.productId,
          'PAGO PLANILLA ' + this.result.noutidpayroll,
          +this.currencyId === 1 ? 'PEN' : 'USD'
        ) // usuario Id
        .subscribe(
          (res) => {
            if (res.exito) {
              this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                res.uri
              );
              this.showModalPE = true;
              this.viewContainerRef.createEmbeddedView(this.modalResultadoPE);
              this.bLoading = false;
              this.message =
                'PagoEfectivo - Se generó la Planilla Nro: ' +
                this.result.noutidpayroll;
              this.emissionService
                  .registrarEvento(this.message, EventStrings.PAYROLL_CREAR)
                  .subscribe();
              this.spinner.hide();
            }
          },
          (err) => {
            this.spinner.hide();
            this.showModalPE = false;
          }
        );
  }

  finalizar() {
    document.body.classList.remove('modal-open');
    this.viewContainerRef.clear();
    this.router.navigate(['broker/payroll']);
  }

  closeconfirm(): void {
    this.viewContainerRef.clear();
  }

  confirm(): void {
    if (this.flagConfirmacion === 'confirmacionmediopago') {
      this.showbtnEliminardePlanilla = false;
      this.bBotonesActividad = false;
      this.bLoading = true;
      this.registrarPlanilla(this.IdTipoPago);
      this.bLoading = false;
    }
    this.viewContainerRef.clear();
  }

  calcular() {
    this.saldo =
      Math.round(this.totalplanilla * 100) / 100 -
      Math.round(this.totaldeclarado * 100) / 100;
  }

  obtenerTipoPagoCanal() {
    this.setting_pay = AppConfig.SETTINGS_PAYROLL;

    this.payrollService
        .getCanalTipoPago(this.channelSalesId, this.setting_pay)
        .subscribe(
          (res) => {
            if (res != null) {
              this.bVisaProduct = this.bVisa = Number(res['bvisa']) === 1;
              this.bPagoEfectivo = Number(res['bpagoefectivo']) === 1;
              this.initComponent();
            }
          },
          (err) => {
            console.log(err);
          }
        );
  }

  onGetLstBranch() {
    const tableType = new TableType(0, '', this.usuario.canal);
    this.payrollService.getBranch(tableType).subscribe(
      (data) => {
        this.lstBranch = <TableType[]>data;
        this.lstBranch.forEach((element) => {
          this.ListBranchID += element.nid + ',';
        });
        this.ListBranchID = this.ListBranchID.slice(0, -1);
      },
      (error) => {
      }
    );
  }

  onGetLstProducts(idProduct, origin: boolean) {
    this.spinner.show();
    const tableType = new TableType(idProduct, '', this.usuario.canal);

    this.payrollService.getProduct(tableType).subscribe(
      (data) => {
        this.lstProduct = <TableType[]>data;
        if (origin) {
          this.onSelectProduct(this.lstProduct[0].nid);
        }
        this.spinner.hide();
      },
      (error) => {
      }
    );
  }

  onGetCurency() {
    const tableType = new TableType(0, '', 0);

    this.payrollService.getCurrency(tableType).subscribe(
      (data) => {
        this.lstCurrency = <Currency[]>data;
        this.lstCurrency.forEach((element) => {
          this.ListCurrencyID += element.nidcurrency + ',';
        });
        this.ListCurrencyID = this.ListCurrencyID.slice(0, -1);
      },
      (error) => {
      }
    );
  }

  onSelectBranch(BranchID, origin: boolean) {
    this.lstProduct = [];
    this.ListCertificado = [];
    this.branchId = BranchID;
    sessionStorage.setItem('P_NBRANCH', BranchID.toString());
    if (!isNullOrUndefined(this.lstProductsPE)) {
      this.bPagoEfectivoProduct = this.lstProductsPE.includes(+this.branchId);
    }

    this.onGetLstProducts(BranchID, origin);
    this.getPaymentType();
  }

  onSelectProduct(ProductID) {
    this.ListCertificado = [];
    sessionStorage.setItem('P_NPRODUCT', ProductID.toString());
    if (ProductID === 0) {
      this.productId = 0;
    } else {
      this.productId = ProductID;
    }
  }

  onSelectCurrency(CurrencyID) {
    this.ListCertificado = [];
    this.currencyId = CurrencyID;
  }

  validaSessionProduct(): number {
    const productSession = !isNullOrUndefined(
      sessionStorage.getItem('sessionProduct')
    )
      ? +sessionStorage.getItem('sessionProduct')
      : 0;
    let product = 0;
    switch (productSession) {
      case 1:
        product = 1000;
        break;
      case 2:
        product = 120;
        break;
      case 3:
        product = 117;
        break;
      case 4:
        product = 10;
        break;
      default:
        break;
    }
    return product;
  }

  getCertificadoByPolicy() {
    if (this.listPayrollDetail.length > 0) {
      if (
        this.ListCertificado[0].scodchannel !==
        this.listPayrollDetail[0].scodchannel
      ) {
        this.ListCertificado.splice(0, this.ListCertificado.length);
        this.messageinfo =
          'La póliza que intenta listar no pertenece al canal de ventas que ha incluido para la nueva planilla.';
        this.viewContainerRef.createEmbeddedView(this.modalInfo);
      } else {
        if (
          this.ListCertificado[0].nbranch +
          '' +
          this.ListCertificado[0].nproduct !==
          this.listPayrollDetail[0].nbranch +
          '' +
          this.listPayrollDetail[0].nproduct
        ) {
          if (this.validateProductsByPolicy()) {
            this.setFilterByPolicy();
          } else {
            this.ListCertificado.splice(0, this.ListCertificado.length);
            this.messageinfo =
              'La póliza que intenta listar no pertenece al ramo o producto que ha incluido para la nueva planilla.';
            this.viewContainerRef.createEmbeddedView(this.modalInfo);
          }
        }
      }
    } else {
      this.setFilterByPolicy();
    }
  }

  setFilterByPolicy() {
    this.channelSalesId = this.ListCertificado[0].scodchannel;
    this.channelPointId = this.ListCertificado[0].scodsalepoint;
    this.branchId = this.ListCertificado[0].nbranch;
    this.productId =
      this.ListCertificado[0].nproduct === 120 ||
      this.ListCertificado[0].nproduct === 130
        ? 120
        : this.ListCertificado[0].nproduct;
    this.currencyId = this.ListCertificado[0].ncurrency;

    const channel = {
      nchannel: this.ListCertificado[0].scodchannel,
      nusercode: 0,
      sdescript: this.ListCertificado[0].scliename,
    };

    this.ListChannelSales.splice(0, this.ListChannelSales.length);
    this.ListChannelSales.push(channel);

    this.ListChannelPoint.splice(0, this.ListChannelPoint.length);
    this.flagNpolicyConsulta = this.branchId === 66;
    this.onSelectChannelSales(this.channelSalesId);
    this.onGetLstProducts(this.branchId, false);
    if (this.branchId === 66) {
      this.salesPointIdSelected = this.channelPointId;
    }
  }

  validateProductsByPolicy() {
    let validacion = false;
    if (this.listPayrollDetail[0].nbranch === this.ListCertificado[0].nbranch) {
      validacion =
        (this.listPayrollDetail[0].nbranch === 77 ||
          this.listPayrollDetail[0].nbranch === 77) &&
        (this.ListCertificado[0].nbranch === 73 ||
          this.ListCertificado[0].nbranch === 73);
    } else {
      validacion = false;
    }
    return validacion;
  }

  ProductsPagoEfectivo() {
    const tableType = new TableType(0, '', 0);
    this.policyemit.getProductsPE(tableType).subscribe((data) => {
      this.lstProductsPE = <number[]>data;
      this.obtenerTipoPagoCanal();
    });
  }

  binInfo(): void {
    if (this.kushkiFormControl['cardNumber'].value.length < 8) {
      return;
    }

    this.kushki.requestBinInfo(
      {
        bin: this.kushkiFormControl['cardNumber'].value,
      },
      (response: any): void => {
        this.cardType = response.brand;
      }
    );
  }

  getCredentials(type: number): void {
    this.spinner.show();

    const payload: any = {
      idRamo: this.branchId,
      idProducto: this.productId,
      idMoneda: this.currencyId,
      idCategoria: '1',
    };

    this.kushkiService.getCredentials(payload).subscribe({
      next: (response: any): void => {
        if (!response.success) {
          return;
        }

        const keyPublic3DS = response?.credenciales
                                     .filter((item) => item['3DS'])
                                     .map((value) => value.llavePublica);

        const keyPublic = response?.credenciales
                                  .filter((item) => !item['3DS'])
                                  .map((value) => value.llavePublica);

        this.kushki = new Kushki({
          merchantId: type === 4 ? keyPublic3DS : keyPublic,
          inTestEnvironment: !environment.production,
        });

        switch (type) {
          case 4:
            this.spinner.hide();
            this.viewContainerRef.createEmbeddedView(this.modalKushkiCard);
            break;
          case 5:
            this.kushkiCashSubmit(type);
            break;
          case 6:
            this.kushkiTransferSubmit(type);
            break;
          default:
            break;
        }
      },
      error: (error: any): void => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  kushkiCardSubmit(): void {
    this.spinner.show();

    // const names =
    //   `${this.cliente.p_SCLIENT_NAME} ${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`.trim();
    const dueDate: string = this.kushkiFormControl['dueDate'].value.split('/');

    this.kushki.requestToken(
      {
        amount: this.totalplanilla,
        currency: this.currencyId === 1 ? 'PEN' : 'USD',
        card: {
          name: this.currentUser.firstName,
          number: this.kushkiFormControl['cardNumber'].value,
          cvc: this.kushkiFormControl['cvv'].value,
          expiryMonth: dueDate[0],
          expiryYear: dueDate[1],
        },
      },
      (response): void => {
        this.spinner.hide();
        console.log(Response);
        if (response['code'] === '017') {
          this.messageInfoKushki = String.messageErrors.declined;
          return;
        }

        if (!response['token']) {
          this.messageInfoKushki =
            String.messageErrors.errorValidateTransaction;
          return;
        }

        this.kushkiResult(response, this.methodKushki.card);
      }
    );
  }

  kushkiCashSubmit(type: number) {
    this.spinner.show();

    this.kushki.requestCashToken(
      {
        name: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        identification: this.listPayrollDetail[0].ndocuments.trim(),
        documentType:
          this.listPayrollDetail[0].scertype == 2
            ? 'DNI'
            : this.listPayrollDetail[0].scertype == 1
              ? 'RUC'
              : 'CE',
        email: this.currentUser.email,
        totalAmount: this.totalplanilla,
        currency: this.currencyId === 1 ? 'PEN' : ('USD' as any),
        description: 'Planillas Broker',
      },
      (response): void => {
        if (response['code'] === 'C041') {
          this.spinner.hide();
        }

        if (response['code'] === 'C002') {
          this.spinner.hide();
        }

        if (!response['token']) {
          this.spinner.hide();
          return;
        }

        this.kushkiResult(response, type);
      }
    );
  }

  kushkiTransferSubmit(type: number) {
    this.spinner.show();

    this.kushki.requestTransferToken(
      {
        callbackUrl: 'http://www.testcallbackurl.com/',
        userType: '0',
        documentType: 'DNI',
        documentNumber: '43580056',
        paymentDescription: 'ESTO ES UNA PRUEBA',
        email: 'PRUEBA123@GMAIL.COM',
        currency: (this.currencyAcron = 'S/' ? 'PEN' : ('USD' as any)),
        amount: {
          subtotalIva: 0,
          subtotalIva0: +this.totalplanilla,
          iva: 0,
        },
      },
      (response): void => {
        if (response['code'] === 'C041') {
          this.spinner.hide();
        }

        if (!response['token']) {
          this.spinner.hide();
          return;
        }

        this.kushkiResult(response, type);
      }
    );
  }

  kushkiResult(result: any, type: number): void {
    if (result?.secureService === '3dsecure') {
      this.validate3DS(result, type);
    } else {
      this.processPayment(result['token'], type);
    }
  }

  private validate3DS(info: any, type: number): void {
    console.log('3ds')
    const payload = {
      secureId: info.secureId,
      security: {
        acsURL: info.security.acsURL,
        authenticationTransactionId: info.security.authenticationTransactionId,
        paReq: info.security.paReq,
        specificationVersion: info.security.specificationVersion,
        authRequired: info.security.authRequired,
      },
    };

    this.viewContainerRef.clear();
    this.kushkiForm.patchValue(
      {
        cardNumber: '',
        dueDate: '',
        cvv: '',
      },
      { emitEvent: false }
    );

    this.kushki.requestValidate3DS(payload, (response: any): void => {
      console.log('3ds response')
      if (!response?.isValid) {
        this.spinner.hide();
        return;
      }
      this.processPayment(info['token'], type);
    });
  }

  private processPayment(token: string, type: number): void {
    const emissionPayload: any = {
      idPlanilla:
        type === 4
          ? JSON.parse(sessionStorage.getItem('idSessionToken'))
          : this.result.noutidpayroll,
      idTipoPago: type === 4 ? '1' : type === 5 ? '2' : 3,
      token: token,
      idMoneda: this.currencyId,
      nombres: this.currentUser.firstName,
      apellidoPaterno: this.currentUser.lastName,
      razonSocial: null,
      telefono: '991954621',
      correo: this.currentUser.email,
      idFlujo: AppConfig.FLUJO_PLANILLA,
      idUsuario: this.currentUser.id,
      idRamo: this.branchId,
      idProducto: this.productId,
      codigoCanal: this.currentUser.canal,
      monto: +this.totalplanilla,
    };

    if (+type === 6) {
      emissionPayload.puntoVenta = this.ListChannelPoint.find(x => x.nnumpoint == this.salesPointIdSelected)?.sdescript;
      emissionPayload.ramo = this.lstBranch.find(x => x.nid == this.branchId).sdescript;
      emissionPayload.listaPolizas = this.listPayrollDetail.map((item) => ({
        poliza: item.npolicy,
        contratante: item.scliename,
        importe: `${item.sshortcurrency} ${item.npremium}`
      }));
    }

    sessionStorage.setItem(
      'kushki-payload-planilla',
      JSON.stringify(emissionPayload)
    );

    if (type === this.methodKushki.card) {
      this.router.navigate([`/broker/payrollvisa/${token}`]);
    } else {
      this.processPayKushki(emissionPayload);
    }
  }

  processPayKushki(payload: any) {
    this.spinner.show();
    this.kushkiService.processPayKushki(payload).subscribe(
      (res: any) => {
        this.spinner.hide();
        console.log(res);
        if (!res.success) {
          return;
        }

        window.open(res.message, '_blank');
        this.router.navigate(['broker/payroll']);
      },
      (err: any) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }
}
