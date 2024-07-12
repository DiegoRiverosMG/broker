import { OnInit, Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonMethods } from '../../../common-methods';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { AddressService } from '../../../../services/shared/address.service';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { SearchContractingComponent } from '../../../../modal/search-contracting/search-contracting.component';
import { SearchBrokerComponent } from '../../../../modal/search-broker/search-broker.component';
import { ValErrorComponent } from '../../../../modal/val-error/val-error.component';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AddContactComponent } from '../../../../modal/add-contact/add-contact.component';
import { MethodsPaymentComponent } from '../../../../modal/methods-payment/methods-payment.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-quotation-covid',
  templateUrl: './quotation-covid.component.html',
  styleUrls: ['./quotation-covid.component.css']
})
export class QuotationCovidComponent implements OnInit {
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;
  bsConfig: Partial<BsDatepickerConfig>;
  isLoading = false;
  blockSearch = true;
  stateSearch = false;
  stateQuotation = true;
  blockDoc = true;
  reloadTariff = false;
  stateBrokerTasaPension = true;
  template: any = {};
  variable: any = {};
  planItem: any = {};
  productList: any = [];
  inputsCovid: any = {};
  inputsValidate: any = {};
  documentTypeList: any = [];
  technicalList: any = [];
  departmentList: any = [];
  provinceList: any = [];
  districtList: any = [];
  tipoRenovacion: any = [];
  currencyList: any = [];
  plansList: any = [];
  creditHistory: any = null;
  contractingdata: any = null;
  brokerList: any = [];
  frecuenciaPago: any = [];
  erroresList: any = [];
  infoPlanList: any = [];
  infoPrimaList: any = [];
  files: File[] = [];
  contactList: any = [];
  lblProducto = '';
  lblFecha = '';
  sclient = '';
  igvCovid = 0;
  beforeDay = 0;
  afterDay = 0;
  maxlength = 0;
  minlength = 0;
  flagContact = false;
  flagEmail = false;
  isBroker = false;

  excelSubir: File;
  covidId = JSON.parse(localStorage.getItem('covidID'));
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  titleRenovation: string;
  nbranch: any = '';

  constructor(
    private clientService: ClientInformationService,
    private addressService: AddressService,
    private quotationService: QuotationService,
    private policyService: PolicyemitService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NgbModal,
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

    // Configuracion de las variables
    this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);

    this.nbranch = await CommonMethods.branchXproduct(this.codProducto);

