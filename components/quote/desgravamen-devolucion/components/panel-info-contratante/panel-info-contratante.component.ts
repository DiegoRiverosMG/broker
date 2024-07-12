import { SearchContractingComponent } from './../../../../../modal/search-contracting/search-contracting.component';
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import swal from 'sweetalert2';

import { CommonMethods } from '../../../../common-methods';

import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { OthersService } from '../../../../../services/shared/others.service';
import { CobranzasService } from '../../../../../services/cobranzas/cobranzas.service';
import { AddressService } from './../../../../../services/shared/address.service';

import { DesgravamenDevolucionConstants } from '../../core/constants/desgravamen-devolucion.constants';
import { StorageService } from '../../core/services/storage.service';
import { FileService } from '../../core/services/file.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuotationService } from '../../../../../services/quotation/quotation.service';

import { ServicebrokerService } from '../../core/services/servicebroker.service';


@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'panel-info-contratante',
  templateUrl: './panel-info-contratante.component.html',
  styleUrls: ['./panel-info-contratante.component.css']
})
export class PanelInfoContratanteComponent implements OnInit {
  @Input() dataEntrante:any ;

  public image:string;

  @Input() databroker: any;

  @Input() detail: boolean;


  @Input() contratante;
  @Output() contratanteChange: EventEmitter<any> = new EventEmitter();

  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
  @Output() modifyDatos: EventEmitter<any> = new EventEmitter();

  @Input() cotizacion: any;

  listBroker2: any = [];


  clear: any = {};
  disabled: any = {};

  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem: any = JSON.parse(sessionStorage.getItem('eps'));
  epsItem: any = JSON.parse(localStorage.getItem('eps'));

  CONSTANTS: any = DesgravamenDevolucionConstants;

