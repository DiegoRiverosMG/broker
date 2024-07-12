import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';

import { PayrollService } from '../../services/payroll/payroll.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe, DecimalPipe } from '@angular/common';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommissionState } from '../../models/commissionlot/commissionstate';
import { CommissionLotService } from '../../services/commisslot/comissionlot.service';
import { CommissionLotFilter } from '../../models/commissionlot/commissionlotfilter';
import { TableType } from '../../models/commissionlot/tabletype';
import { Currency } from '../../models/currency/currency';
import { CommissionLotDetail } from '../../models/commissionlot/commisssionlotdetail';
import { CommissionAuthModel } from '../../models/commissionlot/commissionauth';
import { CommissionFactur } from '../../models/commissionlot/commissionfactur';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UtilsService } from '@shared/services/utils/utils.service';
import { RegularExpressions } from '@shared/regexp/regexp';
defineLocale('es', esLocale);

@Component({
  selector: 'app-commission-auth',
  templateUrl: './commission-auth.component.html',
  styleUrls: ['./commission-auth.component.sass'],
})
export class CommissionAuthComponent implements OnInit {
  @ViewChild('modalMessage', { static: true })
  modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalApproval', { static: true })
  modalApproval: TemplateRef<ElementRef>;

  @ViewChild('modalMessageInfo', { static: true })
  modalMessageInfo: TemplateRef<ElementRef>;

  @ViewChild('modalHistory', { static: true })
  modalHistory: TemplateRef<ElementRef>;

  @ViewChild('modalFactura', { static: true, read: TemplateRef })
  _modalFactura: TemplateRef<any>;

  startDateConfig: Partial<BsDatepickerConfig> = Object.assign(
    {},
    {
      dateInputFormat: 'DD/MM/YYYY',
      locale: 'es',
      containerClass: 'theme-dark-blue',
      showWeekNumbers: true,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(),
    }
  );
  endDateConfig = this.startDateConfig;

  bsValueIni: Date = new Date(2020, 0, 1);
  bsValueFin: Date = new Date();
  dateDetailIni: Date = new Date();
  dateDetailFin: Date = new Date();

  messageinfo: string;
  isAdmin: boolean;
  idUser: number;
  lstComisionToFilter: CommissionAuthModel[];
  lstComision: CommissionAuthModel[];
  lstComisionInclude: CommissionAuthModel[] = [];
  lstComisionExclude: CommissionAuthModel[] = [];
  listCommissionAuth: CommissionLotFilter[];
  ListCommissionFactur: CommissionFactur[] = [];
  msgErrorListaFacturt = '';
  nPoliza: number;
  nPlanilla: number;
  fExistRegistroFactura: any = false;
  ListComisionFilter = [];
  lstEstadoComision: CommissionState[];
  lstPolizasAuth: CommissionLotDetail[];
  contadorTotal: number;
  contadorItems: number;
  contadorItemsModal: number;
  bloqueoBuscar: boolean;
  polizasTotales = 0;
  polizasTotalesModal = 0;
  amountTotales: number;
  lstCanales: any[];
  idCanal = 0;
  idDetailChannel: number;
  stateDetail: string;
  idEstado: boolean;
  txtfechafiltro = '';
  selectedAll: any;
  chooseAll: any;
  lstComisionAuth: CommissionAuthModel[];
  selectedItem: CommissionAuthModel[] = [];
  chooseItem: CommissionAuthModel[] = [];

  enableApproved: boolean = false;
  messageApproved: string = '';
  messageConfirm: string = '';
  messageInfoRangoAprob: string = '';
  dataResultApproved: Array<any> = [];
  dataMessageErrors: Array<any> = [];

  public InputsFilter: any = {};
  npage = 1;
  numberPage = 1;

  public totalItems = 0;
  public itemsPerPage = 20;

  public cantidadPolizas = 0;
  fExistRegistro: any = false;
  msgErrorLista = '';

  rotate = true;
  maxSize = 10;
  currentPage = 0;

  showPolicy: boolean;
  showDisponibilizar = false;
  P_NIDPAYROLL: number;
  P_NIDPOLICY: number;
  P_NIDJOB: number;
  P_NTIPOFACTURACION: number;

  public lstProduct: TableType[];
  ListProduct: any[];
  NPRODUCT: number;

  public lstPayrollsPolicies: TableType[];
  policyId: number;
  payrollId: number;

  public lstCurrency: Currency[];
  ListCurrencyID = '';
  currencyId: number;
  NCURRENCY: number;
  NSTATEDISPONIBLE: number;
  estado: boolean;
  currency = 'S/';
  limpiar = false;
  TITLE_SEARCH = null;

  // paginacion: any = {};
  clienteFactura = false;

  public lstBranch: TableType[];
  ListBranchID = '';
  TYPE_AGRUPADOR = 0;

  disabledFecha: boolean;
  disabledCanal: boolean;
  disabledPoliza: boolean;
  disabeldPlanilla: boolean;
  disabledDisponibilizar: boolean;
  detailIdJob: number;

  // *Remake
  formFilters: FormGroup = this.builder.group({
    startDate: [null],
    endDate: [null],
    salesChannel: [null],
    policy: [null, Validators.pattern(RegularExpressions.numbers)],
    payroll: [null, Validators.pattern(RegularExpressions.numbers)],
    state: [null],
    approval: [null],
  });

  message$: {
    showImage: boolean;
    success: boolean;
    message: string;
  } = null;

