import { MainService } from '../../../../vidaindividual-latest/services/main/main.service';
import { ApiService } from './../../../../../shared/services/api.service';
import { SumaAseguradaDto } from './../../../../vidaindividual-latest/models/sumaAsegurada.model';
import { NotificationRequest } from '../../../../vidaindividual-latest/models/notification.model';
import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import 'rxjs/add/operator/filter';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { AppConfig } from '@root/app.config';
import { UtilsService } from '@shared/services/utils/utils.service';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import { ParametersResponse } from '@shared/models/ubigeo/parameters.model';
import { RegularExpressions } from '@shared/regexp/regexp';
import { ITarifarioResponse } from '../../../interfaces/vida-devolucion/tarifario.interface';
import { NewClientService } from '../../../services/vida-devolucion/new-client/new-client.service';
import { IFinalQuotation } from '../../../interfaces/vida-devolucion/final-quotation.interface';
import { SummaryService } from '../../../services/vida-devolucion/summary/summary.service';
import { QuotationService } from '../../../services/vida-devolucion/quotation/quotation.service';
import { Step2Service } from '../../../../../layout/vidaindividual-latest/services/step2/step2.service';
import {
  DocumentInfoResponseModel,
  DocumentInformationModel,
} from '../../../../../shared/models/document-information/document-information.model';

// ANIMATIONS
import { fadeAnimation } from '@shared/animations/animations';
import { v4 as uuid } from 'uuid';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
  IDocumentInfoRequest,
  IDocumentInformationRequest,
} from '../../../../../shared/interfaces/document-information.interface';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-view-quotation',
  templateUrl: './view-quotation.component.html',
  styleUrls: [
    './view-quotation.component.scss',
    '../shared/styles/_style.sass',
  ],
  animations: [fadeAnimation],
})
export class ViewQuotationComponent implements OnInit {
  formContratante: FormGroup;
  formAsegurado: FormGroup;
  bsValueFin: Date = new Date();

  /* servicios */
  parameters$: ParametersResponse;
  departments$: Array<any> = [];
  departmentscontratante$: Array<any> = [];
  provinces$: Array<any> = [];
  provincescontratante$: Array<any> = [];
  districts$: Array<any> = [];
  districtscontratante$: Array<any> = [];
  validacionExperian = false;
  isValidFechaNacimiento: boolean;
  clientId: string;
  bsConfig: Partial<BsDatepickerConfig>;

  listadoCotizacionesVigentes: Array<any> = [];
  listadoPolizas: Array<any> = [];
  listadoCotizacionesNoVigentes: Array<any> = [];
  listBeneficiaries: Array<any> = [];
  validardps: any;
  totalsumapolizas: any;
  numpolizascontratadas: any;
  show: string;
  idProcesoCotizacion: number = null;
  validarspan: any = false;
  /* DECLARACIÓN */
  cantidadHostpitalizacionCovid: Array<number> = [];
  cantidadConsumoCigarrillos: Array<number> = [];
  form: FormGroup;
  bsConfigBirthdate: Partial<BsDatepickerConfig>;
  /* ASESOR */
  formAsignar: FormGroup;

  message: string;
  responseSumaSuperada: any;
  cotizacionSeleccionada: any = null;
  beneficiariesSelectedQuotation$: Array<any> = [];
  showbeneficiariesSelectedQuotation$: Array<any> = [];
  finprimernombre = 4;
  sumasuperada2: any;
  summary$: any = {};
  summaryQuotation: any = {};
  indicator$: any = {}; // IDECON
  indicatorcontratante$: any = {};
  scoring$: any = {};
  montoCambio$ = 0;
  contractor$: any = {};
  contractorContratante$: any = {};
  asesores: any = {};
  // usuarioJefe-Supervisor
  userJefe: boolean;
  userSupervisor: boolean;

  isTariffLoaded = false;
  finalQuotationSuccess = false;

  currentPageCotizacionesVigentes = 0;
  currentPageCotizacionesNoVigentes = 0;
  currentPagePolizas = 0;

  listQuotationsSelected: Array<any> = [];

  dpsSummary: any = {};
  codAsesor: number;
  validarspanhover: any = false;
  formComment = this.builder.group({
    comment: [null, Validators.required],
  });

  listComments: [] = [];
  listAssesors: Array<any> = [];

  assesorSelected: any;
  asesor: any;

  activeonchengenDoc: any = false;
  isObserver = false;
  isSupport: boolean;
  quoteParams: number;
  stateType: {
    id: number;
    description: string;
  };

  dpsValidations: any;

  backToPage = false;
  quotationValidations: any;
  validarindicadores: any;

  /* modal */
  @ViewChild('modalCondition', { static: true, read: TemplateRef })
  _modalCondition: TemplateRef<any>;
  @ViewChild('modalObligaciones', { static: true, read: TemplateRef })
  _modalObligaciones: TemplateRef<any>;
  @ViewChild('modalDJ', { static: true, read: TemplateRef })
  _modalDJ: TemplateRef<any>;
  @ViewChild('modalResumen', { static: true, read: TemplateRef })
  _modalResumen: TemplateRef<any>;
  @ViewChild('modalSumaMaxima', { static: true, read: TemplateRef })
  _modalSumaMaxima: TemplateRef<any>;
  @ViewChild('modalAsignar', { static: false, read: TemplateRef })
  _modalAsignar: TemplateRef<any>;
  @ViewChild('formDps', { static: true, read: ElementRef }) _form: ElementRef;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  @ViewChild('modalMessageExperian', { static: true, read: TemplateRef })
  _modalMessageExperian: TemplateRef<any>;
  @ViewChild('modalMessageBen', { static: true, read: TemplateRef })
  _modalMessageBen: TemplateRef<any>;
  @ViewChild('modalDpsRisk', { static: true, read: TemplateRef })
  modalDpsRisk: TemplateRef<any>;
  @ViewChild('modalCancelProspect', { static: true, read: TemplateRef })
  modalCancelProspect: TemplateRef<any>;
  @ViewChild('modalReasign', { static: true, read: TemplateRef })
  _modalReasign: TemplateRef<any>;
  @ViewChild('modalBeneficiary', { static: true, read: TemplateRef })
  _modalBeneficiary: TemplateRef<any>;

  nextstep: boolean; // dara paso a abrir el modalReasign
  originventas: any; // de donde inicia la operación
  clientPolicy: any;
  idValidate: any;
  asesorasignado: any;
  sumasuperada: any;
  chekedsumamaxima: boolean;
  nTc: any;
  editMode: boolean;
  formClient: FormGroup;
  parentesco: Array<any> = [];
  parentescocontratante: Array<any> = [];
  numberDocumentLimit: { min: number; max: number };
  limitDate: Date;

