import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { CampaignService } from '../../../services/campaign/campaign.service';
import { ExcelService } from '../../../../../shared/services/excel/excel.service';
import { DatePipe } from '@angular/common';
import { Campaign } from '../../../models/campaign/campaign';
import { CampaignFilter } from '../../../models/campaign/camaign-filter';
import { ModalDirective } from 'ngx-bootstrap/modal';

defineLocale('es', esLocale);
@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css']
})
export class CampaignListComponent implements OnInit {
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('childModalConfirmasivo', { static: true }) childModalConfirmasivo: ModalDirective;
  @ViewChild('childModalEliminarIndividual', { static: true })
  childModalEliminarIndividual: ModalDirective;

  channelSales: ChannelSales;
  ListChannelSales: any[];
  ListCodChannel = '';

  public bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  dia = this.fecha.getDate();
  mes = this.fecha.getMonth() == 0 ? 1 : this.fecha.getMonth();
  anio = this.fecha.getFullYear();
  bsValueIni: Date = new Date(this.anio + '-' + this.mes + '-' + this.dia);
  bsValueFin: Date = new Date();

  public Filter: any = {};
  public tipoCanal = 0;
  resultError = true;

  npage = 1;
  paginacion: any = {};
  public itemsPerPage = 5;
  public totalItems = 0;

  fExistRegistro: any = false;
  msgErrorLista = '';

  ListCampaign: Campaign[];
  ListCampaignExport: Campaign[];

  message: string;
  messageinfo: string;
  arrayIdCampaign = '';
  IdCampaign = '';
  flagConfirmacion: string;
  msjHeader: string;
  bHideBody: boolean;

  selectedAll: any;

  strIdCampaign: string;
  strCountPerson: string;
  strFechaInicio: string;
  strFechaFin: string;

  oDatePipe: DatePipe;

