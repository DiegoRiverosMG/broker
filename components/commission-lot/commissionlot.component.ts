import { EmisionService } from './../../../client/shared/services/emision.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewContainerRef,
  TemplateRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CommissionLot } from '../../models/commissionlot/commissionlot';

import { CommissionLotState } from '../../models/commissionlot/commissionlotstate';
import { TableType } from '../../models/commissionlot/tabletype';
import { CommissionLotService as ComisLotService } from '../../services/commisslot/comissionlot.service';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { UtilityService } from '@shared/services/general/utility.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExcelService } from '@shared/services/excel/excel.service';
import { CommissionLotFilter } from '../../models/commissionlot/commissionlotfilter';
import { CommissionLotHist } from '../../models/commissionlot/commissionlothist';
import { AppConfig } from '@root/app.config';
import {
  descargarExcel,
  datosExcel,
} from '../../models/commission-channel/commission-channel.model';
import { DownloadDto } from '../../models/download/download';
import { CommissionLotExactus } from '../../models/commissionlot/commissionlotexactus';
import { NgxSpinnerService } from 'ngx-spinner';
import { EventStrings } from '../../shared/events/events';
import { Currency } from '../../models/currency/currency';
import { ChannelSalesService } from '@shared/services/channelsales/channelsales.service';
import { ChannelSales } from '@shared/models/channelsales/channelsales';
import { isNullOrUndefined } from 'util';
import { UtilsService } from '@shared/services/utils/utils.service';
import { datePickerConfig } from '@shared/config/config';
import moment from 'moment';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';
import { CommissionLotService } from '../../services/commission-lot/commission-lot.service';
import { RegularExpressions } from '@shared/regexp/regexp';

defineLocale('es', esLocale);
@Component({
  selector: 'app-commissionlot',
  templateUrl: './commissionlot.component.html',
  styleUrls: ['./commissionlot.component.sass'],
})
export class CommissLotComponent implements OnInit {
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('childModalConfirmasivo', { static: true })
  childModalConfirmasivo: ModalDirective;
  @ViewChild('childModalHistorial', { static: true })
  childModalHistorial: ModalDirective;
  @ViewChild('childModalConfirmarEnvio', { static: true })
  childModalConfirmarEnvio: ModalDirective;
  @ViewChild('childModalCorreo', { static: true })
  childModalCorreo: ModalDirective;

  lot: Array<any>;
  datosD: any = {};
  datosExcel: any = {};
  strObservacion: string;
  bHideBody: boolean;
  messageinfo = '';
  messageMail = '';
  emailbroker: String;
  mailOld: String;
  setting_pay = '';
  bNotificaMailBroker = false;
  bSbs = false;
  textSbs = '';
  showMail = false;
  headMailBroker = '';
  IdCommLot: number;
  IdBranch: number;
  sPRoduct = '';
  flagConfirmacion: string;
  msjHeader: string;
  selectedAll: any;
  totalItems: number;

  // Array para los campos de tipo texto
  public InputsFilter: any = {};
  // Variable indica si se obtuvo o no Informacion
  fExistRegistro: any = false;
  bopacitysave = false;
  fExistRegistroHistorial: any = false;
  ObjCommissionLot = new CommissionLot(
    '01/01/2017',
    '31/12/2017',
    0,
    '',
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    0,
    0,
    '',
    '',
    0,
    '',
    0,
    '',
    0,
    0,
    1,
    '',
    '',
    0,
    0,
    false,
    0,
    ''
  );

  /*Variables de paginacion */
  npage = 1;
  paginacion: any = {};
  public currentPage = 0;
  public itemsPerPage = 5;
  /* public totalItems = 0; */
  public tipoCanal = 0;
  public profileId = 0;
  public muestracorreo = false;
  public idUser = 0;
  fecha = new Date();
  flagGrossUpTop = false;

  nidStateApprob: number;
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  ListStateID = '';
  ListCodChannel = '';
  mensaje_validacion = '';
  mensajes_validacion = [];
  // Lista
  ListCommissionLot: CommissionLot[];
  ListCommissionLotExport: CommissionLot[];
  arrayIdCommissionLot = '';
  ListCommissionLotHist: CommissionLotHist[];
  // Estado de Planilla
  public lstStateCommission: CommissionLotState[];
  ListChannelSales: any[];
  planillaBuscar = '';

  lstStateApprobCommission: CommissionLotState[];
  // Ramo de la poliza
  public lstBranch: TableType[] = [];
  ListBranch: any[] = [];
  ListBranchID = '';
  // obj Filter
  commlotFilter = new CommissionLotFilter(
    '',
    '',
    0,
    '',
    0,
    '',
    0,
    0,
    '',
    '',
    0,
    0,
    0,
    '',
    0,
    0,
    0,
    0,
    0,
    0,
    0
  );
  public result: any = {};
  resultvalidate: any = {};

  showfilterChannel: boolean;
  showfilterNPAYROL: boolean;
  branchId: number;
  currencyId: number;
  // Productos /**jSoteldo */
  lstCurrency: Currency[];
  ListCurrencyID = '';