  variable: any = {};
  template: any = {};
  modoVista = '';
  modoTrama: boolean;
  external: number;
  errorMessageBroker = 'Cliente no está registrado en PROTECTA, favor de comunicarse con el área canal corporativo';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public clientInformationService: ClientInformationService,
    public quotationService: QuotationService,
    public addressService: AddressService,
    private cobranzasService: CobranzasService,
    public storageService: StorageService,
    private fileService: FileService,
    private othersService: OthersService,
    private serviciobroker:  ServicebrokerService,
    private modalService: NgbModal) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
  }

  ngOnInit() {
    this.contratante = this.contratante || {};
    this.contratanteChange.emit(this.contratante);
    this.disabled.nombre = true;
    this.disabled.apePaterno = true;
    this.disabled.apeMaterno = true;
    this.disabled.razonSocial = true;

    if (this.route.snapshot.data.esEvaluacion === true) {
      this.contratante.creditHistory = {};
      this.modoVista = this.route.snapshot.params.mode;
      this.modoTrama = this.route.snapshot.queryParams.trama == '1';
    }

    this.initConfig();
    this.verifyContratante();

  }

  initConfig() {
    // Configuracion del Template
    this.template = CommonMethods.configuracionTemplate('7', this.epsItem.NCODE);

    // Configuracion de las variables
    this.variable = CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);
  }

  onClear(tipo: any) {
    this.disabled.email = true;
    this.contratante.id = null;
    this.contratante.creditHistory = null;
    this.contratante.EListContactClient = [];
    this.contratante.codTipoCuenta = '';
    this.contratante.nombres = '';
    this.contratante.apellidoPaterno = '';
    this.contratante.apellidoMaterno = '';
    this.contratante.razonSocial = '';
    this.contratante.NOMBRE_RAZON = '';
    this.contratante.direccion = '';
    this.contratante.email = '';
    this.contratante.codTipoCuenta = '';
    this.contratante.ubigeo = '';

    if (tipo === 1) {
      this.contratante.tipoDocumento = {};
      this.contratante.numDocumento = '';
      if (this.contratante.codTipoBusqueda === 'POR_NOM') {
        this.disabled.nombre = false;
        this.disabled.apePaterno = false;
        this.disabled.apeMaterno = false;
        this.disabled.razonSocial = false;
      } else {
        this.disabled.nombre = true;
        this.disabled.apePaterno = true;
        this.disabled.apeMaterno = true;
        this.disabled.razonSocial = true;
      }
    }

  }


  verifyContratante() {
    this.route.queryParams.subscribe(params => {
      let autocompletar = false;
      if (params.typeDocument && params.document) {
        autocompletar = true;
        this.contratante.tipoDocumento = { Id: params.typeDocument };
        this.contratante.numDocumento = params.document;
      }
      if (this.detail || autocompletar) {
        if (this.contratante.numDocumento) {
          setTimeout(() => {
            this.clickBuscar();
          });
        }
      }
    });
  }

  async clickBuscar() {
    let msg = '';
    if (this.contratante.codTipoBusqueda === 'POR_DOC') {
      if (!this.contratante.tipoDocumento.Id) {
        msg += 'Debe ingresar tipo de documento <br />';
      }
      if (!(this.contratante.numDocumento || '').trim()) {
        msg += 'Debe ingresar número de documento <br />';
      }

      if (msg === '') {
        if (this.contratante.tipoDocumento.Id === 1 && this.contratante.numDocumento.trim().length > 1) {
          if (CommonMethods.validateRucDesDev(this.contratante.numDocumento)) {
            msg += 'El número de RUC no es válido, debe empezar con 20';
          }
        }
      }
    } else {
      if (this.contratante.tipoPersona.codigo === 'PN') {
        if (!(this.contratante.nombres || '').trim()) {
          msg += 'Debe ingresar nombre del contratante <br />';
        }
        if (!(this.contratante.apellidoPaterno || '').trim()) {
          msg += 'Debe ingresar apellido paterno del contratante <br />';
        }
      } else {
        if (!(this.contratante.razonSocial || '').trim()) {
          msg += 'Debe ingresar razón social <br />';
        }
      }
    }

    if (msg !== '') {
      swal.fire('Información', msg, 'error');
      return;
    } else {
      this.onClear(2);

      // Valida bloqueado
      const data = {
        branchCode: this.CONSTANTS.RAMO,
        productCode: this.CONSTANTS.COD_PRODUCTO,
        documentType: (this.contratante.tipoDocumento || {}).Id,
        documentNumber: (this.contratante.numDocumento || '').toUpperCase()
      };
      const response: any = await this.validarBloqueado(data);
      if (response.lockMark === this.CONSTANTS.USUARIO_BLOQUEADO) {
        swal.fire('Información', response.observation, 'error');
        if (this.route.snapshot.data.esEvaluacion) {
          this.buscarContratante();
        }
      } else {
        this.buscarContratante();
      }

      // this.isLoadingChange.emit(false);
    }
  }

  buscarContratante() {
    this.isLoadingChange.emit(true);

    const params = {
      P_TipOper: 'CON',
      P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
      P_NIDDOC_TYPE: (this.contratante.tipoDocumento || {}).Id,
      P_SIDDOC: (this.contratante.numDocumento || '').toUpperCase(),
      P_SFIRSTNAME: (this.contratante.nombres || '').toUpperCase(),
      P_SLASTNAME: (this.contratante.apellidoPaterno || '').toUpperCase(),
      P_SLASTNAME2: (this.contratante.apellidoMaterno || '').toUpperCase(),
      P_SLEGALNAME: (this.contratante.razonSocial || '').toUpperCase(),
    };

    this.clientInformationService.getCliente360(params).subscribe(
      async resp => {
        if (resp.P_NCODE === this.CONSTANTS.TIPO_RESPUESTA.EXITOSO) {
          if (resp.EListClient.length === 0) {
            if (params.P_SIDDOC !== '') {
              if (params.P_NIDDOC_TYPE !== this.CONSTANTS.TIPO_DOCUMENTO.RUC && params.P_NIDDOC_TYPE !== this.CONSTANTS.TIPO_DOCUMENTO.DNI) {
                this.agregaContratante(params.P_NIDDOC_TYPE, params.P_SIDDOC, resp.P_NCODE, null);
              } else {
                swal.fire('Información', this.variable.var_noInformacion360, 'error');
              }
            } else {
              swal.fire('Información', this.variable.var_noInformacion360, 'error');
            }

            this.isLoadingChange.emit(false);

          } else {
            if (resp.EListClient[0].P_SCLIENT == null) {
              if (this.storageService.esBroker) {
                this.agregaContratante(params.P_NIDDOC_TYPE, params.P_SIDDOC, resp.P_NCODE, resp);
              } else {
                this.agregaContratante(params.P_NIDDOC_TYPE, params.P_SIDDOC, resp.P_NCODE, null);
              }
            } else {
              if (resp.EListClient.length === 1) {
                if (resp.EListClient[0].P_SIDDOC != null) {
                  let params: any = {
                    branchCode: this.CONSTANTS.RAMO,
                    productCode: this.CONSTANTS.COD_PRODUCTO,
                    clientCode: resp.EListClient[0].P_SCLIENT,
                    transactionCode: this.cotizacion.tipoTransaccion == 0 ? 1 : this.cotizacion.tipoTransaccion,
                    profileCode: Number(this.storageService.user.profileId),
                    nintermed: JSON.parse(localStorage.getItem('currentUser'))['canal']
                  };


                  let paramsDeuda: any = {
                    branchCode: this.CONSTANTS.RAMO,
                    productCode: this.CONSTANTS.COD_PRODUCTO,
                    clientCode: resp.EListClient[0].P_SCLIENT,
                    nidPolicy: this.cotizacion.poliza.nroPoliza
                  };

                  this.cargarDatosCliente(resp);

                  //{"branchCode":1,"productCode":"117","clientCode":"01020604825688","nidPolicy":"6000002124"}
                  // this.contratante.debtMark = this.CONSTANTS.USUARIO_OK;
                  if (this.contratante.lockMark !== this.CONSTANTS.USUARIO_BLOQUEADO &&
                    this.modoVista != this.CONSTANTS.MODO_VISTA.ANULACION) {
                    if (this.modoVista == this.CONSTANTS.MODO_VISTA.EXCLUIR) {
                      await this.cobranzasService.ValidateDebtPolicy(paramsDeuda).toPromise().then(
                        res => {
                          if (Number(res.amount.replace(',', '')) > 0) {
                            this.contratante.debtMark = this.CONSTANTS.USUARIO_BLOQUEADO;
                            this.cotizacion.montoDeuda = res.amount;
                            swal.fire('Información', 'El cliente presenta una deuda al día ' + CommonMethods.formatDate(new Date()) + '. No puedes procesar la exclusión hasta que realice el pago de la deuda.', 'error');
                          }
                        }
                      );
                    } else {
                      await this.cobranzasService.validateDebt(params).toPromise().then(
                        res => {
                          this.contratante.debtMark = res.lockMark;
                          // this.contratante.lockMark = res.lockMark;
                          if (this.modoVista !== this.CONSTANTS.MODO_VISTA.VISUALIZAR) {
                            if (res.lockMark !== this.CONSTANTS.USUARIO_OK) {
                              params.documentCode = 27;
                              this.external = res.external
                              this.generarReporteCliente(params, res);
                            } else {
                              if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR == this.modoVista ||
                                this.CONSTANTS.MODO_VISTA.ENDOSO == this.modoVista) {
                                if (this.CONSTANTS.USUARIO_BLOQUEADO !== res.lockMark) {
                                  this.modifyDatos.emit(true);
                                }
                              }
                            }
                          }
                        }
                      );
                    }
                  }


                } else {
                  swal.fire('Información', 'El contratante no cuenta con el nro de documento.', 'error');
                }
              } else {
                const modalRef = this.modalService.open(
                  SearchContractingComponent, {
                  size: 'lg',
                  backdropClass: 'light-blue-backdrop',
                  backdrop: 'static',
                  keyboard: false
                });
                modalRef.componentInstance.formModalReference = modalRef;
                modalRef.componentInstance.EListClient = resp.EListClient;

                modalRef.result.then(async (dataContratante) => {
                  if (dataContratante !== undefined) {
                    // this.contractingdata = ContractorData;
                    // this.inputsCovid.P_TYPE_SEARCH = '1';
                    // this.inputsCovid.P_PERSON_TYPE = '1';
                    this.contratante.NOMBRE_RAZON = '';
                    this.contratante.razonSocial = '';
                    this.contratante.nombres = '';
                    this.contratante.apellidoPaterno = '';
                    this.contratante.apellidoMaterno = '';

                    const data: any = {};
                    data.P_TipOper = 'CON';
                    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
                    data.P_NIDDOC_TYPE = dataContratante.P_NIDDOC_TYPE;
                    data.P_SIDDOC = dataContratante.P_SIDDOC;

                    this.clientInformationService.getCliente360(data).subscribe(
                      res => {
                        if (res.P_NCODE === '0') {
                          this.cargarDatosCliente(res);
                        } else {
                          swal.fire('Información', res.P_SMESSAGE, 'error');
                        }
                      },
                      err => {
                      }
                    );
                  }
                }, (reason) => {
                });
              }

              this.isLoadingChange.emit(false);
            }
          }

        } else if (resp.P_NCODE === this.CONSTANTS.TIPO_RESPUESTA.SUNAT_ERROR) {

          if (params.P_NIDDOC_TYPE !== this.CONSTANTS.TIPO_DOCUMENTO.RUC &&
            params.P_NIDDOC_TYPE !== this.CONSTANTS.TIPO_DOCUMENTO.DNI) {
            this.agregaContratante(params.P_NIDDOC_TYPE, params.P_SIDDOC, resp.P_NCODE, null);
          } else {
            // if (this.codProducto === 3) {
            this.agregaContratante(params.P_NIDDOC_TYPE, params.P_SIDDOC, resp.P_NCODE, null);
            // } else {
            // swal.fire('Información', this.variable.var_noInformacion360, 'error');
            // }
          }

          this.isLoadingChange.emit(false);

        } else {

          swal.fire('Información', resp.P_SMESSAGE, 'error');

          this.isLoadingChange.emit(false);
        }
      },
      error => {
        this.isLoadingChange.emit(false);
        swal.fire('Información', 'Ocurrió un problema al solicitar su petición', 'error');
      }
    );
  }

  async validarBloqueado(data: any) {
    let response = {};
    await this.cobranzasService.validateLock(data).toPromise().then(
      res => {
        this.contratante.lockMark = res.lockMark;
        response = res;
      }, err => {
        response = null;
      }
    );
    return response;
  }

  async agregaContratante(documentType, documentNumber, ncode, response) {
    const receiverStr = this.router.url;
    if (this.storageService.esBroker) {

      if (ncode !== "0" && (documentType !== 1 || documentType !== 2)) {
        swal.fire('Información', this.errorMessageBroker, 'error');
        this.isLoadingChange.emit(false);
        return;
      }

      const contracting: any = response.EListClient[0];
      contracting.EListAddresClient = response.EListClient[0].EListAddresClient;
      contracting.EListAddresClient = contracting.EListAddresClient.length > 0 ? await this.getAddress(contracting) : contracting.EListAddresClient = [];
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
      contracting.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

      this.isLoadingChange.emit(true);

      this.clientInformationService.getCliente360(contracting).toPromise().then(
        res => {
          if (res.P_NCODE === '0') {

            const params = {
              P_TipOper: 'CON',
              P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
              P_NIDDOC_TYPE: (this.contratante.tipoDocumento || {}).Id,
              P_SIDDOC: (this.contratante.numDocumento || '').toUpperCase(),
              P_SFIRSTNAME: (this.contratante.nombres || '').toUpperCase(),
              P_SLASTNAME: (this.contratante.apellidoPaterno || '').toUpperCase(),
              P_SLASTNAME2: (this.contratante.apellidoMaterno || '').toUpperCase(),
              P_SLEGALNAME: (this.contratante.razonSocial || '').toUpperCase(),
            };

            this.clientInformationService.getCliente360(params).toPromise().then(
              res => {

                if (res.P_NCODE === '0') {
                  if (res.EListClient.length == 1) {
                    this.cargarDatosCliente(res);
                  }
                }
              }
            );
          } else if (res.P_NCODE === '1') {
            swal.fire('Información', this.errorMessageBroker, 'error');
          } else {
            swal.fire('Información', this.errorMessageBroker, 'warning');
          }

          this.isLoadingChange.emit(false);
        }
      );

    } else {
      this.isLoadingChange.emit(false);
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
          this.router.navigate(['/extranet/add-contracting'],
            {
              queryParams: {
                typeDocument: documentType,
                document: documentNumber,
                receiver: receiverStr,
                code: ncode
              }
            });
        }
      });
    }
  }

  async cargarDatosCliente(res) {

    const contractingdata = res.EListClient[0];
    this.contratante.cliente360 = contractingdata;
    this.contratante.flagEmail = contractingdata.EListEmailClient.length > 0 ? false : true;
    this.contratante.flagContact = contractingdata.EListContactClient.length > 0 ? false : true;

    this.contratante.codTipoBusqueda = this.CONSTANTS.TIPO_BUSQUEDA.DOCUMENTO;
    this.contratante.tipoDocumento = { Id: contractingdata.P_NIDDOC_TYPE };
    this.contratante.numDocumento = contractingdata.P_SIDDOC;
    this.contratante.nombres = contractingdata.P_SFIRSTNAME;
    this.contratante.apellidoPaterno = contractingdata.P_SLASTNAME;
    this.contratante.apellidoMaterno = contractingdata.P_SLASTNAME2;
    this.contratante.razonSocial = contractingdata.P_SLEGALNAME;
    this.contratante.NOMBRE_RAZON = contractingdata.P_SLEGALNAME;
    this.contratante.id = contractingdata.P_SCLIENT;

    this.contratante.codTipoCuenta = contractingdata.P_SISCLIENT_GBD;
    this.contratante.EListContactClient = contractingdata.EListContactClient;

    (this.contratante.EListContactClient || []).forEach(item => {
      item.parentesco = { codigo: item.P_NTIPCONT };
      item.tipoDocumento = { codigo: item.P_NIDDOC_TYPE };
      item.showEdit = false;
      item.showDelete = false;
    });

    if (contractingdata.EListAddresClient.length > 0) {
      const addres = contractingdata.EListAddresClient[0];
      this.contratante.direccion = addres.P_SDESDIREBUSQ;
      this.contratante.ubigeo = addres.P_DESDEPARTAMENTO + '-' + addres.P_DESPROVINCIA + '-' + addres.P_DESDISTRITO;
      if (this.codProducto === 3) {
        this.contratante.direccion = null;
      }
    }

    this.contratante.email = '';
    this.disabled.email = !!contractingdata.EListEmailClient.length;

    if (contractingdata.EListEmailClient.length > 0) {
      this.contratante.email = contractingdata.EListEmailClient[0].P_SE_MAIL;
      this.disabled.email = !!this.contratante.email;
    } else {
      this.disabled.email = this.modoTrama ? false : (
        this.modoVista === this.CONSTANTS.MODO_VISTA.COTIZAR ||
          this.modoVista === this.CONSTANTS.MODO_VISTA.EVALUAR ||
          this.modoVista === this.CONSTANTS.MODO_VISTA.EMITIR ? false : true
      );
    }

    this.contratante.tipoPersona = {
      codigo: !!this.contratante.nombres ? this.CONSTANTS.TIPO_PERSONA.NATURAL : this.CONSTANTS.TIPO_PERSONA.JURIDICA
    };

    if (this.template.ins_historialCreditoQuotation) {
      const data: any = {};
      data.tipoid = (this.contratante.tipoDocumento || {}).Id === '1' ? '2' : '1';
      data.id = (this.contratante.numDocumento || '');
      data.papellido = (this.contratante.apellidoPaterno || '');
      data.sclient = contractingdata.P_SCLIENT;
      data.usercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
      await this.clientInformationService.invokeServiceExperia(data).toPromise().then(
        res => {
          this.contratante.creditHistory = {};
          this.contratante.creditHistory.nflag = res.nflag;
          this.contratante.creditHistory.sdescript = res.sdescript;

          (this.cotizacion.cotizador.checkbox || {}).PAGO_ADEL = (this.contratante.creditHistory.nflag == 0);
        }
      );
    }
     //Contratante / Broker (arjg)
    

    if (this.contratante.numDocumento !== "") {
      let searchB: any = {};
      let searchBroker2: any = {};
      this.listBroker2 = [];
      searchBroker2.P_IS_AGENCY = '0';  
      searchBroker2.P_NTIPO_BUSQUEDA = '1';
      searchBroker2.P_NTIPO_DOC = '1',
      searchBroker2.P_NNUM_DOC = this.contratante.numDocumento;
      searchBroker2.P_SNOMBRE = "";
      searchBroker2.P_SAP_PATERNO = "";
      searchBroker2.P_SAP_MATERNO = "";
      searchBroker2.P_SNOMBRE_LEGAL = "";
      await this.quotationService.searchBroker(searchBroker2).toPromise().then(
          result => {
              if (result.P_NCODE == 0) {
                  if (result.listBroker != null && result.listBroker.length > 0) {
                        this.listBroker2 = result.listBroker;
                        //console.log("Razon Social : "+result.listBroker[0].RAZON_SOCIAL);
                        searchB.NTYPECHANNEL= result.listBroker[0].NTYPECHANNEL,
                        searchB.COD_CANAL= result.listBroker[0].COD_CANAL,
                        searchB.NCORREDOR= result.listBroker[0].NCORREDOR,
                        searchB.NTIPDOC= result.listBroker[0].NTIPDOC,
                        searchB.NNUMDOC= result.listBroker[0].NNUMDOC,
                        searchB.RAZON_SOCIAL= result.listBroker[0].RAZON_SOCIAL,
                        searchB.PROFILE= 0,
                        searchB.SCLIENT= result.listBroker[0].SCLIENT,
                        searchB.P_NPRINCIPAL= 0,
                        searchB.P_COM_SALUD= 0,
                        searchB.P_COM_SALUD_PRO= 0,
                        searchB.P_SEDIT= 'I',
                        searchB.valItemPen= false,
                        searchB.valItemSal= false,
                        searchB.showDelete= this.storageService.esPerfilExterno,
                        searchB.editarTasa= false,
                        searchB.flag= 1
                        //enviando datos
                        this.dataEntrante=searchB;
                        this.serviciobroker.actualizaBroker.emit({
                          data:this.dataEntrante
                        })
                        //


                  } else {
                      swal.fire("Información", "No hay información con los datos ingresados", "error");
                  }
              } else {
                  swal.fire("Información", res.P_SMESSAGE, "error");
              }
  
          },
          err => {
              swal.fire("Información", "Ocurrió un problema al solicitar su petición", "error");
          }
      );
      //this.listBroker2.length;
      //console.log(searchB.RAZON_SOCIAL);
      //this.agregarBroker()
      //this.listas.brokers.push(searchB);
      //this.listas.brokersChange.emit(this.listas.brokers);


      }

  }
  


  generarReporteCliente(params, resDebt) {
    const mensaje = resDebt.observation;

    let confirmButton = true
    let cancelButtonText = 'Cancelar'
    let text = '¿Desea descargar su Estado de Cuenta?'

    if (this.storageService.esPerfilExterno && this.external !== 0) {
      confirmButton = false
      cancelButtonText = 'OK'
      text = ''
    }

    return swal.queue([{
      title: mensaje,
      confirmButtonText: 'Aceptar',
      cancelButtonText: cancelButtonText,
      text: text,
      // showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: confirmButton,
      allowOutsideClick: false,
      // showLoaderOnConfirm: true,
      preConfirm: () => {
        this.isLoadingChange.emit(true);

        this.cobranzasService.generateAccountStatus(params).subscribe(
          res => {
            this.isLoadingChange.emit(false);
            if (Number(res.responseCode) === 1) {
              swal.insertQueueStep({
                title: 'Error al descargar el estado de cuenta'
              });
            } else {
              const filePath = res.path;
              this.othersService.downloadFile(filePath).subscribe(
                res => {
                  this.fileService.download(filePath, res);
                },
                error => {
                  swal.insertQueueStep({
                    title: 'Error al descargar el estado de cuenta'
                  });
                  this.isLoadingChange.emit(false);
                }
              );
            }

            this.verificarIrAConsultaPoliza(resDebt);
          },
          error => {
            swal.insertQueueStep({
              title: 'Error al descargar el estado de cuenta'
            });
            this.isLoadingChange.emit(false);

            this.verificarIrAConsultaPoliza(resDebt);
          }
        );
        if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR == this.modoVista) {
          if (this.CONSTANTS.USUARIO_BLOQUEADO !== resDebt.lockMark) {
            this.modifyDatos.emit(true);
          }
        }

      }

    }])
      .then((result) => {
        if (!(result as any).value) {
          this.verificarIrAConsultaPoliza(resDebt);
        }
        if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR == this.modoVista) {
          if (this.CONSTANTS.USUARIO_BLOQUEADO !== resDebt.lockMark) {
            this.modifyDatos.emit(true);
          }
        }
      })
  }

  cambiarContratante() {
    this.clear.contratante = true;
    this.clearInfoContratante();
  }

  clearInfoContratante() {
    this.contratante.id = null;
    this.clear.contratanteInfo = true;
    this.contratante.EListContactClient = [];
    this.contratante.creditHistory = null;
  }

  verificarIrAConsultaPoliza(resDebt) {
    if (this.CONSTANTS.MODO_VISTA.POLIZARENOVAR == this.modoVista) {
      /* if (this.CONSTANTS.USUARIO_BLOQUEADO == resDebt.lockMark) {
        this.router.navigate(['/extranet/accidentes-personales/consulta-poliza']);
      } */
    }
  }

  async getAddress(data: any): Promise<any> {
    let numdir = 1;
    if (data.EListAddresClient.length > 0) {
      for (const item of data.EListAddresClient) {
        item.P_NROW = numdir++;
        item.P_CLASS = '';
        item.P_DESTIDIRE = 'PARTICULAR';
        item.P_SRECTYPE = item.P_SRECTYPE == '' || item.P_SRECTYPE == null ? '2' : item.P_SRECTYPE;
        item.P_STI_DIRE = item.P_STI_DIRE == '' || item.P_STI_DIRE == null ? '88' : item.P_STI_DIRE;
        item.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION == '' || item.P_SNUM_DIRECCION == null ? '0' : item.P_SNUM_DIRECCION;
        item.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO == null ? item.P_SDES_DEP_DOM : item.P_DESDEPARTAMENTO;
        item.P_DESPROVINCIA = item.P_DESPROVINCIA == null ? item.P_SDES_PRO_DOM : item.P_DESPROVINCIA;
        item.P_DESDISTRITO = item.P_DESDISTRITO == null ? item.P_SDES_DIS_DOM : item.P_DESDISTRITO;
        item.P_NCOUNTRY = item.P_NCOUNTRY == null || item.P_NCOUNTRY == '' ? '1' : item.P_NCOUNTRY;
        await this.getDepartmentList(item);
        await this.getProvinceList(item);
        await this.getDistrictList(item);
        item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION == '' ? 'NO ESPECIFICADO' : item.P_SNOM_DIRECCION.replace(/[().]/g, '').replace(/[-]/g, '');
        if (data.P_NIDDOC_TYPE == 1) {
          item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDISTRITO.length).trim();
          item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESPROVINCIA.length).trim();
          item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ == '' ? item.P_SDESDIREBUSQ : item.P_SDESDIREBUSQ.replace(/[().]/g, '').replace(/[-]/g, '');
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDISTRITO.length).trim();
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESPROVINCIA.length).trim();
          item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
        }
      }
    }

    return data.EListAddresClient;
  }

  async getDepartmentList(itemDireccion) {
    await this.addressService.getDepartmentList().toPromise().then(
      res => {
        if (itemDireccion.P_NPROVINCE != null) {
          itemDireccion.P_NPROVINCE = Number(itemDireccion.P_NPROVINCE);
        } else {
          res.forEach(element => {
            if (element.Name == itemDireccion.P_DESDEPARTAMENTO) {
              itemDireccion.P_NPROVINCE = element.Id;
            }
          });
        }
      },
      err => { }
    );
  }

  async getProvinceList(itemDireccion) {
    if (itemDireccion.P_NPROVINCE != null && itemDireccion.P_NPROVINCE != '') {
      return await this.addressService.getProvinceList(itemDireccion.P_NPROVINCE).toPromise().then(
        res => {
          if (itemDireccion.P_NLOCAL != null) {
            itemDireccion.P_NLOCAL = Number(itemDireccion.P_NLOCAL);
          } else {
            res.forEach(element => {
              if (itemDireccion.P_DESPROVINCIA.search('CALLAO') !== -1) {
                itemDireccion.P_NLOCAL = element.Id;
              } else {
                if (element.Name == itemDireccion.P_DESPROVINCIA) {
                  itemDireccion.P_NLOCAL = element.Id;
                }
              }
            });
          }
        },
        err => { }
      );
    } else {
      return itemDireccion.P_NLOCAL = null;
    }

  }

  async getDistrictList(itemDireccion) {
    if (itemDireccion.P_NLOCAL != null && itemDireccion.P_NLOCAL != '') {
      return await this.addressService.getDistrictList(itemDireccion.P_NLOCAL).toPromise().then(
        res => {
          if (itemDireccion != null) {
            if (itemDireccion.P_NMUNICIPALITY != null) {
              itemDireccion.P_NMUNICIPALITY = Number(itemDireccion.P_NMUNICIPALITY);
            } else {
              res.forEach(element => {
                if (element.Name == itemDireccion.P_DESDISTRITO) {
                  itemDireccion.P_NMUNICIPALITY = element.Id;
                }
              });
            }
          }
        },
        err => { }
      );
    } else {
      return itemDireccion.P_NMUNICIPALITY = null
    }

  }

}

