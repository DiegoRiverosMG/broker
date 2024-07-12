import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { OthersService } from '../../../../services/shared/others.service';
import { CommonMethods } from '../../../common-methods';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AddContactComponent } from '../../../../modal/add-contact/add-contact.component';
import { ValErrorComponent } from '../../../../modal/val-error/val-error.component';
import { FilePickerComponent } from '../../../../modal/file-picker/file-picker.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-covid-evaluation',
  templateUrl: './covid-evaluation.component.html',
  styleUrls: ['./covid-evaluation.component.css']
})
export class CovidEvaluationComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  mainFormGroup: FormGroup;
  template: any = {};
  variable: any = {};
  lblProducto = '';
  brokerProfile = '';
  status: any;
  from: string;
  mode: string;
  perfil: any;
  isLoading = false;
  beforeDay = 0;
  afterDay = 0;
  statusList: any = [];
  igvCovid = 0;
  // derechoEmision = 0;
  filter: any = {};
  statusChangeList: any = [];
  reasonList: any = [];
  erroresList: any = [];

  currentPage = 1;
  rotate = true;
  maxSize = 5;
  itemsPerPage = 5;
  totalItems = 0;
  listToShow: any = [];

  quotationNumber: string;
  policy: string;
  productoId: number;
  inputsCovid: any = {};
  contractingdata: any = [];
  flagContact = false;
  flagEmail = false;
  creditHistory: any = null;
  contactList: any = [];
  infoPrimaList: any = [];
  infoPlanList: any = [];
  excelSubir: File;
  files: File[] = [];
  operationBtn = false;
  filesMaxSize = 10485760;
  evaluation = false;
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;

  covidId = JSON.parse(localStorage.getItem('covidID'));
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  nbranch: any = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyemitService,
    private quotationService: QuotationService,
    private mainFormBuilder: FormBuilder,
    private othersService: OthersService,
    private ngbModal: NgbModal,
    private modalService: NgbModal,
    private clientService: ClientInformationService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false
      }
    );
  }

  async ngOnInit() {
    // Configuracion del Template
    this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE);

    // Configuracion del Variable
    this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);

    this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME);
    this.brokerProfile = this.variable.var_prefilExterno;

    const quotationData = JSON.parse(sessionStorage.getItem('cs-quotation'));
    if (quotationData == null || quotationData === undefined) {
      this.router.navigate(['/extranet/request-covid']);
    } else {
      this.quotationNumber = quotationData.QuotationNumber;
      this.productoId = quotationData.ProductId;
      this.status = quotationData.Status;
      this.mode = quotationData.Mode;
      this.from = quotationData.From;
      this.policy = quotationData.PolicyNumber;
      // this.policyNumber = quotationData.PolicyNumber;
      if (this.quotationNumber == null || this.quotationNumber === undefined || this.mode == null || this.mode === undefined) {
        this.router.navigate(['/extranet/request-covid']);
      } else {
        this.perfil = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
        this.isLoading = true;
        if (this.status === 'APROBADO' || this.status === 'EMITIDO' || this.status === 'AP. POR TÉCNICA') {
          this.evaluation = true;
        }
        // await this.getIGVData();
        await this.getDataConfig();
        await this.getQuotationData();
        await this.getStatusList();
        await this.getNameButtonPermission();

        this.inputsCovid.TITLE = 'Detalle de Cotización N° ' + this.quotationNumber;
        if (this.status === 'EMITIDO') {
          this.inputsCovid.TITLE = 'Detalle de póliza N° ' + this.policy;
        }
        this.filter.QuotationNumber = this.quotationNumber;
        this.filter.PageNumber = 1;
        this.filter.LimitPerPage = 5;
        this.firstSearch();
      }
    }
  }

  async getNameButtonPermission() {
    switch (this.mode) {
      case 'Recotizar':
        this.inputsCovid.evaluationLabel = 'Datos adjuntos';
        this.inputsCovid.buttonName = 'RECOTIZAR';
        this.operationBtn = false;
        this.permissionList(true);
        break;
      case 'Evaluar':
        this.inputsCovid.evaluationLabel = 'Evaluación';
        this.inputsCovid.buttonName = 'Aprobar';
        this.operationBtn = true;
        this.permissionList(true);
        break;
      case 'Emitir':
        this.inputsCovid.evaluationLabel = 'Evaluación';
        this.inputsCovid.buttonName = 'Emitir';
        this.operationBtn = true;
        this.permissionList(false);
        break;
      case 'Autorizar':
        this.inputsCovid.evaluationLabel = 'Evaluación';
        this.inputsCovid.buttonName = 'Autorizar';
        this.operationBtn = true;
        this.permissionList(true);
        break;
      default:
        this.operationBtn = false;
        this.inputsCovid.buttonName = 'Emitir';
        this.permissionList(true);
        break;
    }
  }

  permissionList(value) {
    this.inputsCovid.commissionPro = true;
    this.inputsCovid.dateIni = this.mode === 'Emitir' ? false : true;
    this.inputsCovid.premiumPro = true;
  }

  async getDataConfig() {
    const configDias = ['DIASRETRO_EMISION', 'DIASADD_EMISION', 'COVID_IGV'];
    for (const config of configDias) {
      const data = await this.diasConfigurados(config);
      this.beforeDay = config === configDias[0] ? data : this.beforeDay;
      this.afterDay = config === configDias[1] ? data : this.afterDay;
      this.igvCovid = config === configDias[2] ? data : this.igvCovid;
    }
  }

  async diasConfigurados(config) {
    let response = 0;
    await this.policyService.getDataConfig(config).toPromise().then(
      res => {
        response = res[0] !== undefined ? Number(res[0].SDATA) : 0;
      },
      err => {
        response = 0;
      }
    );
    return response;
  }

  valRenovationType(event: any) {
    const fechadesde = this.desde.nativeElement.value.split('/');
    const fechahasta = this.hasta.nativeElement.value.split('/');
    const fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
    const fechaHas = (fechahasta[1]) + '/' + fechahasta[0] + '/' + fechahasta[2];
    const fechad = new Date(fechaDes);
    const fechah = new Date(fechaHas);

    if (this.inputsCovid.TIP_RENOV === this.variable.var_renovacionMensual) {
      fechad.setMonth(fechad.getMonth() + 1);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.finVigencia = new Date(fechad);
    }
    if (this.inputsCovid.TIP_RENOV === this.variable.var_renovacionBiMensual) {
      fechad.setMonth(fechad.getMonth() + 2);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.finVigencia = new Date(fechad);
    }
    if (this.inputsCovid.TIP_RENOV === this.variable.var_renovacionTriMensual) {
      fechad.setMonth(fechad.getMonth() + 3);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.finVigencia = new Date(fechad);
    }

    if (this.inputsCovid.TIP_RENOV === this.variable.var_renovacionSemestral) {
      fechad.setMonth(fechad.getMonth() + 6);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.finVigencia = new Date(fechad);
    }
  }

  getStatusList() {
    this.quotationService.getStatusList('3', this.codProducto).subscribe(
      res => {
        res.forEach(element => {
          if (this.mode !== 'Autorizar') {
            if (element.Id === '2' || element.Id === '11') {
              this.statusList.push(element);
            }
          } else if (this.mode === 'Autorizar') {
            if (element.Id === '11' || element.Id === '13') {
              this.statusList.push(element);
            }
          } else {
            if (this.status !== 'NO PROCEDE' && element.Id === '3') {
              this.statusList.push(element);
            }
          }
        });
      }
    );
  }

  firstSearch() {
    this.filter.PageNumber = 1;
    this.searchTracking();
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  searchTracking() {
    this.quotationService.getTrackingList(this.filter).subscribe(
      res => {
        this.isLoading = false;
        this.statusChangeList = res.GenericResponse;
        this.listToShow = this.statusChangeList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        this.totalItems = this.statusChangeList.length;

        if (this.statusChangeList.length === 0) {
          this.statusChangeList = [];
        }
      },
      err => {
        // swal.fire('Información', this.genericServerErrorMessage, 'error');
      }
    );
  }

  async getQuotationData() {  // Obtener datos de cotización: cabecera, brokers y detalles.
    this.isLoading = true;
    const typeMovement = '0';
    const dataQuotation: any = [];
    const userId = JSON.parse(localStorage.getItem('currentUser'))['id'];

    await this.policyService.getPolicyEmitCab(this.quotationNumber, typeMovement, userId).toPromise().then(
      res => {
        if (res.GenericResponse !== null) {
          this.inputsCovid = { ...res.GenericResponse };
          this.inputsCovid.inicioVigencia = new Date(res.GenericResponse.EFECTO_COTIZACION_VL);
          this.inputsCovid.finVigencia = new Date(res.GenericResponse.EXPIRACION_COTIZACION_VL);
          this.inputsCovid.inicioVigenciaIni = new Date();
          this.inputsCovid.inicioVigenciaIni.setDate(this.inputsCovid.inicioVigenciaIni.getDate() - this.beforeDay);
          this.inputsCovid.inicioVigenciaFin = new Date();
          this.inputsCovid.inicioVigenciaFin.setDate(this.inputsCovid.inicioVigenciaFin.getDate() + this.afterDay);
        } else {
          swal.fire('Información', 'No se encontraron los datos necesarios para esta cotización.', 'error');
          this.router.navigate(['/extranet/request-covid']);
          return;
        }
      }
    );

    await this.policyService.getPolicyEmitComer(this.quotationNumber).toPromise().then(
      res => {
        if (res.length > 0) {
          for (const item of res) {
            item.COMISION_SALUD = this.evaluation ? item.COMISION_SALUD_AUT : item.COMISION_SALUD;
          }
          this.inputsCovid.quotationComer = res;
        } else {
          swal.fire('Información', 'No se encontraron los datos necesarios para esta cotización.', 'error');
          this.router.navigate(['/extranet/request-covid']);
          return;
        }
      }
    );

    await this.policyService.getPolicyEmitDet(this.quotationNumber, userId).toPromise().then(
      res => {
        let totalProp = 0;
        if (res.length > 0) {
          for (const item of res) {
            const info: any = {};
            info.TIP_RIESGO = item.TIP_RIESGO;
            info.DES_RIESGO = item.DES_RIESGO;
            info.NUM_TRABAJADORES = item.NUM_TRABAJADORES;
            info.TASA_CALC = this.evaluation ? item.TASA : item.TASA_CALC;
            info.TASA_PRO = item.TASA_PRO === '' ? 0 : item.TASA_PRO;
            info.MONTO_PLANILLA = Number(item.NUM_TRABAJADORES) * Number(info.TASA_CALC);
            info.MONTO_PLANILLA_PRO = Number(item.NUM_TRABAJADORES) * Number(info.TASA_PRO);
            totalProp = totalProp + info.MONTO_PLANILLA_PRO;
            this.infoPrimaList.push(info);
          }


          let sumProp = 0;
          // let igvPublicProp = 0;
          for (const item of res) {
            const plan: any = {};
            plan.TIP_RIESGO = item.TIP_RIESGO;
            plan.DES_RIESGO = item.DES_RIESGO;
            plan.NUM_TRABAJADORES = item.NUM_TRABAJADORES;
            plan.TASA_CALC = this.evaluation ? item.TASA : item.TASA_CALC;
            plan.TASA_PRO = item.TASA_PRO === '' ? 0 : item.TASA_PRO;
            plan.PRIMA = item.PRIMA;
            plan.NSUM_PREMIUMN = item.NSUM_PREMIUMN;
            plan.NSUM_IGV = item.NSUM_IGV;
            plan.NSUM_PREMIUM = item.NSUM_PREMIUM;
            // const igvItem = CommonMethods.formatValorNormal(plan.TASA_PRO / Number(this.igvCovid), 2);
            // const igvItem2 = CommonMethods.formatValorNormal(plan.TASA_PRO / Number(this.igvCovid), 6);
            // const igvPublic = CommonMethods.formatValor(Number(igvItem2) * (Number(this.igvCovid) - 1), 2);
            // igvPublicProp = igvPublicProp + (Number(igvPublic) * Number(plan.NUM_TRABAJADORES));
            plan.PRIMA_PRO = CommonMethods.formatValor((item.NUM_TRABAJADORES * plan.TASA_PRO) / Number(this.igvCovid), 6); // item.NUM_TRABAJADORES * plan.TASA_PRO;
            sumProp = sumProp + Number(plan.PRIMA_PRO);
            this.infoPlanList.push(plan);
          }

          this.inputsCovid.totalNeto = this.infoPlanList[0].NSUM_PREMIUMN;
          this.inputsCovid.totalComercial = this.infoPlanList[0].NSUM_PREMIUMN;
          this.inputsCovid.igvCalculado = this.infoPlanList[0].NSUM_IGV;
          this.inputsCovid.totalBruto = this.infoPlanList[0].NSUM_PREMIUM;

          this.inputsCovid.totalNetoProp = CommonMethods.formatValorNormal(sumProp, 6);
          this.inputsCovid.totalComercialProp = CommonMethods.formatValorNormal(sumProp, 6);
          this.inputsCovid.igvCalculadoProp = CommonMethods.formatValor(sumProp * (this.igvCovid - 1), 6);
          this.inputsCovid.totalBrutoProp = CommonMethods.formatValor(Number(totalProp), 2);
        } else {
          swal.fire('Información', 'No se encontraron los datos necesarios para esta cotización.', 'error');
          this.router.navigate(['/extranet/request-covid']);
          return;
        }
      }
    );

    await this.dataClient(this.inputsCovid);
    // await this.getInfoExperia(this.inputsCovid);

  }

  async dataClient(res) {
    const data: any = {};
    data.P_TipOper = 'CON';
    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    data.P_NIDDOC_TYPE = res.TIPO_DOCUMENTO;
    data.P_SIDDOC = res.NUM_DOCUMENTO.trim();

    await this.clientService.getCliente360(data).toPromise().then(
      res => {
        if (Number(res.P_NCODE) === 0) {
          this.contractingdata = res.EListClient[0];
          this.inputsCovid.P_SISCLIENT_GBD = this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD;
          if (res.EListClient[0].EListContactClient.length === 0 && (this.mode === 'Evaluar' || this.mode === 'Emitir' || this.mode === 'EmitirR' || this.mode === 'Renovar')) {
            this.flagContact = true;
          }

          if (res.EListClient[0].EListEmailClient.length === 0 && (this.mode === 'Evaluar' || this.mode === 'Emitir' || this.mode === 'EmitirR' || this.mode === 'Renovar')) {
            this.flagEmail = true;
          }
        }
      }
    );
  }

  async getInfoExperia(res): Promise<any> {
    const data: any = {};
    data.tipoid = res.TIPO_DOCUMENTO === '1' ? '2' : '1';
    data.id = res.NUM_DOCUMENTO;
    data.papellido = res.P_SLASTNAME;
    data.sclient = this.contractingdata.P_SCLIENT;
    data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
    return this.clientService.invokeServiceExperia(data).toPromise().then(
      res => {
        this.creditHistory = {};
        this.creditHistory.nflag = res.nflag;
        this.creditHistory.sdescript = res.sdescript;
      }
    );
  }

  openModal(modalName: String) {
    let modalRef: NgbModalRef;
    const typeContact: any = {};
    switch (modalName) {
      case 'add-contact':
        modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        typeContact.P_NIDDOC_TYPE = this.inputsCovid.TIPO_DOCUMENTO;
        typeContact.P_SIDDOC = this.inputsCovid.NUM_DOCUMENTO;
        modalRef.componentInstance.typeContact = typeContact;
        modalRef.componentInstance.listaContactos = this.contactList;
        modalRef.componentInstance.itemContacto = null;
        break;
    }
  }

  // Section Contacto
  editContact(row) {
    let modalRef: NgbModalRef;
    const typeContact: any = {};
    let itemContacto: any = {};
    modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    typeContact.P_NIDDOC_TYPE = this.inputsCovid.TIPO_DOCUMENTO;
    typeContact.P_SIDDOC = this.inputsCovid.NUM_DOCUMENTO;
    modalRef.componentInstance.typeContact = typeContact;
    this.contactList.map(function (dato) {
      if (dato.P_NROW === row) {
        itemContacto = dato;
      }
    });
    modalRef.componentInstance.itemContacto = itemContacto;
    modalRef.componentInstance.listaContactos = this.contactList;
  }

  deleteContact(row) {
    swal.fire({
      title: 'Eliminar Contacto',
      text: '¿Estás seguro que deseas eliminar esta contacto?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    })
      .then((result) => {
        if (result.value) {
          this.contactList.splice(row, 1);
        }
      });
  }

  seleccionExcel(archivo: File) {
    if (archivo === undefined) {
      this.excelSubir = null;
      this.infoPrimaList = [];
      this.infoPlanList = [];
    }

    this.excelSubir = archivo;
  }

  openFilePicker(fileList: string[]) {
    if (fileList != null && fileList.length > 0) {
      const modalRef = this.ngbModal.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
      modalRef.componentInstance.fileList = fileList;
      modalRef.componentInstance.ngbModalRef = modalRef;
    } else {
      swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
    }
  }

  async downloadFile(filePath: string): Promise<any> {

  }

  validarExcel() {
    let msg = '';

    if (this.excelSubir === undefined || this.excelSubir === null) {
      msg += 'Adjunte una trama para validar  <br>';
    }

    if (msg === '') {
      this.validarTrama();
    }
  }

  validarTrama(codComission?: any) {
    this.isLoading = true;
    // this.infoPrimaList = [];
    // this.infoPlanList = [];
    const myFormData: FormData = new FormData();
    const data: any = {};
    data.codUsuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
    data.fechaEfecto = CommonMethods.formatDate(this.inputsCovid.inicioVigencia);
    data.fechaFin = CommonMethods.formatDate(this.inputsCovid.finVigencia);
    // data.comision = this.inputsCovid.P_COMISION;
    data.tipoRenovacion = this.inputsCovid.TIP_RENOV;
    data.freqPago = this.inputsCovid.FREQ_PAGO;
    data.codProducto = this.covidId.id;

    for (const item of this.infoPrimaList) {
      data.premiumPlan = Number(item.TASA_CALC);
      data.premiumPlanPro = Number(item.TASA_PRO);
    }
    data.codRamo = this.nbranch;

    myFormData.append('dataFile', this.excelSubir);
    myFormData.append('objValida', JSON.stringify(data));

    this.quotationService.valTrama(myFormData).subscribe(
      res => {
        this.isLoading = false;
        this.erroresList = res.baseError.errorList;
        if (res.P_COD_ERR === '1') {
          swal.fire('Información', res.P_MESSAGE, 'error');
        } else {
          if (this.erroresList != null) {
            if (this.erroresList.length > 0) {
              const modalRef = this.ngbModal.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
              modalRef.componentInstance.formModalReference = modalRef;
              modalRef.componentInstance.erroresList = this.erroresList;
            } else {
              this.infoPrimaList = res.rateInfoList;
              this.infoPlanList = res.planInfoList;
              this.inputsCovid.codProceso = res.NIDPROC;

              // let sumProp = 0;
              // for (const item of this.infoPrimaList) {
              //   sumProp = sumProp + item.MONTO_PLANILLA_PRO;
              // }

              let sumTotal = 0;
              let sumTotalPro = 0;
              for (const item of this.infoPlanList) {
                item.PRIMA = (Number(item.NUM_TRABAJADORES) * Number(item.TASA_CALC)) - ((Number(item.NUM_TRABAJADORES) * Number(item.TASA_CALC)) * (Number(this.igvCovid) - 1));
                item.PRIMA_PRO = (Number(item.NUM_TRABAJADORES) * Number(item.TASA_PRO)) - ((Number(item.NUM_TRABAJADORES) * Number(item.TASA_PRO)) * (Number(this.igvCovid) - 1));
                sumTotal = sumTotal + item.NSUM_PREMIUM;
                sumTotalPro = sumTotalPro + item.NSUM_PREMIUM_PRO;
              }

              this.inputsCovid.totalBruto = sumTotal;
              this.inputsCovid.igvCalculado = sumTotal * (Number(this.igvCovid) - 1);
              this.inputsCovid.totalComercial = Number(this.inputsCovid.totalBruto) - Number(this.inputsCovid.igvCalculado);
              this.inputsCovid.totalNeto = this.inputsCovid.totalComercial;

              this.inputsCovid.totalBrutoProp = sumTotalPro;
              this.inputsCovid.igvCalculadoProp = sumTotalPro * (Number(this.igvCovid) - 1);
              this.inputsCovid.totalComercialProp = Number(this.inputsCovid.totalBrutoProp) - Number(this.inputsCovid.igvCalculadoProp);
              this.inputsCovid.totalNetoProp = this.inputsCovid.totalComercialProp;


              swal.fire('Información', 'Se validó correctamente la trama', 'success');

            }
          } else {
            swal.fire('Información', 'El archivo enviado contiene errores', 'error');
          }
        }
      }, error => {
        this.isLoading = false;
      }
    );
  }

  // proposedRate(row, proposed) {
  //   proposed = !isNaN(Number(proposed)) ? Number(proposed) : 0;

  //   let sumProp = 0;
  //   for (const item of this.infoPrimaList) {
  //     if (item.TIP_RIESGO === row) {
  //       item.MONTO_PLANILLA_PRO = item.NUM_TRABAJADORES * proposed;
  //     }
  //     sumProp = sumProp + item.MONTO_PLANILLA_PRO;
  //   }

  //   this.inputsCovid.totalBrutoProp = sumProp;
  //   this.inputsCovid.igvCalculadoProp = Number(this.inputsCovid.totalBrutoProp) * (Number(this.igvCovid) - 1);
  //   this.inputsCovid.totalComercialProp = Number(this.inputsCovid.totalBrutoProp) - Number(this.inputsCovid.igvCalculadoProp);
  //   this.inputsCovid.totalNetoProp = Number(this.inputsCovid.totalComercialProp);

  //   for (const item of this.infoPlanList) {
  //     if (item.TIP_RIESGO === row) {
  //       item.TASA_PRO = proposed;
  //       item.PRIMA_PRO = (Number(item.NUM_TRABAJADORES) * Number(item.TASA_PRO)) - ((Number(item.NUM_TRABAJADORES) * Number(item.TASA_PRO)) * (Number(this.igvCovid) - 1));
  //     }
  //   }
  // }

  proposedRate(row, proposed) {
    proposed = !isNaN(Number(proposed)) ? Number(proposed) : 0;

    for (const item of this.infoPrimaList) {
      item.MONTO_PLANILLA_PRO = item.NUM_TRABAJADORES * proposed;
      item.TASA_PRO = proposed;
    }

    let sumProp = 0;
    let igvPublicProp = 0;
    for (const item of this.infoPlanList) {
      item.TASA_PRO = proposed;
      const igvItem = CommonMethods.formatValorNormal(proposed / Number(this.igvCovid), 2);
      const igvItem2 = CommonMethods.formatValorNormal(proposed / Number(this.igvCovid), 6);
      const igvPublic = CommonMethods.formatValor(Number(igvItem2) * (Number(this.igvCovid) - 1), 2);
      igvPublicProp = igvPublicProp + (Number(igvPublic) * Number(item.NUM_TRABAJADORES));
      item.PRIMA_PRO = item.NUM_TRABAJADORES * igvItem;
      console.log(item.PRIMA_PRO);
      sumProp = CommonMethods.formatValorNormal(Number(sumProp) + Number(item.PRIMA_PRO), 6);
      console.log(sumProp);

    }

    this.inputsCovid.totalNetoProp = CommonMethods.formatValorNormal(sumProp, 6);
    this.inputsCovid.totalComercialProp = CommonMethods.formatValorNormal(sumProp, 6);
    this.inputsCovid.igvCalculadoProp = CommonMethods.formatValorNormal(Number(igvPublicProp), 6);
    this.inputsCovid.totalBrutoProp = CommonMethods.formatValorNormal(Number(this.inputsCovid.totalComercialProp) + Number(this.inputsCovid.igvCalculadoProp), 6);

  }

  getReasonList(event) {
    const selectElementText = event.target['options']
    [event.target['options'].selectedIndex].text;
    this.inputsCovid.statusChange = selectElementText;

    if (Number(this.inputsCovid.reasonId) === 2 || Number(this.inputsCovid.reasonId) === 13) {
      if (this.mode === 'Emitir' || this.mode === 'EmitirR') {
        this.inputsCovid.buttonName = 'Emitir';
      } else if (this.mode === 'Evaluar') {
        this.inputsCovid.buttonName = 'Continuar';
      } else if (this.mode === 'Autorizar') {
        this.inputsCovid.buttonName = 'Autorizar';
      }
    } else if (Number(this.inputsCovid.reasonId) === 3 || Number(this.inputsCovid.reasonId) === 11) {
      if (((this.mode === 'Emitir' || this.mode === 'EmitirR') || this.mode === 'Evaluar' || this.mode === 'Renovar') && this.status !== 'NO PROCEDE') {
        this.inputsCovid.buttonName = 'Rechazar';
      } else if (this.mode === 'Autorizar') {
        this.inputsCovid.buttonName = 'Rechazar';
      }
    }

    this.quotationService.getReasonList(this.inputsCovid.reasonId).subscribe(
      res => {
        this.reasonList = res;
      }
    );
  }

  async manageOperation() {
    this.isLoading = true;
    const message = await this.validateQuotation();

    if (message === '') {
      this.completeData();
      if (this.flagContact || this.flagEmail) {
        const response: any = await this.updateContracting();
        if (Number(response.code) === 0 || Number(response.code) === 2) {
          this.moveToSend();
        } else {
          this.alertError(response.message);
        }
      } else {
        this.moveToSend();
      }
    } else {
      this.alertError(message);
    }
  }

  moveToSend() {
    switch (this.mode) {
      case 'Evaluar':
        this.quotationEvaluation();
        break;
      case 'Autorizar':
        this.quotationEvaluation();
        break;
      case 'Emitir':
        if (Number(this.inputsCovid.reasonId) !== 11) {
          this.quotationEmit();
        } else {
          this.quotationEvaluation();
        }
        break;
    }
  }

  async quotationEvaluation() {
    this.isLoading = false;
    const data = this.dataChangeStatus();
    swal.fire({
      title: 'Información',
      text: '¿Desea cambiar a estado ' + this.inputsCovid.statusChange + ' la cotización N° ' + this.quotationNumber + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      allowOutsideClick: false,
      cancelButtonText: 'No'
    })
      .then((result) => {
        if (result.value) {
          this.isLoading = true;
          this.quotationService.changeStatusVL(data).subscribe(
            res => {
              this.isLoading = false;
              if (Number(res.StatusCode) === 0) {
                swal.fire('Información', 'La operación se realizó correctamente.', 'success');
                this.router.navigate(['/extranet/request-covid']);
              } else {
                swal.fire('Información', CommonMethods.listToString(res.ErrorMessageList), 'error');
              }
            },
            err => {
              swal.fire('Información', 'Hubo un problema al comunicarnos con el servidor.', 'error');
              this.isLoading = false;
            }
          );
        }
      });
  }

  dataChangeStatus() {
    const formData = new FormData();
    this.files.forEach(function (file) {
      formData.append(file.name, file, file.name);
    });

    const data: any = {};
    data.QuotationNumber = this.quotationNumber;
    data.Status = this.inputsCovid.reasonId;
    data.Reason = this.inputsCovid.motiveId === undefined ? '' : this.inputsCovid.motiveId;
    data.Comment = this.inputsCovid.commentEvaluation === undefined ? '' : this.inputsCovid.commentEvaluation.trim().toUpperCase().replace(/[<>%]/g, '');
    data.User = JSON.parse(localStorage.getItem('currentUser'))['id'];
    data.Product = this.covidId.id;
    data.Nbranch = this.covidId.nbranch;
    data.Gloss = null;
    data.GlossComment = null;
    data.flag = 0;

    data.saludAuthorizedRateList = [];
    data.pensionAuthorizedRateList = [];
    data.BrokerList = [];

    for (const item of this.inputsCovid.quotationComer) {
      const broker: any = {};
      broker.Id = item.CANAL;
      broker.ProductList = [];
      const product: any = {};
      product.Product = this.covidId.id;
      product.AuthorizedCommission = item.COMISION_SALUD_PRO === '' || Number(item.COMISION_SALUD_PRO) === 0 ? item.COMISION_SALUD : item.COMISION_SALUD_PRO;
      broker.ProductList.push(product);
      data.BrokerList.push(broker);
    }

    for (let i = 0; i < this.infoPrimaList.length; i++) {
      const item: any = {};
      item.ProductId = this.covidId.id;
      item.RiskTypeId = this.infoPrimaList[i].TIP_RIESGO;
      item.AuthorizedRate = this.infoPrimaList[i].TASA_PRO === 0 ? this.infoPrimaList[i].TASA_CALC : this.infoPrimaList[i].TASA_PRO;
      item.AuthorizedPremium = 0;
      item.AuthorizedMinimunPremium = 0;
      data.saludAuthorizedRateList.push(item);
    }

    formData.append('statusChangeData', JSON.stringify(data));
    return formData;
  }

  async quotationEmit() {
    this.isLoading = false;
    const data = this.dataEmision();
    swal.fire({
      title: 'Información',
      text: '¿Desea realizar la emisión de la cotización N° ' + this.quotationNumber + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      allowOutsideClick: false,
      cancelButtonText: 'No'
    })
      .then((result) => {
        if (result.value) {
          this.isLoading = true;
          this.policyService.savePolicyEmit(data).subscribe(
            res => {
              this.isLoading = false;
              if (Number(res.P_COD_ERR) === 0) {
                swal.fire('Información', 'Se ha generado correctamente la póliza Covid N° ' + res.P_POL_COVID, 'success');
                this.router.navigate(['/extranet/request-covid']);
              } else {
                swal.fire('Información', res.P_MESSAGE, 'error');
                this.router.navigate(['/extranet/request-covid']);
              }
            },
            err => {
              swal.fire('Información', 'Hubo un problema al comunicarnos con el servidor.', 'error');
              this.isLoading = false;
            }
          );
        }
      });
  }

  dataEmision(): any {
    const myFormData: FormData = new FormData();

    this.files.forEach(function (file) {
      myFormData.append(file.name, file, file.name);
    });

    const dataList: any = [];
    const data: any = {};
    data.P_NID_COTIZACION = this.quotationNumber;
    data.P_NID_PROC = this.inputsCovid.NID_PROC;
    data.P_NPRODUCT = this.covidId.id;
    data.P_NBRANCH = this.covidId.nbranch;
    data.P_SCOLTIMRE = this.inputsCovid.TIP_RENOV;
    data.P_DSTARTDATE = CommonMethods.formatDate(this.inputsCovid.inicioVigencia);
    data.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsCovid.finVigencia);
    data.P_NPAYFREQ = this.inputsCovid.FREQ_PAGO;
    data.P_SFLAG_FAC_ANT = 1;
    data.P_FACT_MES_VENCIDO = 0;
    data.P_NPREM_NETA = this.inputsCovid.totalComercial;
    data.P_IGV = this.inputsCovid.igvCalculado;
    data.P_NPREM_BRU = this.inputsCovid.totalBruto;
    data.P_SCOMMENT = '';
    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    dataList.push(data);
    myFormData.append('objeto', JSON.stringify(dataList));

    return myFormData;
  }

  alertError(message) {
    this.isLoading = false;
    swal.fire('Información', message, 'error');
    return;
  }

  validateQuotation(): any {
    let message = '';

    if (this.inputsCovid.reasonId === undefined && (this.mode === 'Evaluar' || this.mode === 'Autorizar')) {
      message += 'Debe ingresar una estado válido. <br />';
    }

    if (Number(this.perfil) !== 137) {
      if (Number(this.inputsCovid.reasonId) !== 11 && this.mode === 'Evaluar' && this.files.length === 0) {
        message += 'Debe ingresar un archivo.';
      }
      if ((Number(this.inputsCovid.reasonId) !== 11 && (this.mode === 'Emitir' || this.mode === 'Evaluar'))) {
        if (this.flagEmail) {
          if (this.inputsCovid.CORREO === '') {
            message += 'Debe ingresar un correo electrónico para la factura. <br />';
          } else {
            if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsCovid.CORREO) === false) {
              message += 'El correo electrónico es inválido. <br />';
            }
          }
        }
        if (this.flagContact && this.contactList.length === 0) {
          message += this.variable.var_contactZero + '<br />';
        }
      }
    }


    return message;
  }

  completeData() {
    this.contractingdata.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    this.contractingdata.P_TipOper = 'INS';
    this.contractingdata.P_NCLIENT_SEG = -1;

    if (this.flagContact) {
      this.contractingdata.EListContactClient = [];
      // if (this.contactList.length > 0) {
      this.contactList.forEach(contact => {
        if (Number(contact.P_NTIPCONT) === 0) {
          contact.P_NTIPCONT = 99;
        }
        if (Number(contact.P_NIDDOC_TYPE) === 0) {
          contact.P_NIDDOC_TYPE = null;
          contact.P_SIDDOC = null;
        }
      });

      this.contractingdata.EListContactClient = this.contactList;
      // }
    } else {
      this.contractingdata.EListContactClient = null;
    }

    if (this.flagEmail) {
      this.contractingdata.EListEmailClient = [];
      const contractingEmail: any = {};
      contractingEmail.P_CLASS = '';
      contractingEmail.P_DESTICORREO = 'Correo Personal';
      contractingEmail.P_NROW = 1;
      contractingEmail.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
      contractingEmail.P_SE_MAIL = this.inputsCovid.CORREO;
      contractingEmail.P_SORIGEN = 'SCTR';
      contractingEmail.P_SRECTYPE = '4';
      contractingEmail.P_TipOper = '';
      this.contractingdata.EListEmailClient.push(contractingEmail);
    } else {
      this.contractingdata.EListEmailClient = null;
    }
  }

  async updateContracting() {
    const response: any = {};
    this.contractingdata.EListAddresClient = null;
    this.contractingdata.EListPhoneClient = null;
    this.contractingdata.EListCIIUClient = null;
    await this.clientService.getCliente360(this.contractingdata).toPromise().then(
      res => {
        response.code = res.P_NCODE;
        response.message = res.P_SMESSAGE;
        if (Number(res.P_NCODE) === 0 || Number(res.P_NCODE) === 0) {
          this.isLoading = false;
          this.flagContact = false;
          this.flagEmail = false;
        } else {
          if (this.template.ins_addContact && this.contactList.length > 0) {
            this.contractingdata.EListContactClient = [];
          }
        }
      }, error => {
        response.code = '1';
        response.message = 'La solicitud no pudo ser procesada [Cliente 360]';
      }
    );

    return response;
  }

}
