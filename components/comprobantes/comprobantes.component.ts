import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '../../../../app.config';
import { setSerialNumber, sortArray } from '../../../../shared/helpers/utils';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { Comprobante } from '../../../client/shared/models/comprobante.model';
import { EmisionService } from '../../../client/shared/services/emision.service';

@Component({
  templateUrl: './comprobantes.component.html',
  styleUrls: ['./comprobantes.component.css'],
})
export class ComprobantesComponent implements OnInit {
  @ViewChild('childModalMensaje', { static: true })
  childModalMensaje: ModalDirective;
  @ViewChild('childModalEdicion', { static: true })
  childModalEdicion: ModalDirective;
  @ViewChild('childModalEdicionMail', { static: true })
  childModalEdicionMail: ModalDirective;
  @ViewChild('modalSuccessSenMail', { static: true })
  modalSuccessSenMail: ModalDirective;

  @ViewChild('errorSearchForm', { static: false, read: ElementRef })
  errorSearchForm: ElementRef;

  userCode: number;
  channelUser: number;
  channelList: any[];
  billsDataGlobal: any[];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  haveBillsData = false;
  billsData: any[];

  mailBroker: '';
  razonSocialBroker: '';
  numeroDocumentoBroker: '';
  codigoBroker: 0;
  codigoClienteBroker: '';

  searchtext = '';
  comprobantes = [];
  comprobantesRow = [];
  mailCollection = [];
  uniqueMailCollection = [];

  messagevalidation = '';
  loadingdata = false;
  searchcheck = '-1';
  p = 0;
  edicionForm: FormGroup;
  edicionMailForm: FormGroup;
  enviarContratantes = false;
  profile_admin = AppConfig.PROFILE_ADMIN_SOAT;
  isProtecta: boolean;
  showDescarga = false;
  IS_ADMIN: number;
  frmSearchForAdmin: FormGroup;