  lstProduct: any;
  ListProduct: any[];
  ListProductID = '';
  productId: number;
  // CHANNEL jSoteldo
  channelSales: ChannelSales;
  messageErrorMail = '';

  fileType = {
    PDF: '1',
    XML: '3'
  }

  @ViewChild('myButton') myButton: ElementRef;
  node: string;
  // Envio de planilla
  commissionLotID: number;
  stateID: number;
  strFechaEliminar: string;
  nLote: string;
  canalHist: number;
  flagAlerta = false;
  bloqueoVentas = true;
  mensajeBloqueo = '';

  // *Remake frontend

  formFilters: FormGroup = this.builder.group({
    branch: [''],
    product: [''],
    salesChannel: [''],
    startDate: [new Date(new Date().setMonth(new Date().getMonth() - 6))],
    endDate: [new Date()],
    lot: ['', Validators.pattern(RegularExpressions.numbers)],
    policy: ['', Validators.pattern(RegularExpressions.numbers)],
    state: [''],
    payroll: ['', Validators.pattern(RegularExpressions.numbers)],
    currency: [''],
  });

  commissionLotList: any = {};

  currentPageComissionLotList = 1;

  startDateFilter: Partial<BsDatepickerConfig> = {
    ...datePickerConfig,
    maxDate: new Date(),
  };
  endDateFilter: Partial<BsDatepickerConfig> = {
    ...datePickerConfig,
    maxDate: new Date(),
  };

  // *Variable para volver a llamar a la función de busqueda cuando se cierra el modal de mensaje
  research = false;

  selectedLot: any = {};

  @ViewChild('modalConfirmCancelLot', { static: true, read: TemplateRef })
  modalConfirmCancelLot: TemplateRef<ElementRef>;

  constructor(
    private comisLotService: ComisLotService,
    private router: Router,
    private datePipe: DatePipe,
    public utilityService: UtilityService,
    private emissionService: EmisionService,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService,
    private channelSalesService: ChannelSalesService,
    private readonly utilsService: UtilsService,
    private readonly builder: FormBuilder,
    private readonly commissionLotService: CommissionLotService,
    private readonly vc: ViewContainerRef
  ) {
    this.ListCommissionLot = [];
    this.totalItems = 0;
    // Setear variables de tipo filtro
    this.InputsFilter.P_DATEBEGIN = '';
    this.InputsFilter.P_DATEEND = '';
    this.InputsFilter.P_SCODCHANNEL = 0;
    this.InputsFilter.p_NIDCOMMLOT = '';
    this.InputsFilter.P_NSTATE = 0;
    this.InputsFilter.P_NPOLICY = '';

    this.InputsFilter.P_NIDPAYROLL = 0;
    this.InputsFilter.ncurrency = 1;
    // Variables de salida
    this.InputsFilter.NAMOUNTTOTAL = 0;
    this.InputsFilter.NQUANTITY = 0;
    this.InputsFilter.NIDCOMMLOT = 0;
    this.InputsFilter.NIDSTATE = 0;
    this.InputsFilter.ROWNUMBER = 0;
    this.InputsFilter.ROWTOTAL = 0;
    this.InputsFilter.SIDCOMMLOT = '';
    this.InputsFilter.SREGISTER = '';
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.npage = this.npage;
    this.nLote = '';
    this.bopacitysave = false;
  }

