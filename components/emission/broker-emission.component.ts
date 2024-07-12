import { ContratanteComponent } from './../contratante/contratante.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '@root/app.config';
import { FormaDePago, Turno } from '../../models/delivery/delivery';
import { ClaseModel } from './../../../client/shared/models/clase.model';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { Marca } from '../../../client/shared/models/marca.model';
import { Auto, ParseAuto } from '../../models/auto/auto.model';
import { UsoService } from '@shared/services/uso/uso.service';
import { Uso } from '@shared/models/use/use';
import { Router } from '@angular/router';
import { Modelo } from '../../../client/shared/models/modelo.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Cliente } from '../../models/cliente/cliente';
import { Step03Service } from '../../services/step03/step03.service';
import { isNullOrUndefined } from 'util';
import { Province } from '@shared/models/province/province';
import { District } from '@shared/models/district/district';
import { Municipality } from '@shared/models/municipality/municipality';
import { UbigeoService } from '@shared/services/ubigeo/ubigeo.service';
import { Certificado } from '../../models/certificado/certificado';
import { Poliza } from '../../models/poliza/poliza';
import { Step04Service } from '../../services/step04/step04.service';
import { UtilityService } from '@shared/services/general/utility.service';
import { Prima, PrimaFilter } from '../../../client/shared/models/prima.model';
import { ZonaRegistral } from '../../../client/shared/models/zona-registral.model';
import { Plan, PlanTariff } from '../../models/plan/plan';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Campaign } from '@shared/models/campaign/campaign';
import {
  convertDateToStringOracle,
  sortArray,
  validateMinDate,
} from '@shared/helpers/utils';
import { VisaService } from '@shared/services/pago/visa.service';
import { DeliveryService } from '../../services/delivery/delivery.service';
import { Step05Service } from '../../services/step05/step05.service';
import { EventStrings } from '../../shared/events/events';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UtilsService } from '@shared/services/utils/utils.service';
import { RegularExpressions } from '@shared/regexp/regexp';
import { forkJoin } from 'rxjs';
import { BandejaSolicitudesService } from '@root/layout/broker/components/bandeja-solicitudes/shared/services/bandeja-solicitudes.service';
import { AttachDocument } from '@root/layout/broker/components/bandeja-solicitudes/shared/interfaces/request-tray.interface';
import { Response } from '@shared/interfaces/response.interface';
import { Parameters } from '@root/layout/broker/components/bandeja-solicitudes/shared/models/request-tray.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Request } from '@root/layout/client/shared/interfaces/request.interface';
import moment from 'moment';

@Component({
  selector: 'app-broker-emission',
  templateUrl: './broker-emission.component.html',
  styleUrls: ['./broker-emission.component.scss'],
})
export class BrokerEmissionComponent implements OnInit, AfterViewChecked {
  bLock01 = false;
  bLock02 = true;
  bLock03 = true;
  bLock04 = true;

  year = new Date().getFullYear() + 1;
  // PASO 1
  deshabilitarNuevoSoat = false;
  bTipoVehiculo = true;
  sTipoVehiculo = '1';
  bValido = false;
  bValidado = false;
  codigo = '';
  mensaje = '';
  placa = '';
  bValidar = false;
  bLoading = false;
  Modalidad: any;
  tCertificado: number;
  NroCertificado: number;
  mainTitle = '';
  titulos: string[];
  longitudPlaca = 6;
  ultimaPaginaNavegada = 0;
  paginaActual = 4;

  // PASO 2
  auto: Auto = new Auto();
  autoSession = new Auto();
  usos: Uso[];
  clasesFull: ClaseModel[] = [];
  clases: ClaseModel[] = [];
  marcasFull: Marca[] = [];
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  fechaInicioVigencia = '';
  mensajeError = '';
  bserie = false;
  claseSeleccionada = false;
  marcaSeleccionada = false;
  marcaDescrp: Marca[];
  vehiculoForm: FormGroup;
  listaAsientos: number[];
  listZonaRegistral: ZonaRegistral[] = [];

  // PASO 3
  Cliente = new Cliente();
  ClienteFact = new Cliente();
  departamentos: Province[] = [];
  provinciasDelivery: District[] = [];
  distritosDelivery: Municipality[] = [];

  // Facturacion
  showchkFacturar = false;
  showchkgenfacturacnt = false;
  facturarContratante = false;
  facturar = false;

  // PASO 4
  certificadoSession = new Certificado();
  Certificado = new Certificado();
  lstPolizasFull: Poliza[] = [];
  lstPolizasFilter: Poliza[] = [];
  lstPolizasParticular: Poliza[] = [];
  lstPolizasPublico: Poliza[] = [];

  lstTarifarios: PlanTariff[] = [];
  filter: any = {};
  planes: Plan[] = [];
  tarifa = new Prima();
  totalSoats = 0;
  mensajeVigencia = '';
  truefalsePlan = true;
  LockPlan = true;
  codigoVigencia = '';
  certificadoForm: FormGroup;
  datosEntregaForm: FormGroup;
  bMostrar = false;
  canal = '';
  puntoVenta = '';
  brokerId = null;
  intermediaId = null;
  bEditPrecio = true;
  bSpinner = false;
  bSpinner2 = false;
  fecha_vigencia: Date = new Date();
  fecha_entrega: Date;
  validaCampaign = new Campaign();

  idcanal: any;

  // Datos de Entrega
  minDateEntrega: Date = new Date();
  minDateEmission: Date = new Date();
  showSeccionEntrega = false;
  formasDePago: FormaDePago[];
  turnos: Turno[];
  IS_FLUJO_USOS = false;
  MESSAGE_ERROR_VALIDAR_PLACA: string;
  clienteDeudaEstado = false;

  primaRegular: any;

  formTerms: FormGroup;

