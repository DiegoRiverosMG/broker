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

defineLocale('es', esLocale);

@Component({
  selector: 'app-payroll-kuntur',
  templateUrl: './payroll-kuntur.component.html',
  styleUrls: ['./payroll-kuntur.component.css'],
})
export class PayrollKunturComponent implements OnInit {
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('childModalConfirmasivo', { static: true })
  childModalConfirmasivo: ModalDirective;
  @ViewChild('childModalConfirmarEnvio', { static: true })
  childModalConfirmarEnvio: ModalDirective;
  @ViewChild('childModalEliminarIndividual', { static: true })
  childModalEliminarIndividual: ModalDirective;
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
  // ObjPayroll = new Payroll('01/01/2017', '31/12/2017', 0, 0, '', '', 0, 0, 0, 0, '', '', '', '', 0, 0, 0, 0, false, '', '', 0);
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
  maxSize = 5;
  public itemsPerPage = 5;
  public totalItems = 0;
  public tipoCanal = 0;
  fecha = new Date();
  dia = this.fecha.getDate();
  mes = this.fecha.getMonth() === 0 ? 1 : this.fecha.getMonth();
  anio = this.fecha.getFullYear();
  bsValueIni: Date = new Date(this.anio + '-' + this.mes + '-' + this.dia);
  bsValueFin: Date = new Date();
  ListStateID = '';
  ListCodChannel = '';
  ListPayroll: Payroll[];
  ListPayrollExport: Payroll[];
  arrayIdPayroll = '';
  ListChannelSales: any[];
  channelSales: ChannelSales;
  public lstStateChannel: StateChannelType[];
  planillaBuscar = '';
  concpayroll = new ConcPayroll(0, 0, '', 0, '', 0, '');
  public result: any = {};
  @ViewChild('myButton') myButton: ElementRef;
  node: string;
  planillaID: number;
  stateID: number;
  strMedioPago: string;
  strFechaEliminar: string;

  constructor(
    private payrollService: PayrollService,
    private service: StateService,
    private router: Router,
    private datePipe: DatePipe,
    public utilityService: UtilityService,
    private excelService: ExcelService,
    private channelSalesService: ChannelSalesService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: false,
      }
    );
    this.InputsFilter.P_DATEBEGIN = '';
    this.InputsFilter.P_DATEEND = '';
    this.InputsFilter.P_NIDPAYROLL = '';
    this.InputsFilter.P_NSTATE = 0;
    this.InputsFilter.NAMOUNTTOTAL = 0;
    this.InputsFilter.NQUANTITY = 0;
    this.InputsFilter.NIDPAYROLL = 0;
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.tipoCanal = +currentUser.tipoCanal;
    this.onGetLstState();
    this.LoadChannelSales();
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
        this.onEventSearch();
      },
      (error) => {}
    );
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

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
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

    this.payrollService.getPostListPayroll(this.ObjPayroll).subscribe(
      (data) => {
        this.ListPayrollExport = <any[]>data;
        if (this.ListPayrollExport.length > 0) {
          this.excelService.exportReportPayroll(
            this.ListPayrollExport,
            'ReportePayRoll'
          );
        }
      },
      (err) => {}
    );
  }

  EventDownloadDetailPayroll(nid_payroll: number) {
    let ListCertificado = [];
    const payrollFilterCertificate = null; //new PayrollFilter('01/01/2017', '01/01/2019', 0, '2018000059', '', 0);
    payrollFilterCertificate.NIDPAYROLL = nid_payroll;
    this.payrollService.getDetailPayroll(payrollFilterCertificate).subscribe(
      (data) => {
        ListCertificado = <any[]>data;
        if (ListCertificado.length > 0) {
          this.excelService.exportReportDetailPayroll(
            ListCertificado,
            'ReporteDetailPayRoll'
          );
        } else {
          this.messageinfo = 'La planilla no tiene certificado';
          this.childModal.show();
        }
      },
      (error) => {}
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
    this.payrollService.getPostListPayroll(this.ObjPayroll).subscribe(
      (data) => {
        this.ListPayroll = <Payroll[]>data;
        if (this.ListPayroll.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = data[0].nrecorD_COUNT;
        } else {
          this.fExistRegistro = false;
          this.msgErrorLista = 'No se encontraron Registros..';
        }
      },
      (error) => {}
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
    const StateChannel = new StateChannelType(0, '', this.tipoCanal, 0);
    this.service.GetStatexChannelType(StateChannel).subscribe(
      (data) => {
        this.lstStateChannel = <StateChannelType[]>data;
        this.lstStateChannel.forEach((element) => {
          this.ListStateID += element.nidstate + ',';
        });
        this.ListStateID = this.ListStateID.slice(0, -1);
        this.InputsFilter.P_NSTATE = this.ListStateID;
        this.onEventSearch();
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
  ActualizarPlanilla(id: number): void {
    this.router.navigate(['broker/payrolladd', 'upd', id, 0]);
  }
  setAgregarPlanilla() {
    this.router.navigate(['broker/payrolladd', 'add', 0, 0]);
  }
  aceptarmsginfo() {
    this.childModal.hide();
  }
  btnAnularPayrollIndividual() {
    // const payrollCab = new PayrollCab(0, '', 0, '', 0, 0, 0, 0, [], [], '', '');
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
    this.payrollService.getPostAnularPlanilla(payrollCab).subscribe(
      (data) => {
        result = data;
        this.messageinfo = result.noutidpayroll;
        this.childModalEliminarIndividual.hide();
        this.childModal.show();
        this.onLoadPayroll();
      },
      (error) => {}
    );
  }
  btnAnularPayrollMasivo() {
    // const payrollCab = new PayrollCab(0, '', 0, '', 0, 0, 0, 0, [], [], '', '');
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
    this.payrollService.getPostAnularPlanilla(payrollCab).subscribe(
      (data) => {
        result = data;
        this.messageinfo = result.noutidpayroll;
        this.childModal.show();
        this.onLoadPayroll();
        this.selectedAll = false;
      },
      (error) => {}
    );
  }
  btnEnviarConciliarPlanilla() {
    this.concpayroll.NIDPAYROLL = this.IdPayroll;
    this.concpayroll.NIDSTATE = 1;
    this.payrollService.getPostConciliarPlanilla(this.concpayroll).subscribe(
      (data) => {
        this.result = data;
        this.messageinfo = this.result.noutidpayroll;
        this.childModal.show();
        this.onEventSearch();
      },
      (error) => {}
    );
  }

  onSelectState(StateID) {
    if (StateID === '0') {
      this.InputsFilter.P_NSTATE = this.ListStateID;
    } else {
      this.InputsFilter.P_NSTATE = StateID;
    }
  }

  onSelectChannel(Channel) {
    if (Channel === '0') {
      this.InputsFilter.P_NID_NCHANNELTYPE = this.ListCodChannel;
    } else {
      this.InputsFilter.P_NID_NCHANNELTYPE = Channel;
    }
  }

  confirmEnviar() {
    this.router.navigate([
      'broker/payrolladd',
      'send',
      this.planillaID,
      this.stateID,
    ]);
    this.childModalConfirmarEnvio.hide();
  }

  closeEnviar() {
    this.childModalConfirmarEnvio.hide();
  }
}
