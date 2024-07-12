import {
  Component,
  OnInit,
  ViewChild,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { Payroll } from '../../models/payroll/payroll';
import { PayrollService } from '../../services/payroll/payroll.service';
import { PayrollFilter } from '../../models/payroll/payrollfilter';
import { StateChannelType } from '../../models/state/statechanneltype';
import { StateService } from '../../services/state/state.service';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PayrollCab } from '../../models/payroll/payrollcab';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { ConcPayroll } from '../../models/payroll/concpayroll';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { isNullOrUndefined } from 'util';
import { TableType } from '../../models/payroll/tabletype';
import { Currency } from '../../models/currency/currency';
import { PayrollHist } from '../../models/payroll/PayrollHist';
import { EventStrings } from '../../shared/events/events';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { animate, style, transition, trigger } from '@angular/animations';

defineLocale('es', esLocale);
@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({
          opacity: 0,
        }),
        animate(
          250,
          style({
            opacity: 1,
          })
        ),
      ]),
    ]),
  ],
})
export class PayrollComponent implements OnInit {
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('childModalConfirmasivo', { static: true })
  childModalConfirmasivo: ModalDirective;
  @ViewChild('childModalConfirmarEnvio', { static: true })
  childModalConfirmarEnvio: ModalDirective;
  @ViewChild('childModalEliminarIndividual', { static: true })
  childModalEliminarIndividual: ModalDirective;
  @ViewChild('childModalHistorial', { static: true })
  childModalHistorial: ModalDirective;
  bHideBody: boolean;
  messageEnvio: string;
  message: string;
  messageinfo: string;
  IdPayroll: number;
  modalRef: BsModalRef;
  flagConfirmacion: string;
  msjHeader: string;
  selectedAll: any;
  public currentPage = 0;
  public bsConfig: Partial<BsDatepickerConfig>;
  public InputsFilter: any = {};
  fExistRegistro: any = false;
  msgErrorLista = '';
  ObjPayroll = new Payroll(
    '01/01/2017',
    '31/12/2017',
    0,
    0,
    '',
    '',
    0,
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
    0,
    0,
    '',
    0,
    '',
    0,
    '',
    '',
    0,
    0,
    0,
    false,
    '',
    '',
    0
  );
  strPlanilla: string;
  strPrecio: string;
  npage = 1;
  paginacion: any = {};
  rotate = true;
  maxSize = 10;
  public itemsPerPage = 10;
  public totalItems = 0;
  mainTipoCanal = 0;
  fecha = new Date();
  /* d = new Date();
  d.setMonth(d.getMonth() - 3); */

  /* dia = this.fecha.getDate();
  mes = this.fecha.getMonth() === 0 ? 1 : this.fecha.getMonth();
  anio = this.fecha.getFullYear(); */

  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  ListStateID = '';
  ListCodChannel = '';
  ListPayroll: Payroll[];
  ListPayrollExport: Payroll[];
  arrayIdPayroll = '';
  ListChannelSales: any[];
  channelSales: ChannelSales;
  public lstStateChannel: StateChannelType[];

  ListPayrollHist: PayrollHist[];
  fExistRegistroHistorial: any = false;
  msgErrorListaHist = '';
  nLote: string;
  planillaBuscar = '';
  concpayroll = new ConcPayroll(0, 0, '', 0, '', 0, '');
  public result: any = {};
  @ViewChild('myButton') myButton: ElementRef;
  node: string;
  planillaID: number;
  stateID: number;
  strMedioPago: string;
  strFechaEliminar: string;
  isAdmin: boolean;

  stateSelected: string;
  channelSelected: string;

  public lstBranch: TableType[];
  ListBranch: any[];
  ListBranchID = '';

  public lstProduct: TableType[];
  ListProduct: any[];
  ListProductID = '';

  public lstCurrency: Currency[];
  ListCurrencyID = '';
  currencyId: number;

  nidpayrollMenu: any;