  documentTypes: any[] = [];
  enabledBrandMoto: boolean = false;
  isValidBrand: boolean = false;
  // tslint:disable-next-line:max-line-length
  regexBrand: RegExp = new RegExp(
    /^([a-zA-Z]{3}[0-9]{3}|[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{2}|[a-zA-Z]{3}[0-9]{2}[a-zA-Z]{1}|[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{2}|[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{1}[0-9]{1}|[a-zA-Z]{4}[0-9]{2}|[a-zA-Z]{4}[0-9]{1}[a-zA-Z]{1}|[a-zA-Z]{5}[0-9]{1}|[a-zA-Z]{6}|[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{1}|[a-zA-Z]{1}[0-9]{3}[a-zA-Z]{1}[0-9]{1}|[a-zA-Z]{1}[0-9]{2}[a-zA-Z]{1}[0-9]{2}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{3}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{4}|[a-zA-Z]{1}[0-9]{2}[a-zA-Z]{3}|[a-zA-Z]{1}[0-9]{3}[a-zA-Z]{2}|[a-zA-Z]{1}[0-9]{2}[a-zA-Z]{2}[0-9]{1}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{1}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{2}[0-9]{2}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{2}[0-9]{1}[a-zA-Z]{1}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{3}[0-9]{1}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{2}[a-zA-Z]{1}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{2}|[a-zA-Z]{1}[0-9]{2}[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}|[a-zA-Z]{2}[0-9]{1}[a-zA-Z]{3}|[a-zA-Z]{2}[0-9]{2}[a-zA-Z]{2}|[a-zA-Z]{2}[0-9]{3}[a-zA-Z]{1}|[a-zA-Z]{2}[0-9]{1}[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}|[a-zA-Z]{2}[0-9]{1}[a-zA-Z]{2}[0-9]{1}|[a-zA-Z]{2}[0-9]{1}[a-zA-Z]{1}[0-9]{2}|[a-zA-Z]{2}[0-9]{2}[a-zA-Z]{1}[0-9]{1})+$/
  );

  formUpdateInfoAuto: FormGroup = this.builder.group({
    brand: ['', Validators.maxLength(20)],
    model: ['', Validators.maxLength(20)],
    version: ['', Validators.maxLength(20)],
    class: ['', Validators.maxLength(20)],
    comment: [''],
    documents: this.builder.array([], Validators.required),
  });

  attachedFiles: File[] = [];

  @ViewChild('modalPolizas', { static: true })
  modalPolizas;

  @ViewChild('modalError', { static: true })
  modalError;

  @ViewChild('appasegurado')
  appasegurado: ContratanteComponent;

  @ViewChild('appcontrantante')
  appcontrantante: ContratanteComponent;

  @ViewChild('fv', { static: true })
  fv;

  @ViewChild('fe', { static: true })
  fe;

  requestIdResponse: number = null;

  @ViewChild('modalErrorValidarPlaca', { static: true, read: ModalDirective })
  modalErrorValidarPlaca: ModalDirective;

  @ViewChild('modalTerms', { static: true, read: TemplateRef })
  modalTerms: TemplateRef<any>;

  @ViewChild('modalDeudaEstado', { static: true, read: TemplateRef })
  _modalDeudaEstado: TemplateRef<any>;

  @ViewChild('modalUpdateBrandAuto', { static: true, read: TemplateRef })
  modalUpdateBrandAuto: TemplateRef<ElementRef>;

  @ViewChild('modalCornfirmUpdateAuto', { static: true, read: TemplateRef })
  modalCornfirmUpdateAuto: TemplateRef<ElementRef>;

  @ViewChild('modalSuccessRequestUpdateAuto', {
    static: true,
    read: TemplateRef,
  })
  modalSuccessRequestUpdateAuto: TemplateRef<ElementRef>;

  @ViewChild('modalErrorUpdateAuto', { static: true, read: TemplateRef })
  modalErrorUpdateAuto: TemplateRef<ElementRef>;

  constructor(
    private readonly router: Router,
    private readonly builder: FormBuilder,
    private readonly cd: ChangeDetectorRef,
    private readonly visaService: VisaService,
    private readonly _vc: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly usoService: UsoService,
    private readonly step03service: Step03Service,
    private readonly ubigeoService: UbigeoService,
    private readonly step04service: Step04Service,
    private readonly step05service: Step05Service,
    private readonly utilityService: UtilityService,
    private readonly vehiculoService: VehiculoService,
    private readonly emisionService: EmisionService,
    private readonly deliveryService: DeliveryService,
    private readonly utilsService: UtilsService,
    private readonly bandejaSolicitudesService: BandejaSolicitudesService
  ) {
    this.formTerms = this.builder.group({
      aceptTerms: [true],
      aceptPrivacy: [false],
    });
    if (this.termsStorage?.AceptaTerminos) {
      this.ft['aceptTerms'].setValue(this.termsStorage.AceptaTerminos);
      this.ft['aceptPrivacy'].setValue(this.termsStorage.AceptaPrivacidad);
    } else {
      this.ft['aceptTerms'].setValue(true);
      this.ft['aceptPrivacy'].setValue(false);
      this.saveTermsToStorage();
    }
    this.ft['aceptTerms'].disable();
    if (!this.isTeleMarketing) {
      this.ft['aceptTerms'].setValue(true);
      this.ft['aceptTerms'].disable();
    }
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get formAutoDocumentList(): FormArray {
    return this.formUpdateInfoAuto.get('documents') as FormArray;
  }

  ngOnInit() {
    sessionStorage.removeItem('soat-summary-navigate');
    this.initComponent();
    this.idcanal = this.currentUser.canal;

    const zonaCirc = +JSON.parse(sessionStorage.getItem('auto')).ZONA_CIRCULACION;

    if (zonaCirc) {
      this.vehiculoForm.get('zonaCirculacion').setValue(zonaCirc);
      this.auto.ZONA_CIRCULACION = zonaCirc;
    }

    this.ft['aceptTerms'].valueChanges.subscribe(() => {
      this.saveTermsToStorage();
    });
    this.ft['aceptPrivacy'].valueChanges.subscribe(() => {
      this.saveTermsToStorage();
    });

    this.getChannelConfiguration();
  }

  get cf(): any {
    return this.certificadoForm.controls;
  }

  get ft(): { [key: string]: AbstractControl } {
    return this.formTerms.controls;
  }

  get formUpdateInfoAutoControl(): { [key: string]: AbstractControl } {
    return this.formUpdateInfoAuto.controls;
  }

  formUpdateInfoAutoValueChanges(): void {
    this.formUpdateInfoAutoControl['brand'].valueChanges.subscribe(
      (value: string) => {
        this.formUpdateInfoAutoControl['brand'].setValue(
          value.toUpperCase().trimLeft(),
          { emitEvent: false }
        );
      }
    );

    this.formUpdateInfoAutoControl['model'].valueChanges.subscribe(
      (value: string) => {
        this.formUpdateInfoAutoControl['model'].setValue(
          value.toUpperCase().trimLeft(),
          { emitEvent: false }
        );
      }
    );

    this.formUpdateInfoAutoControl['version'].valueChanges.subscribe(
      (value: string) => {
        this.formUpdateInfoAutoControl['version'].setValue(
          value.toUpperCase().trimLeft(),
          { emitEvent: false }
        );
      }
    );

    this.formUpdateInfoAutoControl['class'].valueChanges.subscribe(
      (value: string) => {
        this.formUpdateInfoAutoControl['class'].setValue(
          value.toUpperCase().trimLeft(),
          { emitEvent: false }
        );
      }
    );
  }

  isEqualString(control: string, compare: string, value: string): boolean {
    return (
      value.toLowerCase().trim() != compare.toLowerCase().trim() &&
      this.formUpdateInfoAutoControl[control].touched
    );
  }

  initComponent() {
    window.scroll(0, 0);
    sessionStorage.setItem('pagefrom', 'BrokerEmissionComponent');
    sessionStorage.setItem('processResult', '0');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canal = currentUser && currentUser['canal'];
    this.puntoVenta = currentUser && currentUser['puntoVenta'];
    this.brokerId = currentUser && currentUser['brokerId'];
    this.intermediaId = currentUser && currentUser['intermediaId'];

    this.getDataUserSession();

    this.Modalidad = JSON.parse(sessionStorage.getItem('Modalidad'));
    this.tCertificado = this.Modalidad && this.Modalidad['tipoCertificado'];
    this.NroCertificado = Number(this.tCertificado) - 1;
    this.setTitle(this.NroCertificado);
    // SECCION CONTRATANTE
    this.listarDepartamentos();

    // SECCION VEHICULO
    this.autoSession = <Auto>JSON.parse(sessionStorage.getItem('auto'));

    if (!isNullOrUndefined(this.autoSession)) {
      this.auto = this.autoSession;
    } else {
      this.auto = new Auto();
    }

    if (this.auto.p_SREGIST !== undefined) {
      this.placa = this.auto.p_SREGIST;
      this.deshabilitarNuevoSoat = true;
      this.bLock01 = true;
      this.bLock02 = false;
      this.bLock03 = false;
      this.bLock04 = false;
    }

    if (this.auto.registrationZone) { 
        this.listZonaRegistral = this.auto.registrationZone; 
    }

    this.onSetTipoVehiculo(true);
    this.crearFormularioVehiculo();
    this.getMarcas();
    this.cargarSeccionVehiculo();

    this.vehiculoForm.controls['marcacodigo'].enable({ emitEvent: false });
    this.vehiculoForm.controls['modelo'].enable({ emitEvent: false });

    if (this.auto.p_ORIGIN && !this.isTeleMarketing) {
      this.vehiculoForm.controls['marcacodigo'].disable({ emitEvent: false });
      this.vehiculoForm.controls['modelo'].disable({ emitEvent: false });
    }

    // SECCION CERTIFICADO
    this.crearFormularioCertificado();
    this.bMostrar = this.tCertificado !== 3;
    this.bEditPrecio = this.tCertificado !== 1;

    // SECCION DELIVERY
    this.formasDePago = [];
    this.turnos = [];
    this.crearFormularioDatosEntrega();
    this.asignarSeccionCertificadoEntrega();
    this.formUpdateInfoAutoValueChanges();
  }

  getChannelConfiguration(): void {
    this.documentTypes = [];
    this.emisionService.getChannelConfiguration(this.currentUser['canal']).subscribe({
      next: (response): void => {
        this.documentTypes = response.listadoTipoDocumentos.map((obj) => ({
          niddoC_TYPE: obj.idTipoDocumento,
          sdescript: obj.tipoDocumento,
        }));

        this.enabledBrandMoto = response.listadoClases.some(
          (x) => +x.idClase == 55
        );
        if (this.isOperationUser) {
          this.longitudPlaca = 7;
          return;
        }

        this.longitudPlaca = this.enabledBrandMoto ? 8 : 6;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      },
    });
  }

  saveTermsToStorage(): void {
    sessionStorage.setItem(
      'acept-terms-stepall',
      JSON.stringify({
        AceptaTerminos: this.ft['aceptTerms'].value,
        AceptaPrivacidad: this.ft['aceptPrivacy'].value,
      })
    );
  }

  get termsStorage(): any {
    return JSON.parse(sessionStorage.getItem('acept-terms-stepall') || '{}');
  }

  get isOperationUser(): boolean {
    const adminCurrentUser = JSON.parse(localStorage.getItem('admincurrentUser') ?? '{}')
    return this.currentUser['canal'] == 2018000011 || adminCurrentUser.intermediaId == 2018000011;
  }

  asignarSeccionCertificadoEntrega() {
    this.getPolizas(this.puntoVenta, this.canal, this.tCertificado.toString());
    this.certificadoSession = this.utilsService.decryptStorage('certificado');

    if (!isNullOrUndefined(this.certificadoSession)) {
      this.Certificado = this.certificadoSession;
      this.initFormularioPaso04();
    }
    if (
      this.Certificado.P_DSTARTDATE !== undefined &&
      this.Certificado.P_DSTARTDATE !== null
    ) {
      this.ValidaFecha(this.Certificado.P_DSTARTDATE);
      this.fecha_vigencia = new Date(
        this.Certificado.P_DSTARTDATE.toString().replace('-', '/')
      );
    } else {
      this.placa && this.validateStartDate(this.placa);
    }
    const validacampaignSession = <Campaign>(
      JSON.parse(sessionStorage.getItem('validaCampaign'))
    );
    if (validacampaignSession !== null) {
      this.validaCampaign = validacampaignSession;
    }
    this.truefalsePlan = true;
    this.LockPlan = true;
  }

  setTitle(id: number) {
    this.titulos = [
      'Crea un Soat Manual',
      'Crea un Soat Láser',
      'Crea un Soat Electrónico',
    ];
    this.mainTitle = this.titulos[id];
  }

  onSetTipoVehiculo(tipo) {
    if (!this.bLock01) {
      this.bTipoVehiculo = tipo;
      if (this.bTipoVehiculo) {
        this.sTipoVehiculo = '1';
        this.longitudPlaca = 6;
      } else {
        this.sTipoVehiculo = '2';
        this.longitudPlaca = 8;
      }
      this.placa = '';
    }
  }

  soloLetrasNumeros(valor): boolean {
    let pattern: RegExp = this.regexBrand;

    if (this.enabledBrandMoto || this.isOperationUser) {
      pattern = /^([A-Za-z0-9])+$/;
    }

    return pattern.test(valor?.toLowerCase());
  }

  onPaste(event: ClipboardEvent) {
    this.placa = '';
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    if (!isNullOrUndefined(pastedText)) {
      let tmpPastedText = pastedText;
      const specialChars = '!@#$^&%*()+=-[]/{}|:<>?,.';
      for (let i = 0; i < specialChars.length; i++) {
        tmpPastedText = tmpPastedText.split(specialChars[i]).join('');
      }
      const pattern = /^([A-Za-z0-9])+$/;
      if (!pattern.test(tmpPastedText)) {
        event.preventDefault();
        return;
      }
      setTimeout(() => {
        this.placa = tmpPastedText.substr(0, 6);
        this.cd.markForCheck();
      }, 0);
    }
  }

  omit_special_char(e) {
    let k;
    document.all ? (k = e.keyCode) : (k = e.which);
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k === 8 ||
      (k >= 48 && k <= 57)
    );
  }

  // PASO 1
  validarPlaca() {
    this.mensaje = '';

    if (this.placa.length < 6) {
      this.bValidado = true;
      this.bValido = false;
      this.mensaje = 'La longitud de la placa debe ser mayor a 6 dígitos';
      return;
    }

    if (!this.soloLetrasNumeros(this.placa)) {
      this.bValidado = true;
      this.bValido = false;
      this.mensaje = 'El formato de la placa no es válido';
      return;
    }
    const fecDef = this.certificadoForm.controls.fechavigencia.value;

    const tipoVehiculo = this.regexBrand.test(this.placa.toLowerCase()) ? '1' : '55';

    this.vehiculoForm.controls['marcacodigo'].enable({ emitEvent: false });
    this.vehiculoForm.controls['modelo'].enable({ emitEvent: false });

    this.spinner.show();
    this.clases = [];
    this.bValidar = true;
    this.bLoading = true;
    this.bValido = false;
    this.bValidado = false;
    this.minDateEmission = new Date();

    forkJoin([
      this.vehiculoService.informacionPlaca(this.canal, tipoVehiculo, this.placa.toUpperCase()),
      this.vehiculoService.getPlateInfo(this.placa)
    ]).subscribe({
      next: (response: [any, any]) => {
        const auto: ParseAuto = new ParseAuto(response[1])
        const data = {
          ...response[0],
          ...auto
        };

        if (this.isOperationUser) {
          data.p_VALIDO = '1';
          data.p_MENSAJE = null;
        }

        this.codigo = data.p_VALIDO;
        this.mensaje = data.p_MENSAJE;
        this.bLoading = false;
        this.bValidado = true;

        if (this.codigo === '1') {
          this.bValido = true;
          const validaCampaign = new Campaign();
          validaCampaign.fechaCampaign = data.dexpirdat;
          validaCampaign.validaPlacaCampaign = data.nvalida;
          validaCampaign.nidcampaign = data.nidcampaign;
          this.validaCampaign = validaCampaign;
          sessionStorage.setItem(
            'validaCampaign',
            JSON.stringify(validaCampaign)
          );
          if (!isNullOrUndefined(data)) {
            this.auto = data;

            if (this.auto.p_ORIGIN && !this.isTeleMarketing) {
              this.vehiculoForm.controls['marcacodigo'].disable({
                emitEvent: false,
              });
              this.vehiculoForm.controls['modelo'].disable({
                emitEvent: false,
              });
            }
          }
          this.auto.p_STYPE_REGIST = this.sTipoVehiculo;
          this.auto.p_NIDCLASE =
            this.auto.p_NIDCLASE === null ? '0' : this.auto.p_NIDCLASE;
          this.auto.p_NIDUSO =
            this.auto.p_NIDUSO === null ? '' : this.auto.p_NIDUSO;
          this.auto.p_SREGIST = this.placa.toString().toUpperCase();
          this.auto.versionId = this.auto.p_NVEHMODEL;
          this.auto.versionName = this.auto.p_SNAME_VEHMODEL;

          if (!isNullOrUndefined(this.auto.p_SNUMSERIE)) {
            this.auto.p_SNUMSERIE = this.auto.p_SNUMSERIE.trim();
          }

          this.auto.AceptaTerminos = this.termsStorage?.AceptaTerminos;
          this.auto.AceptaPrivacidad = this.termsStorage?.AceptaPrivacidad;
          sessionStorage.setItem('auto', JSON.stringify(this.auto));
          this.deshabilitarNuevoSoat = true;
          this.bLock01 = true;
          this.bLock02 = false;
          this.bLock03 = false;
          this.bLock04 = false;
          this.cargarSeccionVehiculo();
          this.validateStartDate(this.placa);
          this.onFechaVigenciaChange(fecDef);
        } else {
          this.bValidar = false;
        }

        setTimeout(() => {
          this.spinner.hide();
        }, 500);
      },
      error: (error) => {
        console.log(error);
        this.spinner.hide();
        this.bValidado = true;
        this.bValidar = false;
        this.bLoading = false;
        this.mensaje =
          'No se pudo realizar la validación de la placa. Por favor vuelva a intentarlo.';
      }
    });
  }

  validateStartDate(data: string) {
    this.vehiculoService.infoPlacaFechaInicio(data).subscribe(
      (res) => {
        if (res.success) {
          if (res.vehiculo?.fechaInicio && res.vehiculo?.origen == 'CORE') {
            this.fecha_vigencia = moment(
              res.vehiculo?.fechaInicio,
              'DD/MM/YYYY'
            ).toDate();

            const minDate = new Date(this.fecha_vigencia);
            minDate.setDate(minDate.getDate() - 1);

            this.minDateEmission = minDate;
          }
          const formatDate = moment(this.fecha_vigencia).format('YYYY-MM-DD');
          this.onFechaVigenciaChange(formatDate);

          this.listZonaRegistral = res.listaZonaRegistralUbigeo;
          
          this.auto = {
            ...this.auto,
            registrationZone: this.listZonaRegistral,
          };
          sessionStorage.setItem('auto', JSON.stringify(this.auto));
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  validaCampaignPlaca() {
    this.vehiculoService.validarPlacaCampaign(this.canal, this.placa).subscribe(
      (data) => {
        if (data != null) {
          this.validaCampaign.fechaCampaign = data['dexpirdat'];
          this.validaCampaign.validaPlacaCampaign = data['nvalida'];
          if (Number(this.validaCampaign.validaPlacaCampaign) === 1) {
            this.validaCampaign.nidcampaign = data['nidcampaign'];
            this.Certificado.P_DSTARTDATE = data['dexpirdat'];
            this.fecha_vigencia = data['dexpirdat'];
            this.certificadoForm.controls.fechavigencia.setValue(
              this.Certificado.P_DSTARTDATE
            );
          }
        } else {
          this.validaCampaign.nidcampaign = 0;
          this.validaCampaign.validaPlacaCampaign = '0';
        }
        sessionStorage.setItem(
          'validaCampaign',
          JSON.stringify(this.validaCampaign)
        );
      },
      (error) => {
        console.log(error);
        this.bValidado = true;
        this.bValidar = false;
        this.bLoading = false;
        this.mensaje =
          'No se pudo realizar la validación de la placa. Por favor vuelva a intentarlo.';
      }
    );
  }

  validateSerie(control) {
    const value = control.value;

    // Verificar al menos una letra y un número
    const letraNumeroRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

    // Verificar que no haya 5 letras iguales seguidas
    const letrasRepetidasRegex = /([a-zA-Z])\1{5,}/;

    // Verificar que no haya 5 números iguales seguidas
    const numerosRepetidosRegex = /(\d)\1{5,}/;

    // if (value && value[0] == 0) {
    //   return { initialZero: true };
    // }

    if (!letraNumeroRegex.test(value)) {
      return { letraNumeroReq: true };
    }

    if (letrasRepetidasRegex.test(value)) {
      return { letrasRepetidas: true };
    }

    if (numerosRepetidosRegex.test(value)) {
      return { numerosRepetidos: true };
    }

    return null;
  }

  obtenerDatosAutoPorPlaca(placa) {
    this.emisionService.autoPorPlaca(placa).subscribe(
      (res) => {
        const arrAuto = res;
        if (!isNullOrUndefined(arrAuto)) {
          this.auto = arrAuto;
        }
        this.auto.p_STYPE_REGIST = this.sTipoVehiculo;
        this.auto.p_SREGIST = this.placa.toString().toUpperCase();
        if (!isNullOrUndefined(this.auto.p_SNUMSERIE)) {
          this.auto.p_SNUMSERIE = this.auto.p_SNUMSERIE.trim();
        }
        this.auto.AceptaTerminos = this.termsStorage?.AceptaTerminos;
        this.auto.AceptaPrivacidad = this.termsStorage?.AceptaPrivacidad;
        sessionStorage.setItem('auto', JSON.stringify(this.auto));
        this.deshabilitarNuevoSoat = true;
        this.bLock01 = true;
        this.bLock02 = false;
        this.bLock03 = false;
        this.bLock04 = false;
        this.cargarSeccionVehiculo();
      },
      (err) => {
        console.log(err);
        this.bLoading = false;
        this.bValidar = false;
        this.bLoading = false;
      }
    );
  }

  // PASO 2
  crearFormularioVehiculo() {
    this.vehiculoForm = this.builder.group({
      clasecodigo: ['0', Validators.required],
      clasedescripcion: [''],
      uso: ['', Validators.required],
      marcacodigo: ['', Validators.required],
      marcadescripcion: [''],
      modelo: ['', Validators.required],
      modeloId: [''],
      modeloprincipal: ['', Validators.required],
      serie: [
        '',
        [
          Validators.pattern(/^[1-9a-zA-Z][0-9a-zA-Z]*$/),
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(30),
          this.validateSerie,
        ],
      ],
      asientos: ['', [Validators.required]],
      anho: [
        '',
        [
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.min(1950),
          Validators.maxLength(4),
          Validators.max(this.year),
        ],
      ],
      zonaCirculacion: [null, Validators.required],
    });
    const control: { [key: string]: AbstractControl } =
      this.vehiculoForm.controls;

    control['serie'].valueChanges.subscribe((value: string) => {
      if (value) {
        const newValue = value.replace(/[^a-zA-Z0-9]/g, '');

        if (newValue.length != value.length) {
          control['serie'].setValue(newValue);
          return;
        }

        if (
          (control['serie'].hasError('pattern') ||
            value?.toString()?.slice(0, 1) == '0') &&
          value.length == 1
        ) {
          control['serie'].setValue(value.slice(0, value.length - 1));
        }
      }
    });

    control['asientos'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (control['asientos'].hasError('pattern')) {
          control['asientos'].setValue(value.slice(0, value.length - 1));
        }
        this.auto.p_SEATNUMBER = value;
      }
    });

    control['anho'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (control['anho'].hasError('pattern')) {
          control['anho'].setValue(value.slice(0, value.length - 1));
        }
        this.auto.p_NYEAR = value;
      }
    });
  }

  changeZonaCirculacion(val): void {
    this.vehiculoForm.get('zonaCirculacion').setValue(val);
    // tslint:disable-next-line:max-line-length
    if (
      this.vehiculoForm.get('zonaCirculacion').value !== null ||
      Number(this.vehiculoForm.get('zonaCirculacion').value) !== 0
    ) {
      this.obtenerTarifa(null);
    }
  }

  cargarSeccionVehiculo() {
    this.auto.p_NIDUSO = isNullOrUndefined(this.auto.p_NIDUSO)
      ? ''
      : this.auto.p_NIDUSO;
    this.auto.p_NVEHBRAND = isNullOrUndefined(this.auto.p_NVEHBRAND)
      ? ''
      : this.auto.p_NVEHBRAND;
    this.auto.p_SNAME_VEHBRAND = isNullOrUndefined(this.auto.p_SNAME_VEHBRAND)
      ? ''
      : this.auto.p_SNAME_VEHBRAND;
    this.auto.p_NVEHMODEL = isNullOrUndefined(this.auto.p_NVEHMODEL)
      ? ''
      : this.auto.p_NVEHMODEL;
    this.auto.p_NIDCLASE = isNullOrUndefined(this.auto.p_NIDCLASE)
      ? ''
      : this.auto.p_NIDCLASE;
    this.auto.p_NVEHMAINMODEL = isNullOrUndefined(this.auto.p_NVEHMAINMODEL)
      ? ''
      : this.auto.p_NVEHMAINMODEL;
    this.auto.p_SNAMECLASE = isNullOrUndefined(this.auto.p_SNAMECLASE)
      ? ''
      : this.auto.p_SNAMECLASE;
    this.auto.p_SNUMSERIE = isNullOrUndefined(this.auto.p_SNUMSERIE)
      ? ''
      : this.auto.p_SNUMSERIE;
    this.auto.p_SEATNUMBER = isNullOrUndefined(this.auto.p_SEATNUMBER)
      ? ''
      : this.auto.p_SEATNUMBER;
    this.auto.p_NYEAR = isNullOrUndefined(this.auto.p_NYEAR)
      ? ''
      : this.auto.p_NYEAR;
    this.auto.p_SNAME_VEHMODEL = isNullOrUndefined(this.auto.p_SNAME_VEHMODEL)
      ? ''
      : this.auto.p_SNAME_VEHMODEL;

    if (this.auto.p_NIDUSO !== '' || this.auto.p_NIDUSO !== null) {
      this.vehiculoForm.controls.uso.setValue(this.auto.p_NIDUSO.toString());
    }

    if (this.auto.p_NVEHBRAND !== '') {
      this.vehiculoForm.controls.marcacodigo.setValue(
        this.auto.p_NVEHBRAND.toString()
      );
      this.getModelos(true);

      if (this.auto.p_SNAME_VEHBRAND !== '') {
        this.vehiculoForm.controls.marcadescripcion.setValue(
          this.auto.p_SNAME_VEHBRAND
        );
      }

      if (this.auto.p_NVEHMODEL !== '') {
        this.vehiculoForm.controls.modelo.setValue(this.auto.p_SNAME_VEHMODEL);
        this.getClases();
      }
    }

    if (this.auto.p_SNUMSERIE !== '') {
      this.vehiculoForm.controls.serie.setValue(this.auto.p_SNUMSERIE.trim());
    }

    if (this.auto.p_SEATNUMBER !== '') {
      this.vehiculoForm.controls.asientos.setValue(this.auto.p_SEATNUMBER);
    }

    if (this.auto.p_NYEAR !== '') {
      this.vehiculoForm.controls.anho.setValue(this.auto.p_NYEAR.toString());
    }
    this.auto.AceptaTerminos = this.termsStorage?.AceptaTerminos;
    this.auto.AceptaPrivacidad = this.termsStorage?.AceptaPrivacidad;
    sessionStorage.setItem('auto', JSON.stringify(this.auto));
  }

  getClases() {
    const filter = new Modelo();
    if (this.auto.p_NVEHBRAND !== '') {
      filter.nvehbrand = this.auto.p_NVEHBRAND;
      filter.sdescript = this.auto.p_SNAME_VEHMODEL;
      filter.NCODCHANNEL = this.canal;
      const mclaseSession =
        this.auto.p_NIDCLASE === '' || isNullOrUndefined(this.auto.p_NIDCLASE)
          ? '0'
          : this.auto.p_NIDCLASE;
      this.vehiculoService.getClases(filter).subscribe(
        (res) => {
          this.clasesFull = this.clases = <ClaseModel[]>res;
          const unq = this.clasesFull[0];
          if (this.clasesFull.length === 1) {
            if (mclaseSession !== '' && Number(mclaseSession) !== 0) {
              this.setClase(Number(mclaseSession));
            } else {
              this.setClase(unq.nvehclass);
            }
          } else {
            this.vehiculoForm.controls.clasecodigo.setValue('0');
            if (mclaseSession !== '' && mclaseSession !== '0') {
              this.setClase(Number(mclaseSession));
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  getTiposUso(classe) {
    const clase = new Modelo();
    clase.NCODCHANNEL = this.canal;
    clase.nvehclass = classe;
    this.usos = [];
    this.usoService.getPostUsosbyClase(clase).subscribe(
      (res) => {
        this.usos = <Uso[]>res;
        this.setUso('');
        if (this.auto.p_NIDUSO) {
          this.setUso(this.auto.p_NIDUSO);
        } else {
          let idUso = null;
          if (this.usos.length === 1) {
            idUso = Number(this.usos[0].niduso);
          }
          this.setUso(idUso == null ? '' : idUso);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAsientos(clase) {
    this.vehiculoService.getAsientos(clase).subscribe(
      (res) => {
        if (res.success) {
          if (res.rangoInicio && res.rangoFin) {
            const inicio = +res.rangoInicio;
            const final = +res.rangoFin;
            let rangoAsientos = [];

            for (let i = inicio; i <= final; i++) {
              rangoAsientos.push(i);
            }
            this.listaAsientos = rangoAsientos;

            if (!this.listaAsientos.includes(+this.auto.p_SEATNUMBER)) {
              this.auto.p_SEATNUMBER = '';
            }
            return;
          }
          this.listaAsientos = [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setAsientos(id) {
    if (id?.length !== 0) {
      this.auto.p_SEATNUMBER = id;
      this.vehiculoForm.controls.asientos.setValue(id);
    }
    this.recalculateTarifa();
  }

  setClase(idClase) {
    this.isValidBrand = true;
    this.bValido = true;
    this.bValidado = true;
    this.mensaje = '';

    if (idClase !== '') {
      const vehicle = this.clases.find(
        (x) => Number(x.nvehclass) === Number(idClase)
      );
      if (vehicle !== undefined) {
        this.auto.p_NVEHBRAND = vehicle.nvehbrand;
        this.auto.p_NVEHMAINMODEL = vehicle.nmainvehmodel;
        this.auto.p_NVEHMODEL = vehicle.nvehmodel;
        this.auto.p_NIDCLASE = vehicle.nvehclass;
        this.auto.p_SNAMECLASE = vehicle.sdescript;
        this.vehiculoForm.controls.modeloId.setValue(vehicle.nvehmodel);
        this.vehiculoForm.controls.clasedescripcion.setValue(vehicle.sdescript);
        this.vehiculoForm.controls.modeloprincipal.setValue(
          vehicle.nmainvehmodel
        );
        this.vehiculoForm.controls.clasecodigo.setValue(vehicle.nvehclass);
        this.claseSeleccionada = true;
        this.auto.AceptaTerminos = this.termsStorage?.AceptaTerminos;
        this.auto.AceptaPrivacidad = this.termsStorage?.AceptaPrivacidad;
        sessionStorage.setItem('auto', JSON.stringify(this.auto));
        this.recalculateTarifa();
        this.getTiposUso(idClase);
        this.getAsientos(idClase);
        /* Validar Placa
         * 55 = MOTOTAXI
         * Validacion para cuando la clase no es mototaxi y la placa no pertenece a auto
         * Validacion para cuando la clase es mototaxi y la placa pertenece a auto
         */
        if (
          ((+idClase != 55 && !this.regexBrand.test(this.placa.toLowerCase())) ||
            (+idClase == 55 && this.regexBrand.test(this.placa.toLowerCase()))) &&
          !this.isOperationUser
        ) {
          this.bValido = false;
          this.isValidBrand = false;
          this.mensaje =
            'El formato de placa no es válido para la clase seleccionada';
        }
      }
    }
    this.recalculateTarifa();
  }

  getMarcas() {
    const filter = new Marca();
    // this.auto.p_NIDCLASE = '0';
    filter.NCODCHANNEL = this.canal;
    this.vehiculoForm.controls.clasecodigo.setValue('0');
    this.vehiculoService.getMarcas(filter).subscribe(
      (res) => {
        this.marcasFull = this.marcas = <Marca[]>res;
        if (this.auto.p_NVEHBRAND !== undefined) {
          const marcaAuto = this.marcas.filter(
            (c) => c.nvehbrand.toString() === this.auto.p_NVEHBRAND.toString()
          );
          if (marcaAuto.length > 0) {
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setMarca(id) {
    if (id !== '') {
      this.auto.p_NVEHBRAND = id;
      this.auto.p_NVEHMAINMODEL = '';
      this.auto.p_NVEHMODEL = '';
      this.auto.p_SNAME_VEHMODEL = '';
      this.auto.p_NIDUSO = '';
      this.auto.p_SEATNUMBER = '';
      this.modelos = [];
      this.clases = [];
      this.usos = [];
      this.listaAsientos = [];
      this.vehiculoForm.controls.marcacodigo.setValue(id);
      this.marcaDescrp = this.marcas.filter(
        (c) => c.nvehbrand.toString() === id.toString()
      );
      this.auto.p_SNAME_VEHBRAND = this.marcaDescrp[0].sdescript;
      this.marcaSeleccionada = true;
      this.getModelos(false);
    }
    this.recalculateTarifa();
  }

  getModelos(setclasectrl) {
    const filter = new Modelo();
    filter.nvehbrand = this.auto.p_NVEHBRAND;
    filter.NCODCHANNEL = this.canal;
    if (!setclasectrl) {
      this.auto.p_NIDCLASE = '0';
    }
    this.vehiculoService.getModelos(filter).subscribe(
      (res) => {
        this.modelos = sortArray(<Modelo[]>res, 'sdescript', 1).map((obj) => ({
            ...obj,
            sdescript: obj.sdescript.trim(),
          }));

        if (this.modelos.length === 1) {
          this.setModelo(this.modelos[0].sdescript);
        }
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setModelo(id) {
    if (id !== '') {
      // this.auto.p_NIDCLASE = '0';
      this.auto.p_SNAME_VEHMODEL = id;
      this.auto.p_SEATNUMBER = '';
      this.vehiculoForm.controls.modelo.setValue(id);
      this.clases = [];
      this.usos = [];
      this.listaAsientos = [];
      this.getClases();
    }
    this.recalculateTarifa();
  }

  onBlurAsiento() {
    this.auto.p_SEATNUMBER = this.vehiculoForm.get('asientos').value;
  }

  setUso(id) {
    if (id?.length !== 0) {
      this.auto.p_NIDUSO = id;
      this.vehiculoForm.controls.uso.setValue(id);
      if (this.auto.p_NIDUSO !== '') {
        const usoDescrp = this.usos.filter(
          (c) => c.niduso.toString() === id.toString()
        );
        this.auto.p_SNAME_USO = usoDescrp[0]?.sdescript ?? null;
        this.setUsoNumerador();
      }
      this.step05service.getDocumentsOfUsoAuto(id).subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.IS_FLUJO_USOS = true;
          } else {
            this.IS_FLUJO_USOS = false;
          }
          this.recalculateTarifa();
        },
        (err: any) => {
          console.log(err);
          this.IS_FLUJO_USOS = false;
        }
      );
    }
  }

  soloNumeros(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  assignAsegurado(event): void {
    this.Cliente = event.cliente;
    if (event.feeSearch) {
      this.recalculateTarifa();
    }
  }

  assignContratante(event): void {
    this.ClienteFact = event.cliente;
  }

  ValidateFormVehiculo() {
    this.vehiculoForm.get('clasecodigo').markAsTouched();
    this.vehiculoForm.get('uso').markAsTouched();
    this.vehiculoForm.get('marcacodigo').markAsTouched();
    this.vehiculoForm.get('modeloprincipal').markAsTouched();
    this.vehiculoForm.get('modelo').markAsTouched();
    this.vehiculoForm.get('serie').markAsTouched();
    this.vehiculoForm.get('asientos').markAsTouched();
    this.vehiculoForm.get('anho').markAsTouched();
    this.vehiculoForm.updateValueAndValidity();
  }

  get isTeleMarketing(): boolean {
    const channelUser: number = Number(
      JSON.parse(localStorage.getItem('currentUser')).canal || null
    );
    return channelUser === 2018000038;
  }

  bloquearCheckEnvioPromociones(e): void {
    if (this.isTeleMarketing) {
      if (e[0]?.p_SBAJAMAIL_IND?.toString() === '1') {
        this.ft['aceptPrivacy'].setValue(true);
        this.ft['aceptPrivacy'].disable();
      } else {
        this.ft['aceptPrivacy'].setValue(false);
        this.ft['aceptPrivacy'].enable();
      }
    }
  }

  grabarDatosVehiculo() {
    this.auto.p_NIDFLOW = '2';
    this.auto.p_NREMINDER = '0';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.auto.p_NUSERCODE = currentUser['id'];
    this.auto.ZONA_CIRCULACION = this.vehiculoForm.get('zonaCirculacion').value;
    this.auto.p_NAUTOZONE = this.Cliente.p_NPROVINCE.toString();
    this.auto.AceptaTerminos = true;

    if (this.IS_FLUJO_USOS === true) {
      this.auto.p_NAUTOZONE = this.vehiculoForm.get('zonaCirculacion').value;
    }
    if (!this.isTeleMarketing) {
      this.ft['aceptTerms'].setValue(true);
      this.saveTermsToStorage();
    }
    const req = {
      ...this.auto,
      ...this.termsStorage,
      p_NIDPROCESS: 0,
      V_NIDPROCESS: 0,
    };
    this.spinner.show();
    this.vehiculoService.registrar(req).subscribe(
      (res) => {
        this.spinner.hide();
        this.auto.V_NIDPROCESS = this.auto.p_NIDPROCESS = res.toString();
        if (this.auto.V_NIDPROCESS !== '0') {
          this.auto.AceptaTerminos = this.termsStorage?.AceptaTerminos;
          this.auto.AceptaPrivacidad = this.termsStorage?.AceptaPrivacidad;
          sessionStorage.setItem('auto', JSON.stringify(this.auto));
          if (!this.appasegurado.contratanteForm.valid) {
            return;
          } else {
            this.grabarDatosContratante();
          }
        } else {
          this.mensajeError =
            'Ocurrio un error al intentar registrar los datos del vehiculo. Por favor, vuelva a intentarlo.';
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide();
        this.mensajeError =
          'Ocurrio un error al intentar registrar los datos del vehiculo. Por favor, vuelva a intentarlo.';
      }
    );
  }

  listarDepartamentos() {
    const filter = new Province('0', '');
    this.ubigeoService.getPostProvince(filter).subscribe(
      (res) => {
        this.departamentos = <Province[]>res;
        this.cargarDatosContratante(this.departamentos);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  cargarDatosContratante(collDepartamentos) {
    const datosAsegurados = <Cliente>(
      JSON.parse(sessionStorage.getItem('contratante'))
    );
    this.appasegurado.loadSession(collDepartamentos, datosAsegurados);
    let datosContratante = null;

    this.facturarContratante = false;
    this.facturar = false;

    if (!isNullOrUndefined(datosAsegurados)) {
      if (datosAsegurados.p_NFACTURA === 1) {
        this.facturar = true;
        if (!isNullOrUndefined(datosAsegurados.v_CONTRATANTE)) {
          this.facturarContratante = true;
          this.showchkgenfacturacnt = true;
          datosContratante = datosAsegurados.v_CONTRATANTE;
        }
      }
    }
    this.appcontrantante.loadSession(this.departamentos, datosContratante);
  }

  listarProvinciasDelivery(idDepartamento, idprovincia, iddistrito) {
    this.datosEntregaForm.controls.provinciaentrega.setValue(undefined);
    this.datosEntregaForm.controls.distritoentrega.setValue(undefined);
    const filter = new District('0', idDepartamento, '');
    this.ubigeoService.getPostDistrict(filter).subscribe(
      (res) => {
        this.provinciasDelivery = <District[]>res;
        if (!isNullOrUndefined(idprovincia)) {
          this.datosEntregaForm.controls.provinciaentrega.setValue(idprovincia);
          this.listarDistritosDelivery(idprovincia, iddistrito);
        } else {
          this.datosEntregaForm.controls.provinciaentrega.setValue(undefined);
          this.datosEntregaForm.controls.distritoentrega.setValue(undefined);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  listarDistritosDelivery(idProvincia, idDistrito) {
    this.datosEntregaForm.controls.distritoentrega.setValue(undefined);
    const filter = new Municipality('0', idProvincia, '');
    this.ubigeoService.getPostMunicipality(filter).subscribe(
      (res) => {
        this.distritosDelivery = <Municipality[]>res;
        if (!isNullOrUndefined(idDistrito)) {
          this.datosEntregaForm.controls.distritoentrega.setValue(idDistrito);
        } else {
          this.datosEntregaForm.controls.distritoentrega.setValue(undefined);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  grabarDatosContratante() {
    this.Cliente.p_NIDPROCESS = this.auto.V_NIDPROCESS;
    this.Cliente.p_NFACTURA = this.facturar ? 1 : 0;
    this.Cliente.v_CONTRATANTE = null;
    // *FIXED: ENVIABA NULL EL CONTRATANTE
    if (this.facturarContratante) {
      this.Cliente.v_CONTRATANTE = this.ClienteFact;
    }
    this.spinner.show();
    this.step03service.saveCliente(this.Cliente).subscribe(
      (result) => {
        this.spinner.hide();
        this.Cliente.V_NIDPROCESS = result.toString();
        this.Cliente.p_NIDPROCESS = result.toString();
        sessionStorage.setItem('contratante', JSON.stringify(this.Cliente));
        if (!this.certificadoForm.valid) {
          return;
        } else {
          this.grabarDatosCertificado();
        }
      },
      (error) => {
        this.spinner.hide();
        console.log(<any>error);
      }
    );
  }

  crearFormularioCertificado() {
    this.certificadoForm = this.builder.group({
      fechavigencia: ['', [Validators.required, validateMinDate]],
      poliza: ['', Validators.required],
      plan: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      /* precioRegular: [''], */
    });
  }

  initFormularioPaso04() {
    if (this.Certificado.P_NIDPROCESS !== undefined) {
      this.certificadoForm.controls.fechavigencia.setValue(
        this.Certificado.P_DSTARTDATE
      );
      this.certificadoForm.controls.poliza.setValue(this.Certificado.P_NPOLICY);
      this.certificadoForm.controls.plan.setValue(this.Certificado.P_NPLAN);
    }
  }

  initFormularioPaso05() {
    if (this.showSeccionEntrega) {
      const certificadoSession =
        this.utilsService.decryptStorage('certificado');
      if (!isNullOrUndefined(certificadoSession)) {
        if (!isNullOrUndefined(certificadoSession.P_DFECHAENTREGADELIVERY)) {
          this.fecha_entrega = certificadoSession.P_DFECHAENTREGADELIVERY;
          this.datosEntregaForm.controls.fechaentrega.setValue(
            certificadoSession.P_DFECHAENTREGADELIVERY
          );
          this.datosEntregaForm.controls.turnoentrega.setValue(
            certificadoSession.P_STURNOENTREGADELIVERY
          );
          this.datosEntregaForm.controls.direccionentrega.setValue(
            certificadoSession.P_SDIRECCIONENTREGADELIVERY
          );
          this.datosEntregaForm.controls.comentario.setValue(
            certificadoSession.P_SCOMENTARIODELIVERY
          );
          this.datosEntregaForm.controls.formapago.setValue(
            certificadoSession.P_SFORMAPAGODELIVERY
          );
          if (certificadoSession.P_NPROVINCEDELIVERY !== undefined) {
            this.datosEntregaForm.controls.departamentoentrega.setValue(
              certificadoSession.P_NPROVINCEDELIVERY.toString()
            );
            this.listarProvinciasDelivery(
              certificadoSession.P_NPROVINCEDELIVERY,
              certificadoSession.P_NLOCATDELIVERY,
              certificadoSession.P_NMUNICIPALITYDELIVERY
            );
          }
        }
      }
    }
  }

  onFechaVigenciaChange(fecha: any) {
    if (fecha !== null || fecha !== undefined) {
      this.certificadoForm.controls.fechavigencia.setValue(fecha);
      this.Certificado.P_DSTARTDATE = fecha;
      this.ValidaFecha(fecha);
    }
    this.recalculateTarifa();
  }

  ValidaFecha(fec: Date) {
    if (isNullOrUndefined(fec)) {
      fec = new Date();
    }
    this.validarFechaVigencia(convertDateToStringOracle(fec));
  }

  validarFechaVigencia(fechaVigencia: string) {
    if (!isNullOrUndefined(this.auto.p_SREGIST) && this.auto.p_SREGIST !== '') {
      this.step04service.validarFechaVigencia(
        this.auto.p_SREGIST.trim().toUpperCase(),
        fechaVigencia
      ).subscribe(
        (res) => {
          this.mensajeVigencia = res['mensaje'];
          this.codigoVigencia = res['codigo'];
          if (this.codigoVigencia.trim() === '1') {
            this.truefalsePlan = false;
            this.mensajeVigencia = '';
          } else {
            this.truefalsePlan = true;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  asignarDatosCertificado() {
    this.Certificado.P_NIDPROCESS = this.auto.V_NIDPROCESS;
    this.Certificado.P_DSTARTDATE =
      this.certificadoForm.get('fechavigencia').value;
    this.Certificado.P_NPOLICY = this.certificadoForm.get('poliza').value;
    this.Certificado.P_NPLAN = '0';

    if (
      this.validaCampaign.validaPlacaCampaign === '1' &&
      this.validaCampaign.validaDocumentoCampaign === '1'
    ) {
      this.Certificado.P_NIDCAMPAIGN = this.validaCampaign.nidcampaign;
    } else {
      this.Certificado.P_NIDCAMPAIGN = 0;
    }
    this.getDataUserSession();
  }

  getPolizas(pv: string, canal: string, modalidad: string) {
    return this.step04service.getPolizas(pv, canal, modalidad).subscribe(
      (res) => {
        this.lstPolizasFull = res;
        if (this.lstPolizasFull.length > 0) {
          this.lstPolizasParticular = this.lstPolizasFull.filter(
            (x) => x.ntippoldes.toLocaleLowerCase().indexOf('particular') > -1
          );

          this.lstPolizasPublico = this.lstPolizasFull.filter(
            (x) => x.ntippoldes.toLocaleLowerCase().indexOf('publico') > -1
          );

          if (this.tCertificado === 3) {
            this.Certificado.P_NPOLICY = this.lstPolizasFull[0].npolesP_COMP;
          } else {
            this.setUsoNumerador();
          }
        }
      },
      (error) => {
        console.log(<any>error);
      }
    );
  }

  getDataUserSession() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.Certificado.P_NCODCHANNEL_BO = currentUser && currentUser.canal;
    this.Certificado.P_SDESCHANNEL_BO = currentUser && currentUser.desCanal;
    this.Certificado.P_NCODNUMPOINT_BO = currentUser && currentUser.puntoVenta;
    this.Certificado.P_SDESNUMPOINT_BO =
      currentUser && currentUser.desPuntoVenta;
    this.Certificado.P_NTYPECHANNEL_BO = currentUser && currentUser.tipoCanal;
    this.Certificado.P_NINTERMED_BROK = currentUser && currentUser.brokerId;
    this.Certificado.P_NINTERMED_INTERM =
      currentUser && currentUser.intermediaId;
    this.Certificado.P_NINTERMED_SPOINT = null;
  }

  setPoliza(clase: Poliza) {
    this.Certificado.P_NPOLICY = clase.npolesP_COMP;
  }

  setTarifario(idTarifario) {
    const actualtariff = this.lstTarifarios.find((x) => x.id === idTarifario);

    if (actualtariff !== undefined) {
      this.Certificado.P_IDTARIFARIO = idTarifario;
      this.Certificado.P_DESCRIPTARIFARIO = actualtariff.descripcion;
      this.Certificado.P_NCOMISSION_BROK = actualtariff.comisionBroker;
      this.Certificado.P_NCOMISSION_INTERM = actualtariff.comisionIntermediario;
      this.Certificado.P_NCOMISSION_SPOINT = actualtariff.comisionPuntoVenta;
      this.Certificado.P_NPREMIUM = actualtariff.precio;
      this.cf['precio'].setValue(this.Certificado.P_NPREMIUM);
      this.primaRegular = actualtariff.precioRegular;
    }
    this.utilsService.encryptStorage({
      name: 'certificado',
      data: this.Certificado,
    });
    this.cd.detectChanges();
  }

  recalculateTarifa() {
    this.Certificado.P_IDTARIFARIO = undefined;
    this.Certificado.P_DESCRIPTARIFARIO = undefined;
    this.Certificado.P_NCOMISSION_BROK = 0;
    this.Certificado.P_NCOMISSION_INTERM = 0;
    this.Certificado.P_NCOMISSION_SPOINT = 0;
    this.Certificado.P_NPREMIUM = 0;
    this.obtenerTarifa(null);
  }

  validateDataTarifa(data: PrimaFilter) {
    if (
      isNullOrUndefined(data.ClaseId) ||
      data.ClaseId === '' ||
      data.ClaseId === '0'
    ) {
      return false;
    }
    if (isNullOrUndefined(data.UsoId) || data.UsoId === '') {
      return false;
    }
    if (isNullOrUndefined(data.MarcaId) || data.MarcaId === '') {
      return false;
    }
    if (isNullOrUndefined(data.ModeloId) || data.ModeloId === '') {
      return false;
    }
    if (
      isNullOrUndefined(data.CantidadAsientos) ||
      data.CantidadAsientos === ''
    ) {
      return false;
    }
    // END
    if (
      isNullOrUndefined(data.Departamento) ||
      data.Departamento === '' ||
      data.Departamento === '0'
    ) {
      return false;
    }
    if (isNullOrUndefined(data.Fecha) || data.Fecha === '') {
      return false;
    }
    if (isNullOrUndefined(data.TipoPersona) || data.TipoPersona === '') {
      return false;
    }
    return true;
  }

  padLeft(text: string, padChar: string, size: number): string {
    return (String(padChar).repeat(size) + text).substr(size * -1, size);
  }

  obtenerTarifa(idTarifario) {
    const filter = new PrimaFilter();
    // tslint:disable-next-line:max-line-length
    if (
      this.IS_FLUJO_USOS === true &&
      (this.vehiculoForm.get('zonaCirculacion').value !== null ||
        Number(this.vehiculoForm.get('zonaCirculacion').value) !== 0)
    ) {
      filter.zonaCirculacion = this.vehiculoForm.get('zonaCirculacion').value;
    }
    let mTarifaId = null;
    let cliente = null;
    if (
      Number(this.validaCampaign.validaPlacaCampaign) === 1 &&
      Number(this.validaCampaign.validaDocumentoCampaign) === 1
    ) {
      mTarifaId = this.validaCampaign.planCampaign;
      cliente = this.validaCampaign.canalClient;
    } else {
      if (this.Cliente.p_NDOCUMENT_TYP && this.Cliente.p_SDOCUMENT) {
        cliente =
          this.padLeft(this.Cliente.p_NDOCUMENT_TYP.toString(), '0', 2) +
          this.padLeft(this.Cliente.p_SDOCUMENT, '0', 12);
      }
    }
    this.lstTarifarios = [];
    this.Certificado.P_IDTARIFARIO = undefined;

    filter.TarifaId = mTarifaId;
    filter.Canal = this.canal;
    filter.Placa = this.placa;
    if (!isNullOrUndefined(this.Certificado.P_DSTARTDATE)) {
      filter.Fecha = this.Certificado.P_DSTARTDATE.toString();
    }
    filter.BrokerId = this.brokerId;
    filter.IntermediaId = this.intermediaId;
    filter.SalesPointId = null;
    filter.PuntoVenta = this.puntoVenta;

    if (this.Cliente.p_NDOCUMENT_TYP) {
      filter.Cliente = cliente;
    }

    filter.Departamento = null;
    if (this.IS_FLUJO_USOS === true) {
      if (this.vehiculoForm.get('zonaCirculacion').value !== null) {
        filter.Departamento =
          this.vehiculoForm.get('zonaCirculacion').value + '0101';
      }
    } else {
      //ENVIO DE ZONA REGISTRAL SEGÚN REGLA DE NEGOCIO
      filter.Departamento = this.validateZonaRegistral();
      this.Cliente.p_NPROVINCE &&
      sessionStorage.setItem(
        'dep_global',
        this.Cliente.p_NPROVINCE.toString()
      );
    }

    // END
    filter.IdProcess = null;
    filter.Carroceria = '0';
    filter.ClaseId = this.auto.p_NIDCLASE;
    filter.UsoId = this.auto.p_NIDUSO;
    filter.MarcaId = this.auto.p_NVEHBRAND;
    filter.ModeloId = this.auto.p_NVEHMAINMODEL;
    filter.CantidadAsientos = this.auto.p_SEATNUMBER;
    filter.Moneda = 'PEN';
    filter.TipoPersona = this.Cliente.p_NPERSON_TYP;
    filter.CategoriaId = '1';
    filter.TipoPapel = this.tCertificado;
    filter.Plan = '0';
    filter.IsPd = true;

    if (this.validateDataTarifa(filter)) {
      if (idTarifario === null) {
        this.Certificado.P_IDTARIFARIO = '';
        this.Certificado.P_DESCRIPTARIFARIO = '';
        this.Certificado.P_NCOMISSION_BROK = 0;
        this.Certificado.P_NCOMISSION_INTERM = 0;
        this.Certificado.P_NCOMISSION_SPOINT = 0;
        this.Certificado.P_NPREMIUM = 0;
        /* this.Certificado.P_NPREMIUMR = 0; */
      }

      this.bSpinner = true;
      this.emisionService.obtenerTarifarios(filter).subscribe(
        (res) => {
          if (res !== null && res !== undefined) {
            this.lstTarifarios = res.filter((x) => x.id !== '');
            if (idTarifario !== null && this.lstTarifarios.length > 0) {
              this.setTarifario(idTarifario);
            } else if (this.lstTarifarios.length === 1) {
              this.setTarifario(this.lstTarifarios[0].id);
            }
          } else {
            this.lstTarifarios = [];
          }
          this.utilsService.encryptStorage({
            name: 'certificado',
            data: this.Certificado,
          });
          this.bSpinner = false;
          this.cd.detectChanges();
        },
        (err) => {
          this.lstTarifarios = [];
          this.bSpinner = false;
          this.cd.detectChanges();
          console.log(err);
        }
      );
    }
  }

  validateZonaRegistral() {
    if (this.listZonaRegistral.length == 0 && this.Cliente.p_NMUNICIPALITY) {
      return this.padLeft(this.Cliente.p_NMUNICIPALITY.toString(), '0', 6);
    }

    if (this.listZonaRegistral.length == 1 && this.Cliente.p_NMUNICIPALITY) {
      return this.listZonaRegistral[0].idZonaRegistral ==
      this.Cliente.p_NPROVINCE.toString()
        ? this.padLeft(this.Cliente.p_NMUNICIPALITY.toString(), '0', 6)
        : this.listZonaRegistral[0].ubigeoTarifario;
    }

    if (this.listZonaRegistral.length > 1 && this.Cliente.p_NMUNICIPALITY) {
      const existZona = this.listZonaRegistral?.some(
        (item: any) => item.idZonaRegistral == this.Cliente.p_NPROVINCE
      );

      const zonaPriority = this.listZonaRegistral?.find(
        (item: any) => item.prioridad == '1'
      );

      return existZona
        ? this.padLeft(this.Cliente.p_NMUNICIPALITY.toString(), '0', 6)
        : zonaPriority?.ubigeoTarifario;
    }
    return '0';
  }

  grabarDatosCertificado() {
    this.asignarDatosCertificado();
    this.Certificado.P_NIDPROCESS = this.auto.V_NIDPROCESS;
    this.Certificado.P_NTIPOPAPEL = this.tCertificado;
    this.Certificado.P_NHAVEDELIVERY = this.showSeccionEntrega ? 1 : 0;
    this.Certificado.IsPd = true;
    this.spinner.show();
    this.step04service.saveCertificatePD(this.Certificado).subscribe(
      (result: any) => {
        this.spinner.hide();
        this.almacenarNavegacion();
        this.bSpinner2 = false;
        sessionStorage.setItem(
          'soat-summary-navigate',
          new Date().getTime().toString()
        );
        let session = this.utilsService.decryptStorage('certificado');
        session = {
          ...session,
          P_NPREMIUM: +result.prima,
        };
        this.utilsService.encryptStorage({
          name: 'certificado',
          data: session,
        });
        this.router.navigate(['broker/step05']);
      },
      (error) => {
        this.spinner.hide();
        this.modalError.show();
        this.bSpinner2 = false;
        console.log(<any>error);
      }
    );
  }

  ValidateFormCertificado() {
    this.certificadoForm.get('fechavigencia').markAsTouched();
    this.certificadoForm.get('poliza').markAsTouched();
    this.certificadoForm.get('plan').markAsTouched();
    this.certificadoForm.get('precio').markAsTouched();
    /* this.certificadoForm.get('precioRegular').markAsTouched(); */
    this.certificadoForm.updateValueAndValidity();
  }

  setUsoNumerador() {
    if (this.tCertificado !== 3) {
      if (Number(this.auto.p_NIDUSO) === 1) {
        this.lstPolizasFilter = this.lstPolizasParticular;
        this.totalSoats = this.lstPolizasParticular.length;
        this.Certificado.P_NPOLICY =
          this.totalSoats > 0 ? this.lstPolizasParticular[0].npolesP_COMP : '0';
      } else {
        this.lstPolizasFilter = this.lstPolizasPublico;
        this.totalSoats = this.lstPolizasPublico.length;
        this.Certificado.P_NPOLICY =
          this.totalSoats > 0 ? this.lstPolizasPublico[0].npolesP_COMP : '0';
      }
    }
  }

  openNumerador() {
    if (this.auto.p_NIDUSO !== '') {
      this.setUsoNumerador();
      this.modalPolizas.show();
    }
  }

  searchCertificado(search: string) {
    if (search) {
      if (Number(this.auto.p_NIDUSO) === 1) {
        this.lstPolizasFilter = this.lstPolizasParticular.filter(
          (s) => s.npolesP_COMP.toString().indexOf(search.toLowerCase()) >= 0
        );
      } else {
        this.lstPolizasFilter = this.lstPolizasPublico.filter(
          (s) => s.npolesP_COMP.toString().indexOf(search.toLowerCase()) >= 0
        );
      }
    } else {
      if (Number(this.auto.p_NIDUSO) === 1) {
        this.lstPolizasFilter = this.lstPolizasParticular;
      } else {
        this.lstPolizasFilter = this.lstPolizasPublico;
      }
    }
  }

  hideModalErrorValidarPlaca(): void {
    this.modalErrorValidarPlaca.hide();
  }

  guardarIrResumen() {
    if (
      !this.deshabilitarNuevoSoat ||
      !this.ft['aceptTerms'].value ||
      this.clienteDeudaEstado ||
      !this.isValidBrand
    ) {
      return;
    }

    this.bSpinner2 = true;
    this.spinner.show();
    this.vehiculoService.validarPlacaAuto(this.placa).subscribe(
      (res: any) => {
        this.bSpinner2 = false;
        this.spinner.hide();
        if (!res.success) {
          this.MESSAGE_ERROR_VALIDAR_PLACA = res.mensaje;
          this.modalErrorValidarPlaca.show();
        } else {
          if (this.IS_FLUJO_USOS === false) {
            this.vehiculoForm.get('zonaCirculacion').setValue(0);
          }
          this.ValidateFormVehiculo();
          this.appasegurado.ValidateFormContratante();
          let isNotValid =
            !this.vehiculoForm.valid ||
            !this.appasegurado.contratanteForm.valid ||
            !this.certificadoForm.valid ||
            !this.datosEntregaForm.valid ||
            this.mensajeVigencia !== '';
          if (this.facturarContratante) {
            this.appcontrantante.ValidateFormContratante();
            isNotValid =
              isNotValid || !this.appcontrantante.contratanteForm.valid;
          }

          this.ValidateFormCertificado();
          this.ValidateFormDelivery();

          if (isNotValid) {
            return;
          } else {
            this.bSpinner2 = true;
            this.cd.detectChanges();
            this.grabarDatosVehiculo();
          }

          this.emisionService.registrarEvento('', EventStrings.SOAT_EMISION_IRRESUMEN).subscribe();
        }
      },
      (err: any) => {
        this.bSpinner2 = false;
        this.spinner.hide();
        console.error(err);
      }
    );
  }

  almacenarNavegacion() {
    if (this.paginaActual > this.ultimaPaginaNavegada) {
      sessionStorage.setItem('pagina', this.paginaActual.toString());
    }
  }

  nuevoSOAT() {
    this.placa = '';
    this.bLock01 = false;
    this.bLock02 = true;
    this.bLock03 = true;
    this.bLock04 = true;
    this.deshabilitarNuevoSoat = false;
    this.bValidar = false;
    this.mensajeVigencia = '';
    this.bValido = false;
    this.bValidado = false;

    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
    sessionStorage.setItem('processResult', '0');
    this.Certificado = new Certificado();
    this.auto = new Auto();
    this.Cliente = new Cliente();

    this.limpiarSeccionVehiculo();
    this.appasegurado.limpiarSeccionContratante();
    this.appcontrantante.limpiarSeccionContratante();
    this.limpiarSeccionCertificado();

    this.limpiarSeccionEntrega();
    this.onFechaEntregaChange(this.fecha_entrega);
    this.asignarSeccionCertificadoEntrega();
    this.getDataUserSession();
    this.recalculateTarifa();
  }

  limpiarSeccionVehiculo() {
    this.vehiculoForm.reset();
    this.vehiculoForm.controls.clasecodigo.setValue('0');
    this.vehiculoForm.controls.uso.setValue('');
    this.vehiculoForm.controls.marcacodigo.setValue('');
    this.vehiculoForm.controls.modelo.setValue('');
    this.vehiculoForm.controls.modeloprincipal.setValue('');
    this.vehiculoForm.controls.serie.setValue('');
    this.vehiculoForm.controls.asientos.setValue('');
    this.vehiculoForm.controls.anho.setValue('');
  }

  limpiarSeccionCertificado() {
    this.certificadoForm.reset();
    this.certificadoForm.controls.fechavigencia.setValue(undefined);
    this.certificadoForm.controls.plan.setValue(undefined);
    this.certificadoForm.controls.precio.setValue(undefined);
    /* this.certificadoForm.controls.precioRegular.setValue(undefined); */
    this.Certificado.P_DSTARTDATE = undefined;
    this.fecha_vigencia = new Date();
  }

  limpiarSeccionEntrega() {
    this.datosEntregaForm.reset();
    this.datosEntregaForm.controls.fechaentrega.setValue(undefined);
    this.datosEntregaForm.controls.turnoentrega.setValue(undefined);
    this.datosEntregaForm.controls.direccionentrega.setValue(undefined);
    this.datosEntregaForm.controls.comentario.setValue(undefined);
    this.datosEntregaForm.controls.formapago.setValue(undefined);
    this.datosEntregaForm.controls.departamentoentrega.setValue(undefined);
    this.datosEntregaForm.controls.provinciaentrega.setValue(undefined);
    this.datosEntregaForm.controls.distritoentrega.setValue(undefined);
    this.Certificado.P_DFECHAENTREGADELIVERY = undefined;
    this.fecha_entrega = new Date();
  }

  crearFormularioDatosEntrega() {
    this.datosEntregaForm = this.builder.group({
      fechaentrega: [''],
      turnoentrega: [''],
      direccionentrega: [''],
      comentario: [''],
      formapago: [''],
      departamentoentrega: [''],
      provinciaentrega: [''],
      distritoentrega: [''],
    });

    this.step05service.getCanalTipoPago(this.canal, AppConfig.SETTINGS_SALE).subscribe(
      (res) => {
        this.showSeccionEntrega = false;
        this.showchkFacturar = false;
        if (res !== null) {
          this.showSeccionEntrega = res.bdelivery === 1 ? true : false;
          this.showchkFacturar = res.bfactura === 1 ? true : false;
        }
        if (this.showSeccionEntrega) {
          this.datosEntregaForm = this.builder.group({
            fechaentrega: ['', [Validators.required, validateMinDate]],
            turnoentrega: ['', Validators.required],
            direccionentrega: ['', Validators.required],
            comentario: [''],
            formapago: ['', Validators.required],
            departamentoentrega: ['', Validators.required],
            provinciaentrega: ['', Validators.required],
            distritoentrega: ['', Validators.required],
          });
          if (this.Certificado.P_NPROVINCEDELIVERY !== undefined) {
            this.datosEntregaForm.controls.departamentoentrega.setValue(
              this.Certificado.P_NPROVINCEDELIVERY.toString()
            );
            this.listarProvinciasDelivery(
              this.Certificado.P_NPROVINCEDELIVERY,
              this.Certificado.P_NLOCATDELIVERY,
              this.Certificado.P_NMUNICIPALITYDELIVERY
            );
          }
        }
        this.deliveryService.getDatosDelivery('1').subscribe(
          (fp) => {
            if (fp !== null) {
              const formasDePago = <FormaDePago[]>fp;
              this.formasDePago = formasDePago.filter((x) => x.tipo === '1');
              const turnos = <Turno[]>fp;
              this.turnos = turnos.filter((x) => x.tipo === '2');
              this.initFormularioPaso05();
            }
          },
          (err) => {
            console.log(err);
          }
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ValidateFormDelivery() {
    if (this.showSeccionEntrega) {
      this.datosEntregaForm.get('fechaentrega').markAsTouched();
      this.datosEntregaForm.get('turnoentrega').markAsTouched();
      this.datosEntregaForm.get('direccionentrega').markAsTouched();
      this.datosEntregaForm.get('comentario').markAsTouched();
      this.datosEntregaForm.get('formapago').markAsTouched();
      this.datosEntregaForm.get('departamentoentrega').markAsTouched();
      this.datosEntregaForm.get('provinciaentrega').markAsTouched();
      this.datosEntregaForm.get('distritoentrega').markAsTouched();
      this.datosEntregaForm.updateValueAndValidity();

      if (this.Certificado.P_NMUNICIPALITYDELIVERY) {
        this.Certificado.P_SMUNICIPALITYDESCRIPTDELIVERY =
          this.distritosDelivery.find(
            (x) =>
              Number(x.nmunicipality) ===
              Number(this.Certificado.P_NMUNICIPALITYDELIVERY)
          ).sdescript;
        this.Certificado.P_NLOCATDELIVERYDESCRIPTDELIVERY =
          this.provinciasDelivery.find(
            (x) =>
              Number(x.nlocal) === Number(this.Certificado.P_NLOCATDELIVERY)
          ).sdescript;
        this.Certificado.P_NPROVINCEDESCRIPTDELIVERY = this.departamentos.find(
          (x) =>
            Number(x.nprovince) === Number(this.Certificado.P_NPROVINCEDELIVERY)
        ).sdescript;
      }

      this.Certificado.P_SFORMAPAGODESCRIPTDELIVERY = this.formasDePago.find(
        (x) => Number(x.id) === Number(this.Certificado.P_SFORMAPAGODELIVERY)
      ).description;
      this.Certificado.P_STURNOENTREGADESCRIPTDELIVERY = this.turnos.find(
        (x) => Number(x.id) === Number(this.Certificado.P_STURNOENTREGADELIVERY)
      ).description;
    }
    this.utilsService.encryptStorage({
      name: 'certificado',
      data: this.Certificado,
    });
  }

  onFechaEntregaChange(fecha: any) {
    if (fecha !== null || fecha !== undefined) {
      this.Certificado.P_DFECHAENTREGADELIVERY = fecha;
      this.datosEntregaForm.controls.fechaentrega.setValue(fecha);
    }
  }

  setTurnoEntrega(turno) {
    this.Certificado.P_STURNOENTREGADELIVERY = turno;
  }

  setFormaPago(formapgo) {
    this.Certificado.P_SFORMAPAGODELIVERY = formapgo;
  }

  generarFactura(event) {
    event.preventDefault();
    this.facturarContratante = false;
    this.facturar = !this.facturar;
  }

  generarFacturaContratante(event) {
    event.preventDefault();
    this.facturarContratante = event.target.checked;
  }

  showModalTerms(): void {
    this._vc.createEmbeddedView(this.modalTerms);
  }

  showModalDeudaEstado(): void {
    this._vc.createEmbeddedView(this._modalDeudaEstado);
  }

  hideModals(): void {
    this._vc.clear();
  }

  setClienteEstado(val): void {
    this.clienteDeudaEstado = val;
    if (this.clienteDeudaEstado) {
      this.showModalDeudaEstado();
    }
  }

  showModalUpdateBrandAuto(): void {
    this.spinner.show();

    this.bandejaSolicitudesService.getParameters().subscribe({
      next: (response: Response<Parameters>): void => {
        console.log(response);

        if (!response.success) {
          return;
        }

        this.formAutoDocumentList.clear();
        this.attachedFiles = [];
        this.formUpdateInfoAuto.patchValue({
          brand: '',
          model: '',
          version: '',
          class: '',
          comment: '',
          documents: [],
        });

        this.formUpdateInfoAuto.markAsUntouched();

        response.data.listDocumentsAttach.forEach(
          (item: AttachDocument): void => {
            const form: FormGroup = this.builder.group({
              documentTypeLabel: [item.documentType, Validators.required],
              documentTypeId: [item.id, Validators.required],
              required: [item.required, Validators.required],
              file: [null],
              fileName: [null, item.required ? Validators.required : null],
            });
            this.formAutoDocumentList.push(form);
          }
        );

        this._vc.createEmbeddedView(this.modalUpdateBrandAuto);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide(),
    });
  }

  attachedFile(e, index): void {
    if (!e) {
      return;
    }

    this.attachedFiles.splice(index, 0, e.target.files[0]);
    this.formAutoDocumentList.at(index).get('fileName').setValue(e.target.files[0].name);
  }

  removeUploadedFile(form: FormGroup, index): void {
    form.get('file').reset();
    form.get('fileName').reset();
    this.attachedFiles.splice(index, 1);
  }

  closeModalBrandAuto(): void {
    this.formAutoDocumentList.clear();
    this.attachedFiles = [];
    this.formUpdateInfoAuto.patchValue({
      brand: '',
      model: '',
      version: '',
      comment: '',
      documents: [],
    });
    this._vc.clear();
  }

  showModalConfirmUpdateAuto(): void {
    if (this.isInvalidFormUpdateAuto) {
      return;
    }

    this._vc.clear();
    this._vc.createEmbeddedView(this.modalCornfirmUpdateAuto);
  }

  private isEqualValue(text: string, compare: string): boolean {
    if (!compare) {
      return true;
    }

    return (
      (text || '').toLowerCase().trim() == (compare || '').toLowerCase().trim()
    );
  }

  get isInvalidFormUpdateAuto(): boolean {
    const hasChanged = (): boolean => {
      const hasBrandChanged: boolean = !this.isEqualValue(
        this.auto.p_SNAME_VEHBRAND,
        this.formUpdateInfoAutoControl['brand'].value
      );
      const hasModelChanged: boolean = !this.isEqualValue(
        this.auto.p_SNAME_VEHMODEL,
        this.formUpdateInfoAutoControl['model'].value
      );
      const hasVersionChanged: boolean = !this.isEqualValue(
        this.auto.versionName,
        this.formUpdateInfoAutoControl['version'].value
      );
      const hasClassChanged: boolean = !this.isEqualValue(
        this.auto.p_SNAMECLASE,
        this.formUpdateInfoAutoControl['class'].value
      );
      return (
        hasBrandChanged ||
        hasModelChanged ||
        hasVersionChanged ||
        hasClassChanged
      );
    };

    return this.formUpdateInfoAuto.invalid || !hasChanged();
  }

  acceptUpdateBrandAuto(): void {
    this.spinner.show();
    const autoClass =
      this.clases?.find(
        (x) => x.nvehclass == this.vehiculoForm.get('clasecodigo').value
      )?.sdescript ?? null;
    const autoUse =
      this.usos?.find((x) => x.niduso == this.vehiculoForm.get('uso').value)?.sdescript ?? null;
    const serialNumber = this.vehiculoForm.get('serie').value;
    const sitings = this.vehiculoForm.get('asientos').value || null;
    const autoYear = this.vehiculoForm.get('anho').value || null;

    const formValue = this.formUpdateInfoAuto.getRawValue();
    const payload: Request = {
      branchId: 66,
      productId: 1,
      userId: +this.currentUser['id'],
      channelCode: +this.currentUser['canal'],
      stateId: 1,
      plate: this.placa?.toUpperCase(),
      requestDetail: [
        {
          field: 'Placa',
          current: this.placa?.toUpperCase(),
          required: null,
        },
        {
          field: 'Marca',
          current: this.auto.p_SNAME_VEHBRAND?.toUpperCase(),
          required: formValue.brand?.toUpperCase() || null,
        },
        {
          field: 'Modelo',
          current: this.auto.p_SNAME_VEHMODEL?.toUpperCase(),
          required: formValue.model?.toUpperCase() || null,
        },
        {
          field: 'Version',
          current: this.auto.versionName?.toUpperCase(),
          required: formValue.version?.toUpperCase() || null,
        },
        {
          field: 'Clase',
          current: this.auto.p_SNAMECLASE?.toUpperCase(),
          required: formValue.class?.toUpperCase() || null,
        },
        {
          field: 'Comentarios',
          current: null,
          required: formValue.comment || null,
        },
        {
          field: 'Uso',
          current: autoUse?.toUpperCase() || null,
          required: null,
        },
        {
          field: 'Serie',
          current: serialNumber?.toUpperCase() || null,
          required: null,
        },
        {
          field: 'Asientos',
          current: sitings,
          required: null,
        },
        {
          field: 'Anio',
          current: autoYear,
          required: null,
        },
      ],
      file: this.attachedFiles[0],
      attachments: {
        documentType: +formValue.documents[0].documentTypeId,
      },
    };

    this.emisionService.saveRequest(payload).subscribe({
      next: (response) => {
        this.spinner.hide();

        if (!response.success) {
          this.closeModalBrandAuto();
          this._vc.createEmbeddedView(this.modalErrorUpdateAuto);
          return;
        }

        this.requestIdResponse = response.idSolicitud;
        this.closeModalBrandAuto();
        this._vc.createEmbeddedView(this.modalSuccessRequestUpdateAuto);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  cancelUpdateAuto(): void {
    this._vc.clear();
    this.formAutoDocumentList.controls.forEach((form: FormGroup) => {
      form.get('file').reset();
    });
    this._vc.createEmbeddedView(this.modalUpdateBrandAuto);
  }

  successRequestUpdateAuto(): void {
    sessionStorage.removeItem('acept-terms-stepall');
    sessionStorage.removeItem('auto');
    this.router.navigate(['/extranet/bandeja-solicitudes']);
  }
}
