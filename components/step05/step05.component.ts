import { Router } from '@angular/router';
import { SessionToken } from '../../../client/shared/models/session-token.model';
import { Prima } from '../../../client/shared/models/prima.model';
import { Auto } from '../../models/auto/auto.model';
import { Certificado } from '../../models/certificado/certificado';
import {
  Component,
  OnInit,
  ViewContainerRef,
  ComponentFactoryResolver,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { VisaService } from '../../../../shared/services/pago/visa.service';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { PagoEfectivoService } from '../../../../shared/services/pago/pago-efectivo.service';
import { ButtonVisaComponent } from '../../../../shared/components/button-visa/button-visa.component';
import { Cliente } from '../../models/cliente/cliente';
import { AppConfig } from '../../../../app.config';
import { AbstractControl, FormControl } from '@angular/forms';
import { Step05Service } from '../../services/step05/step05.service';
import { environment } from '../../../../../environments/environment';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { EventStrings } from '../../shared/events/events';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as SDto from '../../services/step05/DTOs/step05.dto';
import * as CDTO from './DTOs/step05.dto';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { UtilsService } from '@shared/services/utils/utils.service';
import { Step4Service } from '../../../vidaindividual-latest/services/step4/step4.service';
import { KushkiService } from '../../../../shared/services/kushki/kushki.service';
import { String } from '@shared/components/kushki-form/constants/constants';
import { RegularExpressions } from '@shared/regexp/regexp';
import { Kushki } from '@kushki/js';
import { v4 as uuid } from 'uuid';

const DocumentType = {
  1: 'RUC',
  2: 'DNI',
  4: 'CE'
};

@Component({
  selector: 'app-step05',
  templateUrl: './step05.component.html',
  styleUrls: ['./step05.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({
          opacity: 0,
        }),
        animate(
          200,
          style({
            opacity: 1,
          })
        ),
      ]),
    ]),
  ],
})
export class Step05Component implements OnInit, OnDestroy {
  cliente = new Cliente();
  auto = new Auto();
  tarifa = new Prima();
  bMostrarButtons: boolean;
  bMostrarLoading = false;
  certificado = new Certificado();
  btnVisa;
  btnTelepago;
  mainTitle = '';
  titulos: string[];
  NroCertificado: number;
  Modalidad: any;
  tCertificado: number;

  mostrarVisa = false;
  mostrarTelepago = false;
  mostrarPE = false;
  PagoLock = false;

  showModalPE = false;
  paymentUrl: SafeResourceUrl;
  isCopyMensaje: boolean;

  @ViewChild('modalResultadoPE', { static: true, read: TemplateRef })
  modalResultadoPE: TemplateRef<ElementRef>;
  @ViewChild('modalTerminosCondiciones', { static: true, read: TemplateRef })
  modalTerminosCondiciones: TemplateRef<ElementRef>;
  @ViewChild('modalEjemploSoat', { static: true, read: TemplateRef })
  modalEjemploSoat: TemplateRef<ElementRef>;
  @ViewChild('modalSuccess', { static: true, read: TemplateRef })
  modalSuccess: TemplateRef<ElementRef>;
  @ViewChild('modalConfirSendAprobacion', { static: true, read: TemplateRef })
  modalConfirSendAprobacion: TemplateRef<ElementRef>;
  @ViewChild('modalGeneracion', { static: true, read: TemplateRef })
  modalGeneracion: TemplateRef<ElementRef>;
  @ViewChild('modalKushkiCard', { static: true, read: TemplateRef })
  modalKushkiCard: TemplateRef<ElementRef>;

  tipoEnvio: Array<number>;
  formTipoEnvio: FormGroup;
  frameResult;
  chkTerminos: FormControl = new FormControl();
  tpDocumento = '';
  setting_pay = '';
  bValido = true;
  mensajes = [];
  canal = '';
  bTiposPagoHabilitados;
  bVisa = false;

  flujoVisa = 0;

  bPagoEfectivo = false;
  bVoucher = false;
  errorDesc = '';
  IS_SHOW_POLICY_TO_TELEMARKETING: boolean;
  public TIPO_DOCUMENTO_IDENTIDAD = {
    DNI: '2',
    RUC: '1',
    CE: '4',
    PTP: '15',
  };
  bAceptarTerminos = true;
  ultimaPaginaNavegada = 0;
  paginaActual = 5;
  showSeccionEntrega = false;
  FORM_USOS: FormGroup;
  TYPE_DOCUMENT_USOS: number;
  DATA_TYPE_DOCUMENTS_OF_USOS: SDto.DocumentOfUsoAutoDto[] = [];
  ID_TYPE_DOCUMENT_USO: number;
  FILES_DOCUMENT_USOS: CDTO.FilesDocumentOfUsos[] = [];
  IS_VALID_DOCUMENTS_USOS = false;
  TITLE_MODAL_SUCCESS: string;
  BODY_MODAL_SUCCESS: string;
  IS_RESUMEN_PAGE = false;
  IS_EMISION_PAGE = false;
  DATA_PARAM_RESUMEN: any = null;

  // tslint:disable-next-line:no-inferrable-types
  IS_ACEPT_TERM_POLICY_DATA: boolean = true;
  // tslint:disable-next-line:no-inferrable-types
  IS_ACEPT_TERM_PUBLICIDAD: boolean = false;
  linkWhatsapp: string;
  linkPagoCliente: string;
  mensajeWsp: string;
  typeSendCotizacion: number;

  // *MODAL LIMIT MAX CALL API
  modalTimeout: boolean;