  constructor(
    private payrollService: PayrollService,
    private service: StateService,
    private router: Router,
    private datePipe: DatePipe,
    public utilityService: UtilityService,
    private excelService: ExcelService,
    private channelSalesService: ChannelSalesService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private spinner: NgxSpinnerService,
    private emissionService: EmisionService
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
    this.InputsFilter.P_NBRANCH = 66;
    this.InputsFilter.P_NPRODUCT = 0;
    this.InputsFilter.P_NCURRENCY = 1;
    this.InputsFilter.P_DATEBEGIN = '';
    this.InputsFilter.P_DATEEND = '';
    this.InputsFilter.P_NIDPAYROLL = '';
    this.InputsFilter.P_NSTATE = 0;
    this.InputsFilter.NAMOUNTTOTAL = 0;
    this.InputsFilter.NQUANTITY = 0;

    this.InputsFilter.NIDPAYROLL = 0;
    const payrollSelected = localStorage.getItem('payrollSelected');
    if (!isNullOrUndefined(payrollSelected)) {
      this.InputsFilter.P_NIDPAYROLL = payrollSelected;
    }

    this.InputsFilter.NIDSTATE = 0;
    this.InputsFilter.ROWNUMBER = 0;
    this.InputsFilter.ROWTOTAL = 0;
    this.InputsFilter.SPLANILLA = '';
    this.InputsFilter.SREGISTER = '';
    this.InputsFilter.STYPE = '';
    this.InputsFilter.SDESCRIPTION = '';
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.npage = this.npage;
  }