    // Titulo
    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME);
    this.lblFecha = CommonMethods.tituloPantalla();

    await this.initialize();
    await this.loadData();

    if (this.template.ins_retroactividad) {
      await this.updateInit();
    }

    // CommonMethods.clearBack();
  }

  async initialize() {
    this.inputsValidate = CommonMethods.generarCampos(30, 0);
    this.inputsCovid.perfilExterno = this.variable.var_prefilExterno;
    this.inputsCovid.codigoFlat = this.variable.var_flatKey;
    this.inputsCovid.perfilActual = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
    this.inputsCovid.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
    this.inputsCovid.P_TYPE_SEARCH = this.variable.var_tipoBusqueda; // Tipo de busqueda
    this.inputsCovid.P_PERSON_TYPE = this.variable.var_tipoPersona; // Tipo persona
    this.inputsCovid.P_WORKER = 0;
    this.inputsCovid.P_NIDDOC_TYPE = '-1'; // Tipo de documento
    this.inputsCovid.proposedCommission = false;
    this.isBroker = this.inputsCovid.perfilActual === this.inputsCovid.perfilExterno ? true : false;

    this.route.queryParams
      .subscribe(params => {
        this.inputsCovid.P_NIDDOC_TYPE = params.typeDocument;
        this.inputsCovid.P_SIDDOC = params.document;
        // this.nrocotizacion = params.nroCotizacion;
      });

    if (this.inputsCovid.P_NIDDOC_TYPE !== undefined && this.inputsCovid.P_SIDDOC !== undefined &&
      this.inputsCovid.P_NIDDOC_TYPE !== '' && this.inputsCovid.P_SIDDOC !== '') {
      this.buscarContratante();
      this.selTipoDocumento(this.inputsCovid.P_NIDDOC_TYPE);
      this.cambioDocumento(this.inputsCovid.P_SIDDOC);
    } else {
      // this.inputsCovid.P_NIDDOC_TYPE = '-1';
      this.inputsCovid.P_NIDDOC_TYPE = '-1'; // Tipo de documento
      this.inputsCovid.P_SIDDOC = ''; // Nro de documento
      this.inputsCovid.P_SFIRSTNAME = ''; // Nombre
      this.inputsCovid.P_SLASTNAME = ''; // Apellido Paterno
      this.inputsCovid.P_SLASTNAME2 = ''; // Apellido Materno
      this.inputsCovid.P_SLEGALNAME = ''; // Razon social
      this.inputsCovid.P_SE_MAIL = ''; // Email
      this.inputsCovid.P_SDESDIREBUSQ = ''; // Direccion
      this.inputsCovid.P_SISCLIENT_GBD = '';
    }

    // Datos Cotización
    this.inputsCovid.P_NPRODUCT = this.productList.length > 1 ? '-1' : this.inputsCovid.P_NPRODUCT; // Producto
    this.inputsCovid.P_NCURRENCY = this.variable.var_codMoneda; // Moneda
    this.inputsCovid.P_NIDSEDE = null; // Sede
    this.inputsCovid.P_NTECHNICAL = null; // Actividad tecnica
    this.inputsCovid.P_NECONOMIC = null; // Actividad Economica
    this.inputsCovid.P_DELIMITER = ''; // Delimitación check
    this.inputsCovid.P_MINA = false; // Delimitación check
    this.inputsCovid.P_SDELIMITER = '0'; // Delimitacion  1 o 0
    this.inputsCovid.P_NPROVINCE = null;
    this.inputsCovid.P_NLOCAL = null;
    this.inputsCovid.P_NMUNICIPALITY = null;
    this.inputsCovid.P_PLANILLA = 0;
    this.inputsCovid.P_PLAN = ''; // Plan
    this.inputsCovid.activityMain = '';

    this.inputsCovid.P_COMISION_PRO = null;
    this.inputsCovid.FDateIni = new Date();
    this.inputsCovid.FDateIniMin = new Date();
    this.inputsCovid.FDateFin = new Date();
    this.inputsCovid.FDateFin.setMonth(this.inputsCovid.FDateIni.getMonth() + 1);
    this.inputsCovid.FDateFin.setDate(this.inputsCovid.FDateFin.getDate() - this.variable.var_restarDias);
    this.inputsCovid.FDateFinMin = this.inputsCovid.FDateFin;
    this.inputsCovid.P_COMISION = ''; // Comision
    this.inputsCovid.tipoRenovacion = '';
    this.inputsCovid.frecuenciaPago = '';

    // Cotizador
    this.inputsCovid.P_PRIMA_MIN_SALUD = ''; // Prima minima salud
    this.inputsCovid.P_PRIMA_MIN_SALUD_PRO = ''; // Prima minima salud propuesta
    this.inputsCovid.P_PRIMA_END_SALUD = ''; // Prima endoso salud
    this.inputsCovid.P_PRIMA_MIN_PENSION = ''; // Prima minima pension
    this.inputsCovid.P_PRIMA_MIN_PENSION_PRO = ''; // Prima minima pension propuesta
    this.inputsCovid.P_PRIMA_END_PENSION = ''; // Prima endoso pension
    this.inputsCovid.P_SCOMMENT = '';

    if (this.inputsCovid.perfilActual === this.inputsCovid.perfilExterno || this.template.ins_iniciarBroker) {
      this.brokerIni();
    }

  }

  async loadData() {
    await this.getDocumentTypeList();
    await this.getProductList();
    await this.getTechnicalActivityList();
    await this.getDepartmentList(null);
    await this.getRenovationList();
    await this.getCurrencyList();
    await this.getDataConfig();
  }

  async updateInit() {
    // if (this.template.ins_firstDay && this.variable.var_isBroker) {
    //   this.inputsCovid.FDateIniMin.setDate(0);
    //   this.inputsCovid.FDateIniMin.setDate(this.inputsCovid.FDateIniMin.getDate() + 1);
    // } else {
    this.inputsCovid.FDateIniMin = new Date();
    this.inputsCovid.FDateIniMin.setDate(this.inputsCovid.FDateIniMin.getDate() - this.beforeDay);
    // }

    this.inputsCovid.FDateIniFin = new Date();
    this.inputsCovid.FDateIniFin.setDate(this.inputsCovid.FDateIniFin.getDate() + this.afterDay);
  }

  //#region Servicios
  async getDocumentTypeList() {
    await this.clientService.getDocumentTypeList(this.codProducto).toPromise().then(
      res => {
        this.documentTypeList = res;
      }
    );
  }

  async getProductList() {
    await this.clientService.getProductList(this.codProducto, this.epsItem.NCODE, this.nbranch).toPromise().then(
      res => {
        this.productList = res;
        if (this.productList.length === 1) {
          this.inputsCovid.P_NPRODUCT = this.productList[0].COD_PRODUCT;
        } else {
          this.inputsCovid.P_NPRODUCT = '-1';
        }
      }
    );
  }

  async getTechnicalActivityList() {
    await this.clientService.getTechnicalActivityList(this.codProducto).toPromise().then(
      res => {
        this.technicalList = res;
      }
    );
  }

  async getDepartmentList(itemDireccion: any) {
    if (itemDireccion != null) {
      await this.addressService.getDepartmentList().toPromise().then(
        res => {
          if (itemDireccion.P_NPROVINCE != null) {
            itemDireccion.P_NPROVINCE = Number(itemDireccion.P_NPROVINCE);
          } else {
            res.forEach(element => {
              if (element.Name === itemDireccion.P_DESDEPARTAMENTO) {
                itemDireccion.P_NPROVINCE = element.Id;
              }
            });
          }
        }
      );
    } else {
      await this.addressService.getDepartmentList().toPromise().then(
        res => {
          this.departmentList = res;
        }
      );
    }
  }

  async getProvinceList(itemDireccion: any) {
    if (itemDireccion != null) {
      if (itemDireccion.P_NPROVINCE != null && itemDireccion.P_NPROVINCE !== '') {
        return await this.addressService.getProvinceList(itemDireccion.P_NPROVINCE).toPromise().then(
          res => {
            if (itemDireccion.P_NLOCAL != null) {
              itemDireccion.P_NLOCAL = Number(itemDireccion.P_NLOCAL);
            } else {
              res.forEach(element => {
                if (itemDireccion.P_DESPROVINCIA.search('CALLAO') !== -1) {
                  itemDireccion.P_NLOCAL = element.Id;
                } else {
                  if (element.Name === itemDireccion.P_DESPROVINCIA) {
                    itemDireccion.P_NLOCAL = element.Id;
                  }
                }
              });
            }
          }
        );
      } else {
        return itemDireccion.P_NLOCAL = null;
      }
    } else {
      const province = this.inputsCovid.P_NPROVINCE == null ? '0' : this.inputsCovid.P_NPROVINCE;
      return await this.addressService.getProvinceList(province).toPromise().then(
        res => {
          this.provinceList = res;
        }
      );
    }
  }

  async getDistrictList(itemDireccion: any) {
    if (itemDireccion != null) {
      if (itemDireccion.P_NLOCAL != null && itemDireccion.P_NLOCAL !== '') {
        return await this.addressService.getDistrictList(itemDireccion.P_NLOCAL).toPromise().then(
          res => {
            if (itemDireccion.P_NMUNICIPALITY != null) {
              itemDireccion.P_NMUNICIPALITY = Number(itemDireccion.P_NMUNICIPALITY);
            } else {
              res.forEach(element => {
                if (element.Name === itemDireccion.P_DESDISTRITO) {
                  itemDireccion.P_NMUNICIPALITY = element.Id;
                }
              });
            }
          }
        );
      } else {
        return itemDireccion.P_NMUNICIPALITY = null;
      }
    } else {
      const local = this.inputsCovid.P_NLOCAL == null ? '0' : this.inputsCovid.P_NLOCAL;
      return await this.addressService.getDistrictList(local).toPromise().then(
        res => {
          this.districtList = res;
        }
      );
    }
  }

  async getRenovationList() {
    const requestTypeRen: any = {};
    requestTypeRen.P_NEPS = this.epsItem.STYPE;
    requestTypeRen.P_NPRODUCT = this.codProducto;
    requestTypeRen.P_NUSERCODE = this.inputsCovid.userId;
    await this.policyService.getTipoRenovacion(requestTypeRen).toPromise().then(
      async (res: any) => {
        this.tipoRenovacion = res;
      }
    );
  }

  async getCurrencyList() {
    await this.clientService.getCurrencyList().toPromise().then(
      res => {
        this.currencyList = res;
      }
    );
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

  // async getPlansList() {
  //   this.plansList = [
  //     { 'idPlan': '1', 'desPlan': 'Plan A - S/. 60', 'monto': 60, 'comision': 20 },
  //     { 'idPlan': '2', 'desPlan': 'Plan B - S/. 70', 'monto': 70, 'comision': 25 }];
  // }

  async obtenerFrecuenciaPago() {
    // this.tipoEspecial = tipoRenovacion == 6 || tipoRenovacion == 7 ? true : false;
    await this.policyService.getFrecuenciaPago(this.inputsCovid.tipoRenovacion, this.codProducto).toPromise().then(
      res => {
        this.inputsCovid.frecuenciaPago = this.inputsCovid.tipoRenovacion;
        this.frecuenciaPago = res;
        if (this.frecuenciaPago != null && this.frecuenciaPago.length === 1) {
          this.inputsCovid.frecuenciaPago = res[0].COD_TIPO_FRECUENCIA;
        }
      });
  }

  async onSelectTechnicalActivity(event) {
    // this.economicActivityList = null;
    // this.inputsCovid.P_DELIMITER = '';
    this.inputsCovid.P_NECONOMIC = null;
    if (this.inputsCovid.P_NTECHNICAL != null) {
      this.inputsCovid.activityMain = event.Name;
      // await this.getEconomicActivityList(this.inputsCovid.P_NTECHNICAL);
    } else {
      this.inputsCovid.activityMain = '';
      // this.subActivity = '';
      this.inputsValidate[3] = false;
    }

    this.validarExcel();
  }

  //#endregion Servicios

  //#region cliente360
  async buscarContratante() {
    // const this = this;
    let msg = '';

    if (this.inputsCovid.P_TYPE_SEARCH === '1') {
      if (this.inputsCovid.P_NIDDOC_TYPE === '-1') {
        msg += 'Debe ingresar tipo de documento <br />';
      }
      if (this.inputsCovid.P_SIDDOC.trim() === '') {
        msg += 'Debe ingresar número de documento <br />';
      }
    } else {
      if (this.inputsCovid.P_PERSON_TYPE === '1') {
        if (this.inputsCovid.P_SFIRSTNAME.trim() === '') {
          msg += 'Debe ingresar nombre del contratante <br />';
        }
        if (this.inputsCovid.P_SLASTNAME.trim() === '') {
          msg += 'Debe ingresar apellido paterno del contratante <br />';
        }
      } else {
        if (this.inputsCovid.P_SLEGALNAME.trim() === '') {
          msg += 'Debe ingresar razón social <br />';
        }
      }
    }

    if (msg !== '') {
      swal.fire('Información', msg, 'error');
      return;
    }

    if (this.inputsCovid.P_NIDDOC_TYPE === 1 && this.inputsCovid.P_SIDDOC.trim().length > 1) {
      if (CommonMethods.validateRuc(this.inputsCovid.P_SIDDOC)) {
        swal.fire('Información', 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20', 'error');
        return;
      }
    }

    this.inputsCovid.excelSubir = '';
    this.excelSubir = null;

    this.isLoading = true;
    const data: any = {};
    data.P_TipOper = 'CON';
    data.P_NUSERCODE = this.inputsCovid.userId;
    data.P_NIDDOC_TYPE = this.inputsCovid.P_NIDDOC_TYPE !== '-1' ? this.inputsCovid.P_NIDDOC_TYPE : '';
    data.P_SIDDOC = this.inputsCovid.P_SIDDOC.toUpperCase();
    data.P_SFIRSTNAME = this.inputsCovid.P_SFIRSTNAME != null ? this.inputsCovid.P_SFIRSTNAME.toUpperCase() : '';
    data.P_SLASTNAME = this.inputsCovid.P_SLASTNAME != null ? this.inputsCovid.P_SLASTNAME.toUpperCase() : '';
    data.P_SLASTNAME2 = this.inputsCovid.P_SLASTNAME2 != null ? this.inputsCovid.P_SLASTNAME2.toUpperCase() : '';
    data.P_SLEGALNAME = this.inputsCovid.P_SLEGALNAME != null ? this.inputsCovid.P_SLEGALNAME.toUpperCase() : '';

    await this.clientService.getCliente360(data).toPromise().then(
      async res => {
        if (res.P_NCODE === '0') {
          if (res.EListClient.length === 0) {
            this.stateQuotation = true;
            if (this.inputsCovid.P_SIDDOC !== '') {
              this.clearinputsCotizacion();
              if (this.inputsCovid.P_NIDDOC_TYPE !== '1' && this.inputsCovid.P_NIDDOC_TYPE !== '2') {
                await this.agregaContratante(this.inputsCovid.P_NIDDOC_TYPE, this.inputsCovid.P_SIDDOC, 'quotatio-covid', res.P_NCODE, null);
              } else {
                swal.fire('Información', this.variable.var_noInformacion360, 'error');
              }
            } else {
              swal.fire('Información', this.variable.var_noInformacion360, 'error');
            }

          } else {
            if (res.EListClient[0].P_SCLIENT == null) {
              this.stateQuotation = true;
              if (this.isBroker) {
                await this.agregaContratante(this.inputsCovid.P_NIDDOC_TYPE, this.inputsCovid.P_SIDDOC, 'quotation-covid', res.P_NCODE, res);
              } else {
                await this.agregaContratante(this.inputsCovid.P_NIDDOC_TYPE, this.inputsCovid.P_SIDDOC, 'quotation-covid', res.P_NCODE, null);
              }
            } else {
              if (res.EListClient.length === 1) {
                if (res.EListClient[0].P_SIDDOC != null) {
                  await this.cargarDatosCliente(res);
                } else {
                  swal.fire('Información', 'El contratante no cuenta con el nro de documento.', 'error');
                }
              } else {
                const modalRef = this.modal.open(SearchContractingComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.formModalReference = modalRef;
                modalRef.componentInstance.EListClient = res.EListClient;

                modalRef.result.then(async (ContractorData) => {
                  if (ContractorData !== undefined) {
                    this.contractingdata = ContractorData;
                    this.inputsCovid.P_TYPE_SEARCH = '1';
                    this.inputsCovid.P_PERSON_TYPE = '1';
                    this.inputsCovid.P_SLEGALNAME = '';
                    this.inputsCovid.P_SFIRSTNAME = '';
                    this.inputsCovid.P_SLASTNAME = '';
                    this.inputsCovid.P_SLASTNAME2 = '';
                    if (this.template.ins_sede) {
                      this.stateQuotation = false;
                    }
                    this.blockSearch = true;
                    this.stateSearch = false;

                    const data: any = {};
                    data.P_TipOper = 'CON';
                    data.P_NUSERCODE = this.inputsCovid.userId;
                    data.P_NIDDOC_TYPE = ContractorData.P_NIDDOC_TYPE;
                    data.P_SIDDOC = ContractorData.P_SIDDOC;

                    this.clientService.getCliente360(data).subscribe(
                      res => {
                        if (res.P_NCODE === '0') {
                          this.cargarDatosCliente(res);
                        } else {
                          this.inputsCovid.P_TYPE_SEARCH = '1';
                          this.blockDoc = true;
                          this.clearinputsCotizacion();
                          swal.fire('Información', res.P_SMESSAGE, 'error');
                        }
                      },
                      err => {
                        this.inputsCovid.P_TYPE_SEARCH = '1';
                        this.clearinputsCotizacion();
                      }
                    );
                  }
                }, (reason) => {
                });
              }

            }
          }
        } else if (res.P_NCODE === '3') {
          this.stateQuotation = true;
          this.clearinputsCotizacion();
          if (this.isBroker) {
            swal.fire('Error', 'Cliente no está registrado en PROTECTA, favor de comunicarse con el área canal corporativo', 'error');
            this.creditHistory = null;
          } else {
            if (this.inputsCovid.P_NIDDOC_TYPE !== '1' && this.inputsCovid.P_NIDDOC_TYPE !== '2') {
              this.agregaContratante(this.inputsCovid.P_NIDDOC_TYPE, this.inputsCovid.P_SIDDOC, 'quotation-covid', res.P_NCODE, null);
            } else {
              if (this.codProducto === 3) {
                this.agregaContratante(this.inputsCovid.P_NIDDOC_TYPE, this.inputsCovid.P_SIDDOC, 'quotation-covid', res.P_NCODE, null);
              } else {
                swal.fire('Información', this.variable.var_noInformacion360, 'error');
                this.creditHistory = null;
              }
            }
          }
        } else {
          this.inputsCovid.P_TYPE_SEARCH = '1';
          this.blockDoc = true;
          this.clearinputsCotizacion();
          swal.fire('Información', res.P_SMESSAGE, 'error');
        }
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
      }
    );
  }

  async agregaContratante(documentType, documentNumber, receiverStr, ncode, response) {
    if (this.isBroker) {
      const contracting: any = response.EListClient[0];
      contracting.EListAddresClient = await this.getAddress(response.EListClient[0].EListAddresClient);
      contracting.EListPhoneClient = [];
      contracting.EListEmailClient = [];
      contracting.EListContactClient = [];
      contracting.EListCIIUClient = [];
      contracting.P_CodAplicacion = 'SCTR';
      contracting.P_TipOper = 'INS';
      contracting.P_NSPECIALITY = '99';
      contracting.P_SBLOCKADE = '2';
      contracting.P_NTITLE = '99';
      contracting.P_NNATIONALITY = '1';
      contracting.P_SBLOCKLAFT = '2';
      contracting.P_SISCLIENT_IND = '2';
      contracting.P_SISRENIEC_IND = '1';
      contracting.P_SPOLIZA_ELECT_IND = '2';
      contracting.P_SPROTEG_DATOS_IND = '2';
      contracting.P_SISCLIENT_GBD = '2';
      contracting.P_SISCLIENT_CONTRA = '1';
      contracting.P_NUSERCODE = this.inputsCovid.userId;

      await this.clientService.getCliente360(contracting).toPromise().then(
        async res => {
          if (res.P_NCODE === '0') {
            const data: any = {};
            data.P_TipOper = 'CON';
            data.P_NUSERCODE = this.inputsCovid.userId;
            data.P_NIDDOC_TYPE = this.inputsCovid.P_NIDDOC_TYPE !== '-1' ? this.inputsCovid.P_NIDDOC_TYPE : '';
            data.P_SIDDOC = this.inputsCovid.P_SIDDOC.toUpperCase();
            data.P_SFIRSTNAME = this.inputsCovid.P_SFIRSTNAME != null ? this.inputsCovid.P_SFIRSTNAME.toUpperCase() : '';
            data.P_SLASTNAME = this.inputsCovid.P_SLASTNAME != null ? this.inputsCovid.P_SLASTNAME.toUpperCase() : '';
            data.P_SLASTNAME2 = this.inputsCovid.P_SLASTNAME2 != null ? this.inputsCovid.P_SLASTNAME2.toUpperCase() : '';
            data.P_SLEGALNAME = this.inputsCovid.P_SLEGALNAME != null ? this.inputsCovid.P_SLEGALNAME.toUpperCase() : '';

            await this.clientService.getCliente360(data).toPromise().then(
              async res => {
                if (res.P_NCODE === '0') {
                  if (res.EListClient.length === '1') {
                    await this.cargarDatosCliente(res);
                  }
                }
              }
            );
          } else if (res.P_NCODE === '1') {
            swal.fire('Información', this.variable.var_noInformacion360, 'error');
          } else {
            swal.fire('Información', this.variable.var_noInformacion360, 'warning');
          }
          this.isLoading = false;
        }
      );

    } else {
      this.isLoading = false;
      swal.fire({
        title: 'Información',
        text: 'El contratante que estás buscando no está registrado ¿Deseas agregarlo?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.value) {
          this.router.navigate(['/extranet/add-contracting'], { queryParams: { typeDocument: documentType, document: documentNumber, receiver: receiverStr, code: ncode } });
        }
      });
    }
  }

  async getAddress(addressList: any): Promise<void> {
    let numdir = 1;
    if (addressList.length > 0) {
      for (const item of addressList) {
        item.P_NROW = numdir++;
        item.P_CLASS = '';
        item.P_DESTIDIRE = 'PARTICULAR';
        item.P_SRECTYPE = item.P_SRECTYPE === '' || item.P_SRECTYPE == null ? '2' : item.P_SRECTYPE;
        item.P_STI_DIRE = item.P_STI_DIRE === '' || item.P_STI_DIRE == null ? '88' : item.P_STI_DIRE;
        item.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION === '' || item.P_SNUM_DIRECCION == null ? '0' : item.P_SNUM_DIRECCION;
        item.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO == null ? item.P_SDES_DEP_DOM : item.P_DESDEPARTAMENTO;
        item.P_DESPROVINCIA = item.P_DESPROVINCIA == null ? item.P_SDES_PRO_DOM : item.P_DESPROVINCIA;
        item.P_DESDISTRITO = item.P_DESDISTRITO == null ? item.P_SDES_DIS_DOM : item.P_DESDISTRITO;
        item.P_NCOUNTRY = item.P_NCOUNTRY == null || item.P_NCOUNTRY === '' ? '1' : item.P_NCOUNTRY;
        await this.getDepartmentList(item);
        await this.getProvinceList(item);
        await this.getDistrictList(item);
        item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION === '' ? 'NO ESPECIFICADO' : item.P_SNOM_DIRECCION.replace(/[().]/g, '').replace(/[-]/g, '');
        if (Number(this.inputsCovid.P_NIDDOC_TYPE) === 1) {
          item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDISTRITO.length).trim();
          item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESPROVINCIA.length).trim();
          item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ === '' ? item.P_SDESDIREBUSQ : item.P_SDESDIREBUSQ.replace(/[().]/g, '').replace(/[-]/g, '');
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDISTRITO.length).trim();
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESPROVINCIA.length).trim();
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
        }
      }
    }

    return addressList;
  }

  async cargarDatosCliente(res) {
    this.contractingdata = res.EListClient[0];
    this.inputsCovid.P_TYPE_SEARCH = '1';
    this.inputsCovid.P_PERSON_TYPE = '1';
    this.inputsCovid.P_SLEGALNAME = '';
    this.inputsCovid.P_SFIRSTNAME = '';
    this.inputsCovid.P_SLASTNAME = '';
    this.inputsCovid.P_SLASTNAME2 = '';
    this.inputsCovid.P_SISCLIENT_GBD =
      (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
    this.blockSearch = true;
    this.stateSearch = false;

    this.sclient = this.contractingdata.P_SCLIENT;
    this.inputsCovid.P_NIDDOC_TYPE = this.contractingdata.P_NIDDOC_TYPE;
    this.inputsCovid.P_SIDDOC = this.contractingdata.P_SIDDOC;
    this.inputsCovid.P_NPENDIENTE = res.P_NPENDIENTE;
    if (this.contractingdata.P_NIDDOC_TYPE === '1' && this.contractingdata.P_SIDDOC.length > 1) {
      if (this.contractingdata.P_SIDDOC.substr(0, 2) === '10' || this.contractingdata.P_SIDDOC.substr(0, 2) === '15' || this.contractingdata.P_SIDDOC.substr(0, 2) === '17') {
        this.blockDoc = true;
      } else {
        this.blockDoc = false;
      }
    }
    this.inputsCovid.P_SFIRSTNAME = this.contractingdata.P_SFIRSTNAME;
    this.inputsCovid.P_SLEGALNAME = this.contractingdata.P_SLEGALNAME;
    this.inputsCovid.P_SLASTNAME = this.contractingdata.P_SLASTNAME;
    this.inputsCovid.P_SLASTNAME2 = this.contractingdata.P_SLASTNAME2;
    this.inputsCovid.P_SISCLIENT_GBD = this.contractingdata.P_SISCLIENT_GBD;
    if (this.contractingdata.EListAddresClient.length > 0) {
      this.inputsCovid.P_SDESDIREBUSQ = this.contractingdata.EListAddresClient[0].P_SDESDIREBUSQ;
      if (this.codProducto === 3) {
        this.contractingdata.EListAddresClient = null;
      }
    }
    if (this.contractingdata.EListEmailClient.length > 0) {
      this.inputsCovid.P_SE_MAIL = this.contractingdata.EListEmailClient[0].P_SE_MAIL;
    }

    if (this.contractingdata.EListContactClient.length === 0) {
      this.flagContact = true;
    }

    if (this.contractingdata.EListEmailClient.length === 0) {
      this.flagEmail = true;
    }

    if (this.template.ins_historialCreditoQuotation) {
      const data: any = {};
      data.tipoid = this.inputsCovid.P_NIDDOC_TYPE === '1' ? '2' : '1';
      data.id = this.inputsCovid.P_SIDDOC;
      data.papellido = this.inputsCovid.P_SLASTNAME;
      data.sclient = this.sclient;
      data.usercode = this.inputsCovid.userId;
      await this.clientService.invokeServiceExperia(data).toPromise().then(
        res => {
          this.creditHistory = {};
          this.creditHistory.nflag = res.nflag;
          this.creditHistory.sdescript = res.sdescript;
        }
      );
    }
  }

  //#endregion

  //#region broker
  addBroker() {
    const modalRef = this.modal.open(SearchBrokerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listaBroker = this.brokerList;
    modalRef.componentInstance.brokerMain = this.inputsCovid.P_SIDDOC_COM;
    modalRef.result.then((brokerData) => {
      brokerData.P_COM_SALUD = 0;
      brokerData.P_COM_SALUD_PRO = 0;
      brokerData.P_COM_SALUD = 0;
      brokerData.P_COM_SALUD_PRO = '';
      brokerData.PROFILE = this.inputsCovid.userId;
      brokerData.NCORREDOR = brokerData.NCORREDOR === '' ? brokerData.COD_CANAL : brokerData.NCORREDOR;
      brokerData.BLOCK = true;
      brokerData.valItemPen = false;
      brokerData.valItemSal = false;
      this.brokerList.push(brokerData);
      this.onSelectPlan();
    }, error => {
      console.log(error);
    });
  }

  deleteBroker(row) {
    swal.fire({
      title: 'Eliminar Broker',
      text: '¿Estás seguro que deseas eliminar este broker?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    })
      .then((result) => {
        if (result.value) {
          this.brokerList.splice(row, 1);
          // this.equivalentMuni();
        }
      });
  }

  comisionPropuesta(proposed, fila) {
    proposed = !isNaN(Number(proposed)) ? Number(proposed) : 0;
    let sumComision = 0;

    this.brokerList.forEach(broker => {
      broker.P_COM_SALUD_PRO = broker.P_COM_SALUD_PRO;
      sumComision = sumComision + broker.P_COM_SALUD_PRO;
    });

    if (sumComision > 100) {
      this.brokerList[fila].valItemPen = true;
    } else {
      this.brokerList[fila].valItemPen = false;
    }
  }

  resetearPropuesto() {
    this.stateBrokerTasaPension = !this.stateBrokerTasaPension;
    this.resetearComisiones();
  }

  resetearComisiones() {
    this.brokerList.forEach(broker => {
      broker.P_COM_SALUD_PRO = '';
      broker.valItemPen = false;
    });
  }

  brokerIni() {
    // Datos del comercializador
    this.brokerList = [];
    const brokerMain: any = {};
    brokerMain.NTYPECHANNEL = JSON.parse(localStorage.getItem('currentUser'))['tipoCanal'];
    brokerMain.COD_CANAL = JSON.parse(localStorage.getItem('currentUser'))['canal'];
    brokerMain.NCORREDOR = JSON.parse(localStorage.getItem('currentUser'))['brokerId'];
    brokerMain.NTIPDOC = JSON.parse(localStorage.getItem('currentUser'))['sclient'].substr(1, 1);
    brokerMain.NNUMDOC = JSON.parse(localStorage.getItem('currentUser'))['sclient'].substr(3);
    brokerMain.RAZON_SOCIAL = JSON.parse(localStorage.getItem('currentUser'))['desCanal'];
    brokerMain.PROFILE = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
    brokerMain.SCLIENT = JSON.parse(localStorage.getItem('currentUser'))['sclient'];
    brokerMain.P_NPRINCIPAL = 0;
    brokerMain.P_COM_SALUD = 0;
    brokerMain.P_COM_SALUD_PRO = 0;
    brokerMain.P_COM_SALUD = 0;
    brokerMain.P_COM_SALUD_PRO = '';
    brokerMain.valItemPen = false;
    brokerMain.valItemSal = false;
    if (brokerMain.PROFILE === this.inputsCovid.perfilExterno) {
      brokerMain.BLOCK = false;
    } else {
      brokerMain.BLOCK = true;
    }
    this.stateBrokerTasaPension = true;
    this.brokerList.push(brokerMain);
  }

  //#endregion

  clearValidate(numInput) {
    this.inputsValidate[numInput] = false;
  }

  onSelectTypePerson(typePersonID) {
    this.inputsCovid.P_SFIRSTNAME = '';
    this.inputsCovid.P_SLEGALNAME = '';
    this.inputsCovid.P_SLASTNAME = '';
    this.inputsCovid.P_SLASTNAME2 = '';
    this.inputsCovid.P_SDESDIREBUSQ = '';
    this.inputsCovid.P_SE_MAIL = '';
    this.blockDoc = typePersonID === '1' ? true : false;
  }

  validarNroDocumento(event: any, tipoDocumento) {
    CommonMethods.validarNroDocumento(event, tipoDocumento);
  }

  textValidate(event: any, tipoTexto) {
    CommonMethods.textValidate(event, tipoTexto);
  }

  cambioDocumento(nroDocumento) {
    this.stateQuotation = true;
    this.clearinputsCotizacion();
    if (this.inputsCovid.P_NIDDOC_TYPE === '1' && nroDocumento.length > 1) {
      if (nroDocumento.substr(0, 2) === '10' || nroDocumento.substr(0, 2) === '15' || nroDocumento.substr(0, 2) === '17') {
        this.blockDoc = true;
        this.inputsCovid.P_SLEGALNAME = '';
      } else {
        this.blockDoc = false;
        this.inputsCovid.P_SFIRSTNAME = '';
        this.inputsCovid.P_SLASTNAME = '';
        this.inputsCovid.P_SLASTNAME2 = '';
      }
    }
    if (nroDocumento.length > 0) {
      this.inputsValidate[1] = false;
    }
  }

  onSelectTypeSearch() {
    this.clearinputsCotizacion();
    this.blockSearch = this.inputsCovid.P_TYPE_SEARCH === '1' ? true : false;
    this.inputsCovid.P_NIDDOC_TYPE = '-1';
    this.inputsCovid.P_SIDDOC = '';
    this.inputsCovid.P_PERSON_TYPE = '1';
    this.stateSearch = this.inputsCovid.P_TYPE_SEARCH === '1' ? false : true;
    this.blockDoc = true;
  }

  clearinputsCotizacion(insert = 0) {
    // Contratistas
    this.inputsCovid.P_SFIRSTNAME = '';
    this.inputsCovid.P_SLEGALNAME = '';
    this.inputsCovid.P_SLASTNAME = '';
    this.inputsCovid.P_SLASTNAME2 = '';
    this.inputsCovid.P_SDESDIREBUSQ = '';
    this.inputsCovid.P_SE_MAIL = '';
    this.flagEmail = false;
    this.flagContact = false;
    this.inputsCovid.desTipoPlan = '';
    this.inputsCovid.P_SISCLIENT_GBD = '';

    // Cotizacion
    if (this.brokerList.length > 0) {
      this.brokerList[0].P_COM_SALUD = 0;
      this.brokerList[0].P_COM_SALUD_PRO = '';
    }
    this.inputsCovid.P_NIDSEDE = null;
    this.inputsCovid.P_NCURRENCY = '1';
    this.inputsCovid.P_NTECHNICAL = null;
    this.inputsCovid.P_NECONOMIC = null;
    this.inputsCovid.P_DELIMITER = '';
    this.inputsCovid.P_SDELIMITER = '0';
    this.inputsCovid.P_NLOCAL = null;
    this.inputsCovid.P_NMUNICIPALITY = null;
    this.inputsCovid.P_NPROVINCE = null;
    if (this.productList.length > 1) {
      this.inputsCovid.P_NPRODUCT = '-1';
    }
    this.inputsCovid.tipoRenovacion = '';
    this.inputsCovid.frecuenciaPago = '';
    this.inputsCovid.checkProposed = false;
    this.inputsCovid.proposedCommission = false;


    // Sedes
    // this.provinceList = [];
    // this.districtList = [];
    this.inputsCovid.FDateIni = new Date();
    this.inputsCovid.FDateFin = new Date();
    this.inputsCovid.FDateFin.setMonth(this.inputsCovid.FDateIni.getMonth() + 1);
    this.inputsCovid.FDateFin.setDate(this.inputsCovid.FDateFin.getDate() - 1);
    this.inputsCovid.codProceso = null;
    this.creditHistory = null;
    this.inputsCovid.P_PLAN = '';
    this.contractingdata = null;
    this.infoPrimaList = [];
    this.infoPlanList = [];
    this.files = [];
    this.plansList = [];

    if (insert === 1) {
      this.inputsCovid.P_NIDDOC_TYPE = '-1';
      this.inputsCovid.P_SIDDOC = '';
      this.inputsCovid.excelSubir = '';
      this.excelSubir = null;
      this.brokerIni();
    }
  }

  selTipoDocumento(tipoDocumento) {
    this.blockDoc = true;
    this.clearinputsCotizacion();
    const response = CommonMethods.selTipoDocumento(tipoDocumento);
    this.maxlength = response.maxlength;
    this.minlength = response.minlength;
    this.inputsValidate[0] = response.inputsValidate;
  }

  onSelectProducto(event) {
    // if (this.template.ins_clearTasas) {
    //   this.tasasList = [];
    //   this.listaTasasSalud = [];
    //   this.listaTasasPension = [];
    //   this.mensajePrimaPension = ''
    //   this.mensajePrimaSalud = ''
    // }

    if (this.inputsCovid.P_NPRODUCT !== '-1') {
      this.reloadTariff = false;
      // this.equivalentMuni();
    }
  }

  async selRenovationType() {
    for (const item of this.tipoRenovacion) {
      if (Number(item.COD_TIPO_RENOVACION) === Number(this.inputsCovid.tipoRenovacion)) {
        this.titleRenovation = item.DES_TIPO_RENOVACION;
      }
    }
    this.infoPrimaList = [];
    this.infoPlanList = [];
    await this.obtenerFrecuenciaPago();
    await this.validarTipoRenovacion(null);
    await this.getPlanList();
    this.validarExcel();
  }

  validarTipoRenovacion(event: any) {
    // if (this.template.ins_mapfre) {
    //   this.equivalentMuni();
    // }
    // if (this.template.ins_iniVigenciaAseg && this.codProducto == 3) {
    //   this.inputsCovid.FDateIniAseg = this.inputsCovid.FDateIni;
    // };

    const fechadesde = this.desde.nativeElement.value.split('/');
    const fechahasta = this.hasta.nativeElement.value.split('/');
    const fechaDes = (fechadesde[1]) + '/' + fechadesde[0] + '/' + fechadesde[2];
    const fechaHas = (fechahasta[1]) + '/' + fechahasta[0] + '/' + fechahasta[2];
    const fechad = new Date(fechaDes);
    const fechah = new Date(fechaHas);

    if (this.inputsCovid.tipoRenovacion === this.variable.var_renovacionMensual) {
      fechad.setMonth(fechad.getMonth() + 1);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.FDateFin = new Date(fechad);
      // if (this.inputsCovid.FDateFinAseg) {
      //   this.ValidarFrecPago(null);
      // }

    }
    if (this.inputsCovid.tipoRenovacion === this.variable.var_renovacionBiMensual) {
      fechad.setMonth(fechad.getMonth() + 2);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.FDateFin = new Date(fechad);
      // if (this.inputsCovid.FDateFinAseg) {
      //   this.ValidarFrecPago(null);
      // }

    }
    if (this.inputsCovid.tipoRenovacion === this.variable.var_renovacionTriMensual) {
      fechad.setMonth(fechad.getMonth() + 3);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.FDateFin = new Date(fechad);
    }

    if (this.inputsCovid.tipoRenovacion === this.variable.var_renovacionSemestral) {
      fechad.setMonth(fechad.getMonth() + 6);
      fechad.setDate(fechad.getDate() - this.variable.var_restarDias);
      this.inputsCovid.FDateFin = new Date(fechad);
    }

    this.validarExcel();
  }

  //#region Excel
  seleccionExcel(archivo: File) {
    if (archivo === undefined) {
      this.excelSubir = null;
      this.infoPrimaList = [];
      this.infoPlanList = [];
    }

    this.excelSubir = archivo;
  }

  validarExcel(validar = false) {
    let msg = '';

    if (this.creditHistory === null) {
      msg += 'Debe ingresar un contratante  <br>';
    }

    if (this.inputsCovid.tipoRenovacion === '') {
      msg += 'Debe elegir el tipo de renovación  <br>';
    }

    if (this.inputsCovid.frecuenciaPago === '') {
      msg += 'Debe elegir la frecuencia de pago  <br>';
    }

    if (this.inputsCovid.P_PLAN === '') {
      msg += 'Debe elegir el tipo de plan  <br>';
    }

    if (this.inputsCovid.P_NTECHNICAL === null) {
      msg += 'Debe elegir la actividad a realizar  <br>';
    }

    if (this.excelSubir === undefined || this.excelSubir === null) {
      msg += 'Adjunte una trama para validar  <br>';
    }

    if (msg === '') {
      this.validarTrama();
    } else {
      this.infoPrimaList = [];
      this.infoPlanList = [];

      if (validar) {
        swal.fire('Información', msg, 'error');
      }
    }
  }

  async getPlanList() {
    this.inputsCovid.P_PLAN = '';
    this.infoPrimaList = [];
    this.infoPlanList = [];
    if (this.brokerList.length > 0) {
      this.brokerList[0].P_COM_SALUD = 0;
    }
    if (this.inputsCovid.P_NPRODUCT !== '-1' &&
      this.inputsCovid.tipoRenovacion !== '' &&
      this.inputsCovid.P_NCURRENCY !== null
    ) {
      const data: any = {};
      data.P_NBRANCH = 1;
      data.P_NPRODUCT = this.inputsCovid.P_NPRODUCT;
      data.P_NTIP_RENOV = this.inputsCovid.tipoRenovacion;
      data.P_NCURRENCY = this.inputsCovid.P_NCURRENCY;
      data.P_NIDPLAN = null;

      await this.quotationService.getPlanList(data).toPromise().then(
        res => {
          this.plansList = res;
        }
      );
    }
  }

  onSelectPlan() {
    if (this.brokerList.length > 0) {
      for (const plan of this.plansList) {
        if (plan.NIDPLAN === this.inputsCovid.P_PLAN) {
          this.planItem = plan;
          this.inputsCovid.checkProposed = true;
          this.brokerList[0].P_COM_SALUD = Number(plan.NCOMMI_RATE) * 100;
        }
      }
    }

    this.validarExcel();
  }

  validarTrama(codComission?: any) {
    // this.errorExcel = false;
    this.isLoading = true;
    this.infoPrimaList = [];
    this.infoPlanList = [];
    const myFormData: FormData = new FormData();
    const data: any = {};
    data.codUsuario = this.inputsCovid.userId;
    data.fechaEfecto = CommonMethods.formatDate(this.inputsCovid.FDateIni);
    data.fechaFin = CommonMethods.formatDate(this.inputsCovid.FDateFin);
    // data.comision = this.inputsCovid.P_COMISION;
    data.tipoRenovacion = this.inputsCovid.tipoRenovacion;
    data.freqPago = this.inputsCovid.frecuenciaPago;
    data.codProducto = this.inputsCovid.P_NPRODUCT;
    data.codRamo = this.nbranch;

    for (const plan of this.plansList) {
      if (plan.NIDPLAN === this.inputsCovid.P_PLAN) {
        data.premiumPlan = Number(plan.NPREMIUM);
      }
    }

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
              this.inputsCovid.codProceso = null;
              const modalRef = this.modal.open(ValErrorComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
              modalRef.componentInstance.formModalReference = modalRef;
              modalRef.componentInstance.erroresList = this.erroresList;
            } else {
              this.infoPrimaList = res.rateInfoList;
              this.infoPlanList = res.planInfoList;
              this.inputsCovid.codProceso = res.NIDPROC;

              let total = 0;
              for (const item of this.infoPrimaList) {
                total = total + item.MONTO_PLANILLA;
              }

              let sumProp = 0;
              // let igv = 0;
              // console.log(this.planItem)
              for (const item of this.infoPlanList) {
                item.PRIMA = CommonMethods.formatValor((Number(this.planItem.NPREMIUM) * Number(item.NUM_TRABAJADORES)) / this.igvCovid, 6);
                sumProp = sumProp + Number(item.PRIMA);
                // igv = igv + Number(item.NUM_TRABAJADORES) * Number(this.planItem.NIGV);
              }

              this.inputsCovid.totalNeto = CommonMethods.formatValor(sumProp, 6);
              this.inputsCovid.totalComercial = CommonMethods.formatValor(sumProp, 6);
              this.inputsCovid.igvCalculado = CommonMethods.formatValor(sumProp * (this.igvCovid - 1), 6);
              this.inputsCovid.totalBruto = CommonMethods.formatValor(Number(total), 2);

              this.inputsCovid.totalNetoProp = 0;
              this.inputsCovid.totalComercialProp = 0;
              this.inputsCovid.igvCalculadoProp = 0;
              this.inputsCovid.totalBrutoProp = 0;


              swal.fire('Información', 'Se validó correctamente la trama', 'success');

            }
          } else {
            this.inputsCovid.codProceso = null;
            swal.fire('Información', 'El archivo enviado contiene errores', 'error');
          }
        }
      }, error => {
        this.isLoading = false;
      }
    );
  }

  proposedRate(row, proposed) {
    proposed = !isNaN(Number(proposed)) ? Number(proposed) : 0;

    let totalProp = 0;
    for (const item of this.infoPrimaList) {
      item.MONTO_PLANILLA_PRO = item.NUM_TRABAJADORES * proposed;
      item.TASA_PRO = proposed;
      totalProp = totalProp + item.MONTO_PLANILLA_PRO;
    }

    let sumProp = 0;
    for (const item of this.infoPlanList) {
      item.TASA_PRO = proposed;
      item.PRIMA_PRO = CommonMethods.formatValor((proposed * Number(item.NUM_TRABAJADORES)) / this.igvCovid, 6);
      sumProp = sumProp + Number(item.PRIMA_PRO);
    }

    this.inputsCovid.totalNetoProp = CommonMethods.formatValor(sumProp, 6);
    this.inputsCovid.totalComercialProp = CommonMethods.formatValor(sumProp, 6);
    this.inputsCovid.igvCalculadoProp = CommonMethods.formatValor(sumProp * (this.igvCovid - 1), 6);
    this.inputsCovid.totalBrutoProp = CommonMethods.formatValor(Number(totalProp), 2);
  }

  getDate() {
    return new Date();
  }
  //#endregion

  //#region Agregar Contacto
  openModal(modalName: String) {
    const typeContact: any = {};
    switch (modalName) {
      case 'add-contact':
        const modalRef = this.modal.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        typeContact.P_NIDDOC_TYPE = this.inputsCovid.P_NIDDOC_TYPE;
        typeContact.P_SIDDOC = this.inputsCovid.P_SIDDOC;
        modalRef.componentInstance.typeContact = typeContact;
        modalRef.componentInstance.listaContactos = this.contactList;
        modalRef.componentInstance.itemContacto = null;
        break;
    }
  }

  // Section Contacto
  editContact(row) {
    const typeContact: any = {};
    let itemContacto: any = {};
    const modalRef = this.modal.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    typeContact.P_NIDDOC_TYPE = this.inputsCovid.P_NIDDOC_TYPE;
    typeContact.P_SIDDOC = this.inputsCovid.P_SIDDOC;
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
  //#endregion


  cancelQuotation() {
    this.clearinputsCotizacion(1);
  }

  async saveQuotation() {
    this.isLoading = true;

    let message = '';
    message = await this.validateQuotation();
    this.isLoading = false;
    if (message === '') {
      if (this.contractingdata !== undefined) {
        if (this.flagEmail || this.flagContact) {
          this.contractingdata.P_NUSERCODE = this.inputsCovid.userId;
          this.contractingdata.P_TipOper = 'INS';
          this.contractingdata.P_NCLIENT_SEG = -1;

          if (this.flagEmail && this.inputsCovid.P_SE_MAIL !== '') {
            this.contractingdata.EListEmailClient = [];
            const contractingEmail: any = {};
            contractingEmail.P_CLASS = '';
            contractingEmail.P_DESTICORREO = 'Correo Personal';
            contractingEmail.P_NROW = 1;
            contractingEmail.P_NUSERCODE = this.inputsCovid.userId;
            contractingEmail.P_SE_MAIL = this.inputsCovid.P_SE_MAIL;
            contractingEmail.P_SORIGEN = 'SCTR';
            contractingEmail.P_SRECTYPE = '4';
            contractingEmail.P_TipOper = '';
            this.contractingdata.EListEmailClient.push(contractingEmail);
          } else {
            this.contractingdata.EListEmailClient = null;
          }

          if (this.flagContact && this.contactList.length > 0) {
            this.contractingdata.EListContactClient = [];
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
          } else {
            this.contractingdata.EListContactClient = null;
          }

          if (((this.flagContact && this.contactList.length === 0) || (this.flagEmail && this.inputsCovid.P_SE_MAIL === '')) && this.creditHistory != null) {
            this.isLoading = false;
            swal.fire({
              title: 'Información',
              text: Number(this.creditHistory.nflag) === 0 ? this.variable.var_contactHighScore : this.variable.var_contactLowScore,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Continuar',
              allowOutsideClick: false,
              cancelButtonText: 'Cancelar'
            })
              .then(async (result) => {
                if (result.value) {
                  this.isLoading = true;
                  await this.updateContracting();
                } else {
                  this.isLoading = false;
                  return;
                }
              });
          } else {
            this.isLoading = true;
            await this.updateContracting();
          }
        } else {
          this.generateQuotation();
        }
      } else {
        swal.fire('Información', 'Los datos del contratante son incorrectos', 'error');
      }
    } else {
      swal.fire('Información', message, 'error');
    }

  }

  generateQuotation() {
    this.isLoading = false;
    swal.fire({
      title: 'Información',
      text: '¿Deseas generar la cotización?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar'
    })
      .then(async (result) => {
        if (result.value) {
          const dataQuotation: any = {};
          dataQuotation.P_SCLIENT = this.sclient;
          dataQuotation.P_NCURRENCY = this.inputsCovid.P_NCURRENCY;
          dataQuotation.P_NBRANCH = 1;
          dataQuotation.P_DSTARTDATE = CommonMethods.formatDate(this.inputsCovid.FDateIni);
          dataQuotation.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsCovid.FDateFin);
          dataQuotation.P_NIDCLIENTLOCATION = 1;
          dataQuotation.P_SCOMMENT = this.inputsCovid.P_SCOMMENT.toUpperCase().replace(/[<>%]/g, '');
          dataQuotation.P_SRUTA = '';
          dataQuotation.P_NUSERCODE = this.inputsCovid.userId;
          dataQuotation.P_NACT_MINA = 0;
          dataQuotation.P_NTIP_RENOV = this.inputsCovid.tipoRenovacion;
          dataQuotation.P_NPAYFREQ = this.inputsCovid.frecuenciaPago;
          dataQuotation.P_SCOD_ACTIVITY_TEC = this.inputsCovid.P_NTECHNICAL; // Vida Ley
          dataQuotation.P_SCOD_CIUU = null; // Vida Ley
          dataQuotation.P_NTIP_NCOMISSION = 0; // Vida Ley
          dataQuotation.P_NPRODUCT = this.inputsCovid.P_NPRODUCT; // Vida Ley
          dataQuotation.P_NEPS = this.epsItem.NCODE;
          dataQuotation.P_NPENDIENTE = this.inputsCovid.P_NPENDIENTE; // Mapfre
          dataQuotation.CodigoProceso = this.inputsCovid.codProceso; // MRC
          dataQuotation.NumeroCotizacion = null;
          dataQuotation.planId = this.inputsCovid.P_PLAN;
          dataQuotation.QuotationDet = [];
          dataQuotation.QuotationCom = [];

          if (this.brokerList.length > 0) {
            this.brokerList.forEach(dataBroker => {
              const itemQuotationCom: any = {};
              itemQuotationCom.P_NIDTYPECHANNEL = dataBroker.NTYPECHANNEL;
              itemQuotationCom.P_NINTERMED = dataBroker.COD_CANAL; // Desarrollo
              itemQuotationCom.P_SCLIENT_COMER = dataBroker.SCLIENT;
              itemQuotationCom.P_NCOMISION_SAL = dataBroker.P_COM_SALUD === '' ? '0' : dataBroker.P_COM_SALUD;
              itemQuotationCom.P_NCOMISION_SAL_PR = dataBroker.P_COM_SALUD_PRO === '' ? '0' : dataBroker.P_COM_SALUD_PRO;
              itemQuotationCom.P_NCOMISION_PEN = 0;
              itemQuotationCom.P_NCOMISION_PEN_PR = 0;
              itemQuotationCom.P_NPRINCIPAL = 1;
              dataQuotation.QuotationCom.push(itemQuotationCom);
            });
          }

          for (let i = 0; i < this.infoPrimaList.length; i++) {
            const itemQuotationDet: any = {};
            itemQuotationDet.P_NBRANCH = this.covidId.nbranch;
            itemQuotationDet.P_NPRODUCT = this.covidId.id;
            itemQuotationDet.P_NMODULEC = this.infoPrimaList[i].DES_RIESGO;
            itemQuotationDet.P_NTOTAL_TRABAJADORES = this.infoPrimaList[i].NUM_TRABAJADORES;
            itemQuotationDet.P_NMONTO_PLANILLA = 0;
            itemQuotationDet.P_NTASA_CALCULADA = this.infoPrimaList[i].TASA_CALC;
            itemQuotationDet.P_NTASA_PROP = this.infoPrimaList[i].TASA_PRO;
            itemQuotationDet.P_NPREMIUM_MENSUAL = this.infoPlanList[i].PRIMA;
            itemQuotationDet.P_NPREMIUM_MIN = 0;
            itemQuotationDet.P_NPREMIUM_MIN_PR = 0;
            itemQuotationDet.P_NPREMIUM_END = 0;
            itemQuotationDet.P_NSUM_PREMIUMN = this.inputsCovid.totalComercial;
            itemQuotationDet.P_NSUM_IGV = this.inputsCovid.igvCalculado;
            itemQuotationDet.P_NSUM_PREMIUM = this.inputsCovid.totalBruto;
            itemQuotationDet.P_NRATE = 0;
            itemQuotationDet.P_NDISCOUNT = 0;
            itemQuotationDet.P_NACTIVITYVARIATION = 0;
            itemQuotationDet.P_FLAG = '0';
            dataQuotation.QuotationDet.push(itemQuotationDet);
          }

          const myFormData: FormData = new FormData();
          this.files.forEach(file => {
            myFormData.append(file.name, file);
          });

          myFormData.append('objeto', JSON.stringify(dataQuotation));

          this.quotationService.insertQuotation(myFormData).subscribe(
            async res => {
              if (res.P_COD_ERR === 0) {
                // quotationNumber = res.P_NID_COTIZACION;
                this.isLoading = false;
                // this.quotationEmit(res);
                if (res.P_SAPROBADO === 'S') {
                  if (!this.flagContact && (!this.flagEmail && this.inputsCovid.P_SE_MAIL !== '')) {
                    this.quotationEmit(res.P_NID_COTIZACION);
                  } else {
                    swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + res.P_NID_COTIZACION, 'success');
                    this.clearinputsCotizacion(1);
                  }
                } else {
                  swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + res.P_NID_COTIZACION + ',' + res.P_SMESSAGE, 'success');
                  this.clearinputsCotizacion(1);
                }
              } else {
                this.isLoading = false;
                swal.fire('Información', res.P_MESSAGE, 'error');
              }
            },
            err => {
              this.isLoading = false;
              swal.fire('Información', 'Hubo un error con el servidor', 'error');
            }
          );
        }
      });
  }

  quotationEmit(quotationNumber) {
    if ((this.contactList.length > 0 || this.contractingdata.EListContactClient.length > 0) && this.inputsCovid.P_SE_MAIL !== '') {
      const configData: any = [];
      configData.contactList = this.contactList.length > 0 ? this.contactList : this.contractingdata.EListContactClient;
      configData.creditHistory = this.creditHistory;
      configData.codProduct = this.codProducto;
      configData.emitQuotation = this.dataEmision(quotationNumber);
      configData.textOmitir = this.getMessageOmitir(quotationNumber);
      configData.textSlogan = 'Se generó la cotización Nº ' + quotationNumber + ', puede emitir directamente usando los siguientes métodos:';
      const modalRef = this.modal.open(MethodsPaymentComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
      modalRef.componentInstance.formModalReference = modalRef;
      modalRef.componentInstance.configData = configData;

      modalRef.result.then(data => {
        this.clearinputsCotizacion(1);
      }, (reason) => {
        this.clearinputsCotizacion(1);
      });
    } else {
      if (this.creditHistory.nflag === 0) {
        swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber, 'success')
          .then((value) => {
            this.clearinputsCotizacion(1);
          });
      } else {

        swal.fire('Información', 'Se ha generado correctamente la cotización N° ' + quotationNumber, 'success')
          .then((value) => {
            this.clearinputsCotizacion(1);
          });
      }
    }
  }

  dataEmision(quotationNumber): any {
    const myFormData: FormData = new FormData();
    const dataList: any = [];
    const data: any = {};
    data.P_NID_COTIZACION = quotationNumber;
    data.P_NID_PROC = this.inputsCovid.codProceso;
    data.P_NBRANCH = this.covidId.nbranch;
    data.P_NPRODUCT = this.covidId.id;
    data.P_SCOLTIMRE = this.inputsCovid.tipoRenovacion;
    data.P_DSTARTDATE = CommonMethods.formatDate(this.inputsCovid.FDateIni);
    data.P_DEXPIRDAT = CommonMethods.formatDate(this.inputsCovid.FDateFin);
    data.P_NPAYFREQ = this.inputsCovid.frecuenciaPago;
    data.P_SFLAG_FAC_ANT = 1;
    data.P_FACT_MES_VENCIDO = 0;
    data.P_NPREM_NETA = this.inputsCovid.totalComercial;
    data.P_IGV = this.inputsCovid.igvCalculado;
    data.P_NPREM_BRU = this.inputsCovid.totalBruto;
    data.P_SCOMMENT = '';
    data.P_NUSERCODE = this.inputsCovid.userId;
    dataList.push(data);
    myFormData.append('objeto', JSON.stringify(dataList));

    return myFormData;
  }

  getMessageOmitir(quotationNumber): string {
    let txtOmitir = '';
    if (Number(this.creditHistory.nflag) === 0) {
      txtOmitir = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', puede consultarla y emitirla en cualquier momento.';
    } else {
      txtOmitir = 'Se ha generado correctamente la cotización N° ' + quotationNumber + ', puede consultarla y emitirla en cualquier momento.';
    }
    return txtOmitir;
  }

  async updateContracting() {
    if ((this.flagEmail && this.inputsCovid.P_SE_MAIL !== '') || (this.flagContact && this.contactList.length > 0)) {
      this.contractingdata.EListAddresClient = null;
      this.contractingdata.EListPhoneClient = null;
      this.contractingdata.EListCIIUClient = null;
      await this.clientService.getCliente360(this.contractingdata).toPromise().then(
        res => {
          if (Number(res.P_NCODE) === 0 || Number(res.P_NCODE) === 2) {
            this.flagEmail = false;
            this.flagContact = false;
            this.isLoading = false;
            this.generateQuotation();
          } else {
            this.isLoading = false;
            swal.fire('Información', res.P_SMESSAGE, 'error');
            return;
          }
        }
      );
    } else {
      this.generateQuotation();
    }
  }

  validateQuotation(): any {
    let message = '';
    if (this.creditHistory === null) {
      message += 'Debe ingresar un contratante  <br>';
    } else {
      if (this.inputsCovid.P_SE_MAIL.trim() !== '') {
        if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.inputsCovid.P_SE_MAIL) === false) {
          message += 'El correo electrónico es inválido <br />';
        }
      }
    }

    if (this.brokerList.length === 0) {
      message += 'Debe ingresar un broker  <br>';
    } else {
      let sumComision = 0;
      this.brokerList.forEach(broker => {
        sumComision = sumComision + broker.P_COM_SALUD_PRO;
      });

      if (sumComision > 100) {
        message += 'La suma de comisiones no debe superar a 100  <br>';
      }
    }

    if (this.inputsCovid.tipoRenovacion === '') {
      message += 'Debe elegir el tipo de renovación  <br>';
    }

    if (this.inputsCovid.P_PLAN === '') {
      message += 'Debe elegir el tipo de plan  <br>';
    }

    if (this.inputsCovid.P_NTECHNICAL === null) {
      message += 'Debe elegir la actividad a realizar  <br>';
    }

    if (this.excelSubir === undefined || this.excelSubir === null) {
      message += 'Debe adjuntar una trama para validar  <br>';
    } else {
      if (this.infoPrimaList.length === 0) {
        message += 'Debe validar la trama  <br>';
      }
    }

    return message;
  }


}
