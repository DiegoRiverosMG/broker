import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from '../../../services/campaign/campaign.service';
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { DatePipe } from '@angular/common';
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { Campaign } from '../../../models/campaign/campaign';
import { CampaignPlan } from '../../../models/campaignplan/campaignplan';
import { CampaignRenov } from '../../../models/campaignrenov/campaignrenov';
import { Step03Service } from '../../../services/step03/step03.service';
import { ListaTipoDocumento } from '../../../models/documento/listatipodocumento';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CampaignAll } from '../../../models/campaignall/campaignall';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

defineLocale('es', esLocale);
@Component({
  selector: 'app-campaign-add',
  templateUrl: './campaign-add.component.html',
  styleUrls: ['./campaign-add.component.css']
})
export class CampaignAddComponent implements OnInit {
  @ViewChild('childModalConfirmasivo', { static: true }) childModalConfirmasivo: ModalDirective;
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  successMessageRenov: string;
  warningMessageRenov: string;
  channelSales: ChannelSales;
  ListChannelSales: any[];
  ListCodChannel = '';
  campaign: Campaign;
  paginacion: any = {};
  campaignPlan = new CampaignPlan(0, 0, 0, '', 0, '');
  campaignRenov = new CampaignRenov(0, 0, 0, '', '', '1', 0, '', false);
  ListaRenovacion: any[] = [];
  ListaCampaign: any = {};
  campaignAll = new CampaignAll(
    this.campaign,
    this.campaignPlan,
    this.ListaRenovacion
  );
  lengthDocument: number = 8;
  public bsConfig: Partial<BsDatepickerConfig>;
  tipoDocumento: string;
  bsValueIni: string;
  bsValueFin: string;
  ListaTipoDocumento: ListaTipoDocumento[] = [];
  bValidacion: boolean;
  flagModulo: string;
  message: string;
  messageinfo: string;
  fExistRegistro: any = false;
  public itemsPerPage = 5;
  public totalItems = 0;
  npage = 1;
  // Seleccion
  selectedAll: any;
  accion: string;
  id: number;
  eliminaRenovacionPorPlaca: string;
  constructor(
    private router: Router,
    private campaignService: CampaignService,
    private channelSalesService: ChannelSalesService,
    private step03service: Step03Service,
    public utilityService: UtilityService,
    private route: ActivatedRoute
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true
      }
    );
  }

  ngOnInit() {
    this.initComponent();
    this.campaign = new Campaign(
      0,
      0,
      0,
      '',
      new Date(),
      new Date(),
      '',
      0,
      '',
      false
    );

    this.accion = this.route.snapshot.paramMap.get('accion') || '';
    this.id = Number(this.route.snapshot.paramMap.get('id') || '');
    if (this.accion === 'upd') {
      // console.log('upd');
      this.campaign.nidcampaign = this.id;
      if (this.campaign.nidcampaign > 0) {
        this.getCampaignById();
        this.getCampaignPlan();
        this.getCampaignRenov();
      }
    } else if (this.accion === 'add') {
      this.campaign = new Campaign(0, 0, 0, '', null, null, '', 0, '', false);
    }
  }

  getCampaignById() {
    this.campaignService.getCampaignById(this.campaign).subscribe(
      data => {
        // console.log(data[0]);
        this.campaign = <Campaign>data[0];
        this.campaign.dstartdate = new Date(this.campaign.dstartdate);
        this.campaign.dexpirdate = new Date(this.campaign.dexpirdate);
      },
      error => {
        console.log(error);
      }
    );
  }

  getCampaignPlan() {
    this.campaignService.getCampaignPlan(this.campaign).subscribe(
      data => {
        // console.log(data[0]);
        this.campaignPlan = <CampaignPlan>data[0];
        // console.log(this.campaignPlan);
      },
      error => {
        console.log(error);
      }
    );
  }

  pageChanged(event: any): void {
    this.paginacion.npage = event.page;
    this.getCampaignRenov();
  }

  getCampaignRenov() {
    this.campaignService.getCampaignRenov(this.campaign).subscribe(
      data => {
        // console.log('renovacion');
        // console.log(data);
        this.ListaRenovacion = <CampaignRenov[]>data;

        if (this.ListaRenovacion.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = this.ListaRenovacion.length;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  initComponent() {
    this.LoadChannelSales();
    this.getListTipoDocumento('1');
  }

  getListTipoDocumento(id: string) {
    return this.step03service.getListTipoDocumento(id, '0').subscribe(
      result => {
        this.ListaTipoDocumento = result;
      },
      error => {
        console.log(<any>error);
      }
    );
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
        // this.Filter.P_NID_NCHANNEL = this.ListCodChannel;
      },
      error => {
        console.log(error);
      }
    );
  }

  validaRenov(sregist: string) {
    const index = this.ListaRenovacion.findIndex(
      item => item.sregist === sregist
    );
    if (index > -1) {
      return 0;
    } else {
      return 1;
    }
  }

  onChange(event) {
    this.tipoDocumento =
      event.target.options[event.target.options.selectedIndex].text;
    switch (this.tipoDocumento) {
      case 'DNI':
        if (this.campaignRenov.siddoc.length > 8) {
          this.campaignRenov.siddoc = '';
        }
        this.lengthDocument = 8;
        break;
      case 'RUC':
        if (this.campaignRenov.siddoc.length > 11) {
          this.campaignRenov.siddoc = '';
        }
        this.lengthDocument = 11;
        break;
      default:
        if (this.campaignRenov.siddoc.length > 13) {
          this.campaignRenov.siddoc = '';
        }
        this.lengthDocument = 13;
        break;
    }
  }

  validarDocumentos(tipoDoc: Number, numeroDoc: string, placa: string) {
    let Rpta: Boolean;
    switch (tipoDoc) {
      case 2:
        Rpta = numeroDoc.length === 8;
        if (!Rpta) {
          this.messageinfo = 'ERROR: DNI inválido faltan digitos';
          this.childModal.show();
          return false;
        }
        break;
      case 1:
        Rpta = numeroDoc.length === 11;
        if (!Rpta) {
          this.messageinfo = 'ERROR: RUC inválido faltan digitos';
          this.childModal.show();
          return false;
        }
        // let digIni: string;
        // digIni = numeroDoc.substr(0, 2);
        // if (digIni === "10" || digIni === "20" ) {
        // }
        break;
      case 4:
        Rpta = numeroDoc.length === 13;
        if (!Rpta) {
          this.messageinfo = 'ERROR: CE inválido faltan digitos';
          this.childModal.show();
          return false;
        }
      default:
        Rpta = true;
        break;
    }

    if (placa !== undefined && placa.length < 6) {
      this.messageinfo = 'ERROR: La placa debe tener 6 dígitos';
      this.childModal.show();
      Rpta = false;
    }
    return Rpta;
  }

  addCampaignRenov(tipoDoc: Number, numeroDoc: string, placa: string, origin) {
    placa = placa.toUpperCase();
    if (
      tipoDoc <= 0 ||
      numeroDoc.length <= 0 ||
      placa.length <= 0 ||
      origin <= 0
    ) {
      this.messageinfo =
        'ERROR: Ingrese correctamente todos los datos del cliente preferente';
      this.childModal.show();
      return;
    }

    if (this.validarDocumentos(tipoDoc, numeroDoc, placa)) {
      if (this.validaRenov(placa) === 1) {
        // Create obj
        this.campaignRenov = new CampaignRenov(
          0,
          0,
          0,
          numeroDoc,
          placa,
          '',
          1,
          '',
          false
        );
        // Servicio Validar Documentos
        this.campaignService.ValidarDocumentos(this.campaignRenov).subscribe(
          data => {
            // console.log('validate documents: ' + data);
            switch (Number(data)) {
              case 1:
                this.warningMessageRenov =
                  'El número de documento: ' +
                  numeroDoc +
                  ' ya existe en una campaña activa.';
                setTimeout(() => {
                  this.warningMessageRenov = null;
                }, 10000);
                break;
              case 2:
                this.warningMessageRenov =
                  'La placa: ' + placa + ' ya existe en una campaña activa.';
                setTimeout(() => {
                  this.warningMessageRenov = null;
                }, 10000);
                break;
              default:
                break;
            }
          },
          error => {
            console.log(error);
          }
        );

        this.ListaRenovacion.push({
          niddoc_type: tipoDoc,
          siddoc: numeroDoc,
          sregist: placa,
          sorigin: origin,
          stipodocumento: this.tipoDocumento
        });
        this.fExistRegistro = true;
        this.successMessageRenov = 'Se agregó correctamente.';

        setTimeout(() => {
          this.successMessageRenov = null;
        }, 3000);

        // console.log(this.ListaRenovacion);
        this.campaignRenov.sregist = '';
        this.campaignRenov.siddoc = '';
      } else {
        this.messageinfo = 'ERROR: Placa duplicada';
        this.childModal.show();
      }
    }
  }

  selectAll() {
    for (let i = 0; i < this.ListaRenovacion.length; i++) {
      this.ListaRenovacion[i].bselected = this.selectedAll;
    }
  }

  Validar() {
    if (
      this.campaign.dstartdate === undefined ||
      this.campaign.dstartdate === null
    ) {
      this.messageinfo = 'Ingrese fecha de inicio de vigencia.';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    const today = new Date(new Date().toDateString());

    if (this.accion === 'add') {
      const dateToBeCheckOut01 = new Date(
        this.campaign.dstartdate.toDateString()
      );
      if (dateToBeCheckOut01 < today) {
        this.messageinfo =
          'La fecha inicio de vigencia debe ser mayor o igual a la fecha actual.';
        this.childModal.show();
        return (this.bValidacion = false);
      }
    }

    if (
      this.campaign.dexpirdate === undefined ||
      this.campaign.dexpirdate === null
    ) {
      this.messageinfo = 'Ingrese fecha de fin de vigencia.';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    const dateToBeCheckOut02 = new Date(
      this.campaign.dexpirdate.toDateString()
    );

    if (dateToBeCheckOut02 <= today) {
      this.messageinfo =
        'La fecha fin de vigencia debe ser mayor a la fecha actual. (Mayor a 1 día cómo mínimo).';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    // console.log('Canal ' + this.campaign.scodchannel);
    if (
      this.campaign.scodchannel === undefined ||
      String(this.campaign.scodchannel) === '0'
    ) {
      this.messageinfo = 'Seleccione canal.';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    if (
      this.campaign.sdescript === undefined ||
      this.campaign.sdescript === ''
    ) {
      this.messageinfo = 'Ingrese descripción de la campaña.';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    if (this.campaignPlan.nplan === undefined || this.campaignPlan.nplan <= 0) {
      this.messageinfo = 'Ingrese número del plan.';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    if (
      this.campaignPlan.sdescriptplan === undefined ||
      this.campaignPlan.sdescriptplan === ''
    ) {
      this.messageinfo = 'Ingrese descripción del plan.';
      this.childModal.show();
      return (this.bValidacion = false);
    }

    if (
      this.ListaRenovacion === undefined ||
      this.ListaRenovacion.length === 0
    ) {
      this.messageinfo = 'Debe registrar un cliente preferente.';
      this.childModal.show();
      return (this.bValidacion = false);
    }
    return (this.bValidacion = true);
  }

  openModalGrabarTodo() {
    this.Validar();
    if (this.bValidacion === true) {
      this.flagModulo = 'GrabarTodo';

      this.message =
        this.accion === 'add'
          ? '¿Está seguro que desea grabar?'
          : '¿Está seguro que desea actualizar la campaña N° ' + this.id + '?';
      this.childModalConfirmasivo.show();
    }
  }

  openModalConfirDelRenov(sregist: string) {
    this.flagModulo = 'EliminaRenovacion';
    this.message = '¿Está seguro que desea eliminar a un cliente preferente?';
    this.eliminaRenovacionPorPlaca = sregist;
    this.childModalConfirmasivo.show();
  }

  openModalConfirRegresar() {
    this.flagModulo = 'Regresar';
    this.message = '¿Está seguro que desea regresar?';
    this.childModalConfirmasivo.show();
  }

  aceptarmsginfo() {
    this.childModal.hide();
    if (this.flagModulo === 'Redireccionar') {
      this.router.navigate(['broker/campaign']);
    }
  }

  GrabarTodo() {
    this.campaignAll = new CampaignAll(
      this.campaign,
      this.campaignPlan,
      this.ListaRenovacion
    );
    switch (this.accion) {
      case 'add':
        this.addPostCampaing();
        break;
      default:
        this.updPostCampaing();
        break;
    }
    // console.log(this.campaignAll);
  }

  addPostCampaing() {
    this.campaignService.addPostCampaign(this.campaignAll).subscribe(
      data => {
        // console.log(data);
        this.campaign = <Campaign>data;
        this.messageinfo = 'Se grabó correctamente la campaña';
        this.flagModulo = 'Redireccionar';
        this.childModal.show();
      },
      error => {
        console.log(error);
      }
    );
  }

  updPostCampaing() {
    this.campaignService.updPostCampaign(this.campaignAll).subscribe(
      () => {
        // console.log(data);
        this.messageinfo =
          'Se actualizó correctamente la campaña N° ' + this.id;
        this.flagModulo = 'Redireccionar';
        this.childModal.show();
      },
      error => {
        console.log(error);
      }
    );
  }

  confirm(): void {
    switch (this.flagModulo) {
      case 'GrabarTodo':
        this.GrabarTodo();
        break;
      case 'Regresar':
        this.router.navigate(['broker/campaign']);
        break;
      case 'EliminaRenovacion':
        this.deleteRenov();
        break;
      default:
        this.flagModulo = '';
        // this.router.navigate(['broker/commissionlot']);
        break;
    }
    this.childModalConfirmasivo.hide();
  }

  closeconfirm(): void {
    switch (this.flagModulo) {
      case 'GrabarTodo':
        this.flagModulo = '';
        // console.log("No grabar");
        break;
      default:
        this.flagModulo = '';
        break;
    }
    this.childModalConfirmasivo.hide();
  }

  deleteRenov() {
    const index = this.ListaRenovacion.findIndex(
      item => item.sregist === this.eliminaRenovacionPorPlaca
    );
    if (index > -1) {
      this.ListaRenovacion.splice(index, 1);
    }
  }
}