  constructor(
    public datePipe: DatePipe,
    public decimalPipe: DecimalPipe,
    public utilityService: UtilityService,
    private excelService: ExcelService,
    private channelSalesService: ChannelSalesService,
    private commissionlotService: CommissionLotService,
    private spinner: NgxSpinnerService,
    private payrollService: PayrollService,
    private readonly vc: ViewContainerRef,
    private readonly builder: FormBuilder,
    private readonly utilsService: UtilsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.lstPolizasAuth = [];
    this.lstComisionAuth = [];
    this.contadorTotal = 0;
    this.contadorItems = 0;
    this.contadorItemsModal = 0;
    this.P_NTIPOFACTURACION = 0;
    this.P_NIDPAYROLL = 0;
    this.P_NIDPOLICY = null;
    this.P_NIDJOB = null;
    this.NSTATEDISPONIBLE = 0;
    this.txtfechafiltro = 'FECHA DE PAGO:';
    this.fExistRegistro = false;
    this.showDisponibilizar = true;
    this.disabledFecha = false;
    this.disabledCanal = false;
    this.disabledPoliza = false;
    this.disabeldPlanilla = false;
    this.disabledDisponibilizar = false;
    this.bloqueoBuscar = false;
    this.idDetailChannel = 0;
    this.stateDetail = 'false';
  }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isAdmin = true; // currentUser.profileId === 20;
    this.idUser = currentUser.id;
    this.LoadChannelSales();
    this.onGetCurency();
    this.onGetLstBranch();
    this.initValuesFormFilters();
    this.valueChangesFormFilters();
    this.onSelectDisponibilidad(this.formFiltersControl['approval'].value);
    this.showTitleSearch();
    this.resultApproval(+this.idUser);
  }

  get formFiltersControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  initValuesFormFilters(): void {
    this.bsValueIni = new Date(2020, 0, 1);
    this.bsValueFin = new Date();
    this.formFiltersControl['startDate'].setValue(this.bsValueIni);
    this.formFiltersControl['endDate'].setValue(this.bsValueFin);
    this.formFiltersControl['state'].setValue(0);
    this.formFiltersControl['approval'].setValue(0);
    this.formFiltersControl['salesChannel'].setValue(0);
    this.formFiltersControl['policy'].setValue(null);
    this.formFiltersControl['payroll'].setValue(null);
    this.lstComisionAuth = new Array();
    this.fExistRegistro = false;
    this.contadorTotal = 0;
    this.contadorItems = 0;
  }

  valueChangesFormFilters(): void {
    this.formFiltersControl['startDate'].valueChanges.subscribe(
      (value: string) => {
        this.endDateConfig = {
          ...this.endDateConfig,
          minDate: new Date(value),
        };
      }
    );

    this.formFiltersControl['endDate'].valueChanges.subscribe(
      (value: string) => {
        this.startDateConfig = {
          ...this.startDateConfig,
          maxDate: new Date(value),
        };
      }
    );

    this.formFiltersControl['salesChannel'].valueChanges.subscribe(
      (value: string) => {
        this.onSelectChannel(+value);
      }
    );

    this.formFiltersControl['approval'].valueChanges.subscribe(
      (value: string) => {
        this.onSelectDisponibilidad(value);
      }
    );

    this.formFiltersControl['payroll'].valueChanges.subscribe(
      (value: string) => {
        if (this.formFiltersControl['payroll'].hasError('pattern')) {
          this.formFiltersControl['payroll'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
    this.formFiltersControl['policy'].valueChanges.subscribe(
      (value: string) => {
        if (this.formFiltersControl['policy'].hasError('pattern')) {
          this.formFiltersControl['policy'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  onGetLstBranch() {
    this.InputsFilter.P_NBRANCH = 0;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tableType = new TableType(0, '', currentUser.canal);
    this.payrollService.getBranch(tableType).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (data: TableType[]) => {
        const dataBranch = data.filter(
          (x) => x.nid !== 66 && x.nid !== 82 && x.nid !== 73
        );
        this.lstBranch = <TableType[]>dataBranch;
        this.onSelectBranch(this.InputsFilter.P_NBRANCH);
        this.lstBranch.forEach((element) => {
          this.ListBranchID += element.nid + ',';
        });
        this.ListBranchID = this.ListBranchID.slice(0, -1);
      },
      (error) => {}
    );
  }

  onSelectBranch(BranchID) {
    this.lstProduct = [];
    this.InputsFilter.P_NBRANCH = BranchID;
    this.InputsFilter.P_NPRODUCT = 0;
    if (+BranchID !== 0) {
      this.onGetLstProducts(BranchID);
    }
  }

  onGetLstProducts(idProduct) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tableType = new TableType(idProduct, '', currentUser.canal);
    this.payrollService.getProduct(tableType).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (data) => {
        this.lstProduct = <TableType[]>data;
      },
      (error) => {}
    );
  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;
    const lstChannelRequest = new ChannelSales(nusercode, '0', '');
    this.channelSalesService.getPostChannelSales(lstChannelRequest).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (data) => {
        this.lstCanales = <any[]>data;
        this.lstCanales = this.lstCanales.filter(
          (n) => n.nchannel !== 2015000002
        );
        this.lstCanales.unshift({
          nchannel: 0,
          sdescript: 'TODOS',
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  resultApproval(id: number): void {
    this.dataResultApproved = [];

    this.commissionlotService.getResultApproval(id).subscribe(
      (response: any) => {
        if (response.success) {
          this.enableApproved = response.aprueba;

          if (this.enableApproved) {
            this.dataResultApproved = response.rangoAprobacion;
            this.messageApproved = '';
            this.validateRangeAprobMessage();
          } else {
            this.messageApproved =
              'Usted no se encuentra autorizado para aprobar comisiones';
            this.messageInfoRangoAprob = '';
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  validateRangeAprobMessage() {
    const rangoSoles = this.dataResultApproved[0];
    const rangoDolares = this.dataResultApproved[1];

    const solesInicio = new Intl.NumberFormat('es-PE').format(
      rangoSoles.rangoInicio
    );
    const dolaresInicio = new Intl.NumberFormat('es-PE').format(
      rangoDolares.rangoInicio
    );
    const solesFin = new Intl.NumberFormat('es-PE').format(rangoSoles.rangoFin);
    const dolaresFin = new Intl.NumberFormat('es-PE').format(
      rangoDolares.rangoFin
    );

    // Si aprueba para ambas monedas
    if (rangoSoles.aprobar & rangoDolares.aprobar) {
      if (rangoSoles.rangoFin == 999999) {
        this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores > S/${solesInicio} y > $${dolaresInicio} de comisión neta.`;
        return;
      }
      if (rangoSoles.rangoInicio == 0) {
        this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores >= S/${solesInicio} y <= S/${solesFin} y >= $${dolaresInicio} y <= $${dolaresFin} de comisión neta.`;
        return;
      }
      this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores > S/${solesInicio} y <= S/${solesFin} y > $${dolaresInicio} y <= $${dolaresFin} de comisión neta.`;
    }

    // Si no aprueba soles
    if (!rangoSoles.aprobar) {
      if (rangoDolares.rangoFin == 999999) {
        this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores > $${dolaresInicio} de comisión neta.`;
        return;
      }

      if (rangoDolares.rangoInicio == 0) {
        this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores >= $${dolaresInicio} y <= $${dolaresFin} de comisión neta.`;
        return;
      }
      this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores > $${dolaresInicio} y <= $${dolaresFin} de comisión neta.`;
    }

    // Si no aprueba Dólares
    if (!rangoDolares.aprobar) {
      if (rangoSoles.rangoFin == 999999) {
        this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores > S/${solesInicio} de comisión neta.`;
        return;
      }
      if (rangoSoles.rangoInicio == 0) {
        this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores >= S/${solesInicio} y <= S/${solesFin} de comisión neta.`;
        return;
      }
      this.messageInfoRangoAprob = `Usted solo puede aprobar las comisiones con valores > S/${solesInicio} y <= S/${solesFin} de comisión neta.`;
    }
  }

  buscarComisiones() {
    this.npage = 1;
    this.totalItems = 0;
    this.lstPolizasAuth = [];
    this.selectedItem = [];
    this.contadorTotal = 0;
    this.contadorItems = 0;
    this.contadorItemsModal = 0;
    this.lstComisionExclude = [];
    this.lstComisionInclude = [];
    this.solicitarComisiones();
  }

  showTitleSearch() {
    if (+this.formFiltersControl['approval'].value == 0) {
      this.showDisponibilizar = true;
      /* this.TITLE_SEARCH = 'Pólizas / Recibos por Disponibilizar:'; */
    } else {
      this.showDisponibilizar = false;
      /* this.TITLE_SEARCH = 'Pólizas / Recibos Disponibilizados:'; */
    }
  }
  get enableSearch(): boolean {
    if (!!this.idCanal) {
      return true;
    } else {
      if (
        !!this.formFiltersControl['policy'].value ||
        !!this.formFiltersControl['payroll'].value
      ) {
        return true;
      }
    }
    return false;
  }
  get enableDisp(): boolean {
    if (this.selectedItem) {
      return true;
    }
    return false;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  textoInicioFin(f1, f2: any): string {
    if (f1 && f2) {
      return `${f1} al ${f2}`;
    }
    return 'Varios';
  }
  markAllItems(checked: boolean) {
    this.contadorTotal = 0;
    this.contadorItems = 0;
    this.selectedAll = checked;

    if (this.selectedAll) {
      this.lstComisionAuth
        .filter((val) => !val.disabled)
        .forEach((val) => {
          val.checked = true;
          let job = '';

          if (val.comprobante) {
            if (
              !this.selectedItem.some((x) => x.comprobante == val.comprobante)
            ) {
              this.selectedItem.push(val);
            }
            if (
              this.selectedItem.some((x) => x.comprobante == val.comprobante)
            ) {
              this.contadorTotal += +val.primaNeta;
              this.contadorItems += 1;
            }
            return;
          }

          if (val.idJob) {
            job = val['comprobanteInicio'] + val['comprobanteFin'];
            if (
              !this.selectedItem.some(
                (x) => x['comprobanteInicio'] + x['comprobanteFin'] == job
              )
            ) {
              this.selectedItem.push(val);
            }
            if (
              this.selectedItem.some(
                (x) => x['comprobanteInicio'] + x['comprobanteFin'] == job
              )
            ) {
              this.contadorTotal += +val.primaNeta;
              this.contadorItems += 1;
            }
            return;
          }

          if (!val.comprobante && !val.idJob) {
            this.selectedItem.push(val);
            this.contadorTotal += +val.primaNeta;
            this.contadorItems += 1;
          }
        });
    } else {
      this.lstComisionAuth.forEach((val) => {
        val.checked = false;
        this.selectedItem = this.selectedItem.filter(
          (x) => x.comprobante !== val.comprobante
        );
      });
      /*   this.selectedItem = []; */
    }
  }
  validateMarkItems() {
    if (this.selectedAll) {
      this.lstComisionAuth.forEach((val) => {
        if (!this.selectedItem.some((x) => x.comprobante == val.comprobante)) {
          this.selectedItem.push(val);
          val.checked = true;
        }
      });
    } else {
      this.lstComisionAuth.forEach((val) => {
        val.checked = false;
        this.selectedItem = this.selectedItem.filter(
          (x) => x.comprobante !== val.comprobante
        );
      });
      /*   this.selectedItem = []; */
    }
  }
  validateMarkItemsModal() {
    if (this.chooseAll) {
      this.lstComisionAuth.forEach((val) => {
        if (!this.chooseItem.some((x) => x.comprobante == val.comprobante)) {
          this.chooseItem.push(val);
          val.checked = true;
        }
      });
    } else {
      this.lstComisionAuth.forEach((val) => {
        val.checked = false;
        this.chooseItem = this.chooseItem.filter(
          (x) => x.comprobante !== val.comprobante
        );
      });
      /*   this.selectedItem = []; */
    }
  }
  // tslint:disable-next-line:no-shadowed-variable
  markItem(data: CommissionAuthModel, e: boolean) {
    this.contadorTotal = 0;
    this.contadorItems = 0;

    if (e) {
      data.checked = true;

      if (data.comprobante && !data.idJob) {
        if (!this.selectedItem.some((x) => x.comprobante == data.comprobante)) {
          this.selectedItem.push(data);
        }
      }

      if (!data.comprobante && data.idJob) {
        if (!this.selectedItem.some((x) => x.idJob == data.idJob)) {
          this.selectedItem.push(data);
        }
      }

      if (data.comprobante && data.idJob) {
        if (
          !this.selectedItem.some(
            (x) => x.idJob == data.idJob && x.comprobante == data.comprobante
          )
        ) {
          this.selectedItem.push(data);
        }
      }

      if (!data.comprobante && !data.idJob) {
        this.selectedItem.push(data);
      }

      this.contadorItems = this.selectedItem.length;
    } else {
      this.selectedItem = this.selectedItem.filter((x) => x != data);
      data.checked = false;
      this.contadorItems = this.selectedItem.length;
    }

    this.contadorTotal = this.suma;
    this.cdr.detectChanges();
  }
  get suma(): number {
    return !this.selectedItem?.length
      ? 0
      : +this.selectedItem
          ?.map((x) => +x.primaNeta)
          ?.reduce((x, y) => +(x + y))
          ?.toFixed(2) || 0;
  }

  validateRange(monto, rangoInicio, rangoFin): boolean {
    if (rangoInicio == 0) {
      return Math.abs(+monto) >= rangoInicio && Math.abs(+monto) <= rangoFin;
    }
    return Math.abs(+monto) > rangoInicio && Math.abs(+monto) <= rangoFin;
  }

  validateItemComission(data: CommissionAuthModel): boolean {
    if (this.enableApproved) {
      switch (+data.idMoneda) {
        case 1:
          if (this.dataResultApproved[0]?.aprobar) {
            if (
              this.validateRange(
                +data.montoComision,
                this.dataResultApproved[0]?.rangoInicio,
                this.dataResultApproved[0]?.rangoFin
              )
            ) {
              return true;
            }
            return false;
          }
          return false;
        case 2:
          if (this.dataResultApproved[1]?.aprobar) {
            if (
              this.validateRange(
                +data.montoComision,
                this.dataResultApproved[1]?.rangoInicio,
                this.dataResultApproved[1]?.rangoFin
              )
            ) {
              return true;
            }
            return false;
          }

          return false;
      }
    } else {
      return false;
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  markItemModal(data: CommissionAuthModel, e: boolean) {
    this.contadorItemsModal = 0;
    /* if (e) {
      this.chooseItem.push(data);
    } else {
      this.chooseItem = this.chooseItem.filter(x => x.comprobante !== data.comprobante);
    } */
    if (e) {
      data.checked = true;
      if (!this.chooseItem.some((x) => x.comprobante == data.comprobante)) {
        this.chooseItem.push(data);
      }
      this.contadorItemsModal = this.chooseItem.length;
    } else {
      data.checked = false;
      this.chooseItem = this.chooseItem.filter(
        (x) => x.comprobante !== data.comprobante
      );
      this.contadorItemsModal = this.chooseItem.length;
    }
  }
  markAllItemModal(checked: boolean) {
    this.chooseAll = checked;
    this.contadorItemsModal = 0;
    if (this.chooseAll) {
      this.lstComisionToFilter.forEach((val) => {
        val.checked = true;
        if (!this.chooseItem.some((x) => x.comprobante == val.comprobante)) {
          this.chooseItem.push(val);
        }
        if (this.chooseItem.some((x) => x.comprobante == val.comprobante)) {
          this.contadorItemsModal += 1;
        }
      });
    } else {
      this.lstComisionToFilter.forEach((val) => {
        val.checked = false;
        this.chooseItem = this.chooseItem.filter(
          (x) => x.comprobante !== val.comprobante
        );
      });
    }
  }
  verFacturas(_: any) {
    this.ListCommissionFactur = [];
    this.nPoliza = _.numeroPoliza;
    this.numberPage = 1;
    this.P_NIDJOB = _.idJob;
    // this.formFiltersControl['payroll'].setValue(_.idJob);
    this.cantidadPolizas = _.cantidadRegistros;
    const requests = {
      idLote: 0,
      codigoCanal: this.idDetailChannel.toString(),
      disponibilizado: this.stateDetail,
      idPuntoVenta: '0',
      fechaInicio: this.datePipe.transform(
        this.formFiltersControl['startDate'].value,
        'dd/MM/yyyy'
      ),
      fechaFin: this.datePipe.transform(
        this.formFiltersControl['endDate'].value,
        'dd/MM/yyyy'
      ),
      /*       idRamo: 0,
            idProducto: 0, */
      numeroPoliza: this.nPoliza || 0,
      idPlanilla: _.idJob,
      idMoneda: 0,
      pagina: 1,
      cantidadRegistros: this.itemsPerPage,
    };
    this.spinner.show();
    this.commissionlotService.getCommissionFactur(requests).subscribe(
      (response: any) => {
        if (response.success) {
          this.lstComisionToFilter = <CommissionAuthModel[]>response.comisiones;
          this.polizasTotalesModal =
            this.lstComisionToFilter.length > 0
              ? this.lstComisionToFilter[0].cantidadRegistros
              : 0;
          if (this.polizasTotalesModal > 0) {
            this.vc.createEmbeddedView(this.modalHistory);
          } else {
            this.msgErrorListaFacturt = 'No se encontraron registros...';
          }
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  solicitarComisiones() {
    this.polizasTotales = 0;
    this.lstComisionAuth = [];
    this.spinner.show();
    this.showTitleSearch();

    const jsonRequest = {
      idLote: 0,
      codigoCanal: this.formFiltersControl['salesChannel'].value || 0,
      /* idEstado: this.estado, */ // 0: POR DISPONIBILIZAR // 1: DISPONIBILIZADO
      disponibilizado: !!+this.formFiltersControl['approval'].value,
      idPuntoVenta: '0',
      fechaInicio: this.datePipe.transform(
        this.formFiltersControl['startDate'].value,
        'dd/MM/yyyy'
      ),
      fechaFin: this.datePipe.transform(
        this.formFiltersControl['endDate'].value,
        'dd/MM/yyyy'
      ),
      /*       idRamo: this.InputsFilter.P_NBRANCH,
            idProducto: this.NPRODUCT, */
      numeroPoliza: this.formFiltersControl['policy'].value || 0,
      idPlanilla: +this.formFiltersControl['payroll'].value || 0,
      idMoneda: this.NCURRENCY,
      pagina: this.npage,
      cantidadRegistros: this.itemsPerPage,
      idEstadoComision: this.formFiltersControl['state'].value,
    };

    this.commissionlotService.getPayrollsPoliciesNew(jsonRequest).subscribe(
      (response: any) => {
        if (response.success) {
          this.lstComisionToFilter = <CommissionAuthModel[]>response.comisiones;
          this.lstComisionAuth = <CommissionAuthModel[]>response.comisiones.map(
            (x) => ({
              ...x,
              identificador: new Date().getTime(),
              checked: false,
              disabled: !this.validateItemComission(x),
            })
          );
          this.lstComisionAuth.forEach((x, y) => {
            x.identificador = x.identificador + y;
            x.checked = this.selectedItem.some(
              (g) => g.numeroReciboInicio == x.numeroReciboInicio
            );
          });
          this.markAllItems(this.selectedAll);
          this.markAllItemModal(this.chooseAll);
          this.polizasTotales =
            this.lstComisionAuth.length > 0
              ? this.lstComisionAuth[0].cantidadRegistros
              : 0;
          /*
                                        this.disabledDisponibilizar = true;
                                        this.disabledFecha = true;
                                        this.disabledCanal = true;
                                        this.disabledPoliza = true;
                                        this.disabeldPlanilla = true;
                                        this.bloqueoBuscar = true;
                                    } */
        }
        if (this.lstComisionAuth.length > 0) {
          this.fExistRegistro = true;
          const validate = this.lstComisionAuth.find((x) => x.codigoCanal);
          this.idDetailChannel = validate.codigoCanal;
          this.detailIdJob = +this.P_NIDJOB;
          if (!validate.fechaDisponibilizacion) {
            this.stateDetail = 'false';
          } else {
            this.stateDetail = 'true';
          }
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.fExistRegistro = false;
        }
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  pageChanged(event: any): void {
    this.selectedItem = [];
    this.npage = event;
    this.solicitarComisiones();
  }

  onSelectChannel(canal: number) {
    this.lstComision = [];
    this.totalItems = 0;
    this.idCanal = Number(canal);
    this.lstProduct = [];
    this.disabledDisponibilizar = false;
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

  descargarDisponibilizar() {
    const disp = {
      codigoCanal: this.formFiltersControl['salesChannel'].value || 0,
      disponibilizado: false,
      idPuntoVenta: '0',
      fechaInicio: this.datePipe.transform(
        this.formFiltersControl['startDate'].value,
        'dd/MM/yyyy'
      ),
      fechaFin: this.datePipe.transform(
        this.formFiltersControl['endDate'].value,
        'dd/MM/yyyy'
      ),
      idRamo: 0,
      idProducto: 1,
      numeroPoliza: 0,
      idPlanilla: 0,
      idMoneda: 0,
      pagina: this.npage,
      cantidadRegistros: this.itemsPerPage,
      idEstadoComision: this.formFiltersControl['state'].value,
    };

    const dateDif =
      this.formFiltersControl['endDate'].value.getTime() -
      this.formFiltersControl['startDate'].value.getTime();

    const resulDateDif = Math.round(dateDif / (1000 * 60 * 60 * 24));

    if (resulDateDif <= 30) {
      this.spinner.show();
      this.commissionlotService.getCommissionFactur(disp).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        (data: any) => {
          const filterResponse = data.comisiones?.filter(
            (x) =>
              +x.idRamo != 77 &&
              +x.idRamo != 82 &&
              +x.idRamo != 66 &&
              +x.idRamo != 73
          );

          if (filterResponse.length > 0) {
            this.utilsService.exportExcel({
              fileName: 'ReporteComision',
              data: filterResponse.map((value: any) => ({
                CANAL: value.canal,
                PRODUCTO: value.producto,
                PLANILLA: value.idJob,
                'TIPO INTERMEDIARIO': value.tipoIntermediario,
                'FECHA DE INICIO': value.fechaInicio,
                'FECHA FIN': value.fechaFin,
                POLIZA: value.numeroPoliza,
                COMPROBANTE: value.comprobante,
                'FECHA FACTURACIÓN': value.fechaPago,
                'FECHA DE APROBACIÓN':
                  value.fechaDisponibilizacion || 'Pendiente por Aprobar',
                'TIPO DE MONEDA': value.idMoneda == 1 ? 'Soles' : 'Dólares',
                'PRIMA TOTAL': +value.primaTotal,
                'PRIMA NETA': +value.primaNeta,
                'PORCENTAJE DE COMISIÓN': value.porcentajeComision,
                'MONTO COMISIÓN': (+value.montoComision).toFixed(2),
                'ESTADO COMISIÓN': value.estadoComision,
              })),
            });
            this.spinner.hide();
          } else {
            this.message$ = {
              success: false,
              showImage: false,
              message: 'No se encontraron resultados.',
            };
            this.spinner.hide();
            this.vc.createEmbeddedView(this.modalMessageInfo);
          }
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    } else {
      this.message$ = {
        success: false,
        showImage: false,
        message:
          'El rango de la fecha inicio de comprobante y fecha fin de comprobante NO debe ser mayor 1 mes, modifique y vuelva a intentarlo',
      };
      this.vc.createEmbeddedView(this.modalMessageInfo);
    }
  }
  descargarExcel() {
    const payload = {
      codigoCanal: this.formFiltersControl['salesChannel'].value || 0,
      disponibilizado: !!+this.formFiltersControl['approval'].value,
      idPuntoVenta: '0',
      fechaInicio: this.datePipe.transform(
        this.formFiltersControl['startDate'].value,
        'dd/MM/yyyy'
      ),
      fechaFin: this.datePipe.transform(
        this.formFiltersControl['endDate'].value,
        'dd/MM/yyyy'
      ),
      idRamo: 0,
      idProducto: 0,
      numeroPoliza: this.formFiltersControl['policy'].value || 0,
      idPlanilla: +this.formFiltersControl['payroll'].value || 0,
      idMoneda: 0,
      pagina: this.npage,
      cantidadRegistros: this.itemsPerPage,
      idEstadoComision: this.formFiltersControl['state'].value,
    };
    this.spinner.show();

    this.commissionlotService.getCommissionFactur(payload).subscribe(
      (data: any) => {
        this.utilsService.exportExcel({
          fileName: 'ReporteComision',
          data: data.comisiones.map((value: any) => ({
            CANAL: value.canal,
            PRODUCTO: value.producto,
            PLANILLA: value.idJob,
            'TIPO INTERMEDIARIO': value.tipoIntermediario,
            'FECHA DE INICIO': value.fechaInicio,
            'FECHA FIN': value.fechaFin,
            POLIZA: value.numeroPoliza,
            COMPROBANTE: value.comprobante,
            'FECHA FACTURACIÓN': value.fechaPago,
            'FECHA DE APROBACIÓN':
              value.fechaDisponibilizacion || 'Pendiente por Aprobar',
            'TIPO DE MONEDA': value.idMoneda == 1 ? 'Soles' : 'Dólares',
            'PRIMA TOTAL': +value.primaTotal,
            'PRIMA NETA': value.primaNeta,
            'PORCENTAJE DE COMISIÓN': value.porcentajeComision,
            'MONTO COMISIÓN': value.montoComision,
            'ESTADO COMISIÓN': value.estadoComision,
          })),
        });
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  disponibilizarComisionesNuevo() {
    this.dataMessageErrors = [];
    if (this.enableApproved) {
      const itemsNoApproved = this.selectedItem.some((val) => val.disabled);

      if (!itemsNoApproved) {
        this.ListCommissionFactur = [];
        this.spinner.show();
        const req = {
          idUsuario: this.idUser,
          comisiones: this.selectedItem.map((x) => ({
            numeroPoliza: x.numeroPoliza,
            numeroRecibo: x.numeroRecibo,
            idJob: x.idJob,
          })),
        };

        this.commissionlotService.getAuthorizeComissions(req).subscribe(
          (response) => {
            this.message$ = {
              success: response.success,
              showImage: true,
              message: '',
            };
            if (!!this.selectedItem?.length) {
              if (response.success) {
                this.messageinfo = 'Se aprobó correctamente';
                this.limpiar = true;
              } else {
                this.messageinfo =
                  'Se produjo un error en el sistema, vuelva a intentarlo.';
                this.limpiar = false;
              }
              this.selectedItem = [];
            } else {
              this.messageinfo = 'Por favor, seleccione un registro';
              this.limpiar = false;
            }

            this.closeHistorial();
            this.spinner.hide();

            this.message$.message = this.messageinfo;
            this.vc.createEmbeddedView(this.modalMessage);
          },
          (error: any) => {
            console.error(error);

            this.spinner.hide();

            this.message$ = {
              success: false,
              showImage: true,
              message:
                'Se produjo un error en el sistema, Vuelva a intentarlo.',
            };
            this.vc.createEmbeddedView(this.modalMessage);
          }
        );
      } else {
        this.selectedItem.forEach((val) => {
          switch (+val.idMoneda) {
            case 1:
              const rangoAprobSoles = this.dataResultApproved[0];
              if (rangoAprobSoles?.aprobar) {
                if (
                  !this.validateRange(
                    val.montoComision,
                    rangoAprobSoles?.rangoInicio,
                    rangoAprobSoles?.rangoFin
                  )
                ) {
                  this.dataMessageErrors.push(
                    `No está autorizado para aprobar está comisión, su rango permitido en Soles es: ${rangoAprobSoles.rangoInicio} a ${rangoAprobSoles.rangoFin}`
                  );
                }
                return;
              }
              this.dataMessageErrors.push(
                `No está autorizado para aprobar comisiones en Soles`
              );
              break;
            case 2:
              const rangoAprobDolares = this.dataResultApproved[1];
              if (rangoAprobDolares?.aprobar) {
                if (
                  !this.validateRange(
                    val.montoComision,
                    rangoAprobDolares?.rangoInicio,
                    rangoAprobSoles?.rangoFin
                  )
                ) {
                  this.dataMessageErrors.push(
                    `No está autorizado para aprobar está comisión, su rango permitido en Dólares es: ${rangoAprobDolares.rangoInicio} a ${rangoAprobDolares.rangoFin}`
                  );
                }
                return;
              }
              this.dataMessageErrors.push(
                `No está autorizado para aprobar comisiones en Dólares`
              );
              break;
          }
        });
        this.dataMessageErrors = Array.from(new Set(this.dataMessageErrors));
        this.vc.createEmbeddedView(this.modalApproval);
      }
    } else {
      this.dataMessageErrors.push(
        'Usted no se encuentra autorizado para aprobar comisiones'
      );
      this.vc.createEmbeddedView(this.modalApproval);
    }
  }
  disponibilizarComisionesModal() {
    this.ListCommissionFactur = [];
    this.spinner.show();
    const req = {
      codigoCanal: this.chooseItem[0].codigoCanal,
      idUsuario: this.idUser,
      comisiones: this.chooseItem.map((x) => ({
        numeroPoliza: x.numeroPoliza,
        numeroRecibo: x.numeroRecibo,
        idJob: x.idJob,
      })),
    };
    this.commissionlotService
      .getAuthorizeComissions(req)
      .subscribe((response) => {
        this.message$ = {
          success: response.success,
          showImage: true,
          message: '',
        };

        if (!!this.chooseItem?.length) {
          if (response.success) {
            this.messageinfo = response.message;
            this.limpiar = true;
          } else {
            this.messageinfo =
              'Se produjo un error en el sistema, Vuelva a intentarlo.';
            this.limpiar = false;
          }
        } else {
          this.messageinfo = 'Por favor, seleccione un registro';
          this.limpiar = false;
        }

        this.spinner.hide();
        this.closeHistorial();

        this.message$.message = this.messageinfo;
        this.vc.createEmbeddedView(this.modalMessage);
      });
  }

  setTipoFacturacion() {
    // this.lstComision
    // this.onGetLstPayrollsPolicies(this.P_NTIPOFACTURACION);
  }

  // onGetLstProducts() {
  //   this.spinner.show();

  //   this.commissionlotService.getProductDisponibilidad().subscribe(
  //     data => {
  //       this.lstProduct = <TableType[]>data;
  //       if (this.lstProduct.length > 0) {
  //         this.NPRODUCT = +this.lstProduct[0].nid;
  //       } else {
  //         this.NPRODUCT = 0;
  //       }
  //       this.spinner.hide();
  //     },
  //     () => { }
  //   );
  // }

  // onSelectProduct(CodProdcuct) {
  //   this.NPRODUCT = +CodProdcuct;
  // }

  onSelectProduct(ProductID) {
    this.NPRODUCT = +ProductID;
    if (ProductID === 0) {
      this.InputsFilter.P_NPRODUCT = 0;
    } else {
      this.InputsFilter.P_NPRODUCT = ProductID;
    }
  }

  aceptarmsginfo() {
    this.vc.clear();
    this.solicitarComisiones();
    this.selectedAll = false;
  }

  checkIfAllSelected(itemselect) {
    this.selectedAll = false;
    const commission = this.lstComision[itemselect];

    const existExclude =
      this.lstComisionExclude.length > 0
        ? this.lstComisionExclude.includes(commission, 0)
          ? true
          : false
        : false;
    const existInclude =
      this.lstComisionInclude.length > 0
        ? this.lstComisionInclude.includes(commission, 0)
          ? true
          : false
        : false;

    const indexExclude = existExclude
      ? this.lstComisionExclude.indexOf(commission)
      : -1;
    const indexInclude = existInclude
      ? this.lstComisionInclude.indexOf(commission)
      : -1;

    // commission.selected = !commission.selected;

    if (this.lstComision[itemselect].selected === true) {
      if (existExclude && indexExclude !== -1) {
        this.lstComisionExclude.splice(indexExclude, 1);
      }
      // commission.selected = false;
      this.lstComisionInclude.push(commission);
      this.contadorTotal += this.lstComision[itemselect].primaNeta;
      this.contadorItems++;
    } else {
      if (existInclude && indexInclude !== -1) {
        this.lstComisionInclude.splice(indexInclude, 1);
      }

      // commission.selected = false;
      this.lstComisionExclude.push(commission);
      this.contadorTotal -= this.lstComision[itemselect].primaNeta;
      this.contadorItems--;
    }
  }

  disponibilizarComisiones() {
    if (this.contadorItems > 0) {
      this.listCommissionAuth = [];
      this.spinner.show();
      /* if (this.selectedAll) {
        this.disponibilizarWithExcluidos();
      } else {
        this.disponibilizarWithIncluidos();
      } */
      this.disponibilizarWithIncluidos();
      /*for (let i = 0; i < this.lstComision.length; i++) {
        if (this.lstComision[i].selected === true) {
          // tslint:disable-next-line:max-line-length
          const commlotFilterCertificate = new CommissionLotFilter('01/01/2017',
           '01/01/2019', 1, '', 0, '', 0, 0, '', '', 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0);
          // commlotFilterCertificate.NIDPAYROLL = this.lstComision[i].npayroll;
          commlotFilterCertificate.NPOLICY = this.lstComision[i].npolicy;
          commlotFilterCertificate.NCURRENCY = this.lstComision[i].ncurrency;
          commlotFilterCertificate.NBRANCH = this.lstComision[i].nbranch;
          commlotFilterCertificate.NPRODUCT = this.lstComision[i].nproduct;
          commlotFilterCertificate.SCHANNEL_BO = this.lstComision[i].ncodchannel + '|' + this.lstComision[i].scodchannel;
          commlotFilterCertificate.NRECEIPT = this.lstComision[i].nreceipt;
          commlotFilterCertificate.NCERTIF = this.lstComision[i].ncertif;
          commlotFilterCertificate.NUSERREGISTER = this.idUser;
          this.listCommissionAuth.push(commlotFilterCertificate);
        }
      }
      this.commissionlotService.getAuthorizeComissions(this.listCommissionAuth).subscribe((response) => {
        if (response.result) {
          this.messageinfo = response.mensaje;
          this.limpiar = true;
        } else {
          this.messageinfo = 'Se produjo un error en el sistema, Vuelva a intentarlo.';
          this.limpiar = false;
        }
        this.vc.createEmbeddedView(this.modalMessage);
        this.spinner.hide();
      },
        error => { }
      );*/
    } else {
      this.messageinfo = 'Por favor, seleccione un registro';
      this.message$ = {
        success: false,
        showImage: false,
        message: this.messageinfo,
      };
      this.limpiar = false;
      this.vc.createEmbeddedView(this.modalMessage);
    }
  }

  closeModals() {
    this.message$ = null;
    this.selectedAll = false;
    this.chooseItem = [];
    this.chooseAll = false;
    this.contadorItemsModal = 0;
    this.vc.clear();
    this.solicitarComisiones();
  }

  hideModal() {
    this.vc.clear();
  }

  limpiarFiltros() {
    this.idCanal = 0;
    this.P_NIDJOB = 0;
    this.P_NIDPOLICY = 0;
    this.formFiltersControl['policy'].setValue(null);
    this.NSTATEDISPONIBLE = 0;
    this.estado = false;
    this.lstComisionAuth = [];
    this.disabledFecha = false;
    this.disabledCanal = false;
    this.disabledPoliza = false;
    this.disabeldPlanilla = false;
    this.disabledDisponibilizar = false;
    this.bloqueoBuscar = false;
  }

  onGetCurency() {
    const tableType = new TableType(0, '', 0);
    this.commissionlotService.getCurrency(tableType).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (data) => {
        this.lstCurrency = <Currency[]>data;
        this.lstCurrency.forEach((element) => {
          this.ListCurrencyID += element.nidcurrency + ',';
        });
        this.currencyId = 1;
        this.NCURRENCY = this.currencyId;
        this.ListCurrencyID = this.ListCurrencyID.slice(0, -1);
      },
      () => {}
    );
  }

  onSelectCurrency(CurrencyID) {
    this.NCURRENCY = +CurrencyID;
  }

  onSelectGroup(tipogrupo) {
    this.TYPE_AGRUPADOR = tipogrupo;
    if (+tipogrupo === 0) {
      this.lstComision = this.lstComisionToFilter;
      // this.lstComision = [... new Set(this.lstComisionToFilter.map(data => data.npolicy))]
    } else {
      /* this.lstComision = this.lstComisionToFilter.filter(item => item.stype === +tipogrupo); */
    }
  }

  onSelectDisponibilidad(tipodisponibiidad) {
    this.NSTATEDISPONIBLE = tipodisponibiidad;

    if (+tipodisponibiidad === 1) {
      this.txtfechafiltro = 'FECHA DE PAGO:';
      this.estado = true;
    } else {
      this.estado = false;
      this.txtfechafiltro = 'FECHA DE PAGO:';
    }
  }

  getCantidadPolizar() {
    this.commissionlotService.cantidadComisiones().subscribe(
      (res) => {
        /* this.polizasTotales = res.totalrow; */
        this.amountTotales = res.totalamount;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  disponibilizarWithExcluidos() {
    // FIXME: ENVIAR SOLO SELECCIONADOS
    for (let i = 0; i < this.lstComisionExclude.length; i++) {
      // tslint:disable-next-line:max-line-length
      /*  const commlotFilterCertificate = new CommissionLotFilter('01/01/2017', '01/01/2019', 1, '', 0, '', 0, 0, '', '', 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0);
       commlotFilterCertificate.NPOLICY = this.lstComisionExclude[i].npolicy;
       commlotFilterCertificate.NCURRENCY = this.lstComisionExclude[i].ncurrency;
       commlotFilterCertificate.NBRANCH = this.lstComisionExclude[i].nbranch;
       commlotFilterCertificate.NPRODUCT = this.lstComisionExclude[i].nproduct;
       commlotFilterCertificate.SCHANNEL_BO = this.lstComisionExclude[i].ncodchannel + '|' + this.lstComision[i].scodchannel;
       commlotFilterCertificate.NRECEIPT = this.lstComisionExclude[i].nreceipt;
       commlotFilterCertificate.NCERTIF = this.lstComisionExclude[i].ncertif;
       commlotFilterCertificate.NUSERREGISTER = this.idUser;
       this.listCommissionAuth.push(commlotFilterCertificate); */
    }

    this.commissionlotService
      .getAuthorizeComissionsAll(this.listCommissionAuth)
      .subscribe(
        (response) => {
          this.message$ = {
            success: response.result,
            showImage: true,
            message: '',
          };
          /* this.lstProduct = <TableType[]>data;
       this.NPRODUCT = this.lstProduct[0].nid;*/
          if (response.result) {
            this.messageinfo = response.mensaje;
            this.limpiar = true;
          } else {
            this.messageinfo =
              'Se produjo un error en el sistema, Vuelva a intentarlo.';
            this.limpiar = false;
          }
          this.message$.message = this.messageinfo;
          this.vc.createEmbeddedView(this.modalMessage);
          this.spinner.hide();
        },
        (error) => {
          console.log(error);
          this.spinner.hide();
        }
      );
  }

  disponibilizarWithIncluidos() {
    // FIXME: ENVIAR SOLO SELECCIONADOS
    for (let i = 0; i < this.lstComisionInclude.length; i++) {
      // tslint:disable-next-line:max-line-length
      /* const commlotFilterCertificate = new CommissionLotFilter('01/01/2017', '01/01/2019', 1, '', 0, '', 0, 0, '', '', 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0);
      commlotFilterCertificate.NPOLICY = this.lstComisionInclude[i].npolicy;
      commlotFilterCertificate.NCURRENCY = this.lstComisionInclude[i].ncurrency;
      commlotFilterCertificate.NBRANCH = this.lstComisionInclude[i].nbranch;
      commlotFilterCertificate.NPRODUCT = this.lstComisionInclude[i].nproduct;
      commlotFilterCertificate.SCHANNEL_BO = this.lstComisionInclude[i].ncodchannel + '|' + this.lstComision[i].scodchannel;
      commlotFilterCertificate.NRECEIPT = this.lstComisionInclude[i].nreceipt;
      commlotFilterCertificate.NCERTIF = this.lstComisionInclude[i].ncertif;
      commlotFilterCertificate.NUSERREGISTER = this.idUser;
      this.listCommissionAuth.push(commlotFilterCertificate); */
    }

    this.commissionlotService
      .getAuthorizeComissions(this.listCommissionAuth)
      .subscribe(
        (response) => {
          this.message$ = {
            success: response.result,
            showImage: true,
            message: '',
          };

          if (response.result) {
            this.messageinfo = response.mensaje;
            this.limpiar = true;
          } else {
            this.messageinfo =
              'Se produjo un error en el sistema, Vuelva a intentarlo.';
            this.limpiar = false;
          }

          this.message$.message = this.messageinfo;
          this.vc.createEmbeddedView(this.modalMessage);
          this.spinner.hide();
        },
        (error) => {
          console.log(error);
          this.spinner.hide();
        }
      );
  }

  closeHistorial(): void {
    this.vc.clear();
    this.chooseItem = [];
    this.chooseAll = false;
    this.contadorItemsModal = 0;
  }

  formatDate(date: string): string {
    return `${
      date?.indexOf('0001') !== -1
        ? '-'
        : this.datePipe.transform(date, 'dd/MM/yyyy')
    }`;
  }
  showModalFactura(): void {
    this.vc.createEmbeddedView(this._modalFactura);
  }

  setClienteFactura(val): void {
    this.clienteFactura = val;
    if (this.clienteFactura) {
      this.showModalFactura();
    }
  }
}