  private kushki: Kushki;
  cardType: string = '';
  messageInfoKushki: string = '';
  paymentType$: any;
  methodKushki = {
    card: 4,
    cash: 5,
    transfer: 6,
  };

  kushkiForm: FormGroup = this._FormBuilder.group({
    cardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(14),
        Validators.maxLength(16),
      ],
    ],
    dueDate: [
      '',
      [
        Validators.pattern('^(0[1-9]|1[0-2])/(0[1-9]|[1-2][0-9]|3[0-1])$'),
        Validators.required,
        Validators.maxLength(5),
      ],
    ],
    cvv: [
      '',
      [
        Validators.required,
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(3),
        Validators.maxLength(4),
      ],
    ],
  });

  constructor(
    private emisionService: EmisionService,
    private visaService: VisaService,
    private viewContainerRef: ViewContainerRef,
    private factoryResolver: ComponentFactoryResolver,
    private pagoEfectivoService: PagoEfectivoService,
    private step05service: Step05Service,
    private router: Router,
    public cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private readonly _FormBuilder: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private readonly _builder: FormBuilder,
    private readonly _ActivatedRoute: ActivatedRoute,
    private readonly utilsService: UtilsService,
    private readonly _Step4Service: Step4Service,
    private readonly kushkiService: KushkiService
  ) {
    this.tipoEnvio = [];
    this.formTipoEnvio = _FormBuilder.group({
      tipo: [null],
    });
    this.IS_SHOW_POLICY_TO_TELEMARKETING = true;
    this.FORM_USOS = this._builder.group({
      files: [null, Validators.required],
    });
    this.isCopyMensaje = false;
    this.modalTimeout = false;
    this.paymentType$ = {
      niubiz: false,
      kushkiCard: false,
      kushkiCash: false,
      kushkiTransfer: false,
    };
  }

  ngOnInit() {
    const sessionPayPe = JSON.parse(
      sessionStorage.getItem('_pay-pe-broker') || '{}'
    );
    if (sessionPayPe?.exito) {
      const salesChannel: string = sessionStorage.getItem('canalVentaCliente');
      sessionStorage.clear();
      sessionStorage.setItem('canalVentaCliente', salesChannel);
      this.router.navigate(['/extranet/salepanel']);
      return;
    }
    this.TYPE_DOCUMENT_USOS = Number.parseInt(
      JSON.parse(sessionStorage.getItem('auto')).p_NIDUSO
    );
    this.initComponent();
    sessionStorage.removeItem('infoPago');
    this.errorDesc = sessionStorage.getItem('errorVisa');
    if (this.errorDesc != null && this.errorDesc !== '') {
      this.mensajes = this.errorDesc.split('|');
      this.bValido = false;
      sessionStorage.removeItem('errorVisa');
    }
    this.getDocumentsOfUsoAuto();
    this._ActivatedRoute.queryParams.subscribe((params) => {
      if (Object.values(params).length > 0) {
        this.IS_RESUMEN_PAGE = true;
        this.mainTitle = 'Resumen';
      } else {
        this.IS_RESUMEN_PAGE = false;
      }
    });
    if (localStorage.getItem('is_emision_page') === 'true') {
      this.IS_EMISION_PAGE = true;
    } else {
      this.IS_EMISION_PAGE = false;
    }
    if (this.blockButton) {
      this.modalTimeout = true;
    }

    this.getPaymentType();

    this.kushkiFormControl['cardNumber'].valueChanges.subscribe(
      (value: string) => {
        this.cardType = undefined;
        if (this.kushkiFormControl['cardNumber'].hasError('pattern')) {
          this.kushkiFormControl['cardNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.kushkiFormControl['dueDate'].valueChanges.subscribe(
      (value: string) => {
        const split = value.split('/');

        split.forEach((val) => {
          const regex = new RegExp(RegularExpressions.numbers);

          if (!regex.test(val)) {
            if (!val) {
              return;
            }

            this.kushkiFormControl['dueDate'].setValue('', {
              emitEvent: false,
            });
          }
        });

        if (value.length === 2) {
          this.kushkiFormControl['dueDate'].setValue(`${value}/`);
        }
      }
    );

    this.kushkiFormControl['cvv'].valueChanges.subscribe((value: string) => {
      if (this.kushkiFormControl['cvv'].hasError('pattern')) {
        this.kushkiFormControl['cvv'].setValue(
          value.slice(0, value.length - 1)
        );
      }
    });
  }

  ngOnDestroy() {
    localStorage.removeItem('is_emision_page');
    if (this.btnVisa) {
      this.btnVisa.destroy();
      delete window['VisanetCheckout'];
      sessionStorage.removeItem('infoPago');
    }

    if (this.frameResult) {
      this.frameResult.destroy();
    }
  }

  initComponent() {
    const sFrom = sessionStorage.getItem('pagefrom');
    if (sFrom === null || sFrom === 'BrokerEmissionComponent') {
      sessionStorage.setItem('pagefrom', 'Step05Component');
      // window.location.reload();
    } else if (sFrom === 'LastStepComponent') {
      this.limpiarSessionStorage();
      history.go(1);
      this.router.navigate(['broker/stepAll'], { replaceUrl: true });
      return;
    }
    this.validarNavegacion();
    this.obtenerDatosCliente();
    this.obtenerDatosAuto();
    this.obtenerDatosCertificado();
    this.obtenerTipoPagoCanal();
    this.bMostrarButtons = false;
    this.tpDocumento =
      this.cliente.p_NDOCUMENT_TYP.toString() ===
      this.TIPO_DOCUMENTO_IDENTIDAD.RUC
        ? 'RUC'
        : 'DNI';
    if (
      this.cliente.p_NDOCUMENT_TYP.toString() ===
      this.TIPO_DOCUMENTO_IDENTIDAD.RUC
    ) {
      this.tpDocumento = 'RUC';
    }
    if (
      this.cliente.p_NDOCUMENT_TYP.toString() ===
      this.TIPO_DOCUMENTO_IDENTIDAD.DNI
    ) {
      this.tpDocumento = 'DNI';
    }
    if (
      this.cliente.p_NDOCUMENT_TYP.toString() ===
      this.TIPO_DOCUMENTO_IDENTIDAD.CE
    ) {
      this.tpDocumento = 'CE';
    }
    if (
      this.cliente.p_NDOCUMENT_TYP.toString() ===
      this.TIPO_DOCUMENTO_IDENTIDAD.PTP
    ) {
      this.tpDocumento = 'PTP';
    }
    this.Modalidad = JSON.parse(sessionStorage.getItem('Modalidad'));
    this.tCertificado = this.Modalidad && this.Modalidad['tipoCertificado'];
    this.NroCertificado = Number(this.tCertificado) - 1;
    this.setTitle(this.NroCertificado);
  }

  getPaymentType() {
    const data = {
      aplicacion: 2,
      idRamo: 66,
      idProducto: 1,
      codigoCanal: '0',
    };

    this._Step4Service.obtenerMetodoPago(data).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.paymentType$.niubiz = response.tiposPago.some(
          (val: any) => val.idTipoPago == 2
        );
        this.paymentType$.kushkiCard = response.tiposPago.some(
          (val: any) => val.idTipoPago == 6
        );
        this.paymentType$.kushkiCash = response.tiposPago.some(
          (val: any) => val.idTipoPago == 7
        );
        this.paymentType$.kushkiTransfer = response.tiposPago.some(
          (val: any) => val.idTipoPago == 8
        );
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  private validarNavegacion() {
    const sessionUltimaPagina = sessionStorage.getItem('pagina');
    if (sessionUltimaPagina != null) {
      this.ultimaPaginaNavegada = +sessionUltimaPagina;

      if (this.paginaActual - this.ultimaPaginaNavegada > 1) {
        this.volverDatosCertificado();
      }
    } else {
      this.volverValidarPlaca();
    }
  }

  setTitle(id: number) {
    this.titulos = [
      'Crea un Soat Manual',
      'Crea un Soat Láser',
      'Crea un Soat Electrónico',
    ];
    this.mainTitle = this.titulos[Number(id)];
  }

  obtenerDatosAuto() {
    const autoSession = JSON.parse(sessionStorage.getItem('auto'));
    if (autoSession != null) {
      this.auto = autoSession;
    }
  }

  obtenerDatosCliente() {
    const clienteSession = JSON.parse(sessionStorage.getItem('contratante'));
    if (clienteSession != null) {
      this.cliente = clienteSession;
      sessionStorage.setItem('contratante', JSON.stringify(this.cliente));
    }
  }

  obtenerDatosCertificado() {
    const certificadoSession = this.utilsService.decryptStorage('certificado');
    if (certificadoSession != null) {
      this.certificado = certificadoSession;
      this.canal =
        this.certificado.P_NCODCHANNEL_BO == null
          ? ''
          : this.certificado.P_NCODCHANNEL_BO.toString();
    }
  }

  getFechaVigencia() {
    return this.certificado.P_DSTARTDATE.toString()
               .split('-')
               .reverse()
               .join('/');
  }

  pagarVoucher() {
    this.spinner.show();
    this.emisionService
        .registrarEmision(this.cliente.p_NIDPROCESS)
      /* .pipe(
        timeout(10)
      ) */
        .subscribe(
          (result) => {
            if (result.indProcess === 1) {
              sessionStorage.setItem('processResult', result.numPolicy);
              this.irResultado();
            } else {
              sessionStorage.setItem('processResult', '0');
              this.mensajes = result.errorDesc?.split('|');
              this.bValido = false;
            }
            this.spinner.hide();
            this.emisionService
                .registrarEvento('', EventStrings.SOAT_RESUMEN_CREDITO)
                .subscribe();
          },
          (err: any) => {
            this.spinner.hide();
            console.log(err);
            /* if (err?.name === 'TimeoutError') {
                obs.unsubscribe();
                this.modalTimeout = true;
                sessionStorage.setItem('blockButton', '1');
              } */
          }
        );
  }

  goToHome(): void {
    sessionStorage.clear();
    this.router.navigate(['extranet/salepanel']);
  }

  irResultado() {
    this.router.navigate(['broker/resvaucher']);
  }

  get blockButton(): boolean {
    return Number(sessionStorage.getItem('blockButton') || 0) === 1 || false;
  }

  crearBotonPagoEfectivo() {
    this.bMostrarButtons = false;
    this.mostrarPE = true;
  }

  onPagar(tipoPago) {
    if (tipoPago === 2) {
      this.spinner.show();

      this.showModalPE = false;
      this.mostrarPE = false;
      this.bMostrarLoading = true;
      this.emisionService
          .processValidatePoliza(this.cliente.p_NIDPROCESS)
          .subscribe(
            (res) => {
              if (res.errorDesc != null && res.errorDesc !== '') {
                this.mensajes = res.errorDesc.split('|');
                this.bMostrarLoading = false;
                this.mostrarPE = true;
                this.bValido = false;
                return;
              }
              const currentUser = JSON.parse(localStorage.getItem('currentUser'));
              let client_name = this.cliente.p_SCLIENT_NAME;
              let client_lastname = `${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`;
              if (
                Number(this.cliente.p_NDOCUMENT_TYP) === 1 &&
                `${this.cliente.p_SDOCUMENT}`.substr(0, 2) === '20'
              ) {
                client_name = this.cliente.p_SLEGALNAME;
                client_lastname = '';
              }
              this.pagoEfectivoService
                  .generarCipRest(
                    this.cliente.p_NIDPROCESS,
                    client_name, // nombres del usuario
                    client_lastname, // apellidos del usuario
                    this.cliente.p_NDOCUMENT_TYP,
                    this.cliente.p_SDOCUMENT,
                    this.cliente.p_SPHONE,
                    this.cliente.p_SMAIL, // correo del usuario
                    this.certificado.P_NPREMIUM, // monto
                    this.cliente.p_NIDPROCESS, // proceso Id
                    1,
                    66,
                    1,
                    'Seguro SOAT'
                  ) // usuario Id
                  .subscribe(
                    /*this.pagoEfectivoService
                          .generarCip(
                            this.cliente.p_SCLIENT_NAME,
                            `${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`,
                            this.cliente.p_SMAIL,
                            this.certificado.P_NPREMIUM,
                            this.cliente.p_NIDPROCESS,
                            '',
                            AppConfig.FLUJO_BROKER,
                            currentUser.id
                          ) // => en el flujo broker se debe enviar el id del usuario
                          .subscribe(*/
                    (responseCIP) => {
                      this.spinner.hide();
                      if (responseCIP.exito) {
                        sessionStorage.setItem(
                          '_pay-pe-broker',
                          JSON.stringify(responseCIP)
                        );
                        this.paymentUrl =
                          this.sanitizer.bypassSecurityTrustResourceUrl(
                            responseCIP.uri
                          );
                        this.showModalPE = true;
                        this.viewContainerRef.createEmbeddedView(
                          this.modalResultadoPE
                        );
                        /*
                                                // Cip generado correctamente
                                                const factory = this.factoryResolver.resolveComponentFactory(
                                                  FrameComponent
                                                );
                                                this.frameResult = factory.create(this.viewContainerRef.parentInjector);
                                                this.frameResult.instance.token = data.token;
                                                this.frameResult.instance.ancho = '100%';
                                                this.frameResult.instance.alto = '100%';
                                                // Agregar el componente al componente contenedor
                                                this.viewContainerRef.insert(this.frameResult.hostView);
                                                // Abrimos el modal
                                                this.modalResultado.show();*/
                        this.bMostrarLoading = false;
                      } else {
                        // Ocurrio un error al intentar generar el Cip. Por favor, vuelva a intentarlo
                      }
                      this.emisionService
                          .registrarEvento('', EventStrings.SOAT_RESUMEN_PE)
                          .subscribe();
                    },
                    (err) => {
                      this.spinner.hide();
                      console.log(err);
                      this.showModalPE = false;

                      this.bMostrarLoading = false;
                      this.mostrarPE = true;
                    }
                  );
            },
            (err) => {
              this.spinner.hide();
              console.log(err);
              this.bMostrarLoading = false;
              this.mostrarPE = true;
            }
          );
      // *ACEPTA TERMINOS TELEMARKETING
      /*  if (this.VALID_IS_SHOW_POLICY_TELEMARKETING) {
         this.aceptarTerminosTelemarketing().then((res) => {
         });
       } */
    }
  }

  finalizar() {
    this.viewContainerRef.clear();
    sessionStorage.removeItem('_pay-pe-broker');
    this.router.navigate(['broker/rescupon']);
  }

  verEjemploSOAT() {
    this.viewContainerRef.createEmbeddedView(this.modalEjemploSoat);
  }

  habilitarBotonesPago(value) {
    this.viewContainerRef.createEmbeddedView(this.modalTerminosCondiciones);
  }

  openModalTerminos() {
    this.viewContainerRef.createEmbeddedView(this.modalTerminosCondiciones);
  }

  volverValidarPlaca() {
    this.router.navigate(['broker/step01']);
  }

  aceptarTerminos() {
    this.bAceptarTerminos = true;
    this.viewContainerRef.clear();
  }

  volverDatosCertificado() {
    this.router.navigate(['broker/step04']);
  }

  cerrarTerminos() {
    this.viewContainerRef.clear();
  }

  obtenerTipoPagoCanal() {
    if (this.canal == null || this.canal === '') {
      this.canal = sessionStorage.getItem('canalVentaCliente');
    }
    this.setting_pay = AppConfig.SETTINGS_SALE;
    this.aceptarTerminos();
    this.resetFormaPago();
    setTimeout(() => {
      this.spinner.show();
    }, 300);
    this.step05service.getCanalTipoPago(this.canal, this.setting_pay).subscribe(
      (res) => {
        if (res != null) {
          this.bTiposPagoHabilitados = res;
          this.showSeccionEntrega = res.bdelivery === 1 ? true : false;
          this.setTipoPago();
        }
        this.spinner.hide();
      },
      (err) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  acceptTerms(event) {
    event.preventDefault();
    this.setTipoPago();
    this.bAceptarTerminos = !this.bAceptarTerminos;
  }

  resetFormaPago() {
    this.bVisa = false;
    this.bPagoEfectivo = false;
    this.bVoucher = false;
  }

  setMetodoPago(id: number, type?: number) {
    switch (id) {
      case 1:
        (document.querySelector('.start-js-btn') as any)?.click()
        // this.crearBotonVisa();
        break;
      case 2:
        this.crearBotonPagoEfectivo();
        break;
      case 3:
        this.pagarVoucher();
        break;
      case 4:
        this.getCredentials(type);
        break;
      default:
        break;
    }
  }

  setTipoPago() {
    this.PagoLock = false;
    this.PagoLock = false;
    const tiposPago = JSON.parse(JSON.stringify(this.bTiposPagoHabilitados));
    this.bVisa = tiposPago.bvisa > 0;
    this.evaluateLock();

    if (this.bVisa) {
      const canal = sessionStorage.getItem('canalVentaCliente');
      const puntoventa = sessionStorage.getItem('puntoVentaCliente');
      this.spinner.show();
      this.flujoVisa = tiposPago.bvisa === 1 ? 0 : 2;
      this.visaService
          .generarSessionToken(
            this.auto.V_NIDPROCESS,
            this.certificado.P_NPREMIUM,
            canal,
            puntoventa,
            this.flujoVisa,
            66,
            1
          )
          .subscribe(
            (resvisa) => {
              const data = <SessionToken>resvisa;
              sessionStorage.setItem('visasession', JSON.stringify(data));
              this.crearBotonVisa();
              this.spinner.hide();
            },
            (error) => {
              console.log(error);
              this.spinner.hide();
            }
          );
    }
    this.bPagoEfectivo = tiposPago.bpagoefectivo === 1;
  }

  crearBotonVisa() {
    this.mostrarVisa = true;
    // this.cd.detectChanges();
    const visasession = JSON.parse(sessionStorage.getItem('visasession'));

    const factory =
      this.factoryResolver.resolveComponentFactory(ButtonVisaComponent);
    this.btnVisa = factory.create(this.viewContainerRef.parentInjector);
    this.btnVisa.instance.merchantId =
      this.flujoVisa === 0
        ? environment.codigocomercio
        : environment.codigocomercioTP;
    this.btnVisa.instance.canalId = this.flujoVisa === 0 ? 'web' : 'callcenter';
    this.btnVisa.instance.action = AppConfig.ACTION_FORM_VISA_BROKER;
    this.btnVisa.instance.amount = this.certificado.P_NPREMIUM;
    this.btnVisa.instance.sessionToken = visasession.sessionToken;
    this.btnVisa.instance.purchaseNumber = visasession.purchaseNumber;
    this.btnVisa.instance.merchantLogo = AppConfig.MERCHANT_LOGO_VISA;
    this.btnVisa.instance.timeouturl = 'broker/stepAll';
    this.btnVisa.instance.userId = '';

    if (this.flujoVisa === 2) {
      this.btnVisa.instance.cardHolderName = this.cliente.p_SCLIENT_NAME;
      this.btnVisa.instance.cardHolderLastName = this.cliente.p_SCLIENT_APPPAT;
      this.btnVisa.instance.cardHolderEmail = this.cliente.p_SMAIL;
    }
    this.viewContainerRef.insert(this.btnVisa.hostView);
  }

  evaluateLock() {
    this.emisionService.informacionVentas().subscribe(
      (res) => {
        this.bVoucher = false;

        if (res.manejaCredito) {
          this.bVoucher = !res.bloqueado;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  limpiarSessionStorage() {
    sessionStorage.removeItem('placa');
    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
  }

  uploadFilesUsos(e): void {
    if (e.target.files.length > 0) {
      if (e.target.files[0].name.indexOf('.pdf') > 0) {
        const data: CDTO.FilesDocumentOfUsos = {
          idTipoDocumento: this.ID_TYPE_DOCUMENT_USO,
          file: e.target.files[0],
        };
        const htmlUso = document.getElementById(
          this.ID_TYPE_DOCUMENT_USO + 'nameFileUso'
        );
        const name = e.target.files[0].name;
        if (name.length >= 15) {
          htmlUso.textContent = name.substring(0, 15) + '...';
        } else {
          htmlUso.textContent = name;
        }
        this.FILES_DOCUMENT_USOS.push(data);
        const existTypeDoc =
          this.FILES_DOCUMENT_USOS.filter(
            (x) => x.idTipoDocumento === this.ID_TYPE_DOCUMENT_USO
          ).length > 0;
        if (existTypeDoc === true) {
          this.FILES_DOCUMENT_USOS = this.FILES_DOCUMENT_USOS.filter(
            (x) => x.idTipoDocumento !== this.ID_TYPE_DOCUMENT_USO
          );
          this.FILES_DOCUMENT_USOS.push(data);
        } else {
          this.FILES_DOCUMENT_USOS.push(data);
        }
        this.validarDocumentos();
        this.FORM_USOS.reset();
      } else {
        this.FORM_USOS.reset();
        const htmlUso = document.getElementById(
          this.ID_TYPE_DOCUMENT_USO + 'nameFileUso'
        );
        htmlUso.textContent = 'El documento debe ser un PDF';
      }
    }
  }

  submitFormUsos(): void {
    if (this.IS_VALID_DOCUMENTS_USOS) {
      this.hideShowComfirmSendSolicitud();
      this.spinner.show();
      const dataUser = JSON.parse(localStorage.getItem('currentUser'));
      const certificate = this.utilsService.decryptStorage('certificado');

      const data: CDTO.SendAprobacionDocsDto = {
        idProcess: +JSON.parse(sessionStorage.getItem('auto')).p_NIDPROCESS,
        idUsuario: Number.parseInt(dataUser.id),
        idUso: Number.parseInt(
          JSON.parse(sessionStorage.getItem('auto')).p_NIDUSO
        ),
        zonaCirculacion: Number.parseInt(
          JSON.parse(sessionStorage.getItem('auto')).ZONA_CIRCULACION
        ),
        codigoCanal: Number.parseInt(dataUser.canal),
        codigoPuntoVenta: Number.parseInt(dataUser.puntoVenta),
        adjuntos: [],
      };
      this.FILES_DOCUMENT_USOS.forEach((e) => {
        const datos: {
          idTipoDocumento: number;
          nombreArchivo: string;
        } = {
          idTipoDocumento: e.idTipoDocumento,
          nombreArchivo: e.file,
        };
        data.adjuntos.push(datos);
      });
      this.step05service.enviarDocsToAprobacion(data).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res) {
            this.showModalSuccess(
              'Confirmación',
              'Su solicitud fue enviada a aprobación correctamente.'
            );
          }
        },
        (err: any) => {
          this.spinner.hide();
          console.log(err);
        }
      );
    }
  }

  private getDocumentsOfUsoAuto(): void {
    this.step05service.getDocumentsOfUsoAuto(this.TYPE_DOCUMENT_USOS).subscribe(
      (res: SDto.DocumentOfUsoAutoDto[]) => {
        this.DATA_TYPE_DOCUMENTS_OF_USOS = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  changeIdTypeDocumentUso(id): void {
    this.ID_TYPE_DOCUMENT_USO = id;
  }

  private showModalSuccess(title: string, body: string): void {
    this.TITLE_MODAL_SUCCESS = title;
    this.BODY_MODAL_SUCCESS = body;
    this.viewContainerRef.createEmbeddedView(this.modalSuccess);
  }

  hideModalSuccess(): void {
    this.TITLE_MODAL_SUCCESS = '';
    this.BODY_MODAL_SUCCESS = '';
    this.viewContainerRef.clear();
    this.router.navigate(['extranet/salepanel']);
  }

  dropFile(id): void {
    this.FORM_USOS.reset();
    this.FILES_DOCUMENT_USOS = this.FILES_DOCUMENT_USOS.filter(
      (x) => x.idTipoDocumento !== id
    );
    const htmlUso = document.getElementById(id + 'nameFileUso');
    htmlUso.textContent = '';
    this.validarDocumentos();
  }

  validarDocumentos(): void {
    const dataFiltered = this.DATA_TYPE_DOCUMENTS_OF_USOS.filter(
      (item) => item.obligatorio === 1
    );

    this.IS_VALID_DOCUMENTS_USOS = dataFiltered.every((item) =>
      this.FILES_DOCUMENT_USOS.some(
        (adjunto) => adjunto.idTipoDocumento === item.idTipoDocumento
      )
    );
  }

  showComfirmSendSolicitud(): void {
    this.viewContainerRef.createEmbeddedView(this.modalConfirSendAprobacion);
  }

  hideShowComfirmSendSolicitud(): void {
    this.viewContainerRef.clear();
  }

  get VALID_IS_SHOW_POLICY_TELEMARKETING(): boolean {
    const channelUser: number = Number(
      JSON.parse(localStorage.getItem('currentUser')).canal || null
    );
    const res: boolean = channelUser === 2018000038 ? true : false;
    return res;
  }

  changeTermPolicyData(check: boolean): void {
    this.IS_ACEPT_TERM_POLICY_DATA = check;
  }

  changeTermPolicyPublicidad(check: boolean): void {
    this.IS_ACEPT_TERM_PUBLICIDAD = check;
  }

  async aceptarTerminosTelemarketing(): Promise<any> {
    if (this.VALID_IS_SHOW_POLICY_TELEMARKETING) {
      const data: Auto = JSON.parse(sessionStorage.getItem('auto'));
      const isFlujoNormal = sessionStorage.getItem('dep_global');
      if (isFlujoNormal) {
        data.ZONA_CIRCULACION = isFlujoNormal;
        data.p_NAUTOZONE = isFlujoNormal;
      }
      // FIXME: ESTÁ AL REVÉS
      // data.AceptaPrivacidad = this.IS_ACEPT_TERM_POLICY_DATA;
      // data.AceptaTerminos = this.IS_ACEPT_TERM_PUBLICIDAD;
      data.AceptaPrivacidad = this.IS_ACEPT_TERM_PUBLICIDAD;
      data.AceptaTerminos = this.IS_ACEPT_TERM_POLICY_DATA;
      data.p_NIDFLOW = '2';

      // FIXED: p_NREMINDER A VECES ENVIA NULL
      data.p_NREMINDER = data.p_NREMINDER || '0';
      this.step05service.aceptTerms(data).subscribe(
        (res: any) => {
          return res;
        },
        (err: any) => {
          return err;
        }
      );
    }
  }

  get sessionCertificado(): any {
    return this.utilsService.decryptStorage('certificado') || null;
  }

  get contratante(): any {
    return JSON.parse(sessionStorage.getItem('contratante')) || null;
  }

  get nameContratante(): string {
    const c = this.contratante;
    return `${c.p_SCLIENT_NAME} ${c.p_SCLIENT_APPPAT} ${c.p_SCLIENT_APPMAT}`;
  }

  get sessionAuto(): any {
    return JSON.parse(sessionStorage.getItem('auto')) || null;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  get kushkiFormControl(): { [key: string]: AbstractControl } {
    return this.kushkiForm.controls;
  }

  get uuid(): any {
    if (sessionStorage.getItem('soat-uuid')) {
      return sessionStorage.getItem('soat-uuid');
    }

    const guid = uuid();
    sessionStorage.setItem('soat-uuid', guid);
    return this.uuid;
  }

  closeModal() {
    this.viewContainerRef.clear();
  }

  private getCredentials(type: number): void {
    this.spinner.show();

    const payload: any = {
      idRamo: 66,
      idProducto: 1,
      idMoneda: 1,
      idCategoria: '1',
    };

    this.kushkiService.getCredentials(payload).subscribe({
      next: (response: any): void => {
        if (!response.success) {
          return;
        }

        const keyPublic3DS = response?.credenciales
                                     .filter((item) => item['3DS'])
                                     .map((value) => value.llavePublica);

        const keyPublic = response?.credenciales
                                  .filter((item) => !item['3DS'])
                                  .map((value) => value.llavePublica);

        this.kushki = new Kushki({
          merchantId: type === 4 ? keyPublic3DS : keyPublic,
          inTestEnvironment: !environment.production,
        });

        switch (type) {
          case 4:
            this.spinner.hide();
            this.viewContainerRef.createEmbeddedView(this.modalKushkiCard);
            break;
          case 5:
            this.kushkiCashSubmit(type);
            break;
          case 6:
            this.kushkiTransferSubmit(type);
            break;
          default:
            break;
        }
      },
      error: (error: any): void => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  binInfo(): void {
    if (this.kushkiFormControl['cardNumber'].value.length < 8) {
      return;
    }

    this.kushki.requestBinInfo(
      {
        bin: this.kushkiFormControl['cardNumber'].value,
      },
      (response: any): void => {
        this.cardType = response.brand;
      }
    );
  }

  kushkiCardSubmit(): void {
    this.spinner.show();

    this.saveInfoKushki();

    const names =
      `${this.cliente.p_SCLIENT_NAME} ${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`.trim();
    const dueDate: string = this.kushkiFormControl['dueDate'].value.split('/');

    this.kushki.requestToken(
      {
        amount: this.certificado.P_NPREMIUM,
        currency: 'PEN',
        card: {
          name:
            this.cliente.p_NDOCUMENT_TYP == 1
              ? this.cliente.p_SLEGALNAME
              : names,
          number: this.kushkiFormControl['cardNumber'].value,
          cvc: this.kushkiFormControl['cvv'].value,
          expiryMonth: dueDate[0],
          expiryYear: dueDate[1],
        },
      },
      (response): void => {
        this.spinner.hide();

        if (response['code'] === '017') {
          this.messageInfoKushki = String.messageErrors.declined;
          return;
        }

        if (!response['token']) {
          this.messageInfoKushki =
            String.messageErrors.errorValidateTransaction;
          return;
        }

        this.kushkiResult(response, this.methodKushki.card);
      }
    );
  }

  kushkiCashSubmit(type: number) {
    this.spinner.show();
    this.mensajes = [];
    this.saveInfoKushki();

    this.kushki.requestCashToken(
      {
        name: this.cliente.p_NDOCUMENT_TYP == 1 ? this.cliente.p_SLEGALNAME : this.cliente.p_SCLIENT_NAME.toUpperCase(),
        lastName: this.cliente.p_NDOCUMENT_TYP == 1 ? ' ' : `${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`.trim().toUpperCase(),
        identification: this.cliente.p_SDOCUMENT.toUpperCase(),
        documentType: DocumentType[+this.cliente.p_NDOCUMENT_TYP],
        email: this.cliente.p_SMAIL,
        totalAmount: this.certificado.P_NPREMIUM,
        currency: 'PEN',
        description: 'Seguro SOAT',
      },
      (response): void => {
        if (response['code'] === 'C041') {
          this.mensajes = response['message'].split('|');
          this.spinner.hide();
        }

        if (response['code'] === 'C002') {
          this.mensajes.push(String.messageErrors.errorGeneric);
          this.spinner.hide();
        }

        if (!response['token']) {
          this.mensajes.push(String.messageErrors.errorValidateTransaction);
          this.spinner.hide();
          return;
        }

        this.kushkiResult(response, type);
      }
    );
  }

  kushkiTransferSubmit(type: number) {
    this.spinner.show();
    this.saveInfoKushki();

    this.kushki.requestTransferToken(
      {
        callbackUrl: 'http://www.testcallbackurl.com/',
        userType: this.cliente.p_NDOCUMENT_TYP == 1 ? '1' : '0',
        documentType:
          this.cliente.p_NDOCUMENT_TYP == 1
            ? 'RUC'
            : this.cliente.p_NDOCUMENT_TYP == 2
              ? 'DNI'
              : ('CE' as any),
        documentNumber: this.cliente.p_SDOCUMENT,
        paymentDescription: 'Seguro SOAT',
        email: this.cliente.p_SMAIL,
        currency: 'PEN',
        amount: {
          subtotalIva: 0,
          subtotalIva0: +this.certificado.P_NPREMIUM,
          iva: 0,
        },
      },
      (response): void => {
        if (response['code'] === 'C041') {
          this.mensajes = response['message'].split('|');
          this.spinner.hide();
        }

        if (!response['token']) {
          this.mensajes.push(String.messageErrors.errorValidateTransaction);
          this.spinner.hide();
          return;
        }

        this.kushkiResult(response, type);
      }
    );
  }

  saveInfoKushki(): void {
    const payload = {
      montoCobro: this.certificado.P_NPREMIUM,
      codigoCanal: this.currentUser.canal,
      idUsuario: this.currentUser.id,
      idRamo: 66,
      idProducto: 1,
      idMoneda: 1,
      externalId: this.uuid,
      idTipoDocumento: +this.cliente.p_NDOCUMENT_TYP,
      numeroDocumento: this.cliente.p_SDOCUMENT,
      email: this.cliente.p_SMAIL,
      idPayment: JSON.parse(sessionStorage.getItem('auto')).p_NIDPROCESS,
      nombres: this.cliente.p_SCLIENT_NAME,
      apellidoPaterno: this.cliente.p_SCLIENT_APPPAT,
      apellidoMaterno: this.cliente.p_SCLIENT_APPMAT,
      razonSocial: this.cliente.p_SLEGALNAME,
      telefono: +this.cliente.p_SPHONE,
      canalKushki: 'web',
    };
    this.kushkiService.saveInfo(payload as any).subscribe();
  }

  kushkiResult(result: any, type: number): void {
    if (result?.secureService === '3dsecure') {
      this.validate3DS(result, type);
    } else {
      this.processPayment(result['token'], type);
    }
  }

  private validate3DS(info: any, type: number): void {
    const payload = {
      secureId: info.secureId,
      security: {
        acsURL: info.security.acsURL,
        authenticationTransactionId: info.security.authenticationTransactionId,
        paReq: info.security.paReq,
        specificationVersion: info.security.specificationVersion,
        authRequired: info.security.authRequired,
      },
    };

    this.viewContainerRef.clear();
    this.kushkiForm.patchValue(
      {
        cardNumber: '',
        dueDate: '',
        cvv: '',
      },
      { emitEvent: false }
    );

    this.kushki.requestValidate3DS(payload, (response: any): void => {
      if (!response?.isValid) {
        this.spinner.hide();
        return;
      }
      this.processPayment(info['token'], type);
    });
  }

  private processPayment(token: string, type: number): void {
    const emissionPayload = {
      idProceso: +JSON.parse(sessionStorage.getItem('auto')).p_NIDPROCESS,
      tipoPago: type,
      isRenovation: 0,
      token,
      idClienteGoogle: this.utilsService.getClientID(),
      idSesionTransaccion: this.utilsService.getSessionID(),
    };

    sessionStorage.setItem('kushki-payload', JSON.stringify(emissionPayload));

    if (type === this.methodKushki.card) {
      this.router.navigate([`/broker/resultado/${token}`]);
    } else {
      this.emissionProcessKushki(emissionPayload);
    }
  }

  emissionProcessKushki(payload: any) {
    this.spinner.show();
    this.kushkiService.processEmission(payload).subscribe(
      (res: any) => {
        this.spinner.hide();

        if (!res.success) {
          this.mensajes.push(
            'Ocurrió un problema al generar tu solicitud, vuelva a intentarlo'
          );
          return;
        }

        window.open(res.message, '_blank');
        this.router.navigate(['broker/rescupon']);
      },
      (err: any) => {
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  enviarCotizacion(type): void {
    this.hideModalGeneracion();
    this.typeSendCotizacion = type;

    const data = {
      idProcess: +JSON.parse(sessionStorage.getItem('auto')).p_NIDPROCESS,
      mail: this.contratante?.p_SMAIL?.toString().toLocaleLowerCase(),
      nombreCliente: this.nameContratante,
      placa: this.sessionAuto?.p_SREGIST,
      tipo: type,
      telefono: this.contratante.p_SPHONE,
    };
    // * 1: VIA WEB | 2: VIA WHATSAPP
    this.spinner.show();
    this.step05service.sendCotizacion(data).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.linkPagoCliente = res.url;
        if (this.tipoEnvio.length > 1) {
          this.showModalSuccess(
            'Link de pago enviado',
            `Se envió correctamente la cotización al correo ${data?.mail} y al teléfono ${this.cliente.p_SPHONE}`
          );
        } else {
          if (type === 1) {
            this.showModalSuccess(
              'Link de pago enviado',
              `Se envió correctamente la cotización al correo ${data?.mail}`
            );
          } else {
            this.showModalSuccess(
              'Link de pago enviado',
              `Se envió correctamente la cotización al teléfono ${this.cliente.p_SPHONE}`
            );
          }
        }
      },
      (err: any) => {
        console.error(err);
        this.spinner.hide();
      }
    );
  }

  typeEnviar() {
    this.tipoEnvio.forEach((val) => {
      this.enviarCotizacion(Number(val));
    });
  }

  showModalGeneracion() {
    this.viewContainerRef.createEmbeddedView(this.modalGeneracion);
  }

  hideModalGeneracion() {
    this.formTipoEnvio.reset();
    this.viewContainerRef.clear();
  }

  copyText() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.mensajeWsp;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.isCopyMensaje = true;
    setTimeout(() => {
      this.isCopyMensaje = false;
    }, 1200);
  }

  changeTipoEnvio(tipoEnvio, seleccionado) {
    if (seleccionado) {
      this.tipoEnvio.push(tipoEnvio);
    } else {
      this.tipoEnvio = this.tipoEnvio.filter((x) => x !== tipoEnvio);
    }
  }

  get bloquearCheckEnvioPromociones(): boolean {
    const contratante = JSON.parse(
      sessionStorage.getItem('contratante') || '{}'
    );
    if (contratante?.p_SBAJAMAIL_IND?.toString() === '1') {
      this.IS_ACEPT_TERM_PUBLICIDAD = true;
      return true;
    }
    this.IS_ACEPT_TERM_PUBLICIDAD = false;
    return false;
  }
}