  public currentPage = 0;
  rotate = true;
  maxSize = 5;

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private channelSalesService: ChannelSalesService,
    private datePipe: DatePipe,
    private excelService: ExcelService
  ) {
    this.oDatePipe = datePipe;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true
      }
    );

    this.Filter.P_DATEBEGIN = '';
    this.Filter.P_DATEEND = '';
    this.Filter.P_DESCRIPCION = '';
    this.Filter.P_NSTATE = 0;

    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.npage = this.npage;
  }

  ngOnInit() {
    this.initComponent();
  }

  initComponent() {
    this.LoadChannelSales();
    this.onEventSearch();
  }

  LoadChannelSales(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;
    this.channelSales = new ChannelSales(nusercode, '0', '');
    this.channelSalesService.getPostChannelSales(this.channelSales).subscribe(
      data => {
        this.ListChannelSales = <any[]>data;
        this.ListChannelSales.forEach(element => {
          this.ListCodChannel += element.nchannel + ',';
        });
        this.ListCodChannel = this.ListCodChannel.slice(0, -1);
        this.Filter.P_NID_NCHANNEL = this.ListCodChannel;
      },
      error => {
        console.log(error);
      }
    );
  }

  onSelectChannel(Channel) {
    if (Channel === '0') {
      this.Filter.P_NID_NCHANNEL = this.ListCodChannel;
    } else {
      this.Filter.P_NID_NCHANNEL = Channel;
    }
  }

  onSelectState(State) {
    if (State === '0') {
      this.Filter.P_NSTATE = 0;
    } else {
      this.Filter.P_NSTATE = State;
    }
  }

  onEventSearch() {
    this.Filter.P_DATEBEGIN = this.datePipe.transform(
      this.bsValueIni,
      'dd/MM/yyyy'
    );
    this.Filter.P_DATEEND = this.datePipe.transform(
      this.bsValueFin,
      'dd/MM/yyyy'
    );
    this.npage = 0;
    this.onLoadCampaign();
  }

  selectAll() {
    for (let i = 0; i < this.ListCampaign.length; i++) {
      this.ListCampaign[i].bselected = this.selectedAll;
    }
  }

  checkIfAllSelected() {
    this.ListCampaign.every(function (item: Campaign) {
      return item.bselected === true;
    });
  }

  onLoadCampaign() {
    const campaignFilter = new CampaignFilter(
      this.Filter.P_DATEBEGIN,
      this.Filter.P_DATEEND,
      this.Filter.P_DESCRIPCION,
      this.Filter.P_NSTATE,
      this.Filter.P_NID_NCHANNEL,
      this.paginacion.npage,
      this.paginacion.ItemsPerPage,
      ''
    );

    this.campaignService.getPostListCampaign(campaignFilter).subscribe(
      data => {
        this.ListCampaign = <Campaign[]>data;
        if (this.ListCampaign.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = data[0].nrecorD_COUNT;
        } else {
          this.fExistRegistro = false;
          this.msgErrorLista = 'No se encontraron Registros..';
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  pageChanged(event: any): void {
    this.paginacion.npage = event.page;
    this.onLoadCampaign();
  }

  EventDownload(event) {
    const campaignFilter = new CampaignFilter(
      this.Filter.P_DATEBEGIN,
      this.Filter.P_DATEEND,
      this.Filter.P_DESCRIPCION,
      this.Filter.P_NSTATE,
      this.Filter.P_NID_NCHANNEL,
      0,
      0,
      ''
    );

    this.campaignService.getPostListCampaign(campaignFilter).subscribe(
      data => {
        this.ListCampaignExport = <any[]>data;
        if (this.ListCampaignExport.length > 0) {
          this.excelService.exportReportCampaign(
            this.ListCampaignExport,
            'ReporteCampaign'
          );
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  openModalConfirmacionMasivo() {
    let arrayDiferentesPendiente = '';
    let countIdCampaign = 0;
    this.ListCampaign.forEach(element => {
      if (element.bselected === true) {
        countIdCampaign++;
        if (!(element.nstate === 1)) {
          arrayDiferentesPendiente += element.nidcampaign + ',';
        } else {
          this.arrayIdCampaign += element.nidcampaign + ',';
        }
      }
    });
    if (countIdCampaign === 0) {
      this.messageinfo = 'Por favor por lo menos seleccione una campaña';
      this.childModal.show();
    } else {
      if (arrayDiferentesPendiente.length > 0) {
        arrayDiferentesPendiente = arrayDiferentesPendiente.slice(0, -1);
        if (arrayDiferentesPendiente.split(',').length === 1) {
          this.messageinfo =
            'No se pudo realizar la anulación, debido a que la campaña : ' +
            arrayDiferentesPendiente +
            ' no tiene el estado correcto';
        } else {
          this.messageinfo =
            'No se pudo realizar la anulación masiva, debido a que las siguientes campañas: ' +
            arrayDiferentesPendiente +
            ' no tienen el estado correcto';
        }
        this.childModal.show();
      } else {
        this.msjHeader = 'Esta seguro de anular las campañas seleccionadas?';
        this.bHideBody = true;
        this.flagConfirmacion = 'anulacionmasivo';
        this.childModalConfirmasivo.show();
      }
    }
  }

  openModalConfirmacion(nidcampaign: string) {
    const elemento = this.ListCampaign.filter(
      e => e.nidcampaign.toString() == nidcampaign.toString()
    );
    this.childModalEliminarIndividual.show();
    this.msjHeader =
      'Esta seguro de anular la campaña ' + elemento[0].nidcampaign + ' ?';
    this.strIdCampaign = elemento[0].nidcampaign.toString();
    this.strCountPerson = elemento[0].ncountperson.toString();
    this.strFechaInicio = this.datePipe.transform(
      elemento[0].dstartdate,
      'dd/MM/yyyy'
    );
    this.strFechaFin = this.datePipe.transform(
      elemento[0].dexpirdate,
      'dd/MM/yyyy'
    );
    this.flagConfirmacion = 'anulacionindividual';
    this.IdCampaign = nidcampaign;
  }

  confirm(): void {
    if (this.flagConfirmacion === 'anulacionmasivo') {
      this.btnAnularCampaignMasivo();
    } else if (this.flagConfirmacion === 'anulacionindividual') {
      this.btnAnularCampaignIndividual();
    }
    this.childModalConfirmasivo.hide();
  }

  btnAnularCampaignIndividual() {
    const _campaign = new CampaignFilter('', '', '', 0, '', 0, 0, '');
    let result: any = {};
    _campaign.P_NIDCAMPAIGNLIST = this.IdCampaign;
    this.campaignService.getPostAnularCampaign(_campaign)
      .subscribe(
        data => {
          result = data;
          this.messageinfo = result.p_SMENSAJE;
          this.childModalEliminarIndividual.hide();
          this.childModal.show();
          this.onLoadCampaign();
        },
        error => {
          console.log(error);
        }
      );
  }

  btnAnularCampaignMasivo() {
    const _campaign = new CampaignFilter('', '', '', 0, '', 0, 0, '');
    let result: any = {};
    _campaign.P_NIDCAMPAIGNLIST = this.arrayIdCampaign;
    this.campaignService.getPostAnularCampaign(_campaign)
      .subscribe(
        data => {
          result = data;
          this.messageinfo = result.p_SMENSAJE;
          this.childModal.show();
          this.onLoadCampaign();
          this.selectedAll = false;
        },
        error => {
          console.log(error);
        }
      );
  }

  closeconfirm(): void {
    this.childModalConfirmasivo.hide();
  }

  closeconfirmIndividual(): void {
    this.childModalEliminarIndividual.hide();
  }

  aceptarmsginfo() {
    this.childModal.hide();
  }

  gotoCampaignAdd() {
    this.router.navigate(['broker/campaignadd', 'add', 0, 0]);
  }

  ActualizarCampaign(id: number): void {
    this.router.navigate(['broker/campaignadd', 'upd', id, 0]);
  }
}