  constructor(
    private spinner: NgxSpinnerService,
    private emissionService: EmisionService,
    private excelService: ExcelService,
    private channelService: ChannelSalesService,
    private formBuilder: FormBuilder
  ) {
    this.isProtecta = AppConfig.IS_PROTECTA;
    this.IS_ADMIN = Number(
      JSON.parse(localStorage.getItem('currentUser')).profileId
    );
    this.frmSearchForAdmin = this.formBuilder.group({
      poliza: [null],
      comprobante: [null],
      documento: [null],
    });
  }
  clearFrmSearch(): void {
    this.billsData = [];
    this.billsDataGlobal = [];
    this.comprobantes = [];
    this.frmSearchForAdmin.reset();
  }
  listComprobantesForAdmin(payload) {
    payload.poliza = !payload.poliza ? 0 : payload.poliza.toString().trim();
    payload.comprobante = !payload.comprobante
      ? '0'
      : payload.comprobante.toString().trim();
    payload.documento = !payload.documento
      ? '0'
      : payload.documento.toString().trim();
    this.errorSearchForm.nativeElement.textContent = '';
    const frmSearchValid =
      !payload.poliza && payload.comprobante == 0 && payload.documento == 0
        ? false
        : true;
    if (frmSearchValid) {
      this.billsData = [];
      this.billsDataGlobal = [];
      this.comprobantes = [];
      this.spinner.show();
      this.channelService.getComprobantesForAdmin(payload).subscribe(
        (data: any) => {
          const brokerData = <any>data;
          this.billsData = data.comprobanteDetail;

          this.mailBroker = brokerData.emailCorredor;
          this.razonSocialBroker = brokerData.razonSocial;
          this.numeroDocumentoBroker = brokerData.documento;
          this.codigoBroker = brokerData.codigoCorredor;
          this.codigoClienteBroker = brokerData.codigoCliente;

          this.billsDataGlobal = data.comprobanteDetail;
          this.haveBillsData = this.billsData.length > 0;
          this.spinner.hide();
          this.loadingdata = false;
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    } else {
      this.errorSearchForm.nativeElement.textContent =
        'Debe llenar al menos un campo';
    }
  }
  get IsAdmin() {
    this.IS_ADMIN = Number(this.IS_ADMIN);
    return (
      this.IS_ADMIN === 20 ||
      this.IS_ADMIN === 151 ||
      this.IS_ADMIN === 154 ||
      this.IS_ADMIN === 155
    );
  }
  ngOnInit() {
    this.channelUser = this.currentUser.canal;
    this.userCode = this.currentUser && this.currentUser.id;

    if (!this.IsAdmin) {
      this.listChannel();
      this.listComprobantes(this.channelUser);
    }

    this.edicionForm = this.formBuilder.group({
      tipoenvio: ['', Validators.required],
      envioContratante: [true, Validators.required],
      mailbroker: [
        '',
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
    });

    this.edicionMailForm = this.formBuilder.group({
      mailcontratante: [
        '',
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
      codigocontratante: ['', [Validators.required]],
    });
    this.habilitarDescargas();
  }
  listChannel(): void {
    this.channelService
      .getPostChannelSales(new ChannelSales(this.userCode, '0', ''))
      .subscribe(
        (data) => {
          this.channelList = <any[]>data;
          if (AppConfig.FILTER_CHANNEL_ONLY_BROKER.res) {
            // tslint:disable-next-line:max-line-length
            this.channelList = this.channelList.filter(
              (x) =>
                x.nchannel.toString() ===
                AppConfig.FILTER_CHANNEL_ONLY_BROKER.channel?.toString()
            );
            this.listComprobantes(AppConfig.FILTER_CHANNEL_ONLY_BROKER.channel);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  habilitarDescargas() {
    this.showDescarga = false;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (this.profile_admin === user.profileId) {
      this.showDescarga = true;
    }
  }

  search() {
    let canalesFiltrados;
    const term = this.searchtext;
    if (!term) {
      canalesFiltrados = this.billsDataGlobal;
    } else {
      this.billsDataGlobal.forEach((e) => {
        e.documentoReferencia =
          e.documentoReferencia === null ? '' : e.documentoReferencia;
      });
      canalesFiltrados = this.billsDataGlobal.filter(
        (x) =>
          x.producto
            ?.trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.documentoReferencia
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.tipoComprobante
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          setSerialNumber(x.idTipoComprobante, x.serieNumero)
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.montoTotal
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.documentoContratante
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.contratante
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.poliza
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.placa
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.estado
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase())
      );
    }

    if (this.searchcheck !== '-1') {
      canalesFiltrados = canalesFiltrados.filter(
        (x) => Number(x.enviado) === Number(this.searchcheck)
      );
    }

    this.billsData = canalesFiltrados;
  }

  listComprobantes(canal: any): void {
    this.billsData = [];
    this.billsDataGlobal = [];
    this.loadingdata = true;
    this.spinner.show();
    this.channelService.getComprobantes(canal).subscribe(
      (data) => {
        const brokerData = <any>data;
        const documentList = sortArray(
          <any[]>brokerData.documentos,
          'fechaEmision',
          -1
        );
        this.billsData = documentList;

        this.mailBroker = brokerData.emailCorredor;
        this.razonSocialBroker = brokerData.razonSocial;
        this.numeroDocumentoBroker = brokerData.documento;
        this.codigoBroker = brokerData.codigoCorredor;
        this.codigoClienteBroker = brokerData.codigoCliente;

        this.billsDataGlobal = documentList;
        this.haveBillsData = this.billsData.length > 0;
        this.spinner.hide();
        this.loadingdata = false;
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getTotalAmount(type: string, amount: string): string {
    let text = '';
    if (type === '' || amount === '' || !type || !amount) {
      text = '';
    }
    if (type.toString().trim() === 'Soles') {
      text = 'S/ ' + parseFloat(amount).toFixed(2);
    }
    if (type.toString().trim() === 'Dolares') {
      text = '$ ' + parseFloat(amount).toFixed(2);
    }

    return text;
  }

  getDocumentType(type: number): string {
    let coreType = '';
    switch (Number(type)) {
      case 5:
        coreType = '01';
        break;
      case 6:
        coreType = '03';
        break;
      default:
        coreType = '07';
        break;
    }
    return coreType;
  }

  documentChecked(row: any) {
    const serialnumber = setSerialNumber(
      row.idTipoComprobante,
      row.serieNumero
    );
    return (
      this.comprobantes.filter((x) => x.serienumero === serialnumber).length > 0
    );
  }

  getSerialNumber(row: any) {
    return setSerialNumber(row.idTipoComprobante, row.serieNumero).toString();
  }

  onSelectChannelSales(channelSalesId) {
    this.listComprobantes(channelSalesId);
  }

  onSelectEnviado(enviado) {
    this.search();
  }

  enviarMail() {
    this.edicionForm.reset();
    this.edicionForm.get('tipoenvio').setValue('0');
    this.edicionForm.get('envioContratante').setValue(false);
    this.edicionForm.get('mailbroker').setValue(this.mailBroker);

    this.uniqueMailCollection = [];
    this.mailCollection = [];
    // this.comprobantesRow
    for (let index = 0; index < this.comprobantesRow.length; index++) {
      const element = this.comprobantesRow[index];

      const comprobanteOrigin = element.row.serieNumero.split('-');
      const sSerialOrigin = comprobanteOrigin[0];
      const sNumberOrigin = Number(comprobanteOrigin[1]).toString();

      const jsonContratante = {
        archivo: [
          {
            tipoComprobante: element.documentoConsulta.tipoComprobante,
            fecha: element.row.fechaEmision,
            tipoComprobanteDescription: element.row.tipoComprobante,
            serie: element.documentoConsulta.serie,
            numero: element.documentoConsulta.numero,
            TipoBill: element.row.idTipoComprobante,
            AreaBill: sSerialOrigin,
            NumBill: sNumberOrigin,
          },
        ],
        codigoCliente: element.row.codigoContratante,
        tipoDocumento: element.row.tipoDocumentoContratante,
        numeroDocumento: element.row.documentoContratante,
        razonSocial: element.row.contratante,
        email: element.row.mailContratante,
      };

      const existeContratante = this.uniqueMailCollection.find(
        (x) => x.codigoCliente === element.row.codigoContratante
      );
      if (!existeContratante) {
        this.uniqueMailCollection.push({
          razonSocial: element.row.contratante,
          email: element.row.mailContratante,
          codigoCliente: element.row.codigoContratante,
        });
      }
      this.mailCollection.push(jsonContratante);
    }
    this.enviarContratantes = false;
    this.childModalEdicion.show();
  }

  descargarComprobante() {
    this.spinner.show();
    this.emissionService
      .descargarComprobante(this.comprobantes)
      .subscribe((res) => {
        const mFile = res as any;
        mFile.file = res.archivo;
        mFile.id = mFile.nombre;
        if (res) {
          let linkSource = 'data:application/pdf;base64,';
          linkSource += res.file;
          const a = document.createElement('a');
          a.setAttribute('href', linkSource);
          a.setAttribute('download', res.id);
          a.setAttribute('target', '_blank');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        this.spinner.hide();
      });
  }

  validarComprobante(event, row: any, ref: any) {
    const isChecked = event.target.checked;
    const documentoConsulta: Comprobante = new Comprobante();
    documentoConsulta.serienumero = setSerialNumber(
      row.idTipoComprobante,
      row.serieNumero
    );
    const serialNumberOrigin = documentoConsulta.serienumero.split('-');
    const sSerial = serialNumberOrigin[0];
    const sNumber = Number(serialNumberOrigin[1]).toString();

    documentoConsulta.tipoComprobante = this.getDocumentType(
      row.idTipoComprobante
    );
    documentoConsulta.serie = sSerial;
    documentoConsulta.numero = sNumber;
    documentoConsulta.fecha = row.fechaEmision;
    documentoConsulta.monto = row.montoTotal;
    documentoConsulta.ruc = '20517207331';
    documentoConsulta.isPDF = true;

    if (isChecked) {
      ref.checked = false;
      this.spinner.show();
      this.messagevalidation = '';
      this.emissionService.validarComprobante(documentoConsulta).subscribe(
        (res) => {
          if (res.valido) {
            this.comprobantes.push(documentoConsulta);
            this.comprobantesRow.push({ documentoConsulta, row });
          } else {
            this.messagevalidation =
              'Su comprobante se encuentra en proceso de validación, por favor intente nuevamente en unos minutos.';
            this.childModalMensaje.show();
          }
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
    } else {
      this.comprobantes = this.comprobantes.filter(
        (x) => x.serienumero !== documentoConsulta.serienumero
      );
      this.comprobantesRow = this.comprobantesRow.filter(
        (x) => x.documentoConsulta.serienumero !== documentoConsulta.serienumero
      );
    }
  }

  closeModalMensaje(): void {
    this.childModalMensaje.hide();
  }

  onClose() {
    this.childModalEdicion.hide();
  }

  onCloseMail() {
    this.childModalEdicionMail.hide();
  }

  onSave() {
    this.spinner.show();
    const mailBrokerEnvio = this.edicionForm.get('mailbroker').value;

    const broker = {
      codigoCliente: this.codigoClienteBroker,
      emailCorredor:
        this.edicionForm.get('tipoenvio').value === '0'
          ? mailBrokerEnvio
          : null,
      codigoCorredor: this.codigoBroker,
      numeroDocumento: this.numeroDocumentoBroker,
      razonSocial: this.razonSocialBroker,
      emailOtro:
        this.edicionForm.get('tipoenvio').value === '0'
          ? null
          : mailBrokerEnvio,
      contratante: this.mailCollection,
    };

    const payload = {
      idUsuario: this.userCode,
      tipoEnvio: Number(this.edicionForm.get('tipoenvio').value),
      incluyeContratantes: this.enviarContratantes,
      corredor: broker,
      origin: '2',
    };

    this.emissionService.notificar(payload).subscribe(
      (res) => {
        console.log(res);
        this.childModalEdicion.hide();
        this.spinner.hide();
        this.modalSuccessSenMail.show();
      },
      (err) => {
        this.spinner.hide();
      }
    );
    this.uniqueMailCollection = [];
    this.comprobantes = [];
    this.comprobantesRow = [];
    this.mailCollection = [];
  }

  changeEnvioContratante(x) {
    this.enviarContratantes = x.target.checked;
  }

  get cForm() {
    return this.edicionForm.controls;
  }

  showError(controlName: string): boolean {
    return (
      this.cForm[controlName].invalid &&
      (this.cForm[controlName].dirty || this.cForm[controlName].touched)
    );
  }

  get cFormMail() {
    return this.edicionMailForm.controls;
  }

  showErrorMail(controlName: string): boolean {
    return (
      this.cFormMail[controlName].invalid &&
      (this.cFormMail[controlName].dirty || this.cFormMail[controlName].touched)
    );
  }

  onEditarMail(contratante) {
    this.childModalEdicionMail.show();
    this.edicionMailForm.get('mailcontratante').setValue(contratante.email);
    this.edicionMailForm
      .get('codigocontratante')
      .setValue(contratante.codigoCliente);
  }

  onSaveMail() {
    const mail = this.edicionMailForm.get('mailcontratante').value;
    const codigo = this.edicionMailForm.get('codigocontratante').value;
    const coll1 = this.uniqueMailCollection.filter(
      (x) => x.codigoCliente === codigo
    );
    if (coll1) {
      for (let index = 0; index < coll1.length; index++) {
        const element = coll1[index];
        element.email = mail;
      }
    }

    const coll2 = this.mailCollection.filter((x) => x.codigoCliente === codigo);
    if (coll2) {
      for (let index = 0; index < coll2.length; index++) {
        const element = coll2[index];
        element.email = mail;
      }
    }

    this.childModalEdicionMail.hide();
  }

  descargarExcel() {
    if (this.IsAdmin) {
      this.excelService.exportAccountStateForAdmin(
        this.billsDataGlobal,
        'EstadoDeCuenta'
      );
    } else {
      this.excelService.exportAccountState(
        this.billsDataGlobal,
        'EstadoDeCuenta'
      );
    }
  }

  getReporteEnvios() {
    this.spinner.show();
    this.emissionService.generarReporteEnvio().subscribe((response) => {
      if (response) {
        let linkSource = 'data:application/pdf;base64,';
        linkSource += response.file;
        const a = document.createElement('a');
        a.setAttribute('href', linkSource);
        a.setAttribute('download', response.id);
        a.setAttribute('target', '_blank');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      this.spinner.hide();
    });
  }
  hideModalSuccessSendMail(): void {
    this.modalSuccessSenMail.hide();
  }
}