  ngOnInit() {
    this.resetFormFilters();
    this.ListCommissionLot = [];
    this.totalItems = 0;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentProduct = JSON.parse(sessionStorage.getItem('sessionProduct'));
    switch (currentProduct) {
      case 1:
        this.InputsFilter.P_NBRANCH = 66;
        break;

      case 2:
        this.InputsFilter.P_NBRANCH = 77;
        break;

      case 3:
        this.InputsFilter.P_NBRANCH = 73;
        break;

      case 4:
        this.InputsFilter.P_NBRANCH = 61;
        break;

      default:
        this.InputsFilter.P_NBRANCH = 66;
        break;
    }
    this.tipoCanal = +currentUser.tipoCanal;
    this.canalHist = currentUser.canal;
    this.idUser = currentUser.id;
    this.profileId = +currentUser.profileId;

    if (this.profileId !== 28 && this.profileId !== 20) {
      this.getMailFacturacion();
      this.muestracorreo = true;
    }

    this.LoadChannelSales();
    this.onSelectChannelSales(this.canalHist);
    this.onGetLstState();
    this.evaluateLock();

    this.emissionService
      .registrarEvento('', EventStrings.COMMLOT_INGRESAR)
      .subscribe();

    this.valueChangesFormFilters();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  get currentPageComissionLot(): number {
    return this.currentPageComissionLotList;
  }

  set currentPageComissionLot(currentPage: number) {
    this.currentPageComissionLotList = currentPage;
    this.onSearch();
  }

  onEventSearch() {
    this.ListCommissionLot = [];
    this.totalItems = 0;
    if (
      this.InputsFilter.P_NBRANCH === 1 &&
      this.InputsFilter.P_NPRODUCT === 0
    ) {
      this.messageinfo = 'Por favor, seleccione un producto';
      this.childModal.show();
    } else {
      this.InputsFilter.P_DATEBEGIN = this.datePipe.transform(
        this.bsValueIni,
        'dd/MM/yyyy'
      );
      this.InputsFilter.P_DATEEND = this.datePipe.transform(
        this.bsValueFin,
        'dd/MM/yyyy'
      );
      this.npage = 0;
    }
  }

  VerHistorial(nid_commlot) {
    this.childModalHistorial.show();
    this.commlotFilter.NIDCOMMLOT = nid_commlot;
    this.comisLotService.getCommissionLotHist(this.commlotFilter).subscribe(
      (data: Array<CommissionLotHist>) => {
        this.ListCommissionLotHist = data;
        if (this.ListCommissionLotHist.length > 0) {
          this.nLote = this.ListCommissionLotHist[0].niD_COMMLOT.toString();
        }
        this.emissionService
          .registrarEvento('', EventStrings.COMMLOT_VERHISTORIAL)
          .subscribe();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  validateEnviar() {
    this.flagAlerta = false;
    if (this.nidStateApprob === 0 || this.nidStateApprob === undefined) {
      this.flagAlerta = true;
      this.mensajes_validacion = ['!Debe seleccionar un estado!', ''];
      this.bopacitysave = false;
      return false;
    } else if (
      +this.InputsFilter.P_NSTATE === 9 &&
      this.strObservacion.length === 0
    ) {
      this.flagAlerta = true;
      this.mensajes_validacion = [
        '!Para devolver un lote debe agregar una observación!',
        '',
      ];
      this.bopacitysave = false;
      return false;
    }
    return true;
  }

  saveEnviar() {
    this.bopacitysave = true;

    if (this.validateEnviar()) {
      const lote: any = this.selectedLot;
      const obj = new CommissionLotFilter(
        '',
        '',
        1,
        '',
        0,
        '',
        0,
        0,
        '',
        '',
        0,
        0,
        0,
        '',
        0,
        0,
        0,
        0,
        0,
        0,
        0
      );
      obj.NIDCOMMLOT = lote.idLote;
      obj.NIDSTATUS = this.InputsFilter.P_NSTATE;
      obj.SOBSERVATION =
        +this.InputsFilter.P_NSTATE === 9
          ? 'DEVUELTO: ' + this.strObservacion
          : this.strObservacion;
      obj.NUSERREGISTER = this.idUser;
      obj.SBRANCH = lote.idRamo;
      obj.SPRODUCT = lote.idProducto;
      this.spinner.show();
      this.comisLotService.updCommissionLotState(obj).subscribe(
        (data) => {
          this.spinner.hide();
          this.resultvalidate = data;
          if (this.resultvalidate.nidcommlot === 0) {
            this.flagAlerta = true;
            this.mensajes_validacion =
              this.resultvalidate.sobservation.split('|');
            this.bopacitysave = false;
            return false;
          }
          this.InputsFilter.P_NSTATE = this.ListStateID; // alex gavidia
          this.bopacitysave = false;
          this.childModalConfirmarEnvio.hide();
          if (+this.InputsFilter.P_NSTATE === 1) {
            this.messageinfo =
              'Se envió el lote Nro: ' +
              obj.NIDCOMMLOT +
              'al canal correspondiente.';
          } else if (+this.InputsFilter.P_NSTATE === 9) {
            this.messageinfo =
              'Se devolvió el lote Nro: ' + obj.NIDCOMMLOT + '.';
          } else {
            this.messageinfo =
              'Se envió el lote Nro: ' + obj.NIDCOMMLOT + ', para evaluación.';
          }
          this.research = true;
          this.childModal.show();
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.bopacitysave = false;
          this.spinner.hide();
        }
      );
    }
  }

  openModalConfirmacionMasivo() {
    let arrayDiferentesPendiente = '';
    let countIdCommissionLot = 0;
    this.commissionLotList.items.forEach((element) => {
      if (element.selected) {
        countIdCommissionLot++;
        if (
          !(
            element.idEstado == 1 ||
            element.idEstado == 3 ||
            element.idEstado == 9
          )
        ) {
          arrayDiferentesPendiente += Number(element.idLote).toString() + ',';
        } else {
          this.arrayIdCommissionLot += Number(element.idLote).toString() + ',';
        }
      }
    });

    if (countIdCommissionLot === 0) {
      this.messageinfo = 'Por favor, debe de seleccionar un Lote de Comisión.';
      this.childModal.show();
      return;
    }

    if (arrayDiferentesPendiente.length > 0) {
      arrayDiferentesPendiente = arrayDiferentesPendiente.slice(0, -1);
      if (arrayDiferentesPendiente.split(',').length === 1) {
        this.messageinfo =
          'No se pudo realizar la anulación, debido a que el siguiente Lote de Comisión: ' +
          arrayDiferentesPendiente +
          ' no tiene el estado correcto';
      } else {
        this.messageinfo =
          'No se pudo realizar la anulación masiva, debido a que, los siguientes Lotes de Comisión: ' +
          arrayDiferentesPendiente +
          ' no tienen el estado correcto';
      }
      this.childModal.show();
      return;
    }

    this.msjHeader =
      countIdCommissionLot > 1
        ? '¿Esta seguro de anular los lotes seleccionados?'
        : '¿Está seguro de anular el lote?';
    this.bHideBody = true;
    this.flagConfirmacion = 'anulacionmasivo';
    this.childModalConfirmasivo.show();
  }

  closeconfirm(): void {
    this.childModalConfirmasivo.hide();
  }

  closeHistorial(): void {
    this.childModalHistorial.hide();
  }

  pageChanged(event: any): void {
    this.paginacion.npage = event.page;
  }

  // Obtener estados
  onGetLstState() {
    let StateChannel;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tipoCanal = +currentUser.tipoCanal;
    if (tipoCanal === 5) {
      StateChannel = new CommissionLotState(1, '', 0, 0);
    } else {
      StateChannel = new CommissionLotState(0, '', 0, 0);
    }
    this.comisLotService.getCommissionLotState(StateChannel).subscribe(
      (data: Array<CommissionLotState>) => {
        this.lstStateCommission = data;

        this.lstStateCommission.forEach((element) => {
          this.ListStateID += element.nidstate + ',';
        });

        if (this.lstStateCommission.length > 1) {
          this.lstStateCommission.unshift({
            nidstate: 0,
            sdescription: 'TODOS',
            nchanneltype: 0,
            niD_ESTTABLE_ANT: 0,
          });
          this.formFilterControl['state'].setValue(0);
        }

        this.ListStateID = this.ListStateID.slice(0, -1);
        this.InputsFilter.P_NSTATE = this.ListStateID;
        // this.onEventSearch();
      },
      (error) => {}
    );
  }

  evaluateLock() {
    this.textSbs = 'Habilitado';
    this.bloqueoVentas = true;
    this.mensajeBloqueo = '';

    this.comisLotService
      .getCanalTipoPago(this.canalHist.toString(), AppConfig.SETTINGS_SALE)
      .subscribe(
        (res) => {
          if (res != null) {
            this.bSbs = Number(res['sbs']) === 1 ? true : false;
            this.textSbs = this.bSbs ? 'Habilitado' : 'Inhabilitado';

            if (!this.bSbs) {
              this.mensajeBloqueo = `Estimado socio de negocio, para la ejecución de pago de tus comisiones es necesario que el estado ante la SBS sea 'Habilitado', de no ser así será necesario que gestiones la regularización para continuar con el proceso`;
            }

            this.bNotificaMailBroker =
              Number(res['navisomailfact']) === 1 ? true : false;
            if (!this.bNotificaMailBroker) {
              this.childModalCorreo.show();
            }
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error);
        }
      );
  }

  onGetLstStateApp(id, idstate, idbranch, sbillnum) {
    let lstStates;
    const commlotfilter = new CommissionLotState(
      0,
      '',
      this.tipoCanal,
      idstate
    );

    this.comisLotService.getCommissionLotStateApprob(commlotfilter).subscribe(
      (data: Array<CommissionLotState>) => {
        if (idbranch === 66) {
          this.lstStateApprobCommission = data;
          if (idbranch === 66 && idstate === 1) {
            this.lstStateApprobCommission =
              this.lstStateApprobCommission.filter((x) => x.nidstate !== 9);
          }
        } else {
          lstStates = <CommissionLotState[]>data;
          if (sbillnum !== null || (idbranch === 66 && idstate === 2)) {
            this.lstStateApprobCommission = lstStates.filter(
              (x) => x.nidstate !== 9
            );
          } else {
            this.lstStateApprobCommission = lstStates.map((x) => {
              if (x.nidstate === 9) {
                x.sdescription = 'DEVOLVER';
              }
              return x;
            });
          }
        }

        if (this.lstStateApprobCommission.length > 0) {
          this.childModalConfirmarEnvio.show();
          this.commissionLotID = id;
          this.stateID = idstate;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  onGetLstBranch() {
    const tableType = new TableType(0, '', 0);

    this.comisLotService.getBranch(tableType).subscribe(
      (data: Array<TableType>) => {
        this.lstBranch = data;
        this.lstBranch = this.lstBranch.filter((x) => x.nid !== 82);

        if (this.lstBranch.length === 1) {
          this.InputsFilter.P_NBRANCH = this.lstBranch[0].nid;
        } else {
          this.lstBranch.unshift({
            nid: 0,
            sdescript: 'TODOS',
            typeuser: 0,
          });

          this.InputsFilter.P_NBRANCH = 0;
          this.branchId = this.InputsFilter.P_NBRANCH;
        }

        this.formFilterControl['branch'].setValue(+this.InputsFilter.P_NBRANCH);
        this.onSearch(true);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  EnviarCommLot(
    id: number,
    nidstate: number,
    nidbranch: number,
    sbillnum: string,
    obj: any
  ): void {
    this.selectedLot = obj;
    this.strObservacion = '';
    this.nidStateApprob = 0;
    this.flagAlerta = false;
    this.onGetLstStateApp(id, nidstate, nidbranch, sbillnum);
  }

  ActualizarLote(idlot: number, idstate: number, idbranch: number): void {
    this.router.navigate([
      'broker/commissionlot-add',
      'upd',
      idlot,
      idstate,
      idbranch,
    ]);
    window.scrollTo(0, 0);
  }

  setAgregarLote() {
    this.router.navigate(['broker/commissionlot-add', 'add', 0, 0, 0]);
    window.scrollTo(0, 0);
  }

  aceptarmsginfo() {
    this.childModal.hide();
    if (this.research) {
      this.onSearch();
    }
    this.research = false;
  }

  btnAnularPayrollMasivo() {
    // tslint:disable-next-line: max-line-length
    const payrollCab = new CommissionLot(
      '01/01/2017',
      '31/12/2017',
      this.canalHist,
      '',
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      '',
      0,
      0,
      0,
      '',
      '',
      0,
      '',
      0,
      '',
      0,
      0,
      0,
      '',
      '',
      0,
      0,
      false,
      0,
      ''
    );

    payrollCab.NIDCOMMLOTLIST = this.arrayIdCommissionLot;
    this.comisLotService.getPostAnularLote(payrollCab).subscribe(
      (data: any) => {
        this.messageinfo = data.noutidcommlot;
        this.childModal.show();
        this.selectedAll = false;
        this.arrayIdCommissionLot = ''; // ALEX GAVIDIA
        this.childModalConfirmasivo.hide();
        this.research = true;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.childModalConfirmasivo.hide();
      }
    );
  }

  // Pendiente el envio a exactus
  btnEnviarExactusLote() {
    const lotExactus = new CommissionLotExactus(0, '', 0);
    lotExactus.NID_COMMLOT = this.IdCommLot;
    lotExactus.SMENSAJE = this.sPRoduct;
    lotExactus.NRpta = this.IdBranch;
    let result: any = {};
    this.comisLotService.getPostEnviarExactus(lotExactus).subscribe(
      (data) => {
        result = data;
        this.messageinfo = result.smensaje;
        this.childModalConfirmasivo.hide();
        this.childModal.show();
        this.selectedAll = false;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.childModalConfirmasivo.hide();
      }
    );
  }

  onSelectState(StateID) {
    if (StateID === '0') {
      this.InputsFilter.P_NSTATE = this.ListStateID;
      return;
    }

    this.InputsFilter.P_NSTATE = StateID;
  }

  onSelectBranch(BranchID) {
    this.lstProduct = [];
    this.InputsFilter.P_NPRODUCT = 0;
    this.InputsFilter.P_NBRANCH = +BranchID;
    if (+BranchID !== 66) {
      this.InputsFilter.P_NIDPAYROLL = '';
      this.showfilterNPAYROL = true;
    } else {
      this.showfilterNPAYROL = false;
    }
  }

  onSelectProduct(ProductID) {
    if (ProductID === '0') {
      this.InputsFilter.P_NPRODUCT = 0;
    } else {
      this.InputsFilter.P_NPRODUCT = ProductID;
    }
  }

  confirmEnviar() {
    // this.router.navigate(['broker/commissionlot-add', 'send', this.commissionLotID, this.stateID]);
    this.onEventSearch();
    this.childModalConfirmarEnvio.hide();
  }

  closeEnviar() {
    this.childModalConfirmarEnvio.hide();
  }

  onImprimir(id: number, type: string) {
    this.spinner.show();
    this.comisLotService.generarLotePdf(+id, type).subscribe(
      (res) => {
        const obj = <DownloadDto>res;
        if (obj.success === true && obj.file) {
          this.utilsService.downloadFile({
            fileName: `report_${new Date().getTime()}.pdf`,
            fileBase64: obj.file,
          });
        }

        this.spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  downloadAttachments(id: string, type: string): void {
    this.spinner.show();

    this.comisLotService.downloadAttachments(id, type).subscribe(
      (res) => {
        const dataResponse = res;
        this.spinner.hide();

        if(!dataResponse.success) {
            return;
        }

        this.utilsService.downloadFile({
            fileName: dataResponse.nombreArchivo,
            fileBase64: dataResponse.archivo,
        });
        
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  downloadPdf(fileName: string) {
    const url = `${AppConfig.PATH_PDF_FILES}/${fileName}`;
    const a = document.createElement('a');

    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('style', 'display:none;');

    document.body.appendChild(a);

    a.click();
    a.remove();
  }

  onSelectChannelSales(channelSalesId) {
    if (channelSalesId === '0') {
      this.InputsFilter.P_SCODCHANNEL = this.canalHist;
    } else {
      this.InputsFilter.P_SCODCHANNEL = channelSalesId;
    }
  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;

    if (currentUser.profileId == 20 || currentUser.profileId == 28) {
      this.channelSales = new ChannelSales(0, '0', '');
    } else {
      this.channelSales = new ChannelSales(nusercode, '0', '');
    }

    this.spinner.show();
    this.channelSalesService.getPostChannelSales(this.channelSales).subscribe(
      (data) => {
        this.spinner.hide();
        this.ListChannelSales = <any[]>data;

        this.showfilterChannel = this.ListChannelSales.length === 1;

        if (AppConfig.FILTER_CHANNEL_ONLY_BROKER.res) {
          this.ListChannelSales = this.ListChannelSales.filter(
            (x) =>
              x.nchannel.toString() ===
              AppConfig.FILTER_CHANNEL_ONLY_BROKER.channel?.toString()
          );
        }

        this.ListChannelSales = this.ListChannelSales.map((value: any) => ({
          id: +value.nchannel,
          description: value.sdescript.trim(),
        }));

        this.formFilterControl['salesChannel'].setValue(
          +this.currentUser['canal']
        );

        this.onGetCurency();
        this.onGetLstBranch();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  onGetCurency() {
    const tableType = new TableType(0, '', this.tipoCanal);

    this.comisLotService.getCurrency(tableType).subscribe(
      (data) => {
        this.lstCurrency = <Currency[]>data;
        this.lstCurrency.forEach((element) => {
          this.ListCurrencyID += element.nidcurrency + ',';
        });
        this.currencyId = 1;
        this.InputsFilter.ncurrency = this.currencyId;
        this.ListCurrencyID = this.ListCurrencyID.slice(0, -1);
        this.formFilterControl['currency'].setValue(1);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  onSelectCurrency(CurrencyID) {
    this.InputsFilter.ncurrency = +CurrencyID;
  }

  onGetLstProducts(branchId) {
    if (!+branchId) {
      this.lstProduct = [];
      this.lstProduct.unshift({
        id: 0,
        description: 'TODOS',
      });
      this.formFilterControl['product'].setValue(0);
      return;
    }

    this.spinner.show();
    const tableType = new TableType(branchId, '', this.tipoCanal);

    this.comisLotService.getProduct(tableType).subscribe(
      (data: Array<TableType>) => {
        this.spinner.hide();

        this.lstProduct = data.map((value: any) => ({
          id: +value.nid,
          description: value.sdescript.trim(),
        }));

        if (this.lstProduct.length === 1) {
          this.InputsFilter.P_NPRODUCT = this.productId = this.lstProduct[0].id;

          this.formFilterControl['product'].setValue(
            +this.InputsFilter.P_NPRODUCT
          );
          return;
        }

        this.lstProduct.unshift({
          id: 0,
          description: 'Todos',
        });

        this.InputsFilter.P_NPRODUCT = 0;
        this.formFilterControl['product'].setValue(0);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  ocultarNotificacionMail() {
    if (!this.bNotificaMailBroker) {
      this.actualizarFlagNotificaciones();
      this.childModalCorreo.hide();
      this.bNotificaMailBroker = !this.bNotificaMailBroker;
    } else {
      if (RegularExpressions.email.test(this.mailOld.toString())) {
        this.messageErrorMail = '';
        if (this.mailOld !== this.emailbroker) {
          if (!isNullOrUndefined(this.mailOld) && this.mailOld !== '') {
            this.updMailFacturacion();
          } else {
            this.mailOld = this.emailbroker;
          }
        }
        this.childModalCorreo.hide();
      } else {
        this.messageErrorMail = 'Formato de correo inválido.';
      }
    }
  }

  ActualizarMail(mailActual) {
    this.mailOld = mailActual;
    this.showMail = true;
    this.headMailBroker = 'Actualización de Correo';
    this.messageMail = 'Ingrese su nuevo correo para facturación';
    this.childModalCorreo.show();
  }

  actualizarFlagNotificaciones() {
    this.setting_pay = AppConfig.SETTINGS_SALE;
    this.comisLotService
      .getUpdateNotifMail(this.canalHist.toString(), this.setting_pay)
      .subscribe(
        (response) => {},
        (error: HttpErrorResponse) => {
          console.error(error);
        }
      );
  }

  getMailFacturacion() {
    this.comisLotService
      .getMailFacturacion(this.canalHist.toString())
      .subscribe(
        (res) => {
          if (+res['correoCanal'].result !== 0) {
            this.emailbroker = res['correoCanal'].result;
          } else {
            this.emailbroker = 'No existe correo asociado';
          }
          this.mailOld = this.emailbroker;
          this.showMail = false;
          this.messageMail =
            'Se tomará la siguiente dirección electrónica como correo de ' +
            'facturación para notificaciones futuras. Si desea modificarlo, puede hacerlo más adelante.';
          this.headMailBroker = 'Notificación Importante';
        },
        (error: HttpErrorResponse) => {
          console.error(error);
        }
      );
  }

  updMailFacturacion() {
    this.comisLotService
      .updMailFacturacion(this.canalHist.toString(), this.mailOld)
      .subscribe(
        (res) => {
          if (res['resultupd'].result) {
            this.emailbroker = this.mailOld;
          } else {
            this.emailbroker = 'No se pudo actualizar.';
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error);
        }
      );
  }

  closeModalCorreo() {
    this.messageErrorMail = '';
    this.childModalCorreo.hide();
  }

  changeNumLote(e, numLote): void {
    this.InputsFilter.NID_COMMLOT = numLote === '' ? 0 : numLote;
    this.utilityService._kpPolicy(e, numLote);
  }

  /* CONJUNTO DE ACCIONES */
  showActionsCargaMasiva(id: any, index: any): void {
    const table = document.getElementById('table-scroll');
    const html = document.getElementById('actions' + id);
    if (html.hidden === true) {
      this.hideAllMenusActions();
      html.hidden = false;
      html.style.top = '0';
      document.getElementById('row' + id).style.background =
        'rgba(170, 158, 192, 0.25)';

      if (table.scrollHeight - table.clientHeight > 0 && index >= 3) {
        html.style.top = '-127px';
      } else {
        html.style.top = '0';
      }
    } else {
      html.hidden = true;
      html.style.top = '0';
      document.getElementById('row' + id).style.background = '#fff';
    }
  }

  hideAllMenusActions(): void {
    this.ListCommissionLot.forEach((e) => {
      const el = document.getElementById('actions' + e.niD_COMMLOT);
      el.hidden = true;
      el.style.top = '0';
      document.getElementById('row' + e.niD_COMMLOT).style.background = '#fff';
    });
  }

  // *Remake Lote de comisiones
  resetFormFilters(): void {
    this.formFilterControl['startDate'].setValue(new Date('01-01-2020'));
    this.formFilterControl['endDate'].setValue(new Date());
    this.formFilterControl['salesChannel'].setValue(+this.currentUser['canal']);
    this.formFilterControl['branch'].setValue(0);
    this.formFilterControl['product'].setValue(0);
    this.formFilterControl['lot'].setValue('');
    this.formFilterControl['policy'].setValue('');
    this.formFilterControl['state'].setValue(0);
    this.formFilterControl['payroll'].setValue('');
    this.formFilterControl['currency'].setValue(1);

    if (this.lstBranch.length) {
      this.currentPageComissionLot = 1;
    }
  }

  valueChangesFormFilters(): void {
    this.formFilterControl['branch'].valueChanges.subscribe((value: string) => {
      this.onGetLstProducts(value);
    });

    this.formFilterControl['lot'].valueChanges.subscribe((value: string) => {
      if (this.formFilterControl['lot'].hasError('pattern')) {
        this.formFilterControl['lot'].setValue(
          value.slice(0, value.length - 1)
        );
      }
    });

    this.formFilterControl['policy'].valueChanges.subscribe((value: string) => {
      if (this.formFilterControl['policy'].hasError('pattern')) {
        this.formFilterControl['policy'].setValue(
          value.slice(0, value.length - 1)
        );
      }
    });

    this.formFilterControl['payroll'].valueChanges.subscribe(
      (value: string) => {
        if (this.formFilterControl['payroll'].hasError('pattern')) {
          this.formFilterControl['payroll'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  /* DESCARGAR EXCEL */
  descargarExcel(idlot) {
    this.spinner.show();
    const datos = new descargarExcel(idlot, 0, 0);
    this.comisLotService.descargarExcel(datos).subscribe(
      (res) => {
        this.spinner.hide();
        this.datosD = <datosExcel>res;

        if (!this.datosD?.detalleLote?.length) {
          return;
        }

        this.lot = this.datosD.listcommissionlotdetail;

        const payload: IExportExcel = {
          fileName: 'reporte-comisiones',
          data: this.datosD.detalleLote
            .map((item: any) => ({
              ...item,
              primaTotal: item.primaTotal
                ? (+item.primaTotal.replace(',', '.')).toFixed(2)
                : '-',
              primaNeta: item.primaNeta
                ? (+item.primaNeta.replace(',', '.')).toFixed(2)
                : '-',
              porcentajeComision: item.porcentajeComision
                ? (+item.porcentajeComision.replace(',', '.')).toFixed(2)
                : '-',
              montoComisionNeta: item.montoComisionNeta
                ? (+item.montoComisionNeta.replace(',', '.')).toFixed(2)
                : '-',
              igv: item.igv ? (+item.igv.replace(',', '.')).toFixed(2) : '-',
              montoComisionTotal: item.montoComisionTotal
                ? (+item.montoComisionTotal.replace(',', '.')).toFixed(2)
                : '-',
            }))
            .map((item: any) => ({
              'Nro. Lote': item.idLote,
              Ramo: item.ramo,
              Producto: item.producto,
              Canal: item.canal,
              Póliza: item.numeroPoliza,
              'Número de recibo': item.numeroRecibo,
              'Fecha de creación de Lote': moment(
                item.fechaLote,
                'DD/MM/YYYY'
              ).toDate(),
              'Nro. Comprobante': item.comprobante,
              'Fecha de emisión de comprobante': moment(
                item.fechaComprobante,
                'DD/MM/YYYY'
              ).toDate(),
              'Fecha de pago': moment(item.fechaPago, 'DD/MM/YYYY').toDate(),
              'Prima total': +item.primaTotal,
              'Prima neta': +item.primaNeta,
              'Porcentaje de comisión': +item.porcentajeComision,
              'Comisión Neta': +item.montoComisionNeta,
              IGV: +item.igv,
              'Comisión total': +item.montoComisionTotal,
            })),
        };
        this.utilsService.exportExcel(payload);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  onSearch(resetPage = false): void {
    if (resetPage) {
      this.currentPageComissionLot = 1;
      return;
    }

    const payload = {
      idCanal: this.formFilterControl['salesChannel'].value,
      idRamo: this.formFilterControl['branch'].value || 0,
      idProducto: this.formFilterControl['product'].value || 0,
      idLoteComision: this.formFilterControl['lot'].value || 0,
      poliza: this.formFilterControl['policy'].value || 0,
      idEstado: this.formFilterControl['state'].value,
      idPlanilla: this.formFilterControl['payroll'].value || 0,
      idMoneda: this.formFilterControl['currency'].value || 0,
      fechaInicio: moment(this.formFilterControl['startDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFilterControl['endDate'].value).format(
        'DD/MM/YYYY'
      ),
      indice: this.currentPageComissionLot,
      cantidadRegistros: 10,
      checkedAll: this.commissionLotListIsEverySelected,
    };

    this.commissionLotList = {};
    this.spinner.show();
    this.commissionLotService.getCommissionLotList(payload).subscribe({
      next: (response) => {
        this.commissionLotList = response;
        this.emissionService
          .registrarEvento('', EventStrings.COMMLOT_BUSCAR)
          .subscribe();
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

  exportExcel(): void {
    this.spinner.show();

    const payload = {
      idCanal: this.formFilterControl['salesChannel'].value,
      idRamo: this.formFilterControl['branch'].value || 0,
      idProducto: this.formFilterControl['product'].value || 0,
      idLoteComision: this.formFilterControl['lot'].value || 0,
      poliza: this.formFilterControl['policy'].value || 0,
      idEstado: this.formFilterControl['state'].value,
      idPlanilla: this.formFilterControl['payroll'].value || 0,
      idMoneda: this.formFilterControl['currency'].value || 0,
      fechaInicio: moment(this.formFilterControl['startDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFilterControl['endDate'].value).format(
        'DD/MM/YYYY'
      ),
      indice: 1,
      cantidadRegistros: this.commissionLotList.totalItems,
    };
    this.commissionLotService.getCommissionLotList(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.utilsService.exportExcel({
            fileName: 'LOTE_COMISIONES',
            data: response.items.map((obj: any) => ({
              'Nro. Lote': obj.idLote,
              Ramo: obj.ramo,
              Producto: obj.producto,
              'N° de Comisiones': +obj.cantidadComisiones,
              Fecha: obj.fechaLote,
              Moneda: obj.moneda,
              'Comisión neta variable': +obj.comisionNeta || 0,
              'Comisión neta grossup': +obj.comisionGrossUp || 0,
              'Comisión total': +obj.comisionTotal || 0,
              Estado: obj.estado,
              'N° Facturación Lote': obj.facturaLote,
            })),
          });
        }
      },
      error: (error: any) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  commisionLotCheck(data: any): void {
    data.selected = !data.selected;
  }

  commisionLotCheckAll(checked): void {
    if (!this.commissionLotList.items?.length) {
      return;
    }

    this.commissionLotList.items = this.commissionLotList.items.map(
      (obj: any) => ({
        ...obj,
        selected: checked,
      })
    );
  }

  get commissionLotListIsEverySelected(): boolean {
    return (this.commissionLotList.items ?? []).length > 0
      ? (this.commissionLotList.items ?? []).every((x) => x.selected)
      : false;
  }

  get commissionLotListIsSomeSelected(): boolean {
    return (this.commissionLotList.items ?? []).length > 0
      ? (this.commissionLotList.items ?? []).some((x) => x.selected)
      : false;
  }

  downloadManual(): void {
    this.spinner.show();
    this.utilsService
      .fetchResource(
        'assets/pdfs/manual-lote-comisiones-v1.0.pdf',
        'arraybuffer'
      )
      .subscribe({
        next: (response: ArrayBuffer) => {
          this.utilsService.downloadFile({
            fileName: 'manual-lote-comisiones-v1.0.pdf',
            file: response,
          });
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

  openModalConfirmCancelLot(data: any): void {
    this.selectedLot = data;
    this.vc.createEmbeddedView(this.modalConfirmCancelLot);
  }

  closeModals(): void {
    this.vc.clear();
    if (this.research) {
      this.onSearch();
    }
    this.research = false;
  }

  cancelLot(): void {
    this.spinner.show();

    const payload = {
      lotId: this.selectedLot.idLote,
      userId: this.currentUser['id'],
    };

    this.research = false;
    this.commissionLotService.cancelLot(payload).subscribe({
      next: (response: any) => {
        this.closeModals();

        if (response.success) {
          this.messageinfo = `El lote N° ${this.selectedLot.idLote} se anuló correctamente`;
          this.childModal.show();
          this.research = true;
          return;
        }

        this.messageinfo = `Ocurrió un error al intentar anular el lote N° ${this.selectedLot.idLote}`;
        this.childModal.show();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.closeModals();

        this.messageinfo = `Ocurrió un error al intentar anular el lote N° ${this.selectedLot.idLote}`;
        this.childModal.show();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
}