  ngOnInit() {
    this.onGetLstState();
    this.onGetLstBranch();
    this.onGetCurency();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isAdmin = currentUser.productoPerfil.some((item: any) =>
      [20, 151, 159].includes(item.idPerfil)
    );
    this.mainTipoCanal = currentUser.tipoCanal;
    if (this.isAdmin) {
      this.LoadChannelSales();
    }
    this.emissionService
      .registrarEvento('', EventStrings.PAYROLL_INGRESAR)
      .subscribe();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;
    this.channelSales = new ChannelSales(nusercode, '0', '');
    this.channelSalesService.getPostChannelSales(this.channelSales).subscribe(
      (data) => {
        this.ListChannelSales = <any[]>data;
        this.ListChannelSales.forEach((element) => {
          this.ListCodChannel += element.nchannel + ',';
        });
        this.ListCodChannel = this.ListCodChannel.slice(0, -1);
        this.InputsFilter.P_NID_NCHANNELTYPE = this.ListCodChannel;

        this.channelSelected = '0';
        const selectedChannel = localStorage.getItem('channelSelected');
        if (!isNullOrUndefined(selectedChannel)) {
          this.channelSelected = selectedChannel;
          this.InputsFilter.P_NID_NCHANNELTYPE = selectedChannel;
        }
        // this.onEventSearch();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSelectChannel(Channel) {
    if (Channel === '0') {
      this.InputsFilter.P_NID_NCHANNELTYPE = this.ListCodChannel;
    } else {
      this.InputsFilter.P_NID_NCHANNELTYPE = Channel;
    }
    localStorage.setItem('channelSelected', Channel);
  }

  onEventSearch() {
    this.InputsFilter.P_DATEBEGIN = this.datePipe.transform(
      this.bsValueIni,
      'dd/MM/yyyy'
    );
    this.InputsFilter.P_DATEEND = this.datePipe.transform(
      this.bsValueFin,
      'dd/MM/yyyy'
    );
    this.npage = 0;
    this.onLoadPayroll();
  }

  selectAll() {
    for (let i = 0; i < this.ListPayroll.length; i++) {
      this.ListPayroll[i].selected = this.selectedAll;
    }
  }

  EventDownload(event) {
    this.ObjPayroll = new Payroll(
      this.InputsFilter.P_DATEBEGIN,
      this.InputsFilter.P_DATEEND,
      +this.InputsFilter.P_NIDPAYROLL,
      this.InputsFilter.P_NSTATE,
      this.InputsFilter.P_NID_NCHANNELTYPE,
      this.InputsFilter.P_NID_NSALESPOINT,
      this.InputsFilter.P_NBRANCH,
      this.InputsFilter.P_NPRODUCT,
      this.InputsFilter.P_NCURRENCY,
      this.InputsFilter.NAMOUNTTOTAL,
      this.InputsFilter.NQUANTITY,
      this.InputsFilter.NIDPAYROLL,
      this.InputsFilter.NIDSTATE,
      this.InputsFilter.SPLANILLA,
      this.InputsFilter.SREGISTER,
      this.InputsFilter.STYPE,
      this.InputsFilter.SDESCRIPTION,
      0,
      0,
      0,
      '',
      0,
      '',
      0,
      '',
      '',
      this.currentUser.id,
      this.paginacion.npage,
      this.paginacion.ItemsPerPage,
      false,
      '',
      '',
      0
    );
    this.ObjPayroll.NPAGE = 0;
    this.ObjPayroll.NRECORDPAGE = 0;
    this.spinner.show();
    this.payrollService.getPostListPayrollList(this.ObjPayroll).subscribe(
      (data) => {
        this.spinner.hide();
        this.ListPayrollExport = <any[]>data;
        if (this.ListPayrollExport.length > 0) {
          this.excelService.exportReportPayroll(
            this.ListPayrollExport,
            'ReportePayRoll'
          );
        }
        this.emissionService
          .registrarEvento('', EventStrings.PAYROLL_EXPORTAR)
          .subscribe();
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  EventDownloadDetailPayroll(nid_payroll: number) {
    let ListCertificado = [];
    const payrollFilterCertificate = new PayrollFilter(
      '01/01/2017',
      '01/01/2019',
      0,
      '2018000059',
      '',
      0,
      0,
      0,
      0
    );
    payrollFilterCertificate.NIDPAYROLL = nid_payroll;
    this.payrollService.getDetailPayroll(payrollFilterCertificate).subscribe(
      (data) => {
        ListCertificado = <any[]>data;
        if (ListCertificado.length > 0) {
          this.excelService.exportReportDetailPayroll(
            ListCertificado,
            'ReporteDetailPayRoll'
          );
          this.emissionService
            .registrarEvento(
              'Se descargó detalle de planilla ' + nid_payroll,
              EventStrings.PAYROLL_DESCARGAR_DETALLE
            )
            .subscribe();
        } else {
          this.messageinfo = 'La planilla no tiene certificado';
          this.childModal.show();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  checkIfAllSelected() {
    this.ListPayroll.every(function (item: Payroll) {
      return item.selected === true;
    });
  }

  onLoadPayroll() {
    if (this.InputsFilter.P_NIDPAYROLL === '') {
      this.InputsFilter.P_NIDPAYROLL = 0;
    }
    this.ObjPayroll = new Payroll(
      this.InputsFilter.P_DATEBEGIN,
      this.InputsFilter.P_DATEEND,
      +this.InputsFilter.P_NIDPAYROLL,
      this.InputsFilter.P_NSTATE,
      this.InputsFilter.P_NID_NCHANNELTYPE,
      this.InputsFilter.P_NID_NSALESPOINT,
      this.InputsFilter.P_NBRANCH,
      this.InputsFilter.P_NPRODUCT,
      this.InputsFilter.P_NCURRENCY,
      this.InputsFilter.NAMOUNTTOTAL,
      this.InputsFilter.NQUANTITY,
      this.InputsFilter.NIDPAYROLL,
      this.InputsFilter.NIDSTATE,
      this.InputsFilter.SPLANILLA,
      this.InputsFilter.SREGISTER,
      this.InputsFilter.STYPE,
      this.InputsFilter.SDESCRIPTION,
      0,
      0,
      0,
      '',
      0,
      '',
      0,
      '',
      '',
      this.currentUser.id,
      this.paginacion.npage,
      this.paginacion.ItemsPerPage,
      false,
      '',
      '',
      0
    );
    this.spinner.show();
    localStorage.setItem('payrollSelected', this.InputsFilter.P_NIDPAYROLL);
    this.payrollService.getPostListPayrollList(this.ObjPayroll).subscribe(
      (data) => {
        this.ListPayroll = <Payroll[]>data;
        if (this.ListPayroll.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = data[0].nrecorD_COUNT;
        } else {
          this.fExistRegistro = false;
          this.msgErrorLista = 'No se encontraron Registros..';
        }
        this.emissionService
          .registrarEvento('', EventStrings.PAYROLL_BUSCAR)
          .subscribe();
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  openModalConfirmacionMasivo() {
    let arrayDiferentesPendiente = '';
    let countIdPayRoll = 0;
    this.ListPayroll.forEach((element) => {
      if (element.selected === true) {
        countIdPayRoll++;
        if (!(element.nidstate === 1 || element.nidstate === 3)) {
          arrayDiferentesPendiente += element.nidpayroll + ',';
        } else {
          this.arrayIdPayroll += element.nidpayroll + ',';
        }
      }
    });
    if (countIdPayRoll === 0) {
      this.messageinfo = 'Por favor por lo menos seleccione un planilla';
      this.childModal.show();
    } else {
      if (arrayDiferentesPendiente.length > 0) {
        arrayDiferentesPendiente = arrayDiferentesPendiente.slice(0, -1);
        if (arrayDiferentesPendiente.split(',').length === 1) {
          this.messageinfo =
            'No se pudo realizar la anulación masiva, debido a que las siguientes planilla : ' +
            arrayDiferentesPendiente +
            ' no tienen el estado correcto';
        } else {
          this.messageinfo =
            'No se pudo realizar la anulación masiva, debido a que las siguientes planillas: ' +
            arrayDiferentesPendiente +
            ' no tienen el estado correcto';
        }
        this.childModal.show();
      } else {
        this.msjHeader = 'Esta seguro de anular las planillas seleccionadas?';
        this.bHideBody = true;
        this.flagConfirmacion = 'anulacionmasivo';
        this.childModalConfirmasivo.show();
      }
    }
  }

  openModalConfirmacion(idpayroll: string) {
    const elemento = this.ListPayroll.filter(
      (e) => e.splanilla.toString() === idpayroll.toString()
    );
    this.childModalEliminarIndividual.show();
    this.msjHeader =
      'Esta seguro de anular la planilla ' + elemento[0].splanilla + ' ?';
    this.strPlanilla = elemento[0].splanilla;
    this.strPrecio = elemento[0].namounttotal.toString();
    this.strMedioPago = elemento[0].stype.toString();
    this.strFechaEliminar = elemento[0].sregister.toString();
    this.flagConfirmacion = 'anulacionindividual';
    this.IdPayroll = +idpayroll;
  }

  openModalConfirConciliacion(idpayroll: string) {
    this.bHideBody = false;
    this.childModalConfirmasivo.show();
    this.message = 'Esta seguro de enviar a conciliar la planilla? ';
    this.flagConfirmacion = 'conciliacionplanilla';
    this.IdPayroll = +idpayroll;
  }

  confirm(): void {
    if (this.flagConfirmacion === 'anulacionmasivo') {
      this.btnAnularPayrollMasivo();
    } else if (this.flagConfirmacion === 'anulacionindividual') {
      this.btnAnularPayrollIndividual();
    } else if (this.flagConfirmacion === 'conciliacionplanilla') {
      this.btnEnviarConciliarPlanilla();
    }
    this.childModalConfirmasivo.hide();
  }

  closeconfirm(): void {
    this.childModalConfirmasivo.hide();
  }

  closeconfirmIndividual(): void {
    this.childModalEliminarIndividual.hide();
  }

  pageChanged(event: any): void {
    this.paginacion.npage = event.page;
    this.onLoadPayroll();
  }

  onGetLstState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tipoCanal = +currentUser.tipoCanal;
    const StateChannel = new StateChannelType(0, '', tipoCanal, 0);
    this.service.GetStatexChannelType(StateChannel).subscribe(
      (data) => {
        this.lstStateChannel = <StateChannelType[]>data;
        this.lstStateChannel.forEach((element) => {
          this.ListStateID += element.nidstate + ',';
        });
        this.ListStateID = this.ListStateID.slice(0, -1);
        this.InputsFilter.P_NSTATE = this.ListStateID;

        this.stateSelected = '0';
        const selectedState = localStorage.getItem('stateSelected');
        if (!isNullOrUndefined(selectedState)) {
          this.stateSelected = selectedState;
          this.InputsFilter.P_NSTATE = selectedState;
        }
      },
      (error) => {}
    );
  }

  EnviarPlanilla(id: number, nidstate: number): void {
    this.childModalConfirmarEnvio.show();
    this.messageEnvio = 'Esta seguro que desea enviar la planilla?';
    this.planillaID = id;
    this.stateID = nidstate;
  }

  verDetalle(planilla) {
    this.router.navigate(['broker/payrolladd', 'send', planilla, 11], {
      skipLocationChange: true,
    });
  }

  ActualizarPlanilla(id: number, idbranch: number, idproduct: number): void {
    const dat_branchProduct = {
      branch: idbranch,
      product: idproduct,
    };
    sessionStorage.setItem(
      'dataBranchProdcut',
      JSON.stringify(dat_branchProduct)
    );
    this.router.navigate(['broker/payrolladd', 'upd', id, 0], {
      skipLocationChange: true,
    });
  }

  setAgregarPlanilla() {
    this.router.navigate(['broker/payrolladd', 'add', 0, 0], {
      skipLocationChange: true,
    });
  }

  aceptarmsginfo() {
    this.childModal.hide();
  }
  btnAnularPayrollIndividual() {
    const payrollCab = new PayrollCab(
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
    let result: any = {};
    payrollCab.NIDPAYROLLLIST = this.IdPayroll.toString();
    payrollCab.NUSERREGISTER = JSON.parse(
      localStorage.getItem('currentUser')
    ).id;
    this.payrollService.getPostAnularPlanilla(payrollCab).subscribe(
      (data) => {
        result = data;
        this.messageinfo = result.noutidpayroll;
        this.childModalEliminarIndividual.hide();
        this.childModal.show();
        this.onLoadPayroll();
        this.emissionService
          .registrarEvento(
            'Se anulo la planilla ' + this.IdPayroll.toString(),
            EventStrings.PAYROLL_ANULAR
          )
          .subscribe();
      },
      (error) => {
        console.log(error);
      }
    );
  }
  btnAnularPayrollMasivo() {
    const payrollCab = new PayrollCab(
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
    let result: any = {};
    payrollCab.NIDPAYROLLLIST = this.arrayIdPayroll;
    payrollCab.NUSERREGISTER = JSON.parse(
      localStorage.getItem('currentUser')
    ).id;
    this.payrollService.getPostAnularPlanilla(payrollCab).subscribe(
      (data) => {
        result = data;
        this.messageinfo = result.noutidpayroll;
        this.childModal.show();
        this.onLoadPayroll();
        this.selectedAll = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  btnEnviarConciliarPlanilla() {
    this.concpayroll.NIDPAYROLL = this.IdPayroll;
    this.concpayroll.NIDSTATE = 1;
    this.concpayroll.NUSERCONCI = JSON.parse(
      localStorage.getItem('currentUser')
    ).id;

    this.payrollService.getPostConciliarPlanilla(this.concpayroll).subscribe(
      (data) => {
        this.result = data;
        this.messageinfo = this.result.noutidpayroll;
        this.childModal.show();
        this.onEventSearch();
        this.emissionService
          .registrarEvento(
            'Se concilió la planilla ' + this.IdPayroll.toString(),
            EventStrings.PAYROLL_CONCILIAR
          )
          .subscribe();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSelectState(StateID) {
    if (StateID === '0') {
      this.InputsFilter.P_NSTATE = this.ListStateID;
      this.stateSelected = '0';
    } else {
      this.InputsFilter.P_NSTATE = StateID;
      this.stateSelected = StateID;
    }
    localStorage.setItem('stateSelected', this.stateSelected);
  }

  onVotedParentChannelSales(idChannelSales: string) {
    this.InputsFilter.P_NID_NCHANNELTYPE = idChannelSales;
  }

  onVotedParentChannelPoint(idChannelSales: string) {
    if (idChannelSales === '') {
      idChannelSales = null;
    }
    this.InputsFilter.P_NID_NSALESPOINT = idChannelSales;
    this.onEventSearch();
  }

  confirmEnviar() {
    this.router.navigate(
      ['broker/payrolladd', 'send', this.planillaID, this.stateID],
      { skipLocationChange: true }
    );
    this.childModalConfirmarEnvio.hide();
  }

  closeEnviar() {
    this.childModalConfirmarEnvio.hide();
  }

  onGetLstBranch() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tableType = new TableType(0, '', currentUser.canal);
    this.payrollService.getBranch(tableType).subscribe(
      (data) => {
        this.lstBranch = <TableType[]>data;
        this.onSelectBranch(this.InputsFilter.P_NBRANCH);

        this.lstBranch.forEach((element) => {
          this.ListBranchID += element.nid + ',';
        });
        this.ListBranchID = this.ListBranchID.slice(0, -1);
      },
      (error) => {}
    );
  }

  onGetLstProducts(idProduct) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tableType = new TableType(idProduct, '', currentUser.canal);

    this.payrollService.getProduct(tableType).subscribe(
      (data) => {
        this.lstProduct = <TableType[]>data;
        this.InputsFilter.P_NPRODUCT = this.lstProduct[0].nid;
      },
      (error) => {}
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
      (error) => {}
    );
  }

  onSelectBranch(BranchID) {
    this.lstProduct = [];
    this.InputsFilter.P_NBRANCH = BranchID;
    if (+BranchID !== 0) {
      this.onGetLstProducts(BranchID);
    } else {
      this.InputsFilter.P_NPRODUCT = 0;
    }
  }

  onSelectProduct(ProductID) {
    if (ProductID === 0) {
      this.InputsFilter.P_NPRODUCT = 0;
    } else {
      this.InputsFilter.P_NPRODUCT = ProductID;
    }
  }

  onSelectCurrency(CurrencyID) {
    this.InputsFilter.P_NCURRENCY = +CurrencyID;
  }

  VerHistorial(nidpayroll) {
    const payrollCab = new PayrollCab(
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
    payrollCab.NIDPAYROLL = nidpayroll;
    this.payrollService.getPayrollHist(payrollCab).subscribe(
      (data) => {
        // console.log('historial');
        // console.log(data);
        this.ListPayrollHist = <PayrollHist[]>data;
        this.nLote = nidpayroll;
        this.msgErrorListaHist =
          this.ListPayrollHist.length > 0
            ? ''
            : 'No se encontraron Registros..';
        this.fExistRegistroHistorial = this.ListPayrollHist.length > 0;
        this.childModalHistorial.show();

        this.emissionService
          .registrarEvento(
            'Ver historial de planilla Nro: ' + nidpayroll,
            EventStrings.PAYROLL_VERHISTORIAL
          )
          .subscribe();
      },
      (error) => {
        console.log(error);
      }
    );
  }
  showMenuActions(id: any) {
    if (this.nidpayrollMenu === id) {
      this.nidpayrollMenu = null;
    } else {
      this.nidpayrollMenu = id;
    }
  }
  closeHistorial(): void {
    this.childModalHistorial.hide();
  }
}