  subcriptor: any;
  formBen: FormGroup;
  formBeneficiary: FormGroup;
  documentNumberCharacterLimit: {
    min: number;
    max: number;
  };
  percents: Array<number> = [];
  editBeneficiary$: Array<any> = [];
  clientAseguradoBol: any = false;
  siteKey = AppConfig.CAPTCHA_KEY;
  isBeneficiary: boolean = false;
  subcribeContractor: Subscription;

  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly utilsService: UtilsService,
    private readonly spinner: NgxSpinnerService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly newClientService: NewClientService,
    private readonly summaryService: SummaryService,
    private readonly quotationService: QuotationService,
    private readonly api: ApiService,
    private readonly _mainService: MainService
  ) {
    this.isValidFechaNacimiento = true;
    this.limitDate = new Date(
      new Date().setFullYear(Number(new Date().getFullYear()) - 18)
    );
    this.bsConfigBirthdate = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        maxDate: new Date(),
        // maxDate: this.limitDate
      }
    );
    this.numberDocumentLimit = { min: 8, max: 8 };
    this.editMode = false;
    this.formBen = this.builder.group({
      id: [null],
      clientName: [null],
      typeBeneficiaries: [null, Validators.required],
      beneficiaries: this.builder.array([]),
    });
    this.documentNumberCharacterLimit = {
      min: 8,
      max: 8,
    };
    this.formBeneficiary = this.builder.group({
      id: [null],
      codigoCliente: [null],
      idTipoPersona: [null],
      idTipoDocumento: [null, Validators.required],
      numeroDocumento: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(this.documentNumberCharacterLimit.min),
          Validators.maxLength(this.documentNumberCharacterLimit.max),
        ]),
      ],
      nombres: [null, Validators.required],
      apellidoPaterno: [null, Validators.required],
      apellidoMaterno: [null, Validators.required],
      idDepartamento: [null],
      departamento: [null],
      idProvincia: [null],
      provincia: [null],
      idDistrito: [null],
      distrito: [null],
      direccion: [null],
      correo: [null],
      telefono: [null],
      idParentesco: [null],
      parentesco: [null, Validators.required],
      porcentajeParticipacion: [null, Validators.required],
      idNacionalidad: [null],
      nacionalidad: [null, Validators.required],
      idSexo: [null, Validators.required],
      sexo: [null],
      fechaNacimiento: [null, Validators.required],
      estado: [null],
    });
    this.userJefe = false;
    this.userSupervisor = false;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );

    this.formContratante = this.builder.group({
      phoneNumber: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      email: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.email),
          Validators.required,
        ]),
      ],
      estadoCivil: [null, Validators.required],
      actividad: [null],
      ingresos: [null],
      nacionalidad: [null, Validators.required],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      ocupacion: [null, Validators.required],
      direccion: [null, Validators.required],
      condicion: [null],
      // obligacionFiscal: [0, Validators.required],
      obligacionFiscalcontratante: [0, Validators.required],
      // namesake: [false, Validators.required],
    });
    this.formAsegurado = this.builder.group({
      phoneNumber: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      email: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.email),
          Validators.required,
        ]),
      ],
      estadoCivil: [null, Validators.required],
      actividad: [null],
      ingresos: [null],
      nacionalidad: [null, Validators.required],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      ocupacion: [null, Validators.required],
      direccion: [null, Validators.required],
      condicion: [null],
      obligacionFiscal: [0, Validators.required],
      namesake: [false, Validators.required],
    });
    this.formAsignar = builder.group({
      asignar_asesor: [null, Validators.required],
    });
    /* DECLARACIÓN */
    this.cantidadHostpitalizacionCovid = new Array();
    for (let i = 1; i <= 365; i++) {
      this.cantidadHostpitalizacionCovid.push(i);
    }

    this.cantidadConsumoCigarrillos = new Array();
    for (let i = 1; i <= 25; i++) {
      this.cantidadConsumoCigarrillos.push(i);
    }
    this.formClient = builder.group({
      typeClients: [0, Validators.required],
      parentescocontratante: [null, Validators.required],
      typeDoc: [2, Validators.compose([Validators.required])],
      nDoc: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]),
      ],
    });
    this.form = builder.group({
      talla: [null],
      peso: [null],
      fuma: [null],
      cantidadCigarros: [null],
      presionArterial: [null],
      presionArterialResult: [null],
      cancer: [null],
      infarto: [null],
      gastro: [null],
      viaja: [null],
      deporte: [null],
      contactoCovid: [null],
      diagnosticoCovid: [null],
      hospitalizacionCovid: [null],
      diasHospitalizacionCovid: [null],
    });
    if (!this.vidaDevolucionService.storage?.sessionId) {
      this.vidaDevolucionService.storage = {
        sessionId: uuid(),
      };
    }
    for (let i = 10; i <= 100; i += 10) {
      this.percents.push(i);
    }
    this.percents.push(25);
    this.percents.push(35);
    this.percents = this.percents.sort((x, y) => x - y);

    this.fbe['idTipoDocumento'].valueChanges.subscribe((val) => {
      switch (Number(val)) {
        case 2: {
          this.fbe['apellidoPaterno'].clearValidators();
          this.fbe['apellidoMaterno'].setValidators([Validators.required]);
          this.documentNumberCharacterLimit = { min: 8, max: 8 };
          this.fbe['nacionalidad'].disable();
          break;
        }
        case 4: {
          this.documentNumberCharacterLimit = { min: 9, max: 12 };
          this.fbe['apellidoPaterno'].clearValidators();
          this.fbe['apellidoMaterno'].setValidators([Validators.required]);
          this.fbe['nacionalidad'].enable();
          break;
        }
      }

      this.fbe['numeroDocumento'].setValidators([
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(this.documentNumberCharacterLimit.min),
          Validators.maxLength(this.documentNumberCharacterLimit.max),
        ]),
      ]);
      this.setIdBeneficiary();
    });
    this.subcribeContractor = this.subcribeContracto();
    this.fbe['numeroDocumento'].valueChanges.subscribe((_: string) => {
      this.setIdBeneficiary();
      if (_ && !RegularExpressions.numbers.test(_)) {
        this.fbe['numeroDocumento'].setValue(_.slice(0, _.length - 1));
      }
    });
  }

  subcribeContracto() {
    return this.fbes['nDoc'].valueChanges.subscribe((val) => {
      this.isBeneficiary = false;
      if (this.fbes['nDoc'].valid) {
        this.requestClientInfo();
      }
      //this.getDataOfDocument();
    });
  }

  get fbe(): { [key: string]: AbstractControl } {
    return this.formBeneficiary.controls;
  }

  get fbes(): { [key: string]: AbstractControl } {
    return this.formClient.controls;
  }

  get fbcies(): { [key: string]: AbstractControl } {
    return this.formBen.controls;
  }

  get fben(): FormArray {
    return this.fbcies['beneficiaries'] as FormArray;
  }

  getDataOfDocument(token) {
    if (this.fbes['nDoc'].valid) {
      if (this.fbes['nDoc'].value == this.contractor$.numeroDocumento) {
        this.message =
          'Por favor ingrese un número de documento distinto del asegurado';
        this.vc.createEmbeddedView(this._modalMessageExperian);
        this.fbes['nDoc'].setValue('');
        this.contractorContratante$ = {};
        this.indicatorcontratante$ = {};
        return;
      }
      this.spinner.show();
      const payload: IDocumentInfoRequest = {
        idRamo: 71,
        idTipoDocumento: this.fbes['typeDoc'].value,
        numeroDocumento: this.fbes['nDoc'].value,
        idUser: this.currentUser.id,
        token: token,
      };
      if (this.finalQuotationSuccess) {
        this.contractorContratante$ =
          this.vidaDevolucionService.storage.contractorServiceContratante;

        this.fbes['nDoc'].disable();
        this.fbes['parentescocontratante'].disable();
        this.fbes['typeClients'].disable();
        this.spinner.hide();
      } else {
        this.utilsService.documentInfoResponse(payload).subscribe({
          next: (response: any) => {
            if (response.birthdate == null) {
              this.contractorContratante$ = {};
              this.message = 'El Contratante Debe ser mayor de 18 años';
              this.vc.createEmbeddedView(this._modalMessageExperian);
              this.spinner.hide();
              return;
            }
            this.contractorContratante$ = response;
            if (this.activeonchengenDoc == true) {
              this.formContratante.reset();
              this.contractorContratante$ = response;
              this.formContratante.patchValue(
                {
                  nacionalidad:
                    this.contractorContratante$?.nationality || null,
                  ocupacion: this.contractorContratante$?.idOcupacion || null,
                  estadoCivil: this.contractorContratante$?.civilStatus || null,
                  phoneNumber: this.contractorContratante$?.phoneNumber || null,
                  email: this.contractorContratante$?.email || null,
                  direccion: this.contractorContratante$?.address || null,
                  departamento: this.contractorContratante$?.department || null,
                  provincia: this.contractorContratante$?.province || null,
                  distrito: this.contractorContratante$?.district || null,
                  obligacionFiscalcontratante: 0,
                },
                {
                  emitEvent: true,
                }
              );
              this.formContratante.markAsUntouched();
              this.setListUbigeosContratante();
              this.formContratante.valueChanges.subscribe((values: any) => {
                this.vidaDevolucionService.storage = {
                  formContractorContratante: {
                    ...values,
                    isValidForm: this.formContratante.valid,
                  },
                  numeroDocumentoContratante:
                  this.contractorContratante$.numeroDocumento,
                };
              });
            } else {
              this.activeonchengenDoc = true;
            }
            this.formContratante.markAsUntouched();
            this.setListUbigeosContratante();
            /*setTimeout(() => {
              this.spinner.hide();
            }, 5000);*/
            this.vidaDevolucionService.storage = {
              contractorServiceContratante: this.contractorContratante$,
              numeroDocumentoContratante: +this.fbes['nDoc'].value,
              parentescocontratante: +this.fbes['parentescocontratante'].value,
            };
            const payloadriesgo = {
              idTipoDocumento: this.fbes['typeDoc'].value,
              numeroDocumento: this.fbes['nDoc'].value,
              primerApellido: response.apePat,
              nombres: `${response.names} ${response.apePat} ${response.apeMat}`,
            };
            this.spinner.hide();
            this.getIndicatorContratante(payloadriesgo);
          },
        });
      }
    }
  }

  changeClientType() {
    if (+this.fbes['typeClients'].value == 1) {
      this.fbes['typeClients']?.setValue(0);
      this.vidaDevolucionService.storage = {
        typeClients: this.fbes['typeClients'].value,
      };
      const indicadorasegurado =
        this.vidaDevolucionService.storage?.contractorService.indicador;
      this.validacionExperian = false;
      this.validarindicadores =
        indicadorasegurado.worldCheck.isOtherList ||
        indicadorasegurado.idecon.isOtherList;

      this.clientAseguradoBol = false;
    } else {
      const indicadorasegurado =
        this.vidaDevolucionService.storage?.contractorService.indicador;

      this.activeonchengenDoc = true;
      this.clientAseguradoBol = true;
      this.fbes['typeClients']?.setValue(1);
      this.vidaDevolucionService.storage = {
        typeClients: this.fbes['typeClients'].value,
      };
      this.validacionExperian = false;
      if (!this.indicatorcontratante$?.experian?.experianRisk) {
        this.validacionExperian =
          !this.indicatorcontratante$?.experian?.approve;
      }
      this.validarindicadores =
        indicadorasegurado.worldCheck.isOtherList ||
        indicadorasegurado.idecon.isOtherList;
    }
  }

  setIdBeneficiary() {
    this.fbe['id'].setValue(
      `${this.fbe['idTipoDocumento'].value}${this.fbe['numeroDocumento'].value}`
    );
  }

  editBeneficiary(data: any): void {
    this.editMode = true;
    this.formBeneficiary.patchValue(data, {
      emitEvent: false,
    });
    this.editBeneficiary$.push(data);
    const beneficiary = data;
    this.formBeneficiary.reset();
    this.formBeneficiary.enable();
    this.vc.createEmbeddedView(this._modalBeneficiary);
    this.fbe['estado'].setValue('U');
    this.fbe['idTipoDocumento'].setValue(2);
    this.fbe['numeroDocumento'].setValue(beneficiary.numeroDocumento);
    this.fbe['nombres'].setValue(beneficiary.nombres);
    this.fbe['apellidoMaterno'].setValue(beneficiary.apellidoMaterno);
    this.fbe['apellidoPaterno'].setValue(beneficiary.apellidoPaterno);
    this.fbe['idNacionalidad'].setValue(beneficiary.idNacionalidad);
    this.fbe['nacionalidad'].setValue(beneficiary.nacionalidad);
    this.fbe['idDepartamento'].setValue(beneficiary.idDepartamento);
    this.fbe['idProvincia'].setValue(beneficiary.idProvincia);
    this.fbe['idDistrito'].setValue(beneficiary.idDistrito);
    this.fbe['provincia'].setValue(beneficiary.provincia);
    this.fbe['departamento'].setValue(beneficiary.departamento);
    this.fbe['idDistrito'].setValue(beneficiary.idDistrito);
    this.fbe['idParentesco'].setValue(beneficiary.idParentesco);
    this.fbe['parentesco'].setValue(beneficiary.parentesco);
    this.fbe['idParentesco'].valueChanges.subscribe((val) => {
      const idparen = this.parameters$?.parentescos.findIndex(
        (x) => x.id == val
      );
      this.fbe['parentesco'].setValue(
        this.parameters$?.parentescos[idparen]?.descripcion
      );
    });
    this.fbe['distrito'].setValue(beneficiary.distrito);
    this.fbe['fechaNacimiento'].setValue(beneficiary.fechaNacimiento);
    this.fbe['idSexo'].setValue(beneficiary.idSexo);
    this.fbe['sexo'].setValue(beneficiary.sexo);
    this.fbe['porcentajeParticipacion'].setValue(
      beneficiary.porcentajeParticipacion
    );
    this.fbe['codigoCliente'].setValue(beneficiary.codigoCliente);
    this.fbe['idTipoPersona'].setValue(beneficiary.idTipoPersona);
    this.setIdBeneficiary();
    this.fbe['nombres'].disable();
    this.fbe['idSexo'].disable();
    this.fbe['apellidoMaterno'].disable();
    this.fbe['fechaNacimiento'].disable();
    this.fbe['apellidoPaterno'].disable();
    this.fbe['idTipoDocumento'].disable();
    this.fbe['numeroDocumento'].disable();
  }

  removeBeneficiary(data: any): void {
    if (this.showbeneficiariesSelectedQuotation$.length > 1) {
      const b = this.beneficiariesSelectedQuotation$;
      const remove = data;
      const benf = b.findIndex(
        (x) => x.numeroDocumento == remove?.numeroDocumento
      );
      const selectedBeneficiary = this.fben.at(benf) as FormGroup;
      selectedBeneficiary?.patchValue(remove);
      selectedBeneficiary.addControl('estado', new FormControl('D'));
      selectedBeneficiary.controls.estado.setValue('D');
      this.beneficiariesSelectedQuotation$ = [];
      this.beneficiariesSelectedQuotation$ = this.fben.value;
      sessionStorage.setItem(
        'beneficiaries',
        JSON.stringify(this.beneficiariesSelectedQuotation$)
      );
      this.deleteViewBeneficierie(benf);
    } else {
      this.message = 'Debes tener al menos 1 beneficiario';
      this.vc.createEmbeddedView(this._modalMessageBen);
    }
  }

  deleteViewBeneficierie(id: number) {
    /*   this.fben.removeAt(id); */
    this.showbeneficiariesSelectedQuotation$ = [];
    this.showbeneficiariesSelectedQuotation$ = this.beneficiarie.filter(
      (x) => x.estado != 'D'
    );
  }

  get sumPercentagesBeneficiaries(): number {
    const validBeneficiary = this.beneficiarie.filter((x) => x.estado != 'D');
    return validBeneficiary
      .map((x) => +x.porcentajeParticipacion)
      .reduce((a, b) => a + b, 0);
  }

  findBeneficiarire() {
  }

  sendBeneficiaries(): void {
    const contractor = this.storage.contractorService.asegurado;
    const formContractor = this.storage.formContractor;
    const beneRequest: any = {
      idProcess: +this.storage.summaryQuotationSelected.idProceso,
      telefono: contractor.telefono,
      correo: formContractor.email,
      direccion: formContractor.direccion,
      idDepartamento: formContractor.departamento,
      idProvincia: formContractor.provincia,
      idDistrito: formContractor.distrito,
      beneficiarios: this.beneficiarie.map(
        (value: any) =>
          ({
            idTipoPersona: 1,
            idTipoDocumento: value.idTipoDocumento,
            numeroDocumento: value.numeroDocumento,
            nombres: value.nombres,
            apellidoPaterno: value.apellidoPaterno,
            apellidoMaterno: value.apellidoMaterno,
            idNacionalidad: value.idNacionalidad,
            fechaNacimiento:
              (value.fechaNacimiento || '').toString()?.indexOf('/') == -1
                ? moment(value.fechaNacimiento).format('DD/MM/YYYY')
                : value.fechaNacimiento,
            idSexo: value.idSexo,
            relacion: {
              id: value.idParentesco,
              descripcion: value.parentesco,
            },
            porcentajeParticipacion: value.porcentajeParticipacion,
            estado: value.estado || null,
          } || [])
      ),
    };
    if (this.showbeneficiariesSelectedQuotation$.length != 0) {
      if (this.sumPercentagesBeneficiaries == 100) {
        this.summaryService.sendBeneficiaries(beneRequest).subscribe();
        this.vc.clear();
      } else {
        this.message = 'Los beneficiarios deben sumar 100%';
        this.vc.createEmbeddedView(this._modalMessageBen);
      }
    } else {
      this.summaryService.sendBeneficiaries(beneRequest).subscribe();
      this.vc.clear();
    }
  }

  get beneficiaryExist(): boolean {
    if (this.editMode) {
      return false;
    }

    const document = this.fbe['id'].value;
    const beneficiaries = this.fben.getRawValue();

    return beneficiaries?.map((x) => x.id)?.includes(document);
  }

  getDocumentInfo(): void {
    if (this.beneficiaryExist) {
      return;
    }

    if (
      this.fbe['idTipoDocumento'].valid &&
      this.fbe['numeroDocumento'].valid
    ) {
      this.isBeneficiary = true;
      /**/
      this.requestClientInfo();
    }
  }

  getInformacionBeneficiario(token) {
    if (this.fbe['numeroDocumento'].invalid) {
      return;
    }
    const payload: IDocumentInfoRequest = {
      idRamo: 71,
      idTipoDocumento: +this.fbe['idTipoDocumento'].value,
      numeroDocumento: this.fbe['numeroDocumento'].value,
      idUser: this.currentUser.id,
      token: token,
    };
    this.spinner.show();
    this.utilsService.documentInfoResponse(payload).subscribe(
      (response: DocumentInformationModel) => {
        this.fbe['estado'].setValue('U');
        this.fbe['idTipoDocumento'].setValue(2);
        this.fbe['numeroDocumento'].setValue(response.documentNumber);
        this.fbe['nombres'].setValue(response.names);
        this.fbe['apellidoMaterno'].setValue(response.apeMat);
        this.fbe['apellidoPaterno'].setValue(response.apePat);
        this.fbe['idNacionalidad'].setValue(response.nationality);
        this.fbe['idDepartamento'].setValue(response.department);
        this.fbe['idProvincia'].setValue(response.province);
        this.fbe['idDistrito'].setValue(response.district);
        this.fbe['fechaNacimiento'].setValue(response.birthdate);
        this.fbe['idSexo'].setValue(response.sex);
        this.setIdBeneficiary();

        this.spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.fbe['nacionalidad'].enable();
        this.spinner.hide();
      }
    );
  }

  get clientIsBeneficiary(): boolean {
    const document = this.fbe['id'].value;

    const contractor =
      this.vidaDevolucionService.storage.contractorService.asegurado;
    const documentContractor = `${contractor.idTipoDocumento}${contractor.numeroDocumento}`;

    return document == documentContractor;
  }

  get beneficiarie(): any {
    return JSON.parse(sessionStorage.getItem('beneficiaries') || '{}');
  }

  closeModals() {
    this.vc.remove();
  }

  submitBeneficiary(): void {
    if (this.editMode) {
      const b = this.beneficiariesSelectedQuotation$;
      const benf = b.findIndex(
        (x) => x.codigoCliente == this.fbe['codigoCliente'].value
      );
      const selectedBeneficiary = this.fben.at(benf) as FormGroup;
      const newVal = this.formBeneficiary.getRawValue();
      selectedBeneficiary?.patchValue(newVal);
      selectedBeneficiary.addControl('estado', new FormControl('U'));
      this.beneficiariesSelectedQuotation$ = [];
      this.beneficiariesSelectedQuotation$ = this.fben.value;
      sessionStorage.setItem(
        'beneficiaries',
        JSON.stringify(this.beneficiariesSelectedQuotation$)
      );
      this.showbeneficiariesSelectedQuotation$ =
        this.beneficiariesSelectedQuotation$.filter((x) => x.estado != 'D');
      this.vc.remove();
      /* this.vc.detach(); */
      /*  this.sendBeneficiaries(); */
    } else {
      /* this.addBeneficiary(); */
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formAsegurado.controls;
  }

  get fc(): { [key: string]: AbstractControl } {
    return this.formContratante.controls;
  }

  get ff(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get contractorData(): any {
    return this.vidaDevolucionService.storage?.contractor || {};
  }

  get currentUser(): any {
    return this.vidaDevolucionService.currentUser;
  }

  get dpsData(): any {
    return this.vidaDevolucionService.storage?.dps;
  }

  set dpsData(values: any) {
    this.vidaDevolucionService.storage = {
      dps: values,
    };
  }

  get dpsString(): string {
    const dps = this.vidaDevolucionService.storage?.dps;
    const dpsTransform = {
      talla: dps?.talla,
      peso: dps?.peso,
      fuma: this.convertValueStringToNumberDps(dps?.fuma),
      fuma_resp: dps?.cantidadCigarros,
      presion: this.convertValueStringToNumberDps(dps?.presionArterial),
      presion_resp: this.converDpsPressionResult(dps?.presionArterialResult),
      cancer: this.convertValueStringToNumberDps(dps?.cancer),
      infarto: this.convertValueStringToNumberDps(dps?.infarto),
      gastro: this.convertValueStringToNumberDps(dps?.gastro),
      viaja: this.convertValueStringToNumberDps(dps?.viaja),
      deporte: this.convertValueStringToNumberDps(dps?.deporte)
    };
    return JSON.stringify(dpsTransform);
  }

  converDpsPressionResult(value: string): number {
    switch (value?.toLowerCase()) {
      case 'bajo':
        return 1;
      case 'normal':
        return 2;
      case 'alto':
        return 3;
      case 'ignoro':
        return 0;
    }
  }

  convertDpsPresionResultToString(value): string {
    switch (+value) {
      case 1:
        return 'bajo';
      case 2:
        return 'normal';
      case 3:
        return 'alto';
      case 0:
        return 'ignoro';
    }
  }

  convertValueStringToNumberDps(value: string): string {
    return value == 'Si' ? '1' : '0';
  }

  ngOnInit(): void {
    if (
      !Object.keys(this.vidaDevolucionService.storage?.parameters || []).length
    ) {
      this.getParameters();
    } else {
      this.setParameters();
    }
    sessionStorage.setItem('beneficiaries', '');
    this.originventas = '';
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    this.route.queryParams
      .filter((params) => params.cliente)
      .subscribe((params) => {
        this.clientId = params.cliente;
        this.originventas = params.start;
        this.clientPolicy = params.policyClient;
        if (this.clientId) {
          // this.getSummary();
          this.getStates();
        }
        if (!!params?.isObserver) {
          this.isObserver = true;
          this.quoteParams = params?.cotizacion;
        } else {
          this.isObserver = false;
        }
        this.isSupport = !!params?.esSoporte;
      });
    this.getTypeUser();
    this.getParametersVdp();
    this.validationsForm();
  }

  getTypeUser() {
    const typeUser = this.currentUser.productoPerfil[0].idPerfil;
    if (+typeUser == 195) {
      this.userJefe = true;
      this.userSupervisor = false;
    } else if (+typeUser == 194) {
      this.userJefe = false;
      this.userSupervisor = true;
    }
  }

  getStates(summary = true): void {
    this.spinner.show();
    this.summaryService.getState(+this.clientId).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.success) {
          this.vidaDevolucionService.storage = {
            estado: response.listaEstado,
          };
          if (this.clientPolicy == 1) {
            this.stateType = {
              id: 2,
              description: 'ASIGNADO',
            };
          } else {
            this.stateType = {
              id: response.listaEstado.idEstado,
              description: response.listaEstado.estado,
            };
          }
        }
        if (summary) {
          this.getSummary();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  getParametersVdp(): void {
    this.vidaDevolucionService.getParameters().subscribe({
      next: (response: any) => {
        this.listAssesors = response.asesores || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  private validationsForm(): void {
    this.f['ingresos'].valueChanges.subscribe((value: string) => {
      if (value && !RegularExpressions.decimal.test(value)) {
        this.f['ingresos'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.f['phoneNumber'].valueChanges.subscribe((value: string) => {
      if (
        value &&
        (this.f['phoneNumber'].hasError('pattern') || +value?.slice(0, 1) !== 9)
      ) {
        this.f['phoneNumber'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.f['namesake'].valueChanges.subscribe((value: any) => {
      this.vidaDevolucionService.storage = {
        contractor: {
          ...this.vidaDevolucionService.storage?.contractor,
          namesake: value,
        },
      };
    });
    this.f['direccion'].valueChanges.subscribe((value: any) => {
      this.vidaDevolucionService.storage = {
        contractor: {
          ...this.vidaDevolucionService.storage?.formContractor,
          direccion: value,
        },
      };
    });
    this.f['departamento'].valueChanges.subscribe((value: any) => {
      this.vidaDevolucionService.storage = {
        contractor: {
          ...this.vidaDevolucionService.storage?.formContractor,
          departamento: value,
        },
      };
    });
    this.fc['departamento']?.valueChanges.subscribe((value: any) => {
      this.fc['provincia'].setValue(null);
      this.fc['distrito'].setValue(null);
      this.provincescontratante$ = [];
      this.districtscontratante$ = [];
      this.setListUbigeosContratante();
      this.fc['provincia'].valueChanges.subscribe(() => {
        this.fc['distrito'].setValue(null);
        this.districtscontratante$ = [];
        this.setListUbigeosContratante();
      });
    });
    this.f['distrito'].valueChanges.subscribe((value: any) => {
      this.vidaDevolucionService.storage = {
        contractor: {
          ...this.vidaDevolucionService.storage?.formContractor,
          distrito: value,
        },
      };
    });
    this.f['ocupacion'].valueChanges.subscribe((value: any) => {
      this.vidaDevolucionService.storage = {
        contractor: {
          ...this.vidaDevolucionService.storage?.formContractor,
          ocupacion: value,
        },
      };
    });
    this.f['provincia'].valueChanges.subscribe((value: any) => {
      this.vidaDevolucionService.storage = {
        contractor: {
          ...this.vidaDevolucionService.storage?.formContractor,
          provincia: value,
        },
      };
    });
    this.formContratante.valueChanges.subscribe((values: any) => {
      this.vidaDevolucionService.storage = {
        formContractorContratante: {
          ...values,
          isValidForm: this.formContratante.valid,
        },
        numeroDocumentoContratante: this.contractorContratante$.numeroDocumento,
      };
    });

    this.formAsegurado.valueChanges.subscribe((values: any) => {
      this.vidaDevolucionService.storage = {
        formContractor: {
          ...values,
          isValidForm: this.formAsegurado.valid,
        },
      };
    });
  }

  private getSummary(final: boolean = false, getStates = false): void {
    this.spinner.show();
    this.summaryQuotation = null;
    this.summaryService.getSummary(+this.clientId).subscribe({
      next: (response: any) => {
        this.spinner.hide();

        if (response.indicador?.experian?.experianRisk) {
          if (response.indicador?.experian?.approve) {
          } else {
            if (response.asegurado.aseguradoContratante != 1) {
              const data: NotificationRequest = new NotificationRequest({
                idProcess: null,
                cantidadAnios: null,
                capital: null,
                email: response.asegurado.correo,
                telefono: response.asegurado.telefono,
                fechaNacimiento: response.asegurado.fechaNacimiento,
                fechaSolicitud: moment(new Date().toDateString()).format(
                  'DD/MM/YYYY'
                ),
                monedaDescripcion: null,
                monedaSimbolo: null,
                nroDocumento: response.asegurado.numeroDocumento,
                primaAnual: null,
                porcentajeDevolucion: null,
                primaFallecimiento: null,
                primaInicial: null,
                primaMensual: null,
                primaRetorno: null,
                tipoNotificacion: 'ErrorRiesgoCrediticioVdp',
                asegurado: `${response.asegurado.nombres} ${
                  response.asegurado.apellidoPaterno || ''
                } ${response.asegurado.apellidoMaterno || ''}`,
                TotalPolizas: null,
                SumaAsegurada: null,
                CumuloMaximo: null,
                isPepWC: response.indicador?.worldCheck.isPep,
                experianRisk: response.indicador?.experian.experianRisk,
                isOtherListWC: response.indicador?.worldCheck.isOtherList,
                isIdNumberWC: response.indicador?.worldCheck.isIdNumber,
                approve: response.indicador?.experian.approve,
                TotalDeuda: response.indicador?.experian.deudaTotal,
                ...response.indicador?.idecon,
              });
              this._mainService.sendNotification(data).subscribe();
            }
            if (response.asegurado.aseguradoContratante != 1) {
              this.validacionExperian = true;
              this.message =
                'Lo sentimos, no podemos continuar con la compra, el contratante es riesgoso';
              this.vc.createEmbeddedView(this._modalMessageExperian);
            }
            if (response.asegurado.aseguradoContratante == 1) {
              this.contractorContratante$ = this.parseInformacion(
                response.contratante
              );
              this.vidaDevolucionService.storage.formContractorContratante =
                this.contractorContratante$.formContractorContratante;
              this.vidaDevolucionService.storage.numeroDocumentoContratante =
                this.contractorContratante$.numeroDocumento;
            }
          }
        }
        if (
          response?.indicador?.worldCheck.isOtherList ||
          response?.indicador?.idecon.isOtherList
        ) {
          this.validarindicadores = true;

          if (response.indicador?.experian?.experianRisk) {
            if (response.indicador?.experian?.approve) {
              this.validarindicadores = false;
            } else {
              this.validarindicadores = true;
            }
          }
        }
        if (
          response?.indicador?.worldCheck.isOtherList ||
          response?.indicador?.idecon.isOtherList
        ) {
          const data: NotificationRequest = new NotificationRequest({
            idProcess: 0,
            cantidadAnios: null,
            capital: null,
            email: response.asegurado.correo,
            telefono: response.asegurado.telefono,
            fechaNacimiento: response.asegurado.fechaNacimiento,
            fechaSolicitud: moment(new Date().toDateString()).format(
              'DD/MM/YYYY'
            ),
            monedaDescripcion: null,
            monedaSimbolo: null,
            nroDocumento: response.asegurado.numeroDocumento,
            primaAnual: null,
            porcentajeDevolucion: null,
            primaFallecimiento: null,
            primaInicial: null,
            primaMensual: null,
            primaRetorno: null,
            tipoNotificacion: 'PEPVidaIndividual',
            asegurado: `${response.asegurado.nombres} ${
              response.asegurado.apellidoPaterno || ''
            } ${response.asegurado.apellidoMaterno || ''}`,
            TotalPolizas: null,
            SumaAsegurada: null,
            CumuloMaximo: null,
            isPepWC: response.indicador?.worldCheck.isPep,
            experianRisk: response.indicador?.experian.experianRisk,
            isOtherListWC: response.indicador?.worldCheck.isOtherList,
            isIdNumberWC: response.indicador?.worldCheck.isIdNumber,
            approve: response.indicador?.experian.approve,
            TotalDeuda: response.indicador?.experian.deudaTotal,
            ...response.indicador?.idecon,
          });
          this._mainService.sendNotification(data).subscribe();
        }
        if (this.vidaDevolucionService.storage.quotationSelected || final) {
          this.finalQuotationSuccess = true;
          this.fbes['typeClients'].disable();
          this.summaryQuotation =
            this.vidaDevolucionService.storage?.summaryQuotationSelected ||
            null;
        }
        if (response.success && Object.keys(response.asegurado || []).length) {
          this.vidaDevolucionService.storage = {
            contractorService: response,
            comments: response.comentarios,
          };
          // response.asesor = {idAsesor: 9269};
          sessionStorage.setItem(
            'idAsesor',
            JSON.stringify(response.asesor.idAsesor)
          );
          this.idValidate = response.asesor.idAsesor;
          this.asesorasignado = response.asesor.asesor;
          this.listComments = response.comentarios;
          this.listadoPolizas = response.listaPolizas;
          this.getQuotations();
          this.setDataContractorService(response);
          if (getStates) {
            this.getStates();
          }
          // tslint:disable-next-line:no-shadowed-variable
          const asesor = this.listAssesors.filter(
            (asesor) => asesor.id == response.asesor?.idAsesor
          );
          if (asesor.length == 1) {
            this.formAsignar
              .get('asignar_asesor')
              .setValue(response?.asesor?.idAsesor);
          }
          this.vidaDevolucionService.storage.numeroDocumentoContratante =
            this.contractorContratante$.numeroDocumento;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        if (this.vidaDevolucionService.storage.quotationSelected) {
          this.finalQuotationSuccess = false;
          this.fbes['typeClients'].enable();
        }
      },
    });
  }

  private getQuotations(final = false): void {
    this.spinner.show();
    this.summaryService.getQuotations(+this.clientId).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.setQuotationsDataService(response);
        if (final) {
          if (this.vidaDevolucionService.storage.quotationSelected || final) {
            this.finalQuotationSuccess = true;
            this.fbes['typeClients'].disable();
            this.summaryQuotation =
              this.vidaDevolucionService.storage?.summaryQuotationSelected ||
              null;
          }
        }
        if (this.isObserver) {
          const findCotizacionVigente = this.listadoCotizacionesVigentes?.find(
            (x) => +x.idProceso == +this.quoteParams
          );

          const findCotizacionNoVigente =
            this.listadoCotizacionesNoVigentes?.find(
              (x) => +x.idProceso == +this.quoteParams
            );
          const quote = {
            ...(findCotizacionVigente || findCotizacionNoVigente),
            checked: false,
            selected: true,
          };

          this.selectCotizacion(quote, true);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  private setDataContractorService(response): void {
    this.summary$ = response;
    if (
      Object.keys(this.vidaDevolucionService.storage?.riskClientInfo || [])
        .length
    ) {
      this.indicator$ = this.vidaDevolucionService.storage.riskClientInfo;
    } else {
      this.indicator$ = response.indicador;
    }
    this.vidaDevolucionService.storage = this.indicator$;
    this.vidaDevolucionService.storage = {
      scoring: response.scoring,
    };
    this.montoCambio$ = +response.tipoCambio.valor;
    this.vidaDevolucionService.storage = {
      montoCambio: this.montoCambio$,
    };
    this.contractor$ = response.asegurado;
    this.fbes['typeClients']?.setValue(response.asegurado.aseguradoContratante);
    this.vidaDevolucionService.storage = {
      typeClients: this.fbes['typeClients'].value,
    };
    if (+this.fbes['typeClients'].value == 1) {
      let departamento = this.departmentscontratante$.filter(
        (departamento) =>
          departamento.id == response.contratante?.idDepartamento
      );
      const validadorDepartamento = departamento.length > 0;
      this.provincescontratante$ = validadorDepartamento
        ? departamento[0].provincias
        : [];

      let provincia = this.provincescontratante$.filter(
        (provincia) =>
          provincia.idProvincia == +response.contratante?.idProvincia
      );
      const validadorprovincia = provincia.length > 0;
      this.districtscontratante$ = validadorprovincia
        ? provincia[0].distritos
        : [];

      let distritos = this.districtscontratante$.filter(
        (distrito) => distrito.idDistrito == +response.contratante?.idDistrito
      );
      const validadorDistrito = distritos.length > 0;

      this.clientAseguradoBol = true;
      this.contractorContratante$ = this.parseInformacion(response.contratante);
      this.vidaDevolucionService.storage.formContractorContratante = {
        nacionalidad: response.contratante?.idNacionalidad || null,
        ocupacion:
          (response.contratante?.idOcupacion == '0'
            ? null
            : response.contratante?.idOcupacion) || null,
        estadoCivil: response.contratante?.idEstadoCivil || null,
        phoneNumber: response.contratante?.telefono || null,
        email: response.contratante?.correo || null,
        obligacionFiscal: response.contratante?.obligacionFiscal || 0,
        direccion: response.contratante?.direccion || null,
        departamento: validadorDepartamento
          ? response.contratante?.idDepartamento
          : null,
        provincia:
          validadorDepartamento && validadorprovincia
            ? response.contratante?.idProvincia
            : null,
        distrito:
          validadorDepartamento && validadorprovincia && validadorDistrito
            ? response.contratante?.idDistrito
            : null,
        obligacionFiscalcontratante:
          +response.contratante?.obligacionFiscal || 0,
      };
      this.vidaDevolucionService.storage.numeroDocumentoContratante =
        this.contractorContratante$.numeroDocumento;

      this.spinner.show();

      if (this.subcribeContractor) {
        this.subcribeContractor.unsubscribe();
      }

      this.fbes['nDoc'].setValue(response.contratante.numeroDocumento);

      this.subcribeContractor = this.subcribeContracto();
      this.activeonchengenDoc = false;
      this.fbes['parentescocontratante'].setValue(
        response.contratante.idParentesco == '0'
          ? null
          : response.contratante.idParentesco
      );

      this.formContratante.patchValue(
        {
          nacionalidad: response.contratante?.idNacionalidad || null,
          ocupacion:
            (response.contratante?.idOcupacion == '0'
              ? null
              : response.contratante?.idOcupacion) || null,
          estadoCivil: response.contratante?.idEstadoCivil || null,
          phoneNumber: response.contratante?.telefono || null,
          email: response.contratante?.correo || null,
          obligacionFiscal: response.contratante?.obligacionFiscal || 0,
          direccion: response.contratante?.direccion || null,
          departamento: validadorDepartamento
            ? response.contratante?.idDepartamento
            : null,
          provincia:
            validadorDepartamento && validadorprovincia
              ? response.contratante?.idProvincia
              : null,
          distrito:
            validadorDepartamento && validadorprovincia && validadorDistrito
              ? response.contratante?.idDistrito
              : null,
          obligacionFiscalcontratante:
            +response.contratante?.obligacionFiscal || 0,
        },
        {
          emitEvent: false,
        }
      );
      this.formContratante.markAsUntouched();
      this.setListUbigeosContratante();
      this.indicatorcontratante$ = response.indicadorContratante;
      if (this.indicatorcontratante$?.experian?.experianRisk) {
        if (!this.indicatorcontratante$?.experian?.approve) {
          this.validacionExperian = true;
          // this.message =
          //   'Lo sentimos, no podemos continuar con la compra, el contratante es riesgoso';
          // this.vc.createEmbeddedView(this._modalMessageExperian);
        }
      }
    } else {
      this.clientAseguradoBol = false;
    }
    if (
      !Object.keys(this.vidaDevolucionService.storage?.parameters || []).length
    ) {
      this.getParameters();
    } else {
      this.setParameters();
    }
    if (!this.indicator$) {
      const payload = {
        idTipoDocumento: this.contractor$.idTipoDocumento,
        numeroDocumento: this.contractor$.numeroDocumento,
        primerApellido: this.contractor$.apellidoPaterno,
        nombres: this.contractor$.nombres,
      };
      this.getIndicator(payload);
    }
    this.getTariff();

    console.log(this.indicatorcontratante$);
  }

  private getIndicator(payload): void {
    this.spinner.show();
    this.summaryService.getNewClientIndicator(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.vidaDevolucionService.storage = response.data;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  private getIndicatorContratante(payload): void {
    this.spinner.show();
    this.summaryService.getNewClientIndicator(payload).subscribe({
      next: (response: any) => {
        this.validacionExperian = false;

        this.indicatorcontratante$ = response.data;
        if (
          this.vidaDevolucionService.storage?.contractorService.indicador
            ?.worldCheck.isOtherList ||
          this.vidaDevolucionService.storage?.contractorService.indicador
            ?.idecon.isOtherList
        ) {
        } else {
          if (
            this.indicatorcontratante$?.worldCheck?.isOtherList ||
            this.indicatorcontratante$?.idecon?.isOtherList
          ) {
            this.validarindicadores = true;

            if (this.indicatorcontratante$?.experian?.experianRisk) {
              if (this.indicatorcontratante$?.experian?.approve) {
                this.validarindicadores = false;
              } else {
                this.validarindicadores = true;
              }
            }
          } else {
            this.validarindicadores = false;
          }
        }

        if (this.indicatorcontratante$?.experian?.experianRisk) {
          if (!this.indicatorcontratante$?.experian?.approve) {
            const data: NotificationRequest = new NotificationRequest({
              idProcess: null,
              cantidadAnios: null,
              capital: null,
              email: this.contractorContratante$.email,
              telefono: this.contractorContratante$.phoneNumber,
              fechaNacimiento: this.contractorContratante$.birthdate,
              fechaSolicitud: moment(new Date().toDateString()).format(
                'DD/MM/YYYY'
              ),
              monedaDescripcion: null,
              monedaSimbolo: null,
              nroDocumento: this.contractorContratante$.documentNumber,
              primaAnual: null,
              porcentajeDevolucion: null,
              primaFallecimiento: null,
              primaInicial: null,
              primaMensual: null,
              primaRetorno: null,
              tipoNotificacion: 'ErrorRiesgoCrediticioVdp',
              asegurado: `${this.contractorContratante$.names} ${
                this.contractorContratante$.apePat || ''
              } ${this.contractorContratante$.apeMat || ''}`,
              TotalPolizas: null,
              SumaAsegurada: null,
              CumuloMaximo: null,
              isPepWC: response.data?.worldCheck.isPep,
              experianRisk: response.data?.experian.experianRisk,
              isOtherListWC: response.data?.worldCheck.isOtherList,
              isIdNumberWC: response.data?.worldCheck.isIdNumber,
              approve: response.data?.experian.approve,
              TotalDeuda: response.data?.experian.deudaTotal,
              ...response.data?.idecon,
            });
            this._mainService.sendNotification(data).subscribe();
            // this.sendNotificacionType('ErrorRiesgoCrediticioVdp', null, this.indicatorcontratante$);
            this.validacionExperian = true;
            this.message =
              'Lo sentimos, no podemos continuar con la compra, el contratante es riesgoso';
            this.vc.createEmbeddedView(this._modalMessageExperian);
          }
        }
        if (
          response.data?.idecon?.isOtherList ||
          response.data?.worldCheck?.isOtherList
        ) {
          const data = {
            idProcess: 0,
            tipoNotificacion: 'PEPVidaIndividual',
            email: this.contractorContratante$.email,
            telefono: this.contractorContratante$.phoneNumber,
            asegurado: `${this.contractorContratante$.names} ${
              this.contractorContratante$.apePat || ''
            } ${this.contractorContratante$.apeMat || ''}`,
            nroDocumento: this.contractorContratante$.documentNumber,
            fechaNacimiento: this.contractorContratante$.birthdate,
            primaInicial: null,
            primaMensual: null,
            primaAnual: null,
            fechaSolicitud: moment(new Date().toDateString()).format(
              'DD/MM/YYYY'
            ),
            monedaDescripcion: null,
            monedaSimbolo: null,
            cantidadAnios: null,
            porcentajeDevolucion: null,
            capital: null,
            primaRetorno: null,
            primaFallecimiento: null,
            isIdNumber: response.data?.worldCheck.isIdNumber,
            isPep: response.data?.idecon.isPep,
            isFamPep: response.data?.idecon.isFamPep,
            isIdNumberFamPep: response.data?.idecon.isIdNumberFamPep,
            isOtherList: response.data?.idecon.isOtherList,
            TotalPolizas: 0,
            SumaAsegurada: 0,
            CumuloMaximo: 0,
            experianRisk: response.data?.experian.experianRisk,
            isOtherListWC: response.data?.worldCheck.isOtherList,
            isIdNumberWC: response.data?.worldCheck.isIdNumber,
            isPepWC: response.data?.worldCheck.isPep,
            correoAsesor: localStorage.currentUser.email,
            nombreAsesor: `${localStorage.currentUser.firstName} ${
              localStorage.currentUser.lastName || ''
            } ${localStorage.currentUser.lastName2 || ''}`,
          };
          this._mainService.sendNotification(data).subscribe();
        }
        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  validarMoneda(data): number {
    return data.moneda == 'SOLES'
      ? data.sumaAsegurada
      : data.sumaAsegurada * this.nTc;
  }

  private setQuotationsDataService(response): void {
    this.listadoCotizacionesNoVigentes = response.noVigentes || [];
    this.listadoCotizacionesVigentes =
      response.vigentes?.map((values: any) => ({
        ...values,
        checked: false,
        selected: false,
      })) || [];
    // VER SI YA TIENE UN ASESOR ASIGNADO
    if (!!this.asesor) {
      this.nextstep = true;
    } else {
      this.nextstep = false;
    }
  }

  private getTariff(): void {
    const payload = {
      idTipoDocumento: +this.contractor$?.idTipoDocumento,
      numeroDocumento: this.contractor$?.numeroDocumento,
      fechaNacimiento: this.contractor$?.fechaNacimiento,
    };
    this.isTariffLoaded = false;
    this.spinner.show();

    this.newClientService.tarifario(payload).subscribe({
      next: (response: ITarifarioResponse) => {
        this.spinner.hide();

        if (response.cumulus.sExceedsCumulus == 'S') {
          const url = `VidaIndividual/notificacion`;
          const Nombres = JSON.parse(localStorage.currentUser);
          const payloadnotificacion = {
            idProcess: response.idProcess,
            tipoNotificacion: 'ErrorTarifarioVdp',
            email: this.contractor$.correo,
            telefono: this.contractor$.telefono,
            asegurado: `${this.contractor$.nombres} ${
              this.contractor$.apellidoPaterno || ''
            } ${this.contractor$.apellidoMaterno || ''}`,
            nroDocumento: this.contractor$.numeroDocumento,
            fechaNacimiento: this.contractor$.fechaNacimiento,
            primaInicial: null,
            primaMensual: null,
            primaAnual: null,
            fechaSolicitud: moment(new Date().toDateString()).format(
              'DD/MM/YYYY'
            ),
            monedaDescripcion: null,
            monedaSimbolo: null,
            cantidadAnios: null,
            porcentajeDevolucion: null,
            capital: null,
            primaRetorno: null,
            primaFallecimiento: null,
            isIdNumber: false,
            isPep: false,
            isFamPep: false,
            isIdNumberFamPep: false,
            isOtherList: false,
            experianRisk: false,
            excedeDeuda: false,
            isOtherListWC: false,
            isIdNumberWC: false,
            isPepWC: false,
            TotalPolizas: response.cumulus.nCountPolicy,
            SumaAsegurada:
              response.cumulus.nCumulusMax - response.cumulus.nCumulusAvailble,
            CumuloMaximo: response.cumulus.nCumulusMax,
            correoAsesor: Nombres.email,
            nombreAsesor: `${Nombres.firstName} ${Nombres.lastName || ''} ${
              Nombres.lastName2 || ''
            }`,
          };

          this._mainService.sendNotification(payloadnotificacion).subscribe();

          this.sumasuperada2 = response.cumulus.nCumulusAvailble;
          this.numpolizascontratadas = response.cumulus.nCountPolicy;
          this.totalsumapolizas =
            response.cumulus.nCumulusMax - response.cumulus.nCumulusAvailble;
          this.nTc = response.cumulus.nTc;
        }
        if (response.success) {
          this.vidaDevolucionService.storage = {
            cumulus: response.cumulus,
            tariff: {
              plans: response.rateAges,
              skips: {
                saltarExperian: response.saltarExperian,
                saltarIdecon: response.saltarIdecon,
                saltarWorldCheck: response.saltarWorldCheck,
              },
            },
            processId: response.idProcess,
          };
          this.isTariffLoaded = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  getParameters(): void {
    this.utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.vidaDevolucionService.storage = {
          parameters: res,
        };
        this.setParameters();
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  setParameters(): void {
    const parameters = this.vidaDevolucionService.storage?.parameters;

    this.parameters$ = parameters;
    this.parameters$.estadoCivil =
      this.parameters$?.estadoCivil?.map((values: any) => ({
        ...values,
        descripcion: values.descripcion?.toUpperCase(),
      })) || [];
    this.parameters$.ocupaciones =
      this.parameters$?.ocupaciones?.map((values: any) => ({
        ...values,
        descripcion: values.descripcion?.toUpperCase(),
      })) || [];
    this.departments$ = parameters?.ubigeos;
    this.departmentscontratante$ = parameters?.ubigeos;
    this.setUbigeos();
    if (this.vidaDevolucionService.storage?.formContractor?.isValidForm) {
      this.formAsegurado.patchValue(
        this.vidaDevolucionService.storage?.formContractor || {}
      );
    } else {
      const scoring = this.vidaDevolucionService.storage?.scoring;
      this.formAsegurado.patchValue(
        {
          nacionalidad: this.contractor$?.idNacionalidad || null,
          ocupacion: this.contractor$?.idOcupacion || null,
          estadoCivil: this.contractor$?.idEstadoCivil || null,
          phoneNumber: this.contractor$?.telefono || null,
          email: this.contractor$?.correo || null,
          actividad: scoring?.actividadEconomica || null,
          ingresos: scoring?.ingresosMensuales || null,
          condicion: scoring?.sujetoObligado || null,
          obligacionFiscal: +this.contractor$?.obligacionFiscal || 0,
          direccion: this.contractor$?.direccion || null,
          /* departamento: this.contractor$?.idDepartamento || null,
                                        provincia: this.contractor$?.idProvincia || null,
                                        distrito: this.contractor$?.idDistrito || null, */
        },
        {
          emitEvent: false,
        }
      );

      if (
        this.departments$
          .map((a: any) => +a.id)
          .includes(+this.contractor$?.idDepartamento)
      ) {
        this.f['departamento'].setValue(this.contractor$?.idDepartamento, {
          emitEvent: false,
        });
      }
      this.setListUbigeos();

      if (
        this.provinces$
          .map((a: any) => +a.idProvincia)
          .includes(+this.contractor$?.idProvincia)
      ) {
        this.f['provincia'].setValue(this.contractor$?.idProvincia, {
          emitEvent: false,
        });
      }
      this.setListUbigeos();

      if (
        this.districts$
          .map((a: any) => +a.idDistrito)
          .includes(+this.contractor$?.idDistrito)
      ) {
        this.f['distrito'].setValue(this.contractor$?.idDistrito, {
          emitEvent: false,
        });
      }

      this.vidaDevolucionService.storage = {
        formContractor: {
          ...this.formAsegurado.getRawValue(),
          isValidForm: this.formAsegurado.valid,
        },
      };

      this.vidaDevolucionService.storage = {
        formContractorContratante: {
          ...this.formContratante.getRawValue(),
          isValidForm: this.formContratante.valid,
        },
        contractorServiceContratante: this.contractorContratante$,
        numeroDocumentoContratante: this.contractorContratante$.numeroDocumento,
      };

      /* if (!this.currentUser.comercial) {
                          if (!this.userSupervisor && !this.userJefe) {
                            this.formContratante.disable({
                              emitEvent: false,
                            });
                          }
                        } */
    }

    this.formAsegurado.markAsUntouched();

    this.setListUbigeos();
  }

  changeDepartment(e: string): void {
    this.provinces$ = this.departments$?.find((x) => +x.id == +e)?.provincias;
  }

  changeProvince(e: string): void {
    this.districts$ = this.provinces$?.find(
      (x) => +x.idProvincia == +e
    )?.distritos;
  }

  setUbigeos(): void {
    this.f['departamento'].valueChanges.subscribe(() => {
      this.f['provincia'].setValue(null);
      this.f['distrito'].setValue(null);
      this.provinces$ = [];
      this.districts$ = [];
      this.setListUbigeos();
    });
    this.f['provincia'].valueChanges.subscribe(() => {
      this.f['distrito'].setValue(null);
      this.districts$ = [];
      this.setListUbigeos();
    });
  }

  setListUbigeos(): void {
    this.provinces$ =
      this.departments$?.find(
        (x: any) => +x.id === +this.f['departamento'].value
      )?.provincias || [];

    this.districts$ =
      this.provinces$?.find(
        (x: any) => +x.idProvincia === +this.f['provincia'].value
      )?.distritos || [];
  }

  setUbigeosContratante(): void {
    this.fc['departamento'].valueChanges.subscribe(() => {
      this.fc['provincia'].setValue(null);
      this.fc['distrito'].setValue(null);
      this.provincescontratante$ = [];
      this.districtscontratante$ = [];
      this.setListUbigeosContratante();
    });
    this.fc['provincia'].valueChanges.subscribe(() => {
      this.fc['distrito'].setValue(null);
      this.districtscontratante$ = [];
      this.setListUbigeosContratante();
    });
  }

  setListUbigeosContratante(): void {
    this.departmentscontratante$ =
      this.vidaDevolucionService.storage?.parameters?.ubigeos;
    this.provincescontratante$ =
      this.departmentscontratante$?.find(
        (x: any) => +x.id === +this.fc['departamento'].value
      )?.provincias || [];

    this.districtscontratante$ =
      this.provincescontratante$?.find(
        (x: any) => +x.idProvincia === +this.fc['provincia'].value
      )?.distritos || [];
  }

  currencyformat(number: any) {
    return new Intl.NumberFormat('es-MX').format(number);
  }

  selectCotizacion(data: any, final: boolean = false) {
    if (
      this.summary$.asesor.idAsesor == '3822' &&
      this.formAsignar.get('asignar_asesor').value == null
    ) {
      this.message =
        'Es Necesario Asignar Un Ejecutivo Comercial para continuar la compra';
      this.vc.createEmbeddedView(this._modalMessage);
      this.chekedsumamaxima = false;
      return;
    }
    data.selected = true;
    // this.vidaDevolucionService.storage = { dps: {} };}
    this.vidaDevolucionService.storage = {
      contractorServiceContratante: this.contractorContratante$,
      numeroDocumentoContratante: +this.fbes['nDoc'].value,
      parentescocontratante: +this.fbes['parentescocontratante'].value,
    };

    this.cotizacionSeleccionada = data;
    if (final) {
      this.cotizacionSeleccionada.selected = true;
    }
    this.idProcesoCotizacion = data.idProceso;
    this.beneficiariesSelectedQuotation$ = [];
    if (this.ammountParseDolar >= 1500) {
      this.f['ingresos'].setValidators(
        Validators.compose([
          Validators.pattern(RegularExpressions.decimal),
          Validators.required,
          Validators.min(1),
        ])
      );
      this.f['actividad'].setValidators(Validators.required);
      this.f['condicion'].setValidators(Validators.required);
    } else {
      this.f['ingresos'].clearValidators();
      this.f['actividad'].clearValidators();
      this.f['condicion'].clearValidators();
    }
    this.f['ingresos'].updateValueAndValidity();
    this.f['actividad'].updateValueAndValidity();
    this.f['condicion'].updateValueAndValidity();
    this.formAsegurado.markAllAsTouched();
    this.verResumen(data, false, final);
  }

  verResumen(data: any, showModal = true, final: boolean = false) {
    this.idProcesoCotizacion = +data.idProceso;
    // this.idProcesoCotizacion = 4284483;
    this.fbes['typeClients'].disable();
    this.spinner.show();
    this.summaryService
      .getQuotationSummary(this.idProcesoCotizacion)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();

          if (showModal == false) {
            if (
              response.cumulus?.sExceedsCumulus == 'S' ||
              this.validarMoneda(data) > response.cumulus?.nCumulusAvailble
            ) {
              this.vc.createEmbeddedView(this._modalSumaMaxima);
              this.sumasuperada = response.cumulus.nCumulusAvailble;
              this.chekedsumamaxima = false;
              this.numpolizascontratadas = response.cumulus.nCountPolicy;
              this.responseSumaSuperada = response.cumulus.nCumulusAvailble;
              this.totalsumapolizas =
                response.cumulus.nCumulusMax -
                response.cumulus.nCumulusAvailble;
              this.cotizacionSeleccionada.selected = false;
              this.nTc = response.cumulus.nTc;
            }
          }
          if (response.success) {
            const summary = {
              ...response.resumen,
              idTarifario: data.idTarifario,
              idProceso: data.idProceso,
            };
            this.vidaDevolucionService.storage = {
              summaryQuotationSelected: summary,
            };
            this.summaryQuotation = summary;
            this.beneficiariesSelectedQuotation$ = [];
            this.beneficiariesSelectedQuotation$ = response.beneficiarios || [];
            this.showbeneficiariesSelectedQuotation$ =
              this.beneficiariesSelectedQuotation$;
            if (this.beneficiariesSelectedQuotation$.length > 0) {
              for (
                let i = 0;
                i < this.beneficiariesSelectedQuotation$[0].nombres.length;
                i++
              ) {
                if (this.beneficiariesSelectedQuotation$[0].nombres[i] == ' ') {
                  this.finprimernombre = i;
                }
              }
            }

            if (showModal) {
              this.vc.createEmbeddedView(this._modalResumen);
              this.beneficiariesSelectedQuotation$ = [];
              sessionStorage.setItem('beneficiaries', null);
              this.beneficiariesSelectedQuotation$ =
                response.beneficiarios || [];
              this.fben.clear();

              this.beneficiariesSelectedQuotation$?.forEach((value: any) => {
                this.fben.push(this.builder.group(value));
              });
              sessionStorage.setItem(
                'beneficiaries',
                JSON.stringify(this.beneficiariesSelectedQuotation$)
              );
            }
            if (final) {
              if (this.validarspan == true) {
                this.vc.createEmbeddedView(this._modalSumaMaxima);
                this.sumasuperada = response.cumulus.nCumulusAvailble;
                this.chekedsumamaxima = false;
                this.numpolizascontratadas = response.cumulus.nCountPolicy;
                this.responseSumaSuperada = response.cumulus.nCumulusAvailble;
                this.totalsumapolizas =
                  response.cumulus.nCumulusMax -
                  response.cumulus.nCumulusAvailble;
                this.cotizacionSeleccionada.selected = false;
                this.nTc = response.cumulus.nTc;
              } else {
                this.activeonchengenDoc = false;
                //setTimeout(() => {
                if (this.fbes['nDoc'].enable) {
                  this.fbes['nDoc'].disable();
                }
                this.fbes['parentescocontratante'].disable();
                this.fbes['typeClients'].disable();
                //}, 5000);
                this.vidaDevolucionService.storage = {
                  quotationSelected: +this.idProcesoCotizacion,
                  typeClients: this.fbes['typeClients'].value,
                };
                this.finalQuotationSuccess = true;
                this.fbes['typeClients'].disable();
              }
            } else {
              this.vidaDevolucionService.storage = {
                quotationSelected: null,
              };

              this.finalQuotationSuccess = false;
              this.fbes['typeClients'].enable();
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();
        },
      });
  }

  selectAll(checked: boolean) {
    if (checked) {
      this.listadoCotizacionesVigentes.forEach((value: any) => {
        value.checked = true;
        if (
          !this.listQuotationsSelected.some(
            (x: any) => +x.idProceso == +value.idProceso
          )
        ) {
          this.listQuotationsSelected.push(value);
        }
      });
    } else {
      this.listadoCotizacionesVigentes.forEach((value: any) => {
        value.checked = false;
      });
      this.listQuotationsSelected = [];
    }
  }

  marcarCotizacion(data: any): void {
    if (
      !this.listQuotationsSelected.some(
        (x: any) => +x.idProceso == +data.idProceso
      )
    ) {
      this.listQuotationsSelected.push(data);
    } else {
      this.listQuotationsSelected = this.listQuotationsSelected.filter(
        (x) => +x.idProceso !== +data.idProceso
      );
    }
  }

  get everyCheckedListQuotations(): boolean {
    if (!this.listadoCotizacionesVigentes?.length) {
      return false;
    }
    return this.listadoCotizacionesVigentes.every((x) => x.checked);
  }

  closeResume() {
    if (this.beneficiariesSelectedQuotation$.length != 0) {
      this.sendBeneficiaries();
      /* this.vc.clear(); */
    } else {
      this.vc.clear();
    }

    /*     this.vc.clear(); */
  }

  resetAll() {
    this.vc.clear();
  }

  Disable() {
    this.vc.clear();
  }

  viewCondition() {
    this.vc.createEmbeddedView(this._modalCondition);
  }

  viewObligaciones() {
    this.vc.createEmbeddedView(this._modalObligaciones);
  }

  get ammountParseDolar(): number {
    const primaAnual = +this.cotizacionSeleccionada?.primaAnual || 0;
    const currency = +this.cotizacionSeleccionada?.idMoneda;

    return currency == 1 ? primaAnual / (this.montoCambio$ || 1) : primaAnual;
  }

  get idASesor(): any {
    return JSON.parse(sessionStorage.getItem('idAsesor'));
  }

  saveFinalQuotation() {
    const isQuotationInvalid =
      this.ammountParseDolar >= 1500 ||
      this.indicator$?.worldCheck?.isOtherList ||
      this.indicator$?.idecon?.isOtherList;
    // || (this.indicator$.experian?.experianRisk && this.indicator$.experian?.approve == false);

    const payload = {
      anualPremiumInvalid: this.ammountParseDolar >= 1500,
      worldCheckIsOtherList: this.indicator$?.worldCheck?.isOtherList,
      ideconIsOtherList: this.indicator$?.idecon?.isOtherList,
      scoring: this.indicator$.experian?.experianRisk,
      isInvalid: isQuotationInvalid,
      time: new Date().getTime(),
    };
    if (isQuotationInvalid) {
      this.validateQuotation(payload);
      return;
    }
    this.dpsValidations = {};
    if (!this.dpsData?.isValid) {
      this.dpsValidations = this.dpsData?.dpsValidations || {};
      this.vc.createEmbeddedView(this.modalDpsRisk);
      return;
    }
    const contractor = this.contractor$;

    const actualYear = new Date().getFullYear();
    const contractorYearBirthdate = moment(
      contractor.fechaNacimiento,
      'DD/MM/YYYY'
    )
      .toDate()
      .getFullYear();

    const pep =
      this.indicator$?.idecon?.isPep ||
      this.indicator$?.worldCheck?.isPep ||
      this.indicator$?.worldCheck?.isFamPep;

    // Datos del Contratante
    const datoscontratantedefinitiva: any = {
      idProcess: +this.idProcesoCotizacion,
      idClient: this.clientId,
      numeroDocumento: this.contractor$.numeroDocumento,
      aseguradoContratante: this.fbes['typeClients'].value == 1 ? false : true,
      definitiva: true,
      contratante:
        this.fbes['typeClients'].value == 1
          ? {
            idTipoPersona: 1,
            idTipoDocumento: 2,
            numeroDocumento: this.fbes['nDoc'].value,
            nombres: this.contractorContratante$.names,
            apellidoPaterno: this.contractorContratante$.apePat,
            apellidoMaterno: this.contractorContratante$.apeMat,
            fechaNacimiento: this.contractorContratante$.birthdate,
            idSexo: this.contractorContratante$?.sex,
            homonimo: 0,
            parentesco: this.fbes['parentescocontratante'].value,
            telefono: this.fc['phoneNumber'].value || null,
            correo: this.fc['email'].value || null,
            direccion: this.fc['direccion'].value || null,
            idEstadoCivil: this.fc['estadoCivil'].value || null,
            idDepartamento: this.fc['departamento'].value || null,
            idProvincia: this.fc['provincia'].value || null,
            idDistrito: this.fc['distrito'].value || null,
            obligacionFiscal: this.fc['obligacionFiscalcontratante'].value,
            idOcupacion: this.fc['ocupacion'].value || null,
          }
          : null,
    };
    this.quotationService
      .saveDatesContratante(datoscontratantedefinitiva)
      .subscribe({
        next: (response: any) => {
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();
        },
      });
    // IFinalQuotation
    const contractorRequest: any = {
      idProcess: +this.idProcesoCotizacion,
      idUsuario: +this.idASesor,
      nUserUpdate: this.currentUser['id'],
      dps: this.dpsString,
      url: `${AppConfig.DOMAIN_URL}/vidadevolucion/step1?processId=${this.idProcesoCotizacion}`,
      estado: this.ammountParseDolar >= 1500 ? 2 : 3,
      contratante: {
        telefono: this.f['phoneNumber'].value,
        correo: this.f['email'].value,
        direccion: this.f['direccion'].value,
        fechaNacimiento: contractor.fechaNacimiento,
        idEstadoCivil: this.f['estadoCivil'].value,
        idDepartamento: this.f['departamento'].value,
        idProvincia: this.f['provincia'].value,
        idDistrito: this.f['distrito'].value,
        idActividad: this.f['actividad'].value == 'D' ? '1' : '2',
        idOcupacion: this.f['ocupacion'].value || '0',
        obligacionFiscal: this.f['obligacionFiscal'].value,
      },
      scoring: {
        calcular: pep && this.ammountParseDolar >= 1500,
        actividadEconomica: this.f['actividad'].value || 'D',
        sujetoObligado: this.f['condicion'].value || 'N',
        regimenDiligencia: pep && this.ammountParseDolar >= 1500 ? 'G' : 'R',
        edad: (actualYear - contractorYearBirthdate)?.toString() || '0',
        ingresoMensual: this.f['ingresos'].value || 1025,
        periodoVigencia: this.summaryQuotation.cantidadAnios,
        primaAnual: this.summaryQuotation.primaAnual,
        moneda: +this.summaryQuotation.idMoneda == 1 ? 'S' : 'D',
        canal: 'C',
        tipoProducto: 'M',
        nacionalidad: +contractor.idTipoDocumento == 2 ? 'P' : 'E',
        residencia: this.f['departamento'].value,
      },
    };
    this.spinner.show();
    this.formClient.controls['typeClients'].disable();
    this.quotationService.saveFinalQuotation(contractorRequest).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.success) {
          this.vidaDevolucionService.storage = {
            quotationSelected: +this.idProcesoCotizacion,
            typeClients: this.fbes['typeClients'].value,
          };
          /* this.getQuotations(true); */
          if (this.vidaDevolucionService.storage.quotationSelected) {
            this.summaryQuotation =
              this.vidaDevolucionService.storage?.summaryQuotationSelected ||
              null;
            this.getSummary(true, true);
          }
          return;
        }
        this.finalQuotationSuccess = false;
        this.fbes['typeClients'].enable();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.finalQuotationSuccess = false;
        this.fbes['typeClients'].enable();
      },
    });
    if (this.subcribeContractor) {
      this.subcribeContractor.unsubscribe();
    }
    this.fbes['nDoc'].disable();
    this.subcribeContractor = this.subcribeContracto();
    this.fbes['parentescocontratante'].disable();
    this.fbes['typeClients'].disable();
  }

  asignarAsesor() {
    this.vc.createEmbeddedView(this._modalAsignar);
  }

  closeModalExperian(): void {
    this.vc.clear();
  }

  closeModal(): void {
    this.vc.clear();
    this.formAsignar.get('asignar_asesor').setValue(null);
    if (this.backToPage) {
      this.redirectAsign();
    } else {
      this.backToTray();
    }
    this.backToPage = false;
  }

  closeModalBen(): void {
    this.vc.remove();
  }

  closeAllModals(): void {
    this.vc.clear();
  }

  changeAsesor(e): void {
    this.assesorSelected = e;
  }

  get contractorInfo(): any {
    return this.vidaDevolucionService.storage?.contractor;
  }

  get experian(): any {
    return this.vidaDevolucionService.storage?.experian;
  }

  get worldcheck(): any {
    return this.vidaDevolucionService.storage?.worldCheck;
  }

  get idecon(): any {
    return this.vidaDevolucionService.storage?.idecon;
  }

  convertToYesOrno(val) {
    if (val == null) {
      return '-';
    }
    return +val ? 'Si' : 'No';
  }

  documentTypeDescription(value: number): string {
    switch (+value) {
      case 1:
        return 'RUC';
      case 2:
        return 'DNI';
      case 4:
        return 'C.E';
    }
  }

  quotationChange(event: any) {
    if (event.success) {
      this.getQuotations();
    }
  }

  backToSummary(): void {
    this.finalQuotationSuccess = false;
    this.fbes['typeClients'].enable();
    this.cotizacionSeleccionada = null;
    this.listQuotationsSelected = [];
    this.listadoCotizacionesVigentes.forEach((value: any) => {
      value.checked = false;
      value.selected = false;
    });
    this.vidaDevolucionService.storage = {
      quotationSelected: null,
    };
    this.getQuotations();

    //setTimeout(() => {
    if (this.subcribeContractor) {
      this.subcribeContractor.unsubscribe();
    }
    this.fbes['nDoc'].enable();
    this.subcribeContractor = this.subcribeContracto();
    this.fbes['parentescocontratante'].enable();
    this.fbes['typeClients'].enable();
    //}, 1500);
  }

  backToNewClient(): void {
    this.finalQuotationSuccess = false;
    this.fbes['typeClients'].enable();
    this.cotizacionSeleccionada = null;
    this.vidaDevolucionService.storage = {
      quotationSelected: null,
    };
    if (this.vidaDevolucionService.storage.urlPath) {
      this.router.navigate(['/extranet/vidadevolucion/prospectos']);
    } else {
      this.router.navigate(['/extranet/vidadevolucion/prospectos']);
    }
  }

  getDpsSummary(): void {
    this.spinner.show();
    this.summaryService
      .getDpsSummary(+this.summaryQuotation.idProceso)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          if (response.success) {
            this.dpsSummary = JSON.parse(response.dps || {});
            this.vc.createEmbeddedView(this._modalDJ);
          }
        },
        error: (error: any) => {
          console.error(error);
          this.spinner.hide();
        },
      });
  }

  reload(e: boolean) {
    if (e) {
      this.finalQuotationSuccess = false;
      this.fbes['typeClients'].enable();
      this.getSummary(true);
    }
  }

  get storage(): any {
    return this.vidaDevolucionService.storage;
  }

  sendSlip(): void {
    const formContractor = this.storage.formContractor;
    const names = `${this.contractor$.nombres} ${this.contractor$.apellidoPaterno} ${this.contractor$.apellidoMaterno}`;
    const namescontra = `${this.contractorContratante$.names} ${this.contractorContratante$.apePat} ${this.contractorContratante$.apeMat}`;

    const datoscontratante: any = {
      idProcess: null,
      idClient: this.clientId,
      numeroDocumento: this.contractor$.numeroDocumento,
      aseguradoContratante: this.fbes['typeClients'].value == 1 ? false : true,
      definitiva: false,
      contratante:
        this.fbes['typeClients'].value == 1
          ? {
            idTipoPersona: 1,
            idTipoDocumento: 2,
            numeroDocumento: this.fbes['nDoc'].value,
            nombres: this.contractorContratante$.names,
            apellidoPaterno: this.contractorContratante$.apePat,
            apellidoMaterno: this.contractorContratante$.apeMat,
            fechaNacimiento: this.contractorContratante$.birthdate,
            idSexo: this.contractorContratante$?.sex,
            homonimo: 0,
            parentesco: this.fbes['parentescocontratante'].value,
            telefono: this.fc['phoneNumber'].value || null,
            correo: this.fc['email'].value || null,
            direccion: this.fc['direccion'].value || null,
            idEstadoCivil: this.fc['estadoCivil'].value || null,
            idDepartamento: this.fc['departamento'].value || null,
            idProvincia: this.fc['provincia'].value || null,
            idDistrito: this.fc['distrito'].value || null,
            obligacionFiscal: this.fc['obligacionFiscalcontratante'].value,
            idOcupacion: this.fc['ocupacion'].value || null,
          }
          : null,
    };
    const req: any = {
      contratante: this.fbes['typeClients'].value == 1 ? namescontra : null,
      nroDocumento:
        this.fbes['typeClients'].value == 1 ? this.fbes['nDoc'].value : null,
      correo:
        this.fbes['typeClients'].value == 1
          ? this.fc['email'].value
          : this.f['email'].value || formContractor.correo,
      fechaNacimiento:
        this.fbes['typeClients'].value == 1
          ? this.contractorContratante$.birthdate
          : null,
      cotizaciones:
        this.listQuotationsSelected.map((value) => ({
          cantidadAnios: +value.cantidadAnios,
          capital: value.sumaAsegurada,
          fechaInicio: value.fechaInicioVigencia,
          fechaSolicitud: value.fechaInicioVigencia,
          idProcess: +value.idProceso,
          idTarifario: +value.idTarifario,
          fechaFin: value.fechaFinVigencia,
          fechaVencimiento: value.fechaFinVigencia,
          monedaDescripcion: value.moneda,
          monedaSimbolo: value.monedaSimbolo,
          porcentajeDevolucion: +value.porcentajeRetorno,
          primaAnual: (+value.primaAnual).toFixed(2),
          primaMensual: (+value.primaMensual).toFixed(2),
          primaRetorno: (+value.primaPorcentajeRetorno).toFixed(2),
          primaFallecimiento: (+value.sumaAsegurada).toFixed(2),
          primaInicial: (+value.primaInicial).toFixed(2),
          descPrima: +value.descPrima,
          descPrimeraCuota: +value.descPrimeraCuota,
          idFrecuencia: +value.idFrecuenciaPago,
          frecuencia: value.frecuenciaPago,
        })) || [],
      asegurado: {
        Nombre: names,
        NroDocumento: this.contractor$.numeroDocumento,
        telefono: formContractor.phoneNumber || this.f['phoneNumber'].value,
        correo: this.f['email'].value || formContractor.correo,
        direccion: this.f['direccion'].value || formContractor.direccion,
        idEstadoCivil:
          this.f['estadoCivil'].value || formContractor.estadoCivil,
        idDepartamento:
          this.f['departamento'].value || formContractor.departamento,
        idProvincia: this.f['provincia'].value || formContractor.provincia,
        idDistrito: this.f['distrito'].value || formContractor.distrito,
        idOcupacion: this.f['ocupacion'].value || formContractor.ocupacion,
        obligacionFiscal: formContractor.obligacionFiscal,
        FechaNacimiento: this.contractor$.fechaNacimiento,
      },
    };
    this.spinner.show();

    this.quotationService.sendMassiveQuotation(req).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.success) {
          if (this.listQuotationsSelected.length == 1) {
            if (this.fbes['typeClients'].value == 1) {
              if (this.f['email'].value == this.fc['email'].value) {
                this.message = `Se envió correctamente la cotización al correo ${this.f['email'].value}`;
              } else {
                this.message = `Se envió la cotización a los correos ${this.f['email'].value} y ${this.fc['email'].value}`;
              }
            } else {
              this.message = `Se envió correctamente la cotización al correo ${this.f['email'].value}`;
            }
          } else {
            if (this.fbes['typeClients'].value == 1) {
              if (this.f['email'].value == this.fc['email'].value) {
                this.message = `Se envió correctamente las cotizaciónes al correo ${this.f['email'].value}`;
              } else {
                this.message = `Se envió las cotizaciónes a los correos ${this.f['email'].value} y ${this.fc['email'].value}`;
              }
            } else {
              this.message = `Se enviaron correctamente las cotizaciones al correo ${this.f['email'].value}`;
            }
          }
        } else {
          this.message = `Ocurrió un error al intentar enviar la cotización al correo ${this.f['email'].value}`;
        }
        this.vc.createEmbeddedView(this._modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.message = `Ocurrió un error al intentar enviar la cotización al correo ${this.f['email'].value}`;
        this.vc.createEmbeddedView(this._modalMessage);
      },
    });
    this.quotationService.saveDatesContratante(datoscontratante).subscribe({
      next: (response: any) => {
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  sendComment(): void {
    const payload = {
      idCliente: this.clientId,
      idUsuario: this.currentUser['id'],
      comentario: this.formComment.get('comment').value || '',
    };
    this.spinner.show();
    this.summaryService.sendComment(payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.formComment.reset();
        this.getSummary();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.formComment.reset();
      },
    });
  }

  assignAssesor(): void {
    const payload = {
      idCliente: this.clientId,
      idUsuario: this.assesorSelected.id,
      nUserUpdate: this.currentUser['id'],
      asignado: this.stateType.description == 'Asignado' ? true : false,
    };
    this.spinner.show();
    this.summaryService.assignAssesor(payload).subscribe({
      next: (response: any) => {
        this.vc.clear();
        this.spinner.hide();
        if (response.success) {
          this.backToPage = true;
          this.message = 'Se asignó correctamente';
        } else {
          this.message = 'Ocurrió un error al asignar';
        }
        this.vc.createEmbeddedView(this._modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.message = 'Ocurrió un error al asignar';
        this.vc.clear();
        this.vc.createEmbeddedView(this._modalMessage);
      },
    });
    this.summaryService.getSummary(+this.clientId).subscribe({
      next: (response: any) => {
        this.asesorasignado = response.asesor.asesor;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  openModalCancelProspect(): void {
    const contractor =
      this.vidaDevolucionService.storage?.contractorService?.contratante;
    this.message =
      `${contractor.nombres} ${contractor.apellidoPaterno} ${contractor.apellidoMaterno}`
        .toLowerCase()
        .trim();
    this.vc.createEmbeddedView(this.modalCancelProspect);
  }

  cancelProspect(): void {
    const payload = {
      idCliente: +this.clientId,
      idUsuario: +this.currentUser['id'],
    };
    this.spinner.show();
    this.summaryService.cancelProspect(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.vc.clear();
        if (response.success) {
          this.backToPage = true;
          this.message = `Se rechazó correctamente el prospecto`;
        } else {
          this.message = 'Ocurrió u problema al intentar rechazar el prospecto';
        }
        this.vc.createEmbeddedView(this._modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.vc.clear();
        this.message = 'Ocurrió u problema al intentar rechazar el prospecto';
        this.vc.createEmbeddedView(this._modalMessage);
      },
    });
  }

  statusChange(e: any): void {
    this.getStates(false);
  }

  openReasign() {
    if (this.nextstep) {
      this.vc.createEmbeddedView(this._modalReasign);
    } else {
      this.assignAssesor();
    }
  }

  reasignQuote() {
    this.router.navigate(['broker/vidadevolucion/prospectos'], {});
  }

  newOrReasign(a: boolean) {
    this.nextstep = a;
  }

  backToTray(): void {
    if (
      !this.vidaDevolucionService.storage?.urlPath &&
      this.currentUser.soporte
    ) {
      this.router.navigate(['/extranet/vidadevolucion/prospectos']);
      // sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
      return;
    }

    if (
      this.vidaDevolucionService.storage?.urlPath &&
      this.currentUser.soporte
    ) {
      this.router.navigate(['/extranet/vidadevolucion/prospectos']);
      // sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
      return;
    } else if (this.currentUser.comercial) {
      this.router.navigate(['/extranet/vidadevolucion/prospectos']);
      // sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    }
    this.router.navigate(['/extranet/vidadevolucion/prospectos']);
    // sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
  }

  redirectAsign() {
    this.router.navigate(['/extranet/vidadevolucion/prospectos']);
    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
  }

  validateQuotation(event: any) {
    this.quotationValidations = event;
    if (this.quotationValidations.isInvalid) {
      if (event.anualPremiumInvalid) {
        this.message =
          'Lo sentimos, no podemos continuar con la compra, la prima anual de la cotización es igual o mayor a 1500 dólares';
        this.vc.createEmbeddedView(this._modalMessage);
        return;
      }
      if (event.worldCheckIsOtherList) {
        this.message =
          'Lo sentimos, el contratante se encuentra en otras listas de WorldCheck';
        this.vc.createEmbeddedView(this._modalMessage);
        return;
      }
      if (event.ideconIsOtherList) {
        this.message =
          'Lo sentimos, el contratante se encuentra en otras listas de Idecon';
        this.vc.createEmbeddedView(this._modalMessage);
        return;
      }
      if (event.scoring) {
        this.message =
          'Lo sentimos, no podemos continuar con la compra, el contratante es riesgoso';
        this.vc.createEmbeddedView(this._modalMessageExperian);
        return;
      }
    }
  }

  requestClientInfo() {
    this.recaptcha.execute();
  }

  resolved(token: string) {
    if (token) {
      if (this.isBeneficiary) {
        this.getInformacionBeneficiario(token);
      } else {
        this.getDataOfDocument(token);
      }
      this.recaptcha.reset();
      return;
    }
  }

  parseInformacion(datos) {
    return {
      apeMat: datos?.apellidoMaterno,
      apePat: datos?.apellidoPaterno,
      birthdate: datos?.fechaNacimiento,
      names: datos?.nombres,
      sex: datos?.idSexo,
      parentescocontratante: datos?.idParentesco,
      numeroDocumento: datos?.numeroDocumento,
      documentNumber: datos?.numeroDocumento,
      numeroDocumentoContratante: datos?.numeroDocumento,
      formContractorContratante: {
        direccion: datos?.direccion,
        obligacionFiscalcontratante: datos?.obligacionFiscal,
        estadoCivil: datos?.idEstadoCivil,
        departamento: datos?.idDepartamento,
        provincia: datos?.idProvincia,
        distrito: datos?.idDistrito,
        email: datos?.correo,
        nationality: datos?.idNacionalidad,
        phoneNumber: datos?.telefono,
        ocupacion: datos?.idOcupacion,
      },
    };
  }
}
